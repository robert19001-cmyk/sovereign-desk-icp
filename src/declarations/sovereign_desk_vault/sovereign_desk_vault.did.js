export const idlFactory = ({ IDL }) => {
  const VaultObject = IDL.Record({
    'id' : IDL.Nat,
    'iv' : IDL.Vec(IDL.Nat8),
    'versionId' : IDL.Opt(IDL.Nat),
    'algorithm' : IDL.Text,
    'ciphertextHash' : IDL.Text,
    'ciphertext' : IDL.Vec(IDL.Nat8),
    'createdAt' : IDL.Int,
    'createdBy' : IDL.Principal,
    'keyDerivationContext' : IDL.Text,
    'workspaceId' : IDL.Nat,
    'documentId' : IDL.Nat,
  });
  const VaultObjectInfo = IDL.Record({
    'id' : IDL.Nat,
    'versionId' : IDL.Opt(IDL.Nat),
    'algorithm' : IDL.Text,
    'ciphertextHash' : IDL.Text,
    'ciphertextSize' : IDL.Nat,
    'ivSize' : IDL.Nat,
    'createdAt' : IDL.Int,
    'createdBy' : IDL.Principal,
    'keyDerivationContext' : IDL.Text,
    'workspaceId' : IDL.Nat,
    'documentId' : IDL.Nat,
  });
  return IDL.Service({
    'get_object' : IDL.Func([IDL.Nat], [IDL.Opt(VaultObject)], ['query']),
    'get_vetkey_derivation_context' : IDL.Func(
        [IDL.Nat, IDL.Nat, IDL.Principal],
        [IDL.Text],
        ['query'],
      ),
    'list_objects' : IDL.Func(
        [IDL.Nat, IDL.Nat],
        [IDL.Vec(VaultObjectInfo)],
        ['query'],
      ),
    'store_object' : IDL.Func(
        [
          IDL.Nat,
          IDL.Nat,
          IDL.Opt(IDL.Nat),
          IDL.Text,
          IDL.Text,
          IDL.Vec(IDL.Nat8),
          IDL.Vec(IDL.Nat8),
          IDL.Text,
        ],
        [VaultObjectInfo],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
