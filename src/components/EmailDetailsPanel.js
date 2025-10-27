import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import ContactModal from './ContactModal'; // Creeremo questo file

// Sotto-componente per gestire le simulazioni di caricamento
function AiButton({ onClick, initialText, loadingText, iconClass = "fa-solid fa-wand-magic-sparkles", timeout = 2000, onComplete, buttonType = "ai-button" }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    if (onClick) {
      await onClick(); // Attende la funzione esterna se fornita
    }
    setTimeout(() => {
      setIsLoading(false);
      setIsDone(true);
      if (onComplete) onComplete();
      
      // Resetta il pulsante dopo un po'
      setTimeout(() => setIsDone(false), 2000); 
    }, timeout);
  };

  return (
    <button className={buttonType} onClick={handleClick} disabled={isLoading || isDone}>
      {isLoading ? (
        <>
          <i className="fas fa-spinner fa-spin"></i> {loadingText}
          <span className="loading-dots"></span>
        </>
      ) : isDone ? (
        <><i className="fas fa-check"></i> Fatto</>
      ) : (
        <><i className={iconClass}></i> {initialText}</>
      )}
    </button>
  );
}

// Sotto-componente per un singolo allegato
function AttachmentItem({ filename, meta, icon, onAnalyze, children }) {
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAnalyze = () => {
    // Simula l'analisi e ottiene un risultato fittizio
    const results = { 
      'planimetria_locale.pdf': 'Planimetria ok.', 
      'certificato_agibilita.pdf': 'Agibilità valida.', 
      'documento_identita.jpg': 'Documento ok.',
      'dichiarazione_inizio_attivita.docx': 'Dichiarazione ok.'
    };
    const resultText = results[filename] || 'Analisi completata.';
    
    // Passa il risultato al genitore (per setAnalyzeDone) e lo imposta localmente
    if (onAnalyze) onAnalyze(); 
    setAnalysisResult(resultText);
  };
  
  return (
     <div className="attachment-item"> 
       <div className="attachment-content">
          {children} {/* Per checkbox opzionale */}
          <div className="file-icon-wrapper"><div className={`file-icon-bg ${icon.bgClass}`}><i className={icon.iClass}></i></div></div>
          <div className="attachment-details">
            <p className="filename">{filename}</p> <p className="file-meta">{meta}</p>
            <div className="attachment-actions">
               <button className="link-button"> <i className="fas fa-eye"></i>Visualizza </button> 
               <button className="link-button"> <i className="fas fa-download"></i>Scarica </button>
               <AiButton
                  onClick={handleAnalyze}
                  initialText="Sintetizza"
                  loadingText="Analizzo"
                  timeout={1500}
                />
            </div>
            {analysisResult && (
              <div className="analysis-result ai-result-box">
                <h4><i className="fa-solid fa-wand-magic-sparkles"></i> <strong>Sintesi</strong></h4>
                <p>{analysisResult}</p>
              </div>
            )}
          </div>
        </div>
     </div>
  );
}

// Componente Principale del Pannello Dettagli
function EmailDetailsPanel({ emailId, style }) {
  const { state, dispatch } = useAppContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [senderStatus, setSenderStatus] = useState({ 
    text: 'Identificato automaticamente', 
    className: 'text-success', 
    icon: 'fa-check-circle' 
  });
  
  // Dati dell'email selezionata
  const email = state.emails[emailId] || state.emails['unread1']; // Fallback
  
  // Lista fittizia di allegati basata sull'HTML
  const attachments = [
      { id: 'att1', filename: 'planimetria_locale.pdf', meta: 'PDF • 2.3 MB', icon: { bgClass: 'file-icon-pdf', iClass: 'fas fa-file-pdf' } },
      { id: 'att2', filename: 'certificato_agibilita.pdf', meta: 'PDF • 1.8 MB', icon: { bgClass: 'file-icon-pdf', iClass: 'fas fa-file-pdf' } },
      { id: 'att3', filename: 'documento_identita.jpg', meta: 'JPEG • 0.9 MB', icon: { bgClass: 'file-icon-image', iClass: 'fas fa-file-image' } },
      { id: 'att4', filename: 'dichiarazione_inizio_attivita.docx', meta: 'DOCX • 0.1 MB', icon: { bgClass: 'file-icon-pdf', iClass: 'fas fa-file-word' } },
      { id: 'att5', filename: 'foto_locale_esterno.png', meta: 'PNG • 1.1 MB', icon: { bgClass: 'file-icon-image', iClass: 'fas fa-file-image' } },
      { id: 'att6', filename: 'visura_camerale.pdf', meta: 'PDF • 0.5 MB', icon: { bgClass: 'file-icon-pdf', iClass: 'fas fa-file-pdf' } },
  ].slice(0, email.attachments); // Mostra solo il numero corretto di allegati
  
  const [checkedAttachments, setCheckedAttachments] = useState(
    attachments.reduce((acc, att) => ({ ...acc, [att.id]: true }), {})
  );
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [aiSuggestionsLoading, setAiSuggestionsLoading] = useState(false);
  const [aiSuggestionsVisible, setAiSuggestionsVisible] = useState(false);
  const [protocolStatus, setProtocolStatus] = useState({ text: 'Conferma Protocollazione', icon: 'fa-clipboard-check', loading: false, error: false, success: false });

  // Resetta lo stato quando l'email cambia
  useEffect(() => {
    setCurrentStep(1);
    setSenderStatus({ text: 'Identificato automaticamente', className: 'text-success', icon: 'fa-check-circle' });
    setCheckedAttachments(attachments.reduce((acc, att) => ({ ...acc, [att.id]: true }), {}));
    setSelectedDepartment(null);
    setAiSuggestionsLoading(false);
    setAiSuggestionsVisible(false);
    setProtocolStatus({ text: 'Conferma Protocollazione', icon: 'fa-clipboard-check', loading: false, error: false, success: false });
  }, [emailId, attachments.length]); // attachments.length per re-triggerare se cambia il numero
  
  const handleAttachmentCheck = (id) => {
    setCheckedAttachments(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const toggleAllAttachments = (check) => {
     setCheckedAttachments(attachments.reduce((acc, att) => ({ ...acc, [att.id]: check }), {}));
  };
  
  const checkedCount = Object.values(checkedAttachments).filter(Boolean).length;

  const handleGetAISuggestions = () => {
    const hasChecked = Object.values(checkedAttachments).filter(Boolean).length > 0;
    if (!hasChecked) {
      alert("Seleziona almeno un allegato."); // Semplificato
      return;
    }
    setAiSuggestionsLoading(true);
    setAiSuggestionsVisible(false);
    setTimeout(() => {
      setAiSuggestionsLoading(false);
      setAiSuggestionsVisible(true);
    }, 3000);
  };
  
  const handleProtocol = () => {
    if (!selectedDepartment) {
      setProtocolStatus({ text: 'Seleziona un reparto', icon: 'fa-exclamation-triangle', loading: false, error: true, success: false });
      setTimeout(() => setProtocolStatus(prev => ({...prev, text: 'Conferma Protocollazione', icon: 'fa-clipboard-check', error: false})), 2000);
      return;
    }
    
    setProtocolStatus({ text: 'Protocollazione in corso...', icon: 'fa-spinner fa-spin', loading: true, error: false, success: false });
    
    setTimeout(() => {
      setProtocolStatus({ text: '✓ Email Protocollata', icon: 'fa-check', loading: false, error: false, success: true });
      // Invia l'azione al contesto
      dispatch({ type: 'PROTOCOL_EMAIL', payload: emailId });
      // Il reducer si occuperà di chiudere il pannello
    }, 2000);
  };

  const closePanel = () => dispatch({ type: 'CLOSE_EMAIL' });
  const toggleFullscreen = () => dispatch({ type: 'TOGGLE_FULLSCREEN' });
  
  // Classi dinamiche per il pannello
  const panelClasses = [
    'details-panel',
    state.selectedEmailId ? 'slide-in' : 'slide-out',
    state.isFullscreen ? 'fullscreen' : (state.selectedEmailId ? 'open' : ''),
  ].filter(Boolean).join(' ');


  return (
    <div id="email-details-panel" className={panelClasses} style={style}>
      <ContactModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          setSenderStatus({ text: '✓ Contatto verificato', className: 'text-success', icon: 'fa-check-circle' });
          setIsModalOpen(false);
        }}
        onAddNew={() => {
          setSenderStatus({ text: '+ Nuovo contatto aggiunto', className: 'text-info', icon: 'fa-plus-circle' });
          setIsModalOpen(false);
        }}
      />
      
      <div className="details-header">
        <h2><i className="fas fa-envelope-open-text"></i>Dettagli Email</h2>
        <div className="tab-navigation-wrapper">
          <div className="sliding-pill-toggle sliding-pill-fullwidth">
            <input type="radio" name="step-toggle" id="pill-step-1" className="sliding-pill-input" checked={currentStep === 1} onChange={() => setCurrentStep(1)} />
            <label htmlFor="pill-step-1" className="sliding-pill-label" id="step1-tab-label"><i className="fas fa-info-circle"></i>Dettagli & Allegati</label>
            <input type="radio" name="step-toggle" id="pill-step-2" className="sliding-pill-input" checked={currentStep === 2} onChange={() => setCurrentStep(2)} />
            <label htmlFor="pill-step-2" className="sliding-pill-label" id="step2-tab-label"><i className="fas fa-clipboard-list"></i>Protocollazione</label>
            <div className="sliding-pill-bg"></div>
          </div>
        </div>
        <div className="header-button-group">
          <button id="expand-details" className="details-header-button" title="Espandi" onClick={toggleFullscreen}>
            <i className={state.isFullscreen ? 'fas fa-compress' : 'fas fa-expand'}></i>
          </button>
          <button id="close-details" className="details-header-button" title="Chiudi" onClick={closePanel}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <div className="details-content-scroll scrollbar-styled">
        {/* --- STEP 1: Dettagli --- */}
        <div id="step1-content" className={currentStep === 1 ? '' : 'hidden'}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 className="subheading"><i className="fas fa-user"></i>Mittente</h3>
            <div className="info-box">
              <div className="info-box-header">
                <div>
                  <p id="sender-name">{email.sender}</p>
                  <p id="sender-email">{email.email}</p>
                  <p id="sender-info" className={senderStatus.className}>
                    <i className={`fas ${senderStatus.icon}`}></i>{senderStatus.text}
                  </p>
                </div>
                <button className="link-button" onClick={() => setIsModalOpen(true)}>
                  <i className="fas fa-search"></i>Verifica contatto
                </button>
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
          
          {attachments.length > 0 && (
            <div className="attachments-section">
              <div className="attachments-header">
                <h3><i className="fas fa-paperclip"></i>Allegati ({attachments.length})</h3>
                <AiButton 
                  buttonType="ai-button-large"
                  initialText="Sintetizza tutti"
                  loadingText="Sintetizzo"
                  timeout={3000}
                />
              </div>
              <div id="attachments-list" className="attachments-list scrollbar-styled">
                {attachments.map(att => (
                  <AttachmentItem 
                    key={att.id} 
                    filename={att.filename} 
                    meta={att.meta} 
                    icon={att.icon}
                  />
                ))}
              </div>
            </div>
          )}
          
          <div className="step-footer">
            <button id="next-step-btn" className="button-primary" onClick={() => setCurrentStep(2)}>
              <i className="fas fa-arrow-right"></i>Procedi alla Protocollazione
            </button>
          </div>
        </div>
        
        {/* --- STEP 2: Protocollazione --- */}
        <div id="step2-content" className={currentStep === 2 ? '' : 'hidden'}>
          <div className="attachments-section">
            <div className="attachments-header">
              <h3><i className="fas fa-paperclip"></i>Allegati da Protocollare (<span id="protocol-attachment-count">{checkedCount}</span><span>/{attachments.length}</span>)</h3>
              <div className="attachment-toggles">
                <button className="toggle-button-small" onClick={() => toggleAllAttachments(true)}> <i className="fas fa-check-double"></i>Seleziona tutti </button>
                <button className="toggle-button-small" onClick={() => toggleAllAttachments(false)}> <i className="fas fa-times"></i>Deseleziona tutti </button>
              </div>
            </div>
            <div id="protocol-attachments-list" className="attachments-list scrollbar-styled">
               {attachments.map(att => (
                  <AttachmentItem 
                    key={att.id} 
                    filename={att.filename} 
                    meta={att.meta} 
                    icon={att.icon}
                  >
                    <input 
                      type="checkbox" 
                      id={`protocol-${att.id}`} 
                      className="form-checkbox protocol-checkbox" 
                      checked={checkedAttachments[att.id] || false}
                      onChange={() => handleAttachmentCheck(att.id)}
                    />
                  </AttachmentItem>
                ))}
            </div>
          </div>
          
          <div id="department-selection-area">
            <div id="department-suggestions">
              <div className="department-suggestions-header">
                <h3><i className="fa-solid fa-wand-magic-sparkles"></i>Reparti Consigliati</h3>
                <AiButton 
                  initialText={aiSuggestionsVisible ? "Rigenera Consigli" : "Genera Consigli"}
                  loadingText="Generando"
                  timeout={3000}
                  onClick={() => {
                    setAiSuggestionsLoading(true);
                    setAiSuggestionsVisible(false);
                  }}
                  onComplete={() => {
                     setAiSuggestionsLoading(false);
                     setAiSuggestionsVisible(true);
                  }}
                />
              </div>
              
              {aiSuggestionsLoading && (
                <div id="ai-loading-section" className="ai-loading-box">
                   <div className="ai-loading-content">
                     <div className="ai-loading-bar"></div>
                     <h4>Analisi AI in corso<span className="loading-dots"></span></h4>
                   </div>
                </div>
              )}
              
              {aiSuggestionsVisible && (
                <div className="suggestions-list">
                   {/* Dati statici dall'HTML */}
                   <label className="ai-suggestion-label"> <input type="radio" name="department" value="commercio" className="form-radio" onChange={e => setSelectedDepartment(e.target.value)} /> <div className="suggestion-details"> <div className="suggestion-header"> <span className="department-name">Ufficio Commercio e Attività Produttive</span> <span className="ai-badge ai-badge-green"> <i className="fa-solid fa-wand-magic-sparkles"></i>95%</span> </div> <p className="department-description">Competente per autorizzazioni commerciali...</p> </div> </label> 
                   <label className="ai-suggestion-label"> <input type="radio" name="department" value="suap" className="form-radio" onChange={e => setSelectedDepartment(e.target.value)} /> <div className="suggestion-details"> <div className="suggestion-header"> <span className="department-name">SUAP - Sportello Unico Attività Produttive</span> <span className="ai-badge ai-badge-yellow"> <i className="fa-solid fa-wand-magic-sparkles"></i>85%</span> </div> <p className="department-description">Alternativa per pratiche integrate...</p> </div> </label> 
                   <label className="ai-suggestion-label"> <input type="radio" name="department" value="urbanistica" className="form-radio" onChange={e => setSelectedDepartment(e.target.value)} /> <div className="suggestion-details"> <div className="suggestion-header"> <span className="department-name">Ufficio Urbanistica ed Edilizia</span> <span className="ai-badge ai-badge-blue"> <i className="fa-solid fa-wand-magic-sparkles"></i>72%</span> </div> <p className="department-description">Per verifica conformità urbanistica...</p> </div> </label> 
                </div>
              )}
            </div>
            
            <div className="other-departments-section">
              <h4><i className="fas fa-building"></i> Altri Reparti</h4>
              <input type="text" placeholder="Cerca reparto..." className="form-input" />
              <div className="department-listbox scrollbar-styled">
                {/* Dati statici dall'HTML */}
                 <label className="department-list-item"> <input type="radio" name="department" value="anagrafe" className="form-radio" onChange={e => setSelectedDepartment(e.target.value)} /> <span>Ufficio Anagrafe</span> </label> 
                 <label className="department-list-item"> <input type="radio" name="department" value="tributi" className="form-radio" onChange={e => setSelectedDepartment(e.target.value)} /> <span>Ufficio Tributi</span> </label> 
                 <label className="department-list-item"> <input type="radio" name="department" value="lavori-pubblici" className="form-radio" onChange={e => setSelectedDepartment(e.target.value)} /> <span>Ufficio Lavori Pubblici</span> </label> 
                 <label className="department-list-item"> <input type="radio" name="department" value="protocollo" className="form-radio" onChange={e => setSelectedDepartment(e.target.value)} /> <span>Ufficio Protocollo</span> </label>
              </div>
            </div>
          </div>
          
          <div className="step-footer">
            <button id="back-step-btn" className="button-secondary" onClick={() => setCurrentStep(1)}>
              <i className="fas fa-arrow-left"></i>Indietro
            </button>
            <button 
              id="protocol-btn" 
              className={`button-success ${protocolStatus.error ? 'button-danger' : ''}`}
              onClick={handleProtocol}
              disabled={protocolStatus.loading || protocolStatus.success}
            >
              <i className={`fas ${protocolStatus.icon}`}></i>
              {protocolStatus.text}
              {protocolStatus.loading && <span className="loading-dots"></span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailDetailsPanel;