# SovereignDesk Release Test Plan

Date: 2026-05-03

## Scope

This plan covers the current ICP mainnet MVP and the hardening path toward a production beta. The current deployment is a public review target, not an environment for real confidential client data.

Mainnet targets:

- Frontend: `v7inb-hyaaa-aaaal-qw7aq-cai`
- Backend: `vyjlv-kaaaa-aaaal-qw7aa-cai`
- App URL: `https://v7inb-hyaaa-aaaal-qw7aq-cai.icp0.io/`

## Must-Pass Local Checks

Run before release preparation:

```bash
npm run build
npm audit --omit=dev
npm run qa:hardening
npm run qa:roles
npm run qa:upgrade
```

Required result:

- Build passes.
- Production dependency audit has zero vulnerabilities.
- Backend hardening checks reject unsafe Candid/API calls.
- Role checks expose owner/client roles and reject unsafe role mutations.
- Upgrade checks expose schema version and verify owner-only snapshot export.

## Maintainer-Only Mainnet Checks

Run only when intentionally validating the live deployment:

```bash
npm run qa:mainnet
npm run qa:product
```

Required result:

- Desktop and mobile Playwright smoke test has no serious browser logs.
- Product health passes all checks.
- Frontend Trust Center module hashes match canister status.
- Public demo hides private client PII.

## Core Release Journeys

### Public Reviewer

- Open the mainnet app.
- Confirm headline and reviewer flow render on desktop and mobile.
- Confirm creator contact is visible.
- Confirm private client email is not visible.
- Confirm Trust Center exposes frontend/backend canister IDs and module hashes.

### Operator Login

- Log in with Internet Identity.
- Confirm approved operator principal lands in app mode.
- Confirm workspace data loads from backend.
- Confirm app navigation separates dashboard, access, operate, workspace, and trust.

### Workspace Operation

- Create or update a task.
- Change task status.
- Create approval request.
- Respond to approval once.
- Add note.
- Select a file and confirm browser SHA-256 metadata write.
- Refresh and confirm the new events persist.

### Access Control

- Anonymous user can only access public demo.
- Non-approved signed user can request access but cannot operate workspace.
- Approved operator can work inside allowed scope.
- Client principal can only read client portal scope.
- Owner/admin can approve access requests.

### Trust and Audit

- Audit timeline records every mutation.
- Audit does not expose private content in public view.
- Product health sees expected backend/frontend module hashes.
- Candid UI can query public demo and owner workspace with expected principal.

## Manual Visual QA

Check at minimum:

- 1440px desktop.
- 390px mobile.
- No horizontal overflow.
- Buttons and inputs remain readable.
- Loading states do not block navigation permanently.
- Focus outline is visible.
- Animations do not hide content or make flows unclear.

## Maintainer Mainnet QA

`npm run qa:mainnet` and `npm run qa:product` are maintainer release checks against the deployed mainnet app and backend canisters. They require network access and the current deployed IDs, so CI keeps to deterministic build, audit, and documentation checks. Mainnet screenshots from routine checks are written under `docs/qa/screenshots/current/`; selected release screenshots can be promoted manually.

Do not push, tag, deploy, or update controllers as part of QA. Follow [../release-checklist.md](../release-checklist.md) and [../controller-hardening-runbook.md](../controller-hardening-runbook.md) when those operations are explicitly requested.

## P0 Regression Gates

Do not deploy if any of these fail:

- Public view leaks private client email or note body.
- Frontend points to the wrong backend canister.
- Mainnet build uses local network config.
- Approval can be changed after final decision.
- Non-role principal can mutate private workspace.
- Trust Center hash does not match deployed canister.

## Next Test Coverage To Add

- Candid/API role tests for anonymous, non-role, operator, client, owner.
- Approval state machine tests.
- Document hash validation tests.
- Upgrade-with-state fixture.
- Access revoke/rotation tests.
