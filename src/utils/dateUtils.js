
// Date formatting helper for list (Oggi, Ieri, dd/mm/yyyy)
export function formatEmailDate(isoString) {
  const date = new Date(isoString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Oggi';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Ieri';
  }

  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Relative time (e.g. "3 minuti fa") for dashboard sync times
export function formatTimeAgo(isoString) {
  if (!isoString) return null;
  const diff = Math.round((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60) return 'Meno di un minuto fa';
  if (diff < 3600) {
    const m = Math.round(diff / 60);
    return `${m} minut${m === 1 ? 'o' : 'i'} fa`;
  }
  if (diff < 86400) {
    const h = Math.round(diff / 3600);
    return `${h} or${h === 1 ? 'a' : 'e'} fa`;
  }
  const d = Math.round(diff / 86400);
  return `${d} giorn${d === 1 ? 'o' : 'i'} fa`;
}

// Date formatting helper for details (dd/mm/yyyy, HH:MM)
export function formatEmailDateTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
