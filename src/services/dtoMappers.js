
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
  id: att.id?.toString() || att.attachment_id?.toString() || null,
  filename: att.filename,
  fileType: att.mime_type || "application/octet-stream",
  sizeMB: att.size_bytes ? (att.size_bytes / (1024 * 1024)).toFixed(2) : 0,
  sha256: att.sha256,
  disposition: att.disposition,
});

/**
 * Parses the "from" address to extract the sender and email.
 */
const parseFromAddress = (fromAddr) => {
  if (!fromAddr) {
    return { sender: 'Sconosciuto', email: '' };
  }

  const emailMatch = fromAddr.match(/<[^>]+>/);

  let email = '';
  let sender = '';

  if (emailMatch) {
    email = emailMatch[0].trim();
    sender = fromAddr.replace(email, '').replace(/["\\]/g, '').trim();
  } else {
    const cleanEmail = fromAddr.replace(/["\\]/g, '').trim();
    email = `<${cleanEmail}>`;
    sender = '';
  }

  return {
    sender: sender || 'Sconosciuto',
    email: email
  };
};

/**
 * Decodes a MIME subject string.
 */
const decodeMimeSubject = (subject) => {
  if (!subject) return '';

  let cleanedSubject = subject.replace(/\?=\s+=\?/g, '?==?');

  const mimeRegex = /=\?([^?]+)\?([BbQq])\?([^?]+)\?=/gi;

  return cleanedSubject.replace(mimeRegex, (match, charset, encoding, text) => {
    try {
      if (encoding.toUpperCase() === 'Q') {
        let qText = text.replace(/_/g, ' ');
        qText = qText.replace(/=([A-Fa-f0-9]{2})/g, '%$1');
        return decodeURIComponent(qText);
      }

      if (encoding.toUpperCase() === 'B') {
        return decodeURIComponent(escape(atob(text)));
      }
    } catch (e) {
      console.error("Errore nella decodifica dell'oggetto:", e);
      return match;
    }

    return match;
  });
};

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
    sender: parseFromAddress(msg.from_addr).sender,
    email: parseFromAddress(msg.from_addr).email,
    subject: decodeMimeSubject(msg.subject) || "Nessun Oggetto",
    body: "",
    date: msg.msg_date,
    recipient: msg.account?.address || "Sconosciuto",
    readDate: msg.status === "read" ? msg.msg_date : null,
    status: frontendStatus,
    parse_status: msg.parse_status,
    attachments: (msg.attachments || []).map(transformAttachmentDto),
  };
};
