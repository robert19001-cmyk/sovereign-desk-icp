# Release Checklist

Status: maintainer runbook. This document prepares a release; it does not authorize pushing or deploying by itself.

## Repository Hygiene

- Confirm `git status --short` and identify unrelated work before editing.
- Keep generated local canister files out of git.
- Keep routine QA screenshots in `docs/qa/screenshots/current/`.
- Promote only selected release screenshots to stable paths under `docs/qa/screenshots/`.
- Remove stale references to old local canister IDs, local screenshots, or one-off machine paths.
- Do not commit secrets, private client data, `.env`, `.dfx/`, or node modules.

## Local Release Gate

Run:

```bash
npm run build
npm audit --omit=dev
npm run qa:hardening
npm run qa:roles
npm run qa:upgrade
```

Required result:

- frontend build passes;
- production dependency audit is clean or documented with an explicit maintainer decision;
- hardening checks reject unsafe backend calls;
- role checks prove unsafe role mutation is rejected;
- upgrade checks verify schema version and owner-only state snapshot export.

## Maintainer-Only Mainnet QA

Run only when intentionally validating the live deployment:

```bash
npm run qa:mainnet
npm run qa:product
```

These checks depend on network access, deployed mainnet canister IDs, and live canister status. They are not generic contributor tests and should not be required for every local edit.

Verify:

- app loads from the expected frontend canister;
- frontend points to the expected backend canister;
- Trust Center canister IDs and module hashes match mainnet status;
- public demo hides private client PII and raw principals;
- serious browser console errors are absent on desktop and mobile;
- generated screenshots are written under `docs/qa/screenshots/current/`.

## Documentation Gate

Before tagging or publishing a release, update:

- README production status and command sections;
- SECURITY current posture, known limitations, and controller model;
- ROADMAP phase status;
- `docs/reproducible-build.md` canister IDs, controllers, and hashes;
- demo script if public review steps changed;
- selected release screenshot references.

## No Push Or Deploy By Default

Do not push, tag, or deploy from cleanup work. A maintainer must explicitly request push/deploy and confirm:

- target branch;
- commit scope;
- release version or tag;
- canister network;
- controller identity;
- rollback plan.

If any P0 gate fails, stop release preparation and document the failure instead of pushing.
