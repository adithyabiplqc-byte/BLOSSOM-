export interface NormalizedImage {
  name: string;
  url: string;          // Original raw link or base64
  previewUrl: string;   // Primary direct image preview link for <img> tag
  fallbackUrl?: string; // Secondary direct image preview link (lh3 =s1000)
  fallbackUrl2?: string; // Tertiary direct image preview link (uc?export=view)
  proxyUrl?: string;    // Backend server proxy preview link (/api/drive-proxy?id=...)
  embedUrl?: string;    // Google Drive iframe embed preview link (/preview)
  downloadUrl: string;  // Link to download or open full file in Drive/Tab
  driveId?: string;
  isPendingUpload?: boolean;
}

export const extractGoogleDriveId = (urlStr: string): string => {
  if (!urlStr || typeof urlStr !== 'string') return '';
  const trimmed = urlStr.trim().replace(/^["']|["']$/g, '');

  // Match /d/{id} or /d/{id}/ or /d/{id}?
  const matchD = trimmed.match(/\/d\/([a-zA-Z0-9_-]{20,})/i);
  if (matchD && matchD[1]) return matchD[1];

  // Match id= parameter
  const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{20,})/i);
  if (matchId && matchId[1]) return matchId[1];

  // Match file/d/{id}
  const matchFile = trimmed.match(/file\/d\/([a-zA-Z0-9_-]{20,})/i);
  if (matchFile && matchFile[1]) return matchFile[1];

  // Match lh3.googleusercontent.com/d/{id} or similar
  const matchLh3 = trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]{20,})/i);
  if (matchLh3 && matchLh3[1]) return matchLh3[1];

  // Match export=view/download with id
  const matchUc = trimmed.match(/uc\?.*?id=([a-zA-Z0-9_-]{20,})/i);
  if (matchUc && matchUc[1]) return matchUc[1];

  // Check if it's already a raw Drive ID (e.g., 20-60 characters alphanumeric with dashes/underscores)
  if (/^[a-zA-Z0-9_-]{20,60}$/.test(trimmed) && !trimmed.startsWith('http') && !trimmed.startsWith('data:') && !trimmed.includes(' ')) {
    return trimmed;
  }

  return '';
};

export const getDirectImageUrl = (urlStr: string): string => {
  if (!urlStr || typeof urlStr !== 'string') return '';
  const trimmed = urlStr.trim();
  if (trimmed.startsWith('data:image')) return trimmed;
  if (trimmed.startsWith('/uploads/')) return trimmed;

  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`;
  }
  return trimmed;
};

export const getSecondaryImageUrl = (urlStr: string): string => {
  if (!urlStr || typeof urlStr !== 'string') return '';
  const trimmed = urlStr.trim();
  if (trimmed.startsWith('data:image')) return trimmed;

  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    return `https://lh3.googleusercontent.com/d/${driveId}=s1000`;
  }
  return trimmed;
};

interface RawItem {
  name?: string;
  url: string;
  downloadUrl?: string;
  driveId?: string;
  isPendingUpload?: boolean;
}

export const parseAndNormalizeImages = (val: any): NormalizedImage[] => {
  if (val === null || val === undefined) return [];

  // Helper to extract items from any single value (string, object, etc.)
  const collectRawItems = (input: any): RawItem[] => {
    if (!input) return [];

    // If input is an array
    if (Array.isArray(input)) {
      const arrayItems: RawItem[] = [];
      input.forEach((elem, i) => {
        const subItems = collectRawItems(elem);
        subItems.forEach((sub) => {
          if (!sub.name || sub.name.startsWith('Photo ')) {
            sub.name = `Photo ${arrayItems.length + 1}`;
          }
          arrayItems.push(sub);
        });
      });
      return arrayItems;
    }

    // If input is an object
    if (typeof input === 'object') {
      // Check if it's already an image-like object (has url or driveId or downloadUrl)
      if (input.url || input.downloadUrl || input.driveId || input.data || input.base64 || input.rawBase64) {
        const rawUrl = String(input.url || input.downloadUrl || input.data || input.base64 || input.rawBase64 || input.driveId || '').trim();
        if (rawUrl && rawUrl !== '-' && rawUrl !== 'null' && rawUrl !== '""') {
          return [{
            name: input.name,
            url: rawUrl,
            downloadUrl: input.downloadUrl || rawUrl,
            driveId: input.driveId,
            isPendingUpload: !!input.isPendingUpload
          }];
        }
      }

      // If it's a record row (e.g. { customerName: '...', images: '...', 'ATTACHED IMAGES': '...' })
      const candidateKeys = [
        'images', 'ATTACHED IMAGES', 'attachedImages', 'ATTACHED_IMAGES', 'Attached Images',
        'attachedphoto', 'attachedphotos', 'attached_photos', 'attached photos', 'ATTACHED PHOTOS', 'ATTACHED PHOTO',
        'image', 'IMAGE', 'photos', 'photo', 'PHOTOS', 'PHOTO',
        'attachments', 'attachment', 'ATTACHMENTS', 'ATTACHMENT',
        'evidence', 'EVIDENCE', 'photoEvidence', 'photo_evidence', 'PHOTO EVIDENCE',
        'complaintImages', 'complaintPhotos', 'complaint_images', 'complaint_photos',
        'driveLink', 'driveUrl', 'drivelink', 'driveurl', 'drive_link', 'drive_url',
        'link', 'links', 'url', 'urls', 'photoLink', 'imageLink', 'file', 'files',
        'attachmentUrl', 'attachment_url', 'fileUrl', 'file_url', 'uploadPhotos', 'uploadImages'
      ];

      const foundCandidateItems: RawItem[] = [];
      const seenUrls = new Set<string>();

      for (const k of candidateKeys) {
        if (input[k] !== undefined && input[k] !== null && input[k] !== '' && input[k] !== '-' && input[k] !== '[]' && input[k] !== 'null') {
          const res = collectRawItems(input[k]);
          res.forEach(item => {
            const u = String(item.url || item.downloadUrl || item.driveId || '').trim();
            if (u && !seenUrls.has(u)) {
              seenUrls.add(u);
              foundCandidateItems.push(item);
            }
          });
        }
      }

      if (foundCandidateItems.length > 0) {
        return foundCandidateItems;
      }

      // Fallback: scan ALL object keys for image links, hyperlinks, or Drive IDs
      const allFound: RawItem[] = [];
      const keys = Object.keys(input);
      for (const k of keys) {
        if (k === 'id' || k === 'userCode' || k === 'password' || k === 'timestamp' || k === 'dateTime') continue;
        const valInKey = input[k];
        if (typeof valInKey === 'string' && valInKey.trim()) {
          const s = valInKey.trim();
          if (
            s.toUpperCase().includes('HYPERLINK') ||
            s.toUpperCase().includes('IMAGE(') ||
            s.includes('drive.google.com') ||
            s.includes('googleusercontent.com') ||
            s.startsWith('data:image') ||
            s.startsWith('/uploads/') ||
            s.startsWith('indexeddb://') ||
            (s.startsWith('http') && (s.includes('.jpg') || s.includes('.png') || s.includes('.jpeg') || s.includes('.webp') || s.includes('/drive/') || s.includes('unsplash') || s.includes('imgur') || s.includes('cloudinary')))
          ) {
            const parsedItems = collectRawItems(s);
            parsedItems.forEach(item => {
              const u = String(item.url || item.downloadUrl || item.driveId || '').trim();
              if (u && !seenUrls.has(u)) {
                seenUrls.add(u);
                allFound.push(item);
              }
            });
          }
        } else if (Array.isArray(valInKey) && valInKey.length > 0) {
          const parsedItems = collectRawItems(valInKey);
          parsedItems.forEach(item => {
            const u = String(item.url || item.downloadUrl || item.driveId || '').trim();
            if (u && !seenUrls.has(u)) {
              seenUrls.add(u);
              allFound.push(item);
            }
          });
        }
      }
      return allFound;
    }

    // If input is a string
    if (typeof input === 'string') {
      const rawStr = input.trim();
      if (!rawStr || rawStr === '-' || rawStr === '""' || rawStr === 'null' || rawStr === 'undefined' || rawStr === '[]' || rawStr === '{}') {
        return [];
      }

      const stringItems: RawItem[] = [];

      // 1. Google Sheets =HYPERLINK("url", "label") or =HYPERLINK(""url"", ""label"") or =HYPERLINK('url'; 'label')
      if (rawStr.toUpperCase().includes('HYPERLINK')) {
        // Universal HYPERLINK parser that handles quotes, single/double quotes, commas, semicolons, and multi-links
        const hyperlinkRegex = /=?HYPERLINK\s*\(\s*(?:""|["'])([^"']+)(?:""|["'])\s*(?:[,;]\s*(?:""|["'])([^"']*?)(?:""|["']))?\s*\)/gi;
        let match;
        let count = 1;
        while ((match = hyperlinkRegex.exec(rawStr)) !== null) {
          const cleanUrl = (match[1] || '').trim();
          const cleanName = (match[2] || '').trim() || `Photo ${count}`;
          if (cleanUrl) {
            stringItems.push({ name: cleanName, url: cleanUrl, downloadUrl: cleanUrl });
            count++;
          }
        }

        // Fallback: If regex didn't match (e.g. unquoted URL or special characters), extract any HYPERLINK(...) content
        if (stringItems.length === 0) {
          const genericHyperlink = /HYPERLINK\s*\(\s*([^,;)]+)(?:[,;]\s*([^)]*))?\)/gi;
          while ((match = genericHyperlink.exec(rawStr)) !== null) {
            let u = (match[1] || '').replace(/^["'\s]+|["'\s]+$/g, '').trim();
            let n = (match[2] || '').replace(/^["'\s]+|["'\s]+$/g, '').trim();
            if (u) {
              stringItems.push({ name: n || `Photo ${count}`, url: u, downloadUrl: u });
              count++;
            }
          }
        }
      }

      // 2. Google Sheets =IMAGE("url")
      if (stringItems.length === 0 && rawStr.toUpperCase().includes('IMAGE(')) {
        const imageRegex = /=?IMAGE\(\s*(?:""|["'])([^"']+)(?:""|["'])\s*(?:,.*?)?\)/gi;
        let match;
        let count = 1;
        while ((match = imageRegex.exec(rawStr)) !== null) {
          const cleanUrl = (match[1] || '').trim();
          if (cleanUrl) {
            stringItems.push({ name: `Photo ${count}`, url: cleanUrl, downloadUrl: cleanUrl });
            count++;
          }
        }
      }

      // 3. HTML anchor tag <a href="url">name</a>
      if (stringItems.length === 0 && rawStr.includes('<a') && rawStr.includes('href=')) {
        const anchorRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
        let match;
        let count = 1;
        while ((match = anchorRegex.exec(rawStr)) !== null) {
          const cleanUrl = (match[1] || '').trim();
          const cleanName = (match[2] || '').replace(/<[^>]*>/g, '').trim() || `Photo ${count}`;
          if (cleanUrl) {
            stringItems.push({ name: cleanName, url: cleanUrl, downloadUrl: cleanUrl });
            count++;
          }
        }
      }

      // 4. Markdown [name](url)
      if (stringItems.length === 0 && rawStr.includes('[') && rawStr.includes('](')) {
        const mdRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/gi;
        let match;
        while ((match = mdRegex.exec(rawStr)) !== null) {
          const cleanName = (match[1] || '').trim();
          const cleanUrl = (match[2] || '').trim();
          if (cleanUrl) {
            stringItems.push({ name: cleanName, url: cleanUrl, downloadUrl: cleanUrl });
          }
        }
      }

      // 5. JSON parse check (array or object)
      if (stringItems.length === 0 && (rawStr.startsWith('[') || rawStr.startsWith('{'))) {
        try {
          const parsed = JSON.parse(rawStr);
          return collectRawItems(parsed);
        } catch (e) {
          // If JSON parse fails, continue to URL regex extraction
        }
      }

      // 6. Regex extraction for explicit HTTP/HTTPS URLs
      if (stringItems.length === 0) {
        const urlRegex = /(https?:\/\/[^\s"',;<>]+)/gi;
        const matchedUrls = rawStr.match(urlRegex);
        if (matchedUrls && matchedUrls.length > 0) {
          matchedUrls.forEach((u, idx) => {
            const clean = u.trim().replace(/[.,;)]+$/, '');
            if (clean) {
              stringItems.push({
                name: `Photo ${idx + 1}`,
                url: clean,
                downloadUrl: clean
              });
            }
          });
        }
      }

      // 7. Delimiter split for multi-line or comma/pipe separated values
      if (stringItems.length === 0) {
        const parts = rawStr
          .split(/[|\n,;]/)
          .map(s => s.trim())
          .filter(Boolean);

        parts.forEach((part, idx) => {
          const driveId = extractGoogleDriveId(part);
          if (part.startsWith('http') || part.startsWith('data:image') || part.startsWith('/uploads/') || part.startsWith('indexeddb://') || driveId) {
            stringItems.push({
              name: `Photo ${idx + 1}`,
              url: part,
              downloadUrl: part,
              driveId: driveId || undefined
            });
          }
        });
      }

      // 8. Single Drive ID fallback
      if (stringItems.length === 0) {
        const driveId = extractGoogleDriveId(rawStr);
        if (driveId) {
          stringItems.push({
            name: 'Photo 1',
            url: `https://drive.google.com/file/d/${driveId}/view`,
            downloadUrl: `https://drive.google.com/file/d/${driveId}/view`,
            driveId: driveId
          });
        }
      }

      return stringItems;
    }

    return [];
  };

  const rawItems = collectRawItems(val);

  return rawItems
    .map((item, idx): NormalizedImage | null => {
      let rawUrl = item.url ? item.url.trim() : '';

      // Strip surrounding quotes
      if ((rawUrl.startsWith('"') && rawUrl.endsWith('"')) || (rawUrl.startsWith("'") && rawUrl.endsWith("'"))) {
        rawUrl = rawUrl.substring(1, rawUrl.length - 1).trim();
      }

      const driveId = item.driveId || extractGoogleDriveId(rawUrl);

      if (!rawUrl && !driveId) {
        return null;
      }

      if (!rawUrl && driveId) {
        rawUrl = `https://drive.google.com/file/d/${driveId}/view`;
      }

      const name = item.name || `Photo ${idx + 1}`;

      let previewUrl = rawUrl;
      let fallbackUrl: string | undefined = undefined;
      let fallbackUrl2: string | undefined = undefined;
      let proxyUrl: string | undefined = undefined;
      let embedUrl: string | undefined = undefined;
      let downloadUrl = item.downloadUrl || rawUrl;

      if (driveId) {
        proxyUrl = `/api/drive-proxy?id=${driveId}`;
        // Primary preview uses thumbnail CDN with proxy and lh3 fallbacks
        previewUrl = `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`;
        fallbackUrl = `/api/drive-proxy?id=${driveId}`;
        fallbackUrl2 = `https://lh3.googleusercontent.com/d/${driveId}=s1000`;
        embedUrl = `https://drive.google.com/file/d/${driveId}/preview`;
        downloadUrl = `https://drive.google.com/file/d/${driveId}/view?usp=sharing`;
      }

      return {
        name,
        url: rawUrl,
        previewUrl,
        fallbackUrl,
        fallbackUrl2,
        proxyUrl,
        embedUrl,
        downloadUrl,
        driveId,
        isPendingUpload: !!item.isPendingUpload
      };
    })
    .filter((img): img is NormalizedImage => img !== null && Boolean(img.previewUrl || img.downloadUrl));
};

export async function resolveIndexedDbImage(url: string): Promise<string> {
  if (!url || !url.startsWith('indexeddb://')) return url;
  const key = url.replace('indexeddb://', '');
  return new Promise<string>((resolve) => {
    try {
      const req = indexedDB.open("SopFileStore", 1);
      req.onsuccess = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("files")) {
          resolve(url);
          return;
        }
        const tx = db.transaction("files", "readonly");
        const store = tx.objectStore("files");
        const getReq = store.get(key);
        getReq.onsuccess = () => {
          if (getReq.result && getReq.result.base64) {
            resolve(getReq.result.base64);
          } else {
            resolve(url);
          }
        };
        getReq.onerror = () => resolve(url);
      };
      req.onerror = () => resolve(url);
    } catch {
      resolve(url);
    }
  });
}

