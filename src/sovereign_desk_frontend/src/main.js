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
  controller: "up6xy-uol7y-xisiv-3oron-gl7d3-usnrr-r5ong-hiqu2-hnd2h-cufv3-pqe",
  backendModuleHash: "0x3a0e51127ce0070247c44ff77e7b91b2d998dc8239e9474b0ddd4b133564a42d",
  frontendModuleHash: "0x04e565b3425fe7510ee16b02adcfe3f01abc9a2725c82a21cb08969241debd62",
  governance: "Single developer controller; next step is hardware-backed identity, multisig, or SNS.",
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
  operatorAccess: false,
  clientPortalAccess: false,
  accessMode: "public",
  workspaceView: null,
  portalView: null,
  accessRequests: [],
  agentResponse: null,
  loading: false,
  error: "",
  notice: "",
};

const app = document.querySelector("#app");

function isLocal() {
  return DFX_NETWORK !== "ic" || window.location.hostname.includes("localhost") || window.location.hostname === "127.0.0.1";
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

function metric(label, value, hint) {
  return `
    <article class="metric">
      <span>${e(label)}</span>
      <strong>${e(value)}</strong>
      <p>${e(hint)}</p>
    </article>
  `;
}

function currentClient(view) {
  return view?.clients?.[0] || null;
}

function currentProject(view) {
  return view?.projects?.[0] || null;
}

function currentApproval(view) {
  return view?.approvals?.find((item) => variantName(item.status) === "Pending") || view?.approvals?.[0] || null;
}

function accessLabel() {
  if (state.operatorAccess) return "Operator access active";
  if (state.clientPortalAccess) return "Client portal active";
  if (state.isAuthenticated) return "Signed read-only";
  return "Public read-only";
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

function renderProofStrip(view) {
  const client = currentClient(view);
  const project = currentProject(view);
  const pendingApprovals = view?.approvals?.filter((item) => variantName(item.status) === "Pending").length || 0;
  const openTasks = view?.tasks?.filter((task) => variantName(task.status) !== "Done").length || 0;

  return `
    <section id="overview" class="proof-strip" aria-label="Canister proof">
      ${metric("Network", "ICP", "Public mainnet deployment")}
      ${metric("Canister", shortPrincipal(BACKEND_CANISTER_ID), "Backend state source")}
      ${metric("Client", client?.name || "Ready", project?.name || "No project loaded")}
      ${metric("Workflow", `${openTasks}/${pendingApprovals}`, "Open tasks / pending approvals")}
    </section>
  `;
}

function renderHero(view) {
  const project = currentProject(view);
  const authenticatedCopy = state.operatorAccess
    ? `Operator access active as ${shortPrincipal(state.principal)}`
    : state.clientPortalAccess
      ? `Client portal active as ${shortPrincipal(state.principal)}. Approval responses write to the canister.`
      : state.isAuthenticated
      ? `Signed in as ${shortPrincipal(state.principal)}. This principal is not an operator yet, so writes stay locked.`
      : "Public read-only showcase. Login identifies your principal and unlocks operator tools after admin approval.";

  return `
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy">
        <div class="brand-row">
          <span class="canister-mark" aria-hidden="true"></span>
          <span>SovereignDesk on Internet Computer</span>
        </div>
        <h1 id="hero-title">Client operations, approvals, and AI work logs running from canisters.</h1>
        <p class="hero-lede">${e(project?.summary || "A sovereign client portal for high-trust teams: no external database, no centralized hosting layer, no hidden admin panel.")}</p>
        <div class="hero-actions">
          ${state.isAuthenticated ? `
            <button type="button" data-action="refresh">Refresh state</button>
            <button type="button" data-action="logout" class="secondary">Logout</button>
          ` : `
            <button type="button" data-action="login">Login with Internet Identity</button>
            <a class="button secondary" href="https://dashboard.internetcomputer.org/canister/${e(BACKEND_CANISTER_ID)}" target="_blank" rel="noreferrer">Inspect canister</a>
          `}
        </div>
        <p class="identity-line">${e(authenticatedCopy)}</p>
      </div>
      <div class="signal-panel" aria-label="Deployment signal">
        <div class="signal-orbit" aria-hidden="true">
          <span></span><span></span><span></span><span></span>
        </div>
        <dl>
          <div><dt>Frontend</dt><dd>Asset canister</dd></div>
          <div><dt>Backend</dt><dd>${e(shortPrincipal(BACKEND_CANISTER_ID))}</dd></div>
          <div><dt>Access</dt><dd>${e(accessLabel())}</dd></div>
          <div><dt>State</dt><dd>Motoko persistent actor</dd></div>
        </dl>
      </div>
    </section>
  `;
}

function renderWorkflow(view) {
  const client = currentClient(view);
  const project = currentProject(view);
  const tasks = (view?.tasks || []).map((task) => `
    <li>
      <div>
        <strong>${e(task.title)}</strong>
        <span>${e(task.assignee)} lane</span>
      </div>
      ${statusPill(task.status)}
    </li>
  `).join("");

  return `
    <section id="clients" class="section-grid">
      <article class="surface project-surface">
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

      <article id="portal" class="surface portal-surface">
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
      <strong>${e(event.summary)}</strong>
      <small>${e(event.target || shortPrincipal(event.actorPrincipal))}</small>
    </li>
  `).join("");

  return `
    <section class="section-grid">
      <article id="agent" class="surface agent-surface">
        <div class="section-heading">
          <span>AI Employee</span>
          <h2>Human-approved operating brief</h2>
        </div>
        <p class="agent-copy">${e(state.agentResponse?.answer || "The AI Employee summarizes canister state into client-ready next steps. Write access is restricted to authenticated operators.")}</p>
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

      <article id="audit" class="surface audit-surface">
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
    <section id="architecture" class="architecture">
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
  return `
    <section id="trust" class="trust-center">
      <div class="section-heading">
        <span>Trust Center</span>
        <h2>Trust Center for ICP reviewers.</h2>
      </div>
      <div class="trust-grid">
        <article>
          <span>Frontend canister</span>
          <strong>${e(FRONTEND_CANISTER_ID)}</strong>
          <a href="https://dashboard.internetcomputer.org/canister/${e(FRONTEND_CANISTER_ID)}" target="_blank" rel="noreferrer">Open dashboard</a>
        </article>
        <article>
          <span>Backend canister</span>
          <strong>${e(BACKEND_CANISTER_ID)}</strong>
          <a href="https://dashboard.internetcomputer.org/canister/${e(BACKEND_CANISTER_ID)}" target="_blank" rel="noreferrer">Open dashboard</a>
        </article>
        <article>
          <span>Controller</span>
          <strong>${e(shortPrincipal(TRUST.controller))}</strong>
          <p>${e(TRUST.governance)}</p>
        </article>
        <article>
          <span>Backend module hash</span>
          <code>${e(TRUST.backendModuleHash)}</code>
        </article>
        <article>
          <span>Asset canister module</span>
          <code>${e(TRUST.frontendModuleHash)}</code>
        </article>
        <article>
          <span>Verify locally</span>
          <code>${e(statusCommand)}</code>
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
    </section>
  `;
}

function renderCreatorSignal() {
  return `
    <section id="creator" class="creator-signal">
      <div class="creator-copy">
        <div class="section-heading">
          <span>Creator signal</span>
          <h2>Built by ${e(CREATOR.name)} to prove useful canister-native products can ship fast.</h2>
        </div>
        <p>
          SovereignDesk is a public, inspectable ICP mainnet app: Motoko state, certified asset delivery,
          Internet Identity writes, role-aware portals, and a security-conscious public demo surface.
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
        <div><dt>Controller principal</dt><dd>${e(shortPrincipal(CREATOR.principal))}</dd></div>
      </dl>
    </section>
  `;
}

function renderRoadmap() {
  const items = [
    ["Owner identity hardening", "Move controller rights from plaintext dev identity to a hardware-backed or passphrase-protected controller."],
    ["Real onboarding", "Invite a client by principal, bind their Internet Identity, and show only their portal."],
    ["Encrypted vault", "Add certified document metadata now, then vetKeys for client-side encrypted keys."],
    ["Agent canister split", "Move AI work logs into a dedicated agent canister with explicit human approval."],
    ["Payments", "Add ckBTC/ckUSDC invoice approval and settlement flow after the portal is stable."],
  ];
  return `
    <section id="roadmap" class="roadmap">
      <div class="section-heading">
        <span>Next upgrades</span>
        <h2>The path from impressive demo to serious ICP product.</h2>
      </div>
      <ol>
        ${items.map(([title, body]) => `<li><strong>${e(title)}</strong><span>${e(body)}</span></li>`).join("")}
      </ol>
    </section>
  `;
}

function renderOperatorConsole(view) {
  if (!state.operatorAccess) {
    return "";
  }
  const client = currentClient(view);
  const project = currentProject(view);
  const requests = (state.accessRequests || []).map((request) => {
    const principal = principalText(request.principal);
    return `
      <li>
        <div>
          <strong>${e(request.email)}</strong>
          <span>${e(request.note)}</span>
          <code>${e(principal)}</code>
        </div>
        <div class="request-actions">
          <button type="button" data-action="approve-access-request" data-request-id="${e(natText(request.id))}" data-principal="${e(principal)}">Grant admin</button>
          <button type="button" class="secondary" data-action="reject-access-request" data-request-id="${e(natText(request.id))}">Reject</button>
        </div>
      </li>
    `;
  }).join("");

  return `
    <section id="operate" class="operator-console">
      <div class="section-heading">
        <span>Operator console</span>
        <h2>Write real state to the canister</h2>
      </div>
      <article class="surface access-queue">
        <div class="section-heading">
          <span>Access queue</span>
          <h3>On-chain operator requests</h3>
        </div>
        <ul>${requests || "<li><div><strong>No pending requests</strong><span>Signed-in visitors can request operator review from the access panel.</span></div></li>"}</ul>
      </article>
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
      </div>
    </section>
  `;
}

function renderPortalDetail(view) {
  if ((!state.operatorAccess && !state.clientPortalAccess) || !view) return "";
  const documents = (view.documents || []).map((doc) => `
    <div>
      <strong>${e(doc.name)}</strong>
      <span>${e(natText(doc.sizeBytes))} bytes · ${e(doc.contentHash || "hash pending")}</span>
    </div>
  `).join("");
  const notes = (view.notes || []).map((note) => `
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
    </section>
  `;
}

function renderAccessPanel() {
  if (!state.isAuthenticated) {
    return "";
  }
  if (state.clientPortalAccess && !state.operatorAccess) {
    return `
      <section class="access-panel client-ready" id="access">
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
    return `
      <section class="access-panel operator-ready">
        <div>
          <span class="pill live">Operator</span>
          <h2>Write access is active for this Internet Identity.</h2>
          <p>Approvals, client records, tasks, notes, and AI work logs can now write directly to the backend canister.</p>
        </div>
        <button type="button" data-action="refresh" class="secondary">Refresh canister state</button>
      </section>
    `;
  }
  const addCommand = `dfx canister call sovereign_desk_backend add_admin '(principal "${state.principal}")' --network ic`;
  return `
    <section class="access-panel access-locked" id="access">
      <div>
        <span class="pill waiting">Read-only after login</span>
        <h2>You are signed in, but this principal is not an operator yet.</h2>
        <p>The app keeps showing the live public demo instead of breaking. To unlock writes, add this Internet Identity principal as an admin from the controller identity.</p>
      </div>
      <div class="principal-box">
        <span>Your Internet Identity principal</span>
        <code>${e(state.principal)}</code>
      </div>
      <div class="command-box">
        <span>Controller command</span>
        <code>${e(addCommand)}</code>
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

function render() {
  const view = state.workspaceView;
  app.innerHTML = `
    <a class="skip-link" href="#main">Skip to workspace</a>
    <div class="app-shell">
      <header class="top-nav">
        <a class="wordmark" href="#main" aria-label="SovereignDesk home">
          <span class="canister-mark" aria-hidden="true"></span>
          <strong>SovereignDesk</strong>
        </a>
        <nav aria-label="Primary">
          <a href="#overview">Proof</a>
          <a href="#clients">Workspace</a>
          <a href="#agent">AI</a>
          <a href="#architecture">Architecture</a>
          <a href="#trust">Trust</a>
          ${state.operatorAccess ? '<a href="#operate">Operate</a>' : state.isAuthenticated ? '<a href="#access">Access</a>' : ""}
        </nav>
      </header>

      <main id="main">
        ${state.error ? `<div class="message error">${e(state.error)}</div>` : ""}
        ${state.notice ? `<div class="message">${e(state.notice)}</div>` : ""}
        ${state.loading ? `<div class="message working">Working with the canister...</div>` : ""}
        ${view ? `
          ${renderHero(view)}
          ${renderAccessPanel()}
          ${renderProofStrip(view)}
          ${renderWorkflow(view)}
          ${renderAgentAndAudit(view)}
          ${renderCapabilities(view)}
          ${renderTrustCenter()}
          ${renderCreatorSignal()}
          ${renderRoadmap()}
          ${renderOperatorConsole(view)}
          ${renderPortalDetail(state.portalView)}
        ` : renderEmpty()}
      </main>
    </div>
  `;
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
  state.operatorAccess = false;
  state.clientPortalAccess = false;
  state.accessMode = state.isAuthenticated ? "signed-readonly" : "public";

  if (state.isAuthenticated) {
    const privateView = await state.actor.get_my_workspace();
    if (privateView.length) {
      state.workspaceView = privateView[0];
      state.operatorAccess = true;
      state.accessMode = "operator";
      state.accessRequests = await state.actor.list_access_requests();
    } else {
      const portals = await state.actor.get_my_client_portals();
      if (portals.length) {
        state.portalView = portals[0];
        state.workspaceView = portalToWorkspaceView(portals[0]);
        state.clientPortalAccess = true;
        state.accessMode = "client-portal";
      } else {
        const publicView = await state.actor.get_public_demo();
        state.workspaceView = publicView.length ? publicView[0] : null;
      }
    }
  } else {
    const publicView = await state.actor.get_public_demo();
    state.workspaceView = publicView.length ? publicView[0] : null;
  }

  if (state.operatorAccess && state.workspaceView?.clients?.[0]) {
    const portal = await state.actor.get_client_portal(state.workspaceView.clients[0].id);
    state.portalView = portal.length ? portal[0] : null;
  } else if (!state.clientPortalAccess) {
    state.portalView = null;
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

app.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  if (action === "login") login();
  if (action === "logout") logout();
  if (action === "refresh") withBusy(refreshData);
  if (action === "copy-principal") withBusy(async () => {
    await navigator.clipboard.writeText(state.principal);
    state.notice = "Principal copied. Add it as an admin from the controller identity to unlock operator tools.";
  });
  if (action === "approve-access-request") withBusy(async () => {
    if (!state.operatorAccess) throw new Error("caller is not an admin");
    await state.actor.approve_access_request(nat(button.dataset.requestId));
    await refreshData();
    state.notice = "Admin access granted to requested principal.";
  });
  if (action === "reject-access-request") withBusy(async () => {
    if (!state.operatorAccess) throw new Error("caller is not an admin");
    await state.actor.reject_access_request(nat(button.dataset.requestId), "Rejected from SovereignDesk operator console.");
    await refreshData();
    state.notice = "Access request rejected and recorded in the audit trail.";
  });
  if (action === "seed") withBusy(async () => {
    if (!state.operatorAccess && state.workspaceView) throw new Error("caller is not an admin");
    state.workspaceView = await state.actor.seed_demo();
    await refreshData();
    state.notice = "Demo workspace seeded in the backend canister.";
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
    if (!state.operatorAccess) throw new Error("caller is not an admin");
    if (action === "ask-agent") {
      state.agentResponse = await state.actor.ask_agent("project:1", String(data.prompt || "Summarize next steps"));
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
