import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../AppContext';
import ContactModal from './ContactModal';
import DetailsAttachmentsTab from './DetailsAttachmentsTab';
import ProtocolTab from './ProtocolTab';
import { SUPPORTED_FILE_TYPES } from '../../utils/uiUtils';
import { MOCK_ANALYSIS_TEXTS } from '../../data/mockData';

// Helper function
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
  const [isSynthesizingAll, setIsSynthesizingAll] = useState(false);
  
  const analysisResults = state.analysisResults[emailId] || {};


  // Reset local state when emailId changes
  useEffect(() => {
    setCurrentStep(1);
    setSenderStatus({ text: 'Identificato automaticamente', className: 'text-success', icon: 'fa-check-circle' });
    setSelectedOffice(null);
    setAiSuggestionsLoading(false);
    setIsSynthesizingAll(false);
    setProtocolStatus({ text: 'Conferma Protocollazione', icon: 'fa-clipboard-check', loading: false, error: false, success: false });
    setAiSuggestionsVisible(false); 
  }, [emailId]);

  // ESLint fix: Extract complex expression and add dependencies
  const currentEmailStatus = state.emails[emailId]?.status;
  useEffect(() => {
    if (currentEmailStatus === 'analyzed') {
        setAiSuggestionsVisible(true);
    } else {
        setAiSuggestionsVisible(false);
    }
  }, [emailId, currentEmailStatus, state.emails]);


  // "Analyze All" logic
  const handleAnalyzeAll = async (timeout = 3000) => {
    setIsSynthesizingAll(true);
    await wait(timeout);

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
    return true;
  };

  // Logic for single attachment analysis (passed down as prop)
  const handleAttachmentAnalyze = (attachmentId, filename) => {
      const resultText = MOCK_ANALYSIS_TEXTS[filename] || 'Analisi completata: il documento è stato letto.';
      dispatch({
          type: 'UPDATE_ANALYSIS_RESULTS',
          payload: { emailId, results: { [attachmentId]: resultText } }
      });
  };

  // "Get AI Suggestions" logic
  const handleGetAISuggestions = async () => {
    setAiSuggestionsLoading(true);

    const supportedAttachments = attachments.filter(att => SUPPORTED_FILE_TYPES.has(att.fileType));
    const allSupportedAreDone = supportedAttachments.every(att => analysisResults[att.id]);

    if (!allSupportedAreDone) {
        await handleAnalyzeAll(1500);
    }

    dispatch({ type: 'MARK_AS_ANALYZED', payload: emailId });
    
    await wait(2500);
    
    setAiSuggestionsLoading(false);
    setAiSuggestionsVisible(true);

    return false; 
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
        <h2><i className="fas fa-envelope-open-text"></i></h2>
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

      <div 
        key={currentStep} 
        className="details-content-scroll scrollbar-styled content-fade-in"
      >
                
        {currentStep === 1 ? (
            <DetailsAttachmentsTab
              email={email}
              attachments={attachments}
              senderStatus={senderStatus}
              onVerifyContactClick={() => setIsModalOpen(true)}
              analysisResults={analysisResults}
              isSynthesizingAll={isSynthesizingAll}
              onAnalyzeAll={() => handleAnalyzeAll(3000)}
              onAttachmentAnalyze={handleAttachmentAnalyze}
              onGoToProtocol={() => setCurrentStep(2)}
            />
        ) : (
            <ProtocolTab
              attachments={attachments}
              analysisResults={analysisResults}
              isSynthesizingAll={isSynthesizingAll}
              onAttachmentAnalyze={handleAttachmentAnalyze}
              aiSuggestionsLoading={aiSuggestionsLoading}
              aiSuggestionsVisible={aiSuggestionsVisible}
              onGetAISuggestions={handleGetAISuggestions}
              onOfficeSelect={(e) => setSelectedOffice(e.target.value)}
              onGoBack={() => setCurrentStep(1)}
              onProtocol={handleProtocol}
              protocolStatus={protocolStatus}
            />
        )}

      </div>
    </div>
  );
}

export default EmailDetailsPanel;