import React, { useState, useEffect } from 'react';
import {
  useEmailAccounts,
  useToggleAccount,
  useSyncAccount,
  useCreateAccount,
  useUpdateAccount,
} from '../hooks/useEmails';

const EMPTY_FORM = { address: '', host: '', port: 995, username: '', password: '' };

/**
 * Modal panel for managing email PEC accounts.
 *
 * Props:
 *   isOpen:  bool
 *   onClose: () => void
 */
function AccountManagementPanel({ isOpen, onClose }) {
  const { data: accounts = [], isLoading } = useEmailAccounts({ enabled: isOpen });
  const toggleMutation = useToggleAccount();
  const syncMutation = useSyncAccount();
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();

  // 'new' | accountId | null
  const [formMode, setFormMode] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  // Per mostrare il feedback "sincronizzazione avviata" per account
  const [syncedIds, setSyncedIds] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setFormMode(null);
      setFormData(EMPTY_FORM);
      setFormError(null);
      setSyncedIds({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const openCreateForm = () => {
    setFormData(EMPTY_FORM);
    setFormError(null);
    setFormMode('new');
  };

  const openEditForm = (acc) => {
    setFormData({
      address: acc.address || '',
      host: acc.host || '',
      port: acc.port || 995,
      username: acc.username || '',
      password: '',
    });
    setFormError(null);
    setFormMode(acc.id);
  };

  const closeForm = () => {
    setFormMode(null);
    setFormError(null);
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggle = (acc) => {
    toggleMutation.mutate({ accountId: acc.id, enabled: !acc.enabled });
  };

  const handleSync = (acc) => {
    syncMutation.mutate(acc.id, {
      onSuccess: () => {
        setSyncedIds((prev) => ({ ...prev, [acc.id]: true }));
        setTimeout(() => {
          setSyncedIds((prev) => { const n = { ...prev }; delete n[acc.id]; return n; });
        }, 3000);
      },
    });
  };

  const handleSubmit = () => {
    const { address, host, port, username, password } = formData;
    if (!address.trim() || !host.trim() || !username.trim()) {
      setFormError('I campi Indirizzo, Host e Username sono obbligatori.');
      return;
    }
    if (formMode === 'new' && !password.trim()) {
      setFormError('La password è obbligatoria per un nuovo account.');
      return;
    }

    const body = {
      address: address.trim(),
      host: host.trim(),
      port: Number(port),
      username: username.trim(),
      ...(password.trim() ? { password: password.trim() } : {}),
    };

    if (formMode === 'new') {
      createMutation.mutate(body, {
        onSuccess: () => closeForm(),
        onError: (err) => setFormError(err.message),
      });
    } else {
      updateMutation.mutate({ accountId: formMode, ...body }, {
        onSuccess: () => closeForm(),
        onError: (err) => setFormError(err.message),
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // ── Form ──────────────────────────────────────────────────────────────────────

  const renderForm = () => (
    <div style={{
      backgroundColor: 'var(--c-bg-offset-2)',
      border: '1px solid var(--c-border-base)',
      borderRadius: '8px',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}>
      <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--c-text-muted)' }}>
        {formMode === 'new' ? 'Nuovo account PEC' : 'Modifica account'}
      </p>

      {[
        { field: 'address', label: 'Indirizzo PEC', type: 'email', placeholder: 'protocollo@comune.it' },
        { field: 'host', label: 'Host POP3S', type: 'text', placeholder: 'pop3s.provider.it' },
        { field: 'port', label: 'Porta', type: 'number', placeholder: '995' },
        { field: 'username', label: 'Username', type: 'text', placeholder: 'protocollo@comune.it' },
        { field: 'password', label: formMode === 'new' ? 'Password' : 'Password (lascia vuoto per non cambiarla)', type: 'password', placeholder: '••••••••' },
      ].map(({ field, label, type, placeholder }) => (
        <div key={field}>
          <label style={{
            display: 'block', marginBottom: '0.25rem',
            fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.05em', color: 'var(--c-text-muted)',
          }}>
            {label}
          </label>
          <input
            type={type}
            value={formData[field]}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            placeholder={placeholder}
            style={{
              width: '100%', boxSizing: 'border-box',
              fontSize: '0.85rem', padding: '0.4rem 0.7rem',
              border: '1px solid var(--c-border-base)', borderRadius: '6px',
              backgroundColor: 'var(--c-bg-base)', color: 'var(--c-text-base)',
            }}
          />
        </div>
      ))}

      {formError && (
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#dc2626' }}>
          <i className="fas fa-exclamation-circle" style={{ marginRight: '0.35rem' }}></i>
          {formError}
        </p>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
        <button className="button-secondary" onClick={closeForm} disabled={isSubmitting}>
          Annulla
        </button>
        <button className="button-primary" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting
            ? <><i className="fas fa-circle-notch fa-spin"></i> Salvo…</>
            : formMode === 'new' ? 'Crea account' : 'Salva modifiche'}
        </button>
      </div>
    </div>
  );

  // ── Account row ───────────────────────────────────────────────────────────────

  const renderAccountRow = (acc) => {
    const isSyncing = syncMutation.isPending && syncMutation.variables === acc.id;
    const synced = syncedIds[acc.id];
    const isToggling = toggleMutation.isPending && toggleMutation.variables?.accountId === acc.id;

    return (
      <div key={acc.id} style={{
        backgroundColor: 'var(--c-bg-offset-2)',
        border: '1px solid var(--c-border-base)',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}>
        {/* Top row: address + enabled badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <i className="fas fa-envelope" style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)' }}></i>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--c-text-base)', flex: 1 }}>
            {acc.address}
          </span>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem',
            borderRadius: '999px',
            backgroundColor: acc.enabled ? '#f0fdf4' : '#fef2f2',
            color: acc.enabled ? '#166534' : '#991b1b',
            border: `1px solid ${acc.enabled ? '#bbf7d0' : '#fca5a5'}`,
          }}>
            {acc.enabled ? 'Attivo' : 'Disabilitato'}
          </span>
        </div>

        {/* Details: host:port */}
        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--c-text-muted)', fontFamily: 'monospace' }}>
          {acc.host || '—'}:{acc.port || '—'}
        </p>

        {/* Actions row */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.1rem' }}>
          {/* Toggle enable/disable */}
          <button
            className="button-secondary"
            onClick={() => handleToggle(acc)}
            disabled={isToggling}
            style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}
          >
            {isToggling
              ? <><i className="fas fa-circle-notch fa-spin"></i> <span>Salvo…</span></>
              : acc.enabled
                ? <><i className="fas fa-pause-circle"></i> <span>Disabilita</span></>
                : <><i className="fas fa-play-circle"></i> <span>Abilita</span></>}
          </button>

          {/* Sync */}
          <button
            className="button-secondary"
            onClick={() => handleSync(acc)}
            disabled={isSyncing || !acc.enabled}
            title={!acc.enabled ? 'Riabilita l\'account per sincronizzare' : undefined}
            style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}
          >
            {isSyncing
              ? <><i className="fas fa-circle-notch fa-spin"></i> <span>Sincronizzo…</span></>
              : synced
                ? <><i className="fas fa-check" style={{ color: '#16a34a' }}></i> <span style={{ color: '#16a34a' }}>Avviata</span></>
                : <><i className="fas fa-sync-alt"></i> <span>Sincronizza ora</span></>}
          </button>

          {/* Edit */}
          <button
            className="button-secondary"
            onClick={() => openEditForm(acc)}
            style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}
          >
            <i className="fas fa-pen"></i> <span>Modifica</span>
          </button>
        </div>

        {/* Inline edit form for this account */}
        {formMode === acc.id && renderForm()}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div id="account-management-panel" className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '540px', width: '100%' }}>

        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ margin: 0 }}>Gestione account PEC</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--c-text-muted)' }}>
              {isLoading ? 'Caricamento…' : `${accounts.length} account configurat${accounts.length === 1 ? 'o' : 'i'}`}
            </span>
          </div>
          <button onClick={onClose} className="modal-close-button">
            <svg viewBox="0 0 24 24">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          {/* New account form (shown at top when mode is 'new') */}
          {formMode === 'new' && renderForm()}

          {/* Account list */}
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--c-text-subtle)', padding: '0.5rem 0' }}>
              <i className="fas fa-circle-notch fa-spin" style={{ color: 'var(--c-primary)' }}></i>
              <span style={{ fontSize: '0.85rem' }}>Caricamento account…</span>
            </div>
          ) : accounts.length === 0 ? (
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--c-text-subtle)', textAlign: 'center', padding: '1rem 0' }}>
              Nessun account configurato.
            </p>
          ) : (
            accounts.map(renderAccountRow)
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="modal-footer-actions">
            <button className="button-secondary" onClick={onClose}>
              Chiudi
            </button>
            {formMode !== 'new' && (
              <button className="button-primary" onClick={openCreateForm}>
                <i className="fas fa-plus"></i> Aggiungi account
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AccountManagementPanel;
