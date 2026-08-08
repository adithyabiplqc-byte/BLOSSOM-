import React, { useState } from 'react';
import { api } from '../services/api';
import { ZONES } from '../constants';
import Icon from './Icon';
import WorkorderDetailCard from './WorkorderDetailCard';
import SearchableSelect from './SearchableSelect';

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

  // Tab state: 'PRECUTTING' or 'CUTTING'
  const [activeSubmodule, setActiveSubmodule] = useState<'PRECUTTING' | 'CUTTING'>('PRECUTTING');

  // Submodule 1: PRECUTTING QUALITY Form State
  const [formPre, setFormPre] = useState({
    zone: (globalZone && globalZone !== 'ALL') ? globalZone : (currentZones[0] || ''),
    wo: '',
    fabricType: '',
    relaxingTime: '',
    cuttableWidth: '',
    layLength: '',
    shade: '',
    chkLayLength: false,
    chkAlignment: false,
    chkPlyCount: false,
    chkMarker: false,
    chkRatio: false,
    remarks: ''
  });

  // Submodule 2: CUTTING QUALITY Form State
  const [form, setForm] = useState({ 
    zone: (globalZone && globalZone !== 'ALL') ? globalZone : (currentZones[0] || ''), 
    wo: '', 
    fabricType: '',
    bundleNo: '', 
    checkedQty: '', 
    reworkQty: '', 
    rejectedQty: '', 
    remarks: '' 
  });

  // Sync zones with global zone
  React.useEffect(() => {
    if (globalZone && globalZone !== 'ALL') {
      setForm(prev => ({ ...prev, zone: globalZone }));
      setFormPre(prev => ({ ...prev, zone: globalZone }));
    } else if (currentZones && currentZones.length > 0) {
      if (!form.zone || !currentZones.includes(form.zone)) {
        setForm(prev => ({ ...prev, zone: currentZones[0] }));
      }
      if (!formPre.zone || !currentZones.includes(formPre.zone)) {
        setFormPre(prev => ({ ...prev, zone: currentZones[0] }));
      }
    }
  }, [globalZone, currentZones, form.zone, formPre.zone]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected workorders for each submodule
  const selectedWOPre = workorders.find(w => String(w.id) === String(formPre.wo) || String(w.workorderNumber) === String(formPre.wo));
  const selectedWO = workorders.find(w => String(w.id) === String(form.wo) || String(w.workorderNumber) === String(form.wo));

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

  // Fetch records whenever relevant fields change
  React.useEffect(() => {
    fetchCuttingRecords();
  }, [form.wo, formPre.wo, form.zone, formPre.zone]);

  // Submodule 2 (Cutting Quality) Calculations
  const reworkQty = parseFloat(form.reworkQty) || 0;
  const rejectedQty = parseFloat(form.rejectedQty) || 0;
  const checkedQty = parseFloat(form.checkedQty) || 0;
  const reworkPercent = checkedQty > 0 ? ((reworkQty / checkedQty) * 100).toFixed(2) : '0.00';
  const rejectionPercent = checkedQty > 0 ? ((rejectedQty / checkedQty) * 100).toFixed(2) : '0.00';

  const totalQty = Number(selectedWO?.quantity || selectedWO?.orderQty || 0);
  const previouslyChecked = cuttingRecords
    .filter(r => String(r.wo || r.workorderNumber) === String(form.wo))
    .reduce((sum, r) => sum + (Number(r.checkedQty) || 0), 0);
  const balanceQty = Math.max(0, totalQty - previouslyChecked);
  const remainingAfterCurrent = Math.max(0, balanceQty - checkedQty);

  // Submit Handler for PRECUTTING Quality
  const handleSubmitPre = async (e: React.FormEvent, passAndHold: boolean = false) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formPre.zone) {
      alert("Please select a Zone");
      return;
    }
    if (!formPre.wo) {
      alert("Please select a Workorder");
      return;
    }
    if (!formPre.fabricType) {
      alert("Please select Fabric Type");
      return;
    }

    if (formPre.fabricType === 'Inner Fabric') {
      if (!formPre.relaxingTime.trim()) {
        alert("Please enter Relaxing Time");
        return;
      }
    }

    if (formPre.fabricType === 'Inner Fabric' || formPre.fabricType === 'Outer Fabric') {
      if (!formPre.cuttableWidth.trim()) {
        alert("Please enter Cuttable Width");
        return;
      }
      if (!formPre.layLength.trim()) {
        alert("Please enter Lay Length");
        return;
      }
      if (!formPre.shade.trim()) {
        alert("Please enter Shade");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...selectedWOPre,
        id: 'cut-pre-' + Math.random().toString(36).substring(2) + '-' + Date.now(),
        workorderNumber: selectedWOPre?.workorderNumber || formPre.wo,
        submodule: 'PRECUTTING',
        zone: formPre.zone,
        wo: formPre.wo,
        checkingDate: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        inspector: user.username,
        fabricType: formPre.fabricType,
        relaxingTime: formPre.relaxingTime || 'N/A',
        cuttableWidth: formPre.cuttableWidth || 'N/A',
        layLength: formPre.layLength || 'N/A',
        shade: formPre.shade || 'N/A',
        layLengthCheck: formPre.chkLayLength ? 'PASS' : 'FAIL',
        alignmentCheck: formPre.chkAlignment ? 'PASS' : 'FAIL',
        plyCountCheck: formPre.chkPlyCount ? 'PASS' : 'FAIL',
        markerCheck: formPre.chkMarker ? 'PASS' : 'FAIL',
        ratioCheck: formPre.chkRatio ? 'PASS' : 'FAIL',
        checkedQty: 0,
        reworkQty: 0,
        rejectedQty: 0,
        passQty: 0,
        failQty: 0,
        remarks: formPre.remarks || 'N/A',
        passAndHold: passAndHold
      };

      await api.run('api_saveCUTTINGQUALITY', payload);

      triggerSuccess(passAndHold ? 'PRE-CUTTING DATA SAVED & PASSED (HELD IN PRE-CUTTING)' : 'PRE-CUTTING DATA SAVED & PASSED TO CUTTING');
      if (refreshData) {
        await refreshData();
      }
      await fetchCuttingRecords();

      // Reset Precutting form but keep zone and selected workorder if passAndHold is true
      setFormPre(prev => ({
        ...prev,
        wo: passAndHold ? prev.wo : '',
        fabricType: '',
        relaxingTime: '',
        cuttableWidth: '',
        layLength: '',
        shade: '',
        chkLayLength: false,
        chkAlignment: false,
        chkPlyCount: false,
        chkMarker: false,
        chkRatio: false,
        remarks: ''
      }));
    } catch (error) {
      alert('Error saving precutting report');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Handler for CUTTING Quality
  const handleSubmit = async (e: React.FormEvent, moveToInline: boolean = false, passAndHold: boolean = false) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Compulsory field validation
    if (!form.zone) {
      alert("Please select a Zone");
      return;
    }
    if (!form.wo) {
      alert("Please select a Workorder");
      return;
    }
    
    // Only require fabric type and quantities if NOT passing and holding
    if (!passAndHold) {
      if (!form.fabricType) {
        alert("Please select Fabric Type (Inner or Outer)");
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
        ...selectedWO, 
        ...form, 
        id: 'cut-main-' + Math.random().toString(36).substring(2) + '-' + Date.now(),
        workorderNumber: selectedWO?.workorderNumber || form.wo,
        fabricType: form.fabricType || 'N/A',
        bundleNo: form.bundleNo || 'N/A',
        checkedQty: form.checkedQty === '' ? '0' : form.checkedQty,
        reworkQty: form.reworkQty === '' ? '0' : form.reworkQty,
        rejectedQty: form.rejectedQty === '' ? '0' : form.rejectedQty,
        reworkPercent: form.checkedQty ? reworkPercent : '0.00',
        rejectionPercent: form.checkedQty ? rejectionPercent : '0.00',
        inspector: user.username, 
        timestamp: new Date().toISOString(),
        checkingDate: new Date().toISOString().split('T')[0],
        moveToInline,
        passAndHold,
        submodule: 'CUTTING'
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
        fabricType: '',
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

  // Helper lists for our checkpoints
  const checkpoints = [
    { key: 'chkLayLength', label: 'Lay Length Check' },
    { key: 'chkAlignment', label: 'Alignment Check' },
    { key: 'chkPlyCount', label: 'Ply Count Check' },
    { key: 'chkMarker', label: 'Marker Check' },
    { key: 'chkRatio', label: 'Ratio Check' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Submodule Tab Selector */}
      <div className="flex bg-slate-100 p-1 rounded-xl shadow-xs">
        <button
          type="button"
          onClick={() => setActiveSubmodule('PRECUTTING')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeSubmodule === 'PRECUTTING'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
          }`}
        >
          <Icon name="scissors" size={16} />
          1) Precutting Quality
        </button>
        <button
          type="button"
          onClick={() => setActiveSubmodule('CUTTING')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeSubmodule === 'CUTTING'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
          }`}
        >
          <Icon name="activity" size={16} />
          2) Cutting Quality
        </button>
      </div>

      {/* SUBMODULE 1: PRECUTTING QUALITY VIEW */}
      {activeSubmodule === 'PRECUTTING' && (
        <div className="space-y-6">
          {/* Header Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-150 shadow-sm">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zone Selection</label>
              <SearchableSelect 
                value={formPre.zone} 
                onChange={e => setFormPre({...formPre, zone: e.target.value, wo: ''})}
                className="w-full bg-white border-2 border-slate-150 focus:border-indigo-500 rounded-xl font-bold"
              >
                <option value="">Select Zone...</option>
                {currentZones.map((z: string) => <option key={z} value={z}>{z}</option>)}
              </SearchableSelect>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Workorder #</label>
              <SearchableSelect 
                value={formPre.wo} 
                onChange={e => setFormPre({...formPre, wo: e.target.value})} 
                required
                className="w-full bg-white border-2 border-slate-150 focus:border-indigo-500 rounded-xl font-bold"
              >
                <option value="">Select Workorder...</option>
                {workorders
                  .filter(w => {
                    const wZone = String(w.zone || w.location || "").toUpperCase().trim();
                    const fZone = String(formPre.zone).toUpperCase().trim();
                    
                    let matchesZone = (fZone === '' || fZone === 'ALL' || wZone === fZone);
                    if (!matchesZone && zoneMappings.length > 0 && fZone !== '' && fZone !== 'ALL') {
                      const matchingRows = zoneMappings.filter(m => 
                        String(m.zone || '').toUpperCase().trim() === fZone || 
                        String(m.id || '').toUpperCase().trim() === fZone
                      );
                      matchesZone = matchingRows.some(m => 
                        String(m.zone || '').toUpperCase().trim() === wZone || 
                        String(m.id || '').toUpperCase().trim() === wZone
                      );
                    }

                    // Precutting dropdown shows workorders needing Precutting (PRECUTTING, CUTTING) or held in Precutting/Cutting (PRECUTTINGPASSANDHOLD, CUTTINGPASSANDHOLD, PASSANDHOLD, HOLD)
                    const status = String(w.status || 'PRECUTTING').toUpperCase().replace(/[^A-Z0-9]/g, '');
                    const matchesStatus = (
                      status === 'PRECUTTING' || 
                      status === 'CUTTING' || 
                      status === 'PRECUTTINGPASSANDHOLD' || 
                      status === 'CUTTINGPASSANDHOLD' ||
                      status === 'PASSANDHOLD' ||
                      status.includes('HOLD')
                    );
                    return matchesZone && matchesStatus;
                  })
                  .map(w => (
                    <option key={w.id} value={w.id || w.workorderNumber}>
                      {w.workorderNumber} ({w.style || w.styleName || w.itemName || w.item || 'N/A'})
                    </option>
                  ))
                }
              </SearchableSelect>
            </div>
          </div>

          {selectedWOPre && (
            <div className="space-y-4">
              <div className="animate-zoom-in">
                <WorkorderDetailCard wo={selectedWOPre} settings={settings} />
              </div>
            </div>
          )}

          {/* Precutting Fields */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 mb-4">
              <Icon name="scissors" size={16} className="text-indigo-600" />
              Precutting Fabrication Assessment
            </h3>

            {/* Fabric Type Dropbox Selection */}
            <div className="space-y-1 max-w-md">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fabric Type Selection</label>
              <select
                value={formPre.fabricType}
                onChange={e => setFormPre({...formPre, fabricType: e.target.value})}
                required
                className="w-full bg-slate-50 border-2 border-slate-150 rounded-xl font-bold py-2.5 px-3 focus:border-indigo-500 transition-all font-sans text-xs"
              >
                <option value="">Select Fabric...</option>
                <option value="Inner Fabric">Inner Fabric</option>
                <option value="Outer Fabric">Outer Fabric</option>
              </select>
            </div>

            {/* Conditionally rendered inputs for Inner Fabric or Outer Fabric */}
            {(formPre.fabricType === 'Inner Fabric' || formPre.fabricType === 'Outer Fabric') && (
              <div className={`grid grid-cols-1 ${formPre.fabricType === 'Inner Fabric' ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-150 animate-fade-in`}>
                {formPre.fabricType === 'Inner Fabric' && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Relaxing Time</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 24 Hours" 
                      value={formPre.relaxingTime} 
                      onChange={e => setFormPre({...formPre, relaxingTime: e.target.value})} 
                      required 
                      className="w-full text-xs font-bold bg-white border-2 border-slate-150 rounded-xl py-2 px-3 focus:border-indigo-500 outline-none"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Cuttable Width</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 58 inches" 
                    value={formPre.cuttableWidth} 
                    onChange={e => setFormPre({...formPre, cuttableWidth: e.target.value})} 
                    required 
                    className="w-full text-xs font-bold bg-white border-2 border-slate-150 rounded-xl py-2 px-3 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Lay Length</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 3.2 meters" 
                    value={formPre.layLength} 
                    onChange={e => setFormPre({...formPre, layLength: e.target.value})} 
                    required 
                    className="w-full text-xs font-bold bg-white border-2 border-slate-150 rounded-xl py-2 px-3 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Shade</label>
                  <input 
                    type="text" 
                    placeholder="e.g. A, B, C" 
                    value={formPre.shade} 
                    onChange={e => setFormPre({...formPre, shade: e.target.value})} 
                    required 
                    className="w-full text-xs font-bold bg-white border-2 border-slate-150 rounded-xl py-2 px-3 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Assessment Checkpoints Redesigned to look extremely attractive */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 space-y-4">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <Icon name="check-square" size={14} className="text-indigo-650" />
                Assessment Check Points
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {checkpoints.map(cp => {
                  const val = formPre[cp.key as keyof typeof formPre] as boolean;
                  return (
                    <button
                      key={cp.key}
                      type="button"
                      onClick={() => setFormPre(prev => ({ ...prev, [cp.key]: !val }))}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 shadow-sm cursor-pointer select-none relative overflow-hidden ${
                        val
                          ? 'bg-emerald-50/70 border-emerald-500 text-emerald-900 shadow-emerald-100/50'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-all ${
                        val ? 'bg-emerald-500 text-white scale-110' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Icon name={val ? "check" : "minus"} size={16} className={val ? "stroke-[3px]" : ""} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-center leading-tight">{cp.label}</span>
                      {val && (
                        <div className="absolute top-1 right-1">
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inspector Remarks</label>
            <textarea 
              placeholder="Enter Precutting remarks..." 
              value={formPre.remarks} 
              onChange={e => setFormPre({...formPre, remarks: e.target.value})} 
              className="w-full min-h-[100px] bg-slate-50 border-2 border-slate-150 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all font-medium text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={(e) => handleSubmitPre(e, true)}
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
              onClick={(e) => handleSubmitPre(e, false)}
              disabled={isSubmitting}
              className="btn-primary py-5 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-indigo-200"
            >
              {isSubmitting ? (
                <Icon name="refresh-cw" size={18} className="animate-spin" />
              ) : (
                <><Icon name="check-circle" size={18} /> Pass to Cutting</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* SUBMODULE 2: CUTTING QUALITY VIEW */}
      {activeSubmodule === 'CUTTING' && (
        <div className="space-y-8">
          {/* Header Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-150 shadow-sm">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zone Selection</label>
              <SearchableSelect 
                value={form.zone} 
                onChange={e => setForm({...form, zone: e.target.value, wo: ''})}
                className="w-full bg-white border-2 border-slate-150 focus:border-indigo-500 rounded-xl font-bold"
              >
                <option value="">Select Zone...</option>
                {currentZones.map((z: string) => <option key={z} value={z}>{z}</option>)}
              </SearchableSelect>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Workorder #</label>
              <SearchableSelect 
                value={form.wo} 
                onChange={e => setForm({...form, wo: e.target.value})} 
                required
                className="w-full bg-white border-2 border-slate-150 focus:border-indigo-500 rounded-xl font-bold"
              >
                <option value="">Select Workorder...</option>
                {workorders
                  .filter(w => {
                    const wZone = String(w.zone || w.location || "").toUpperCase().trim();
                    const fZone = String(form.zone).toUpperCase().trim();
                    
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

                    // Main Cutting dropdown shows workorders passed from Precutting, held in Precutting/Cutting (PRECUTTINGPASSANDHOLD, CUTTINGPASSANDHOLD, PASSANDHOLD, HOLD), or CUTTING
                    const status = String(w.status || 'CUTTING').toUpperCase().replace(/[^A-Z0-9]/g, '');
                    const matchesStatus = (
                      status === 'PRECUTTINGPASSED' || 
                      status === 'PRECUTTINGPASSANDHOLD' || 
                      status === 'CUTTINGPASSANDHOLD' || 
                      status === 'CUTTING' || 
                      status === 'PASSANDHOLD' ||
                      status.includes('HOLD')
                    );
                    return matchesZone && matchesStatus;
                  })
                  .map(w => (
                    <option key={w.id} value={w.id || w.workorderNumber}>
                      {w.workorderNumber} ({w.style || w.styleName || w.itemName || w.item || 'N/A'})
                    </option>
                  ))
                }
              </SearchableSelect>
            </div>
          </div>

          {selectedWO && (
            <div className="space-y-4">
              <div className="animate-zoom-in">
                <WorkorderDetailCard wo={selectedWO} settings={settings} />
              </div>
              
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 animate-fade-in">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Icon name="activity" size={14} className="text-indigo-650" />
                  Cutting Balance Quantity Status
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-3 rounded-xl border border-slate-150 shadow-xs">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Total WO Qty</span>
                    <span className="text-base font-black text-slate-800">{totalQty}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-150 shadow-xs">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Inspected So Far</span>
                    <span className="text-base font-black text-emerald-650">{previouslyChecked}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-150 shadow-xs">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Remaining Balance</span>
                    <span className="text-base font-black text-indigo-650">{balanceQty}</span>
                  </div>
                  <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-150 shadow-xs">
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Fabric Category</label>
                <select
                  value={form.fabricType}
                  onChange={e => setForm({...form, fabricType: e.target.value})}
                  required
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                >
                  <option value="">Select Fabric...</option>
                  <option value="Inner Fabric">Inner Fabric</option>
                  <option value="Outer Fabric">Outer Fabric</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Pcs Checked</label>
                <input 
                  type="number" 
                  placeholder="0" 
                  value={form.checkedQty} 
                  onChange={e => setForm({...form, checkedQty: e.target.value})} 
                  required 
                  className="w-full text-sm font-bold bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
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
                  className="w-full text-sm font-bold bg-indigo-50/50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:border-indigo-500 outline-none text-indigo-900"
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
                  className="w-full text-sm font-bold bg-rose-50/50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:border-indigo-500 outline-none text-rose-900"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Icon name="percent" size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Automatic Calculation</p>
                    <p className="text-xs font-black text-indigo-700 uppercase">Rework Percentage</p>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-lg text-2xl font-black ${reworkQty > 0 ? 'text-indigo-700 bg-white shadow-xs' : 'text-slate-400 bg-slate-100'}`}>
                  {reworkPercent}%
                </div>
              </div>

              <div className="flex items-center justify-between bg-rose-50/60 p-4 rounded-xl border border-rose-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <Icon name="percent" size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Automatic Calculation</p>
                    <p className="text-xs font-black text-rose-700 uppercase">Rejection Percentage</p>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-lg text-2xl font-black ${rejectedQty > 0 ? 'text-rose-700 bg-white shadow-xs' : 'text-slate-400 bg-slate-100'}`}>
                  {rejectionPercent}%
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inspector Remarks</label>
            <textarea 
              placeholder="Enter any additional remarks here..." 
              value={form.remarks} 
              onChange={e => setForm({...form, remarks: e.target.value})} 
              className="w-full min-h-[100px] bg-slate-50 border-2 border-slate-150 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all font-medium text-sm"
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
      )}

      {/* STUNNING HISTORICAL LOGS TABLE AT THE BOTTOM ("what is in sheet need to show here") */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 mt-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <Icon name="database" size={16} className="text-indigo-650" />
              Logged Precutting & Cutting Quality Reports
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Live, real-time historical audit logs fetched directly from Google Sheets.</p>
          </div>
          <button
            type="button"
            onClick={fetchCuttingRecords}
            className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
            title="Refresh logs from sheet"
          >
            <Icon name="refresh-cw" size={12} />
            Refresh Logs
          </button>
        </div>

        {cuttingRecords.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Icon name="inbox" size={32} className="mx-auto text-slate-350 mb-2" />
            <p className="text-xs font-bold text-slate-450">No logs found in the sheet for this zone.</p>
          </div>
        ) : (
          <div className="border border-slate-150 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-150 tracking-wider">
                  <th className="py-3.5 px-4">Workorder #</th>
                  <th className="py-3.5 px-4 text-center">Quantities (Chkd / Rw / Rej / Rw% / Rej%)</th>
                  <th className="py-3.5 px-4">Details</th>
                  <th className="py-3.5 px-4">Module</th>
                  <th className="py-3.5 px-4">Date / Time</th>
                  <th className="py-3.5 px-4 text-right">Inspector / Zone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {(() => {
                  const currentActiveZone = form.zone || formPre.zone;
                  const filteredRecs = cuttingRecords.filter(rec => {
                    if (!currentActiveZone || currentActiveZone === 'ALL') return true;
                    const rZone = String(rec.zone || rec.location || '').toUpperCase().trim();
                    const cZone = String(currentActiveZone).toUpperCase().trim();
                    return rZone === cZone || rZone === '' || cZone === '';
                  });

                  const seenKeys = new Set();
                  const uniqueRecs: any[] = [];
                  filteredRecs.forEach(rec => {
                    const key = rec.id || `${rec.wo || rec.workorderNumber}_${rec.timestamp || rec.checkingDate}_${rec.submodule}_${rec.bundleNo || ''}_${rec.reworkQty || ''}_${rec.checkedQty || ''}`;
                    if (!seenKeys.has(key)) {
                      seenKeys.add(key);
                      uniqueRecs.push(rec);
                    }
                  });

                  return uniqueRecs
                    .sort((a, b) => new Date(b.timestamp || b.checkingDate).getTime() - new Date(a.timestamp || a.checkingDate).getTime())
                    .map((rec, index) => {
                      const isPre = String(rec.submodule).toUpperCase() === 'PRECUTTING';
                      const checkingDate = rec.checkingDate || (rec.timestamp ? rec.timestamp.split('T')[0] : 'N/A');
                      const chk = Number(rec.checkedQty || 0);
                      const rw = Number(rec.reworkQty || 0);
                      const rej = Number(rec.rejectedQty || 0);
                      const rwPct = chk > 0 ? ((rw / chk) * 100).toFixed(1) + '%' : '0.0%';
                      const rejPct = chk > 0 ? ((rej / chk) * 100).toFixed(1) + '%' : '0.0%';
                      return (
                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-black text-indigo-650">{rec.wo || rec.workorderNumber}</p>
                            <p className="text-[10px] font-bold text-slate-500">{rec.style || 'N/A'}</p>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isPre ? (
                              <span className="text-slate-400 text-[10px] italic">Pre-cutting Assessment</span>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 text-[10px] font-black">
                                <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded" title="Checked">{chk}</span>
                                <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded" title="Rework">{rw}</span>
                                <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded" title="Rejected">{rej}</span>
                                <span className="bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded" title="Rework %">Rw: {rwPct}</span>
                                <span className="bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded" title="Rejection %">Rej: {rejPct}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 max-w-[200px] truncate">
                            {isPre ? (
                              <div className="space-y-0.5 text-[10px]">
                                <p className="font-bold text-slate-600"><span className="text-slate-400">Fabric:</span> {rec.fabricType}</p>
                                <p className="text-slate-500">
                                  Checks: {rec.layLengthCheck === 'PASS' ? '✅' : '❌'} Lay | {rec.alignmentCheck === 'PASS' ? '✅' : '❌'} Align | {rec.plyCountCheck === 'PASS' ? '✅' : '❌'} Ply
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-0.5 text-[10px]">
                                {rec.fabricType && rec.fabricType !== 'N/A' && <p className="font-bold text-slate-600"><span className="text-slate-400">Fabric:</span> {rec.fabricType}</p>}
                                {rec.bundleNo && rec.bundleNo !== 'N/A' && <p className="font-bold text-slate-600"><span className="text-slate-400">Bundle:</span> {rec.bundleNo}</p>}
                                {rec.remarks && rec.remarks !== 'N/A' && <p className="text-slate-500 italic">"{rec.remarks}"</p>}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border ${
                              isPre 
                                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            }`}>
                              {rec.submodule || 'CUTTING'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-black text-slate-700">{checkingDate}</p>
                            <p className="text-[9px] text-slate-450 font-medium">
                              {rec.timestamp ? rec.timestamp.split('T')[1]?.substring(0, 5) : ''}
                            </p>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <p className="font-bold text-slate-700">{rec.inspector || 'SYSTEM'}</p>
                            <p className="text-[10px] font-bold text-indigo-600 uppercase">{rec.zone || 'N/A'}</p>
                          </td>
                        </tr>
                      );
                    });
                })()}
              </tbody>
            </table>
            <div className="p-3 bg-slate-50 text-center text-[10px] text-slate-400 border-t border-slate-150 font-bold uppercase tracking-wider">
              Showing up to 15 most recent entries from Google Sheets
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CuttingQuality;
