# Canister Split Plan

The mainnet MVP still runs the product workflow through `sovereign_desk_backend`. The repository now includes compile-ready split canister scaffolds so the next funded deployment can move toward a production topology.

## Current Mainnet Canisters

- Frontend asset canister: `v7inb-hyaaa-aaaal-qw7aq-cai`
- Backend workspace canister: `vyjlv-kaaaa-aaaal-qw7aa-cai`

## Scaffolded Canisters

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

## Deployment Constraint

The protected `sovereign-controller` identity currently has `0.000 TC`. Creating three additional production canisters should wait until the controller identity is funded with enough cycles to create and maintain them safely.

## Migration Order

1. Fund `sovereign-controller` with cycles.
2. Deploy `sovereign_desk_audit` first and publish Trust Manifest.
3. Deploy `sovereign_desk_vault` and move new encrypted objects there.
4. Keep old backend vault records read-only during migration.
5. Deploy `sovereign_desk_agent` and route `ask_agent` through the isolated agent canister.
6. Update frontend declarations and Trust Center with new canister IDs.
7. Run mainnet QA and release a new manifest.

## Exit Criteria

- Workspace backend does not store new document ciphertext.
- Vault canister owns encrypted object write/read path.
- Audit canister owns public proof manifest.
- Agent canister owns AI brief lifecycle.
- Trust Center lists all production canisters and their module hashes.
