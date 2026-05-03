import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";

persistent actor {
  public type ProofEvent = {
    id : Nat;
    actorPrincipal : Principal;
    action : Text;
    target : Text;
    summary : Text;
    createdAt : Int;
  };

  public type TrustManifest = {
    appName : Text;
    frontendCanister : Text;
    backendCanister : Text;
    backendModuleHash : Text;
    schemaVersion : Nat;
    release : Text;
    updatedAt : Int;
  };

  var events : [ProofEvent] = [];
  var nextEventId : Nat = 1;
  var manifest : ?TrustManifest = null;

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

  public shared ({ caller }) func append_event(action : Text, target : Text, summary : Text) : async ProofEvent {
    requireAuthenticated(caller);
    requireText("action", action, 120);
    requireText("target", target, 180);
    requireText("summary", summary, 500);
    let event : ProofEvent = {
      id = nextEventId;
      actorPrincipal = caller;
      action;
      target;
      summary;
      createdAt = Time.now();
    };
    nextEventId += 1;
    events := Array.append(events, [event]);
    event
  };

  public query func list_events(offset : Nat, limit : Nat) : async [ProofEvent] {
    let safeLimit = if (limit > 100) { 100 } else { limit };
    let size = Array.size(events);
    if (offset >= size) {
      return [];
    };
    let end = Nat.min(size, offset + safeLimit);
    Array.tabulate<ProofEvent>(end - offset, func(index) { events[offset + index] })
  };

  public shared ({ caller }) func publish_trust_manifest(next : TrustManifest) : async TrustManifest {
    requireAuthenticated(caller);
    manifest := ?next;
    next
  };

  public query func get_trust_manifest() : async ?TrustManifest {
    manifest
  };
}
