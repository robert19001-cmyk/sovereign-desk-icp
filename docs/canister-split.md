# Canister Split Status

The mainnet MVP still keeps core workspace records in `sovereign_desk_backend`, but split canister routing is now active from the live frontend:

- encrypted object writes/readbacks use `sovereign_desk_vault`;
- AI brief drafts use `sovereign_desk_agent`;
- split-flow proof events use `sovereign_desk_audit`.

## Current Mainnet Canisters

- Frontend asset canister: `v7inb-hyaaa-aaaal-qw7aq-cai`
- Backend workspace canister: `vyjlv-kaaaa-aaaal-qw7aa-cai`
- Vault canister: `venre-5aaaa-aaaal-qw7ca-cai`
- Audit canister: `vdmxq-qyaaa-aaaal-qw7cq-cai`
- Agent canister: `vkp4m-gqaaa-aaaal-qw7da-cai`

Controller for all five canisters:

```text
7dnyu-motzm-oqehm-762iq-irfd3-taexs-huxbx-z5bdr-4hdjg-j4lih-5ae
```

## Split Canisters

- `sovereign_desk_vault`
  - ciphertext-only document object storage
  - vetKeys-ready derivation context
  - encrypted object listing and retrieval

- `sovereign_desk_audit`
  - append-only proof events
  - public trust manifest placeholder
  - future certified Trust Center home

- `sovereign_desk_agent`
  - AI brief drafts
  - explicit human approval before client use
  - future isolated AI audit surface

## Mainnet Module Hashes

```text
sovereign_desk_vault: 0x08769137ce21c7db11212213fe05ed838299034383b0a2ada6a9e31bba20660c
sovereign_desk_audit: 0xaa47af5bfc40b6986ce80774eb6e226157e1b8ab827bf0ea5f19d7803b6543ce
sovereign_desk_agent: 0x1fd09730239dd7ece5d9e7b1da271618429f062904904dcc61b48c3970e5435e
```

## Smoke Tests

The deployed split canisters were tested with:

```bash
dfx --identity codex-icp canister call sovereign_desk_vault get_vetkey_derivation_context '(1, 4, principal "up6xy-uol7y-xisiv-3oron-gl7d3-usnrr-r5ong-hiqu2-hnd2h-cufv3-pqe")' --network ic
dfx --identity codex-icp canister call sovereign_desk_audit append_event '("release.split", "v0.6.0", "Mainnet split canister smoke test")' --network ic
dfx --identity codex-icp canister call sovereign_desk_agent draft_brief '("project:1", "Summarize mainnet split deployment")' --network ic
```

The live frontend bundle is also validated by `npm run qa:product`, which checks that it points at the backend plus all three split canisters.

## Migration Order

1. Move server-side backend calls for vault/audit/agent into typed cross-canister service wrappers.
2. Keep old backend vault records read-only during migration.
3. Add certified responses for the audit Trust Center.
4. Replace passphrase-derived demo keys with vetKeys key release.
5. Add authenticated E2E tests for split canister writes.

## Exit Criteria

- Workspace backend does not store new document ciphertext.
- Vault canister owns encrypted object write/read path.
- Audit canister owns public proof manifest.
- Agent canister owns AI brief lifecycle.
- Trust Center lists all production canisters and their module hashes.
