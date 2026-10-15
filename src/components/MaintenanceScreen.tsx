import React, { useState, useEffect } from 'react';
import Icon from './Icon';

export interface MaintenanceLogEntry {
  timestamp: string;
  module?: string;
  action?: string;
  details: string;
  admin?: string;
}

interface MaintenanceScreenProps {
  maintenance?: {
    enabled?: boolean;
    message?: string;
    setAt?: string;
    setBy?: string;
    logs?: MaintenanceLogEntry[];
  };
  maintenanceLogs?: MaintenanceLogEntry[];
  onCheckStatus: () => Promise<void>;
  onAdminLogin?: (user: any) => void;
  onTurnOnApp?: () => Promise<void> | void;
  onGoToAdmin?: () => void;
  onLogout?: () => void;
  currentUser?: any;
  users?: any[];
  isChecking?: boolean;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  maintenance,
  maintenanceLogs: propLogs,
  onCheckStatus,
  onAdminLogin,
  onTurnOnApp,
  onGoToAdmin,
  onLogout,
  currentUser,
  users = [],
  isChecking = false
}) => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isResuming, setIsResuming] = useState(false);
  const [activeTab, setActiveTab] = useState<'notice' | 'logs'>('notice');
  const [logs, setLogs] = useState<MaintenanceLogEntry[]>(() => {
    if (propLogs && propLogs.length > 0) return propLogs;
    if (maintenance?.logs && maintenance.logs.length > 0) return maintenance.logs;
    try {
      const cached = localStorage.getItem('bqos_maintenance_logs');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const isAdmin = currentUser?.role === 'ADMIN';

  // Fetch fresh maintenance logs
  useEffect(() => {
    const fetchFreshLogs = async () => {
      try {
        const res = await fetch('/api/system/maintenance');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.logs) && data.logs.length > 0) {
            setLogs(data.logs);
            try { localStorage.setItem('bqos_maintenance_logs', JSON.stringify(data.logs)); } catch (e) {}
          }
        }
      } catch (e) {}
    };

    fetchFreshLogs();
    const interval = setInterval(fetchFreshLogs, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    const cleanUser = adminUsername.trim().toLowerCase();
    const cleanPass = adminPassword;

    // Hardcoded master admin fallback
    if (cleanUser === 'admin' && cleanPass === 'admin123') {
      if (onAdminLogin) {
        onAdminLogin({
          userCode: 'A001',
          username: 'admin',
          role: 'ADMIN',
          location: 'SYSTEM',
          restrictions: []
        });
      }
      return;
    }

    // Match against user list for admin role
    const found = users.find(u => 
      String(u.username || '').trim().toLowerCase() === cleanUser &&
      String(u.password || '') === cleanPass &&
      String(u.role || '').toUpperCase() === 'ADMIN'
    );

    if (found) {
      if (onAdminLogin) onAdminLogin(found);
    } else {
      setAdminError('Invalid administrator credentials.');
    }
  };

  const formattedDate = React.useMemo(() => {
    if (!maintenance?.setAt) return null;
    try {
      const d = new Date(maintenance.setAt);
      return d.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch (e) {
      return maintenance.setAt;
    }
  }, [maintenance?.setAt]);

  const handleTurnOn = async () => {
    if (onTurnOnApp) {
      setIsResuming(true);
      try {
        await onTurnOnApp();
      } finally {
        setIsResuming(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 relative overflow-hidden text-center text-slate-800 dark:text-slate-100 my-auto">
        {/* Top ambient glow accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600" />
        
        {/* Header strip */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-[11px] font-black uppercase tracking-wider">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            App Under Maintenance
          </div>

          {currentUser && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px]">Logged in as: <strong className="text-slate-700 dark:text-slate-200">{currentUser.username}</strong></span>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors uppercase"
                >
                  Logout
                </button>
              )}
            </div>
          )}
        </div>

        {/* Animated Maintenance Icon Graphic */}
        <div className="relative mx-auto w-20 h-20 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-500/10 dark:bg-amber-500/20 rounded-full animate-ping opacity-25" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-rose-500/25 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Icon name="tool" size={32} className="animate-pulse" />
          </div>
        </div>

        {/* Title & App Identity */}
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
          System <span className="text-rose-600 dark:text-rose-400">Maintenance</span>
        </h2>
        <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.25em] mt-1 mb-4">
          Blossom Quality Operation System (BQOS)
        </p>

        {/* Tab switch between Service Notice and System Maintenance Log */}
        <div className="flex items-center justify-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-4 max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('notice')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'notice' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Icon name="alert-triangle" size={13} />
            <span>Service Notice</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'logs' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Icon name="file-text" size={13} />
            <span>Maintenance Log ({logs.length})</span>
          </button>
        </div>

        {/* Tab 1: Service Notice */}
        {activeTab === 'notice' && (
          <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 mb-5 text-left space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider">
              <Icon name="alert-triangle" size={16} />
              <span>Scheduled Service Notice</span>
            </div>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
              {maintenance?.message || 'The system is currently turned off for scheduled maintenance and performance optimizations. Please check back shortly.'}
            </p>
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              {formattedDate && (
                <div>
                  <span>Started: </span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">{formattedDate}</span>
                </div>
              )}
              {maintenance?.setBy && (
                <div>
                  <span>Initiated by: </span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">{maintenance.setBy}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: System Maintenance Log */}
        {activeTab === 'logs' && (
          <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-5 text-left space-y-3 max-h-56 overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-wider">
                <Icon name="file-text" size={15} />
                <span>System Maintenance Audit Trail</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {logs.length} logged entries
              </span>
            </div>

            {logs.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs font-semibold">
                No previous maintenance records in log.
              </div>
            ) : (
              <div className="space-y-2.5">
                {logs.map((log, index) => {
                  let formattedLogTime = log.timestamp;
                  try {
                    const d = new Date(log.timestamp);
                    if (!isNaN(d.getTime())) {
                      formattedLogTime = d.toLocaleString();
                    }
                  } catch (e) {}

                  const isOff = String(log.details || '').includes('OFF');
                  return (
                    <div 
                      key={index} 
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono text-slate-400">{formattedLogTime}</span>
                        <span className={`px-2 py-0.5 rounded font-black uppercase tracking-wider ${
                          isOff 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                        }`}>
                          {isOff ? 'App Switched OFF' : 'App Switched ON'}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-200 font-medium leading-snug">
                        {log.details || 'Maintenance event recorded'}
                      </p>
                      {log.admin && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <span>Operator:</span>
                          <strong className="text-slate-600 dark:text-slate-300">{log.admin}</strong>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Administrator Quick Controls if logged in as Admin */}
        {isAdmin ? (
          <div className="space-y-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl mb-4 text-left">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
              <Icon name="shield" size={16} />
              <span>Administrator Controls</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              You are logged in as Administrator (<strong>{currentUser?.username}</strong>). You can turn the app back ON right now or return to the Admin Panel.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={handleTurnOn}
                disabled={isResuming}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Icon name="power" size={16} />
                <span>{isResuming ? 'Resuming App...' : 'Turn App Back ON'}</span>
              </button>
              {onGoToAdmin && (
                <button
                  onClick={onGoToAdmin}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Icon name="settings" size={16} />
                  <span>Admin Panel</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Regular User Action Controls */
          <div className="space-y-3">
            <button
              onClick={onCheckStatus}
              disabled={isChecking}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Icon name="refresh-cw" size={16} className={isChecking ? "animate-spin" : ""} />
              {isChecking ? "Checking App Status..." : "Check If App Is Back Online"}
            </button>

            {!showAdminLogin ? (
              <button
                onClick={() => setShowAdminLogin(true)}
                className="text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors py-2 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
              >
                <Icon name="shield" size={14} />
                <span>Administrator Login / Override</span>
              </button>
            ) : (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 animate-fade-in text-left">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Icon name="lock" size={14} className="text-indigo-600" />
                    Admin Credentials
                  </span>
                  <button
                    onClick={() => setShowAdminLogin(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {adminError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs mb-3 font-semibold">
                    {adminError}
                  </div>
                )}

                <form onSubmit={handleAdminSubmit} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Admin Username"
                      value={adminUsername}
                      onChange={e => setAdminUsername(e.target.value)}
                      required
                      className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Admin Password"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      required
                      className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Log In as Administrator
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
