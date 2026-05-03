import type { Principal } from '@icp-sdk/core/principal';
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';

export interface ProofEvent {
  'id' : bigint,
  'action' : string,
  'createdAt' : bigint,
  'summary' : string,
  'target' : string,
  'actorPrincipal' : Principal,
}
export interface TrustManifest {
  'frontendCanister' : string,
  'appName' : string,
  'release' : string,
  'updatedAt' : bigint,
  'backendCanister' : string,
  'schemaVersion' : bigint,
  'backendModuleHash' : string,
}
export interface _SERVICE {
  'append_event' : ActorMethod<[string, string, string], ProofEvent>,
  'get_trust_manifest' : ActorMethod<[], [] | [TrustManifest]>,
  'list_events' : ActorMethod<[bigint, bigint], Array<ProofEvent>>,
  'publish_trust_manifest' : ActorMethod<[TrustManifest], TrustManifest>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
