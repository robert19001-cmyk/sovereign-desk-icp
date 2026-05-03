# vetKeys Integration Plan

SovereignDesk currently stores encrypted vault objects as ciphertext-only canister state. The browser encrypts files with WebCrypto AES-GCM and writes only ciphertext, IV, content hash, and key derivation context to the backend.

The next step is replacing the current passphrase-derived demo key with Internet Computer vetKeys-backed key release.

## Current Boundary

- Plaintext file bytes stay in the browser.
- The passphrase stays in the browser.
- The canister stores ciphertext, IV, hash, algorithm, and derivation context.
- The backend exposes `get_vetkey_derivation_context(documentId, recipient)`.
- The frontend includes `@dfinity/vetkeys` so the app can move from demo key derivation to vetKeys flow without a dependency change.

## Target Flow

1. User signs in with Internet Identity.
2. Frontend requests a vetKeys transport public key using `@dfinity/vetkeys`.
3. Backend or dedicated vault canister checks workspace/document access.
4. Vault canister asks the system vetKD API for an encrypted vetKey scoped to:

```text
sovereign-desk:vault-canister:v1:workspace:<workspaceId>:document:<documentId>:recipient:<principal>
```

5. Frontend decrypts and verifies the encrypted vetKey.
6. Frontend derives the symmetric AES-GCM key from the vetKey.
7. Frontend encrypts/decrypts document bytes locally.
8. Canister stores only ciphertext and metadata.

## Production Requirements Before Real Client Data

- Access check must happen before any vetKey release.
- Key derivation context must include workspace, document, recipient principal, and key version.
- Key rotation must produce a new context/version and preserve old ciphertext readability.
- Recovery policy must be explicit: owner recovery, client recovery, or no recovery.
- Governance must approve any controller/key policy migration.
- Tests must prove anonymous and wrong-client principals cannot obtain encrypted object metadata or key context.

## Implementation Notes

The repo already includes:

- `@dfinity/vetkeys`
- `get_vetkey_derivation_context`
- encrypted object storage
- dedicated `sovereign_desk_vault` scaffold canister

The missing production piece is the canister-side vetKD call and release policy wired into the dedicated vault canister.
