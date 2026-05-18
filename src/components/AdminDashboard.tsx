import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import { ZONES, ROLES, MAIN_MODULES, SUBMODULES } from '../constants';
import Icon from './Icon';

interface AdminDashboardProps {
  users: any[];
  setUsers: (users: any[]) => void;
  currentUser: any;
  refreshData: () => Promise<void>;
  triggerSuccess: (message: string) => void;
  globalZone?: string;
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

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, setUsers, currentUser, refreshData, triggerSuccess, globalZone, workorders }) => {
  const [tab, setTab] = useState('list');
  const [editingUserCode, setEditingUserCode] = useState('');
  const [restrictingUserCode, setRestrictingUserCode] = useState('');
  const [deletingUserCode, setDeletingUserCode] = useState('');
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
  const [serverUrl, setServerUrl] = useState(localStorage.getItem('VITE_GAS_URL') || '');
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
    ITEMS: 'T-SHIRT\nPOLO\nHOODIE',
    COLOR: 'WHITE\nBLACK\nNAVY\nRED\nGREEN',
    SIZE: 'XS\nS\nM\nL\nXL\nXXL',
    CUPSIZE: 'B\nC\nD',
    DEFECTS: 'STAIN\nHOLE\nBROKEN STITCH\nSHADE VARIATION',
    OPERATION: 'FRONT ATTACH\nBACK ATTACH\nSLEEVE ATTACH',
    MACHINE: 'SNLS\nDNLS\nO/L\nF/L',
    WORKERS: 'WORKER 1\nWORKER 2\nWORKER 3\nWORKER 4',
    LINE: 'LINE 1\nLINE 2'
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
    
    if (isLocked.current || isSubmitting) return;
    
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
        alert(`Error: This password is already in use by another account.`);
        setIsSubmitting(false);
        isLocked.current = false;
        return;
      }
      
      const maxCode = currentUsers.reduce((max: number, u: any) => {
        const codeNum = parseInt(String(u.userCode || '').replace(/\D/g, '')) || 0;
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
      
      setNewUser({ username: '', password: '', role: 'USER', location: ZONES[0] });
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
      await api.run('api_deleteUser', userCode, deleteReason, currentUser.username);
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

    setUsers(prev => prev.map(u => u.userCode === updatedUser.userCode ? updatedUser : u));

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
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Username</label>
                <input 
                  type="text" 
                  placeholder="Enter Username" 
                  value={newUser.username} 
                  onChange={e => setNewUser({...newUser, username: e.target.value})} 
                />
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
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Location / Zone</label>
                <select value={newUser.location} onChange={e => setNewUser({...newUser, location: e.target.value})}>
                  {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <button 
                type="button"
                onClick={handleAdd} 
                disabled={isSubmitting || !newUser.username || !newUser.password}
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

        {tab === 'server' && (
          <div className="space-y-6 max-w-2xl animate-fade-in">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Icon name="server" size={24} className="text-indigo-600" />
              Backend Configuration
            </h2>
            <p className="text-sm text-slate-500 font-medium">Use this section to connect your application to your Google Sheets backend using the Google Apps Script Web App URL.</p>
            
            <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 space-y-6">
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Google Apps Script Connection</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Web App URL (Exec URL)</label>
                      <input 
                        type="text" 
                        value={serverUrl}
                        onChange={e => {
                          const val = e.target.value;
                          setServerUrl(val);
                          localStorage.setItem('VITE_GAS_URL', val.trim());
                        }}
                        placeholder="https://script.google.com/macros/s/.../exec"
                        className="w-full font-mono text-xs bg-slate-50"
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={async () => {
                          if (!serverUrl.trim()) return alert("Please enter a URL first");
                          setIsSubmitting(true);
                          try {
                            const res = await api.run('api_getInitialData');
                            if (res && res.success) {
                              alert("✅ Connection Successful! Server is responding.");
                            } else {
                              alert("❌ Server responded but returned an error: " + (res?.error || "Unknown error"));
                            }
                          } catch (e: any) {
                            alert("❌ Connection Failed: " + (e.message || "Could not reach server. Check URL and ensure it is deployed as 'Anyone'."));
                          } finally {
                            setIsSubmitting(false);
                          }
                        }}
                        disabled={isSubmitting}
                        className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3"
                      >
                        <Icon name="zap" size={16} /> Test Connection
                      </button>
                      
                      <button 
                        onClick={() => {
                          if (window.confirm("This will reload the app to sync with the new server URL. Continue?")) {
                            window.location.reload();
                          }
                        }}
                        className="bg-indigo-600 text-white px-6 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-200 flex-1 py-3"
                      >
                        Apply & Reload App
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3">
                   <Icon name="info" className="text-indigo-600 mt-0.5 shrink-0" size={18} />
                   <div className="space-y-2">
                     <p className="text-[11px] font-bold text-indigo-900 leading-relaxed uppercase tracking-tight">Deployment Guide:</p>
                     <ol className="text-[10px] text-indigo-700 list-decimal pl-4 space-y-1 font-medium">
                       <li>Open your Google Sheet and go to Extensions &gt; Apps Script</li>
                       <li>Paste the Backend Code (Code.gs)</li>
                       <li>Click Deploy &gt; New Deployment</li>
                       <li>Select "Web App" &gt; Execute as: "Me" &gt; Who has access: "Anyone"</li>
                       <li>Copy the Web App URL and paste it above</li>
                     </ol>
                   </div>
                </div>
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
      </div>
    </div>
  );
};

export default AdminDashboard;
