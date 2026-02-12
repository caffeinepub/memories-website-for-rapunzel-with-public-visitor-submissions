import List "mo:core/List";
import Map "mo:core/Map";
import Nat64 "mo:core/Nat64";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Time "mo:core/Time";

import Runtime "mo:core/Runtime";


actor {
  type Memory = {
    id : Nat64;
    text : Text;
    author : ?Text;
    created : Int;
    imageUrl : ?Text;
    videoUrl : ?Text;
  };

  module Memory {
    public func compare(memory1 : Memory, memory2 : Memory) : Order.Order {
      Nat64.compare(memory1.id, memory2.id);
    };
  };

  var nextId = 0 : Nat64;
  let memories = Map.empty<Nat64, Memory>();

  type SubmitMemoryResponse = {
    #ok : Memory;
    #err : { message : Text };
  };

  public shared ({ caller }) func submitMemory(
    text : Text,
    author : ?Text,
    imageUrl : ?Text,
    videoUrl : ?Text,
  ) : async SubmitMemoryResponse {
    if (text.size() == 0) {
      return #err { message = "Memory text cannot be empty" };
    };

    let memory : Memory = {
      id = nextId;
      text;
      author;
      created = Time.now();
      imageUrl;
      videoUrl;
    };

    memories.add(memory.id, memory);
    nextId += 1;
    #ok memory;
  };

  public query ({ caller }) func getMemory(id : Nat64) : async ?Memory {
    memories.get(id);
  };

  public query ({ caller }) func getAllMemories() : async [Memory] {
    let memoryList = List.empty<Memory>();
    for (memory in memories.values()) {
      memoryList.add(memory);
    };
    memoryList.toArray().sort();
  };
};
