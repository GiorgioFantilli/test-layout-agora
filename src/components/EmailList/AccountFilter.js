import React, { useState, useRef, useEffect } from "react";
import { useAppContext } from "../../AppContext";
import { useEmailAccounts } from "../../hooks/useEmails";
import UserIcon from "../UserIcon";


function AccountFilter() {
  const { state, dispatch } = useAppContext();

  const { data: realAccounts = [] } = useEmailAccounts();
  const dummyAccounts = [
    { id: 101, address: "segreteria@comune.demo.it" },
    { id: 102, address: "ufficio.tecnico@comune.demo.it" },
    { id: 103, address: "polizia.locale@comune.demo.it" },
    { id: 104, address: "servizi.sociali@comune.demo.it" },
    { id: 105, address: "anagrafe@comune.demo.it" },
    { id: 106, address: "ragioneria@comune.demo.it" },
  ];
  const accounts = [...realAccounts, ...dummyAccounts];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

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

  if (accounts.length < 2) return null;

  // --- Modalità dropdown ricercabile (>= 2 account) ---
  const hasFilter = selectedAccountIds.length > 0;

  // Icons for the trigger
  const AccountIcons = () => {
    if (!hasFilter) {
      return (
        <div className="pec-icon-circle">
          <i className="fas fa-layer-group"></i>
        </div>
      );
    }

    const selectedAccounts = accounts.filter((acc) => selectedAccountIds.includes(acc.id));
    const maxVisible = 3;
    const displayAccounts = selectedAccounts.slice(0, maxVisible);
    const overflow = selectedAccounts.length - maxVisible;

    return (
      <div className="account-icons-stack">
        {displayAccounts.map((acc, i) => (
          <UserIcon
            key={acc.id}
            email={acc.address}
            size="xs"
            className="stack-icon"
            style={{ zIndex: 10 + i }}
          />
        ))}
        {overflow > 0 && (
          <div className="user-icon-bubble user-icon-xs user-icon-overflow">
            <span>+{overflow}</span>
          </div>
        )}
      </div>
    );
  };

  const getTriggerLabel = () => {
    if (!hasFilter) return "Tutte le PEC";
    if (selectedAccountIds.length === 1) {
      const acc = accounts.find((a) => a.id === selectedAccountIds[0]);
      return acc ? acc.address.split("@")[0] : "1 PEC";
    }
    return `${selectedAccountIds.length} PEC`;
  };

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
          <AccountIcons />
          <span>{getTriggerLabel()}</span>
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
              <div className="pec-icon-circle">
                <i className="fas fa-layer-group"></i>
              </div>
              <span>Tutte le PEC</span>
              {selectedAccountIds.length === 0 && (
                <i className="fas fa-check account-filter-check"></i>
              )}
            </button>
            {filteredAccounts.map((acc) => (
              <button
                key={acc.id}
                className={`account-filter-option ${selectedAccountIds.includes(acc.id) ? "active" : ""} ${acc.enabled === false ? "account-filter-option--disabled" : ""}`}
                onClick={() => toggleAccount(acc.id)}
              >
                <UserIcon email={acc.address} size="xs" className={acc.enabled === false ? "account-icon--muted" : ""} />
                <span title={acc.address}>{acc.address}</span>
                {acc.enabled === false && (
                  <span className="account-filter-disabled-tag">Inattiva</span>
                )}
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
