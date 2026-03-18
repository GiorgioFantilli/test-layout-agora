import React, { useState, useEffect } from 'react';
import { useSenderResolution, useSenderResolutionDecision } from '../../hooks/useEmails';

const STATUS_LABELS = {
  in_progress:   'Ricerca in corso',
  pref_found:    'Mittente registrato',
  candidates_0:  'Nessun candidato',
  candidates_1:  'Candidato trovato',
  candidates_n:  'Più candidati trovati',
  lookup_failed: 'Ricerca fallita',
};

/**
 * Modal per l'identificazione del mittente PEC tramite il servizio Protocol MW.
 *
 * Props:
 *   isOpen:    bool
 *   onClose:   () => void
 *   messageId: string | null
 */
function ContactModal({ isOpen, onClose, messageId }) {
  const [selectedCodice, setSelectedCodice] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // Hooks sempre sopra i return condizionali (regola React)
  const { data: resolution, isLoading } = useSenderResolution(messageId, {
    enabled: !!messageId && isOpen,
  });
  const { mutate: sendDecision, isPending } = useSenderResolutionDecision(messageId);

  // Reset stato interno ad ogni apertura / cambio messaggio
  useEffect(() => {
    if (!isOpen) return;
    setSelectedCodice(null);
    setManualCode('');
    setShowManualInput(false);
  }, [isOpen, messageId]);

  // Pre-seleziona il primo candidato quando arrivano i dati
  useEffect(() => {
    if (resolution?.candidates?.length > 0) {
      setSelectedCodice((prev) => prev ?? resolution.candidates[0].codice);
    }
  }, [resolution]);

  if (!isOpen) return null;

  const handleDecision = (body) => {
    sendDecision(body, { onSuccess: () => onClose() });
  };

  // ── Sezione corpo modale ────────────────────────────────────────────────────

  const renderManualInput = (canGoBack) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {canGoBack && (
        <button
          onClick={() => { setShowManualInput(false); setManualCode(''); }}
          className="link-button"
          style={{ alignSelf: 'flex-start', fontSize: '0.8rem' }}
        >
          <i className="fas fa-arrow-left" style={{ fontSize: '0.7rem' }}></i>
          Torna ai candidati
        </button>
      )}
      <div>
        <label style={{
          display: 'block', marginBottom: '0.3rem',
          fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.06em', color: 'var(--c-text-muted)',
        }}>
          Codice anagrafico
        </label>
        <input
          type="text"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          placeholder="es. SR_00123"
          autoFocus
          style={{
            width: '100%', boxSizing: 'border-box',
            fontSize: '0.85rem', padding: '0.45rem 0.75rem',
            border: '1px solid var(--c-border-base)', borderRadius: '6px',
            backgroundColor: 'var(--c-bg-base)', color: 'var(--c-text-base)',
            fontFamily: 'monospace',
          }}
        />
      </div>
    </div>
  );

  const renderBody = () => {
    // 1. Caricamento query
    if (isLoading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--c-text-subtle)', padding: '0.25rem 0' }}>
          <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '0.85rem', color: 'var(--c-primary)' }}></i>
          <span style={{ fontSize: '0.85rem' }}>Caricamento...</span>
        </div>
      );
    }

    // 2. Worker non ancora avviato (404 → null)
    if (!resolution) {
      return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', color: 'var(--c-text-subtle)', padding: '0.25rem 0' }}>
          <i className="fas fa-hourglass-half" style={{ fontSize: '0.85rem', marginTop: '0.1rem' }}></i>
          <span style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
            Il worker di ricerca anagrafica non ha ancora elaborato questo messaggio. Riprovare tra qualche istante.
          </span>
        </div>
      );
    }

    // 3. Elaborazione in corso
    if (resolution.status === 'in_progress') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--c-text-subtle)', padding: '0.25rem 0' }}>
          <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '0.85rem', color: 'var(--c-primary)' }}></i>
          <span style={{ fontSize: '0.85rem' }}>Ricerca anagrafica in corso...</span>
        </div>
      );
    }

    // 4. Preferenza già registrata
    if (resolution.status === 'pref_found') {
      if (showManualInput) return renderManualInput(true);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem', alignSelf: 'flex-start',
            fontSize: '0.72rem', fontWeight: 700, padding: '0.18rem 0.55rem',
            borderRadius: '999px', backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0',
          }}>
            <i className="fas fa-check" style={{ fontSize: '0.6rem' }}></i>
            Mittente già registrato in anagrafica
          </span>
          <div style={{ backgroundColor: 'var(--c-bg-offset-2)', borderRadius: '8px', padding: '0.7rem 1rem' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--c-text-base)' }}>
              {resolution.senderKey}
            </p>
          </div>
          <button
            onClick={() => setShowManualInput(true)}
            className="link-button"
            style={{ alignSelf: 'flex-start', fontSize: '0.8rem' }}
          >
            <i className="fas fa-pen" style={{ fontSize: '0.7rem' }}></i>
            Cambia preferenza
          </button>
        </div>
      );
    }

    // 5. Candidati (1 o N)
    if (resolution.status === 'candidates_1' || resolution.status === 'candidates_n') {
      if (showManualInput) return renderManualInput(true);
      const isSingle = resolution.status === 'candidates_1';
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--c-text-subtle)', lineHeight: '1.5' }}>
            {isSingle
              ? "Trovato 1 candidato nell'anagrafica. Confermare per salvare la preferenza."
              : `Trovati ${resolution.candidates.length} candidati. Selezionare il corrispondente.`}
          </p>
          <div className="radio-group">
            {resolution.candidates.map((c) => (
              <label key={c.codice} className="radio-label" style={{ cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="candidate"
                  value={c.codice}
                  checked={selectedCodice === c.codice}
                  onChange={() => setSelectedCodice(c.codice)}
                />
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>{c.descrizione}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)', fontFamily: 'monospace' }}>
                    {c.codice}{c.pec ? ` · ${c.pec}` : ''}
                  </span>
                </div>
              </label>
            ))}
          </div>
          <button
            onClick={() => setShowManualInput(true)}
            className="link-button"
            style={{ alignSelf: 'flex-start', fontSize: '0.8rem' }}
          >
            <i className="fas fa-keyboard" style={{ fontSize: '0.7rem' }}></i>
            Inserisci codice manualmente
          </button>
        </div>
      );
    }

    // 6. Nessun candidato
    if (resolution.status === 'candidates_0') {
      if (showManualInput) return renderManualInput(false);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--c-text-subtle)', lineHeight: '1.5' }}>
            Nessun candidato trovato nell'anagrafica per{' '}
            <span style={{ fontFamily: 'monospace' }}>{resolution.senderKey}</span>.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <button
              onClick={() => setShowManualInput(true)}
              className="button-secondary"
              style={{ justifyContent: 'flex-start', width: '100%' }}
            >
              <i className="fas fa-keyboard"></i>
              Inserisci codice manualmente
            </button>
            <button
              onClick={() => handleDecision({ action: 'create_new', sender_ref: null, new_descrizione: null, new_cf: null })}
              className="button-secondary"
              disabled={isPending}
              style={{ justifyContent: 'flex-start', width: '100%' }}
            >
              <i className="fas fa-plus-circle"></i>
              Crea nuova anagrafica (esternamente)
            </button>
            <button
              onClick={() => handleDecision({ action: 'defer', sender_ref: null, new_descrizione: null, new_cf: null })}
              className="link-button"
              disabled={isPending}
              style={{ fontSize: '0.8rem', marginTop: '0.1rem' }}
            >
              Rimanda — decidi più tardi
            </button>
          </div>
        </div>
      );
    }

    // 7. Lookup fallita
    if (resolution.status === 'lookup_failed') {
      if (showManualInput) return renderManualInput(false);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              fontSize: '0.72rem', fontWeight: 700, padding: '0.18rem 0.55rem',
              borderRadius: '999px', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5',
            }}>
              <i className="fas fa-triangle-exclamation" style={{ fontSize: '0.6rem' }}></i>
              Ricerca anagrafica fallita
            </span>
            {resolution.lastErrorCode && (
              <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--c-text-muted)' }}>
                {resolution.lastErrorCode}
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--c-text-subtle)', lineHeight: '1.5' }}>
            Impossibile contattare il sistema anagrafico. Procedere manualmente o rimandare.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <button
              onClick={() => setShowManualInput(true)}
              className="button-secondary"
              style={{ justifyContent: 'flex-start', width: '100%' }}
            >
              <i className="fas fa-keyboard"></i>
              Inserisci codice manualmente
            </button>
            <button
              onClick={() => handleDecision({ action: 'defer', sender_ref: null, new_descrizione: null, new_cf: null })}
              className="link-button"
              disabled={isPending}
              style={{ fontSize: '0.8rem', marginTop: '0.1rem' }}
            >
              Rimanda — decidi più tardi
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  // ── Footer con azioni primarie ──────────────────────────────────────────────

  const renderFooter = () => {
    // Stato di input manuale: Annulla + Conferma (disabilitato se campo vuoto)
    if (showManualInput) {
      return (
        <div className="modal-footer-actions">
          <button className="button-secondary" onClick={onClose} disabled={isPending}>
            Annulla
          </button>
          <button
            className="button-primary"
            disabled={!manualCode.trim() || isPending}
            onClick={() => handleDecision({
              action: 'manual_code',
              sender_ref: manualCode.trim(),
              new_descrizione: null,
              new_cf: null,
            })}
          >
            {isPending
              ? <><i className="fas fa-circle-notch fa-spin"></i> Salvo…</>
              : 'Conferma'}
          </button>
        </div>
      );
    }

    // Candidati 1/N: Annulla + Conferma selezione
    if (resolution?.status === 'candidates_1' || resolution?.status === 'candidates_n') {
      return (
        <div className="modal-footer-actions">
          <button className="button-secondary" onClick={onClose} disabled={isPending}>
            Annulla
          </button>
          <button
            className="button-primary"
            disabled={!selectedCodice || isPending}
            onClick={() => handleDecision({
              action: 'select_existing',
              sender_ref: selectedCodice,
              new_descrizione: null,
              new_cf: null,
            })}
          >
            {isPending
              ? <><i className="fas fa-circle-notch fa-spin"></i> Salvo…</>
              : 'Conferma'}
          </button>
        </div>
      );
    }

    // Preferenza trovata (non in showManualInput): solo OK
    if (resolution?.status === 'pref_found') {
      return (
        <div className="modal-footer-actions">
          <button className="button-primary" onClick={onClose}>OK</button>
        </div>
      );
    }

    // Tutti gli altri stati (loading, null, in_progress, candidates_0, lookup_failed): solo Chiudi
    return (
      <div className="modal-footer-actions">
        <button className="button-secondary" onClick={onClose}>Chiudi</button>
      </div>
    );
  };

  // ── Label di stato per il sottotitolo header ────────────────────────────────

  const statusLabel = isLoading
    ? 'Caricamento…'
    : resolution
      ? (STATUS_LABELS[resolution.status] || resolution.status)
      : 'Non ancora elaborato';

  return (
    <div id="contact-modal" className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h3 style={{ margin: 0 }}>Identifica Mittente</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--c-text-muted)' }}>{statusLabel}</span>
          </div>
          <button onClick={onClose} className="modal-close-button">
            <svg viewBox="0 0 24 24">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {renderBody()}
        </div>

        <div className="modal-footer">
          {renderFooter()}
        </div>
      </div>
    </div>
  );
}

export default ContactModal;
