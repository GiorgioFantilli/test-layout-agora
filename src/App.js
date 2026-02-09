
import React from 'react';
import './style.css';
import { AppProvider } from './AppContext'; 
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';


function AppContent() {
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