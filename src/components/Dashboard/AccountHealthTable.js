import React, { useState } from 'react';
import { useSyncAccount, useToggleAccount } from '../../hooks/useEmails';

function AccountRow({ acc }) {
  const [syncFeedback, setSyncFeedback] = useState(null); // null | 'ok' | 'error'

  const syncMutation = useSyncAccount();
  const toggleMutation = useToggleAccount();

  const isEnabled = acc.enabled;
  const hasError = !!acc.last_sync_error;

  const handleSync = () => {
    syncMutation.mutate(acc.id, {
      onSuccess: () => {
        setSyncFeedback('ok');
        setTimeout(() => setSyncFeedback(null), 3000);
      },
      onError: () => {
        setSyncFeedback('error');
        setTimeout(() => setSyncFeedback(null), 4000);
      },
    });
  };

  const handleToggle = () => {
    toggleMutation.mutate({ accountId: acc.id, enabled: !isEnabled });
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      {/* Account */}
      <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200 font-medium">
        <div className="flex items-center gap-2">
          <i className="fas fa-envelope text-gray-400 text-xs shrink-0"></i>
          <span className="truncate max-w-xs" title={acc.address}>{acc.address}</span>
        </div>
      </td>

      {/* Stato abilitazione */}
      <td className="py-3 px-4 text-sm">
        {isEnabled ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <i className="fas fa-circle text-[8px]"></i> Attivo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
            <i className="fas fa-circle text-[8px]"></i> Disabilitato
          </span>
        )}
      </td>

      {/* Connessione */}
      <td className="py-3 px-4 text-sm font-medium">
        {!isEnabled ? (
          <span className="text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
            <i className="fas fa-minus-circle"></i> Sospeso
          </span>
        ) : hasError ? (
          <span className="text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <i className="fas fa-times-circle"></i> Errore
          </span>
        ) : (
          <span className="text-green-600 dark:text-green-400 flex items-center gap-1.5">
            <i className="fas fa-check-circle"></i> OK
          </span>
        )}
      </td>

      {/* Ultima sincronizzazione */}
      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
        {acc.last_sync_time
          ? new Date(acc.last_sync_time).toLocaleString('it-IT')
          : <span className="text-gray-400 italic">Mai</span>
        }
      </td>

      {/* Errori oggi */}
      <td className="py-3 px-4 text-sm text-center">
        {acc.errors_today > 0 ? (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold">
            {acc.errors_today}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">—</span>
        )}
      </td>

      {/* Ultimo errore */}
      <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400 max-w-[180px]">
        {acc.last_sync_error ? (
          <span className="truncate block text-red-500 dark:text-red-400" title={acc.last_sync_error}>
            {acc.last_sync_error}
          </span>
        ) : (
          <span className="text-gray-300 dark:text-gray-600">—</span>
        )}
      </td>

      {/* Azioni */}
      <td className="py-3 px-4 text-sm">
        <div className="flex items-center gap-2">
          {/* Sync manuale */}
          {isEnabled && (
            <button
              onClick={handleSync}
              disabled={syncMutation.isPending}
              title="Sincronizza ora"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors
                ${syncFeedback === 'ok'
                  ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                  : syncFeedback === 'error'
                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                    : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                }
                disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {syncMutation.isPending ? (
                <><i className="fas fa-spinner fa-spin text-[10px]"></i> Sync...</>
              ) : syncFeedback === 'ok' ? (
                <><i className="fas fa-check text-[10px]"></i> Avviato</>
              ) : syncFeedback === 'error' ? (
                <><i className="fas fa-times text-[10px]"></i> Errore</>
              ) : (
                <><i className="fas fa-sync text-[10px]"></i> Sync</>
              )}
            </button>
          )}

          {/* Abilita / Disabilita */}
          <button
            onClick={handleToggle}
            disabled={toggleMutation.isPending}
            title={isEnabled ? 'Disabilita account' : 'Abilita account'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors disabled:opacity-60 disabled:cursor-not-allowed
              ${isEnabled
                ? 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400'
                : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 hover:bg-green-50 hover:text-green-600 hover:border-green-200 dark:hover:bg-green-900/20 dark:hover:text-green-400'
              }`}
          >
            {toggleMutation.isPending ? (
              <i className="fas fa-spinner fa-spin text-[10px]"></i>
            ) : isEnabled ? (
              <><i className="fas fa-pause text-[10px]"></i> Disabilita</>
            ) : (
              <><i className="fas fa-play text-[10px]"></i> Abilita</>
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}

function AccountHealthTable({ accounts }) {
  if (!accounts || accounts.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 italic">
        Nessun account monitorato al momento.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full text-left border-collapse">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account</th>
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stato</th>
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Connessione</th>
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ultima Sync</th>
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Err. Oggi</th>
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ultimo Errore</th>
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Azioni</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
          {accounts.map((acc) => (
            <AccountRow key={acc.id} acc={acc} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AccountHealthTable;
