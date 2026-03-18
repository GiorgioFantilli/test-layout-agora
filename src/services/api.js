import { transformMessageDto, transformAttachmentDto } from "./dtoMappers";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost/api/v1";
const POLLER_API_BASE =
  process.env.REACT_APP_POLLER_URL || "http://localhost/poller";
const PARSER_API_BASE =
  process.env.REACT_APP_PARSER_URL || "http://localhost/parser";
const SCB_API_BASE =
  process.env.REACT_APP_SCB_URL || "http://localhost/subject-context-builder";
const PIPELINE_API_BASE =
  process.env.REACT_APP_PIPELINE_URL || "http://localhost/pipeline-executor";
const OFFICE_ROUTER_API_BASE =
  process.env.REACT_APP_OFFICE_ROUTER_URL || "http://localhost/office-router";
const PROTOCOL_MW_API_BASE =
  process.env.REACT_APP_PROTOCOL_MW_URL || "http://localhost/protocol-mw";

/**
 * Authentication: Login
 */
export const login = async (username, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
    credentials: "include",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Login failed");
  }
  return await response.json();
};

/**
 * Authentication: Logout
 */
export const logout = async () => {
  const response = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Logout failed");
  }
  return true;
};

/**
 * Authentication: Get current user
 */
export const fetchMe = async () => {
  const response = await fetch(`${API_BASE}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!response.ok) {
    if (response.status === 401) {
      return null;
    }
    throw new Error("Failed to fetch user session");
  }
  return await response.json();
};

/**
 * Fetch messages from the Poller service.
 */
export const fetchMessages = async (
  signal,
  limit = 50,
  skip = 0,
  statuses = [],
  accountIds = [],
) => {
  try {
    let url = `${POLLER_API_BASE}/messages/?limit=${limit}&skip=${skip}&order_by=desc`;
    if (statuses && statuses.length > 0) {
      statuses.forEach((st) => {
        url += `&status=${encodeURIComponent(st)}`;
      });
    }
    if (accountIds && accountIds.length > 0) {
      accountIds.forEach((id) => {
        url += `&account_id=${encodeURIComponent(id)}`;
      });
    }
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      signal,
    });
    if (!response.ok) {
      throw new Error(`Error fetching messages: ${response.statusText}`);
    }
    const data = await response.json();

    const emailsMap = {};
    data.forEach((msg) => {
      const transformed = transformMessageDto(msg);
      emailsMap[transformed.id] = transformed;
    });
    return emailsMap;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Failed to fetch messages", error);
    }
    throw error;
  }
};

/**
 * Fetch parsed data (body, analysis) for a specific message from the Parser service.
 */
export const fetchParsedMessage = async (messageId, signal) => {
  try {
    const response = await fetch(
      `${PARSER_API_BASE}/parsed-messages/${messageId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        signal,
      },
    );
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Error fetching parsed message: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(`Failed to fetch parsed message ${messageId}`, error);
    }
    throw error;
  }
};

/**
 * Fetch email accounts from the Poller service.
 */
export const fetchEmailAccounts = async (signal) => {
  try {
    const response = await fetch(`${POLLER_API_BASE}/email-accounts/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      signal,
    });
    if (!response.ok) {
      throw new Error(`Error fetching email accounts: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Failed to fetch email accounts", error);
    }
    throw error;
  }
};

/**
 * Fetch a single message's metadata from the Poller service.
 */
export const fetchMessageMetadata = async (messageId, signal) => {
  try {
    const response = await fetch(`${POLLER_API_BASE}/messages/${messageId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      signal,
    });
    if (!response.ok) {
      throw new Error(
        `Error fetching message metadata: ${response.statusText}`,
      );
    }
    return await response.json();
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(`Failed to fetch message metadata for ${messageId}`, error);
    }
    throw error;
  }
};

/**
 * Fetch complete message details, combining Poller metadata and Parser content.
 */
export const fetchMessageDetails = async (messageId, signal) => {
  try {
    // 1. Get metadata from Poller
    const metadataDto = await fetchMessageMetadata(messageId, signal);

    // 2. Transform the metadata into our frontend format
    const transformedMessage = transformMessageDto(metadataDto);

    // 3. If parsed/analyzed, fetch the parsed body content
    const parseStatusUpper = (metadataDto.parse_status || "").toUpperCase();
    if (parseStatusUpper === "PARSED" || parseStatusUpper === "ANALYZED") {
      const parsedContent = await fetchParsedMessage(messageId, signal);
      if (parsedContent) {
        transformedMessage.body =
          parsedContent.body_text || parsedContent.body_html || "";
        transformedMessage.body_text = parsedContent.body_text || "";
        transformedMessage.body_html = parsedContent.body_html || "";

        if (parsedContent.attachments && parsedContent.attachments.length > 0) {
          transformedMessage.attachments = parsedContent.attachments.map(
            transformAttachmentDto,
          );
        }
      }
    }

    return transformedMessage;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(`Failed to fetch message details for ${messageId}`, error);
    }
    throw error;
  }
};

/**
 * Download an attachment from the Poller service.
 * Returns a Blob containing the attachment data.
 * Can be used for both download and preview.
 */
export const downloadAttachment = async (attachmentId, signal) => {
  try {
    const response = await fetch(
      `${POLLER_API_BASE}/attachments/${attachmentId}/download`,
      {
        method: "GET",
        credentials: "include",
        signal,
      },
    );

    if (!response.ok) {
      throw new Error(`Error downloading attachment: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(`Failed to download attachment ${attachmentId}`, error);
    }
    throw error;
  }
};

/**
 * Fetch AI subject context for a message from the Subject Context Builder service.
 * Returns the raw DTO or null if not yet available (404).
 * 200 → COMPLETED or MANUAL_REVIEW (data ready)
 * 202 → still processing (PENDING, CONTEXT_READY, LLM_GENERATION)
 * 404 → pipeline not started yet → null (not an error)
 */
export const fetchSubjectContext = async (messageId, signal) => {
  try {
    const response = await fetch(
      `${SCB_API_BASE}/messages/${messageId}/subject-context`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        signal,
      },
    );
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Error fetching subject context: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(`Failed to fetch subject context for ${messageId}`, error);
    }
    throw error;
  }
};

/**
 * Fetch document units for a message from the Pipeline Executor service.
 * Returns an empty array if the pipeline has not yet produced any units.
 */
export const fetchDocumentUnits = async (messageId, signal) => {
  try {
    const response = await fetch(
      `${PIPELINE_API_BASE}/messages/${messageId}/document-units`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        signal,
      },
    );
    if (!response.ok) {
      throw new Error(`Error fetching document units: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(`Failed to fetch document units for ${messageId}`, error);
    }
    throw error;
  }
};

/**
 * Fetch routing suggestion for a message from the Office Router service.
 * Returns null if not yet calculated (404).
 * 200 → status can be COMPLETED, MANUAL_REVIEW, QUEUED, IN_PROGRESS, FAILED_RETRYABLE, FAILED_FINAL
 */
export const fetchRoutingSuggestion = async (messageId, signal) => {
  try {
    const response = await fetch(
      `${OFFICE_ROUTER_API_BASE}/messages/${messageId}/routing-suggestion`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal,
      },
    );
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Error fetching routing suggestion: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(`Failed to fetch routing suggestion for ${messageId}`, error);
    }
    throw error;
  }
};

/**
 * Post a routing decision for a message to the Office Router service.
 */
export const postRoutingDecision = async (messageId, body) => {
  const response = await fetch(
    `${OFFICE_ROUTER_API_BASE}/messages/${messageId}/routing-decision`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    },
  );
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Error posting routing decision: ${response.statusText}`);
  }
  return await response.json();
};

/**
 * Fetch sender resolution for a message from the Protocol MW service.
 * Returns null if the worker has not yet processed the message (404).
 * 200 → status can be IN_PROGRESS, PREF_FOUND, CANDIDATES_0, CANDIDATES_1, CANDIDATES_N, LOOKUP_FAILED
 */
export const fetchSenderResolution = async (messageId, signal) => {
  try {
    const response = await fetch(
      `${PROTOCOL_MW_API_BASE}/messages/${messageId}/sender-resolution`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal,
      },
    );
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Error fetching sender resolution: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(`Failed to fetch sender resolution for ${messageId}`, error);
    }
    throw error;
  }
};

/**
 * Post a sender resolution decision for a message to the Protocol MW service.
 * Actions: 'select_existing' | 'manual_code' | 'create_new' | 'defer'
 */
export const postSenderResolutionDecision = async (messageId, body) => {
  const response = await fetch(
    `${PROTOCOL_MW_API_BASE}/messages/${messageId}/sender-resolution/decision`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    },
  );
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Error posting sender resolution decision: ${response.statusText}`);
  }
  return await response.json();
};

/**
 * Toggle enabled/disabled state for an email account.
 * Body: { "enabled": true | false }
 */
export const patchEmailAccount = async (accountId, body) => {
  const response = await fetch(`${POLLER_API_BASE}/email-accounts/${accountId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Error updating account: ${response.statusText}`);
  }
  return await response.json();
};

/**
 * Trigger a manual sync for an email account.
 * Returns 202 Accepted — the actual sync runs asynchronously.
 */
export const postSyncAccount = async (accountId) => {
  const response = await fetch(`${POLLER_API_BASE}/email-accounts/${accountId}/sync`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Error syncing account: ${response.statusText}`);
  }
  return response.status === 204 ? null : await response.json().catch(() => null);
};

/**
 * Create a new email account.
 * Body: { address, host, port, username, password }
 */
export const createEmailAccount = async (body) => {
  const response = await fetch(`${POLLER_API_BASE}/email-accounts/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Error creating account: ${response.statusText}`);
  }
  return await response.json();
};

/**
 * Update an existing email account.
 * Body: { address, host, port, username, password }
 */
export const updateEmailAccount = async (accountId, body) => {
  const response = await fetch(`${POLLER_API_BASE}/email-accounts/${accountId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Error updating account: ${response.statusText}`);
  }
  return await response.json();
};

/**
 * Fetch audit log events for a message from the Poller service.
 * Returns an array of events sorted by timestamp ascending.
 */
export const fetchMessageEvents = async (messageId, signal) => {
  try {
    const response = await fetch(
      `${POLLER_API_BASE}/messages/${messageId}/events`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal,
      },
    );
    if (!response.ok) {
      throw new Error(`Error fetching message events: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(`Failed to fetch message events for ${messageId}`, error);
    }
    throw error;
  }
};

/**
 * Fetch processing status for a single attachment from the Pipeline Executor service.
 * Returns null if not yet processed (404).
 */
export const fetchAttachmentProcessing = async (attachmentId, signal) => {
  try {
    const response = await fetch(
      `${PIPELINE_API_BASE}/attachments/${attachmentId}/processing`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal,
      },
    );
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Error fetching attachment processing: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(`Failed to fetch attachment processing for ${attachmentId}`, error);
    }
    throw error;
  }
};

/**
 * Retry a failed pipeline processing job.
 * jobId comes from the `job.id` field of fetchAttachmentProcessing response.
 */
export const postRetryJob = async (jobId) => {
  const response = await fetch(
    `${PIPELINE_API_BASE}/processing/jobs/${jobId}/retry`,
    {
      method: "POST",
      credentials: "include",
    },
  );
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Error retrying job: ${response.statusText}`);
  }
  return response.status === 204 ? null : await response.json().catch(() => null);
};

/**
 * Fetch total count of messages, optionally with a status filter.
 */
export const fetchMessageCount = async (signal, statuses = []) => {
  try {
    let url = `${POLLER_API_BASE}/messages/count`;
    if (statuses && statuses.length > 0) {
      statuses.forEach((st, idx) => {
        url += `${idx === 0 ? "?" : "&"}status_filter=${encodeURIComponent(st)}`;
      });
    }
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      signal,
    });
    if (!response.ok) {
      throw new Error(`Error fetching message count: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Failed to fetch message count", error);
    }
    throw error;
  }
};

/**
 * Fetch office catalog from the Office Router service.
 */
export const fetchOfficeCatalog = async (signal) => {
  try {
    const response = await fetch(`${OFFICE_ROUTER_API_BASE}/offices`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal,
    });
    if (!response.ok) {
      throw new Error(`Error fetching office catalog: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(`Failed to fetch office catalog`, error);
    }
    throw error;
  }
};

/**
 * Manually override the AI-generated subject draft for a message.
 * Sets manually_revised = true on the backend and records an audit event.
 * Body: { new_subject: string }
 */
export const patchSubjectDraft = async (messageId, newSubject) => {
  const response = await fetch(
    `${SCB_API_BASE}/messages/${messageId}/subject-context`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ new_subject: newSubject }),
    },
  );
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Error updating subject draft: ${response.statusText}`);
  }
  return await response.json();
};

/**
 * Fetch document-level AI analysis from the Subject Context Builder service.
 * Returns an array (possibly empty) of structured summaries per document_unit.
 * 404 → null (tenant not found or pipeline not started)
 * 200 → array (also empty if no analyses yet)
 */
export const fetchDocumentAnalysis = async (messageId, signal) => {
  try {
    const response = await fetch(
      `${SCB_API_BASE}/messages/${messageId}/document-analysis`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal,
      },
    );
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Error fetching document analysis: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(`Failed to fetch document analysis for ${messageId}`, error);
    }
    throw error;
  }
};

/**
 * Fetch system health status from the Subject Context Builder service.
 * Returns the health payload regardless of HTTP status (200 ok, 503 degraded)
 * so the caller can inspect individual service states.
 * On network error returns a synthetic degraded payload.
 */
export const fetchSystemHealth = async (signal) => {
  try {
    const response = await fetch(`${SCB_API_BASE}/health/ready`, {
      credentials: "include",
      signal,
    });
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return { status: "degraded", llm: "unreachable", db: "unknown", llm_circuit: "UNKNOWN" };
  }
};

/**
 * Fetch dashboard statistics from the Poller service.
 */
export const fetchDashboardStats = async (signal) => {
  try {
    const response = await fetch(`${POLLER_API_BASE}/stats/summary`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      signal,
    });
    if (!response.ok) {
      throw new Error(`Error fetching dashboard stats: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Failed to fetch dashboard stats", error);
    }
    throw error;
  }
};
