import React from 'react';
import { useAppContext } from '../AppContext';

function Navbar() {
  const { state, dispatch } = useAppContext();
  
  const handleThemeToggle = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  return (
    <nav className="navbar shadow-xl flex-shrink-0">
      <div className="navbar-content">
        <div className="app-info">
          <div className="app-title-wrapper">
            <div className="navbar-icon-bg"><i className="fas fa-envelope"></i></div>
            <h1 id="app-title">{state.config.app_title}</h1>
          </div>
          <span id="comune-name" style={{ display: 'none' }}>{state.config.comune_name}</span>
        </div>
        <div className="search-filter-area">
          <div className="search-wrapper">
            <input type="text" placeholder="Cerca email, mittenti, oggetti..." className="navbar-search" />
            <i className="fas fa-search search-icon"></i>
          </div>
          <button id="filter-menu-btn" className="navbar-button">
            <i className="fas fa-sliders-h"></i>
            <span id="filter-count" className="filter-count-badge hidden">0</span>
          </button>
        </div>
        <div className="user-controls">
          <div className="user-stack">
            <div className="user-bubble user-bubble-mr"><span>MR</span></div>
            <div className="user-bubble user-bubble-ab"><span>AB</span></div>
            <div className="user-bubble user-bubble-plus"><span>+3</span></div>
          </div>
          <div className="navbar-divider"></div>
          <button className="navbar-button"> <i className="fas fa-cog"></i> </button>
          <button id="theme-toggle" className="navbar-button" onClick={handleThemeToggle}>
            <i id="theme-icon" className={state.theme === 'light' ? 'fas fa-sun' : 'fas fa-moon'}></i>
          </button>
        </div>
        <div className="applied-filters-wrapper">
          <div id="applied-filters" className="applied-filters-area scrollbar-styled">
            <div id="filter-tags" className="filter-tags-container">
              {/* Filtri statici come da HTML */}
              <span className="filter-tag">Da: mario.rossi@pec.it <button><i className="fas fa-times"></i></button></span>
              <span className="filter-tag">Data: Oggi <button><i className="fas fa-times"></i></button></span>
              <span className="filter-tag">Oggetto: "Commercio" <button><i className="fas fa-times"></i></button></span>
              <span className="filter-tag">Con Allegati <button><i className="fas fa-times"></i></button></span>
              <span className="filter-tag">Priorità: Alta <button><i className="fas fa-times"></i></button></span>
              <span className="filter-tag">Reparto: SUAP <button><i className="fas fa-times"></i></button></span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;