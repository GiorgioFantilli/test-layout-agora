import React from 'react';
import { useDocumentUnits, useSubjectContext, useRoutingSuggestion } from '../../hooks/useEmails';

const PHASES = [
  { label: 'Ricezione', title: 'Ricezione PEC', icon: 'fa-inbox', sectionId: null },
  { label: 'Parsing', title: 'Parsing strutturale', icon: 'fa-code', sectionId: null },
  { label: 'Estrazione', title: 'Estrazione documenti', icon: 'fa-file-export', sectionId: 'attachments-section' },
  { label: 'Analisi AI', title: 'Analisi AI', icon: 'fa-brain', sectionId: 'ai-intelligence-section' },
  { label: 'Ufficio', title: 'Suggerimento ufficio', icon: 'fa-building', sectionId: null },
];

const STATUS_STYLES = {
  done: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
  warning: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
  error: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' },
  in_progress: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  waiting: { bg: 'var(--c-bg-offset-2)', text: 'var(--c-text-subtle)', border: 'var(--c-border-base)' },
};

const STATUS_ICON = {
  done: 'fa-check',
  warning: 'fa-exclamation-triangle',
  error: 'fa-times',
  in_progress: 'fa-circle-notch fa-spin',
  waiting: 'fa-circle',
};

const INGEST_DONE = ['READY_TO_PARSE', 'DELETED_FROM_SERVER'];
const INGEST_ERROR = ['QUARANTINED', 'FAILED_FETCH', 'FAILED_STORAGE', 'FAILED_DB', 'FAILED_DELETE'];
// parse_status reali: NULL | IN_PROGRESS | PARSED | RETRYING | QUARANTINED
const PARSE_DONE = ['PARSED'];
const PARSE_ERROR = ['QUARANTINED'];
const PARSE_IN_PROGRESS = ['IN_PROGRESS', 'RETRYING'];

function computePhaseStatuses(message, documentUnits, subjectContext, routingSuggestion) {
  let p1 = 'waiting';
  if (message?.ingestStatus) {
    if (INGEST_DONE.includes(message.ingestStatus)) p1 = 'done';
    else if (INGEST_ERROR.includes(message.ingestStatus)) p1 = 'error';
    else p1 = 'in_progress';
  }

  let p2 = 'waiting';
  if (p1 === 'done') {
    const ps = message?.parseStatus;
    if (PARSE_DONE.includes(ps)) p2 = 'done';
    else if (PARSE_ERROR.includes(ps)) p2 = 'error';
    else if (PARSE_IN_PROGRESS.includes(ps)) p2 = 'in_progress';
  }

  // Phase 3: Estrazione (document_units)
  // document_unit.status reali: AVAILABLE | SUPERSEDED | HIDDEN  (nessun FAILED)
  // Fallback: se il SCB ha già dati, il backend ha già finalizzato l'estrazione.
  let p3 = 'waiting';
  if (p2 === 'done') {
    const units = documentUnits || [];
    const hasAvailable = units.some((du) => du.status === 'AVAILABLE');
    const aiCompleted = subjectContext?.status === 'completed' || subjectContext?.status === 'manual_review';
    if (hasAvailable || aiCompleted) {
      p3 = 'done';
    } else if (units.length > 0) {
      // Unità presenti ma nessuna AVAILABLE (es. tutte SUPERSEDED/HIDDEN) → warning
      p3 = 'warning';
    } else {
      p3 = 'in_progress';
    }
  }

  let p4 = 'waiting';
  if (subjectContext) {
    const s = subjectContext.status;
    if (s === 'completed') p4 = 'done';
    else if (s === 'manual_review') p4 = 'warning';
    else if (s === 'pending') p4 = 'in_progress';
  }

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
 * Strip orizzontale con le 5 fasi della pipeline, posizionata a livello del pannello
 * (EmailDetailsPanel), persistente tra i tab.
 *
 * Props:
 *   message    — oggetto email (ingestStatus, parseStatus)
 *   messageId  — ID del messaggio — usato internamente per i hook
 */
function PipelineStatusBar({ message, messageId }) {
  const { data: documentUnits = [], isLoading: isLoadingUnits } = useDocumentUnits(messageId);
  const { data: subjectContext, isLoading: isLoadingContext } = useSubjectContext(messageId);
  const { data: routingSuggestion, isLoading: isLoadingSuggestion } = useRoutingSuggestion(messageId);

  // Skeleton finché i tre hook non hanno completato il primo fetch
  const isReady = !isLoadingUnits && !isLoadingContext && !isLoadingSuggestion;

  const statuses = computePhaseStatuses(message, documentUnits, subjectContext, routingSuggestion);
  const availableDocs = documentUnits.filter((du) => du.status === 'AVAILABLE').length;

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.15rem',
    padding: '0.45rem 1rem',
    borderBottom: '1px solid var(--c-border-base)',
    backgroundColor: 'var(--c-bg-base)',
    overflowX: 'auto',
    flexShrink: 0,
  };

  if (!isReady) {
    return (
      <div style={containerStyle}>
        {PHASES.map((_, idx) => (
          <React.Fragment key={idx}>
            <div style={{
              width: idx === 0 ? '4.5rem' : idx === 1 ? '3.5rem' : idx === 2 ? '4.5rem' : idx === 3 ? '4.5rem' : '3.5rem',
              height: '1.4rem',
              borderRadius: '999px',
              backgroundColor: 'var(--c-bg-offset-2)',
              opacity: 0.6,
              animation: `pipelinePulse 1.2s ease-in-out ${idx * 0.12}s infinite`,
              flexShrink: 0,
            }} />
            {idx < PHASES.length - 1 && (
              <i className="fas fa-chevron-right" style={{ fontSize: '0.48rem', color: 'var(--c-text-subtle)', opacity: 0.3, margin: '0 0.15rem', flexShrink: 0 }} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div style={{ ...containerStyle, animation: 'contentFadeIn 0.3s ease-out' }}>
      {PHASES.map((phase, idx) => {
        const status = statuses[idx];
        const styles = STATUS_STYLES[status];
        const iconClass = STATUS_ICON[status];
        const isActive = status === 'in_progress';
        const isClickable = !!phase.sectionId;
        const showDocBadge = idx === 2 && status === 'done' && availableDocs > 0;

        return (
          <React.Fragment key={idx}>
            <button
              onClick={() => isClickable && scrollToSection(phase.sectionId)}
              title={phase.title}
              className={isActive ? 'pipeline-step-active' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.22rem 0.6rem',
                borderRadius: '999px',
                border: `1px solid ${styles.border}`,
                backgroundColor: styles.bg,
                color: styles.text,
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: isClickable ? 'pointer' : 'default',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                outline: 'none',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => { if (isClickable) e.currentTarget.style.opacity = '0.75'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              <i className={`fas ${iconClass}`} style={{ fontSize: '0.6rem' }}></i>
              <span>{phase.label}</span>

              {showDocBadge && (
                <span style={{
                  marginLeft: '0.1rem',
                  backgroundColor: '#15803d',
                  color: '#fff',
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  padding: '0.05rem 0.28rem',
                  borderRadius: '999px',
                }}>
                  {availableDocs} doc
                </span>
              )}
            </button>

            {idx < PHASES.length - 1 && (
              <i
                className="fas fa-chevron-right"
                style={{
                  fontSize: '0.48rem',
                  color: 'var(--c-text-subtle)',
                  opacity: 0.4,
                  margin: '0 0.15rem',
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
