import { Actor, HttpAgent } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { AuthClient } from "@icp-sdk/auth/client";
import { idlFactory } from "../../declarations/sovereign_desk_backend/sovereign_desk_backend.did.js";
import "./styles.css";

const BACKEND_CANISTER_ID = __BACKEND_CANISTER_ID__;
const DFX_NETWORK = __DFX_NETWORK__;
const MAINNET_HOST = "https://icp-api.io";
const FRONTEND_CANISTER_ID = "v7inb-hyaaa-aaaal-qw7aq-cai";
const TRUST = {
  controller: "7dnyu-motzm-oqehm-762iq-irfd3-taexs-huxbx-z5bdr-4hdjg-j4lih-5ae",
  backendModuleHash: "0xd32ca3c209b2ae9417f2de4f40f3528ed3712070228f23f02a2b7a8d80221fa8",
  frontendModuleHash: "0x04e565b3425fe7510ee16b02adcfe3f01abc9a2725c82a21cb08969241debd62",
  governance: "Protected keychain controller live; next step is multisig, SNS, or Launchtrail governance.",
  source: "git@github.com:robert19001-cmyk/sovereign-desk-icp.git",
};
const CREATOR = {
  name: "Robert",
  title: "Canister product builder",
  email: "robert19001@gmail.com",
  principal: "up6xy-uol7y-xisiv-3oron-gl7d3-usnrr-r5ong-hiqu2-hnd2h-cufv3-pqe",
};

const state = {
  authClient: null,
  actor: null,
  principal: "anonymous",
  isAuthenticated: false,
  roles: [],
  governanceAccess: false,
  operatorAccess: false,
  clientPortalAccess: false,
  accessMode: "public",
  workspaceView: null,
  portalView: null,
  activeClientId: "",
  activeProjectId: "",
  accessRequests: [],
  clientInvites: [],
  roleGrants: [],
  documentArchives: [],
  documentVersions: {},
  documentVerifications: {},
  encryptedDocumentObjects: {},
  governanceProposals: [],
  agentResponse: null,
  loading: false,
  error: "",
  notice: "",
};

const app = document.querySelector("#app");

function isLocal() {
  return DFX_NETWORK !== "ic" && (window.location.hostname.includes("localhost") || window.location.hostname === "127.0.0.1");
}

async function createBackendActor(identity) {
  const host = isLocal() ? window.location.origin : MAINNET_HOST;
  const agent = await HttpAgent.create({ host, identity });
  if (isLocal()) {
    await agent.fetchRootKey().catch(() => undefined);
  }
  return Actor.createActor(idlFactory, {
    agent,
    canisterId: Principal.fromText(BACKEND_CANISTER_ID),
  });
}

function e(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function variantName(value) {
  return Object.keys(value || {})[0] || "Unknown";
}

function shortPrincipal(value) {
  const text = value?.toText ? value.toText() : String(value || "");
  return text.length > 20 ? `${text.slice(0, 10)}...${text.slice(-7)}` : text;
}

function natText(value) {
  return typeof value === "bigint" ? value.toString() : String(value ?? "0");
}

function principalText(value) {
  return value?.toText ? value.toText() : String(value || "");
}

function idText(value) {
  return natText(value);
}

function sameId(left, right) {
  return idText(left) === idText(right);
}

function statusClass(status) {
  const name = variantName(status);
  if (name === "Pending" || name === "WaitingOnClient" || name === "Open") return "waiting";
  if (name === "Approved" || name === "Active" || name === "Done") return "live";
  return "quiet";
}

function statusPill(status) {
  const name = variantName(status);
  return `<span class="pill ${statusClass(status)}">${e(name)}</span>`;
}

function taskStatusVariant(name) {
  if (name === "Done") return { Done: null };
  if (name === "InProgress") return { InProgress: null };
  return { Open: null };
}

function auditTitle(event) {
  if (event.summary && event.summary !== "Public audit event redacted") return event.summary;
  const labels = {
    "workspace.seeded": "Workspace initialized",
    "project.created": "Project room created",
    "task.created": "Workflow task recorded",
    "approval.requested": "Approval gate opened",
    "approval.responded": "Approval decision captured",
    "document.added": "Document hash recorded",
    "note.created": "Client note appended",
    "agent.response.created": "AI operating brief generated",
    "access.requested": "Operator access requested",
    "access.approved": "Operator access granted",
    "access.rejected": "Operator access rejected",
  };
  return labels[event.action] || "Canister event recorded";
}

function auditTarget(event) {
  if (event.target && event.target !== "redacted") return event.target;
  return "public-safe audit record";
}

function metric(label, value, hint) {
  return `
    <article class="metric">
      <i aria-hidden="true"></i>
      <span>${e(label)}</span>
      <strong>${e(value)}</strong>
      <p>${e(hint)}</p>
    </article>
  `;
}

function currentClient(view) {
  const clients = view?.clients || [];
  return clients.find((client) => sameId(client.id, state.activeClientId)) || clients[0] || null;
}

function currentProject(view) {
  const client = currentClient(view);
  const projects = view?.projects || [];
  const scoped = client ? projects.filter((project) => sameId(project.clientId, client.id)) : projects;
  return scoped.find((project) => sameId(project.id, state.activeProjectId)) || scoped[0] || projects[0] || null;
}

function currentTasks(view) {
  const project = currentProject(view);
  const tasks = view?.tasks || [];
  return project ? tasks.filter((task) => sameId(task.projectId, project.id)) : tasks;
}

function currentApprovals(view) {
  const project = currentProject(view);
  const approvals = view?.approvals || [];
  return project ? approvals.filter((approval) => sameId(approval.projectId, project.id)) : approvals;
}

function currentDocuments(view) {
  const project = currentProject(view);
  const documents = view?.documents || [];
  return project ? documents.filter((doc) => sameId(doc.projectId, project.id)) : documents;
}

function documentVersions(documentId) {
  return state.documentVersions[idText(documentId)] || [];
}

function documentVerifications(documentId) {
  return state.documentVerifications[idText(documentId)] || [];
}

function encryptedDocumentObjects(documentId) {
  return state.encryptedDocumentObjects[idText(documentId)] || [];
}

function documentArchive(documentId) {
  return (state.documentArchives || []).find((record) => sameId(record.documentId, documentId)) || null;
}

function latestDocumentVersion(documentId) {
  const versions = documentVersions(documentId);
  return versions[versions.length - 1] || null;
}

function currentNotes(view) {
  const project = currentProject(view);
  const notes = view?.notes || [];
  return project ? notes.filter((note) => sameId(note.projectId, project.id)) : notes;
}

function currentApproval(view) {
  const approvals = currentApprovals(view);
  return approvals.find((item) => variantName(item.status) === "Pending") || approvals[0] || null;
}

function normalizeActiveContext(view) {
  const clients = view?.clients || [];
  const currentOrFirstClient = clients.find((client) => sameId(client.id, state.activeClientId)) || clients[0] || null;
  state.activeClientId = currentOrFirstClient ? idText(currentOrFirstClient.id) : "";

  const projects = view?.projects || [];
  const scopedProjects = currentOrFirstClient
    ? projects.filter((project) => sameId(project.clientId, currentOrFirstClient.id))
    : projects;
  const currentOrFirstProject =
    scopedProjects.find((project) => sameId(project.id, state.activeProjectId)) ||
    scopedProjects[0] ||
    projects[0] ||
    null;
  state.activeProjectId = currentOrFirstProject ? idText(currentOrFirstProject.id) : "";
}

function accessLabel() {
  if (state.governanceAccess) return "Governance access active";
  if (state.operatorAccess) return "Operator access active";
  if (state.clientPortalAccess) return "Client portal active";
  if (state.isAuthenticated) return "Signed read-only";
  return "Public read-only";
}

function roleName(role) {
  return variantName(role);
}

function hasRole(name) {
  return (state.roles || []).some((grant) => roleName(grant.role) === name);
}

function productOutcomes(view) {
  const project = currentProject(view);
  return [
    {
      label: "Client workroom",
      value: project?.name || "Sovereign workspace",
      body: "A scoped client room with tasks, approvals, document records, notes, and a public-safe proof surface.",
    },
    {
      label: "Approval control",
      value: "Human-gated",
      body: "Clients and operators write decisions through Internet Identity instead of a password database.",
    },
    {
      label: "Audit posture",
      value: "Inspectable",
      body: "Public reviewers can inspect canister IDs, module hashes, controller, and live workflow signals.",
    },
  ];
}

function canRespondApproval() {
  return state.operatorAccess || state.clientPortalAccess;
}

function portalToWorkspaceView(portal) {
  return {
    workspace: {
      id: 0n,
      name: "Client portal",
      profile: "A role-scoped portal view for the signed Internet Identity.",
      owner: Principal.fromText(CREATOR.principal),
      createdAt: 0n,
    },
    clients: [portal.client],
    projects: portal.projects,
    tasks: portal.tasks,
    approvals: portal.approvals,
    documents: portal.documents,
    notes: portal.notes,
    audit: [],
  };
}

function capabilityList(view) {
  const capabilities = view?.capabilities || [
    "ICP mainnet asset canister",
    "Motoko persistent backend",
    "Internet Identity gated writes",
    "Role-scoped client portal",
    "Approval and audit workflow",
    "AI Employee operational readout",
  ];
  return capabilities.map((item) => `<li>${e(item)}</li>`).join("");
}

function renderProofStrip(view, id = "overview") {
  const client = currentClient(view);
  const project = currentProject(view);
  const pendingApprovals = currentApprovals(view).filter((item) => variantName(item.status) === "Pending").length;
  const openTasks = currentTasks(view).filter((task) => variantName(task.status) !== "Done").length;

  return `
    <section id="${e(id)}" class="proof-strip" aria-label="Canister proof">
      ${metric("Network", "ICP", "Public mainnet deployment")}
      ${metric("Canister", shortPrincipal(BACKEND_CANISTER_ID), "Backend state source")}
      ${metric("Client", client?.name || "Ready", project?.name || "No project loaded")}
      ${metric("Workflow", `${openTasks}/${pendingApprovals}`, "Open tasks / pending approvals")}
    </section>
  `;
}

function renderExperienceTabs(view) {
  const taskCount = view?.tasks?.length || 0;
  const docCount = view?.documents?.length || 0;
  const auditCount = view?.audit?.length || 0;
  const tabs = [
    ["Reviewer", "Proof packet", "Verify live canisters, public redaction, module hashes, and the builder disclosure without signing in."],
    ["Operator", "Workspace cockpit", `Manage ${taskCount} tasks, approval gates, document metadata, notes, roles, and upgrade checks from one role-gated panel.`],
    ["Client", "Scoped portal", `Review ${docCount} document records, append notes, and respond to approval requests without seeing operator controls.`],
    ["Trust", "Release evidence", `${auditCount} audit events, schema version, snapshot export, and repeatable QA gates are exposed for review.`],
  ];
  return `
    <section class="experience-tabs reveal" aria-label="Product modules">
      <div class="tab-strip" role="list" aria-label="SovereignDesk product tabs">
        ${tabs.map(([label], index) => `<a href="#${index === 0 ? "review" : index === 1 ? "operate" : index === 2 ? "portal" : "trust"}" class="${index === 0 ? "active" : ""}" role="listitem">${e(label)}</a>`).join("")}
      </div>
      <div class="tab-panels">
        ${tabs.map(([label, title, body], index) => `
          <article class="${index === 0 ? "featured" : ""}">
            <span>${e(label)}</span>
            <strong>${e(title)}</strong>
            <p>${e(body)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderHero(view) {
  const client = currentClient(view);
  const project = currentProject(view);
  const taskTotal = currentTasks(view).length;
  const auditTotal = view?.audit?.length || 0;
  const approvalTotal = currentApprovals(view).length;
  const authenticatedCopy = state.operatorAccess
    ? `Operator access active as ${shortPrincipal(state.principal)}`
    : state.clientPortalAccess
      ? `Client portal active as ${shortPrincipal(state.principal)}. Approval responses write to the canister.`
      : state.isAuthenticated
      ? `Signed in as ${shortPrincipal(state.principal)}. This principal is not an operator yet, so writes stay locked.`
      : "Public read-only product preview. Login identifies your principal and unlocks operator tools after admin approval.";

  return `
    <section class="hero product-hero reveal" aria-labelledby="hero-title">
      <div class="hero-copy">
        <div class="brand-row">
          <span class="canister-mark" aria-hidden="true"></span>
          <span>ICP-native client operations</span>
        </div>
        <h1 id="hero-title">SovereignDesk</h1>
        <p class="hero-lede">A private client workroom for approvals, document records, notes, and audit history. Built on ICP canisters, with public proof outside and role-scoped workflow after Internet Identity.</p>
        ${state.isAuthenticated ? `
          <div class="hero-actions">
            <button type="button" data-action="refresh">Refresh state</button>
            <button type="button" data-action="logout" class="secondary">Logout</button>
          </div>
        ` : `
          <div class="login-gateway" aria-label="Secure application entry">
            <div>
              <span>Secure entry</span>
              <strong>Open the product panel</strong>
              <p>Internet Identity unlocks the app dashboard. Public visitors stay in reviewer mode with redacted data.</p>
            </div>
            <div class="gateway-actions">
              <button type="button" data-action="login">Login with Internet Identity</button>
              <a class="button secondary" href="https://dashboard.internetcomputer.org/canister/${e(BACKEND_CANISTER_ID)}" target="_blank" rel="noreferrer">Inspect canister</a>
            </div>
          </div>
        `}
        <p class="identity-line">${e(authenticatedCopy)}</p>
        <div class="quick-actions" aria-label="Public quick actions">
          <a href="#clients">Open workroom</a>
          <a href="#trust">Verify canisters</a>
          ${state.isAuthenticated ? '<a href="#access">Access status</a>' : '<button type="button" data-action="login">Request access</button>'}
        </div>
        <div class="hero-proof" aria-label="Live product counters">
          <div><strong>${e(taskTotal)}</strong><span>workflow tasks</span></div>
          <div><strong>${e(approvalTotal)}</strong><span>approval gates</span></div>
          <div><strong>${e(auditTotal)}</strong><span>audit events</span></div>
        </div>
      </div>
      <div class="product-window reveal-card" aria-label="SovereignDesk product preview">
        <div class="window-bar">
          <span></span><span></span><span></span>
          <strong>${e(client?.name || "Client room")}</strong>
          <em>Mainnet</em>
        </div>
        <div class="window-body">
          <section class="room-summary">
            <span>Active workroom</span>
            <strong>${e(project?.name || "Sovereign diligence room")}</strong>
            <p>${e(project?.summary || "A scoped room for client approvals, document records, and audit-backed execution.")}</p>
          </section>
          <section class="room-grid" aria-label="Room status">
            <article><span>Tasks</span><strong>${e(taskTotal)}</strong></article>
            <article><span>Approvals</span><strong>${e(approvalTotal)}</strong></article>
            <article><span>Audit</span><strong>${e(auditTotal)}</strong></article>
          </section>
          <section class="room-flow" aria-label="Product workflow">
            <div><span>01</span><strong>Invite client</strong><p>Bind Internet Identity to a scoped portal.</p></div>
            <div><span>02</span><strong>Request approval</strong><p>Decision writes pass through canister roles.</p></div>
            <div><span>03</span><strong>Publish proof</strong><p>Expose hashes and IDs without private client data.</p></div>
          </section>
        </div>
        <div class="proof-dock" aria-label="Canister proof">
          <div><span>Frontend</span><strong>${e(shortPrincipal(FRONTEND_CANISTER_ID))}</strong></div>
          <div><span>Backend</span><strong>${e(shortPrincipal(BACKEND_CANISTER_ID))}</strong></div>
          <div><span>Access</span><strong>${e(accessLabel())}</strong></div>
        </div>
      </div>
    </section>
  `;
}

function renderReviewerFlow(view) {
  const project = currentProject(view);
  const client = currentClient(view);
  const publicBrief = [
    ["01", "Verify deployment", "Open the canister dashboard, inspect IDs, and compare the live module hash."],
    ["02", "Read the public proof", "Review the redacted workflow without seeing private client data."],
    ["03", "Test identity gates", "Login with Internet Identity. Writes stay locked until the principal has a role."],
    ["04", "Contact the builder", "The creator signal is visible, but operational data remains protected."],
  ];
  return `
    <section id="review" class="reviewer-flow reveal" aria-label="ICP reviewer flow">
      <div class="reviewer-lead">
        <div class="section-heading">
          <span>Reviewer flow</span>
          <h2>Review the product in 90 seconds.</h2>
        </div>
        <p>
          This page is intentionally structured as a diligence packet: deployment proof first,
          product workflow second, creator signal last.
        </p>
      </div>
      <div class="reviewer-steps">
        ${publicBrief.map(([num, title, body]) => `
          <article>
            <small>${e(num)}</small>
            <strong>${e(title)}</strong>
            <p>${e(body)}</p>
          </article>
        `).join("")}
      </div>
      <aside class="reviewer-packet" aria-label="Live packet summary">
        <span>Live packet</span>
        <strong>${e(project?.name || "Sovereign diligence room")}</strong>
        <dl>
          <div><dt>Client surface</dt><dd>${e(client?.name || "Role-scoped room")}</dd></div>
          <div><dt>Backend</dt><dd>${e(shortPrincipal(BACKEND_CANISTER_ID))}</dd></div>
          <div><dt>Identity model</dt><dd>Internet Identity + roles</dd></div>
          <div><dt>Privacy posture</dt><dd>Redacted public proof</dd></div>
        </dl>
        <div class="packet-actions">
          <a class="button" href="#trust">Verify now</a>
          <a class="button secondary" href="#creator">Contact builder</a>
        </div>
      </aside>
    </section>
  `;
}

function renderReviewRail() {
  const items = [
    ["01", "Mainnet", "Frontend and backend are deployed as ICP canisters."],
    ["02", "Public proof", "Visitors inspect workflow posture without exposing private workspace data."],
    ["03", "Identity gates", "Writes are gated by role-aware principals, not a centralized auth server."],
    ["04", "Trust Center", "Canister IDs, module hashes, controller, and verification path are visible in-app."],
  ];
  return `
    <section class="review-rail reveal" aria-label="Reviewer highlights">
      ${items.map(([num, title, body]) => `
        <article>
          <small>${e(num)}</small>
          <span>${e(title)}</span>
          <p>${e(body)}</p>
        </article>
      `).join("")}
    </section>
  `;
}

function renderProductBrief(view) {
  return `
    <section class="product-brief reveal" aria-label="Product operating model">
      <div class="brief-copy">
        <div class="section-heading">
          <span>Product system</span>
          <h2>A working ICP product surface with live canister proof.</h2>
        </div>
        <p>
          SovereignDesk combines a public proof layer, private role-scoped workspace, and operator console.
          The public view is deliberately redacted; signed users get access based on canister state.
        </p>
      </div>
      <div class="brief-grid">
        ${productOutcomes(view).map((item) => `
          <article>
            <span>${e(item.label)}</span>
            <strong>${e(item.value)}</strong>
            <p>${e(item.body)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderWorkflow(view) {
  const client = currentClient(view);
  const project = currentProject(view);
  const tasks = currentTasks(view).map((task) => `
    <li>
      <div>
        <strong>${e(task.title)}</strong>
        <span>${e(task.assignee)} lane</span>
      </div>
      <div class="task-control">
        ${statusPill(task.status)}
        ${state.operatorAccess ? `
          <button type="button" class="tiny" data-action="task-status" data-task-id="${e(task.id)}" data-status="InProgress">Start</button>
          <button type="button" class="tiny" data-action="task-status" data-task-id="${e(task.id)}" data-status="Done">Done</button>
        ` : ""}
      </div>
    </li>
  `).join("");

  return `
    <section id="clients" class="section-grid reveal">
      <article class="surface project-surface elevated">
        <div class="section-heading">
          <span>Workspace</span>
          <h2>${e(project?.name || "Project room not initialized")}</h2>
        </div>
        <div class="client-block">
          <span class="node-dot" aria-hidden="true"></span>
          <div>
            <strong>${e(client?.name || "No client yet")}</strong>
            <p>${e(client?.contactName ? `Primary contact: ${client.contactName}` : "Create a client to open a portal.")}</p>
          </div>
        </div>
        <ul class="task-stack">${tasks || "<li><strong>No tasks yet</strong><span>Seed or create a task to begin.</span></li>"}</ul>
      </article>

      <article id="portal" class="surface portal-surface elevated">
        ${renderApprovalCard(view)}
      </article>
    </section>
  `;
}

function renderApprovalCard(view) {
  const approval = currentApproval(view);
  const locked = !canRespondApproval();
  return `
    <div class="section-heading">
      <span>Client portal</span>
      <h2>Approval gate</h2>
    </div>
    <div class="approval-card">
      ${approval ? statusPill(approval.status) : '<span class="pill quiet">Empty</span>'}
      <strong>${e(approval?.title || "No approval requested")}</strong>
      <p>${e(approval?.body || "Create an approval request to collect a client decision.")}</p>
      <div class="button-row">
        ${locked ? `
          <button type="button" data-action="${state.isAuthenticated ? "copy-principal" : "login"}">${state.isAuthenticated ? "Copy principal" : "Login to respond"}</button>
        ` : `
          <button type="button" data-action="approve" ${approval ? "" : "disabled"}>Approve</button>
          <button type="button" class="secondary" data-action="reject" ${approval ? "" : "disabled"}>Request changes</button>
        `}
      </div>
    </div>
  `;
}

function renderAgentAndAudit(view) {
  const audit = (view?.audit || []).slice(-7).reverse().map((event) => `
    <li>
      <span>${e(event.action)}</span>
      <strong>${e(auditTitle(event))}</strong>
      <small>${e(auditTarget(event))}</small>
    </li>
  `).join("");
  const publicBrief = [
    "1. Client portal is available as a public proof surface.",
    "2. Approval decisions require Internet Identity and role checks.",
    "3. Audit records prove workflow activity without exposing client data.",
  ].join("\n");

  return `
    <section class="section-grid reveal">
      <article id="agent" class="surface agent-surface elevated">
        <div class="section-heading">
          <span>Operating brief</span>
          <h2>Human-approved review summary</h2>
        </div>
        <p class="agent-copy">${e(state.agentResponse?.answer || publicBrief)}</p>
        ${state.operatorAccess ? `
          <form class="inline-form" data-action="ask-agent">
            <label>
              <span>Prompt</span>
              <input name="prompt" value="Summarize next steps" maxlength="1000" />
            </label>
            <button type="submit">Ask agent</button>
          </form>
        ` : `
          <div class="locked-note">${state.clientPortalAccess ? "Client portal users can respond to approvals, while AI workspace writes remain operator-only." : state.isAuthenticated ? "Your identity is signed in but has read-only access. Copy the principal from the access panel to enable operator writes." : "Login required for AI writes. Public visitors see the proof of workflow without spending cycles."}</div>
        `}
      </article>

      <article id="audit" class="surface audit-surface elevated">
        <div class="section-heading">
          <span>Audit trail</span>
          <h2>Signed work history</h2>
        </div>
        <ol class="timeline">${audit || "<li><span>No events</span><strong>Seed the workspace</strong><small>audit:empty</small></li>"}</ol>
      </article>
    </section>
  `;
}

function renderCapabilities(view) {
  return `
    <section id="architecture" class="architecture reveal">
      <div class="section-heading">
        <span>Architecture</span>
        <h2>Built to be inspected by ICP engineers.</h2>
      </div>
      <ul>${capabilityList(view)}</ul>
    </section>
  `;
}

function renderTrustCenter() {
  const statusCommand = `dfx canister status --network ic ${BACKEND_CANISTER_ID}`;
  const hardening = [
    ["Controller", "Move control rights to a hardware-backed or passphrase-protected ICP identity."],
    ["Encrypted rooms", "Ciphertext-only vault objects are live; vetKeys-backed key release is the next key-management upgrade."],
    ["AI service", "Split AI work logs into a dedicated ICP service with explicit human approval."],
  ];
  return `
    <section id="trust" class="trust-center reveal">
      <div class="section-heading">
        <span>Trust Center</span>
        <h2>Trust Center for ICP reviewers.</h2>
      </div>
      <div class="trust-grid">
        <article>
          <span>Frontend canister</span>
          <strong>${e(FRONTEND_CANISTER_ID)}</strong>
          <div class="trust-actions">
            <button type="button" class="tiny" data-action="copy-value" data-copy-value="${e(FRONTEND_CANISTER_ID)}">Copy</button>
            <a href="https://dashboard.internetcomputer.org/canister/${e(FRONTEND_CANISTER_ID)}" target="_blank" rel="noreferrer">Open dashboard</a>
          </div>
        </article>
        <article>
          <span>Backend canister</span>
          <strong>${e(BACKEND_CANISTER_ID)}</strong>
          <div class="trust-actions">
            <button type="button" class="tiny" data-action="copy-value" data-copy-value="${e(BACKEND_CANISTER_ID)}">Copy</button>
            <a href="https://dashboard.internetcomputer.org/canister/${e(BACKEND_CANISTER_ID)}" target="_blank" rel="noreferrer">Open dashboard</a>
          </div>
        </article>
        <article>
          <span>Controller</span>
          <strong>${e(shortPrincipal(TRUST.controller))}</strong>
          <p>${e(TRUST.governance)}</p>
        </article>
        <article>
          <span>Backend module hash</span>
          <code>${e(TRUST.backendModuleHash)}</code>
          <button type="button" class="tiny" data-action="copy-value" data-copy-value="${e(TRUST.backendModuleHash)}">Copy hash</button>
        </article>
        <article>
          <span>Asset canister module</span>
          <code>${e(TRUST.frontendModuleHash)}</code>
          <button type="button" class="tiny" data-action="copy-value" data-copy-value="${e(TRUST.frontendModuleHash)}">Copy hash</button>
        </article>
        <article>
          <span>Verify locally</span>
          <code>${e(statusCommand)}</code>
          <button type="button" class="tiny" data-action="copy-value" data-copy-value="${e(statusCommand)}">Copy command</button>
        </article>
        <article>
          <span>Source remote</span>
          <code>${e(TRUST.source)}</code>
        </article>
      </div>
      <p class="trust-note">
        Built on Internet Computer. This project is independent and is not affiliated with or endorsed by the DFINITY Foundation.
        Public canister responses are redacted; authenticated roles see scoped workspace or portal data.
      </p>
      <div class="hardening-path" aria-label="Known hardening path">
        <span>Known hardening path</span>
        <div>
          ${hardening.map(([title, body]) => `<article><strong>${e(title)}</strong><p>${e(body)}</p></article>`).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderCreatorSignal() {
  return `
    <section id="creator" class="creator-signal reveal">
      <div class="creator-copy">
        <div class="section-heading">
          <span>Maintainer</span>
          <h2>Maintainer and controller disclosure.</h2>
        </div>
        <p>
          SovereignDesk is maintained by ${e(CREATOR.name)} as a public, inspectable ICP mainnet product:
          Motoko state, certified asset delivery, Internet Identity writes, role-aware portals,
          and a security-conscious public proof surface.
        </p>
        <div class="creator-actions">
          <a class="button" href="mailto:${e(CREATOR.email)}">Contact ${e(CREATOR.name)}</a>
          <a class="button secondary" href="https://dashboard.internetcomputer.org/canister/${e(BACKEND_CANISTER_ID)}" target="_blank" rel="noreferrer">Review backend</a>
        </div>
      </div>
      <dl class="creator-card">
        <div><dt>Name</dt><dd>${e(CREATOR.name)}</dd></div>
        <div><dt>Focus</dt><dd>${e(CREATOR.title)}</dd></div>
        <div><dt>Email</dt><dd>${e(CREATOR.email)}</dd></div>
        <div><dt>Workspace owner</dt><dd>${e(shortPrincipal(CREATOR.principal))}</dd></div>
      </dl>
    </section>
  `;
}

function renderOperatorConsole(view) {
  if (!state.operatorAccess) {
    return "";
  }
  const client = currentClient(view);
  const project = currentProject(view);
  const tasksInContext = currentTasks(view);
  const approvalsInContext = currentApprovals(view);
  const documentsInContext = currentDocuments(view);
  const notesInContext = currentNotes(view);
  const requests = state.governanceAccess ? (state.accessRequests || []).map((request) => {
    const principal = principalText(request.principal);
    return `
      <li>
        <div>
          <strong>${e(request.email)}</strong>
          <span>${e(request.note)}</span>
          <code>${e(principal)}</code>
        </div>
        <div class="request-actions">
          <button type="button" data-action="approve-access-request" data-request-id="${e(natText(request.id))}" data-principal="${e(principal)}">Grant operator</button>
          <button type="button" class="secondary" data-action="reject-access-request" data-request-id="${e(natText(request.id))}">Reject</button>
        </div>
      </li>
    `;
  }).join("") : "";
  const openTasks = tasksInContext.filter((task) => variantName(task.status) !== "Done").length;
  const pendingApprovals = approvalsInContext.filter((approval) => variantName(approval.status) === "Pending").length;
  const documentCount = documentsInContext.length;
  const noteCount = notesInContext.length;
  const roleRows = state.governanceAccess ? (state.roleGrants || []).map((grant) => `
    <li>
      <div>
        <strong>${e(roleName(grant.role))}</strong>
        <span>${grant.clientId?.length ? `client:${e(natText(grant.clientId[0]))}` : "global role"}</span>
        <code>${e(principalText(grant.principal))}</code>
      </div>
      <div class="request-actions">
        <button type="button" class="secondary" data-action="revoke-role" data-principal="${e(principalText(grant.principal))}" data-role="${e(roleName(grant.role))}" data-client-id="${grant.clientId?.length ? e(natText(grant.clientId[0])) : ""}">Revoke</button>
      </div>
    </li>
  `).join("") : "";
  const proposalRows = state.governanceAccess ? (state.governanceProposals || []).slice(-5).reverse().map((proposal) => `
    <li>
      <div>
        <strong>${e(proposal.title)}</strong>
        <span>${e(variantName(proposal.kind))} · ${e(variantName(proposal.status))}</span>
        <code>${e(proposal.body)}</code>
      </div>
      <div class="request-actions">
        ${variantName(proposal.status) === "Open" ? `
          <button type="button" class="tiny" data-action="review-governance-proposal" data-proposal-id="${e(idText(proposal.id))}" data-status="Approved">Approve</button>
          <button type="button" class="tiny secondary" data-action="review-governance-proposal" data-proposal-id="${e(idText(proposal.id))}" data-status="Rejected">Reject</button>
        ` : "Reviewed"}
      </div>
    </li>
  `).join("") : "";
  const governancePanel = state.governanceAccess ? `
    <article class="surface access-queue governance-panel">
      <div class="section-heading">
        <span>Governance</span>
        <h3>Roles and client principal rotation</h3>
      </div>
      <ul>${roleRows || "<li><div><strong>No direct role grants</strong><span>Owner and legacy roles are derived until explicit grants are added.</span></div></li>"}</ul>
      <div class="proposal-ledger">
        <h3>Governance proposal ledger</h3>
        <ul>${proposalRows || "<li><div><strong>No governance proposals</strong><span>Create the first multisig/SNS/vault policy proposal.</span></div></li>"}</ul>
      </div>
      <div class="console-grid compact">
        <form class="form-surface compact-form" data-action="grant-role">
          <h3>Grant role</h3>
          <label><span>Principal</span><input name="principal" placeholder="aaaaa-aa..." required /></label>
          <label><span>Role</span><select name="role"><option>Operator</option><option>Reviewer</option><option>Client</option><option>Admin</option></select></label>
          <label><span>Client ID</span><input name="clientId" placeholder="required for Client role" inputmode="numeric" /></label>
          <button type="submit">Grant role</button>
        </form>
        <form class="form-surface compact-form" data-action="rotate-client-principal">
          <h3>Rotate client principal</h3>
          <label><span>Client ID</span><input name="clientId" value="${e(client?.id ?? 1)}" inputmode="numeric" required /></label>
          <label><span>New portal principal</span><input name="principal" placeholder="client Internet Identity principal" required /></label>
          <button type="submit">Rotate principal</button>
        </form>
        <form class="form-surface compact-form" data-action="create-governance-proposal">
          <h3>Create governance proposal</h3>
          <label><span>Kind</span><select name="kind"><option>Multisig</option><option>SNS</option><option>Launchtrail</option><option>VaultPolicy</option><option>ControllerMigration</option><option>Other</option></select></label>
          <label><span>Title</span><input name="title" value="Move controller governance to multisig" maxlength="180" required /></label>
          <label><span>Body</span><textarea name="body" maxlength="1500" required>Adopt team-grade controller approval before storing valuable client data.</textarea></label>
          <button type="submit">Create proposal</button>
        </form>
      </div>
    </article>
  ` : "";

  return `
    <section id="operate" class="operator-console reveal">
      <div class="section-heading">
        <span>Operations</span>
        <h2>Today’s client work.</h2>
      </div>
      <div class="workflow-cockpit">
        <article><span>Open tasks</span><strong>${e(openTasks)}</strong><p>Move active work to done and keep the activity trail clean.</p></article>
        <article><span>Pending approvals</span><strong>${e(pendingApprovals)}</strong><p>Keep client decisions visible and locked after final response.</p></article>
        <article><span>Document records</span><strong>${e(documentCount)}</strong><p>Hash files locally and record only metadata in the workspace.</p></article>
        <article><span>Client notes</span><strong>${e(noteCount)}</strong><p>Capture decisions and next steps inside the workroom.</p></article>
      </div>
      <article class="surface access-queue">
        <div class="section-heading">
          <span>Access queue</span>
          <h3>${state.governanceAccess ? "On-chain operator requests" : "Governance-only queue"}</h3>
        </div>
        <ul>${state.governanceAccess ? requests || "<li><div><strong>No pending requests</strong><span>Signed-in visitors can request operator review from the access panel.</span></div></li>" : "<li><div><strong>Locked for operator role</strong><span>Operators can run workspace activity, but only owner/admin governance can approve access requests.</span></div></li>"}</ul>
      </article>
      ${governancePanel}
      <div class="console-grid">
        <form class="surface form-surface" data-action="create-client">
          <h3>Create client</h3>
          <label><span>Client name</span><input name="name" value="Northstar Legal" maxlength="120" required /></label>
          <label><span>Contact name</span><input name="contactName" value="Marta Nowak" maxlength="120" required /></label>
          <label><span>Contact email</span><input name="contactEmail" value="marta@example.com" maxlength="180" required /></label>
          <label><span>Portal principal</span><input name="portalPrincipal" placeholder="optional principal" /></label>
          <button type="submit">Create client</button>
        </form>

        <form class="surface form-surface" data-action="create-project">
          <h3>Create project</h3>
          <label><span>Client ID</span><input name="clientId" value="${e(client?.id ?? 1)}" inputmode="numeric" required /></label>
          <label><span>Project name</span><input name="name" value="Acquisition diligence room" maxlength="140" required /></label>
          <label><span>Summary</span><textarea name="summary" maxlength="500" required>Encrypted document exchange, approval trail, and AI-generated client updates.</textarea></label>
          <button type="submit">Create project</button>
        </form>

        <form class="surface form-surface" data-action="create-task">
          <h3>Create task</h3>
          <label><span>Project ID</span><input name="projectId" value="${e(project?.id ?? 1)}" inputmode="numeric" required /></label>
          <label><span>Task title</span><input name="title" value="Review uploaded term sheet" maxlength="180" required /></label>
          <label><span>Assignee</span><input name="assignee" value="client" maxlength="80" required /></label>
          <button type="submit">Create task</button>
        </form>

        <form class="surface form-surface" data-action="create-approval">
          <h3>Create approval</h3>
          <label><span>Project ID</span><input name="projectId" value="${e(project?.id ?? 1)}" inputmode="numeric" required /></label>
          <label><span>Approval title</span><input name="title" value="Approve diligence packet" maxlength="160" required /></label>
          <label><span>Body</span><textarea name="body" maxlength="1000" required>Please confirm that the attached diligence packet can be shared with the buyer counsel.</textarea></label>
          <button type="submit">Request approval</button>
        </form>

        <form class="surface form-surface" data-action="create-document">
          <h3>Record document</h3>
          <label><span>Project ID</span><input name="projectId" value="${e(project?.id ?? 1)}" inputmode="numeric" required /></label>
          <label class="file-drop">
            <span>Select file</span>
            <input name="file" type="file" required />
            <small>Browser computes SHA-256 locally and writes only metadata to the canister. MVP limit: 2 MB.</small>
          </label>
          <label><span>Encrypted key ref</span><input name="encryptedKeyRef" value="vetkd:client-room:key-1" maxlength="240" required /></label>
          <button type="submit">Hash and record file</button>
        </form>

        <form class="surface form-surface" data-action="append-note">
          <h3>Append note</h3>
          <label><span>Project ID</span><input name="projectId" value="${e(project?.id ?? 1)}" inputmode="numeric" required /></label>
          <label><span>Note</span><textarea name="body" maxlength="1500" required>Client requested a concise status update before the next approval gate.</textarea></label>
          <button type="submit">Append note</button>
        </form>
      </div>
    </section>
  `;
}

function renderPortalDetail(view) {
  if ((!state.operatorAccess && !state.clientPortalAccess) || !view) return "";
  const project = currentProject(state.workspaceView);
  const documents = (view.documents || []).filter((doc) => !project || sameId(doc.projectId, project.id)).map((doc) => `
    <div>
      <strong>${e(doc.name)}</strong>
      <span>${e(natText(doc.sizeBytes))} bytes · ${e(doc.contentHash || "hash pending")}</span>
    </div>
  `).join("");
  const notes = (view.notes || []).filter((note) => !project || sameId(note.projectId, project.id)).map((note) => `
    <div>
      <strong>Note</strong>
      <span>${e(note.body)}</span>
    </div>
  `).join("");

  return `
    <section class="surface portal-detail">
      <div class="section-heading">
        <span>Authenticated portal data</span>
        <h2>${e(view.client.name)}</h2>
      </div>
      <div class="portal-grid">${documents}${notes}</div>
      <form class="inline-form portal-note-form" data-action="append-note">
        <input type="hidden" name="projectId" value="${e(project?.id ?? view.projects?.[0]?.id ?? 1)}" />
        <label>
          <span>Portal note</span>
          <input name="body" value="Reviewed portal materials and approval context." maxlength="1500" />
        </label>
        <button type="submit">Append note</button>
      </form>
    </section>
  `;
}

function renderAccessPanel() {
  if (!state.isAuthenticated) {
    return "";
  }
  if (state.clientPortalAccess && !state.operatorAccess) {
    return `
      <section class="access-panel client-ready reveal" id="access">
        <div>
          <span class="pill live">Client portal</span>
          <h2>This Internet Identity is linked to a client portal.</h2>
          <p>You can review portal data and respond to approvals. Operator-only tools stay locked, so client users cannot mutate workspace administration.</p>
        </div>
        <div class="principal-box">
          <span>Your portal principal</span>
          <code>${e(state.principal)}</code>
        </div>
      </section>
    `;
  }
  if (state.operatorAccess) {
    const roleCopy = state.governanceAccess
      ? "Owner/admin governance is active. You can approve operator requests and run workspace operations."
      : "Operator access is active. You can run workspace operations, while role approvals stay locked to governance.";
    return `
      <section class="access-panel operator-ready reveal">
        <div>
          <span class="pill live">${state.governanceAccess ? "Governance" : "Operator"}</span>
          <h2>Write access is active for this Internet Identity.</h2>
          <p>${e(roleCopy)}</p>
        </div>
        <button type="button" data-action="refresh" class="secondary">Refresh canister state</button>
      </section>
    `;
  }
  return `
    <section class="access-panel access-locked reveal" id="access">
      <div>
        <span class="pill waiting">Read-only after login</span>
        <h2>You are signed in, but this principal is not an operator yet.</h2>
        <p>The app keeps showing the live public preview instead of breaking. To unlock writes, request operator access. Governance can approve it without granting full admin power.</p>
      </div>
      <div class="principal-box">
        <span>Your Internet Identity principal</span>
        <code>${e(state.principal)}</code>
      </div>
      <div class="button-row">
        <button type="button" data-action="copy-principal">Copy principal</button>
        <a class="button secondary" href="mailto:${e(CREATOR.email)}?subject=SovereignDesk%20operator%20access&body=Please%20add%20this%20principal%20as%20an%20operator:%0A${encodeURIComponent(state.principal)}">Email creator</a>
      </div>
      <form class="request-access-form" data-action="request-access">
        <label><span>Contact email</span><input name="email" placeholder="you@example.com" maxlength="180" required /></label>
        <label><span>Request note</span><textarea name="note" maxlength="500" required>Please review this Internet Identity principal for SovereignDesk operator access.</textarea></label>
        <button type="submit">Request access on-chain</button>
      </form>
      <form class="request-access-form" data-action="claim-client-invite">
        <label><span>Client ID</span><input name="clientId" placeholder="1" inputmode="numeric" required /></label>
        <label><span>Invite code</span><input name="code" placeholder="Paste invite code" maxlength="80" required /></label>
        <button type="submit">Claim client portal</button>
      </form>
    </section>
  `;
}

function renderEmpty() {
  return `
    <section class="empty-state">
      <span class="canister-mark" aria-hidden="true"></span>
      <h2>No workspace loaded</h2>
      <p>${state.isAuthenticated ? "This canister is empty. Seed the first workspace to become the owner and open the operator console." : "Login with Internet Identity and seed the first workspace, or inspect the backend canister directly."}</p>
      <button type="button" data-action="${state.isAuthenticated ? "seed" : "login"}">${state.isAuthenticated ? "Seed first workspace" : "Login with Internet Identity"}</button>
    </section>
  `;
}

function renderPublicExperience(view) {
  return `
    ${renderHero(view)}
    ${renderProofStrip(view)}
    ${renderWorkflow(view)}
    ${renderTrustCenter()}
    ${renderCreatorSignal()}
  `;
}

function renderContextSwitcher(view) {
  if (!state.operatorAccess && !state.clientPortalAccess) return "";
  const clients = view?.clients || [];
  const client = currentClient(view);
  const projects = view?.projects || [];
  const scopedProjects = client ? projects.filter((project) => sameId(project.clientId, client.id)) : projects;
  return `
    <form class="context-switcher" data-action="switch-context" aria-label="Workspace context">
      <label>
        <span>Active client</span>
        <select name="clientId" data-action="switch-client" ${clients.length ? "" : "disabled"}>
          ${clients.map((item) => `<option value="${e(idText(item.id))}" ${sameId(item.id, state.activeClientId) ? "selected" : ""}>${e(item.name)}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Active project</span>
        <select name="projectId" data-action="switch-project" ${scopedProjects.length ? "" : "disabled"}>
          ${scopedProjects.map((item) => `<option value="${e(idText(item.id))}" ${sameId(item.id, state.activeProjectId) ? "selected" : ""}>${e(item.name)}</option>`).join("")}
        </select>
      </label>
      <div>
        <span>Scope</span>
        <strong>${e(client?.name || "No client")} · ${e(currentProject(view)?.name || "No project")}</strong>
      </div>
    </form>
  `;
}

function renderDocumentVaultTools(document) {
  if (!document) {
    return `<div class="vault-empty">Create a document record first, then add versions and verify hashes.</div>`;
  }
  const versions = documentVersions(document.id);
  const verifications = documentVerifications(document.id);
  const encryptedObjects = encryptedDocumentObjects(document.id);
  const versionOptions = versions.map((version) => `
    <option value="${e(idText(version.id))}">v${e(natText(version.version))} · ${e(version.contentHash)}</option>
  `).join("");
  const verificationRows = verifications.slice(-4).reverse().map((item) => `
    <li class="${item.matches ? "match" : "mismatch"}">
      <strong>${item.matches ? "Match" : "Mismatch"}</strong>
      <code>${e(item.submittedHash)}</code>
    </li>
  `).join("");
  const encryptedRows = encryptedObjects.slice(-4).reverse().map((item) => `
    <li>
      <strong>${e(item.algorithm)}</strong>
      <span>${e(natText(item.ciphertextSize))} encrypted bytes</span>
      <code>${e(item.ciphertextHash)}</code>
      <button type="button" class="tiny" data-action="download-encrypted-object" data-object-id="${e(idText(item.id))}">Download ciphertext</button>
    </li>
  `).join("");
  return `
    <div class="vault-console">
      <div class="vault-summary">
        <span>Document Vault v2</span>
        <strong>${e(document.name)}</strong>
        <p>Client-side encryption, vetKeys-ready derivation context, version records, hash verification, and audit events.</p>
      </div>
      <form class="compact-form" data-action="add-document-version">
        <input type="hidden" name="documentId" value="${e(idText(document.id))}" />
        <label class="file-drop">
          <span>Add version file</span>
          <input name="file" type="file" required />
          <small>The browser hashes the file locally. The canister stores only metadata, hash, and key reference.</small>
        </label>
        <label><span>Encrypted key ref</span><input name="encryptedKeyRef" value="vetkd:client-room:key-${e(idText(document.id))}-v${versions.length + 1}" maxlength="240" required /></label>
        <button type="submit">Add version</button>
      </form>
      <form class="compact-form" data-action="verify-document-hash">
        <input type="hidden" name="documentId" value="${e(idText(document.id))}" />
        <label>
          <span>Version</span>
          <select name="versionId">
            <option value="">Original record</option>
            ${versionOptions}
          </select>
        </label>
        <label class="file-drop">
          <span>Verify file</span>
          <input name="file" type="file" />
          <small>Optional. Selecting a file computes SHA-256 locally and compares it with the selected vault record.</small>
        </label>
        <label><span>Or paste SHA-256</span><input name="submittedHash" value="${e(document.contentHash)}" maxlength="240" /></label>
        <button type="submit">Verify hash</button>
      </form>
      <form class="compact-form" data-action="store-encrypted-object">
        <input type="hidden" name="documentId" value="${e(idText(document.id))}" />
        <label>
          <span>Version</span>
          <select name="versionId">
            <option value="">Original record</option>
            ${versionOptions}
          </select>
        </label>
        <label class="file-drop">
          <span>Encrypt file</span>
          <input name="file" type="file" required />
          <small>AES-GCM runs in this browser. Only ciphertext, IV, hash, and key context are written to the canister.</small>
        </label>
        <label><span>Vault passphrase</span><input name="passphrase" type="password" minlength="12" autocomplete="new-password" required /></label>
        <button type="submit">Encrypt and store</button>
      </form>
      <ol class="vault-verifications">${verificationRows || "<li><strong>No verifications yet</strong><span>Run a file check to create evidence.</span></li>"}</ol>
      <ol class="vault-verifications encrypted-list">${encryptedRows || "<li><strong>No encrypted objects yet</strong><span>Store ciphertext to prove private-data mode.</span></li>"}</ol>
    </div>
  `;
}

function renderWorkspaceManager(view) {
  if (!state.operatorAccess && !state.clientPortalAccess) return "";
  const clients = view?.clients || [];
  const client = currentClient(view);
  const projects = view?.projects || [];
  const scopedProjects = client ? projects.filter((project) => sameId(project.clientId, client.id)) : projects;
  const approvals = currentApprovals(view);
  const documents = currentDocuments(view);
  const audit = (view?.audit || []).slice(-8).reverse();
  const inviteRows = (state.clientInvites || []).filter((invite) => !client || sameId(invite.clientId, client.id)).map((invite) => {
    const claimed = invite.claimedBy?.length ? `Claimed by ${shortPrincipal(invite.claimedBy[0])}` : invite.revokedAt?.length ? "Revoked" : "Open";
    return `
      <tr>
        <td><strong>Client ${e(idText(invite.clientId))}</strong><span>${e(invite.note)}</span></td>
        <td><code>${e(invite.code)}</code></td>
        <td>${e(claimed)}</td>
        <td>${!invite.claimedBy?.length && !invite.revokedAt?.length ? `<button type="button" class="tiny" data-action="revoke-client-invite" data-invite-id="${e(idText(invite.id))}">Revoke</button>` : "Closed"}</td>
      </tr>
    `;
  }).join("");
  const clientRows = clients.map((item) => `
    <tr class="${sameId(item.id, state.activeClientId) ? "active-row" : ""}">
      <td><strong>${e(item.name)}</strong><span>${e(item.contactName)}</span></td>
      <td>${e(item.contactEmail || "private")}</td>
      <td>${item.portalPrincipal?.length ? e(shortPrincipal(item.portalPrincipal[0])) : "Not bound"}</td>
      <td><button type="button" class="tiny" data-action="select-client" data-client-id="${e(idText(item.id))}">Open</button></td>
    </tr>
  `).join("");
  const projectRows = scopedProjects.map((item) => `
    <tr class="${sameId(item.id, state.activeProjectId) ? "active-row" : ""}">
      <td><strong>${e(item.name)}</strong><span>${e(item.summary)}</span></td>
      <td>${statusPill(item.status)}</td>
      <td>${e(idText(item.id))}</td>
      <td><button type="button" class="tiny" data-action="select-project" data-project-id="${e(idText(item.id))}">Open</button></td>
    </tr>
  `).join("");
  const approvalRows = approvals.map((item) => `
    <tr>
      <td><strong>${e(item.title)}</strong><span>${e(item.body)}</span></td>
      <td>${statusPill(item.status)}</td>
      <td>${item.responder?.length ? e(shortPrincipal(item.responder[0])) : "No response"}</td>
      <td>
        ${canRespondApproval() && variantName(item.status) === "Pending" ? `
          <button type="button" class="tiny" data-action="approval-decision" data-approval-id="${e(idText(item.id))}" data-decision="Approved">Approve</button>
          <button type="button" class="tiny" data-action="approval-decision" data-approval-id="${e(idText(item.id))}" data-decision="Rejected">Reject</button>
        ` : "Locked"}
      </td>
    </tr>
  `).join("");
  const documentRows = documents.map((item) => {
    const versions = documentVersions(item.id);
    const latest = latestDocumentVersion(item.id);
    const verifications = documentVerifications(item.id);
    const lastVerification = verifications[verifications.length - 1];
    const archive = documentArchive(item.id);
    return `
      <tr class="${archive ? "archived-row" : ""}">
        <td>
          <strong>${e(item.name)}</strong>
          <span>${e(item.mimeType)} · ${archive ? "Archived" : "Active"} · ${versions.length} versions</span>
        </td>
        <td>${e(natText(latest?.sizeBytes ?? item.sizeBytes))} bytes</td>
        <td>
          <code>${e(latest?.contentHash || item.contentHash)}</code>
          ${lastVerification ? `<span>${lastVerification.matches ? "Last verification matched" : "Last verification mismatch"}</span>` : ""}
        </td>
        <td>
          <code>${e(latest?.encryptedKeyRef || item.encryptedKeyRef)}</code>
          <div class="row-actions">
            <button type="button" class="tiny" data-action="load-document-vault" data-document-id="${e(idText(item.id))}">Refresh vault</button>
            ${state.operatorAccess && !archive ? `<button type="button" class="tiny" data-action="archive-document" data-document-id="${e(idText(item.id))}">Archive</button>` : ""}
          </div>
        </td>
      </tr>
    `;
  }).join("");
  const auditRows = audit.map((item) => `
    <tr>
      <td><strong>${e(auditTitle(item))}</strong><span>${e(item.action)}</span></td>
      <td>${e(auditTarget(item))}</td>
      <td>${e(shortPrincipal(item.actorPrincipal))}</td>
    </tr>
  `).join("");
  const vaultDocument = documents.find((item) => documentVersions(item.id).length || documentVerifications(item.id).length) || documents[0];

  return `
    <section class="workspace-manager reveal" aria-label="Workspace manager">
      <div class="module-tabs" aria-label="Workspace modules">
        <a href="#manager-clients">Clients</a>
        <a href="#manager-projects">Projects</a>
        <a href="#manager-approvals">Approvals</a>
        <a href="#manager-documents">Documents</a>
        <a href="#manager-audit">Audit</a>
        <a href="#manager-invites">Invites</a>
      </div>
      <div class="manager-grid">
        <article id="manager-clients" class="surface manager-panel">
          <div class="section-heading">
            <span>Clients</span>
            <h2>Client rooms</h2>
          </div>
          <div class="data-table-wrap">
            <table class="data-table">
              <thead><tr><th>Client</th><th>Contact</th><th>Portal principal</th><th></th></tr></thead>
              <tbody>${clientRows || '<tr><td colspan="4">No clients yet.</td></tr>'}</tbody>
            </table>
          </div>
        </article>

        <article id="manager-projects" class="surface manager-panel">
          <div class="section-heading">
            <span>Projects</span>
            <h2>${e(client?.name || "Selected client")}</h2>
          </div>
          <div class="data-table-wrap">
            <table class="data-table">
              <thead><tr><th>Project</th><th>Status</th><th>ID</th><th></th></tr></thead>
              <tbody>${projectRows || '<tr><td colspan="4">No projects for this client.</td></tr>'}</tbody>
            </table>
          </div>
        </article>

        <article id="manager-approvals" class="surface manager-panel">
          <div class="section-heading">
            <span>Approvals</span>
            <h2>Decision gates</h2>
          </div>
          <div class="data-table-wrap">
            <table class="data-table">
              <thead><tr><th>Approval</th><th>Status</th><th>Responder</th><th>Action</th></tr></thead>
              <tbody>${approvalRows || '<tr><td colspan="4">No approvals in this project.</td></tr>'}</tbody>
            </table>
          </div>
        </article>

        <article id="manager-documents" class="surface manager-panel">
          <div class="section-heading">
            <span>Documents</span>
            <h2>Vault metadata</h2>
          </div>
          <div class="data-table-wrap">
            <table class="data-table">
              <thead><tr><th>Document</th><th>Size</th><th>Hash</th><th>Vault actions</th></tr></thead>
              <tbody>${documentRows || '<tr><td colspan="4">No document records in this project.</td></tr>'}</tbody>
            </table>
          </div>
          ${renderDocumentVaultTools(vaultDocument)}
        </article>

        <article id="manager-audit" class="surface manager-panel wide">
          <div class="section-heading">
            <span>Audit</span>
            <h2>Recent canister activity</h2>
          </div>
          <div class="data-table-wrap">
            <table class="data-table">
              <thead><tr><th>Event</th><th>Target</th><th>Actor</th></tr></thead>
              <tbody>${auditRows || '<tr><td colspan="3">No audit events yet.</td></tr>'}</tbody>
            </table>
          </div>
        </article>

        <article id="manager-invites" class="surface manager-panel wide">
          <div class="section-heading">
            <span>Client invites</span>
            <h2>Portal onboarding</h2>
          </div>
          ${state.operatorAccess ? `
            <form class="inline-form invite-form" data-action="create-client-invite">
              <input type="hidden" name="clientId" value="${e(client?.id ?? 1)}" />
              <label><span>Invite code</span><input name="code" value="client-${e(client?.id ?? 1)}-${Date.now().toString(36)}" maxlength="80" required /></label>
              <label><span>Note</span><input name="note" value="Portal invite for ${e(client?.name || "selected client")}" maxlength="240" required /></label>
              <button type="submit">Create invite</button>
            </form>
          ` : ""}
          <div class="data-table-wrap">
            <table class="data-table">
              <thead><tr><th>Client</th><th>Code</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>${inviteRows || '<tr><td colspan="4">No invites for this client.</td></tr>'}</tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderAppDashboard(view) {
  const project = currentProject(view);
  const client = currentClient(view);
  const openTasks = currentTasks(view).filter((task) => variantName(task.status) !== "Done").length;
  const pendingApprovals = currentApprovals(view).filter((approval) => variantName(approval.status) === "Pending").length;
  const documentCount = currentDocuments(view).length;
  const encryptedCount = Object.values(state.encryptedDocumentObjects || {}).reduce((total, items) => total + items.length, 0);
  const proposalCount = state.governanceProposals?.filter((proposal) => variantName(proposal.status) === "Open").length || 0;
  return `
    <section id="overview" class="app-dashboard reveal" aria-label="Authenticated app dashboard">
      <div class="app-command-bar">
        <div class="app-dashboard-copy">
          <span class="pill live">${e(accessLabel())}</span>
          <h1>${state.operatorAccess ? "Operations cockpit" : state.clientPortalAccess ? "Client workroom" : "Access review"}</h1>
          <p>
            ${state.operatorAccess
              ? "Client work, vault evidence, governance, and canister proof in one focused control surface."
              : state.clientPortalAccess
                ? "Review scoped work, approvals, notes, and document evidence without exposing other clients."
                : "You are signed in. Request operator access or send your principal to the workspace owner."}
          </p>
        </div>
        <div class="app-dashboard-actions">
          <button type="button" data-action="refresh">Refresh</button>
          <button type="button" data-action="logout" class="secondary">Logout</button>
        </div>
      </div>
      <nav class="app-module-nav" aria-label="App modules">
        <a href="#operate">Operate</a>
        <a href="#manager-documents">Vault</a>
        <a href="#manager-approvals">Approvals</a>
        <a href="#manager-audit">Audit</a>
        <a href="#trust">Trust</a>
      </nav>
      <dl class="app-session">
        <div><dt>Principal</dt><dd>${e(shortPrincipal(state.principal))}</dd></div>
        <div><dt>Client</dt><dd>${e(client?.name || "No client loaded")}</dd></div>
        <div><dt>Project</dt><dd>${e(project?.name || "No project loaded")}</dd></div>
        <div><dt>Open Tasks</dt><dd>${e(openTasks)}</dd></div>
        <div><dt>Approvals</dt><dd>${e(pendingApprovals)} pending</dd></div>
        <div><dt>Vault</dt><dd>${e(documentCount)} docs · ${e(encryptedCount)} encrypted</dd></div>
        ${state.governanceAccess ? `<div><dt>Governance</dt><dd>${e(proposalCount)} open proposals</dd></div>` : ""}
      </dl>
      ${renderContextSwitcher(view)}
    </section>
    ${state.operatorAccess ? renderOperatorConsole(view) : ""}
    ${renderWorkspaceManager(view)}
    ${state.clientPortalAccess ? renderPortalDetail(state.portalView) : ""}
    ${renderAccessPanel()}
    ${state.operatorAccess ? renderPortalDetail(state.portalView) : ""}
    ${renderAgentAndAudit(view)}
    <section class="app-compliance reveal" aria-label="Compliance proof">
      <div class="section-heading">
        <span>Verification</span>
        <h2>Canister proof and release evidence.</h2>
      </div>
      ${renderProofStrip(view, "proof")}
    </section>
    ${renderTrustCenter()}
  `;
}

function render() {
  const view = state.workspaceView;
  const isAppMode = state.isAuthenticated;
  app.innerHTML = `
    <a class="skip-link" href="#main">Skip to workspace</a>
    <div class="app-shell ${isAppMode ? "app-mode" : "public-mode"}">
      <div class="ambient-frame" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
      <header class="top-nav">
        <a class="wordmark" href="#main" aria-label="SovereignDesk home">
          <span class="canister-mark" aria-hidden="true"></span>
          <strong>SovereignDesk</strong>
          <em>ICP</em>
        </a>
        <nav aria-label="Primary">
          ${isAppMode ? `
            <a href="#overview">Dashboard</a>
            ${state.operatorAccess ? '<a href="#operate">Operate</a>' : '<a href="#access">Access</a>'}
            <a href="#clients">Workroom</a>
            <a href="#trust">Trust</a>
          ` : `
            <a href="#review">Review</a>
            <a href="#overview">Proof</a>
            <a href="#clients">Workspace</a>
            <a href="#trust">Trust</a>
            <a href="#creator">Creator</a>
          `}
        </nav>
        <a class="nav-status" href="https://dashboard.internetcomputer.org/canister/${e(BACKEND_CANISTER_ID)}" target="_blank" rel="noreferrer">
          <span class="live-dot" aria-hidden="true"></span>
          Mainnet verified
        </a>
      </header>

      <main id="main">
        <div class="mobile-action-bar" aria-label="Fast actions">
          ${isAppMode ? '<a href="#overview">Home</a>' : '<a href="#review">Review</a>'}
          ${isAppMode ? (state.operatorAccess ? '<a href="#operate">Operate</a>' : '<a href="#access">Access</a>') : '<a href="#overview">Proof</a>'}
          ${isAppMode ? '<a href="#clients">Workroom</a>' : '<button type="button" data-action="login">Login</button>'}
        </div>
        ${state.error ? `<div class="message error">${e(state.error)}</div>` : ""}
        ${state.notice ? `<div class="message">${e(state.notice)}</div>` : ""}
        ${state.loading ? `<div class="message working">Working with the canister...</div>` : ""}
        ${view ? (isAppMode ? renderAppDashboard(view) : renderPublicExperience(view)) : renderEmpty()}
      </main>
    </div>
  `;
  requestAnimationFrame(() => {
    document.querySelector(".app-shell")?.classList.add("is-ready");
    document.querySelectorAll(".reveal").forEach((node, index) => {
      node.style.setProperty("--reveal-index", String(index));
      node.classList.add("is-visible");
    });
  });
}

async function withBusy(task) {
  state.loading = true;
  state.error = "";
  state.notice = "";
  render();
  try {
    await task();
  } catch (error) {
    state.error = humanError(error);
  } finally {
    state.loading = false;
    render();
  }
}

function humanError(error) {
  const message = error?.message || String(error);
  if (message.includes("anonymous caller not allowed")) {
    return "Login with Internet Identity before writing to the canister.";
  }
  if (message.includes("caller is not an admin")) {
    return "This Internet Identity is not an operator for the current workspace. Add its principal as an admin from the controller identity.";
  }
  return message;
}

async function refreshData() {
  state.roles = [];
  state.roleGrants = [];
  state.clientInvites = [];
  state.documentArchives = [];
  state.documentVersions = {};
  state.documentVerifications = {};
  state.encryptedDocumentObjects = {};
  state.governanceProposals = [];
  state.governanceAccess = false;
  state.operatorAccess = false;
  state.clientPortalAccess = false;
  state.accessMode = state.isAuthenticated ? "signed-readonly" : "public";

  if (state.isAuthenticated) {
    state.roles = await state.actor.get_my_roles();
    state.governanceAccess = hasRole("Owner") || hasRole("Admin");
    state.operatorAccess = state.governanceAccess || hasRole("Operator");
    state.clientPortalAccess = hasRole("Client");

    if (state.operatorAccess) {
      const privateView = await state.actor.get_my_workspace();
      state.workspaceView = privateView.length ? privateView[0] : null;
      normalizeActiveContext(state.workspaceView);
      state.operatorAccess = true;
      state.accessMode = state.governanceAccess ? "governance" : "operator";
      state.accessRequests = state.governanceAccess ? await state.actor.list_access_requests() : [];
      state.roleGrants = state.governanceAccess ? await state.actor.list_role_grants() : [];
      state.governanceProposals = state.governanceAccess ? await state.actor.list_governance_proposals().catch(() => []) : [];
      state.clientInvites = await state.actor.list_client_invites().catch(() => []);
      state.documentArchives = await state.actor.list_document_archives().catch(() => []);
    }

    if (!state.workspaceView) {
      const portals = await state.actor.get_my_client_portals();
      if (portals.length) {
        state.portalView = portals[0];
        state.workspaceView = portalToWorkspaceView(portals[0]);
        normalizeActiveContext(state.workspaceView);
        state.clientPortalAccess = true;
        state.accessMode = "client-portal";
      } else {
        const publicView = await state.actor.get_public_demo();
        state.workspaceView = publicView.length ? publicView[0] : null;
        normalizeActiveContext(state.workspaceView);
      }
    }
  } else {
    const publicView = await state.actor.get_public_demo();
    state.workspaceView = publicView.length ? publicView[0] : null;
    normalizeActiveContext(state.workspaceView);
  }

  if (state.operatorAccess && currentClient(state.workspaceView)) {
    const portal = await state.actor.get_client_portal(currentClient(state.workspaceView).id);
    state.portalView = portal.length ? portal[0] : null;
  } else if (!state.clientPortalAccess) {
    state.portalView = null;
  }
  await refreshVaultForCurrentDocuments().catch(() => undefined);
}

async function refreshVaultForCurrentDocuments() {
  if (!state.isAuthenticated || !state.workspaceView || (!state.operatorAccess && !state.clientPortalAccess)) return;
  const docs = currentDocuments(state.workspaceView).slice(0, 8);
  for (const doc of docs) {
    const documentId = idText(doc.id);
    state.documentVersions[documentId] = await state.actor.list_document_versions(doc.id).catch(() => []);
    state.documentVerifications[documentId] = await state.actor.list_document_verifications(doc.id).catch(() => []);
    state.encryptedDocumentObjects[documentId] = await state.actor.list_encrypted_document_objects(doc.id).catch(() => []);
  }
}

async function login() {
  await withBusy(async () => {
    const identity = await state.authClient.signIn({
      maxTimeToLive: BigInt(8) * BigInt(3_600_000_000_000),
      targets: [Principal.fromText(BACKEND_CANISTER_ID)],
    });
    state.principal = identity.getPrincipal().toText();
    state.isAuthenticated = true;
    state.actor = await createBackendActor(identity);
    await refreshData();
    state.notice = "Authenticated with Internet Identity.";
  });
}

async function logout() {
  await state.authClient.logout();
  await init();
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function nat(value) {
  return BigInt(String(value || "0"));
}

function optionalPrincipal(value) {
  const text = String(value || "").trim();
  return text ? [Principal.fromText(text)] : [];
}

function optionalNat(value) {
  const text = String(value || "").trim();
  return text ? [BigInt(text)] : [];
}

function roleVariant(value) {
  const role = String(value || "Operator");
  if (role === "Admin") return { Admin: null };
  if (role === "Client") return { Client: null };
  if (role === "Reviewer") return { Reviewer: null };
  return { Operator: null };
}

function governanceKindVariant(value) {
  const kind = String(value || "Other");
  if (kind === "ControllerMigration") return { ControllerMigration: null };
  if (kind === "Multisig") return { Multisig: null };
  if (kind === "SNS") return { SNS: null };
  if (kind === "Launchtrail") return { Launchtrail: null };
  if (kind === "VaultPolicy") return { VaultPolicy: null };
  return { Other: null };
}

function proposalStatusVariant(value) {
  if (value === "Approved") return { Approved: null };
  if (value === "Rejected") return { Rejected: null };
  return { Open: null };
}

function hex(buffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256File(file) {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return hex(digest);
}

async function sha256Bytes(bytes) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return hex(digest);
}

async function deriveVaultKey(passphrase, context) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(context),
      iterations: 210_000,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptVaultFile(file, passphrase, context) {
  if (!passphrase || passphrase.length < 12) {
    throw new Error("vault passphrase must be at least 12 characters");
  }
  if (file.size > 2_000_000) {
    throw new Error("document too large for MVP encrypted object limit");
  }
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveVaultKey(passphrase, context);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    await file.arrayBuffer(),
  ));
  return {
    iv,
    ciphertext,
    ciphertextHash: `sha256:${await sha256Bytes(ciphertext)}`,
  };
}

function downloadBytes(name, bytes, type = "application/octet-stream") {
  const url = URL.createObjectURL(new Blob([bytes], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function copyText(value) {
  const text = String(value || "");
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
}

app.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  if (action === "login") login();
  if (action === "logout") logout();
  if (action === "refresh") withBusy(refreshData);
  if (action === "copy-principal") withBusy(async () => {
    await copyText(state.principal);
    state.notice = "Principal copied. Request operator access or bind it as a client portal principal.";
  });
  if (action === "copy-value") withBusy(async () => {
    await copyText(button.dataset.copyValue || "");
    state.notice = "Copied to clipboard.";
  });
  if (action === "approve-access-request") withBusy(async () => {
    if (!state.governanceAccess) throw new Error("caller is not a governance principal");
    await state.actor.approve_access_request(nat(button.dataset.requestId));
    await refreshData();
    state.notice = "Operator role granted to requested principal.";
  });
  if (action === "reject-access-request") withBusy(async () => {
    if (!state.governanceAccess) throw new Error("caller is not a governance principal");
    await state.actor.reject_access_request(nat(button.dataset.requestId), "Rejected from SovereignDesk operator console.");
    await refreshData();
    state.notice = "Access request rejected and recorded in the audit trail.";
  });
  if (action === "revoke-role") withBusy(async () => {
    if (!state.governanceAccess) throw new Error("caller is not a governance principal");
    await state.actor.revoke_role(
      Principal.fromText(button.dataset.principal),
      roleVariant(button.dataset.role),
      optionalNat(button.dataset.clientId),
    );
    await refreshData();
    state.notice = "Role revoked and written to the canister audit trail.";
  });
  if (action === "seed") withBusy(async () => {
    if (!state.operatorAccess && state.workspaceView) throw new Error("caller is not an admin");
    state.workspaceView = await state.actor.seed_demo();
    await refreshData();
    state.notice = "Workspace seeded in the backend canister.";
  });
  if (action === "approve" || action === "reject") withBusy(async () => {
    if (!canRespondApproval()) throw new Error("caller is not an admin");
    const approval = currentApproval(state.workspaceView);
    if (!approval) return;
    await state.actor.respond_approval(
      approval.id,
      action === "approve" ? { Approved: null } : { Rejected: null },
      action === "approve" ? "Approved from SovereignDesk UI." : "Client requested changes from SovereignDesk UI.",
    );
    await refreshData();
    state.notice = "Approval response written to the canister audit trail.";
  });
  if (action === "task-status") withBusy(async () => {
    if (!state.operatorAccess) throw new Error("caller is not an admin");
    await state.actor.update_task_status(nat(button.dataset.taskId), taskStatusVariant(button.dataset.status));
    await refreshData();
    state.notice = "Task status updated and recorded in the audit trail.";
  });
  if (action === "select-client") withBusy(async () => {
    state.activeClientId = button.dataset.clientId || "";
    state.activeProjectId = "";
    normalizeActiveContext(state.workspaceView);
    if (state.operatorAccess && currentClient(state.workspaceView)) {
      const portal = await state.actor.get_client_portal(currentClient(state.workspaceView).id);
      state.portalView = portal.length ? portal[0] : null;
    }
    state.notice = "Client room opened.";
  });
  if (action === "select-project") withBusy(async () => {
    state.activeProjectId = button.dataset.projectId || "";
    normalizeActiveContext(state.workspaceView);
    state.notice = "Project room opened.";
  });
  if (action === "approval-decision") withBusy(async () => {
    if (!canRespondApproval()) throw new Error("caller is not an admin");
    await state.actor.respond_approval(
      nat(button.dataset.approvalId),
      button.dataset.decision === "Approved" ? { Approved: null } : { Rejected: null },
      button.dataset.decision === "Approved" ? "Approved from SovereignDesk manager." : "Rejected from SovereignDesk manager.",
    );
    await refreshData();
    state.notice = "Approval decision written to the canister audit trail.";
  });
  if (action === "revoke-client-invite") withBusy(async () => {
    if (!state.operatorAccess) throw new Error("caller is not an admin");
    await state.actor.revoke_client_invite(nat(button.dataset.inviteId));
    await refreshData();
    state.notice = "Client invite revoked.";
  });
  if (action === "load-document-vault") withBusy(async () => {
    const documentId = nat(button.dataset.documentId);
    state.documentVersions[idText(documentId)] = await state.actor.list_document_versions(documentId);
    state.documentVerifications[idText(documentId)] = await state.actor.list_document_verifications(documentId);
    state.encryptedDocumentObjects[idText(documentId)] = await state.actor.list_encrypted_document_objects(documentId);
    state.notice = "Document vault evidence refreshed.";
  });
  if (action === "download-encrypted-object") withBusy(async () => {
    const object = await state.actor.get_encrypted_document_object(nat(button.dataset.objectId));
    if (!object.length) throw new Error("encrypted object not found");
    downloadBytes(`sovereign-desk-encrypted-${idText(button.dataset.objectId)}.bin`, new Uint8Array(object[0].ciphertext));
    state.notice = "Encrypted ciphertext downloaded. Decryption key never leaves the browser/passphrase flow.";
  });
  if (action === "review-governance-proposal") withBusy(async () => {
    if (!state.governanceAccess) throw new Error("caller is not a governance principal");
    await state.actor.review_governance_proposal(
      nat(button.dataset.proposalId),
      proposalStatusVariant(button.dataset.status),
      `${button.dataset.status} from SovereignDesk governance console.`,
    );
    await refreshData();
    state.notice = "Governance proposal reviewed and written to audit.";
  });
  if (action === "archive-document") withBusy(async () => {
    if (!state.operatorAccess) throw new Error("caller is not an admin");
    await state.actor.archive_document_record(nat(button.dataset.documentId), "Archived from SovereignDesk vault console.");
    await refreshData();
    state.notice = "Document archived and recorded in the audit trail.";
  });
});

app.addEventListener("change", (event) => {
  const control = event.target.closest("[data-action='switch-client'], [data-action='switch-project']");
  if (!control) return;
  withBusy(async () => {
    if (control.dataset.action === "switch-client") {
      state.activeClientId = control.value;
      state.activeProjectId = "";
    }
    if (control.dataset.action === "switch-project") {
      state.activeProjectId = control.value;
    }
    normalizeActiveContext(state.workspaceView);
    if (state.operatorAccess && currentClient(state.workspaceView)) {
      const portal = await state.actor.get_client_portal(currentClient(state.workspaceView).id);
      state.portalView = portal.length ? portal[0] : null;
    }
    state.notice = "Workspace context switched.";
  });
});

app.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-action]");
  if (!form) return;
  event.preventDefault();
  const action = form.dataset.action;
  const data = formData(form);

  withBusy(async () => {
    if (action === "request-access") {
      await state.actor.request_operator_access(String(data.email || ""), String(data.note || ""));
      state.notice = "Access request written to the backend canister. The operator can review it in the on-chain queue.";
      await refreshData();
      return;
    }
    if (action === "claim-client-invite") {
      state.portalView = await state.actor.claim_client_invite(nat(data.clientId), String(data.code || ""));
      state.workspaceView = portalToWorkspaceView(state.portalView);
      normalizeActiveContext(state.workspaceView);
      state.clientPortalAccess = true;
      state.notice = "Client portal claimed for this Internet Identity.";
      await refreshData();
      return;
    }
    if (action === "create-client-invite") {
      if (!state.operatorAccess) throw new Error("caller is not an admin");
      await state.actor.create_client_invite(nat(data.clientId), String(data.code || ""), String(data.note || ""));
      state.notice = "Client invite created. Share the client ID and code with the client.";
      await refreshData();
      return;
    }
    if (action === "grant-role") {
      if (!state.governanceAccess) throw new Error("caller is not a governance principal");
      await state.actor.grant_role(Principal.fromText(String(data.principal || "")), roleVariant(data.role), optionalNat(data.clientId));
      state.notice = "Role granted and written to the canister audit trail.";
      await refreshData();
      return;
    }
    if (action === "rotate-client-principal") {
      if (!state.governanceAccess) throw new Error("caller is not a governance principal");
      await state.actor.rotate_client_principal(nat(data.clientId), Principal.fromText(String(data.principal || "")));
      state.notice = "Client portal principal rotated and role grant recorded.";
      await refreshData();
      return;
    }
    if (action === "create-governance-proposal") {
      if (!state.governanceAccess) throw new Error("caller is not a governance principal");
      await state.actor.create_governance_proposal(
        governanceKindVariant(data.kind),
        String(data.title || ""),
        String(data.body || ""),
      );
      state.notice = "Governance proposal created in the canister ledger.";
      await refreshData();
      return;
    }
    if (action === "append-note") {
      if (!state.operatorAccess && !state.clientPortalAccess) throw new Error("project not accessible");
      await state.actor.append_note(nat(data.projectId), data.body);
      state.notice = "Note appended to the canister audit trail.";
      await refreshData();
      return;
    }
    if (!state.operatorAccess) throw new Error("caller is not an admin");
    if (action === "ask-agent") {
      state.agentResponse = await state.actor.ask_agent(`project:${state.activeProjectId || "1"}`, String(data.prompt || "Summarize next steps"));
      state.notice = "AI Employee response written to the backend canister.";
    }
    if (action === "create-client") {
      await state.actor.create_client(data.name, data.contactName, data.contactEmail, optionalPrincipal(data.portalPrincipal));
      state.notice = "Client created.";
    }
    if (action === "create-project") {
      await state.actor.create_project(nat(data.clientId), data.name, data.summary);
      state.notice = "Project created.";
    }
    if (action === "create-task") {
      await state.actor.create_task(nat(data.projectId), data.title, data.assignee);
      state.notice = "Task created.";
    }
    if (action === "create-approval") {
      await state.actor.create_approval(nat(data.projectId), data.title, data.body);
      state.notice = "Approval requested.";
    }
    if (action === "create-document") {
      const file = form.elements.file?.files?.[0];
      if (file) {
        if (file.size > 2_000_000) {
          throw new Error("document too large for MVP record limit");
        }
        const digest = await sha256File(file);
        await state.actor.create_document_record(
          nat(data.projectId),
          file.name,
          file.type || "application/octet-stream",
          BigInt(file.size),
          data.encryptedKeyRef,
          `sha256:${digest}`,
        );
        state.notice = "File hash computed locally and document record written to the canister.";
        await refreshData();
        return;
      }
      await state.actor.create_document_record(
        nat(data.projectId),
        data.name,
        data.mimeType,
        nat(data.sizeBytes),
        data.encryptedKeyRef,
        data.contentHash,
      );
      state.notice = "Document record written to the canister.";
    }
    if (action === "add-document-version") {
      const file = form.elements.file?.files?.[0];
      if (!file) throw new Error("version file is required");
      if (file.size > 2_000_000) {
        throw new Error("document too large for MVP record limit");
      }
      const digest = await sha256File(file);
      await state.actor.add_document_version(
        nat(data.documentId),
        BigInt(file.size),
        data.encryptedKeyRef,
        `sha256:${digest}`,
      );
      state.notice = "Document version hash recorded in the canister vault.";
    }
    if (action === "verify-document-hash") {
      const file = form.elements.file?.files?.[0];
      const submittedHash = file ? `sha256:${await sha256File(file)}` : String(data.submittedHash || "");
      const result = await state.actor.verify_document_hash(
        nat(data.documentId),
        optionalNat(data.versionId),
        submittedHash,
      );
      state.notice = result.matches ? "Hash verification matched the vault record." : "Hash verification mismatch recorded for audit review.";
    }
    if (action === "store-encrypted-object") {
      const file = form.elements.file?.files?.[0];
      if (!file) throw new Error("encrypted file is required");
      const documentId = nat(data.documentId);
      const context = await state.actor.get_vetkey_derivation_context(documentId, Principal.fromText(state.principal));
      const encrypted = await encryptVaultFile(file, String(data.passphrase || ""), context);
      await state.actor.store_encrypted_document_object(
        documentId,
        optionalNat(data.versionId),
        "AES-GCM-256/PBKDF2-SHA256/vetkeys-ready",
        context,
        encrypted.iv,
        encrypted.ciphertext,
        encrypted.ciphertextHash,
      );
      state.notice = "Encrypted ciphertext stored on the canister. The plaintext file and passphrase were not sent.";
    }
    await refreshData();
  });
});

async function init() {
  state.authClient = new AuthClient({
    identityProvider: "https://id.ai/authorize",
    idleOptions: { disableDefaultIdleCallback: true },
  });
  const identity = await state.authClient.getIdentity();
  state.principal = identity.getPrincipal().toText();
  state.isAuthenticated = state.authClient.isAuthenticated();
  state.actor = await createBackendActor(identity);
  await refreshData().catch((error) => {
    state.error = humanError(error);
  });
  render();
}

init().catch((error) => {
  state.error = humanError(error);
  render();
});
