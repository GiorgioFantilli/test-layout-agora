import React from 'react';
import AiButton from './AiButton';
import AttachmentItem from './AttachmentItem';

function ProtocolTab({
    attachments,
    analysisResults,
    isSynthesizingAll,
    onAttachmentAnalyze,
    aiSuggestionsLoading,
    aiSuggestionsVisible,
    onGetAISuggestions,
    onOfficeSelect,
    onGoBack,
    onProtocol,
    protocolStatus
}) {

  return (
    <div id="step2-content">
      {attachments.length > 0 ? (
        <div className="attachments-section">
          <div className="attachments-header">
            <h3><i className="fas fa-paperclip"></i>{attachments.length} Allegat{attachments.length === 1 ? 'o' : 'i'} da Protocollare</h3>
          </div>
          <div id="protocol-attachments-list" className="py-[.5rem] attachments-list scrollbar-styled">
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
        <div className="info-box" style={{marginBottom: '1.5rem'}}>
          <p>Questa email non contiene allegati da protocollare.</p>
        </div>
      )}

      <div id="department-selection-area">
        <div id="department-suggestions">
          <div className="department-suggestions-header">
            <h3><i className="fa-solid fa-wand-magic-sparkles"></i>Uffici Consigliati</h3>
            {(aiSuggestionsLoading || aiSuggestionsVisible) && (
              <AiButton
                  initialText="Genera Consigli"
                  loadingText="Generando"
                  onClick={onGetAISuggestions}
                  isLoading={aiSuggestionsLoading}
              />
            )}
          </div>

          {!aiSuggestionsVisible && !aiSuggestionsLoading && (
            <div className="ai-info-banner">
              <div className="ai-info-banner-text-wrapper">
                  <i className="fas fa-info-circle"></i>
                  <p>Clicca sul pulsante per avviare l'analisi AI. Il sistema leggerà il mittente della mail, l'oggetto e le sintesi degli allegati supportati, generando di conseguenza suggerimenti sull'appropriato ufficio di competenza.</p>
              </div>
              
              <AiButton
                  buttonType="ai-button-large" 
                  initialText="Genera Consigli"
                  loadingText="Generando"
                  onClick={onGetAISuggestions}
                  isLoading={aiSuggestionsLoading}
              />
            </div>
          )}

          {aiSuggestionsLoading && (
            <div id="ai-loading-section" className="ai-loading-box content-fade-in">
               <div className="ai-loading-content">
                 <div className="ai-pulse-animation">
                    <i className="fas fa-brain"></i>
                 </div>
                 <h4>Analisi AI in corso<span className="loading-dots"></span></h4>
                 <p>Lettura email e sintesi allegati...</p>
               </div>
            </div>
          )}

          {aiSuggestionsVisible && !aiSuggestionsLoading && (
            <div className="suggestions-list content-fade-in">
               <label className="ai-suggestion-label"> <input type="radio" name="department" value="commercio" className="form-radio" onChange={onOfficeSelect} /> <div className="suggestion-details"> <div className="suggestion-header"> <span className="department-name">Ufficio Commercio e Attività Produttive</span> <span className="ai-badge ai-badge-green"> <i className="fa-solid fa-wand-magic-sparkles"></i>95%</span> </div> <p className="department-description">Competente per autorizzazioni commerciali...</p> </div> </label>
               <label className="ai-suggestion-label"> <input type="radio" name="department" value="suap" className="form-radio" onChange={onOfficeSelect} /> <div className="suggestion-details"> <div className="suggestion-header"> <span className="department-name">SUAP - Sportello Unico Attività Produttive</span> <span className="ai-badge ai-badge-yellow"> <i className="fa-solid fa-wand-magic-sparkles"></i>85%</span> </div> <p className="department-description">Alternativa per pratiche integrate...</p> </div> </label>
               <label className="ai-suggestion-label"> <input type="radio" name="department" value="tributi" className="form-radio" onChange={onOfficeSelect} /> <div className="suggestion-details"> <div className="suggestion-header"> <span className="department-name">Ufficio Tributi</span> <span className="ai-badge ai-badge-blue"> <i className="fa-solid fa-wand-magic-sparkles"></i>72%</span> </div> <p className="department-description">Per pagamenti TARI o imposte...</p> </div> </label>
            </div>
          )}
        </div>

        <div className="other-departments-section">
          <h4><i className="fas fa-building"></i> Altri Uffici</h4>
          <input type="text" placeholder="Cerca ufficio..." className="form-input" />
          <div className="office-listbox">
            <div className="office-list-inner scrollbar-styled">
              <label className="department-list-item"> <input type="radio" name="department" value="anagrafe" className="form-radio" onChange={onOfficeSelect} /> <span>Ufficio Anagrafe</span> </label>
              <label className="department-list-item"> <input type="radio" name="department" value="tributi-manuale" className="form-radio" onChange={onOfficeSelect} /> <span>Ufficio Tributi</span> </label>
              <label className="department-list-item"> <input type="radio" name="department" value="lavori-pubblici" className="form-radio" onChange={onOfficeSelect} /> <span>Ufficio Lavori Pubblici</span> </label>
              <label className="department-list-item"> <input type="radio" name="department" value="protocollo" className="form-radio" onChange={onOfficeSelect} /> <span>Ufficio Protocollo</span> </label>
              <label className="department-list-item"> <input type="radio" name="department" value="urbanistica" className="form-radio" onChange={onOfficeSelect} /> <span>Ufficio Urbanistica</span> </label>
              <label className="department-list-item"> <input type="radio" name="department" value="servizi-sociali" className="form-radio" onChange={onOfficeSelect} /> <span>Servizi Sociali</span> </label>
              <label className="department-list-item"> <input type="radio" name="department" value="polizia-locale" className="form-radio" onChange={onOfficeSelect} /> <span>Polizia Locale</span> </label>
              <label className="department-list-item"> <input type="radio" name="department" value="ufficio-tecnico" className="form-radio" onChange={onOfficeSelect} /> <span>Ufficio Tecnico</span> </label>
              <label className="department-list-item"> <input type="radio" name="department" value="scuola" className="form-radio" onChange={onOfficeSelect} /> <span>Ufficio Scuola e Istruzione</span> </label>
              <label className="department-list-item"> <input type="radio" name="department" value="ambiente" className="form-radio" onChange={onOfficeSelect} /> <span>Ufficio Ambiente</span> </label>
              <label className="department-list-item"> <input type="radio" name="department" value="cultura" className="form-radio" onChange={onOfficeSelect} /> <span>Ufficio Cultura e Eventi</span> </label>
              <label className="department-list-item"> <input type="radio" name="department" value="personale" className="form-radio" onChange={onOfficeSelect} /> <span>Ufficio Personale</span> </label>
              <label className="department-list-item"> <input type="radio" name="department" value="ragioneria" className="form-radio" onChange={onOfficeSelect} /> <span>Ufficio Ragioneria</span> </label>
              <label className="department-list-item"> <input type="radio" name="department" value="stato-civile" className="form-radio" onChange={onOfficeSelect} /> <span>Stato Civile</span> </label>
            </div>
          </div>
        </div>
      </div>

      <div className="step-footer">
        <button id="back-step-btn" className="button-secondary" onClick={onGoBack}>
          <i className="fas fa-arrow-left"></i>Dettagli & Allegati
        </button>
        <button
          id="protocol-btn"
          className={`button-success ${protocolStatus.error ? 'button-danger' : ''}`}
          onClick={onProtocol}
          disabled={protocolStatus.loading || protocolStatus.success}
        >
          <i className={`fas ${protocolStatus.icon}`}></i>
          {protocolStatus.text}
          {protocolStatus.loading && <span className="loading-dots"></span>}
        </button>
      </div>
    </div>
  );
}

export default ProtocolTab;