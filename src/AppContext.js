import React, { createContext, useContext, useReducer, useEffect } from 'react';

// --- Demo Data (dal tuo index.js) ---
const emailData = {
    'unread1': { sender: 'Mario Rossi', email: 'mario.rossi@pec.it', subject: 'Richiesta autorizzazione commercio', body: 'Gentili Signori,\n\ncon la presente richiedo l\'autorizzazione per l\'apertura di un\'attività commerciale presso Via Roma 123.\n\nIn allegato trovate tutta la documentazione necessaria:\n- Planimetria del locale\n- Certificato di agibilità\n- Documento di identità\n- Dichiarazione inizio attività\n- Foto esterno locale\n- Visura camerale\n\nResto in attesa di riscontro.\n\nCordiali saluti,\nMario Rossi', attachments: 6, status: 'pending' },
    'unread2': { sender: 'Giulia Bianchi', email: 'g.bianchi@pec.it', subject: 'Certificato di residenza', body: 'Buongiorno, richiedo cortesemente il certificato di residenza aggiornato. Serve per pratiche INPS.\n\nGrazie mille,\nGiulia Bianchi', attachments: 1, status: 'pending' },
    'unread3': { sender: 'Luca Verdi', email: 'luca.verdi@pec.it', subject: 'Permesso ZTL', body: 'Allego la documentazione per il rinnovo del permesso ZTL per l\'anno corrente.\n\nDistinti saluti,\nLuca Verdi', attachments: 2, status: 'pending' },
    'unread4': { sender: 'Paolo Viola', email: 'p.viola@pec.it', subject: 'Richiesta contributi', body: 'Spett.le Comune, inoltro richiesta di contributi per l\'associazione sportiva "ASD Calcio Giovani".\nResto a disposizione per chiarimenti.', attachments: 0, status: 'pending' },
    'unread5': { sender: 'Sara Rosa', email: 's.rosa@pec.it', subject: 'Segnalazione buche stradali', body: 'Buongiorno, segnalo la presenza di numerose buche pericolose in Via Garibaldi, all\'altezza del civico 15.\nAllego foto.\nCordiali saluti.', attachments: 4, status: 'pending' },
    'email1': { sender: 'Anna Neri', email: 'a.neri@pec.it', subject: 'Richiesta cambio residenza', body: 'Spett.le Ufficio Anagrafe,\n\ncon la presente comunico il cambio di residenza da Via Vecchia 10 a Via Nuova 25.\n\nIn allegato i documenti richiesti.\n\nCordiali saluti,\nAnna Neri', attachments: 2, status: 'pending' },
    'email2': { sender: 'Francesco Blu', email: 'f.blu@pec.it', subject: 'Autorizzazione evento pubblico', body: 'Si richiede autorizzazione per lo svolgimento di un evento pubblico in Piazza del Popolo il giorno 15 Novembre 2025.\nAlleghiamo piano sicurezza e programma.', attachments: 4, status: 'pending' },
    'email3': { sender: 'Carla Gialli', email: 'c.gialli@pec.it', subject: 'Richiesta patrocinio', body: 'Invio richiesta di patrocinio comunale per la manifestazione culturale "Arte in Città" che si terrà a Dicembre.\nRingraziando anticipatamente...', attachments: 1, status: 'pending' },
    'email4': { sender: 'Marco Verde', email: 'm.verde@pec.it', subject: 'Licenza edilizia', body: 'Trasmetto integrazione documentale relativa alla pratica di licenza edilizia n. 123/2025 come richiesto dal Vs. ufficio.\n\nMarco Verde', attachments: 3, status: 'processed' }, // Esempio di uno già processato
    'email5': { sender: 'Elena Azzurri', email: 'e.azzurri@pec.it', subject: 'Richiesta occupazione suolo pubblico', body: 'Si richiede autorizzazione per occupazione temporanea di suolo pubblico per lavori edili in Via Mazzini 30, dal 1 al 15 Dicembre.\nAllego planimetria.', attachments: 2, status: 'processed' }, // Esempio
    'email6': { sender: 'Roberto Grigi', email: 'r.grigi@pec.it', subject: 'Certificato stato famiglia', body: 'Richiedo emissione certificato di stato di famiglia per uso assegni familiari.\nDocumento allegato.\n\nGrazie,\nRoberto Grigi', attachments: 1, status: 'processed' } // Esempio
};

// Configuration object
const defaultConfig = { app_title: "Sistema Protocollo PEC", comune_name: "Comune di Roma" };

// Stato iniziale
const initialState = {
    currentView: 'pending',
    selectedEmailId: null,
    isFullscreen: false,
    unreadExpanded: false,
    emails: emailData,
    config: defaultConfig,
    theme: localStorage.getItem('theme') || 'light'
};

// Reducer per gestire le azioni
function appReducer(state, action) {
    switch (action.type) {
        case 'SWITCH_VIEW':
            return { ...state, currentView: action.payload, selectedEmailId: null, isFullscreen: false };
        case 'SELECT_EMAIL':
            return { ...state, selectedEmailId: action.payload, isFullscreen: false };
        case 'CLOSE_EMAIL':
            return { ...state, selectedEmailId: null, isFullscreen: false };
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
            const newEmails = { ...state.emails };
            if (newEmails[action.payload]) {
                newEmails[action.payload].status = 'processed';
            }
            return { ...state, emails: newEmails, selectedEmailId: null, isFullscreen: false };
        case 'UPDATE_CONFIG':
            return { ...state, config: { ...state.config, ...action.payload } };
        default:
            return state;
    }
}

// Creazione del contesto
const AppContext = createContext();

// Provider Component
export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // Effetto per gestire il tema (luce/buio)
    useEffect(() => {
        document.body.classList.remove('dark', 'light');
        document.body.classList.add(state.theme);
        
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.className = state.theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }, [state.theme]);
    
    // Effetto per inizializzare il tema al caricamento
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

// Hook custom per usare il contesto
export function useAppContext() {
    return useContext(AppContext);
}
