import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import { formatEmailDate } from '../../utils/dateUtils';

function EmailItem({ emailId, email, onSelect, isSelected }) {
  const { dispatch } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = (e) => {
    e.stopPropagation();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      dispatch({ type: 'MARK_AS_ANALYZED', payload: emailId });
    }, 2000);
  };

  const bodyPreview = (email.body.split('\n')[0] || '').substring(0, 100) + (email.body.length > 100 ? '...' : '');
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
    if (email.status === 'read' || email.status === 'unread') {
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
          <p className="email-body-preview">{bodyPreview}</p>
        </div>
        <div className="email-item-aside">
          <div className="email-meta-info">
            <span className="meta-item"><i className="fas fa-clock"></i>{formatEmailDate(email.date)}</span>
             {attachmentCount > 0 && (<div className="meta-item"><i className="fas fa-paperclip"></i> <span>{attachmentText}</span></div>)}
             {attachmentCount === 0 && (<div className="meta-item"><i className="fas fa-paperclip"></i> <span>Nessuno</span></div>)}
          </div>
          {renderAsideAction()}
        </div>
      </div>
    </div>
  );
}

export default EmailItem;