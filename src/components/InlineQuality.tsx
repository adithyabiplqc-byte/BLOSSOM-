import React, { useState } from 'react';
import { api } from '../services/api';
import { ZONES, UNITS, DEFECTS, OPERATIONS, WORKERS, MACHINES } from '../constants';
import Icon from './Icon';
import WorkorderDetailCard from './WorkorderDetailCard';

interface InlineQualityProps {
  user: any;
  settings: any;
  workorders: any[];
  triggerSuccess: (message: string) => void;
  globalZone?: string;
}

const InlineQuality: React.FC<InlineQualityProps> = ({ user, settings, workorders, triggerSuccess, globalZone }) => {
  const currentZones = settings?.ZONE || ZONES || [];
  const currentUnits = settings?.UNIT || UNITS || [];
  const currentDefects = settings?.DEFECTS || DEFECTS || [];
  const currentOperations = settings?.OPERATIONS || OPERATIONS || [];
  const currentWorkers = settings?.WORKERS || WORKERS || [];
  const currentMachines = settings?.MACHINE || MACHINES || [];

  const [form, setForm] = useState({ 
    zone: (globalZone && globalZone !== 'ALL') ? globalZone : (currentZones[0] || ''), 
    wo: '', 
    unit: currentUnits[0] || '', 
    line: '', 
    bundleNo: '', 
    checkedQty: '', 
    passQty: '', 
    reworkQty: '', 
    failQty: '', 
    remarks: '' 
  });

  // Sync with globalZone or settings load
  React.useEffect(() => {
    if (globalZone && globalZone !== 'ALL') {
      setForm(prev => ({ ...prev, zone: globalZone }));
    } else if (!form.zone && currentZones.length > 0) {
      setForm(prev => ({ ...prev, zone: currentZones[0] }));
    }
  }, [globalZone, currentZones]);

  React.useEffect(() => {
    if (!form.unit && currentUnits.length > 0) {
      setForm(prev => ({ ...prev, unit: currentUnits[0] }));
    }
  }, [currentUnits]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedWO = workorders.find(w => String(w.workorderNumber) === String(form.wo));

  const handleSubmit = async (e: React.FormEvent, moveToEndline: boolean = false) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!form.wo) {
      alert("Please select a workorder");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.run('api_saveSEWINGDEFECT', { 
        ...form, 
        ...selectedWO, 
        moveToEndline,
        inspector: user.username, 
        timestamp: new Date().toISOString() 
      });
      triggerSuccess(moveToEndline ? 'DATA SAVED & MOVED TO ENDLINE' : 'INLINE DATA SAVED');
      setForm({ ...form, bundleNo: '', checkedQty: '', passQty: '', reworkQty: '', failQty: '', remarks: '' });
    } catch (error) {
      alert('Error saving inline report');
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
                return wZone === fZone && String(w.status || "").toUpperCase() === 'INLINE';
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
          <WorkorderDetailCard wo={selectedWO} />
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 mb-4">
          <Icon name="layout" size={16} className="text-indigo-600" />
          Inline Inspection Data
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Line</label>
            <input type="text" placeholder="Line" value={form.line} onChange={e => setForm({...form, line: e.target.value})} required className="w-full text-sm font-bold bg-slate-50 border-transparent focus:bg-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Bundle No</label>
            <input type="text" placeholder="Bundle No" value={form.bundleNo} onChange={e => setForm({...form, bundleNo: e.target.value})} required className="w-full text-sm font-bold bg-slate-50 border-transparent focus:bg-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Checked</label>
            <input type="number" placeholder="Checked" value={form.checkedQty} onChange={e => setForm({...form, checkedQty: e.target.value})} required className="w-full text-sm font-bold bg-slate-50 border-transparent focus:bg-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Pass Qty</label>
            <input type="number" placeholder="Pass" value={form.passQty} onChange={e => setForm({...form, passQty: e.target.value})} required className="w-full text-sm font-bold bg-indigo-50 border-transparent focus:bg-white" />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Remarks</label>
        <textarea placeholder="Enter any remarks here..." value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} className="w-full min-h-[100px] bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all font-medium text-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={(e) => handleSubmit(e, false)}
          disabled={isSubmitting}
          className="btn-secondary py-5 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 border-2 border-slate-200"
        >
          {isSubmitting ? <Icon name="refresh-cw" size={18} className="animate-spin" /> : <><Icon name="save" size={18} /> Submit Only</>}
        </button>
        <button 
          onClick={(e) => handleSubmit(e, true)}
          disabled={isSubmitting}
          className="btn-primary py-5 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-indigo-200"
        >
          {isSubmitting ? <Icon name="refresh-cw" size={18} className="animate-spin" /> : <><Icon name="check-circle" size={18} /> Pass to Endline</>}
        </button>
      </div>
    </div>
  );
};

export default InlineQuality;
