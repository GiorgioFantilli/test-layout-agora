import React from 'react';
import { useDashboardStats } from '../../hooks/useEmails';
import MetricCard from './MetricCard';
import AccountHealthTable from './AccountHealthTable';

function DashboardView() {
  const { data: stats, isLoading, isError } = useDashboardStats();

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
          <p className="text-red-600 dark:text-red-300 text-sm mt-2 ml-8">Il servizio poller potrebbe non essere raggiungibile o l'endpoint /stats/summary non è ancora del tutto implementato.</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Fallback map fields based on the roadmap description
  const received = stats.totals?.received ?? stats.total_messages ?? 0;
  const pending = stats.totals?.pending ?? stats.pending_messages ?? 0;
  const failed = stats.totals?.failed ?? stats.failed_messages ?? 0;
  const accounts = stats.account_status || stats.accounts || [];

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto bg-gray-50 dark:bg-gray-900 h-full w-full">
      <div className="flex justify-between items-end mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight flex items-center">
            <i className="fas fa-chart-pie mr-3 text-blue-600 dark:text-blue-500"></i> Control Room
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Resoconto in tempo reale dello stato dell'integrazione e dei volumi di posta</p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm">
          <i className="fas fa-sync fa-spin mr-2 text-xs"></i> Aggiornamento automatico (30s)
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <MetricCard 
          title="Messaggi Ricevuti" 
          value={received} 
          icon="fa-inbox" 
          color="blue" 
        />
        <MetricCard 
          title="Da Protocollare" 
          value={pending} 
          icon="fa-clock" 
          color="yellow" 
        />
        <MetricCard 
          title="Errori" 
          value={failed} 
          icon="fa-exclamation-triangle" 
          color="red" 
        />
      </div>

      <div className="bg-white dark:bg-gray-800/90 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 flex-1">
        <div className="flex items-center mb-6">
          <i className="fas fa-server text-gray-400 text-xl mr-3"></i>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 m-0">Stato Account PEC</h2>
        </div>
        <AccountHealthTable accounts={accounts} />
      </div>
    </div>
  );
}

export default DashboardView;
