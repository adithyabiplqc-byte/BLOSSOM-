import React, { useState } from 'react';
import { api } from '../services/api';
import { ZONES } from '../constants';
import Icon from './Icon';
import WorkorderDetailCard from './WorkorderDetailCard';

interface CuttingQualityProps {
  user: any;
  settings: any;
  workorders: any[];
  triggerSuccess: (message: string) => void;
  globalZone?: string;
  refreshData?: () => void;
}

const CuttingQuality: React.FC<CuttingQualityProps> = ({ user, settings, workorders, triggerSuccess, globalZone, refreshData }) => {
  const hasSpreadsheet = localStorage.getItem('VITE_SPREADSHEET_ID') || localStorage.getItem('VITE_GAS_URL');
  const currentZones = React.useMemo(() => {
    const userZone = String(user?.zone || user?.location || '').trim().toUpperCase();
    if (user?.role !== 'ADMIN' && user?.zone !== 'COMMON' && userZone && userZone !== 'SYSTEM') {
      return [userZone];
    }
    const list = settings?.ZONE || settings?.ZONES || (hasSpreadsheet ? [] : ZONES);
    return list;
  }, [settings, hasSpreadsheet, user]);

  const [form, setForm] = useState({ 
    zone: (globalZone && globalZone !== 'ALL') ? globalZone : (currentZones[0] || ''), 
    wo: '', 
    bundleNo: '', 
    checkedQty: '', 
    reworkQty: '', 
    rejectedQty: '', 
    remarks: '' 
  });

  React.useEffect(() => {
    if (globalZone && globalZone !== 'ALL') {
      setForm(prev => ({ ...prev, zone: globalZone }));
    } else if (currentZones && currentZones.length > 0 && (!form.zone || !currentZones.includes(form.zone))) {
      setForm(prev => ({ ...prev, zone: currentZones[0] }));
    }
  }, [globalZone, currentZones, form.zone]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedWO = workorders.find(w => String(w.workorderNumber) === String(form.wo));

  // Auto-calculation
  const reworkQty = parseFloat(form.reworkQty) || 0;
  const checkedQty = parseFloat(form.checkedQty) || 0;
  const reworkPercent = checkedQty > 0 ? ((reworkQty / checkedQty) * 100).toFixed(2) : '0.00';

  const handleSubmit = async (e: React.FormEvent, moveToInline: boolean = false) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!form.wo) {
      alert("Please select a workorder");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { 
        ...form, 
        ...selectedWO, 
        reworkPercent,
        inspector: user.username, 
        timestamp: new Date().toISOString(),
        moveToInline
      };

      await api.run('api_saveCUTTINGQUALITY', payload);
      
      triggerSuccess(moveToInline ? 'DATA SAVED & MOVED TO INLINE' : 'CUTTING DATA SAVED');
      if (refreshData) {
        await refreshData();
      }
      
      // Reset form but keep zone
      setForm(prev => ({ 
        ...prev, 
        wo: '',
        bundleNo: '', 
        checkedQty: '', 
        reworkQty: '', 
        rejectedQty: '', 
        remarks: '' 
      }));
    } catch (error) {
      alert('Error saving cutting report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zone Selection</label>
          <select 
            value={form.zone} 
            onChange={e => setForm({...form, zone: e.target.value})}
            className="w-full bg-white border-2 border-slate-100 focus:border-indigo-500 rounded-xl font-bold"
          >
            <option value="">Select Zone...</option>
            {currentZones.map((z: string) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Workorder #</label>
          <select 
            value={form.wo} 
            onChange={e => setForm({...form, wo: e.target.value})} 
            required
            className="w-full bg-white border-2 border-slate-100 focus:border-indigo-500 rounded-xl font-bold"
          >
            <option value="">Select Workorder...</option>
            {workorders
              .filter(w => {
                const wZone = String(w.zone || w.location || "").toUpperCase().trim();
                const fZone = String(form.zone).toUpperCase().trim();
                const status = String(w.status || "").toUpperCase();
                return wZone === fZone && (status === 'CUTTING' || status === '');
              })
              .map(w => <option key={w.id} value={w.workorderNumber}>{w.workorderNumber}</option>)
            }
          </select>
        </div>
      </div>

      {selectedWO && (
        <div className="animate-zoom-in">
          <WorkorderDetailCard wo={selectedWO} settings={settings} />
        </div>
      )}

      {/* Entry Fields */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 mb-4">
          <Icon name="scissors" size={16} className="text-indigo-600" />
          Cutting Inspection Data
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Bundle No</label>
            <input 
              type="text" 
              placeholder="Bundle No" 
              value={form.bundleNo} 
              onChange={e => setForm({...form, bundleNo: e.target.value})} 
              required 
              className="w-full text-sm font-bold bg-slate-50 border-transparent focus:bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Pcs Checked</label>
            <input 
              type="number" 
              placeholder="0" 
              value={form.checkedQty} 
              onChange={e => setForm({...form, checkedQty: e.target.value})} 
              required 
              className="w-full text-sm font-bold bg-slate-50 border-transparent focus:bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Pcs Rework</label>
            <input 
              type="number" 
              placeholder="0" 
              value={form.reworkQty} 
              onChange={e => setForm({...form, reworkQty: e.target.value})} 
              required 
              className="w-full text-sm font-bold bg-indigo-50 border-transparent focus:bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Pcs Rejected</label>
            <input 
              type="number" 
              placeholder="0" 
              value={form.rejectedQty} 
              onChange={e => setForm({...form, rejectedQty: e.target.value})} 
              required 
              className="w-full text-sm font-bold bg-rose-50 border-transparent focus:bg-white"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
               <Icon name="percent" size={18} />
             </div>
             <div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Automatic Calculation</p>
               <p className="text-sm font-black text-indigo-600 uppercase">Rework Percentage</p>
             </div>
          </div>
          <div className={`px-6 py-2 rounded-xl text-3xl font-black ${reworkQty > 0 ? 'text-indigo-600 bg-indigo-50' : 'text-slate-300 bg-slate-50 border-2 border-dashed border-slate-200'}`}>
            {reworkPercent}%
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inspector Remarks</label>
        <textarea 
          placeholder="Enter any additional remarks here..." 
          value={form.remarks} 
          onChange={e => setForm({...form, remarks: e.target.value})} 
          className="w-full min-h-[100px] bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all font-medium text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={(e) => handleSubmit(e, false)}
          disabled={isSubmitting}
          className="btn-secondary py-5 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 border-2 border-slate-200 hover:border-slate-300"
        >
          {isSubmitting ? (
             <Icon name="refresh-cw" size={18} className="animate-spin" />
          ) : (
            <><Icon name="save" size={18} /> Submit Only</>
          )}
        </button>
        <button 
          onClick={(e) => handleSubmit(e, true)}
          disabled={isSubmitting}
          className="btn-primary py-5 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-indigo-200"
        >
          {isSubmitting ? (
             <Icon name="refresh-cw" size={18} className="animate-spin" />
          ) : (
            <><Icon name="check-circle" size={18} /> Pass to Inline & Endline</>
          )}
        </button>
      </div>
    </div>
  );
};

export default CuttingQuality;
