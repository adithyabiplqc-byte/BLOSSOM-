import React, { useState, useMemo } from 'react';
import { api } from '../services/api';
import { ZONES, UNITS, DEFECTS, OPERATIONS, WORKERS, MACHINES } from '../constants';
import Icon from './Icon';
import WorkorderDetailCard from './WorkorderDetailCard';

interface EndlineQualityProps {
  user: any;
  settings: any;
  workorders: any[];
  users: any[];
  triggerSuccess: (message: string) => void;
  globalZone?: string;
}

const EndlineQuality: React.FC<EndlineQualityProps> = ({ user, settings, workorders, users, triggerSuccess, globalZone }) => {
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

  const [isReworkMode, setIsReworkMode] = useState(false);
  const [defectEntry, setDefectEntry] = useState({ worker: currentWorkers[0] || '', operation: currentOperations[0] || '', defect: currentDefects[0] || '', machine: currentMachines[0] || '', remarks: '', extra1: '', extra2: '', extra3: '', extra4: '' });
  const [reworkQueue, setReworkQueue] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedWO = workorders.find(w => w.workorderNumber === form.wo);

  const handleReworkSubmit = () => {
    const newRework = { ...defectEntry, id: Date.now(), timestamp: new Date().toISOString() };
    setReworkQueue([...reworkQueue, newRework]);
    setForm({ ...form, reworkQty: String(reworkQueue.length + 1) });
    setDefectEntry({ worker: currentWorkers[0] || '', operation: currentOperations[0] || '', defect: currentDefects[0] || '', machine: currentMachines[0] || '', remarks: '', extra1: '', extra2: '', extra3: '', extra4: '' });
    setIsReworkMode(false);
  };

  const resolveRework = (id: number, status: string) => {
    const resolved = reworkQueue.find(r => r.id === id);
    setReworkQueue(reworkQueue.filter(r => r.id !== id));
    if (status === 'PASS') {
      setForm({ ...form, passQty: String(Number(form.passQty || 0) + 1), reworkQty: String(reworkQueue.length - 1) });
    } else {
      setForm({ ...form, failQty: String(Number(form.failQty || 0) + 1), reworkQty: String(reworkQueue.length - 1) });
    }
  };

  const handleSubmit = async (e: React.FormEvent, moveToAQL: boolean = false) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    if (!form.wo) {
      alert("Please select a workorder");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.run('api_saveENDLINEQUALITY', { 
        ...form, 
        ...selectedWO, 
        moveToAQL,
        inspector: user.username, 
        timestamp: new Date().toISOString(), 
        reworks: reworkQueue 
      });
      triggerSuccess(moveToAQL ? 'DATA SAVED & MOVED TO AQL' : 'ENDLINE DATA SAVED');
      setForm({ ...form, bundleNo: '', checkedQty: '', passQty: '', reworkQty: '', failQty: '', remarks: '' });
      setReworkQueue([]);
    } catch (error) {
      alert('Error saving endline report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label>Zone</label>
          <select value={form.zone} onChange={e => setForm({...form, zone: e.target.value})}>
            {currentZones.map((z: string) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div>
          <label>Workorder Number</label>
          <select value={form.wo} onChange={e => setForm({...form, wo: e.target.value})} required className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold">
            <option value="">Select Workorder</option>
            {workorders
              .filter(w => {
                const wZone = String(w.zone || w.location || "").toUpperCase().trim();
                const fZone = String(form.zone).toUpperCase().trim();
                const status = String(w.status || "").toUpperCase().trim();
                return wZone === fZone && status === 'ENDLINE';
              })
              .map(w => <option key={w.id} value={w.workorderNumber}>{w.workorderNumber}</option>)
            }
          </select>
        </div>
        <div>
          <label>Unit</label>
          <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
            {currentUnits.map((u: string) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      <WorkorderDetailCard wo={selectedWO} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label>Line</label>
          <input type="text" placeholder="Line" value={form.line} onChange={e => setForm({...form, line: e.target.value})} />
        </div>
        <div>
          <label>Bundle No</label>
          <input type="text" placeholder="Bundle" value={form.bundleNo} onChange={e => setForm({...form, bundleNo: e.target.value})} />
        </div>
        <div>
          <label>Checked Qty</label>
          <input type="number" placeholder="Checked" value={form.checkedQty} onChange={e => setForm({...form, checkedQty: e.target.value})} />
        </div>
        <div>
          <label>Pass Qty</label>
          <input type="number" placeholder="Pass" value={form.passQty} onChange={e => setForm({...form, passQty: e.target.value})} />
        </div>
      </div>

      <div className="glass-card p-4 border-l-4 border-amber-500 bg-amber-50/30">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-black text-amber-700 uppercase">Defect & Rework Logging</h3>
          <button 
            onClick={() => setIsReworkMode(!isReworkMode)}
            className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all ${isReworkMode ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}`}
          >
            {isReworkMode ? 'CANCEL LOGGING' : 'ADD DEFECT'}
          </button>
        </div>

        {isReworkMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-4">
            <div>
              <label>Worker</label>
              <select value={defectEntry.worker} onChange={e => setDefectEntry({...defectEntry, worker: e.target.value})}>
                {currentWorkers.map((w: string) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label>Operation</label>
              <select value={defectEntry.operation} onChange={e => setDefectEntry({...defectEntry, operation: e.target.value})}>
                {currentOperations.map((o: string) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label>Defect</label>
              <select value={defectEntry.defect} onChange={e => setDefectEntry({...defectEntry, defect: e.target.value})}>
                {currentDefects.map((d: string) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label>Machine</label>
              <select value={defectEntry.machine} onChange={e => setDefectEntry({...defectEntry, machine: e.target.value})}>
                {currentMachines.map((m: string) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label>Remarks</label>
              <input type="text" placeholder="Enter rework remarks..." value={defectEntry.remarks} onChange={e => setDefectEntry({...defectEntry, remarks: e.target.value})} />
            </div>
            <button onClick={handleReworkSubmit} className="md:col-span-2 bg-amber-500 text-white py-3 rounded-xl font-black hover:bg-amber-600 transition-colors">
              LOG REWORK DEFECT
            </button>
          </div>
        )}
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
          {isSubmitting ? <Icon name="refresh-cw" size={18} className="animate-spin" /> : <><Icon name="check-circle" size={18} /> Pass to AQL</>}
        </button>
      </div>

      {reworkQueue.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Pending Reworks ({reworkQueue.length})</h3>
          {reworkQueue.map(r => (
            <div key={r.id} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center gap-4 shadow-sm">
              <div className="flex-1">
                <p className="font-black text-slate-800 text-sm">{r.defect}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{r.operation} | {r.worker} | {r.machine}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => resolveRework(r.id, 'PASS')} className="bg-emerald-500 text-white px-4 py-1.5 rounded-lg font-bold text-xs">PASS</button>
                <button onClick={() => resolveRework(r.id, 'FAIL')} className="bg-rose-500 text-white px-4 py-1.5 rounded-lg font-bold text-xs">FAIL</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EndlineQuality;
