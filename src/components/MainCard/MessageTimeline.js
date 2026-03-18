import React, { useState } from "react";
import { useMessageEvents } from "../../hooks/useEmails";
import { formatEmailDateTime } from "../../utils/dateUtils";

// ── Event configuration ─────────────────────────────────────────────────────
const EVENT_CONFIG = {
  DISCOVERED:          { label: "Messaggio scoperto",       icon: "fa-satellite-dish",       color: "#3b82f6", bg: "#eff6ff",  border: "#bfdbfe" },
  FETCHED:             { label: "Scaricato dal server",     icon: "fa-download",              color: "#0891b2", bg: "#ecfeff",  border: "#a5f3fc" },
  STORED_EML:          { label: "File EML salvato",         icon: "fa-file-archive",          color: "#6366f1", bg: "#eef2ff",  border: "#c7d2fe" },
  DB_RECORDED:         { label: "Registrato nel database",  icon: "fa-database",              color: "#7c3aed", bg: "#f5f3ff",  border: "#ddd6fe" },
  ATTACHMENTS_STORED:  { label: "Allegati salvati",         icon: "fa-paperclip",             color: "#0284c7", bg: "#f0f9ff",  border: "#bae6fd" },
  READY_TO_PARSE:      { label: "Pronto per il parsing",    icon: "fa-check-circle",          color: "#16a34a", bg: "#f0fdf4",  border: "#bbf7d0" },
  DELETED_FROM_SERVER: { label: "Eliminato dal server",     icon: "fa-trash-alt",             color: "#9ca3af", bg: "#f9fafb",  border: "#e5e7eb" },
  PARSE_STARTED:       { label: "Parsing avviato",          icon: "fa-cog",                   color: "#7c3aed", bg: "#f5f3ff",  border: "#ddd6fe" },
  PARSED:              { label: "Parsing completato",       icon: "fa-file-alt",              color: "#16a34a", bg: "#f0fdf4",  border: "#bbf7d0" },
  ANALYZED:            { label: "Analisi AI completata",    icon: "fa-brain",                 color: "#7c3aed", bg: "#f5f3ff",  border: "#ddd6fe" },
  FAILED_FETCH:        { label: "Errore di scaricamento",   icon: "fa-exclamation-triangle",  color: "#dc2626", bg: "#fff1f2",  border: "#fecdd3" },
  FAILED_STORAGE:      { label: "Errore di salvataggio",    icon: "fa-times-circle",          color: "#dc2626", bg: "#fff1f2",  border: "#fecdd3" },
  FAILED_DB:           { label: "Errore database",          icon: "fa-times-circle",          color: "#dc2626", bg: "#fff1f2",  border: "#fecdd3" },
  FAILED_DELETE:       { label: "Errore eliminazione",      icon: "fa-exclamation-circle",    color: "#d97706", bg: "#fffbeb",  border: "#fde68a" },
  QUARANTINED:         { label: "In quarantena",            icon: "fa-shield-alt",            color: "#dc2626", bg: "#fff1f2",  border: "#fecdd3" },
};

const DEFAULT_CONFIG = {
  label: null,
  icon: "fa-circle",
  color: "#6b7280",
  bg: "#f9fafb",
  border: "#e5e7eb",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatRelativeTime(ts) {
  const diffMs = Date.now() - new Date(ts).getTime();
  const s = Math.floor(diffMs / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (s < 60) return "pochi secondi fa";
  if (m < 60) return `${m} min fa`;
  if (h < 24) return `${h}h fa`;
  if (d === 1) return "ieri";
  return `${d} giorni fa`;
}

function isErrorEvent(eventType) {
  return eventType.startsWith("FAILED_") || eventType === "QUARANTINED";
}

// ── Single timeline event ─────────────────────────────────────────────────
function TimelineItem({ event, index, isLast }) {
  const [showDetails, setShowDetails] = useState(false);
  const cfg = EVENT_CONFIG[event.event_type] ?? DEFAULT_CONFIG;
  const label = cfg.label ?? event.event_type;
  const isError = isErrorEvent(event.event_type);
  const hasDetails = event.details && Object.keys(event.details).length > 0;

  return (
    <div
      className="timeline-item"
      style={{ display: "flex", gap: "0.75rem", animationDelay: `${index * 0.055}s` }}
    >
      {/* ── Left column: node + connector ── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "1.875rem", flexShrink: 0 }}>
        {/* Node */}
        <div
          style={{
            width: "1.875rem",
            height: "1.875rem",
            borderRadius: "50%",
            background: cfg.bg,
            border: `1.5px solid ${cfg.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            position: "relative",
            zIndex: 1,
            boxShadow: isError ? `0 0 0 3px ${cfg.bg}` : "none",
            transition: "transform 0.15s ease",
          }}
        >
          <i className={`fas ${cfg.icon}`} style={{ fontSize: "0.65rem", color: cfg.color }} />
        </div>

        {/* Connector line */}
        {!isLast && (
          <div
            style={{
              width: "1.5px",
              flex: 1,
              minHeight: "1.25rem",
              background: `linear-gradient(to bottom, ${cfg.border}, var(--c-border-base))`,
              marginTop: "3px",
            }}
          />
        )}
      </div>

      {/* ── Right column: event content ── */}
      <div style={{ flex: 1, paddingBottom: isLast ? "0.25rem" : "1.1rem", minWidth: 0 }}>
        {/* Label row + timestamp */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.5rem" }}>
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: isError ? 600 : 500,
              color: isError ? cfg.color : "var(--c-text-base)",
              lineHeight: 1.4,
              letterSpacing: isError ? "0.01em" : "normal",
            }}
          >
            {isError && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  borderRadius: "0.3rem",
                  padding: "0.05rem 0.35rem",
                  fontSize: "0.72rem",
                  marginRight: "0.35rem",
                  color: cfg.color,
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                }}
              >
                <i className="fas fa-exclamation" style={{ fontSize: "0.6rem" }} />
                ERRORE
              </span>
            )}
            {label}
          </span>

          <span
            title={formatEmailDateTime(event.ts)}
            style={{
              fontSize: "0.68rem",
              color: "var(--c-text-subtle)",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {formatRelativeTime(event.ts)}
          </span>
        </div>

        {/* Absolute timestamp */}
        <div style={{ fontSize: "0.68rem", color: "var(--c-text-subtle)", marginTop: "0.1rem" }}>
          {formatEmailDateTime(event.ts)}
        </div>

        {/* Poll run ID (when present) */}
        {event.poll_run_id && (
          <div
            style={{
              marginTop: "0.25rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              fontSize: "0.65rem",
              color: "var(--c-text-subtle)",
              background: "var(--c-bg-offset-2)",
              border: "1px solid var(--c-border-base)",
              borderRadius: "0.25rem",
              padding: "0.1rem 0.4rem",
              fontFamily: "monospace",
              letterSpacing: "0.01em",
            }}
          >
            <i className="fas fa-sync-alt" style={{ fontSize: "0.55rem" }} />
            {event.poll_run_id.slice(0, 8)}…
          </div>
        )}

        {/* Details toggle */}
        {hasDetails && (
          <div style={{ marginTop: "0.4rem" }}>
            <button
              onClick={() => setShowDetails((v) => !v)}
              style={{
                fontSize: "0.68rem",
                color: "var(--c-primary)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <i
                className={`fas fa-chevron-${showDetails ? "up" : "down"}`}
                style={{ fontSize: "0.5rem" }}
              />
              {showDetails ? "Nascondi dettagli" : "Dettagli tecnici"}
            </button>

            {showDetails && (
              <pre
                style={{
                  marginTop: "0.35rem",
                  padding: "0.5rem 0.65rem",
                  background: "var(--c-bg-offset-2)",
                  border: "1px solid var(--c-border-base)",
                  borderRadius: "0.375rem",
                  fontSize: "0.65rem",
                  color: "var(--c-text-muted)",
                  overflow: "auto",
                  maxHeight: "110px",
                  fontFamily: "monospace",
                  lineHeight: 1.55,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
                {JSON.stringify(event.details, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Skeleton loading ─────────────────────────────────────────────────────────
const SKELETON_WIDTHS = ["55%", "70%", "45%", "60%"];

function TimelineSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {SKELETON_WIDTHS.map((w, i) => (
        <div
          key={i}
          style={{ display: "flex", gap: "0.75rem", opacity: 1 - i * 0.18 }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "1.875rem",
              flexShrink: 0,
            }}
          >
            <div
              className="timeline-skeleton-pulse"
              style={{ width: "1.875rem", height: "1.875rem", borderRadius: "50%" }}
            />
            {i < SKELETON_WIDTHS.length - 1 && (
              <div
                style={{
                  width: "1.5px",
                  height: "2rem",
                  background: "var(--c-border-base)",
                  marginTop: "3px",
                }}
              />
            )}
          </div>
          <div style={{ flex: 1, paddingBottom: "1.1rem" }}>
            <div
              className="timeline-skeleton-pulse"
              style={{
                height: "0.7rem",
                borderRadius: "0.25rem",
                width: w,
                animationDelay: `${i * 0.12}s`,
              }}
            />
            <div
              className="timeline-skeleton-pulse"
              style={{
                height: "0.6rem",
                borderRadius: "0.25rem",
                width: "3.5rem",
                marginTop: "0.35rem",
                animationDelay: `${i * 0.12 + 0.06}s`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function MessageTimeline({ messageId }) {
  const { data: events = [], isLoading, isError } = useMessageEvents(messageId);

  // ── Loading ──
  if (isLoading) {
    return (
      <div style={{ padding: "1.25rem 1rem 0.5rem" }}>
        <SectionHeader count={null} />
        <div style={{ marginTop: "1.25rem" }}>
          <TimelineSkeleton />
        </div>
      </div>
    );
  }

  // ── Error ──
  if (isError) {
    return (
      <div
        style={{
          padding: "2.5rem 1rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.625rem",
        }}
      >
        <div
          style={{
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "50%",
            background: "#fff1f2",
            border: "1.5px solid #fecdd3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i className="fas fa-exclamation-triangle" style={{ color: "#dc2626", fontSize: "0.9rem" }} />
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--c-text-subtle)", margin: 0 }}>
          Impossibile caricare la cronologia.
        </p>
      </div>
    );
  }

  // ── Empty ──
  if (events.length === 0) {
    return (
      <div
        style={{
          padding: "3rem 1rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.625rem",
        }}
      >
        <div
          style={{
            width: "2.75rem",
            height: "2.75rem",
            borderRadius: "50%",
            background: "var(--c-bg-offset-2)",
            border: "1.5px solid var(--c-border-base)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i className="fas fa-history" style={{ color: "var(--c-text-subtle)", fontSize: "1rem" }} />
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--c-text-subtle)", margin: 0 }}>
          Nessun evento registrato.
        </p>
      </div>
    );
  }

  // ── Summary badges ──
  const errorCount = events.filter((e) => isErrorEvent(e.event_type)).length;

  return (
    <div style={{ padding: "1.25rem 1rem 1rem" }}>
      <SectionHeader count={events.length} errorCount={errorCount} />

      {/* Timeline list */}
      <div style={{ marginTop: "1.25rem" }}>
        {events.map((event, idx) => (
          <TimelineItem
            key={event.id}
            event={event}
            index={idx}
            isLast={idx === events.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ count, errorCount }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div
          style={{
            width: "1.75rem",
            height: "1.75rem",
            background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
            borderRadius: "0.4rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <i className="fas fa-stream" style={{ fontSize: "0.65rem", color: "white" }} />
        </div>
        <span
          style={{
            fontWeight: 600,
            fontSize: "0.875rem",
            color: "var(--c-text-base)",
          }}
        >
          Cronologia eventi
        </span>
      </div>

      {count !== null && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          {errorCount > 0 && (
            <span
              style={{
                fontSize: "0.68rem",
                background: "#fff1f2",
                color: "#dc2626",
                border: "1px solid #fecdd3",
                padding: "0.15rem 0.5rem",
                borderRadius: "9999px",
                fontWeight: 600,
              }}
            >
              <i className="fas fa-exclamation-circle" style={{ marginRight: "0.2rem", fontSize: "0.6rem" }} />
              {errorCount} {errorCount === 1 ? "errore" : "errori"}
            </span>
          )}
          <span
            style={{
              fontSize: "0.68rem",
              background: "var(--c-bg-offset-2)",
              color: "var(--c-text-subtle)",
              border: "1px solid var(--c-border-base)",
              padding: "0.15rem 0.5rem",
              borderRadius: "9999px",
            }}
          >
            {count} {count === 1 ? "evento" : "eventi"}
          </span>
        </div>
      )}
    </div>
  );
}

export default MessageTimeline;
