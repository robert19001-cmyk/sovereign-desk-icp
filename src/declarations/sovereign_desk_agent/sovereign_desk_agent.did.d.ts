import type { Principal } from '@icp-sdk/core/principal';
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';

export interface AgentBrief {
  'id' : bigint,
  'approvedAt' : [] | [bigint],
  'approvedBy' : [] | [Principal],
  'createdAt' : bigint,
  'createdBy' : Principal,
  'answer' : string,
  'scope' : string,
  'approved' : boolean,
  'prompt' : string,
}
export interface _SERVICE {
  'approve_brief' : ActorMethod<[bigint], AgentBrief>,
  'draft_brief' : ActorMethod<[string, string], AgentBrief>,
  'list_briefs' : ActorMethod<[bigint, bigint], Array<AgentBrief>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
