/**
 * Universal date utility functions for BQOS (Blossom Quality Operation System).
 * Robustly normalizes multiple date formats across Google Sheets, user inputs,
 * and database timestamps to standard YYYY-MM-DD format with Indian Standard Time (IST) support.
 */

export const normalizeDateToYYYYMMDD = (val: any): string => {
  if (!val) return '';
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return '';
    const year = val.getFullYear();
    const month = String(val.getMonth() + 1).padStart(2, '0');
    const day = String(val.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // If number (epoch timestamp)
  if (typeof val === 'number') {
    try {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return normalizeDateToYYYYMMDD(d);
      }
    } catch {}
  }

  const s = String(val).trim();
  if (!s) return '';

  // Handle ISO timestamps containing 'T' or time information
  if (s.includes('T')) {
    try {
      const d = new Date(s);
      if (!isNaN(d.getTime())) {
        // Offset to Indian Standard Time (UTC + 5:30) to match Google Apps Script representation
        const istTime = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
        const year = istTime.getUTCFullYear();
        const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
        const day = String(istTime.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch {}
  }

  // Extract date part only (discarding any trailing time or whitespace)
  const datePartOnly = s.split(/[ T]/)[0];
  const normalizedStr = datePartOnly.replace(/[\/.]/g, '-');
  const parts = normalizedStr.split('-');

  if (parts.length === 3) {
    let year = 0;
    let month = 0;
    let day = 0;
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    const p2 = parseInt(parts[2], 10);

    if (isNaN(p0) || isNaN(p1) || isNaN(p2)) return '';

    // YYYY-MM-DD
    if (parts[0].length === 4) {
      year = p0;
      month = p1;
      day = p2;
    }
    // DD-MM-YYYY
    else if (parts[2].length === 4) {
      year = p2;
      month = p1;
      day = p0;
    }
    // 2-digit year (e.g. DD-MM-YY)
    else {
      year = parts[2].length === 2 ? 2000 + p2 : p2;
      month = p1;
      day = p0;
    }

    if (year >= 1990 && year < 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // Fallback try standard date parsing
  try {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch {}

  return s.substring(0, 10);
};

export const formatDateDisplay = (val: any): string => {
  const norm = normalizeDateToYYYYMMDD(val);
  if (!norm) return 'N/A';
  try {
    const [y, m, d] = norm.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return norm;
  }
};
