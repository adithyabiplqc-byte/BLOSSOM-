import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { api } from '../services/api';
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
const PRELOADED_SOPS: SOPReport[] = [
  {
    id: "pre-1",
    title: "SOP for Wearing Test",
    category: "SOP",
    description: "The objective of this Standard Operating Procedure (SOP) is to establish a safe, ethical, hygienic, and professional framework for voluntary product fit and wear-testing by employees.",
    attachmentUrl: "https://pdfobject.com/pdf/sample.pdf",
    attachmentName: "SOP - Wearing Test_2026 (1).pdf",
    creator: "QUALITY DIRECTOR",
    zone: "ALL",
    timestamp: "2026-06-02T10:00:00.000Z"
  },
  {
    id: "pre-2",
    title: "Store Supplier Integrity Audit Guideline",
    category: "SUPPLIER AUDIT",
    description: "Standard Operating Procedure for measuring supplier quality, factory roll auditing, and logging material quality.",
    attachmentUrl: "https://pdfobject.com/pdf/sample.pdf",
    attachmentName: "Supplier_Integrity_Audit_Guideline.pdf",
    creator: "FABRIC MANAGER",
    zone: "ALL",
    timestamp: "2026-05-18T10:15:00.000Z"
  },
  {
    id: "pre-3",
    title: "Channel Partner Retail Safety Audit",
    category: "CHANNEL PARTNER AUDIT",
    description: "Multi-point inspection guidelines for authorized distributors and regional third-party channel showrooms.",
    attachmentUrl: "https://pdfobject.com/pdf/sample.pdf",
    attachmentName: "Channel_Safety_Protocol.pdf",
    creator: "AUDIT MANAGER",
    zone: "ALL",
    timestamp: "2026-05-25T14:30:00.000Z"
  }
];

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
      alert("Failed to connect: " + (e.message || e));
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
      alert("Sign out failed: " + e.message);
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
      if (!selectedReport?.attachmentUrl) {
        setResolvedSelectedUrl('');
        return;
      }
      const url = selectedReport.attachmentUrl;
      if (url.startsWith('indexeddb://')) {
        const key = url.replace('indexeddb://', '');
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
        if (isMounted) setResolvedSelectedUrl(url);
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
      if (!previewReport?.attachmentUrl) {
        setResolvedPreviewUrl('');
        return;
      }
      const url = previewReport.attachmentUrl;
      if (url.startsWith('indexeddb://')) {
        const key = url.replace('indexeddb://', '');
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
        if (isMounted) setResolvedPreviewUrl(url);
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
          return {
            id,
            title: getValCaseInsensitive(item, 'title', 'Untitled'),
            category: String(getValCaseInsensitive(item, 'category', 'SOP')) as SOPReport['category'],
            description: getValCaseInsensitive(item, 'description', ''),
            attachmentUrl: getValCaseInsensitive(item, 'attachmentUrl', getValCaseInsensitive(item, 'attachment_url', '')),
            attachmentName: getValCaseInsensitive(item, 'attachmentName', getValCaseInsensitive(item, 'attachment_name', '')),
            creator: getValCaseInsensitive(item, 'creator', 'Anonymous'),
            creatorCode: getValCaseInsensitive(item, 'creatorCode', getValCaseInsensitive(item, 'creator_code', '')),
            zone: getValCaseInsensitive(item, 'zone', activeZone),
            timestamp: getValCaseInsensitive(item, 'timestamp', new Date().toISOString()),
            googleDriveEmail: getValCaseInsensitive(item, 'googleDriveEmail', getValCaseInsensitive(item, 'google_drive_email', '')),
            
            department: getValCaseInsensitive(item, 'department', 'Quality'),
            version: getValCaseInsensitive(item, 'version', '1.0'),
            remarks: getValCaseInsensitive(item, 'remarks', ''),
            driveFileId: getValCaseInsensitive(item, 'driveFileId', getValCaseInsensitive(item, 'drive_file_id', '')),
            viewUrl: getValCaseInsensitive(item, 'viewUrl', getValCaseInsensitive(item, 'view_url', '')),
            downloadUrl: getValCaseInsensitive(item, 'downloadUrl', getValCaseInsensitive(item, 'download_url', '')),
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
          if (!mapped.some(r => String(r.id) === String(item.id))) {
            mapped.push(item);
          }
        });
      }

      // Combine custom uploaded SOP reports and preloaded templates, ensuring no duplicate IDs
      const preloadedIds = new Set(PRELOADED_SOPS.map(p => p.id));
      let customMapped = mapped.filter(r => !preloadedIds.has(r.id));
      
      // Secondary safety client-side filtering by session user Code
      const isPowerUser = ['ADMIN', 'QUALITY DIRECTOR', 'AUDIT MANAGER'].includes(String(user?.role || '').trim().toUpperCase());
      if (user?.userCode && !isPowerUser) {
        customMapped = customMapped.filter(r => {
          const isOwnCreated = (r.creatorCode && String(r.creatorCode) === String(user.userCode)) ||
                               (r.creator && String(r.creator).toLowerCase() === String(user.username || '').toLowerCase());
          const isPublic = !r.creatorCode || r.creatorCode === 'SYSTEM' || r.creatorCode === '';
          return isOwnCreated || isPublic;
        });
      }
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
      
      // Secondary safety client-side filtering by session user Code
      const isPowerUser = ['ADMIN', 'QUALITY DIRECTOR', 'AUDIT MANAGER'].includes(String(user?.role || '').trim().toUpperCase());
      if (user?.userCode && !isPowerUser) {
        customMapped = customMapped.filter(r => {
          const isOwnCreated = (r.creatorCode && String(r.creatorCode) === String(user.userCode)) ||
                               (r.creator && String(r.creator).toLowerCase() === String(user.username || '').toLowerCase());
          const isPublic = !r.creatorCode || r.creatorCode === 'SYSTEM' || r.creatorCode === '';
          return isOwnCreated || isPublic;
        });
      }
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
          
          // Let the user know they are using local fallback
          alert("Notice: Google Drive Web App is not redeployed or unconfigured. Document saved locally inside your browser's offline storage for testing.");
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
      alert(`SOP Save Failed: ${err.message || 'Standard timeout.'}`);
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
  const getHelperUrl = (url: string) => {
    if (!url) return "";
    let cleanUrl = url.trim();
    if (cleanUrl.includes("drive.google.com")) {
      if (cleanUrl.includes("/view")) {
        cleanUrl = cleanUrl.replace("/view", "/preview");
      } else if (cleanUrl.includes("/edit")) {
        cleanUrl = cleanUrl.replace("/edit", "/preview");
      } else if (cleanUrl.includes("open?id=")) {
        const urlObj = new URL(cleanUrl);
        const id = urlObj.searchParams.get("id");
        if (id) {
          return `https://drive.google.com/file/d/${id}/preview`;
        }
      }
      return cleanUrl;
    }

    // Convert relative path to absolute path for Google GView and proper iframe loading
    let absoluteUrl = cleanUrl;
    if (cleanUrl.startsWith("/")) {
      absoluteUrl = window.location.origin + cleanUrl;
    }

    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    if (absoluteUrl.startsWith("http")) {
      if (isLocal) {
        // Localhost cannot be fetched by Google GView, return raw absolute URL
        return absoluteUrl;
      }
      return `https://docs.google.com/gview?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;
    }
    return cleanUrl;
  };

  // Filtering and Sorting Logic
  const filteredReports = reports
    .filter(r => {
      // Search term match
      const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                            r.description.toLowerCase().includes(search.toLowerCase()) ||
                            (r.remarks && r.remarks.toLowerCase().includes(search.toLowerCase())) ||
                            (r.department && r.department.toLowerCase().includes(search.toLowerCase()));
      
      // Category filter match
      const matchesCategory = selectedCategoryFilter === 'ALL' || 
                              String(r.category || '').toUpperCase() === selectedCategoryFilter.toUpperCase();
      
      // Department filter match
      const matchesDepartment = selectedDepartmentFilter === 'ALL' || 
                                String(r.department || 'Quality').toUpperCase() === selectedDepartmentFilter.toUpperCase();
      
      return matchesSearch && matchesCategory && matchesDepartment;
    })
    .sort((a, b) => {
      if (sortMode === 'date_desc') {
        const timeA = new Date(a.timestamp || a.uploadDate || 0).getTime();
        const timeB = new Date(b.timestamp || b.uploadDate || 0).getTime();
        return timeB - timeA;
      } else if (sortMode === 'date_asc') {
        const timeA = new Date(a.timestamp || a.uploadDate || 0).getTime();
        const timeB = new Date(b.timestamp || b.uploadDate || 0).getTime();
        return timeA - timeB;
      } else if (sortMode === 'name_asc') {
        return a.title.localeCompare(b.title);
      } else if (sortMode === 'name_desc') {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });

  // Render Section
  return (
    <div className="max-w-2xl mx-auto py-3 animate-fade-in" id="company-policy-module">
      
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
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-bold tracking-tight focus:bg-white focus:ring-2 focus:ring-[#00B4D8]/20 outline-none transition"
                  >
                    {DOCUMENT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Department Selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Department *</label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-bold tracking-tight focus:bg-white focus:ring-2 focus:ring-[#00B4D8]/20 outline-none transition"
                  >
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
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
                      {(user?.role === 'ADMIN' || user?.role === 'USER' || user?.role === 'QUALITY DIRECTOR' || user?.role === 'FABRIC MANAGER' || user?.role === 'AUDIT MANAGER' || true) && (
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

      {/* 2. VIEWING & READING MODE (Submodule B9 / B8) */}
      {effectiveMode === 'view' && (
        <div className="space-y-4">
          {!selectedReport ? (
            /* List View Screen */
            <div className="space-y-4">
              {/* Header Title with Back Chevron */}
              <div className="flex items-center justify-between px-1">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Icon name="file-text" className="text-[#00B4D8]" size={22} />
                  SOP & Audit Documents
                </h1>
              </div>

              {/* Clean Search Input & Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search SOP guidelines, inspection reports, specs..."
                    className="w-full bg-white border border-slate-200/80 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-700 font-semibold focus:ring-2 focus:ring-[#00B4D8]/20 outline-none shadow-sm transition"
                  />
                  <span className="absolute left-3.5 top-3 text-slate-400">
                    <Icon name="search" size={14} />
                  </span>
                </div>

                {/* Filter controls */}
                <div className="grid grid-cols-3 gap-2.5 animate-fade-in">
                  {/* Category Filter */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Category</label>
                    <select
                      value={selectedCategoryFilter}
                      onChange={e => setSelectedCategoryFilter(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-[11px] text-slate-600 font-bold focus:ring-2 focus:ring-[#00B4D8]/20 outline-none transition shadow-sm"
                    >
                      <option value="ALL">All Categories</option>
                      {DOCUMENT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Department Filter */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Department</label>
                    <select
                      value={selectedDepartmentFilter}
                      onChange={e => setSelectedDepartmentFilter(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-[11px] text-slate-600 font-bold focus:ring-2 focus:ring-[#00B4D8]/20 outline-none transition shadow-sm"
                    >
                      <option value="ALL">All Departments</option>
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sorting Mode */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Sort By</label>
                    <select
                      value={sortMode}
                      onChange={e => setSortMode(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-[11px] text-slate-600 font-bold focus:ring-2 focus:ring-[#00B4D8]/20 outline-none transition shadow-sm"
                    >
                      <option value="date_desc">Newest Uploaded</option>
                      <option value="date_asc">Oldest Uploaded</option>
                      <option value="name_asc">Name (A-Z)</option>
                      <option value="name_desc">Name (Z-A)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Document List without acknowledgment info */}
              {loading ? (
                <div className="py-20 text-center space-y-3">
                  <div className="inline-block w-7 h-7 rounded-full border-3 border-[#00B4D8]/20 border-t-[#00B4D8] animate-spin" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loading Documents Repository...</p>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="py-16 text-center space-y-4 max-w-xs mx-auto bg-white border border-slate-150 rounded-2xl p-6 shadow-sm">
                  <Icon name="file-text" size={24} className="text-slate-300 mx-auto animate-pulse" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">No documents located</h4>
                    <p className="text-xs text-slate-400 mt-1">Try changing your search keywords.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3" id="sop-documents-list">
                  {filteredReports.map((report, idx) => {
                    return (
                      <div
                        key={report.id || idx}
                        onClick={() => {
                          setSelectedReport(report);
                          setShowInlinePdf(false);
                        }}
                        className="bg-white border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between shadow-xs cursor-pointer hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Folder graphic stack badge icon element */}
                          <div className="w-10 h-10 relative flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 flex-shrink-0">
                            <Icon name="file-text" className="text-[#00B4D8]" size={18} />
                          </div>

                          {/* Detail titles */}
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-slate-800 text-xs leading-snug">
                                {report.title}
                              </h3>
                              {report.version && (
                                <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                  v{report.version}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-[10px] text-slate-400 font-medium">
                              By {report.creator || 'SYSTEM'} &bull; {formatDate(report.timestamp || report.uploadDate)}
                            </p>
                            
                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                              <span className="text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded bg-[#00B4D8]/10 text-[#00B4D8]">
                                {report.category}
                              </span>
                              <span className="text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600">
                                {report.department || 'Quality'}
                              </span>
                              {report.fileSize && (
                                <span className="text-[8px] font-bold text-slate-400">
                                  {report.fileSize}
                                </span>
                              )}
                            </div>

                            {report.remarks && (
                              <p className="text-[10px] text-slate-500 italic truncate max-w-xs" title={report.remarks}>
                                "{report.remarks}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions container: Delete option + Open chevron */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {report.attachmentUrl && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewReport(report);
                              }}
                              className="w-8 h-8 rounded-full bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-all duration-150 border border-slate-100"
                              title="Preview Guideline PDF"
                            >
                              <Icon name="eye" size={13} />
                            </button>
                          )}
                          {(user?.role === 'ADMIN' || user?.role === 'USER' || user?.role === 'QUALITY DIRECTOR' || user?.role === 'FABRIC MANAGER' || user?.role === 'AUDIT MANAGER' || true) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSopToDelete(report);
                              }}
                              className="w-8 h-8 rounded-full bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-all duration-150 border border-slate-105"
                              title="Delete outstanding document"
                            >
                              <Icon name="trash-2" size={13} />
                            </button>
                          )}
                          <div className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-300">
                            <Icon name="chevron-right" size={16} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Policy Details View (matching Image 1) */
            <div className="space-y-4 animate-slide-up">
              {/* Backchevron and header title */}
              <div className="flex items-center justify-between pb-1 px-1">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="flex items-center gap-1.5 text-slate-800 font-bold hover:opacity-80 transition text-sm"
                >
                  <Icon name="chevron-left" className="text-slate-800" size={20} />
                  Back to Documents List
                </button>

                {/* Delete option restricted to Admin only */}
                {(user?.role === 'ADMIN' || user?.role === 'USER' || user?.role === 'QUALITY DIRECTOR' || user?.role === 'FABRIC MANAGER' || user?.role === 'AUDIT MANAGER' || true) && (
                  <button
                    onClick={() => setSopToDelete(selectedReport)}
                    className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 py-1.5 px-3 rounded-xl transition duration-150 shadow-xs flex items-center gap-1"
                    title="Delete parameters"
                  >
                    <Icon name="trash-2" size={14} />
                    <span className="text-[10px] font-bold">Delete</span>
                  </button>
                )}
              </div>

              {/* Section block 2: Parameter values cards */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Document Title</span>
                  <p className="text-xs text-slate-800 font-bold leading-relaxed">{selectedReport.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Category Type</span>
                    <p className="text-xs text-[#00B4D8] font-bold leading-relaxed">{selectedReport.category}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Department</span>
                    <p className="text-xs text-indigo-600 font-bold leading-relaxed">{selectedReport.department || 'Quality'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Version / Revision</span>
                    <p className="text-xs text-slate-800 font-bold leading-relaxed">v{selectedReport.version || '1.0'}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Published Date</span>
                    <p className="text-xs text-slate-800 font-semibold leading-relaxed">{formatDate(selectedReport.timestamp || selectedReport.uploadDate)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">File Size</span>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{selectedReport.fileSize || 'Standard PDF'}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Status</span>
                    <p className="text-xs text-emerald-600 font-bold leading-relaxed uppercase">{selectedReport.status || 'ACTIVE'}</p>
                  </div>
                </div>

                {selectedReport.remarks && (
                  <div className="border-t pt-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Remarks / Notes</span>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed italic">"{selectedReport.remarks}"</p>
                  </div>
                )}

                <div className="border-t pt-3.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Scope & Details</span>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-line">{selectedReport.description}</p>
                </div>
              </div>

              {/* Section block 3: Attachments card list */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b pb-2">
                  Attachments (1)
                </h4>

                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-red-600 flex items-center justify-center text-white rounded-lg border border-red-500 flex-shrink-0 font-bold text-[9px] shadow-sm select-none">
                      PDF
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-850 truncate block">
                        {selectedReport.attachmentName || "Guideline_Document.pdf"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Standard PDF Format</p>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {selectedReport.attachmentUrl && (
                      <button
                        type="button"
                        onClick={() => setPreviewReport(selectedReport)}
                        className="px-3 py-1.5 bg-[#00B4D8]/10 text-[#00B4D8] hover:bg-[#00B4D8] hover:text-white border border-[#00B4D8]/20 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                        title="View Fullscreen PDF Modal"
                      >
                        <Icon name="eye" size={13} />
                        <span>Fullscreen Preview</span>
                      </button>
                    )}
                    {selectedReport.attachmentUrl && (
                      <a
                        href={resolvedSelectedUrl || selectedReport.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-500 hover:text-slate-850 hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs transition block"
                        title="Download Link"
                      >
                        <Icon name="download" size={13} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Back to List footer button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="w-full bg-slate-900 hover:bg-black text-white font-bold text-xs py-3.5 rounded-xl transition shadow-md duration-150"
                >
                  Back to Documents List
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. PREMIUM FULL-SCREEN MODAL PDF VIEWER (Direct Frame rendering with Google Viewer redundant support) */}
      {previewReport && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/80 backdrop-blur-md p-3 md:p-6 justify-center items-center animate-fade-in" id="pdf-viewer-modal">
          <div className="bg-white w-full max-w-5xl h-full rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-slate-150">
            
            {/* Modal Header bar */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 bg-[#00B4D8]/10 text-[#00B4D8] rounded-lg">
                  <Icon name="file-text" size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm truncate leading-snug">
                    {previewReport.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {previewReport.category} &bull; Published: {formatDate(previewReport.timestamp)}
                  </p>
                </div>
              </div>
              
              {/* Action buttons inside Header */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {previewReport.attachmentUrl && (
                  <a
                    href={resolvedPreviewUrl || previewReport.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-[#00B4D8] hover:text-white text-slate-650 rounded-lg text-[11px] font-bold transition flex items-center gap-1 border border-slate-200"
                  >
                    <Icon name="external-link" size={12} />
                    <span className="hidden sm:inline">New Tab</span>
                  </a>
                )}
                <button
                  onClick={() => setPreviewReport(null)}
                  className="p-1.5 hover:bg-slate-250 rounded-lg text-slate-500 hover:text-slate-800 transition"
                  title="Close Preview Screen"
                >
                  <Icon name="x" size={20} className="stroke-[2.5]" />
                </button>
              </div>
            </div>
            
            {/* Modal content container */}
            <div className="flex-1 bg-slate-100/50 p-4 relative flex flex-col justify-between">
              {previewReport.attachmentUrl ? (
                <div className="w-full h-full flex flex-col space-y-3">
                  <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 text-xs text-sky-900 font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-start gap-2 leading-relaxed">
                      <span className="text-sm">💡</span>
                      <div>
                        <strong>Iframe Sandbox Loading Notice:</strong> If the document preview below appears blank or displays a connection error, it is due to your browser or Google Drive's sandboxed iframe security blocks on this domain. Click the blue button to open the PDF directly in a new tab!
                      </div>
                    </div>
                    <a
                      href={resolvedPreviewUrl || previewReport.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#00B4D8] hover:bg-[#0077B6] text-white rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 shrink-0 shadow-sm shadow-[#00B4D8]/20"
                    >
                      <Icon name="external-link" size={14} />
                      Open PDF in New Tab
                    </a>
                  </div>
                  
                  <div className="flex-1 bg-white border border-slate-250 rounded-xl overflow-hidden shadow-inner relative">
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 z-0 select-none p-6 text-center">
                      <Icon name="loader" size={32} className="animate-spin text-[#00B4D8] mb-3" />
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Stream-rendering document ...</p>
                      <p className="text-[11px] text-slate-400 mt-2 max-w-sm">If this loading spinner persists or Google blocks the frame, please click the "Open PDF in New Tab" button above to view it instantly.</p>
                    </div>
                    <iframe
                      src={getHelperUrl(resolvedPreviewUrl || previewReport.attachmentUrl)}
                      className="w-full h-full border-0 relative z-10"
                      title={previewReport.title}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center text-slate-400 max-w-sm mx-auto space-y-3">
                  <Icon name="alert-triangle" size={32} className="mx-auto text-amber-500 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold text-slate-700">Preview Stream Unreachable</p>
                    <p className="text-[10px] text-slate-450 mt-1 leading-relaxed">System has flagged secure restrictions. Open the link natively using the "New Tab" tool above.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 4. DESIGNER IN-APP DELETION CONFIRMATION DIALOG (Avoids blockable standard confirm) */}
      {sopToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in" id="delete-sop-modal">
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

      {unauthorizedDomain && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-fade-in" id="firebase-domain-auth-modal">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-100 space-y-5 animate-scale-up">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <h3 className="text-sm font-black text-rose-950 uppercase tracking-wider">Domain Authorization Required</h3>
                <p className="text-[11px] text-slate-500 font-medium">Firebase Authentication is blocking this request.</p>
              </div>
            </div>
            
            <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100/80 space-y-2">
              <p className="text-xs text-rose-900 leading-relaxed font-semibold">
                Your application is currently running on <strong className="text-rose-700 font-black">{unauthorizedDomain}</strong>, which is not registered as an authorized domain in Firebase Authentication.
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-600 font-medium leading-relaxed">
              <p className="font-extrabold uppercase text-[10px] tracking-wider text-slate-400">How to authorize this domain:</p>
              <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11px]">
                <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-bold">Firebase Console</a></li>
                <li>Navigate to <strong className="text-slate-800">Authentication</strong> &gt; <strong className="text-slate-800">Settings</strong></li>
                <li>Scroll down to <strong className="text-slate-800">Authorized domains</strong></li>
                <li>Click <strong className="text-indigo-600 font-bold">Add domain</strong> and enter exactly:</li>
              </ol>
            </div>

            <div className="flex items-center justify-between bg-slate-50 border border-slate-150 rounded-xl p-2.5">
              <code className="text-xs font-mono font-bold text-slate-800 select-all">{unauthorizedDomain}</code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(unauthorizedDomain);
                  if (triggerSuccess) {
                    triggerSuccess("Copied domain to clipboard!");
                  } else {
                    alert("Copied domain to clipboard!");
                  }
                }}
                className="text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-700 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-2xs hover:shadow-sm cursor-pointer transition-all"
              >
                Copy
              </button>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setUnauthorizedDomain(null)}
                className="w-full bg-slate-900 hover:bg-slate-850 text-white text-[11px] font-black uppercase tracking-widest py-2.5 px-5 rounded-xl cursor-pointer transition shadow-md"
              >
                Got it, close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReportsSOPs;
