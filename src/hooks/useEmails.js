import { useQuery } from "@tanstack/react-query";
import {
  fetchMessages,
  fetchParsedMessage,
  fetchMessageDetails,
} from "../services/api";

/**
 * Hook for fetching messages with polling support
 */
export const useMessages = (
  limit = 50,
  skip = 0,
  statuses = [],
  accountIds = [],
  options = {},
) => {
  return useQuery({
    queryKey: ["messages", { limit, skip, statuses, accountIds }],

    queryFn: ({ signal }) =>
      fetchMessages(signal, limit, skip, statuses, accountIds),

    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    staleTime: 5000,

    ...options,
  });
};

/**
 * Hook for fetching parsed message details
 */
export const useParsedMessage = (messageId, options = {}) => {
  return useQuery({
    queryKey: ["parsedMessage", messageId],

    queryFn: ({ signal }) => fetchParsedMessage(messageId, signal),

    enabled: !!messageId,
    refetchOnWindowFocus: true,
    staleTime: 60000,

    ...options,
  });
};

/**
 * Hook for fetching message details
 */
export const useMessageDetails = (messageId, options = {}) => {
  return useQuery({
    queryKey: ["messageDetails", messageId],
    queryFn: ({ signal }) => fetchMessageDetails(messageId, signal),
    enabled: !!messageId,
    refetchOnWindowFocus: false,
    ...options,
  });
};
