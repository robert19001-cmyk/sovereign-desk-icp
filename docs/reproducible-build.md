# Reproducible Build Notes

SovereignDesk AI is deployed as two ICP canisters:

- backend Motoko canister: `vyjlv-kaaaa-aaaal-qw7aa-cai`
- frontend asset canister: `v7inb-hyaaa-aaaal-qw7aq-cai`

The current controller is:

```text
up6xy-uol7y-xisiv-3oron-gl7d3-usnrr-r5ong-hiqu2-hnd2h-cufv3-pqe
```

## Build

```bash
source "$HOME/Library/Application Support/org.dfinity.dfx/env"
dfx identity use codex-icp
DFX_NETWORK=ic CANISTER_ID_SOVEREIGN_DESK_BACKEND=vyjlv-kaaaa-aaaal-qw7aa-cai npm run build
dfx build --network ic
```

## Deploy

Maintainer-only. Do not deploy from routine cleanup or QA work without explicit release approval.

```bash
DFX_WARNING=-mainnet_plaintext_identity dfx deploy --network ic --yes
```

## Verify Mainnet Status

```bash
DFX_WARNING=-mainnet_plaintext_identity dfx canister status --network ic sovereign_desk_backend
DFX_WARNING=-mainnet_plaintext_identity dfx canister status --network ic sovereign_desk_frontend
```

The application Trust Center shows the canister IDs, controller, module hashes, and a direct dashboard link. The frontend module hash is the asset canister Wasm hash. The backend module hash changes after backend upgrades and should be refreshed after each mainnet deploy.

## Security Notes

- Public demo responses are redacted before they leave the backend canister.
- Role-gated data is available only to operator or assigned client portal principals.
- Internet Identity is used for write calls.
- Asset canister headers include a tightened CSP and Permissions-Policy.
- This project is independent and is not affiliated with or endorsed by the DFINITY Foundation.

## Next Controller Step

The current controller is a development identity. Before storing valuable client data or assets, move control to a passphrase-protected or hardware-backed identity. For a public production launch, move toward multisig, Launchtrail, SNS, or another governance model. Use [controller-hardening-runbook.md](controller-hardening-runbook.md) for the migration checklist.
