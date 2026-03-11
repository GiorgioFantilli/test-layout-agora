import React, { useState, useEffect } from "react";
import { useAppContext } from "../AppContext";
import { fetchEmailAccounts, fetchMessageCount } from "../services/api";

function Sidebar() {
  const { state, dispatch } = useAppContext();

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

  const getInitials = (email) => {
    if (!email) return "";
    const namePart = email.split("@")[0];
    const parts = namePart.split(/[\.\-_]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return namePart.substring(0, 2).toUpperCase();
  };

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
          <button
            className={`sidebar-nav-item ${state.currentView === "pending" ? "active" : ""}`}
            onClick={() => handleViewChange("pending")}
          >
            <div className="ml-1">
              <i className="fas fa-clock"></i>
              <span>Da Protocollare</span>
            </div>
            <div className="mr-0">
              <span className="nav-item-badge">{pendingCount}</span>
            </div>
          </button>
          <button
            className={`sidebar-nav-item ${state.currentView === "processed" ? "active" : ""}`}
            onClick={() => handleViewChange("processed")}
          >
            <div className="ml-1">
              <i className="fas fa-check"></i>
              <span>Protocollate</span>
            </div>
            <div className="mr-[0]">
              <span className="nav-item-badge">{processedCount}</span>
            </div>
          </button>
        </nav>

        <hr className="sidebar-divider" />

        <div className="search-filter-area">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Cerca email..."
              className="navbar-search"
            />
            <i className="fas fa-search search-icon"></i>
          </div>
          <button
            id="filter-menu-btn"
            className="navbar-button"
            style={{ width: "100%", justifyContent: "space-between" }}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <i
                className="fas fa-sliders-h"
                style={{ marginRight: "0.5rem" }}
              ></i>
              <span>Filtri</span>
            </div>

            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span id="filter-count" className="filter-count-badge hidden">
                0
              </span>
              <i
                className={`fas fa-chevron-down filter-chevron ${isFiltersOpen ? "open" : ""}`}
              ></i>
            </div>
          </button>

          <hr className="sidebar-divider inset" />

          <div className={`applied-filters-wrapper`}>
            <div className="scroll-wrapper-outer">
              <div
                id="applied-filters"
                className={`applied-filters-area scrollbar-styled ${!isFiltersOpen ? "closed" : ""}`}
              >
                <div id="filter-tags" className="filter-tags-container">
                  <button className="filter-tag">
                    <i className="fas fa-user filter-tag-icon"></i>
                    <span className="filter-tag-text">
                      Da: mario.rossi.pec.ufficiale@pec.it
                    </span>
                    <i className="fas fa-times filter-tag-close"></i>
                  </button>
                  <button className="filter-tag">
                    <i className="fas fa-calendar-alt filter-tag-icon"></i>
                    <span className="filter-tag-text">Data: Oggi</span>
                    <i className="fas fa-times filter-tag-close"></i>
                  </button>
                  <button className="filter-tag">
                    <i className="fas fa-tag filter-tag-icon"></i>
                    <span className="filter-tag-text">
                      Oggetto: "Commercio e Attività Produttive per..."
                    </span>
                    <i className="fas fa-times filter-tag-close"></i>
                  </button>
                  <button className="filter-tag">
                    <i className="fas fa-paperclip filter-tag-icon"></i>
                    <span className="filter-tag-text">Con Allegati</span>
                    <i className="fas fa-times filter-tag-close"></i>
                  </button>
                  <button className="filter-tag">
                    <i className="fas fa-user filter-tag-icon"></i>
                    <span className="filter-tag-text">
                      Da: arch.fabio.marino@pec.it
                    </span>
                    <i className="fas fa-times filter-tag-close"></i>
                  </button>
                  <button className="filter-tag">
                    <i className="fas fa-tag filter-tag-icon"></i>
                    <span className="filter-tag-text">Oggetto: "SCIA"</span>
                    <i className="fas fa-times filter-tag-close"></i>
                  </button>

                  <button className="filter-tag">
                    <i className="fas fa-user filter-tag-icon"></i>
                    <span className="filter-tag-text">
                      Da: mario.rossi.pec.ufficiale@pec.it
                    </span>
                    <i className="fas fa-times filter-tag-close"></i>
                  </button>
                  <button className="filter-tag">
                    <i className="fas fa-calendar-alt filter-tag-icon"></i>
                    <span className="filter-tag-text">Data: Oggi</span>
                    <i className="fas fa-times filter-tag-close"></i>
                  </button>
                  <button className="filter-tag">
                    <i className="fas fa-tag filter-tag-icon"></i>
                    <span className="filter-tag-text">
                      Oggetto: "Commercio e Attività Produttive per..."
                    </span>
                    <i className="fas fa-times filter-tag-close"></i>
                  </button>
                  <button className="filter-tag">
                    <i className="fas fa-paperclip filter-tag-icon"></i>
                    <span className="filter-tag-text">Con Allegati</span>
                    <i className="fas fa-times filter-tag-close"></i>
                  </button>
                  <button className="filter-tag">
                    <i className="fas fa-user filter-tag-icon"></i>
                    <span className="filter-tag-text">
                      Da: arch.fabio.marino@pec.it
                    </span>
                    <i className="fas fa-times filter-tag-close"></i>
                  </button>
                  <button className="filter-tag">
                    <i className="fas fa-tag filter-tag-icon"></i>
                    <span className="filter-tag-text">Oggetto: "SCIA"</span>
                    <i className="fas fa-times filter-tag-close"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="user-controls">
          {/* Item 1: Utenti */}
          <div className="user-control-item user-stack-row">
            <div className="user-stack">
              {visibleAccounts.map((account, index) => (
                <div
                  key={account.id || index}
                  className={`user-bubble user-bubble-${index === 0 ? "mr" : "ab"}`}
                >
                  <span>{getInitials(account.address)}</span>
                </div>
              ))}
              {remainingCount > 0 && (
                <div className="user-bubble user-bubble-plus">
                  <span>+{remainingCount}</span>
                </div>
              )}
              {emailAccounts.length === 0 && (
                <div className="user-bubble">
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
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
