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

const normalizeStatus = (statusStr: string): string => {
  return String(statusStr || "")
    .toUpperCase()
    .trim()
    .replace(/&/g, "AND")
    .replace(/[^A-Z0-9]/g, "");
};

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

  const [cuttingRecords, setCuttingRecords] = useState<any[]>([]);
  const [zoneMappings, setZoneMappings] = React.useState<any[]>([]);

  // Load ZONE sheet mappings for dynamic filtering
  React.useEffect(() => {
    const loadZoneMappings = async () => {
      try {
        const res = await api.run('api_getZoneMappings');
        if (Array.isArray(res)) {
          setZoneMappings(res);
        }
      } catch (e) {
        console.error("Failed to load zone mappings in Cutting:", e);
      }
    };
    loadZoneMappings();
  }, []);

  const fetchCuttingRecords = async () => {
    try {
      const res = await api.run('api_getCuttingData');
      if (Array.isArray(res)) {
        setCuttingRecords(res);
      }
    } catch (e) {
      console.error("Failed to fetch cutting records:", e);
    }
  };

  React.useEffect(() => {
    if (form.wo) {
      fetchCuttingRecords();
    }
  }, [form.wo]);

  // Auto-calculation
  const reworkQty = parseFloat(form.reworkQty) || 0;
  const checkedQty = parseFloat(form.checkedQty) || 0;
  const reworkPercent = checkedQty > 0 ? ((reworkQty / checkedQty) * 100).toFixed(2) : '0.00';

  const totalQty = Number(selectedWO?.quantity || selectedWO?.orderQty || 0);
  const previouslyChecked = cuttingRecords
    .filter(r => String(r.wo || r.workorderNumber) === String(form.wo))
    .reduce((sum, r) => sum + (Number(r.checkedQty) || 0), 0);
  const balanceQty = Math.max(0, totalQty - previouslyChecked);
  const remainingAfterCurrent = Math.max(0, balanceQty - checkedQty);

  const handleSubmit = async (e: React.FormEvent, moveToInline: boolean = false, passAndHold: boolean = false) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Compulsory field validation for all dropdowns, inputs, date selectors and remarks
    if (!form.zone) {
      alert("Please select a Zone");
      return;
    }
    if (!form.wo) {
      alert("Please select a Workorder");
      return;
    }
    
    // Only require bundle number and quantities if NOT passing and holding
    if (!passAndHold) {
      if (!form.bundleNo.trim()) {
        alert("Please enter Bundle No");
        return;
      }
      if (form.checkedQty === '' || form.checkedQty === null) {
        alert("Please enter Pcs Checked");
        return;
      }
      if (form.reworkQty === '' || form.reworkQty === null) {
        alert("Please enter Pcs Rework");
        return;
      }
      if (form.rejectedQty === '' || form.rejectedQty === null) {
        alert("Please enter Pcs Rejected");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = { 
        ...form, 
        ...selectedWO, 
        bundleNo: form.bundleNo || 'N/A',
        checkedQty: form.checkedQty === '' ? '0' : form.checkedQty,
        reworkQty: form.reworkQty === '' ? '0' : form.reworkQty,
        rejectedQty: form.rejectedQty === '' ? '0' : form.rejectedQty,
        reworkPercent: form.checkedQty ? reworkPercent : '0.00',
        inspector: user.username, 
        timestamp: new Date().toISOString(),
        moveToInline,
        passAndHold
      };

      await api.run('api_saveCUTTINGQUALITY', payload);
      
      triggerSuccess(passAndHold ? 'DATA SAVED & PASSED (HELD IN CUTTING)' : 'DATA SAVED & MOVED TO INLINE & ENDLINE');
      if (refreshData) {
        await refreshData();
      }
      await fetchCuttingRecords();
      
      // Reset form but keep zone (and keep workorder selected if passAndHold is true)
      setForm(prev => ({ 
        ...prev, 
        wo: passAndHold ? prev.wo : '',
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
                const status = normalizeStatus(w.status);
                
                let matchesZone = wZone === fZone;
                if (!matchesZone && zoneMappings.length > 0 && fZone !== '') {
                  const matchingRows = zoneMappings.filter(m => 
                    String(m.zone || '').toUpperCase().trim() === fZone || 
                    String(m.id || '').toUpperCase().trim() === fZone
                  );
                  matchesZone = matchingRows.some(m => 
                    String(m.zone || '').toUpperCase().trim() === wZone || 
                    String(m.id || '').toUpperCase().trim() === wZone
                  );
                }

                return matchesZone && (
                  status === 'CUTTING' || 
                  status === '' || 
                  status === 'PASSANDHOLD' || 
                  status.includes('HOLD')
                );
              })
              .map(w => <option key={w.id} value={w.workorderNumber}>{w.workorderNumber}</option>)
            }
          </select>
        </div>
      </div>

      {selectedWO && (
        <div className="space-y-4">
          <div className="animate-zoom-in">
            <WorkorderDetailCard wo={selectedWO} settings={settings} />
          </div>
          
          <div className="bg-slate-50 border border-slate-200/85 rounded-2xl p-5 space-y-3 animate-fade-in">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="activity" size={14} className="text-indigo-650" />
              Cutting Balance Quantity Status
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Total WO Qty</span>
                <span className="text-base font-black text-slate-800">{totalQty}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Inspected So Far</span>
                <span className="text-base font-black text-emerald-600">{previouslyChecked}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Remaining Balance</span>
                <span className="text-base font-black text-indigo-600">{balanceQty}</span>
              </div>
              <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50 shadow-xs">
                <span className="text-[9px] font-bold text-indigo-500 uppercase block">Balance After Submission</span>
                <span className="text-base font-black text-indigo-700">{remainingAfterCurrent}</span>
              </div>
            </div>
          </div>
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
          onClick={(e) => handleSubmit(e, true, true)}
          disabled={isSubmitting}
          className="btn-secondary py-5 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 border-2 border-indigo-200 hover:border-indigo-300 text-indigo-700 bg-indigo-50/50"
        >
          {isSubmitting ? (
             <Icon name="refresh-cw" size={18} className="animate-spin" />
          ) : (
            <><Icon name="save" size={18} /> Pass & Hold</>
          )}
        </button>
        <button 
          onClick={(e) => handleSubmit(e, true, false)}
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
