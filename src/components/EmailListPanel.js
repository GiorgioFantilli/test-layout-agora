import React, { useState } from 'react';
import { useAppContext } from '../AppContext';

// Helper per formattare la data
function formatEmailDate(isoString) {
  const date = new Date(isoString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Confronta solo la data, non l'ora
  if (date.toDateString() === today.toDateString()) {
    return 'Oggi';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Ieri';
  }
  // Formato italiano gg/mm/aaaa
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}


// Sotto-componente per un singolo item
function EmailItem({ emailId, email, onSelect, isSelected }) {
  const { dispatch } = useAppContext(); // Usato per l'azione di analisi
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = (e) => {
    e.stopPropagation();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Simula il completamento dell'analisi e aggiorna lo stato
      dispatch({ type: 'MARK_AS_ANALYZED', payload: emailId });
    }, 2000);
  };

  const bodyPreview = (email.body.split('\n')[0] || '').substring(0, 100) + (email.body.length > 100 ? '...' : '');
  
  // Logica allegati basata sull'array
  const attachmentCount = email.attachments ? email.attachments.length : 0;
  const attachmentText = `${attachmentCount} allegat${attachmentCount === 1 ? 'o' : 'i'}`;

  const itemClasses = [
    "email-item group",
    isSelected ? "email-selected" : ""
  ].filter(Boolean).join(" ");
  
  // MODIFICATO: Classi del bottone AI
  const aiButtonClasses = [
    "ai-button",
    "list-ai-button",
    isLoading ? "ai-loading-list" : "opacity-0 group-hover:opacity-100" // Mostra se in loading, altrimenti in hover
  ].filter(Boolean).join(" ");


  // Determina cosa mostrare nell'area "aside"
  const renderAsideAction = () => {
    if (email.status === 'analyzed') {
      return <span className="ai-badge-list ai-badge-analyzed"><i className="fas fa-check-double"></i> Analizzata</span>;
    }
    // MODIFICATO: Logica di lettura (Richiesta 4)
    // Non mostrare "Analizza" per l'email "visualmente unread" (che ora è 'read' nei dati)
    if (email.status === 'read' || email.status === 'unread') {
      return (
        <button 
          className={aiButtonClasses} 
          onClick={handleAnalyze} 
          disabled={isLoading}
        >
          {/* MODIFICATO: Ripristino testo e icona di loading (Richiesta 1) */}
          {isLoading ? (
            <><i className="fas fa-spinner fa-spin"></i>Analizzo<span className="loading-dots"></span></>
          ) : (
            <><i className="fa-solid fa-wand-magic-sparkles"></i>Analizza</>
          )}
          {/* MODIFICATO: Aggiunta wave (Richiesta 1) */}
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
          {/* MODIFICATO: Non mostrare il bottone se l'item è selezionato (per evitare confusione) (Richiesta 4) */}
          {!isSelected && renderAsideAction()}
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
  
  // VISTA "DA PROTOCOLLARE"
  const pendingEmails = allEmails
    .filter(([id, email]) => email.status === 'read' || email.status === 'unread' || email.status === 'analyzed');
    
  // VISTA "PROTOCOLLATE"
  const processedEmails = allEmails
    .filter(([id, email]) => email.status === 'processed');

  // Logica per "Da protocollare"
  
  // MODIFICATO: Logica di filtro per lettura (Richiesta 4)
  const unreadEmails = pendingEmails
    .filter(([id, email]) => email.status === 'unread' || id === state.visuallyUnreadId) // Rimane qui se è "visualmente unread"
    .sort(([idA, emailA], [idB, emailB]) => new Date(emailA.date) - new Date(emailB.date)); // Più vecchi in cima
    
  const readEmails = pendingEmails
    .filter(([id, email]) => (email.status === 'read' || email.status === 'analyzed') && id !== state.visuallyUnreadId) // Escluso se è "visualmente unread"
    .sort(([idA, emailA], [idB, emailB]) => {
        // 'analyzed' prima di 'read'
        if (emailA.status === 'analyzed' && emailB.status === 'read') return -1;
        if (emailA.status === 'read' && emailB.status === 'analyzed') return 1;
        // Altrimenti ordina per data (Vecchio -> Nuovo)
        return new Date(emailA.date) - new Date(emailB.date);
    });

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
              <div className="list-section-header" onClick={toggleUnread}>
                <div className="list-header-content">
                  <h3 className="flex items-center">
                    <div className="list-icon-bg"><i className="fas fa-envelope"></i></div> Non Lette (<span>{unreadCount}</span>)
                  </h3>
                  <button id="expand-unread" className="expand-unread-button">
                    <i 
                      className="fas fa-chevron-down transform transition-transform" 
                      style={{ transform: state.unreadExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    ></i>
                  </button>
                </div>
              </div>
              
              {!state.unreadExpanded && unreadCount > 0 ? (
                 <div id="unread-preview" className="unread-preview">
                    {unreadEmails.slice(0, 3).map(([id, email]) => (
                        <EmailItem 
                            key={id} 
                            emailId={id} 
                            email={email} 
                            onSelect={handleSelectEmail} 
                            isSelected={state.selectedEmailId === id}
                        />
                    ))}
                    {unreadEmails.length > 3 && (
                      <div className="show-more-indicator" onClick={toggleUnread}>
                        <i className="fas fa-chevron-down"></i> Mostra altre {unreadEmails.length - 3}<i className="fas fa-chevron-down"></i>
                      </div>
                    )}
                 </div>
              ) : (
                <div id="unread-emails" style={{ display: state.unreadExpanded ? 'block' : 'none' }}>
                  {unreadEmails.map(([id, email]) => (
                    <EmailItem 
                        key={id} 
                        emailId={id} 
                        email={email} 
                        onSelect={handleSelectEmail} 
                        isSelected={state.selectedEmailId === id}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Sezione Lette (ma ancora "da protocollare") */}
            <div id="read-section">
              <div className="list-section-header">
                <div className="list-header-content">
                  <h3 className="flex items-center">
                    <div className="list-icon-bg"><i className="fas fa-envelope-open"></i></div> Lette (<span>{readCount}</span>)
                  </h3>
                </div>
              </div>
              <div id="email-list" className="email-list-container">
                {readEmails.map(([id, email]) => (
                  <EmailItem 
                    key={id} 
                    emailId={id} 
                    email={email} 
                    onSelect={handleSelectEmail} 
                    isSelected={state.selectedEmailId === id}
                    />
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Vista "Protocollate" */
          <div id="processed-section">
            <div id="email-list" className="email-list-container">
              {processedEmails
                .sort(([idA, emailA], [idB, emailB]) => new Date(emailA.date) - new Date(emailB.date)) // Più vecchi in cima
                .map(([id, email]) => (
                <EmailItem 
                  key={id} 
                  emailId={id} 
                  email={email} 
                  onSelect={handleSelectEmail} 
                  isSelected={state.selectedEmailId === id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default EmailListPanel;