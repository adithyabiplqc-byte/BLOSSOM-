import React from 'react';
import { SUBMODULES } from '../constants';
import Icon from './Icon';
import MaterialInspection from './MaterialInspection';
import CuttingQuality from './CuttingQuality';
import InlineQuality from './InlineQuality';
import EndlineQuality from './EndlineQuality';
import AQLInspection from './AQLInspection';
import FinalAudit from './FinalAudit';
import ReportsSOPs from './ReportsSOPs';
import CustomerComplaintRegister from './CustomerComplaintRegister';
import DataView from './DataView';
import MISView from './MISView';
import BlossomAIView from './BlossomAIView';
import { api } from '../services/api';

interface SubmoduleContainerProps {
  id: string;
  user: any;
  settings: any;
  workorders: any[];
  onBack: () => void;
  users: any[];
  triggerSuccess: (message: string) => void;
  globalZone?: string;
  setGlobalZone?: (z: string) => void;
  onNavigate?: (newSubId: string) => void;
  refreshData?: () => void;
}

const SubmoduleContainer: React.FC<SubmoduleContainerProps> = ({ id, user, settings, workorders, onBack, users, triggerSuccess, globalZone, setGlobalZone, onNavigate, refreshData }) => {
  const isRestricted = user?.role !== 'ADMIN' && (
    (user?.restrictions || []).includes(id) || 
    (user?.restrictions || []).includes(id.charAt(0))
  );

  const renderSubmodule = () => {
    if (isRestricted) {
      return (
        <div className="p-12 text-center space-y-4 max-w-md mx-auto animate-fade-in">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-100 mx-auto shadow-sm">
            <Icon name="lock" size={24} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 uppercase tracking-tight text-lg">Access Denied</h3>
            <p className="text-[10px] uppercase tracking-widest font-black text-rose-500 mt-1">Authorization Exception</p>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Your user code does not have active clearance key for module node <span className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-black">#{id}</span>. Please request authority update from the system admin.
          </p>
          <button 
            onClick={onBack}
            className="w-full bg-slate-900 text-white rounded-xl py-2.5 text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    const commonProps = { user, settings, workorders, triggerSuccess, globalZone, refreshData };

    if (id === 'A1') return <MaterialInspection {...commonProps} />;
    if (id === 'A2') return <CuttingQuality {...commonProps} />;
    if (id === 'A3') return <InlineQuality {...commonProps} />;
    if (id === 'A4') return <EndlineQuality {...commonProps} users={users} onNavigate={onNavigate} refreshData={refreshData} />;
    if (id === 'A5') return <AQLInspection {...commonProps} />;
    if (id === 'A6') return <FinalAudit {...commonProps} />;
    if (id === 'A7') return <ReportsSOPs user={user} settings={settings} triggerSuccess={triggerSuccess} globalZone={globalZone} mode="entry" />;
    if (id === 'A8') return <CustomerComplaintRegister user={user} settings={settings} triggerSuccess={triggerSuccess} globalZone={globalZone} refreshData={refreshData} mode="entry" />;
    if (id === 'B9') return <ReportsSOPs user={user} settings={settings} triggerSuccess={triggerSuccess} globalZone={globalZone} mode="view" readOnly={true} />;
    if (id.startsWith('B')) return <DataView id={id} user={user} globalZone={globalZone} settings={settings} setGlobalZone={setGlobalZone} workorders={workorders} />;
    if (id === 'C7') return <BlossomAIView globalZone={globalZone} user={user} />;
    if (id.startsWith('C')) return <MISView id={id} globalZone={globalZone} />;
    return <div className="p-12 text-center text-slate-400 italic">Submodule {id} form logic coming soon...</div>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-bold text-sm"><Icon name="arrow-left" size={16} /> BACK</button>
      </div>
      <div className="glass-card p-4 md:p-6">
        <h2 className="text-xl font-black mb-6 text-slate-800 border-b pb-2 flex items-center gap-2">
          <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-xs">{id}</span>
          {SUBMODULES.find(s => s.id === id)?.name}
        </h2>
        {renderSubmodule()}
      </div>
    </div>
  );
};

export default SubmoduleContainer;
