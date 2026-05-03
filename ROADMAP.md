# Roadmap

SovereignDesk AI is moving from a public canister-native mainnet MVP toward a production-grade ICP product. The current deployment is suitable for review and technical validation, not real confidential client data.

## Phase 1: Trust and Launch Readiness

- Move controller from plaintext development identity to a protected controller.
- Publish source on GitHub with CI, security policy, reproducible build notes, selected release screenshots, and release gates.
- Keep Trust Center visible in the public app.
- Add CI checks for frontend build and source hygiene.
- Document canister IDs, controllers, module hashes, and verification commands.
- Keep the premium white/gold reviewer flow as the default public surface.
- Keep maintainer-only mainnet QA separate from generic local contributor checks.
- Maintain release checklist and controller-hardening runbook.

## Phase 2: Role Onboarding

- Harden owner onboarding for the real Internet Identity principal.
- Expand access request lifecycle: pending, approved, rejected, archived.
- Harden client invite lifecycle with expiring invite codes and notification hooks.
- Extend governance UI for invite history, client principal rotation, role revoke, and scoped grants.
- Add audit filters and export.

## Phase 3: Data and Documents

- Add certified document metadata.
- Add file upload flow through asset or storage canister design.
- Add client-side encryption and vetKeys for document keys.
- Separate public demo state from real workspace state.
- Expand state snapshot/export into an encrypted backup and restore/migration runbook.

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
- Require explicit maintainer approval before push, tag, deploy, controller changes, or production data handling.
