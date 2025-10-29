import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import ContactModal from './ContactModal'; 

// --- Logica di Visualizzazione Allegati ---

// Tipi di file supportati per l'analisi AI
const SUPPORTED_FILE_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/docx', 
]);

const MOCK_ANALYSIS_TEXTS = {
    'planimetria_locale.pdf': "Planimetria di locale C/1 di 85mq, conforme. Include 1 bagno (disabili) e 2 vetrine.",
    'certificato_agibilita.pdf': "Certificato di agibilità n. 1234/2023. Rilasciato il 15/03/2023. Locale idoneo per attività commerciali.",
    'documento_identita.jpg': "Carta d'identità (valida) di Mario Rossi, nato il 15/01/1980 a Roma. CF: RSSMRA80A15H501Z.",
    'dichiarazione_inizio_attivita.docx': "Modulo SCIA (Dichiarazione Inizio Attività) compilato. Dati anagrafici e fiscali presenti. Manca firma digitale.",
    'foto_locale_esterno.png': "Immagine facciata esterna con 2 vetrine e 1 ingresso. Insegna non presente.",
    'visura_camerale.pdf': "Visura camerale ditta individuale 'Rossi Mario'. Iscritta il 01/01/2024. Stato: ATTIVA. Sede: Via Roma 123.",
    'richiesta_residenza.pdf': "Modulo di richiesta certificato di residenza. Dati: Giulia Bianchi. Motivo: Pratiche INPS.",
    'modulo_ztl.pdf': "Modulo richiesta ZTL compilato. Targa: AB123CD. Residente in Via Verdi.",
    'libretto_auto.jpg': "Carta di circolazione veicolo targa AB123CD. Intestatario: Luca Verdi.",
    'foto_buca_1.jpg': "Immagine di buca stradale. Dimensioni stimate: 50x70cm. Profondità: 10cm.",
    'foto_buca_2.jpg': "Immagine di buca stradale. Dimensioni stimate: 60x60cm.",
    'foto_panoramica.jpg': "Panoramica di Via Garibaldi 15. Si notano 3 buche.",
    'mappa_via_garibaldi.png': "Mappa con indicazione del punto esatto della segnalazione.",
    'atto_citazione.pdf': "Atto di citazione per mancato pagamento TARI 2023. Importo: 450,00 €.",
    'procura_legale.pdf': "Procura speciale Avv. Greco per la causa Comune c/ Rossi.",
    'SCIA_ViaVerdi.pdf': "SCIA per manutenzione straordinaria (rifacimento bagno e spostamento tramezzo).",
    'Relazione_Tecnica_Asseverata.pdf': "Relazione asseverata Arch. Marino. Lavori conformi al Regolamento Edilizio.",
    'Planimetria_Ante_Operam.pdf': "Stato di fatto: appartamento 70mq, 1 bagno, 2 camere.",
    'Planimetria_Post_Operam.pdf': "Stato di progetto: 1 bagno, 2 camere, diversa distribuzione interna.",
    'DURC_Impresa.pdf': "DURC regolare per 'EdilCostruzioni Srl', valido fino al 30/12/2025.",
    'Ricevuta_Pagamento_TARI.pdf': "Quietanza di pagamento TARI 2024. Importo: 315,00 €. Pagamento valido.",
    'CIL_Via_Napoli_5.pdf': "CIL asseverata per manutenzione straordinaria (spostamento tramezzi). Dati corretti.",
    'Relazione_Tecnica.pdf': "Relazione tecnica asseverata dal Geom. Riva. Conforme.",
};


/**
 * Funzione per separare la logica di visualizzazione (icone/colori)
 * dai dati dell'allegato.
 */
function getAttachmentVisuals(fileType) {
  if (!fileType) {
    return { bgClass: 'file-icon-default', iClass: 'fas fa-file-alt' };
  }

  if (fileType.startsWith('image/')) {
    return { bgClass: 'file-icon-image', iClass: 'fas fa-file-image' };
  }
  if (fileType === 'application/pdf') {
    return { bgClass: 'file-icon-pdf', iClass: 'fas fa-file-pdf' };
  }
  if (fileType.includes('word')) {
    return { bgClass: 'file-icon-doc', iClass: 'fas fa-file-word' };
  }
  if (fileType.includes('zip') || fileType.includes('archive')) {
    return { bgClass: 'file-icon-default', iClass: 'fas fa-file-archive' };
  }
   if (fileType.includes('xml')) {
    return { bgClass: 'file-icon-default', iClass: 'fas fa-file-code' };
  }
   if (fileType.includes('pkcs7-mime')) { // p7m
    return { bgClass: 'file-icon-default', iClass: 'fas fa-file-signature' };
  }
  
  // Default per .eml, .log, .dat, ecc. (Richiesta 9)
  return { bgClass: 'file-icon-default', iClass: 'fas fa-file-alt' };
}

// Helper data per dettagli mittente
function formatEmailDateTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Sotto-componente per gestire le simulazioni di caricamento
// MODIFICATO: Aggiunta wave (Richiesta 1) e testo "Completato" (Richiesta 2)
function AiButton({ 
    onClick, 
    initialText, 
    loadingText, 
    iconClass = "fa-solid fa-wand-magic-sparkles", 
    loadingIconClass = "fas fa-spinner fa-spin", // Icona di caricamento
    timeout = 2000, 
    onComplete, 
    buttonType = "ai-button",
    isExternallyLoading = false 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  
  // Combina stato di caricamento interno ed esterno
  const actualLoading = isLoading || isExternallyLoading;

  useEffect(() => {
    // Non resettare se è in caricamento esterno
    if (!isExternallyLoading) {
        setIsLoading(false);
        setIsDone(false);
    }
  }, [initialText, isExternallyLoading]); 

  const handleClick = async () => {
    setIsLoading(true);
    if (onClick) {
      const shouldProceed = await onClick(); // Ora onClick può essere async (Richiesta 2c)
      if (shouldProceed === false) {
          setIsLoading(false);
          return;
      }
    }
    
    // Simula il tempo di caricamento (timeout)
    setTimeout(() => {
      setIsLoading(false);
      setIsDone(true);
      if (onComplete) onComplete();
      
      // Resetta il bottone dopo 2 sec
      setTimeout(() => setIsDone(false), 2000); 
    }, timeout);
  };

  // Classi dinamiche per lo stato di caricamento
  const buttonClasses = [
      buttonType,
      actualLoading ? 'ai-loading' : '' // Usa stato combinato
  ].filter(Boolean).join(' ');

  return (
    <button className={buttonClasses} onClick={handleClick} disabled={actualLoading || isDone}>
      {isDone ? (
        <><i className="fas fa-check"></i> Completato</> // MODIFICATO: (Richiesta 2)
      ) : actualLoading ? (
        <><i className={loadingIconClass}></i> {loadingText}<span className="loading-dots"></span></>
      ) : (
        <><i className={iconClass}></i> {initialText}</>
      )}
      {/* MODIFICATO: Aggiunta wave (Richiesta 1) */}
      {actualLoading && <span className="ai-wave-animation"></span>}
    </button>
  );
}

// Sotto-componente per un singolo allegato
function AttachmentItem({ attachment, onAnalyze, analysisResult, isExternallyLoading = false }) {
  
  const handleAnalysisComplete = () => {
    if (onAnalyze) onAnalyze(); 
  };
  
  // Logica di visualizzazione
  const isSupported = SUPPORTED_FILE_TYPES.has(attachment.fileType);
  const visuals = getAttachmentVisuals(attachment.fileType);
  
  const fileTypeLabel = (attachment.fileType.split('/').pop() || 'file').toUpperCase();
  const meta = `${fileTypeLabel} • ${attachment.sizeMB} MB`;

  return (
     <div className="attachment-item"> 
       <div className="attachment-content">
          <div className="file-icon-wrapper"><div className={`file-icon-bg ${visuals.bgClass}`}><i className={visuals.iClass}></i></div></div>
          
          <div className="attachment-details">
            <div className="attachment-main-line">
              <div className="attachment-info">
                <p className="filename" title={attachment.filename}>{attachment.filename}</p>
                <p className="file-meta">{meta}</p>
              </div>
              <div className="attachment-actions">
                 <button className="link-button"> <i className="fas fa-eye"></i><span className="button-text">Visualizza</span> </button> 
                 <button className="link-button"> <i className="fas fa-download"></i><span className="button-text">Scarica</span> </button>
                 
                 {isSupported ? (
                    <AiButton
                      initialText="Sintetizza"
                      loadingText="Analizzo"
                      timeout={1500}
                      onComplete={handleAnalysisComplete}
                      isExternallyLoading={isExternallyLoading} 
                    />
                 ) : (
                    <span className="unsupported-text"><i className="fas fa-times-circle"></i> Non supportato</span>
                 )}
              </div>
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
  
  const email = state.emails[emailId] || Object.values(state.emails)[0]; 
  const attachments = email.attachments || [];
  
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [aiSuggestionsLoading, setAiSuggestionsLoading] = useState(false);
  const [aiSuggestionsVisible, setAiSuggestionsVisible] = useState(false);
  const [protocolStatus, setProtocolStatus] = useState({ text: 'Conferma Protocollazione', icon: 'fa-clipboard-check', loading: false, error: false, success: false });

  // Legge dallo stato globale (Richiesta 4)
  const analysisResults = state.analysisResults[emailId] || {};

  // Stato per caricamento "Sintetizza Tutti" (Richiesta 2)
  const [isSynthesizingAll, setIsSynthesizingAll] = useState(false);


  // Resetta lo stato quando l'email cambia
  useEffect(() => {
    setCurrentStep(1);
    setSenderStatus({ text: 'Identificato automaticamente', className: 'text-success', icon: 'fa-check-circle' });
    setSelectedOffice(null);
    setAiSuggestionsLoading(false);
    setIsSynthesizingAll(false);
    
    // Non resetta aiSuggestionsVisible se l'email è già analizzata
    if (state.emails[emailId]?.status === 'analyzed') {
        setAiSuggestionsVisible(true);
    } else {
        setAiSuggestionsVisible(false);
    }
    
    setProtocolStatus({ text: 'Conferma Protocollazione', icon: 'fa-clipboard-check', loading: false, error: false, success: false });
  }, [emailId, state.emails]); 
  
  
  // Funzione helper per simulare attesa
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Logica per "Sintetizza tutti" (Richiesta 2)
  const handleAnalyzeAll = async (timeout = 3000) => {
    setIsSynthesizingAll(true);
    
    await wait(timeout); // Simula il tempo di analisi

    const allResults = {};
    attachments.forEach(att => {
        if (SUPPORTED_FILE_TYPES.has(att.fileType)) {
            allResults[att.id] = MOCK_ANALYSIS_TEXTS[att.filename] || 'Analisi completata: il documento è stato letto.';
        }
    });
    
    dispatch({
        type: 'UPDATE_ANALYSIS_RESULTS',
        payload: { emailId, results: allResults }
    });
    setIsSynthesizingAll(false);
    return true; // Ritorna true per la dipendenza
  };


  // MODIFICATO: Logica "Genera Consigli" (Richiesta 2c)
  const handleGetAISuggestions = async () => {
    setAiSuggestionsLoading(true); // Avvia il loading del bottone "Genera Consigli"
    
    // Controlla se le sintesi sono già state fatte
    const supportedAttachments = attachments.filter(att => SUPPORTED_FILE_TYPES.has(att.fileType));
    const allSupportedAreDone = supportedAttachments.every(att => analysisResults[att.id]);
    
    if (!allSupportedAreDone) {
        // Se non sono fatte, avvia "Sintetizza Tutti" e attendi il suo completamento
        await handleAnalyzeAll(1500); // Usa un timeout più breve per la dipendenza
    }
    
    // Simula l'aggiornamento dello stato dell'email a "analizzata"
    dispatch({ type: 'MARK_AS_ANALYZED', payload: emailId });
    
    // Ritorna true per far partire l'animazione del bottone "Genera Consigli"
    // (il timeout del bottone gestirà il setAiSuggestionsVisible)
    return true; 
  };
  

  const handleProtocol = () => {
    if (!selectedOffice) {
      setProtocolStatus({ text: 'Seleziona un ufficio', icon: 'fa-exclamation-triangle', loading: false, error: true, success: false });
      setTimeout(() => setProtocolStatus(prev => ({...prev, text: 'Conferma Protocollazione', icon: 'fa-clipboard-check', error: false})), 2000);
      return;
    }
    
    setProtocolStatus({ text: 'Protocollazione in corso...', icon: 'fa-spinner fa-spin', loading: true, error: false, success: false });
    
    setTimeout(() => {
      setProtocolStatus({ text: '✓ Email Protocollata', icon: 'fa-check', loading: false, error: false, success: true });
      dispatch({ type: 'PROTOCOL_EMAIL', payload: emailId });
    }, 2000);
  };

  const closePanel = () => dispatch({ type: 'CLOSE_EMAIL' });
  const toggleFullscreen = () => dispatch({ type: 'TOGGLE_FULLSCREEN' });
  
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
            <div className="details-top-section">
            {/* Box Mittente */}
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
                        <button className="link-button" onClick={() => setIsModalOpen(true)} style={{marginTop: 'auto', marginBottom: 'auto'}}>
                            <i className="fas fa-search"></i>Verifica contatto
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Box Date */}
            <div style={{marginTop: "29px"}}>
                <div className="date-details-section">
                    <div className="date-detail-item">
                        <i className="fas fa-calendar-alt date-icon received"></i>
                        <div>
                            <span className="date-label">Ricevuta</span>
                            <span className="date-value">{formatEmailDateTime(email.date)}</span>
                        </div>
                    </div>
                    {/* Mostra data lettura se esiste (impostata da Richiesta 4) */}
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
                  onClick={() => handleAnalyzeAll(3000)} // Avvia la funzione
                  isExternallyLoading={isSynthesizingAll} // Controllato dallo stato
                  onComplete={() => {}} // L'onComplete è gestito dentro handleAnalyzeAll
                />
              </div>
              <div id="attachments-list" className="attachments-list">
                {attachments.map(att => (
                  <AttachmentItem 
                    key={att.id} 
                    attachment={att} 
                    analysisResult={analysisResults[att.id]} 
                    isExternallyLoading={isSynthesizingAll} // Tutti i bottoni figli sono in loading (Richiesta 2)
                    onAnalyze={() => { 
                       const resultText = MOCK_ANALYSIS_TEXTS[att.filename] || 'Analisi completata: il documento è stato letto.';
                       dispatch({
                           type: 'UPDATE_ANALYSIS_RESULTS',
                           payload: { emailId, results: { [att.id]: resultText } }
                       });
                    }}
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
            <button id="next-step-btn" className="button-primary" onClick={() => setCurrentStep(2)}>
              <i className="fas fa-arrow-right"></i>Procedi alla Protocollazione
            </button>
          </div>
        </div>
        
        {/* --- STEP 2: Protocollazione --- */}
        <div id="step2-content" className={currentStep === 2 ? '' : 'hidden'}>
          {attachments.length > 0 ? (
            <div className="attachments-section">
              <div className="attachments-header">
                <h3><i className="fas fa-paperclip"></i>Allegati da Protocollare ({attachments.length})</h3>
              </div>
              <div id="protocol-attachments-list" className="attachments-list scrollbar-styled">
                 {attachments.map(att => (
                    <AttachmentItem 
                      key={att.id} 
                      attachment={att} 
                      analysisResult={analysisResults[att.id]} 
                      isExternallyLoading={isSynthesizingAll}
                      onAnalyze={() => {
                         const resultText = MOCK_ANALYSIS_TEXTS[att.filename] || 'Analisi completata: il documento è stato letto.';
                         dispatch({
                             type: 'UPDATE_ANALYSIS_RESULTS',
                             payload: { emailId, results: { [att.id]: resultText } }
                         });
                      }}
                    />
                  ))}
              </div>
            </div>
          ) : (
            <div className="info-box" style={{marginBottom: '1.5rem'}}>
              <p>Questa email non contiene allegati da protocollare.</p>
            </div>
          )}
          
          <div id="department-selection-area">
            <div id="department-suggestions">
              <div className="department-suggestions-header">
                <h3><i className="fa-solid fa-wand-magic-sparkles"></i>Uffici Consigliati</h3>
                {/* MODIFICATO: Bottone rimane visibile (Richiesta 2c) */}
                <AiButton 
                    initialText="Genera Consigli"
                    loadingText="Generando"
                    timeout={4000} // MODIFICATO: Durata maggiore (Richiesta 8)
                    onClick={handleGetAISuggestions} // Logica con dipendenza (Richiesta 2c)
                    isExternallyLoading={aiSuggestionsLoading} // Stato di loading
                    onComplete={() => {
                        setAiSuggestionsLoading(false);
                        setAiSuggestionsVisible(true);
                    }}
                />
              </div>
              
              {/* MODIFICATO: Banner informativo (Richiesta 9) */}
              {!aiSuggestionsVisible && !aiSuggestionsLoading && (
                <div className="ai-info-banner">
                    <i className="fas fa-info-circle"></i>
                    <p>Clicca "Genera Consigli" per avviare un'analisi AI. Il sistema leggerà il mittente, l'oggetto e le sintesi degli allegati per suggerire gli uffici di competenza.</p>
                </div>
              )}
              
              {/* MODIFICATO: Nuova animazione di loading (Richiesta 8) */}
              {aiSuggestionsLoading && (
                <div id="ai-loading-section" className="ai-loading-box">
                   <div className="ai-loading-content">
                     <div className="ai-pulse-animation">
                        <i className="fas fa-brain"></i>
                     </div>
                     <h4>Analisi AI in corso<span className="loading-dots"></span></h4>
                     <p>Lettura email e sintesi allegati...</p>
                   </div>
                </div>
              )}
              
              {aiSuggestionsVisible && (
                <div className="suggestions-list">
                   <label className="ai-suggestion-label"> <input type="radio" name="department" value="commercio" className="form-radio" onChange={e => setSelectedOffice(e.target.value)} /> <div className="suggestion-details"> <div className="suggestion-header"> <span className="department-name">Ufficio Commercio e Attività Produttive</span> <span className="ai-badge ai-badge-green"> <i className="fa-solid fa-wand-magic-sparkles"></i>95%</span> </div> <p className="department-description">Competente per autorizzazioni commerciali...</p> </div> </label> 
                   <label className="ai-suggestion-label"> <input type="radio" name="department" value="suap" className="form-radio" onChange={e => setSelectedOffice(e.target.value)} /> <div className="suggestion-details"> <div className="suggestion-header"> <span className="department-name">SUAP - Sportello Unico Attività Produttive</span> <span className="ai-badge ai-badge-yellow"> <i className="fa-solid fa-wand-magic-sparkles"></i>85%</span> </div> <p className="department-description">Alternativa per pratiche integrate...</p> </div> </label> 
                   <label className="ai-suggestion-label"> <input type="radio" name="department" value="tributi" className="form-radio" onChange={e => setSelectedOffice(e.target.value)} /> <div className="suggestion-details"> <div className="suggestion-header"> <span className="department-name">Ufficio Tributi</span> <span className="ai-badge ai-badge-blue"> <i className="fa-solid fa-wand-magic-sparkles"></i>72%</span> </div> <p className="department-description">Per pagamenti TARI o imposte...</p> </div> </label> 
                </div>
              )}
            </div>
            
            <div className="other-departments-section">
              <h4><i className="fas fa-building"></i> Altri Uffici</h4>
              <input type="text" placeholder="Cerca ufficio..." className="form-input" />
              <div className="office-listbox scrollbar-styled">
                 <label className="department-list-item"> <input type="radio" name="department" value="anagrafe" className="form-radio" onChange={e => setSelectedOffice(e.target.value)} /> <span>Ufficio Anagrafe</span> </label> 
                 <label className="department-list-item"> <input type="radio" name="department" value="tributi-manuale" className="form-radio" onChange={e => setSelectedOffice(e.target.value)} /> <span>Ufficio Tributi</span> </label> 
                 <label className="department-list-item"> <input type="radio" name="department" value="lavori-pubblici" className="form-radio" onChange={e => setSelectedOffice(e.target.value)} /> <span>Ufficio Lavori Pubblici</span> </label> 
                 <label className="department-list-item"> <input type="radio" name="department" value="protocollo" className="form-radio" onChange={e => setSelectedOffice(e.target.value)} /> <span>Ufficio Protocollo</span> </label>
                 <label className="department-list-item"> <input type="radio" name="department" value="urbanistica" className="form-radio" onChange={e => setSelectedOffice(e.target.value)} /> <span>Ufficio Urbanistica</span> </label>
                 <label className="department-list-item"> <input type="radio" name="department" value="servizi-sociali" className="form-radio" onChange={e => setSelectedOffice(e.target.value)} /> <span>Servizi Sociali</span> </label>
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