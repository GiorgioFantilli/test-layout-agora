
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
