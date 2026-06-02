import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ZONES, UNITS, WORKERS, MACHINES } from '../constants';
import Icon from './Icon';
import WorkorderDetailCard from './WorkorderDetailCard';

interface InlineQualityProps {
  user: any;
  settings: any;
  workorders: any[];
  triggerSuccess: (message: string) => void;
  globalZone?: string;
}

const HOURLY_ROUNDS = [
  { index: 1, label: '9 TO 10', startHour: 9, startMin: 0, endHour: 10, endMin: 0 },
  { index: 2, label: '10 TO 11', startHour: 10, startMin: 0, endHour: 11, endMin: 0 },
  { index: 3, label: '11 TO 12', startHour: 11, startMin: 0, endHour: 12, endMin: 0 },
  { index: 4, label: '12 TO 1.30', startHour: 12, startMin: 0, endHour: 13, endMin: 30 },
  { index: 5, label: '1.30 TO 2.30', startHour: 13, startMin: 30, endHour: 14, endMin: 30 },
  { index: 6, label: '2.30 TO 3.30', startHour: 14, startMin: 30, endHour: 15, endMin: 30 },
  { index: 7, label: '3.30 TO 4.30', startHour: 15, startMin: 30, endHour: 16, endMin: 30 },
  { index: 8, label: '4.30 TO 5.30', startHour: 16, startMin: 30, endHour: 17, endMin: 30 }
];

// Safe timezone-proof local date helper
const getLocalYYYYMMDD = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Extremely robust timezone and locale agnostic date string parser
export const normalizeDateToYYYYMMDD = (val: any): string => {
  if (!val) return '';
  if (val instanceof Date) {
    return getLocalYYYYMMDD(val);
  }
  const s = String(val).trim();
  const datePartOnly = s.split(/[ T]/)[0];
  const matches = datePartOnly.match(/\d+/g);
  if (matches && matches.length >= 3) {
    let year = 0;
    let month = 0;
    let day = 0;
    
    // Find year (4 digits)
    const yearIdx = matches.findIndex(m => m.length === 4);
    if (yearIdx !== -1) {
      year = parseInt(matches[yearIdx], 10);
      const remaining = matches.filter((_, idx) => idx !== yearIdx);
      if (remaining.length >= 2) {
        const num1 = parseInt(remaining[0], 10);
        const num2 = parseInt(remaining[1], 10);
        
        if (num1 > 12) {
          day = num1;
          month = num2;
        } else if (num2 > 12) {
          day = num2;
          month = num1;
        } else {
          // If the year is at index 0 (e.g. 2026-06-02), then standard order is [month, day]
          if (yearIdx === 0) {
            month = num1;
            day = num2;
          } else {
            // Assume DD-MM-YYYY
            month = num2;
            day = num1;
          }
        }
      }
    }
    
    if (year > 0 && month > 0 && day > 0) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // Fallback to simpler parsing or JS date parsing
  try {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      return getLocalYYYYMMDD(d);
    }
  } catch (e) {}

  return s.substring(0, 10);
};

const isSameCheckingDate = (date1: any, date2: any) => {
  if (!date1 || !date2) return false;
  const nd1 = normalizeDateToYYYYMMDD(date1);
  const nd2 = normalizeDateToYYYYMMDD(date2);
  if (!nd1 || !nd2) return false;
  
  if (nd1 === nd2) return true;
  
  // Also treat as same if they have the same year and their month/day are inverted
  const p1 = nd1.split('-');
  const p2 = nd2.split('-');
  if (p1.length === 3 && p2.length === 3 && p1[0] === p2[0]) {
    const m1 = p1[1], d1 = p1[2];
    const m2 = p2[1], d2 = p2[2];
    if ((m1 === m2 && d1 === d2) || (m1 === d2 && d1 === m2)) {
      return true;
    }
  }
  return false;
};

const InlineQuality: React.FC<InlineQualityProps> = ({ user, settings, workorders, triggerSuccess, globalZone }) => {
  const currentZones = settings?.ZONE || settings?.ZONES || ZONES || [];
  const currentWorkers = settings?.WORKERS || settings?.WORKER || WORKERS || [];
  const currentMachines = settings?.MACHINE || settings?.MACHINES || MACHINES || [];

  const [currentTime, setCurrentTime] = useState(new Date());

  const getActiveRoundIndexByTime = () => {
    const currentH = currentTime.getHours();
    const currentM = currentTime.getMinutes();

    // If before 9 AM, default to first round (index 0)
    if (currentH < 9) {
      return 0;
    }
    // If after 5:30 PM (17:30), default to last round (index 7)
    if (currentH > 17 || (currentH === 17 && currentM >= 30)) {
      return 7;
    }

    for (let i = 0; i < HOURLY_ROUNDS.length; i++) {
      const r = HOURLY_ROUNDS[i];
      const isAfterStart = currentH > r.startHour || (currentH === r.startHour && currentM >= r.startMin);
      const isBeforeEnd = currentH < r.endHour || (currentH === r.endHour && currentM < r.endMin);
      if (isAfterStart && isBeforeEnd) {
        return i;
      }
    }
    return 0; // fallback
  };

  const activeRoundIdx = getActiveRoundIndexByTime();
  const [selectedRoundIdx, setSelectedRoundIdx] = useState<number>(activeRoundIdx);

  // Sync selectedRoundIdx with activeRoundIdx when activeRoundIdx changes, but only if they haven't chosen something else
  useEffect(() => {
    setSelectedRoundIdx(activeRoundIdx);
  }, [activeRoundIdx]);

  const [form, setForm] = useState({ 
    zone: (globalZone && globalZone !== 'ALL') ? globalZone : (currentZones[0] || ''), 
    wo: '', 
    checkingDate: getLocalYYYYMMDD(),
    worker: '',
    machine: ''
  });

  const [roundInputs, setRoundInputs] = useState({
    checkedQty: '',
    complaintPcs: '',
    remarks: ''
  });

  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep the active round index strictly synchronized with current time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, []);

  // Sync with globalZone
  useEffect(() => {
    if (globalZone && globalZone !== 'ALL') {
      setForm(prev => ({ ...prev, zone: globalZone }));
    } else if (!form.zone && currentZones.length > 0) {
      setForm(prev => ({ ...prev, zone: currentZones[0] }));
    }
  }, [globalZone, currentZones]);

  // Load saved 8round quality checks for the selected Zone and Checking Date to power live coloring
  useEffect(() => {
    fetchInlineData();
  }, [form.zone, form.checkingDate]);

  const fetchInlineData = async () => {
    setLoadingReports(true);
    try {
      const res = await api.run('api_get8ROUNDSYSTEMData', { zone: form.zone });
      if (Array.isArray(res)) {
        setSavedReports(prev => {
          // Keep any optimistic items not yet present in fetched 'res'
          const merged = [...res];
          prev.forEach(localItem => {
            if (localItem.isOptimistic) {
              const alreadyInRes = res.some(serverItem => {
                const rWorker = String(serverItem.worker || serverItem.Worker || serverItem.operator || serverItem.operatorName || serverItem.WORKER || '').trim().toUpperCase();
                const lWorker = String(localItem.worker).trim().toUpperCase();
                const rRound = String(serverItem.round || serverItem.ROUND || '').trim().toUpperCase();
                const lRound = String(localItem.round).toUpperCase();
                return rWorker === lWorker && rRound === lRound && isSameCheckingDate(serverItem.checkingDate || serverItem.date || serverItem.CHECKINGDATE || serverItem.DATE, localItem.checkingDate);
              });
              if (!alreadyInRes) {
                merged.push(localItem);
              }
            }
          });
          return merged;
        });
      }
    } catch (e) {
      console.error("[Inline] Failed to load inline data", e);
    } finally {
      setLoadingReports(false);
    }
  };

  const selectedWO = workorders.find(w => String(w.workorderNumber) === String(form.wo));

  // Auto-select first worker and machine if list is loaded and state is empty
  useEffect(() => {
    if (!form.worker && currentWorkers.length > 0) {
      setForm(prev => ({ ...prev, worker: currentWorkers[0] }));
    }
  }, [currentWorkers]);

  useEffect(() => {
    if (!form.machine && currentMachines.length > 0) {
      setForm(prev => ({ ...prev, machine: currentMachines[0] }));
    }
  }, [currentMachines]);

  // When selected round, selected worker, or checking-date changes, 
  // synchronize the input boxes with any already recorded report details
  useEffect(() => {
    const currentRound = HOURLY_ROUNDS[selectedRoundIdx];
    if (!currentRound || !form.worker) {
      setRoundInputs({ checkedQty: '', complaintPcs: '', remarks: '' });
      return;
    }

    const matched = savedReports.find(r => {
      const rWorker = String(r.worker || r.Worker || r.operator || r.operatorName || r.WORKER || '').trim().toUpperCase();
      const sWorker = String(form.worker || '').trim().toUpperCase();
      
      const rRoundIdx = Number(r.roundIndex || r.ROUNDINDEX || r.round_index || 0);
      const rRound = String(r.round || r.ROUND || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      const sRound = String(currentRound.label).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

      const roundMatches = (rRoundIdx === currentRound.index) || (rRound === sRound && rRound !== '');
      const dateMatches = isSameCheckingDate(r.checkingDate || r.date || r.CHECKINGDATE || r.DATE, form.checkingDate);
      
      return rWorker === sWorker && roundMatches && dateMatches;
    });

    if (matched) {
      setRoundInputs({
        checkedQty: String(matched.checkedQty || matched.pcsChecked || matched.CHECKEDQTY || matched.PCSCHECKED || ''),
        complaintPcs: String(matched.complaintPcs || matched.failQty || matched.failedPieces || matched.defectQty || matched.COMPLAINTPCS || matched.FAILQTY || ''),
        remarks: String(matched.remarks || matched.itemRemarks || matched.generalRemarks || matched.REMARKS || '')
      });
    } else {
      setRoundInputs({ checkedQty: '', complaintPcs: '', remarks: '' });
    }
  }, [selectedRoundIdx, form.worker, form.checkingDate, savedReports]);

  // Determine round clock state
  const getRoundState = (round: typeof HOURLY_ROUNDS[0]) => {
    if (!form.worker) {
      return 'ORANGE'; // default fallback before worker is chosen
    }

    const isCompleted = savedReports.some(r => {
      const rWorker = String(r.worker || r.Worker || r.operator || r.operatorName || r.WORKER || '').trim().toUpperCase();
      const sWorker = String(form.worker).trim().toUpperCase();
      
      const rRoundIdx = Number(r.roundIndex || r.ROUNDINDEX || r.round_index || 0);
      const rRound = String(r.round || r.ROUND || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      const sRound = String(round.label).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

      const roundMatches = (rRoundIdx === round.index) || (rRound === sRound && rRound !== '');
      const dateMatches = isSameCheckingDate(r.checkingDate || r.date || r.CHECKINGDATE || r.DATE, form.checkingDate);
      
      return rWorker === sWorker && roundMatches && dateMatches;
    });

    if (isCompleted) {
      return 'GREEN';
    }

    const todayStr = getLocalYYYYMMDD(currentTime);
    const checkedDateStr = form.checkingDate;

    if (checkedDateStr < todayStr) {
      return 'RED'; // Past date, failed to submit
    }
    if (checkedDateStr > todayStr) {
      return 'ORANGE'; // Future date, upcoming/scheduled
    }

    // Same day: check starting hour of the round compared to current system hour and minute
    const currentH = currentTime.getHours();
    const currentM = currentTime.getMinutes();

    // A round is in the future if we have not reached its start time limit yet
    const isFuture = currentH < round.startHour || (currentH === round.startHour && currentM < round.startMin);

    return isFuture ? 'ORANGE' : 'RED';
  };

  const isRoundLocked = (round: typeof HOURLY_ROUNDS[0]) => {
    if (!form.worker) {
      return true; // Lock before operator is chosen
    }

    const todayStr = getLocalYYYYMMDD(currentTime);
    const checkedDateStr = form.checkingDate;

    // Future date is fully locked
    if (checkedDateStr > todayStr) {
      return true;
    }

    const state = getRoundState(round);

    if (state === 'GREEN') {
      // Once submitted (GREEN), the round is completely and permanently locked. No editing/resubmitting allowed.
      return true;
    }

    // Checking date is today. Compare system time against start hour & start min
    if (checkedDateStr === todayStr) {
      const currentH = currentTime.getHours();
      const currentM = currentTime.getMinutes();
      const isBeforeStart = currentH < round.startHour || (currentH === round.startHour && currentM < round.startMin);
      return isBeforeStart; // Locked if we haven't reached the start of the round yet
    }

    // Past date is unlocked for backfill
    return false;
  };

  const handleSaveRound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!form.wo) {
      return alert("Please select a Workorder");
    }
    if (!form.worker) {
      return alert("Please select a Worker Operator");
    }
    if (!form.machine) {
      return alert("Please select a Machine Number");
    }

    const currentRound = HOURLY_ROUNDS[selectedRoundIdx];
    
    // Strict block if the round is locked (due to time or completed status)
    if (isRoundLocked(currentRound)) {
      return alert("This round is currently locked. It might be already submitted, or its scheduled time has not started yet.");
    }

    if (!roundInputs.checkedQty) {
      return alert("Please enter the number of Pcs Checked");
    }

    const existingReport = savedReports.find(r => {
      const rWorker = String(r.worker || r.Worker || r.operator || r.operatorName || r.WORKER || '').trim().toUpperCase();
      const sWorker = String(form.worker).trim().toUpperCase();
      
      const rRoundIdx = Number(r.roundIndex || r.ROUNDINDEX || r.round_index || 0);
      const rRound = String(r.round || r.ROUND || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      const sRound = String(currentRound.label).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

      const roundMatches = (rRoundIdx === currentRound.index) || (rRound === sRound && rRound !== '');
      const dateMatches = isSameCheckingDate(r.checkingDate || r.date || r.CHECKINGDATE || r.DATE, form.checkingDate);
      
      return rWorker === sWorker && roundMatches && dateMatches;
    });

    if (existingReport) {
      return alert("This round has already been submitted for this worker on this checking date.");
    }

    setIsSubmitting(true);
    try {
      // Submit raw insert row with full workorder details so that the Inline sheet receives exhaustive column attributes
      const report = {
        zone: form.zone,
        wo: form.wo,
        workorderNumber: form.wo,
        checkingDate: form.checkingDate,
        date: form.checkingDate,
        worker: form.worker,
        machine: form.machine,
        round: currentRound.label,
        roundIndex: currentRound.index,
        checkedQty: Number(roundInputs.checkedQty) || 0,
        pcsChecked: Number(roundInputs.checkedQty) || 0,
        complaintPcs: Number(roundInputs.complaintPcs) || 0,
        failQty: Number(roundInputs.complaintPcs) || 0,
        remarks: roundInputs.remarks,
        itemRemarks: roundInputs.remarks,
        generalRemarks: roundInputs.remarks,
        line: selectedWO?.line || selectedWO?.lineNo || '',
        unit: selectedWO?.unit || '',
        style: selectedWO?.style || selectedWO?.styleName || '',
        color: selectedWO?.colour || selectedWO?.color || '',
        size: selectedWO?.size || selectedWO?.sizeRange || '',
        cup: selectedWO?.cup || selectedWO?.cupSize || '',
        quantity: selectedWO?.quantity || selectedWO?.qty || 0,
        inspector: user.username,
        timestamp: new Date().toISOString(),
        isOptimistic: true
      };

      await api.run('api_save8ROUNDSYSTEM', report);
      triggerSuccess(`ROUND ${currentRound.label} LOGGED FOR ${form.worker}`);
      
      setSavedReports(prev => {
        const filtered = prev.filter(r => {
          const rWorker = String(r.worker || r.Worker || r.operator || r.operatorName || r.WORKER || '').trim().toUpperCase();
          const sWorker = String(form.worker).trim().toUpperCase();
          
          const rRoundIdx = Number(r.roundIndex || r.ROUNDINDEX || r.round_index || 0);
          const rRound = String(r.round || r.ROUND || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
          const sRound = String(currentRound.label).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

          const roundMatches = (rRoundIdx === currentRound.index) || (rRound === sRound && rRound !== '');
          const dateMatches = isSameCheckingDate(r.checkingDate || r.date || r.CHECKINGDATE || r.DATE, form.checkingDate);
          
          return !(rWorker === sWorker && roundMatches && dateMatches);
        });
        return [...filtered, report];
      });

      await fetchInlineData();
    } catch (error) {
      console.error(error);
      alert('Error saving round check');
    } finally {
      setIsSubmitting(false);
    }
  };

  // List of saved matches to display dynamically at bottom for the selected Worker + Date
  const currentWorkerHistory = savedReports.filter(r => {
    const rWorker = String(r.worker || r.Worker || r.operator || r.operatorName || r.WORKER || '').trim().toUpperCase();
    const sWorker = String(form.worker || '').trim().toUpperCase();
    const dateMatches = isSameCheckingDate(r.checkingDate || r.date || r.CHECKINGDATE || r.DATE, form.checkingDate);
    return rWorker === sWorker && dateMatches;
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* SECTION 1: ZONE, WORKORDER, DATE SELECTORS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zone Selection</label>
          <select 
            value={form.zone} 
            onChange={e => setForm({...form, zone: e.target.value, wo: ''})} 
            className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold py-2.5 focus:border-indigo-500 transition-all font-sans"
          >
            {currentZones.map((z: string) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Workorder #</label>
          <select 
            value={form.wo} 
            onChange={e => setForm({...form, wo: e.target.value})} 
            required 
            className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold py-2.5 focus:border-indigo-500 transition-all font-sans"
          >
            <option value="">Select Workorder</option>
            {workorders
              .filter(w => {
                const wZone = String(w.zone || w.location || "").toUpperCase().trim();
                const fZone = String(form.zone).toUpperCase().trim();
                const status = String(w.status || "").toUpperCase().trim();
                return wZone === fZone && (status === 'INLINE' || status === 'INLINE_AND_ENDLINE');
              })
              .map(w => <option key={w.id} value={w.workorderNumber}>{w.workorderNumber} ({w.style})</option>)
            }
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Checking Date</label>
          <input 
            type="date" 
            value={form.checkingDate} 
            onChange={e => setForm({...form, checkingDate: e.target.value})} 
            required 
            className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold py-2.5 focus:border-indigo-500 transition-all font-sans"
          />
        </div>
      </div>

      {/* SECTION 2: OPERATOR DETAILS (WORKER & MACHINE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-sans">Worker / Operator Dropdown</label>
          <select 
            value={form.worker} 
            onChange={e => setForm({...form, worker: e.target.value})} 
            required 
            className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold py-2.5 focus:border-indigo-500 transition-all font-sans"
          >
            <option value="">Select Worker...</option>
            {currentWorkers.map((w: string) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-sans">Machine Dropdown</label>
          <select 
            value={form.machine} 
            onChange={e => setForm({...form, machine: e.target.value})} 
            required 
            className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold py-2.5 focus:border-indigo-500 transition-all font-sans"
          >
            <option value="">Select Machine...</option>
            {currentMachines.map((m: string) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {selectedWO && (
        <div className="animate-zoom-in">
          <WorkorderDetailCard wo={selectedWO} settings={settings} />
        </div>
      )}

      {/* SECTION 3: 8 HOURLY ROUNDS CHECKING HOURLY SELECTORS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 font-sans">
              <Icon name="clock" size={16} className="text-indigo-600" />
              Hourly Rounds (8 Checks Daily)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Status works per Worker. Green indicates completed check, Red indicates time is over (pending/missed), Orange indicates upcoming. Target hour is automatically highlighted.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 font-sans shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            SYSTEM TIME: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 py-2">
          {HOURLY_ROUNDS.map((round, idx) => {
            const state = getRoundState(round);
            const isSelected = selectedRoundIdx === idx;
            const isActiveHour = activeRoundIdx === idx;
            const isCompleted = state === 'GREEN';
            const isOverdue = state === 'RED';
            
            let colorClasses = "";
            let iconEl = null;

            if (isCompleted) {
              // Completed -> cute solid green, sweet tiny white check icon
              colorClasses = "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-100";
              iconEl = <Icon name="check" size={10} className="text-white font-extrabold" />;
            } else if (isOverdue) {
              // Time has elapsed without submission -> solid red danger warning
              colorClasses = "bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-100";
              iconEl = <Icon name="alert-circle" size={10} className="text-white font-extrabold" />;
            } else {
              // Upcoming/Scheduled -> sleek Orange
              colorClasses = "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-100";
              iconEl = <Icon name="clock" size={10} className="text-white font-bold" />;
            }

            return (
              <button
                type="button"
                key={round.index}
                onClick={() => setSelectedRoundIdx(idx)}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-300 relative select-none cursor-pointer ${colorClasses} ${
                  isSelected ? 'ring-4 ring-indigo-600 ring-offset-2 scale-110 z-10 font-bold' : 'opacity-95 hover:scale-105 active:scale-95'
                }`}
              >
                {isActiveHour && (
                  <span className={`absolute -top-2 ${isCompleted ? 'bg-emerald-600' : 'bg-indigo-600'} text-[5px] text-white font-black tracking-normal px-1 py-0.5 rounded-full shadow-sm`}>
                    {isCompleted ? 'SUBMITTED' : 'ACTIVE'}
                  </span>
                )}
                <span className="text-[7px] md:text-[8px] font-bold block opacity-95 leading-none">
                  RD {round.index}
                </span>
                <span className="text-[8px] md:text-[9px] font-black tracking-tighter leading-none mt-0.5 select-none">
                  {round.label.split(' TO ')[0]}
                </span>
                <div className="mt-0.5 flex items-center justify-center">
                  {iconEl}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: DETAILED ROUND FORM INPUT AND REMARK SUBMISSION PANEL */}
      <form onSubmit={handleSaveRound} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4 border-slate-100">
          <h4 className="text-sm font-black text-indigo-700 uppercase tracking-wide flex items-center gap-2">
            <Icon name="edit-3" size={16} />
            ROUND {HOURLY_ROUNDS[selectedRoundIdx].index} DATA ENTRY ({HOURLY_ROUNDS[selectedRoundIdx].label})
          </h4>
          <span className="text-[10px] font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-600">
            Operator: {form.worker || 'None Selected'}
          </span>
        </div>

        {getRoundState(HOURLY_ROUNDS[selectedRoundIdx]) === 'GREEN' ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold animate-fade-in">
            <Icon name="check-circle" size={18} className="text-emerald-600 flex-shrink-0" />
            <span>This round has already been submitted for {form.worker || 'this worker'} on this checking date and is permanently locked. No further modifications can be made.</span>
          </div>
        ) : isRoundLocked(HOURLY_ROUNDS[selectedRoundIdx]) ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold animate-fade-in">
            <Icon name="clock" size={18} className="text-amber-500 flex-shrink-0" />
            <span>This round is locked and scheduled to unlock at {HOURLY_ROUNDS[selectedRoundIdx].startHour.toString().padStart(2, '0')}:{HOURLY_ROUNDS[selectedRoundIdx].startMin.toString().padStart(2, '0')} based on system time.</span>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 font-sans">
              No. of Pcs Checked
            </label>
            <input 
              type="number" 
              placeholder="Enter number of pieces checked"
              value={roundInputs.checkedQty} 
              onChange={e => setRoundInputs({...roundInputs, checkedQty: e.target.value})}
              required
              min="0"
              disabled={isRoundLocked(HOURLY_ROUNDS[selectedRoundIdx]) || loadingReports || isSubmitting}
              className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl font-bold py-3 px-4 transition-all text-sm font-sans placeholder-slate-300 disabled:opacity-50 disabled:bg-slate-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 font-sans">
              Complaint Pcs (Defective / Faulty)
            </label>
            <input 
              type="number" 
              placeholder="Enter number of complaint pieces"
              value={roundInputs.complaintPcs} 
              onChange={e => setRoundInputs({...roundInputs, complaintPcs: e.target.value})}
              min="0"
              disabled={isRoundLocked(HOURLY_ROUNDS[selectedRoundIdx]) || loadingReports || isSubmitting}
              className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl font-bold py-3 px-4 transition-all text-sm font-sans placeholder-slate-300 disabled:opacity-50 disabled:bg-slate-100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 font-sans">
            Remarks & Defect Details
          </label>
          <textarea 
            placeholder="Type any operator quality issues, complaint descriptions or checking feedback..." 
            value={roundInputs.remarks} 
            onChange={e => setRoundInputs({...roundInputs, remarks: e.target.value})}
            disabled={isRoundLocked(HOURLY_ROUNDS[selectedRoundIdx]) || loadingReports || isSubmitting}
            className="w-full min-h-[100px] bg-slate-50 border-2 border-slate-100 rounded-xl p-4 focus:border-indigo-500 outline-none transition-all font-medium text-sm font-sans placeholder-slate-300 disabled:opacity-50 disabled:bg-slate-100"
          />
        </div>

        <div className="flex">
          {getRoundState(HOURLY_ROUNDS[selectedRoundIdx]) === 'GREEN' ? (
            <button 
              type="button"
              disabled
              className="bg-emerald-600 text-white w-full py-4 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 rounded-xl opacity-80 cursor-not-allowed"
            >
              <Icon name="check-circle" size={18} /> Already Submitted & Locked Permanently
            </button>
          ) : isRoundLocked(HOURLY_ROUNDS[selectedRoundIdx]) ? (
            <button 
              type="button"
              disabled
              className="bg-amber-600 text-white w-full py-4 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 rounded-xl opacity-80 cursor-not-allowed"
            >
              <Icon name="lock" size={18} /> Round Locked (Upcoming Hour)
            </button>
          ) : (
            <button 
              type="submit" 
              disabled={isSubmitting || loadingReports || !form.wo}
              className="btn-primary w-full py-4 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 disabled:opacity-50 font-sans font-black"
            >
              {isSubmitting ? (
                <Icon name="refresh-cw" size={18} className="animate-spin" />
              ) : (
                <><Icon name="save" size={18} /> Save Hourly Report & Remark</>
              )}
            </button>
          )}
        </div>
      </form>

      {/* SECTION 5: LIVE WORKER QUALITY SUMMARY BOARD FOR SELECTED DATE */}
      {form.worker && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Icon name="list" size={14} className="text-emerald-600" />
              Logged Quality Checks for {form.worker} (Today / selected date)
            </h4>
            <span className="text-[10px] font-bold text-slate-400">
              Total Checked Rounds: {currentWorkerHistory.length}
            </span>
          </div>

          {currentWorkerHistory.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">No checking has been submitted for this worker on the selected date yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
              {currentWorkerHistory.map((report, rIdx) => {
                const complains = Number(report.complaintPcs || report.failQty || 0);
                return (
                  <div key={rIdx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between text-xs">
                    <div>
                      <div className="font-extrabold text-indigo-600">Round {report.round}</div>
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                        WO: #{report.workorderNumber || report.wo} • M/C: {report.machine}
                      </div>
                      {report.remarks && (
                        <div className="text-[10px] text-slate-500 italic mt-1 font-sans">
                          "{report.remarks}"
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-700">Checked: {report.checkedQty || report.pcsChecked || 0}</div>
                      <div className={`text-[10px] font-extrabold mt-0.5 px-1.5 py-0.5 rounded-full inline-block ${
                        complains > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {complains > 0 ? `Defects: ${complains}` : 'Clear'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InlineQuality;
