import { execFileSync } from "node:child_process";

const backendName = "sovereign_desk_backend";
const expectedSchemaVersion = "2";

function runDfx(args) {
  return execFileSync("dfx", args, {
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

const snapshot = runDfx(["canister", "call", backendName, "export_state_snapshot", "--network", "ic"]);
checks.push(assert("owner snapshot export works", snapshot.includes(`schemaVersion = ${expectedSchemaVersion}`), snapshot.slice(0, 240)));
checks.push(assert("snapshot includes workspace", snapshot.includes("workspace = opt record"), snapshot.slice(0, 240)));
checks.push(assert("snapshot includes next ids", snapshot.includes("nextWorkspaceId") && snapshot.includes("nextAccessRequestId"), snapshot.slice(0, 240)));

checks.push(expectTrap(
  "anonymous snapshot denied",
  ["--identity", "anonymous", "canister", "call", backendName, "export_state_snapshot", "--network", "ic"],
  "anonymous caller not allowed",
));

console.log(JSON.stringify({ checks, count: checks.length }, null, 2));
