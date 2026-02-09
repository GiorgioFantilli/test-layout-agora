import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { emailData } from './data/mockData';

// Configuration object
const defaultConfig = { app_title: "Sistema Protocollo", comune_name: "Comune di Roma" };

// Initial state
const initialState = {
    currentView: 'pending',
    selectedEmailId: null,
    visuallyUnreadId: null,
    isFullscreen: false,
    unreadExpanded: false,
    emails: emailData,
    config: defaultConfig,
    theme: localStorage.getItem('theme') || 'light',
    analysisResults: {},
};

// Reducer to manage actions
function appReducer(state, action) {
    switch (action.type) {
        case 'SWITCH_VIEW':
            // Clear visual unread marker when switching views
            return { ...state, currentView: action.payload, isFullscreen: false, visuallyUnreadId: null };

        case 'SELECT_EMAIL':
            const newEmailsOnSelect = { ...state.emails };
            const newSelectedId = action.payload;
            let newVisuallyUnreadId = null;

            // Handle marking email as 'read'
            if (newEmailsOnSelect[newSelectedId] && newEmailsOnSelect[newSelectedId].status === 'unread') {
                newEmailsOnSelect[newSelectedId] = {
                    ...newEmailsOnSelect[newSelectedId],
                    status: 'read',
                    readDate: new Date().toISOString()
                };
                newVisuallyUnreadId = newSelectedId;
            }

            return {
                ...state,
                selectedEmailId: newSelectedId,
                isFullscreen: false,
                emails: newEmailsOnSelect,
                visuallyUnreadId: newVisuallyUnreadId
            };

        case 'CLOSE_EMAIL':
            return { ...state, selectedEmailId: null, isFullscreen: false, visuallyUnreadId: null };
        case 'TOGGLE_FULLSCREEN':
            return { ...state, isFullscreen: !state.isFullscreen };
        case 'TOGGLE_UNREAD':
            return { ...state, unreadExpanded: !state.unreadExpanded };
        case 'SET_THEME':
            localStorage.setItem('theme', action.payload);
            return { ...state, theme: action.payload };
        case 'TOGGLE_THEME':
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            return { ...state, theme: newTheme };
        case 'PROTOCOL_EMAIL':
            const newEmailsOnProtocol = { ...state.emails };
            if (newEmailsOnProtocol[action.payload]) {
                newEmailsOnProtocol[action.payload].status = 'processed';
            }
            return { ...state, emails: newEmailsOnProtocol, selectedEmailId: null, isFullscreen: false, visuallyUnreadId: null };
        case 'UPDATE_CONFIG':
            return { ...state, config: { ...state.config, ...action.payload } };
        case 'MARK_AS_ANALYZED':
             const newEmailsOnAnalyze = { ...state.emails };
            if (newEmailsOnAnalyze[action.payload] && (newEmailsOnAnalyze[action.payload].status === 'read' || newEmailsOnAnalyze[action.payload].status === 'unread')) {
                newEmailsOnAnalyze[action.payload].status = 'analyzed';
            }
            return {...state, emails: newEmailsOnAnalyze};

        case 'UPDATE_ANALYSIS_RESULTS':
            const { emailId, results } = action.payload;
            const newEmailResults = { ...(state.analysisResults[emailId] || {}) };
            
            Object.keys(results).forEach(key => {
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
        document.body.classList.remove('dark', 'light');
        document.body.classList.add(state.theme);

        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.className = state.theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }, [state.theme]);

    // Initialize theme on load
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        dispatch({ type: 'SET_THEME', payload: savedTheme });
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