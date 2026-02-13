import List "mo:core/List";
import Map "mo:core/Map";
import Nat64 "mo:core/Nat64";

module {
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

  type Song = {
    bytes : Blob;
    fileName : Text;
    artist : ?Text;
    title : ?Text;
    year : ?Nat;
    description : ?Text;
  };

  type ChatMessage = {
    id : Nat64;
    sender : Principal;
    text : Text;
    created : Int;
    displayName : Text;
  };

  type UserProfile = {
    name : Text;
    displayName : Text;
  };

  type Actor = {
    nextMemoryId : Nat64;
    memories : Map.Map<Nat64, Memory>;
    nextSongId : Nat64;
    songs : Map.Map<Nat64, Song>;
    youtubeLinks : [YouTubeLink];
    messages : List.List<ChatMessage>;
    nextMessageId : Nat64;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  type YouTubeLink = {
    url : Text;
    timestamp : Int;
  };

  public func run(state : Actor) : Actor {
    state;
  };
};
