import React from 'react';
import { useDashboardStats, useSystemHealth } from '../../hooks/useEmails';
import MetricCard from './MetricCard';
import AccountHealthTable from './AccountHealthTable';

const HEALTH_LABEL = {
  ok: { text: 'Operativo', color: 'text-green-600 dark:text-green-400', icon: 'fa-check-circle', bg: 'bg-green-50 dark:bg-green-900/20' },
  degraded: { text: 'Degradato', color: 'text-yellow-600 dark:text-yellow-400', icon: 'fa-exclamation-triangle', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  unreachable: { text: 'Non raggiungibile', color: 'text-red-600 dark:text-red-400', icon: 'fa-times-circle', bg: 'bg-red-50 dark:bg-red-900/20' },
};

const CIRCUIT_LABEL = {
  CLOSED: { text: 'Chiuso (OK)', color: 'text-green-600 dark:text-green-400' },
  OPEN: { text: 'Aperto (bloccato)', color: 'text-red-600 dark:text-red-400' },
  HALF_OPEN: { text: 'Semi-aperto', color: 'text-yellow-600 dark:text-yellow-400' },
  UNKNOWN: { text: 'Sconosciuto', color: 'text-gray-500 dark:text-gray-400' },
};

function HealthBadge({ value, type = 'service' }) {
  const resolved = type === 'circuit'
    ? (CIRCUIT_LABEL[value] || CIRCUIT_LABEL.UNKNOWN)
    : (HEALTH_LABEL[value] || HEALTH_LABEL.unreachable);

  if (type === 'circuit') {
    return <span className={`text-sm font-medium ${resolved.color}`}>{resolved.text}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${resolved.color}`}>
      <i className={`fas ${resolved.icon}`}></i> {resolved.text}
    </span>
  );
}

function SystemHealthPanel({ health }) {
  if (!health) return null;

  const overallStyle = HEALTH_LABEL[health.status] || HEALTH_LABEL.unreachable;

  return (
    <div className={`rounded-xl border shadow-sm p-4 ${overallStyle.bg} border-gray-100 dark:border-gray-700/60`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <i className="fas fa-heartbeat text-gray-400"></i> Stato Pipeline AI
        </h3>
        <HealthBadge value={health.status} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">LLM</p>
          <HealthBadge value={health.llm} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Database AI</p>
          <HealthBadge value={health.db} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Circuit Breaker</p>
          <HealthBadge value={health.llm_circuit} type="circuit" />
        </div>
      </div>
    </div>
  );
}

function DashboardView() {
  const { data: stats, isLoading, isError, refetch, isFetching } = useDashboardStats();
  const { data: health } = useSystemHealth();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 h-full w-full">
        <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
          <i className="fas fa-spinner fa-spin text-4xl mb-4 text-blue-500"></i>
          <p className="text-lg">Caricamento statistiche in corso...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex flex-col p-8 bg-gray-50 dark:bg-gray-900 h-full w-full">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 tracking-tight">Control Room</h1>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm dark:bg-red-900/20">
          <div className="flex items-center">
            <i className="fas fa-exclamation-circle text-red-500 text-xl mr-3"></i>
            <p className="text-red-700 dark:text-red-400 font-medium">Errore nel caricamento delle statistiche.</p>
          </div>
          <p className="text-red-600 dark:text-red-300 text-sm mt-2 ml-8">Il servizio poller potrebbe non essere raggiungibile.</p>
          <button
            onClick={() => refetch()}
            className="ml-8 mt-3 text-sm text-red-600 dark:text-red-400 underline hover:no-underline"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const received = stats.total_messages_today ?? 0;
  const pending = stats.pending_messages ?? 0;
  const failed = stats.messages_in_error_state ?? 0;
  const errorsToday = stats.total_errors_today ?? 0;
  const accounts = stats.account_status || [];

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto bg-gray-50 dark:bg-gray-900 h-full w-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight flex items-center">
            <i className="fas fa-chart-pie mr-3 text-blue-600 dark:text-blue-500"></i> Control Room
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Resoconto in tempo reale dello stato dell'integrazione e dei volumi di posta
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-60"
          title="Aggiorna ora"
        >
          <i className={`fas fa-sync text-xs ${isFetching ? 'fa-spin' : ''}`}></i>
          {isFetching ? 'Aggiornamento...' : 'Aggiorna (30s)'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Ricevuti Oggi"
          value={received}
          icon="fa-inbox"
          color="blue"
          subtitle="Nuove PEC nelle ultime 24h"
        />
        <MetricCard
          title="In Transito"
          value={pending}
          icon="fa-hourglass-half"
          color="yellow"
          subtitle="In attesa di elaborazione"
        />
        <MetricCard
          title="In Errore"
          value={failed}
          icon="fa-exclamation-triangle"
          color="red"
          subtitle="Backlog errori da risolvere"
        />
        <MetricCard
          title="Errori Oggi"
          value={errorsToday}
          icon="fa-bolt"
          color={errorsToday > 0 ? "red" : "green"}
          subtitle="Eventi di errore nelle ultime 24h"
        />
      </div>

      {/* System Health */}
      {health && (
        <div className="mb-8">
          <SystemHealthPanel health={health} />
        </div>
      )}

      {/* Account Health Table */}
      <div className="bg-white dark:bg-gray-800/90 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-3">
            <i className="fas fa-server text-gray-400 text-xl"></i> Stato Account PEC
          </h2>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {accounts.length} account configurati
          </span>
        </div>
        <AccountHealthTable accounts={accounts} />
      </div>
    </div>
  );
}

export default DashboardView;
