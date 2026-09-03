import React, { useState, useMemo, useEffect } from 'react';
import { api } from '../services/api';
import { ZONES, UNITS, DEFECTS } from '../constants';
import Icon from './Icon';
import WorkorderDetailCard from './WorkorderDetailCard';
import SearchableSelect from './SearchableSelect';

interface AQLInspectionProps {
  user: any;
  settings: any;
  workorders: any[];
  triggerSuccess: (message: string) => void;
  globalZone?: string;
  refreshData?: () => void;
}

interface DefectEntry {
  defectType: string;
  minor: number;
  major: number;
}

// AQL Chart lookup based on Lot Size (Total Quantity) for AQL 1.5 System (Normal Inspection Level II)
const getAQLParameters = (lotSize: number) => {
  if (lotSize <= 8) return { sampleSize: 2, accept: 0, reject: 1 };
  if (lotSize >= 9 && lotSize <= 15) return { sampleSize: 3, accept: 0, reject: 1 };
  if (lotSize >= 16 && lotSize <= 25) return { sampleSize: 5, accept: 0, reject: 1 };
  if (lotSize >= 26 && lotSize <= 50) return { sampleSize: 8, accept: 0, reject: 1 };
  if (lotSize >= 51 && lotSize <= 90) return { sampleSize: 13, accept: 0, reject: 1 };
  if (lotSize >= 91 && lotSize <= 150) return { sampleSize: 20, accept: 0, reject: 1 };
  if (lotSize >= 151 && lotSize <= 280) return { sampleSize: 32, accept: 1, reject: 2 };
  if (lotSize >= 281 && lotSize <= 500) return { sampleSize: 50, accept: 2, reject: 3 };
  if (lotSize >= 501 && lotSize <= 1200) return { sampleSize: 80, accept: 3, reject: 4 };
  if (lotSize >= 1201 && lotSize <= 3200) return { sampleSize: 125, accept: 5, reject: 6 };
  if (lotSize >= 3201 && lotSize <= 10000) return { sampleSize: 200, accept: 7, reject: 8 };
  if (lotSize >= 10001 && lotSize <= 35000) return { sampleSize: 315, accept: 10, reject: 11 };
  if (lotSize >= 35001 && lotSize <= 150000) return { sampleSize: 500, accept: 14, reject: 15 };
  if (lotSize >= 150001) return { sampleSize: 800, accept: 21, reject: 22 };
  return { sampleSize: 32, accept: 1, reject: 2 };
};

const AQLInspection: React.FC<AQLInspectionProps> = ({ user, settings, workorders, triggerSuccess, globalZone, refreshData }) => {
  const hasSpreadsheet = localStorage.getItem('VITE_SPREADSHEET_ID') || localStorage.getItem('VITE_GAS_URL');
  const currentZones = useMemo(() => {
    const userZone = String(user?.zone || user?.location || '').trim().toUpperCase();
    if (user?.role !== 'ADMIN' && user?.zone !== 'COMMON' && userZone && userZone !== 'SYSTEM') {
      return [userZone];
    }
    const list = settings?.ZONE || settings?.ZONES || (hasSpreadsheet ? [] : ZONES);
    return list;
  }, [settings, hasSpreadsheet, user]);

  const currentUnits = useMemo(() => {
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

  const currentDefects = useMemo(() => {
    return settings?.DEFECTS || settings?.DEFECT || DEFECTS;
  }, [settings]);

  const [form, setForm] = useState({ 
    zone: (globalZone && globalZone !== 'ALL') ? globalZone : (currentZones[0] || ''), 
    wo: '', 
    unit: currentUnits[0] || '', 
    remarks: '' 
  });

  // State for adding a single defect entry
  const [defectType, setDefectType] = useState('');
  const [minorCount, setMinorCount] = useState('');
  const [majorCount, setMajorCount] = useState('');

  // Defect logs entered for this inspection
  const [defectLog, setDefectLog] = useState<DefectEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zoneMappings, setZoneMappings] = useState<any[]>([]);

  // Load zone mappings
  useEffect(() => {
    const loadZoneMappings = async () => {
      try {
        const res = await api.run('api_getZoneMappings');
        if (Array.isArray(res)) {
          setZoneMappings(res);
        }
      } catch (e) {
        console.error("Failed to load zone mappings in AQL:", e);
      }
    };
    loadZoneMappings();
  }, []);

  // Sync with globalZone
  useEffect(() => {
    if (globalZone && globalZone !== 'ALL') {
      setForm(prev => ({ ...prev, zone: globalZone }));
    } else if (currentZones && currentZones.length > 0 && (!form.zone || !currentZones.includes(form.zone))) {
      setForm(prev => ({ ...prev, zone: currentZones[0] }));
    }
  }, [globalZone, currentZones, form.zone]);

  useEffect(() => {
    if (currentUnits.length === 1 && form.unit !== currentUnits[0]) {
      setForm(prev => ({ ...prev, unit: currentUnits[0] }));
    } else if (!form.unit && currentUnits.length > 0) {
      setForm(prev => ({ ...prev, unit: currentUnits[0] }));
    }
  }, [currentUnits, form.unit]);

  // Reset defect entries when workorder changes
  useEffect(() => {
    setDefectLog([]);
    setDefectType('');
    setMinorCount('');
    setMajorCount('');
  }, [form.wo]);

  const selectedWO = workorders.find(w => String(w.id) === String(form.wo) || String(w.workorderNumber) === String(form.wo));

  // Lot Size from Workorder Quantity
  const lotSize = Number(selectedWO?.quantity || selectedWO?.orderQty || 0);

  // AQL parameters
  const aqlParams = useMemo(() => getAQLParameters(lotSize), [lotSize]);

  // Add a defect log entry
  const handleAddDefect = () => {
    if (!defectType) {
      alert("Please select a Defect Type");
      return;
    }
    const minor = parseInt(minorCount) || 0;
    const major = parseInt(majorCount) || 0;

    if (minor === 0 && major === 0) {
      alert("Please enter at least 1 Minor or Major defect count");
      return;
    }

    // Check if defect type already exists, if so merge them
    const existingIndex = defectLog.findIndex(d => d.defectType === defectType);
    if (existingIndex > -1) {
      const updatedLog = [...defectLog];
      updatedLog[existingIndex].minor += minor;
      updatedLog[existingIndex].major += major;
      setDefectLog(updatedLog);
    } else {
      setDefectLog([...defectLog, { defectType, minor, major }]);
    }

    // Reset inputs
    setDefectType('');
    setMinorCount('');
    setMajorCount('');
  };

  // Remove a defect log entry
  const handleRemoveDefect = (index: number) => {
    setDefectLog(defectLog.filter((_, i) => i !== index));
  };

  // Calculations
  const totalMinor = useMemo(() => defectLog.reduce((sum, d) => sum + d.minor, 0), [defectLog]);
  const totalMajor = useMemo(() => defectLog.reduce((sum, d) => sum + d.major, 0), [defectLog]);

  // Equivalent Major defects: 3 Minor defects = 1 Major defect
  const equivalentMajor = useMemo(() => {
    return totalMajor + Math.floor(totalMinor / 3);
  }, [totalMajor, totalMinor]);

  // Audit decision
  const isAuditPassed = useMemo(() => {
    return equivalentMajor <= aqlParams.accept;
  }, [equivalentMajor, aqlParams.accept]);

  // Submit audit report
  const handleSubmitReport = async (e: React.FormEvent, passAndHold?: boolean) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

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

    const auditStatus = isAuditPassed ? 'PASS' : 'FAIL';
    const moveToFinal = isAuditPassed && !passAndHold; // Only move to Final if passed and NOT hold

    setIsSubmitting(true);
    try {
      const resolvedWo = selectedWO?.workorderNumber || (form.wo.startsWith('wo-') ? (workorders.find(w => w.id === form.wo)?.workorderNumber || form.wo) : form.wo);
      const nextStatus = passAndHold ? 'AQL_PASS_AND_HOLD' : 'FINAL';

      const payload = {
        zone: form.zone,
        wo: resolvedWo,
        workorderNumber: resolvedWo,
        unit: form.unit,
        remarks: form.remarks || '',
        lotSize: lotSize,
        sampleSize: aqlParams.sampleSize,
        acceptLimit: aqlParams.accept,
        rejectLimit: aqlParams.reject,
        totalMinor: totalMinor,
        totalMajor: totalMajor,
        equivalentMajor: equivalentMajor,
        passQty: Math.max(0, aqlParams.sampleSize - (totalMajor + totalMinor)),
        failedPieces: totalMajor + totalMinor,
        defectLog: JSON.stringify(defectLog),
        auditStatus: auditStatus,
        moveToFinal: moveToFinal,
        passAndHold: passAndHold,
        inspector: user.username,
        timestamp: new Date().toISOString(),
        checkingDate: new Date().toISOString().split('T')[0]
      };

      await api.run('api_saveAQLREPORT', payload);
      if (selectedWO && isAuditPassed) {
        await api.run('api_updateWorkorder', { ...selectedWO, status: nextStatus });
      }

      if (refreshData) {
        await refreshData();
      }

      triggerSuccess(
        isAuditPassed
          ? (passAndHold ? `AQL AUDIT PASSED & HELD IN AQL.` : `AQL AUDIT PASSED! Workorder moved to Final Audit.`)
          : `AQL AUDIT FAILED. Logged defects saved.`
      );

      // Reset form but keep workorder selected if passAndHold is true
      setForm(prev => ({ ...prev, wo: passAndHold ? prev.wo : '', remarks: '' }));
      setDefectLog([]);
    } catch (error) {
      console.error("AQL Submit Error:", error);
      alert('Error saving AQL report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Configuration Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-150 shadow-sm">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zone Selection</label>
          <SearchableSelect 
            value={form.zone} 
            onChange={e => setForm({...form, zone: e.target.value, wo: ''})} 
            className="w-full bg-white border-2 border-slate-150 rounded-xl font-bold"
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
            className="w-full bg-white border-2 border-slate-150 rounded-xl font-bold"
          >
            <option value="">Select Workorder...</option>
            {workorders
              .filter(w => {
                const wStatus = String(w.status || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
                const matchesStatus = (wStatus === 'AQL' || wStatus === 'AQLPASSANDHOLD');
                if (!matchesStatus) {
                  return false;
                }

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
                
                return matchesZone;
              })
              .map(w => (
                <option key={w.id || w.workorderNumber} value={w.workorderNumber || w.id}>
                  {w.workorderNumber} ({w.style || w.styleName || w.itemName || w.item || 'N/A'})
                </option>
              ))
            }
          </SearchableSelect>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Selection</label>
          <SearchableSelect 
            value={form.unit} 
            onChange={e => setForm({...form, unit: e.target.value})} 
            className="w-full bg-white border-2 border-slate-150 rounded-xl font-bold"
          >
            {currentUnits.map((u: string) => <option key={u} value={u}>{u}</option>)}
          </SearchableSelect>
        </div>
      </div>

      {selectedWO && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-zoom-in">
          {/* Left: Workorder Information */}
          <WorkorderDetailCard wo={selectedWO} settings={settings} />

          {/* Right: Dynamic AQL Chart Parameters */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                  <Icon name="info" size={16} className="text-indigo-300" />
                  Dynamic AQL Parameters
                </h3>
                <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-200 px-3 py-1 rounded-full border border-indigo-400/20">
                  Standard 1.5 AQL Chart
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Lot Size</span>
                  <span className="text-2xl font-black text-indigo-300">{lotSize}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Pieces</span>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">SampleSize to Audit</span>
                  <span className="text-2xl font-black text-emerald-400">{aqlParams.sampleSize}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Pieces to pull</span>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Acceptance Limit</span>
                  <span className="text-2xl font-black text-emerald-500">≤ {aqlParams.accept}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Max allowed defects</span>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Rejection Threshold</span>
                  <span className="text-2xl font-black text-rose-400">≥ {aqlParams.reject}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Defects cause fail</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-300 flex items-center gap-1.5 leading-relaxed">
              <Icon name="shield" size={14} className="text-emerald-400 shrink-0" />
              <span>AQL parameters are automatically looked up in real-time as per your garment quality standard.</span>
            </div>
          </div>
        </div>
      )}

      {selectedWO && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Defect Dropbox Input */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 lg:col-span-1">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
              <Icon name="alert-triangle" size={16} className="text-indigo-600" />
              Defect Dropbox Selector
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Defect Category</label>
                <select
                  value={defectType}
                  onChange={e => setDefectType(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-150 rounded-xl font-bold py-3 px-3 focus:border-indigo-500 transition-all text-xs"
                >
                  <option value="">Select Defect...</option>
                  {currentDefects.map((d: string) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Minor Count</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={minorCount}
                    onChange={e => setMinorCount(e.target.value)}
                    className="w-full bg-slate-50 border-transparent focus:bg-white text-sm font-bold p-3 rounded-xl border border-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Major Count</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={majorCount}
                    onChange={e => setMajorCount(e.target.value)}
                    className="w-full bg-slate-50 border-transparent focus:bg-white text-sm font-bold p-3 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddDefect}
                className="w-full py-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-2 border-dashed border-indigo-200 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Icon name="plus" size={16} />
                Add Defect Log
              </button>
            </div>
          </div>

          {/* Column 2: Defect Log Display & Auto Calculation */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
                <Icon name="list" size={16} className="text-indigo-600" />
                Active Defect Log List
              </h3>

              {defectLog.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-150">
                  <Icon name="check-circle" size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-450">No defects logged for this inspection yet.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Select defect category, enter counts, and click Add.</p>
                </div>
              ) : (
                <div className="border border-slate-150 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-150 tracking-wider">
                        <th className="py-3.5 px-4">Defect Description</th>
                        <th className="py-3.5 px-4 text-center">Minor Count</th>
                        <th className="py-3.5 px-4 text-center">Major Count</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {defectLog.map((def, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 font-black text-slate-700">{def.defectType}</td>
                          <td className="py-3 px-4 text-center font-bold text-slate-600">{def.minor}</td>
                          <td className="py-3 px-4 text-center font-black text-indigo-600">{def.major}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveDefect(idx)}
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500 transition-colors"
                              title="Delete row"
                            >
                              <Icon name="trash" size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Advanced Conversions and Decisions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                {/* Equivalent Calculation card */}
                <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/50 space-y-1.5">
                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest"> Garment QC Rule Engine</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-indigo-700">{equivalentMajor}</span>
                    <span className="text-xs font-black text-indigo-500">Equivalent Major Defects</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Formula: <span className="font-bold text-indigo-600">Total Major ({totalMajor}) + Math.floor(Minor ({totalMinor}) / 3)</span>
                  </p>
                </div>

                {/* PASS / FAIL Live Decision Indicator */}
                <div className={`p-4 rounded-xl flex flex-col justify-center border transition-all ${
                  isAuditPassed 
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 shadow-sm shadow-emerald-100/50' 
                    : 'bg-rose-50/70 border-rose-250 text-rose-900 shadow-sm shadow-rose-100/50'
                }`}>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Automated Audit Decision</span>
                  
                  {isAuditPassed ? (
                    <div className="space-y-0.5 mt-1">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-black text-lg">
                        <Icon name="check-circle" size={20} className="stroke-[3px]" />
                        <span>AUDIT PASSED</span>
                      </div>
                      <p className="text-[9px] text-emerald-600 font-bold uppercase leading-none">
                        {defectLog.length === 0 
                          ? "No defects logged (Perfect quality)"
                          : `Defects (${equivalentMajor}) ≤ Accept Limit (${aqlParams.accept})`
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-0.5 mt-1">
                      <div className="flex items-center gap-1.5 text-rose-700 font-black text-lg">
                        <Icon name="x-circle" size={20} className="stroke-[3px]" />
                        <span>AUDIT FAILED</span>
                      </div>
                      <p className="text-[9px] text-rose-600 font-bold uppercase leading-none">
                        Defects ({equivalentMajor}) ≥ Reject Threshold ({aqlParams.reject})
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedWO && (
        <form onSubmit={handleSubmitReport} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Auditor Remarks</label>
            <textarea
              placeholder="Enter audit-specific comments or notes here..."
              value={form.remarks}
              onChange={e => setForm({...form, remarks: e.target.value})}
              className="w-full min-h-[100px] bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all font-medium text-sm"
            />
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-150 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md ${
                isAuditPassed 
                  ? 'bg-emerald-500 shadow-emerald-100' 
                  : 'bg-rose-500 shadow-rose-100'
              }`}>
                <Icon name={isAuditPassed ? "check-circle" : "alert-circle"} size={22} />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight leading-snug">
                  {isAuditPassed 
                    ? "AQL Audit Passed (Moving to Final Audit)" 
                    : "AQL Audit Failed (Workorder needs correction)"
                  }
                </h4>
                <p className="text-[10px] text-slate-400">
                  {isAuditPassed 
                    ? "Submitting this passed report will automatically move the workorder to 'FINAL' status." 
                    : "Submitting this failed report will record the defects. Workorder will remain in AQL."
                  }
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {isAuditPassed ? (
                <>
                  <button
                    type="button"
                    onClick={(e) => handleSubmitReport(e, true)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] border-2 border-indigo-200 text-indigo-700 bg-indigo-55 hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Icon name="refresh-cw" size={15} className="animate-spin" /> : <><Icon name="save" size={15} /> Pass & Hold</>}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSubmitReport(e, false)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Icon name="refresh-cw" size={15} className="animate-spin" /> : <><Icon name="check-circle" size={15} /> Pass to Final</>}
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] bg-rose-600 text-white shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Icon name="refresh-cw" size={15} className="animate-spin" /> : <><Icon name="x-circle" size={15} /> Submit Failed Report</>}
                </button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default AQLInspection;
