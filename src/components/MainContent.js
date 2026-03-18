import React from "react";
import { useAppContext } from "../AppContext";
import EmailListPanel from "./EmailList/EmailListPanel";
import EmailDetailsPanel from "./MainCard/EmailDetailsPanel";
import DashboardView from "./Dashboard/DashboardView";

function MainContent() {
  const { state } = useAppContext();

  if (state.currentView === "dashboard") {
    return (
      <div className="main-content h-full">
        <DashboardView />
      </div>
    );
  }

  const isDetailsOpen = !!state.selectedEmailId;
  const isDetailsFullscreen = state.isFullscreen;

  const listWidth = 45;
  const detailsWidth = 55;

  const listPanelStyle = {
    width: isDetailsFullscreen
      ? "0%"
      : isDetailsOpen
        ? `${listWidth}%`
        : "100%",
    opacity: isDetailsFullscreen ? 0 : 1,
    overflow: "hidden",
  };

  const detailsPanelStyle = {
    width: isDetailsFullscreen
      ? "100%"
      : isDetailsOpen
        ? `${detailsWidth}%`
        : "0%",
  };

  const listPanelClasses = [
    isDetailsFullscreen
      ? "panel-collapsing flex-1 flex flex-col panel-transition overflow-hidden"
      : "flex-1 flex flex-col panel-transition overflow-hidden",
  ]
    .filter(Boolean)
    .join(" ");

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
