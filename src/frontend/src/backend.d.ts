import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Memory {
    id: bigint;
    created: bigint;
    text: string;
    author?: string;
    imageUrl?: string;
    videoUrl?: string;
}
export type SubmitMemoryResponse = {
    __kind__: "ok";
    ok: Memory;
} | {
    __kind__: "err";
    err: {
        message: string;
    };
};
export interface backendInterface {
    getAllMemories(): Promise<Array<Memory>>;
    getMemory(id: bigint): Promise<Memory | null>;
    submitMemory(text: string, author: string | null, imageUrl: string | null, videoUrl: string | null): Promise<SubmitMemoryResponse>;
}
