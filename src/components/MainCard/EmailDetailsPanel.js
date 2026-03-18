import { useState, useEffect } from "react";
import { useAppContext } from "../../AppContext";
import ContactModal from "./ContactModal";
import DetailsAttachmentsTab from "./DetailsAttachmentsTab";
import ProtocolTab from "./ProtocolTab";
import { SUPPORTED_FILE_TYPES } from "../../utils/uiUtils";
import { MOCK_ANALYSIS_TEXTS } from "../../data/mockData";
import { useMessageDetails, useParsedMessage } from "../../hooks/useEmails";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function EmailDetailsPanel({ emailId, style }) {
  const { state, dispatch } = useAppContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [senderStatus, setSenderStatus] = useState({ text: "", className: "", icon: "" });
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [aiSuggestionsLoading, setAiSuggestionsLoading] = useState(false);
  const [aiSuggestionsVisible, setAiSuggestionsVisible] = useState(false);
  const [protocolStatus, setProtocolStatus] = useState({
    text: "Conferma Protocollazione", icon: "fa-clipboard-check", loading: false, error: false, success: false,
  });
  const [isSynthesizingAll, setIsSynthesizingAll] = useState(false);

  const { data: detailedMsg } = useMessageDetails(emailId);
  const { refetch: forceFetchParsed } = useParsedMessage(emailId, { enabled: false });

  useEffect(() => {
    if (detailedMsg) {
      dispatch({ type: "SET_SELECTED_EMAIL_DATA", payload: detailedMsg });
    }
  }, [detailedMsg, dispatch]);

  useEffect(() => {
    const mockStatus = (() => {
      if (emailId === "unread2") return { text: "Conflitto contatti", className: "status-warning", icon: "fa-exclamation-triangle", actionText: "Risolvi" };
      if (emailId === "unread3") return { text: "Non identificato", className: "status-danger", icon: "fa-question-circle", actionText: "Crea" };
      if (emailId === "unread4") return { text: "Identificato manualmente", className: "status-info", icon: "fa-user-edit", actionText: "Modifica" };
      return { text: "Identificato automaticamente", className: "status-success", icon: "fa-check-circle", actionText: "Verifica" };
    })();

    setSenderStatus(mockStatus);
    setCurrentStep(1);
    setSelectedOffice(null);
    setAiSuggestionsLoading(false);
    setIsSynthesizingAll(false);
    setProtocolStatus({ text: "Conferma Protocollazione", icon: "fa-clipboard-check", loading: false, error: false, success: false });
    setAiSuggestionsVisible(false);
  }, [emailId]);

  const email = state.selectedEmailData || state.emails[emailId] || {};
  const attachments = email.attachments || [];
  const analysisResults = state.analysisResults[emailId] || {};
  const currentEmailStatus = email.status;

  useEffect(() => {
    if (!aiSuggestionsLoading) {
      setAiSuggestionsVisible(currentEmailStatus === "analyzed");
    }
  }, [emailId, currentEmailStatus, aiSuggestionsLoading]);

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

  const handleGetAISuggestions = async () => {
    setAiSuggestionsLoading(true);

    try {
      const supportedAttachments = attachments.filter((att) => SUPPORTED_FILE_TYPES.has(att.fileType));
      const allSupportedAreDone = supportedAttachments.every((att) => analysisResults[att.id]);

      if (!allSupportedAreDone) await handleAnalyzeAll();

      dispatch({ type: "MARK_AS_ANALYZED", payload: emailId });

      await forceFetchParsed();
      await delay(Math.random() * 3500 + 1500);

      setAiSuggestionsLoading(false);
      setAiSuggestionsVisible(true);
    } catch (e) {
      console.error(e);
      setAiSuggestionsLoading(false);
    }
  };

  const handleProtocol = async () => {
    if (!selectedOffice) {
      setProtocolStatus({ text: "Seleziona un ufficio", icon: "fa-exclamation-triangle", loading: false, error: true, success: false });
      setTimeout(() => {
        setProtocolStatus(prev => ({ ...prev, text: "Conferma Protocollazione", icon: "fa-clipboard-check", error: false }));
      }, 2000);
      return;
    }

    setProtocolStatus({ text: "Protocollazione in corso...", icon: "fa-spinner fa-spin", loading: true, error: false, success: false });

    try {
      await delay(Math.random() * 1500 + 1000);
      setProtocolStatus({ text: "✓ Email Protocollata", icon: "fa-check", loading: false, error: false, success: true });
      dispatch({ type: "PROTOCOL_EMAIL", payload: emailId });
    } catch (e) {
      console.error(e);
    }
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
    attachments,
    analysisResults,
    isSynthesizingAll,
    onAttachmentAnalyze: handleAttachmentAnalyze,
    aiSuggestionsLoading,
    aiSuggestionsVisible,
    onGetAISuggestions: handleGetAISuggestions,
    onOfficeSelect: (e) => setSelectedOffice(e.target.value),
    onGoBack: () => setCurrentStep(1),
    onProtocol: handleProtocol,
    protocolStatus,
    isFullscreen: state.isFullscreen,
  };

  return (
    <div id="email-details-panel" className={panelClasses} style={style}>
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          setSenderStatus({ text: "✓ Contatto verificato", className: "text-success", icon: "fa-check-circle" });
          setIsModalOpen(false);
        }}
        onAddNew={() => {
          setSenderStatus({ text: "+ Nuovo contatto aggiunto", className: "text-info", icon: "fa-plus-circle" });
          setIsModalOpen(false);
        }}
      />

      {/* ── Header ── */}
      <div className="details-header">
        <h2><i className="fas fa-envelope-open-text"></i></h2>

        {/* Tab toggle: solo in vista compatta */}
        {!state.isFullscreen && (
          <div className="tab-navigation-wrapper fade-in">
            <div className="sliding-pill-toggle sliding-pill-fullwidth">
              <input type="radio" name="step-toggle" id="pill-step-1" className="sliding-pill-input" checked={currentStep === 1} onChange={() => setCurrentStep(1)} />
              <label htmlFor="pill-step-1" className="sliding-pill-label" id="step1-tab-label">
                <i className="fas fa-info-circle"></i>Messaggio & Allegati
              </label>
              <input type="radio" name="step-toggle" id="pill-step-2" className="sliding-pill-input" checked={currentStep === 2} onChange={() => setCurrentStep(2)} />
              <label htmlFor="pill-step-2" className="sliding-pill-label" id="step2-tab-label">
                <i className="fas fa-clipboard-list"></i>Protocollazione
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

      {/* ── Contenuto ── */}
      {state.isFullscreen ? (
        // Vista fullscreen: 2 colonne affiancate
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Colonna sinistra: messaggio + allegati */}
          <div
            className="details-content-scroll scrollbar-styled fade-in"
            style={{ flex: 1, borderRight: '1px solid var(--c-border-base)' }}
          >
            <DetailsAttachmentsTab {...detailsTabProps} />
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
          {currentStep === 1
            ? <DetailsAttachmentsTab {...detailsTabProps} />
            : <ProtocolTab {...protocolTabProps} />
          }
        </div>
      )}
    </div>
  );
}

export default EmailDetailsPanel;
