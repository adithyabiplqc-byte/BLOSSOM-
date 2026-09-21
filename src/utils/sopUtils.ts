/**
 * Utility functions for sanitizing, formatting, and resolving SOP & Audit Document URLs.
 * Handles Google Sheets formulas (=HYPERLINK), Google Drive previews, direct downloads,
 * and offline IndexedDB object URLs.
 */

export const isGoogleDriveId = (id: string): boolean => {
  if (!id || typeof id !== 'string') return false;
  const clean = id.replace(/^[="'\s]+|[="'\s]+$/g, '').trim();
  return /^[a-zA-Z0-9_-]{20,60}$/.test(clean) && !clean.startsWith('sop_') && !clean.startsWith('mock_');
};

/**
 * Extracts a clean, valid URL from Google Sheets formulas or raw strings.
 * E.g., =HYPERLINK("https://drive.google.com/...", "label") -> https://drive.google.com/...
 */
export const extractCleanDocumentUrl = (rawUrl: any, driveId?: any): string => {
  if (!rawUrl && !driveId) return '';
  let str = String(rawUrl || '').trim();

  // 1. Google Sheets =HYPERLINK("url", "label") or =HYPERLINK('url', 'label')
  if (str.toUpperCase().includes('HYPERLINK')) {
    const match = str.match(/HYPERLINK\s*\(\s*(?:""|["'])([^"']+)(?:""|["'])/i);
    if (match && match[1]) {
      str = match[1].trim();
    } else {
      const httpMatch = str.match(/https?:\/\/[^\s"',)]+/i);
      if (httpMatch && httpMatch[0]) {
        str = httpMatch[0].trim();
      }
    }
  }

  // 2. Strip leading/trailing quotes, equals signs, brackets, spaces
  str = str.replace(/^[="'\s]+|[="'\s]+$/g, '').trim();

  // 3. Fallback to driveId if str is not an absolute/indexeddb/data URL
  const isProtocolUrl = str.startsWith('http://') || 
                        str.startsWith('https://') || 
                        str.startsWith('blob:') || 
                        str.startsWith('data:') || 
                        str.startsWith('indexeddb://');

  if (!isProtocolUrl && driveId) {
    const cleanId = String(driveId).replace(/^[="'\s]+|[="'\s]+$/g, '').trim();
    if (isGoogleDriveId(cleanId)) {
      return `https://drive.google.com/file/d/${cleanId}/view`;
    }
  }

  // 4. If str contains drive.google.com but had extra text/params
  if (!isProtocolUrl && str.includes('drive.google.com')) {
    const httpMatch = str.match(/https?:\/\/[^\s"',)]+/i);
    if (httpMatch && httpMatch[0]) {
      str = httpMatch[0].trim();
    }
  }

  return str;
};

/**
 * Extracts a Google Drive file ID from a URL or raw ID field.
 */
export const extractDriveFileId = (url: string, explicitId?: string): string => {
  if (explicitId && typeof explicitId === 'string') {
    const cleanExplicit = explicitId.replace(/^[="'\s]+|[="'\s]+$/g, '').trim();
    if (isGoogleDriveId(cleanExplicit)) {
      return cleanExplicit;
    }
  }

  if (!url) return '';
  const clean = extractCleanDocumentUrl(url);
  
  // Format: /file/d/([a-zA-Z0-9_-]+)
  const fileDMatch = clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1] && isGoogleDriveId(fileDMatch[1])) {
    return fileDMatch[1];
  }

  // Format: [?&]id=([a-zA-Z0-9_-]+)
  const idMatch = clean.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1] && isGoogleDriveId(idMatch[1])) {
    return idMatch[1];
  }

  return '';
};

/**
 * Embed URL for iframe preview.
 * - Google Drive -> https://drive.google.com/file/d/${id}/preview
 * - Blob/data -> directly usable
 * - External HTTP/HTTPS -> Google Docs gview fallback
 */
export const getEmbedPreviewUrl = (url: string, driveId?: string): string => {
  if (!url && !driveId) return '';
  const cleanUrl = extractCleanDocumentUrl(url, driveId);
  if (!cleanUrl) return '';

  if (cleanUrl.startsWith('blob:') || cleanUrl.startsWith('data:')) {
    return cleanUrl;
  }

  const fId = extractDriveFileId(cleanUrl, driveId);
  if (fId) {
    return `https://drive.google.com/file/d/${fId}/preview`;
  }

  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return `https://docs.google.com/gview?url=${encodeURIComponent(cleanUrl)}&embedded=true`;
  }

  return cleanUrl;
};

/**
 * Direct URL for opening the document in a new browser tab.
 * - Google Drive -> opens Google Drive document viewer
 * - Other -> direct web URL
 */
export const getDirectViewUrl = (url: string, driveId?: string): string => {
  if (!url && !driveId) return '';
  const cleanUrl = extractCleanDocumentUrl(url, driveId);
  if (!cleanUrl) return '';

  const fId = extractDriveFileId(cleanUrl, driveId);
  if (fId) {
    return `https://drive.google.com/file/d/${fId}/view?usp=drivesdk`;
  }

  return cleanUrl;
};

/**
 * Direct download link for the document.
 * - Google Drive -> direct export download link
 * - Other -> direct URL
 */
export const getDirectDownloadUrl = (url: string, driveId?: string): string => {
  if (!url && !driveId) return '';
  const cleanUrl = extractCleanDocumentUrl(url, driveId);
  if (!cleanUrl) return '';

  const fId = extractDriveFileId(cleanUrl, driveId);
  if (fId) {
    return `https://drive.google.com/uc?export=download&id=${fId}`;
  }

  return cleanUrl;
};
