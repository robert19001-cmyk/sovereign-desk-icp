import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";

persistent actor {
  let bootstrapOwner : Principal = Principal.fromText("up6xy-uol7y-xisiv-3oron-gl7d3-usnrr-r5ong-hiqu2-hnd2h-cufv3-pqe");
  var currentSchemaVersion : Nat = 4;

  public type Workspace = {
    id : Nat;
    name : Text;
    profile : Text;
    owner : Principal;
    createdAt : Int;
  };

  public type Client = {
    id : Nat;
    name : Text;
    contactName : Text;
    contactEmail : Text;
    portalPrincipal : ?Principal;
    createdAt : Int;
  };

  public type ProjectStatus = { #Active; #WaitingOnClient; #Completed; #Archived };

  public type Project = {
    id : Nat;
    clientId : Nat;
    name : Text;
    summary : Text;
    status : ProjectStatus;
    createdAt : Int;
  };

  public type TaskStatus = { #Open; #InProgress; #Done };

  public type Task = {
    id : Nat;
    projectId : Nat;
    title : Text;
    assignee : Text;
    status : TaskStatus;
    createdAt : Int;
  };

  public type ApprovalStatus = { #Pending; #Approved; #Rejected };

  public type Approval = {
    id : Nat;
    projectId : Nat;
    title : Text;
    body : Text;
    status : ApprovalStatus;
    responder : ?Principal;
    responseComment : Text;
    createdAt : Int;
    respondedAt : ?Int;
  };

  public type DocumentRecord = {
    id : Nat;
    projectId : Nat;
    name : Text;
    mimeType : Text;
    sizeBytes : Nat;
    encryptedKeyRef : Text;
    contentHash : Text;
    createdAt : Int;
  };

  public type DocumentVersion = {
    id : Nat;
    documentId : Nat;
    version : Nat;
    sizeBytes : Nat;
    encryptedKeyRef : Text;
    contentHash : Text;
    createdBy : Principal;
    createdAt : Int;
  };

  public type DocumentArchiveRecord = {
    documentId : Nat;
    archivedBy : Principal;
    archivedAt : Int;
    reason : Text;
  };

  public type DocumentHashVerification = {
    id : Nat;
    documentId : Nat;
    versionId : ?Nat;
    submittedHash : Text;
    expectedHash : Text;
    matches : Bool;
    verifiedBy : Principal;
    verifiedAt : Int;
  };

  public type Note = {
    id : Nat;
    projectId : Nat;
    body : Text;
    author : Principal;
    createdAt : Int;
  };

  public type AuditEvent = {
    id : Nat;
    actorPrincipal : Principal;
    action : Text;
    target : Text;
    summary : Text;
    createdAt : Int;
  };

  public type WorkspaceView = {
    workspace : Workspace;
    clients : [Client];
    projects : [Project];
    tasks : [Task];
    approvals : [Approval];
    documents : [DocumentRecord];
    notes : [Note];
    audit : [AuditEvent];
  };

  public type StateCounts = {
    clients : Nat;
    projects : Nat;
    tasks : Nat;
    approvals : Nat;
    documents : Nat;
    notes : Nat;
    audit : Nat;
    accessRequests : Nat;
    roleGrants : Nat;
    clientInvites : Nat;
    documentVersions : Nat;
    documentArchives : Nat;
    documentHashVerifications : Nat;
  };

  public type SystemInfo = {
    schemaVersion : Nat;
    backendName : Text;
    workspaceInitialized : Bool;
    owner : ?Principal;
    counts : StateCounts;
  };

  public type StateSnapshot = {
    schemaVersion : Nat;
    exportedAt : Int;
    workspace : ?Workspace;
    clients : [Client];
    projects : [Project];
    tasks : [Task];
    approvals : [Approval];
    documents : [DocumentRecord];
    notes : [Note];
    audit : [AuditEvent];
    accessRequests : [AccessRequest];
    approvedAccessRequestIds : [Nat];
    rejectedAccessRequestIds : [Nat];
    roleGrants : [RoleGrant];
    clientInvites : [ClientInvite];
    documentVersions : [DocumentVersion];
    documentArchives : [DocumentArchiveRecord];
    documentHashVerifications : [DocumentHashVerification];
    nextWorkspaceId : Nat;
    nextClientId : Nat;
    nextProjectId : Nat;
    nextTaskId : Nat;
    nextApprovalId : Nat;
    nextDocumentId : Nat;
    nextNoteId : Nat;
    nextAuditId : Nat;
    nextAgentResponseId : Nat;
    nextAccessRequestId : Nat;
    nextClientInviteId : Nat;
    nextDocumentVersionId : Nat;
    nextDocumentVerificationId : Nat;
  };

  public type ClientPortalView = {
    client : Client;
    projects : [Project];
    tasks : [Task];
    approvals : [Approval];
    documents : [DocumentRecord];
    notes : [Note];
  };

  public type AgentResponse = {
    id : Nat;
    scope : Text;
    answer : Text;
    createdAt : Int;
  };

  public type AccessRequest = {
    id : Nat;
    principal : Principal;
    email : Text;
    note : Text;
    createdAt : Int;
  };

  public type AccessRequestStatus = { #Pending; #Approved; #Rejected };

  public type AccessRequestReview = {
    request : AccessRequest;
    status : AccessRequestStatus;
  };

  public type Role = { #Owner; #Admin; #Operator; #Client; #Reviewer };

  public type RoleGrant = {
    principal : Principal;
    role : Role;
    clientId : ?Nat;
    createdAt : Int;
  };

  public type ClientInvite = {
    id : Nat;
    clientId : Nat;
    code : Text;
    note : Text;
    createdBy : Principal;
    createdAt : Int;
    claimedBy : ?Principal;
    claimedAt : ?Int;
    revokedAt : ?Int;
  };

  public type PublicWorkspace = {
    name : Text;
    profile : Text;
    ownerLabel : Text;
  };

  public type PublicClient = {
    name : Text;
    contactName : Text;
  };

  public type PublicProject = {
    id : Nat;
    clientId : Nat;
    name : Text;
    summary : Text;
    status : ProjectStatus;
  };

  public type PublicTask = {
    id : Nat;
    projectId : Nat;
    title : Text;
    assignee : Text;
    status : TaskStatus;
  };

  public type PublicApproval = {
    id : Nat;
    projectId : Nat;
    title : Text;
    body : Text;
    status : ApprovalStatus;
  };

  public type PublicDocumentRecord = {
    id : Nat;
    projectId : Nat;
    name : Text;
    mimeType : Text;
    sizeBytes : Nat;
    contentHash : Text;
  };

  public type PublicNote = {
    id : Nat;
    projectId : Nat;
    body : Text;
  };

  public type PublicAuditEvent = {
    id : Nat;
    action : Text;
    target : Text;
    summary : Text;
  };

  public type PublicDemoView = {
    workspace : PublicWorkspace;
    clients : [PublicClient];
    projects : [PublicProject];
    tasks : [PublicTask];
    approvals : [PublicApproval];
    documents : [PublicDocumentRecord];
    notes : [PublicNote];
    audit : [PublicAuditEvent];
    capabilities : [Text];
  };

  var workspace : ?Workspace = null;
  var admins : [Principal] = [];
  var clients : [Client] = [];
  var projects : [Project] = [];
  var tasks : [Task] = [];
  var approvals : [Approval] = [];
  var documents : [DocumentRecord] = [];
  var notes : [Note] = [];
  var audit : [AuditEvent] = [];
  var agentResponses : [AgentResponse] = [];
  var accessRequests : [AccessRequest] = [];
  var approvedAccessRequestIds : [Nat] = [];
  var rejectedAccessRequestIds : [Nat] = [];
  var roleGrants : [RoleGrant] = [];
  var clientInvites : [ClientInvite] = [];
  var documentVersions : [DocumentVersion] = [];
  var documentArchives : [DocumentArchiveRecord] = [];
  var documentHashVerifications : [DocumentHashVerification] = [];

  var nextWorkspaceId : Nat = 1;
  var nextClientId : Nat = 1;
  var nextProjectId : Nat = 1;
  var nextTaskId : Nat = 1;
  var nextApprovalId : Nat = 1;
  var nextDocumentId : Nat = 1;
  var nextNoteId : Nat = 1;
  var nextAuditId : Nat = 1;
  var nextAgentResponseId : Nat = 1;
  var nextAccessRequestId : Nat = 1;
  var nextClientInviteId : Nat = 1;
  var nextDocumentVersionId : Nat = 1;
  var nextDocumentVerificationId : Nat = 1;

  func now() : Int {
    Time.now()
  };

  func stateCounts() : StateCounts {
    {
      clients = Array.size(clients);
      projects = Array.size(projects);
      tasks = Array.size(tasks);
      approvals = Array.size(approvals);
      documents = Array.size(documents);
      notes = Array.size(notes);
      audit = Array.size(audit);
      accessRequests = Array.size(accessRequests);
      roleGrants = Array.size(roleGrants);
      clientInvites = Array.size(clientInvites);
      documentVersions = Array.size(documentVersions);
      documentArchives = Array.size(documentArchives);
      documentHashVerifications = Array.size(documentHashVerifications);
    }
  };

  func isOwner(caller : Principal) : Bool {
    switch (workspace) {
      case (?w) { caller == w.owner };
      case null { false };
    }
  };

  func sameRole(a : Role, b : Role) : Bool {
    switch (a, b) {
      case (#Owner, #Owner) { true };
      case (#Admin, #Admin) { true };
      case (#Operator, #Operator) { true };
      case (#Client, #Client) { true };
      case (#Reviewer, #Reviewer) { true };
      case (_) { false };
    }
  };

  func hasRole(caller : Principal, role : Role) : Bool {
    Array.find<RoleGrant>(
      roleGrants,
      func(grant) {
        grant.principal == caller and sameRole(grant.role, role)
      },
    ) != null
  };

  func isLegacyAdmin(caller : Principal) : Bool {
    Array.find<Principal>(admins, func(p) { p == caller }) != null
  };

  func canGovern(caller : Principal) : Bool {
    isOwner(caller) or hasRole(caller, #Admin)
  };

  func isAdmin(caller : Principal) : Bool {
    canGovern(caller) or hasRole(caller, #Operator) or isLegacyAdmin(caller)
  };

  func canOperate(caller : Principal) : Bool {
    isAdmin(caller)
  };

  func requireAuthenticated(caller : Principal) {
    if (Principal.isAnonymous(caller)) {
      Debug.trap("anonymous caller not allowed");
    };
  };

  func requireAdmin(caller : Principal) {
    requireAuthenticated(caller);
    if (not canOperate(caller)) {
      Debug.trap("caller is not an admin");
    };
  };

  func requireGovernance(caller : Principal) {
    requireAuthenticated(caller);
    if (not canGovern(caller)) {
      Debug.trap("caller is not a governance principal");
    };
  };

  func requireOwner(caller : Principal) {
    requireAuthenticated(caller);
    if (not isOwner(caller)) {
      Debug.trap("caller is not the owner");
    };
  };

  func requireBootstrapOwner(caller : Principal) {
    requireAuthenticated(caller);
    if (caller != bootstrapOwner) {
      Debug.trap("bootstrap owner required");
    };
  };

  func requireText(fieldLabel : Text, value : Text, maxLength : Nat) {
    let size = Text.size(value);
    if (size == 0) {
      Debug.trap(fieldLabel # " is required");
    };
    if (size > maxLength) {
      Debug.trap(fieldLabel # " is too long");
    };
  };

  func isHexChar(char : Char) : Bool {
    switch (char) {
      case ('0') { true };
      case ('1') { true };
      case ('2') { true };
      case ('3') { true };
      case ('4') { true };
      case ('5') { true };
      case ('6') { true };
      case ('7') { true };
      case ('8') { true };
      case ('9') { true };
      case ('a') { true };
      case ('b') { true };
      case ('c') { true };
      case ('d') { true };
      case ('e') { true };
      case ('f') { true };
      case ('A') { true };
      case ('B') { true };
      case ('C') { true };
      case ('D') { true };
      case ('E') { true };
      case ('F') { true };
      case (_) { false };
    }
  };

  func requireSha256Hash(value : Text) {
    if (Text.size(value) != 71 or not Text.startsWith(value, #text "sha256:")) {
      Debug.trap("content hash must be sha256:<64 hex>");
    };
    let chars = Text.toArray(value);
    var index : Nat = 7;
    while (index < 71) {
      if (not isHexChar(chars[index])) {
        Debug.trap("content hash must be sha256:<64 hex>");
      };
      index += 1;
    };
  };

  func redactedAuditSummary(action : Text, summary : Text) : Text {
    switch (action) {
      case ("access.requested") { "Access request recorded" };
      case ("access.approved") { "Access request approved" };
      case ("access.rejected") { "Access request rejected" };
      case ("approval.responded") { "Approval response recorded" };
      case ("document.added") { "Document metadata recorded" };
      case ("note.created") { "Project note recorded" };
      case (_) { summary };
    }
  };

  func addAudit(actorPrincipal : Principal, action : Text, target : Text, summary : Text) {
    let event : AuditEvent = {
      id = nextAuditId;
      actorPrincipal;
      action;
      target;
      summary = redactedAuditSummary(action, summary);
      createdAt = now();
    };
    nextAuditId += 1;
    audit := Array.append(audit, [event]);
  };

  func projectById(projectId : Nat) : ?Project {
    Array.find<Project>(projects, func(project) { project.id == projectId })
  };

  func documentById(documentId : Nat) : ?DocumentRecord {
    Array.find<DocumentRecord>(documents, func(document) { document.id == documentId })
  };

  func documentVersionById(versionId : Nat) : ?DocumentVersion {
    Array.find<DocumentVersion>(documentVersions, func(version) { version.id == versionId })
  };

  func clientById(clientId : Nat) : ?Client {
    Array.find<Client>(clients, func(client) { client.id == clientId })
  };

  func canAccessClient(caller : Principal, client : Client) : Bool {
    if (canOperate(caller)) {
      true
    } else switch (client.portalPrincipal) {
      case (?portalPrincipal) { portalPrincipal == caller };
      case null { false };
    }
  };

  func canAccessProject(caller : Principal, project : Project) : Bool {
    switch (clientById(project.clientId)) {
      case (?client) { canAccessClient(caller, client) };
      case null { false };
    }
  };

  func clientPortalViewById(clientId : Nat) : ?ClientPortalView {
    switch (clientById(clientId)) {
      case (?client) {
        let clientProjects = Array.filter<Project>(projects, func(project) { project.clientId == clientId });
        let projectIds = Array.map<Project, Nat>(clientProjects, func(project) { project.id });
        func inProject(projectId : Nat) : Bool {
          Array.find<Nat>(projectIds, func(id) { id == projectId }) != null
        };
        ?{
          client;
          projects = clientProjects;
          tasks = Array.filter<Task>(tasks, func(task) { inProject(task.projectId) });
          approvals = Array.filter<Approval>(approvals, func(approval) { inProject(approval.projectId) });
          documents = Array.filter<DocumentRecord>(documents, func(document) { inProject(document.projectId) });
          notes = Array.filter<Note>(notes, func(note) { inProject(note.projectId) });
        }
      };
      case null { null };
    }
  };

  func containsNat(values : [Nat], value : Nat) : Bool {
    Array.find<Nat>(values, func(item) { item == value }) != null
  };

  func accessRequestStatus(request : AccessRequest) : AccessRequestStatus {
    if (containsNat(approvedAccessRequestIds, request.id)) {
      #Approved
    } else if (containsNat(rejectedAccessRequestIds, request.id)) {
      #Rejected
    } else {
      #Pending
    }
  };

  func isPendingAccessRequest(request : AccessRequest) : Bool {
    switch (accessRequestStatus(request)) {
      case (#Pending) { true };
      case (_) { false };
    }
  };

  func roleAlreadyGranted(principal : Principal, role : Role, clientId : ?Nat) : Bool {
    Array.find<RoleGrant>(
      roleGrants,
      func(grant) {
        grant.principal == principal and sameRole(grant.role, role) and grant.clientId == clientId
      },
    ) != null
  };

  func grantRole(grantActor : Principal, principal : Principal, role : Role, clientId : ?Nat) {
    if (roleAlreadyGranted(principal, role, clientId)) {
      return;
    };
    let grant : RoleGrant = {
      principal;
      role;
      clientId;
      createdAt = now();
    };
    roleGrants := Array.append(roleGrants, [grant]);
    addAudit(grantActor, "role.granted", "principal:" # Principal.toText(principal), "Role granted");
  };

  func roleGrantMatches(grant : RoleGrant, principal : Principal, role : Role, clientId : ?Nat) : Bool {
    grant.principal == principal and sameRole(grant.role, role) and grant.clientId == clientId
  };

  func isInviteOpen(invite : ClientInvite) : Bool {
    switch (invite.claimedBy, invite.revokedAt) {
      case (null, null) { true };
      case (_) { false };
    }
  };

  func isDocumentArchived(documentId : Nat) : Bool {
    Array.find<DocumentArchiveRecord>(
      documentArchives,
      func(record) { record.documentId == documentId },
    ) != null
  };

  func latestDocumentVersionNumber(documentId : Nat) : Nat {
    var latest : Nat = 0;
    for (version in documentVersions.vals()) {
      if (version.documentId == documentId and version.version > latest) {
        latest := version.version;
      };
    };
    latest
  };

  func requireDocumentAccess(caller : Principal, documentId : Nat) : DocumentRecord {
    switch (documentById(documentId)) {
      case (?document) {
        switch (projectById(document.projectId)) {
          case (?project) {
            if (not canAccessProject(caller, project)) {
              Debug.trap("document not accessible");
            };
            document
          };
          case null { Debug.trap("project not found") };
        }
      };
      case null { Debug.trap("document not found") };
    }
  };

  func bindClientPrincipal(bindingActor : Principal, clientId : Nat, principal : Principal) : Client {
    var updated : ?Client = null;
    clients := Array.map<Client, Client>(
      clients,
      func(client) {
        if (client.id != clientId) {
          client
        } else {
          let next : Client = { client with portalPrincipal = ?principal };
          updated := ?next;
          next
        }
      },
    );
    switch (updated) {
      case (?client) {
        grantRole(bindingActor, principal, #Client, ?client.id);
        addAudit(bindingActor, "client.principal.rotated", "client:" # Nat.toText(client.id), "Client portal principal rotated");
        client
      };
      case null { Debug.trap("client not found") };
    }
  };

  func validateRoleGrant(caller : Principal, role : Role, clientId : ?Nat) {
    switch (role) {
      case (#Owner) { Debug.trap("owner role cannot be granted") };
      case (#Admin) {
        requireOwner(caller);
        switch (clientId) {
          case null {};
          case (?_) { Debug.trap("admin role cannot be client-scoped") };
        };
      };
      case (#Operator) {
        switch (clientId) {
          case null {};
          case (?_) { Debug.trap("operator role cannot be client-scoped in v1") };
        };
      };
      case (#Reviewer) {
        switch (clientId) {
          case null {};
          case (?_) { Debug.trap("reviewer role cannot be client-scoped in v1") };
        };
      };
      case (#Client) {
        switch (clientId) {
          case (?id) {
            switch (clientById(id)) {
              case (?_) {};
              case null { Debug.trap("client not found") };
            };
          };
          case null { Debug.trap("client role requires clientId") };
        };
      };
    };
  };

  func rolesFor(caller : Principal) : [RoleGrant] {
    let directRoles = Array.filter<RoleGrant>(roleGrants, func(grant) { grant.principal == caller });
    if (isOwner(caller)) {
      Array.append<RoleGrant>(
        [{
          principal = caller;
          role = #Owner;
          clientId = null;
          createdAt = now();
        }],
        directRoles,
      )
    } else if (isLegacyAdmin(caller)) {
      Array.append<RoleGrant>(
        [{
          principal = caller;
          role = #Operator;
          clientId = null;
          createdAt = now();
        }],
        directRoles,
      )
    } else {
      directRoles
    }
  };

  public shared ({ caller }) func init_workspace(name : Text, profile : Text) : async Workspace {
    requireAuthenticated(caller);
    switch (workspace) {
      case (?existing) { existing };
      case null {
        requireBootstrapOwner(caller);
        let created : Workspace = {
          id = nextWorkspaceId;
          name;
          profile;
          owner = caller;
          createdAt = now();
        };
        nextWorkspaceId += 1;
        workspace := ?created;
        addAudit(caller, "workspace.created", "workspace:" # Nat.toText(created.id), name);
        created
      };
    }
  };

  public query func get_system_info() : async SystemInfo {
    {
      schemaVersion = currentSchemaVersion;
      backendName = "SovereignDesk AI";
      workspaceInitialized = workspace != null;
      owner = switch (workspace) {
        case (?w) { ?w.owner };
        case null { null };
      };
      counts = stateCounts();
    }
  };

  public shared ({ caller }) func migrate_schema_version() : async Nat {
    requireOwner(caller);
    currentSchemaVersion := 4;
    addAudit(caller, "system.schema.migrated", "schema:4", "Schema version migrated");
    currentSchemaVersion
  };

  public shared query ({ caller }) func export_state_snapshot() : async StateSnapshot {
    requireOwner(caller);
    {
      schemaVersion = currentSchemaVersion;
      exportedAt = now();
      workspace;
      clients;
      projects;
      tasks;
      approvals;
      documents;
      notes;
      audit;
      accessRequests;
      approvedAccessRequestIds;
      rejectedAccessRequestIds;
      roleGrants;
      clientInvites;
      documentVersions;
      documentArchives;
      documentHashVerifications;
      nextWorkspaceId;
      nextClientId;
      nextProjectId;
      nextTaskId;
      nextApprovalId;
      nextDocumentId;
      nextNoteId;
      nextAuditId;
      nextAgentResponseId;
      nextAccessRequestId;
      nextClientInviteId;
      nextDocumentVersionId;
      nextDocumentVerificationId;
    }
  };

  public shared ({ caller }) func add_admin(principal : Principal) : async [Principal] {
    requireOwner(caller);
    if (Array.find<Principal>(admins, func(p) { p == principal }) == null) {
      admins := Array.append(admins, [principal]);
    };
    grantRole(caller, principal, #Admin, null);
    addAudit(caller, "admin.added", Principal.toText(principal), "Admin access granted");
    admins
  };

  public shared query ({ caller }) func list_role_grants() : async [RoleGrant] {
    requireGovernance(caller);
    roleGrants
  };

  public shared ({ caller }) func grant_role(principal : Principal, role : Role, clientId : ?Nat) : async [RoleGrant] {
    requireGovernance(caller);
    validateRoleGrant(caller, role, clientId);
    grantRole(caller, principal, role, clientId);
    roleGrants
  };

  public shared ({ caller }) func revoke_role(principal : Principal, role : Role, clientId : ?Nat) : async [RoleGrant] {
    requireGovernance(caller);
    validateRoleGrant(caller, role, clientId);
    let before = Array.size(roleGrants);
    roleGrants := Array.filter<RoleGrant>(
      roleGrants,
      func(grant) { not roleGrantMatches(grant, principal, role, clientId) },
    );
    if (Array.size(roleGrants) == before) {
      Debug.trap("role grant not found");
    };
    addAudit(caller, "role.revoked", "principal:" # Principal.toText(principal), "Role revoked");
    roleGrants
  };

  public shared ({ caller }) func rotate_client_principal(clientId : Nat, principal : Principal) : async Client {
    requireGovernance(caller);
    bindClientPrincipal(caller, clientId, principal)
  };

  public shared ({ caller }) func create_client_invite(clientId : Nat, code : Text, note : Text) : async ClientInvite {
    requireAdmin(caller);
    requireText("invite code", code, 80);
    requireText("invite note", note, 240);
    switch (clientById(clientId)) {
      case null { Debug.trap("client not found") };
      case (?_) {};
    };
    switch (
      Array.find<ClientInvite>(
        clientInvites,
        func(invite) { invite.clientId == clientId and invite.code == code and isInviteOpen(invite) },
      )
    ) {
      case (?existing) { existing };
      case null {
        let invite : ClientInvite = {
          id = nextClientInviteId;
          clientId;
          code;
          note;
          createdBy = caller;
          createdAt = now();
          claimedBy = null;
          claimedAt = null;
          revokedAt = null;
        };
        nextClientInviteId += 1;
        clientInvites := Array.append(clientInvites, [invite]);
        addAudit(caller, "client.invite.created", "client:" # Nat.toText(clientId), "Client invite created");
        invite
      };
    }
  };

  public shared query ({ caller }) func list_client_invites() : async [ClientInvite] {
    requireAdmin(caller);
    clientInvites
  };

  public shared ({ caller }) func revoke_client_invite(inviteId : Nat) : async ClientInvite {
    requireAdmin(caller);
    var updated : ?ClientInvite = null;
    clientInvites := Array.map<ClientInvite, ClientInvite>(
      clientInvites,
      func(invite) {
        if (invite.id != inviteId) {
          invite
        } else {
          let next : ClientInvite = { invite with revokedAt = ?now() };
          updated := ?next;
          next
        }
      },
    );
    switch (updated) {
      case (?invite) {
        addAudit(caller, "client.invite.revoked", "invite:" # Nat.toText(invite.id), "Client invite revoked");
        invite
      };
      case null { Debug.trap("invite not found") };
    }
  };

  public shared ({ caller }) func claim_client_invite(clientId : Nat, code : Text) : async ClientPortalView {
    requireAuthenticated(caller);
    requireText("invite code", code, 80);
    var claimed : ?ClientInvite = null;
    clientInvites := Array.map<ClientInvite, ClientInvite>(
      clientInvites,
      func(invite) {
        switch (claimed) {
          case (?_) { invite };
          case null {
            if (invite.clientId == clientId and invite.code == code and isInviteOpen(invite)) {
              let next : ClientInvite = {
                invite with
                claimedBy = ?caller;
                claimedAt = ?now();
              };
              claimed := ?next;
              next
            } else {
              invite
            }
          };
        }
      },
    );
    switch (claimed) {
      case (?invite) {
        ignore bindClientPrincipal(caller, clientId, caller);
        addAudit(caller, "client.invite.claimed", "invite:" # Nat.toText(invite.id), "Client invite claimed");
        switch (clientPortalViewById(clientId)) {
          case (?portal) { portal };
          case null { Debug.trap("client portal not accessible") };
        }
      };
      case null { Debug.trap("invite not found or already used") };
    }
  };

  public shared ({ caller }) func request_operator_access(email : Text, note : Text) : async AccessRequest {
    requireAuthenticated(caller);
    requireText("request email", email, 180);
    requireText("request note", note, 500);
    switch (Array.find<AccessRequest>(accessRequests, func(request) { request.principal == caller })) {
      case (?existing) { existing };
      case null {
        let request : AccessRequest = {
          id = nextAccessRequestId;
          principal = caller;
          email;
          note;
          createdAt = now();
        };
        nextAccessRequestId += 1;
        accessRequests := Array.append(accessRequests, [request]);
        addAudit(caller, "access.requested", "principal:" # Principal.toText(caller), email);
        request
      };
    }
  };

  public shared query ({ caller }) func list_access_requests() : async [AccessRequest] {
    requireGovernance(caller);
    Array.filter<AccessRequest>(accessRequests, isPendingAccessRequest)
  };

  public shared query ({ caller }) func list_access_request_history() : async [AccessRequestReview] {
    requireGovernance(caller);
    Array.map<AccessRequest, AccessRequestReview>(
      accessRequests,
      func(request) {
        {
          request;
          status = accessRequestStatus(request);
        }
      },
    )
  };

  public shared ({ caller }) func approve_access_request(requestId : Nat) : async [Principal] {
    requireGovernance(caller);
    switch (Array.find<AccessRequest>(accessRequests, func(request) { request.id == requestId })) {
      case (?request) {
        if (not isPendingAccessRequest(request)) {
          Debug.trap("access request already reviewed");
        };
        grantRole(caller, request.principal, #Operator, null);
        approvedAccessRequestIds := Array.append(approvedAccessRequestIds, [request.id]);
        addAudit(caller, "access.approved", "access-request:" # Nat.toText(request.id), request.email);
        Array.map<RoleGrant, Principal>(
          Array.filter<RoleGrant>(roleGrants, func(grant) { sameRole(grant.role, #Operator) }),
          func(grant) { grant.principal },
        )
      };
      case null { Debug.trap("access request not found") };
    }
  };

  public shared ({ caller }) func reject_access_request(requestId : Nat, reason : Text) : async AccessRequest {
    requireGovernance(caller);
    requireText("rejection reason", reason, 500);
    switch (Array.find<AccessRequest>(accessRequests, func(request) { request.id == requestId })) {
      case (?request) {
        if (not isPendingAccessRequest(request)) {
          Debug.trap("access request already reviewed");
        };
        rejectedAccessRequestIds := Array.append(rejectedAccessRequestIds, [request.id]);
        addAudit(caller, "access.rejected", "access-request:" # Nat.toText(request.id), reason);
        request
      };
      case null { Debug.trap("access request not found") };
    }
  };

  public shared query ({ caller }) func get_my_workspace() : async ?WorkspaceView {
    if (Principal.isAnonymous(caller) or not canOperate(caller)) {
      return null;
    };
    switch (workspace) {
      case (?w) {
        ?{
          workspace = w;
          clients;
          projects;
          tasks;
          approvals;
          documents;
          notes;
          audit;
        }
      };
      case null { null };
    }
  };

  public shared query ({ caller }) func get_my_roles() : async [RoleGrant] {
    requireAuthenticated(caller);
    let directAndLegacy = rolesFor(caller);
    let clientRoles = Array.map<Client, RoleGrant>(
      Array.filter<Client>(
        clients,
        func(client) {
          switch (client.portalPrincipal) {
            case (?portalPrincipal) { portalPrincipal == caller };
            case null { false };
          }
        },
      ),
      func(client) {
        {
          principal = caller;
          role = #Client;
          clientId = ?client.id;
          createdAt = client.createdAt;
        }
      },
    );
    Array.append<RoleGrant>(directAndLegacy, clientRoles)
  };

  public query func get_public_demo() : async ?PublicDemoView {
    switch (workspace) {
      case (?w) {
        ?{
          workspace = {
            name = w.name;
            profile = w.profile;
            ownerLabel = "SovereignDesk operator";
          };
          clients = Array.map<Client, PublicClient>(
            clients,
            func(client) {
              {
                name = "Aster Capital room " # Nat.toText(client.id);
                contactName = "Verified portal contact";
              }
            },
          );
          projects = Array.map<Project, PublicProject>(
            projects,
            func(project) {
              {
                id = project.id;
                clientId = project.clientId;
                name = "Sovereign diligence room " # Nat.toText(project.id);
                summary = "Public proof view for an ICP-hosted client workflow. Authenticated roles see scoped project detail.";
                status = project.status;
              }
            },
          );
          tasks = Array.map<Task, PublicTask>(
            tasks,
            func(task) {
              {
                id = task.id;
                projectId = task.projectId;
                title = "Role-scoped workflow task " # Nat.toText(task.id);
                assignee = "private workspace";
                status = task.status;
              }
            },
          );
          approvals = Array.map<Approval, PublicApproval>(
            approvals,
            func(approval) {
              {
                id = approval.id;
                projectId = approval.projectId;
                title = "Client approval checkpoint " # Nat.toText(approval.id);
                body = "Public proof only. Authenticated portal users see approval detail.";
                status = approval.status;
              }
            },
          );
          documents = Array.map<DocumentRecord, PublicDocumentRecord>(
            documents,
            func(document) {
              {
                id = document.id;
                projectId = document.projectId;
                name = "certified-document-" # Nat.toText(document.id);
                mimeType = document.mimeType;
                sizeBytes = document.sizeBytes;
                contentHash = "redacted";
              }
            },
          );
          notes = Array.map<Note, PublicNote>(
            notes,
            func(note) {
              {
                id = note.id;
                projectId = note.projectId;
                body = "Public note redacted. Authenticated portal users see note details.";
              }
            },
          );
          audit = Array.map<AuditEvent, PublicAuditEvent>(
            audit,
            func(event) {
              {
                id = event.id;
                action = event.action;
                target = "redacted";
                summary = "Public audit event redacted";
              }
            },
          );
          capabilities = [
            "ICP mainnet asset canister",
            "Motoko persistent backend",
            "Internet Identity gated writes",
            "Role-scoped client portal",
            "Approval and audit workflow",
            "AI Employee operational readout",
          ];
        }
      };
      case null { null };
    }
  };

  public shared ({ caller }) func create_client(
    name : Text,
    contactName : Text,
    contactEmail : Text,
    portalPrincipal : ?Principal,
  ) : async Client {
    requireAdmin(caller);
    requireText("client name", name, 120);
    requireText("contact name", contactName, 120);
    requireText("contact email", contactEmail, 180);
    let client : Client = {
      id = nextClientId;
      name;
      contactName;
      contactEmail;
      portalPrincipal;
      createdAt = now();
    };
    nextClientId += 1;
    clients := Array.append(clients, [client]);
    addAudit(caller, "client.created", "client:" # Nat.toText(client.id), name);
    client
  };

  public shared ({ caller }) func update_client(
    clientId : Nat,
    name : Text,
    contactName : Text,
    contactEmail : Text,
  ) : async Client {
    requireAdmin(caller);
    requireText("client name", name, 120);
    requireText("contact name", contactName, 120);
    requireText("contact email", contactEmail, 180);
    var updated : ?Client = null;
    clients := Array.map<Client, Client>(
      clients,
      func(client) {
        if (client.id != clientId) {
          client
        } else {
          let next : Client = {
            client with
            name;
            contactName;
            contactEmail;
          };
          updated := ?next;
          next
        }
      },
    );
    switch (updated) {
      case (?client) {
        addAudit(caller, "client.updated", "client:" # Nat.toText(client.id), client.name);
        client
      };
      case null { Debug.trap("client not found") };
    }
  };

  public shared ({ caller }) func create_project(
    clientId : Nat,
    name : Text,
    summary : Text,
  ) : async Project {
    requireAdmin(caller);
    requireText("project name", name, 140);
    requireText("project summary", summary, 500);
    switch (clientById(clientId)) {
      case null { Debug.trap("client not found") };
      case (?_) {};
    };
    let project : Project = {
      id = nextProjectId;
      clientId;
      name;
      summary;
      status = #Active;
      createdAt = now();
    };
    nextProjectId += 1;
    projects := Array.append(projects, [project]);
    addAudit(caller, "project.created", "project:" # Nat.toText(project.id), name);
    project
  };

  public shared ({ caller }) func update_project(
    projectId : Nat,
    name : Text,
    summary : Text,
    status : ProjectStatus,
  ) : async Project {
    requireAdmin(caller);
    requireText("project name", name, 140);
    requireText("project summary", summary, 500);
    var updated : ?Project = null;
    projects := Array.map<Project, Project>(
      projects,
      func(project) {
        if (project.id != projectId) {
          project
        } else {
          let next : Project = {
            project with
            name;
            summary;
            status;
          };
          updated := ?next;
          next
        }
      },
    );
    switch (updated) {
      case (?project) {
        addAudit(caller, "project.updated", "project:" # Nat.toText(project.id), project.name);
        project
      };
      case null { Debug.trap("project not found") };
    }
  };

  public shared ({ caller }) func create_task(
    projectId : Nat,
    title : Text,
    assignee : Text,
  ) : async Task {
    requireAdmin(caller);
    requireText("task title", title, 180);
    requireText("task assignee", assignee, 80);
    switch (projectById(projectId)) {
      case null { Debug.trap("project not found") };
      case (?_) {};
    };
    let task : Task = {
      id = nextTaskId;
      projectId;
      title;
      assignee;
      status = #Open;
      createdAt = now();
    };
    nextTaskId += 1;
    tasks := Array.append(tasks, [task]);
    addAudit(caller, "task.created", "task:" # Nat.toText(task.id), title);
    task
  };

  public shared ({ caller }) func update_task(
    taskId : Nat,
    title : Text,
    assignee : Text,
    status : TaskStatus,
  ) : async Task {
    requireAdmin(caller);
    requireText("task title", title, 180);
    requireText("task assignee", assignee, 80);
    var updated : ?Task = null;
    tasks := Array.map<Task, Task>(
      tasks,
      func(task) {
        if (task.id != taskId) {
          task
        } else {
          let next : Task = {
            task with
            title;
            assignee;
            status;
          };
          updated := ?next;
          next
        }
      },
    );
    switch (updated) {
      case (?task) {
        addAudit(caller, "task.updated", "task:" # Nat.toText(task.id), task.title);
        task
      };
      case null { Debug.trap("task not found") };
    }
  };

  public shared ({ caller }) func update_task_status(taskId : Nat, status : TaskStatus) : async Task {
    requireAdmin(caller);
    var updated : ?Task = null;
    tasks := Array.map<Task, Task>(
      tasks,
      func(task) {
        if (task.id != taskId) {
          task
        } else {
          let next : Task = { task with status };
          updated := ?next;
          next
        }
      },
    );
    switch (updated) {
      case (?task) {
        addAudit(caller, "task.status.updated", "task:" # Nat.toText(task.id), task.title);
        task
      };
      case null { Debug.trap("task not found") };
    }
  };

  public shared ({ caller }) func update_project_status(projectId : Nat, status : ProjectStatus) : async Project {
    requireAdmin(caller);
    var updated : ?Project = null;
    projects := Array.map<Project, Project>(
      projects,
      func(project) {
        if (project.id != projectId) {
          project
        } else {
          let next : Project = { project with status };
          updated := ?next;
          next
        }
      },
    );
    switch (updated) {
      case (?project) {
        addAudit(caller, "project.status.updated", "project:" # Nat.toText(project.id), project.name);
        project
      };
      case null { Debug.trap("project not found") };
    }
  };

  public shared ({ caller }) func create_approval(
    projectId : Nat,
    title : Text,
    body : Text,
  ) : async Approval {
    requireAdmin(caller);
    requireText("approval title", title, 160);
    requireText("approval body", body, 1_000);
    switch (projectById(projectId)) {
      case null { Debug.trap("project not found") };
      case (?_) {};
    };
    let approval : Approval = {
      id = nextApprovalId;
      projectId;
      title;
      body;
      status = #Pending;
      responder = null;
      responseComment = "";
      createdAt = now();
      respondedAt = null;
    };
    nextApprovalId += 1;
    approvals := Array.append(approvals, [approval]);
    addAudit(caller, "approval.requested", "approval:" # Nat.toText(approval.id), title);
    approval
  };

  public shared ({ caller }) func respond_approval(
    approvalId : Nat,
    decision : ApprovalStatus,
    comment : Text,
  ) : async Approval {
    requireAuthenticated(caller);
    requireText("approval comment", comment, 1_000);
    switch (decision) {
      case (#Pending) { Debug.trap("approval decision cannot be Pending") };
      case (_) {};
    };
    var updated : ?Approval = null;
    approvals := Array.map<Approval, Approval>(
      approvals,
      func(approval) {
        if (approval.id != approvalId) {
          approval
        } else {
          switch (projectById(approval.projectId)) {
            case (?project) {
              if (not canAccessProject(caller, project)) {
                Debug.trap("approval not accessible");
              };
            };
            case null { Debug.trap("project not found") };
          };
          switch (approval.status) {
            case (#Pending) {};
            case (_) { Debug.trap("approval already resolved") };
          };
          let next : Approval = {
            approval with
            status = decision;
            responder = ?caller;
            responseComment = comment;
            respondedAt = ?now();
          };
          updated := ?next;
          next
        }
      },
    );
    switch (updated) {
      case (?approval) {
        addAudit(caller, "approval.responded", "approval:" # Nat.toText(approval.id), comment);
        approval
      };
      case null { Debug.trap("approval not found") };
    }
  };

  public shared ({ caller }) func create_document_record(
    projectId : Nat,
    name : Text,
    mimeType : Text,
    sizeBytes : Nat,
    encryptedKeyRef : Text,
    contentHash : Text,
  ) : async DocumentRecord {
    requireAdmin(caller);
    requireText("document name", name, 180);
    requireText("document mime type", mimeType, 120);
    requireText("encrypted key ref", encryptedKeyRef, 240);
    requireText("content hash", contentHash, 240);
    requireSha256Hash(contentHash);
    if (sizeBytes > 2_000_000) {
      Debug.trap("document too large for MVP record limit");
    };
    switch (projectById(projectId)) {
      case null { Debug.trap("project not found") };
      case (?_) {};
    };
    let document : DocumentRecord = {
      id = nextDocumentId;
      projectId;
      name;
      mimeType;
      sizeBytes;
      encryptedKeyRef;
      contentHash;
      createdAt = now();
    };
    nextDocumentId += 1;
    documents := Array.append(documents, [document]);
    addAudit(caller, "document.added", "document:" # Nat.toText(document.id), name);
    document
  };

  public shared ({ caller }) func update_document_record(
    documentId : Nat,
    name : Text,
    mimeType : Text,
    encryptedKeyRef : Text,
    contentHash : Text,
  ) : async DocumentRecord {
    requireAdmin(caller);
    requireText("document name", name, 180);
    requireText("document mime type", mimeType, 120);
    requireText("encrypted key ref", encryptedKeyRef, 240);
    requireText("content hash", contentHash, 240);
    requireSha256Hash(contentHash);
    var updated : ?DocumentRecord = null;
    documents := Array.map<DocumentRecord, DocumentRecord>(
      documents,
      func(document) {
        if (document.id != documentId) {
          document
        } else {
          let next : DocumentRecord = {
            document with
            name;
            mimeType;
            encryptedKeyRef;
            contentHash;
          };
          updated := ?next;
          next
        }
      },
    );
    switch (updated) {
      case (?document) {
        addAudit(caller, "document.updated", "document:" # Nat.toText(document.id), document.name);
        document
      };
      case null { Debug.trap("document not found") };
    }
  };

  public shared ({ caller }) func add_document_version(
    documentId : Nat,
    sizeBytes : Nat,
    encryptedKeyRef : Text,
    contentHash : Text,
  ) : async DocumentVersion {
    requireAdmin(caller);
    ignore requireDocumentAccess(caller, documentId);
    if (isDocumentArchived(documentId)) {
      Debug.trap("document archived");
    };
    requireText("encrypted key ref", encryptedKeyRef, 240);
    requireText("content hash", contentHash, 240);
    requireSha256Hash(contentHash);
    if (sizeBytes > 2_000_000) {
      Debug.trap("document too large for MVP record limit");
    };
    let version : DocumentVersion = {
      id = nextDocumentVersionId;
      documentId;
      version = latestDocumentVersionNumber(documentId) + 1;
      sizeBytes;
      encryptedKeyRef;
      contentHash;
      createdBy = caller;
      createdAt = now();
    };
    nextDocumentVersionId += 1;
    documentVersions := Array.append(documentVersions, [version]);
    addAudit(caller, "document.version.added", "document:" # Nat.toText(documentId), "Document vault version recorded");
    version
  };

  public shared ({ caller }) func archive_document_record(documentId : Nat, reason : Text) : async DocumentArchiveRecord {
    requireAdmin(caller);
    ignore requireDocumentAccess(caller, documentId);
    requireText("archive reason", reason, 280);
    if (isDocumentArchived(documentId)) {
      Debug.trap("document already archived");
    };
    let archive : DocumentArchiveRecord = {
      documentId;
      archivedBy = caller;
      archivedAt = now();
      reason;
    };
    documentArchives := Array.append(documentArchives, [archive]);
    addAudit(caller, "document.archived", "document:" # Nat.toText(documentId), "Document archived");
    archive
  };

  public shared ({ caller }) func verify_document_hash(
    documentId : Nat,
    versionId : ?Nat,
    submittedHash : Text,
  ) : async DocumentHashVerification {
    requireAuthenticated(caller);
    let document = requireDocumentAccess(caller, documentId);
    requireText("submitted hash", submittedHash, 240);
    requireSha256Hash(submittedHash);
    let expectedHash = switch (versionId) {
      case (?id) {
        switch (documentVersionById(id)) {
          case (?version) {
            if (version.documentId != documentId) {
              Debug.trap("version does not belong to document");
            };
            version.contentHash
          };
          case null { Debug.trap("document version not found") };
        }
      };
      case null { document.contentHash };
    };
    let verification : DocumentHashVerification = {
      id = nextDocumentVerificationId;
      documentId;
      versionId;
      submittedHash;
      expectedHash;
      matches = submittedHash == expectedHash;
      verifiedBy = caller;
      verifiedAt = now();
    };
    nextDocumentVerificationId += 1;
    documentHashVerifications := Array.append(documentHashVerifications, [verification]);
    addAudit(caller, "document.hash.verified", "document:" # Nat.toText(documentId), if (verification.matches) { "Document hash matched" } else { "Document hash mismatch" });
    verification
  };

  public shared query ({ caller }) func list_document_versions(documentId : Nat) : async [DocumentVersion] {
    requireAuthenticated(caller);
    ignore requireDocumentAccess(caller, documentId);
    Array.filter<DocumentVersion>(documentVersions, func(version) { version.documentId == documentId })
  };

  public shared query ({ caller }) func list_document_verifications(documentId : Nat) : async [DocumentHashVerification] {
    requireAuthenticated(caller);
    ignore requireDocumentAccess(caller, documentId);
    Array.filter<DocumentHashVerification>(documentHashVerifications, func(verification) { verification.documentId == documentId })
  };

  public shared query ({ caller }) func list_document_archives() : async [DocumentArchiveRecord] {
    requireAdmin(caller);
    documentArchives
  };

  public shared ({ caller }) func append_note(projectId : Nat, body : Text) : async Note {
    requireAuthenticated(caller);
    requireText("note body", body, 1_500);
    switch (projectById(projectId)) {
      case (?project) {
        if (not canAccessProject(caller, project)) {
          Debug.trap("project not accessible");
        };
      };
      case null { Debug.trap("project not found") };
    };
    let note : Note = {
      id = nextNoteId;
      projectId;
      body;
      author = caller;
      createdAt = now();
    };
    nextNoteId += 1;
    notes := Array.append(notes, [note]);
    addAudit(caller, "note.created", "project:" # Nat.toText(projectId), body);
    note
  };

  public shared ({ caller }) func update_note(noteId : Nat, body : Text) : async Note {
    requireAuthenticated(caller);
    requireText("note body", body, 1_500);
    var updated : ?Note = null;
    notes := Array.map<Note, Note>(
      notes,
      func(note) {
        if (note.id != noteId) {
          note
        } else {
          switch (projectById(note.projectId)) {
            case (?project) {
              if (not canAccessProject(caller, project)) {
                Debug.trap("note not accessible");
              };
            };
            case null { Debug.trap("project not found") };
          };
          let next : Note = { note with body };
          updated := ?next;
          next
        }
      },
    );
    switch (updated) {
      case (?note) {
        addAudit(caller, "note.updated", "note:" # Nat.toText(note.id), body);
        note
      };
      case null { Debug.trap("note not found") };
    }
  };

  public shared query ({ caller }) func get_client_portal(clientId : Nat) : async ?ClientPortalView {
    requireAuthenticated(caller);
    switch (clientById(clientId)) {
      case (?client) {
        if (not canAccessClient(caller, client)) {
          return null;
        };
        clientPortalViewById(clientId)
      };
      case null { null };
    }
  };

  public shared query ({ caller }) func get_my_client_portals() : async [ClientPortalView] {
    requireAuthenticated(caller);
    let accessibleClients = Array.filter<Client>(clients, func(client) { canAccessClient(caller, client) });
    Array.map<Client, ClientPortalView>(
      accessibleClients,
      func(client) {
        let clientProjects = Array.filter<Project>(projects, func(project) { project.clientId == client.id });
        let projectIds = Array.map<Project, Nat>(clientProjects, func(project) { project.id });
        func inProject(projectId : Nat) : Bool {
          Array.find<Nat>(projectIds, func(id) { id == projectId }) != null
        };
        {
          client;
          projects = clientProjects;
          tasks = Array.filter<Task>(tasks, func(task) { inProject(task.projectId) });
          approvals = Array.filter<Approval>(approvals, func(approval) { inProject(approval.projectId) });
          documents = Array.filter<DocumentRecord>(documents, func(document) { inProject(document.projectId) });
          notes = Array.filter<Note>(notes, func(note) { inProject(note.projectId) });
        }
      },
    )
  };

  public shared ({ caller }) func ask_agent(scope : Text, prompt : Text) : async AgentResponse {
    requireAdmin(caller);
    requireText("agent scope", scope, 120);
    requireText("agent prompt", prompt, 1_000);
    let openApprovals = Array.size(Array.filter<Approval>(approvals, func(a) { a.status == #Pending }));
    let openTasks = Array.size(Array.filter<Task>(tasks, func(t) { t.status != #Done }));
    let answer = "SovereignDesk AI draft for " # scope # ": " # prompt #
      "\n\nOperational readout: " # Nat.toText(Array.size(clients)) # " clients, " #
      Nat.toText(Array.size(projects)) # " projects, " # Nat.toText(openTasks) #
      " open tasks, " # Nat.toText(openApprovals) # " approvals waiting on clients. Suggested next action: send a focused client update and close the oldest approval first.";
    let response : AgentResponse = {
      id = nextAgentResponseId;
      scope;
      answer;
      createdAt = now();
    };
    nextAgentResponseId += 1;
    agentResponses := Array.append(agentResponses, [response]);
    addAudit(caller, "agent.response.created", "agent:" # Nat.toText(response.id), scope);
    response
  };

  public shared query ({ caller }) func list_audit(offset : Nat, limit : Nat) : async [AuditEvent] {
    requireAdmin(caller);
    let safeLimit = if (limit > 100) { 100 } else { limit };
    let size = Array.size(audit);
    if (offset >= size) {
      return [];
    };
    let end = Nat.min(size, offset + safeLimit);
    Array.tabulate<AuditEvent>(end - offset, func(i) { audit[offset + i] })
  };

  public shared ({ caller }) func seed_demo() : async WorkspaceView {
    requireAuthenticated(caller);
    if (workspace == null) {
      requireBootstrapOwner(caller);
      let created : Workspace = {
        id = nextWorkspaceId;
        name = "SovereignDesk AI";
        profile = "A sovereign client portal for high-trust teams running fully on ICP.";
        owner = caller;
        createdAt = now();
      };
      nextWorkspaceId += 1;
      workspace := ?created;
      addAudit(caller, "workspace.created", "workspace:" # Nat.toText(created.id), created.name);
    } else {
      requireAdmin(caller);
    };

    if (Array.size(clients) == 0) {
      let client : Client = {
        id = nextClientId;
        name = "Northstar Legal";
        contactName = "Marta Nowak";
        contactEmail = "marta@example.com";
        portalPrincipal = ?caller;
        createdAt = now();
      };
      nextClientId += 1;
      clients := Array.append(clients, [client]);
      addAudit(caller, "client.created", "client:" # Nat.toText(client.id), client.name);

      let project : Project = {
        id = nextProjectId;
        clientId = client.id;
        name = "Acquisition diligence room";
        summary = "Encrypted document exchange, approval trail, and AI-generated client updates.";
        status = #Active;
        createdAt = now();
      };
      nextProjectId += 1;
      projects := Array.append(projects, [project]);
      addAudit(caller, "project.created", "project:" # Nat.toText(project.id), project.name);

      let task1 : Task = {
        id = nextTaskId;
        projectId = project.id;
        title = "Review uploaded term sheet";
        assignee = "client";
        status = #Open;
        createdAt = now();
      };
      nextTaskId += 1;
      let task2 : Task = {
        id = nextTaskId;
        projectId = project.id;
        title = "Prepare approval packet";
        assignee = "owner";
        status = #Open;
        createdAt = now();
      };
      nextTaskId += 1;
      tasks := Array.append(tasks, [task1, task2]);
      addAudit(caller, "task.created", "task:" # Nat.toText(task1.id), task1.title);
      addAudit(caller, "task.created", "task:" # Nat.toText(task2.id), task2.title);

      let approval : Approval = {
        id = nextApprovalId;
        projectId = project.id;
        title = "Approve diligence packet";
        body = "Please confirm that the attached diligence packet can be shared with the buyer counsel.";
        status = #Pending;
        responder = null;
        responseComment = "";
        createdAt = now();
        respondedAt = null;
      };
      nextApprovalId += 1;
      approvals := Array.append(approvals, [approval]);
      addAudit(caller, "approval.requested", "approval:" # Nat.toText(approval.id), approval.title);

      let document : DocumentRecord = {
        id = nextDocumentId;
        projectId = project.id;
        name = "term-sheet-summary.pdf";
        mimeType = "application/pdf";
        sizeBytes = 184_000;
        encryptedKeyRef = "vetkd:test-key-placeholder";
        contentHash = "sha256:0000000000000000000000000000000000000000000000000000000000000000";
        createdAt = now();
      };
      nextDocumentId += 1;
      documents := Array.append(documents, [document]);
      addAudit(caller, "document.added", "document:" # Nat.toText(document.id), document.name);

      let note : Note = {
        id = nextNoteId;
        projectId = project.id;
        body = "Client portal opened with default encrypted vault and pending approval.";
        author = caller;
        createdAt = now();
      };
      nextNoteId += 1;
      notes := Array.append(notes, [note]);
      addAudit(caller, "note.created", "project:" # Nat.toText(project.id), note.body);

      let response : AgentResponse = {
        id = nextAgentResponseId;
        scope = "project:" # Nat.toText(project.id);
        answer = "SovereignDesk AI draft: send a concise update, mention the pending diligence packet approval, and confirm the next review window.";
        createdAt = now();
      };
      nextAgentResponseId += 1;
      agentResponses := Array.append(agentResponses, [response]);
      addAudit(caller, "agent.response.created", "agent:" # Nat.toText(response.id), response.scope);
    };
    switch (workspace) {
      case (?createdWorkspace) {
        {
          workspace = createdWorkspace;
          clients;
          projects;
          tasks;
          approvals;
          documents;
          notes;
          audit;
        }
      };
      case null { Debug.trap("workspace unavailable after seeding") };
    }
  };
}
