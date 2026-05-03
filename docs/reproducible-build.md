# Reproducible Build Notes

SovereignDesk AI is deployed as two ICP canisters:

- backend Motoko canister: `vyjlv-kaaaa-aaaal-qw7aa-cai`
- frontend asset canister: `v7inb-hyaaa-aaaal-qw7aq-cai`

The current controller is:

```text
7dnyu-motzm-oqehm-762iq-irfd3-taexs-huxbx-z5bdr-4hdjg-j4lih-5ae
```

## Build

```bash
source "$HOME/Library/Application Support/org.dfinity.dfx/env"
dfx identity use sovereign-controller
DFX_NETWORK=ic CANISTER_ID_SOVEREIGN_DESK_BACKEND=vyjlv-kaaaa-aaaal-qw7aa-cai npm run build
dfx build --network ic
```

## Deploy

Maintainer-only. Do not deploy from routine cleanup or QA work without explicit release approval.

```bash
dfx --identity sovereign-controller deploy --network ic --yes
```

## Verify Mainnet Status

```bash
dfx --identity sovereign-controller canister status --network ic sovereign_desk_backend
dfx --identity sovereign-controller canister status --network ic sovereign_desk_frontend
```

The application Trust Center shows the canister IDs, controller, module hashes, and a direct dashboard link. The frontend module hash is the asset canister Wasm hash. The backend module hash changes after backend upgrades and should be refreshed after each mainnet deploy.

## Security Notes

- Public demo responses are redacted before they leave the backend canister.
- Role-gated data is available only to operator or assigned client portal principals.
- Internet Identity is used for write calls.
- Asset canister headers include a tightened CSP and Permissions-Policy.
- This project is independent and is not affiliated with or endorsed by the DFINITY Foundation.

## Next Controller Step

The current controller is a protected keychain identity. Before storing valuable client data or assets, move control toward multisig, Launchtrail, SNS, or another governance model. Use [controller-hardening-runbook.md](controller-hardening-runbook.md) for the migration checklist.
