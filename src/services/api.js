import { transformMessageDto, transformAttachmentDto } from "./dtoMappers";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost/api/v1";
const POLLER_API_BASE =
  process.env.REACT_APP_POLLER_URL || "http://localhost/poller";
const PARSER_API_BASE =
  process.env.REACT_APP_PARSER_URL || "http://localhost/parser";

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
) => {
  try {
    let url = `${POLLER_API_BASE}/messages/?limit=${limit}&skip=${skip}&order_by=desc`;
    if (statuses && statuses.length > 0) {
      statuses.forEach((st) => {
        url += `&status=${encodeURIComponent(st)}`;
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
