# SovereignDesk AI Case Study

SovereignDesk AI is a canister-native client operations workspace deployed on the Internet Computer mainnet.

## Why This Exists

Most client portals still depend on a conventional app stack: hosted frontend, centralized backend, database, object storage, auth provider, and separate audit tooling. SovereignDesk compresses the first useful version into ICP canisters:

- certified asset delivery from an ICP asset canister;
- Motoko persistent actor state;
- Internet Identity gated writes;
- role-aware client portal reads;
- approval and audit trail primitives;
- AI Employee readout for operator summaries.

## Live Deployment

- App: https://v7inb-hyaaa-aaaal-qw7aq-cai.icp0.io/
- Backend: `vyjlv-kaaaa-aaaal-qw7aa-cai`
- Frontend: `v7inb-hyaaa-aaaal-qw7aq-cai`
- Controller principal: `up6xy-uol7y-xisiv-3oron-gl7d3-usnrr-r5ong-hiqu2-hnd2h-cufv3-pqe`

## Security Decisions

- Public demo uses a dedicated sanitized response type.
- Public data excludes client email, portal principal, owner principal, and raw actor principals.
- Write calls require Internet Identity and role checks.
- Frontend escapes canister-provided strings before rendering HTML.
- Asset canister CSP and Permissions-Policy are tightened.

## Product Direction

The next product milestone is not another landing page. It is a controlled workflow:

1. Move controller rights to a hardware-backed or passphrase-protected identity.
2. Add owner onboarding for the real Internet Identity principal.
3. Add client invite and portal-principal assignment UI.
4. Add certified document upload metadata and encrypted key handling.
5. Split the AI Employee into a dedicated canister with explicit human approval.
6. Add ckBTC/ckUSDC invoice approvals after the client workflow is stable.

## Creator

Robert  
Email: robert19001@gmail.com
