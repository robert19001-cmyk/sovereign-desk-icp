# Governance Migration

SovereignDesk mainnet control has moved away from the plaintext development identity and is currently held by the protected `sovereign-controller` identity:

```text
7dnyu-motzm-oqehm-762iq-irfd3-taexs-huxbx-z5bdr-4hdjg-j4lih-5ae
```

This is acceptable for a public MVP, but it is not the final governance model for valuable client data.

## Live Governance Proposal

The backend contains an on-chain governance proposal ledger. The first proposal is live:

```text
Adopt multisig controller governance
```

Intent: move controller operations from protected single identity to Launchtrail, SNS, or another multisig approval path before storing valuable client data.

## Recommended Path

1. Keep `sovereign-controller` as current emergency maintainer.
2. Evaluate Launchtrail for near-term team-grade controller approvals.
3. Evaluate SNS when public/community governance becomes useful.
4. Document exact controller update commands before executing.
5. Require green `qa:mainnet`, `qa:product`, and a state snapshot before any controller mutation.
6. Record the governance decision in the on-chain proposal ledger.

## Non-Negotiable Checks

- New controller can inspect canister status.
- New controller can deploy a no-op upgrade.
- Old controller is removed only after verification.
- Recovery path is documented outside the canister.
- Release manifest is updated after controller changes.
