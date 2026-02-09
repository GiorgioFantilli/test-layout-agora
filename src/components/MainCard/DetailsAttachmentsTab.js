import React from 'react';
import AiButton from './AiButton';
import AttachmentItem from './AttachmentItem';
import { formatEmailDateTime } from '../../utils/dateUtils';

function DetailsAttachmentsTab({
    email,
    attachments,
    senderStatus,
    onVerifyContactClick,
    analysisResults,
    isSynthesizingAll,
    onAnalyzeAll,
    onAttachmentAnalyze,
    onGoToProtocol
}) {

  const getInitials = (name) => {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div id="step1-content">

      {/* Header: Avatar + Info Verticale */}
      <div className="email-header-grid">
          <div className="sender-avatar-large">
              {getInitials(email.sender)}
          </div>
          
          <div className="email-meta-content">
              <div className="sender-recipient-box">
                  <div className="sender-name-large">
                      {email.sender}
                  </div>
                  <div className="sender-email-row">
                      {email.email}
                  </div>
                  <div className="sender-status-row">
                      <button 
                          className={`contact-status-badge ${senderStatus.className}`} 
                          onClick={onVerifyContactClick}
                          title="Clicca per gestire lo stato del contatto"
                      >
                          <i className={`fas ${senderStatus.icon}`}></i>
                          <span className="status-text">{senderStatus.text}</span>
                      </button>
                  </div>
                  <div className="address-pill">
                      <span className="label">A:</span>
                      <span className="value">{email.recipient || 'ufficio.protocollo@pec.comune.it'}</span>
                  </div>
              </div>

              {/* Date */}
              <div className="email-dates-compact">
                  <div className="date-row" title="Ricevuta">
                      <i className="fas fa-calendar-alt"></i> {formatEmailDateTime(email.date)}
                  </div>
                  {email.readDate && (
                      <div className="date-row" title="Letta" style={{color: 'var(--c-success)'}}>
                          <i className="fas fa-check-double"></i> {formatEmailDateTime(email.readDate)}
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* Oggetto */}
      <div className="email-subject-container">
          {/* <div className="subject-icon-modern">
              <i className="fas fa-tag"></i>
          </div> */}
          <h1 className="email-subject-large">
              {email.subject}
          </h1>
      </div>

      {/* Corpo del Messaggio */}
      <div className="message-body-card">
          <div className="email-body-content">
              {email.body}
          </div>
      </div>

      {attachments.length > 0 ? (
        <div className="attachments-section">
          <div className="attachments-header">
            <h3><i className="fas fa-paperclip"></i>{attachments.length} Allegat{attachments.length === 1 ? 'o' : 'i'}</h3>
            <AiButton
              buttonType="ai-button-large"
              initialText="Sintetizza tutti"
              loadingText="Sintetizzo"
              onClick={onAnalyzeAll}
              isLoading={isSynthesizingAll}
            />
          </div>
          <div id="attachments-list" className="attachments-list">
            {attachments.map(att => (
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
         <div style={{ marginBottom: '1.5rem' }}>
            <h3 className="subheading"><i className="fas fa-paperclip"></i>Allegati (0)</h3>
            <div className="info-box">
              <p>Nessun allegato presente in questa email.</p>
            </div>
         </div>
      )}

      <div className="step-footer">
        <button id="next-step-btn" className="button-primary" onClick={onGoToProtocol}>
          <i className="fas fa-arrow-right"></i>Procedi alla Protocollazione
        </button>
      </div>
    </div>
  );
}

export default DetailsAttachmentsTab;