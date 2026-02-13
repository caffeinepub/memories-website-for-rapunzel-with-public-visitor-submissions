import List "mo:core/List";
import Map "mo:core/Map";
import Nat64 "mo:core/Nat64";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";


import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";


actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
    displayName : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile API
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

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

  // Memories API - Public access for guests
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
        // Only the original submitter or an admin can edit
        if (existingMemory.submitter != ?caller and not AccessControl.isAdmin(accessControlState, caller)) {
          return #err { message = "You are not authorized to edit this memory" };
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

  // Music API - Public access for guests
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

  // YouTube API - Public access for guests
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

  // Chat Message Type and Management
  type ChatMessage = {
    id : Nat64;
    sender : Principal;
    text : Text;
    created : Int;
    displayName : Text;
  };

  var messages = List.empty<ChatMessage>();
  var nextMessageId = 0 : Nat64;

  type SubmitMessageResponse = {
    #ok : ChatMessage;
    #err : { message : Text };
  };

  // Chat API - Public access for guests (including anonymous)
  public shared ({ caller }) func submitMessage(text : Text, displayName : Text) : async SubmitMessageResponse {
    if (text.size() == 0) {
      return #err { message = "Message cannot be empty" };
    };

    if (displayName.size() == 0) {
      return #err { message = "Display name cannot be empty" };
    };

    let message : ChatMessage = {
      id = nextMessageId;
      sender = caller;
      text;
      created = Time.now();
      displayName;
    };

    messages.add(message);
    nextMessageId += 1;
    #ok message;
  };

  public query ({ caller }) func getMessages() : async [ChatMessage] {
    _messages();
  };

  public query ({ caller }) func getMessagesBySender(sender : Principal) : async [ChatMessage] {
    let filteredMessages = messages.filter(
      func(m) {
        m.sender == sender;
      }
    );
    filteredMessages.toArray();
  };

  public query ({ caller }) func getMessagesByPrincipal(principal : Principal) : async [ChatMessage] {
    let filteredMessages = messages.filter(
      func(m) {
        m.sender == principal;
      }
    );
    filteredMessages.toArray();
  };

  public query ({ caller }) func getUniqueSenders() : async [Principal] {
    let senderSet = Set.empty<Principal>();

    for (message in messages.values()) {
      if (not senderSet.contains(message.sender)) {
        senderSet.add(message.sender);
      };
    };

    senderSet.toArray();
  };

  public query ({ caller }) func getMessagesFromTo(sender : Principal, from : Int, to : Int) : async [ChatMessage] {
    messages.filter(
      func(message) {
        message.sender == sender and message.created >= from and message.created <= to
      }
    ).toArray();
  };

  public shared ({ caller }) func deleteChatMessages(messageIdsToDelete : [Nat64]) : async () {
    // Authorization: Only delete messages that belong to the authenticated caller
    // Messages from other senders are kept in the list
    messages := messages.filter(
      func(message) {
        // Keep message if: it's not in the delete list OR it doesn't belong to caller
        messageIdsToDelete.find(func(id) { id == message.id }) == null or message.sender != caller
      }
    );
  };

  // Internal method to get messages list
  func _messages() : [ChatMessage] {
    messages.toArray();
  };
};
