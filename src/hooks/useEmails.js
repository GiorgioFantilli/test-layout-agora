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
  fetchDailySummary,
  fetchRevisionRate,
  fetchPipelineFunnel,
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
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "pending") return 5000;          // SCB in elaborazione → poll veloce
      if (query.state.data === null) return 15000;    // SCB non ancora partito → poll lento
      return false;                                   // completed/manual_review → stop
    },
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

/**
 * Mutation to toggle enabled/disabled state of an email account.
 * Call with: mutate({ accountId, enabled })
 * On success, invalidates the emailAccounts cache.
 */
export const useToggleAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ accountId, enabled }) => patchEmailAccount(accountId, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
};

/**
 * Mutation to trigger a manual sync on an email account.
 * Call with: mutate(accountId)
 * On success, invalidates the messages cache to reflect newly fetched emails.
 */
export const useSyncAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountId) => postSyncAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
};

/**
 * Mutation to create a new email account.
 * Call with: mutate({ address, host, port, username, password })
 * On success, invalidates the emailAccounts cache.
 */
export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => createEmailAccount(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailAccounts"] });
    },
  });
};

/**
 * Hook for fetching the audit log events of a message from the Poller service.
 * Events are sorted ascending by timestamp (oldest first).
 * staleTime: 2 minutes — events don't change once recorded.
 */
export const useMessageEvents = (messageId, options = {}) => {
  return useQuery({
    queryKey: ["messageEvents", messageId],
    queryFn: ({ signal }) => fetchMessageEvents(messageId, signal),
    enabled: !!messageId,
    staleTime: 120000,
    ...options,
  });
};

/**
 * Mutation to update an existing email account.
 * Call with: mutate({ accountId, address, host, port, username, password })
 * On success, invalidates the emailAccounts cache.
 */
export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ accountId, ...body }) => updateEmailAccount(accountId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailAccounts"] });
    },
  });
};

/**
 * Hook for fetching the processing status of a single attachment.
 * Polls every 3s while the job is QUEUED or IN_PROGRESS.
 * Returns null if the pipeline has not yet started (404).
 */
export const useAttachmentProcessing = (attachmentId, options = {}) => {
  return useQuery({
    queryKey: ["attachmentProcessing", attachmentId],
    queryFn: ({ signal }) => fetchAttachmentProcessing(attachmentId, signal),
    enabled: !!attachmentId,
    staleTime: 10000,
    refetchInterval: (query) => {
      const status = query.state.data?.job?.status;
      return status && ["QUEUED", "IN_PROGRESS"].includes(status) ? 3000 : false;
    },
    ...options,
  });
};

/**
 * Mutation to retry a failed pipeline processing job.
 * Call with: mutate({ jobId, attachmentId })
 * On success, invalidates the attachmentProcessing cache for that attachment.
 */
export const useRetryJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId }) => postRetryJob(jobId),
    onSuccess: (_, { attachmentId }) => {
      queryClient.invalidateQueries({ queryKey: ["attachmentProcessing", attachmentId] });
    },
  });
};

/**
 * Mutation to manually override the AI-generated subject draft.
 * On success, invalidates the subjectContext cache so the panel reflects
 * the new draft and the manuallyRevised flag immediately.
 */
export const useUpdateSubjectDraft = (messageId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newSubject) => patchSubjectDraft(messageId, newSubject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjectContext", messageId] });
    },
  });
};

/**
 * Hook for fetching document-level AI analysis from the Subject Context Builder.
 * Returns a map of { [rootAttachmentId]: DocumentAnalysis } for easy lookup.
 * Should be enabled only when subjectContext.status === 'completed' (analyses are ready).
 * staleTime: 60s — summaries don't change once generated.
 */
export const useDocumentAnalysis = (messageId, options = {}) => {
  return useQuery({
    queryKey: ["documentAnalysis", messageId],
    queryFn: async ({ signal }) => {
      const dtos = await fetchDocumentAnalysis(messageId, signal);
      if (!dtos) return {};
      const map = {};
      dtos.map(transformDocumentAnalysisDto).forEach((item) => {
        if (item.rootAttachmentId != null) {
          map[item.rootAttachmentId] = item;
        }
      });
      return map;
    },
    enabled: !!messageId,
    staleTime: 60000,
    ...options,
  });
};

/**
 * Hook for fetching office catalog from the Office Router.
 */
export const useOfficeCatalog = (options = {}) => {
  return useQuery({
    queryKey: ["officeCatalog"],
    queryFn: ({ signal }) => fetchOfficeCatalog(signal),
    staleTime: 600000,
    ...options,
  });
};

/**
 * Hook for fetching dashboard statistics.
 * Refreshes every 30 seconds.
 */
export const useDashboardStats = (options = {}) => {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: ({ signal }) => fetchDashboardStats(signal),
    refetchInterval: 30000,
    staleTime: 10000,
    ...options,
  });
};

/**
 * Hook for fetching daily AI processing summary from the Subject Context Builder.
 * Returns { completed_today, manual_review_today, pending_count }.
 * Refreshes every 30 seconds.
 */
export const useDailySummary = (options = {}) => {
  return useQuery({
    queryKey: ["dailySummary"],
    queryFn: ({ signal }) => fetchDailySummary(signal),
    refetchInterval: 30000,
    staleTime: 10000,
    ...options,
  });
};

/**
 * Hook for fetching AI subject revision rate from the Subject Context Builder.
 * Returns { total_completed, manually_revised, accepted_pct, revised_pct }.
 * Refreshes every 60 seconds (dato meno urgente).
 */
export const useRevisionRate = (options = {}) => {
  return useQuery({
    queryKey: ["revisionRate"],
    queryFn: ({ signal }) => fetchRevisionRate(signal),
    refetchInterval: 60000,
    staleTime: 30000,
    ...options,
  });
};

/**
 * Hook for fetching pipeline funnel distribution from the Poller.
 * Returns { ingest_ready, parsing, ai_processing, completed, failed }.
 * Refreshes every 30 seconds.
 */
export const usePipelineFunnel = (options = {}) => {
  return useQuery({
    queryKey: ["pipelineFunnel"],
    queryFn: ({ signal }) => fetchPipelineFunnel(signal),
    refetchInterval: 30000,
    staleTime: 10000,
    ...options,
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
