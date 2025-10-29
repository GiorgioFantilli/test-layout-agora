import React from 'react';
import { useAppContext } from '../AppContext';

function Sidebar() {
  const { state, dispatch } = useAppContext();
  
  const handleThemeToggle = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="app-info">
          <div className="app-title-wrapper">
            <div className="navbar-icon-bg"><i className="fas fa-envelope"></i></div>
            <h1 id="app-title">{state.config.app_title}</h1>
          </div>
          <span id="comune-name" style={{ display: 'none' }}>{state.config.comune_name}</span>
        </div>
        <div className="search-filter-area">
          <div className="search-wrapper">
            <input type="text" placeholder="Cerca email..." className="navbar-search" />
            <i className="fas fa-search search-icon"></i>
          </div>
          <button id="filter-menu-btn" className="navbar-button" style={{width: '100%', justifyContent: 'flex-start'}}>
            <i className="fas fa-sliders-h" style={{marginRight: '0.5rem'}}></i>
            Filtri
            <span id="filter-count" className="filter-count-badge hidden" style={{marginLeft: 'auto'}}>0</span>
          </button>
        </div>
        
        <div className="user-controls">
          <div className="user-stack">
            <div className="user-bubble user-bubble-mr"><span>MR</span></div>
            <div className="user-bubble user-bubble-ab"><span>AB</span></div>
            <div className="user-bubble user-bubble-plus"><span>+3</span></div>
          </div>
          <button className="navbar-button"> <i className="fas fa-cog"></i> Impostazioni </button>
          <button id="theme-toggle" className="navbar-button" onClick={handleThemeToggle}>
            <i id="theme-icon" className={state.theme === 'light' ? 'fas fa-sun' : 'fas fa-moon'}></i>
            {state.theme === 'light' ? 'Tema Chiaro' : 'Tema Scuro'}
          </button>
        </div>

        <div className="applied-filters-wrapper">
          <div id="applied-filters" className="applied-filters-area scrollbar-styled">
            <div id="filter-tags" className="filter-tags-container" style={{flexWrap: 'wrap', justifyContent: 'flex-start'}}>
              {/* Filtri statici come da HTML */}
              <span className="filter-tag">Da: mario.rossi... <button><i className="fas fa-times"></i></button></span>
              <span className="filter-tag">Data: Oggi <button><i className="fas fa-times"></i></button></span>
              <span className="filter-tag">Oggetto: "Com..." <button><i className="fas fa-times"></i></button></span>
              <span className="filter-tag">Con Allegati <button><i className="fas fa-times"></i></button></span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;