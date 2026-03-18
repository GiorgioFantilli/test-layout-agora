import React from "react";
import "./style.css";
import { AppProvider, useAppContext } from "./AppContext";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import Login from "./components/Login";
import SystemHealthBanner from "./components/SystemHealthBanner";
import { useSession } from "./hooks/useAuth";

function AppContent() {
  const { data: user, isLoading } = useSession();
  const { state } = useAppContext();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner-large"></div>
        <p>Caricamento sessione...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="main-layout">
      <Sidebar />
      <div className={`content-wrapper ${state.sidebarPinned ? "sidebar--expanded" : ""}`}>
        <SystemHealthBanner />
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
