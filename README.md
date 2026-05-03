# SovereignDesk AI

SovereignDesk AI is a first ICP MVP for a sovereign client portal: workspaces, clients, projects, tasks, document records, approvals, audit trail, and an AI Employee draft endpoint.

The current implementation is intentionally canister-first and dependency-light:

- Motoko persistent backend canister.
- Vite frontend hosted by an ICP asset canister.
- Public ICP-styled product surface with read-only demo data.
- Internet Identity gated write operations.
- No AWS, Vercel, external database, or centralized app server.
- Local demo seeded through the backend `seed_demo` method.
- `icp-cli` is installed for the next migration step, while this MVP currently deploys through `dfx`.

## Local Canisters

Current local IDs:

```text
backend:  uzt4z-lp777-77774-qaabq-cai
frontend: umunu-kh777-77774-qaaca-cai
candid:   ulvla-h7777-77774-qaacq-cai
```

Open the local frontend:

```text
http://umunu-kh777-77774-qaaca-cai.localhost:4943/?backend=uzt4z-lp777-77774-qaabq-cai&candid=ulvla-h7777-77774-qaacq-cai
```

Open backend Candid:

```text
http://127.0.0.1:4943/?canisterId=ulvla-h7777-77774-qaacq-cai&id=uzt4z-lp777-77774-qaabq-cai
```

## Mainnet Deployment

The application is deployed on ICP mainnet.

```text
frontend: v7inb-hyaaa-aaaal-qw7aq-cai
backend:  vyjlv-kaaaa-aaaal-qw7aa-cai
owner:    up6xy-uol7y-xisiv-3oron-gl7d3-usnrr-r5ong-hiqu2-hnd2h-cufv3-pqe
```

Open the public app:

```text
https://v7inb-hyaaa-aaaal-qw7aq-cai.icp0.io/
```

Creator contact:

```text
Robert
email: robert19001@gmail.com
controller principal: up6xy-uol7y-xisiv-3oron-gl7d3-usnrr-r5ong-hiqu2-hnd2h-cufv3-pqe
```

Open backend Candid:

```text
https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=vyjlv-kaaaa-aaaal-qw7aa-cai
```

Production hardening currently includes:

- public showcase endpoint without contact email, portal principal, owner principal, or raw actor principals;
- redacted public project/task/approval/document/note/audit fields, so real workspace details are not exposed through the showcase;
- authenticated access modes for operator, client portal, signed read-only, and public read-only users;
- on-chain operator access request queue with admin-side approval;
- tightened asset canister CSP and Permissions-Policy;
- escaped frontend rendering for canister-provided text;
- anonymous visitors see read-only proof and login CTAs instead of write buttons;
- desktop and mobile Playwright QA screenshots.
- custom canister product mark; the app does not recreate or modify the official ICP logo.

QA artifacts:

```text
qa-mainnet-final-desktop.png
qa-mainnet-final-mobile.png
```

Mainnet canister controllers:

```text
sovereign_desk_backend:  up6xy-uol7y-xisiv-3oron-gl7d3-usnrr-r5ong-hiqu2-hnd2h-cufv3-pqe
sovereign_desk_frontend: up6xy-uol7y-xisiv-3oron-gl7d3-usnrr-r5ong-hiqu2-hnd2h-cufv3-pqe
```

## Commands

```bash
source "$HOME/Library/Application Support/org.dfinity.dfx/env"
dfx identity use codex-icp
dfx start --background
dfx deploy
dfx canister call sovereign_desk_backend seed_demo
dfx canister call sovereign_desk_backend get_client_portal '(1)'
dfx canister call sovereign_desk_backend list_audit '(0, 5)'
dfx canister call sovereign_desk_backend ask_agent '("project:1", "Summarize next steps")'
```

## Playground Deployment

The backend was also deployed to the real IC playground:

```text
playground backend: 6cajv-qqaaa-aaaab-qactq-cai
```

It was seeded with `seed_demo`. The playground rejected the asset canister frontend because the dfx `0.32.0` asset canister wasm is not allowlisted in the playground. The durable deployment is now on ICP mainnet.

## MVP API

The backend exposes:

- `init_workspace`
- `get_my_workspace`
- `get_public_demo`
- `request_operator_access`
- `list_access_requests`
- `approve_access_request`
- `create_client`
- `create_project`
- `create_task`
- `update_task_status`
- `update_project_status`
- `create_approval`
- `respond_approval`
- `create_document_record`
- `append_note`
- `get_client_portal`
- `ask_agent`
- `list_audit`
- `seed_demo`

## Next Build Steps

- Move controller identity from plaintext dev identity to a hardware-backed or passphrase-protected controller.
- Add a principal onboarding flow for the owner's real Internet Identity.
- Add request status lifecycle: pending, approved, rejected, archived.
- Split vault and agent into separate canisters once the core workflow is stable.
- Add vetKeys for client-side encrypted document keys.
- Add proper file upload and certified document retrieval.
- Add automated E2E tests for authenticated Internet Identity flows.
- Add ckBTC/ckUSDC invoice payment flow after mainnet MVP.
