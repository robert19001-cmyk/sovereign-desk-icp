# SovereignDesk AI Case Study

SovereignDesk AI is a canister-native client operations workspace deployed on the Internet Computer mainnet as a public MVP. It is not yet approved for real confidential client data.

## Why This Exists

Most client portals still depend on a conventional app stack: hosted frontend, centralized backend, database, object storage, auth provider, and separate audit tooling. SovereignDesk compresses the first useful version into ICP canisters:

- certified asset delivery from an ICP asset canister;
- Motoko persistent actor state;
- Internet Identity gated writes;
- role-aware client portal reads;
- on-chain operator access requests;
- Trust Center with canister IDs, controller, module hashes, and verification command;
- approval and audit trail primitives;
- AI Employee readout for operator summaries.

## Live Deployment

- App: https://v7inb-hyaaa-aaaal-qw7aq-cai.icp0.io/
- Backend: `vyjlv-kaaaa-aaaal-qw7aa-cai`
- Frontend: `v7inb-hyaaa-aaaal-qw7aq-cai`
- Controller principal: `up6xy-uol7y-xisiv-3oron-gl7d3-usnrr-r5ong-hiqu2-hnd2h-cufv3-pqe`

## Security Decisions

- Public demo uses a dedicated sanitized response type.
- Public data excludes client email, portal principal, owner principal, raw actor principals, and real project/task/approval/document/note/audit content.
- Write calls require Internet Identity and role checks.
- Signed-in users without roles can request operator access on-chain instead of failing silently.
- Frontend escapes canister-provided strings before rendering HTML.
- Asset canister CSP and Permissions-Policy are tightened.
- The app uses a custom product mark and states that it is independent from DFINITY Foundation.

## Product Direction

The next product milestone is not another landing page. It is a controlled workflow:

1. Move controller rights to a hardware-backed or passphrase-protected identity.
2. Add owner onboarding for the real Internet Identity principal.
3. Add access request status lifecycle and notifications.
4. Harden client invite and portal-principal assignment with expiry and notification hooks.
5. Add certified document upload metadata and encrypted key handling.
6. Split the AI Employee into a dedicated canister with explicit human approval.
7. Add ckBTC/ckUSDC invoice approvals after the client workflow is stable.

## Creator

Robert  
Email: robert19001@gmail.com
