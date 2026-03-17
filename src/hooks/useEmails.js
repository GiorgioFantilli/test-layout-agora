import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
    fetchMessages,
    fetchParsedMessage,
    fetchMessageDetails,
    fetchEmailAccounts,
    fetchMessageCount,
} from "../services/api";

/**
 * Hook for fetching messages with polling and infinite scroll support
 */
export const useMessages = (
    limit = 50,
    statuses = [],
    accountIds = [],
    extraFilters = {},
    options = {}
) => {
    return useInfiniteQuery({
        queryKey: ['messages', { limit, statuses, accountIds, extraFilters }],

        queryFn: ({ pageParam = 0, signal }) =>
            fetchMessages(signal, limit, pageParam, statuses, accountIds, extraFilters),

        getNextPageParam: (lastPage) => lastPage?.nextSkip,

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
 * Hook for fetching all email accounts
 */
export const useEmailAccounts = (options = {}) => {
    return useQuery({
        queryKey: ["emailAccounts"],
        queryFn: ({ signal }) => fetchEmailAccounts(signal),
        staleTime: 60000,
        ...options,
    });
};

/**
 * Hook for fetching message count by status
 */
export const useMessageCount = (statuses = [], options = {}) => {
    return useQuery({
        queryKey: ["messageCount", { statuses }],
        queryFn: ({ signal }) => fetchMessageCount(signal, statuses),
        refetchInterval: 15000,
        staleTime: 10000,
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
