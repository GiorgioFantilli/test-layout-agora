import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  fetchMessages,
  fetchParsedMessage,
  fetchMessageDetails,
  fetchEmailAccounts,
  fetchMessageCount,
  fetchSubjectContext,
  fetchDocumentUnits,
  fetchDocumentAnalysis,
  fetchRoutingSuggestion,
  postRoutingDecision,
  fetchSenderResolution,
  postSenderResolutionDecision,
  patchEmailAccount,
  patchSubjectDraft,
  postSyncAccount,
  createEmailAccount,
  updateEmailAccount,
  fetchMessageEvents,
  fetchAttachmentProcessing,
  postRetryJob,
  fetchOfficeCatalog,
  fetchDashboardStats,
  fetchSystemHealth,
} from "../services/api";
import {
  transformSubjectContextDto,
  transformDocumentUnitDto,
  transformDocumentAnalysisDto,
  transformRoutingSuggestion,
  transformSenderResolutionDto,
} from "../services/dtoMappers";

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
 * Hook for fetching AI subject context from the Subject Context Builder.
 * Polls every 5s while generation is still pending.
 */
export const useSubjectContext = (messageId, options = {}) => {
  return useQuery({
    queryKey: ["subjectContext", messageId],
    queryFn: async ({ signal }) => {
      const dto = await fetchSubjectContext(messageId, signal);
      return dto ? transformSubjectContextDto(dto) : null;
    },
    enabled: !!messageId,
    staleTime: 30000,
    refetchInterval: (query) =>
      query.state.data?.status === "pending" ? 5000 : false,
    ...options,
  });
};

/**
 * Hook for fetching document units produced by the Pipeline Executor.
 * Returns an empty array if the pipeline has not yet produced any units.
 */
export const useDocumentUnits = (messageId, options = {}) => {
  return useQuery({
    queryKey: ["documentUnits", messageId],
    queryFn: async ({ signal }) => {
      const dtos = await fetchDocumentUnits(messageId, signal);
      return dtos.map(transformDocumentUnitDto);
    },
    enabled: !!messageId,
    staleTime: 30000,
    ...options,
  });
};

/**
 * Hook for fetching routing suggestion from the Office Router.
 * Polls every 3s while status is queued or in_progress.
 */
export const useRoutingSuggestion = (messageId, options = {}) => {
  return useQuery({
    queryKey: ["routingSuggestion", messageId],
    queryFn: async ({ signal }) => {
      const dto = await fetchRoutingSuggestion(messageId, signal);
      return dto ? transformRoutingSuggestion(dto) : null;
    },
    enabled: !!messageId,
    staleTime: 20000,
    refetchInterval: (query) =>
      ["queued", "in_progress"].includes(query.state.data?.status) ? 3000 : false,
    ...options,
  });
};

/**
 * Hook for posting a routing decision to the Office Router.
 * On success, invalidates the routing suggestion cache for this message.
 */
export const useRoutingDecision = (messageId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => postRoutingDecision(messageId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routingSuggestion", messageId] });
    },
  });
};

/**
 * Hook for fetching sender resolution from the Protocol MW service.
 * Polls every 3s while status is 'in_progress'.
 * Returns null if the worker has not yet processed the message (404).
 */
export const useSenderResolution = (messageId, options = {}) => {
  return useQuery({
    queryKey: ["senderResolution", messageId],
    queryFn: async ({ signal }) => {
      const dto = await fetchSenderResolution(messageId, signal);
      return dto ? transformSenderResolutionDto(dto) : null;
    },
    enabled: !!messageId,
    staleTime: 15000,
    refetchInterval: (query) =>
      query.state.data?.status === "in_progress" ? 3000 : false,
    ...options,
  });
};

/**
 * Hook for posting a sender resolution decision to the Protocol MW service.
 * On success, invalidates the sender resolution cache for this message.
 */
export const useSenderResolutionDecision = (messageId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => postSenderResolutionDecision(messageId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["senderResolution", messageId] });
    },
  });
};

/**
 * Hook for polling system health (LLM, DB, circuit breaker).
 * Polls every 30s. Never throws — on network error returns a synthetic degraded payload.
 */
export const useSystemHealth = (options = {}) => {
  return useQuery({
    queryKey: ["systemHealth"],
    queryFn: ({ signal }) => fetchSystemHealth(signal),
    refetchInterval: 30000,
    staleTime: 20000,
    retry: false,
    ...options,
  });
};
