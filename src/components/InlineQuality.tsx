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

  // Sync zone with globalZone
  React.useEffect(() => {
    if (globalZone && globalZone !== 'ALL') {
      setForm(prev => ({ ...prev, zone: globalZone }));
    }
  }, [globalZone]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedWO = workorders.find(w => w.workorderNumber === form.wo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.run('api_saveInlineReport', { ...form, ...selectedWO, inspector: user.username, timestamp: new Date().toISOString() });
      triggerSuccess('INLINE DATA SUBMITTED SUCCESSFULLY');
      setForm({ ...form, bundleNo: '', checkedQty: '', passQty: '', reworkQty: '', failQty: '', remarks: '' });
    } catch (error) {
      alert('Error saving inline report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label>Zone</label>
          <select value={form.zone} onChange={e => setForm({...form, zone: e.target.value})}>
            {currentZones.map((z: string) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div>
          <label>Workorder Number</label>
          <select value={form.wo} onChange={e => setForm({...form, wo: e.target.value})} required>
            <option value="">Select Workorder</option>
            {workorders.filter(w => w.zone === form.zone).map(w => <option key={w.id} value={w.workorderNumber}>{w.workorderNumber}</option>)}
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
          <input type="text" placeholder="Enter Line" value={form.line} onChange={e => setForm({...form, line: e.target.value})} required />
        </div>
        <div>
          <label>Bundle No</label>
          <input type="text" placeholder="Enter Bundle No" value={form.bundleNo} onChange={e => setForm({...form, bundleNo: e.target.value})} required />
        </div>
        <div>
          <label>Checked Qty</label>
          <input type="number" placeholder="Enter Checked Qty" value={form.checkedQty} onChange={e => setForm({...form, checkedQty: e.target.value})} required />
        </div>
        <div>
          <label>Pass Qty</label>
          <input type="number" placeholder="Enter Pass Qty" value={form.passQty} onChange={e => setForm({...form, passQty: e.target.value})} required />
        </div>
      </div>

      <div>
        <label>Remarks</label>
        <textarea placeholder="Enter any remarks here..." value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} />
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="btn-primary w-full py-4 text-lg transition-all"
      >
        {isSubmitting ? 'SUBMITTING...' : <><Icon name="save" size={20} /> SUBMIT INLINE DATA</>}
      </button>
    </form>
  );
};

export default InlineQuality;
