import { execFileSync } from "node:child_process";

const backendName = "sovereign_desk_backend";
const expectedSchemaVersion = "5";

function runDfx(args) {
  const fullArgs = args[0] === "--identity" ? args : ["--identity", "codex-icp", ...args];
  return execFileSync("dfx", fullArgs, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      DFX_WARNING: "-mainnet_plaintext_identity",
    },
  });
}

function assert(name, condition, detail = "") {
  if (!condition) {
    throw new Error(`${name} failed${detail ? `: ${detail}` : ""}`);
  }
  return { name, ok: true };
}

function expectTrap(name, args, expectedMessage) {
  try {
    runDfx(args);
  } catch (error) {
    const output = `${error.stdout || ""}\n${error.stderr || ""}`;
    if (output.includes(expectedMessage)) {
      return { name, ok: true };
    }
    throw new Error(`${name} trapped with unexpected output:\n${output}`);
  }
  throw new Error(`${name} unexpectedly succeeded`);
}

const checks = [];

const systemInfo = runDfx(["canister", "call", backendName, "get_system_info", "--network", "ic"]);
checks.push(assert("schema version exposed", systemInfo.includes(`schemaVersion = ${expectedSchemaVersion}`), systemInfo));
checks.push(assert("workspace initialized", systemInfo.includes("workspaceInitialized = true"), systemInfo));
checks.push(assert("state counts exposed", systemInfo.includes("clients =") && systemInfo.includes("roleGrants ="), systemInfo));
checks.push(assert("vault counts exposed", systemInfo.includes("documentVersions =") && systemInfo.includes("encryptedDocumentObjects ="), systemInfo));
checks.push(assert("governance counts exposed", systemInfo.includes("governanceProposals ="), systemInfo));

const snapshot = runDfx(["canister", "call", backendName, "export_state_snapshot", "--network", "ic"]);
checks.push(assert("owner snapshot export works", snapshot.includes(`schemaVersion = ${expectedSchemaVersion}`), snapshot.slice(0, 240)));
checks.push(assert("snapshot includes workspace", snapshot.includes("workspace = opt record"), snapshot.slice(0, 240)));
checks.push(assert("snapshot includes next ids", snapshot.includes("nextWorkspaceId") && snapshot.includes("nextAccessRequestId"), snapshot.slice(0, 240)));
checks.push(assert("snapshot includes vault state", snapshot.includes("encryptedDocumentObjects =") && snapshot.includes("nextEncryptedDocumentObjectId"), snapshot.slice(0, 400)));
checks.push(assert("snapshot includes governance state", snapshot.includes("governanceProposals =") && snapshot.includes("nextGovernanceProposalId"), snapshot.slice(0, 400)));

checks.push(expectTrap(
  "anonymous snapshot denied",
  ["--identity", "anonymous", "canister", "call", backendName, "export_state_snapshot", "--network", "ic"],
  "anonymous caller not allowed",
));

console.log(JSON.stringify({ checks, count: checks.length }, null, 2));
