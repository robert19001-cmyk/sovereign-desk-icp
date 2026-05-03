import type { Principal } from '@icp-sdk/core/principal';
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';

export interface VaultObject {
  'id' : bigint,
  'iv' : Uint8Array | number[],
  'versionId' : [] | [bigint],
  'algorithm' : string,
  'ciphertextHash' : string,
  'ciphertext' : Uint8Array | number[],
  'createdAt' : bigint,
  'createdBy' : Principal,
  'keyDerivationContext' : string,
  'workspaceId' : bigint,
  'documentId' : bigint,
}
export interface VaultObjectInfo {
  'id' : bigint,
  'versionId' : [] | [bigint],
  'algorithm' : string,
  'ciphertextHash' : string,
  'ciphertextSize' : bigint,
  'ivSize' : bigint,
  'createdAt' : bigint,
  'createdBy' : Principal,
  'keyDerivationContext' : string,
  'workspaceId' : bigint,
  'documentId' : bigint,
}
export interface _SERVICE {
  'get_object' : ActorMethod<[bigint], [] | [VaultObject]>,
  'get_vetkey_derivation_context' : ActorMethod<
    [bigint, bigint, Principal],
    string
  >,
  'list_objects' : ActorMethod<[bigint, bigint], Array<VaultObjectInfo>>,
  'store_object' : ActorMethod<
    [
      bigint,
      bigint,
      [] | [bigint],
      string,
      string,
      Uint8Array | number[],
      Uint8Array | number[],
      string,
    ],
    VaultObjectInfo
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
