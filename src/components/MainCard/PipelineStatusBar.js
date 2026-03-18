import React from 'react';

const PHASES = [
  { label: 'Ricezione', title: 'Ricezione PEC', icon: 'fa-inbox', sectionId: null },
  { label: 'Parsing', title: 'Parsing strutturale', icon: 'fa-code', sectionId: null },
  { label: 'Estrazione', title: 'Estrazione documenti', icon: 'fa-file-export', sectionId: 'attachments-section' },
  { label: 'Analisi AI', title: 'Analisi AI', icon: 'fa-brain', sectionId: 'ai-intelligence-section' },
  { label: 'Ufficio', title: 'Suggerimento ufficio', icon: 'fa-building', sectionId: null },
];

const STATUS_STYLES = {
  done:        { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
  warning:     { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
  error:       { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' },
  in_progress: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  waiting:     { bg: 'var(--c-bg-offset-2)', text: 'var(--c-text-subtle)', border: 'var(--c-border-base)' },
};

const STATUS_ICON = {
  done:        'fa-check',
  warning:     'fa-exclamation-triangle',
  error:       'fa-times',
  in_progress: 'fa-circle-notch fa-spin',
  waiting:     'fa-circle',
};

const INGEST_DONE  = ['READY_TO_PARSE', 'DELETED_FROM_SERVER'];
const INGEST_ERROR = ['QUARANTINED', 'FAILED_FETCH', 'FAILED_STORAGE', 'FAILED_DB', 'FAILED_DELETE'];

function computePhaseStatuses(message, documentUnits, subjectContext, routingSuggestion) {
  // Phase 1 — Ricezione PEC
  let p1 = 'waiting';
  if (message?.ingestStatus) {
    if (INGEST_DONE.includes(message.ingestStatus)) p1 = 'done';
    else if (INGEST_ERROR.includes(message.ingestStatus)) p1 = 'error';
    else p1 = 'in_progress';
  }

  // Phase 2 — Parsing strutturale
  let p2 = 'waiting';
  if (p1 === 'done') {
    const ps = message?.parseStatus;
    if (ps === 'IN_PROGRESS') p2 = 'in_progress';
    else if (ps === 'FAILED') p2 = 'error';
    else if (ps === 'PARSED' || ps === 'ANALYZED') p2 = 'done';
    else p2 = 'waiting'; // PENDING or missing
  }

  // Phase 3 — Estrazione documenti
  let p3 = 'waiting';
  if (p2 === 'done') {
    const units = documentUnits || [];
    if (units.length === 0) {
      p3 = 'in_progress';
    } else if (units.some((du) => du.status === 'AVAILABLE')) {
      p3 = 'done';
    } else if (units.every((du) => du.status === 'FAILED')) {
      p3 = 'error';
    } else {
      p3 = 'in_progress';
    }
  }

  // Phase 4 — Analisi AI
  let p4 = 'waiting';
  if (subjectContext) {
    const s = subjectContext.status;
    if (s === 'completed') p4 = 'done';
    else if (s === 'manual_review') p4 = 'warning';
    else if (s === 'pending' || s === 'queued') p4 = 'in_progress';
  }

  // Phase 5 — Suggerimento ufficio
  let p5 = 'waiting';
  if (routingSuggestion) {
    const s = routingSuggestion.status;
    if (s === 'completed') p5 = 'done';
    else if (s === 'manual_review') p5 = 'warning';
    else if (s === 'queued' || s === 'in_progress') p5 = 'in_progress';
  }

  return [p1, p2, p3, p4, p5];
}

function scrollToSection(sectionId) {
  if (!sectionId) return;
  const el = document.getElementById(sectionId);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Barra orizzontale con le 5 fasi della pipeline, ciascuna con il proprio stato.
 *
 * Props:
 *   message           — oggetto email (ingestStatus, parseStatus)
 *   documentUnits     — array di document units
 *   subjectContext    — risultato di useSubjectContext (null se 404)
 *   routingSuggestion — risultato di useRoutingSuggestion (null se 404)
 *   isFullscreen      — bool — se true mostra label testo, altrimenti solo icona
 */
function PipelineStatusBar({ message, documentUnits, subjectContext, routingSuggestion, isFullscreen }) {
  const statuses = computePhaseStatuses(message, documentUnits, subjectContext, routingSuggestion);
  const availableDocs = (documentUnits || []).filter((du) => du.status === 'AVAILABLE').length;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.2rem',
        padding: '0.6rem 0.75rem',
        backgroundColor: 'var(--c-bg-offset)',
        borderRadius: '8px',
        border: '1px solid var(--c-border-base)',
        marginBottom: '1.25rem',
        overflowX: 'auto',
      }}
    >
      {PHASES.map((phase, idx) => {
        const status = statuses[idx];
        const styles = STATUS_STYLES[status];
        const iconClass = STATUS_ICON[status];
        const isClickable = !!phase.sectionId;

        // Badge doc count for phase 3 (idx === 2)
        const showDocBadge = idx === 2 && statuses[2] === 'done' && availableDocs > 0;

        return (
          <React.Fragment key={idx}>
            {/* Phase pill */}
            <button
              onClick={() => isClickable && scrollToSection(phase.sectionId)}
              title={phase.title}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isFullscreen ? '0.35rem' : '0',
                padding: isFullscreen ? '0.3rem 0.65rem' : '0.3rem 0.5rem',
                borderRadius: '999px',
                border: `1px solid ${styles.border}`,
                backgroundColor: styles.bg,
                color: styles.text,
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: isClickable ? 'pointer' : 'default',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'opacity 0.15s',
                outline: 'none',
              }}
              onMouseEnter={(e) => { if (isClickable) e.currentTarget.style.opacity = '0.8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              <i
                className={`fas ${iconClass}`}
                style={{ fontSize: isFullscreen ? '0.62rem' : '0.68rem' }}
              ></i>

              {isFullscreen && (
                <span>{phase.label}</span>
              )}

              {/* Doc count badge (phase 3 only) */}
              {showDocBadge && (
                <span
                  style={{
                    marginLeft: isFullscreen ? '0.2rem' : '0.25rem',
                    backgroundColor: '#15803d',
                    color: '#fff',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    padding: '0.05rem 0.3rem',
                    borderRadius: '999px',
                  }}
                >
                  {availableDocs} doc
                </span>
              )}

              {/* Phase number in compact mode */}
              {!isFullscreen && (
                <span style={{ fontSize: '0.58rem', marginLeft: '0.2rem', opacity: 0.75 }}>
                  {idx + 1}
                </span>
              )}
            </button>

            {/* Separator arrow (except after last) */}
            {idx < PHASES.length - 1 && (
              <i
                className="fas fa-chevron-right"
                style={{
                  fontSize: '0.55rem',
                  color: 'var(--c-text-subtle)',
                  opacity: 0.5,
                  flexShrink: 0,
                }}
              ></i>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default PipelineStatusBar;
