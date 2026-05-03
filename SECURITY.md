# Security Policy

SovereignDesk AI is an ICP mainnet MVP. It is designed to demonstrate a canister-native client operations workflow, but it is not yet ready for sensitive production client data or user funds.

## Current Security Posture

- Frontend is served by an ICP asset canister.
- Backend state is held in a Motoko persistent actor.
- Public demo responses are redacted before leaving the backend canister.
- Write calls require Internet Identity and role checks.
- Operator, client portal, signed read-only, and public read-only modes are separated.
- Asset headers include a tightened CSP and Permissions-Policy.
- Frontend rendering escapes canister-provided strings.
- The app uses a custom product mark and is not affiliated with or endorsed by DFINITY Foundation.

## Known Limitations

- The current controller is a development identity. Move control to a passphrase-protected, hardware-backed, multisig, Launchtrail, SNS, or equivalent governance setup before storing valuable data.
- Canister state is not confidential by default on ICP. Do not store secrets, API keys, private documents, or sensitive client data until encrypted storage and vetKeys/client-side encryption are implemented.
- Public query responses are not the same as certified state. Trust-sensitive public proof fields should move toward certified variables or certified assets.
- Access request approval is useful for the MVP, but the lifecycle should be expanded with archive/history UX and notifications.
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

```bash
DFX_WARNING=-mainnet_plaintext_identity dfx canister status --network ic sovereign_desk_backend
DFX_WARNING=-mainnet_plaintext_identity dfx canister status --network ic sovereign_desk_frontend
```
