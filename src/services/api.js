import { mapBackendStatusToFrontend } from '../utils/statusMapper';

const POLLER_API_BASE = process.env.REACT_APP_POLLER_URL || 'http://localhost/poller';
const PARSER_API_BASE = process.env.REACT_APP_PARSER_URL || 'http://localhost/parser';


const decodeMimeSubject = (subject) => {
    if (!subject) return '';

    let cleanedSubject = subject.replace(/\?=\s+=\?/g, '?==?');

    const mimeRegex = /=\?([^?]+)\?([BbQq])\?([^?]+)\?=/gi;

    return cleanedSubject.replace(mimeRegex, (match, charset, encoding, text) => {
        try {
            if (encoding.toUpperCase() === 'Q') {
                let qText = text.replace(/_/g, ' ');
                qText = qText.replace(/=([A-Fa-f0-9]{2})/g, '%$1');
                return decodeURIComponent(qText);
            }

            if (encoding.toUpperCase() === 'B') {
                return decodeURIComponent(escape(atob(text)));
            }
        } catch (e) {
            console.error("Errore nella decodifica dell'oggetto:", e);
            return match;
        }

        return match;
    });
};

const parseFromAddress = (fromAddr) => {
    if (!fromAddr) {
        return { sender: 'Sconosciuto', email: '' };
    }

    const emailMatch = fromAddr.match(/<[^>]+>/);

    let email = '';
    let sender = '';

    if (emailMatch) {
        email = emailMatch[0].trim();
        sender = fromAddr.replace(email, '').replace(/["\\]/g, '').trim();
    } else {
        const cleanEmail = fromAddr.replace(/["\\]/g, '').trim();
        email = `<${cleanEmail}>`;
        sender = '';
    }

    return {
        sender: sender || 'Sconosciuto',
        email: email
    };
};

/**
 * Transforms a backend MessageRead DTO into the format expected by the frontend.
 */
export const transformMessageDto = (msg) => {
    const frontendStatus = mapBackendStatusToFrontend(msg.status, msg.parse_status);
    const parsedFrom = parseFromAddress(msg.from_addr);

    return {
        id: msg.id,
        sender: parsedFrom.sender,
        email: parsedFrom.email,
        subject: decodeMimeSubject(msg.subject) || 'Nessun Oggetto',
        body: '',
        date: msg.msg_date,
        recipient: msg.account?.address || 'Sconosciuto',
        status: frontendStatus,
        parse_status: msg.parse_status,
        attachments: (msg.attachments || []).map(att => ({
            id: att.id.toString(),
            filename: att.filename,
            fileType: att.mime_type || 'application/octet-stream',
            sizeMB: att.size_bytes ? (att.size_bytes / (1024 * 1024)).toFixed(2) : 0
        }))
    };
};

/**
 * Fetch messages from the Poller service.
 */
export const fetchMessages = async (signal, limit = 50, skip = 0, statuses = []) => {
    try {
        let url = `${POLLER_API_BASE}/messages/?limit=${limit}&skip=${skip}`;
        if (statuses && statuses.length > 0) {
            statuses.forEach(st => {
                url += `&status=${encodeURIComponent(st)}`;
            });
        }
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Tenant-Code': 'giorgio'
            },
            signal
        });
        if (!response.ok) {
            throw new Error(`Error fetching messages: ${response.statusText}`);
        }
        const data = await response.json();

        const emailsMap = {};
        data.forEach(msg => {
            const transformed = transformMessageDto(msg);
            emailsMap[transformed.id] = transformed;
        });
        return emailsMap;
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error("Failed to fetch messages", error);
        }
        throw error;
    }
};

/**
 * Fetch parsed data (body, analysis) for a specific message from the Parser service.
 */
export const fetchParsedMessage = async (messageId, signal) => {
    try {
        const response = await fetch(`${PARSER_API_BASE}/parsed-messages/${messageId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Tenant-Code': 'giorgio'
            },
            signal
        });
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`Error fetching parsed message: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error(`Failed to fetch parsed message ${messageId}`, error);
        }
        throw error;
    }
};
