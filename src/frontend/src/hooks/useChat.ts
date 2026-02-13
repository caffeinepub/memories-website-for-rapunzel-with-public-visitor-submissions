import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ChatMessage } from '../backend';

const CHAT_POLL_INTERVAL = 3000; // Poll every 3 seconds

export function useMessages() {
  const { actor, isFetching } = useActor();

  return useQuery<ChatMessage[]>({
    queryKey: ['messages'],
    queryFn: async () => {
      if (!actor) return [];
      const messages = await actor.getMessages();
      // Return messages as-is (backend returns them in order)
      return messages;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: CHAT_POLL_INTERVAL, // Poll for new messages
  });
}

export function useSubmitMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ text, displayName }: { text: string; displayName: string }) => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }
      const response = await actor.submitMessage(text, displayName);
      if (response.__kind__ === 'err') {
        throw new Error(response.err.message);
      }
      return response.ok;
    },
    onSuccess: () => {
      // Invalidate and refetch messages
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useDeleteMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: bigint) => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }
      // Ensure we send exactly BigUint64Array with the message ID
      const idsArray = new BigUint64Array(1);
      idsArray[0] = messageId;
      await actor.deleteChatMessages(idsArray);
    },
    onSuccess: () => {
      // Invalidate and refetch messages immediately
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useDeleteMessages() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageIds: bigint[]) => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }
      // Normalize: filter out non-bigint, deduplicate, and sort for deterministic order
      const uniqueIds = Array.from(new Set(messageIds.filter(id => typeof id === 'bigint')));
      uniqueIds.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
      
      // Convert to BigUint64Array as required by backend
      const idsArray = new BigUint64Array(uniqueIds.length);
      uniqueIds.forEach((id, index) => {
        idsArray[index] = id;
      });
      
      await actor.deleteChatMessages(idsArray);
    },
    onSuccess: () => {
      // Invalidate and refetch messages immediately
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}
