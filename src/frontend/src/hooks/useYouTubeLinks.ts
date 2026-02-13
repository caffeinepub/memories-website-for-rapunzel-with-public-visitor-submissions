import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { YouTubeLink } from '../backend';

export function useYouTubeLinks() {
  const { actor, isFetching } = useActor();

  const linksQuery = useQuery<YouTubeLink[]>({
    queryKey: ['youtubeLinks'],
    queryFn: async () => {
      if (!actor) return [];
      const links = await actor.getYouTubeLinks();
      // Sort newest first by timestamp
      return links.sort((a, b) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor && !isFetching,
  });

  return {
    links: linksQuery.data,
    isLoading: linksQuery.isLoading,
    error: linksQuery.error,
  };
}

export function useSubmitYouTubeLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (url: string) => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }
      const success = await actor.submitYouTubeLink(url);
      if (!success) {
        throw new Error('Failed to submit YouTube link');
      }
      return success;
    },
    onSuccess: () => {
      // Invalidate and refetch YouTube links
      queryClient.invalidateQueries({ queryKey: ['youtubeLinks'] });
    },
  });
}
