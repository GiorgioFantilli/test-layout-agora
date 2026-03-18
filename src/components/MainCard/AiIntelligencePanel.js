import React, { useState, useEffect } from 'react';
import { useUpdateSubjectDraft } from '../../hooks/useEmails';

const confidenceStyle = (confidence) => {
  if (confidence >= 0.8) return { bg: '#dcfce7', text: '#15803d' };
  if (confidence >= 0.6) return { bg: '#fef3c7', text: '#b45309' };
  return { bg: '#fee2e2', text: '#b91c1c' };
};

const FAILURE_LABELS = {
  LLM_TIMEOUT: 'Timeout modello AI',
  LLM_SCHEMA_VALIDATION_ERROR: 'Errore di validazione risposta AI',
  LLM_UNAVAILABLE: 'Modello AI non disponibile',
};

const FAILURE_HINTS = {
  LLM_UNAVAILABLE: 'Il servizio AI è temporaneamente offline. L\'oggetto potrà essere generato automaticamente quando il servizio sarà ripristinato.',
  LLM_TIMEOUT: 'Il documento era troppo complesso per l\'elaborazione automatica. Verificare manualmente il contenuto degli allegati.',
  LLM_SCHEMA_VALIDATION_ERROR: 'Anomalia nel formato della risposta AI. Contattare il supporto tecnico se il problema persiste.',
};

/**
 * Mostra i risultati di analisi prodotti da subject_context_builder.
 *
 * Props:
 *   aiResults:               null | { status, subjectDraft, confidence, documentsUsed, modelUsed, failureMode, manuallyRevised }
 *   isLoading:               bool
 *   hasPendingDocumentUnits: bool — true se la pipeline ha già prodotto document_units (SCB è in coda)
 *   messageId:               string | number — richiesto per la mutation di override manuale
 */
function AiIntelligencePanel({ aiResults, isLoading, hasPendingDocumentUnits, messageId }) {
  const [draftValue, setDraftValue] = useState('');
  const [saveError, setSaveError] = useState(null);

  const { mutate: updateSubjectDraft, isPending: isSaving } = useUpdateSubjectDraft(messageId);

  // Sync input with AI draft when results arrive or change
  useEffect(() => {
    if (aiResults?.subjectDraft) {
      setDraftValue(aiResults.subjectDraft);
    }
  }, [aiResults?.subjectDraft]);

  const handleSave = () => {
    const trimmed = draftValue.trim();
    if (!trimmed) return;
    setSaveError(null);
    updateSubjectDraft(trimmed, {
      onError: (err) => setSaveError(err.message || 'Errore durante il salvataggio'),
    });
  };

  const renderContent = () => {
    // 1. Loading
    if (isLoading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 0.9rem', color: 'var(--c-text-subtle)' }}>
          <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '0.75rem' }}></i>
          <span style={{ fontSize: '0.82rem' }}>Caricamento analisi AI…</span>
        </div>
      );
    }

    // 2. Not found (SCB 404) — distinguere tra "in coda" e "non avviata"
    if (!aiResults) {
      if (hasPendingDocumentUnits) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 0.9rem', color: 'var(--c-text-subtle)' }}>
            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '0.75rem', color: 'var(--c-primary)' }}></i>
            <span style={{ fontSize: '0.82rem' }}>Analisi AI in coda — documenti in elaborazione…</span>
          </div>
        );
      }
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 0.9rem', color: 'var(--c-text-subtle)' }}>
          <i className="fas fa-hourglass-half" style={{ fontSize: '0.75rem' }}></i>
          <span style={{ fontSize: '0.82rem' }}>In attesa del completamento della pipeline di analisi.</span>
        </div>
      );
    }

    // 3. Pending — generazione in corso
    if (aiResults.status === 'pending') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 0.9rem', color: 'var(--c-text-subtle)' }}>
          <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '0.75rem', color: 'var(--c-primary)' }}></i>
          <span style={{ fontSize: '0.82rem' }}>Analisi AI in elaborazione…</span>
        </div>
      );
    }

    // 4. Manual review — fallita
    if (aiResults.status === 'manual_review') {
      const failureLabel = FAILURE_LABELS[aiResults.failureMode] || aiResults.failureMode || 'Errore sconosciuto';
      const hint = FAILURE_HINTS[aiResults.failureMode];
      return (
        <div style={{ padding: '0.8rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

          {/* Badge failure prominente */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              fontSize: '0.72rem', fontWeight: 700,
              padding: '0.22rem 0.65rem', borderRadius: '999px',
              backgroundColor: '#fef3c7', color: '#92400e',
              border: '1px solid #fcd34d',
            }}>
              <i className="fas fa-triangle-exclamation" style={{ fontSize: '0.6rem' }}></i>
              Revisione manuale richiesta
            </span>
            <span style={{
              fontSize: '0.7rem', padding: '0.22rem 0.65rem',
              backgroundColor: '#fff7ed', color: '#92400e',
              border: '1px solid #fed7aa',
              borderRadius: '999px', fontFamily: 'monospace',
            }}>
              {failureLabel}
            </span>
          </div>

          {/* Hint contestuale per failure mode */}
          {hint && (
            <p style={{ fontSize: '0.78rem', color: 'var(--c-text-subtle)', margin: 0, lineHeight: '1.55' }}>
              {hint}
            </p>
          )}

          {/* Campo oggetto manuale */}
          <div>
            <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.3rem' }}>
              Imposta oggetto manualmente
            </label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                value={draftValue}
                onChange={(e) => setDraftValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                maxLength={250}
                placeholder="Inserisci l'oggetto del protocollo…"
                disabled={isSaving}
                style={{
                  flex: 1, boxSizing: 'border-box',
                  fontSize: '0.82rem', padding: '0.42rem 0.75rem',
                  border: '1px solid var(--c-border-base)',
                  borderRadius: '6px',
                  backgroundColor: 'var(--c-bg-base)',
                  color: 'var(--c-text-base)',
                  opacity: isSaving ? 0.7 : 1,
                }}
              />
              <button
                onClick={handleSave}
                disabled={isSaving || !draftValue.trim()}
                style={{
                  fontSize: '0.78rem', fontWeight: 600,
                  padding: '0.42rem 0.9rem', borderRadius: '6px',
                  border: '1px solid var(--c-primary)',
                  backgroundColor: 'var(--c-primary)', color: '#fff',
                  cursor: (isSaving || !draftValue.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (isSaving || !draftValue.trim()) ? 0.6 : 1,
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  flexShrink: 0,
                }}
              >
                <i className={`fas ${isSaving ? 'fa-circle-notch fa-spin' : 'fa-check'}`} style={{ fontSize: '0.65rem' }}></i>
                {isSaving ? 'Salvo…' : 'Salva'}
              </button>
            </div>
            {saveError && (
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.72rem', color: '#b91c1c' }}>
                <i className="fas fa-times-circle" style={{ marginRight: '0.25rem' }}></i>
                {saveError}
              </p>
            )}
            {aiResults.manuallyRevised && !saveError && (
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.72rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <i className="fas fa-check-circle"></i>
                Oggetto revisionato dall'operatore
              </p>
            )}
          </div>

        </div>
      );
    }

    // 5. Completed — dati disponibili
    const conf = aiResults.confidence;
    const confStyle = conf != null ? confidenceStyle(conf) : null;

    return (
      <div style={{ padding: '0.8rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>

        {aiResults.subjectDraft && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--c-text-subtle)', width: '72px', flexShrink: 0, paddingTop: '0.1rem' }}>
              Oggetto
            </span>
            <p style={{ fontSize: '0.85rem', color: 'var(--c-text-base)', lineHeight: '1.5', margin: 0, fontWeight: 500 }}>
              {aiResults.subjectDraft}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {confStyle && (
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.15rem 0.55rem',
              borderRadius: '999px',
              backgroundColor: confStyle.bg,
              color: confStyle.text,
            }}>
              {Math.round(conf * 100)}% confidenza
            </span>
          )}
          {aiResults.documentsUsed != null && (
            <span style={{
              fontSize: '0.72rem',
              padding: '0.15rem 0.55rem',
              borderRadius: '999px',
              backgroundColor: 'var(--c-bg-offset-2)',
              color: 'var(--c-text-muted)',
            }}>
              {aiResults.documentsUsed} {aiResults.documentsUsed === 1 ? 'documento analizzato' : 'documenti analizzati'}
            </span>
          )}
          {aiResults.manuallyRevised && (
            <span style={{
              fontSize: '0.72rem', fontWeight: 600,
              padding: '0.15rem 0.55rem', borderRadius: '999px',
              backgroundColor: '#f0fdf4', color: '#15803d',
              border: '1px solid #bbf7d0',
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            }}>
              <i className="fas fa-user-pen" style={{ fontSize: '0.6rem' }}></i>
              Revisionato manualmente
            </span>
          )}
        </div>

      </div>
    );
  };

  const hasContent = aiResults?.status === 'completed' || aiResults?.status === 'manual_review' || aiResults?.status === 'pending';

  return (
    <div style={{
      border: '1px solid var(--c-ai-border-light)',
      borderRadius: '20px',
      overflow: 'hidden',
      marginBottom: '1.75rem',
      backgroundColor: 'var(--c-bg-offset)',
    }}>
      {/* Header banda AI */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.55rem 1.0rem',
        background: 'linear-gradient(135deg, var(--c-ai-bg) 0%, var(--c-ai-bg-to) 100%)',
        borderBottom: hasContent ? '1px solid var(--c-ai-border-light)' : 'none',
      }}>
        <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: '0.75rem', color: 'var(--c-ai-gradient-end)' }}></i>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          background: 'linear-gradient(135deg, var(--c-ai-gradient-start) 0%, var(--c-ai-gradient-end) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Proposta di protocollazione
        </span>
      </div>

      {renderContent()}
    </div>
  );
}

export default AiIntelligencePanel;
