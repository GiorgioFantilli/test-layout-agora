
export const BACKEND_STATUS = {
  PERSISTED: "PERSISTED",
  PROCESSED: "PROCESSED",
};

export const BACKEND_PARSE_STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  PARSED: "PARSED",
  ANALYZED: "ANALYZED",
  FAILED: "FAILED",
};

export const FRONTEND_STATUS = {
  PENDING: "pending",
  ANALYZED: "analyzed",
  PROCESSED: "processed",
};

/**
 * Maps backend statuses (from Poller and Parser) to a simplified frontend status.
 */
export const mapBackendStatusToFrontend = (
  backendStatus,
  backendParseStatus,
) => {
  const statusUpper = (backendStatus || "").toUpperCase();
  const parseStatusUpper = (backendParseStatus || "").toUpperCase();

  let frontendStatus = FRONTEND_STATUS.PENDING;

  if (statusUpper === BACKEND_STATUS.PROCESSED) {
    frontendStatus = FRONTEND_STATUS.PROCESSED;
  } else if (statusUpper === BACKEND_STATUS.PERSISTED) {
    if (
      parseStatusUpper === BACKEND_PARSE_STATUS.PARSED ||
      parseStatusUpper === BACKEND_PARSE_STATUS.ANALYZED
    ) {
      frontendStatus = FRONTEND_STATUS.ANALYZED;
    } else {
      frontendStatus = FRONTEND_STATUS.PENDING;
    }
  }

  return frontendStatus;
};

/**
 * Transforms a backend Attachment DTO into the format expected by the frontend.
 */
export const transformAttachmentDto = (att) => ({
  id: att.id.toString(),
  filename: att.filename,
  fileType: att.mime_type || "application/octet-stream",
  sizeMB: att.size_bytes ? (att.size_bytes / (1024 * 1024)).toFixed(2) : 0,
  sha256: att.sha256,
  disposition: att.disposition,
});

/**
 * Transforms a backend MessageRead DTO into the format expected by the frontend.
 */
export const transformMessageDto = (msg) => {
  // Map backend status to frontend status
  const frontendStatus = mapBackendStatusToFrontend(
    msg.status,
    msg.parse_status,
  );

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
    attachments: (msg.attachments || []).map(transformAttachmentDto),
  };
};
