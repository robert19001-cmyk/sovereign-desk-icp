# Demo Script

Use this path to review SovereignDesk AI in 60-90 seconds.

## 1. Open the Live App

```text
https://v7inb-hyaaa-aaaal-qw7aq-cai.icp0.io/
```

Confirm:

- the public app loads from an ICP asset canister;
- the white/gold product tabs and live proof ledger are visible without login;
- the workspace preview is visible without login;
- public client/project/task/approval content is redacted;
- creator contact is visible;
- the UI includes a Trust Center.

## 2. Inspect the Trust Center

Scroll to **Trust Center**.

Confirm:

- frontend canister: `v7inb-hyaaa-aaaal-qw7aq-cai`;
- backend canister: `vyjlv-kaaaa-aaaal-qw7aa-cai`;
- controller principal is listed;
- backend module hash is listed;
- schema version and state health are verifiable through backend API;
- source remote is listed;
- DFINITY/Internet Computer independent-project disclaimer is visible.

## 3. Open Backend Candid

```text
https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=vyjlv-kaaaa-aaaal-qw7aa-cai
```

Try read-only calls:

- `get_public_demo`
- `get_system_info`
- `get_my_roles` with the controller identity
- `list_role_grants` with the controller identity
- `export_state_snapshot` with the controller identity
- `list_access_requests` with the controller identity
- `list_access_request_history` with the controller identity

## 4. Verify Public Redaction

Call:

```bash
DFX_WARNING=-mainnet_plaintext_identity dfx canister call --network ic sovereign_desk_backend get_public_demo
```

Confirm public responses do not expose:

- client email;
- portal principal;
- owner principal;
- raw actor principal;
- real project/task/approval/document/note/audit content.

## 5. Test Internet Identity Flow

In the live app:

1. Click **Login with Internet Identity**.
2. Sign in with any Internet Identity.
3. If the identity is not an operator or portal principal, confirm the app stays usable in signed read-only mode.
4. Submit **Request access on-chain**.

Expected behavior:

- the request is written to the backend canister;
- the user sees a success notice;
- operators can later review it in the access queue.

## 6. Operator Review Path

With the controller/operator identity:

1. Log in.
2. Confirm the operator console appears.
3. Review pending access requests.
4. Approve or reject a request.
5. Confirm the audit trail records the action.

## 7. Local Verification

```bash
npm ci
npm test
npm run qa:hardening
npm run qa:roles
npm run qa:upgrade
```

Maintainer-only mainnet QA:

```bash
npm run qa:mainnet
npm run qa:product
```

Mainnet status:

```bash
dfx --identity sovereign-controller canister status --network ic sovereign_desk_backend
dfx --identity sovereign-controller canister status --network ic sovereign_desk_frontend
```

## Review Notes

This is a canister-native MVP, not a finished production system. Do not use it for real confidential client data yet. Controller rights have moved off the plaintext development identity; the next governance step is multisig, Launchtrail, SNS, or an equivalent team-grade model.
