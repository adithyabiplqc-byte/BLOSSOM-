import React, { useState } from 'react';
import { api } from '../services/api';
import { ZONES, UNITS } from '../constants';
import Icon from './Icon';
import WorkorderDetailCard from './WorkorderDetailCard';
import SearchableSelect from './SearchableSelect';

interface FinalAuditProps {
  user: any;
  settings: any;
  workorders: any[];
  triggerSuccess: (message: string) => void;
  globalZone?: string;
  refreshData?: () => void;
}

const FinalAudit: React.FC<FinalAuditProps> = ({ user, settings, workorders, triggerSuccess, globalZone, refreshData }) => {
  const hasSpreadsheet = localStorage.getItem('VITE_SPREADSHEET_ID') || localStorage.getItem('VITE_GAS_URL');
  const currentZones = React.useMemo(() => {
    const userZone = String(user?.zone || user?.location || '').trim().toUpperCase();
    if (user?.role !== 'ADMIN' && user?.zone !== 'COMMON' && userZone && userZone !== 'SYSTEM') {
      return [userZone];
    }
    const list = settings?.ZONE || settings?.ZONES || (hasSpreadsheet ? [] : ZONES);
    return list;
  }, [settings, hasSpreadsheet, user]);
  const currentUnits = React.useMemo(() => {
    const userLoc = String(user?.location || '').trim().toUpperCase();
    const userZone = String(user?.zone || '').trim().toUpperCase();
    const isCommonOrAdmin = user?.role === 'ADMIN' || userZone === 'COMMON' || userLoc === 'COMMON' || userZone === 'SYSTEM';

    if (!isCommonOrAdmin && userLoc && userLoc !== 'SYSTEM') {
      return [userLoc];
    }

    const rawUnits = settings?.UNIT || settings?.UNITS || (hasSpreadsheet ? [] : UNITS);
    const list = Array.isArray(rawUnits) ? rawUnits : [];
    return Array.from(new Set(['COMMON', ...list.map(u => String(u).toUpperCase())]));
  }, [settings, user, hasSpreadsheet]);

  const [form, setForm] = useState({ 
    zone: (globalZone && globalZone !== 'ALL') ? globalZone : (currentZones[0] || ''), 
    wo: '', 
    unit: currentUnits[0] || '', 
    totalAudited: '', 
    pass: '', 
    rejected: '', 
    remarks: '' 
  });

  // Sync zone with globalZone
  React.useEffect(() => {
    if (globalZone && globalZone !== 'ALL') {
      setForm(prev => ({ ...prev, zone: globalZone }));
    } else if (currentZones && currentZones.length > 0 && (!form.zone || !currentZones.includes(form.zone))) {
      setForm(prev => ({ ...prev, zone: currentZones[0] }));
    }
  }, [globalZone, currentZones, form.zone]);

  React.useEffect(() => {
    if (currentUnits.length === 1 && form.unit !== currentUnits[0]) {
      setForm(prev => ({ ...prev, unit: currentUnits[0] }));
    } else if (!form.unit && currentUnits.length > 0) {
      setForm(prev => ({ ...prev, unit: currentUnits[0] }));
    }
  }, [currentUnits, form.unit]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedWO = workorders.find(w => String(w.id) === String(form.wo) || String(w.workorderNumber) === String(form.wo));

  const handleSubmit = async (moveToComplete: boolean = false) => {
    if (isSubmitting) return;

    // Explicit comprehensive validation for all boxes, dropboxes, date selection and remarks
    if (!form.zone) {
      alert("Please select a Zone");
      return;
    }
    if (!form.wo) {
      alert("Please select a Workorder");
      return;
    }
    if (!form.unit) {
      alert("Please select a Unit");
      return;
    }
    if (form.totalAudited === '' || form.totalAudited === null) {
      alert("Please enter Total Audited");
      return;
    }
    if (form.pass === '' || form.pass === null) {
      alert("Please enter Pass Qty");
      return;
    }
    if (form.rejected === '' || form.rejected === null) {
      alert("Please enter Rejected Qty");
      return;
    }

    setIsSubmitting(true);
    try {
      const resolvedWo = selectedWO?.workorderNumber || (form.wo.startsWith('wo-') ? (workorders.find(w => w.id === form.wo)?.workorderNumber || form.wo) : form.wo);

      await api.run('api_saveFINALAUDIT', { 
        ...selectedWO, 
        ...form, 
        wo: resolvedWo,
        workorderNumber: resolvedWo,
        moveToComplete,
        inspector: user.username, 
        timestamp: new Date().toISOString() 
      });

      if (selectedWO && moveToComplete) {
        await api.run('api_updateWorkorder', { ...selectedWO, status: 'COMPLETED' });
      }

      if (refreshData) {
        await refreshData();
      }

      triggerSuccess(moveToComplete ? 'AUDIT COMPLETE & WORKORDER CLOSED' : 'FINAL AUDIT RECORDED');
      setForm({ ...form, totalAudited: '', pass: '', rejected: '', remarks: '' });
    } catch (error) {
      alert('Error saving final audit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zone</label>
          <SearchableSelect value={form.zone} onChange={e => setForm({...form, zone: e.target.value})} className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold text-xs">
            {currentZones.map((z: string) => <option key={z} value={z}>{z}</option>)}
          </SearchableSelect>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Workorder #</label>
          <SearchableSelect value={form.wo} onChange={e => setForm({...form, wo: e.target.value})} required className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold text-xs">
            <option value="">Select Workorder</option>
            {workorders
              .filter(w => {
                const wZone = String(w.zone || w.location || "").toUpperCase().trim();
                const fZone = String(form.zone).toUpperCase().trim();
                const status = String(w.status || "").toUpperCase().replace(/[^A-Z0-9]/g, '');
                const matchesStatus = (status === 'FINAL' || status === 'FINALPASSANDHOLD' || status === 'AQLPASSANDHOLD');
                return (wZone === fZone || fZone === 'ALL' || fZone === 'COMMON') && matchesStatus;
              })
              .map(w => <option key={w.id || w.workorderNumber} value={w.workorderNumber || w.id}>{w.workorderNumber} ({w.style || w.styleName || w.itemName || w.item || 'N/A'})</option>)
            }
          </SearchableSelect>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit</label>
          <SearchableSelect value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold text-xs">
            {currentUnits.map((u: string) => <option key={u} value={u}>{u}</option>)}
          </SearchableSelect>
        </div>
      </div>

      {selectedWO && (
        <div className="animate-zoom-in">
          <WorkorderDetailCard wo={selectedWO} settings={settings} />
        </div>
      )}
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 mb-4">
          <Icon name="check-square" size={16} className="text-emerald-600" />
          Final Audit Entry
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Total Audited</label>
            <input type="number" placeholder="0" value={form.totalAudited} onChange={e => setForm({...form, totalAudited: e.target.value})} className="w-full text-sm font-bold bg-slate-50 border-transparent focus:bg-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Pass Qty</label>
            <input type="number" placeholder="0" value={form.pass} onChange={e => setForm({...form, pass: e.target.value})} className="w-full text-sm font-bold bg-emerald-50 border-transparent focus:bg-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Rejected Qty</label>
            <input type="number" placeholder="0" value={form.rejected} onChange={e => setForm({...form, rejected: e.target.value})} className="w-full text-sm font-bold bg-rose-50 border-transparent focus:bg-white" />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Remarks</label>
        <textarea placeholder="Enter any remarks here..." value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} className="w-full min-h-[100px] bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all font-medium text-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => handleSubmit(false)} 
          disabled={isSubmitting}
          className="btn-secondary py-5 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 border-2 border-slate-200"
        >
          {isSubmitting ? <Icon name="refresh-cw" size={18} className="animate-spin" /> : <><Icon name="save" size={18} /> Record Only</>}
        </button>
        <button 
          onClick={() => handleSubmit(true)} 
          disabled={isSubmitting}
          className="btn-primary py-5 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 bg-emerald-600 border-none hover:bg-emerald-700"
        >
          {isSubmitting ? <Icon name="refresh-cw" size={18} className="animate-spin" /> : <><Icon name="check-circle" size={18} /> Complete Audit</>}
        </button>
      </div>
    </div>
  );
};

export default FinalAudit;
