import React, { createContext, useContext, useReducer, useEffect } from "react";

// Configuration object
const defaultConfig = {
  app_title: "Sistema Protocollo",
  comune_name: "Comune di Roma",
};

// Initial state
const initialState = {
  currentView: "pending",
  selectedEmailId: null,
  isFullscreen: false,
  emails: {},
  config: defaultConfig,
  theme: localStorage.getItem("theme") || "light",
  analysisResults: {},
  selectedEmailData: null,
  selectedAccountIds: [],
  sidebarPinned: true,
};

// Reducer to manage actions
function appReducer(state, action) {
  switch (action.type) {
    case "SWITCH_VIEW":
      return {
        ...state,
        currentView: action.payload,
        isFullscreen: false,
        selectedAccountIds: [],
      };

    case "SELECT_EMAIL":
      return {
        ...state,
        selectedEmailId: action.payload,
        selectedEmailData: null,
        isFullscreen: false,
      };

    case "CLOSE_EMAIL":
      return {
        ...state,
        selectedEmailId: null,
        selectedEmailData: null,
        isFullscreen: false,
      };
    case "SET_SELECTED_EMAIL_DATA":
      return { ...state, selectedEmailData: action.payload };

    case "SET_ACCOUNT_FILTER":
      return { ...state, selectedAccountIds: action.payload };
    case "TOGGLE_SIDEBAR_PIN":
      return { ...state, sidebarPinned: !state.sidebarPinned };
    case "TOGGLE_FULLSCREEN":
      return { ...state, isFullscreen: !state.isFullscreen };
    case "SET_THEME":
      localStorage.setItem("theme", action.payload);
      return { ...state, theme: action.payload };
    case "TOGGLE_THEME":
      const newTheme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      return { ...state, theme: newTheme };
    case "PROTOCOL_EMAIL":
      const newEmailsOnProtocol = { ...state.emails };
      if (newEmailsOnProtocol[action.payload]) {
        newEmailsOnProtocol[action.payload].status = "processed";
      }
      return {
        ...state,
        emails: newEmailsOnProtocol,
        selectedEmailId: null,
        isFullscreen: false,
      };
    case "UPDATE_CONFIG":
      return { ...state, config: { ...state.config, ...action.payload } };
    case "MARK_AS_ANALYZED":
      const newEmailsOnAnalyze = { ...state.emails };
      if (
        newEmailsOnAnalyze[action.payload] &&
        newEmailsOnAnalyze[action.payload].status === "pending"
      ) {
        newEmailsOnAnalyze[action.payload].status = "analyzed";
      }
      return { ...state, emails: newEmailsOnAnalyze };

    case "UPDATE_ANALYSIS_RESULTS":
      const { emailId, results } = action.payload;
      const newEmailResults = { ...(state.analysisResults[emailId] || {}) };

      Object.keys(results).forEach((key) => {
        if (results[key] === null) {
          delete newEmailResults[key];
        } else {
          newEmailResults[key] = results[key];
        }
      });

      return {
        ...state,
        analysisResults: {
          ...state.analysisResults,
          [emailId]: newEmailResults,
        },
      };

    case "SET_EMAILS":
      return {
        ...state,
        emails: action.payload,
      };

    case "UPDATE_EMAIL_BODY":
      const { id: eId, body: eBody } = action.payload;
      if (state.emails[eId] && state.emails[eId].body) return state;

      return {
        ...state,
        emails: {
          ...state.emails,
          [eId]: {
            ...state.emails[eId],
            body: eBody,
          },
        },
      };

    case "APPEND_EMAILS":
      return {
        ...state,
        emails: {
          ...state.emails,
          ...action.payload,
        },
      };

    default:
      return state;
  }
}

const AppContext = createContext();

// Provider Component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Effect for managing 'dark'/'light' theme
  useEffect(() => {
    document.body.classList.remove("dark", "light");
    document.body.classList.add(state.theme);

    const themeIcon = document.getElementById("theme-icon");
    if (themeIcon) {
      themeIcon.className =
        state.theme === "dark" ? "fas fa-moon" : "fas fa-sun";
    }
  }, [state.theme]);

  // Initialize theme on load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    dispatch({ type: "SET_THEME", payload: savedTheme });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
