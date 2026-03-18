import { useState, useEffect } from "react";
import { useAppContext } from "../../AppContext";
import ContactModal from "./ContactModal";
import DetailsAttachmentsTab from "./DetailsAttachmentsTab";
import ProtocolTab from "./ProtocolTab";
import MessageTimeline from "./MessageTimeline";
import PipelineStatusBar from "./PipelineStatusBar";
import { SUPPORTED_FILE_TYPES } from "../../utils/uiUtils";
import { MOCK_ANALYSIS_TEXTS } from "../../data/mockData";
import { useMessageDetails, useParsedMessage, useSenderResolution } from "../../hooks/useEmails";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function FullscreenTimelineSection({ messageId }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ borderTop: '1px solid var(--c-border-base)', margin: '0 1rem' }}>
      <button
        onClick={() => setIsOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--c-text-muted)',
          fontSize: '0.8rem',
          fontWeight: 600,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <i className="fas fa-stream" style={{ fontSize: '0.7rem', color: 'var(--c-primary)' }} />
          Cronologia eventi
        </span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ fontSize: '0.65rem' }} />
      </button>
      {isOpen && (
        <div style={{ margin: '0 -1rem' }}>
          <MessageTimeline messageId={messageId} />
        </div>
      )}
    </div>
  );
}

const SENDER_STATUS_MAP = {
  in_progress:   { text: 'Ricerca in corso',  className: 'status-info',    icon: 'fa-circle-notch fa-spin' },
  pref_found:    { text: 'Identificato',       className: 'status-success', icon: 'fa-check-circle' },
  candidates_1:  { text: 'Da confermare',      className: 'status-info',    icon: 'fa-user-check' },
  candidates_n:  { text: 'Ambiguità',          className: 'status-warning', icon: 'fa-exclamation-triangle' },
  candidates_0:  { text: 'Sconosciuto',        className: 'status-danger',  icon: 'fa-question-circle' },
  lookup_failed: { text: 'Ricerca fallita',    className: 'status-danger',  icon: 'fa-times-circle' },
};

function EmailDetailsPanel({ emailId, style }) {
  const { state, dispatch } = useAppContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isSynthesizingAll, setIsSynthesizingAll] = useState(false);

  const { data: detailedMsg } = useMessageDetails(emailId);
  const { refetch: forceFetchParsed } = useParsedMessage(emailId, { enabled: false });
  const { data: senderResolution, isLoading: isSenderResolutionLoading } = useSenderResolution(emailId);

  const senderStatus = (() => {
    if (isSenderResolutionLoading) return { text: 'Identificazione...', className: 'status-info', icon: 'fa-circle-notch fa-spin' };
    if (!senderResolution) return { text: 'Non identificato', className: 'status-info', icon: 'fa-hourglass-half' };
    return SENDER_STATUS_MAP[senderResolution.status] ?? { text: 'Non identificato', className: 'status-info', icon: 'fa-hourglass-half' };
  })();

  useEffect(() => {
    if (detailedMsg) {
      dispatch({ type: "SET_SELECTED_EMAIL_DATA", payload: detailedMsg });
    }
  }, [detailedMsg, dispatch]);

  useEffect(() => {
    setCurrentStep(1);
    setIsSynthesizingAll(false);
  }, [emailId]);

  const email = state.selectedEmailData || state.emails[emailId] || {};
  const attachments = email.attachments || [];
  const analysisResults = state.analysisResults[emailId] || {};

  const handleAnalyzeAll = async () => {
    setIsSynthesizingAll(true);

    const clearedResults = {};
    attachments.forEach((att) => {
      if (SUPPORTED_FILE_TYPES.has(att.fileType)) clearedResults[att.id] = null;
    });
    dispatch({ type: "UPDATE_ANALYSIS_RESULTS", payload: { emailId, results: clearedResults } });

    try {
      await forceFetchParsed();

      const allResults = {};
      attachments.forEach((att) => {
        if (SUPPORTED_FILE_TYPES.has(att.fileType)) {
          allResults[att.id] = MOCK_ANALYSIS_TEXTS[att.filename] || "Analisi completata: il documento è stato letto.";
        }
      });

      dispatch({ type: "UPDATE_ANALYSIS_RESULTS", payload: { emailId, results: allResults } });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSynthesizingAll(false);
    }
  };

  const handleAttachmentAnalyze = async (attachmentId, filename) => {
    dispatch({ type: "UPDATE_ANALYSIS_RESULTS", payload: { emailId, results: { [attachmentId]: null } } });

    try {
      await forceFetchParsed();
      await delay(Math.random() * 1200 + 800);

      const resultText = MOCK_ANALYSIS_TEXTS[filename] || "Analisi completata: il documento è stato letto.";
      dispatch({ type: "UPDATE_ANALYSIS_RESULTS", payload: { emailId, results: { [attachmentId]: resultText } } });
    } catch (e) {
      console.error(e);
    }
  };

  const handleProtocol = () => {
    dispatch({ type: "PROTOCOL_EMAIL", payload: emailId });
  };

  const closePanel = () => dispatch({ type: "CLOSE_EMAIL" });
  const toggleFullscreen = () => dispatch({ type: "TOGGLE_FULLSCREEN" });

  const panelClasses = ["details-panel", state.selectedEmailId ? "slide-in" : "slide-out", state.isFullscreen ? "fullscreen" : state.selectedEmailId ? "open" : ""].filter(Boolean).join(" ");

  // Props comuni ai due tab
  const detailsTabProps = {
    email,
    attachments,
    senderStatus,
    onVerifyContactClick: () => setIsModalOpen(true),
    analysisResults,
    isSynthesizingAll,
    onAnalyzeAll: handleAnalyzeAll,
    onAttachmentAnalyze: handleAttachmentAnalyze,
    onGoToProtocol: () => setCurrentStep(2),
    isFullscreen: state.isFullscreen,
  };

  const protocolTabProps = {
    messageId: emailId,
    attachments,
    onGoBack: () => setCurrentStep(1),
    onProtocol: handleProtocol,
    isFullscreen: state.isFullscreen,
  };

  return (
    <div id="email-details-panel" className={panelClasses} style={style}>
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        messageId={emailId}
      />

      {/* ── Header ── */}
      <div className="details-header">
        <h2><i className="fas fa-envelope-open-text"></i></h2>

        {/* Tab toggle: solo in vista compatta */}
        {!state.isFullscreen && (
          <div className="tab-navigation-wrapper fade-in">
            <div className="sliding-pill-toggle sliding-pill-3tabs">
              <input type="radio" name="step-toggle" id="pill-step-1" className="sliding-pill-input" checked={currentStep === 1} onChange={() => setCurrentStep(1)} />
              <label htmlFor="pill-step-1" className="sliding-pill-label" id="step1-tab-label">
                <i className="fas fa-info-circle"></i>Messaggio
              </label>
              <input type="radio" name="step-toggle" id="pill-step-2" className="sliding-pill-input" checked={currentStep === 2} onChange={() => setCurrentStep(2)} />
              <label htmlFor="pill-step-2" className="sliding-pill-label" id="step2-tab-label">
                <i className="fas fa-clipboard-list"></i>Protocollo
              </label>
              <input type="radio" name="step-toggle" id="pill-step-3" className="sliding-pill-input" checked={currentStep === 3} onChange={() => setCurrentStep(3)} />
              <label htmlFor="pill-step-3" className="sliding-pill-label" id="step3-tab-label"
                style={{ opacity: currentStep !== 3 ? 0.55 : undefined, fontSize: '0.72rem' }}>
                <i className="fas fa-stream"></i>Cronologia
              </label>
              <div className="sliding-pill-bg"></div>
            </div>
          </div>
        )}

        <div className="header-button-group">
          <button id="expand-details" className="details-header-button" title="Espandi" onClick={toggleFullscreen}>
            <i className={state.isFullscreen ? "fas fa-compress" : "fas fa-expand"}></i>
          </button>
          <button id="close-details" className="details-header-button" title="Chiudi" onClick={closePanel}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* ── Pipeline status strip (persistente tra i tab) ── */}
      {emailId && <PipelineStatusBar message={email} messageId={emailId} />}

      {/* ── Contenuto ── */}
      {state.isFullscreen ? (
        // Vista fullscreen: 2 colonne affiancate
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Colonna sinistra: messaggio + allegati + cronologia */}
          <div
            className="details-content-scroll scrollbar-styled fade-in"
            style={{ flex: 1, borderRight: '1px solid var(--c-border-base)' }}
          >
            <DetailsAttachmentsTab {...detailsTabProps} />
            <FullscreenTimelineSection messageId={emailId} />
          </div>

          {/* Colonna destra: protocollazione */}
          <div
            className="details-content-scroll scrollbar-styled fade-in"
            style={{ width: '360px', flexShrink: 0 }}
          >
            <ProtocolTab {...protocolTabProps} />
          </div>
        </div>
      ) : (
        // Vista compatta: tab singolo
        <div key={currentStep} className="details-content-scroll scrollbar-styled content-fade-in">
          {currentStep === 1 && <DetailsAttachmentsTab {...detailsTabProps} />}
          {currentStep === 2 && <ProtocolTab {...protocolTabProps} />}
          {currentStep === 3 && <MessageTimeline messageId={emailId} />}
        </div>
      )}
    </div>
  );
}

export default EmailDetailsPanel;
