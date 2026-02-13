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
export interface backendInterface {
    editMemory(id: bigint, newText: string, newAuthor: string, newImageUrl: string | null, newVideoUrl: string | null): Promise<SubmitMemoryResponse>;
    getAllMemories(): Promise<Array<Memory>>;
    getAllSongs(): Promise<Array<[bigint, Song]>>;
    getMemory(id: bigint): Promise<Memory | null>;
    getSong(id: bigint): Promise<Song | null>;
    getYouTubeLinks(): Promise<Array<YouTubeLink>>;
    submitMemory(text: string, author: string, imageUrl: string | null, videoUrl: string | null): Promise<SubmitMemoryResponse>;
    submitYouTubeLink(url: string): Promise<boolean>;
    uploadSong(bytes: Uint8Array, fileName: string, artist: string | null, title: string | null, year: bigint | null, description: string | null): Promise<bigint>;
}
