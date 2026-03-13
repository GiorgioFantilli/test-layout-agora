import React from "react";
import "./style.css";
import { AppProvider } from "./AppContext";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import Login from "./components/Login";
import { useSession } from "./hooks/useAuth";

function AppContent() {
  const { data: user, isLoading, isError } = useSession();

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
