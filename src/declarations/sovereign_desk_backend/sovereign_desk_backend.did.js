export const idlFactory = ({ IDL }) => {
  const DocumentVersion = IDL.Record({
    'id' : IDL.Nat,
    'contentHash' : IDL.Text,
    'createdAt' : IDL.Int,
    'createdBy' : IDL.Principal,
    'version' : IDL.Nat,
    'encryptedKeyRef' : IDL.Text,
    'documentId' : IDL.Nat,
    'sizeBytes' : IDL.Nat,
  });
  const Note = IDL.Record({
    'id' : IDL.Nat,
    'body' : IDL.Text,
    'createdAt' : IDL.Int,
    'author' : IDL.Principal,
    'projectId' : IDL.Nat,
  });
  const DocumentArchiveRecord = IDL.Record({
    'documentId' : IDL.Nat,
    'reason' : IDL.Text,
    'archivedAt' : IDL.Int,
    'archivedBy' : IDL.Principal,
  });
  const AgentResponse = IDL.Record({
    'id' : IDL.Nat,
    'createdAt' : IDL.Int,
    'answer' : IDL.Text,
    'scope' : IDL.Text,
  });
  const Client = IDL.Record({
    'id' : IDL.Nat,
    'portalPrincipal' : IDL.Opt(IDL.Principal),
    'contactName' : IDL.Text,
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'contactEmail' : IDL.Text,
  });
  const TaskStatus = IDL.Variant({
    'Done' : IDL.Null,
    'Open' : IDL.Null,
    'InProgress' : IDL.Null,
  });
  const Task = IDL.Record({
    'id' : IDL.Nat,
    'status' : TaskStatus,
    'assignee' : IDL.Text,
    'title' : IDL.Text,
    'createdAt' : IDL.Int,
    'projectId' : IDL.Nat,
  });
  const DocumentRecord = IDL.Record({
    'id' : IDL.Nat,
    'contentHash' : IDL.Text,
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'mimeType' : IDL.Text,
    'encryptedKeyRef' : IDL.Text,
    'projectId' : IDL.Nat,
    'sizeBytes' : IDL.Nat,
  });
  const ProjectStatus = IDL.Variant({
    'Active' : IDL.Null,
    'Archived' : IDL.Null,
    'WaitingOnClient' : IDL.Null,
    'Completed' : IDL.Null,
  });
  const Project = IDL.Record({
    'id' : IDL.Nat,
    'status' : ProjectStatus,
    'clientId' : IDL.Nat,
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'summary' : IDL.Text,
  });
  const ApprovalStatus = IDL.Variant({
    'Approved' : IDL.Null,
    'Rejected' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const Approval = IDL.Record({
    'id' : IDL.Nat,
    'status' : ApprovalStatus,
    'title' : IDL.Text,
    'responder' : IDL.Opt(IDL.Principal),
    'body' : IDL.Text,
    'createdAt' : IDL.Int,
    'responseComment' : IDL.Text,
    'projectId' : IDL.Nat,
    'respondedAt' : IDL.Opt(IDL.Int),
  });
  const ClientPortalView = IDL.Record({
    'client' : Client,
    'tasks' : IDL.Vec(Task),
    'documents' : IDL.Vec(DocumentRecord),
    'projects' : IDL.Vec(Project),
    'notes' : IDL.Vec(Note),
    'approvals' : IDL.Vec(Approval),
  });
  const ClientInvite = IDL.Record({
    'id' : IDL.Nat,
    'clientId' : IDL.Nat,
    'code' : IDL.Text,
    'note' : IDL.Text,
    'createdAt' : IDL.Int,
    'createdBy' : IDL.Principal,
    'claimedAt' : IDL.Opt(IDL.Int),
    'claimedBy' : IDL.Opt(IDL.Principal),
    'revokedAt' : IDL.Opt(IDL.Int),
  });
  const GovernanceProposalKind = IDL.Variant({
    'SNS' : IDL.Null,
    'Multisig' : IDL.Null,
    'ControllerMigration' : IDL.Null,
    'VaultPolicy' : IDL.Null,
    'Other' : IDL.Null,
    'Launchtrail' : IDL.Null,
  });
  const GovernanceProposalStatus = IDL.Variant({
    'Open' : IDL.Null,
    'Approved' : IDL.Null,
    'Rejected' : IDL.Null,
  });
  const GovernanceProposal = IDL.Record({
    'id' : IDL.Nat,
    'status' : GovernanceProposalStatus,
    'title' : IDL.Text,
    'body' : IDL.Text,
    'kind' : GovernanceProposalKind,
    'createdAt' : IDL.Int,
    'createdBy' : IDL.Principal,
    'reviewComment' : IDL.Text,
    'reviewedAt' : IDL.Opt(IDL.Int),
    'reviewedBy' : IDL.Opt(IDL.Principal),
  });
  const AuditEvent = IDL.Record({
    'id' : IDL.Nat,
    'action' : IDL.Text,
    'createdAt' : IDL.Int,
    'summary' : IDL.Text,
    'target' : IDL.Text,
    'actorPrincipal' : IDL.Principal,
  });
  const DocumentHashVerification = IDL.Record({
    'id' : IDL.Nat,
    'submittedHash' : IDL.Text,
    'versionId' : IDL.Opt(IDL.Nat),
    'matches' : IDL.Bool,
    'documentId' : IDL.Nat,
    'expectedHash' : IDL.Text,
    'verifiedAt' : IDL.Int,
    'verifiedBy' : IDL.Principal,
  });
  const EncryptedDocumentObject = IDL.Record({
    'id' : IDL.Nat,
    'iv' : IDL.Vec(IDL.Nat8),
    'versionId' : IDL.Opt(IDL.Nat),
    'algorithm' : IDL.Text,
    'ciphertextHash' : IDL.Text,
    'ciphertext' : IDL.Vec(IDL.Nat8),
    'createdAt' : IDL.Int,
    'createdBy' : IDL.Principal,
    'keyDerivationContext' : IDL.Text,
    'documentId' : IDL.Nat,
  });
  const Workspace = IDL.Record({
    'id' : IDL.Nat,
    'owner' : IDL.Principal,
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'profile' : IDL.Text,
  });
  const AccessRequest = IDL.Record({
    'id' : IDL.Nat,
    'principal' : IDL.Principal,
    'note' : IDL.Text,
    'createdAt' : IDL.Int,
    'email' : IDL.Text,
  });
  const Role = IDL.Variant({
    'Operator' : IDL.Null,
    'Client' : IDL.Null,
    'Reviewer' : IDL.Null,
    'Admin' : IDL.Null,
    'Owner' : IDL.Null,
  });
  const RoleGrant = IDL.Record({
    'principal' : IDL.Principal,
    'clientId' : IDL.Opt(IDL.Nat),
    'createdAt' : IDL.Int,
    'role' : Role,
  });
  const StateSnapshot = IDL.Record({
    'tasks' : IDL.Vec(Task),
    'clientInvites' : IDL.Vec(ClientInvite),
    'nextDocumentId' : IDL.Nat,
    'documents' : IDL.Vec(DocumentRecord),
    'nextAccessRequestId' : IDL.Nat,
    'nextAgentResponseId' : IDL.Nat,
    'audit' : IDL.Vec(AuditEvent),
    'projects' : IDL.Vec(Project),
    'nextAuditId' : IDL.Nat,
    'nextTaskId' : IDL.Nat,
    'documentVersions' : IDL.Vec(DocumentVersion),
    'nextEncryptedDocumentObjectId' : IDL.Nat,
    'documentArchives' : IDL.Vec(DocumentArchiveRecord),
    'nextGovernanceProposalId' : IDL.Nat,
    'exportedAt' : IDL.Int,
    'documentHashVerifications' : IDL.Vec(DocumentHashVerification),
    'encryptedDocumentObjects' : IDL.Vec(EncryptedDocumentObject),
    'nextApprovalId' : IDL.Nat,
    'notes' : IDL.Vec(Note),
    'workspace' : IDL.Opt(Workspace),
    'nextProjectId' : IDL.Nat,
    'accessRequests' : IDL.Vec(AccessRequest),
    'governanceProposals' : IDL.Vec(GovernanceProposal),
    'nextClientId' : IDL.Nat,
    'schemaVersion' : IDL.Nat,
    'rejectedAccessRequestIds' : IDL.Vec(IDL.Nat),
    'nextDocumentVerificationId' : IDL.Nat,
    'approvedAccessRequestIds' : IDL.Vec(IDL.Nat),
    'nextWorkspaceId' : IDL.Nat,
    'nextNoteId' : IDL.Nat,
    'roleGrants' : IDL.Vec(RoleGrant),
    'approvals' : IDL.Vec(Approval),
    'nextClientInviteId' : IDL.Nat,
    'clients' : IDL.Vec(Client),
    'nextDocumentVersionId' : IDL.Nat,
  });
  const WorkspaceView = IDL.Record({
    'tasks' : IDL.Vec(Task),
    'documents' : IDL.Vec(DocumentRecord),
    'audit' : IDL.Vec(AuditEvent),
    'projects' : IDL.Vec(Project),
    'notes' : IDL.Vec(Note),
    'workspace' : Workspace,
    'approvals' : IDL.Vec(Approval),
    'clients' : IDL.Vec(Client),
  });
  const PublicTask = IDL.Record({
    'id' : IDL.Nat,
    'status' : TaskStatus,
    'assignee' : IDL.Text,
    'title' : IDL.Text,
    'projectId' : IDL.Nat,
  });
  const PublicDocumentRecord = IDL.Record({
    'id' : IDL.Nat,
    'contentHash' : IDL.Text,
    'name' : IDL.Text,
    'mimeType' : IDL.Text,
    'projectId' : IDL.Nat,
    'sizeBytes' : IDL.Nat,
  });
  const PublicAuditEvent = IDL.Record({
    'id' : IDL.Nat,
    'action' : IDL.Text,
    'summary' : IDL.Text,
    'target' : IDL.Text,
  });
  const PublicProject = IDL.Record({
    'id' : IDL.Nat,
    'status' : ProjectStatus,
    'clientId' : IDL.Nat,
    'name' : IDL.Text,
    'summary' : IDL.Text,
  });
  const PublicNote = IDL.Record({
    'id' : IDL.Nat,
    'body' : IDL.Text,
    'projectId' : IDL.Nat,
  });
  const PublicWorkspace = IDL.Record({
    'ownerLabel' : IDL.Text,
    'name' : IDL.Text,
    'profile' : IDL.Text,
  });
  const PublicApproval = IDL.Record({
    'id' : IDL.Nat,
    'status' : ApprovalStatus,
    'title' : IDL.Text,
    'body' : IDL.Text,
    'projectId' : IDL.Nat,
  });
  const PublicClient = IDL.Record({
    'contactName' : IDL.Text,
    'name' : IDL.Text,
  });
  const PublicDemoView = IDL.Record({
    'tasks' : IDL.Vec(PublicTask),
    'documents' : IDL.Vec(PublicDocumentRecord),
    'audit' : IDL.Vec(PublicAuditEvent),
    'capabilities' : IDL.Vec(IDL.Text),
    'projects' : IDL.Vec(PublicProject),
    'notes' : IDL.Vec(PublicNote),
    'workspace' : PublicWorkspace,
    'approvals' : IDL.Vec(PublicApproval),
    'clients' : IDL.Vec(PublicClient),
  });
  const StateCounts = IDL.Record({
    'tasks' : IDL.Nat,
    'clientInvites' : IDL.Nat,
    'documents' : IDL.Nat,
    'audit' : IDL.Nat,
    'projects' : IDL.Nat,
    'documentVersions' : IDL.Nat,
    'documentArchives' : IDL.Nat,
    'documentHashVerifications' : IDL.Nat,
    'encryptedDocumentObjects' : IDL.Nat,
    'notes' : IDL.Nat,
    'accessRequests' : IDL.Nat,
    'governanceProposals' : IDL.Nat,
    'roleGrants' : IDL.Nat,
    'approvals' : IDL.Nat,
    'clients' : IDL.Nat,
  });
  const SystemInfo = IDL.Record({
    'workspaceInitialized' : IDL.Bool,
    'owner' : IDL.Opt(IDL.Principal),
    'schemaVersion' : IDL.Nat,
    'counts' : StateCounts,
    'backendName' : IDL.Text,
  });
  const AccessRequestStatus = IDL.Variant({
    'Approved' : IDL.Null,
    'Rejected' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const AccessRequestReview = IDL.Record({
    'status' : AccessRequestStatus,
    'request' : AccessRequest,
  });
  const EncryptedDocumentObjectInfo = IDL.Record({
    'id' : IDL.Nat,
    'versionId' : IDL.Opt(IDL.Nat),
    'algorithm' : IDL.Text,
    'ciphertextHash' : IDL.Text,
    'ciphertextSize' : IDL.Nat,
    'ivSize' : IDL.Nat,
    'createdAt' : IDL.Int,
    'createdBy' : IDL.Principal,
    'keyDerivationContext' : IDL.Text,
    'documentId' : IDL.Nat,
  });
  return IDL.Service({
    'add_admin' : IDL.Func([IDL.Principal], [IDL.Vec(IDL.Principal)], []),
    'add_document_version' : IDL.Func(
        [IDL.Nat, IDL.Nat, IDL.Text, IDL.Text],
        [DocumentVersion],
        [],
      ),
    'append_note' : IDL.Func([IDL.Nat, IDL.Text], [Note], []),
    'approve_access_request' : IDL.Func(
        [IDL.Nat],
        [IDL.Vec(IDL.Principal)],
        [],
      ),
    'archive_document_record' : IDL.Func(
        [IDL.Nat, IDL.Text],
        [DocumentArchiveRecord],
        [],
      ),
    'ask_agent' : IDL.Func([IDL.Text, IDL.Text], [AgentResponse], []),
    'claim_client_invite' : IDL.Func(
        [IDL.Nat, IDL.Text],
        [ClientPortalView],
        [],
      ),
    'create_approval' : IDL.Func([IDL.Nat, IDL.Text, IDL.Text], [Approval], []),
    'create_client' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Opt(IDL.Principal)],
        [Client],
        [],
      ),
    'create_client_invite' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text],
        [ClientInvite],
        [],
      ),
    'create_document_record' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Text],
        [DocumentRecord],
        [],
      ),
    'create_governance_proposal' : IDL.Func(
        [GovernanceProposalKind, IDL.Text, IDL.Text],
        [GovernanceProposal],
        [],
      ),
    'create_project' : IDL.Func([IDL.Nat, IDL.Text, IDL.Text], [Project], []),
    'create_task' : IDL.Func([IDL.Nat, IDL.Text, IDL.Text], [Task], []),
    'export_state_snapshot' : IDL.Func([], [StateSnapshot], ['query']),
    'get_client_portal' : IDL.Func(
        [IDL.Nat],
        [IDL.Opt(ClientPortalView)],
        ['query'],
      ),
    'get_encrypted_document_object' : IDL.Func(
        [IDL.Nat],
        [IDL.Opt(EncryptedDocumentObject)],
        ['query'],
      ),
    'get_my_client_portals' : IDL.Func(
        [],
        [IDL.Vec(ClientPortalView)],
        ['query'],
      ),
    'get_my_roles' : IDL.Func([], [IDL.Vec(RoleGrant)], ['query']),
    'get_my_workspace' : IDL.Func([], [IDL.Opt(WorkspaceView)], ['query']),
    'get_public_demo' : IDL.Func([], [IDL.Opt(PublicDemoView)], ['query']),
    'get_system_info' : IDL.Func([], [SystemInfo], ['query']),
    'get_vetkey_derivation_context' : IDL.Func(
        [IDL.Nat, IDL.Principal],
        [IDL.Text],
        ['query'],
      ),
    'grant_role' : IDL.Func(
        [IDL.Principal, Role, IDL.Opt(IDL.Nat)],
        [IDL.Vec(RoleGrant)],
        [],
      ),
    'init_workspace' : IDL.Func([IDL.Text, IDL.Text], [Workspace], []),
    'list_access_request_history' : IDL.Func(
        [],
        [IDL.Vec(AccessRequestReview)],
        ['query'],
      ),
    'list_access_requests' : IDL.Func([], [IDL.Vec(AccessRequest)], ['query']),
    'list_audit' : IDL.Func(
        [IDL.Nat, IDL.Nat],
        [IDL.Vec(AuditEvent)],
        ['query'],
      ),
    'list_client_invites' : IDL.Func([], [IDL.Vec(ClientInvite)], ['query']),
    'list_document_archives' : IDL.Func(
        [],
        [IDL.Vec(DocumentArchiveRecord)],
        ['query'],
      ),
    'list_document_verifications' : IDL.Func(
        [IDL.Nat],
        [IDL.Vec(DocumentHashVerification)],
        ['query'],
      ),
    'list_document_versions' : IDL.Func(
        [IDL.Nat],
        [IDL.Vec(DocumentVersion)],
        ['query'],
      ),
    'list_encrypted_document_objects' : IDL.Func(
        [IDL.Nat],
        [IDL.Vec(EncryptedDocumentObjectInfo)],
        ['query'],
      ),
    'list_governance_proposals' : IDL.Func(
        [],
        [IDL.Vec(GovernanceProposal)],
        ['query'],
      ),
    'list_role_grants' : IDL.Func([], [IDL.Vec(RoleGrant)], ['query']),
    'migrate_schema_version' : IDL.Func([], [IDL.Nat], []),
    'reject_access_request' : IDL.Func(
        [IDL.Nat, IDL.Text],
        [AccessRequest],
        [],
      ),
    'request_operator_access' : IDL.Func(
        [IDL.Text, IDL.Text],
        [AccessRequest],
        [],
      ),
    'respond_approval' : IDL.Func(
        [IDL.Nat, ApprovalStatus, IDL.Text],
        [Approval],
        [],
      ),
    'review_governance_proposal' : IDL.Func(
        [IDL.Nat, GovernanceProposalStatus, IDL.Text],
        [GovernanceProposal],
        [],
      ),
    'revoke_client_invite' : IDL.Func([IDL.Nat], [ClientInvite], []),
    'revoke_role' : IDL.Func(
        [IDL.Principal, Role, IDL.Opt(IDL.Nat)],
        [IDL.Vec(RoleGrant)],
        [],
      ),
    'rotate_client_principal' : IDL.Func(
        [IDL.Nat, IDL.Principal],
        [Client],
        [],
      ),
    'seed_demo' : IDL.Func([], [WorkspaceView], []),
    'store_encrypted_document_object' : IDL.Func(
        [
          IDL.Nat,
          IDL.Opt(IDL.Nat),
          IDL.Text,
          IDL.Text,
          IDL.Vec(IDL.Nat8),
          IDL.Vec(IDL.Nat8),
          IDL.Text,
        ],
        [EncryptedDocumentObjectInfo],
        [],
      ),
    'update_client' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text, IDL.Text],
        [Client],
        [],
      ),
    'update_document_record' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [DocumentRecord],
        [],
      ),
    'update_note' : IDL.Func([IDL.Nat, IDL.Text], [Note], []),
    'update_project' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text, ProjectStatus],
        [Project],
        [],
      ),
    'update_project_status' : IDL.Func([IDL.Nat, ProjectStatus], [Project], []),
    'update_task' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text, TaskStatus],
        [Task],
        [],
      ),
    'update_task_status' : IDL.Func([IDL.Nat, TaskStatus], [Task], []),
    'verify_document_hash' : IDL.Func(
        [IDL.Nat, IDL.Opt(IDL.Nat), IDL.Text],
        [DocumentHashVerification],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
