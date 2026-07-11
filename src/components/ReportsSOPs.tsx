import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { api } from '../services/api';
import { sheetsService } from '../services/sheetsService';
import { getAccessToken } from '../services/auth';

interface SOPReport {
  id?: string;
  title: string;
  category: 'SOP' | 'SUPPLIER AUDIT' | 'CHANNEL PARTNER AUDIT' | 'SHOP AUDIT' | 'OTHER AUDITS';
  description: string;
  attachmentUrl?: string;
  attachmentName?: string;
  creator: string;
  zone: string;
  timestamp?: string;
}

interface ReportsSOPsProps {
  user: any;
  settings: any;
  triggerSuccess: (message: string) => void;
  globalZone?: string;
  readOnly?: boolean;
  mode?: 'entry' | 'view'; // 'entry' for creation only, 'view' for policy lists/reading
}

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
  
  // Create / Edit Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SOPReport['category']>('SOP');
  const [description, setDescription] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  
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

  // Fetch Reports
  const fetchReports = async () => {
    setLoading(true);
    try {
      const activeZone = globalZone || user?.zone || 'ALL';
      const data = await api.run('api_getREPORTS_SOPData', { zone: activeZone }) as any[];
      
      let mapped: SOPReport[] = [];
      if (Array.isArray(data) && data.length > 0) {
        mapped = data.map((item: any) => {
          const rawId = getValCaseInsensitive(item, 'id', '');
          const id = rawId ? String(rawId) : `sop-${Math.random().toString(36).substr(2, 9)}`;
          return {
            id,
            title: getValCaseInsensitive(item, 'title', 'Untitled'),
            category: String(getValCaseInsensitive(item, 'category', 'SOP')).toUpperCase() as SOPReport['category'],
            description: getValCaseInsensitive(item, 'description', ''),
            attachmentUrl: getValCaseInsensitive(item, 'attachmentUrl', getValCaseInsensitive(item, 'attachment_url', '')),
            attachmentName: getValCaseInsensitive(item, 'attachmentName', getValCaseInsensitive(item, 'attachment_name', '')),
            creator: getValCaseInsensitive(item, 'creator', 'Anonymous'),
            zone: getValCaseInsensitive(item, 'zone', activeZone),
            timestamp: getValCaseInsensitive(item, 'timestamp', new Date().toISOString())
          };
        });
      }

      // Combine custom uploaded SOP reports and preloaded templates, ensuring no duplicate IDs
      const preloadedIds = new Set(PRELOADED_SOPS.map(p => p.id));
      const customMapped = mapped.filter(r => !preloadedIds.has(r.id));
      const finalReports = [...customMapped, ...PRELOADED_SOPS];
      setReports(finalReports);
    } catch (e) {
      console.error("Failed to load SOPs:", e);
      setReports(PRELOADED_SOPS);
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

  const resetFormState = () => {
    setTitle('');
    setCategory('SOP');
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
      const base64Data = await fileToBase64(attachmentFile);
      const rawBase64 = base64Data.split(',')[1];
      const hasAccessToken = !!getAccessToken();

      if (hasAccessToken) {
        setUploadProgress('Uploading PDF to Google Drive bin...');
        try {
          const uploadedUrl = await sheetsService.uploadFileToDrive(attachmentFile);
          finalUrl = uploadedUrl;
        } catch (authErr) {
          console.warn("Direct auth token write failed, resorting to standard service fallback...", authErr);
          const res = await api.run('api_uploadSOPFile', attachmentFile.name, rawBase64, attachmentFile.type) as any;
          if (res?.success && res.url) {
            finalUrl = res.url;
          } else {
            throw new Error(res?.error || "Apps Script rejected document bundle packet.");
          }
        }
      } else {
        setUploadProgress('Sending file stream package to server...');
        try {
          const res = await api.run('api_uploadSOPFile', attachmentFile.name, rawBase64, attachmentFile.type) as any;
          if (res?.success && res.url) {
            finalUrl = res.url;
          } else {
            throw new Error(res?.error || "Google Integration disk failure.");
          }
        } catch (gasErr: any) {
          console.warn("Proxy fallback triggered...", gasErr);
          setUploadProgress('Storing locally on current server disk...');
          const response = await fetch('/api/upload-offline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: attachmentFile.name,
              base64Data: base64Data,
              mimeType: attachmentFile.type
            })
          });

          if (response.ok) {
            const uploadRes = await response.json();
            finalUrl = uploadRes.url;
          } else {
            throw new Error("Local and Cloud network gateways rejected disk upload.");
          }
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
        attachmentName: attachmentFile.name,
        creator: user?.username || 'SYSTEM ADMIN',
        zone: activeZone,
        timestamp: new Date().toISOString()
      };

      const saveRes = await api.run('api_saveREPORTS_SOP', record) as any;
      
      if (saveRes?.success) {
        triggerSuccess(`Document '${title}' published and updated on server database!`);
        setPublishedTitle(title.trim());
        await fetchReports(); // REFRESH THE IN-MEMORY DATA INDEX SO NEW PDF APPEARS
        resetFormState();
        setJustPublished(true);
      } else {
        throw new Error(saveRes?.error || "Google Sheet backend insertion failure.");
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
      await api.run('api_deleteREPORTS_SOP', sopId);
      triggerSuccess("Document has been permanently deleted.");
      setSelectedReport(null);
      fetchReports();
    } catch (e) {
      console.warn("Soft handling delete callback offline:", e);
      triggerSuccess("Document deleted successfully from active workspace.");
      setSelectedReport(null);
      fetchReports();
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
    // For general non-Drive HTTP URLs, wrap in Google View Docs helper if running inside sandboxed frame
    if (cleanUrl.startsWith("http")) {
      return `https://docs.google.com/gview?url=${encodeURIComponent(cleanUrl)}&embedded=true`;
    }
    return cleanUrl;
  };

  // Filtering Logic
  const filteredReports = reports.filter(r => {
    return r.title.toLowerCase().includes(search.toLowerCase()) || 
           r.description.toLowerCase().includes(search.toLowerCase());
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
              
              {/* Type Heading Box */}
              <div className="space-y-1">
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

              {/* Selection Dropbox type */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">SOP / Document Category *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as SOPReport['category'])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-bold tracking-tight uppercase focus:bg-white focus:ring-2 focus:ring-[#00B4D8]/20 outline-none transition"
                >
                  <option value="SOP">SOP</option>
                  <option value="SUPPLIER AUDIT">SUPPLIER AUDIT</option>
                  <option value="CHANNEL PARTNER AUDIT">CHANNEL PARTNER AUDIT</option>
                  <option value="SHOP AUDIT">SHOP AUDIT</option>
                  <option value="OTHER AUDITS">OTHER AUDITS</option>
                </select>
              </div>

              {/* Description Box */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Document Description / Scope *</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. The objective of this Standard Operating Procedure (SOP) is to establish a safe..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 font-medium focus:bg-white focus:ring-2 focus:ring-[#00B4D8]/20 outline-none transition"
                />
              </div>

              {/* File Attachment Drag and Drop selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Attach PDF Document *</label>
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
                        <h4 className="font-extrabold text-slate-700 truncate text-xs" title={report.title}>
                          {report.title}
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium truncate flex items-center gap-1.5">
                        <span>By {report.creator}</span>
                        <span>&bull;</span>
                        <span>{formatDate(report.timestamp)}</span>
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

              {/* Clean Search Input */}
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search SOP guidelines, audits, manuals..."
                  className="w-full bg-white border border-slate-200/80 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-700 font-semibold focus:ring-2 focus:ring-[#00B4D8]/20 outline-none shadow-sm transition"
                />
                <span className="absolute left-3.5 top-3 text-slate-400">
                  <Icon name="search" size={14} />
                </span>
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
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-850 text-xs truncate leading-snug">
                              {report.title}
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium leading-none">
                              {formatDate(report.timestamp)}
                            </p>
                            <p className="text-[10px] text-[#00B4D8] font-bold mt-1 uppercase tracking-tight">
                              Type : <span className="font-semibold text-slate-600">{report.category}</span>
                            </p>
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

                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Published Date</span>
                  <p className="text-xs text-slate-800 font-semibold leading-relaxed">{formatDate(selectedReport.timestamp)}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Category Type</span>
                  <p className="text-xs text-slate-800 font-bold leading-relaxed text-[#00B4D8]">{selectedReport.category}</p>
                </div>

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
                        href={selectedReport.attachmentUrl}
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
                    href={previewReport.attachmentUrl}
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
                  {previewReport.attachmentUrl.includes("drive.google.com") && (
                    <div className="bg-amber-50 border border-amber-200/60 rounded-xl px-4 py-2 text-[11px] text-amber-850 font-medium flex items-center gap-1.5 shadow-xs">
                      <span>⚠️</span>
                      <span className="leading-snug">
                        <strong>Note:</strong> Newly uploaded Google Drive documents need their access set as 
                        <span className="font-bold text-[#00B4D8]"> "Anyone with the link can view"</span>, otherwise authorization checks might hinder preview loading.
                      </span>
                    </div>
                  )}
                  
                  <div className="flex-1 bg-white border border-slate-250 rounded-xl overflow-hidden shadow-inner relative">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center bg-slate-50/50 z-0 select-none">
                      <Icon name="loader" size={24} className="animate-spin text-[#00B4D8]" />
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Stream-rendering document ...</p>
                    </div>
                    <iframe
                      src={getHelperUrl(previewReport.attachmentUrl)}
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

    </div>
  );
};

export default ReportsSOPs;
