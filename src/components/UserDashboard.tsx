import React, { useMemo } from 'react';
import { MAIN_MODULES, SUBMODULES } from '../constants';
import Icon from './Icon';

interface UserDashboardProps {
  user: any;
  onSelectSubmodule: (id: string) => void;
  workorders?: any[];
  users?: any[];
}

const UserDashboard: React.FC<UserDashboardProps> = ({ 
  user, 
  onSelectSubmodule,
  workorders = [],
  users = []
}) => {
  const isRestricted = (id: string) => (user.restrictions || []).includes(id);

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning ☀️';
    if (hr < 17) return 'Good Afternoon 🌤️';
    return 'Good Evening 🌠';
  }, []);

  // Format today's date elegantly
  const formattedDate = useMemo(() => {
    const options: any = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  }, []);

  // Get active user initials
  const initials = useMemo(() => {
    if (!user?.username) return 'U';
    return user.username.substring(0, 2).toUpperCase();
  }, [user]);

  // Statistics calculations (SAP UI element)
  const stats = useMemo(() => {
    const totalWOs = workorders.length;
    const activeWOs = workorders.filter(w => !w.status || String(w.status).toUpperCase() !== 'CLOSED').length;
    const teamSize = users.length || 1;
    const activeZone = user?.zone || user?.location || 'SYSTEM';

    return [
      { 
        label: 'Active Zone', 
        value: activeZone, 
        icon: 'map-pin', 
        color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
        desc: 'Assigned Regional Operations'
      },
      { 
        label: 'Workorders', 
        value: totalWOs ? `${activeWOs} Active / ${totalWOs} Total` : 'No Workorders', 
        icon: 'package', 
        color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        desc: 'Active Garment Batches'
      },
      { 
        label: 'Team Members', 
        value: `${teamSize} Operators`, 
        icon: 'users', 
        color: 'text-amber-600 bg-amber-50 border-amber-100',
        desc: 'Configured Quality Inspectors'
      },
      { 
        label: 'Integrity Sync', 
        value: 'Live Synchronized', 
        icon: 'cloud-lightning', 
        color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
        desc: 'Google Sheets Real-time Tunnel'
      }
    ];
  }, [workorders, users, user]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Voyon Folks Personalized Greeting Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-96 h-20 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Elegant avatar container */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-indigo-400 border-opacity-35 transform transition-transform duration-500 hover:rotate-6">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-400 border-opacity-20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest">{user?.role}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-glow" />
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Active Session</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1">
                {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">{user?.username}</span>
              </h1>
              <p className="text-slate-400 text-xs mt-1 font-medium">Blossom Quality Operation System (BQOS) • Ready to input live quality metrics</p>
            </div>
          </div>
          
          {/* Calendar element */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-3 self-start md:self-auto shadow-sm">
            <div className="bg-indigo-600/30 text-indigo-300 p-2.5 rounded-xl border border-indigo-500/20">
              <Icon name="calendar" size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">Calendar Node</p>
              <p className="text-xs font-black text-slate-100 tracking-tight mt-1">{formattedDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modern High-End Module Navigator */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Available Modules & Workplaces</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MAIN_MODULES.map((module) => {
            const submodules = SUBMODULES.filter(s => s.module === module.id);
            const moduleRestricted = isRestricted(module.id);

            return (
              <div 
                key={module.id} 
                className={`bg-white rounded-3xl border border-slate-100 overflow-hidden transition-all duration-500 shadow-sm flex flex-col group ${
                  moduleRestricted ? 'opacity-65' : 'hover:shadow-xl hover:-translate-y-1'
                }`}
              >
                {/* Module Card Header */}
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-500 ${
                      moduleRestricted 
                        ? 'bg-slate-400 shadow-slate-100' 
                        : 'bg-indigo-600 shadow-indigo-100 group-hover:scale-110'
                    }`}>
                      <Icon name={module.icon} size={22} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase leading-none">{module.name}</h2>
                      <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">Module {module.id}</p>
                    </div>
                  </div>
                  {moduleRestricted ? (
                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider bg-rose-50 border border-rose-100 px-2 rounded-full flex items-center gap-1">
                      <Icon name="lock" size={10} /> Locked
                    </span>
                  ) : (
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider bg-white border border-slate-150 px-2.5 py-1 rounded-full shadow-sm">
                      {submodules.length} Nodes
                    </span>
                  )}
                </div>

                {/* Submodule links nested grid */}
                <div className="p-6 space-y-2.5 flex-1 bg-white">
                  {submodules.map(sub => {
                    const subRestricted = isRestricted(sub.id) || moduleRestricted;
                    return (
                      <button 
                        key={sub.id} 
                        onClick={() => !subRestricted && onSelectSubmodule(sub.id)}
                        disabled={subRestricted}
                        className={`w-full text-left p-3.5 rounded-2xl font-bold text-xs flex items-center justify-between transition-all border outline-none ${
                          subRestricted 
                            ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-60' 
                            : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 group-hover:border-slate-200 shadow-sm hover:shadow-md hover:translate-x-1.5'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <span className={`px-2 py-1 rounded-lg text-[9px] font-black transition-colors ${
                            subRestricted 
                              ? 'bg-slate-100 text-slate-300' 
                              : 'bg-white text-indigo-600 group-hover:bg-slate-800 border border-slate-200'
                          }`}>
                            {sub.id}
                          </span>
                          <span className="truncate leading-none">{sub.name}</span>
                        </span>
                        
                        {subRestricted ? (
                          <Icon name="lock" size={12} className="text-slate-300 flex-shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full hover:bg-white/20 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                            <Icon name="arrow-right" size={12} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100/80 backdrop-blur-sm rounded-full border border-slate-200/50 text-slate-400 text-[10px] font-black uppercase tracking-widest shadow-sm">
          <Icon name="shield-check" size={12} className="text-emerald-500" />
          Enterprise Grade BQOS Engine Active • SSL Secure Tunnel • Layer 7 Encryption
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
