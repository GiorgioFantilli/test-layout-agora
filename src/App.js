import React, { useEffect } from 'react';
import './style.css'; // Importa il tuo CSS
import { AppProvider, useAppContext } from './AppContext';
import Sidebar from './components/Sidebar'; // Import Sidebar instead of Navbar
import MainContent from './components/MainContent';

// Spostiamo qui la logica SDK
const defaultConfig = { app_title: "Sistema Protocollo PEC", comune_name: "Comune di Roma" };
const capabilities = { recolorables: [], borderables: [], fontEditable: undefined, fontSizeable: undefined };

function AppContent() {
  const { state, dispatch } = useAppContext();

  // Logica Element SDK
  useEffect(() => {
    if (window.elementSdk) {
      const render = (config) => {
        dispatch({ type: 'UPDATE_CONFIG', payload: config });
      };
      
      const mapToEditPanelValues = (config) => {
        return new Map([
          ["app_title", config.app_title || defaultConfig.app_title],
          ["comune_name", config.comune_name || defaultConfig.comune_name]
        ]);
      };

      // Usa lo stato del contesto per mapToEditPanelValues
      const sdkConfig = state.config || defaultConfig;
      window.elementSdk.init({ 
        defaultConfig: sdkConfig, 
        render, 
        mapToCapabilities: () => capabilities, 
        mapToEditPanelValues: () => mapToEditPanelValues(sdkConfig) 
      });
    }
  }, [state.config, dispatch]);


  return (
    <div className="main-layout">
      <Sidebar />
      <div className="content-wrapper">
        <MainContent />
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;