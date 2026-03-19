import React, { useState } from "react";
import { useAppContext } from "../AppContext";
import { useSession, useLogout } from "../hooks/useAuth";
import { useMessageCount } from "../hooks/useEmails";
import AccountManagementPanel from "./AccountManagementPanel";

function Sidebar() {
  const { state, dispatch } = useAppContext();
  const [showAccountPanel, setShowAccountPanel] = useState(false);
  const { data: user } = useSession();
  const logoutMutation = useLogout();

  // "Da lavorare": pipeline completata, in attesa di azione operatore
  const { data: readyCount = 0 } = useMessageCount(
    [],
    {},
    [],
    ["COMPLETED", "MANUAL_REVIEW"],
    false,
  );
  // "In elaborazione": pipeline in corso o non ancora avviata, senza errori
  const { data: processingCount = 0 } = useMessageCount(
    [],
    {},
    [],
    ["NULL", "PENDING", "CONTEXT_READY", "LLM_GENERATION"],
    false,
  );
  // "In errore": ingest o parsing in stato di errore
  const { data: errorCount = 0 } = useMessageCount([], {}, [], [], true);

  const handleViewChange = (view) => {
    dispatch({ type: "SWITCH_VIEW", payload: view });
  };

  const handleThemeToggle = () => {
    dispatch({ type: "TOGGLE_THEME" });
  };

  const handlePinToggle = () => {
    dispatch({ type: "TOGGLE_SIDEBAR_PIN" });
  };

  const expanded = state.sidebarPinned;

  return (
    <>
      <aside className={`sidebar ${expanded ? "sidebar--expanded" : ""}`}>
        {/* Header: logo + pin button */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <i className="fas fa-envelope"></i>
            </div>
            <div className="sidebar-logo-text">
              <span className="sidebar-logo-title">
                {state.config.app_title}
              </span>
              <span className="sidebar-logo-comune">
                {state.config.comune_name}
              </span>
            </div>
          </div>
          <button
            className="sidebar-pin-btn"
            onClick={handlePinToggle}
            title={expanded ? "Comprimi sidebar" : "Espandi sidebar"}
          >
            <i className={`fas fa-chevron-${expanded ? "left" : "right"}`}></i>
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${state.currentView === "ready" ? "active" : ""}`}
            data-count={readyCount || ""}
            onClick={() => handleViewChange("ready")}
            title={!expanded ? "Da lavorare" : undefined}
          >
            <i className="fas fa-inbox sidebar-nav-icon"></i>
            <span className="sidebar-nav-label">Da lavorare</span>
            <span className="sidebar-nav-badge">{readyCount}</span>
          </button>

          <button
            className={`sidebar-nav-item ${state.currentView === "processing" ? "active" : ""}`}
            data-count={processingCount || ""}
            onClick={() => handleViewChange("processing")}
            title={!expanded ? "In elaborazione" : undefined}
          >
            <i className="fas fa-spinner sidebar-nav-icon"></i>
            <span className="sidebar-nav-label">In elaborazione</span>
            <span className="sidebar-nav-badge">{processingCount}</span>
          </button>

          <button
            className={`sidebar-nav-item sidebar-nav-item--error ${state.currentView === "error" ? "active" : ""}`}
            data-count={errorCount || ""}
            onClick={() => handleViewChange("error")}
            title={!expanded ? "In errore" : undefined}
          >
            <i className="fas fa-exclamation-triangle sidebar-nav-icon"></i>
            <span className="sidebar-nav-label">In errore</span>
            {errorCount > 0 && (
              <span className="sidebar-nav-badge sidebar-nav-badge--error">
                {errorCount}
              </span>
            )}
          </button>
          <button
            className={`sidebar-nav-item ${state.currentView === "dashboard" ? "active" : ""}`}
            onClick={() => handleViewChange("dashboard")}
            title={!expanded ? "Control Room Dashboard" : undefined}
          >
            <i className="fas fa-chart-line sidebar-nav-icon"></i>
            <span className="sidebar-nav-label">Control Room</span>
          </button>
        </nav>

        {/* Spacer */}
        <div className="sidebar-spacer"></div>

        {/* Bottom controls */}
        <div className="sidebar-bottom">
          <button
            className="sidebar-nav-item"
            onClick={() => setShowAccountPanel(true)}
            title={!expanded ? "Impostazioni account PEC" : undefined}
          >
            <i className="fas fa-cog sidebar-nav-icon"></i>
            <span className="sidebar-nav-label">Impostazioni</span>
          </button>

          <button
            className="sidebar-nav-item"
            onClick={handleThemeToggle}
            title={
              !expanded
                ? state.theme === "light"
                  ? "Tema Chiaro"
                  : "Tema Scuro"
                : undefined
            }
          >
            <i
              className={`fas fa-${state.theme === "light" ? "sun" : "moon"} sidebar-nav-icon`}
            ></i>
            <span className="sidebar-nav-label">
              {state.theme === "light" ? "Tema Chiaro" : "Tema Scuro"}
            </span>
          </button>

          <button
            className="sidebar-nav-item sidebar-nav-item--danger"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isLoading}
            title={!expanded ? "Logout" : undefined}
          >
            <i className="fas fa-sign-out-alt sidebar-nav-icon"></i>
            <span className="sidebar-nav-label">
              {logoutMutation.isLoading ? "Esco..." : "Logout"}
            </span>
          </button>
        </div>

        {/* User footer */}
        {user && (
          <div className="sidebar-footer">
            <div className="sidebar-footer-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-footer-info">
              <span className="sidebar-footer-name">
                {user.full_name || user.username}
              </span>
              <span className="sidebar-footer-tenant">{user.tenant_name}</span>
            </div>
          </div>
        )}
      </aside>

      <AccountManagementPanel
        isOpen={showAccountPanel}
        onClose={() => setShowAccountPanel(false)}
      />
    </>
  );
}

export default Sidebar;
