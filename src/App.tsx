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

const App: React.FC = () => {
  const [view, setView] = useState<'splash' | 'login' | 'admin' | 'workorder' | 'user' | 'submodule'>('splash');
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [workorders, setWorkorders] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [selectedSubmodule, setSelectedSubmodule] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showSkip, setShowSkip] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isPermanentlyConnected, setIsPermanentlyConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [globalZone, setGlobalZone] = useState<string>('ALL');

  const triggerSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  const checkConnectivity = useCallback(async () => {
    try {
      const res = await api.run('api_ping') as any;
      setIsOnline(!!res?.success);
    } catch (e) {
      console.warn("Ping failed:", e);
      // Only set to offline if it's not a temporary configuration requirement
      setIsOnline(false);
    }
  }, []);

  useEffect(() => {
    checkConnectivity();
    const interval = setInterval(checkConnectivity, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [checkConnectivity]);

  const fetchData = useCallback(async (customZone?: string) => {
    if (!user || user.role === 'LOGIN') return null;
    
    setLoading(true);
    try {
      const zoneToFetch = customZone || (user.role === 'ADMIN' ? globalZone : user.location);
      const data = await api.run('api_getInitialData', { zone: zoneToFetch }) as any;
        if (data) {
          setUsers(Array.isArray(data.users) ? data.users : []);
          setWorkorders(Array.isArray(data.workorders) ? data.workorders : []);
        setConnectionError(null);
        return data;
      }
    } catch (e: any) {
      console.error("Fetch Data Error:", e);
      setConnectionError(e.message || "Failed to connect to Google Sheets");
    } finally {
      setLoading(false);
    }
    return null;
  }, [user?.userCode, user?.role, user?.location, globalZone]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchData();
    }
  }, [globalZone, fetchData, user?.role]);

  useEffect(() => {
    const handleShowConfig = () => setConnectionError("CONFIGURATION_MODE");
    window.addEventListener('SHOW_CONFIG', handleShowConfig);
    
    const initApp = async () => {
      setLoading(true);
      
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 15000); // 15s absolute fallback

      const skipTimer = setTimeout(() => {
        setShowSkip(true);
      }, 5000); // Show skip after 5s

      try {
        // Parallel fetch for speed
        const [srvConfig, initResult] = await Promise.allSettled([
          api.getServerConfig(),
          api.run('api_getInitialData', { zone: 'ALL' }),
          api.run('api_getUserSettings', 'GLOBAL')
        ]);

        if (srvConfig.status === 'fulfilled') {
          setIsPermanentlyConnected(!!srvConfig.value.hasGasUrl);
        }

        const globalSettings = initResult.status === 'fulfilled' ? (initResult as any).value : null;
        if (globalSettings && !Array.isArray(globalSettings)) { // api_getUserSettings returns object
           // If the 3rd promise was getUserSettings GLOBAL
        }

        // Re-read results properly
        let initialData: any = null;
        if (initResult.status === 'fulfilled') initialData = initResult.value;
        
        const allUsers = initialData?.users || [];
        setUsers(allUsers);

        // Fetch global settings specifically if not done in parallel or failed
        try {
           const s = await api.run('api_getUserSettings', 'GLOBAL');
           if (s) setSettings(s);
        } catch(e) {}

        const savedSession = localStorage.getItem('bqos_session');
        if (savedSession) {
          try {
            const session = JSON.parse(savedSession);
            setUser(session);
            const activeZone = session.location === 'SYSTEM' || !session.location ? 'ALL' : session.location;
            setGlobalZone(activeZone);
            
            if (session.role === 'ADMIN') setView('admin');
            else if (session.role === 'WORKORDER') setView('workorder');
            else setView('user');

            // Find fresh profile
            const fresh = allUsers.find((u: any) => u.userCode === session.userCode);
            if (fresh) {
               setUser(fresh);
               const [s, wos] = await Promise.allSettled([
                 api.run('api_getUserSettings', fresh.userCode),
                 api.run('api_getWorkorders', { zone: activeZone })
               ]);
               if (s.status === 'fulfilled') setSettings(s.value);
               if (wos.status === 'fulfilled') setWorkorders(wos.value || []);
            }
          } catch (e) {
            localStorage.removeItem('bqos_session');
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
    const activeZone = u.location === 'SYSTEM' || !u.location ? 'ALL' : u.location;
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
    const hasConnection = localStorage.getItem('VITE_GAS_URL') || isPermanentlyConnected;
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
            />
          </div>
        </div>
      );
    }

    switch (view) {
      case 'splash':
        return (
          <div className="splash-screen flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
            <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/20 animate-bounce">
              <Icon name="clipboard-check" size={48} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">BQOS <span className="text-indigo-500">APP</span></h1>
            
            {connectionError ? (
              <div className="max-w-md w-full animate-fade-in text-center">
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl mb-4">
                   <p className="text-rose-400 font-bold text-xs uppercase tracking-widest mb-2">Connection Error</p>
                   <p className="text-sm text-slate-300 font-medium">{connectionError}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => window.location.reload()}
                    className="w-full bg-white text-slate-900 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 flex items-center justify-center gap-2"
                  >
                    <Icon name="refresh-cw" size={14} />
                    Retry Connection
                  </button>
                  <button 
                    onClick={() => {
                       localStorage.removeItem('VITE_GAS_URL');
                       setConnectionError("CONFIGURATION_MODE");
                    }}
                    className="w-full bg-slate-800 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-700 flex items-center justify-center gap-2"
                  >
                    <Icon name="settings" size={14} />
                    Reset & Setup Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2.5 h-2.5 bg-indigo-500 rounded-full"
                    />
                  ))}
                </div>
                <div className="text-center space-y-4">
                  <div>
                    <p className="text-white font-black text-sm uppercase tracking-[0.3em] mb-1">
                      Connecting to System
                    </p>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                      Updating Cloud Spreadsheet
                    </p>
                  </div>

                  {showSkip && (
                    <button 
                      onClick={() => setLoading(false)}
                      className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors border border-indigo-500/30 bg-indigo-500/10 px-6 py-3 rounded-xl animate-fade-in"
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
          <div className="min-h-screen bg-slate-50 flex flex-col">
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
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50 shadow-sm">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                      <Icon name="clipboard-check" size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">BQOS <span className="text-indigo-600">APP</span></h1>
                        <div 
                          className={`w-2 h-2 rounded-full ${isOnline === true ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : isOnline === false ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-amber-400 animate-pulse'} transition-all`}
                          title={isOnline === true ? "Connected to Server" : isOnline === false ? "Disconnected" : "Checking Connection..."}
                        />
                      </div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Blossom Quality Operation System</p>
                    </div>
                  </div>
                <div className="flex items-center gap-2 md:gap-4">
                  {user?.role === 'ADMIN' && (
                    <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      {['ALL', ...(settings?.ZONE || ['KERALA', 'TAMILNADU', 'BANGLORE'])].map(z => (
                        <button
                          key={z}
                          onClick={() => setGlobalZone(z)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${globalZone === z ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          {z}
                        </button>
                      ))}
                    </div>
                  )}
                  {user?.role === 'ADMIN' && (
                    <button 
                      onClick={() => setConnectionError("CONFIGURATION_MODE")} 
                      className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all shadow-sm"
                      title="System Settings & Google Sheets Setup"
                    >
                      <Icon name="settings" size={18} />
                    </button>
                  )}
                  <button 
                    onClick={fetchData} 
                    disabled={loading}
                    className={`p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all shadow-sm ${loading ? 'animate-spin opacity-50' : ''}`}
                    title="Refresh Data"
                  >
                    <Icon name="refresh-cw" size={18} />
                  </button>
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{user?.username}</span>
                    <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">{user?.role} • {user?.location}</span>
                  </div>
                  <button onClick={handleLogout} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm">
                    <Icon name="log-out" size={18} />
                  </button>
                </div>
              </div>
              {user?.role === 'ADMIN' && (
                <div className="sm:hidden mt-2 bg-slate-100 p-1 rounded-xl flex items-center justify-around overflow-x-auto no-scrollbar">
                  {['ALL', ...(settings?.ZONE || ['KERALA', 'TAMILNADU', 'BANGLORE'])].map(z => (
                    <button
                      key={z}
                      onClick={() => setGlobalZone(z)}
                      className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all whitespace-nowrap ${globalZone === z ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      {z}
                    </button>
                  ))}
                </div>
              )}
            </header>

            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full animate-fade-in duration-500">
              {connectionError && (
                <ConnectionGuide 
                  error={connectionError === "CONFIGURATION_MODE" ? "User Configuration Mode" : connectionError} 
                  onClose={() => setConnectionError(null)} 
                  isPermanentlyConnected={isPermanentlyConnected}
                />
              )}

              {view === 'admin' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Admin <span className="text-indigo-600">Control</span></h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Active Sheet: {globalZone}</p>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => setView('workorder')} className="btn-secondary text-xs py-2 px-4 flex items-center gap-2"><Icon name="package" size={14} /> Workorders</button>
                    </div>
                  </div>
                  <AdminDashboard workorders={workorders} users={users} setUsers={setUsers} currentUser={user} refreshData={fetchData} triggerSuccess={triggerSuccess} globalZone={globalZone} />
                </div>
              )}
              {view === 'workorder' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Workorder <span className="text-indigo-600">Center</span></h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Active Sheet: {globalZone}</p>
                    </div>
                    <div className="flex gap-2">
                       {user?.role === 'ADMIN' && <button onClick={() => setView('admin')} className="btn-secondary text-xs py-2 px-4 flex items-center gap-2"><Icon name="shield" size={14} /> Admin</button>}
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Operation <span className="text-indigo-600">Dashboard</span></h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Zone: {globalZone}</p>
                    </div>
                    <div className="flex gap-2">
                       {user?.role === 'ADMIN' && <button onClick={() => setView('admin')} className="btn-secondary text-xs py-2 px-4 flex items-center gap-2"><Icon name="shield" size={14} /> Admin</button>}
                       {(user?.role === 'ADMIN' || user?.role === 'WORKORDER') && <button onClick={() => setView('workorder')} className="btn-secondary text-xs py-2 px-4 flex items-center gap-2"><Icon name="package" size={14} /> Workorders</button>}
                    </div>
                  </div>
                  <UserDashboard user={user} onSelectSubmodule={(id) => { setSelectedSubmodule(id); setView('submodule'); }} />
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
                />
              )}
            </main>

            <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">© 2026 BQOS APP • Blossom Quality Operation System • v2.0.0</p>
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
