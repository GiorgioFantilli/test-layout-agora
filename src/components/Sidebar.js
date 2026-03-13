import React, { useState, useEffect } from "react";
import { useAppContext } from "../AppContext";
import { fetchEmailAccounts, fetchMessageCount } from "../services/api";
import UserIcon from "./UserIcon";
import { useSession, useLogout } from "../hooks/useAuth";

function Sidebar() {
  const { state, dispatch } = useAppContext();
  const { data: user } = useSession();
  const logoutMutation = useLogout();

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleThemeToggle = () => {
    dispatch({ type: "TOGGLE_THEME" });
  };

  const handleViewChange = (view) => {
    dispatch({ type: "SWITCH_VIEW", payload: view });
  };

  const [emailAccounts, setEmailAccounts] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchEmailAccounts(controller.signal)
      .then((data) => {
        if (Array.isArray(data)) {
          setEmailAccounts(data);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Errore nel recupero degli account email:", err);
        }
      });

    return () => controller.abort();
  }, []);

  const visibleAccounts = emailAccounts.slice(0, 2);
  const remainingCount =
    emailAccounts.length > 2 ? emailAccounts.length - 2 : 0;

  const [pendingCount, setPendingCount] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchMessageCount(controller.signal, ["READY_TO_PARSE"])
      .then((data) => setPendingCount(data))
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      });
    // TODO: cambiare nello stato "protocollato"
    fetchMessageCount(controller.signal, ["processed"])
      .then((data) => setProcessedCount(data))
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      });

    return () => controller.abort();
  }, [state.emails]);

  const showAccountSelection =
    emailAccounts.length > 1 || state.forceShowAccountSelection;

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="app-info">
          <div className="app-title-wrapper">
            <div className="navbar-icon-bg">
              <i className="fas fa-envelope"></i>
            </div>
            <div>
              <h1 id="app-title">{state.config.app_title}</h1>
              <h2>{state.config.comune_name}</h2>
            </div>
          </div>
          <span id="comune-name" style={{ display: "none" }}>
            {state.config.comune_name}
          </span>
        </div>

        <nav className="sidebar-nav-group">
          {/* Da Protocollare */}
          <div className="sidebar-drawer-container">
            <button
              className={`sidebar-nav-item ${state.currentView === "pending" ? "active" : ""}`}
              onClick={() => handleViewChange("pending")}
            >
              <div className="ml-1 flex items-center">
                <i className="fas fa-clock"></i>
                <span>Da Protocollare</span>
              </div>
              <div className="mr-0 flex items-center gap-2">
                <span className="nav-item-badge">{pendingCount}</span>
                {showAccountSelection && (
                  <i
                    className={`fas fa-chevron-down filter-chevron ${state.currentView === "pending" ? "open" : ""}`}
                  ></i>
                )}
              </div>
            </button>

            {state.currentView === "pending" && showAccountSelection && (
              <div className="account-list-drawer">
                <button
                  className={`account-list-item ${state.selectedAccountId === null ? "active" : ""}`}
                  onClick={() =>
                    dispatch({ type: "SET_ACCOUNT_FILTER", payload: null })
                  }
                >
                  <i className="fas fa-layer-group"></i>
                  <span>Tutte le PEC</span>
                </button>
                {emailAccounts.map((account) => (
                  <button
                    key={account.id}
                    className={`account-list-item ${state.selectedAccountId === account.id ? "active" : ""}`}
                    onClick={() =>
                      dispatch({
                        type: "SET_ACCOUNT_FILTER",
                        payload: account.id,
                      })
                    }
                  >
                    <UserIcon email={account.address} size="sm" />
                    <span>{account.address}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Protocollate */}
          <div className="sidebar-drawer-container">
            <button
              className={`sidebar-nav-item ${state.currentView === "processed" ? "active" : ""}`}
              onClick={() => handleViewChange("processed")}
            >
              <div className="ml-1 flex items-center">
                <i className="fas fa-check"></i>
                <span>Protocollate</span>
              </div>
              <div className="mr-[0] flex items-center gap-2">
                <span className="nav-item-badge">{processedCount}</span>
                {showAccountSelection && (
                  <i
                    className={`fas fa-chevron-down filter-chevron ${state.currentView === "processed" ? "open" : ""}`}
                  ></i>
                )}
              </div>
            </button>

            {state.currentView === "processed" && showAccountSelection && (
              <div className="account-list-drawer">
                <button
                  className={`account-list-item ${state.selectedAccountId === null ? "active" : ""}`}
                  onClick={() =>
                    dispatch({ type: "SET_ACCOUNT_FILTER", payload: null })
                  }
                >
                  <i className="fas fa-layer-group"></i>
                  <span>Tutte le PEC</span>
                </button>
                {emailAccounts.map((account) => (
                  <button
                    key={account.id}
                    className={`account-list-item ${state.selectedAccountId === account.id ? "active" : ""}`}
                    onClick={() =>
                      dispatch({
                        type: "SET_ACCOUNT_FILTER",
                        payload: account.id,
                      })
                    }
                  >
                    <UserIcon email={account.address} size="sm" />
                    <span>{account.address}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <hr className="sidebar-divider" />

        <div className="user-controls">
          {/* Item 1: Utenti */}
          <div className="user-control-item user-stack-row">
            <div className="user-stack">
              {visibleAccounts.map((account, index) => (
                <UserIcon
                  key={account.id || index}
                  email={account.address}
                  size="sm"
                  className={index > 0 ? "ml-[-0.4rem]" : ""}
                />
              ))}
              {remainingCount > 0 && (
                <div
                  className="user-icon-bubble user-icon-sm ml-[-0.4rem]"
                  style={{ backgroundColor: "#a855f7" }}
                >
                  <span>+{remainingCount}</span>
                </div>
              )}
              {emailAccounts.length === 0 && (
                <div className="user-icon-bubble user-icon-sm">
                  <span>--</span>
                </div>
              )}
            </div>
            <span className="user-stack-text">
              {emailAccounts.length > 0
                ? emailAccounts.map((a, i) => (
                    <React.Fragment key={a.id || i}>
                      {a.address}
                      {i < emailAccounts.length - 1 && (
                        <span className="text-muted"> – </span>
                      )}
                    </React.Fragment>
                  ))
                : "Caricamento..."}
            </span>
          </div>

          {/* Item 2: Impostazioni */}
          <button className="user-control-item">
            <i className="fas fa-cog"></i>
            <span>Impostazioni</span>
          </button>

          {/* Item 3: Tema */}
          <button
            id="theme-toggle"
            className="user-control-item"
            onClick={handleThemeToggle}
          >
            <i
              id="theme-icon"
              className={state.theme === "light" ? "fas fa-sun" : "fas fa-moon"}
            ></i>
            <span>
              {state.theme === "light" ? "Tema Chiaro" : "Tema Scuro"}
            </span>
          </button>

          {/* Item 4: Logout */}
          <button
            className="user-control-item logout-button"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isLoading}
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>{logoutMutation.isLoading ? "Esco..." : "Logout"}</span>
          </button>
        </div>

        {user && (
          <div className="sidebar-footer-user">
            <div className="user-avatar-sm">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-info-sm">
              <span className="user-name-sm">
                {user.full_name || user.username}
              </span>
              <span className="user-tenant-sm">{user.tenant_name}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
