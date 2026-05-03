import type { Principal } from '@icp-sdk/core/principal';
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';

export interface AccessRequest {
  'id' : bigint,
  'principal' : Principal,
  'note' : string,
  'createdAt' : bigint,
  'email' : string,
}
export interface AccessRequestReview {
  'status' : AccessRequestStatus,
  'request' : AccessRequest,
}
export type AccessRequestStatus = { 'Approved' : null } |
  { 'Rejected' : null } |
  { 'Pending' : null };
export interface AgentResponse {
  'id' : bigint,
  'createdAt' : bigint,
  'answer' : string,
  'scope' : string,
}
export interface Approval {
  'id' : bigint,
  'status' : ApprovalStatus,
  'title' : string,
  'responder' : [] | [Principal],
  'body' : string,
  'createdAt' : bigint,
  'responseComment' : string,
  'projectId' : bigint,
  'respondedAt' : [] | [bigint],
}
export type ApprovalStatus = { 'Approved' : null } |
  { 'Rejected' : null } |
  { 'Pending' : null };
export interface AuditEvent {
  'id' : bigint,
  'action' : string,
  'createdAt' : bigint,
  'summary' : string,
  'target' : string,
  'actorPrincipal' : Principal,
}
export interface Client {
  'id' : bigint,
  'portalPrincipal' : [] | [Principal],
  'contactName' : string,
  'name' : string,
  'createdAt' : bigint,
  'contactEmail' : string,
}
export interface ClientPortalView {
  'client' : Client,
  'tasks' : Array<Task>,
  'documents' : Array<DocumentRecord>,
  'projects' : Array<Project>,
  'notes' : Array<Note>,
  'approvals' : Array<Approval>,
}
export interface DocumentRecord {
  'id' : bigint,
  'contentHash' : string,
  'name' : string,
  'createdAt' : bigint,
  'mimeType' : string,
  'encryptedKeyRef' : string,
  'projectId' : bigint,
  'sizeBytes' : bigint,
}
export interface Note {
  'id' : bigint,
  'body' : string,
  'createdAt' : bigint,
  'author' : Principal,
  'projectId' : bigint,
}
export interface Project {
  'id' : bigint,
  'status' : ProjectStatus,
  'clientId' : bigint,
  'name' : string,
  'createdAt' : bigint,
  'summary' : string,
}
export type ProjectStatus = { 'Active' : null } |
  { 'Archived' : null } |
  { 'WaitingOnClient' : null } |
  { 'Completed' : null };
export interface PublicApproval {
  'id' : bigint,
  'status' : ApprovalStatus,
  'title' : string,
  'body' : string,
  'projectId' : bigint,
}
export interface PublicAuditEvent {
  'id' : bigint,
  'action' : string,
  'summary' : string,
  'target' : string,
}
export interface PublicClient { 'contactName' : string, 'name' : string }
export interface PublicDemoView {
  'tasks' : Array<PublicTask>,
  'documents' : Array<PublicDocumentRecord>,
  'audit' : Array<PublicAuditEvent>,
  'capabilities' : Array<string>,
  'projects' : Array<PublicProject>,
  'notes' : Array<PublicNote>,
  'workspace' : PublicWorkspace,
  'approvals' : Array<PublicApproval>,
  'clients' : Array<PublicClient>,
}
export interface PublicDocumentRecord {
  'id' : bigint,
  'contentHash' : string,
  'name' : string,
  'mimeType' : string,
  'projectId' : bigint,
  'sizeBytes' : bigint,
}
export interface PublicNote {
  'id' : bigint,
  'body' : string,
  'projectId' : bigint,
}
export interface PublicProject {
  'id' : bigint,
  'status' : ProjectStatus,
  'clientId' : bigint,
  'name' : string,
  'summary' : string,
}
export interface PublicTask {
  'id' : bigint,
  'status' : TaskStatus,
  'assignee' : string,
  'title' : string,
  'projectId' : bigint,
}
export interface PublicWorkspace {
  'ownerLabel' : string,
  'name' : string,
  'profile' : string,
}
export interface Task {
  'id' : bigint,
  'status' : TaskStatus,
  'assignee' : string,
  'title' : string,
  'createdAt' : bigint,
  'projectId' : bigint,
}
export type TaskStatus = { 'Done' : null } |
  { 'Open' : null } |
  { 'InProgress' : null };
export interface Workspace {
  'id' : bigint,
  'owner' : Principal,
  'name' : string,
  'createdAt' : bigint,
  'profile' : string,
}
export interface WorkspaceView {
  'tasks' : Array<Task>,
  'documents' : Array<DocumentRecord>,
  'audit' : Array<AuditEvent>,
  'projects' : Array<Project>,
  'notes' : Array<Note>,
  'workspace' : Workspace,
  'approvals' : Array<Approval>,
  'clients' : Array<Client>,
}
export interface _SERVICE {
  'add_admin' : ActorMethod<[Principal], Array<Principal>>,
  'append_note' : ActorMethod<[bigint, string], Note>,
  'approve_access_request' : ActorMethod<[bigint], Array<Principal>>,
  'ask_agent' : ActorMethod<[string, string], AgentResponse>,
  'create_approval' : ActorMethod<[bigint, string, string], Approval>,
  'create_client' : ActorMethod<
    [string, string, string, [] | [Principal]],
    Client
  >,
  'create_document_record' : ActorMethod<
    [bigint, string, string, bigint, string, string],
    DocumentRecord
  >,
  'create_project' : ActorMethod<[bigint, string, string], Project>,
  'create_task' : ActorMethod<[bigint, string, string], Task>,
  'get_client_portal' : ActorMethod<[bigint], [] | [ClientPortalView]>,
  'get_my_client_portals' : ActorMethod<[], Array<ClientPortalView>>,
  'get_my_workspace' : ActorMethod<[], [] | [WorkspaceView]>,
  'get_public_demo' : ActorMethod<[], [] | [PublicDemoView]>,
  'init_workspace' : ActorMethod<[string, string], Workspace>,
  'list_access_request_history' : ActorMethod<[], Array<AccessRequestReview>>,
  'list_access_requests' : ActorMethod<[], Array<AccessRequest>>,
  'list_audit' : ActorMethod<[bigint, bigint], Array<AuditEvent>>,
  'reject_access_request' : ActorMethod<[bigint, string], AccessRequest>,
  'request_operator_access' : ActorMethod<[string, string], AccessRequest>,
  'respond_approval' : ActorMethod<[bigint, ApprovalStatus, string], Approval>,
  'seed_demo' : ActorMethod<[], WorkspaceView>,
  'update_project_status' : ActorMethod<[bigint, ProjectStatus], Project>,
  'update_task_status' : ActorMethod<[bigint, TaskStatus], Task>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
