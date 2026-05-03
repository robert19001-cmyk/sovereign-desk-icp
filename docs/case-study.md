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
- Document Vault v2 with version metadata, client-side hash verification evidence, ciphertext-only object storage, and vetKeys-ready key context;
- AI Employee readout for operator summaries.

## Live Deployment

- App: https://v7inb-hyaaa-aaaal-qw7aq-cai.icp0.io/
- Backend: `vyjlv-kaaaa-aaaal-qw7aa-cai`
- Frontend: `v7inb-hyaaa-aaaal-qw7aq-cai`
- Controller principal: `7dnyu-motzm-oqehm-762iq-irfd3-taexs-huxbx-z5bdr-4hdjg-j4lih-5ae`

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

1. Move controller governance from protected single identity to multisig, SNS, Launchtrail, or equivalent.
2. Add owner onboarding for the real Internet Identity principal.
3. Add access request status lifecycle and notifications.
4. Harden client invite and portal-principal assignment with expiry and notification hooks.
5. Replace passphrase-derived demo keys with vetKeys-backed encrypted key handling for the vault.
6. Split the AI Employee into a dedicated canister with explicit human approval.
7. Add ckBTC/ckUSDC invoice approvals after the client workflow is stable.

## Creator

Robert  
Email: robert19001@gmail.com
