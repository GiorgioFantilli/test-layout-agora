import React, { useState } from 'react';
import { useSyncAccount, useToggleAccount } from '../../hooks/useEmails';
import { formatTimeAgo, formatEmailDateTime } from '../../utils/dateUtils';

function StatusBadge({ acc }) {
  if (!acc.enabled) {
    return (
      <span className="dash-badge dash-badge-neutral">
        <span className="dash-bdot"></span>Disabilitata
      </span>
    );
  }
  if (acc.last_sync_error) {
    return (
      <span className="dash-badge dash-badge-err">
        <span className="dash-bdot"></span>Errore di connessione
      </span>
    );
  }
  return (
    <span className="dash-badge dash-badge-ok">
      <span className="dash-bdot"></span>Attiva e raggiungibile
    </span>
  );
}

function SyncCell({ acc }) {
  if (!acc.enabled) {
    return (
      <div>
        <div className="dash-sync-rel" style={{ color: 'var(--d-text-subtle)' }}>Non disponibile</div>
        <div className="dash-sync-abs">Casella non attiva</div>
      </div>
    );
  }
  if (!acc.last_sync_time) {
    return <span style={{ color: 'var(--d-text-subtle)', fontStyle: 'italic', fontSize: '13px' }}>Mai sincronizzata</span>;
  }

  const relative = formatTimeAgo(acc.last_sync_time);
  const absolute = formatEmailDateTime(acc.last_sync_time);
  const hasError = !!acc.last_sync_error;

  return (
    <div>
      <div className={`dash-sync-rel${hasError ? ' dash-sync-err' : ''}`}>{relative}</div>
      <div className="dash-sync-abs">{absolute}</div>
    </div>
  );
}

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
    <tr className={hasError && isEnabled ? 'row-err' : ''}>
      {/* Casella PEC */}
      <td>
        <div className="dash-email-addr" title={acc.address}>{acc.address}</div>
        {acc.label && <div className="dash-email-label">{acc.label}</div>}
      </td>

      {/* Stato (badge unificato abilitazione + connessione) */}
      <td>
        <StatusBadge acc={acc} />
      </td>

      {/* Ultima sincronizzazione */}
      <td>
        <SyncCell acc={acc} />
      </td>

      {/* Errori oggi */}
      <td style={{ textAlign: 'center' }}>
        {acc.errors_today > 0 ? (
          <span className="dash-err-count">{acc.errors_today}</span>
        ) : (
          <span style={{ color: 'var(--d-text-subtle)' }}>—</span>
        )}
      </td>

      {/* Messaggio di errore */}
      <td>
        {acc.last_sync_error ? (
          <span className="dash-err-msg" title={acc.last_sync_error}>
            {acc.last_sync_error}
          </span>
        ) : (
          <span style={{ color: 'var(--d-text-subtle)' }}>—</span>
        )}
      </td>

      {/* Azioni */}
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isEnabled && (
            <button
              onClick={handleSync}
              disabled={syncMutation.isPending}
              title="Sincronizza ora"
              className={`dash-act-btn dash-act-sync${syncFeedback === 'ok' ? ' ok' : syncFeedback === 'error' ? ' err' : ''}`}
            >
              {syncMutation.isPending ? (
                <><i className="fas fa-spinner fa-spin" style={{ fontSize: '10px' }}></i> Sync…</>
              ) : syncFeedback === 'ok' ? (
                <><i className="fas fa-check" style={{ fontSize: '10px' }}></i> Avviata</>
              ) : syncFeedback === 'error' ? (
                <><i className="fas fa-times" style={{ fontSize: '10px' }}></i> Errore</>
              ) : (
                <><i className="fas fa-sync" style={{ fontSize: '10px' }}></i> Sincronizza</>
              )}
            </button>
          )}

          <button
            onClick={handleToggle}
            disabled={toggleMutation.isPending}
            title={isEnabled ? 'Disabilita casella' : 'Abilita casella'}
            className={`dash-act-btn ${isEnabled ? 'dash-act-disable' : 'dash-act-enable'}`}
          >
            {toggleMutation.isPending ? (
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '10px' }}></i>
            ) : isEnabled ? (
              <><i className="fas fa-pause" style={{ fontSize: '10px' }}></i> Disabilita</>
            ) : (
              <><i className="fas fa-play" style={{ fontSize: '10px' }}></i> Abilita</>
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
      <p style={{ color: 'var(--d-text-subtle)', padding: '16px', fontStyle: 'italic', fontSize: '13px' }}>
        Nessuna casella configurata al momento.
      </p>
    );
  }

  return (
    <div className="dash-tbl-wrap">
      <table>
        <thead>
          <tr>
            <th>Casella PEC</th>
            <th>Stato</th>
            <th>Ultima sincronizzazione</th>
            <th style={{ textAlign: 'center' }}>Errori oggi</th>
            <th>Messaggio di errore</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => (
            <AccountRow key={acc.id} acc={acc} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AccountHealthTable;
