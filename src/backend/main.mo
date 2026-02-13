import List "mo:core/List";
import Map "mo:core/Map";
import Nat64 "mo:core/Nat64";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Time "mo:core/Time";



actor {
  // Memories Type and Management
  type Memory = {
    id : Nat64;
    text : Text;
    author : Text;
    created : Int;
    imageUrl : ?Text;
    videoUrl : ?Text;
    submitter : ?Principal;
    edited : ?Int;
  };

  module Memory {
    public func compare(memory1 : Memory, memory2 : Memory) : Order.Order {
      Nat64.compare(memory1.id, memory2.id);
    };
  };

  type SubmitMemoryResponse = {
    #ok : Memory;
    #err : { message : Text };
  };

  var nextMemoryId = 0 : Nat64;
  let memories = Map.empty<Nat64, Memory>();

  // Memories API
  public shared ({ caller }) func submitMemory(
    text : Text,
    author : Text,
    imageUrl : ?Text,
    videoUrl : ?Text,
  ) : async SubmitMemoryResponse {
    if (text.size() == 0) {
      return #err { message = "Memory text cannot be empty" };
    };

    let memory : Memory = {
      id = nextMemoryId;
      text;
      author;
      created = Time.now();
      imageUrl;
      videoUrl;
      submitter = ?caller;
      edited = null;
    };

    memories.add(memory.id, memory);
    nextMemoryId += 1;
    #ok memory;
  };

  public shared ({ caller }) func editMemory(
    id : Nat64,
    newText : Text,
    newAuthor : Text,
    newImageUrl : ?Text,
    newVideoUrl : ?Text,
  ) : async SubmitMemoryResponse {
    switch (memories.get(id)) {
      case (null) {
        #err { message = "Memory not found" };
      };
      case (?existingMemory) {
        if (existingMemory.submitter != ?caller) {
          return #err { message = "You are not the author of this memory" };
        };

        let updatedMemory : Memory = {
          existingMemory with
          text = newText;
          author = newAuthor;
          imageUrl = newImageUrl;
          videoUrl = newVideoUrl;
          edited = ?Time.now();
        };
        memories.add(id, updatedMemory);
        #ok updatedMemory;
      };
    };
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

  // Song Type and Management
  type Song = {
    bytes : Blob;
    fileName : Text;
    artist : ?Text;
    title : ?Text;
    year : ?Nat;
    description : ?Text;
  };

  var nextSongId = 0 : Nat64;
  let songs = Map.empty<Nat64, Song>();

  // Music API
  public shared ({ caller }) func uploadSong(
    bytes : Blob,
    fileName : Text,
    artist : ?Text,
    title : ?Text,
    year : ?Nat,
    description : ?Text,
  ) : async Nat64 {
    let song : Song = {
      bytes;
      fileName;
      artist;
      title;
      year;
      description;
    };

    songs.add(nextSongId, song);
    let currentId = nextSongId;
    nextSongId += 1;
    currentId;
  };

  public query ({ caller }) func getSong(id : Nat64) : async ?Song {
    songs.get(id);
  };

  public query ({ caller }) func getAllSongs() : async [(Nat64, Song)] {
    songs.toArray();
  };

  // YouTube Link Type and Management
  type YouTubeLink = {
    url : Text;
    timestamp : Int;
  };

  var youtubeLinks : [YouTubeLink] = [];

  public shared ({ caller }) func submitYouTubeLink(url : Text) : async Bool {
    let newLink : YouTubeLink = {
      url;
      timestamp = Time.now();
    };
    youtubeLinks := youtubeLinks.concat([newLink]);
    true;
  };

  public query ({ caller }) func getYouTubeLinks() : async [YouTubeLink] {
    youtubeLinks;
  };
};
