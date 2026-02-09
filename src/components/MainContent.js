import React from 'react';
import { useAppContext } from '../AppContext';
import EmailListPanel from './EmailList/EmailListPanel';
import EmailDetailsPanel from './MainCard/EmailDetailsPanel';

function MainContent() {
  const { state } = useAppContext();
  
  const isDetailsOpen = !!state.selectedEmailId;
  const isDetailsFullscreen = state.isFullscreen;

  // Calculate widths based on 84% total width for main-content
  const listWidth = (32.5 / 81.5) * 100;
  const detailsWidth = (47.5 / 81.5) * 100;

  const listPanelStyle = {
    width: isDetailsFullscreen ? '0%' : (isDetailsOpen ? `${listWidth}%` : '100%'),
    opacity: isDetailsFullscreen ? 0 : 1,
    visibility: isDetailsFullscreen ? 'hidden' : 'visible',
    overflow: 'hidden'
  };

  const detailsPanelStyle = {
    width: isDetailsFullscreen ? '100%' : (isDetailsOpen ? `${detailsWidth}%` : '0%'),
  };

  const listPanelClasses = [
    isDetailsFullscreen 
      ? 'panel-collapsing flex-1 flex flex-col panel-transition overflow-hidden' 
      : 'flex-1 flex flex-col panel-transition overflow-hidden'
  ].filter(Boolean).join(' ');

  return (
    <div className="main-content">
      <div 
        id="email-list-panel" 
        className={listPanelClasses}
        style={listPanelStyle}
      >
        <EmailListPanel />
      </div>
      
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