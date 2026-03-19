import React, { useState, useEffect } from 'react';
import { useDashboardStats, useSystemHealth, useRevisionRate, usePipelineFunnel } from '../../hooks/useEmails';
import { useSession } from '../../hooks/useAuth';
import MetricCard from './MetricCard';
import AccountHealthTable from './AccountHealthTable';

// ── Sezioni personalizzabili ─────────────────────────────────────────────────
const SECTION_DEFS = [
  { key: 'accounts',  title: 'Caselle di posta certificata', desc: 'Stato, sincronizzazione e azioni per ogni casella' },
  { key: 'aiQuality', title: 'Qualità analisi AI',           desc: 'Proposte accettate, modificate e non utilizzate' },
  { key: 'pipeline',  title: 'Stato elaborazione',           desc: 'Distribuzione dei messaggi nelle fasi della pipeline' },
  { key: 'sla',       title: 'Tempi di elaborazione',        desc: 'Velocità media e rispetto dei tempi' },
];

const SECTION_DEFAULTS = { accounts: true, aiQuality: true, pipeline: true, sla: true };

function getSavedVisibility() {
  try {
    return { ...SECTION_DEFAULTS, ...JSON.parse(localStorage.getItem('dash_visibility') || '{}') };
  } catch {
    return { ...SECTION_DEFAULTS };
  }
}

// ── Stato AI (semaforo unico) ────────────────────────────────────────────────
function getAiStatus(health) {
  if (!health) {
    return {
      orbClass: 'dash-orb-amber',
      main: 'Stato analisi in verifica',
      sub: 'Impossibile contattare il servizio di analisi',
      isError: false,
    };
  }
  const { llm_circuit: circuit, llm, db, status } = health;
  if (circuit === 'OPEN' || llm === 'unreachable' || db === 'unreachable') {
    return {
      orbClass: 'dash-orb-red',
      main: 'Analisi automatica non disponibile',
      sub: 'I nuovi messaggi non vengono analizzati automaticamente — è necessaria la revisione manuale',
      isError: true,
    };
  }
  if (circuit === 'HALF_OPEN' || status === 'degraded') {
    return {
      orbClass: 'dash-orb-amber',
      main: 'Analisi automatica rallentata',
      sub: 'Il servizio è in fase di ripristino — alcune analisi potrebbero richiedere più tempo del solito',
      isError: false,
    };
  }
  return {
    orbClass: 'dash-orb-green',
    main: 'Analisi automatica attiva',
    sub: 'Tutti i messaggi vengono analizzati automaticamente',
    isError: false,
  };
}

// ── Section collassabile ─────────────────────────────────────────────────────
function Section({ icon, iconBg, iconColor, title, subtitle, badge, previewKpis, isOpen, onToggle, children }) {
  return (
    <div className="dash-section">
      <div
        className={`dash-section-hd${isOpen ? ' open' : ''}`}
        onClick={onToggle}
        role="button"
        aria-expanded={isOpen}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
          <div className="dash-sec-icon" style={{ background: iconBg, color: iconColor }}>
            <i className={`fas ${icon}`}></i>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--d-text)' }}>{title}</div>
            {subtitle && (
              <div style={{ fontSize: '11.5px', color: 'var(--d-text-sec)', marginTop: '2px' }}>{subtitle}</div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {previewKpis && previewKpis.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {previewKpis.map((p, i) => (
                <div key={i} className="dash-pkpi">
                  <div className="dash-pkpi-val" style={p.color ? { color: p.color } : undefined}>{p.value}</div>
                  <div className="dash-pkpi-lbl">{p.label}</div>
                </div>
              ))}
            </div>
          )}
          {badge && (
            <span className={`dash-badge ${badge.className}`}>
              <span className="dash-bdot"></span>{badge.text}
            </span>
          )}
          <i className={`fas fa-chevron-down dash-chevron${isOpen ? ' open' : ''}`}></i>
        </div>
      </div>

      {isOpen && (
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Loading / Error ──────────────────────────────────────────────────────────
function LoadingView() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: 'var(--d-surface)', height: '100%', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--d-text-subtle)' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '28px', color: 'var(--d-blue)' }}></i>
        <span style={{ fontSize: '14px' }}>Caricamento statistiche…</span>
      </div>
    </div>
  );
}

function ErrorView({ refetch }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 32px', background: 'var(--d-surface)', height: '100%', width: '100%' }}>
      <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--d-text)', marginBottom: '20px' }}>Riepilogo Operativo</div>
      <div className="dash-alert error">
        <div style={{ fontSize: '15px', flexShrink: 0, color: 'var(--d-red)' }}>
          <i className="fas fa-exclamation-circle"></i>
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--d-text)', marginBottom: '4px' }}>
            Errore nel caricamento delle statistiche
          </div>
          <div style={{ fontSize: '12px', color: 'var(--d-text-sec)' }}>
            Il servizio non è raggiungibile al momento.
          </div>
          <button
            onClick={() => refetch()}
            style={{ marginTop: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--d-blue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontFamily: 'inherit' }}
          >
            Riprova
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
function DashboardView() {
  const { data: stats, isLoading, isError, refetch, isFetching, dataUpdatedAt } = useDashboardStats();
  const { data: health } = useSystemHealth();
  const { data: revisionRate } = useRevisionRate();
  const { data: funnel } = usePipelineFunnel();
  const { data: user } = useSession();

  // Sezioni aperte/chiuse (solo sessione)
  const [openSections, setOpenSections] = useState({ accounts: true, aiQuality: false, pipeline: false, sla: false });
  const toggleSection = (id) => setOpenSections(p => ({ ...p, [id]: !p[id] }));

  // Visibilità sezioni (persistita in localStorage)
  const [visibility, setVisibility] = useState(getSavedVisibility);
  const [custOpen, setCustOpen] = useState(false);

  const saveVisibility = (v) => {
    setVisibility(v);
    localStorage.setItem('dash_visibility', JSON.stringify(v));
  };

  // Pill "Aggiornato N secondi fa"
  const [timeSince, setTimeSince] = useState(null);
  useEffect(() => {
    if (!dataUpdatedAt) return;
    const update = () => setTimeSince(Math.round((Date.now() - dataUpdatedAt) / 1000));
    update();
    const id = setInterval(update, 5000);
    return () => clearInterval(id);
  }, [dataUpdatedAt]);

  const timeSinceLabel = timeSince === null ? '…'
    : timeSince < 60 ? `${timeSince} second${timeSince === 1 ? 'o' : 'i'} fa`
    : timeSince < 3600 ? `${Math.round(timeSince / 60)} minut${Math.round(timeSince / 60) === 1 ? 'o' : 'i'} fa`
    : 'più di un\'ora fa';

  const todayStr = new Date().toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  if (isLoading) return <LoadingView />;
  if (isError)   return <ErrorView refetch={refetch} />;
  if (!stats)    return null;

  const received   = stats.total_messages_today ?? 0;
  const pending    = stats.pending_messages ?? 0;
  const failed     = stats.messages_in_error_state ?? 0;
  const errorsToday = stats.total_errors_today ?? 0;
  const accounts   = stats.account_status || [];

  const aiStatus = getAiStatus(health);

  // Badge header sezione accounts
  const activeAccounts = accounts.filter(a => a.enabled && !a.last_sync_error).length;
  const errorAccounts  = accounts.filter(a => a.last_sync_error && a.enabled).length;
  const accountBadge = errorAccounts > 0
    ? { className: 'dash-badge-err',  text: `${errorAccounts} con error${errorAccounts === 1 ? 'e' : 'i'}` }
    : accounts.length > 0
    ? { className: 'dash-badge-ok',   text: `${activeAccounts} attiv${activeAccounts === 1 ? 'a' : 'e'}` }
    : null;

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 32px 40px',
      overflowY: 'auto',
      background: 'var(--d-surface)',
      height: '100%',
      width: '100%',
      fontFamily: "'Titillium Web', sans-serif",
      color: 'var(--d-text)',
    }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--d-text)', letterSpacing: '-0.4px', lineHeight: 1.2 }}>
            Riepilogo Operativo
          </div>
          <div style={{ fontSize: '13px', color: 'var(--d-text-subtle)', marginTop: '4px' }}>
            {user?.tenant_name || 'Ente'} &middot; {todayStr}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: 'white', border: '1px solid var(--d-border)',
            borderRadius: '20px', padding: '6px 13px',
            fontSize: '12px', color: 'var(--d-text-subtle)',
            boxShadow: 'var(--d-shadow-sm)',
          }}>
            <span className="dash-live-dot"></span>
            Aggiornato {timeSinceLabel}
          </div>

          <button
            onClick={() => setCustOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '7px 15px', borderRadius: 'var(--d-radius-sm)',
              fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              border: '1.5px solid var(--d-border)', background: 'white',
              color: 'var(--d-text-sec)', boxShadow: 'var(--d-shadow-sm)',
            }}
          >
            <i className="fas fa-sliders-h"></i> Personalizza
          </button>
        </div>
      </div>

      {/* ── KPI Row ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '14px' }}>
        <MetricCard
          title="Ricevute oggi"
          value={received}
          kpiColor="var(--d-blue)"
          valueColor="var(--d-text)"
          subtitle="Nuove PEC nelle ultime 24 ore"
        />
        <MetricCard
          title="In elaborazione"
          value={pending}
          kpiColor="var(--d-amber)"
          valueColor="var(--d-text)"
          subtitle="Analisi automatica in corso"
          trend={pending === 0
            ? <><i className="fas fa-minus" style={{ fontSize: '9px' }}></i>&thinsp;nessun arretrato</>
            : null}
          trendDir="flat"
        />
        <MetricCard
          title="Richiedono attenzione"
          value={failed}
          kpiColor={failed === 0 ? 'var(--d-border)' : 'var(--d-red)'}
          valueColor={failed === 0 ? 'var(--d-text-subtle)' : 'var(--d-red)'}
          subtitle={failed === 0 ? 'Nessun errore da risolvere' : `${failed} messagg${failed === 1 ? 'io' : 'i'} con errori`}
          trend={failed === 0
            ? <><i className="fas fa-check" style={{ fontSize: '9px' }}></i>&thinsp;tutto regolare</>
            : <><i className="fas fa-exclamation" style={{ fontSize: '9px' }}></i>&thinsp;verifica consigliata</>}
          trendDir={failed === 0 ? 'ok' : 'warn'}
        />
        <MetricCard
          title="Errori oggi"
          value={errorsToday}
          kpiColor={errorsToday === 0 ? 'var(--d-border)' : 'var(--d-red)'}
          valueColor={errorsToday === 0 ? 'var(--d-text-subtle)' : 'var(--d-red)'}
          subtitle="Eventi di errore nelle ultime 24 ore"
          trend={errorsToday === 0
            ? <><i className="fas fa-check" style={{ fontSize: '9px' }}></i>&thinsp;tutto regolare</>
            : null}
          trendDir="ok"
        />
      </div>

      {/* ── AI Status bar ──────────────────────────────────────────────────── */}
      <div
        className={`dash-status-bar${aiStatus.isError ? ' error' : ''}`}
        style={{ marginBottom: '16px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px', flex: 1 }}>
          <span className={`dash-status-orb ${aiStatus.orbClass}`}></span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: aiStatus.isError ? 'var(--d-red)' : 'var(--d-text)' }}>
              {aiStatus.main}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--d-text-sec)', marginTop: '1px' }}>
              {aiStatus.sub}
            </div>
          </div>
        </div>

        <div style={{ width: '1px', height: '30px', background: 'var(--d-border)', margin: '0 18px' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '12px', color: 'var(--d-text-subtle)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <i className="fas fa-sync-alt"></i> Aggiornamento automatico ogni 30 secondi
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '5px 11px', borderRadius: 'var(--d-radius-sm)',
              fontFamily: 'inherit', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              border: '1.5px solid var(--d-border)', background: 'white',
              color: 'var(--d-text-sec)', opacity: isFetching ? 0.6 : 1,
            }}
          >
            <i className={`fas fa-sync${isFetching ? ' fa-spin' : ''}`} style={{ fontSize: '11px' }}></i>
            {isFetching ? 'Aggiornamento…' : 'Aggiorna ora'}
          </button>
        </div>
      </div>

      {/* ── Alert: messaggi con errori ─────────────────────────────────────── */}
      {failed > 0 && (
        <div className="dash-alert warn" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '15px', flexShrink: 0, marginTop: '1px', color: 'var(--d-amber)' }}>
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--d-text)', marginBottom: '3px' }}>
              {failed === 1 ? '1 messaggio richiede' : `${failed} messaggi richiedono`} attenzione
            </div>
            <div style={{ fontSize: '12px', color: 'var(--d-text-sec)', lineHeight: 1.5 }}>
              {failed === 1
                ? 'Un messaggio non ha completato l\'elaborazione e potrebbe richiedere intervento manuale.'
                : `${failed} messaggi non hanno completato l'elaborazione e potrebbero richiedere intervento manuale.`}
            </div>
          </div>
        </div>
      )}

      {/* ── Sezioni collassabili ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Caselle PEC */}
        {visibility.accounts && (
          <Section
            icon="fa-inbox"
            iconBg="var(--d-blue-xlight)"
            iconColor="var(--d-blue)"
            title="Caselle di posta certificata"
            subtitle={
              accounts.length === 0
                ? 'Nessuna casella configurata'
                : `${accounts.length} casell${accounts.length === 1 ? 'a' : 'e'} configurata${accounts.length === 1 ? '' : 'e'} · ${accounts.filter(a => a.enabled).length} attiv${accounts.filter(a => a.enabled).length === 1 ? 'a' : 'e'}`
            }
            badge={accountBadge}
            isOpen={openSections.accounts}
            onToggle={() => toggleSection('accounts')}
          >
            <AccountHealthTable accounts={accounts} />
          </Section>
        )}

        {/* Qualità analisi AI */}
        {visibility.aiQuality && (
          <Section
            icon="fa-robot"
            iconBg="#EEF0FF"
            iconColor="#5A6FC8"
            title="Qualità analisi AI"
            subtitle="Proposte generate automaticamente — cumulativo"
            previewKpis={revisionRate ? [
              { value: `${revisionRate.accepted_pct}%`, label: 'Accettate', color: 'var(--d-green)' },
              { value: `${revisionRate.revised_pct}%`,  label: 'Modificate', color: 'var(--d-amber)' },
            ] : [
              { value: '—', label: 'Accettate', color: 'var(--d-text-subtle)' },
              { value: '—', label: 'Modificate', color: 'var(--d-text-subtle)' },
            ]}
            isOpen={openSections.aiQuality}
            onToggle={() => toggleSection('aiQuality')}
          >
            {revisionRate ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Proposte accettate', value: `${revisionRate.accepted_pct}%`, color: 'var(--d-green)', bg: 'var(--d-green-light)' },
                  { label: 'Proposte modificate', value: `${revisionRate.revised_pct}%`, color: 'var(--d-amber)', bg: '#FFF8EC' },
                  { label: 'Non utilizzate', value: '—', color: 'var(--d-text-subtle)', bg: 'var(--d-surface)' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} style={{ background: bg, border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
                    <div style={{ fontSize: '12px', color: 'var(--d-text-sec)', marginTop: '6px' }}>{label}</div>
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1', fontSize: '11.5px', color: 'var(--d-text-subtle)', marginTop: '2px' }}>
                  Su {revisionRate.total_completed} proposta{revisionRate.total_completed !== 1 ? 'e' : ''} generate · {revisionRate.manually_revised} modificat{revisionRate.manually_revised !== 1 ? 'e' : 'a'} manualmente
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '24px 0', color: 'var(--d-text-subtle)', fontSize: '13px', textAlign: 'center' }}>
                <i className="fas fa-robot" style={{ fontSize: '24px', opacity: 0.3 }}></i>
                Dati di qualità AI non ancora disponibili
              </div>
            )}
          </Section>
        )}

        {/* Stato elaborazione (funnel pipeline) */}
        {visibility.pipeline && (
          <Section
            icon="fa-stream"
            iconBg="var(--d-teal-light)"
            iconColor="var(--d-teal)"
            title="Stato elaborazione"
            subtitle="Messaggi attualmente in ciascuna fase della pipeline"
            previewKpis={funnel ? [
              { value: funnel.ai_processing, label: 'In analisi AI', color: 'var(--d-blue)' },
              { value: funnel.failed > 0 ? funnel.failed : '✓', label: funnel.failed > 0 ? 'In errore' : 'Nessun errore', color: funnel.failed > 0 ? 'var(--d-red)' : 'var(--d-green)' },
            ] : [
              { value: '—', label: 'In analisi AI', color: 'var(--d-text-subtle)' },
              { value: '—', label: 'In errore',     color: 'var(--d-text-subtle)' },
            ]}
            isOpen={openSections.pipeline}
            onToggle={() => toggleSection('pipeline')}
          >
            {funnel ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                {[
                  { label: 'Pronti per il parser', value: funnel.ingest_ready, color: 'var(--d-text)', bg: 'var(--d-surface)' },
                  { label: 'Parsing in corso',     value: funnel.parsing,       color: 'var(--d-amber)', bg: '#FFF8EC' },
                  { label: 'Analisi AI in corso',  value: funnel.ai_processing, color: 'var(--d-blue)', bg: 'var(--d-blue-xlight)' },
                  { label: 'Analisi completata',   value: funnel.completed,     color: 'var(--d-green)', bg: 'var(--d-green-light)' },
                  { label: 'Richiedono intervento',value: funnel.failed,        color: funnel.failed > 0 ? 'var(--d-red)' : 'var(--d-text-subtle)', bg: funnel.failed > 0 ? '#FFF0F0' : 'var(--d-surface)' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} style={{ background: bg, border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)', padding: '14px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '26px', fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--d-text-sec)', marginTop: '6px', lineHeight: 1.3 }}>{label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '24px 0', color: 'var(--d-text-subtle)', fontSize: '13px', textAlign: 'center' }}>
                <i className="fas fa-stream" style={{ fontSize: '24px', opacity: 0.3 }}></i>
                Dati pipeline non ancora disponibili
              </div>
            )}
          </Section>
        )}

        {/* Tempi di elaborazione (placeholder) */}
        {visibility.sla && (
          <Section
            icon="fa-stopwatch"
            iconBg="var(--d-teal-light)"
            iconColor="var(--d-teal)"
            title="Tempi di elaborazione"
            subtitle="Dal ricevimento della PEC all'analisi completata"
            previewKpis={[
              { value: '—', label: 'Tempo medio', color: 'var(--d-text-subtle)' },
              { value: '—', label: 'Entro 5 min',  color: 'var(--d-text-subtle)' },
            ]}
            isOpen={openSections.sla}
            onToggle={() => toggleSection('sla')}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '24px 0', color: 'var(--d-text-subtle)', fontSize: '13px', textAlign: 'center' }}>
              <i className="fas fa-chart-bar" style={{ fontSize: '24px', opacity: 0.3 }}></i>
              Dati SLA disponibili nella prossima versione
            </div>
          </Section>
        )}

      </div>

      {/* ── Pannello Personalizza ──────────────────────────────────────────── */}
      {custOpen && (
        <div
          className="dash-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setCustOpen(false); }}
        >
          <div className="dash-cust-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--d-border)' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--d-text)' }}>Personalizza dashboard</div>
              <button
                onClick={() => setCustOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--d-text-subtle)', fontSize: '15px', cursor: 'pointer' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div style={{ padding: '8px 20px 16px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', color: 'var(--d-text-subtle)', padding: '12px 0 6px' }}>
                Sezioni visibili
              </div>

              {SECTION_DEFS.map(({ key, title, desc }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--d-border-light)' }}>
                  <div style={{ flex: 1, paddingRight: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--d-text)' }}>{title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--d-text-subtle)', marginTop: '2px' }}>{desc}</div>
                  </div>
                  <label className="dash-toggle">
                    <input
                      type="checkbox"
                      checked={!!visibility[key]}
                      onChange={(e) => saveVisibility({ ...visibility, [key]: e.target.checked })}
                    />
                    <div className="dash-toggle-track"></div>
                    <div className="dash-toggle-thumb"></div>
                  </label>
                </div>
              ))}
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--d-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => saveVisibility({ ...SECTION_DEFAULTS })}
                style={{ fontSize: '12px', color: 'var(--d-text-subtle)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
              >
                Ripristina predefiniti
              </button>
              <button
                onClick={() => setCustOpen(false)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  padding: '7px 15px', borderRadius: 'var(--d-radius-sm)',
                  fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  border: '1.5px solid var(--d-blue)', background: 'var(--d-blue)', color: 'white',
                }}
              >
                Fatto
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default DashboardView;
