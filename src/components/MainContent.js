import React from 'react';
import { useAppContext } from '../AppContext';
import EmailListPanel from './EmailList/EmailListPanel';
import EmailDetailsPanel from './MainCard/EmailDetailsPanel';

function MainContent() {
  const { state } = useAppContext();
  
  const isDetailsOpen = !!state.selectedEmailId;
  const isDetailsFullscreen = state.isFullscreen;

  // Calculate widths based on 84% total width for main-content
  const listWidth = (34 / 84) * 100;
  const detailsWidth = (48 / 84) * 100;

  const listPanelStyle = {
    width: isDetailsFullscreen ? '0%' : (isDetailsOpen ? `${listWidth}%` : '100%'),
    opacity: isDetailsFullscreen ? 0 : 1,
    visibility: isDetailsFullscreen ? 'hidden' : 'visible',
    overflow: 'hidden'
  };

  const detailsPanelStyle = {
    width: isDetailsFullscreen ? '100%' : (isDetailsOpen ? `${detailsWidth}%` : '0%'),
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