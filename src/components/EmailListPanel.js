import React, { useState } from 'react';
import { useAppContext } from '../AppContext';

// Sotto-componente per un singolo item
function EmailItem({ emailId, email, onSelect }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = (e) => {
    e.stopPropagation(); // Impedisce di selezionare l'email
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const bodyPreview = (email.body.split('\n')[0] || '').substring(0, 100) + (email.body.length > 100 ? '...' : '');
  const attachmentText = `${email.attachments} allegat${email.attachments === 1 ? 'o' : 'i'}`;
  
  // Trova le email "unread" per la UI
  const isUnread = emailId.startsWith('unread');

  return (
    <div className="email-item" data-email-id={emailId} onClick={() => onSelect(emailId)}>
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
            <span className="meta-item"><i className="fas fa-clock"></i>Oggi</span>
            <div className="meta-item"><i className="fas fa-paperclip"></i> <span>{attachmentText}</span></div>
          </div>
          {isUnread && email.attachments > 0 && ( // Mostra solo su alcuni
            <button 
              className="ai-button list-ai-button" 
              onClick={handleAnalyze} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Analizzando
                  <span className="loading-dots"></span>
                </>
              ) : (
                <><i className="fa-solid fa-wand-magic-sparkles"></i>Sintetizza</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


function EmailListPanel() {
  const { state, dispatch } = useAppContext();

  const handleViewChange = (view) => {
    dispatch({ type: 'SWITCH_VIEW', payload: view });
  };

  const handleSelectEmail = (emailId) => {
    dispatch({ type: 'SELECT_EMAIL', payload: emailId });
  };
  
  const toggleUnread = () => {
    dispatch({ type: 'TOGGLE_UNREAD' });
  };

  // Filtra le email in base alla vista e allo stato
  const allEmails = Object.entries(state.emails);
  
  const pendingEmails = allEmails
    .filter(([id, email]) => email.status === 'pending')
    .sort(([idA], [idB]) => idA.startsWith('unread') ? -1 : 1); // unread in cima
    
  const processedEmails = allEmails
    .filter(([id, email]) => email.status === 'processed');

  const emailsToShow = state.currentView === 'pending' ? pendingEmails : processedEmails;

  // Logica per "Da protocollare"
  const unreadEmails = pendingEmails.filter(([id]) => id.startsWith('unread'));
  const readEmails = pendingEmails.filter(([id]) => !id.startsWith('unread'));

  const pendingCount = pendingEmails.length;
  const processedCount = processedEmails.length;
  const unreadCount = unreadEmails.length;
  const readCount = readEmails.length;

  return (
    <>
      {/* Barra Filtri */}
      <div className="filter-bar flex-shrink-0">
        <div className="filter-bar-header">
          <div className="sliding-pill-toggle">
            <input 
              type="radio" 
              name="view-toggle" 
              id="pill-input-1" 
              className="sliding-pill-input" 
              checked={state.currentView === 'pending'}
              onChange={() => handleViewChange('pending')}
            />
            <label htmlFor="pill-input-1" className="sliding-pill-label" id="filter-pending-label">
              <i className="fas fa-clock"></i>Da Protocollare <span className="pill-badge">{pendingCount}</span>
            </label>
            <input 
              type="radio" 
              name="view-toggle" 
              id="pill-input-2" 
              className="sliding-pill-input" 
              checked={state.currentView === 'processed'}
              onChange={() => handleViewChange('processed')}
            />
            <label htmlFor="pill-input-2" className="sliding-pill-label" id="filter-processed-label">
              <i className="fas fa-check"></i>Protocollate <span className="pill-badge">{processedCount}</span>
            </label>
            <div className="sliding-pill-bg"></div>
          </div>
        </div>
      </div>

      {/* Area Lista Email */}
      <div className="email-list-scroll-area scrollbar-styled">
        {state.currentView === 'pending' ? (
          <>
            {/* Sezione Non Lette */}
            <div id="unread-section">
              <div className="list-section-header">
                <div className="list-header-content">
                  <h3 className="flex items-center">
                    <div className="list-icon-bg"><i className="fas fa-envelope-open"></i></div> Non Lette ({unreadCount})
                  </h3>
                  <button id="expand-unread" className="expand-unread-button" onClick={toggleUnread}>
                    <i 
                      className="fas fa-chevron-down transform transition-transform" 
                      style={{ transform: state.unreadExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    ></i>
                  </button>
                </div>
              </div>
              
              {!state.unreadExpanded ? (
                 <div id="unread-preview" className="unread-preview">
                    {unreadEmails.slice(0, 3).map(([id, email]) => (
                      <EmailItem key={id} emailId={id} email={email} onSelect={handleSelectEmail} />
                    ))}
                    {unreadEmails.length > 3 && (
                      <div className="show-more-indicator" onClick={toggleUnread}>
                        <i className="fas fa-chevron-down"></i> Mostra altre {unreadEmails.length - 3} non lette...
                      </div>
                    )}
                 </div>
              ) : (
                <div id="unread-emails">
                  {unreadEmails.map(([id, email]) => (
                    <EmailItem key={id} emailId={id} email={email} onSelect={handleSelectEmail} />
                  ))}
                </div>
              )}
            </div>
            
            {/* Sezione Lette (ma ancora "da protocollare") */}
            <div id="read-section">
              <div className="list-section-header">
                <div className="list-header-content">
                  <h3 className="flex items-center">
                    <div className="list-icon-bg"><i className="fas fa-envelope"></i></div> Lette ({readCount})
                  </h3>
                </div>
              </div>
              <div id="email-list" className="email-list-container">
                {readEmails.map(([id, email]) => (
                  <EmailItem key={id} emailId={id} email={email} onSelect={handleSelectEmail} />
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Vista "Protocollate" */
          <div id="processed-section">
            <div id="email-list" className="email-list-container">
              {processedEmails.map(([id, email]) => (
                <EmailItem key={id} emailId={id} email={email} onSelect={handleSelectEmail} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default EmailListPanel;