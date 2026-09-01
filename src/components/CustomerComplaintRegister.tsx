import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { api } from '../services/api';
import { flexibleSearchMatch } from '../utils/search';
import { getDirectImageUrl, parseAndNormalizeImages } from '../utils/imageUtils';
import SmartImage from './SmartImage';

interface CustomerComplaintRegisterProps {
  user: any;
  settings?: any;
  triggerSuccess: (message: string) => void;
  globalZone?: string;
  refreshData?: () => void;
  mode?: 'entry' | 'view';
}

interface ImageAttachment {
  name: string;
  url: string;
  driveId?: string;
  downloadUrl?: string;
  rawBase64?: string;
  mimeType?: string;
  isPendingUpload?: boolean;
}

export interface ComplaintRecord {
  id: string;
  dateTime: string;
  customerName: string;
  style: string;
  size: string;
  complaintDetails: string;
  pcsCount: number | string;
  immediateAction: string;
  rootCause: string;
  correctiveAction: string;
  pendingAction: string;
  effectiveAfterThreeMonths: string;
  closedOn: string;
  images: ImageAttachment[];
  status?: string;
  createdBy?: string;
  zone?: string;
  timestamp?: string;
}

const CustomerComplaintRegister: React.FC<CustomerComplaintRegisterProps> = ({
  user,
  triggerSuccess,
  globalZone = 'ALL',
  refreshData,
  mode = 'entry'
}) => {
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  
  // Active editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ComplaintRecord | null>(null);
  
  // UI Tabs / Filters
  const [activeTab, setActiveTab] = useState<'form' | 'list'>(mode === 'view' ? 'list' : 'form');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
  const [lightboxData, setLightboxData] = useState<{
    images: any[];
    activeIndex: number;
    title?: string;
    useEmbed?: boolean;
  } | null>(null);

  // Form State initialized with defaults
  const [form, setForm] = useState({
    dateTime: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    customerName: '',
    style: '',
    size: '',
    complaintDetails: '',
    pcsCount: 1,
    immediateAction: '',
    rootCause: '',
    correctiveAction: '',
    pendingAction: '',
    effectiveAfterThreeMonths: 'Pending Evaluation',
    closedOn: '',
    images: [] as ImageAttachment[],
  });

  // Fetch complaints on load or zone change
  const fetchComplaints = async (forceRefresh = false) => {
    if (forceRefresh) {
      api.clearCache('api_getCustomerComplaints');
      api.clearCache();
    }
    setLoading(true);
    try {
      const res = await api.run('api_getCustomerComplaints', { zone: globalZone });
      if (Array.isArray(res)) {
        const normalized = res.map(r => {
          let parsed = parseAndNormalizeImages(r.images);
          if (parsed.length === 0) {
            parsed = parseAndNormalizeImages(r);
          }
          return {
            ...r,
            images: parsed
          };
        });
        setComplaints(normalized);
      } else {
        setComplaints([]);
      }
    } catch (err) {
      console.error("Failed to load customer complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [globalZone]);

  const handleClearAllComplaints = async () => {
    if (!window.confirm("ARE YOU SURE? This will PERMANENTLY CLEAR ALL Customer Complaint records from the app and Google Sheets!")) {
      return;
    }
    setLoading(true);
    try {
      await api.run('api_clearAllCustomerComplaints');
      setComplaints([]);
      resetForm();
      alert("All customer complaint records have been successfully cleared!");
    } catch (err: any) {
      alert("Error clearing customer complaints: " + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      dateTime: new Date().toISOString().slice(0, 16),
      customerName: '',
      style: '',
      size: '',
      complaintDetails: '',
      pcsCount: 1,
      immediateAction: '',
      rootCause: '',
      correctiveAction: '',
      pendingAction: '',
      effectiveAfterThreeMonths: 'Pending Evaluation',
      closedOn: '',
      images: [],
    });
  };

  // Convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Local image file selector (loads in app preview first)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setUploadProgress(`Loading ${files.length} photo(s) in app preview...`);

    const newLocalImages: ImageAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        alert(`File "${file.name}" is not an image file.`);
        continue;
      }

      try {
        const base64Data = await fileToBase64(file);
        const rawBase64 = base64Data.split(',')[1];

        newLocalImages.push({
          name: file.name,
          url: base64Data, // local base64 preview
          rawBase64: rawBase64,
          mimeType: file.type,
          isPendingUpload: true
        });
      } catch (err) {
        console.error(`Error reading ${file.name}:`, err);
      }
    }

    setForm(prev => ({
      ...prev,
      images: [...prev.images, ...newLocalImages]
    }));

    setUploadingImage(false);
    setUploadProgress('');
    e.target.value = '';
  };

  // Remove an image from form
  const handleRemoveImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Start editing a record
  const handleEditRecord = (record: ComplaintRecord) => {
    setEditingId(record.id);
    setForm({
      dateTime: record.dateTime ? new Date(record.dateTime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      customerName: record.customerName || '',
      style: record.style || '',
      size: record.size || '',
      complaintDetails: record.complaintDetails || '',
      pcsCount: record.pcsCount || 1,
      immediateAction: record.immediateAction || '',
      rootCause: record.rootCause || '',
      correctiveAction: record.correctiveAction || '',
      pendingAction: record.pendingAction || '',
      effectiveAfterThreeMonths: record.effectiveAfterThreeMonths || 'Pending Evaluation',
      closedOn: record.closedOn || '',
      images: parseAndNormalizeImages(record.images || (record as any)['ATTACHED IMAGES'] || (record as any)['attachedImages'] || (record as any)['ATTACHED_IMAGES'] || (record as any).image || (record as any).photos || (record as any).photo || (record as any).attachments || (record as any).attachment || record),
    });
    setActiveTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit / Save Complaint (Uploads any local preview images to Google Drive now)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.customerName.trim()) {
      alert("Please enter the Customer / Shop / Distributor Name.");
      return;
    }
    if (!form.complaintDetails.trim()) {
      alert("Please enter the Details of Complaint.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload any pending local preview images to Google Drive
      const finalUploadedImages: ImageAttachment[] = [];
      const pendingImages = form.images.filter(img => img.isPendingUpload);
      let pendingIndex = 0;

      for (const img of form.images) {
        if (img.isPendingUpload && img.rawBase64) {
          pendingIndex++;
          setUploadProgress(`Uploading photo ${pendingIndex}/${pendingImages.length} to Google Drive...`);
          try {
            const res = await api.run(
              'api_uploadSOPFile',
              img.name,
              img.rawBase64,
              img.mimeType || 'image/jpeg',
              'COMPLAINT_IMAGE'
            ) as any;

            if (res && res.success && res.url) {
              finalUploadedImages.push({
                name: img.name,
                url: res.url,
                driveId: res.id || '',
                downloadUrl: res.downloadUrl || (res.id ? `https://drive.google.com/uc?export=download&id=${res.id}` : res.url)
              });
            } else {
              // Fallback to storing local base64 preview URL
              finalUploadedImages.push({
                name: img.name,
                url: img.url
              });
            }
          } catch (err) {
            console.warn(`Failed cloud upload for ${img.name}, storing base64:`, err);
            finalUploadedImages.push({
              name: img.name,
              url: img.url
            });
          }
        } else {
          // Keep existing uploaded Drive images
          finalUploadedImages.push({
            name: img.name,
            url: img.url,
            driveId: img.driveId,
            downloadUrl: img.downloadUrl
          });
        }
      }

      setUploadProgress('Saving complaint record...');

      const payload: ComplaintRecord = {
        id: editingId || ('cc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 7)),
        dateTime: form.dateTime,
        customerName: form.customerName.trim(),
        style: form.style.trim(),
        size: form.size.trim(),
        complaintDetails: form.complaintDetails.trim(),
        pcsCount: Number(form.pcsCount) || 1,
        immediateAction: form.immediateAction.trim(),
        rootCause: form.rootCause.trim(),
        correctiveAction: form.correctiveAction.trim(),
        pendingAction: form.pendingAction.trim(),
        effectiveAfterThreeMonths: form.effectiveAfterThreeMonths,
        closedOn: form.closedOn,
        images: finalUploadedImages,
        status: form.closedOn ? 'CLOSED' : 'OPEN',
        createdBy: user?.username || user?.userCode || 'User',
        zone: globalZone || user?.zone || user?.location || 'ALL',
        timestamp: new Date().toISOString()
      };

      const res = await api.run('api_saveCustomerComplaint', payload) as any;

      if (res && res.success !== false) {
        api.clearCache('api_getCustomerComplaints');
        api.clearCache();
        triggerSuccess(editingId ? "COMPLAINT RECORD UPDATED SUCCESSFULLY" : "NEW CUSTOMER COMPLAINT REGISTERED SUCCESSFULLY");
        resetForm();
        await fetchComplaints(true);
        if (refreshData) refreshData();
        setActiveTab('list');
      } else {
        throw new Error(res?.error || "Failed to save complaint record.");
      }
    } catch (err: any) {
      console.error("Error saving complaint:", err);
      alert(`Error saving complaint record: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    const matchSearch = flexibleSearchMatch(c, searchTerm);

    const matchStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'CLOSED' ? !!c.closedOn || c.status === 'CLOSED' :
      !c.closedOn && c.status !== 'CLOSED';

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Top Banner & Tab Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest">
              Module A8 / B10
            </span>
            <span className="text-xs text-slate-400 font-bold">• Full Edit Access Enabled</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mt-1">
            Customer Complaint <span className="text-indigo-400">Register & Management</span>
          </h2>
          <p className="text-slate-400 text-xs font-medium mt-1">
            Log, track, and update customer complaint lifecycle, root causes, corrective actions, 3-month effectiveness, and attached images.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={() => { setActiveTab('form'); }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'form' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Icon name={editingId ? 'edit-3' : 'plus-circle'} size={16} />
            {editingId ? 'Editing Record' : 'New Complaint Form'}
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'list' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Icon name="list" size={16} />
            Complaint Records ({complaints.length})
          </button>
          <button
            onClick={handleClearAllComplaints}
            className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-700 text-white transition-all flex items-center gap-1.5 shadow-md hover:shadow-rose-600/30"
            title="Clear all customer complaint records from sheet and app"
          >
            <Icon name="trash-2" size={15} />
            Clear All
          </button>
        </div>
      </div>

      {/* Editing Notification bar if in editing mode */}
      {editingId && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 p-4 rounded-2xl flex items-center justify-between text-amber-900 dark:text-amber-200 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
              <Icon name="edit-3" size={20} />
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-wider">Editing Active Complaint Record</h4>
              <p className="text-xs font-medium opacity-90">Updating record #{editingId}. Normal users can modify root cause, corrective actions, closed dates, or images anytime.</p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="px-3 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-amber-600 transition"
          >
            Cancel Edit / Reset
          </button>
        </div>
      )}

      {/* FORM MODE */}
      {activeTab === 'form' && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-sm">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                {editingId ? 'Edit Complaint Record' : 'Register New Complaint'}
              </h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Fill in all 12 detailed fields and attach images to Drive</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/50">
              User: {user?.username || 'Operator'}
            </span>
          </div>

          {/* Grid Layout for Fields 1 to 6 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Date and Time */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Icon name="calendar" size={12} className="text-indigo-500" />
                1) Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.dateTime}
                onChange={e => setForm({ ...form, dateTime: e.target.value })}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* 2. Customer / Shop / Distributor Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Icon name="user" size={12} className="text-indigo-500" />
                2) Customer / Shop / Distributor <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Blossom Retailers / City Distributor"
                value={form.customerName}
                onChange={e => setForm({ ...form, customerName: e.target.value })}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* 3. Style */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Icon name="tag" size={12} className="text-indigo-500" />
                3) Style
              </label>
              <input
                type="text"
                placeholder="e.g. ST-2026-X / Premium Polo"
                value={form.style}
                onChange={e => setForm({ ...form, style: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* 4. Size (Number and Alphabets) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Icon name="maximize-2" size={12} className="text-indigo-500" />
                4) Size (Numbers & Letters)
              </label>
              <input
                type="text"
                placeholder="e.g. 38, 40, M, L, XL, 34B"
                value={form.size}
                onChange={e => setForm({ ...form, size: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* 6. No. of Pcs */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Icon name="package" size={12} className="text-indigo-500" />
                6) No. of Pcs
              </label>
              <input
                type="number"
                min="1"
                value={form.pcsCount}
                onChange={e => setForm({ ...form, pcsCount: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* 11. Whether Effective After Three Months */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Icon name="check-circle" size={12} className="text-indigo-500" />
                11) Effective After 3 Months
              </label>
              <select
                value={form.effectiveAfterThreeMonths}
                onChange={e => setForm({ ...form, effectiveAfterThreeMonths: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Pending Evaluation">Pending Evaluation (Under 3 Months)</option>
                <option value="Yes - Fully Effective">Yes - Fully Effective</option>
                <option value="No - Recurring Defect">No - Recurring Defect</option>
                <option value="Under Review">Under Review</option>
              </select>
            </div>
          </div>

          {/* Text Areas for Complaint Details, Actions, Causes */}
          <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            {/* 5. Details of Complaint */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Icon name="file-text" size={12} className="text-indigo-500" />
                5) Details of Complaint <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Describe the complaint details clearly (e.g., Fabric tearing at seam line after 1 wash, shade variation in batch)..."
                value={form.complaintDetails}
                onChange={e => setForm({ ...form, complaintDetails: e.target.value })}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* 7. Immediate Action Taken */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Icon name="zap" size={12} className="text-indigo-500" />
                7) Immediate Action Taken
              </label>
              <textarea
                rows={2}
                placeholder="Describe immediate containment action (e.g. Quarantined stock in warehouse, recalled batch #402)..."
                value={form.immediateAction}
                onChange={e => setForm({ ...form, immediateAction: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 8. Root Cause of Complaint */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Icon name="search" size={12} className="text-indigo-500" />
                  8) Root Cause of Complaint
                </label>
                <textarea
                  rows={3}
                  placeholder="Analyze root cause (e.g. Incorrect thread tension on Machine #12)..."
                  value={form.rootCause}
                  onChange={e => setForm({ ...form, rootCause: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 9. Corrective Action Taken on Root Cause */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Icon name="check-square" size={12} className="text-indigo-500" />
                  9) Corrective Action Taken on Root Cause
                </label>
                <textarea
                  rows={3}
                  placeholder="Corrective actions taken (e.g. Calibrated machine tension sensors and retrained operator)..."
                  value={form.correctiveAction}
                  onChange={e => setForm({ ...form, correctiveAction: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 10. Pending Action If Any */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Icon name="clock" size={12} className="text-indigo-500" />
                  10) Pending Action If Any
                </label>
                <textarea
                  rows={2}
                  placeholder="Any remaining pending items (e.g. Awaiting replacement fabric shipment)..."
                  value={form.pendingAction}
                  onChange={e => setForm({ ...form, pendingAction: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 12. Closed On */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Icon name="lock" size={12} className="text-indigo-500" />
                  12) Closed On (Date)
                </label>
                <input
                  type="date"
                  value={form.closedOn}
                  onChange={e => setForm({ ...form, closedOn: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Leave blank if complaint remains OPEN</p>
              </div>
            </div>
          </div>

          {/* 13. IMAGE UPLOAD SECTION (Saved to Drive on Submit) */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Icon name="image" size={16} className="text-indigo-600" />
                  13) Complaint Images & Photo Evidence
                </h4>
                <p className="text-[10px] text-slate-500 font-medium">Add photos to app preview first. Photos will be saved to Google Drive when you submit the form.</p>
              </div>

              <label className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-sm transition">
                <Icon name="upload-cloud" size={16} />
                Add Photos (App Preview)
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>

            {(uploadingImage || (isSubmitting && uploadProgress)) && (
              <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-700 dark:text-indigo-300 text-xs font-bold animate-pulse">
                <Icon name="refresh-cw" size={16} className="animate-spin" />
                <span>{uploadProgress || 'Loading photo evidence preview...'}</span>
              </div>
            )}

            {/* Display Uploaded Images */}
            {form.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                {form.images.map((img, idx) => {
                  const normalized = parseAndNormalizeImages(form.images);
                  return (
                    <div key={idx} className="relative group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                      <div
                        className="w-full h-24 cursor-pointer overflow-hidden relative"
                        onClick={() => {
                          setLightboxData({
                            images: normalized,
                            activeIndex: idx,
                            title: img.name || `Photo ${idx + 1}`
                          });
                        }}
                      >
                        <SmartImage
                          image={img}
                          alt={img.name || `Photo ${idx + 1}`}
                          className="w-full h-full"
                          imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-indigo-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity z-20 pointer-events-none">
                          <Icon name="eye" size={16} />
                        </div>
                      </div>
                      <div className="p-1.5 flex items-center justify-between text-[9px] font-bold text-slate-600 dark:text-slate-300 bg-white/90 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800">
                        <span className="truncate max-w-[70%]">{img.name || `Photo ${idx + 1}`}</span>
                        {img.isPendingUpload ? (
                          <span className="text-[8px] bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 px-1 py-0.2 rounded font-black uppercase">App Preview</span>
                        ) : (
                          <span className="text-[8px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 px-1 py-0.2 rounded font-black uppercase">In Drive</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(idx);
                        }}
                        className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition shadow-sm z-30"
                        title="Remove image from form"
                      >
                        <Icon name="x" size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs font-semibold">
                No photo evidence attached yet. Click "Add Photos (App Preview)" to select complaint photos.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black text-xs uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || uploadingImage}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Icon name="refresh-cw" size={16} className="animate-spin" />
                  Saving Complaint...
                </>
              ) : (
                <>
                  <Icon name="check" size={16} />
                  {editingId ? 'UPDATE COMPLAINT RECORD' : 'REGISTER CUSTOMER COMPLAINT'}
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* LIST / RECORDS MODE */}
      {(activeTab === 'list' || mode === 'view') && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                Customer Complaint Records
              </h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Search, inspect details, view images, or edit complaint lifecycle anytime</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search customer, style..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Icon name="search" size={14} className="absolute left-3 top-2.5 text-slate-400" />
              </div>

              {/* Status Filter */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {(['ALL', 'OPEN', 'CLOSED'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                      statusFilter === st
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                id="complaints-list-refresh-btn"
                onClick={() => fetchComplaints(true)}
                disabled={loading}
                title="Refresh and sync complaints data from server"
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition disabled:opacity-50"
              >
                <Icon name="refresh-cw" size={13} className={loading ? "animate-spin text-indigo-600" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center space-y-3">
              <Icon name="refresh-cw" size={24} className="animate-spin text-indigo-600 mx-auto" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Complaint Records...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-12 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Icon name="inbox" size={32} className="text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-500">No customer complaints found matching your filter.</p>
              <button
                onClick={() => { resetForm(); setActiveTab('form'); }}
                className="text-xs font-black uppercase tracking-wider text-indigo-600 hover:underline"
              >
                + Create First Customer Complaint
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-950">
                    <th className="p-3">Date & Time</th>
                    <th className="p-3">Customer / Shop</th>
                    <th className="p-3">Style & Size</th>
                    <th className="p-3">Complaint Details</th>
                    <th className="p-3">3-Mo. Effectiveness</th>
                    <th className="p-3">Status / Closed</th>
                    <th className="p-3">Images</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
                  {filteredComplaints.map(row => {
                    const isClosed = !!row.closedOn || row.status === 'CLOSED';
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          {row.dateTime ? new Date(row.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                        </td>
                        <td className="p-3 font-black text-indigo-600 dark:text-indigo-400">
                          {row.customerName}
                        </td>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          <div>{row.style || '-'}</div>
                          <span className="text-[10px] text-slate-400 font-bold">Size: {row.size || 'N/A'} ({row.pcsCount || 1} Pcs)</span>
                        </td>
                        <td className="p-3 max-w-xs truncate text-slate-600 dark:text-slate-300" title={row.complaintDetails}>
                          {row.complaintDetails}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            row.effectiveAfterThreeMonths?.includes('Yes') ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            row.effectiveAfterThreeMonths?.includes('No') ? 'bg-rose-50 text-rose-600 border-rose-200' :
                            'bg-amber-50 text-amber-600 border-amber-200'
                          }`}>
                            {row.effectiveAfterThreeMonths || 'Pending'}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {isClosed ? (
                            <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 px-2 py-0.5 rounded-full">
                              Closed on {row.closedOn}
                            </span>
                          ) : (
                            <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 px-2 py-0.5 rounded-full">
                              OPEN
                            </span>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {(() => {
                            const rowImgs = parseAndNormalizeImages(Array.isArray(row.images) && row.images.length > 0 ? row.images : row);
                            if (rowImgs.length === 0) {
                              return (
                                <span className="text-[10px] text-slate-400 font-bold italic px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                                  No photos
                                </span>
                              );
                            }
                            return (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setLightboxData({
                                    images: rowImgs,
                                    activeIndex: 0,
                                    title: `${row.customerName || 'Customer Complaint'} - Photos`,
                                    useEmbed: false
                                  })}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-[10px] font-black uppercase tracking-wider transition shadow-sm cursor-pointer hover:scale-105 active:scale-95 flex-shrink-0"
                                  title="Preview attached complaint photos in full lightbox"
                                >
                                  <Icon name="eye" size={12} className="text-indigo-600 dark:text-indigo-400" />
                                  <span>{rowImgs.length === 1 ? 'Preview' : `View (${rowImgs.length})`}</span>
                                </button>
                                {rowImgs.slice(0, 3).map((img, i) => (
                                  <div key={i} className="relative group/thumb flex-shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => setLightboxData({
                                        images: rowImgs,
                                        activeIndex: i,
                                        title: `${row.customerName || 'Customer Complaint'} - Photo ${i + 1}`,
                                        useEmbed: false
                                      })}
                                      className="relative block w-10 h-10 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-500 transition-all duration-200 bg-slate-100 dark:bg-slate-800"
                                      title={`${img.name || `Photo ${i + 1}`} - Click to preview`}
                                    >
                                      <SmartImage
                                        image={img}
                                        alt={img.name || `Photo ${i + 1}`}
                                        className="w-full h-full"
                                        imgClassName="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-200"
                                      />
                                      <div className="absolute inset-0 bg-indigo-950/60 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white z-20 pointer-events-none">
                                        <Icon name="eye" size={13} className="text-white drop-shadow" />
                                      </div>
                                    </button>
                                  </div>
                                ))}
                                {rowImgs.length > 3 && (
                                  <button
                                    type="button"
                                    onClick={() => setLightboxData({
                                      images: rowImgs,
                                      activeIndex: 3,
                                      title: `${row.customerName || 'Customer Complaint'} - All Photos`,
                                      useEmbed: false
                                    })}
                                    className="text-[9px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg px-1.5 py-1 border border-indigo-200 hover:bg-indigo-100 transition cursor-pointer"
                                  >
                                    +{rowImgs.length - 3}
                                  </button>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap space-x-2">
                          <button
                            onClick={() => setSelectedRecord(row)}
                            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-black uppercase hover:bg-slate-200 transition"
                            title="View Full Complaint Record"
                          >
                            <Icon name="eye" size={12} className="inline mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleEditRecord(row)}
                            className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-indigo-700 transition shadow-sm"
                            title="Edit this complaint anytime"
                          >
                            <Icon name="edit-3" size={12} className="inline mr-1" />
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DETAILED VIEW MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-[999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  Customer Complaint Detail
                </span>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">
                  {selectedRecord.customerName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <Icon name="x" size={20} />
              </button>
            </div>

            {/* Modal Body - Detailed List of All 12 Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <span className="text-[10px] font-black uppercase text-slate-400 block">1) Date & Time</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedRecord.dateTime || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <span className="text-[10px] font-black uppercase text-slate-400 block">2) Customer / Shop Name</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedRecord.customerName}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <span className="text-[10px] font-black uppercase text-slate-400 block">3) Style</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedRecord.style || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <span className="text-[10px] font-black uppercase text-slate-400 block">4) Size</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedRecord.size || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl col-span-1 md:col-span-2">
                <span className="text-[10px] font-black uppercase text-slate-400 block">5) Details of Complaint</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 whitespace-pre-wrap">{selectedRecord.complaintDetails}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <span className="text-[10px] font-black uppercase text-slate-400 block">6) No. of Pcs</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedRecord.pcsCount || 1}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <span className="text-[10px] font-black uppercase text-slate-400 block">11) Effective After 3 Months</span>
                <span className="font-bold text-indigo-600">{selectedRecord.effectiveAfterThreeMonths || 'Pending'}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl col-span-1 md:col-span-2">
                <span className="text-[10px] font-black uppercase text-slate-400 block">7) Immediate Action Taken</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 whitespace-pre-wrap">{selectedRecord.immediateAction || 'None specified'}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl col-span-1 md:col-span-2">
                <span className="text-[10px] font-black uppercase text-slate-400 block">8) Root Cause of Complaint</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 whitespace-pre-wrap">{selectedRecord.rootCause || 'Under Investigation'}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl col-span-1 md:col-span-2">
                <span className="text-[10px] font-black uppercase text-slate-400 block">9) Corrective Action Taken on Root Cause</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 whitespace-pre-wrap">{selectedRecord.correctiveAction || 'None specified'}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <span className="text-[10px] font-black uppercase text-slate-400 block">10) Pending Action</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedRecord.pendingAction || 'None'}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <span className="text-[10px] font-black uppercase text-slate-400 block">12) Closed On</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedRecord.closedOn || 'OPEN (Not Closed Yet)'}</span>
              </div>
            </div>

            {/* Images Gallery */}
            {(() => {
              const modalImgs = parseAndNormalizeImages(selectedRecord.images || selectedRecord['ATTACHED IMAGES'] || selectedRecord['attachedImages'] || selectedRecord['ATTACHED_IMAGES'] || selectedRecord.image || selectedRecord.photos || selectedRecord);
              if (modalImgs.length === 0) {
                return (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                    <Icon name="image" size={24} className="mx-auto text-slate-400" />
                    <p className="text-xs text-slate-400 font-bold italic">
                      No photo evidence attached to this complaint record yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const rec = selectedRecord;
                        setSelectedRecord(null);
                        handleEditRecord(rec);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 transition"
                    >
                      <Icon name="camera" size={13} />
                      <span>+ Attach Photos to this Complaint</span>
                    </button>
                  </div>
                );
              }
              return (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-xs uppercase tracking-wider text-slate-500">13) Attached Photo Evidence ({modalImgs.length})</h4>
                    <button
                      type="button"
                      onClick={() => setLightboxData({
                        images: modalImgs,
                        activeIndex: 0,
                        title: `${selectedRecord.customerName || 'Complaint'} - All Photos`,
                        useEmbed: false
                      })}
                      className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline uppercase flex items-center gap-1"
                    >
                      <Icon name="eye" size={11} />
                      View All in Fullscreen
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {modalImgs.map((img, i) => (
                      <div key={i} className="group relative bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                        <div
                          className="relative overflow-hidden aspect-video bg-slate-200 dark:bg-slate-900 cursor-pointer"
                          onClick={() => setLightboxData({
                            images: modalImgs,
                            activeIndex: i,
                            title: `${selectedRecord.customerName || 'Complaint'} - Photo ${i + 1} of ${modalImgs.length}`,
                            useEmbed: false
                          })}
                        >
                          <SmartImage
                            image={img}
                            alt={img.name}
                            className="w-full h-28"
                            imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200 z-20">
                            <Icon name="maximize-2" size={18} />
                          </div>
                        </div>
                        <div className="p-2 flex items-center justify-between text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                          <span className="truncate max-w-[70%]" title={img.name}>{img.name}</span>
                          <a
                            href={img.downloadUrl || img.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 text-[9px] font-black uppercase"
                            title="Open full resolution in new tab"
                          >
                            <Icon name="external-link" size={10} />
                            Open
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-[10px] text-slate-400 font-bold">Registered by {selectedRecord.createdBy || 'User'}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const rec = selectedRecord;
                    setSelectedRecord(null);
                    handleEditRecord(rec);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition"
                >
                  Edit This Complaint
                </button>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RICH CAROUSEL LIGHTBOX MODAL */}
      {lightboxData && (() => {
        const rawList = Array.isArray(lightboxData.images) ? lightboxData.images : [lightboxData.images];
        const validImages = rawList.filter(Boolean);
        if (validImages.length === 0) return null;

        const total = validImages.length;
        const currentIdx = Math.min(Math.max(0, lightboxData.activeIndex || 0), total - 1);
        const rawCurrent = validImages[currentIdx];
        const currentImg = typeof rawCurrent === 'object' ? rawCurrent : { url: String(rawCurrent), previewUrl: String(rawCurrent), name: `Photo ${currentIdx + 1}` };

        const goNext = (e?: React.MouseEvent) => {
          if (e) e.stopPropagation();
          setLightboxData(prev => prev ? { ...prev, activeIndex: (currentIdx + 1) % total } : null);
        };

        const goPrev = (e?: React.MouseEvent) => {
          if (e) e.stopPropagation();
          setLightboxData(prev => prev ? { ...prev, activeIndex: (currentIdx - 1 + total) % total } : null);
        };

        return (
          <div
            className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6 select-none animate-fadeIn"
            onClick={() => setLightboxData(null)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setLightboxData(null);
              if (e.key === 'ArrowRight') goNext();
              if (e.key === 'ArrowLeft') goPrev();
            }}
            tabIndex={0}
          >
            {/* Header */}
            <div
              className="w-full max-w-5xl flex items-center justify-between text-white py-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="font-black text-sm tracking-wider uppercase bg-indigo-600 px-3 py-1 rounded-full text-white shadow">
                  Photo {currentIdx + 1} / {total}
                </span>
                <span className="text-xs text-slate-300 font-bold max-w-[200px] sm:max-w-md truncate">
                  {currentImg.name || lightboxData.title || 'Attached Evidence Photo'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {currentImg.embedUrl && (
                  <button
                    type="button"
                    onClick={() => setLightboxData(prev => prev ? { ...prev, useEmbed: !prev.useEmbed } : null)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    title="Toggle Google Drive embed viewer"
                  >
                    <Icon name="monitor" size={14} />
                    <span className="hidden sm:inline">{lightboxData.useEmbed ? 'Direct Image' : 'Drive Viewer'}</span>
                  </button>
                )}
                {(currentImg.downloadUrl || currentImg.url) && (
                  <a
                    href={currentImg.downloadUrl || currentImg.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    title="Open full file in Google Drive"
                  >
                    <Icon name="external-link" size={14} />
                    <span className="hidden sm:inline">Open Drive</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setLightboxData(null)}
                  className="p-2 bg-white/10 hover:bg-rose-600 text-white rounded-full transition ml-2 cursor-pointer"
                  title="Close (Esc)"
                >
                  <Icon name="x" size={20} />
                </button>
              </div>
            </div>

            {/* Main Stage */}
            <div
              className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-auto overflow-hidden p-2"
              onClick={(e) => e.stopPropagation()}
            >
              {total > 1 && (
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-2 sm:left-4 z-20 p-3 bg-black/60 hover:bg-indigo-600 text-white rounded-full transition shadow-lg hover:scale-110 active:scale-95 cursor-pointer"
                  title="Previous image (Left Arrow)"
                >
                  <Icon name="chevron-left" size={26} />
                </button>
              )}

              <div className="w-full h-full flex items-center justify-center max-h-[75vh]">
                {lightboxData.useEmbed && currentImg.embedUrl ? (
                  <iframe
                    src={currentImg.embedUrl}
                    title="Google Drive Document Preview"
                    className="w-full h-full rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl"
                    allow="autoplay"
                  />
                ) : (
                  <img
                    key={currentImg.previewUrl || currentImg.url}
                    src={currentImg.previewUrl || currentImg.url}
                    alt={currentImg.name || 'Preview'}
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl transition-all duration-200"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (currentImg.proxyUrl && target.src !== currentImg.proxyUrl && !target.src.includes('/api/drive-proxy')) {
                        target.src = currentImg.proxyUrl;
                      } else if (currentImg.fallbackUrl && target.src !== currentImg.fallbackUrl) {
                        target.src = currentImg.fallbackUrl;
                      } else if (currentImg.fallbackUrl2 && target.src !== currentImg.fallbackUrl2) {
                        target.src = currentImg.fallbackUrl2;
                      } else if (currentImg.downloadUrl && target.src !== currentImg.downloadUrl) {
                        target.src = currentImg.downloadUrl;
                      } else if (currentImg.embedUrl) {
                        setLightboxData(prev => prev ? { ...prev, useEmbed: true } : null);
                      }
                    }}
                  />
                )}
              </div>

              {total > 1 && (
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-2 sm:right-4 z-20 p-3 bg-black/60 hover:bg-indigo-600 text-white rounded-full transition shadow-lg hover:scale-110 active:scale-95 cursor-pointer"
                  title="Next image (Right Arrow)"
                >
                  <Icon name="chevron-right" size={26} />
                </button>
              )}
            </div>

            {/* Bottom Carousel Filmstrip */}
            {total > 1 && (
              <div
                className="w-full max-w-3xl flex items-center justify-center gap-2 py-2 overflow-x-auto z-10"
                onClick={(e) => e.stopPropagation()}
              >
                {validImages.map((img: any, idx: number) => {
                  const isCur = idx === currentIdx;
                  const thumbSrc = typeof img === 'object' ? (img.previewUrl || img.url) : String(img);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLightboxData(prev => prev ? { ...prev, activeIndex: idx } : null)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                        isCur
                          ? 'border-indigo-400 scale-110 shadow-lg shadow-indigo-500/50 ring-2 ring-indigo-300'
                          : 'border-white/20 opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <img
                        src={thumbSrc}
                        alt={(typeof img === 'object' ? img.name : null) || `Thumb ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 object-cover"
                        onError={(e) => {
                          if (typeof img === 'object' && img.fallbackUrl) e.currentTarget.src = img.fallbackUrl;
                        }}
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] font-black text-white text-center py-0.5">
                        {idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default CustomerComplaintRegister;
