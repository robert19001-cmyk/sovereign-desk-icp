# SovereignDesk Product Audit and Production Plan

Date: 2026-05-03

## Current Status

SovereignDesk is a live ICP mainnet MVP with:

- ICP asset canister frontend.
- Motoko backend canister with persistent state.
- Internet Identity login.
- Public redacted reviewer flow.
- Private workspace read model for admins.
- Client portal access model.
- Access requests and admin approval.
- Tasks, approvals, document metadata, notes, audit events.
- Local browser file hashing before document metadata write.
- Trust Center with canister IDs and module hashes.
- Mainnet QA and product health checks.

Production status: suitable for public review and technical validation only. Do not use it for real confidential client data until controller hardening and private-data encryption are complete.

Mainnet:

- Frontend: `v7inb-hyaaa-aaaal-qw7aq-cai`
- Backend: `vyjlv-kaaaa-aaaal-qw7aa-cai`

Local validation:

- `npm run build`
- `npm run qa:hardening`
- `npm run qa:roles`

Maintainer-only mainnet validation:

- `npm run qa:mainnet`
- `npm run qa:product`

Latest deployed hardening:

- Backend module hash: `0xa7d5a990620fcf61baa358abd574acf7563ba81b12f5fec5f7ffa7479e4554ed`
- Production bootstrap now requires the configured bootstrap owner.
- `seed_demo` requires admin when a workspace already exists.
- Approval responses cannot use `Pending` as a decision.
- Resolved approvals cannot be overwritten.
- Document records require `sha256:<64 hex>` content hashes.
- New audit events redact access request emails, note bodies, approval comments, and document names in audit summaries.
- `npm run qa:hardening` verifies unsafe Candid/API calls are rejected.
- Role & Access v1 is deployed:
  - `get_my_roles` exposes derived Owner/Client roles and direct grants.
  - `list_role_grants` exposes direct grants to governance.
  - `grant_role` and `revoke_role` manage direct role grants.
  - `rotate_client_principal` rotates client portal access and records the client role.
  - Access approvals now grant `Operator` role, not full admin semantics.
  - Access request review is governance-only.
  - Legacy `admins` continue as operator access for existing users so live access is not broken.
  - Product health verifies Owner/Client role exposure and role grant listing.
  - `npm run qa:roles` verifies role visibility and unsafe role mutation traps.
- Upgrade safety v1 is deployed:
  - `get_system_info` exposes schema version, owner, initialization state, and state counts.
  - `export_state_snapshot` provides owner-only state export for recovery/review.
  - `npm run qa:upgrade` verifies schema version, snapshot export, and anonymous denial.

## Audit Summary

No P0 was found for the current public MVP if it is not used for real confidential client data.

For production with real clients, the current remaining P0 risks are:

- Single-controller developer identity controls both canisters.
- Private client data is plaintext in canister state.

Recently reduced risks:

- Fresh deploy bootstrap is now restricted to the configured bootstrap owner.
- Approval decisions are now final once resolved.
- RBAC is no longer purely flat: Owner/Admin/Operator/Client/Reviewer role types exist and new operator approvals do not grant full admin semantics.
- `seed_demo` is admin-gated after initialization and no longer lets an arbitrary caller reseed an existing workspace.
- Upgrade safety exposes schema version and owner-only state snapshots.

## P0 Before Real Production Data

1. Controller hardening
   - Move controller rights away from plaintext dev identity.
   - Use hardware-backed/passphrase identity, Launchtrail, multisig, or SNS.
   - Follow [controller-hardening-runbook.md](controller-hardening-runbook.md) for upgrade and recovery requirements.

2. Controlled bootstrap
   - Remove or feature-flag `seed_demo` on production deployments.
   - Keep explicit owner principal during initialization.
   - Add a release check that blocks demo seed endpoints in production mode.

3. Role model completion
   - Add UI selectors for multiple clients/projects instead of defaulting to the first record.
   - Add integration tests for Owner/Admin/Operator/Client/Reviewer access.
     - Client
     - Reviewer
   - Make `add_admin` owner-only.
   - Make access approvals grant least-privilege roles.

4. Approval state machine
   - Replace user input `ApprovalStatus` with `ApprovalDecision`.
   - Allow approve/reject only from `Pending`.
   - Prevent overwriting final decisions.
   - Store decision events append-only.

5. Sensitive data policy
   - Do not store real PII or client documents as plaintext.
   - Encrypt sensitive fields client-side before canister write.
   - Keep public proof separate from private vault data.

## P1 Beta Product Work

1. Access and onboarding
   - Client invite by Internet Identity principal.
   - Client principal rotation.
   - Operator role approval from owner/admin.
   - Access request history visible in operator UI.

2. Workspace model
   - Move from arrays to indexed structures.
   - Add pagination for tasks, audit, notes, documents.
   - Add workspace/project/client IDs to all relevant views.
   - Add archive/close flows.

3. Document workflow
   - Keep browser SHA-256 hashing.
   - Validate `sha256:<64 hex>` backend-side.
   - Normalize MIME and file names.
   - Add storage canister or certified blob store.
   - Add encrypted document metadata and retrieval.

4. Audit model
   - Stop storing full business text inside audit summaries.
   - Store actor, action, target ID, timestamp, and redacted summary.
   - Add filtered audit views by project/client.
   - Add exportable audit report.

5. Trust Center automation
   - Generate module hashes from release pipeline.
   - Fail product health check if frontend Trust Center hash mismatches canister status.
   - Add signed release manifest.

## P2 Production Readiness

1. Upgrade safety
   - Add `schemaVersion`.
   - Add migration tests.
   - Add local upgrade fixture with non-empty state.
   - Add admin-only export/snapshot.

2. Test coverage
   - Anonymous denied tests.
   - Signed non-role denied tests.
   - Client scoped access tests.
   - Operator allowed tests.
   - Owner-only governance tests.
   - Approval final-state tests.
   - Document hash validation tests.

3. Observability
   - Cycles status in UI.
   - Canister status monitor.
   - Error event tracking via canister audit events.
   - Release checklist.

4. Certified public proof
   - Mark current public proof as query/read model.
   - Add certified variables or certified release/proof endpoint.

## Target Product Architecture

Phase 1: Single-canister hardened beta

- One Motoko backend.
- Asset frontend.
- Explicit roles.
- Safer approval state.
- Redacted audit.
- Document hash metadata only.
- Strong QA.

Phase 2: Multi-canister production

- Workspace canister: clients, projects, tasks, approvals.
- Vault canister: encrypted document metadata and blob references.
- Audit/proof canister: append-only event log and public certified proof.
- AI service canister: AI briefs and human approval events.
- Billing canister: ckBTC/ckUSDC invoices after core flows are stable.

Phase 3: Governed product

- Hardware/multisig/SNS control.
- Release manifests.
- Upgrade runbooks.
- Customer onboarding playbook.
- Public security and architecture docs.

## Product Roadmap From Here

## Execution Plan A-Z

This is the concrete build order from current mainnet MVP to a product that can be safely shown, operated, and then hardened for real clients.

### A. Freeze the Public MVP Baseline

Outcome: the public app remains live and verifiable while hardening work continues.

- Keep the current mainnet frontend and backend canister IDs stable.
- Keep `npm run qa:mainnet` and `npm run qa:product` green during maintainer release validation.
- Keep public data redacted and product-like.
- Do not add real confidential client data until the private-data milestone is complete.
- Do not push, tag, deploy, or change controllers without explicit maintainer approval and [release-checklist.md](release-checklist.md).

Exit criteria:

- Mainnet health checks pass.
- Public reviewer flow loads on desktop and mobile.
- Trust Center hashes match deployed canisters.
- Creator contact is visible without exposing private client PII.

### B. Harden Backend Safety

Outcome: API calls through Candid cannot bypass the UI.

- Make production bootstrap explicit and owner-controlled.
- Restrict `seed_demo` to owner/admin or remove it from production builds.
- Prevent approval decisions from returning to `Pending`.
- Prevent repeated approval overwrite after final decision.
- Validate document hashes backend-side.
- Redact audit summaries for emails, note bodies, approval comments, and document names.

Exit criteria:

- Anonymous caller is denied for all private mutations.
- Signed non-role caller is denied for all private mutations.
- Client principal can only see its portal scope.
- Operator cannot grant itself owner/admin powers.
- Approval final-state behavior is tested.

### C. Build the Real Role Model

Outcome: access control matches the product workflow.

- Add explicit roles: `Owner`, `Admin`, `Operator`, `Client`, `Reviewer`.
- Make `add_admin` owner-only.
- Add revoke/rotate access flows.
- Make access requests grant least-privilege role, not full admin.
- Bind client portal to a chosen Internet Identity principal.

Exit criteria:

- Owner can manage governance.
- Admin can operate workspace but not seize ownership.
- Operator can create project work but cannot change controllers/roles.
- Client can only see assigned client portal.
- Reviewer can only see public/redacted proof.

### D. Make the Product Workflow Complete

Outcome: it feels like a working product, not a showcase.

- Add project activity timeline that joins tasks, approvals, notes, and document records.
- Add clear empty/loading/error states for every panel.
- Add invite flow for clients and operators.
- Add filtered views by client/project/status.
- Add exportable audit report.

Exit criteria:

- A reviewer can understand the product in under two minutes.
- An operator can complete: invite client, create project, add task, add approval, hash document, append note.
- A client can log in and see only their portal.

### E. Secure Private Data

Outcome: real client content is not written as plaintext canister state.

- Define field-level sensitivity.
- Encrypt sensitive fields in the browser before canister write.
- Prototype vetKeys for client-side key management.
- Move document blobs into a storage/vault path.
- Keep only minimal searchable indexes in plaintext.

Exit criteria:

- Notes, approval bodies/comments, document names, and emails have an encrypted mode.
- Public proof never contains private content.
- Security docs clearly state what is encrypted and what is not.

### F. Prepare Production Operations

Outcome: the app can be upgraded and recovered without guessing.

- Move controllers from plaintext dev identity to hardware/passphrase/multisig/Launchtrail/SNS.
- Add release manifest generation.
- Add schema version and migration fixtures.
- Add backup/export endpoint for owner.
- Add cycles/status monitoring.

Exit criteria:

- Controller model is documented and not plaintext-only.
- Upgrade with existing state is tested.
- Rollback/recovery runbook exists.
- CI or local release gate blocks hash mismatches.

### G. Launch Package

Outcome: ICP builders can inspect the work quickly and take it seriously.

- Clean Git history and README.
- Add architecture diagram.
- Add security model.
- Add screenshots and demo script.
- Add short launch post focused on ICP-native proof, Internet Identity, canister audit, and encrypted vault roadmap.

Exit criteria:

- GitHub repo looks professional.
- No secrets or private local artifacts are committed.
- Demo link, Candid link, canister IDs, module hashes, and test commands are easy to find.

### Milestone 1: Harden Current MVP

Goal: make the current mainnet MVP safe enough to show publicly and robust enough for reviewer scrutiny.

Deliverables:

- Disable production `seed_demo` or make it admin-only.
- Add explicit role types. Done as Role & Access v1.
- Restrict approval final state. Done for current API.
- Redact audit summaries. Done for new audit events.
- Add backend-side document hash validation. Done for new document records.
- Add Candid/API tests for role checks.
- Update README/SECURITY to match reality.

### Milestone 2: Real App Workflow

Goal: make the logged-in product feel like an operational workspace, not a demo.

Deliverables:

- Operator dashboard.
- Client invitation and principal binding.
- Client portal-only navigation.
- Document record flow with client-side hash.
- Notes and approvals tied to project activity timeline.
- Better empty/loading/error states.

### Milestone 3: Secure Private Data

Goal: allow real client data.

Deliverables:

- Client-side encryption strategy.
- vetKeys prototype.
- Encrypted fields for notes, approval bodies/comments, document metadata.
- Storage canister or certified blob workflow.
- Private data warning removed only after encryption ships.

### Milestone 4: Production Governance

Goal: make the canisters operationally trustworthy.

Deliverables:

- Controller migration.
- Multisig/Launchtrail/SNS decision.
- Release and rollback runbook.
- Schema migration tests.
- Backup/export tool.

### Milestone 5: Public Launch Package

Goal: make ICP builders and reviewers understand the product quickly.

Deliverables:

- Polished GitHub repository.
- Architecture diagram.
- Security model.
- Demo script.
- Product screenshots.
- Launch post.
- Short video walkthrough.

## Definition of Done for Production

The product is production-ready only when:

- Controllers are no longer plaintext dev identity.
- Roles are least-privilege and tested through Candid/API.
- Approval decisions cannot be overwritten accidentally.
- Sensitive data is encrypted before canister write.
- Upgrade path is tested with existing state.
- Public proof is certified or clearly labeled as non-certified.
- CI runs build, mainnet health, backend role tests, and frontend smoke tests.
- README/SECURITY/ROADMAP accurately describe current guarantees.
