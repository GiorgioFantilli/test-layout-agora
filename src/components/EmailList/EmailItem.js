import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../AppContext';
import { formatEmailDateTime } from '../../utils/dateUtils';

function EmailItem({ emailId, email, onSelect, isSelected }) {
  const { dispatch } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleAnalyze = async (e) => {
    e.stopPropagation();
    setIsLoading(true);

    try {
      if (isMounted.current) {
        dispatch({ type: 'MARK_AS_ANALYZED', payload: emailId });
      }
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const cleanBody = (email.body || '').replace(/\n/g, ' ');
  const bodyPreview = cleanBody.length > 300
    ? cleanBody.substring(0, 300) + '...'
    : cleanBody;
  const attachmentCount = email.attachments ? email.attachments.length : 0;
  const attachmentText = `${attachmentCount} allegat${attachmentCount === 1 ? 'o' : 'i'}`;

  const itemClasses = [
    "email-item group",
    isSelected ? "email-selected" : ""
  ].filter(Boolean).join(" ");

  const aiButtonClasses = [
    "ai-button",
    "list-ai-button",
    isLoading ? "ai-loading-list" : "opacity-0 group-hover:opacity-100"
  ].filter(Boolean).join(" ");

  // Determine what to show in the 'aside' action area
  const renderAsideAction = () => {
    if (email.status === 'analyzed') {
      return <span className="ai-badge-list ai-badge-analyzed"><i className="fas fa-check-double"></i> Analizzata</span>;
    }
    if (email.status === 'pending') {
      return (
        <button
          className={aiButtonClasses}
          onClick={handleAnalyze}
          disabled={isLoading}
        >
          {isLoading ? (
            <><i className="fas fa-spinner fa-spin"></i>Analizzo<span className="loading-dots"></span></>
          ) : (
            <><i className="fa-solid fa-wand-magic-sparkles"></i>Analizza</>
          )}
          {isLoading && <span className="ai-wave-animation"></span>}
        </button>
      );
    }
    return null;
  };

  return (
    <div className={itemClasses} data-email-id={emailId} onClick={() => onSelect(emailId)}>
      <div className="email-item-content">
        <div className="email-item-main">
          <div className="email-sender">
            <span className="sender-name">{email.sender}</span>
            <span className="sender-email">{email.email}</span>
          </div>
          <p className="email-subject">{email.subject}</p>
          {bodyPreview.length > 0 && <p className="email-body-preview">{bodyPreview}</p>}
        </div>
        <div className="email-item-aside">
          {/* 1. Data e Ora */}
          <span className="meta-item date-item">
            <i className="fas fa-clock"></i>
            {formatEmailDateTime(email.date)}
          </span>

          {/* 2. Allegati */}
          <span className="meta-item attachment-item">
            <i className="fas fa-paperclip"></i>
            {attachmentCount > 0 ? attachmentText : 'Nessuno'}
          </span>

          {/* 3. Pulsante/Badge */}
          <div className="aside-action-wrapper">
            {renderAsideAction()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailItem;