import React from 'react';
import { useAppContext } from '../AppContext';
import EmailListPanel from './EmailListPanel';
import EmailDetailsPanel from './EmailDetailsPanel';

function MainContent() {
  const { state } = useAppContext();
  
  // Stili dinamici per i pannelli
  const listPanelStyle = {
    width: state.selectedEmailId ? '33.333333%' : '100%',
    // MODIFICATO: Aggiunta logica opacità e visibilità per fullscreen (Richiesta 3)
    opacity: state.isFullscreen ? 0 : 1,
    visibility: state.isFullscreen ? 'hidden' : 'visible',
    overflow: state.selectedEmailId ? 'hidden' : 'visible' // Gestisce lo overflow
  };

  const detailsPanelStyle = {
    width: state.isFullscreen ? '100%' : (state.selectedEmailId ? '66.666667%' : '0%'),
  };

  return (
    <div className="main-content">
      <div 
        id="email-list-panel" 
        className="flex-1 flex flex-col panel-transition overflow-hidden" 
        style={listPanelStyle}
      >
        <EmailListPanel />
      </div>
      
      {/* Il pannello dei dettagli viene montato/smontato in base alla selezione */}
      {state.selectedEmailId && (
        <EmailDetailsPanel 
          style={detailsPanelStyle} 
          emailId={state.selectedEmailId} 
        />
      )}
    </div>
  );
}

export default MainContent;