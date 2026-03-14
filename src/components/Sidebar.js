import React from "react";
import { useAppContext } from "../AppContext";
import { useSession, useLogout } from "../hooks/useAuth";
import { useMessageCount } from "../hooks/useEmails";
import { BACKEND_STATUS } from "../services/dtoMappers";

function Sidebar() {
  const { state, dispatch } = useAppContext();
  const { data: user } = useSession();
  const logoutMutation = useLogout();

  const { data: pendingCount = 0 } = useMessageCount([BACKEND_STATUS.PERSISTED]);
  const { data: processedCount = 0 } = useMessageCount([BACKEND_STATUS.PROCESSED]);

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
    <aside className={`sidebar ${expanded ? "sidebar--expanded" : ""}`}>

      {/* Header: logo + pin button */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <i className="fas fa-envelope"></i>
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">{state.config.app_title}</span>
            <span className="sidebar-logo-comune">{state.config.comune_name}</span>
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
          className={`sidebar-nav-item ${state.currentView === "pending" ? "active" : ""}`}
          data-count={pendingCount || ""}
          onClick={() => handleViewChange("pending")}
          title={!expanded ? "Da Protocollare" : undefined}
        >
          <i className="fas fa-clock sidebar-nav-icon"></i>
          <span className="sidebar-nav-label">Da Protocollare</span>
          <span className="sidebar-nav-badge">{pendingCount}</span>
        </button>

        <button
          className={`sidebar-nav-item ${state.currentView === "processed" ? "active" : ""}`}
          data-count={processedCount || ""}
          onClick={() => handleViewChange("processed")}
          title={!expanded ? "Protocollate" : undefined}
        >
          <i className="fas fa-check-circle sidebar-nav-icon"></i>
          <span className="sidebar-nav-label">Protocollate</span>
          <span className="sidebar-nav-badge">{processedCount}</span>
        </button>
      </nav>

      {/* Spacer */}
      <div className="sidebar-spacer"></div>

      {/* Bottom controls */}
      <div className="sidebar-bottom">
        <button
          className="sidebar-nav-item"
          disabled
          title={!expanded ? "Impostazioni (presto disponibile)" : undefined}
        >
          <i className="fas fa-cog sidebar-nav-icon"></i>
          <span className="sidebar-nav-label">Impostazioni</span>
        </button>

        <button
          className="sidebar-nav-item"
          onClick={handleThemeToggle}
          title={!expanded ? (state.theme === "light" ? "Tema Chiaro" : "Tema Scuro") : undefined}
        >
          <i className={`fas fa-${state.theme === "light" ? "sun" : "moon"} sidebar-nav-icon`}></i>
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
            <span className="sidebar-footer-name">{user.full_name || user.username}</span>
            <span className="sidebar-footer-tenant">{user.tenant_name}</span>
          </div>
        </div>
      )}

    </aside>
  );
}

export default Sidebar;
