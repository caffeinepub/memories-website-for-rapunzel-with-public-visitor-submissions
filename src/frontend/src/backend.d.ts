import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type SubmitMemoryResponse = {
    __kind__: "ok";
    ok: Memory;
} | {
    __kind__: "err";
    err: {
        message: string;
    };
};
export interface YouTubeLink {
    url: string;
    timestamp: bigint;
}
export interface Memory {
    id: bigint;
    created: bigint;
    submitter?: Principal;
    edited?: bigint;
    text: string;
    author: string;
    imageUrl?: string;
    videoUrl?: string;
}
export interface Song {
    title?: string;
    year?: bigint;
    description?: string;
    fileName: string;
    artist?: string;
    bytes: Uint8Array;
}
export type SubmitMessageResponse = {
    __kind__: "ok";
    ok: ChatMessage;
} | {
    __kind__: "err";
    err: {
        message: string;
    };
};
export interface ChatMessage {
    id: bigint;
    created: bigint;
    displayName: string;
    text: string;
    sender: Principal;
}
export interface UserProfile {
    displayName: string;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteChatMessages(messageIdsToDelete: BigUint64Array): Promise<void>;
    editMemory(id: bigint, newText: string, newAuthor: string, newImageUrl: string | null, newVideoUrl: string | null): Promise<SubmitMemoryResponse>;
    getAllMemories(): Promise<Array<Memory>>;
    getAllSongs(): Promise<Array<[bigint, Song]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMemory(id: bigint): Promise<Memory | null>;
    getMessages(): Promise<Array<ChatMessage>>;
    getMessagesByPrincipal(principal: Principal): Promise<Array<ChatMessage>>;
    getMessagesBySender(sender: Principal): Promise<Array<ChatMessage>>;
    getMessagesFromTo(sender: Principal, from: bigint, to: bigint): Promise<Array<ChatMessage>>;
    getSong(id: bigint): Promise<Song | null>;
    getUniqueSenders(): Promise<Array<Principal>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getYouTubeLinks(): Promise<Array<YouTubeLink>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitMemory(text: string, author: string, imageUrl: string | null, videoUrl: string | null): Promise<SubmitMemoryResponse>;
    submitMessage(text: string, displayName: string): Promise<SubmitMessageResponse>;
    submitYouTubeLink(url: string): Promise<boolean>;
    uploadSong(bytes: Uint8Array, fileName: string, artist: string | null, title: string | null, year: bigint | null, description: string | null): Promise<bigint>;
}
