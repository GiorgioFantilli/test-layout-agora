// Supported file types for AI analysis
export const SUPPORTED_FILE_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/docx',
]);

/**
 * Returns icon and color classes for attachments
 */
export function getAttachmentVisuals(fileType) {
  if (!fileType) {
    return { bgClass: 'file-icon-default', iClass: 'fas fa-file-alt' };
  }

  if (fileType.startsWith('image/')) {
    return { bgClass: 'file-icon-image', iClass: 'fas fa-file-image' };
  }
  if (fileType === 'application/pdf') {
    return { bgClass: 'file-icon-pdf', iClass: 'fas fa-file-pdf' };
  }
  if (fileType.includes('word')) {
    return { bgClass: 'file-icon-doc', iClass: 'fas fa-file-word' };
  }
  if (fileType.includes('zip') || fileType.includes('archive')) {
    return { bgClass: 'file-icon-default', iClass: 'fas fa-file-archive' };
  }
   if (fileType.includes('xml')) {
    return { bgClass: 'file-icon-default', iClass: 'fas fa-file-code' };
  }
   if (fileType.includes('pkcs7-mime')) { // p7m
    return { bgClass: 'file-icon-default', iClass: 'fas fa-file-signature' };
  }
  
  // Default for .eml, .log, .dat, etc.
  return { bgClass: 'file-icon-default', iClass: 'fas fa-file-alt' };
}