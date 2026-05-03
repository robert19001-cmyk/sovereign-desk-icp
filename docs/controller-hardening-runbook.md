# Controller Hardening Runbook

Status: completed for the current mainnet MVP. Move to multisig, SNS, Launchtrail, or equivalent before valuable production data, secrets, user funds, or regulated workloads.

The current mainnet MVP is controlled by the protected `sovereign-controller` principal:

```text
7dnyu-motzm-oqehm-762iq-irfd3-taexs-huxbx-z5bdr-4hdjg-j4lih-5ae
```

The plaintext development identity is no longer a canister controller. Production control should still move to team-grade governance before valuable state is stored.

## Target Controller Model

Choose one controller model before production:

- Hardware-backed identity for a small private beta.
- Passphrase-protected identity held in an offline recovery process.
- Multisig or Launchtrail for team-operated production.
- SNS or equivalent governance when ownership should be public or community-governed.

Do not leave a single-person controller as the final production governance model.

## Pre-Migration Checks

Run from a clean working tree or explicitly record unrelated local changes:

```bash
npm run build
npm audit --omit=dev
npm run qa:hardening
npm run qa:roles
npm run qa:upgrade
```

As maintainer, verify current mainnet status:

```bash
dfx --identity sovereign-controller canister status --network ic sovereign_desk_backend
dfx --identity sovereign-controller canister status --network ic sovereign_desk_frontend
npm run qa:mainnet
npm run qa:product
```

Record:

- frontend canister ID;
- backend canister ID;
- current controllers;
- module hashes;
- cycle balances;
- schema version;
- state snapshot export hash, if available.

## Migration Steps

1. Create or select the protected controller identity.
2. Verify the principal out of band and record it in the release notes.
3. Add the protected controller to both canisters.
4. Verify both canisters list the protected controller.
5. Perform a no-op or low-risk status check with the protected identity.
6. Remove the plaintext development controller only after the protected identity can deploy, inspect status, and recover.
7. Re-run maintainer-only mainnet QA.
8. Update README, SECURITY, reproducible build notes, and release notes with the new controller model.

Use exact `dfx canister update-settings` commands only after the target principal has been independently verified. A wrong controller update can lock maintainers out.

## Rollback And Recovery

Before removing the old controller, prove that the new controller can:

- inspect both canister statuses;
- deploy or upgrade in a controlled test;
- access owner-only backend verification calls;
- export or verify state snapshot data;
- top up cycles or operate through the chosen governance process.

If any verification fails, keep the old controller temporarily and resolve the protected identity setup before continuing.

## Production Exit Criteria

Controller hardening is complete only when:

- plaintext development identity is not the sole controller;
- controller ownership and recovery process are documented;
- release checklist includes controller verification;
- maintainer-only mainnet QA passes after migration;
- SECURITY.md no longer lists plaintext controller ownership as an active P0 limitation.
