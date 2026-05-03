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
export interface ClientInvite {
  'id' : bigint,
  'clientId' : bigint,
  'code' : string,
  'note' : string,
  'createdAt' : bigint,
  'createdBy' : Principal,
  'claimedAt' : [] | [bigint],
  'claimedBy' : [] | [Principal],
  'revokedAt' : [] | [bigint],
}
export interface ClientPortalView {
  'client' : Client,
  'tasks' : Array<Task>,
  'documents' : Array<DocumentRecord>,
  'projects' : Array<Project>,
  'notes' : Array<Note>,
  'approvals' : Array<Approval>,
}
export interface DocumentArchiveRecord {
  'documentId' : bigint,
  'reason' : string,
  'archivedAt' : bigint,
  'archivedBy' : Principal,
}
export interface DocumentHashVerification {
  'id' : bigint,
  'submittedHash' : string,
  'versionId' : [] | [bigint],
  'matches' : boolean,
  'documentId' : bigint,
  'expectedHash' : string,
  'verifiedAt' : bigint,
  'verifiedBy' : Principal,
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
export interface DocumentVersion {
  'id' : bigint,
  'contentHash' : string,
  'createdAt' : bigint,
  'createdBy' : Principal,
  'version' : bigint,
  'encryptedKeyRef' : string,
  'documentId' : bigint,
  'sizeBytes' : bigint,
}
export interface EncryptedDocumentObject {
  'id' : bigint,
  'iv' : Uint8Array | number[],
  'versionId' : [] | [bigint],
  'algorithm' : string,
  'ciphertextHash' : string,
  'ciphertext' : Uint8Array | number[],
  'createdAt' : bigint,
  'createdBy' : Principal,
  'keyDerivationContext' : string,
  'documentId' : bigint,
}
export interface EncryptedDocumentObjectInfo {
  'id' : bigint,
  'versionId' : [] | [bigint],
  'algorithm' : string,
  'ciphertextHash' : string,
  'ciphertextSize' : bigint,
  'ivSize' : bigint,
  'createdAt' : bigint,
  'createdBy' : Principal,
  'keyDerivationContext' : string,
  'documentId' : bigint,
}
export interface GovernanceProposal {
  'id' : bigint,
  'status' : GovernanceProposalStatus,
  'title' : string,
  'body' : string,
  'kind' : GovernanceProposalKind,
  'createdAt' : bigint,
  'createdBy' : Principal,
  'reviewComment' : string,
  'reviewedAt' : [] | [bigint],
  'reviewedBy' : [] | [Principal],
}
export type GovernanceProposalKind = { 'SNS' : null } |
  { 'Multisig' : null } |
  { 'ControllerMigration' : null } |
  { 'VaultPolicy' : null } |
  { 'Other' : null } |
  { 'Launchtrail' : null };
export type GovernanceProposalStatus = { 'Open' : null } |
  { 'Approved' : null } |
  { 'Rejected' : null };
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
export type Role = { 'Operator' : null } |
  { 'Client' : null } |
  { 'Reviewer' : null } |
  { 'Admin' : null } |
  { 'Owner' : null };
export interface RoleGrant {
  'principal' : Principal,
  'clientId' : [] | [bigint],
  'createdAt' : bigint,
  'role' : Role,
}
export interface StateCounts {
  'tasks' : bigint,
  'clientInvites' : bigint,
  'documents' : bigint,
  'audit' : bigint,
  'projects' : bigint,
  'documentVersions' : bigint,
  'documentArchives' : bigint,
  'documentHashVerifications' : bigint,
  'encryptedDocumentObjects' : bigint,
  'notes' : bigint,
  'accessRequests' : bigint,
  'governanceProposals' : bigint,
  'roleGrants' : bigint,
  'approvals' : bigint,
  'clients' : bigint,
}
export interface StateSnapshot {
  'tasks' : Array<Task>,
  'clientInvites' : Array<ClientInvite>,
  'nextDocumentId' : bigint,
  'documents' : Array<DocumentRecord>,
  'nextAccessRequestId' : bigint,
  'nextAgentResponseId' : bigint,
  'audit' : Array<AuditEvent>,
  'projects' : Array<Project>,
  'nextAuditId' : bigint,
  'nextTaskId' : bigint,
  'documentVersions' : Array<DocumentVersion>,
  'nextEncryptedDocumentObjectId' : bigint,
  'documentArchives' : Array<DocumentArchiveRecord>,
  'nextGovernanceProposalId' : bigint,
  'exportedAt' : bigint,
  'documentHashVerifications' : Array<DocumentHashVerification>,
  'encryptedDocumentObjects' : Array<EncryptedDocumentObject>,
  'nextApprovalId' : bigint,
  'notes' : Array<Note>,
  'workspace' : [] | [Workspace],
  'nextProjectId' : bigint,
  'accessRequests' : Array<AccessRequest>,
  'governanceProposals' : Array<GovernanceProposal>,
  'nextClientId' : bigint,
  'schemaVersion' : bigint,
  'rejectedAccessRequestIds' : Array<bigint>,
  'nextDocumentVerificationId' : bigint,
  'approvedAccessRequestIds' : Array<bigint>,
  'nextWorkspaceId' : bigint,
  'nextNoteId' : bigint,
  'roleGrants' : Array<RoleGrant>,
  'approvals' : Array<Approval>,
  'nextClientInviteId' : bigint,
  'clients' : Array<Client>,
  'nextDocumentVersionId' : bigint,
}
export interface SystemInfo {
  'workspaceInitialized' : boolean,
  'owner' : [] | [Principal],
  'schemaVersion' : bigint,
  'counts' : StateCounts,
  'backendName' : string,
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
  'add_document_version' : ActorMethod<
    [bigint, bigint, string, string],
    DocumentVersion
  >,
  'append_note' : ActorMethod<[bigint, string], Note>,
  'approve_access_request' : ActorMethod<[bigint], Array<Principal>>,
  'archive_document_record' : ActorMethod<
    [bigint, string],
    DocumentArchiveRecord
  >,
  'ask_agent' : ActorMethod<[string, string], AgentResponse>,
  'claim_client_invite' : ActorMethod<[bigint, string], ClientPortalView>,
  'create_approval' : ActorMethod<[bigint, string, string], Approval>,
  'create_client' : ActorMethod<
    [string, string, string, [] | [Principal]],
    Client
  >,
  'create_client_invite' : ActorMethod<[bigint, string, string], ClientInvite>,
  'create_document_record' : ActorMethod<
    [bigint, string, string, bigint, string, string],
    DocumentRecord
  >,
  'create_governance_proposal' : ActorMethod<
    [GovernanceProposalKind, string, string],
    GovernanceProposal
  >,
  'create_project' : ActorMethod<[bigint, string, string], Project>,
  'create_task' : ActorMethod<[bigint, string, string], Task>,
  'export_state_snapshot' : ActorMethod<[], StateSnapshot>,
  'get_client_portal' : ActorMethod<[bigint], [] | [ClientPortalView]>,
  'get_encrypted_document_object' : ActorMethod<
    [bigint],
    [] | [EncryptedDocumentObject]
  >,
  'get_my_client_portals' : ActorMethod<[], Array<ClientPortalView>>,
  'get_my_roles' : ActorMethod<[], Array<RoleGrant>>,
  'get_my_workspace' : ActorMethod<[], [] | [WorkspaceView]>,
  'get_public_demo' : ActorMethod<[], [] | [PublicDemoView]>,
  'get_system_info' : ActorMethod<[], SystemInfo>,
  'get_vetkey_derivation_context' : ActorMethod<[bigint, Principal], string>,
  'grant_role' : ActorMethod<
    [Principal, Role, [] | [bigint]],
    Array<RoleGrant>
  >,
  'init_workspace' : ActorMethod<[string, string], Workspace>,
  'list_access_request_history' : ActorMethod<[], Array<AccessRequestReview>>,
  'list_access_requests' : ActorMethod<[], Array<AccessRequest>>,
  'list_audit' : ActorMethod<[bigint, bigint], Array<AuditEvent>>,
  'list_client_invites' : ActorMethod<[], Array<ClientInvite>>,
  'list_document_archives' : ActorMethod<[], Array<DocumentArchiveRecord>>,
  'list_document_verifications' : ActorMethod<
    [bigint],
    Array<DocumentHashVerification>
  >,
  'list_document_versions' : ActorMethod<[bigint], Array<DocumentVersion>>,
  'list_encrypted_document_objects' : ActorMethod<
    [bigint],
    Array<EncryptedDocumentObjectInfo>
  >,
  'list_governance_proposals' : ActorMethod<[], Array<GovernanceProposal>>,
  'list_role_grants' : ActorMethod<[], Array<RoleGrant>>,
  'migrate_schema_version' : ActorMethod<[], bigint>,
  'reject_access_request' : ActorMethod<[bigint, string], AccessRequest>,
  'request_operator_access' : ActorMethod<[string, string], AccessRequest>,
  'respond_approval' : ActorMethod<[bigint, ApprovalStatus, string], Approval>,
  'review_governance_proposal' : ActorMethod<
    [bigint, GovernanceProposalStatus, string],
    GovernanceProposal
  >,
  'revoke_client_invite' : ActorMethod<[bigint], ClientInvite>,
  'revoke_role' : ActorMethod<
    [Principal, Role, [] | [bigint]],
    Array<RoleGrant>
  >,
  'rotate_client_principal' : ActorMethod<[bigint, Principal], Client>,
  'seed_demo' : ActorMethod<[], WorkspaceView>,
  'store_encrypted_document_object' : ActorMethod<
    [
      bigint,
      [] | [bigint],
      string,
      string,
      Uint8Array | number[],
      Uint8Array | number[],
      string,
    ],
    EncryptedDocumentObjectInfo
  >,
  'update_client' : ActorMethod<[bigint, string, string, string], Client>,
  'update_document_record' : ActorMethod<
    [bigint, string, string, string, string],
    DocumentRecord
  >,
  'update_note' : ActorMethod<[bigint, string], Note>,
  'update_project' : ActorMethod<
    [bigint, string, string, ProjectStatus],
    Project
  >,
  'update_project_status' : ActorMethod<[bigint, ProjectStatus], Project>,
  'update_task' : ActorMethod<[bigint, string, string, TaskStatus], Task>,
  'update_task_status' : ActorMethod<[bigint, TaskStatus], Task>,
  'verify_document_hash' : ActorMethod<
    [bigint, [] | [bigint], string],
    DocumentHashVerification
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
