import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../AppContext';
import ContactModal from './ContactModal';
import DetailsAttachmentsTab from './DetailsAttachmentsTab';
import ProtocolTab from './ProtocolTab';
import { SUPPORTED_FILE_TYPES } from '../../utils/uiUtils';
import { fetchParsedMessage } from '../../services/api';

function EmailDetailsPanel({ emailId, style }) {
  const { state, dispatch } = useAppContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isMounted = useRef(true);
  const activeRequests = useRef(new AbortController());

  useEffect(() => {
    isMounted.current = true;
    const currentRequests = activeRequests.current;
    return () => {
      isMounted.current = false;
      currentRequests.abort();
    };
  }, []);

  const [senderStatus, setSenderStatus] = useState({ text: '', className: '', icon: '' });

  useEffect(() => {
    // Simulo stati diversi in base all'ID o al mittente per demo
    const mockStatus = (() => {
      if (emailId === 'unread2') return {
        text: 'Conflitto contatti',
        className: 'status-warning',
        icon: 'fa-exclamation-triangle',
        actionText: 'Risolvi'
      };
      if (emailId === 'unread3') return {
        text: 'Non identificato',
        className: 'status-danger',
        icon: 'fa-question-circle',
        actionText: 'Crea'
      };
      if (emailId === 'unread4') return {
        text: 'Identificato manualmente',
        className: 'status-info',
        icon: 'fa-user-edit',
        actionText: 'Modifica'
      };
      return {
        text: 'Identificato automaticamente',
        className: 'status-success',
        icon: 'fa-check-circle',
        actionText: 'Verifica'
      };
    })();

    setSenderStatus(mockStatus);

    setCurrentStep(1);
    setSelectedOffice(null);
    setAiSuggestionsLoading(false);
    setIsSynthesizingAll(false);
    setProtocolStatus({ text: 'Conferma Protocollazione', icon: 'fa-clipboard-check', loading: false, error: false, success: false });
    setAiSuggestionsVisible(false);

    const loadParsedData = async () => {
      try {
        const parsed = await fetchParsedMessage(emailId, activeRequests.current.signal);
        if (!isMounted.current) return;

        if (parsed) {
          setParserStatus('found');
          if (parsed.body_text) {
            dispatch({
              type: 'UPDATE_EMAIL_BODY',
              payload: { messageId: emailId, bodyText: parsed.body_text }
            });
          }

          if (parsed.attachment_analyses) {
            const allResults = {};
            parsed.attachment_analyses.forEach(att_data => {
              allResults[att_data.attachment_id] = att_data.analysis_result || 'Analisi completata.';
            });
            dispatch({
              type: 'UPDATE_ANALYSIS_RESULTS',
              payload: { emailId, results: allResults }
            });
          }
        } else {
          setParserStatus('not_found');
          console.log(`[DetailsPanel] Parser returned 404/Empty for ${emailId}.`);
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Failed to load parsed data:', err);
      }
    };

    if (emailId && !String(emailId).startsWith('unread')) {
      loadParsedData();
    }
  }, [emailId, dispatch]);

  const email = state.emails[emailId] || Object.values(state.emails)[0];
  const attachments = email.attachments || [];

  const [selectedOffice, setSelectedOffice] = useState(null);
  const [aiSuggestionsLoading, setAiSuggestionsLoading] = useState(false);
  const [aiSuggestionsVisible, setAiSuggestionsVisible] = useState(false);
  const [protocolStatus, setProtocolStatus] = useState({ text: 'Conferma Protocollazione', icon: 'fa-clipboard-check', loading: false, error: false, success: false });
  const [isSynthesizingAll, setIsSynthesizingAll] = useState(false);
  const [parserStatus, setParserStatus] = useState('loading'); // 'loading', 'found', 'not_found'

  const analysisResults = state.analysisResults[emailId] || {};

  const currentEmailStatus = state.emails[emailId]?.status;
  useEffect(() => {
    if (!aiSuggestionsLoading) {
      if (currentEmailStatus === 'analyzed') {
        setAiSuggestionsVisible(true);
      } else {
        setAiSuggestionsVisible(false);
      }
    }
  }, [emailId, currentEmailStatus, state.emails, aiSuggestionsLoading]);


  // "Analyze All" logic
  const handleAnalyzeAll = async () => {
    setIsSynthesizingAll(true);

    const clearedResults = {};
    attachments.forEach(att => {
      if (SUPPORTED_FILE_TYPES.has(att.fileType)) {
        clearedResults[att.id] = null;
      }
    });
    dispatch({
      type: 'UPDATE_ANALYSIS_RESULTS',
      payload: { emailId, results: clearedResults }
    });

    try {
      // Refresh the analyzed results forcing a re-fetch of the parsing if supported
      const parsed = await fetchParsedMessage(emailId, activeRequests.current.signal);

      if (!isMounted.current) return;

      const allResults = {};
      if (parsed && parsed.attachment_analyses) {
        parsed.attachment_analyses.forEach(att_data => {
          allResults[att_data.attachment_id] = att_data.analysis_result || 'Analisi completata.';
        });
      }

      dispatch({
        type: 'UPDATE_ANALYSIS_RESULTS',
        payload: { emailId, results: allResults }
      });
    } catch (e) {
      if (e.name !== 'AbortError') console.error(e);
    } finally {
      if (isMounted.current) setIsSynthesizingAll(false);
    }
  };

  // Logic for single attachment analysis
  const handleAttachmentAnalyze = async (attachmentId, filename) => {
    dispatch({
      type: 'UPDATE_ANALYSIS_RESULTS',
      payload: { emailId, results: { [attachmentId]: null } }
    });

    try {
      const parsed = await fetchParsedMessage(emailId, activeRequests.current.signal);

      if (!isMounted.current) return;

      let resultText = 'Analisi in corso / non disponibile.';
      if (parsed && parsed.attachment_analyses) {
        const match = parsed.attachment_analyses.find(a => String(a.attachment_id) === String(attachmentId));
        if (match && match.analysis_result) {
          resultText = match.analysis_result;
        }
      }

      dispatch({
        type: 'UPDATE_ANALYSIS_RESULTS',
        payload: { emailId, results: { [attachmentId]: resultText } }
      });
    } catch (e) {
      if (e.name !== 'AbortError') console.error(e);
    }
  };

  // "Get AI Suggestions" logic
  const handleGetAISuggestions = async () => {
    setAiSuggestionsLoading(true);

    try {
      if (!isMounted.current) return;

      dispatch({ type: 'MARK_AS_ANALYZED', payload: emailId });

      if (isMounted.current) {
        setAiSuggestionsLoading(false);
        setAiSuggestionsVisible(true);
      }
    } catch (e) {
      if (e.name !== 'AbortError') console.error(e);
      if (isMounted.current) setAiSuggestionsLoading(false);
    }
  };


  const handleProtocol = async () => {
    if (!selectedOffice) {
      setProtocolStatus({ text: 'Seleziona un ufficio', icon: 'fa-exclamation-triangle', loading: false, error: true, success: false });
      const timer = setTimeout(() => {
        if (isMounted.current) {
          setProtocolStatus(prev => ({ ...prev, text: 'Conferma Protocollazione', icon: 'fa-clipboard-check', error: false }));
        }
      }, 2000);
      const tempSignal = activeRequests.current.signal;
      tempSignal.addEventListener('abort', () => clearTimeout(timer));
      return;
    }

    setProtocolStatus({ text: 'Protocollazione in corso...', icon: 'fa-spinner fa-spin', loading: true, error: false, success: false });

    try {
      await new Promise(r => setTimeout(r, 1500));
      if (isMounted.current) {
        setProtocolStatus({ text: '✓ Email Protocollata', icon: 'fa-check', loading: false, error: false, success: true });
        dispatch({ type: 'PROTOCOL_EMAIL', payload: emailId });
      }
    } catch (e) {
      if (e.name !== 'AbortError') console.error(e);
    }
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
            onAnalyzeAll={() => handleAnalyzeAll()}
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