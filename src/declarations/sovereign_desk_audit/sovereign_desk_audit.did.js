export const idlFactory = ({ IDL }) => {
  const ProofEvent = IDL.Record({
    'id' : IDL.Nat,
    'action' : IDL.Text,
    'createdAt' : IDL.Int,
    'summary' : IDL.Text,
    'target' : IDL.Text,
    'actorPrincipal' : IDL.Principal,
  });
  const TrustManifest = IDL.Record({
    'frontendCanister' : IDL.Text,
    'appName' : IDL.Text,
    'release' : IDL.Text,
    'updatedAt' : IDL.Int,
    'backendCanister' : IDL.Text,
    'schemaVersion' : IDL.Nat,
    'backendModuleHash' : IDL.Text,
  });
  return IDL.Service({
    'append_event' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [ProofEvent], []),
    'get_trust_manifest' : IDL.Func([], [IDL.Opt(TrustManifest)], ['query']),
    'list_events' : IDL.Func(
        [IDL.Nat, IDL.Nat],
        [IDL.Vec(ProofEvent)],
        ['query'],
      ),
    'publish_trust_manifest' : IDL.Func([TrustManifest], [TrustManifest], []),
  });
};
export const init = ({ IDL }) => { return []; };
