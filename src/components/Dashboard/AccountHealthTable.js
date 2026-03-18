import React from 'react';

function AccountHealthTable({ accounts }) {
  if (!accounts || accounts.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 italic">Nessun account monitorato al momento.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <table className="min-w-full text-left border-collapse">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account</th>
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stato</th>
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Connessione</th>
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ultima Sincronizzazione</th>
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ultimo Errore</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {accounts.map((acc, idx) => {
            const isEnabled = typeof acc.enabled === 'boolean' ? acc.enabled : true;
            const isOk = acc.status === 'OK' || acc.connection_status === 'OK' || acc.status === 'success' || !acc.last_sync_error;
            
            return (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200 font-medium">
                  {acc.address || acc.account_id || "Sconosciuto"}
                </td>
                <td className="py-3 px-4 text-sm">
                  {!isEnabled ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      Disabilitato
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Attivo
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-sm font-medium">
                   {isOk ? (
                     <span className="text-green-600 dark:text-green-400 flex items-center"><i className="fas fa-check-circle mr-1.5"></i> OK</span>
                   ) : (
                     <span className="text-red-600 dark:text-red-400 flex items-center"><i className="fas fa-times-circle mr-1.5"></i> Errore</span>
                   )}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                   {acc.last_sync_time ? new Date(acc.last_sync_time).toLocaleString('it-IT') : <span className="text-gray-400 italic">Mai</span>}
                </td>
                <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate" title={acc.last_sync_error || acc.error_message || ""}>
                   {acc.last_sync_error || acc.error_message || "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AccountHealthTable;
