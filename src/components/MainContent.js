import React from 'react';
import { useAppContext } from '../AppContext';
import EmailListPanel from './EmailList/EmailListPanel';
import EmailDetailsPanel from './MainCard/EmailDetailsPanel';

function MainContent() {
  const { state } = useAppContext();
  
  const listPanelStyle = {
    width: state.selectedEmailId ? '33.333333%' : '100%',
    opacity: state.isFullscreen ? 0 : 1,
    visibility: state.isFullscreen ? 'hidden' : 'visible',
    overflow: state.selectedEmailId ? 'hidden' : 'visible'
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