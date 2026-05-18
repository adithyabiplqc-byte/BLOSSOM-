import React from 'react';
import { MAIN_MODULES, SUBMODULES } from '../constants';
import Icon from './Icon';

interface UserDashboardProps {
  user: any;
  onSelectSubmodule: (id: string) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onSelectSubmodule }) => {
  const isRestricted = (id: string) => (user.restrictions || []).includes(id);

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      <div className="text-center mb-12 animate-fade-in animate-slide-in-from-top duration-700">
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Welcome, <span className="text-indigo-600">{user.username}</span></h1>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-2">Select a module to begin operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
        <div className="glass-card p-4 border-l-4 border-indigo-500 bg-white">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modules</p>
          <p className="text-3xl font-black text-slate-800">{MAIN_MODULES.length}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-rose-500 bg-white">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Restricted</p>
          <p className="text-3xl font-black text-slate-800">{(user.restrictions || []).length}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-emerald-500 bg-white">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
          <p className="text-3xl font-black text-slate-800">{user.location}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-amber-500 bg-white">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Permissions</p>
          <p className="text-3xl font-black text-slate-800">{user.canDownload !== false ? 'FULL' : 'LIMITED'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {MAIN_MODULES.map((module, idx) => {
          const submodules = SUBMODULES.filter(s => s.module === module.id);
          const moduleRestricted = isRestricted(module.id);

          return (
            <div 
              key={module.id} 
              className={`glass-card p-8 group hover:shadow-2xl hover:shadow-indigo-200 transition-all duration-500 border-l-[12px] border-indigo-600 animate-fade-in animate-slide-in-from-bottom delay-${idx * 100} ${moduleRestricted ? 'opacity-50 grayscale pointer-events-none' : ''}`}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                  <Icon name={module.icon} size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{module.name}</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Module {module.id}</p>
                </div>
              </div>

              <div className="space-y-3">
                {submodules.map(sub => {
                  const subRestricted = isRestricted(sub.id);
                  return (
                    <button 
                      key={sub.id} 
                      onClick={() => onSelectSubmodule(sub.id)}
                      disabled={subRestricted}
                      className={`w-full text-left p-4 rounded-xl font-bold text-sm flex items-center justify-between transition-all ${subRestricted ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-slate-50 text-slate-600 hover:bg-indigo-600 hover:text-white hover:translate-x-2'}`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="bg-slate-200 text-slate-500 group-hover:bg-indigo-500 group-hover:text-white px-2 py-0.5 rounded text-[10px] transition-colors">{sub.id}</span>
                        {sub.name}
                      </span>
                      <Icon name="chevron-right" size={16} />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/50 backdrop-blur-sm rounded-full border border-white/20 text-slate-400 text-xs font-bold uppercase tracking-widest shadow-sm">
          <Icon name="shield-check" size={14} className="text-emerald-500" />
          Secure Session Active • {user.location} • {user.role}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
