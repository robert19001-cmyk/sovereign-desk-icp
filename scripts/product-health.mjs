import { execFileSync } from "node:child_process";

const frontendUrl = "https://v7inb-hyaaa-aaaal-qw7aq-cai.icp0.io/";
const frontendId = "v7inb-hyaaa-aaaal-qw7aq-cai";
const backendId = "vyjlv-kaaaa-aaaal-qw7aa-cai";
const expectedBackendHash = "4aae46ec17aa03ab3d5483fb3841ab378102c8e57341b24c663d754491d8ae07";
const expectedFrontendHash = "04e565b3425fe7510ee16b02adcfe3f01abc9a2725c82a21cb08969241debd62";

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
  return run("curl", ["-fsSL", url]);
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
checks.push(assert("schema version current", systemInfo.includes("schemaVersion = 4")));
checks.push(assert("system counts available", systemInfo.includes("roleGrants =")));
checks.push(assert("vault counts available", systemInfo.includes("documentVersions =") && systemInfo.includes("documentHashVerifications =")));

const backendStatus = dfxController(["canister", "status", "sovereign_desk_backend", "--network", "ic"]);
checks.push(assert("backend running", backendStatus.includes("Status: Running")));
checks.push(assert("backend module hash", backendStatus.includes(expectedBackendHash)));
checks.push(assert("backend protected controller", backendStatus.includes("7dnyu-motzm-oqehm-762iq-irfd3-taexs-huxbx-z5bdr-4hdjg-j4lih-5ae") && !backendStatus.includes("up6xy-uol7y")));

const frontendStatus = dfxController(["canister", "status", "sovereign_desk_frontend", "--network", "ic"]);
checks.push(assert("frontend running", frontendStatus.includes("Status: Running")));
checks.push(assert("frontend module hash", frontendStatus.includes(expectedFrontendHash)));
checks.push(assert("frontend protected controller", frontendStatus.includes("7dnyu-motzm-oqehm-762iq-irfd3-taexs-huxbx-z5bdr-4hdjg-j4lih-5ae") && !frontendStatus.includes("up6xy-uol7y")));

checks.push(assert("frontend id in url", frontendUrl.includes(frontendId)));

console.log(JSON.stringify({ checks, count: checks.length }, null, 2));
