import { execFileSync } from "node:child_process";

const backendName = "sovereign_desk_backend";
const ownerPrincipal = "up6xy-uol7y-xisiv-3oron-gl7d3-usnrr-r5ong-hiqu2-hnd2h-cufv3-pqe";

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

const roles = runDfx(["canister", "call", backendName, "get_my_roles", "--network", "ic"]);
checks.push(assert("owner role exposed", roles.includes("Owner")));
checks.push(assert("client role derived", roles.includes("Client")));

const grants = runDfx(["canister", "call", backendName, "list_role_grants", "--network", "ic"]);
checks.push(assert("governance can list direct grants", grants.includes("vec")));

checks.push(expectTrap(
  "anonymous cannot grant role",
  [
    "--identity",
    "anonymous",
    "canister",
    "call",
    backendName,
    "grant_role",
    `(principal "${ownerPrincipal}", variant { Operator }, null)`,
    "--network",
    "ic",
  ],
  "anonymous caller not allowed",
));

checks.push(expectTrap(
  "owner role cannot be granted",
  [
    "canister",
    "call",
    backendName,
    "grant_role",
    `(principal "${ownerPrincipal}", variant { Owner }, null)`,
    "--network",
    "ic",
  ],
  "owner role cannot be granted",
));

checks.push(expectTrap(
  "client role requires clientId",
  [
    "canister",
    "call",
    backendName,
    "grant_role",
    `(principal "${ownerPrincipal}", variant { Client }, null)`,
    "--network",
    "ic",
  ],
  "client role requires clientId",
));

checks.push(expectTrap(
  "missing revoke rejected",
  [
    "canister",
    "call",
    backendName,
    "revoke_role",
    `(principal "${ownerPrincipal}", variant { Reviewer }, null)`,
    "--network",
    "ic",
  ],
  "role grant not found",
));

console.log(JSON.stringify({ checks, count: checks.length }, null, 2));
