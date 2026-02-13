import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Memory } from '../backend';

export function useMemories() {
  const { actor, isFetching } = useActor();

  const memoriesQuery = useQuery<Memory[]>({
    queryKey: ['memories'],
    queryFn: async () => {
      if (!actor) return [];
      const memories = await actor.getAllMemories();
      // Sort newest first
      return memories.sort((a, b) => Number(b.created - a.created));
    },
    enabled: !!actor && !isFetching,
  });

  return {
    memories: memoriesQuery.data,
    isLoading: memoriesQuery.isLoading,
    error: memoriesQuery.error,
  };
}

export function useSubmitMemory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      text, 
      author, 
      imageUrl, 
      videoUrl 
    }: { 
      text: string; 
      author: string | null;
      imageUrl?: string | null;
      videoUrl?: string | null;
    }) => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }
      const response = await actor.submitMemory(
        text, 
        author || 'Anonymous', 
        imageUrl || null, 
        videoUrl || null
      );
      if (response.__kind__ === 'err') {
        throw new Error(response.err.message);
      }
      return response.ok;
    },
    onSuccess: () => {
      // Invalidate and refetch memories
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
  });
}

export function useEditMemory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id,
      text, 
      author, 
      imageUrl, 
      videoUrl 
    }: { 
      id: bigint;
      text: string; 
      author: string;
      imageUrl?: string | null;
      videoUrl?: string | null;
    }) => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }
      const response = await actor.editMemory(
        id,
        text, 
        author, 
        imageUrl || null, 
        videoUrl || null
      );
      if (response.__kind__ === 'err') {
        throw new Error(response.err.message);
      }
      return response.ok;
    },
    onSuccess: () => {
      // Invalidate and refetch memories
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
  });
}
