import { mapBackendStatusToFrontend } from "../utils/statusMapper";

const POLLER_API_BASE =
  process.env.REACT_APP_POLLER_URL || "http://localhost/poller";
const PARSER_API_BASE =
  process.env.REACT_APP_PARSER_URL || "http://localhost/parser";

/**
 * Transforms a backend MessageRead DTO into the format expected by the frontend.
 */
export const transformMessageDto = (msg) => {
  // Map backend status to frontend status
  const frontendStatus = mapBackendStatusToFrontend(msg.status, msg.parse_status);

  return {
    id: msg.id,
    sender: msg.from_addr || "Sconosciuto",
    email: msg.from_addr || "",
    subject: msg.subject || "Nessun Oggetto",
    body: "",
    date: msg.msg_date,
    recipient: msg.account?.address || "Sconosciuto",
    readDate: msg.status === "read" ? msg.msg_date : null,
    status: frontendStatus,
    parse_status: msg.parse_status,
    attachments: (msg.attachments || []).map((att) => ({
      id: att.id.toString(),
      filename: att.filename,
      fileType: att.mime_type || "application/octet-stream",
      sizeMB: att.size_bytes ? (att.size_bytes / (1024 * 1024)).toFixed(2) : 0,
    })),
  };
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
    let url = `${POLLER_API_BASE}/messages/?limit=${limit}&skip=${skip}`;
    if (statuses && statuses.length > 0) {
      statuses.forEach((st) => {
        url += `&status=${encodeURIComponent(st)}`;
      });
    }
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Code": "default",
      },
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
          "X-Tenant-Code": "default",
        },
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
        "X-Tenant-Code": "default",
      },
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
        "X-Tenant-Code": "default",
      },
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

        // Poller's attachments are preferred as they contain the 'id' for downloading.
        // We already handled them in transformMessageDto.
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
