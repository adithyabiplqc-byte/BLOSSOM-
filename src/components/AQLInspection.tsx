import React, { useState } from 'react';
import { api } from '../services/api';
import { ZONES, UNITS } from '../constants';
import Icon from './Icon';
import WorkorderDetailCard from './WorkorderDetailCard';

interface AQLInspectionProps {
  user: any;
  settings: any;
  workorders: any[];
  triggerSuccess: (message: string) => void;
  globalZone?: string;
}

const AQLInspection: React.FC<AQLInspectionProps> = ({ user, settings, workorders, triggerSuccess, globalZone }) => {
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
    passQty: '', 
    failedPieces: '', 
    remarks: '' 
  });

  // Sync with globalZone or settings load
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

  const selectedWO = workorders.find(w => String(w.workorderNumber) === String(form.wo));

  const handleSubmit = async (status: string, moveToFinal: boolean = false) => {
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
    if (form.passQty === '' || form.passQty === null) {
      alert("Please enter Pass Quantity");
      return;
    }
    if (form.failedPieces === '' || form.failedPieces === null) {
      alert("Please enter Failed Pieces");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.run('api_saveAQLREPORT', { 
        ...form, 
        ...selectedWO, 
        auditStatus: status, 
        moveToFinal,
        inspector: user.username, 
        timestamp: new Date().toISOString() 
      });
      triggerSuccess(moveToFinal ? `AQL ${status} & MOVED TO FINAL` : `AQL AUDIT ${status} SUBMITTED`);
      setForm({ ...form, passQty: '', failedPieces: '', remarks: '' });
    } catch (error) {
      alert('Error saving AQL report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zone</label>
          <select value={form.zone} onChange={e => setForm({...form, zone: e.target.value})} className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold">
            {currentZones.map((z: string) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Workorder #</label>
          <select value={form.wo} onChange={e => setForm({...form, wo: e.target.value})} required className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold">
            <option value="">Select Workorder</option>
            {workorders
              .filter(w => {
                const wZone = String(w.zone || w.location || "").toUpperCase().trim();
                const fZone = String(form.zone).toUpperCase().trim();
                const status = String(w.status || "").toUpperCase().trim();
                return wZone === fZone && status === 'AQL';
              })
              .map(w => <option key={w.id} value={w.workorderNumber}>{w.workorderNumber}</option>)
            }
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit</label>
          <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold">
            {currentUnits.map((u: string) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      {selectedWO && (
        <div className="animate-zoom-in">
          <WorkorderDetailCard wo={selectedWO} settings={settings} />
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 mb-4">
          <Icon name="search" size={16} className="text-indigo-600" />
          AQL Audit Data
        </h3>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Pass Quantity</label>
            <input type="number" placeholder="0" value={form.passQty} onChange={e => setForm({...form, passQty: e.target.value})} className="w-full text-sm font-bold bg-slate-50 border-transparent focus:bg-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Failed Pieces</label>
            <input type="number" placeholder="0" value={form.failedPieces} onChange={e => setForm({...form, failedPieces: e.target.value})} className="w-full text-sm font-bold bg-rose-50 border-transparent focus:bg-white" />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Remarks</label>
        <textarea placeholder="Enter any remarks here..." value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} className="w-full min-h-[100px] bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all font-medium text-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button 
          onClick={() => handleSubmit('FAIL', false)} 
          disabled={isSubmitting}
          className="bg-rose-50 text-rose-600 border-2 border-rose-100 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Icon name="refresh-cw" className="animate-spin" size={18} /> : <><Icon name="x-circle" size={18} /> Audit Fail</>}
        </button>
        <button 
          onClick={() => handleSubmit('PASS', false)} 
          disabled={isSubmitting}
          className="bg-emerald-50 text-emerald-600 border-2 border-emerald-100 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Icon name="refresh-cw" className="animate-spin" size={18} /> : <><Icon name="check" size={18} /> Audit Pass</>}
        </button>
        <button 
          onClick={() => handleSubmit('PASS', true)} 
          disabled={isSubmitting}
          className="bg-indigo-600 text-white shadow-lg shadow-indigo-200 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 md:col-span-2 lg:col-span-1"
        >
          {isSubmitting ? <Icon name="refresh-cw" className="animate-spin" size={18} /> : <><Icon name="arrow-right" size={18} /> Pass & Move to Final</>}
        </button>
      </div>
    </div>
  );
};

export default AQLInspection;
