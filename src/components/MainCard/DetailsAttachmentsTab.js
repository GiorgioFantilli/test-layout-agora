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

  return (
    <div id="step1-content">
        <div className="details-top-section">
        {/* Sender Box */}
        <div style={{width: "100%"}}>
            <h3 className="subheading"><i className="fas fa-user"></i>Mittente</h3>
            <div className="info-box">
                <div className="info-box-header">
                    <div className="sender-info-block">
                    <p id="sender-name">{email.sender}</p>
                    <p id="sender-email">{email.email}</p>
                    <p id="sender-info" className={senderStatus.className}>
                        <i className={`fas ${senderStatus.icon}`}></i>{senderStatus.text}
                    </p>
                    </div>
                    <button className="link-button" onClick={onVerifyContactClick} style={{marginTop: 'auto', marginBottom: 'auto'}}>
                        <i className="fas fa-search"></i>Verifica contatto
                    </button>
                </div>
            </div>
        </div>

        {/* Date Box */}
        <div style={{marginTop: "29px"}}>
            <div className="date-details-section">
                <div className="date-detail-item">
                    <i className="fas fa-calendar-alt date-icon received"></i>
                    <div>
                        <span className="date-label">Ricevuta</span>
                        <span className="date-value">{formatEmailDateTime(email.date)}</span>
                    </div>
                </div>
                {email.readDate && (
                <div className="date-detail-item">
                    <i className="fas fa-eye date-icon read"></i>
                    <div>
                        <span className="date-label">Letta</span>
                        <span className="date-value">{formatEmailDateTime(email.readDate)}</span>
                    </div>
                </div>
                )}
            </div>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h3 className="subheading"><i className="fas fa-tag"></i>Oggetto</h3>
        <p id="email-subject">{email.subject}</p>
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 className="subheading"><i className="fas fa-align-left"></i>Corpo del messaggio</h3>
        <div className="info-box">
          <p id="email-body">{email.body}</p>
        </div>
      </div>

      {attachments.length > 0 ? (
        <div className="attachments-section">
          <div className="attachments-header">
            <h3><i className="fas fa-paperclip"></i>Allegati ({attachments.length})</h3>
            <AiButton
              buttonType="ai-button-large"
              initialText="Sintetizza tutti"
              loadingText="Sintetizzo"
              timeout={3000}
              onClick={onAnalyzeAll}
              isExternallyLoading={isSynthesizingAll}
              onComplete={() => {}}
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