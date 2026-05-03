export const idlFactory = ({ IDL }) => {
  const Note = IDL.Record({
    'id' : IDL.Nat,
    'body' : IDL.Text,
    'createdAt' : IDL.Int,
    'author' : IDL.Principal,
    'projectId' : IDL.Nat,
  });
  const AgentResponse = IDL.Record({
    'id' : IDL.Nat,
    'createdAt' : IDL.Int,
    'answer' : IDL.Text,
    'scope' : IDL.Text,
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
  const Client = IDL.Record({
    'id' : IDL.Nat,
    'portalPrincipal' : IDL.Opt(IDL.Principal),
    'contactName' : IDL.Text,
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'contactEmail' : IDL.Text,
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
  const ClientPortalView = IDL.Record({
    'client' : Client,
    'tasks' : IDL.Vec(Task),
    'documents' : IDL.Vec(DocumentRecord),
    'projects' : IDL.Vec(Project),
    'notes' : IDL.Vec(Note),
    'approvals' : IDL.Vec(Approval),
  });
  const AuditEvent = IDL.Record({
    'id' : IDL.Nat,
    'action' : IDL.Text,
    'createdAt' : IDL.Int,
    'summary' : IDL.Text,
    'target' : IDL.Text,
    'actorPrincipal' : IDL.Principal,
  });
  const Workspace = IDL.Record({
    'id' : IDL.Nat,
    'owner' : IDL.Principal,
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'profile' : IDL.Text,
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
  const AccessRequestStatus = IDL.Variant({
    'Approved' : IDL.Null,
    'Rejected' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const AccessRequest = IDL.Record({
    'id' : IDL.Nat,
    'principal' : IDL.Principal,
    'note' : IDL.Text,
    'createdAt' : IDL.Int,
    'email' : IDL.Text,
  });
  const AccessRequestReview = IDL.Record({
    'status' : AccessRequestStatus,
    'request' : AccessRequest,
  });
  return IDL.Service({
    'add_admin' : IDL.Func([IDL.Principal], [IDL.Vec(IDL.Principal)], []),
    'append_note' : IDL.Func([IDL.Nat, IDL.Text], [Note], []),
    'approve_access_request' : IDL.Func(
        [IDL.Nat],
        [IDL.Vec(IDL.Principal)],
        [],
      ),
    'ask_agent' : IDL.Func([IDL.Text, IDL.Text], [AgentResponse], []),
    'create_approval' : IDL.Func([IDL.Nat, IDL.Text, IDL.Text], [Approval], []),
    'create_client' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Opt(IDL.Principal)],
        [Client],
        [],
      ),
    'create_document_record' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Text],
        [DocumentRecord],
        [],
      ),
    'create_project' : IDL.Func([IDL.Nat, IDL.Text, IDL.Text], [Project], []),
    'create_task' : IDL.Func([IDL.Nat, IDL.Text, IDL.Text], [Task], []),
    'get_client_portal' : IDL.Func(
        [IDL.Nat],
        [IDL.Opt(ClientPortalView)],
        ['query'],
      ),
    'get_my_client_portals' : IDL.Func(
        [],
        [IDL.Vec(ClientPortalView)],
        ['query'],
      ),
    'get_my_workspace' : IDL.Func([], [IDL.Opt(WorkspaceView)], ['query']),
    'get_public_demo' : IDL.Func([], [IDL.Opt(PublicDemoView)], ['query']),
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
    'seed_demo' : IDL.Func([], [WorkspaceView], []),
    'update_project_status' : IDL.Func([IDL.Nat, ProjectStatus], [Project], []),
    'update_task_status' : IDL.Func([IDL.Nat, TaskStatus], [Task], []),
  });
};
export const init = ({ IDL }) => { return []; };
