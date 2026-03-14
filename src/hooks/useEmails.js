import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchMessages, fetchParsedMessage, fetchMessageDetails } from '../services/api';

/**
 * Hook for fetching messages with polling and infinite scroll support
 */
export const useMessages = (limit = 50, statuses = [], accountId = null, extraFilters = {}, options = {}) => {
    return useInfiniteQuery({
        queryKey: ['messages', { limit, statuses, accountId, extraFilters }],

        queryFn: ({ pageParam = 0, signal }) => fetchMessages(signal, limit, pageParam, statuses, accountId, extraFilters),

        getNextPageParam: (lastPage) => lastPage.nextSkip,

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
        queryKey: ['parsedMessage', messageId],

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
        queryKey: ['messageDetails', messageId],
        queryFn: ({ signal }) => fetchMessageDetails(messageId, signal),
        enabled: !!messageId,
        refetchOnWindowFocus: false,
        ...options,
    });
};