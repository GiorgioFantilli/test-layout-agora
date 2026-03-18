import React, { useState, useEffect } from "react";
import { useRoutingSuggestion, useRoutingDecision, useOfficeCatalog } from "../../hooks/useEmails";
import { useSession } from "../../hooks/useAuth";

const CONFIDENCE_BADGE = (score) => {
  if (score == null) return "ai-badge-orange";
  if (score >= 0.7) return "ai-badge-green";
  if (score >= 0.45) return "ai-badge-yellow";
  return "ai-badge-orange";
};

const formatConfidence = (score) =>
  score != null ? `${Math.round(score * 100)}%` : "—";

// Fallback label se non esiste endpoint catalogo (Task 3.5)
const officeLabelFallback = (code) =>
  code
    ? code
        .split("_")
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(" ")
    : code;

const MANUAL_OFFICES = [
  ["ANAGRAFE", "Ufficio Anagrafe"],
  ["TRIBUTI", "Ufficio Tributi"],
  ["LAVORI_PUBBLICI", "Ufficio Lavori Pubblici"],
  ["PROTOCOLLO", "Ufficio Protocollo"],
  ["URBANISTICA", "Ufficio Urbanistica"],
  ["SERVIZI_SOCIALI", "Servizi Sociali"],
  ["POLIZIA_LOCALE", "Polizia Locale"],
  ["UFFICIO_TECNICO", "Ufficio Tecnico"],
  ["SCUOLA", "Ufficio Scuola e Istruzione"],
  ["AMBIENTE", "Ufficio Ambiente"],
  ["CULTURA", "Ufficio Cultura e Eventi"],
  ["PERSONALE", "Ufficio Personale"],
  ["RAGIONERIA", "Ufficio Ragioneria"],
  ["STATO_CIVILE", "Stato Civile"],
];

function ProtocolTab({ messageId, attachments, onGoBack, onProtocol, isFullscreen }) {
  const { data: suggestion, isLoading: suggestionLoading } = useRoutingSuggestion(messageId);
  const routingDecision = useRoutingDecision(messageId);
  const { data: session } = useSession();
  const { data: catalogData } = useOfficeCatalog();

  const [selectedOfficeCode, setSelectedOfficeCode] = useState(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [manualSearch, setManualSearch] = useState("");
  const [localError, setLocalError] = useState(null);
  const [decisionSuccess, setDecisionSuccess] = useState(false);

  // Reset on message change
  useEffect(() => {
    setSelectedOfficeCode(null);
    setOverrideReason("");
    setManualSearch("");
    setLocalError(null);
    setDecisionSuccess(false);
  }, [messageId]);

  // Pre-select primary candidate when suggestion loads
  useEffect(() => {
    if (suggestion?.primaryOfficeCode && !selectedOfficeCode) {
      setSelectedOfficeCode(suggestion.primaryOfficeCode);
    }
  }, [suggestion?.primaryOfficeCode, selectedOfficeCode]);

  const isPending =
    suggestionLoading || ["queued", "in_progress"].includes(suggestion?.status);
  const isOverride =
    selectedOfficeCode &&
    suggestion?.primaryOfficeCode &&
    selectedOfficeCode !== suggestion.primaryOfficeCode;

  const handleConfirm = async () => {
    setLocalError(null);
    if (!selectedOfficeCode) {
      setLocalError("Seleziona un ufficio prima di procedere.");
      return;
    }
    if (isOverride && !overrideReason.trim()) {
      setLocalError(
        "Inserisci il motivo della modifica rispetto al suggerimento AI.",
      );
      return;
    }
    try {
      await routingDecision.mutateAsync({
        selected_primary_office_code: selectedOfficeCode,
        selected_secondary_office_codes: [],
        override_reason: isOverride ? overrideReason.trim() : null,
        operator_id: session?.username || "operatore",
      });
      setDecisionSuccess(true);
      onProtocol();
    } catch (e) {
      setLocalError("Errore durante la registrazione del routing. Riprova.");
    }
  };

  const getOfficeLabel = (code) => {
    if (catalogData) {
      const found = catalogData.find((o) => o.office_code === code);
      if (found) return found.office_label;
    }
    return officeLabelFallback(code);
  };

  const officesList = catalogData
    ? catalogData.filter((o) => o.is_active !== false)
    : MANUAL_OFFICES.map(([code, label]) => ({ office_code: code, office_label: label }));

  const filteredManual = officesList.filter((office) =>
    office.office_label.toLowerCase().includes(manualSearch.toLowerCase()) ||
    office.office_code.toLowerCase().includes(manualSearch.toLowerCase())
  );

  return (
    <div id="step2-content">
      {/* Riepilogo allegati */}
      {attachments.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.5rem 0",
            marginBottom: "0.5rem",
            color: "var(--c-text-muted)",
            fontSize: "0.82rem",
          }}
        >
          <i className="fas fa-paperclip" style={{ fontSize: "0.75rem" }}></i>
          <span>
            {attachments.length} allegat{attachments.length === 1 ? "o" : "i"} da
            protocollare
          </span>
        </div>
      )}

      {/* Selezione ufficio */}
      <div id="department-selection-area">
        {/* ── Uffici Suggeriti dall'AI ── */}
        <div id="department-suggestions">
          <div className="department-suggestions-header">
            <h3>
              <i className="fa-solid fa-wand-magic-sparkles"></i>Uffici Consigliati
            </h3>
          </div>

          {/* Loading / polling */}
          {isPending && (
            <div
              id="ai-loading-section"
              className="ai-loading-box content-fade-in"
            >
              <div className="ai-loading-content">
                <div className="ai-pulse-animation">
                  <i className="fas fa-brain"></i>
                </div>
                <h4>
                  Calcolo routing in corso
                  <span className="loading-dots"></span>
                </h4>
                <p>Analisi del messaggio e storico instradamenti...</p>
              </div>
            </div>
          )}

          {/* Nessun routing calcolato (404) */}
          {!isPending && suggestion === null && (
            <div className="ai-info-banner">
              <div className="ai-info-banner-text-wrapper">
                <i className="fas fa-info-circle"></i>
                <p>
                  Il suggerimento di instradamento non è ancora disponibile per
                  questo messaggio. Seleziona manualmente l'ufficio di
                  destinazione.
                </p>
              </div>
            </div>
          )}

          {/* MANUAL_REVIEW: confidence bassa */}
          {!isPending && suggestion?.status === "manual_review" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.75rem",
                marginBottom: "0.5rem",
                borderRadius: "6px",
                background: "var(--c-ai-badge-orange-bg)",
                color: "var(--c-ai-badge-orange-text)",
                fontSize: "0.82rem",
              }}
            >
              <i className="fas fa-exclamation-triangle"></i>
              <span>
                Confidenza insufficiente — revisione manuale raccomandata.
              </span>
            </div>
          )}

          {/* Candidati */}
          {!isPending &&
            suggestion?.candidates &&
            suggestion.candidates.length > 0 && (
              <div className="suggestions-list content-fade-in">
                {suggestion.candidates.map((c) => (
                  <label key={c.officeCode} className="ai-suggestion-label">
                    <input
                      type="radio"
                      name="department"
                      value={c.officeCode}
                      className="form-radio"
                      checked={selectedOfficeCode === c.officeCode}
                      onChange={() => setSelectedOfficeCode(c.officeCode)}
                    />
                    <div className="suggestion-details">
                      <div className="suggestion-header">
                        <span className="department-name">
                          {getOfficeLabel(c.officeCode)}
                        </span>
                        <span
                          className={`ai-badge ${CONFIDENCE_BADGE(c.score)}`}
                        >
                          <i className="fa-solid fa-wand-magic-sparkles"></i>
                          {formatConfidence(c.score)}
                        </span>
                      </div>
                      {c.role === "PRIMARY" && (
                        <p className="department-description">
                          Suggerimento principale
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
        </div>

        {/* ── Altri Uffici (selezione manuale) ── */}
        <div className="other-departments-section">
          <h4>
            <i className="fas fa-building"></i> Altri Uffici
          </h4>
          <input
            type="text"
            placeholder="Cerca ufficio..."
            className="form-input"
            value={manualSearch}
            onChange={(e) => setManualSearch(e.target.value)}
          />
          <div className="office-listbox">
            <div className="office-list-inner scrollbar-styled">
              {filteredManual.map((office) => (
                <label key={office.office_code} className="department-list-item">
                  <input
                    type="radio"
                    name="department"
                    value={office.office_code}
                    className="form-radio"
                    checked={selectedOfficeCode === office.office_code}
                    onChange={() => setSelectedOfficeCode(office.office_code)}
                  />
                  <span>{office.office_label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Override reason — visibile solo se si devia dal suggerimento AI */}
      {isOverride && (
        <div
          style={{
            margin: "0.75rem 0",
            padding: "0.75rem",
            borderRadius: "6px",
            border: "1px solid var(--c-border-base)",
            background: "var(--c-bg-subtle)",
          }}
        >
          <label
            style={{
              display: "block",
              fontSize: "0.82rem",
              color: "var(--c-text-muted)",
              marginBottom: "0.4rem",
            }}
          >
            <i className="fas fa-edit" style={{ marginRight: "0.3rem" }}></i>
            Motivo della modifica rispetto al suggerimento AI (obbligatorio)
          </label>
          <textarea
            className="form-input"
            rows={2}
            placeholder="Es: Il documento riguarda una pratica SUAP già aperta…"
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
            style={{ resize: "vertical", width: "100%" }}
          />
        </div>
      )}

      {/* Errore locale */}
      {localError && (
        <p
          style={{
            color: "var(--c-danger, #dc2626)",
            fontSize: "0.82rem",
            margin: "0.5rem 0",
          }}
        >
          <i className="fas fa-exclamation-circle" style={{ marginRight: "0.3rem" }}></i>
          {localError}
        </p>
      )}

      <div className="step-footer">
        {!isFullscreen && (
          <button
            id="back-step-btn"
            className="button-secondary"
            onClick={onGoBack}
          >
            <i className="fas fa-arrow-left"></i>Messaggio & Allegati
          </button>
        )}
        <button
          id="protocol-btn"
          className={`button-success ${routingDecision.isError ? "button-danger" : ""}`}
          onClick={handleConfirm}
          disabled={routingDecision.isPending || decisionSuccess}
        >
          <i
            className={`fas ${
              decisionSuccess
                ? "fa-check"
                : routingDecision.isPending
                  ? "fa-spinner fa-spin"
                  : "fa-clipboard-check"
            }`}
          ></i>
          {decisionSuccess
            ? "✓ Email Protocollata"
            : routingDecision.isPending
              ? "Protocollazione in corso…"
              : "Conferma Protocollazione"}
          {routingDecision.isPending && <span className="loading-dots"></span>}
        </button>
      </div>
    </div>
  );
}

export default ProtocolTab;
