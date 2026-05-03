# Launch Post

## Short Version

I launched SovereignDesk AI on the Internet Computer mainnet.

It is a canister-native client operations workspace: Motoko backend, ICP asset canister frontend, Internet Identity gated writes, role-aware client portals, redacted public demo data, encrypted vault objects, on-chain access requests, governance proposal ledger, and an in-app Trust Center with canister IDs and module hashes.

Live app:
https://v7inb-hyaaa-aaaal-qw7aq-cai.icp0.io/

GitHub:
https://github.com/robert19001-cmyk/sovereign-desk-icp

## Developer Forum Version

Title:

```text
SovereignDesk AI: canister-native client operations workspace on ICP mainnet
```

Body:

```markdown
I built and deployed SovereignDesk AI, a canister-native client operations workspace running on the Internet Computer mainnet.

Live app:
https://v7inb-hyaaa-aaaal-qw7aq-cai.icp0.io/

GitHub:
https://github.com/robert19001-cmyk/sovereign-desk-icp

What it demonstrates:

- Motoko persistent backend canister
- Vite frontend served from an ICP asset canister
- Internet Identity gated write operations
- Operator, client portal, signed read-only, and public read-only access modes
- Redacted public demo endpoint so public visitors can inspect the workflow without exposing private workspace data
- On-chain operator access request queue
- Approval workflow and audit trail
- Document Vault v2 with document versions, archive records, and SHA-256 verification evidence
- Encrypted vault objects: browser-side AES-GCM encryption, ciphertext-only canister storage, and vetKeys-ready derivation context
- Governance proposal ledger for multisig/SNS/Launchtrail migration decisions
- AI Employee draft endpoint for operational summaries
- In-app Trust Center with canister IDs, controller, module hashes, dashboard links, and verification command
- Tightened asset canister CSP and Permissions-Policy
- SECURITY.md, ROADMAP.md, reproducible build notes, demo script, and GitHub Actions CI

Mainnet canisters:

- Frontend: `v7inb-hyaaa-aaaal-qw7aq-cai`
- Backend: `vyjlv-kaaaa-aaaal-qw7aa-cai`

Current limitations are documented in SECURITY.md. Controller rights have moved off the plaintext development identity; encrypted vault objects are live; the next governance step is multisig, Launchtrail, SNS, or another team-grade control model.

I would appreciate feedback from ICP builders on:

- controller/governance hardening path;
- certified public state for Trust Center data;
- vetKeys design for client-side encrypted document keys;
- best storage pattern for real document uploads;
- whether this kind of operational client portal is useful as an ICP-native SaaS pattern.
```

## X / LinkedIn Version

```text
I launched SovereignDesk AI on ICP mainnet.

It is a canister-native client operations workspace:

- Motoko backend canister
- ICP asset canister frontend
- Internet Identity writes
- role-aware client portals
- encrypted vault objects
- governance proposal ledger
- redacted public demo data
- on-chain access requests
- approval workflow + audit trail
- Trust Center with canister IDs and module hashes

Live:
https://v7inb-hyaaa-aaaal-qw7aq-cai.icp0.io/

GitHub:
https://github.com/robert19001-cmyk/sovereign-desk-icp
```

## Repository Metadata

Use this on GitHub:

```text
Description:
Canister-native client operations workspace on ICP mainnet

Website:
https://v7inb-hyaaa-aaaal-qw7aq-cai.icp0.io/

Topics:
internet-computer, icp, motoko, dfinity, internet-identity, canister, web3, vite, saas, encrypted-vault, governance
```
