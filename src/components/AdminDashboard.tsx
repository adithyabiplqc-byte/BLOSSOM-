import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { ZONES, UNITS, ROLES, MAIN_MODULES, SUBMODULES } from '../constants';
import Icon from './Icon';
import { googleSignIn, logout, getAccessToken, auth } from '../services/auth';

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
  const [tab, setTab] = useState(configOnlyMode ? 'server' : 'list');
  const [editingUserCode, setEditingUserCode] = useState('');
  const [restrictingUserCode, setRestrictingUserCode] = useState('');
  const [deletingUserCode, setDeletingUserCode] = useState('');
  const isLocked = useRef(false);
  
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

  const editingUser = React.useMemo(() => users.find(u => u.userCode === editingUserCode), [users, editingUserCode]);
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
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [settingsSubTab, setSettingsSubTab] = useState<'hierarchy' | 'userwise'>('hierarchy');

  // Track Google Account state
  const [googleUser, setGoogleUser] = useState<any>(auth.currentUser);
  const [googleToken, setGoogleToken] = useState<string | null>(getAccessToken());
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setGoogleUser(user);
      setGoogleToken(getAccessToken());
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLinkingGoogle(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        if (triggerSuccess) {
          triggerSuccess(`Successfully connected to Google: ${res.user.email}`);
        } else {
          alert(`Connected: ${res.user.email}`);
        }
      }
    } catch (e: any) {
      alert("Failed to connect to Google account: " + (e.message || e));
    } finally {
      setIsLinkingGoogle(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await logout();
      setGoogleUser(null);
      setGoogleToken(null);
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

  React.useEffect(() => {
    if (tab === 'server' && serverUrl) {
      const checkStatus = async () => {
        try {
          const res = await api.run('api_getInitialData');
          if (res && res.success) setConnectionStatus('success');
        } catch (e) {}
      };
      checkStatus();
    }
  }, [tab]);

  // Sync newUser location with globalZone when it changes
  React.useEffect(() => {
    if (globalZone && globalZone !== 'ALL') {
      setNewUser(prev => ({ ...prev, zone: globalZone }));
    }
  }, [globalZone]);

  const INITIAL_USER_SETTINGS = {
    ZONE: ZONES.join('\n'),
    UNIT: 'UNIT A\nUNIT B\nUNIT C\nUNIT D',
    SUPPLIER: 'SUPPLIER A\nSUPPLIER B\nSUPPLIER C',
    ITEMS: 'T-SHIRT\nPOLO\nHOODIE',
    COLOR: 'WHITE\nBLACK\nNAVY\nRED\nGREEN',
    SIZE: 'XS\nS\nM\nL\nXL\nXXL',
    CUPSIZE: 'B\nC\nD',
    DEFECTS: 'STAIN\nHOLE\nBROKEN STITCH\nSHADE VARIATION',
    OPERATION: 'FRONT ATTACH\nBACK ATTACH\nSLEEVE ATTACH',
    MACHINE: 'SNLS\nDNLS\nO/L\nF/L',
    WORKERS: 'WORKER 1\nWORKER 2\nWORKER 3\nWORKER 4',
    LINE: 'LINE 1\nLINE 2',
    STYLE_NAME: 'STYLE A\nSTYLE B\nSTYLE C'
  };

  const [selectedUserCode, setSelectedUserCode] = useState('');
  const [isResettingDb, setIsResettingDb] = useState(false);

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

  const handleSaveZone = async () => {
    if (isSavingZone) return;
    if (!newZoneName.trim()) return alert("Please enter a zone name.");
    const isDup = zoneMappings.some(z => String(z.zone || '').toUpperCase() === newZoneName.trim().toUpperCase());
    if (isDup) return alert("Zone already exists.");
    
    setIsSavingZone(true);
    try {
      const res = await api.run('api_saveZoneMapping', {
        zone: newZoneName.trim().toUpperCase(),
        unit: '',
        worker: ''
      });
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

  const handleDeleteZone = async (zone: string) => {
    if (!window.confirm(`Are you sure you want to delete the zone "${zone}"? This will delete all units and workers in this zone, and delete their sheets.`)) return;
    try {
      await api.run('api_deleteZoneMapping', { zone });
      await fetchZoneMappings();
      await refreshData?.().catch(() => {});
      triggerSuccess?.(`Zone "${zone}" deleted successfully.`);
    } catch (e) {
      alert("Failed to delete zone: " + String(e));
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

  const uniqueZones = React.useMemo(() => {
    const fromMap = zoneMappings
      .filter(z => String(z.zone || '').trim())
      .map(z => z.zone);
    const combined = Array.from(new Set(fromMap));
    return combined
      .map(z => String(z).toUpperCase())
      .filter(z => !z.startsWith('ZMAP-'));
  }, [zoneMappings]);

  const currentZones = React.useMemo(() => {
    let zonesList: string[] = [];
    if (settings?.ZONE) {
      if (Array.isArray(settings.ZONE)) {
        zonesList = settings.ZONE;
      } else if (typeof settings.ZONE === 'string') {
        zonesList = settings.ZONE.split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean);
      }
    }
    const combined = [...zonesList, ...uniqueZones];
    const filtered = combined
      .map(z => String(z).toUpperCase())
      .filter(z => z && !z.startsWith('ZMAP-'));
    if (filtered.length === 0) {
      return Array.from(new Set(ZONES.map(z => String(z).toUpperCase()).filter(z => !z.startsWith('ZMAP-'))));
    }
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
  const [userSettings, setUserSettings] = useState(INITIAL_USER_SETTINGS);
  const [savingSettings, setSavingSettings] = useState(false);

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
    if (isLocked.current || !editingUser) return;
    const cleanUsername = editingUser.username.trim();
    if (!cleanUsername) return alert("Username is required");
    
    isLocked.current = true;
    setIsSubmitting(true);
    
    try {
      const serverUsers = await api.run('api_getUsers').catch(() => []) as any[];
      const currentUsers = Array.isArray(serverUsers) && serverUsers.length > 0 ? serverUsers : users;
      const exists = currentUsers.some((u: any) => 
        u?.userCode !== editingUser.userCode && String(u?.username || '').toLowerCase().trim() === cleanUsername.toLowerCase()
      );
      if (exists) {
        alert(`Error: Username "${cleanUsername}" is already taken by another user.`);
        setIsSubmitting(false);
        isLocked.current = false;
        return;
      }

      const updatedUser = { ...editingUser, username: cleanUsername, password: editingUser.password };
      if (!api.run) return;
      await api.run('api_updateUser', updatedUser);
      if (refreshData) await refreshData();
      await logActivity('EDIT USER', `Updated user ${updatedUser.userCode}`);
      if (triggerSuccess) triggerSuccess(`USER UPDATED: ${updatedUser.userCode}`);
      setEditingUserCode('');
      setTab('list');
    } catch (err) {
      alert("Error updating user");
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
    const restrictions = userToUpdate.restrictions || [];
    let updatedUser: any;

    if (moduleId === 'DOWNLOAD_RESTRICTION') {
      updatedUser = { ...userToUpdate, canDownload: !userToUpdate.canDownload };
    } else {
      const newRestrictions = restrictions.includes(moduleId)
        ? restrictions.filter((id: string) => id !== moduleId)
        : [...restrictions, moduleId];
      updatedUser = { ...userToUpdate, restrictions: newRestrictions };
    }

    setUsers && setUsers(prev => prev.map(u => u.userCode === updatedUser.userCode ? updatedUser : u));

    try {
      await api.run('api_updateUser', updatedUser);
      logActivity('RESTRICTION CHANGE', `Updated ${moduleId} for ${userToUpdate.userCode}`);
    } catch (err) {
      console.error("Save failed, reverting UI:", err);
      await refreshData();
    }
  };

  const fetchUserSettings = async (code: string) => {
    setSelectedUserCode(code);
    if (!code) {
      setUserSettings(INITIAL_USER_SETTINGS);
      return;
    }
    try {
      const settings = await api.run('api_getUserSettings', code);
      if (settings) {
        const formatted: any = {};
        Object.keys(INITIAL_USER_SETTINGS).forEach(key => {
          formatted[key] = Array.isArray(settings[key]) ? settings[key].join('\n') : '';
        });
        setUserSettings(formatted);
      } else {
        setUserSettings(INITIAL_USER_SETTINGS);
      }
    } catch (e) {
      console.error("Fetch Settings Error:", e);
      setUserSettings(INITIAL_USER_SETTINGS);
    }
  };

  const handleSaveSettings = async () => {
    if (!selectedUserCode) return alert("Select a user first");
    setSavingSettings(true);
    try {
      const settingsToSave: any = {};
      Object.keys(userSettings).forEach(key => {
        settingsToSave[key] = userSettings[key].split('\n').map((s: string) => s.trim()).filter((s: string) => s !== '');
      });
      await api.run('api_saveUserSettings', selectedUserCode, settingsToSave);
      await logActivity('DROPDOWN SETTINGS', `Updated settings for ${selectedUserCode}`);
      alert('Settings Saved Successfully');
    } catch (e) {
      alert('Error saving settings');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {[
          { id: 'list', label: 'User List', icon: 'users' },
          { id: 'add', label: 'Add User', icon: 'user-plus' },
          { id: 'edit', label: 'Edit User', icon: 'edit' },
          { id: 'restrictions', label: 'Restrictions', icon: 'shield-off' },
          { id: 'settings', label: 'User Data', icon: 'database' },
          { id: 'server', label: 'Server', icon: 'server' },
          { id: 'delete', label: 'Delete User', icon: 'user-minus' },
          { id: 'delete_data', label: 'Delete Data', icon: 'trash-2' }
        ].filter(t => !configOnlyMode || t.id === 'server').map(t => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id)} 
            className={`px-4 py-2 rounded-lg font-bold uppercase text-xs flex items-center gap-2 transition-all ${tab === t.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Icon name={t.icon} size={16} /> {t.label}
          </button>
        ))}
        {configOnlyMode && onLogout && (
          <button 
            onClick={onLogout}
            className="px-4 py-2 rounded-lg font-bold uppercase text-xs flex items-center gap-2 text-rose-500 hover:bg-rose-50 ml-auto"
          >
            <Icon name="log-out" size={16} /> Back to Login
          </button>
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
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Zone</label>
                <select 
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
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Location / Unit</label>
                <select 
                  value={newUser.location} 
                  onChange={e => setNewUser({...newUser, location: e.target.value})}
                >
                  <option value="">Select Unit...</option>
                  {getUnitsForZone(newUser.zone).map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
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
              <select 
                value={editingUserCode} 
                onChange={e => setEditingUserCode(e.target.value)}
              >
                <option value="">Select User Code...</option>
                {filteredUsers.map(u => (
                  <option key={u.userCode} value={u.userCode}>{u.userCode} - {u.username}</option>
                ))}
              </select>

              {editingUser && (
                <div className="space-y-3 pt-4 border-t border-slate-100 animate-fade-in">
                  <div>
                    <label>Username</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={editingUser.username} 
                        onChange={e => {
                          const updated = { ...editingUser, username: e.target.value };
                          setUsers && setUsers(prev => prev.map(u => u.userCode === updated.userCode ? updated : u));
                        }} 
                        className="pr-10"
                      />
                      {(editingUser.username || '').trim() !== '' && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                          {users.some(u => u.userCode !== editingUser.userCode && u.username.toLowerCase().trim() === (editingUser.username || '').toLowerCase().trim()) ? (
                            <Icon name="x-circle" size={18} className="text-rose-500" />
                          ) : (
                            <Icon name="check-circle" size={18} className="text-emerald-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {(editingUser.username || '').trim() !== '' && (
                      <p className={`text-[10px] mt-1 font-bold ${users.some(u => u.userCode !== editingUser.userCode && u.username.toLowerCase().trim() === (editingUser.username || '').toLowerCase().trim()) ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {users.some(u => u.userCode !== editingUser.userCode && u.username.toLowerCase().trim() === (editingUser.username || '').toLowerCase().trim()) ? '✕ Username already in use' : '✓ Username available'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label>Password</label>
                    <input type="password" value={editingUser.password} onChange={e => {
                      const updated = { ...editingUser, password: e.target.value };
                      setUsers && setUsers(prev => prev.map(u => u.userCode === updated.userCode ? updated : u));
                    }} />
                  </div>
                  <div>
                    <label>Role</label>
                    <select value={editingUser.role} onChange={e => {
                      const updated = { ...editingUser, role: e.target.value };
                      setUsers && setUsers(prev => prev.map(u => u.userCode === updated.userCode ? updated : u));
                    }}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>Zone</label>
                    <select value={editingUser.zone || ''} onChange={e => {
                      const nextZone = e.target.value;
                      const units = getUnitsForZone(nextZone);
                      const updated = { 
                        ...editingUser, 
                        zone: nextZone, 
                        location: units.length > 0 ? units[0] : '' 
                      };
                      setUsers && setUsers(prev => prev.map(u => u.userCode === updated.userCode ? updated : u));
                    }}>
                      <option value="">Select Zone...</option>
                      <option value="COMMON">COMMON (All Zones)</option>
                      {currentZones.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Location / Unit</label>
                    <select 
                      value={editingUser.location || ''} 
                      onChange={e => {
                        const updated = { ...editingUser, location: e.target.value };
                        setUsers && setUsers(prev => prev.map(u => u.userCode === updated.userCode ? updated : u));
                      }} 
                    >
                      <option value="">Select Unit...</option>
                      {getUnitsForZone(editingUser.zone || '').map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    onClick={handleUpdate} 
                    disabled={isSubmitting || !editingUser.username || users.some(u => u.userCode !== editingUser.userCode && u.username.toLowerCase().trim() === (editingUser.username || '').toLowerCase().trim())}
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
              <select 
                value={restrictingUserCode} 
                onChange={e => setRestrictingUserCode(e.target.value)}
              >
                <option value="">Select a user...</option>
                {filteredUsers.filter(u => u.role !== 'ADMIN').map(u => (
                  <option key={u.userCode} value={u.userCode}>{u.username.toUpperCase()} ({u.role}) - {u.userCode}</option>
                ))}
              </select>
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
                          className={`w-12 h-6 rounded-full transition-colors relative ${!(restrictingUser.restrictions || []).includes(m.id) ? 'bg-green-500' : 'bg-slate-200'} disabled:opacity-50`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${!(restrictingUser.restrictions || []).includes(m.id) ? 'left-7' : 'left-1'}`}></div>
                        </button>
                      </div>
                      
                      <div className="space-y-2 pl-6 border-l border-slate-100">
                        {SUBMODULES.filter(s => s.module === m.id).map(s => (
                          <div key={s.id} className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 font-medium">{s.name}</span>
                            <button 
                              onClick={() => toggleRestriction(restrictingUser, s.id)}
                              disabled={isSubmitting}
                              className={`w-10 h-5 rounded-full transition-colors relative ${!(restrictingUser.restrictions || []).includes(s.id) ? 'bg-indigo-400' : 'bg-slate-200'} disabled:opacity-50`}
                            >
                              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${!(restrictingUser.restrictions || []).includes(s.id) ? 'left-6' : 'left-1'}`}></div>
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
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Sub-tabs toggler inside User Data */}
            <div className="flex border-b border-slate-200 pb-px gap-6">
              <button
                type="button"
                onClick={() => setSettingsSubTab('hierarchy')}
                className={`pb-3 text-sm font-black uppercase tracking-wider transition-all border-b-2 ${
                  settingsSubTab === 'hierarchy'
                    ? 'border-indigo-600 text-indigo-600 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                1. Zone, Unit & Worker Setup
              </button>
              <button
                type="button"
                onClick={() => setSettingsSubTab('userwise')}
                className={`pb-3 text-sm font-black uppercase tracking-wider transition-all border-b-2 ${
                  settingsSubTab === 'userwise'
                    ? 'border-indigo-600 text-indigo-600 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                2. Userwise Dropbox Settings (Old Style)
              </button>
            </div>

            {settingsSubTab === 'hierarchy' && (
              <div className="space-y-6">
                {/* Zone, Unit & Worker Hierarchy Settings Panel */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Icon name="layers" size={20} className="text-indigo-600" />
                      Zone, Unit & Worker Hierarchy Dropbox Settings
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Manage the hierarchical association of zones, units, and workers. These configurations are persisted globally to the <strong>ZONE</strong> sheet, and individual unit-specific sheets.
                    </p>
                  </div>

                  {/* 3 Forms Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    
                    {/* Option 1: Add Zone */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                      <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block">Option 1: Add Zone</span>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Zone Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. KERALA, TIRUPUR" 
                            value={newZoneName}
                            onChange={e => setNewZoneName(e.target.value)}
                            className="bg-white border-slate-200"
                          />
                        </div>
                        <button 
                          onClick={handleSaveZone}
                          disabled={isSavingZone || !newZoneName.trim()}
                          className="btn-primary text-[10px] uppercase font-black py-3 mt-1 w-full"
                        >
                          {isSavingZone ? 'Adding Zone...' : 'Add Zone'}
                        </button>

                        <div className="pt-3 border-t border-slate-200">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Existing Zones ({uniqueZones.length})</span>
                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            {uniqueZones.map(zone => (
                              <div key={zone} className="flex justify-between items-center bg-white border border-slate-100 rounded-xl px-2.5 py-1.5">
                                <span className="text-[11px] font-bold text-slate-700">{zone}</span>
                                <button 
                                  onClick={() => handleDeleteZone(zone)}
                                  className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded-lg transition-colors"
                                  title={`Delete zone ${zone} and all its units`}
                                >
                                  <Icon name="trash-2" size={11} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Option 2: Add Unit */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                      <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block">Option 2: Add Unit</span>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Select Zone</label>
                          <select 
                            value={newUnitZone} 
                            onChange={e => setNewUnitZone(e.target.value)}
                            className="bg-white border-slate-200"
                          >
                            <option value="">Select Zone...</option>
                            {uniqueZones.map(z => (
                              <option key={z} value={z}>{z}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Unit Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. UNIT A, UNIT B" 
                            value={newUnitName}
                            onChange={e => setNewUnitName(e.target.value)}
                            className="bg-white border-slate-200"
                          />
                        </div>
                        <button 
                          onClick={handleSaveUnit}
                          disabled={isSavingUnit || !newUnitName.trim() || !newUnitZone}
                          className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-[10px] uppercase font-black py-3 mt-1 w-full"
                        >
                          {isSavingUnit ? 'Adding Unit...' : 'Add Unit'}
                        </button>

                        {newUnitZone && (
                          <div className="pt-3 border-t border-slate-200">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Units in {newUnitZone} ({getUnitsForZone(newUnitZone).length})</span>
                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                              {getUnitsForZone(newUnitZone).length === 0 ? (
                                <span className="text-[10px] text-slate-400 italic">No units registered in this zone yet.</span>
                              ) : (
                                getUnitsForZone(newUnitZone).map(unit => (
                                  <div key={unit} className="flex justify-between items-center bg-white border border-slate-100 rounded-xl px-2.5 py-1.5">
                                    <span className="text-[11px] font-medium text-slate-700">{unit}</span>
                                    <button 
                                      onClick={() => handleDeleteUnit(newUnitZone, unit)}
                                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded-lg transition-colors"
                                      title={`Delete unit ${unit} and all its workers`}
                                    >
                                      <Icon name="trash-2" size={11} />
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
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                      <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block">Option 3: Add Worker</span>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Select Zone</label>
                          <select 
                            value={newWorkerZone} 
                            onChange={e => {
                              const val = e.target.value;
                              setNewWorkerZone(val);
                              const units = getUnitsForZone(val);
                              setNewWorkerUnit(units.length > 0 ? units[0] : '');
                            }}
                            className="bg-white border-slate-200"
                          >
                            <option value="">Select Zone...</option>
                            {uniqueZones.map(z => (
                              <option key={z} value={z}>{z}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Select Unit</label>
                          <select 
                            value={newWorkerUnit} 
                            onChange={e => setNewWorkerUnit(e.target.value)}
                            className="bg-white border-slate-200"
                            disabled={!newWorkerZone}
                          >
                            <option value="">Select Unit...</option>
                            {getUnitsForZone(newWorkerZone).map(u => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Worker Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. JOHN SMITH" 
                            value={newWorkerName}
                            onChange={e => setNewWorkerName(e.target.value)}
                            className="bg-white border-slate-200"
                            disabled={!newWorkerUnit}
                          />
                        </div>
                        <button 
                          onClick={handleSaveWorker}
                          disabled={isSavingWorker || !newWorkerName.trim() || !newWorkerZone || !newWorkerUnit}
                          className="btn-primary bg-amber-600 hover:bg-amber-700 text-[10px] uppercase font-black py-3 mt-1 w-full"
                        >
                          {isSavingWorker ? 'Adding Worker...' : 'Add Worker'}
                        </button>

                        {newWorkerZone && newWorkerUnit && (
                          <div className="pt-3 border-t border-slate-200">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Workers in {newWorkerUnit} ({getWorkersForUnit(newWorkerZone, newWorkerUnit).length})</span>
                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                              {getWorkersForUnit(newWorkerZone, newWorkerUnit).length === 0 ? (
                                <span className="text-[10px] text-slate-400 italic">No workers mapped to this unit yet.</span>
                              ) : (
                                getWorkersForUnit(newWorkerZone, newWorkerUnit).map(worker => (
                                  <div key={worker} className="flex justify-between items-center bg-white border border-slate-100 rounded-xl px-2.5 py-1.5">
                                    <span className="text-[11px] font-mono text-slate-600">{worker}</span>
                                    <button 
                                      onClick={() => handleDeleteWorker(newWorkerZone, newWorkerUnit, worker)}
                                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded-lg transition-colors"
                                      title={`Delete worker ${worker}`}
                                    >
                                      <Icon name="trash-2" size={11} />
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

                  {/* Grouped Hierarchy Table */}
                  <div className="pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                        Current Sheet Mappings ({zoneMappings.length})
                      </h4>
                      <button 
                        onClick={fetchZoneMappings}
                        className="text-[10px] uppercase font-bold text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <Icon name="refresh-cw" size={12} className={loadingZoneMappings ? 'animate-spin' : ''} />
                        Refresh
                      </button>
                    </div>

                    <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                          <tr>
                            <th className="p-3">Zone</th>
                            <th className="p-3">Unit</th>
                            <th className="p-3">Worker / Operator</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {zoneMappings.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                                No custom hierarchies mapped yet in the ZONE and Unit-specific sheets.
                              </td>
                            </tr>
                          ) : (
                            zoneMappings.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3 font-bold text-slate-700">{item.zone}</td>
                                <td className="p-3 text-slate-600">{item.unit || <span className="text-slate-300 italic">- None -</span>}</td>
                                <td className="p-3 font-mono text-slate-500">{item.worker || <span className="text-slate-300 italic">- None -</span>}</td>
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
              </div>
            )}

            {settingsSubTab === 'userwise' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Icon name="database" size={20} className="text-indigo-600" />
                    User Wise Settings (Dropdown Options)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Configure standard drop-down options for individual users or system-wide global values. Note that <strong>Zone</strong>, <strong>Unit</strong>, and <strong>Workers</strong> are managed dynamically through the Zone, Unit & Worker Setup module.
                  </p>
                </div>

                <div className="max-w-xs">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Select User to Configure</label>
                  <select 
                    value={selectedUserCode} 
                    onChange={e => fetchUserSettings(e.target.value)}
                    className="bg-white border-slate-200 w-full rounded-xl"
                  >
                    <option value="">Select Target...</option>
                    <option value="GLOBAL">🌐 SYSTEM GLOBAL SETTINGS</option>
                    {filteredUsers.map(u => (
                      <option key={u.userCode} value={u.userCode}>{u.username} ({u.userCode})</option>
                    ))}
                  </select>
                </div>

                {selectedUserCode && (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Settings Categories (Grouped & Collapsed by Default)
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setOpenGroups(['product', 'factory', 'workshop', 'defects'])}
                          className="text-[10px] uppercase font-black tracking-widest bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-indigo-600 hover:bg-slate-50 transition-colors"
                        >
                          Expand All
                        </button>
                        <button 
                          onClick={() => setOpenGroups([])}
                          className="text-[10px] uppercase font-black tracking-widest bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                          Collapse All
                        </button>
                      </div>
                    </div>

                    {[
                      {
                        id: 'product',
                        name: 'Product Details (Styles, Sizes, Items, Colors)',
                        keys: ['STYLE_NAME', 'SIZE', 'CUPSIZE', 'COLOR', 'ITEMS'],
                        icon: 'shirt'
                      },
                      {
                        id: 'factory',
                        name: 'Factory Organization (Lines Only)',
                        keys: ['LINE'],
                        icon: 'milestone'
                      },
                      {
                        id: 'workshop',
                        name: 'Workshop Floor (Machines, Operations Only)',
                        keys: ['MACHINE', 'OPERATION'],
                        icon: 'wrench'
                      },
                      {
                        id: 'defects',
                        name: 'Quality Controls (Defects, Suppliers)',
                        keys: ['DEFECTS', 'SUPPLIER'],
                        icon: 'shield-alert'
                      }
                    ].map(group => {
                      const isOpen = openGroups.includes(group.id);
                      return (
                        <div key={group.id} className="border border-slate-150 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenGroups(prev => 
                                prev.includes(group.id) ? prev.filter(id => id !== group.id) : [...prev, group.id]
                              );
                            }}
                            className="w-full text-left p-4 bg-slate-50 flex items-center justify-between border-b border-slate-100 font-bold text-slate-700 hover:bg-slate-100/70 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Icon name={group.icon} size={18} className="text-indigo-600 shrink-0" />
                              <span className="text-xs sm:text-sm font-black tracking-wide uppercase text-slate-700">{group.name}</span>
                            </div>
                            <Icon name={isOpen ? "chevron-up" : "chevron-down"} size={16} className="text-slate-400" />
                          </button>

                          {isOpen && (
                            <div className="p-6 bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                              {group.keys.map(key => (
                                <div key={key} className="space-y-2">
                                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                                    <span>{key.replace('_', ' ')} (One per line)</span>
                                    <span className="text-indigo-600 font-mono text-[10px]">
                                      ({(userSettings[key as keyof typeof userSettings] ? String(userSettings[key as keyof typeof userSettings]).split('\n').filter(Boolean).length : 0)} items)
                                    </span>
                                  </label>
                                  <textarea 
                                    rows={6} 
                                    className="text-sm font-mono border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl w-full"
                                    value={userSettings[key as keyof typeof userSettings] || ''} 
                                    onChange={e => setUserSettings({...userSettings, [key]: e.target.value})}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                      <button 
                        onClick={handleSaveSettings} 
                        disabled={savingSettings}
                        className="btn-primary px-12 py-4"
                      >
                        {savingSettings ? 'SAVING CONFIG...' : 'SAVE CONFIGURATION'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'server' && (
          <div className="space-y-6 max-w-2xl animate-fade-in">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Icon name="server" size={24} className="text-indigo-600" />
              Backend Configuration
            </h2>
            <p className="text-sm text-slate-500 font-medium">Use this section to connect your application to your Google Sheets backend using the Google Apps Script Web App URL.</p>
            
            <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 space-y-6">
              <div className="space-y-6">
                {/* SERVER 1: SHEETS DATA SYNC */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-black">1</span>
                      <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Server 1: Google Sheets Connection (Data Sync)</h3>
                    </div>
                    {connectionStatus === 'success' && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 animate-fade-in">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Live Connected</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-1">Web App URL (Exec URL)</label>
                    <input 
                      type="text" 
                      value={serverUrl}
                      onChange={e => {
                        const val = e.target.value;
                        setServerUrl(val);
                        localStorage.setItem('VITE_GAS_URL', val.trim());
                        setConnectionStatus('idle');
                      }}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="w-full font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2"
                    />
                  </div>
                </div>

                {/* SERVER 2: GOOGLE DRIVE CONNECTION (OAUTH) */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-black">2</span>
                      <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Server 2: Google Drive Connection</h3>
                    </div>
                    {googleUser && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 animate-fade-in">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Connected</span>
                      </div>
                    )}
                  </div>

                  <div className={`p-4 rounded-xl border transition duration-155 ${
                    googleUser 
                      ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950' 
                      : 'bg-indigo-50/70 border-indigo-100 text-indigo-950'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">{googleUser ? '🟢' : '⚡'}</span>
                        <div className="space-y-1">
                          <span className="font-extrabold text-xs uppercase tracking-wider block">
                            {googleUser ? 'Google Drive Link: ACTIVE' : 'Connect Your Google Drive'}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium block leading-relaxed">
                            {googleUser 
                              ? <>Connected Account: <strong className="text-emerald-700 font-black">{googleUser.email}</strong>. Files will upload to your Google Drive.</>
                              : 'Connect to your Google/Gmail account to automatically publish SOPs directly into your Google Drive folder.'
                            }
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center justify-start sm:justify-end">
                        {googleUser ? (
                          <button
                            type="button"
                            onClick={handleGoogleSignOut}
                            className="text-[10px] font-black uppercase tracking-wider bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200 transition-all cursor-pointer shadow-2xs"
                          >
                            Disconnect
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isLinkingGoogle}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                          >
                            {isLinkingGoogle ? (
                              <>
                                <Icon name="loader" size={11} className="animate-spin" />
                                Connecting...
                              </>
                            ) : (
                              <>
                                🔑 Google Drive Connect
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button 
                    onClick={async () => {
                      if (!serverUrl.trim()) return alert("Please enter the server 1 URL first");
                      setIsSubmitting(true);
                      setConnectionStatus('idle');
                      try {
                        localStorage.setItem('VITE_GAS_URL', serverUrl.trim());
                        
                        // Sync to Firestore/Server permanently
                        const spreadsheetId = localStorage.getItem('VITE_SPREADSHEET_ID') || "";
                        await api.saveServerConfig(serverUrl.trim(), spreadsheetId, driveServerUrl.trim());
                        
                        const res = await api.run('api_getInitialData');
                        if (res && res.success) {
                          setConnectionStatus('success');
                          if (configOnlyMode && onLogout) {
                            triggerSuccess && triggerSuccess("SERVER CONNECTION ESTABLISHED! SYNCHRONIZING...");
                            setTimeout(() => onLogout(), 1500);
                          } else {
                            alert("✅ Server Connection Saved & Synchronized!");
                          }
                        } else {
                          setConnectionStatus('error');
                          alert("❌ Server Error: " + (res?.error || "Unknown"));
                        }
                      } catch (e: any) {
                        setConnectionStatus('error');
                        alert("❌ Failed: " + (e.message || "Connection Error"));
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    disabled={isSubmitting}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 shadow-lg shadow-indigo-200"
                  >
                    <Icon name={isSubmitting ? "refresh-cw" : "zap"} size={16} className={isSubmitting ? "animate-spin" : ""} />
                    {isSubmitting ? "Connecting Server..." : "Save & Sync Server"}
                  </button>
                  
                  {!configOnlyMode && (
                    <button 
                      onClick={() => window.confirm("Reload app to sync?") && window.location.reload()}
                      className="btn-secondary flex-1 py-3"
                    >
                      Manual Reload
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3">
                   <Icon name="info" className="text-indigo-600 mt-0.5 shrink-0" size={18} />
                   <div className="space-y-2">
                     <p className="text-[11px] font-bold text-indigo-900 leading-relaxed uppercase tracking-tight">Deployment & Permanent Connection:</p>
                     <ol className="text-[10px] text-indigo-700 list-decimal pl-4 space-y-1 font-medium">
                       <li>Open your Google Sheet and go to Extensions &gt; Apps Script</li>
                       <li>Paste the Backend Code (Code.gs)</li>
                       <li>Click Deploy &gt; New Deployment</li>
                       <li>Select "Web App" &gt; Execute as: "Me" &gt; Who has access: "Anyone"</li>
                       <li>Copy the Web App URL and paste it above</li>
                       <li className="text-indigo-900 font-bold">For a permanent connection, set the VITE_GAS_URL environment variable in your server settings.</li>
                     </ol>
                   </div>
                </div>

                {/* FACTORY RESET DANGER ZONE */}
                <div className="bg-rose-50 p-6 rounded-xl border border-rose-200 space-y-4">
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
                <select 
                  value={deletingUserCode} 
                  onChange={e => setDeletingUserCode(e.target.value)}
                  className="border-rose-200 focus:ring-rose-500"
                >
                  <option value="">Choose account...</option>
                  {filteredUsers.filter(u => u.username !== currentUser.username).map(u => (
                    <option key={u.userCode} value={u.userCode}>{u.username.toUpperCase()} ({u.userCode})</option>
                  ))}
                </select>
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
                <select
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
                </select>
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
                                      <a href={record.attachmentUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">View PDF</a>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
