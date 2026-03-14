import React, { useState, useRef, useEffect } from "react";
import { useAppContext } from "../../AppContext";
import { useEmailAccounts } from "../../hooks/useEmails";
import UserIcon from "../UserIcon";

const PILL_THRESHOLD = 5;

function AccountFilter() {
  const { state, dispatch } = useAppContext();
  const { data: accounts = [] } = useEmailAccounts();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  // Chiudi dropdown al click esterno
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const { selectedAccountIds } = state;

  const toggleAccount = (id) => {
    if (selectedAccountIds.length === 0) {
      dispatch({ type: "SET_ACCOUNT_FILTER", payload: [id] });
    } else if (selectedAccountIds.includes(id)) {
      const next = selectedAccountIds.filter((x) => x !== id);
      dispatch({ type: "SET_ACCOUNT_FILTER", payload: next });
    } else {
      dispatch({ type: "SET_ACCOUNT_FILTER", payload: [...selectedAccountIds, id] });
    }
  };

  const clearFilter = () => dispatch({ type: "SET_ACCOUNT_FILTER", payload: [] });

  // Con 0 o 1 account non serve il filtro
  if (accounts.length <= 1) return null;

  // --- Modalità pill (≤5 account) ---
  if (accounts.length <= PILL_THRESHOLD) {
    return (
      <div className="account-filter account-filter--pills">
        <button
          className={`account-pill ${selectedAccountIds.length === 0 ? "active" : ""}`}
          onClick={clearFilter}
        >
          Tutte
        </button>
        {accounts.map((acc) => (
          <button
            key={acc.id}
            className={`account-pill ${selectedAccountIds.includes(acc.id) ? "active" : ""}`}
            onClick={() => toggleAccount(acc.id)}
            title={acc.address}
          >
            {acc.address.split("@")[0]}
          </button>
        ))}
      </div>
    );
  }

  // --- Modalità dropdown ricercabile (>5 account) ---
  const hasFilter = selectedAccountIds.length > 0;
  const triggerLabel = hasFilter
    ? `${selectedAccountIds.length} casett${selectedAccountIds.length === 1 ? "a" : "e"} selezionat${selectedAccountIds.length === 1 ? "a" : "e"}`
    : "Tutte le PEC";

  const filteredAccounts = accounts.filter((acc) =>
    acc.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="account-filter account-filter--dropdown" ref={containerRef}>
      <div className="account-filter-controls">
        <button
          className={`account-filter-trigger ${hasFilter ? "active" : ""}`}
          onClick={() => setDropdownOpen((o) => !o)}
        >
          <i className="fas fa-filter"></i>
          <span>{triggerLabel}</span>
          <i className={`fas fa-chevron-down account-filter-chevron ${dropdownOpen ? "open" : ""}`}></i>
        </button>
        {hasFilter && (
          <button className="account-filter-clear" onClick={clearFilter} title="Rimuovi filtri">
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      {dropdownOpen && (
        <div className="account-filter-dropdown">
          <div className="account-filter-search">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Cerca casella..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="account-filter-list">
            <button
              className={`account-filter-option ${selectedAccountIds.length === 0 ? "active" : ""}`}
              onClick={clearFilter}
            >
              <i className="fas fa-layer-group"></i>
              <span>Tutte le PEC</span>
              {selectedAccountIds.length === 0 && (
                <i className="fas fa-check account-filter-check"></i>
              )}
            </button>
            {filteredAccounts.map((acc) => (
              <button
                key={acc.id}
                className={`account-filter-option ${selectedAccountIds.includes(acc.id) ? "active" : ""}`}
                onClick={() => toggleAccount(acc.id)}
              >
                <UserIcon email={acc.address} size="xs" />
                <span title={acc.address}>{acc.address}</span>
                {selectedAccountIds.includes(acc.id) && (
                  <i className="fas fa-check account-filter-check"></i>
                )}
              </button>
            ))}
            {filteredAccounts.length === 0 && (
              <p className="account-filter-empty">Nessuna casella trovata</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountFilter;
