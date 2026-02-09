import React, { useState } from 'react';
import { useAppContext } from '../AppContext';

function Sidebar() {
  const { state, dispatch } = useAppContext();

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const handleThemeToggle = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  const handleViewChange = (view) => {
    dispatch({ type: 'SWITCH_VIEW', payload: view });
  };

  const allEmails = Object.entries(state.emails);
  const pendingCount = allEmails
    .filter(([id, email]) => email.status === 'read' || email.status === 'unread' || email.status === 'analyzed')
    .length;
  const processedCount = allEmails
    .filter(([id, email]) => email.status === 'processed')
    .length;

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="app-info">
          <div className="app-title-wrapper">
            <div className="navbar-icon-bg"><i className="fas fa-envelope"></i></div>
            <div>
              <h1 id="app-title">{state.config.app_title}</h1>
              <h2>{state.config.comune_name}</h2>
            </div>
          </div>
          <span id="comune-name" style={{ display: 'none' }}>{state.config.comune_name}</span>
        </div>

        <nav className="sidebar-nav-group">
          <button 
            className={`sidebar-nav-item ${state.currentView === 'pending' ? 'active' : ''}`}
            onClick={() => handleViewChange('pending')}
          >
            <div className='ml-1'>
              <i className="fas fa-clock"></i>
              <span>Da Protocollare</span>
            </div>
            <div className='mr-0'>
              <span className="nav-item-badge">{pendingCount}</span>
            </div>
          </button>
          <button 
            className={`sidebar-nav-item ${state.currentView === 'processed' ? 'active' : ''}`}
            onClick={() => handleViewChange('processed')}
          >
            <div className='ml-1'>
              <i className="fas fa-check"></i>
              <span>Protocollate</span>
            </div>
            <div className='mr-[0]'>
              <span className="nav-item-badge">{processedCount}</span>
            </div>
          </button>
        </nav>

        <hr className="sidebar-divider" />

        <div className="search-filter-area">
          <div className="search-wrapper">
            <input type="text" placeholder="Cerca email..." className="navbar-search" />
            <i className="fas fa-search search-icon"></i>
          </div>
          <button 
            id="filter-menu-btn" 
            className="navbar-button" 
            style={{width: '100%', justifyContent: 'space-between'}}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <div style={{display: 'flex', alignItems: 'center'}}>
                <i className="fas fa-sliders-h" style={{marginRight: '0.5rem'}}></i>
                <span>Filtri</span>
            </div>
            
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <span id="filter-count" className="filter-count-badge hidden">0</span>
                <i className={`fas fa-chevron-down filter-chevron ${isFiltersOpen ? 'open' : ''}`}></i>
            </div>
          </button>
          
          <hr className="sidebar-divider inset" />

          <div className={`applied-filters-wrapper`}>
            <div className="scroll-wrapper-outer"> 
              <div id="applied-filters" className={`applied-filters-area scrollbar-styled ${!isFiltersOpen ? 'closed' : ''}`}>
                <div id="filter-tags" className="filter-tags-container">
                  <button className="filter-tag">
                    <i className="fas fa-user filter-tag-icon"></i>
                    <span className="filter-tag-text">Da: mario.rossi.pec.ufficiale@pec.it</span>
                    <i className="fas fa-times filter-tag-close"></i>
                  </button>
                  <button className="filter-tag">
                    <i className="fas fa-calendar-alt filter-tag-icon"></i>
                    <span className="filter-tag-text">Data: Oggi</span>
                    <i className="fas fa-times filter-tag-close"></i>
                  </button>
                  <button className="filter-tag">
                    <i className="fas fa-tag filter-tag-icon"></i>
                    <span className="filter-tag-text">Oggetto: "Commercio e Attività Produttive per..."</span>
                    <i className="fas fa-times filter-tag-close"></i>
                  </button>
                  <button className="filter-tag">
                    <i className="fas fa-paperclip filter-tag-icon"></i>
                    <span className="filter-tag-text">Con Allegati</span>
                    <i className="fas fa-times filter-tag-close"></i>
                  </button>
                  <button className="filter-tag">
                    <i className="fas fa-user filter-tag-icon"></i>
                    <span className="filter-tag-text">Da: arch.fabio.marino@pec.it</span>
                    <i className="fas fa-times filter-tag-close"></i>
                  </button>
                  <button className="filter-tag">
                    <i className="fas fa-tag filter-tag-icon"></i>
                    <span className="filter-tag-text">Oggetto: "SCIA"</span>
                    <i className="fas fa-times filter-tag-close"></i>
                  </button>

                  <button className="filter-tag">
                    <i className="fas fa-user filter-tag-icon"></i>
                    <span className="filter-tag-text">Da: mario.rossi.pec.ufficiale@pec.it</span>
                    <i className="fas fa-times filter-tag-close"></i>
                  </button>
                  <button className="filter-tag">
                    <i className="fas fa-calendar-alt filter-tag-icon"></i>
                    <span className="filter-tag-text">Data: Oggi</span>
                    <i className="fas fa-times filter-tag-close"></i>
                  </button>
                  <button className="filter-tag">
                    <i className="fas fa-tag filter-tag-icon"></i>
                    <span className="filter-tag-text">Oggetto: "Commercio e Attività Produttive per..."</span>
                    <i className="fas fa-times filter-tag-close"></i>
                  </button>
                  <button className="filter-tag">
                    <i className="fas fa-paperclip filter-tag-icon"></i>
                    <span className="filter-tag-text">Con Allegati</span>
                    <i className="fas fa-times filter-tag-close"></i>
                  </button>
                  <button className="filter-tag">
                    <i className="fas fa-user filter-tag-icon"></i>
                    <span className="filter-tag-text">Da: arch.fabio.marino@pec.it</span>
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
              <div className="user-bubble user-bubble-mr"><span>MR</span></div>
              <div className="user-bubble user-bubble-ab"><span>AB</span></div>
              <div className="user-bubble user-bubble-plus"><span>+3</span></div>
            </div>
            <span className="user-stack-text">mail.di.prova@pec.it<span className='text-muted'> – </span>mail.di.prova@pec.it<span className='text-muted'> – </span>mail.di.prova@pec.it</span>
          </div>

          {/* Item 2: Impostazioni */}
          <button className="user-control-item"> 
            <i className="fas fa-cog"></i> 
            <span>Impostazioni</span>
          </button>
          
          {/* Item 3: Tema */}
          <button id="theme-toggle" className="user-control-item" onClick={handleThemeToggle}>
            <i id="theme-icon" className={state.theme === 'light' ? 'fas fa-sun' : 'fas fa-moon'}></i>
            <span>
              {state.theme === 'light' ? 'Tema Chiaro' : 'Tema Scuro'}
            </span>
          </button>

        </div>

      </div>
    </aside>
  );
}

export default Sidebar;