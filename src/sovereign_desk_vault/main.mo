import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";

persistent actor {
  public type VaultObject = {
    id : Nat;
    workspaceId : Nat;
    documentId : Nat;
    versionId : ?Nat;
    algorithm : Text;
    keyDerivationContext : Text;
    iv : Blob;
    ciphertext : Blob;
    ciphertextHash : Text;
    createdBy : Principal;
    createdAt : Int;
  };

  public type VaultObjectInfo = {
    id : Nat;
    workspaceId : Nat;
    documentId : Nat;
    versionId : ?Nat;
    algorithm : Text;
    keyDerivationContext : Text;
    ivSize : Nat;
    ciphertextSize : Nat;
    ciphertextHash : Text;
    createdBy : Principal;
    createdAt : Int;
  };

  var objects : [VaultObject] = [];
  var nextObjectId : Nat = 1;

  func now() : Int { Time.now() };

  func requireAuthenticated(caller : Principal) {
    if (Principal.isAnonymous(caller)) {
      Debug.trap("anonymous caller not allowed");
    };
  };

  func isHexChar(char : Char) : Bool {
    switch (char) {
      case ('0') true;
      case ('1') true;
      case ('2') true;
      case ('3') true;
      case ('4') true;
      case ('5') true;
      case ('6') true;
      case ('7') true;
      case ('8') true;
      case ('9') true;
      case ('a') true;
      case ('b') true;
      case ('c') true;
      case ('d') true;
      case ('e') true;
      case ('f') true;
      case ('A') true;
      case ('B') true;
      case ('C') true;
      case ('D') true;
      case ('E') true;
      case ('F') true;
      case (_) false;
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

  func info(item : VaultObject) : VaultObjectInfo {
    {
      id = item.id;
      workspaceId = item.workspaceId;
      documentId = item.documentId;
      versionId = item.versionId;
      algorithm = item.algorithm;
      keyDerivationContext = item.keyDerivationContext;
      ivSize = Array.size(Blob.toArray(item.iv));
      ciphertextSize = Array.size(Blob.toArray(item.ciphertext));
      ciphertextHash = item.ciphertextHash;
      createdBy = item.createdBy;
      createdAt = item.createdAt;
    }
  };

  public shared query ({ caller }) func get_vetkey_derivation_context(workspaceId : Nat, documentId : Nat, recipient : Principal) : async Text {
    requireAuthenticated(caller);
    "sovereign-desk:vault-canister:v1:workspace:" # Nat.toText(workspaceId) # ":document:" # Nat.toText(documentId) # ":recipient:" # Principal.toText(recipient)
  };

  public shared ({ caller }) func store_object(
    workspaceId : Nat,
    documentId : Nat,
    versionId : ?Nat,
    algorithm : Text,
    keyDerivationContext : Text,
    iv : Blob,
    ciphertext : Blob,
    ciphertextHash : Text,
  ) : async VaultObjectInfo {
    requireAuthenticated(caller);
    requireSha256Hash(ciphertextHash);
    let ivSize = Array.size(Blob.toArray(iv));
    if (ivSize < 12 or ivSize > 32) {
      Debug.trap("iv must be 12 to 32 bytes");
    };
    if (Array.size(Blob.toArray(ciphertext)) > 2_100_000) {
      Debug.trap("ciphertext too large for MVP encrypted object limit");
    };
    let item : VaultObject = {
      id = nextObjectId;
      workspaceId;
      documentId;
      versionId;
      algorithm;
      keyDerivationContext;
      iv;
      ciphertext;
      ciphertextHash;
      createdBy = caller;
      createdAt = now();
    };
    nextObjectId += 1;
    objects := Array.append(objects, [item]);
    info(item)
  };

  public shared query ({ caller }) func list_objects(workspaceId : Nat, documentId : Nat) : async [VaultObjectInfo] {
    requireAuthenticated(caller);
    Array.map<VaultObject, VaultObjectInfo>(
      Array.filter<VaultObject>(objects, func(item) { item.workspaceId == workspaceId and item.documentId == documentId }),
      info,
    )
  };

  public shared query ({ caller }) func get_object(objectId : Nat) : async ?VaultObject {
    requireAuthenticated(caller);
    Array.find<VaultObject>(objects, func(item) { item.id == objectId })
  };
}
