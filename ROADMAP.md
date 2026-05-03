# Roadmap

SovereignDesk AI is moving from canister-native MVP toward a production-grade ICP product.

## Phase 1: Trust and Launch Readiness

- Move controller from plaintext development identity to a protected controller.
- Publish source on GitHub with CI, security policy, and reproducible build notes.
- Keep Trust Center visible in the public app.
- Add CI checks for frontend build and source hygiene.
- Document canister IDs, controllers, module hashes, and verification commands.

## Phase 2: Role Onboarding

- Add owner onboarding for the real Internet Identity principal.
- Expand access request lifecycle: pending, approved, rejected, archived.
- Add client invite flow with portal principal assignment.
- Add admin UI for client principal rotation.
- Add audit filters and export.

## Phase 3: Data and Documents

- Add certified document metadata.
- Add file upload flow through asset or storage canister design.
- Add client-side encryption and vetKeys for document keys.
- Separate public demo state from real workspace state.
- Add backup/export for workspace metadata.

## Phase 4: AI Employee Canister

- Split AI Employee logs into a dedicated canister.
- Add explicit human approval before AI-written client updates.
- Add prompt/audit provenance.
- Add deterministic summaries first, external LLM integration later only with clear data boundaries.

## Phase 5: Payments

- Add invoice approval workflow.
- Add ckBTC/ckUSDC settlement after the client workflow is stable.
- Add payment audit records and reconciliation exports.

## Phase 6: Governance

- Evaluate Launchtrail, multisig, blackhole patterns for immutable pieces, or SNS governance.
- Document upgrade process.
- Publish reproducible build hashes per release.
