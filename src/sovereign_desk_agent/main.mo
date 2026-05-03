import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";

persistent actor {
  public type AgentBrief = {
    id : Nat;
    scope : Text;
    prompt : Text;
    answer : Text;
    approved : Bool;
    createdBy : Principal;
    createdAt : Int;
    approvedBy : ?Principal;
    approvedAt : ?Int;
  };

  var briefs : [AgentBrief] = [];
  var nextBriefId : Nat = 1;

  func requireAuthenticated(caller : Principal) {
    if (Principal.isAnonymous(caller)) {
      Debug.trap("anonymous caller not allowed");
    };
  };

  func requireText(fieldLabel : Text, value : Text, maxLength : Nat) {
    if (Text.size(value) == 0) {
      Debug.trap(fieldLabel # " is required");
    };
    if (Text.size(value) > maxLength) {
      Debug.trap(fieldLabel # " is too long");
    };
  };

  public shared ({ caller }) func draft_brief(scope : Text, prompt : Text) : async AgentBrief {
    requireAuthenticated(caller);
    requireText("scope", scope, 120);
    requireText("prompt", prompt, 1_000);
    let brief : AgentBrief = {
      id = nextBriefId;
      scope;
      prompt;
      answer = "Draft operating brief for " # scope # ": " # prompt # "\n\nHuman approval is required before this can be sent to a client.";
      approved = false;
      createdBy = caller;
      createdAt = Time.now();
      approvedBy = null;
      approvedAt = null;
    };
    nextBriefId += 1;
    briefs := Array.append(briefs, [brief]);
    brief
  };

  public shared ({ caller }) func approve_brief(briefId : Nat) : async AgentBrief {
    requireAuthenticated(caller);
    var updated : ?AgentBrief = null;
    briefs := Array.map<AgentBrief, AgentBrief>(
      briefs,
      func(brief) {
        if (brief.id != briefId) {
          brief
        } else if (brief.approved) {
          Debug.trap("brief already approved")
        } else {
          let next : AgentBrief = {
            brief with
            approved = true;
            approvedBy = ?caller;
            approvedAt = ?Time.now();
          };
          updated := ?next;
          next
        }
      },
    );
    switch (updated) {
      case (?brief) { brief };
      case null { Debug.trap("brief not found") };
    }
  };

  public query func list_briefs(offset : Nat, limit : Nat) : async [AgentBrief] {
    let safeLimit = if (limit > 100) { 100 } else { limit };
    let size = Array.size(briefs);
    if (offset >= size) {
      return [];
    };
    let end = Nat.min(size, offset + safeLimit);
    Array.tabulate<AgentBrief>(end - offset, func(index) { briefs[offset + index] })
  };
}
