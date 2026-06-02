import React, { useState } from 'react';
import { api } from '../services/api';
import { ZONES, UNITS } from '../constants';
import Icon from './Icon';
import WorkorderDetailCard from './WorkorderDetailCard';

interface FinalAuditProps {
  user: any;
  settings: any;
  workorders: any[];
  triggerSuccess: (message: string) => void;
  globalZone?: string;
}

const FinalAudit: React.FC<FinalAuditProps> = ({ user, settings, workorders, triggerSuccess, globalZone }) => {
  const currentZones = settings?.ZONE || settings?.ZONES || ZONES || [];
  const currentUnits = settings?.UNIT || settings?.UNITS || UNITS || [];

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
    }
  }, [globalZone]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedWO = workorders.find(w => String(w.workorderNumber) === String(form.wo));

  const handleSubmit = async (moveToComplete: boolean = false) => {
    if (isSubmitting) return;
    if (!form.wo) {
      alert("Please select a workorder");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.run('api_saveFINALAUDIT', { 
        ...form, 
        ...selectedWO, 
        moveToComplete,
        inspector: user.username, 
        timestamp: new Date().toISOString() 
      });
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
          <select value={form.zone} onChange={e => setForm({...form, zone: e.target.value})} className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold text-xs">
            {currentZones.map((z: string) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Workorder #</label>
          <select value={form.wo} onChange={e => setForm({...form, wo: e.target.value})} required className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold text-xs">
            <option value="">Select Workorder</option>
            {workorders
              .filter(w => {
                const wZone = String(w.zone || w.location || "").toUpperCase().trim();
                const fZone = String(form.zone).toUpperCase().trim();
                const status = String(w.status || "").toUpperCase().trim();
                return wZone === fZone && status === 'FINAL';
              })
              .map(w => <option key={w.id} value={w.workorderNumber}>{w.workorderNumber}</option>)
            }
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit</label>
          <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold text-xs">
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
