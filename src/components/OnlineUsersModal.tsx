import React, { useState } from 'react';
import Icon from './Icon';

export interface ActiveUserRecord {
  id: string;
  userCode: string;
  username: string;
  role: string;
  zone: string;
  location: string;
  lastSeen: number;
}

interface OnlineUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: ActiveUserRecord[];
  registeredUsers?: any[];
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
}

export const OnlineUsersModal: React.FC<OnlineUsersModalProps> = ({
  isOpen,
  onClose,
  users = [],
  registeredUsers = [],
  onRefresh,
  isLoading = false
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'all'>('active');

  if (!isOpen) return null;

  const filteredActive = users.filter(u => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (u.username && u.username.toLowerCase().includes(term)) ||
      (u.userCode && u.userCode.toLowerCase().includes(term)) ||
      (u.role && u.role.toLowerCase().includes(term)) ||
      (u.zone && u.zone.toLowerCase().includes(term)) ||
      (u.location && u.location.toLowerCase().includes(term))
    );
  });

  const filteredRegistered = registeredUsers.filter(u => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (u.username && u.username.toLowerCase().includes(term)) ||
      (u.userCode && u.userCode.toLowerCase().includes(term)) ||
      (u.role && u.role.toLowerCase().includes(term)) ||
      (u.zone && u.zone.toLowerCase().includes(term)) ||
      (u.location && u.location.toLowerCase().includes(term))
    );
  });

  const isUserOnline = (userCode: string) => {
    const clean = String(userCode || '').trim().toUpperCase();
    return users.some(u => String(u.userCode || u.username).trim().toUpperCase() === clean);
  };

  const formatLastSeen = (timestamp: number) => {
    if (!timestamp) return 'Active now';
    const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (diffSec < 15) return 'Active now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    return `${diffMin}m ago`;
  };

  const getRoleBadgeStyle = (role: string) => {
    const r = String(role || '').toUpperCase();
    if (r === 'ADMIN') return 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    if (r === 'WORKORDER') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
  };

  return (
    <div 
      className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[88vh] overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
              <Icon name="users" size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase">
                  Active Users Monitor
                </h3>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-black">{users.length}</span> {users.length === 1 ? 'user session' : 'user sessions'} currently online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRefresh()}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 shadow-sm"
              title="Refresh active users"
            >
              <Icon name="refresh-cw" size={14} className={isLoading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title="Close window"
            >
              <Icon name="x" size={20} />
            </button>
          </div>
        </div>

        {/* Tab switch: Active vs All System Accounts */}
        <div className="px-6 pt-3 pb-2 flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'active' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Online Now ({users.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'all' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>All Accounts ({registeredUsers.length})</span>
            </button>
          </div>

          <div className="text-[11px] font-semibold text-slate-400 hidden sm:block">
            Auto-syncs every 15s
          </div>
        </div>

        {/* Search bar */}
        <div className="px-6 py-2.5 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Icon name="search" size={14} className="text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'active' ? "Search online users..." : "Search all system user accounts..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 text-xs">
              Clear
            </button>
          )}
        </div>

        {/* User list content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
          {activeTab === 'active' ? (
            filteredActive.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <Icon name="user-check" size={36} className="mx-auto opacity-40 text-emerald-500" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {search ? "No active users match search" : "Your session is online"}
                </p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Connected users will appear here automatically when they open or navigate the system.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredActive.map(u => (
                  <div 
                    key={u.id || u.userCode} 
                    className="py-3 px-3 rounded-2xl flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/60 dark:to-slate-800 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center font-black text-indigo-700 dark:text-indigo-300 text-sm shadow-inner">
                          {String(u.username || u.userCode || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{u.username}</span>
                          <span className="text-[10px] font-mono text-slate-400">({u.userCode})</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>Zone: <strong className="text-slate-600 dark:text-slate-300 font-semibold">{u.zone || 'ALL'}</strong></span>
                          <span>•</span>
                          <span>Unit: <strong className="text-slate-600 dark:text-slate-300 font-semibold">{u.location || '-'}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getRoleBadgeStyle(u.role)}`}>
                        {u.role || 'USER'}
                      </span>
                      <div className="text-right min-w-[70px]">
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Online</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono block">
                          {formatLastSeen(u.lastSeen)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* All registered accounts view */
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRegistered.map(u => {
                const online = isUserOnline(u.userCode);
                return (
                  <div 
                    key={u.userCode} 
                    className="py-2.5 px-3 rounded-2xl flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs">
                          {String(u.username || u.userCode || 'U').charAt(0).toUpperCase()}
                        </div>
                        {online && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{u.username}</span>
                          <span className="text-[10px] font-mono text-slate-400">({u.userCode})</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {u.zone || u.location || 'SYSTEM'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${getRoleBadgeStyle(u.role)}`}>
                        {u.role || 'USER'}
                      </span>
                      <span className={`text-[10px] font-bold ${online ? 'text-emerald-600 dark:text-emerald-400 flex items-center gap-1' : 'text-slate-400'}`}>
                        {online ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active</span>
                          </>
                        ) : 'Offline'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Presence tracked live via server heartbeats</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 font-bold transition-colors shadow-sm"
          >
            Close Monitor
          </button>
        </div>

      </div>
    </div>
  );
};
