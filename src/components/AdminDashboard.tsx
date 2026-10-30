import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { ZONES, UNITS, ROLES, MAIN_MODULES, SUBMODULES, SUPPLIERS, ITEMS, COLORS, SIZES, CUPSIZES, DEFECTS, OPERATIONS, MACHINES, STYLES, LINES } from '../constants';
import { INITIAL_DB } from '../data/initialDb';
import Icon from './Icon';
import SearchableSelect from './SearchableSelect';
import { getDirectViewUrl } from '../utils/sopUtils';
import { normalizeRestrictions } from '../utils/restrictions';

interface AdminDashboardProps {
  users?: any[];
  setUsers?: (users: any[]) => void;
  currentUser: any;
  refreshData?: () => Promise<void>;
  triggerSuccess?: (message: string) => void;
  globalZone?: string;
  workorders?: any[];
  configOnlyMode?: boolean;
  onLogout?: () => void;
  settings?: any;
}

const UserRow = React.memo(({ u, onEdit }: { u: any, onEdit: () => void }) => (
  <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
    <td className="p-3 font-mono text-indigo-600">{u.userCode}</td>
    <td className="p-3 font-semibold">{u.username}</td>
    <td className="p-3 font-mono text-slate-400 text-xs">{u.password}</td>
    <td className="p-3">
      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
        {u.role}
      </span>
    </td>
    <td className="p-3 text-slate-500 font-semibold">{u.zone || '-'}</td>
    <td className="p-3 text-slate-500">{u.location || '-'}</td>
    <td className="p-3 text-right flex justify-end gap-2">
      <button 
        onClick={onEdit}
        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
        title="Edit User"
      >
        <Icon name="edit-3" size={16} />
      </button>
    </td>
  </tr>
));

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  users = [], 
  setUsers, 
  currentUser, 
  refreshData, 
  triggerSuccess, 
  globalZone, 
  workorders = [],
  configOnlyMode = false,
  onLogout,
  settings
}) => {
  const [tab, setTab] = useState('list');
  const [editingUserCode, setEditingUserCode] = useState('');
  const [restrictingUserCode, setRestrictingUserCode] = useState('');
  const [deletingUserCode, setDeletingUserCode] = useState('');
  const isLocked = useRef(false);

  // Admin Activity Logs state synced with Google Sheets
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);
  const [logSearch, setLogSearch] = useState<string>('');
  const [selectedLogModule, setSelectedLogModule] = useState<string>('ALL');
  const [selectedLogAdmin, setSelectedLogAdmin] = useState<string>('ALL');

  const fetchAdminLogs = async (force: boolean = false) => {
    setLoadingLogs(true);
    try {
      if (force) {
        api.clearCache('api_getAdminLogs');
      }
      const res = await api.run('api_getAdminLogs');
      if (Array.isArray(res)) {
        setAdminLogs(res);
      }
    } catch (e) {
      console.warn("Failed to load admin logs:", e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (tab === 'logs') {
      fetchAdminLogs(true);
    }
  }, [tab]);

  const filteredLogs = React.useMemo(() => {
    return adminLogs
      .filter(log => {
        if (!log) return false;
        const search = logSearch.toLowerCase().trim();
        const matchesSearch = !search ||
          String(log.details || '').toLowerCase().includes(search) ||
          String(log.action || '').toLowerCase().includes(search) ||
          String(log.module || '').toLowerCase().includes(search) ||
          String(log.admin || '').toLowerCase().includes(search);
        
        const matchesModule = selectedLogModule === 'ALL' || String(log.module || '').toUpperCase() === selectedLogModule.toUpperCase();
        const matchesAdmin = selectedLogAdmin === 'ALL' || String(log.admin || '').toUpperCase() === selectedLogAdmin.toUpperCase();
        return matchesSearch && matchesModule && matchesAdmin;
      })
      .slice()
      .reverse(); // Newest first
  }, [adminLogs, logSearch, selectedLogModule, selectedLogAdmin]);

  const uniqueLogModules = React.useMemo(() => {
    const modules = adminLogs.map(l => String(l.module || '').trim()).filter(Boolean);
    return Array.from(new Set(modules));
  }, [adminLogs]);

  const uniqueLogAdmins = React.useMemo(() => {
    const admins = adminLogs.map(l => String(l.admin || '').trim()).filter(Boolean);
    return Array.from(new Set(admins));
  }, [adminLogs]);

  const exportLogsToCsv = () => {
    if (filteredLogs.length === 0) return alert("No logs available to export.");
    const headers = ["Timestamp", "Module", "Action", "Details", "Admin"];
    const rows = filteredLogs.map(l => [
      `"${String(l.timestamp || '').replace(/"/g, '""')}"`,
      `"${String(l.module || '').replace(/"/g, '""')}"`,
      `"${String(l.action || '').replace(/"/g, '""')}"`,
      `"${String(l.details || '').replace(/"/g, '""')}"`,
      `"${String(l.admin || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `admin_activity_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const styleOptions = React.useMemo(() => {
    if (settings) {
      const styles = settings.STYLE_NAME || settings['STYLE_NAME'] || settings['STYLE NAME'] || settings.STYLE || settings.STYLES;
      if (Array.isArray(styles)) {
        return styles;
      }
    }
    return ['STYLE 1', 'STYLE 2', 'STYLE 3'];
  }, [settings]);

  const filteredUsers = React.useMemo(() => {
    return users.filter((u, index, self) => 
      self.findIndex(t => t.userCode === u.userCode) === index
    );
  }, [users]);

  const [editingForm, setEditingForm] = useState<any>(null);
  const originalUserRef = useRef<any>(null);

  React.useEffect(() => {
    if (editingUserCode) {
      const u = users.find(x => x.userCode === editingUserCode);
      if (u) {
        const copy = { ...u };
        setEditingForm(copy);
        originalUserRef.current = { ...copy };
      } else {
        setEditingForm(null);
        originalUserRef.current = null;
      }
    } else {
      setEditingForm(null);
      originalUserRef.current = null;
    }
  }, [editingUserCode, users]);

  const restrictingUser = React.useMemo(() => users.find(u => u.userCode === restrictingUserCode), [users, restrictingUserCode]);
  const deletingUser = React.useMemo(() => users.find(u => u.userCode === deletingUserCode), [users, deletingUserCode]);

  const [newUser, setNewUser] = useState({ 
    username: '', 
    password: '', 
    role: 'USER', 
    location: '', 
    zone: (globalZone && globalZone !== 'ALL') ? globalZone : ''
  });
  const [serverUrl, setServerUrl] = useState(localStorage.getItem('VITE_GAS_URL') || '');
  const [driveServerUrl, setDriveServerUrl] = useState(localStorage.getItem('VITE_GAS_DRIVE_URL') || '');
  const [deleteReason, setDeleteReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track Google Account credentials state via simple Local App Configuration
  const [gDriveEmail, setGDriveEmail] = useState(localStorage.getItem('gdrive_email') || '');
  const [gDrivePassword, setGDrivePassword] = useState(localStorage.getItem('gdrive_password') || '');
  const [googleUser, setGoogleUser] = useState<any>(() => {
    const email = localStorage.getItem('gdrive_email');
    return email ? { email, displayName: email.split('@')[0] } : null;
  });
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    if (!gDriveEmail.trim()) {
      alert("Please enter a valid Google Email / Gmail Address.");
      return;
    }
    setIsLinkingGoogle(true);
    try {
      localStorage.setItem('gdrive_email', gDriveEmail.trim());
      localStorage.setItem('gdrive_password', gDrivePassword.trim());
      setGoogleUser({ email: gDriveEmail.trim(), displayName: gDriveEmail.trim().split('@')[0] });
      if (triggerSuccess) {
        triggerSuccess(`Successfully connected to Google Drive Account: ${gDriveEmail.trim()}`);
      } else {
        alert(`Connected: ${gDriveEmail.trim()}`);
      }
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
      setGDriveEmail('');
      setGDrivePassword('');
      setGoogleUser(null);
      if (triggerSuccess) {
        triggerSuccess("Disconnected from Google Account.");
      } else {
        alert("Disconnected from Google Account.");
      }
    } catch (e: any) {
      alert("Sign out failed: " + e.message);
    }
  };

  const [selectedDataType, setSelectedDataType] = useState('');
  const [dataRecords, setDataRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [dataSearchQuery, setDataSearchQuery] = useState('');

  const fetchDataRecords = async (type: string) => {
    if (!type) {
      setDataRecords([]);
      return;
    }
    setLoadingRecords(true);
    try {
      let res: any = null;
      if (type === 'REPORTS_SOP') {
        res = await api.run('api_getREPORTS_SOPData');
      } else if (type === 'CUTTING') {
        res = await api.run('api_getCuttingData');
      } else if (type === 'INLINE') {
        res = await api.run('api_getInlineData');
      } else if (type === 'ENDLINE') {
        res = await api.run('api_getEndlineData');
      } else if (type === 'AQL') {
        res = await api.run('api_getAQLData');
      } else if (type === 'FINAL') {
        res = await api.run('api_getFinalAuditData');
      } else if (type === 'MATERIAL') {
        res = await api.run('api_getMaterialData');
      } else if (type === 'WORKORDER') {
        res = await api.run('api_getWorkorders');
      } else if (type === 'COMPLAINT') {
        res = await api.run('api_getCustomerComplaints');
      }
      
      if (Array.isArray(res)) {
        setDataRecords(res);
      } else if (res && Array.isArray(res.data)) {
        setDataRecords(res.data);
      } else {
        setDataRecords([]);
      }
    } catch (e) {
      console.error("Error fetching data records for deletion:", e);
      setDataRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleDeleteRecord = async (record: any) => {
    if (!window.confirm(`🚨 Are you sure you want to permanently delete this record from ${selectedDataType}?\nThis action is irreversible.`)) {
      return;
    }
    try {
      if (selectedDataType === 'REPORTS_SOP') {
        await api.run('api_deleteREPORTS_SOP', record.id);
      } else if (selectedDataType === 'CUTTING') {
        await api.run('api_deleteCuttingData', record.id);
      } else if (selectedDataType === 'INLINE') {
        await api.run('api_deleteInlineData', record.id);
      } else if (selectedDataType === 'ENDLINE') {
        await api.run('api_deleteEndlineData', record.id);
      } else if (selectedDataType === 'AQL') {
        await api.run('api_deleteAQLData', record.id);
      } else if (selectedDataType === 'FINAL') {
        await api.run('api_deleteFinalAuditData', record.id);
      } else if (selectedDataType === 'MATERIAL') {
        await api.run('api_deleteMaterialData', record.id);
      } else if (selectedDataType === 'WORKORDER') {
        await api.run('api_deleteWorkorder', record.id, record.zone || record.location);
      } else if (selectedDataType === 'COMPLAINT') {
        await api.run('api_deleteCustomerComplaint', record.id);
      }
      
      triggerSuccess?.("Record deleted successfully.");
      // Refresh the records
      await fetchDataRecords(selectedDataType);
      if (refreshData) {
        await refreshData();
      }
    } catch (e) {
      alert("Failed to delete record: " + String(e));
    }
  };

  // Sync newUser location with globalZone when it changes
  React.useEffect(() => {
    if (globalZone && globalZone !== 'ALL') {
      setNewUser(prev => ({ ...prev, zone: globalZone }));
    }
  }, [globalZone]);

  const INITIAL_USER_SETTINGS = React.useMemo(() => ({
    ZONE: (settings?.ZONE && Array.isArray(settings.ZONE) ? settings.ZONE : ZONES).join('\n'),
    UNIT: (settings?.UNIT && Array.isArray(settings.UNIT) ? settings.UNIT : UNITS).join('\n'),
    SUPPLIER: (settings?.SUPPLIER && Array.isArray(settings.SUPPLIER) ? settings.SUPPLIER : SUPPLIERS).join('\n'),
    ITEMS: (settings?.ITEMS && Array.isArray(settings.ITEMS) ? settings.ITEMS : ITEMS).join('\n'),
    COLOR: (settings?.COLOR && Array.isArray(settings.COLOR) ? settings.COLOR : COLORS).join('\n'),
    SIZE: (settings?.SIZE && Array.isArray(settings.SIZE) ? settings.SIZE : SIZES).join('\n'),
    CUPSIZE: (settings?.CUPSIZE && Array.isArray(settings.CUPSIZE) ? settings.CUPSIZE : CUPSIZES).join('\n'),
    DEFECTS: (settings?.DEFECTS && Array.isArray(settings.DEFECTS) ? settings.DEFECTS : DEFECTS).join('\n'),
    OPERATION: (settings?.OPERATION && Array.isArray(settings.OPERATION) ? settings.OPERATION : OPERATIONS).join('\n'),
    MACHINE: (settings?.MACHINE && Array.isArray(settings.MACHINE) ? settings.MACHINE : MACHINES).join('\n'),
    WORKERS: (settings?.WORKERS && Array.isArray(settings.WORKERS) ? settings.WORKERS : ['WORKER 1', 'WORKER 2', 'WORKER 3', 'WORKER 4', 'WORKER 5']).join('\n'),
    LINE: (settings?.LINE && Array.isArray(settings.LINE) ? settings.LINE : LINES).join('\n'),
    STYLE_NAME: (settings?.STYLE_NAME && Array.isArray(settings.STYLE_NAME) ? settings.STYLE_NAME : STYLES).join('\n')
  }), [settings]);

  const [selectedUserCode, setSelectedUserCode] = useState('');
  const [isResettingDb, setIsResettingDb] = useState(false);

  // Common Master Items & Suppliers state
  const [commonItems, setCommonItems] = useState<string[]>([]);
  const [commonSuppliers, setCommonSuppliers] = useState<string[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [isSavingSupplier, setIsSavingSupplier] = useState(false);
  const [showBulkItems, setShowBulkItems] = useState(false);
  const [showBulkSuppliers, setShowBulkSuppliers] = useState(false);
  const [bulkItemsText, setBulkItemsText] = useState('');
  const [bulkSuppliersText, setBulkSuppliersText] = useState('');

  const fetchCommonMasters = async () => {
    try {
      const res = await api.run('api_getUserSettings', 'GLOBAL') as any;
      const s = res?.settings || res || {};
      const itms = (Array.isArray(s.ITEMS) && s.ITEMS.length > 0) 
        ? s.ITEMS 
        : ((Array.isArray(settings?.ITEMS) && settings.ITEMS.length > 0) ? settings.ITEMS : []);
      const supps = (Array.isArray(s.SUPPLIER) && s.SUPPLIER.length > 0) 
        ? s.SUPPLIER 
        : ((Array.isArray(s.SUPPLIERS) && s.SUPPLIERS.length > 0) 
          ? s.SUPPLIERS 
          : ((Array.isArray(settings?.SUPPLIER) && settings.SUPPLIER.length > 0) ? settings.SUPPLIER : []));
      setCommonItems(itms);
      setCommonSuppliers(supps);
    } catch (e) {
      if (Array.isArray(settings?.ITEMS)) setCommonItems(settings.ITEMS);
      if (Array.isArray(settings?.SUPPLIER)) setCommonSuppliers(settings.SUPPLIER);
    }
  };

  useEffect(() => {
    if (tab === 'settings') {
      const code = selectedUserCode || (filteredUsers[0]?.userCode || '');
      if (code && code !== 'GLOBAL') {
        fetchUserSettings(code);
      }
      fetchCommonMasters();
    }
  }, [tab, filteredUsers]);

  const filteredItemsList = React.useMemo(() => {
    if (!itemSearch.trim()) return commonItems;
    const q = itemSearch.trim().toLowerCase();
    return commonItems.filter(i => String(i || '').toLowerCase().includes(q));
  }, [commonItems, itemSearch]);

  const filteredSuppliersList = React.useMemo(() => {
    if (!supplierSearch.trim()) return commonSuppliers;
    const q = supplierSearch.trim().toLowerCase();
    return commonSuppliers.filter(s => String(s || '').toLowerCase().includes(q));
  }, [commonSuppliers, supplierSearch]);

  const handleAddItem = async () => {
    if (isSavingItem) return;
    const clean = newItemName.trim().toUpperCase();
    if (!clean) return alert("Please enter an item name.");
    if (commonItems.some(i => i.toUpperCase() === clean)) {
      return alert("Item already exists in the common master list.");
    }
    setIsSavingItem(true);
    try {
      const updated = [clean, ...commonItems];
      setCommonItems(updated);
      setNewItemName('');
      await api.run('api_saveSettings', 'ITEMS', updated);
      await api.run('api_saveSettings', 'GLOBAL', { ITEMS: updated });
      await logActivity('ADD COMMON ITEM', `Added common item: ${clean}`);
      if (triggerSuccess) triggerSuccess(`Common item "${clean}" added successfully!`);
      if (refreshData) await refreshData().catch(() => {});
    } catch (e: any) {
      alert("Failed to add item: " + (e.message || e));
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleDeleteItem = async (item: string) => {
    if (!window.confirm(`Are you sure you want to delete common item "${item}"?`)) return;
    try {
      const updated = commonItems.filter(i => i.toUpperCase() !== item.trim().toUpperCase());
      setCommonItems(updated);
      await api.run('api_saveSettings', 'ITEMS', updated);
      await api.run('api_saveSettings', 'GLOBAL', { ITEMS: updated });
      await logActivity('DELETE COMMON ITEM', `Deleted common item: ${item}`);
      if (triggerSuccess) triggerSuccess(`Common item "${item}" deleted successfully.`);
      if (refreshData) await refreshData().catch(() => {});
    } catch (e: any) {
      alert("Failed to delete item: " + (e.message || e));
    }
  };

  const handleSaveBulkItems = async () => {
    setIsSavingItem(true);
    try {
      const parsed = bulkItemsText
        .split('\n')
        .map(s => s.trim().toUpperCase())
        .filter(Boolean);
      const unique = Array.from(new Set(parsed));
      if (unique.length === 0) {
        alert("Please enter at least one item.");
        setIsSavingItem(false);
        return;
      }
      setCommonItems(unique);
      await api.run('api_saveSettings', 'ITEMS', unique);
      await api.run('api_saveSettings', 'GLOBAL', { ITEMS: unique });
      await logActivity('BULK EDIT COMMON ITEMS', `Updated ${unique.length} common items`);
      setShowBulkItems(false);
      if (triggerSuccess) triggerSuccess(`Saved ${unique.length} common items successfully!`);
      if (refreshData) await refreshData().catch(() => {});
    } catch (e: any) {
      alert("Failed to save bulk items: " + (e.message || e));
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleAddSupplier = async () => {
    if (isSavingSupplier) return;
    const clean = newSupplierName.trim().toUpperCase();
    if (!clean) return alert("Please enter a supplier name.");
    if (commonSuppliers.some(s => s.toUpperCase() === clean)) {
      return alert("Supplier already exists in the common master list.");
    }
    setIsSavingSupplier(true);
    try {
      const updated = [clean, ...commonSuppliers];
      setCommonSuppliers(updated);
      setNewSupplierName('');
      await api.run('api_saveSettings', 'SUPPLIERS', updated);
      await api.run('api_saveSettings', 'GLOBAL', { SUPPLIER: updated });
      await logActivity('ADD COMMON SUPPLIER', `Added common supplier: ${clean}`);
      if (triggerSuccess) triggerSuccess(`Common supplier "${clean}" added successfully!`);
      if (refreshData) await refreshData().catch(() => {});
    } catch (e: any) {
      alert("Failed to add supplier: " + (e.message || e));
    } finally {
      setIsSavingSupplier(false);
    }
  };

  const handleDeleteSupplier = async (supplier: string) => {
    if (!window.confirm(`Are you sure you want to delete common supplier "${supplier}"?`)) return;
    try {
      const updated = commonSuppliers.filter(s => s.toUpperCase() !== supplier.trim().toUpperCase());
      setCommonSuppliers(updated);
      await api.run('api_saveSettings', 'SUPPLIERS', updated);
      await api.run('api_saveSettings', 'GLOBAL', { SUPPLIER: updated });
      await logActivity('DELETE COMMON SUPPLIER', `Deleted common supplier: ${supplier}`);
      if (triggerSuccess) triggerSuccess(`Common supplier "${supplier}" deleted successfully.`);
      if (refreshData) await refreshData().catch(() => {});
    } catch (e: any) {
      alert("Failed to delete supplier: " + (e.message || e));
    }
  };

  const handleSaveBulkSuppliers = async () => {
    setIsSavingSupplier(true);
    try {
      const parsed = bulkSuppliersText
        .split('\n')
        .map(s => s.trim().toUpperCase())
        .filter(Boolean);
      const unique = Array.from(new Set(parsed));
      if (unique.length === 0) {
        alert("Please enter at least one supplier.");
        setIsSavingSupplier(false);
        return;
      }
      setCommonSuppliers(unique);
      await api.run('api_saveSettings', 'SUPPLIERS', unique);
      await api.run('api_saveSettings', 'GLOBAL', { SUPPLIER: unique });
      await logActivity('BULK EDIT COMMON SUPPLIERS', `Updated ${unique.length} common suppliers`);
      setShowBulkSuppliers(false);
      if (triggerSuccess) triggerSuccess(`Saved ${unique.length} common suppliers successfully!`);
      if (refreshData) await refreshData().catch(() => {});
    } catch (e: any) {
      alert("Failed to save bulk suppliers: " + (e.message || e));
    } finally {
      setIsSavingSupplier(false);
    }
  };

  const handleFactoryReset = async () => {
    const confirmation1 = window.confirm("🚨 WARNING: This will delete ALL zones, units, operators, and quality data from the connected spreadsheet!\n\nAre you sure you want to perform a full factory reset?");
    if (!confirmation1) return;
    
    const confirmation2 = window.prompt("To proceed, type 'WIPE DATABASE' in all capitals below:");
    if (confirmation2 !== 'WIPE DATABASE') {
      alert("Verification failed. Reset aborted.");
      return;
    }

    setIsResettingDb(true);
    try {
      const res = await api.run('api_resetAllDatabase');
      if (res && res.success) {
        if (triggerSuccess) triggerSuccess("🚨 ALL DATA WIPED SUCCESSFULLY! RE-INITIALIZING SYSTEM...");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        alert("Wipe failed: " + (res?.error || "Unknown error"));
      }
    } catch (e: any) {
      alert("Error: " + (e.message || "Failed to wipe database"));
    } finally {
      setIsResettingDb(false);
    }
  };
  const [zoneMappings, setZoneMappings] = useState<any[]>([]);
  const [loadingZoneMappings, setLoadingZoneMappings] = useState(false);
  const [isSavingZone, setIsSavingZone] = useState(false);
  const [isSavingUnit, setIsSavingUnit] = useState(false);
  const [isSavingWorker, setIsSavingWorker] = useState(false);

  const [newZoneName, setNewZoneName] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitZone, setNewUnitZone] = useState('');
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerZone, setNewWorkerZone] = useState('');
  const [newWorkerUnit, setNewWorkerUnit] = useState('');

  const fetchZoneMappings = async () => {
    setLoadingZoneMappings(true);
    try {
      const res = await api.run('api_getZoneMappings');
      if (Array.isArray(res)) {
        setZoneMappings(res);
      }
    } catch (e) {
      console.error("Failed to load zone mappings:", e);
    } finally {
      setLoadingZoneMappings(false);
    }
  };

  React.useEffect(() => {
    fetchZoneMappings();
  }, []);

  const handleDeleteZoneMapping = async (item: any) => {
    if (!window.confirm("Are you sure you want to delete this mapping?")) return;
    try {
      await api.run('api_deleteZoneMapping', item);
      await fetchZoneMappings();
      await refreshData?.().catch(() => {});
      triggerSuccess?.("Mapping deleted successfully.");
    } catch (e) {
      alert("Failed to delete mapping: " + String(e));
    }
  };

  const handleSaveUnit = async () => {
    if (isSavingUnit) return;
    if (!newUnitName.trim()) return alert("Please enter a unit name.");
    if (!newUnitZone) return alert("Please select a zone for this unit.");
    
    // Check if unit already exists in this zone
    const isDup = zoneMappings.some(z => 
      String(z.zone || '').toUpperCase() === newUnitZone.toUpperCase() && 
      String(z.unit || '').toUpperCase() === newUnitName.trim().toUpperCase()
    );
    if (isDup) return alert("Unit already exists in this zone.");

    setIsSavingUnit(true);
    try {
      const res = await api.run('api_saveZoneMapping', {
        zone: newUnitZone.toUpperCase(),
        unit: newUnitName.trim().toUpperCase(),
        worker: ''
      });
      if (res) {
        setNewUnitName('');
        await fetchZoneMappings();
        await refreshData?.().catch(() => {});
        triggerSuccess?.("Unit added successfully!");
      }
    } catch (e) {
      alert("Failed to save unit: " + String(e));
    } finally {
      setIsSavingUnit(false);
    }
  };

  const handleSaveWorker = async () => {
    if (isSavingWorker) return;
    if (!newWorkerName.trim()) return alert("Please enter a worker name.");
    if (!newWorkerZone) return alert("Please select a zone.");
    if (!newWorkerUnit) return alert("Please select a unit.");

    // Check if worker already exists in this unit and zone
    const isDup = zoneMappings.some(z => 
      String(z.zone || '').toUpperCase() === newWorkerZone.toUpperCase() && 
      String(z.unit || '').toUpperCase() === newWorkerUnit.toUpperCase() &&
      String(z.worker || '').toUpperCase() === newWorkerName.trim().toUpperCase()
    );
    if (isDup) return alert("Worker already exists in this unit.");

    setIsSavingWorker(true);
    try {
      const res = await api.run('api_saveZoneMapping', {
        zone: newWorkerZone.toUpperCase(),
        unit: newWorkerUnit.toUpperCase(),
        worker: newWorkerName.trim().toUpperCase()
      });
      if (res) {
        setNewWorkerName('');
        await fetchZoneMappings();
        await refreshData?.().catch(() => {});
        triggerSuccess?.("Worker added successfully!");
      }
    } catch (e) {
      alert("Failed to save worker: " + String(e));
    } finally {
      setIsSavingWorker(false);
    }
  };

  const handleSaveZone = async () => {
    if (isSavingZone) return;
    const cleanZone = newZoneName.trim().toUpperCase();
    if (!cleanZone) return alert("Please enter a zone name.");
    const isDup = currentZones.some(z => String(z).toUpperCase() === cleanZone);
    if (isDup) return alert("Zone already exists.");
    
    setIsSavingZone(true);
    try {
      const res = await api.run('api_saveZoneMapping', {
        zone: cleanZone,
        unit: '',
        worker: ''
      });

      // Update settings as well so new zone is saved in settings.ZONE
      let updatedZoneSetting = userSettings.ZONE;
      if (typeof updatedZoneSetting === 'string') {
        const lines = updatedZoneSetting.split('\n').map(s => s.trim()).filter(Boolean);
        if (!lines.includes(cleanZone)) lines.push(cleanZone);
        updatedZoneSetting = lines.join('\n');
      } else if (Array.isArray(updatedZoneSetting)) {
        if (!updatedZoneSetting.includes(cleanZone)) updatedZoneSetting = [...updatedZoneSetting, cleanZone];
      } else {
        updatedZoneSetting = [cleanZone];
      }

      const updatedSettings = {
        ...userSettings,
        ZONE: updatedZoneSetting,
        ZONES: updatedZoneSetting
      };

      setUserSettings(updatedSettings);
      await api.run('api_saveSettings', { sheetName: 'SETTINGS', settings: updatedSettings }).catch(() => {});
      await api.run('api_saveSettings', { sheetName: 'GLOBAL', settings: updatedSettings }).catch(() => {});

      if (res) {
        setNewZoneName('');
        await fetchZoneMappings();
        await refreshData?.().catch(() => {});
        triggerSuccess?.("Zone added successfully!");
      }
    } catch (e) {
      alert("Failed to save zone: " + String(e));
    } finally {
      setIsSavingZone(false);
    }
  };

  const handleDeleteUnit = async (zone: string, unit: string) => {
    if (!window.confirm(`Are you sure you want to delete the unit "${unit}"? This will delete all workers in this unit, and delete the sheet "${unit}".`)) return;
    try {
      await api.run('api_deleteZoneMapping', { zone, unit });
      await fetchZoneMappings();
      await refreshData?.().catch(() => {});
      triggerSuccess?.(`Unit "${unit}" deleted successfully.`);
    } catch (e) {
      alert("Failed to delete unit: " + String(e));
    }
  };

  const handleDeleteWorker = async (zone: string, unit: string, worker: string) => {
    if (!window.confirm(`Are you sure you want to delete the worker "${worker}" from unit "${unit}"?`)) return;
    try {
      const item = zoneMappings.find(z => 
        String(z.zone || '').toUpperCase() === zone.toUpperCase() && 
        String(z.unit || '').toUpperCase() === unit.toUpperCase() && 
        String(z.worker || '').toUpperCase() === worker.toUpperCase()
      );
      await api.run('api_deleteZoneMapping', item || { zone, unit, worker });
      await fetchZoneMappings();
      await refreshData?.().catch(() => {});
      triggerSuccess?.(`Worker "${worker}" deleted successfully.`);
    } catch (e) {
      alert("Failed to delete worker: " + String(e));
    }
  };

  const handleDeleteZone = async (zone: string) => {
    if (!window.confirm(`Are you sure you want to delete the zone "${zone}"? This will delete all units and workers in this zone, and delete their sheets.`)) return;
    try {
      await api.run('api_deleteZoneMapping', { zone });

      // Clean zone from userSettings and settings as well
      const targetUpper = zone.trim().toUpperCase();
      let updatedZoneSetting = userSettings.ZONE;
      if (typeof updatedZoneSetting === 'string') {
        updatedZoneSetting = updatedZoneSetting
          .split('\n')
          .filter(z => z.trim().toUpperCase() !== targetUpper)
          .join('\n');
      } else if (Array.isArray(updatedZoneSetting)) {
        updatedZoneSetting = updatedZoneSetting.filter((z: string) => z.trim().toUpperCase() !== targetUpper);
      }

      const updatedSettings = {
        ...userSettings,
        ZONE: updatedZoneSetting,
        ZONES: updatedZoneSetting
      };

      setUserSettings(updatedSettings);
      await api.run('api_saveSettings', { sheetName: 'SETTINGS', settings: updatedSettings }).catch(() => {});
      await api.run('api_saveSettings', { sheetName: 'GLOBAL', settings: updatedSettings }).catch(() => {});

      await fetchZoneMappings();
      await refreshData?.().catch(() => {});
      triggerSuccess?.(`Zone "${zone}" deleted successfully.`);
    } catch (e) {
      alert("Failed to delete zone: " + String(e));
    }
  };

  const uniqueZones = React.useMemo(() => {
    const fromMap = zoneMappings
      .filter(z => String(z.zone || '').trim())
      .map(z => z.zone);
    return Array.from(new Set(fromMap))
      .map(z => String(z).toUpperCase().trim())
      .filter(z => z && !z.startsWith('ZMAP-'));
  }, [zoneMappings]);

  const currentZones = React.useMemo(() => {
    if (uniqueZones.length > 0) {
      return uniqueZones;
    }
    let zonesList: string[] = [];
    if (settings?.ZONE) {
      if (Array.isArray(settings.ZONE)) {
        zonesList = settings.ZONE;
      } else if (typeof settings.ZONE === 'string') {
        zonesList = settings.ZONE.split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean);
      }
    }
    const filtered = zonesList
      .map(z => String(z).toUpperCase().trim())
      .filter(z => z && !z.startsWith('ZMAP-'));
    return Array.from(new Set(filtered));
  }, [settings, uniqueZones]);

  const getUnitsForZone = React.useCallback((zone: string) => {
    if (String(zone || '').toUpperCase() === 'COMMON') {
      const allUnits = zoneMappings.map(z => z.unit).filter(Boolean);
      return Array.from(new Set(['COMMON', ...allUnits])).map(u => String(u).toUpperCase());
    }
    const fromMap = zoneMappings
      .filter(z => String(z.zone || '').toUpperCase() === String(zone || '').toUpperCase() && z.unit)
      .map(z => z.unit);
    return Array.from(new Set(['COMMON', ...fromMap])).map(u => String(u).toUpperCase());
  }, [zoneMappings]);

  const getWorkersForUnit = React.useCallback((zone: string, unit: string) => {
    return zoneMappings
      .filter(z => 
        String(z.zone || '').toUpperCase() === String(zone || '').toUpperCase() && 
        String(z.unit || '').toUpperCase() === String(unit || '').toUpperCase() && 
        z.worker
      )
      .map(z => z.worker);
  }, [zoneMappings]);
  const [settingsSubTab, setSettingsSubTab] = useState<'userwise' | 'hierarchy'>('userwise');
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [userSettings, setUserSettings] = useState(INITIAL_USER_SETTINGS);
  const [savingSettings, setSavingSettings] = useState(false);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => prev.includes(groupId) ? prev.filter(g => g !== groupId) : [...prev, groupId]);
  };

  const logActivity = async (action: string, details: string) => {
    try {
      await api.run('api_logAdminActivity', {
        admin: currentUser.username,
        action,
        details,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error("Logging Error:", e);
    }
  };

  const handleAdd = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isLocked.current || isSubmitting) return;
    
    isLocked.current = true;
    setIsSubmitting(true);
    
    const cleanUsername = newUser.username.trim();
    const cleanPassword = newUser.password;
    
    if (!cleanUsername || !cleanPassword) {
      isLocked.current = false;
      setIsSubmitting(false);
      return alert("Username and Password are required");
    }
    
    try {
      const serverUsers = await api.run('api_getUsers') as any[];
      const currentUsers = Array.isArray(serverUsers) ? serverUsers : users;
      
      const exists = currentUsers.some((u: any) => 
        String(u?.username || '').toLowerCase() === cleanUsername.toLowerCase()
      );
      
      if (exists) {
        alert(`Error: Username "${cleanUsername}" is already taken.`);
        setIsSubmitting(false);
        isLocked.current = false;
        return;
      }
      
      const maxCode = currentUsers.reduce((max: number, u: any) => {
        const codeNum = parseInt(String(u?.userCode || '').replace(/\D/g, '')) || 0;
        return codeNum > max ? codeNum : max;
      }, 0);
      
      const userCode = `U${String(maxCode + 1).padStart(3, '0')}`;
      
      const u = { 
        ...newUser, 
        username: cleanUsername, 
        password: cleanPassword,
        userCode, 
        restrictions: [], 
        canDownload: true,
        createdAt: new Date().toISOString()
      };
      
      const result = await api.run('api_saveUser', u);
      if (!result || result.success === false) {
        throw new Error(result?.error || "Server failed to save user");
      }
      
      setNewUser({ username: '', password: '', role: 'USER', location: '', zone: currentZones[0] || '' });
      await refreshData();
      await logActivity('ADD USER', `Created user ${userCode} (${cleanUsername})`);
      triggerSuccess(`USER ${userCode} CREATED SUCCESSFULLY`);
      setTab('list');
    } catch (err: any) {
      console.error("[Admin] User Creation Failed:", err);
      alert(`Error adding user: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => { isLocked.current = false; }, 1000);
    }
  };

  const handleUpdate = async () => {
    if (isLocked.current || !editingForm) return;
    const cleanUsername = (editingForm.username || '').trim();
    if (!cleanUsername) return alert("Username is required");
    
    isLocked.current = true;
    setIsSubmitting(true);
    
    try {
      const orig = originalUserRef.current || {};
      const exists = users.some((u: any) => 
        u?.userCode !== editingForm.userCode && String(u?.username || '').toLowerCase().trim() === cleanUsername.toLowerCase()
      );
      if (exists) {
        alert(`Error: Username "${cleanUsername}" is already taken by another user.`);
        setIsSubmitting(false);
        isLocked.current = false;
        return;
      }

      const updatedUser = { 
        ...editingForm, 
        username: cleanUsername, 
        password: editingForm.password,
        oldUsername: orig.username || cleanUsername,
        oldUserCode: orig.userCode || editingForm.userCode
      };

      if (!api.run) return;
      await api.run('api_updateUser', updatedUser);

      // Instant local state update
      if (setUsers) {
        setUsers(prev => prev.map(u => u.userCode === updatedUser.userCode ? { ...u, ...updatedUser } : u));
      }

      // Sync active session if this was the logged-in user
      try {
        const session = JSON.parse(localStorage.getItem('bqos_session') || '{}');
        if (session && (session.userCode === updatedUser.userCode || session.username === orig.username)) {
          session.username = updatedUser.username;
          session.role = updatedUser.role;
          session.location = updatedUser.location;
          session.zone = updatedUser.zone;
          localStorage.setItem('bqos_session', JSON.stringify(session));
        }
      } catch (e) {}

      if (refreshData) await refreshData();
      await logActivity('EDIT USER', `Updated user ${updatedUser.userCode} (${cleanUsername})`);
      if (triggerSuccess) triggerSuccess(`USER ${updatedUser.userCode} UPDATED SUCCESSFULLY`);
      setEditingUserCode('');
      setEditingForm(null);
      setTab('list');
    } catch (err: any) {
      alert("Error updating user: " + (err?.message || ''));
    } finally {
      setIsSubmitting(false);
      isLocked.current = false;
    }
  };

  const confirmDelete = async () => {
    if (isLocked.current || !deletingUser) return;
    if (!deleteReason.trim()) return alert("Please provide a reason for deletion");
    
    isLocked.current = true;
    setIsSubmitting(true);
    
    try {
      const userCode = deletingUser.userCode;
      await api.run('api_deleteUser', userCode, deleteReason, currentUser.username);
      if (refreshData) await refreshData();
      await logActivity('DELETE USER', `Deleted user ${userCode}. Reason: ${deleteReason}`);
      if (triggerSuccess) triggerSuccess(`USER DELETED: ${userCode}`);
      setDeletingUserCode('');
      setDeleteReason('');
      setTab('list');
    } catch (err) {
      alert("Error deleting user");
    } finally {
      setIsSubmitting(false);
      isLocked.current = false;
    }
  };

  const toggleRestriction = async (userToUpdate: any, moduleId: string) => {
    const currentRestrictions = normalizeRestrictions(userToUpdate.restrictions);
    let updatedUser: any;

    if (moduleId === 'DOWNLOAD_RESTRICTION') {
      updatedUser = { ...userToUpdate, canDownload: !userToUpdate.canDownload, restrictions: currentRestrictions };
    } else {
      const isRestricted = currentRestrictions.includes(moduleId);
      const newRestrictions = isRestricted
        ? currentRestrictions.filter((id: string) => id !== moduleId)
        : [...currentRestrictions, moduleId];
      updatedUser = { ...userToUpdate, restrictions: newRestrictions };
    }

    setUsers && setUsers(prev => prev.map(u => u.userCode === updatedUser.userCode ? updatedUser : u));

    try {
      await api.run('api_updateUser', updatedUser);
      logActivity('RESTRICTION CHANGE', `Updated ${moduleId} for ${userToUpdate.userCode}`);
    } catch (err) {
      console.error("Save failed, reverting UI:", err);
      if (refreshData) await refreshData();
    }
  };

  const fetchUserSettings = async (code: string) => {
    const target = code || (filteredUsers[0]?.userCode || '');
    setSelectedUserCode(target);
    if (!target) {
      setUserSettings({
        STYLE_NAME: '',
        SIZE: '',
        CUPSIZE: '',
        COLOR: '',
        LINE: '',
        MACHINE: '',
        OPERATION: '',
        DEFECTS: ''
      } as any);
      return;
    }
    try {
      const res = await api.run('api_getUserSettings', target) as any;
      const s = res?.settings || res || {};
      const formatted: any = {};
      const USER_CUSTOM_KEYS = ['STYLE_NAME', 'SIZE', 'CUPSIZE', 'COLOR', 'LINE', 'MACHINE', 'OPERATION', 'DEFECTS'];
      USER_CUSTOM_KEYS.forEach(key => {
        const val = s[key] || s[key.toLowerCase()];
        if (Array.isArray(val) && val.length > 0) {
          formatted[key] = val.map((item: any) => String(item || '').trim()).filter(Boolean).join('\n');
        } else if (typeof val === 'string' && val.trim()) {
          formatted[key] = val.trim();
        } else {
          // If no options configured, leave EMPTY string so the user sees an empty dropbox
          formatted[key] = '';
        }
      });
      setUserSettings(formatted);
    } catch (e) {
      console.error("Fetch Settings Error:", e);
      setUserSettings({
        STYLE_NAME: '',
        SIZE: '',
        CUPSIZE: '',
        COLOR: '',
        LINE: '',
        MACHINE: '',
        OPERATION: '',
        DEFECTS: ''
      } as any);
    }
  };

  const handleSaveSettings = async () => {
    const targetCode = selectedUserCode || (filteredUsers[0]?.userCode || '');
    if (!targetCode) return alert("Please select a user to configure.");
    setSavingSettings(true);
    try {
      const settingsToSave: any = {};
      const USER_CUSTOM_KEYS = ['STYLE_NAME', 'SIZE', 'CUPSIZE', 'COLOR', 'LINE', 'MACHINE', 'OPERATION', 'DEFECTS'];
      USER_CUSTOM_KEYS.forEach(key => {
        const raw = userSettings[key as keyof typeof userSettings];
        if (typeof raw === 'string') {
          settingsToSave[key] = raw.split('\n').map((s: string) => s.trim()).filter((s: string) => s !== '');
        } else if (Array.isArray(raw)) {
          settingsToSave[key] = raw;
        } else {
          settingsToSave[key] = [];
        }
      });
      await api.run('api_saveUserSettings', targetCode, settingsToSave);
      await logActivity('USERWISE DROPBOX SETTINGS', `Updated dropdown options for user ${targetCode}`);
      if (refreshData) {
        await refreshData().catch(() => {});
      }
      if (triggerSuccess) {
        triggerSuccess(`Dropdown options saved successfully for user ${targetCode}!`);
      } else {
        alert(`Dropdown options saved successfully for user ${targetCode}!`);
      }
    } catch (e) {
      alert('Error saving userwise settings');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ADMIN TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        {[
          { id: 'list', label: 'User List', icon: 'users' },
          { id: 'add', label: 'Add User', icon: 'user-plus' },
          { id: 'edit', label: 'Edit User', icon: 'edit' },
          { id: 'restrictions', label: 'Restrictions', icon: 'shield-off' },
          { id: 'settings', label: 'Dropdown Settings', icon: 'sliders' },
          { id: 'delete', label: 'Delete User', icon: 'user-minus' },
          { id: 'delete_data', label: 'Delete Data', icon: 'trash-2' },
          { id: 'logs', label: 'Activity Logs', icon: 'file-text' }
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id)} 
            className={`px-4 py-2 rounded-lg font-bold uppercase text-xs flex items-center gap-2 transition-all ${tab === t.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <Icon name={t.icon} size={16} /> {t.label}
          </button>
        ))}

        {configOnlyMode && onLogout && (
          <div className="ml-auto">
            <button 
              onClick={onLogout}
              className="px-4 py-2 rounded-lg font-bold uppercase text-xs flex items-center gap-2 text-rose-500 hover:bg-rose-50"
            >
              <Icon name="log-out" size={16} /> Back to Login
            </button>
          </div>
        )}
      </div>

      <div className="glass-card p-6">
        {tab === 'list' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-bold uppercase text-slate-400 border-b border-slate-100">
                  <th className="p-3">Code</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Password</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Zone</th>
                  <th className="p-3">Location / Unit</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredUsers.map(u => (
                  <UserRow 
                    key={u.userCode} 
                    u={u} 
                    onEdit={() => { setEditingUserCode(u.userCode); setTab('edit'); }} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'add' && (
          <div className="space-y-6 max-w-md animate-slide-up">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Icon name="user-plus" size={24} className="text-indigo-600" />
              Add New User
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Assigned User Code</label>
                <input 
                  type="text" 
                  readOnly 
                  className="bg-slate-50 border border-slate-200 text-slate-500 font-mono text-sm cursor-not-allowed select-none"
                  value={"U" + String(users.reduce((max, u) => {
                    const codeNum = parseInt(String(u.userCode || '').replace(/\D/g, '')) || 0;
                    return codeNum > max ? codeNum : max;
                  }, 0) + 1).padStart(3, '0')}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Username</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Enter Username" 
                    value={newUser.username} 
                    onChange={e => setNewUser({...newUser, username: e.target.value})} 
                    className="pr-10"
                  />
                  {newUser.username.trim() !== '' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                      {users.some(u => u.username.toLowerCase().trim() === newUser.username.toLowerCase().trim()) ? (
                        <Icon name="x-circle" size={18} className="text-rose-500" />
                      ) : (
                        <Icon name="check-circle" size={18} className="text-emerald-500" />
                      )}
                    </div>
                  )}
                </div>
                {newUser.username.trim() !== '' && (
                  <p className={`text-[10px] mt-1 font-bold ${users.some(u => u.username.toLowerCase().trim() === newUser.username.toLowerCase().trim()) ? 'text-rose-500' : 'text-emerald-600'}`}>
                    {users.some(u => u.username.toLowerCase().trim() === newUser.username.toLowerCase().trim()) ? '✕ Username already in use' : '✓ Username available'}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Unique Password</label>
                <input 
                  type="text" 
                  placeholder="Enter Unique Password" 
                  value={newUser.password} 
                  onChange={e => setNewUser({...newUser, password: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">User Role</label>
                <SearchableSelect value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </SearchableSelect>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Zone</label>
                <SearchableSelect 
                  value={newUser.zone} 
                  onChange={e => {
                    const nextZone = e.target.value;
                    const units = getUnitsForZone(nextZone);
                    setNewUser({
                      ...newUser, 
                      zone: nextZone, 
                      location: units.length > 0 ? units[0] : ''
                    });
                  }}
                >
                  <option value="">Select Zone...</option>
                  <option value="COMMON">COMMON (All Zones)</option>
                  {currentZones.map(z => <option key={z} value={z}>{z}</option>)}
                </SearchableSelect>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Location / Unit</label>
                <SearchableSelect 
                  value={newUser.location} 
                  onChange={e => setNewUser({...newUser, location: e.target.value})}
                >
                  <option value="">Select Unit...</option>
                  {getUnitsForZone(newUser.zone).map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </SearchableSelect>
              </div>
              <button 
                type="button"
                onClick={handleAdd} 
                disabled={isSubmitting || !newUser.username || !newUser.password || users.some(u => u.username.toLowerCase().trim() === newUser.username.toLowerCase().trim())}
                className="btn-primary w-full text-xs font-black italic tracking-widest uppercase py-4 shadow-xl shadow-indigo-100 hover:scale-[1.02] disabled:opacity-50"
              >
                {isSubmitting ? 'CREATING...' : 'CREATE USER'}
              </button>
            </div>
          </div>
        )}

        {tab === 'edit' && (
          <div className="space-y-4 max-w-md">
            <h2 className="text-xl font-bold">Edit User</h2>
            <div className="space-y-3">
              <label>Select User Code</label>
              <SearchableSelect 
                value={editingUserCode} 
                onChange={e => setEditingUserCode(e.target.value)}
              >
                <option value="">Select User Code...</option>
                {filteredUsers.map(u => (
                  <option key={u.userCode} value={u.userCode}>{u.userCode} - {u.username}</option>
                ))}
              </SearchableSelect>

              {editingForm && (
                <div className="space-y-3 pt-4 border-t border-slate-100 animate-fade-in">
                  <div>
                    <label>Username</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={editingForm.username || ''} 
                        onChange={e => {
                          setEditingForm((prev: any) => ({ ...prev, username: e.target.value }));
                        }} 
                        className="pr-10"
                      />
                      {(editingForm.username || '').trim() !== '' && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                          {users.some(u => u.userCode !== editingForm.userCode && u.username.toLowerCase().trim() === (editingForm.username || '').toLowerCase().trim()) ? (
                            <Icon name="x-circle" size={18} className="text-rose-500" />
                          ) : (
                            <Icon name="check-circle" size={18} className="text-emerald-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {(editingForm.username || '').trim() !== '' && (
                      <p className={`text-[10px] mt-1 font-bold ${users.some(u => u.userCode !== editingForm.userCode && u.username.toLowerCase().trim() === (editingForm.username || '').toLowerCase().trim()) ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {users.some(u => u.userCode !== editingForm.userCode && u.username.toLowerCase().trim() === (editingForm.username || '').toLowerCase().trim()) ? '✕ Username already in use' : '✓ Username available'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label>Password</label>
                    <input type="password" value={editingForm.password || ''} onChange={e => {
                      setEditingForm((prev: any) => ({ ...prev, password: e.target.value }));
                    }} />
                  </div>
                  <div>
                    <label>Role</label>
                    <SearchableSelect value={editingForm.role} onChange={e => {
                      setEditingForm((prev: any) => ({ ...prev, role: e.target.value }));
                    }}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </SearchableSelect>
                  </div>
                  <div>
                    <label>Zone</label>
                    <SearchableSelect value={editingForm.zone || ''} onChange={e => {
                      const nextZone = e.target.value;
                      const units = getUnitsForZone(nextZone);
                      setEditingForm((prev: any) => ({
                        ...prev,
                        zone: nextZone,
                        location: units.length > 0 ? units[0] : ''
                      }));
                    }}>
                      <option value="">Select Zone...</option>
                      <option value="COMMON">COMMON (All Zones)</option>
                      {currentZones.map(z => <option key={z} value={z}>{z}</option>)}
                    </SearchableSelect>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Location / Unit</label>
                    <SearchableSelect 
                      value={editingForm.location || ''} 
                      onChange={e => {
                        setEditingForm((prev: any) => ({ ...prev, location: e.target.value }));
                      }} 
                    >
                      <option value="">Select Unit...</option>
                      {getUnitsForZone(editingForm.zone || '').map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </SearchableSelect>
                  </div>
                  <button 
                    onClick={handleUpdate} 
                    disabled={isSubmitting || !editingForm.username || users.some(u => u.userCode !== editingForm.userCode && u.username.toLowerCase().trim() === (editingForm.username || '').toLowerCase().trim())}
                    className="btn-primary w-full text-xs font-black italic tracking-widest uppercase py-4 shadow-xl shadow-indigo-100 hover:scale-[1.02] disabled:opacity-50"
                  >
                    {isSubmitting ? 'SAVING...' : 'SAVE CHANGES'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'restrictions' && (
          <div className="space-y-6">
            <div className="max-w-xs">
              <label>Select User Code</label>
              <SearchableSelect 
                value={restrictingUserCode} 
                onChange={e => setRestrictingUserCode(e.target.value)}
              >
                <option value="">Select a user...</option>
                {filteredUsers.filter(u => u.role !== 'ADMIN').map(u => (
                  <option key={u.userCode} value={u.userCode}>{u.username.toUpperCase()} ({u.role}) - {u.userCode}</option>
                ))}
              </SearchableSelect>
            </div>

            {restrictingUser && (
              <div className="space-y-8 animate-fade-in animate-slide-in-from-bottom">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="glass-card p-4 border-l-4 border-rose-500 bg-rose-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon name="download" size={18} className="text-rose-600" />
                      <div>
                        <h3 className="font-bold text-sm text-rose-900">Data Download</h3>
                        <p className="text-[10px] text-rose-700 opacity-60 uppercase font-black tracking-tighter italic">Global Export</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleRestriction(restrictingUser, 'DOWNLOAD_RESTRICTION')}
                      disabled={isSubmitting}
                      className={`w-12 h-6 rounded-full transition-all relative ${restrictingUser.canDownload !== false ? 'bg-green-500' : 'bg-slate-300'} disabled:opacity-50`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${restrictingUser.canDownload !== false ? 'left-7' : 'left-1'}`}></div>
                    </button>
                  </div>

                  {MAIN_MODULES.map(m => (
                    <div key={m.id} className="glass-card p-4 border-l-4 border-indigo-600">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Icon name={m.icon} size={18} className="text-indigo-600" />
                          <span className="font-bold text-sm">{m.name}</span>
                        </div>
                        <button 
                          onClick={() => toggleRestriction(restrictingUser, m.id)}
                          disabled={isSubmitting}
                          className={`w-12 h-6 rounded-full transition-colors relative ${!normalizeRestrictions(restrictingUser.restrictions).includes(m.id) ? 'bg-green-500' : 'bg-slate-200'} disabled:opacity-50`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${!normalizeRestrictions(restrictingUser.restrictions).includes(m.id) ? 'left-7' : 'left-1'}`}></div>
                        </button>
                      </div>
                      
                      <div className="space-y-2 pl-6 border-l border-slate-100">
                        {SUBMODULES.filter(s => s.module === m.id).map(s => (
                          <div key={s.id} className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 font-medium">{s.name}</span>
                            <button 
                              onClick={() => toggleRestriction(restrictingUser, s.id)}
                              disabled={isSubmitting}
                              className={`w-10 h-5 rounded-full transition-colors relative ${!normalizeRestrictions(restrictingUser.restrictions).includes(s.id) ? 'bg-indigo-400' : 'bg-slate-200'} disabled:opacity-50`}
                            >
                              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${!normalizeRestrictions(restrictingUser.restrictions).includes(s.id) ? 'left-6' : 'left-1'}`}></div>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Sub-tabs */}
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <button
                onClick={() => setSettingsSubTab('userwise')}
                className={`px-5 py-2.5 rounded-xl font-black uppercase text-xs flex items-center gap-2 transition-all ${
                  settingsSubTab === 'userwise'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon name="database" size={16} />
                1. Userwise Dropbox Settings
              </button>
              <button
                onClick={() => setSettingsSubTab('hierarchy')}
                className={`px-5 py-2.5 rounded-xl font-black uppercase text-xs flex items-center gap-2 transition-all ${
                  settingsSubTab === 'hierarchy'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon name="layers" size={16} />
                2. Common Dropbox Setup (Zone, Unit, Worker, Items &amp; Suppliers)
              </button>
            </div>

            {settingsSubTab === 'userwise' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <Icon name="database" size={22} className="text-indigo-600" />
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">
                      User Wise Settings (Dropdown Options)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-4xl">
                    Configure personalized drop-down options for individual user accounts. If options are not given for a category, that dropdown will be empty for that user. Common dropdowns (Zone, Unit, Worker, Items &amp; Suppliers) are managed in Tab 2.
                  </p>
                </div>

                {/* Select User to Configure */}
                <div className="max-w-md space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                    SELECT USER TO CONFIGURE
                  </label>
                  <SearchableSelect 
                    value={selectedUserCode || (filteredUsers[0]?.userCode || '')} 
                    onChange={e => fetchUserSettings(e.target.value)}
                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 w-full rounded-xl py-2.5 text-xs font-semibold shadow-sm"
                  >
                    {filteredUsers.map(u => (
                      <option key={u.userCode} value={u.userCode}>👤 {u.username} ({u.userCode})</option>
                    ))}
                  </SearchableSelect>
                </div>

                {/* Category Bar: Title + Expand/Collapse Buttons */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    USER-SPECIFIC CATEGORIES (GROUPED &amp; COLLAPSED BY DEFAULT)
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setOpenGroups(['product', 'factory', 'floor', 'quality'])}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm"
                    >
                      EXPAND ALL
                    </button>
                    <button 
                      onClick={() => setOpenGroups([])}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm"
                    >
                      COLLAPSE ALL
                    </button>
                  </div>
                </div>

                {/* 4 Collapsible Accordion Groups */}
                <div className="space-y-4">
                  {/* Group 1: Product Details */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => toggleGroup('product')}
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Icon name="tag" size={18} className="text-indigo-600" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          PRODUCT DETAILS (STYLES, SIZES, CUPSIZES, COLORS)
                        </span>
                      </div>
                      <Icon 
                        name={openGroups.includes('product') ? "chevron-up" : "chevron-down"} 
                        size={18} 
                        className="text-slate-400" 
                      />
                    </button>

                    {openGroups.includes('product') && (
                      <div className="p-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
                        {[
                          { key: 'STYLE_NAME', label: 'STYLE NAME' },
                          { key: 'SIZE', label: 'SIZE' },
                          { key: 'CUPSIZE', label: 'CUPSIZE' },
                          { key: 'COLOR', label: 'COLOR' }
                        ].map(({ key, label }) => {
                          const count = userSettings[key as keyof typeof userSettings] 
                            ? String(userSettings[key as keyof typeof userSettings]).split('\n').filter(Boolean).length 
                            : 0;
                          return (
                            <div key={key} className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                              <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                <span>{label}</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold">
                                  ({count} items)
                                </span>
                              </label>
                              <textarea 
                                rows={6} 
                                className="text-xs font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 rounded-xl w-full p-2.5 leading-relaxed"
                                value={userSettings[key as keyof typeof userSettings] || ''} 
                                onChange={e => setUserSettings({...userSettings, [key]: e.target.value})}
                                placeholder={`Enter ${label.toLowerCase()} items, one per line...`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Group 2: Factory Organization */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => toggleGroup('factory')}
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Icon name="layers" size={18} className="text-indigo-600" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          FACTORY ORGANIZATION (LINES ONLY)
                        </span>
                      </div>
                      <Icon 
                        name={openGroups.includes('factory') ? "chevron-up" : "chevron-down"} 
                        size={18} 
                        className="text-slate-400" 
                      />
                    </button>

                    {openGroups.includes('factory') && (
                      <div className="p-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
                        {[
                          { key: 'LINE', label: 'LINE' }
                        ].map(({ key, label }) => {
                          const count = userSettings[key as keyof typeof userSettings] 
                            ? String(userSettings[key as keyof typeof userSettings]).split('\n').filter(Boolean).length 
                            : 0;
                          return (
                            <div key={key} className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                              <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                <span>{label}</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold">
                                  ({count} items)
                                </span>
                              </label>
                              <textarea 
                                rows={6} 
                                className="text-xs font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 rounded-xl w-full p-2.5 leading-relaxed"
                                value={userSettings[key as keyof typeof userSettings] || ''} 
                                onChange={e => setUserSettings({...userSettings, [key]: e.target.value})}
                                placeholder={`Enter ${label.toLowerCase()} items, one per line...`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Group 3: Workshop Floor */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => toggleGroup('floor')}
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Icon name="tool" size={18} className="text-indigo-600" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          WORKSHOP FLOOR (MACHINES, OPERATIONS ONLY)
                        </span>
                      </div>
                      <Icon 
                        name={openGroups.includes('floor') ? "chevron-up" : "chevron-down"} 
                        size={18} 
                        className="text-slate-400" 
                      />
                    </button>

                    {openGroups.includes('floor') && (
                      <div className="p-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
                        {[
                          { key: 'MACHINE', label: 'MACHINE' },
                          { key: 'OPERATION', label: 'OPERATION' }
                        ].map(({ key, label }) => {
                          const count = userSettings[key as keyof typeof userSettings] 
                            ? String(userSettings[key as keyof typeof userSettings]).split('\n').filter(Boolean).length 
                            : 0;
                          return (
                            <div key={key} className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                              <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                <span>{label}</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold">
                                  ({count} items)
                                </span>
                              </label>
                              <textarea 
                                rows={6} 
                                className="text-xs font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 rounded-xl w-full p-2.5 leading-relaxed"
                                value={userSettings[key as keyof typeof userSettings] || ''} 
                                onChange={e => setUserSettings({...userSettings, [key]: e.target.value})}
                                placeholder={`Enter ${label.toLowerCase()} items, one per line...`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Group 4: Quality Controls */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => toggleGroup('quality')}
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Icon name="shield" size={18} className="text-indigo-600" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          QUALITY CONTROLS (DEFECTS ONLY)
                        </span>
                      </div>
                      <Icon 
                        name={openGroups.includes('quality') ? "chevron-up" : "chevron-down"} 
                        size={18} 
                        className="text-slate-400" 
                      />
                    </button>

                    {openGroups.includes('quality') && (
                      <div className="p-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
                        {[
                          { key: 'DEFECTS', label: 'DEFECTS' }
                        ].map(({ key, label }) => {
                          const count = userSettings[key as keyof typeof userSettings] 
                            ? String(userSettings[key as keyof typeof userSettings]).split('\n').filter(Boolean).length 
                            : 0;
                          return (
                            <div key={key} className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                              <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                <span>{label}</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold">
                                  ({count} items)
                                </span>
                              </label>
                              <textarea 
                                rows={6} 
                                className="text-xs font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 rounded-xl w-full p-2.5 leading-relaxed"
                                value={userSettings[key as keyof typeof userSettings] || ''} 
                                onChange={e => setUserSettings({...userSettings, [key]: e.target.value})}
                                placeholder={`Enter ${label.toLowerCase()} items, one per line...`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <button 
                    onClick={handleSaveSettings} 
                    disabled={savingSettings}
                    className="btn-primary bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3.5 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none"
                  >
                    {savingSettings ? 'SAVING CONFIG...' : 'SAVE CONFIGURATION'}
                  </button>
                </div>
              </div>
            )}

            {settingsSubTab === 'hierarchy' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <Icon name="layers" size={22} className="text-indigo-600" />
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">
                      Zone, Unit &amp; Worker Hierarchy Dropbox Settings
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-4xl">
                    Manage the hierarchical association of zones, units, and workers. These configurations are persisted globally to the <span className="font-bold text-slate-700 dark:text-slate-300">ZONE</span> sheet, and individual unit-specific sheets.
                  </p>
                </div>

                {/* 3 Forms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {/* Option 1: Add Zone */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-sm">
                    <div className="space-y-3.5">
                      <span className="text-[11px] font-black uppercase tracking-widest text-indigo-600 block">
                        OPTION 1: ADD ZONE
                      </span>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">
                          ZONE NAME
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. KERALA, TIRUPUR" 
                          value={newZoneName}
                          onChange={e => setNewZoneName(e.target.value)}
                          className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-xs py-2.5 font-semibold"
                        />
                      </div>
                      <button 
                        onClick={handleSaveZone}
                        disabled={isSavingZone || !newZoneName.trim()}
                        className="btn-primary bg-indigo-600 hover:bg-indigo-700 text-[10px] uppercase font-black py-3 rounded-xl w-full"
                      >
                        {isSavingZone ? 'Adding Zone...' : 'ADD ZONE'}
                      </button>

                      <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-2.5">
                          EXISTING ZONES ({currentZones.length})
                        </span>
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                          {currentZones.map(zone => (
                            <div key={zone} className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3.5 py-2.5 shadow-sm">
                              <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">{zone}</span>
                              <button 
                                onClick={() => handleDeleteZone(zone)}
                                className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                                title={`Delete zone ${zone} and all its units`}
                              >
                                <Icon name="trash-2" size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Add Unit */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-sm">
                    <div className="space-y-3.5">
                      <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 block">
                        OPTION 2: ADD UNIT
                      </span>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">
                          SELECT ZONE
                        </label>
                        <SearchableSelect 
                          value={newUnitZone} 
                          onChange={e => setNewUnitZone(e.target.value)}
                          className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-xs py-2.5 font-semibold"
                        >
                          <option value="">Select Zone...</option>
                          {currentZones.map(z => (
                            <option key={z} value={z}>{z}</option>
                          ))}
                        </SearchableSelect>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">
                          UNIT NAME
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. UNIT A, UNIT B" 
                          value={newUnitName}
                          onChange={e => setNewUnitName(e.target.value)}
                          className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-xs py-2.5 font-semibold"
                        />
                      </div>
                      <button 
                        onClick={handleSaveUnit}
                        disabled={isSavingUnit || !newUnitName.trim() || !newUnitZone}
                        className="btn-primary bg-indigo-600 hover:bg-indigo-700 text-[10px] uppercase font-black py-3 rounded-xl w-full"
                      >
                        {isSavingUnit ? 'Adding Unit...' : 'ADD UNIT'}
                      </button>

                      {newUnitZone && (
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-2.5">
                            Units in {newUnitZone} ({getUnitsForZone(newUnitZone).length})
                          </span>
                          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                            {getUnitsForZone(newUnitZone).length === 0 ? (
                              <span className="text-xs text-slate-400 italic">No units registered in this zone yet.</span>
                            ) : (
                              getUnitsForZone(newUnitZone).map(unit => (
                                <div key={unit} className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3.5 py-2.5 shadow-sm">
                                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">{unit}</span>
                                  <button 
                                    onClick={() => handleDeleteUnit(newUnitZone, unit)}
                                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                                    title={`Delete unit ${unit} and all its workers`}
                                  >
                                    <Icon name="trash-2" size={13} />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Option 3: Add Worker */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-sm">
                    <div className="space-y-3.5">
                      <span className="text-[11px] font-black uppercase tracking-widest text-amber-600 block">
                        OPTION 3: ADD WORKER
                      </span>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">
                          SELECT ZONE
                        </label>
                        <SearchableSelect 
                          value={newWorkerZone} 
                          onChange={e => {
                            const val = e.target.value;
                            setNewWorkerZone(val);
                            const units = getUnitsForZone(val);
                            setNewWorkerUnit(units.length > 0 ? units[0] : '');
                          }}
                          className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-xs py-2.5 font-semibold"
                        >
                          <option value="">Select Zone...</option>
                          {currentZones.map(z => (
                            <option key={z} value={z}>{z}</option>
                          ))}
                        </SearchableSelect>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">
                          SELECT UNIT
                        </label>
                        <SearchableSelect 
                          value={newWorkerUnit} 
                          onChange={e => setNewWorkerUnit(e.target.value)}
                          className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-xs py-2.5 font-semibold"
                          disabled={!newWorkerZone}
                        >
                          <option value="">Select Unit...</option>
                          {getUnitsForZone(newWorkerZone).map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </SearchableSelect>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">
                          WORKER NAME
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. JOHN SMITH" 
                          value={newWorkerName}
                          onChange={e => setNewWorkerName(e.target.value)}
                          className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-xs py-2.5 font-semibold"
                          disabled={!newWorkerUnit}
                        />
                      </div>
                      <button 
                        onClick={handleSaveWorker}
                        disabled={isSavingWorker || !newWorkerName.trim() || !newWorkerZone || !newWorkerUnit}
                        className="btn-primary bg-indigo-600 hover:bg-indigo-700 text-[10px] uppercase font-black py-3 rounded-xl w-full"
                      >
                        {isSavingWorker ? 'Adding Worker...' : 'ADD WORKER'}
                      </button>

                      {newWorkerZone && newWorkerUnit && (
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-2.5">
                            Workers in {newWorkerUnit} ({getWorkersForUnit(newWorkerZone, newWorkerUnit).length})
                          </span>
                          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                            {getWorkersForUnit(newWorkerZone, newWorkerUnit).length === 0 ? (
                              <span className="text-xs text-slate-400 italic">No workers mapped to this unit yet.</span>
                            ) : (
                              getWorkersForUnit(newWorkerZone, newWorkerUnit).map(worker => (
                                <div key={worker} className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3.5 py-2.5 shadow-sm">
                                  <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">{worker}</span>
                                  <button 
                                    onClick={() => handleDeleteWorker(newWorkerZone, newWorkerUnit, worker)}
                                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                                    title={`Delete worker ${worker}`}
                                  >
                                    <Icon name="trash-2" size={13} />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 2: Common Items & Suppliers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Option 4: Common Items */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-sm">
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-widest text-purple-600 block">
                          OPTION 4: COMMON ITEMS
                        </span>
                        <button
                          onClick={() => {
                            setBulkItemsText(commonItems.join('\n'));
                            setShowBulkItems(!showBulkItems);
                          }}
                          className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                        >
                          {showBulkItems ? 'Close Bulk Edit' : 'Bulk Edit / View All'}
                        </button>
                      </div>

                      {showBulkItems ? (
                        <div className="space-y-2 pt-1 animate-fade-in">
                          <textarea
                            rows={10}
                            className="text-xs font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-500 rounded-xl w-full p-2.5 leading-relaxed"
                            value={bulkItemsText}
                            onChange={e => setBulkItemsText(e.target.value)}
                            placeholder="One item per line..."
                          />
                          <button
                            onClick={handleSaveBulkItems}
                            disabled={isSavingItem}
                            className="btn-primary bg-purple-600 hover:bg-purple-700 text-[10px] uppercase font-black py-2.5 rounded-xl w-full"
                          >
                            {isSavingItem ? 'Saving...' : 'SAVE ALL ITEMS'}
                          </button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">
                              ITEM NAME
                            </label>
                            <input 
                              type="text" 
                              placeholder="e.g. COTTON SPANDEX RIB 220GSM" 
                              value={newItemName}
                              onChange={e => setNewItemName(e.target.value)}
                              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-xs py-2.5 font-semibold"
                            />
                          </div>
                          <button 
                            onClick={handleAddItem}
                            disabled={isSavingItem || !newItemName.trim()}
                            className="btn-primary bg-purple-600 hover:bg-purple-700 text-[10px] uppercase font-black py-3 rounded-xl w-full"
                          >
                            {isSavingItem ? 'Adding Item...' : 'ADD COMMON ITEM'}
                          </button>

                          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                COMMON ITEMS ({commonItems.length})
                              </span>
                              <input
                                type="text"
                                placeholder="Search..."
                                value={itemSearch}
                                onChange={e => setItemSearch(e.target.value)}
                                className="w-28 text-[10px] py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-normal"
                              />
                            </div>
                            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                              {filteredItemsList.slice(0, 50).map(item => (
                                <div key={item} className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2 shadow-sm text-xs">
                                  <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase truncate max-w-[280px]" title={item}>{item}</span>
                                  <button 
                                    onClick={() => handleDeleteItem(item)}
                                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded-lg transition-colors ml-2 shrink-0"
                                    title={`Delete item ${item}`}
                                  >
                                    <Icon name="trash-2" size={13} />
                                  </button>
                                </div>
                              ))}
                              {filteredItemsList.length > 50 && (
                                <p className="text-[10px] text-slate-400 text-center italic pt-1">
                                  Showing first 50 of {filteredItemsList.length} items (use search to filter)
                                </p>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Option 5: Common Suppliers */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-sm">
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 block">
                          OPTION 5: COMMON SUPPLIERS
                        </span>
                        <button
                          onClick={() => {
                            setBulkSuppliersText(commonSuppliers.join('\n'));
                            setShowBulkSuppliers(!showBulkSuppliers);
                          }}
                          className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                        >
                          {showBulkSuppliers ? 'Close Bulk Edit' : 'Bulk Edit / View All'}
                        </button>
                      </div>

                      {showBulkSuppliers ? (
                        <div className="space-y-2 pt-1 animate-fade-in">
                          <textarea
                            rows={10}
                            className="text-xs font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 rounded-xl w-full p-2.5 leading-relaxed"
                            value={bulkSuppliersText}
                            onChange={e => setBulkSuppliersText(e.target.value)}
                            placeholder="One supplier per line..."
                          />
                          <button
                            onClick={handleSaveBulkSuppliers}
                            disabled={isSavingSupplier}
                            className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-[10px] uppercase font-black py-2.5 rounded-xl w-full"
                          >
                            {isSavingSupplier ? 'Saving...' : 'SAVE ALL SUPPLIERS'}
                          </button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">
                              SUPPLIER NAME
                            </label>
                            <input 
                              type="text" 
                              placeholder="e.g. TEXTILE KNIT MILLS" 
                              value={newSupplierName}
                              onChange={e => setNewSupplierName(e.target.value)}
                              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-xs py-2.5 font-semibold"
                            />
                          </div>
                          <button 
                            onClick={handleAddSupplier}
                            disabled={isSavingSupplier || !newSupplierName.trim()}
                            className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-[10px] uppercase font-black py-3 rounded-xl w-full"
                          >
                            {isSavingSupplier ? 'Adding Supplier...' : 'ADD COMMON SUPPLIER'}
                          </button>

                          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                COMMON SUPPLIERS ({commonSuppliers.length})
                              </span>
                              <input
                                type="text"
                                placeholder="Search..."
                                value={supplierSearch}
                                onChange={e => setSupplierSearch(e.target.value)}
                                className="w-28 text-[10px] py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-normal"
                              />
                            </div>
                            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                              {filteredSuppliersList.slice(0, 50).map(supplier => (
                                <div key={supplier} className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2 shadow-sm text-xs">
                                  <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase truncate max-w-[280px]" title={supplier}>{supplier}</span>
                                  <button 
                                    onClick={() => handleDeleteSupplier(supplier)}
                                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded-lg transition-colors ml-2 shrink-0"
                                    title={`Delete supplier ${supplier}`}
                                  >
                                    <Icon name="trash-2" size={13} />
                                  </button>
                                </div>
                              ))}
                              {filteredSuppliersList.length > 50 && (
                                <p className="text-[10px] text-slate-400 text-center italic pt-1">
                                  Showing first 50 of {filteredSuppliersList.length} suppliers (use search to filter)
                                </p>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Grouped Hierarchy Table */}
                <div className="pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Current Sheet Mappings ({zoneMappings.length})
                    </h4>
                    <button 
                      onClick={fetchZoneMappings}
                      className="text-[10px] uppercase font-bold text-indigo-600 hover:underline flex items-center gap-1.5"
                    >
                      <Icon name="refresh-cw" size={12} className={loadingZoneMappings ? 'animate-spin' : ''} />
                      Refresh
                    </button>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden max-h-80 overflow-y-auto shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                        <tr>
                          <th className="p-3">Zone</th>
                          <th className="p-3">Unit</th>
                          <th className="p-3">Worker / Operator</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {zoneMappings.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                              No custom hierarchies mapped yet in the ZONE and Unit-specific sheets.
                            </td>
                          </tr>
                        ) : (
                          zoneMappings.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="p-3 font-bold text-slate-700 dark:text-slate-200">{item.zone}</td>
                              <td className="p-3 text-slate-600 dark:text-slate-300">{item.unit || <span className="text-slate-400 italic">- None -</span>}</td>
                              <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{item.worker || <span className="text-slate-400 italic">- None -</span>}</td>
                              <td className="p-3 text-right">
                                <button 
                                  onClick={() => handleDeleteZoneMapping(item)}
                                  className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                                  title="Delete Mapping"
                                >
                                  <Icon name="trash-2" size={14} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'delete' && (
          <div className="space-y-4 max-w-md animate-fade-in">
            <h2 className="text-xl font-black text-rose-600 flex items-center gap-2">
              <Icon name="user-minus" size={24} />
              Terminate User Account
            </h2>
            <div className="space-y-4 bg-rose-50 p-6 rounded-2xl border border-rose-100">
              <div>
                <label className="text-rose-900">Select User to Delete</label>
                <SearchableSelect 
                  value={deletingUserCode} 
                  onChange={e => setDeletingUserCode(e.target.value)}
                  className="border-rose-200 focus:ring-rose-500 w-full"
                >
                  <option value="">Choose account...</option>
                  {filteredUsers.filter(u => u.username !== currentUser.username).map(u => (
                    <option key={u.userCode} value={u.userCode}>{u.username.toUpperCase()} ({u.userCode})</option>
                  ))}
                </SearchableSelect>
              </div>
              {deletingUser && (
                <div className="space-y-4 animate-slide-up">
                  <div>
                    <label className="text-rose-900 font-bold">Deletion Reason</label>
                    <textarea 
                      placeholder="Why is this account being removed?" 
                      className="border-rose-200"
                      value={deleteReason}
                      onChange={e => setDeleteReason(e.target.value)}
                    />
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-rose-200 flex items-center gap-3">
                    <Icon name="alert-triangle" size={24} className="text-rose-600" />
                    <p className="text-[10px] font-bold text-rose-800 leading-relaxed uppercase">
                      Confirming this action will permanently remove all credentials and authorization for this user from the main USERS ledger.
                    </p>
                  </div>
                  <button 
                    onClick={confirmDelete}
                    disabled={isSubmitting || !deleteReason.trim()}
                    className="w-full bg-rose-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'TERMINATING...' : 'PERMANENTLY DELETE ACCOUNT'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'delete_data' && (
          <div className="space-y-6">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3">
              <Icon name="alert-triangle" size={24} className="text-rose-600" />
              <div>
                <h4 className="text-xs font-black text-rose-900 uppercase tracking-wider">ADMIN DATA MANAGEMENT</h4>
                <p className="text-[10px] font-bold text-rose-700 leading-relaxed uppercase">
                  This panel allows permanent, irreversible deletion of individual records from the Google Spreadsheet database. Use with extreme caution.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Data Category</label>
                <SearchableSelect
                  value={selectedDataType}
                  onChange={e => {
                    setSelectedDataType(e.target.value);
                    fetchDataRecords(e.target.value);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 shadow-sm focus:outline-none focus:border-indigo-500 font-bold text-xs"
                >
                  <option value="">Choose category...</option>
                  <option value="REPORTS_SOP">SOP & Audit Documents (PDFs)</option>
                  <option value="CUTTING">Cutting Quality Reports</option>
                  <option value="INLINE">Sewing Defect / Inline Reports</option>
                  <option value="ENDLINE">Endline Quality Reports</option>
                  <option value="AQL">AQL Inspection Reports</option>
                  <option value="FINAL">Final Audit Reports</option>
                  <option value="MATERIAL">Material Reports</option>
                  <option value="WORKORDER">Workorders</option>
                </SearchableSelect>
              </div>

              {selectedDataType && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Records</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by Workorder, Title, Style..."
                      value={dataSearchQuery}
                      onChange={e => setDataSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 pl-9 text-xs font-bold"
                    />
                    <div className="absolute left-3 top-2.5 text-slate-400">
                      <Icon name="search" size={14} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {loadingRecords ? (
              <div className="text-center py-12 text-slate-400 flex flex-col items-center gap-3">
                <Icon name="refresh-cw" className="animate-spin text-indigo-600" size={24} />
                <span className="text-xs font-black uppercase tracking-widest">Retrieving ledger entries...</span>
              </div>
            ) : selectedDataType && dataRecords.length === 0 ? (
              <div className="text-center py-12 text-slate-400 italic">
                No records found for this category.
              </div>
            ) : selectedDataType ? (
              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                        {selectedDataType === 'REPORTS_SOP' && (
                          <>
                            <th className="p-4">Title</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Zone</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Link</th>
                            <th className="p-4 text-right">Action</th>
                          </>
                        )}
                        {selectedDataType === 'CUTTING' && (
                          <>
                            <th className="p-4">Workorder</th>
                            <th className="p-4">Bundle No</th>
                            <th className="p-4">Zone</th>
                            <th className="p-4">Checked Qty</th>
                            <th className="p-4">Rework</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-right">Action</th>
                          </>
                        )}
                        {selectedDataType === 'INLINE' && (
                          <>
                            <th className="p-4">Workorder</th>
                            <th className="p-4">Round</th>
                            <th className="p-4">Zone</th>
                            <th className="p-4">Checked</th>
                            <th className="p-4">Complaint</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-right">Action</th>
                          </>
                        )}
                        {selectedDataType === 'ENDLINE' && (
                          <>
                            <th className="p-4">Workorder</th>
                            <th className="p-4">Bundle</th>
                            <th className="p-4">Zone</th>
                            <th className="p-4">Pass Qty</th>
                            <th className="p-4">Rework</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-right">Action</th>
                          </>
                        )}
                        {selectedDataType === 'AQL' && (
                          <>
                            <th className="p-4">Workorder</th>
                            <th className="p-4">Zone</th>
                            <th className="p-4">Pass</th>
                            <th className="p-4">Failed</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-right">Action</th>
                          </>
                        )}
                        {selectedDataType === 'FINAL' && (
                          <>
                            <th className="p-4">Workorder</th>
                            <th className="p-4">Zone</th>
                            <th className="p-4">Audited</th>
                            <th className="p-4">Pass</th>
                            <th className="p-4">Rejected</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-right">Action</th>
                          </>
                        )}
                        {selectedDataType === 'MATERIAL' && (
                          <>
                            <th className="p-4">Date</th>
                            <th className="p-4">Supplier</th>
                            <th className="p-4">Remarks</th>
                            <th className="p-4 text-right">Action</th>
                          </>
                        )}
                        {selectedDataType === 'WORKORDER' && (
                          <>
                            <th className="p-4">WO Number</th>
                            <th className="p-4">Style</th>
                            <th className="p-4">Color</th>
                            <th className="p-4">Qty</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Zone</th>
                            <th className="p-4 text-right">Action</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                      {dataRecords
                        .filter(record => {
                          if (!dataSearchQuery) return true;
                          const q = dataSearchQuery.toUpperCase();
                          const valStr = JSON.stringify(record).toUpperCase();
                          return valStr.includes(q);
                        })
                        .slice(0, 100)
                        .map((record, index) => {
                          const dateStr = record.timestamp 
                            ? new Date(record.timestamp).toLocaleDateString()
                            : record.checkingDate || record.date || '-';
                            
                          return (
                            <tr key={record.id || index} className="hover:bg-slate-50 transition duration-150">
                              {selectedDataType === 'REPORTS_SOP' && (
                                <>
                                  <td className="p-4">{record.title || record.fileName || 'Untitled'}</td>
                                  <td className="p-4">{record.category || '-'}</td>
                                  <td className="p-4">{record.zone || 'ALL'}</td>
                                  <td className="p-4">{dateStr}</td>
                                  <td className="p-4">
                                    {record.attachmentUrl ? (
                                      <a href={getDirectViewUrl(record.attachmentUrl, record.driveFileId)} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">View PDF</a>
                                    ) : '-'}
                                  </td>
                                </>
                              )}
                              {selectedDataType === 'CUTTING' && (
                                <>
                                  <td className="p-4">{record.wo || record.workorderNumber}</td>
                                  <td className="p-4">{record.bundleNo}</td>
                                  <td className="p-4">{record.zone}</td>
                                  <td className="p-4">{record.checkedQty}</td>
                                  <td className="p-4">{record.reworkQty}</td>
                                  <td className="p-4">{dateStr}</td>
                                </>
                              )}
                              {selectedDataType === 'INLINE' && (
                                <>
                                  <td className="p-4">{record.wo || record.workorderNumber}</td>
                                  <td className="p-4">{record.round}</td>
                                  <td className="p-4">{record.zone}</td>
                                  <td className="p-4">{record.checkedQty}</td>
                                  <td className="p-4">{record.complaintPcs}</td>
                                  <td className="p-4">{dateStr}</td>
                                </>
                              )}
                              {selectedDataType === 'ENDLINE' && (
                                <>
                                  <td className="p-4">{record.wo || record.workorderNumber}</td>
                                  <td className="p-4">{record.bundleNo}</td>
                                  <td className="p-4">{record.zone}</td>
                                  <td className="p-4">{record.passQty}</td>
                                  <td className="p-4">{record.reworkQty}</td>
                                  <td className="p-4">{dateStr}</td>
                                </>
                              )}
                              {selectedDataType === 'AQL' && (
                                <>
                                  <td className="p-4">{record.wo || record.workorderNumber}</td>
                                  <td className="p-4">{record.zone}</td>
                                  <td className="p-4">{record.passQty}</td>
                                  <td className="p-4">{record.failedPieces}</td>
                                  <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${record.auditStatus === 'PASS' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                      {record.auditStatus}
                                    </span>
                                  </td>
                                  <td className="p-4">{dateStr}</td>
                                </>
                              )}
                              {selectedDataType === 'FINAL' && (
                                <>
                                  <td className="p-4">{record.wo || record.workorderNumber}</td>
                                  <td className="p-4">{record.zone}</td>
                                  <td className="p-4">{record.totalAudited}</td>
                                  <td className="p-4">{record.pass}</td>
                                  <td className="p-4">{record.rejected}</td>
                                  <td className="p-4">{dateStr}</td>
                                </>
                              )}
                              {selectedDataType === 'MATERIAL' && (
                                <>
                                  <td className="p-4">{record.checkingDate || record.date}</td>
                                  <td className="p-4">{record.supplier}</td>
                                  <td className="p-4 max-w-xs truncate">{record.remarks}</td>
                                </>
                              )}
                              {selectedDataType === 'WORKORDER' && (
                                <>
                                  <td className="p-4">{record.workorderNumber}</td>
                                  <td className="p-4">{record.style || record.STYLE_NAME}</td>
                                  <td className="p-4">{record.color || record.COLOR}</td>
                                  <td className="p-4">{record.quantity || record.orderQty}</td>
                                  <td className="p-4">
                                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px]">
                                      {record.status || 'CUTTING'}
                                    </span>
                                  </td>
                                  <td className="p-4">{record.zone || record.location}</td>
                                </>
                              )}
                              
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => handleDeleteRecord(record)}
                                  className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl transition duration-150"
                                  title="Delete record permanently"
                                >
                                  <Icon name="trash-2" size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 italic">
                Select a category from the dropdown above to view and manage recorded data.
              </div>
            )}

            {/* FACTORY RESET DANGER ZONE */}
            <div className="mt-8 bg-rose-50 p-6 rounded-xl border border-rose-200 space-y-4">
              <div className="flex items-start gap-3">
                <Icon name="alert-triangle" className="text-rose-600 mt-0.5 shrink-0" size={20} />
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-rose-900 uppercase tracking-widest">DANGER ZONE: FACTORY RESET</h4>
                  <p className="text-[10px] text-rose-700 leading-relaxed font-semibold">
                    This action will permanently delete ALL recorded data, inspections, zones, units, workers, and custom sheets across the connected spreadsheet.
                    Your spreadsheet will be reset to a brand-new pristine state so you can start clean from scratch.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFactoryReset}
                disabled={isResettingDb}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-xs tracking-wider py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Icon name={isResettingDb ? "refresh-cw" : "trash-2"} size={14} className={isResettingDb ? "animate-spin" : ""} />
                {isResettingDb ? "Resetting Database..." : "WIPE ALL DATA & RESET APP"}
              </button>
            </div>
          </div>
        )}

        {tab === 'logs' && (
          <div className="space-y-5 animate-fade-in">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-150">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-black text-slate-850 uppercase tracking-wider flex items-center gap-2">
                    <Icon name="file-text" size={18} className="text-indigo-600" />
                    System Audit & Activity Logs
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Google Sheet Sync
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Complete historical record of all administrative alterations, user registrations, and system configurations.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => fetchAdminLogs(true)}
                  disabled={loadingLogs}
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  title="Force refresh audit logs"
                >
                  <Icon name="refresh-cw" size={14} className={loadingLogs ? "animate-spin" : ""} />
                  <span>{loadingLogs ? "Refreshing..." : "Refresh"}</span>
                </button>

                <button
                  type="button"
                  onClick={exportLogsToCsv}
                  disabled={filteredLogs.length === 0}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-40"
                  title="Download all filtered audit logs as CSV file"
                >
                  <Icon name="download" size={14} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Filters bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
              {/* Search text */}
              <div className="relative">
                <Icon name="search" size={14} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={e => setLogSearch(e.target.value)}
                  placeholder="Search logs by action, detail, admin..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                />
              </div>

              {/* Module Filter */}
              <div>
                <select
                  value={selectedLogModule}
                  onChange={e => setSelectedLogModule(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                >
                  <option value="ALL">All Modules ({uniqueLogModules.length})</option>
                  {uniqueLogModules.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Admin Filter */}
              <div>
                <select
                  value={selectedLogAdmin}
                  onChange={e => setSelectedLogAdmin(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                >
                  <option value="ALL">All Admins ({uniqueLogAdmins.length})</option>
                  {uniqueLogAdmins.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Count Strip */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-1">
              <span>Showing {filteredLogs.length} of {adminLogs.length} logged activities</span>
              {loadingLogs && <span className="text-indigo-600 font-bold animate-pulse">Syncing Google Sheets...</span>}
            </div>

            {/* Table */}
            {loadingLogs && adminLogs.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="inline-block w-7 h-7 rounded-full border-3 border-indigo-200 border-t-indigo-600 animate-spin" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Google Sheets Activity Log...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-16 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <Icon name="file-text" size={28} className="mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-600">No activity logs found</p>
                <p className="text-[11px] text-slate-400">Try clearing or changing your search filters above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs max-h-[600px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100/90 text-slate-600 uppercase text-[10px] font-black tracking-wider sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-44">Date & Time</th>
                      <th className="p-3 w-28">Module</th>
                      <th className="p-3 w-36">Action</th>
                      <th className="p-3 min-w-[280px]">Details</th>
                      <th className="p-3 w-36">Admin User</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 bg-white">
                    {filteredLogs.map((log, idx) => {
                      const actionUpper = String(log.action || '').toUpperCase();
                      const isAdd = actionUpper.includes('ADD') || actionUpper.includes('CREATE') || actionUpper.includes('SAVE');
                      const isEdit = actionUpper.includes('EDIT') || actionUpper.includes('UPDATE');
                      const isDel = actionUpper.includes('DELETE') || actionUpper.includes('WIPE') || actionUpper.includes('RESET');

                      const actionBadge = isDel
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : isAdd
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isEdit
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200';

                      let formattedTime = log.timestamp;
                      try {
                        const d = new Date(log.timestamp);
                        if (!isNaN(d.getTime())) {
                          formattedTime = d.toLocaleDateString(undefined, {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          }) + ' ' + d.toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          });
                        }
                      } catch (e) {}

                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                            {formattedTime}
                          </td>
                          <td className="p-3 font-bold text-slate-700">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider border border-slate-200">
                              {log.module || 'SYSTEM'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${actionBadge}`}>
                              {log.action || 'ACTIVITY'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-800 font-medium leading-relaxed">
                            {log.details || '-'}
                          </td>
                          <td className="p-3 font-semibold text-slate-700">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                                {String(log.admin || 'S').charAt(0).toUpperCase()}
                              </div>
                              <span className="truncate">{log.admin || 'SYSTEM'}</span>
                            </div>
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
      </div>
    </div>
  );
};

export default AdminDashboard;
