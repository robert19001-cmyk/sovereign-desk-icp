import { execFileSync } from "node:child_process";

const frontendUrl = "https://v7inb-hyaaa-aaaal-qw7aq-cai.icp0.io/";
const frontendId = "v7inb-hyaaa-aaaal-qw7aq-cai";
const backendId = "vyjlv-kaaaa-aaaal-qw7aa-cai";
const splitCanisters = [
  ["vault", "sovereign_desk_vault", "venre-5aaaa-aaaal-qw7ca-cai", "0x08769137ce21c7db11212213fe05ed838299034383b0a2ada6a9e31bba20660c"],
  ["audit", "sovereign_desk_audit", "vdmxq-qyaaa-aaaal-qw7cq-cai", "0xaa47af5bfc40b6986ce80774eb6e226157e1b8ab827bf0ea5f19d7803b6543ce"],
  ["agent", "sovereign_desk_agent", "vkp4m-gqaaa-aaaal-qw7da-cai", "0x1fd09730239dd7ece5d9e7b1da271618429f062904904dcc61b48c3970e5435e"],
];
const expectedBackendHash = "d32ca3c209b2ae9417f2de4f40f3528ed3712070228f23f02a2b7a8d80221fa8";
const expectedFrontendHash = "04e565b3425fe7510ee16b02adcfe3f01abc9a2725c82a21cb08969241debd62";
const protectedController = "7dnyu-motzm-oqehm-762iq-irfd3-taexs-huxbx-z5bdr-4hdjg-j4lih-5ae";

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: "utf8",
    env: {
      ...process.env,
      DFX_WARNING: "-mainnet_plaintext_identity",
    },
    ...options,
  });
}

function dfxOwner(args) {
  return run("dfx", ["--identity", "codex-icp", ...args]);
}

function dfxController(args) {
  return run("dfx", ["--identity", "sovereign-controller", ...args]);
}

function curl(url) {
  return run("curl", ["-fsSL", "-H", "Cache-Control: no-cache", url]);
}

function assert(name, condition, detail = "") {
  if (!condition) {
    throw new Error(`${name} failed${detail ? `: ${detail}` : ""}`);
  }
  return { name, ok: true };
}

const checks = [];

const html = curl(frontendUrl);
checks.push(assert("frontend html", html.includes("<div id=\"app\"></div>")));

const assetPath = html.match(/src="([^"]+\.js)"/)?.[1];
checks.push(assert("frontend asset reference", Boolean(assetPath)));

const js = curl(new URL(assetPath, frontendUrl).toString());
checks.push(assert("frontend points at backend", js.includes(backendId)));
checks.push(assert("frontend uses mainnet network", js.includes("`ic`") || js.includes("\"ic\"")));

const publicDemo = dfxOwner(["canister", "call", "sovereign_desk_backend", "get_public_demo", "--network", "ic"]);
checks.push(assert("public demo has redacted client", publicDemo.includes("Aster Capital room")));
checks.push(assert("public demo hides private email", !publicDemo.includes("marta@example.com")));
checks.push(assert("public demo exposes workflow", publicDemo.includes("Sovereign diligence room")));

const workspace = dfxOwner(["canister", "call", "sovereign_desk_backend", "get_my_workspace", "--network", "ic"]);
checks.push(assert("admin workspace exists", workspace.includes("SovereignDesk AI")));
checks.push(assert("admin sees private client", workspace.includes("Northstar Legal")));
checks.push(assert("admin sees private email", workspace.includes("marta@example.com")));
checks.push(assert("workspace has document records", workspace.includes("reviewer-packet-check.pdf")));
checks.push(assert("workspace has audit", workspace.includes("task.status.updated")));

const accessHistory = dfxOwner(["canister", "call", "sovereign_desk_backend", "list_access_request_history", "--network", "ic"]);
checks.push(assert("access request approved", accessHistory.includes("Approved")));
checks.push(assert("creator email request present", accessHistory.includes("robert19001@gmail.com")));

const myRoles = dfxOwner(["canister", "call", "sovereign_desk_backend", "get_my_roles", "--network", "ic"]);
checks.push(assert("owner role present", myRoles.includes("Owner")));
checks.push(assert("client role derived", myRoles.includes("Client")));

const roleGrants = dfxOwner(["canister", "call", "sovereign_desk_backend", "list_role_grants", "--network", "ic"]);
checks.push(assert("role grant list available", roleGrants.includes("vec")));

const systemInfo = dfxOwner(["canister", "call", "sovereign_desk_backend", "get_system_info", "--network", "ic"]);
checks.push(assert("schema version current", systemInfo.includes("schemaVersion = 5")));
checks.push(assert("system counts available", systemInfo.includes("roleGrants =")));
checks.push(assert("vault counts available", systemInfo.includes("documentVersions =") && systemInfo.includes("encryptedDocumentObjects =")));
checks.push(assert("governance counts available", systemInfo.includes("governanceProposals =")));

const backendStatus = dfxController(["canister", "status", "sovereign_desk_backend", "--network", "ic"]);
checks.push(assert("backend running", backendStatus.includes("Status: Running")));
checks.push(assert("backend module hash", backendStatus.includes(expectedBackendHash)));
checks.push(assert("backend protected controller", backendStatus.includes(protectedController) && !backendStatus.includes("up6xy-uol7y")));

const frontendStatus = dfxController(["canister", "status", "sovereign_desk_frontend", "--network", "ic"]);
checks.push(assert("frontend running", frontendStatus.includes("Status: Running")));
checks.push(assert("frontend module hash", frontendStatus.includes(expectedFrontendHash)));
checks.push(assert("frontend protected controller", frontendStatus.includes(protectedController) && !frontendStatus.includes("up6xy-uol7y")));

checks.push(assert("frontend id in url", frontendUrl.includes(frontendId)));

for (const [label, name, canisterId, moduleHash] of splitCanisters) {
  const configuredId = dfxController(["canister", "id", name, "--network", "ic"]).trim();
  const status = dfxController(["canister", "status", name, "--network", "ic"]);
  checks.push(assert(`${label} canister id`, configuredId === canisterId, configuredId));
  checks.push(assert(`${label} running`, status.includes("Status: Running")));
  checks.push(assert(`${label} module hash`, status.includes(moduleHash)));
  checks.push(assert(`${label} protected controller`, status.includes(protectedController) && !status.includes("up6xy-uol7y")));
}

console.log(JSON.stringify({ checks, count: checks.length }, null, 2));
