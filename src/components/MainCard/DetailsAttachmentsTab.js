import React, { useState } from "react";
import AiButton from "./AiButton";
import AttachmentItem from "./AttachmentItem";
import AiIntelligencePanel from "./AiIntelligencePanel";
import { formatEmailDateTime } from "../../utils/dateUtils";
import EmailBodyViewer from "./EmailBodyViewer";
import { isComplexHtml } from "../../utils/iframeUtils";

function DetailsAttachmentsTab({
  email,
  attachments,
  senderStatus,
  onVerifyContactClick,
  analysisResults,
  isSynthesizingAll,
  onAnalyzeAll,
  onAttachmentAnalyze,
  onGoToProtocol,
  isFullscreen,
}) {
  const [isBodyExpanded, setIsBodyExpanded] = useState(true);

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const hasBody = !!(email.body_html || email.body || email.body_text);

  return (
    <div id="step1-content">

      {/* ── 1. Header mittente (riorganizzato) ── */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--c-border-base)',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: '2.5rem',
            height: '2.5rem',
            minWidth: '2.5rem',
            background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-dark) 100%)',
            color: 'var(--c-text-inverted)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.05em',
          }}
        >
          {getInitials(email.sender)}
        </div>

        {/* Colonna info */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>

          {/* Riga 1: Nome + Badge (assoluto) + Email mittente + Data (a destra) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--c-text-base)', whiteSpace: 'nowrap' }}>
              {email.sender}
            </span>
            <button
              className={`contact-status-badge contact-status-badge-compact ${senderStatus.className}`}
              onClick={onVerifyContactClick}
              title={senderStatus.text}
              style={{ flexShrink: 0 }}
            >
              <i className={`fas ${senderStatus.icon}`} style={{ fontSize: '0.65rem' }}></i>
              <span className="status-text">{senderStatus.text}</span>
            </button>
            <span style={{ fontSize: '0.82rem', color: 'var(--c-text-muted)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {email.email ? `${email.email}` : ''}
            </span>
            <div style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0, whiteSpace: 'nowrap' }}>
              <i className="fas fa-calendar-alt" style={{ opacity: 0.5, fontSize: '0.65rem' }}></i>
              {formatEmailDateTime(email.date)}
            </div>
          </div>

          {/* Riga 2: Destinatario */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--c-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
              A:
            </span>
            <span style={{ backgroundColor: 'var(--c-bg-offset-2)', padding: '0.1rem 0.45rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--c-text-base)' }}>
              {email.recipient || "ufficio.protocollo@pec.comune.it"}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Oggetto ── */}
      <div className="email-subject-container">
        <h1 className="email-subject-large">{email.subject}</h1>
      </div>

      {/* ── 3. AI Intelligence ── */}
      <AiIntelligencePanel aiResults={null} />

      {/* ── 4. Allegati ── */}
      {attachments.length > 0 ? (
        <div className="attachments-section">
          <div className="attachments-header">
            <h3>
              <i className="fas fa-paperclip"></i>
              {attachments.length} Allegat{attachments.length === 1 ? "o" : "i"}
            </h3>
            <AiButton
              buttonType="ai-button-large"
              initialText="Sintetizza tutti"
              loadingText="Sintetizzo"
              onClick={onAnalyzeAll}
              isLoading={isSynthesizingAll}
            />
          </div>
          <div id="attachments-list" className="attachments-list">
            {attachments.map((att) => (
              <AttachmentItem
                key={att.id}
                attachment={att}
                analysisResult={analysisResults[att.id]}
                isExternallyLoading={isSynthesizingAll}
                onAnalyze={() => onAttachmentAnalyze(att.id, att.filename)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="attachments-section">
          <h3 className="subheading">
            <i className="fas fa-paperclip mr-2"></i>Allegati (0)
          </h3>
          <div className="info-box">
            <p>Nessun allegato presente in questa email.</p>
          </div>
        </div>
      )}

      {/* ── 5. Corpo messaggio (collassabile) ── */}
      {hasBody && (
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => setIsBodyExpanded((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              width: '100%',
              background: 'none',
              border: 'none',
              padding: '0.4rem 0',
              cursor: 'pointer',
              color: 'var(--c-text-muted)',
              fontSize: '16px',
              fontWeight: 600,
              marginBottom: isBodyExpanded ? '0rem' : '0',
            }}
          >
            <i className="fas fa-envelope-open"></i>
            Corpo del messaggio
            <i
              className={`fas fa-chevron-${isBodyExpanded ? 'up' : 'down'}`}
              style={{ marginLeft: 'auto' }}
            ></i>
          </button>

          {/* Nessun box/card — il contenuto fluisce direttamente nella pagina */}
          {isBodyExpanded && (
            <div
              className={isComplexHtml(email.body_html) ? 'message-body-html-card' : 'message-body-card'}
            >
              <EmailBodyViewer
                htmlContent={email.body_html}
                textContent={email.body || email.body_text}
              />
            </div>
          )}
        </div>
      )
      }

      {/* ── 6. Footer (nascosto in fullscreen) ── */}
      {
        !isFullscreen && (
          <div className="step-footer">
            <button id="next-step-btn" className="button-primary" onClick={onGoToProtocol}>
              <i className="fas fa-arrow-right"></i>Procedi alla Protocollazione
            </button>
          </div>
        )
      }
    </div >
  );
}

export default DetailsAttachmentsTab;
