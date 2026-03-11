// --- Date Helpers ---
const today = new Date();
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const oldDate1 = new Date();
oldDate1.setDate(oldDate1.getDate() - 5);
const oldDate2 = new Date();
oldDate2.setDate(oldDate2.getDate() - 10);
const oldDate3 = new Date();
oldDate3.setDate(oldDate3.getDate() - 11);

// --- File Types ---
export const FILE_TYPES = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    png: 'image/png',
    docx: 'application/docx',
    zip: 'application/zip',
    p7m: 'application/pkcs7-mime',
    eml: 'message/rfc822',
    xml: 'application/xml',
    dat: 'application/octet-stream',
    log: 'text/plain',
};


// --- Mock AI Analysis Texts ---
export const MOCK_ANALYSIS_TEXTS = {
    'planimetria_locale.pdf': "Planimetria di locale C/1 di 85mq, conforme. Include 1 bagno (disabili) e 2 vetrine.",
    'certificato_agibilita.pdf': "Certificato di agibilità n. 1234/2023. Rilasciato il 15/03/2023. Locale idoneo per attività commerciali.",
    'documento_identita.jpg': "Carta d'identità (valida) di Mario Rossi, nato il 15/01/1980 a Roma. CF: RSSMRA80A15H501Z.",
    'dichiarazione_inizio_attivita.docx': "Modulo SCIA (Dichiarazione Inizio Attività) compilato. Dati anagrafici e fiscali presenti. Manca firma digitale.",
    'foto_locale_esterno.png': "Immagine facciata esterna con 2 vetrine e 1 ingresso. Insegna non presente.",
    'visura_camerale.pdf': "Visura camerale ditta individuale 'Rossi Mario'. Iscritta il 01/01/2024. Stato: ATTIVA. Sede: Via Roma 123.",
    'richiesta_residenza.pdf': "Modulo di richiesta certificato di residenza. Dati: Giulia Bianchi. Motivo: Pratiche INPS.",
    'modulo_ztl.pdf': "Modulo richiesta ZTL compilato. Targa: AB123CD. Residente in Via Verdi.",
    'libretto_auto.jpg': "Carta di circolazione veicolo targa AB123CD. Intestatario: Luca Verdi.",
    'foto_buca_1.jpg': "Immagine di buca stradale. Dimensioni stimate: 50x70cm. Profondità: 10cm.",
    'foto_buca_2.jpg': "Immagine di buca stradale. Dimensioni stimate: 60x60cm.",
    'foto_panoramica.jpg': "Panoramica di Via Garibaldi 15. Si notano 3 buche.",
    'mappa_via_garibaldi.png': "Mappa con indicazione del punto esatto della segnalazione.",
    'atto_citazione.pdf': "Atto di citazione per mancato pagamento TARI 2023. Importo: 450,00 €.",
    'procura_legale.pdf': "Procura speciale Avv. Greco per la causa Comune c/ Rossi.",
    'SCIA_ViaVerdi.pdf': "SCIA per manutenzione straordinaria (rifacimento bagno e spostamento tramezzo).",
    'Relazione_Tecnica_Asseverata.pdf': "Relazione asseverata Arch. Marino. Lavori conformi al Regolamento Edilizio.",
    'Planimetria_Ante_Operam.pdf': "Stato di fatto: appartamento 70mq, 1 bagno, 2 camere.",
    'Planimetria_Post_Operam.pdf': "Stato di progetto: 1 bagno, 2 camere, diversa distribuzione interna.",
    'DURC_Impresa.pdf': "DURC regolare per 'EdilCostruzioni Srl', valido fino al 30/12/2025.",
    'Ricevuta_Pagamento_TARI.pdf': "Quietanza di pagamento TARI 2024. Importo: 315,00 €. Pagamento valido.",
    'CIL_Via_Napoli_5.pdf': "CIL asseverata per manutenzione straordinaria (spostamento tramezzi). Dati corretti.",
    'Relazione_Tecnica.pdf': "Relazione tecnica asseverata dal Geom. Riva. Conforme.",
};


// --- Demo Email Data ---
export const emailData = {
    'unread1': { 
        sender: 'Mario Rossi', 
        email: 'mario.rossi@pec.it', 
        subject: 'Richiesta autorizzazione commercio', 
        body: 'Gentili Signori,\n\ncon la presente richiedo l\'autorizzazione per l\'apertura di un\'attività commerciale presso Via Roma 123.\n\nIn allegato trovate tutta la documentazione necessaria:\n- Planimetria del locale\n- Certificato di agibilità\n- Documento di identità\n- Dichiarazione inizio attività\n- Foto esterno locale\n- Visura camerale\n\nResto in attesa di riscontro.\n\nCordiali saluti,\nMario Rossi', 
        date: today.toISOString(),
        recipient: 'ufficio.protocollo@pec.comune.it',
        readDate: null,
        status: 'pending',
        attachments: [
            { id: 'att1-1', filename: 'planimetria_locale.pdf', fileType: FILE_TYPES.pdf, sizeMB: 2.3 },
            { id: 'att1-2', filename: 'certificato_agibilita.pdf', fileType: FILE_TYPES.pdf, sizeMB: 1.8 },
            { id: 'att1-3', filename: 'documento_identita.jpg', fileType: FILE_TYPES.jpg, sizeMB: 0.9 },
            { id: 'att1-4', filename: 'dichiarazione_inizio_attivita.docx', fileType: FILE_TYPES.docx, sizeMB: 0.1 },
            { id: 'att1-5', filename: 'foto_locale_esterno.png', fileType: FILE_TYPES.png, sizeMB: 1.1 },
            { id: 'att1-6', filename: 'visura_camerale.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.5 },
        ]
    },
    'unread2': { 
        sender: 'Giulia Bianchi', 
        email: 'g.bianchi@pec.it', 
        subject: 'Certificato di residenza', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Buongiorno, richiedo cortesemente il certificato di residenza aggiornato. Serve per pratiche INPS.\n\nGrazie mille,\nGiulia Bianchi', 
        date: today.toISOString(),
        readDate: null,
        status: 'pending',
        attachments: [
            { id: 'att2-1', filename: 'richiesta_residenza.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.2 }
        ]
    },
    'unread3': { 
        sender: 'Luca Verdi', 
        email: 'luca.verdi@pec.it', 
        subject: 'Permesso ZTL', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Allego la documentazione per il rinnovo del permesso ZTL per l\'anno corrente.\n\nDistinti saluti,\nLuca Verdi', 
        date: today.toISOString(),
        readDate: null,
        status: 'pending',
        attachments: [
            { id: 'att3-1', filename: 'modulo_ztl.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.5 },
            { id: 'att3-2', filename: 'libretto_auto.jpg', fileType: FILE_TYPES.jpg, sizeMB: 1.1 }
        ]
    },
    'unread4': { 
        sender: 'Paolo Viola', 
        email: 'p.viola@pec.it', 
        subject: 'Richiesta contributi', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Spett.le Comune, inoltro richiesta di contributi per l\'associazione sportiva "ASD Calcio Giovani".\nResto a disposizione per chiarimenti.', 
        date: today.toISOString(),
        readDate: null,
        status: 'pending',
        attachments: [] 
    },
    'unread5': { 
        sender: 'Sara Rosa', 
        email: 's.rosa@pec.it', 
        subject: 'Segnalazione buche stradali', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Buongiorno, segnalo la presenza di numerose buche pericolose in Via Garibaldi, all\'altezza del civico 15.\nAllego foto.\nCordiali saluti.', 
        date: today.toISOString(),
        readDate: null,
        status: 'pending',
        attachments: [
            { id: 'att5-1', filename: 'foto_buca_1.jpg', fileType: FILE_TYPES.jpg, sizeMB: 2.5 },
            { id: 'att5-2', filename: 'foto_buca_2.jpg', fileType: FILE_TYPES.jpg, sizeMB: 2.8 },
            { id: 'att5-3', filename: 'foto_panoramica.jpg', fileType: FILE_TYPES.jpg, sizeMB: 3.1 },
            { id: 'att5-4', filename: 'mappa_via_garibaldi.png', fileType: FILE_TYPES.png, sizeMB: 0.8 }
        ]
    },
    'unread6': { 
        sender: 'Studio Legale Avv. Greco', 
        email: 'studio.greco@pec.it', 
        subject: 'Notifica atto di citazione - Comune c/ Rossi', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Con la presente, si notifica in via telematica l\'atto di citazione relativo alla causa in oggetto.\nSi allega atto e procura.\n\nDistinti Saluti,\nAvv. M. Greco', 
        date: today.toISOString(),
        readDate: null,
        status: 'pending',
        attachments: [
            { id: 'att6-1', filename: 'atto_citazione.pdf', fileType: FILE_TYPES.pdf, sizeMB: 1.1 },
            { id: 'att6-2', filename: 'procura_legale.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.3 }
        ]
    },
    'unread7': { 
        sender: 'Arch. Fabio Marino', 
        email: 'fabio.marino@pec.it', 
        subject: 'Presentazione SCIA per lavori interni', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'In qualità di tecnico incaricato, trasmetto in allegato la SCIA relativa ai lavori di manutenzione straordinaria presso l\'immobile sito in Via Verdi 10.\n\nCordiali saluti,\nArch. Fabio Marino', 
        date: today.toISOString(),
        readDate: null,
        status: 'pending',
        attachments: [
            { id: 'att7-1', filename: 'SCIA_ViaVerdi.pdf', fileType: FILE_TYPES.pdf, sizeMB: 1.5 },
            { id: 'att7-2', filename: 'Relazione_Tecnica_Asseverata.pdf', fileType: FILE_TYPES.pdf, sizeMB: 3.2 },
            { id: 'att7-3', filename: 'Planimetria_Ante_Operam.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.8 },
            { id: 'att7-4', filename: 'Planimetria_Post_Operam.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.9 },
            { id: 'att7-5', filename: 'DURC_Impresa.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.5 }
        ]
    },
    'unread8': {
        sender: 'InfoFatture Srl',
        email: 'fatture@pec.infofatture.it',
        subject: 'Fattura Elettronica n. 123/2025',
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'In allegato la fattura elettronica n. 123/2025 in formato P7M.',
        date: today.toISOString(),
        readDate: null,
        status: 'pending',
        attachments: [
            { id: 'att8-1', filename: 'IT0123456789_123.xml.p7m', fileType: FILE_TYPES.p7m, sizeMB: 0.2 }
        ]
    },
    'unread9': {
        sender: 'Gara Appalti',
        email: 'gara.appalti@pec.it',
        subject: 'Documentazione Gara n. 55/ABC',
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Si invia in allegato la documentazione compressa per la Gara n. 55/ABC.',
        date: today.toISOString(),
        readDate: null,
        status: 'pending',
        attachments: [
            { id: 'att9-1', filename: 'Documentazione_Gara_55_ABC.zip', fileType: FILE_TYPES.zip, sizeMB: 15.2 }
        ]
    },
    'unread10': {
        sender: 'Agenzia Entrate',
        email: 'ae.riscossione@pec.it',
        subject: 'Dati catastali XML',
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Si inviano i dati catastali aggiornati in formato XML.',
        date: today.toISOString(),
        readDate: null,
        status: 'pending',
        attachments: [
            { id: 'att10-1-xml', filename: 'dati_catasto_2025.xml', fileType: FILE_TYPES.xml, sizeMB: 0.8 }
        ]
    },
    'unread11': { 
        sender: 'Ufficio Personale', 
        email: 'personale@pec.comune.it', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        subject: 'Comunicazione interna: chiusura uffici', 
        body: 'Si avvisa che gli uffici comunali rimarranno chiusi per la festa del Santo Patrono il giorno 29 Novembre.\n\nCordiali Saluti,\nL\'Ufficio Personale', 
        date: today.toISOString(),
        readDate: null,
        status: 'pending',
        attachments: [] 
    },
    'unread12': { 
        sender: 'Servizio Manutenzione IT', 
        email: 'support.it@pec.it', 
        subject: 'Log e Dati Backup Server',
        recipient: 'ufficio.protocollo@pec.comune.it', 
        body: 'Inviamo in allegato i log di sistema e i file di configurazione .dat relativi all\'ultimo backup del server.\n\nSupporto IT', 
        date: today.toISOString(),
        readDate: null,
        status: 'pending',
        attachments: [
            { id: 'att12-1', filename: 'system_backup.log', fileType: FILE_TYPES.log, sizeMB: 5.5 },
            { id: 'att12-2', filename: 'config_server.dat', fileType: FILE_TYPES.dat, sizeMB: 0.1 },
        ]
    },
    'email1': { 
        sender: 'Anna Neri', 
        email: 'a.neri@pec.it', 
        subject: 'Richiesta cambio residenza', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Spett.le Ufficio Anagrafe,\n\ncon la presente comunico il cambio di residenza da Via Vecchia 10 a Via Nuova 25.\n\nIn allegato i documenti richiesti.\n\nCordiali saluti,\nAnna Neri', 
        date: yesterday.toISOString(),
        readDate: yesterday.toISOString(),
        status: 'pending',
        attachments: [
            { id: 'att10-1', filename: 'documento_identita_genitore.pdf', fileType: FILE_TYPES.pdf, sizeMB: 1.2 },
            { id: 'att10-2', filename: 'certificato_residenza_vecchio.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.4 }
        ]
    },
    'email2': { 
        sender: 'Francesco Blu', 
        email: 'f.blu@pec.it', 
        subject: 'Autorizzazione evento pubblico', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Si richiede autorizzazione per lo svolgimento di un evento pubblico in Piazza del Popolo il giorno 15 Novembre 2025.\nAlleghiamo piano sicurezza e programma.', 
        date: yesterday.toISOString(),
        readDate: yesterday.toISOString(),
        status: 'pending',
        attachments: [
            { id: 'att11-1', filename: 'Richiesta_Autorizzazione.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.5 },
            { id: 'att11-2', filename: 'Piano_Sicurezza_Evento.pdf', fileType: FILE_TYPES.pdf, sizeMB: 2.5 },
            { id: 'att11-3', filename: 'Programma_Evento.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.8 },
            { id: 'att11-4', filename: 'Planimetria_Piazza.pdf', fileType: FILE_TYPES.pdf, sizeMB: 1.2 }
        ]
    },
    'email3': { 
        sender: 'Carla Gialli', 
        email: 'c.gialli@pec.it', 
        subject: 'Richiesta patrocinio', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Invio richiesta di patrocinio comunale per la manifestazione culturale "Arte in Città" che si terrà a Dicembre.\nRingraziando anticipatamente...', 
        date: yesterday.toISOString(),
        readDate: yesterday.toISOString(),
        status: 'pending',
        attachments: [
            { id: 'att12-1', filename: 'Richiesta_Patrocinio.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.3 }
        ]
    },
    'email4': { 
        sender: 'Polizia Locale Roma', 
        email: 'polizia.locale@pec.comune.it', 
        subject: 'Notifica chiusura strada per mercato',
        recipient: 'ufficio.protocollo@pec.comune.it', 
        body: 'Si comunica che il giorno 10 Novembre, Via Cavour sarà chiusa al traffico dalle 08:00 alle 14:00 per il mercato settimanale.\n\nCordiali saluti,\nIl Comandante', 
        date: yesterday.toISOString(),
        readDate: yesterday.toISOString(),
        status: 'pending',
        attachments: [
            { id: 'att13-1', filename: 'Ordinanza_Chiusura_Strada_10-11.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.3 }
        ]
    },
    'email5': { 
        sender: 'Ufficio Scuola', 
        email: 'scuola@pec.comune.it', 
        subject: 'Iscrizioni asilo nido 2026/2027', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Si inoltra la modulistica e il bando per le iscrizioni agli asili nido comunali per l\'anno 2026/2027.\n\nL\'Ufficio Scuola', 
        date: yesterday.toISOString(),
        readDate: yesterday.toISOString(),
        status: 'pending',
        attachments: [
            { id: 'att14-1', filename: 'Modulo_Iscrizione_Asilo.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.8 },
            { id: 'att14-2', filename: 'Bando_Asili_2026.pdf', fileType: FILE_TYPES.pdf, sizeMB: 1.5 }
        ]
    },
    'email6': { 
        sender: 'Impresa Edile Costruzioni Srl', 
        email: 'impresa.costruzioni@pec.it', 
        subject: 'Comunicazione Inizio Lavori - Pratica 456/2025', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Si comunica l\'avvio dei lavori edili in data odierna, come da pratica 456/2025 (Permesso di Costruire).\n\nSaluti.', 
        date: yesterday.toISOString(),
        readDate: yesterday.toISOString(),
        status: 'pending',
        attachments: [
            { id: 'att15-1', filename: 'Comunicazione_Inizio_Lavori.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.6 },
            { id: 'att15-2', filename: 'DURC_Impresa.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.4 },
            { id: 'att15-3', filename: 'Foto_Cartello_Cantiere.jpg', fileType: FILE_TYPES.jpg, sizeMB: 3.1 }
        ]
    },
    'email7': { 
        sender: 'Ass. "Cultura Viva"', 
        email: 'culturaviva@pec.it', 
        subject: 'Richiesta sala consiliare per convegno', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Spett.le Sindaco,\n\nrichiediamo l\'utilizzo della sala consiliare per un convegno sulla storia locale il giorno 20 Dicembre.\n\nIn attesa di riscontro,\nIl Presidente', 
        date: yesterday.toISOString(),
        readDate: yesterday.toISOString(),
        status: 'pending',
        attachments: [
            { id: 'att16-1', filename: 'Richiesta_Sala_Consiliare.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.2 }
        ]
    },
    'email8': {
        sender: 'Cittadino Preoccupato',
        email: 'cittadino@pec.it',
        subject: 'Inoltro segnalazione da altro ufficio',
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Vi inoltro una email che ho ricevuto per errore, credo sia di vostra competenza.',
        date: yesterday.toISOString(),
        readDate: yesterday.toISOString(),
        status: 'pending',
        attachments: [
            { id: 'att17-1', filename: 'email_inoltrata.eml', fileType: FILE_TYPES.eml, sizeMB: 0.1 }
        ]
    },
    'email9': {
        sender: 'Ufficio Ragioneria',
        email: 'ragioneria@pec.comune.it',
        subject: 'Chiusura bilancio trimestrale',
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Si ricorda a tutti gli uffici di inviare la documentazione per la chiusura del bilancio trimestrale entro la fine della settimana.',
        date: yesterday.toISOString(),
        readDate: yesterday.toISOString(),
        status: 'pending',
        attachments: []
    },
    'email12': { 
        sender: 'Associazione Pro Loco', 
        email: 'proloco@pec.it', 
        subject: 'RE: Richiesta patrocinio', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Gentile Ufficio Cultura,\n\nin riferimento alla nostra precedente richiesta, volevamo sapere se ci sono aggiornamenti.\n\nGrazie,\nLa Pro Loco', 
        date: yesterday.toISOString(),
        readDate: yesterday.toISOString(),
        status: 'pending',
        attachments: [] 
    },
    'email10': {
        sender: 'Laura Neri',
        email: 'l.neri@pec.it',
        subject: 'Pagamento Tassa Rifiuti',
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Buongiorno, allego ricevuta di pagamento della TARI 2024.\n\nSaluti,\nLaura Neri',
        date: oldDate1.toISOString(),
        readDate: oldDate1.toISOString(),
        status: 'analyzed',
        attachments: [
            { id: 'att18-1', filename: 'Ricevuta_Pagamento_TARI.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.1 }
        ]
    },
    'email11': {
        sender: 'Geom. Riva',
        email: 'geom.riva@pec.it',
        subject: 'CIL - Pratica 88/2025',
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Invio CIL asseverata per lavori in Via Napoli 5.',
        date: oldDate1.toISOString(),
        readDate: oldDate1.toISOString(),
        status: 'analyzed',
        attachments: [
            { id: 'att19-1', filename: 'CIL_Via_Napoli_5.pdf', fileType: FILE_TYPES.pdf, sizeMB: 1.0 },
            { id: 'att19-2', filename: 'Relazione_Tecnica.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.5 },
            { id: 'att19-3', filename: 'Documento_Geometra.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.8 },
        ]
    },
    'proc1': { 
        sender: 'Marco Verde', 
        email: 'm.verde@pec.it', 
        subject: 'Licenza edilizia', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Trasmetto integrazione documentale relativa alla pratica di licenza edilizia n. 123/2025 come richiesto dal Vs. ufficio.\n\nMarco Verde', 
        date: oldDate1.toISOString(),
        readDate: oldDate1.toISOString(),
        status: 'processed',
        attachments: [
            { id: 'att20-1', filename: 'Integrazione_Pratica_123.pdf', fileType: FILE_TYPES.pdf, sizeMB: 2.8 },
            { id: 'att20-2', filename: 'Relazione_Geologica.pdf', fileType: FILE_TYPES.pdf, sizeMB: 4.1 },
            { id: 'att20-3', filename: 'Ricevuta_Oneri.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.5 }
        ]
    },
    'proc2': { 
        sender: 'Elena Azzurri', 
        email: 'e.azzurri@pec.it', 
        subject: 'Richiesta occupazione suolo pubblico', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Si richiede autorizzazione per occupazione temporanea di suolo pubblico per lavori edili in Via Mazzini 30, dal 1 al 15 Dicembre.\nAllego planimetria.', 
        date: oldDate1.toISOString(),
        readDate: oldDate1.toISOString(),
        status: 'processed',
        attachments: [
            { id: 'att21-1', filename: 'Richiesta_OSP.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.7 },
            { id: 'att21-2', filename: 'Planimetria_OSP.pdf', fileType: FILE_TYPES.pdf, sizeMB: 1.3 }
        ]
    },
    'proc3': { 
        sender: 'Roberto Grigi', 
        email: 'r.grigi@pec.it', 
        subject: 'Certificato stato famiglia', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Richiedo emissione certificato di stato di famiglia per uso assegni familiari.\nDocumento allegato.\n\nGrazie,\nRoberto Grigi', 
        date: oldDate1.toISOString(),
        readDate: oldDate1.toISOString(),
        status: 'processed',
        attachments: [
            { id: 'att22-1', filename: 'Certificato_Stato_Famiglia.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.2 }
        ]
    },
    'proc4': { 
        sender: 'Ufficio Tributi', 
        email: 'tributi@pec.comune.it', 
        subject: 'Sollecito Pagamento TARI 2024', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Gentile contribuente,\nle ricordiamo la scadenza del pagamento TARI 2024 fissata per il 31 Ottobre.\n\nUfficio Tributi', 
        date: oldDate1.toISOString(),
        readDate: oldDate1.toISOString(),
        status: 'processed',
        attachments: [] 
    },
    'proc5': { 
        sender: 'ASL RM3', 
        email: 'asl.rm3@pec.it', 
        subject: 'Notifica Igiene e Sanità', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Si trasmette verbale di ispezione n. 889-BIS relativo al controllo igienico-sanitario presso la mensa scolastica "Girasole".\n\nASL RM3', 
        date: oldDate1.toISOString(),
        readDate: oldDate1.toISOString(),
        status: 'processed',
        attachments: [
            { id: 'att23-1', filename: 'Verbale_Ispezione_ASL.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.8 }
        ]
    },
    'proc6': { 
        sender: 'Agenzia Entrate - Catasto', 
        email: 'catasto.roma@pec.it', 
        subject: 'Aggiornamento planimetria immobile comunale', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Si invia in allegato la nuova planimetria catastale aggiornata per l\'immobile sito in P.zza del Comune 1 (Palazzo Comunale).\n\nCordiali Saluti.', 
        date: oldDate2.toISOString(),
        readDate: oldDate2.toISOString(),
        status: 'processed',
        attachments: [
            { id: 'att24-1', filename: 'Planimetria_Catastale_Comune.pdf', fileType: FILE_TYPES.pdf, sizeMB: 1.1 },
            { id: 'att24-2', filename: 'Visura_Aggiornata.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.4 }
        ]
    },
    'proc7': { 
        sender: 'Simone Gialli', 
        email: 's.gialli@pec.it', 
        subject: 'Richiesta accesso agli atti - Pratica Edilizia 100/2023', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'In qualità di confinante, chiedo accesso agli atti per la Pratica Edilizia 100/2023.\nAllego documento di identità.\n\nGrazie,\nSimone Gialli', 
        date: oldDate2.toISOString(),
        readDate: oldDate2.toISOString(),
        status: 'processed',
        attachments: [
            { id: 'att25-1', filename: 'Doc_Identita_Gialli.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.9 }
        ]
    },
    'proc8': { 
        sender: 'Regione Lazio', 
        email: 'regione.lazio@pec.it', 
        subject: 'Bando fondi PNRR per digitalizzazione PA', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Si inoltra il bando PNRR Misura 1.4.1 per la digitalizzazione dei servizi al cittadino.\nScadenza 30 Gennaio.\n\nRegione Lazio', 
        date: oldDate2.toISOString(),
        readDate: oldDate2.toISOString(),
        status: 'processed',
        attachments: [
            { id: 'att26-1', filename: 'Bando_PNRR_Digitalizzazione.pdf', fileType: FILE_TYPES.pdf, sizeMB: 3.5 },
            { id: 'att26-2', filename: 'Allegato_A_Domanda.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.6 },
            { id: 'att26-3', filename: 'Sintesi_Bando.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.2 }
        ]
    },
    'proc9': { 
        sender: 'Vigili del Fuoco', 
        email: 'vvf.roma@pec.it', 
        subject: 'Rinnovo Certificato Prevenzione Incendi - Scuola "Rodari"', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Si trasmette il Certificato di Prevenzione Incendi rinnovato per l\'istituto scolastico "G. Rodari".\n\nCordiali saluti.', 
        date: oldDate2.toISOString(),
        readDate: oldDate2.toISOString(),
        status: 'processed',
        attachments: [
            { id: 'att27-1', filename: 'CPI_Scuola_Rodari.pdf', fileType: FILE_TYPES.pdf, sizeMB: 1.8 },
            { id: 'att27-2', filename: 'Asseverazione_Tecnico.pdf', fileType: FILE_TYPES.pdf, sizeMB: 0.9 }
        ]
    },
    'proc10': { 
        sender: 'Cittadino Esempio', 
        email: 'cittadino.esempio@pec.it', 
        subject: 'Email vecchia senza allegati', 
        recipient: 'ufficio.protocollo@pec.comune.it',
        body: 'Questa è una vecchia email protocollata senza allegati.', 
        date: oldDate3.toISOString(),
        readDate: oldDate3.toISOString(),
        status: 'processed',
        attachments: []
    }
};
