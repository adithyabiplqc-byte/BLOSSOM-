import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { api } from './services/api';
import Icon from './components/Icon';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import WorkorderDashboard from './components/WorkorderDashboard';
import UserDashboard from './components/UserDashboard';
import SubmoduleContainer from './components/SubmoduleContainer';

import ConnectionGuide from './components/ConnectionGuide';
import { ZONES } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<'splash' | 'login' | 'admin' | 'workorder' | 'user' | 'submodule'>('splash');
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [workorders, setWorkorders] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [selectedSubmodule, setSelectedSubmodule] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showSkip, setShowSkip] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean | null>(true);
  const [isPermanentlyConnected, setIsPermanentlyConnected] = useState<boolean>(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [globalZone, setGlobalZone] = useState<string>('ALL');
  const [zoneMappings, setZoneMappings] = useState<any[]>([]);
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('bqos_theme');
  }, []);

  const getParsedSettingList = useCallback((keys: string[], defaultVal: string[] = []) => {
    if (!settings) return defaultVal;
    for (const key of keys) {
      const raw = settings[key] || settings[key.toUpperCase()] || settings[key.toLowerCase()];
      if (raw !== undefined && raw !== null) {
        if (typeof raw === 'string') {
          return raw.split('\n').map((s: string) => s.trim()).filter(Boolean);
        }
        if (Array.isArray(raw)) {
          return raw.map((s: any) => String(s).trim()).filter(Boolean);
        }
      }
    }
    return defaultVal;
  }, [settings]);

  const currentZones = React.useMemo(() => {
    if (zoneMappings && zoneMappings.length > 0) {
      const fromMap = zoneMappings
        .filter((z: any) => String(z.zone || '').trim())
        .map((z: any) => z.zone);
      const unique = Array.from(new Set(fromMap))
        .map((z: any) => String(z).toUpperCase().trim())
        .filter((z: string) => z && !z.startsWith('ZMAP-'));
      if (unique.length > 0) return unique;
    }
    const list = getParsedSettingList(['ZONE', 'ZONES'], ZONES);
    return list.filter((z: string) => z && !z.toUpperCase().startsWith('ZMAP-'));
  }, [zoneMappings, getParsedSettingList]);

  // Auto-select zone if exactly one zone exists, or reset if active globalZone was deleted
  useEffect(() => {
    if (currentZones.length === 1 && globalZone !== currentZones[0]) {
      setGlobalZone(currentZones[0]);
    } else if (globalZone !== 'ALL' && currentZones.length > 0 && !currentZones.includes(globalZone)) {
      setGlobalZone('ALL');
    }
  }, [currentZones, globalZone]);

  const triggerSuccess = (message: string) => {
    setSuccessMessage(message);
    fetchData();
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  const checkConnectivity = useCallback(async () => {
    try {
      const res = await api.run('api_ping') as any;
      setIsOnline(res?.success !== false);
    } catch (e) {
      console.warn("Ping failed:", e);
      setIsOnline(false);
    }
  }, []);

  useEffect(() => {
    checkConnectivity();
    const interval = setInterval(checkConnectivity, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [checkConnectivity]);

  const fetchData = useCallback(async (customZone?: string, silent: boolean = false) => {
    if (!user || user.role === 'LOGIN') return null;
    
    if (!silent) {
      setLoading(true);
    }
    try {
      const zoneToFetch = customZone || ((user.role === 'ADMIN' || user.zone === 'COMMON') ? globalZone : (user.zone || user.location));
      const data = await api.run('api_getInitialData', { zone: zoneToFetch, userCode: user?.userCode }) as any;
      if (data) {
        const freshUsers = Array.isArray(data.users) ? data.users : [];
        const freshWOs = Array.isArray(data.workorders) ? data.workorders : [];
        
        setUsers(prev => (JSON.stringify(prev) === JSON.stringify(freshUsers) ? prev : freshUsers));
        setWorkorders(prev => (JSON.stringify(prev) === JSON.stringify(freshWOs) ? prev : freshWOs));
        if (data.settings) {
          setSettings(prev => (JSON.stringify(prev) === JSON.stringify(data.settings) ? prev : data.settings));
        }
        if (!silent) {
          setConnectionError(null);
        }
        setIsOnline(true);
        return data;
      }
    } catch (e: any) {
      console.error("Fetch Data Error:", e);
      if (!silent) {
        setConnectionError(e.message || "Failed to connect to Google Sheets");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
    return null;
  }, [user?.userCode, user?.role, user?.location, user?.zone, globalZone]);

  // Background polling every 30 seconds to keep all modules in sync across all devices/tabs simultaneously
  useEffect(() => {
    if (!user || user.role === 'LOGIN') return;
    
    const pollInterval = setInterval(() => {
      fetchData(undefined, true);
    }, 30000);
    
    return () => clearInterval(pollInterval);
  }, [fetchData, user]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchData();
    }
  }, [globalZone, fetchData, user?.role]);

  // Keep logged-in user info in sync with fresh database updates (e.g., administrator restriction updates)
  useEffect(() => {
    if (user && users.length > 0) {
      const freshUser = users.find(u => u.userCode === user.userCode);
      if (freshUser) {
        if (JSON.stringify(freshUser.restrictions) !== JSON.stringify(user.restrictions) || 
            freshUser.canDownload !== user.canDownload || 
            freshUser.role !== user.role || 
            freshUser.username !== user.username ||
            freshUser.zone !== user.zone ||
            freshUser.location !== user.location) {
          setUser(freshUser);
          localStorage.setItem('bqos_session', JSON.stringify(freshUser));
        }
      }
    }
  }, [users, user?.userCode]);

  useEffect(() => {
    const handleShowConfig = () => setConnectionError("CONFIGURATION_MODE");
    window.addEventListener('SHOW_CONFIG', handleShowConfig);
    
    const initApp = async () => {
      setLoading(true);
      
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 25000); // 25s absolute fallback

      const skipTimer = setTimeout(() => {
        setShowSkip(true);
      }, 5000); // Show skip after 5s

      try {
        // 1. First fetch server config sequentially to obtain proper server configuration state
        const srvConfigVal = await api.getServerConfig();
        const hasUrl = !!srvConfigVal?.hasGasUrl;
        setIsPermanentlyConnected(hasUrl);
        if (hasUrl) {
          setIsOnline(true);
        }
        
        if (hasUrl && srvConfigVal.source !== 'hardcoded') {
          console.log("[SYSTEM] Connecting through custom GAS server proxy...");
        }

        // 2. Identify saved session before calling initial data so we can request for specific user settings immediately!
        const savedSession = localStorage.getItem('bqos_session');
        let session: any = null;
        let activeZone = 'ALL';
        let sessionUserCode = '';
        if (savedSession) {
          try {
            session = JSON.parse(savedSession);
            activeZone = session.zone || (session.location === 'SYSTEM' || !session.location ? 'ALL' : session.location);
            sessionUserCode = session.userCode || '';
          } catch (e) {
            localStorage.removeItem('bqos_session');
          }
        }

        // 3. Run initialization queries in a single direct backend operation! Let's pass userCode and zone to fetch everything parallelly!
        const [initResult, zmResult] = await Promise.allSettled([
          api.run('api_getInitialData', { zone: activeZone, userCode: sessionUserCode }),
          api.run('api_getZoneMappings')
        ]);

        let initialData: any = null;
        if (initResult.status === 'fulfilled') {
          initialData = initResult.value;
          setIsOnline(true);
        }

        if (zmResult.status === 'fulfilled' && Array.isArray(zmResult.value)) {
          setZoneMappings(zmResult.value);
        }
        
        let allUsers = initialData?.users || [];
        if (allUsers.length === 0) {
          allUsers = [
            { userCode: "U001", username: "user1", password: "pass1", role: "USER", location: "SYSTEM", restrictions: [], canDownload: true },
            { userCode: "A001", username: "admin", password: "admin123", role: "ADMIN", location: "SYSTEM", restrictions: [], canDownload: true },
            { userCode: "W001", username: "wo1", password: "123", role: "WORKORDER", location: "SYSTEM", restrictions: [], canDownload: true }
          ];
        }
        setUsers(allUsers);

        // Set global settings or user settings if returned by initial data!
        if (initialData?.settings) {
          setSettings(initialData.settings);
        } else {
          // Fallback settings query
          try {
            const s = await api.run('api_getUserSettings', sessionUserCode || 'GLOBAL');
            if (s) setSettings(s);
          } catch (e) {}
        }

        if (session) {
          setUser(session);
          setGlobalZone(activeZone);
          
          if (initialData?.workorders) {
            setWorkorders(initialData.workorders);
          }

          if (session.role === 'ADMIN') setView('admin');
          else if (session.role === 'WORKORDER') setView('workorder');
          else setView('user');

          // Sync fresh profile details if in the database
          const fresh = allUsers.find((u: any) => u.userCode === session.userCode);
          if (fresh) {
             setUser(fresh);
          }
        } else {
          setView('login');
        }
      } catch (e: any) {
        console.error("Initialization Error:", e);
        setConnectionError(e.message || "Initialization Failed");
        setView('login');
      } finally {
        clearTimeout(timeoutId);
        clearTimeout(skipTimer);
        setLoading(false);
      }
    };

    initApp();
    return () => window.removeEventListener('SHOW_CONFIG', handleShowConfig);
  }, []);

  const handleLogin = async (u: any) => {
    localStorage.setItem('bqos_session', JSON.stringify(u));
    setUser(u);
    const activeZone = u.zone || (u.location === 'SYSTEM' || !u.location ? 'ALL' : u.location);
    setGlobalZone(activeZone);
    
    if (u.role === 'ADMIN') setView('admin');
    else if (u.role === 'WORKORDER') setView('workorder');
    else setView('user');
    
    setLoading(true);
    try {
      const [initData, s] = await Promise.all([
        api.run('api_getInitialData', { zone: activeZone }),
        api.run('api_getUserSettings', u.userCode)
      ]);
      
      const data = initData as any;
      setUsers(data?.users || []);
      setWorkorders(data?.workorders || []);
      setSettings(s || {});
    } catch (e) {
      console.error("Login Data Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('bqos_session');
    setUser(null);
    // Keep users to allow login without refresh
    setWorkorders([]);
    setSettings(null);
    setGlobalZone('ALL');
    setView('login');
    setSelectedSubmodule('');
  };

  const renderView = () => {
    const hasConnection = localStorage.getItem('VITE_GAS_URL') || isPermanentlyConnected || localStorage.getItem('VITE_SPREADSHEET_ID');
    if (connectionError === 'CONFIGURATION_REQUIRED' || connectionError === 'CONFIGURATION_MODE' || (!hasConnection && view === 'splash' && !loading)) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-start justify-center pt-12 p-4">
          <div className="w-full max-w-2xl">
            <AdminDashboard 
              currentUser={{ role: 'ADMIN', username: 'CONFIG_MODE' }} 
              onLogout={() => {
                setConnectionError(null);
                if (view === 'splash' || !user) setView('login');
              }}
              configOnlyMode={true}
              settings={settings}
            />
          </div>
        </div>
      );
    }

    switch (view) {
      case 'splash':
        return (
          <div className="splash-screen flex flex-col items-center justify-center min-h-screen bg-white text-slate-800 p-6 relative overflow-hidden">
            {/* Cute ambient background circles */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-50 rounded-full blur-2xl opacity-70 pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-50 rounded-full blur-3xl opacity-80 pointer-events-none" />
            
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-100/40 rounded-full blur-xl scale-125 animate-pulse" />
              <div className="relative w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-100 animate-bounce">
                <Icon name="clipboard-check" size={48} className="text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl font-black tracking-tighter mb-2 text-slate-800">BQOS <span className="text-indigo-600 font-extrabold">APP</span></h1>
            
            {connectionError ? (
              <div className="max-w-md w-full animate-fade-in text-center relative z-10">
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl mb-4 text-rose-800">
                   <p className="text-rose-600 font-bold text-xs uppercase tracking-widest mb-2">Connection Error</p>
                   <p className="text-sm font-medium text-slate-600">{connectionError}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => window.location.reload()}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
                  >
                    <Icon name="refresh-cw" size={14} />
                    Retry Connection
                  </button>
                  <button 
                    onClick={async () => {
                       await api.disconnect();
                    }}
                    className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 flex items-center justify-center gap-2"
                  >
                    <Icon name="settings" size={14} />
                    Reset & Setup Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 relative z-10">
                <div className="flex gap-2.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4], y: [0, -4, 0] }}
                      transition={{ duration: 1.0, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                      className="w-3 h-3 bg-indigo-600 rounded-full"
                    />
                  ))}
                </div>
                <div className="text-center space-y-4">
                  <div>
                    <p className="text-slate-800 font-black text-xs uppercase tracking-[0.3em] mb-1 pl-1">
                      Connecting to System
                    </p>
                    <p className="text-indigo-650 font-black text-[9px] uppercase tracking-widest animate-pulse">
                      Updating Cloud Spreadsheet
                    </p>
                  </div>
            
                  {showSkip && (
                    <button 
                      onClick={() => setLoading(false)}
                      className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors border border-indigo-100 bg-indigo-50/50 px-6 py-2.5 rounded-xl animate-fade-in block mx-auto"
                    >
                      Continue anyway
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      case 'login':
        return (
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-200 relative">
            <Login onLogin={handleLogin} users={users} />
            {connectionError && (
              <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="max-w-2xl w-full">
                  <ConnectionGuide 
                    error={connectionError === "CONFIGURATION_MODE" ? "User Configuration Mode" : connectionError} 
                    onClose={() => setConnectionError(null)} 
                    isPermanentlyConnected={isPermanentlyConnected}
                  />
                </div>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sticky top-0 z-50 shadow-sm transition-colors duration-200">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                      <Icon name="clipboard-check" size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">BQOS <span className="text-indigo-600 dark:text-indigo-400">APP</span></h1>
                        <div 
                          className={`w-2 h-2 rounded-full ${isOnline === true ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : isOnline === false ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-amber-400 animate-pulse'} transition-all`}
                          title={isOnline === true ? "Connected to Server" : isOnline === false ? "Disconnected" : "Checking Connection..."}
                        />
                      </div>
                      <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Blossom Quality Operation System</p>
                    </div>
                  </div>
                </div>

                {/* CENTRAL DASHBOARD SWITCHER (ONLY ADMINS CAN SWITCH DASHBOARDS) */}
                {user && user.role === 'ADMIN' && (
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner border border-slate-200 dark:border-slate-700 justify-center">
                    {user?.role === 'ADMIN' && (
                      <button
                        onClick={() => { setView('admin'); setSelectedSubmodule(''); }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${view === 'admin' ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                      >
                        <Icon name="shield" size={12} />
                        Admin Panel
                      </button>
                    )}
                    <button
                      onClick={() => { setView('workorder'); setSelectedSubmodule(''); }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${view === 'workorder' ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                    >
                      <Icon name="package" size={12} />
                      Workorders
                    </button>
                    <button
                      onClick={() => { setView('user'); setSelectedSubmodule(''); }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${(view === 'user' || view === 'submodule') ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                    >
                      <Icon name="activity" size={12} />
                      Operations
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 md:gap-4 self-end md:self-auto">
                  {(user?.role === 'ADMIN' || user?.zone === 'COMMON') && currentZones.length > 0 && (
                    <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      {['ALL', ...currentZones].map(z => (
                        <button
                          key={z}
                          onClick={() => setGlobalZone(z)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${globalZone === z ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                          {z}
                        </button>
                      ))}
                    </div>
                  )}
                  {user?.role === 'ADMIN' && (
                    <button 
                      onClick={() => setConnectionError("CONFIGURATION_MODE")} 
                      className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
                      title="System Settings & Google Sheets Setup"
                    >
                      <Icon name="settings" size={18} />
                    </button>
                  )}

                  <button 
                    onClick={() => fetchData()} 
                    disabled={loading}
                    className={`p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm ${loading ? 'animate-spin opacity-50' : ''}`}
                    title="Refresh Data"
                  >
                    <Icon name="refresh-cw" size={18} />
                  </button>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{user?.username}</span>
                    <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                      {user?.role} • {user?.zone || user?.location}{user?.location && user?.zone && user?.location !== user?.zone ? ` - ${user.location}` : ''}
                    </span>
                  </div>
                  <button onClick={handleLogout} className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition-all shadow-sm">
                    <Icon name="log-out" size={18} />
                  </button>
                </div>
              </div>
              {(user?.role === 'ADMIN' || user?.zone === 'COMMON') && currentZones.length > 0 && (
                <div className="sm:hidden mt-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center justify-around overflow-x-auto no-scrollbar">
                  {['ALL', ...currentZones].map(z => (
                    <button
                      key={z}
                      onClick={() => setGlobalZone(z)}
                      className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all whitespace-nowrap ${globalZone === z ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}
                    >
                      {z}
                    </button>
                  ))}
                </div>
              )}
            </header>

            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full animate-fade-in duration-500">
              {connectionError && (connectionError === 'CONFIGURATION_REQUIRED' || connectionError === 'CONFIGURATION_MODE') ? (
                <ConnectionGuide 
                  error={connectionError === "CONFIGURATION_MODE" ? "User Configuration Mode" : connectionError} 
                  onClose={() => setConnectionError(null)} 
                  isPermanentlyConnected={isPermanentlyConnected}
                />
              ) : (
                connectionError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center justify-between mb-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center">
                        <Icon name="alert-triangle" size={16} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs uppercase tracking-wider">Sheets Sync Warning</h4>
                        <p className="text-xs text-rose-600/90 font-medium">{connectionError}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setConnectionError(null)}
                      className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
                    >
                      <Icon name="x" size={16} />
                    </button>
                  </div>
                )
              )}

              {view === 'admin' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase">Admin <span className="text-indigo-600 dark:text-indigo-400">Control</span></h2>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 italic">Active Sheet: {globalZone}</p>
                    </div>
                  </div>
                  <AdminDashboard workorders={workorders} users={users} setUsers={setUsers} currentUser={user} refreshData={fetchData} triggerSuccess={triggerSuccess} globalZone={globalZone} settings={settings} />
                </div>
              )}
              {view === 'workorder' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase">Workorder <span className="text-indigo-600 dark:text-indigo-400">Center</span></h2>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 italic">Active Sheet: {globalZone}</p>
                    </div>
                  </div>
                  <WorkorderDashboard 
                    workorders={workorders} 
                    setWorkorders={setWorkorders} 
                    user={user} 
                    settings={settings}
                    refreshData={fetchData} 
                    triggerSuccess={triggerSuccess} 
                    globalZone={globalZone} 
                  />
                </div>
              )}
              {view === 'user' && (
                <div className="space-y-6">
                  <UserDashboard 
                    user={user} 
                    onSelectSubmodule={(id) => { setSelectedSubmodule(id); setView('submodule'); }} 
                    workorders={workorders}
                    users={users}
                  />
                </div>
              )}
              {view === 'submodule' && (
                <SubmoduleContainer 
                  id={selectedSubmodule} 
                  user={user} 
                  settings={settings} 
                  workorders={workorders} 
                  users={users}
                  onBack={() => setView('user')} 
                  triggerSuccess={triggerSuccess}
                  globalZone={globalZone}
                  setGlobalZone={setGlobalZone}
                  onNavigate={(newSubId) => setSelectedSubmodule(newSubId)}
                  refreshData={fetchData}
                />
              )}
            </main>

            <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 px-4 text-center transition-colors duration-200">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">© 2026 BQOS APP • Blossom Quality Operation System • v2.0.0</p>
            </footer>
          </div>
        );
    }
  };

  return (
    <ErrorBoundary>
      {successMessage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/90 backdrop-blur-md animate-fade-in">
          <div className="text-center p-8 bg-white rounded-3xl shadow-2xl shadow-indigo-500/20 scale-110 animate-bounce">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-green-200">
              <Icon name="check" size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">Success!</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{successMessage}</p>
          </div>
        </div>
      )}
      {renderView()}
    </ErrorBoundary>
  );
};

export default App;
