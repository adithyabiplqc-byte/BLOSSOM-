import React from 'react';
import { SUBMODULES } from '../constants';
import Icon from './Icon';
import MaterialInspection from './MaterialInspection';
import CuttingQuality from './CuttingQuality';
import InlineQuality from './InlineQuality';
import EndlineQuality from './EndlineQuality';
import AQLInspection from './AQLInspection';
import FinalAudit from './FinalAudit';
import MaterialTraceability from './MaterialTraceability';
import DataView from './DataView';
import MISView from './MISView';
import { api } from '../services/api';

interface SubmoduleContainerProps {
  id: string;
  user: any;
  settings: any;
  workorders: any[];
  cards: any[];
  onBack: () => void;
  users: any[];
  triggerSuccess: (message: string) => void;
  globalZone?: string;
}

const SubmoduleContainer: React.FC<SubmoduleContainerProps> = ({ id, user, settings, workorders, cards, onBack, users, triggerSuccess, globalZone }) => {
  const renderSubmodule = () => {
    const commonProps = { user, settings, workorders, triggerSuccess, globalZone };

    if (id === 'A1') return <MaterialInspection {...commonProps} />;
    if (id === 'A2') return <CuttingQuality {...commonProps} />;
    if (id === 'A3') return <InlineQuality {...commonProps} />;
    if (id === 'A4') return <EndlineQuality {...commonProps} users={users} />;
    if (id === 'A5') return <AQLInspection {...commonProps} />;
    if (id === 'A6') return <FinalAudit {...commonProps} />;
    if (id === 'A7') return <MaterialTraceability user={user} onBack={onBack} api={api} workorders={workorders} />;
    if (id.startsWith('B')) return <DataView id={id} user={user} globalZone={globalZone} />;
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
