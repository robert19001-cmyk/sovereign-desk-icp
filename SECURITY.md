# Security Policy

SovereignDesk AI is an ICP mainnet MVP. It is designed to demonstrate a canister-native client operations workflow, but it is not yet ready for sensitive production client data, secrets, regulated workloads, or user funds.

## Current Security Posture

- Frontend is served by an ICP asset canister.
- Backend state is held in a Motoko persistent actor.
- Public demo responses are redacted before leaving the backend canister.
- Write calls require Internet Identity and role checks.
- Owner, Admin, Operator, Client, Reviewer, signed read-only, and public read-only modes are separated.
- Access approvals grant Operator role, not full governance access.
- Role grants can be listed, granted, revoked, and client portal principals can be rotated by governance.
- Approval decisions cannot be returned to Pending or overwritten after final state.
- New document records require backend-side `sha256:<64 hex>` validation.
- Upgrade safety exposes `schemaVersion = 3` and owner-only state snapshot export.
- Asset headers include a tightened CSP and Permissions-Policy.
- Frontend rendering escapes canister-provided strings.
- The app uses a custom product mark and is not affiliated with or endorsed by DFINITY Foundation.

## Known Limitations

- The current controller is a development identity. Move control to a passphrase-protected, hardware-backed, multisig, Launchtrail, SNS, or equivalent governance setup before storing valuable data.
- Canister state is not confidential by default on ICP. Do not store secrets, API keys, private documents, or sensitive client data until encrypted storage and vetKeys/client-side encryption are implemented.
- Public query responses are not the same as certified state. Trust-sensitive public proof fields should move toward certified variables or certified assets.
- Access request approval is useful for the MVP, but the lifecycle should be expanded with archive/history UX, notifications, and scoped invitations.
- The AI Employee endpoint is currently a deterministic draft helper, not an external LLM integration.

## Reporting a Vulnerability

Email: robert19001@gmail.com

Please include:

- affected canister or URL,
- reproduction steps,
- expected and actual behavior,
- impact assessment,
- suggested fix if known.

Do not publish exploit details publicly before the issue is reviewed.

## Mainnet Canisters

```text
frontend: v7inb-hyaaa-aaaal-qw7aq-cai
backend:  vyjlv-kaaaa-aaaal-qw7aa-cai
```

## Verification

Local release gate:

```bash
npm run qa:hardening
npm run qa:roles
npm run qa:upgrade
```

Maintainer-only mainnet verification:

```bash
DFX_WARNING=-mainnet_plaintext_identity dfx canister status --network ic sovereign_desk_backend
DFX_WARNING=-mainnet_plaintext_identity dfx canister status --network ic sovereign_desk_frontend
npm run qa:mainnet
npm run qa:product
```

Controller migration is tracked in [docs/controller-hardening-runbook.md](docs/controller-hardening-runbook.md). Release preparation is tracked in [docs/release-checklist.md](docs/release-checklist.md).
