import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import { ZONES, ROLES, MAIN_MODULES, SUBMODULES } from '../constants';
import Icon from './Icon';
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const PVC_RATIO = 85.6 / 53.98; // CR80 Standard

const CardTemplate = ({ card, settings, id }: { card: any, settings: any, id: string }) => (
  <div 
    id={id}
    className="bg-white text-slate-900 w-[1011px] h-[638px] flex flex-col p-12 relative overflow-hidden border border-slate-100"
    style={{ 
      fontFamily: '"Montserrat", sans-serif',
      boxSizing: 'border-box'
    }}
  >
    {/* Background Design Elements */}
    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600 rounded-full -mr-80 -mt-80 opacity-[0.07] z-0" />
    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-900 rounded-full -ml-40 -mb-40 opacity-[0.03] z-0" />
    <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] border-[40px] border-indigo-500/5 rounded-full -translate-x-1/2 -translate-y-1/2 z-0" />
    
    <div className="relative z-10 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
              <Icon name="shield-check" size={36} />
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tighter text-indigo-700 uppercase leading-none">{settings.companyName || 'TRACEABILITY SYSTEM'}</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.4em] mt-2 italic">{settings.slogan || 'PRODUCTION CONTROL UNIT'}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-slate-900 text-white px-6 py-2 text-sm font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-slate-900/10">
            SECURED ID CARD
          </div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">ISO CR80 STANDARD</p>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex items-center gap-20 flex-1">
        <div className="bg-white p-6 border-[3px] border-slate-100 rounded-[2.5rem] shadow-2xl relative">
          <div className="absolute -inset-1 border border-indigo-100 rounded-[2.6rem] opacity-50" />
          <QRCodeCanvas 
            value={card.cardNumber} 
            size={300} 
            level="H" 
            includeMargin={true}
            style={{ borderRadius: '1rem' }}
          />
        </div>
        
        <div className="space-y-10 flex-1">
          <div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-2">UNIQUE IDENTIFIER</p>
            <p className="text-8xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">{card.cardNumber}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-2">
              <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">ASSIGNED WORKORDER</p>
              <p className="text-2xl font-black text-slate-800 uppercase">{card.workorderNumber || 'UNASSIGNED'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">SYSTEM AUTHORITY</p>
              <p className="text-2xl font-black text-slate-800 uppercase">TRACE HUB OPS</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-10 border-t-2 border-slate-50 flex justify-between items-end">
        <div className="space-y-2 max-w-lg">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed italic">
            {settings.footerText || 'Scan this card at each production station to maintain real-time material and quality traceability.'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-1">
             {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 bg-indigo-600/20 rounded-full" />)}
          </div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic tracking-[0.2em]">Ver: 2026.QR.SEC</p>
        </div>
      </div>
    </div>
  </div>
);

interface AdminDashboardProps {
  users: any[];
  setUsers: (users: any[]) => void;
  currentUser: any;
  refreshData: () => Promise<void>;
  triggerSuccess: (message: string) => void;
  globalZone?: string;
  cards: any[];
  workorders: any[];
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
    <td className="p-3 text-slate-500">{u.location}</td>
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

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, setUsers, currentUser, refreshData, triggerSuccess, globalZone, cards, workorders }) => {
  const [tab, setTab] = useState('list');
  const [editingUserCode, setEditingUserCode] = useState('');
  const [restrictingUserCode, setRestrictingUserCode] = useState('');
  const [deletingUserCode, setDeletingUserCode] = useState('');
  
  const [newCardNumber, setNewCardNumber] = useState('');
  const [assignCardNum, setAssignCardNum] = useState('');
  const [assignWONum, setAssignWONum] = useState('');
  const [newWorkorder, setNewWorkorder] = useState({
    workorderNumber: '',
    customer: '',
    style: '',
    poNumber: '',
    quantity: '',
    deliveryDate: '',
    item: '',
    size: '',
    cupSize: '',
    color: '',
    cardNumber: '' // Added cardNumber to workorder state
  });
  const [printingCard, setPrintingCard] = useState<any>(null);
  const [cardSettings, setCardSettings] = useState({
    companyName: 'TRACEABILITY SYSTEM',
    slogan: 'PRODUCTION CONTROL UNIT',
    footerText: 'Scan at each station for real-time tracking.'
  });
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportingCard, setExportingCard] = useState<any>(null);

  const availableCards = React.useMemo(() => {
    return cards.filter(c => c.currentStatus === 'IDLE');
  }, [cards]);

  // Load global settings on mount or tab change
  React.useEffect(() => {
    if (tab === 'cards') {
      api.run('api_getUserSettings', 'GLOBAL_SYSTEM').then((s: any) => {
        if (s && s.CARD_CONFIG) {
          try {
            setCardSettings(JSON.parse(s.CARD_CONFIG[0]));
          } catch(e) {}
        }
      });
    }
  }, [tab]);

  const saveCardSettings = async () => {
    setIsSubmitting(true);
    try {
      await api.run('api_saveUserSettings', 'GLOBAL_SYSTEM', { 
        CARD_CONFIG: [JSON.stringify(cardSettings)] 
      });
      triggerSuccess('CARD SETTINGS SAVED');
    } catch (e) {
      alert('Error saving card settings');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDownloadPDF = async (card: any) => {
    setExportingCard(card);
    // Wait for state to propagate
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const element = document.getElementById(`pvc-export-template`);
    if (!element) {
      console.error("Export template not found");
      return;
    }
    
    setIsExporting(true);
    try {
      // 1. Wait for canvas/images to definitely be ready
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 2, // 2022px width, excellent for printing
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 53.98]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98);
      pdf.save(`TRACE_CARD_${card.cardNumber}.pdf`);
      triggerSuccess('PROFESSIONAL CARD DOWNLOADED');
    } catch (e) {
      console.error("PDF Export Error:", e);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsExporting(false);
      setExportingCard(null);
    }
  };

  const generateAndAssignCard = async () => {
    if (isLocked.current) return;
    isLocked.current = true;
    try {
      const num = 'C' + Math.floor(Math.random() * 90000 + 10000);
      const res = await api.run('api_saveCard', { cardNumber: num, currentStatus: 'IDLE' });
      if (res.success) {
        setNewWorkorder(prev => ({ ...prev, cardNumber: num }));
        triggerSuccess('NEW CARD GENERATED & LINKED');
      }
    } catch (e) {
      console.error(e);
    } finally {
      isLocked.current = false;
    }
  };

  const isLocked = useRef(false);
  
  const filteredUsers = React.useMemo(() => {
    const unique = users.filter((u, index, self) => 
      self.findIndex(t => t.userCode === u.userCode) === index
    );
    return unique.filter(u => 
      !globalZone || globalZone === 'ALL' || u.location === globalZone || u.location === 'SYSTEM'
    );
  }, [users, globalZone]);

  const editingUser = React.useMemo(() => users.find(u => u.userCode === editingUserCode), [users, editingUserCode]);
  const restrictingUser = React.useMemo(() => users.find(u => u.userCode === restrictingUserCode), [users, restrictingUserCode]);
  const deletingUser = React.useMemo(() => users.find(u => u.userCode === deletingUserCode), [users, deletingUserCode]);

  const [newUser, setNewUser] = useState({ 
    username: '', 
    password: '', 
    role: 'USER', 
    location: (globalZone && globalZone !== 'ALL') ? globalZone : ZONES[0] 
  });
  const [deleteReason, setDeleteReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync newUser location with globalZone when it changes
  React.useEffect(() => {
    if (globalZone && globalZone !== 'ALL') {
      setNewUser(prev => ({ ...prev, location: globalZone }));
    }
  }, [globalZone]);

  const INITIAL_USER_SETTINGS = {
    ZONE: ZONES.join('\n'),
    UNIT: 'UNIT A\nUNIT B\nUNIT C\nUNIT D',
    SUPPLIER: 'SUPPLIER A\nSUPPLIER B\nSUPPLIER C',
    ITEM: 'T-SHIRT\nPOLO\nHOODIE',
    COLOR: 'WHITE\nBLACK\nNAVY\nRED\nGREEN',
    SIZE: 'XS\nS\nM\nL\nXL\nXXL',
    DEFECTS: 'STAIN\nHOLE\nBROKEN STITCH\nSHADE VARIATION',
    OPERATIONS: 'FRONT ATTACH\nBACK ATTACH\nSLEEVE ATTACH',
    MACHINE: 'SNLS\nDNLS\nO/L\nF/L',
    WORKERS: 'WORKER 1\nWORKER 2\nWORKER 3\nWORKER 4'
  };

  const [selectedUserCode, setSelectedUserCode] = useState('');
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
    
    // Strict Lock: Both ref and state to be absolutely sure
    if (isLocked.current || isSubmitting) {
      console.warn("[Admin] Creation already in progress, blocking duplicate call.");
      return;
    }
    
    isLocked.current = true;
    setIsSubmitting(true);
    
    const cleanUsername = newUser.username.trim();
    const cleanPassword = newUser.password.trim();
    
    if (!cleanUsername || !cleanPassword) {
      isLocked.current = false;
      setIsSubmitting(false);
      return alert("Username and Password are required");
    }
    
    try {
      console.log("[Admin] Attempting to create user:", cleanUsername);
      
      // 1. Get fresh data from server to ensure we have the absolute latest user list
      // This prevents race conditions where two admins create users at once
      const serverUsers = await api.run('api_getUsers') as any[];
      const currentUsers = Array.isArray(serverUsers) ? serverUsers : users;
      
      const exists = currentUsers.some((u: any) => 
        u.username.toLowerCase() === cleanUsername.toLowerCase()
      );
      
      const pwdExists = currentUsers.some((u: any) => u.password === cleanPassword);

      if (exists) {
        alert(`Error: Username "${cleanUsername}" is already taken.`);
        setIsSubmitting(false);
        isLocked.current = false;
        return;
      }

      if (pwdExists) {
        alert(`Error: This password is already in use by another account. Please use a unique password.`);
        setIsSubmitting(false);
        isLocked.current = false;
        return;
      }
      
      // Calculate max code from the FULL server list, not just filtered ones
      const maxCode = currentUsers.reduce((max: number, u: any) => {
        const codeNum = parseInt(String(u.userCode || '').replace(/\D/g, '')) || 0;
        return codeNum > max ? codeNum : max;
      }, 0);
      
      const userCode = `U${String(maxCode + 1).padStart(3, '0')}`;
      console.log(`[Admin] Generated new user code: ${userCode}`);
      
      const u = { 
        ...newUser, 
        username: cleanUsername, 
        password: cleanPassword,
        userCode, 
        restrictions: [], 
        canDownload: true,
        createdAt: new Date().toISOString()
      };
      
      // 2. Perform server save
      const result = await api.run('api_saveUser', u);
      if (!result || result.success === false) {
        throw new Error(result?.error || "Server failed to save user");
      }
      
      // 3. Clear form IMMEDIATELY to prevent repeat submissions
      setNewUser({ username: '', password: '', role: 'USER', location: ZONES[0] });
      
      await refreshData();
      await logActivity('ADD USER', `Created user ${userCode} (${cleanUsername})`);
      
      triggerSuccess(`USER ${userCode} CREATED SUCCESSFULLY`);
      setTab('list');
    } catch (err: any) {
      console.error("[Admin] User Creation Failed:", err);
      alert(`Error adding user: ${err.message || 'Unknown error'}`);
      // Only reset lock on error if we want user to retry immediately
      isLocked.current = false;
    } finally {
      setIsSubmitting(false);
      // Wait a bit before releasing the REF lock to handle hardware bounce
      setTimeout(() => {
        isLocked.current = false;
      }, 1000);
    }
  };

  const handleUpdate = async () => {
    if (isLocked.current || !editingUser) return;
    const cleanUsername = editingUser.username.trim();
    if (!cleanUsername) return alert("Username is required");
    
    isLocked.current = true;
    setIsSubmitting(true);
    
    try {
      const updatedUser = { ...editingUser, username: cleanUsername };
      await api.run('api_updateUser', updatedUser);
      await refreshData();
      await logActivity('EDIT USER', `Updated user ${updatedUser.userCode}`);
      
      triggerSuccess(`USER UPDATED: ${updatedUser.userCode}`);
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
      await api.run('api_deleteUser', userCode);
      await refreshData();
      await logActivity('DELETE USER', `Deleted user ${userCode}. Reason: ${deleteReason}`);
      
      triggerSuccess(`USER DELETED: ${userCode}`);
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
    // 1. Optimistic Update - Update UI immediately
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

    // UPDATE LOCAL STATE IMMEDIATELY - NO DELAY
    setUsers(prev => prev.map(u => u.userCode === updatedUser.userCode ? updatedUser : u));

    // 2. Background Save (non-blocking)
    try {
      await api.run('api_updateUser', updatedUser);
      logActivity('RESTRICTION CHANGE', `Updated ${moduleId} for ${userToUpdate.userCode}`);
    } catch (err) {
      console.error("Save failed, reverting UI:", err);
      // Wait a moment before revert to avoid flickering if it was a transient error
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

  const handleAddCard = async () => {
    if (!newCardNumber) return;
    setIsSubmitting(true);
    try {
      if (cards.some(c => c.cardNumber === newCardNumber)) {
        alert("Card number already exists.");
        return;
      }
      await api.run('api_saveCard', { cardNumber: newCardNumber, currentStatus: 'IDLE' });
      setNewCardNumber('');
      await refreshData();
      triggerSuccess('NEW PVC CARD REGISTERED');
    } catch (e) {
      alert("Error saving card");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignCard = async () => {
    if (!assignCardNum || !assignWONum) return;
    setIsSubmitting(true);
    try {
      await api.run('api_updateCardStatus', assignCardNum, { workorderNumber: assignWONum, currentStatus: 'IDLE' });
      setAssignCardNum('');
      setAssignWONum('');
      await refreshData();
      triggerSuccess('WORKORDER ASSIGNED TO CARD');
    } catch (e) {
      alert("Error assigning card");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
        <div className="glass-card p-4 border-l-4 border-indigo-600 bg-white">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Users</p>
          <p className="text-3xl font-black text-slate-800">{users.length}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-purple-600 bg-white">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admins</p>
          <p className="text-3xl font-black text-slate-800">{users.filter(u => u.role === 'ADMIN').length}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-blue-600 bg-white">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operations</p>
          <p className="text-3xl font-black text-slate-800">{users.filter(u => u.role === 'USER').length}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-amber-600 bg-white">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">W/O Managers</p>
          <p className="text-3xl font-black text-slate-800">{users.filter(u => u.role === 'WORKORDER').length}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {[
          { id: 'list', label: 'User List', icon: 'users' },
          { id: 'add', label: 'Add User', icon: 'user-plus' },
          { id: 'edit', label: 'Edit User', icon: 'edit' },
          { id: 'restrictions', label: 'Restrictions', icon: 'shield-off' },
          { id: 'settings', label: 'User Data', icon: 'database' },
          { id: 'cards', label: 'PVC Cards', icon: 'credit-card' },
          { id: 'delete', label: 'Delete User', icon: 'user-minus' }
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id)} 
            className={`px-4 py-2 rounded-lg font-bold uppercase text-xs flex items-center gap-2 transition-all ${tab === t.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Icon name={t.icon} size={16} /> {t.label}
          </button>
        ))}
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
                  <th className="p-3">Location</th>
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
                <div className="bg-slate-50 p-3 rounded-xl border-2 border-dashed border-indigo-200 flex items-center justify-between group transition-all hover:bg-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                      <Icon name="fingerprint" size={16} />
                    </div>
                    <span className="font-mono text-indigo-600 font-black text-lg">
                      U{String(users.reduce((max, u) => {
                        const codeNum = parseInt(String(u.userCode || '').replace(/\D/g, '')) || 0;
                        return codeNum > max ? codeNum : max;
                      }, 0) + 1).padStart(3, '0')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-indigo-50 px-2 py-1 rounded-md">
                    <Icon name="check-circle-2" size={14} className="text-emerald-600 animate-bounce-in" />
                    <span className="text-[9px] text-emerald-600 uppercase font-black tracking-widest">Unique ID Verified</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Username</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Enter Username" 
                    value={newUser.username} 
                    onChange={e => setNewUser({...newUser, username: e.target.value.trim()})} 
                    className={`w-full pr-10 ${newUser.username && (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase()) ? 'border-rose-300' : 'border-emerald-300')}`}
                  />
                  {newUser.username && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase()) ? (
                        <Icon name="x-circle" size={18} className="text-rose-500" />
                      ) : (
                        <Icon name="check-circle-2" size={18} className="text-emerald-500 animate-bounce-in" />
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Unique Password</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Enter Unique Password" 
                    value={newUser.password} 
                    onChange={e => setNewUser({...newUser, password: e.target.value.trim()})} 
                    className={`w-full pr-10 ${newUser.password && (users.some(u => u.password === newUser.password) ? 'border-rose-300' : 'border-emerald-300')}`}
                  />
                  {newUser.password && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {users.some(u => u.password === newUser.password) ? (
                        <Icon name="x-circle" size={18} className="text-rose-500" />
                      ) : (
                        <Icon name="check-circle-2" size={18} className="text-emerald-500 animate-bounce-in" />
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">User Role</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Location / Zone</label>
                <select value={newUser.location} onChange={e => setNewUser({...newUser, location: e.target.value})}>
                  {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <button 
                type="button"
                onClick={handleAdd} 
                disabled={isSubmitting || !newUser.username || !newUser.password || users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase()) || users.some(u => u.password === newUser.password)}
                className={`btn-primary w-full text-xs font-black italic tracking-widest uppercase py-4 shadow-xl transition-all shadow-indigo-100 hover:scale-[1.02] disabled:opacity-50 disabled:grayscale`}
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
                    <input type="text" value={editingUser.username} onChange={e => {
                      const updated = { ...editingUser, username: e.target.value };
                      setUsers(users.map(u => u.userCode === updated.userCode ? updated : u));
                    }} />
                  </div>
                  <div>
                    <label>Password</label>
                    <input type="password" value={editingUser.password} onChange={e => {
                      const updated = { ...editingUser, password: e.target.value };
                      setUsers(users.map(u => u.userCode === updated.userCode ? updated : u));
                    }} />
                  </div>
                  <div>
                    <label>Role</label>
                    <select value={editingUser.role} onChange={e => {
                      const updated = { ...editingUser, role: e.target.value };
                      setUsers(users.map(u => u.userCode === updated.userCode ? updated : u));
                    }}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>Location</label>
                    <select value={editingUser.location} onChange={e => {
                      const updated = { ...editingUser, location: e.target.value };
                      setUsers(users.map(u => u.userCode === updated.userCode ? updated : u));
                    }}>
                      {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>
                  <button 
                    onClick={handleUpdate} 
                    disabled={isSubmitting}
                    className="btn-primary w-full text-xs font-black italic tracking-widest uppercase py-4 shadow-xl shadow-indigo-100 hover:scale-[1.02]"
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
                  {/* Download Switch */}
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
          <div className="space-y-6">
            <div className="max-w-xs">
              <label>Select User to Configure</label>
              <select 
                value={selectedUserCode} 
                onChange={e => fetchUserSettings(e.target.value)}
              >
                <option value="">Select a user...</option>
                {filteredUsers.map(u => (
                  <option key={u.userCode} value={u.userCode}>{u.username} ({u.userCode})</option>
                ))}
              </select>
            </div>

            {selectedUserCode && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
                {Object.keys(userSettings).map(key => (
                  <div key={key} className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{key} (One per line)</label>
                    <textarea 
                      rows={4} 
                      className="text-sm font-mono"
                      value={userSettings[key as keyof typeof userSettings]} 
                      onChange={e => setUserSettings({...userSettings, [key]: e.target.value})}
                    />
                  </div>
                ))}
                <div className="lg:col-span-3 pt-6 border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={handleSaveSettings} 
                    disabled={savingSettings}
                    className="btn-primary px-12 py-4"
                  >
                    {savingSettings ? 'SAVING CONFIG...' : 'SAVE USER CONFIGURATION'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}


        {tab === 'cards' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Card Global Settings */}
              <div className="lg:col-span-1 glass-card p-6 border-t-4 border-indigo-600 space-y-6">
                 <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                   <Icon name="settings" size={16} className="text-indigo-600" /> Card Design Settings
                 </h3>
                 <div className="space-y-4">
                   <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase">Company Name</label>
                     <input 
                       type="text" 
                       value={cardSettings.companyName}
                       onChange={e => setCardSettings({...cardSettings, companyName: e.target.value.toUpperCase()})}
                     />
                   </div>
                   <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase">Slogan / Department</label>
                     <input 
                       type="text" 
                       value={cardSettings.slogan}
                       onChange={e => setCardSettings({...cardSettings, slogan: e.target.value.toUpperCase()})}
                     />
                   </div>
                   <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase">Footer Instructions</label>
                     <textarea 
                       rows={2}
                       value={cardSettings.footerText}
                       onChange={e => setCardSettings({...cardSettings, footerText: e.target.value})}
                     />
                   </div>
                   <button 
                     onClick={saveCardSettings} 
                     disabled={isSubmitting}
                     className="w-full bg-indigo-50 text-indigo-600 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-100 transition-all"
                   >
                     {isSubmitting ? 'SAVING...' : 'Update Card Branding'}
                   </button>
                 </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card Registration */}
                  <div className="space-y-4 glass-card p-6 bg-white border border-slate-100">
                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                      <Icon name="plus-circle" size={16} /> Register Bulk Cards
                    </h3>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="ID (e.g. C001)" 
                        className="flex-1"
                        value={newCardNumber}
                        onChange={(e) => setNewCardNumber(e.target.value.toUpperCase())}
                      />
                      <button onClick={handleAddCard} disabled={isSubmitting || !newCardNumber} className="btn-primary whitespace-nowrap px-6 text-[10px] font-black italic">REGISTER</button>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase italic">Register empty cards for later assignment.</p>
                  </div>

                  {/* Card Assignment */}
                  <div className="space-y-4 glass-card p-6 bg-white border border-slate-100">
                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                      <Icon name="link" size={16} /> Quick Link WO
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={assignCardNum} onChange={(e) => setAssignCardNum(e.target.value)} className="text-[10px] font-black">
                        <option value="">Card ID</option>
                        {cards.filter(c => !c.workorderNumber).map(c => (
                          <option key={c.cardNumber} value={c.cardNumber}>{c.cardNumber}</option>
                        ))}
                      </select>
                      <select value={assignWONum} onChange={(e) => setAssignWONum(e.target.value)} className="text-[10px] font-black">
                        <option value="">Workorder</option>
                        {workorders.filter(wo => !cards.some(c => c.workorderNumber === wo.workorderNumber)).map(wo => (
                          <option key={wo.workorderNumber} value={wo.workorderNumber}>{wo.workorderNumber}</option>
                        ))}
                      </select>
                    </div>
                    <button onClick={handleAssignCard} disabled={isSubmitting || !assignCardNum || !assignWONum} className="w-full btn-primary py-2 text-[10px] font-black italic">LINK NOW</button>
                  </div>
                </div>

                {/* Cards List */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Card Registry ({cards.length})</h3>
                    {cards.length > 0 && (
                      <button 
                        onClick={() => alert("Batch download is currently processed one-by-one to maintain ISO print alignment.")}
                        className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:underline"
                      >
                        <Icon name="download-cloud" size={14} /> Batch Info
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cards.map(c => (
                      <div key={c.cardNumber} className="glass-card p-4 relative group hover:ring-2 hover:ring-indigo-200 transition-all">
                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDownloadPDF(c); }}
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                            title="Direct Download"
                          >
                            <Icon name="download" size={14} />
                          </button>
                          <button 
                            onClick={() => setPrintingCard(c)}
                            className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg"
                            title="Preview Design"
                          >
                            <Icon name="layout" size={14} />
                          </button>
                        </div>
                        <div className="mb-4">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Card ID</p>
                            <p className="text-2xl font-black text-slate-800">{c.cardNumber}</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-slate-400 uppercase">Assigned WO</span>
                              <span className="text-indigo-600">{c.workorderNumber || '---'}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-slate-400 uppercase">Stage</span>
                              <span className={`px-2 py-0.5 rounded text-[8px] ${c.currentStatus === 'IDLE' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-600 uppercase italic'}`}>{c.currentStatus}</span>
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

             {/* Export Template (Hidden from View) */}
             <div className="absolute -left-[9999px] top-0 pointer-events-none">
               {(exportingCard || printingCard || (cards.length > 0 ? cards[0] : null)) && (
                 <CardTemplate 
                    card={exportingCard || printingCard || cards[0]} 
                    settings={cardSettings} 
                    id="pvc-export-template" 
                 />
               )}
             </div>

             {/* Print Modal */}
             {printingCard && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 overflow-y-auto">
                  <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full space-y-8 animate-in zoom-in-95 shadow-2xl relative">
                     <button onClick={() => setPrintingCard(null)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400">
                        <Icon name="x" size={24} />
                     </button>

                     <div className="text-center space-y-2">
                        <h4 className="text-2xl font-black uppercase tracking-tight text-slate-800 italic">PVC Professional Design</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest tracking-[0.2em]">Ready for CR80 standard printing</p>
                     </div>
                     
                     <div className="flex flex-col items-center gap-8">
                        {/* THE ACTUAL PREVIEW */}
                        <div className="scale-[0.5] sm:scale-[0.8] origin-center shadow-2xl rounded-2xl overflow-hidden border border-slate-100 transform transition-transform">
                          <CardTemplate card={printingCard} settings={cardSettings} id="pvc-preview-template" />
                        </div>

                        <div className="w-full grid grid-cols-2 gap-4">
                           <button 
                             onClick={() => handleDownloadPDF(printingCard)} 
                             disabled={isExporting}
                             className="btn-primary py-5 flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] col-span-2 sm:col-span-1"
                           >
                             {isExporting ? <Icon name="refresh-cw" className="animate-spin" /> : <Icon name="download" size={20} />}
                             <span className="font-black uppercase text-sm tracking-widest">Download PDF</span>
                           </button>
                           <button 
                             onClick={() => window.print()} 
                             className="bg-slate-100 text-slate-500 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2 col-span-2 sm:col-span-1"
                           >
                             <Icon name="printer" size={20} /> Print Direct
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
             )}

        {tab === 'delete' && (
          <div className="space-y-6 max-w-md">
            <h2 className="text-xl font-bold text-rose-600">Delete User</h2>
            <div className="space-y-4">
              <div>
                <label>Select User to Delete</label>
                <select 
                  value={deletingUserCode} 
                  onChange={e => setDeletingUserCode(e.target.value)}
                  className="border-rose-200 focus:ring-rose-500 font-bold"
                >
                  <option value="">Select account to remove...</option>
                  {[...filteredUsers].sort((a,b) => a.username.localeCompare(b.username)).map(u => (
                    <option key={u.userCode} value={u.userCode}>{u.username.toUpperCase()} (Code: {u.userCode})</option>
                  ))}
                </select>
              </div>

              {deletingUser && (
                <div className="space-y-4 p-4 bg-rose-50 rounded-xl border border-rose-100 animate-in zoom-in-95">
                  <p className="text-sm text-rose-700">You are about to delete <strong>{deletingUser.username}</strong>. This action cannot be undone.</p>
                  <textarea 
                    placeholder="Reason for deletion..." 
                    className="bg-white border-rose-200 focus:ring-rose-500"
                    value={deleteReason}
                    onChange={e => setDeleteReason(e.target.value)}
                  />
                  <button 
                    onClick={confirmDelete} 
                    disabled={isSubmitting}
                    className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold hover:bg-rose-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'DELETING...' : 'CONFIRM DELETION'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
