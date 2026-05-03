import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";

persistent actor {
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

  func now() : Int {
    Time.now()
  };

  func isOwner(caller : Principal) : Bool {
    switch (workspace) {
      case (?w) { caller == w.owner };
      case null { false };
    }
  };

  func isAdmin(caller : Principal) : Bool {
    isOwner(caller) or Array.find<Principal>(admins, func(p) { p == caller }) != null
  };

  func requireAuthenticated(caller : Principal) {
    if (Principal.isAnonymous(caller)) {
      Debug.trap("anonymous caller not allowed");
    };
  };

  func requireAdmin(caller : Principal) {
    requireAuthenticated(caller);
    if (not isAdmin(caller)) {
      Debug.trap("caller is not an admin");
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

  func addAudit(actorPrincipal : Principal, action : Text, target : Text, summary : Text) {
    let event : AuditEvent = {
      id = nextAuditId;
      actorPrincipal;
      action;
      target;
      summary;
      createdAt = now();
    };
    nextAuditId += 1;
    audit := Array.append(audit, [event]);
  };

  func projectById(projectId : Nat) : ?Project {
    Array.find<Project>(projects, func(project) { project.id == projectId })
  };

  func clientById(clientId : Nat) : ?Client {
    Array.find<Client>(clients, func(client) { client.id == clientId })
  };

  func canAccessClient(caller : Principal, client : Client) : Bool {
    if (isAdmin(caller)) {
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

  public shared ({ caller }) func init_workspace(name : Text, profile : Text) : async Workspace {
    requireAuthenticated(caller);
    switch (workspace) {
      case (?existing) { existing };
      case null {
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

  public shared ({ caller }) func add_admin(principal : Principal) : async [Principal] {
    requireAdmin(caller);
    if (Array.find<Principal>(admins, func(p) { p == principal }) == null) {
      admins := Array.append(admins, [principal]);
      addAudit(caller, "admin.added", Principal.toText(principal), "Admin access granted");
    };
    admins
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
    requireAdmin(caller);
    Array.filter<AccessRequest>(accessRequests, isPendingAccessRequest)
  };

  public shared query ({ caller }) func list_access_request_history() : async [AccessRequestReview] {
    requireAdmin(caller);
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
    requireAdmin(caller);
    switch (Array.find<AccessRequest>(accessRequests, func(request) { request.id == requestId })) {
      case (?request) {
        if (not isPendingAccessRequest(request)) {
          Debug.trap("access request already reviewed");
        };
        if (Array.find<Principal>(admins, func(p) { p == request.principal }) == null) {
          admins := Array.append(admins, [request.principal]);
        };
        approvedAccessRequestIds := Array.append(approvedAccessRequestIds, [request.id]);
        addAudit(caller, "access.approved", "access-request:" # Nat.toText(request.id), request.email);
        admins
      };
      case null { Debug.trap("access request not found") };
    }
  };

  public shared ({ caller }) func reject_access_request(requestId : Nat, reason : Text) : async AccessRequest {
    requireAdmin(caller);
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
    if (Principal.isAnonymous(caller) or not isAdmin(caller)) {
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
                name = "Demo client " # Nat.toText(client.id);
                contactName = "Public preview";
              }
            },
          );
          projects = Array.map<Project, PublicProject>(
            projects,
            func(project) {
              {
                id = project.id;
                clientId = project.clientId;
                name = "Canister diligence room " # Nat.toText(project.id);
                summary = "Public redacted workflow preview. Authenticated roles see project details.";
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
                title = "Redacted workflow task " # Nat.toText(task.id);
                assignee = "role scoped";
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
                title = "Redacted approval gate " # Nat.toText(approval.id);
                body = "Public preview only. Authenticated portal users see approval details.";
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

  public shared query ({ caller }) func get_client_portal(clientId : Nat) : async ?ClientPortalView {
    requireAuthenticated(caller);
    switch (clientById(clientId)) {
      case (?client) {
        if (not canAccessClient(caller, client)) {
          return null;
        };
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
        contentHash = "sha256:demo";
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
