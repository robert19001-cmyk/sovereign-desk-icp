import { execFileSync } from "node:child_process";

const backendName = "sovereign_desk_backend";

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

const checks = [
  expectTrap(
    "anonymous seed_demo denied",
    ["--identity", "anonymous", "canister", "call", backendName, "seed_demo", "--network", "ic"],
    "anonymous caller not allowed",
  ),
  expectTrap(
    "approval cannot return to pending",
    [
      "canister",
      "call",
      backendName,
      "respond_approval",
      '(1, variant { Pending }, "Hardening check should fail")',
      "--network",
      "ic",
    ],
    "approval decision cannot be Pending",
  ),
  expectTrap(
    "resolved approval cannot be overwritten",
    [
      "canister",
      "call",
      backendName,
      "respond_approval",
      '(1, variant { Approved }, "Hardening overwrite check should fail")',
      "--network",
      "ic",
    ],
    "approval already resolved",
  ),
  expectTrap(
    "document hash format enforced",
    [
      "canister",
      "call",
      backendName,
      "create_document_record",
      '(1, "bad-hash-check.pdf", "application/pdf", 1000, "vetkd:test", "sha256:notvalid")',
      "--network",
      "ic",
    ],
    "content hash must be sha256:<64 hex>",
  ),
  expectTrap(
    "document version hash format enforced",
    [
      "canister",
      "call",
      backendName,
      "add_document_version",
      '(4, 1000, "vetkd:test", "sha256:notvalid")',
      "--network",
      "ic",
    ],
    "content hash must be sha256:<64 hex>",
  ),
  expectTrap(
    "document verification hash format enforced",
    [
      "canister",
      "call",
      backendName,
      "verify_document_hash",
      '(4, null, "sha256:notvalid")',
      "--network",
      "ic",
    ],
    "content hash must be sha256:<64 hex>",
  ),
];

console.log(JSON.stringify({ checks, count: checks.length }, null, 2));
