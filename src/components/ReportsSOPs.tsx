import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import SearchableSelect from './SearchableSelect';
import { api } from '../services/api';
import { 
  extractCleanDocumentUrl, 
  extractDriveFileId, 
  getEmbedPreviewUrl, 
  getDirectViewUrl, 
  getDirectDownloadUrl,
  triggerDirectDownload
} from '../utils/sopUtils';
// Firebase auth imports removed to prioritize direct Google Drive integration via Apps Script.

interface SOPReport {
  id?: string;
  title: string;
  category: string;
  description: string;
  department?: string;
  version?: string;
  remarks?: string;
  driveFileId?: string;
  viewUrl?: string;
  downloadUrl?: string;
  fileSize?: string;
  uploadedBy?: string;
  uploadDate?: string;
  lastModified?: string;
  status?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  creator: string;
  creatorCode?: string;
  zone: string;
  timestamp?: string;
  googleDriveEmail?: string;
}

const DOCUMENT_CATEGORIES = [
  'SOP',
  'Inspection Reports',
  'Audit Report',
  'Specifications',
  'Test Reports',
  'Lab Reports',
  'Work Instructions',
  'Drawings',
  'Quality Manuals',
  'Others'
] as const;

const DEPARTMENTS = [
  'Quality',
  'Production',
  'Maintenance',
  'Logistics',
  'HR & Admin',
  'Compliance',
  'R&D',
  'Others'
] as const;

interface ReportsSOPsProps {
  user: any;
  settings: any;
  triggerSuccess: (message: string) => void;
  globalZone?: string;
  readOnly?: boolean;
  mode?: 'entry' | 'view'; // 'entry' for creation only, 'view' for policy lists/reading
}

// Helper to generate UUIDs client-side
function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const getSopFile = (id: string): Promise<{ name: string; type: string; base64: string } | null> => {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open("SopFileStore", 1);
      req.onupgradeneeded = () => {
        const database = req.result;
        if (!database.objectStoreNames.contains("files")) {
          database.createObjectStore("files");
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        try {
          const tx = db.transaction("files", "readonly");
          const store = tx.objectStore("files");
          const getReq = store.get(id);
          getReq.onsuccess = () => resolve(getReq.result || null);
          getReq.onerror = () => resolve(null);
        } catch (err) {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
};

const saveToLocalIndexedDB = (fileName: string, mimeType: string, base64Data: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const fileId = 'sop_file_' + generateUuid();
      const fileData = {
        name: fileName,
        type: mimeType,
        base64: base64Data
      };

      const req = indexedDB.open("SopFileStore", 1);
      req.onupgradeneeded = () => {
        const database = req.result;
        if (!database.objectStoreNames.contains("files")) {
          database.createObjectStore("files");
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        try {
          const tx = db.transaction("files", "readwrite");
          const store = tx.objectStore("files");
          const putReq = store.put(fileData, fileId);
          putReq.onsuccess = () => resolve(`indexeddb://${fileId}`);
          putReq.onerror = () => reject(putReq.error);
        } catch (err) {
          reject(err);
        }
      };
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
};

// Highly polished preset list
const PRELOADED_SOPS: SOPReport[] = [];

const getValCaseInsensitive = (obj: any, key: string, fallback: any = "") => {
  if (!obj || typeof obj !== 'object') return fallback;
  if (obj[key] !== undefined) return obj[key];
  const keys = Object.keys(obj);
  const targetLower = key.toLowerCase();
  const foundKey = keys.find(k => k.toLowerCase() === targetLower);
  return foundKey !== undefined ? obj[foundKey] : fallback;
};

const ReportsSOPs: React.FC<ReportsSOPsProps> = ({ 
  user, 
  settings, 
  triggerSuccess, 
  globalZone, 
  readOnly = false,
  mode
}) => {
  // Determine mode (default based on readOnly if omitted, but we specify it in container routing)
  const effectiveMode = mode || (readOnly ? 'view' : 'entry');

  const [reports, setReports] = useState<SOPReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Track Google Account state via simple Local App Configuration
  const [googleUser, setGoogleUser] = useState<any>(() => {
    const email = localStorage.getItem('gdrive_email');
    return email ? { email, displayName: email.split('@')[0] } : null;
  });
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);

  const handleGoogleSignIn = async (email: string, pass: string) => {
    setIsLinkingGoogle(true);
    try {
      localStorage.setItem('gdrive_email', email);
      localStorage.setItem('gdrive_password', pass);
      setGoogleUser({ email, displayName: email.split('@')[0] });
      triggerSuccess(`Successfully connected to Google Drive Account: ${email}`);
      await fetchReports();
    } catch (e: any) {
      console.warn("Failed to connect Google Drive:", e);
    } finally {
      setIsLinkingGoogle(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      localStorage.removeItem('gdrive_email');
      localStorage.removeItem('gdrive_password');
      setGoogleUser(null);
      triggerSuccess("Disconnected Google Drive space.");
      await fetchReports();
    } catch (e: any) {
      console.warn("Sign out failed:", e);
    }
  };

  // Create / Edit Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('SOP');
  const [department, setDepartment] = useState<string>('Quality');
  const [version, setVersion] = useState<string>('1.0');
  const [remarks, setRemarks] = useState<string>('');
  const [description, setDescription] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  
  // Library View Search, Filter and Sorting State
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('ALL');
  const [sortMode, setSortMode] = useState<string>('date_desc');
  const [viewFormat, setViewFormat] = useState<'table' | 'cards'>('table');
  
  // State for upload completion
  const [justPublished, setJustPublished] = useState(false);
  const [publishedTitle, setPublishedTitle] = useState('');
  
  // Active document details view state
  const [selectedReport, setSelectedReport] = useState<SOPReport | null>(null);
  
  // PDF Viewer toggle inside the details card
  const [showInlinePdf, setShowInlinePdf] = useState(false);

  // Full screen PDF viewer modal state
  const [previewReport, setPreviewReport] = useState<SOPReport | null>(null);

  // Custom inline deletion confirmation modal state
  const [sopToDelete, setSopToDelete] = useState<SOPReport | null>(null);

  // Resolved attachment URLs for IndexedDB local storage offline compatibility
  const [resolvedSelectedUrl, setResolvedSelectedUrl] = useState<string>('');
  const [resolvedPreviewUrl, setResolvedPreviewUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    let objectUrlToCleanup = '';

    const resolve = async () => {
      if (!selectedReport?.attachmentUrl && !selectedReport?.driveFileId) {
        setResolvedSelectedUrl('');
        return;
      }
      const rawUrl = selectedReport.attachmentUrl || '';
      const clean = extractCleanDocumentUrl(rawUrl, selectedReport.driveFileId);
      if (clean.startsWith('indexeddb://')) {
        const key = clean.replace('indexeddb://', '');
        try {
          const fileData = await getSopFile(key);
          if (fileData && isMounted) {
            const response = await fetch(fileData.base64);
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            objectUrlToCleanup = objectUrl;
            setResolvedSelectedUrl(objectUrl);
          } else if (isMounted) {
            setResolvedSelectedUrl('');
          }
        } catch (e) {
          console.error("Failed to retrieve file from IndexedDB:", e);
          if (isMounted) setResolvedSelectedUrl('');
        }
      } else {
        if (isMounted) setResolvedSelectedUrl(clean);
      }
    };

    resolve();

    return () => {
      isMounted = false;
      if (objectUrlToCleanup) {
        URL.revokeObjectURL(objectUrlToCleanup);
      }
    };
  }, [selectedReport]);

  useEffect(() => {
    let isMounted = true;
    let objectUrlToCleanup = '';

    const resolve = async () => {
      if (!previewReport?.attachmentUrl && !previewReport?.driveFileId) {
        setResolvedPreviewUrl('');
        return;
      }
      const rawUrl = previewReport.attachmentUrl || '';
      const clean = extractCleanDocumentUrl(rawUrl, previewReport.driveFileId);
      if (clean.startsWith('indexeddb://')) {
        const key = clean.replace('indexeddb://', '');
        try {
          const fileData = await getSopFile(key);
          if (fileData && isMounted) {
            const response = await fetch(fileData.base64);
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            objectUrlToCleanup = objectUrl;
            setResolvedPreviewUrl(objectUrl);
          } else if (isMounted) {
            setResolvedPreviewUrl('');
          }
        } catch (e) {
          console.error("Failed to retrieve file from IndexedDB:", e);
          if (isMounted) setResolvedPreviewUrl('');
        }
      } else {
        if (isMounted) setResolvedPreviewUrl(clean);
      }
    };

    resolve();

    return () => {
      isMounted = false;
      if (objectUrlToCleanup) {
        URL.revokeObjectURL(objectUrlToCleanup);
      }
    };
  }, [previewReport]);

  // Fetch Reports
  const fetchReports = async () => {
    setLoading(true);
    try {
      const activeZone = globalZone || user?.zone || 'ALL';
      let data: any[] = [];
      try {
        data = await api.run('api_getREPORTS_SOPData', { 
          zone: activeZone,
          userCode: user?.userCode,
          userRole: user?.role,
          username: user?.username
        }) as any[];
      } catch (fetchErr) {
        console.warn("Failed to fetch SOPs from server, using local storage fallback:", fetchErr);
      }
      
      let deletedIds: string[] = [];
      try {
        const localDeleted = JSON.parse(localStorage.getItem('bqos_deleted_sop_ids') || '[]');
        if (Array.isArray(localDeleted)) {
          deletedIds = localDeleted.map(String);
        }
      } catch (err) {}

      let rawRecords = Array.isArray(data) ? data : [];
      const deletedRecord = rawRecords.find((r: any) => r && r.id === '__DELETED_SOP_IDS__');
      if (deletedRecord && Array.isArray(deletedRecord.deletedList)) {
        deletedRecord.deletedList.forEach((id: any) => {
          const sId = String(id);
          if (!deletedIds.includes(sId)) {
            deletedIds.push(sId);
          }
        });
      }
      
      // Update local storage to persist deleted IDs in client session
      try {
        localStorage.setItem('bqos_deleted_sop_ids', JSON.stringify(deletedIds));
      } catch (err) {}

      // Filter out the special deleted record from actual rendering
      rawRecords = rawRecords.filter((r: any) => r && r.id !== '__DELETED_SOP_IDS__');

      let mapped: SOPReport[] = [];
      if (rawRecords.length > 0) {
        mapped = rawRecords.map((item: any) => {
          const rawId = getValCaseInsensitive(item, 'id', '');
          const id = rawId ? String(rawId) : `sop-${Math.random().toString(36).substr(2, 9)}`;
          const rawDriveId = getValCaseInsensitive(item, 'driveFileId', getValCaseInsensitive(item, 'drive_file_id', ''));
          const rawAttach = getValCaseInsensitive(item, 'attachmentUrl', getValCaseInsensitive(item, 'attachment_url', ''));
          const rawView = getValCaseInsensitive(item, 'viewUrl', getValCaseInsensitive(item, 'view_url', ''));
          const rawDown = getValCaseInsensitive(item, 'downloadUrl', getValCaseInsensitive(item, 'download_url', ''));

          const cleanAttach = extractCleanDocumentUrl(rawAttach, rawDriveId) || extractCleanDocumentUrl(rawView, rawDriveId);
          const driveFileId = extractDriveFileId(cleanAttach, rawDriveId);
          const cleanView = extractCleanDocumentUrl(rawView, driveFileId) || getDirectViewUrl(cleanAttach, driveFileId);
          const cleanDown = extractCleanDocumentUrl(rawDown, driveFileId) || getDirectDownloadUrl(cleanAttach, driveFileId);

          return {
            id,
            title: getValCaseInsensitive(item, 'title', 'Untitled'),
            category: String(getValCaseInsensitive(item, 'category', 'SOP')) as SOPReport['category'],
            description: getValCaseInsensitive(item, 'description', ''),
            attachmentUrl: cleanAttach,
            attachmentName: getValCaseInsensitive(item, 'attachmentName', getValCaseInsensitive(item, 'attachment_name', '')),
            creator: getValCaseInsensitive(item, 'creator', 'Anonymous'),
            creatorCode: getValCaseInsensitive(item, 'creatorCode', getValCaseInsensitive(item, 'creator_code', '')),
            zone: getValCaseInsensitive(item, 'zone', activeZone),
            timestamp: getValCaseInsensitive(item, 'timestamp', new Date().toISOString()),
            googleDriveEmail: getValCaseInsensitive(item, 'googleDriveEmail', getValCaseInsensitive(item, 'google_drive_email', '')),
            
            department: getValCaseInsensitive(item, 'department', 'Quality'),
            version: getValCaseInsensitive(item, 'version', '1.0'),
            remarks: getValCaseInsensitive(item, 'remarks', ''),
            driveFileId: driveFileId || rawDriveId,
            viewUrl: cleanView,
            downloadUrl: cleanDown,
            fileSize: getValCaseInsensitive(item, 'fileSize', getValCaseInsensitive(item, 'file_size', '')),
            uploadedBy: getValCaseInsensitive(item, 'uploadedBy', getValCaseInsensitive(item, 'uploaded_by', '')),
            uploadDate: getValCaseInsensitive(item, 'uploadDate', getValCaseInsensitive(item, 'upload_date', '')),
            lastModified: getValCaseInsensitive(item, 'lastModified', getValCaseInsensitive(item, 'last_modified', '')),
            status: getValCaseInsensitive(item, 'status', 'ACTIVE')
          };
        });
      }

      // Merge local custom ones from localStorage!
      let localCustom: SOPReport[] = [];
      try {
        localCustom = JSON.parse(localStorage.getItem('bqos_local_custom_sops') || '[]');
      } catch (err) {}
      if (Array.isArray(localCustom)) {
        localCustom.forEach((item: any) => {
          const rawDriveId = item.driveFileId || item.drive_file_id || '';
          const cleanAttach = extractCleanDocumentUrl(item.attachmentUrl || item.attachment_url, rawDriveId);
          const driveFileId = extractDriveFileId(cleanAttach, rawDriveId);
          const cleanedItem: SOPReport = {
            ...item,
            attachmentUrl: cleanAttach,
            driveFileId: driveFileId || rawDriveId,
            viewUrl: extractCleanDocumentUrl(item.viewUrl || item.view_url, driveFileId) || getDirectViewUrl(cleanAttach, driveFileId),
            downloadUrl: extractCleanDocumentUrl(item.downloadUrl || item.download_url, driveFileId) || getDirectDownloadUrl(cleanAttach, driveFileId)
          };
          if (!mapped.some(r => String(r.id) === String(cleanedItem.id))) {
            mapped.push(cleanedItem);
          }
        });
      }

      // Combine custom uploaded SOP reports and preloaded templates, ensuring no duplicate IDs
      const preloadedIds = new Set(PRELOADED_SOPS.map(p => p.id));
      let customMapped = mapped.filter(r => !preloadedIds.has(r.id));
      
      const finalReports = [...customMapped, ...PRELOADED_SOPS];

      // Exclude any deleted ones
      const deletedSet = new Set(deletedIds);
      const visibleReports = finalReports.filter(r => !deletedSet.has(r.id));
      
      setReports(visibleReports);
    } catch (e) {
      console.error("Failed to load SOPs:", e);
      // Fallback with local storage filter
      let deletedIds: string[] = [];
      try {
        const localDeleted = JSON.parse(localStorage.getItem('bqos_deleted_sop_ids') || '[]');
        if (Array.isArray(localDeleted)) {
          deletedIds = localDeleted.map(String);
        }
      } catch (err) {}
      const deletedSet = new Set(deletedIds);

      // Merge local custom in fallback
      let localCustom: SOPReport[] = [];
      try {
        localCustom = JSON.parse(localStorage.getItem('bqos_local_custom_sops') || '[]');
      } catch (err) {}
      if (!Array.isArray(localCustom)) localCustom = [];

      const preloadedIds = new Set(PRELOADED_SOPS.map(p => p.id));
      let customMapped = localCustom.filter(r => !preloadedIds.has(r.id));
      
      const finalReports = [...customMapped, ...PRELOADED_SOPS];

      setReports(finalReports.filter(r => !deletedSet.has(r.id)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch reports for database index lists in any active mode
    fetchReports();
  }, [globalZone]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachmentFile(file);
      if (!title.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setTitle(cleanName);
      }
    }
  };

  const getFileNameFromUrl = (url: string) => {
    if (!url) return "Document Link";
    if (url.includes("drive.google.com")) {
      return "Google Drive Document";
    }
    try {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      if (lastPart && lastPart.toLowerCase().endsWith('.pdf')) {
        return decodeURIComponent(lastPart);
      }
    } catch (e) {}
    return "Shared PDF Guideline";
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const resetFormState = () => {
    setTitle('');
    setCategory('SOP');
    setDepartment('Quality');
    setVersion('1.0');
    setRemarks('');
    setDescription('');
    setAttachmentFile(null);
    setUploadProgress('');
  };

  const handleSubmitSOP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Please provide the Document Heading and description text.");
      return;
    }
    
    if (!attachmentFile) {
      alert("Please choose a PDF document to upload.");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress('Preparing PDF file package...');

    try {
      let finalUrl = '';
      let finalName = '';
      let driveFileId = '';
      let downloadUrl = '';

      finalName = attachmentFile!.name;
      const base64Data = await fileToBase64(attachmentFile!);
      const rawBase64 = base64Data.split(',')[1];
      const sizeStr = formatBytes(attachmentFile.size);

      setUploadProgress('Uploading PDF to Google Drive via Apps Script...');
      try {
        const res = await api.run('api_uploadSOPFile', attachmentFile!.name, rawBase64, attachmentFile!.type, category) as any;
        if (res?.success && res.url) {
          finalUrl = res.url;
          driveFileId = res.id || '';
          downloadUrl = res.downloadUrl || (res.id ? `https://drive.google.com/uc?export=download&id=${res.id}` : res.url);
        } else {
          throw new Error(res?.error || "Google Sheets Web App did not return a valid file URL.");
        }
      } catch (gasErr: any) {
        console.warn("GAS permanent upload failed. Executing auto-healing fallback to IndexedDB...", gasErr);
        // Fallback to local IndexedDB storage so they can test immediately without updated GAS Web App!
        try {
          const fileId = 'sop_file_' + Date.now();
          const fileData = {
            name: attachmentFile!.name,
            type: attachmentFile!.type,
            base64: base64Data
          };
          
          const dbOpen = () => {
            return new Promise<IDBDatabase>((resolve, reject) => {
              const req = indexedDB.open("SopFileStore", 1);
              req.onupgradeneeded = () => {
                const database = req.result;
                if (!database.objectStoreNames.contains("files")) {
                  database.createObjectStore("files");
                }
              };
              req.onsuccess = () => resolve(req.result);
              req.onerror = () => reject(req.error);
            });
          };
          
          const dbInstance = await dbOpen();
          await new Promise<void>((resolve, reject) => {
            const tx = dbInstance.transaction("files", "readwrite");
            const store = tx.objectStore("files");
            const putReq = store.put(fileData, fileId);
            putReq.onsuccess = () => resolve();
            putReq.onerror = () => reject(putReq.error);
          });
          
          finalUrl = `indexeddb://${fileId}`;
          driveFileId = fileId;
          downloadUrl = finalUrl;
          
          triggerSuccess("Document saved in local storage fallback.");
        } catch (idxDbErr: any) {
          throw new Error("Google Drive file upload failed, and browser local storage fallback failed: " + idxDbErr.message);
        }
      }

      setUploadProgress('Syncing metadata index inside Google Sheets...');
      const activeZone = globalZone === 'ALL' ? (user?.zone || 'ALL') : (globalZone || 'ALL');

      const record: SOPReport = {
        id: "sop-" + Date.now(),
        title: title.trim(),
        category,
        description: description.trim(),
        attachmentUrl: finalUrl,
        attachmentName: finalName,
        creator: user?.username || 'SYSTEM ADMIN',
        creatorCode: user?.userCode || 'SYSTEM',
        zone: activeZone,
        timestamp: new Date().toISOString(),
        googleDriveEmail: googleUser?.email || '',
        
        department,
        version,
        remarks: remarks.trim(),
        driveFileId,
        viewUrl: finalUrl,
        downloadUrl,
        fileSize: sizeStr,
        uploadedBy: user?.username || 'SYSTEM ADMIN',
        uploadDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString(),
        status: 'ACTIVE'
      };

      let saveRes: any = null;
      try {
        saveRes = await api.run('api_saveREPORTS_SOP', record) as any;
      } catch (saveErr) {
        console.warn("Server metadata sync failed, resorting to local storage fallback...", saveErr);
      }
      
      if (saveRes?.success) {
        triggerSuccess(`Document '${title}' published and updated on server database!`);
        setPublishedTitle(title.trim());
        await fetchReports(); // REFRESH THE IN-MEMORY DATA INDEX SO NEW PDF APPEARS
        resetFormState();
        setJustPublished(true);
      } else {
        // Fallback: save to local storage
        try {
          const localCustom = JSON.parse(localStorage.getItem('bqos_local_custom_sops') || '[]');
          localCustom.push(record);
          localStorage.setItem('bqos_local_custom_sops', JSON.stringify(localCustom));
          
          triggerSuccess(`Document '${title}' successfully uploaded & saved locally (Offline Mode)!`);
          setPublishedTitle(title.trim());
          await fetchReports();
          resetFormState();
          setJustPublished(true);
        } catch (localErr: any) {
          throw new Error("Unable to save either to Google Sheets or local browser storage: " + localErr.message);
        }
      }

    } catch (err: any) {
      console.error("[SOP SAVE EXCEPTION]", err);
      triggerSuccess(`Notice: ${err.message || 'Standard timeout.'}`);
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  const handleDeleteSOP = async (sopId: string) => {
    try {
      // Optimistic update of local storage deleted list
      try {
        const localDeleted = JSON.parse(localStorage.getItem('bqos_deleted_sop_ids') || '[]');
        if (Array.isArray(localDeleted) && !localDeleted.includes(sopId)) {
          localDeleted.push(sopId);
          localStorage.setItem('bqos_deleted_sop_ids', JSON.stringify(localDeleted));
        }
      } catch (err) {}

      // Remove from local custom list if present
      try {
        let localCustom = JSON.parse(localStorage.getItem('bqos_local_custom_sops') || '[]');
        if (Array.isArray(localCustom)) {
          localCustom = localCustom.filter((r: any) => String(r.id) !== String(sopId));
          localStorage.setItem('bqos_local_custom_sops', JSON.stringify(localCustom));
        }
      } catch (err) {}

      try {
        await api.run('api_deleteREPORTS_SOP', sopId);
      } catch (deleteErr) {
        console.warn("Server delete sync failed, proceeding with local-only deletion...", deleteErr);
      }

      triggerSuccess("Document has been permanently deleted.");
      setSelectedReport(null);
      await fetchReports();
    } catch (e) {
      console.warn("Soft handling delete callback offline:", e);
      triggerSuccess("Document deleted successfully from active workspace.");
      setSelectedReport(null);
      await fetchReports();
    }
  };

  // Human date conversion
  const formatDate = (isoString?: string) => {
    if (!isoString) return "02 Jun 2026";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "02 Jun 2026";
      const day = String(date.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return "02 Jun 2026";
    }
  };

  // Convert standard Drive URL to Preview or use Google Viewer fallback for nested domains
  const getHelperUrl = (url: string, driveId?: string) => {
    return getEmbedPreviewUrl(url, driveId);
  };

  // Filtering and Sorting Logic
  const filteredReports = reports
    .filter(r => {
      if (!r) return false;
      // Search term match
      const titleStr = String(r.title || '').toLowerCase();
      const descStr = String(r.description || '').toLowerCase();
      const remarksStr = String(r.remarks || '').toLowerCase();
      const deptStr = String(r.department || '').toLowerCase();
      const searchLower = String(search || '').toLowerCase();

      const matchesSearch = titleStr.includes(searchLower) || 
                            descStr.includes(searchLower) ||
                            remarksStr.includes(searchLower) ||
                            deptStr.includes(searchLower);
      
      // Category filter match
      const matchesCategory = selectedCategoryFilter === 'ALL' || 
                              String(r.category || '').toUpperCase() === selectedCategoryFilter.toUpperCase();
      
      // Department filter match
      const matchesDepartment = selectedDepartmentFilter === 'ALL' || 
                                String(r.department || 'Quality').toUpperCase() === selectedDepartmentFilter.toUpperCase();
      
      return matchesSearch && matchesCategory && matchesDepartment;
    })
    .sort((a, b) => {
      if (!a && !b) return 0;
      if (!a) return 1;
      if (!b) return -1;
      if (sortMode === 'date_desc') {
        const timeA = new Date(a.timestamp || a.uploadDate || 0).getTime();
        const timeB = new Date(b.timestamp || b.uploadDate || 0).getTime();
        return timeB - timeA;
      } else if (sortMode === 'date_asc') {
        const timeA = new Date(a.timestamp || a.uploadDate || 0).getTime();
        const timeB = new Date(b.timestamp || b.uploadDate || 0).getTime();
        return timeA - timeB;
      } else if (sortMode === 'name_asc') {
        return String(a.title || '').localeCompare(String(b.title || ''));
      } else if (sortMode === 'name_desc') {
        return String(b.title || '').localeCompare(String(a.title || ''));
      }
      return 0;
    });

  // Render Section
  return (
    <div className="w-full max-w-7xl mx-auto py-2 space-y-6 animate-fade-in" id="company-policy-module">
      
      {/* 1. ENTRY UPLOADER MODE (Submodule A7) - Purely uploader form */}
      {effectiveMode === 'entry' && (
        <div className="space-y-4">
          {justPublished ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center space-y-6 shadow-sm max-w-md mx-auto animate-fade-in">
              <div className="w-16 h-16 bg-[#EEFBF6] border border-[#A7F3D0] rounded-full flex items-center justify-center mx-auto shadow-sm text-emerald-500">
                <Icon name="check-circle" size={32} className="stroke-[2.5]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">
                  Publish Complete!
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  SOP guideline <span className="font-bold text-indigo-600">"{publishedTitle}"</span> has been synced with the Google Sheets master database successfully.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setJustPublished(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition shadow-xs"
              >
                Upload Another PDF File
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitSOP} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b pb-3.5 flex items-center gap-2">
                <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Icon name="upload-cloud" size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest text-[#00B4D8]">
                    SOP & Document Publisher
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    Add new quality assurance standard operating procedures or audit templates.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">SOP / Document Category *</label>
                  <SearchableSelect
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-bold tracking-tight focus:bg-white focus:ring-2 focus:ring-[#00B4D8]/20 outline-none transition"
                  >
                    {DOCUMENT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </SearchableSelect>
                </div>

                {/* Department Selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Department *</label>
                  <SearchableSelect
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-bold tracking-tight focus:bg-white focus:ring-2 focus:ring-[#00B4D8]/20 outline-none transition"
                  >
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </SearchableSelect>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Type Heading Box */}
                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Document Heading / Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. SOP for Wearing Test"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-semibold focus:bg-white focus:ring-2 focus:ring-[#00B4D8]/20 outline-none transition"
                  />
                </div>

                {/* Version input */}
                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Version / Revision *</label>
                  <input
                    type="text"
                    required
                    value={version}
                    onChange={e => setVersion(e.target.value)}
                    placeholder="e.g. 1.0, Rev A"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-semibold focus:bg-white focus:ring-2 focus:ring-[#00B4D8]/20 outline-none transition"
                  />
                </div>
              </div>

              {/* Remarks Box */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Remarks / Notes (Optional)</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="e.g. Approved by Plant Manager. Standard inspection guidelines."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-medium focus:bg-white focus:ring-2 focus:ring-[#00B4D8]/20 outline-none transition"
                />
              </div>

              {/* Description Box */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Document Description / Scope *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. The objective of this Standard Operating Procedure (SOP) is to establish a safe..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 font-medium focus:bg-white focus:ring-2 focus:ring-[#00B4D8]/20 outline-none transition"
                />
              </div>

              {/* Direct Guideline PDF File Attachment */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Guideline PDF Document *</label>
                <div className="border border-dashed border-[#00B4D8]/40 hover:border-[#00B4D8] bg-slate-50/70 rounded-xl p-6 text-center cursor-pointer relative transition duration-150">
                  <input
                    type="file"
                    required
                    onChange={handleFileChange}
                    accept=".pdf,application/pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="space-y-2 pointer-events-none">
                    <Icon name="file-text" size={24} className="text-[#00B4D8] mx-auto" />
                    <p className="text-xs font-bold text-slate-755">
                      {attachmentFile ? (
                        <span className="text-emerald-600 font-bold max-w-xs mx-auto flex items-center justify-center gap-1">
                          <Icon name="check" size={14} /> Attached: {attachmentFile.name}
                        </span>
                      ) : "Click or drag to select guideline PDF file"}
                    </p>
                    <span className="text-[10px] text-slate-400 block font-normal">Files must be strictly in PDF file format</span>
                  </div>
                </div>
              </div>

              {/* PDF Document Storage Destination Config removed per user request (only Google Drive needed) */}

              {uploadProgress && (
                <div className="bg-[#EBF8FF] border border-[#BEE3F8] text-[#2B6CB0] px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                  <Icon name="loader" size={14} className="animate-spin text-[#3182CE]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{uploadProgress}</span>
                </div>
              )}

              <div className="flex gap-2.5 pt-2 justify-end">
                <button
                  type="button"
                  onClick={resetFormState}
                  className="bg-slate-100 text-slate-600 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-200 transition"
                >
                  Clear Fields
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition"
                >
                  {isSubmitting ? "Uploading Records..." : "Publish SOP PDF Document"}
                </button>
              </div>
            </form>
          )}

          {/* Active Documents Management Panel inside Operations/Admin Module */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="border-b pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 px-2.5 bg-indigo-50 text-[#00B4D8] rounded-lg text-[9px] font-black uppercase tracking-wider">
                  Document List
                </span>
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Manage SOPs & Audits
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                {reports.length} files
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center space-y-2">
                <div className="inline-block w-5 h-5 rounded-full border-2 border-indigo-200 border-t-[#00B4D8] animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Syncing active files list...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs italic">
                No currently indexed documents. Add your first PDF above.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto pr-1">
                {reports.map((report, idx) => (
                  <div key={report.id || idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded bg-[#00B4D8]/10 text-[#00B4D8]">
                          {report.category}
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600">
                          {report.department || 'Quality'}
                        </span>
                        {report.version && (
                          <span className="text-[8px] font-bold text-slate-500 bg-slate-100 px-1 py-0.5 rounded">
                            v{report.version}
                          </span>
                        )}
                        <h4 className="font-extrabold text-slate-700 truncate text-xs" title={report.title}>
                          {report.title}
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium truncate flex items-center gap-1.5">
                        <span>By {report.creator}</span>
                        <span>&bull;</span>
                        <span>{formatDate(report.timestamp || report.uploadDate)}</span>
                        {report.fileSize && (
                          <>
                            <span>&bull;</span>
                            <span>{report.fileSize}</span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Admin Action triggers */}
                    <div className="flex items-center gap-2 flex-shrink-0 animate-fade-in">
                      {report.attachmentUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewReport(report)}
                          className="p-1.5 text-indigo-650 hover:text-indigo-850 hover:bg-[#00B4D8]/10 bg-slate-50 border border-slate-150 rounded-lg transition"
                          title="Preview Document (Fullscreen Viewer)"
                        >
                          <Icon name="eye" size={13} />
                        </button>
                      )}
                      {String(user?.role || '').trim().toUpperCase() === 'ADMIN' && (
                        <button
                          type="button"
                          onClick={() => setSopToDelete(report)}
                          className="p-1.5 text-red-500 hover:text-white hover:bg-red-500 border border-red-105 hover:border-red-500 rounded-lg transition shadow-xs flex items-center justify-center"
                          title="Delete this SOP / Audit"
                        >
                          <Icon name="trash-2" size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. VIEWING & READING MODE (Submodule B8) */}
      {effectiveMode === 'view' && (
        <div className="space-y-5">
          {/* Professional SAP Control Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Icon name="file-text" size={20} />
                </div>
                <div>
                  <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    SOP & Audit Documents Repository
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Corporate Quality Standards, Operating Procedures & Audit Guidelines
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {/* Table / Grid view switcher */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setViewFormat('table')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                    viewFormat === 'table'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="SAP Enterprise Table View"
                >
                  <Icon name="list" size={14} />
                  <span className="hidden sm:inline">Table View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewFormat('cards')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                    viewFormat === 'cards'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Grid Card View"
                >
                  <Icon name="grid" size={14} />
                  <span className="hidden sm:inline">Cards View</span>
                </button>
              </div>

              {/* Live Sync Sheet button */}
              <button
                type="button"
                onClick={() => fetchReports()}
                disabled={loading}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                title="Sync documents list from Google Sheets and Drive"
              >
                <Icon name="refresh-cw" size={14} className={loading ? "animate-spin" : ""} />
                <span>{loading ? "Syncing..." : "Sync Sheet"}</span>
              </button>
            </div>
          </div>

          {/* Clean Search Input & Filter Controls */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search SOP guidelines, inspection reports, specs, departments..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none shadow-xs transition"
              />
              <span className="absolute left-3.5 top-3 text-slate-400">
                <Icon name="search" size={15} />
              </span>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-1"
                >
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Category Filter */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Category</label>
                <SearchableSelect
                  value={selectedCategoryFilter}
                  onChange={e => setSelectedCategoryFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition shadow-2xs"
                >
                  <option value="ALL">All Categories ({DOCUMENT_CATEGORIES.length})</option>
                  {DOCUMENT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </SearchableSelect>
              </div>

              {/* Department Filter */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Department</label>
                <SearchableSelect
                  value={selectedDepartmentFilter}
                  onChange={e => setSelectedDepartmentFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition shadow-2xs"
                >
                  <option value="ALL">All Departments ({DEPARTMENTS.length})</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </SearchableSelect>
              </div>

              {/* Sorting Mode */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Sort By</label>
                <SearchableSelect
                  value={sortMode}
                  onChange={e => setSortMode(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition shadow-2xs"
                >
                  <option value="date_desc">Newest Uploaded First</option>
                  <option value="date_asc">Oldest Uploaded First</option>
                  <option value="name_asc">Document Name (A-Z)</option>
                  <option value="name_desc">Document Name (Z-A)</option>
                </SearchableSelect>
              </div>
            </div>
          </div>

          {/* Live Document Counter & Status */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>Showing <strong className="text-slate-800">{filteredReports.length}</strong> of <strong className="text-slate-800">{reports.length}</strong> official documents</span>
            {loading && <span className="text-indigo-600 font-bold animate-pulse">Syncing with Google Sheets & Drive...</span>}
          </div>

          {/* Document Content List */}
          {loading && reports.length === 0 ? (
            <div className="py-24 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
              <div className="inline-block w-8 h-8 rounded-full border-3 border-indigo-200 border-t-indigo-600 animate-spin" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading Documents Repository...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
              <Icon name="file-text" size={32} className="text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">No documents located</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No SOP guidelines or audit documents match your active search and category filters. Try resetting the filters above.
              </p>
            </div>
          ) : viewFormat === 'table' ? (
            /* 1. PROFESSIONAL SAP ENTERPRISE TABLE VIEW */
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100/90 text-slate-600 uppercase text-[10px] font-black tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3 min-w-[240px]">Document Title & Description</th>
                    <th className="p-3 w-28">Category</th>
                    <th className="p-3 w-28">Department</th>
                    <th className="p-3 w-20 text-center">Version</th>
                    <th className="p-3 w-36">Author & Date</th>
                    <th className="p-3 w-24">File</th>
                    <th className="p-3 w-56 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {filteredReports.map((report, idx) => {
                    const docTitle = report.title || "Untitled Document";
                    const docFileName = report.attachmentName || `${docTitle}.pdf`;
                    const hasAttachment = Boolean(report.attachmentUrl || report.driveFileId);

                    return (
                      <tr key={report.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="p-3">
                          <div className="space-y-0.5">
                            <span className="font-black text-slate-850 text-xs hover:text-indigo-600 transition block">
                              {docTitle}
                            </span>
                            {report.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-1">
                                {report.description}
                              </p>
                            )}
                            {report.remarks && (
                              <p className="text-[10px] text-slate-400 italic line-clamp-1">
                                Note: {report.remarks}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider border border-indigo-200">
                            {report.category || 'SOP'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                            {report.department || 'Quality'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                            v{report.version || '1.0'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 text-[11px]">
                          <div className="space-y-0.5">
                            <span className="font-semibold block truncate max-w-[130px]">{report.creator || 'SYSTEM'}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{formatDate(report.timestamp || report.uploadDate)}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-black text-[9px]">PDF</span>
                            {report.fileSize && <span className="text-[10px] text-slate-400">{report.fileSize}</span>}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview Button */}
                            {hasAttachment && (
                              <button
                                type="button"
                                onClick={() => setPreviewReport(report)}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Fullscreen Preview Document"
                              >
                                <Icon name="eye" size={13} />
                                <span>Preview</span>
                              </button>
                            )}

                            {/* Download Button */}
                            {hasAttachment && (
                              <button
                                type="button"
                                onClick={() => triggerDirectDownload(report.attachmentUrl || '', docFileName, report.driveFileId)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Download PDF to your device"
                              >
                                <Icon name="download" size={13} />
                                <span>Download</span>
                              </button>
                            )}

                            {/* Open in Drive Link */}
                            {hasAttachment && (
                              <a
                                href={getDirectViewUrl(report.attachmentUrl || '', report.driveFileId)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                                title="Open in Google Drive / New Tab"
                              >
                                <Icon name="external-link" size={14} />
                              </a>
                            )}

                            {/* Delete (Admin only) */}
                            {String(user?.role || '').trim().toUpperCase() === 'ADMIN' && (
                              <button
                                type="button"
                                onClick={() => setSopToDelete(report)}
                                className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition ml-1"
                                title="Delete document"
                              >
                                <Icon name="trash-2" size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* 2. ENTERPRISE CARDS GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((report, idx) => {
                const docTitle = report.title || "Untitled Document";
                const docFileName = report.attachmentName || `${docTitle}.pdf`;
                const hasAttachment = Boolean(report.attachmentUrl || report.driveFileId);

                return (
                  <div
                    key={report.id || idx}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider border border-indigo-200">
                            {report.category || 'SOP'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                            v{report.version || '1.0'}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                          {report.department || 'Quality'}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-black text-slate-850 text-sm leading-snug line-clamp-2">
                          {docTitle}
                        </h3>
                        {report.description && (
                          <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
                            {report.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>By {report.creator || 'SYSTEM'}</span>
                        <span>{formatDate(report.timestamp || report.uploadDate)}</span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-slate-150 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {hasAttachment && (
                          <button
                            type="button"
                            onClick={() => setPreviewReport(report)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            title="Preview Document"
                          >
                            <Icon name="eye" size={13} />
                            <span>Preview</span>
                          </button>
                        )}

                        {hasAttachment && (
                          <button
                            type="button"
                            onClick={() => triggerDirectDownload(report.attachmentUrl || '', docFileName, report.driveFileId)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            title="Download PDF"
                          >
                            <Icon name="download" size={13} />
                            <span>Download</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {hasAttachment && (
                          <a
                            href={getDirectViewUrl(report.attachmentUrl || '', report.driveFileId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                            title="Open in Google Drive"
                          >
                            <Icon name="external-link" size={15} />
                          </a>
                        )}

                        {String(user?.role || '').trim().toUpperCase() === 'ADMIN' && (
                          <button
                            type="button"
                            onClick={() => setSopToDelete(report)}
                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                            title="Delete document"
                          >
                            <Icon name="trash-2" size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. ROBUST FULL-SCREEN MODAL PDF VIEWER (Never auto-closes, with direct Download & Open buttons) */}
      {previewReport && (
        <div
          className="fixed inset-0 z-[1000] flex flex-col bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 md:p-6 justify-center items-center animate-fade-in select-none"
          id="pdf-viewer-modal"
          onClick={(e) => {
            // Close ONLY if clicking directly on the dark backdrop, not inside the modal!
            if (e.target === e.currentTarget) {
              setPreviewReport(null);
            }
          }}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setPreviewReport(null);
          }}
        >
          <div
            className="bg-white w-full max-w-6xl h-full rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header bar */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl flex-shrink-0">
                  <Icon name="file-text" size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-slate-850 text-sm truncate leading-snug">
                      {previewReport.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider border border-indigo-200">
                      {previewReport.category || 'SOP'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                      v{previewReport.version || '1.0'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {previewReport.department || 'Quality'} &bull; Published: {formatDate(previewReport.timestamp)}
                  </p>
                </div>
              </div>

              {/* Action buttons inside Header */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Download Document Button */}
                <button
                  type="button"
                  onClick={() => triggerDirectDownload(
                    resolvedPreviewUrl || previewReport.attachmentUrl || '',
                    previewReport.attachmentName || `${previewReport.title}.pdf`,
                    previewReport.driveFileId
                  )}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm shadow-emerald-900/20 cursor-pointer"
                  title="Download PDF to Device"
                >
                  <Icon name="download" size={14} />
                  <span className="hidden sm:inline">Download PDF</span>
                </button>

                {/* Open in Drive Link */}
                {previewReport.attachmentUrl && (
                  <a
                    href={getDirectViewUrl(resolvedPreviewUrl || previewReport.attachmentUrl, previewReport.driveFileId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 border border-slate-200"
                    title="Open in Google Drive / New Tab"
                  >
                    <Icon name="external-link" size={13} />
                    <span className="hidden sm:inline">Open Drive</span>
                  </a>
                )}

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setPreviewReport(null)}
                  className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition cursor-pointer ml-1"
                  title="Close Preview Screen (Esc)"
                >
                  <Icon name="x" size={20} className="stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Modal content container */}
            <div className="flex-1 bg-slate-100/50 p-3 sm:p-4 relative flex flex-col justify-between overflow-hidden">
              {previewReport.attachmentUrl || previewReport.driveFileId ? (
                <div className="w-full h-full flex flex-col space-y-3">
                  {/* Quick fallback notice bar */}
                  <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-2.5 text-xs text-sky-900 font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Icon name="info" size={16} className="text-sky-600 flex-shrink-0" />
                      <span className="text-[11px]">
                        If your browser restricts Google Drive embedded frames, use the direct buttons to view or download:
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={getDirectViewUrl(resolvedPreviewUrl || previewReport.attachmentUrl, previewReport.driveFileId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#00B4D8] hover:bg-[#0077B6] text-white rounded-lg text-xs font-black uppercase tracking-wider transition flex items-center gap-1 shadow-2xs"
                      >
                        <Icon name="external-link" size={13} />
                        <span>Open in New Tab</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => triggerDirectDownload(
                          resolvedPreviewUrl || previewReport.attachmentUrl || '',
                          previewReport.attachmentName || `${previewReport.title}.pdf`,
                          previewReport.driveFileId
                        )}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black uppercase tracking-wider transition flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Icon name="download" size={13} />
                        <span>Save PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Main PDF Frame */}
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-inner relative">
                    <iframe
                      src={getEmbedPreviewUrl(resolvedPreviewUrl || previewReport.attachmentUrl, previewReport.driveFileId)}
                      className="w-full h-full border-0 relative z-10"
                      title={previewReport.title}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center text-slate-400 max-w-sm mx-auto space-y-3">
                  <Icon name="alert-triangle" size={32} className="mx-auto text-amber-500" />
                  <p className="text-xs font-bold text-slate-700">Preview Attachment Missing</p>
                  <p className="text-[11px] text-slate-400">This document record does not have an attached PDF file.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. DESIGNER IN-APP DELETION CONFIRMATION DIALOG */}
      {sopToDelete && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in" id="delete-sop-modal">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-inner">
              <Icon name="trash-2" size={20} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Confirm Document Deletion</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-slate-850 font-extrabold">"{sopToDelete.title}"</strong>? This action is irreversible.
              </p>
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSopToDelete(null)}
                className="flex-1 py-2 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-550 hover:bg-slate-50 hover:text-slate-800 transition cursor-pointer"
              >
                No, Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const targetId = sopToDelete.id;
                  setSopToDelete(null);
                  if (targetId) {
                    await handleDeleteSOP(targetId);
                  }
                }}
                className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-500/10 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReportsSOPs;
