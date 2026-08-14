export interface NormalizedImage {
  name: string;
  url: string;          // Original raw link or base64
  previewUrl: string;   // Primary direct image preview link for <img> tag
  fallbackUrl?: string; // Secondary direct image preview link
  downloadUrl: string;  // Link to download or open full file
  isPendingUpload?: boolean;
}

export const extractGoogleDriveId = (urlStr: string): string => {
  if (!urlStr || typeof urlStr !== 'string') return '';
  const trimmed = urlStr.trim();

  // Check if it's already a raw Drive ID (e.g., 25-50 characters alphanumeric with dashes/underscores)
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed;
  }

  // Match id= parameter
  const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) return matchId[1];

  // Match /d/{id}/ or /d/{id}
  const matchD = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchD && matchD[1]) return matchD[1];

  // Match file/d/{id}
  const matchFile = trimmed.match(/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFile && matchFile[1]) return matchFile[1];

  return '';
};

export const getDirectImageUrl = (urlStr: string): string => {
  if (!urlStr || typeof urlStr !== 'string') return '';
  const trimmed = urlStr.trim();
  if (trimmed.startsWith('data:image')) return trimmed;
  if (trimmed.startsWith('/uploads/')) return trimmed;

  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w800`;
  }
  return trimmed;
};

export const getSecondaryImageUrl = (urlStr: string): string => {
  if (!urlStr || typeof urlStr !== 'string') return '';
  const trimmed = urlStr.trim();
  if (trimmed.startsWith('data:image')) return trimmed;

  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    return `https://lh3.googleusercontent.com/d/${driveId}`;
  }
  return trimmed;
};

export const parseAndNormalizeImages = (val: any): NormalizedImage[] => {
  if (!val) return [];

  // If val is a record object rather than a direct image array or string
  if (typeof val === 'object' && !Array.isArray(val)) {
    if (val.images !== undefined) return parseAndNormalizeImages(val.images);
    if (val['ATTACHED IMAGES'] !== undefined) return parseAndNormalizeImages(val['ATTACHED IMAGES']);
    if (val['attachedImages'] !== undefined) return parseAndNormalizeImages(val['attachedImages']);
    if (val['ATTACHED_IMAGES'] !== undefined) return parseAndNormalizeImages(val['ATTACHED_IMAGES']);
    if (val.image !== undefined) return parseAndNormalizeImages(val.image);
    if (val.photos !== undefined) return parseAndNormalizeImages(val.photos);
    if (val.photo !== undefined) return parseAndNormalizeImages(val.photo);
    if (val.url || val.downloadUrl) {
      val = [val];
    } else {
      return [];
    }
  }

  const items: { name?: string; url: string; downloadUrl?: string; isPendingUpload?: boolean }[] = [];

  if (Array.isArray(val)) {
    val.forEach((item, idx) => {
      if (typeof item === 'string') {
        items.push({ name: `Photo ${idx + 1}`, url: item });
      } else if (typeof item === 'object' && item !== null) {
        items.push({
          name: item.name || `Photo ${idx + 1}`,
          url: item.url || item.downloadUrl || item.data || '',
          downloadUrl: item.downloadUrl || item.url || '',
          isPendingUpload: !!item.isPendingUpload
        });
      }
    });
  } else if (typeof val === 'string' && val.trim()) {
    const rawStr = val.trim();

    // 1. Check if rawStr contains =HYPERLINK(...) formulas (from Google Sheets export)
    if (rawStr.includes('=HYPERLINK')) {
      const hyperlinkRegex = /=HYPERLINK\(\s*"([^"]+)"(?:\s*,\s*"([^"]+)")?\s*\)/gi;
      let match;
      let count = 1;
      while ((match = hyperlinkRegex.exec(rawStr)) !== null) {
        const cleanUrl = match[1].trim();
        const cleanName = match[2] ? match[2].trim() : `Photo ${count}`;
        if (cleanUrl) {
          items.push({ name: cleanName, url: cleanUrl, downloadUrl: cleanUrl });
          count++;
        }
      }
    }

    // 2. If no HYPERLINK matches were found, try JSON parsing
    if (items.length === 0 && (rawStr.startsWith('[') || rawStr.startsWith('{'))) {
      try {
        const parsed = JSON.parse(rawStr);
        const parsedArr = Array.isArray(parsed) ? parsed : [parsed];
        parsedArr.forEach((p, idx) => {
          if (typeof p === 'string') {
            items.push({ name: `Photo ${idx + 1}`, url: p });
          } else if (p && typeof p === 'object') {
            items.push({
              name: p.name || `Photo ${idx + 1}`,
              url: p.url || p.downloadUrl || p.data || '',
              downloadUrl: p.downloadUrl || p.url || '',
              isPendingUpload: !!p.isPendingUpload
            });
          }
        });
      } catch (e) {
        // Fallback
      }
    }

    // 3. If still no items, split by '|' or '\n' or ','
    if (items.length === 0) {
      const parts = rawStr
        .split(/[|\n,]/)
        .map(s => s.trim())
        .filter(Boolean);

      parts.forEach((part, idx) => {
        const hpMatch = part.match(/=HYPERLINK\(\s*"([^"]+)"(?:\s*,\s*"([^"]+)")?\s*\)/i);
        if (hpMatch) {
          items.push({
            name: hpMatch[2] ? hpMatch[2].trim() : `Photo ${idx + 1}`,
            url: hpMatch[1].trim(),
            downloadUrl: hpMatch[1].trim()
          });
        } else if (part.startsWith('http') || part.startsWith('data:image') || part.startsWith('/uploads/') || extractGoogleDriveId(part)) {
          items.push({
            name: `Photo ${idx + 1}`,
            url: part,
            downloadUrl: part
          });
        }
      });
    }
  }

  return items
    .map((item, idx): NormalizedImage | null => {
      let rawUrl = item.url ? item.url.trim() : '';

      if (rawUrl.startsWith('"') && rawUrl.endsWith('"')) {
        rawUrl = rawUrl.substring(1, rawUrl.length - 1);
      }

      const driveId = extractGoogleDriveId(rawUrl);

      if (!rawUrl || (!rawUrl.startsWith('http') && !rawUrl.startsWith('data:image') && !rawUrl.startsWith('/uploads/') && !driveId)) {
        return null;
      }

      const name = item.name || `Photo ${idx + 1}`;

      let previewUrl = rawUrl;
      let fallbackUrl: string | undefined = undefined;
      let downloadUrl = item.downloadUrl || rawUrl;

      if (driveId) {
        previewUrl = `https://drive.google.com/thumbnail?id=${driveId}&sz=w800`;
        fallbackUrl = `https://lh3.googleusercontent.com/d/${driveId}`;
        downloadUrl = `https://drive.google.com/file/d/${driveId}/view`;
      }

      return {
        name,
        url: rawUrl,
        previewUrl,
        fallbackUrl: fallbackUrl !== previewUrl ? fallbackUrl : undefined,
        downloadUrl,
        isPendingUpload: !!item.isPendingUpload
      };
    })
    .filter((img): img is NormalizedImage => img !== null && Boolean(img.previewUrl));
};
