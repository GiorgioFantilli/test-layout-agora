export const FRONTEND_STATUS = {
  PENDING: "pending",
  ANALYZED: "analyzed",
  PROCESSED: "processed",
};

/**
 * Maps backend statuses to a simplified frontend status.
 *
 * ANALYZED: generation_status = COMPLETED o MANUAL_REVIEW — pronto per l'operatore.
 * PROCESSED: stato locale temporaneo impostato da PROTOCOL_EMAIL in AppContext
 *            per feedback UI immediato (non deriva dal backend).
 * PENDING: tutto il resto (pipeline in corso o non ancora avviata).
 */
export const mapBackendStatusToFrontend = (
  _ingestStatus,
  _parseStatus,
  generationStatus,
) => {
  const genUpper = (generationStatus || "").toUpperCase();
  if (genUpper === "COMPLETED" || genUpper === "MANUAL_REVIEW") {
    return FRONTEND_STATUS.ANALYZED;
  }
  return FRONTEND_STATUS.PENDING;
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
    return { sender: "Sconosciuto", email: "" };
  }

  const emailMatch = fromAddr.match(/<[^>]+>/);

  let email = "";
  let sender = "";

  if (emailMatch) {
    email = emailMatch[0].trim();
    sender = fromAddr.replace(email, "").replace(/["\\]/g, "").trim();
  } else {
    const cleanEmail = fromAddr.replace(/["\\]/g, "").trim();
    email = `<${cleanEmail}>`;
    sender = "";
  }

  return {
    sender: sender || "Sconosciuto",
    email: email,
  };
};

/**
 * Decodes a MIME subject string.
 */
const decodeMimeSubject = (subject) => {
  if (!subject) return "";

  let cleanedSubject = subject.replace(/\?=\s+=\?/g, "?==?");

  const mimeRegex = /=\?([^?]+)\?([BbQq])\?([^?]+)\?=/gi;

  return cleanedSubject.replace(mimeRegex, (match, charset, encoding, text) => {
    try {
      if (encoding.toUpperCase() === "Q") {
        let qText = text.replace(/_/g, " ");
        qText = qText.replace(/=([A-Fa-f0-9]{2})/g, "%$1");
        return decodeURIComponent(qText);
      }

      if (encoding.toUpperCase() === "B") {
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
 * Maps backend generation_status to frontend status string.
 */
const SCB_STATUS_MAP = {
  COMPLETED: "completed",
  MANUAL_REVIEW: "manual_review",
  PENDING: "pending",
  CONTEXT_READY: "pending",
  LLM_GENERATION: "pending",
};

/**
 * Transforms a Subject Context Builder DTO into the format expected by the frontend.
 */
export const transformSubjectContextDto = (dto) => ({
  status: SCB_STATUS_MAP[dto.generation_status] ?? "pending",
  subjectDraft: dto.normalized_subject_draft ?? null,
  confidence: dto.generation_confidence ?? null,
  documentsUsed: dto.documents_used ?? null,
  modelUsed: dto.llm_model_used ?? null,
  failureMode: dto.failure_mode ?? null,
  manuallyRevised: dto.manually_revised ?? false,
});

/**
 * Transforms a Pipeline Executor DocumentUnit DTO into the format expected by the frontend.
 */
export const transformDocumentUnitDto = (du) => ({
  id: du.id,
  messageId: du.message_id,
  rootAttachmentId: du.root_attachment_id,
  filename: du.filename,
  mimeType: du.mime_type,
  role: du.role,
  isProtocollable: du.is_protocollable,
  isPrimaryCandidate: du.is_primary_candidate,
  extractionQuality: du.extraction_quality,
  textExcerpt: du.text_excerpt ?? null,
  status: du.status,
  sortOrder: du.sort_order,
});

/**
 * Transforms a Protocol MW SenderResolution DTO into the format expected by the frontend.
 */
export const transformSenderResolutionDto = (dto) => ({
  status: (dto.status || "").toLowerCase(),
  senderKey: dto.sender_key ?? null,
  candidates: (dto.candidates || []).map((c) => ({
    codice: c.codice,
    descrizione: c.descrizione,
    pec: c.pec ?? null,
  })),
  attempts: dto.attempts ?? 0,
  lastErrorCode: dto.last_error_code ?? null,
  fetchedAt: dto.fetched_at ?? null,
});

const ROUTING_STATUS_MAP = {
  COMPLETED: "completed",
  MANUAL_REVIEW: "manual_review",
  QUEUED: "queued",
  IN_PROGRESS: "in_progress",
  FAILED_RETRYABLE: "failed",
  FAILED_FINAL: "failed",
};

/**
 * Transforms an Office Router RoutingSuggestion DTO into the format expected by the frontend.
 */
export const transformRoutingSuggestion = (dto) => ({
  status: ROUTING_STATUS_MAP[dto.status] ?? "queued",
  primaryOfficeCode: dto.primary_office_code ?? null,
  primaryConfidence: dto.primary_confidence ?? null,
  candidates: (dto.candidates || []).map((c) => ({
    rank: c.rank,
    officeCode: c.office_code,
    role: c.role,
    score: c.final_score,
  })),
});

/**
 * Maps backend analysis_status values for document-level analysis.
 */
const DSA_STATUS_MAP = {
  COMPLETED: "completed",
  MANUAL_REVIEW: "manual_review",
  PENDING: "pending",
  TEXT_PREPARED: "pending",
  CLASSIFIED: "pending",
  RELEVANCE_EVALUATED: "pending",
  SUMMARY_GENERATED: "pending",
};

/**
 * Transforms a Subject Context Builder DocumentAnalysis DTO into the format expected by the frontend.
 * Input: one element from GET /messages/{id}/document-analysis
 */
export const transformDocumentAnalysisDto = (dto) => {
  const ssj = dto.structured_summary_json ?? null;
  return {
    documentUnitId: dto.document_unit_id,
    rootAttachmentId: dto.root_attachment_id ?? null,
    filename: dto.filename ?? null,
    summary: ssj?.summary ?? null,
    documentType: ssj?.document_type ?? null,
    keyEntities: Array.isArray(ssj?.key_entities) ? ssj.key_entities : [],
    urgencyHint: ssj?.urgency_hint ?? null,
    generationStatus: DSA_STATUS_MAP[dto.generation_status] ?? "pending",
    failureMode: dto.failure_mode ?? null,
  };
};

/**
 * Transforms a backend MessageRead DTO into the format expected by the frontend.
 */
export const transformMessageDto = (msg) => {
  // Map backend status to frontend status
  const frontendStatus = mapBackendStatusToFrontend(
    msg.ingest_status,
    msg.parse_status,
    msg.generation_status,
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
    account_id: msg.account_id,
    ingestStatus: msg.ingest_status,
    parseStatus: msg.parse_status,
    parse_status: msg.parse_status,
    generationStatus: msg.generation_status ?? null,
    attachments: (msg.attachments || []).map(transformAttachmentDto),
  };
};
