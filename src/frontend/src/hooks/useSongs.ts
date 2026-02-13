import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Song } from '../backend';

export function useSongs() {
  const { actor, isFetching } = useActor();

  const songsQuery = useQuery<Array<[bigint, Song]>>({
    queryKey: ['songs'],
    queryFn: async () => {
      if (!actor) return [];
      const songs = await actor.getAllSongs();
      // Sort newest first (by id)
      return songs.sort((a, b) => Number(b[0] - a[0]));
    },
    enabled: !!actor && !isFetching,
  });

  return {
    songs: songsQuery.data,
    isLoading: songsQuery.isLoading,
    error: songsQuery.error,
  };
}

export function useUploadSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      bytes, 
      fileName,
      artist,
      title,
      year,
      description,
    }: { 
      bytes: Uint8Array;
      fileName: string;
      artist?: string | null;
      title?: string | null;
      year?: bigint | null;
      description?: string | null;
    }) => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }
      const id = await actor.uploadSong(
        bytes,
        fileName,
        artist || null,
        title || null,
        year || null,
        description || null
      );
      return id;
    },
    onSuccess: () => {
      // Invalidate and refetch songs
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
}
