import React from 'react';

const URGENCY_STYLES = {
  alta: { bg: '#fee2e2', text: '#b91c1c', label: 'Alta' },
  media: { bg: '#fef3c7', text: '#b45309', label: 'Media' },
  bassa: { bg: '#dcfce7', text: '#15803d', label: 'Bassa' },
};

/**
 * Mostra i risultati di analisi prodotti da subject_context_builder.
 *
 * Props:
 *   aiResults: null | { summary, classification, urgency }
 *     - null  → pipeline non ancora completata (stato placeholder)
 *     - {...} → dati disponibili (stato popolato)
 */
function AiIntelligencePanel({ aiResults }) {
  const urgencyStyle = aiResults?.urgency ? URGENCY_STYLES[aiResults.urgency.toLowerCase()] : null;

  return (
    <div style={{
      border: '1px solid var(--c-border-base)',
      borderRadius: '20px',
      overflow: 'hidden',
      marginBottom: '1.75rem',
    }}>

      {/* Header banda AI */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.55rem 1.0rem',
        backgroundColor: 'var(--c-bg-offset-2)',
        borderBottom: aiResults ? '1px solid var(--c-border-base)' : 'none',
      }}>
        <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: '0.75rem', color: 'var(--c-primary)' }}></i>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--c-text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Analisi AI
        </span>
        {urgencyStyle && (
          <span style={{
            marginLeft: 'auto',
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '0.15rem 0.55rem',
            borderRadius: '999px',
            backgroundColor: urgencyStyle.bg,
            color: urgencyStyle.text,
          }}>
            Urgenza {urgencyStyle.label}
          </span>
        )}
      </div>

      {/* Contenuto */}
      {!aiResults ? (
        // Stato placeholder: pipeline non completata
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.7rem 1.0rem',
          color: 'var(--c-text-subtle)',
        }}>
          <i className="fas fa-hourglass-half" style={{ fontSize: '0.75rem' }}></i>
          <span style={{ fontSize: '0.82rem' }}>
            In attesa del completamento della pipeline di analisi.
          </span>
        </div>
      ) : (
        // Stato popolato: dati da subject_context_builder disponibili
        <div style={{ padding: '0.8rem 1.0rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

          {aiResults.classification && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--c-text-subtle)', width: '72px', flexShrink: 0, paddingTop: '0.1rem' }}>
                Tipologia
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--c-text-base)' }}>
                {aiResults.classification}
              </span>
            </div>
          )}

          {aiResults.summary && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--c-text-subtle)', width: '72px', flexShrink: 0, paddingTop: '0.1rem' }}>
                Sintesi
              </span>
              <p style={{ fontSize: '0.85rem', color: 'var(--c-text-base)', lineHeight: '1.6', margin: 0 }}>
                {aiResults.summary}
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default AiIntelligencePanel;
