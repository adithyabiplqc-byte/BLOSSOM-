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
  const currentZones = settings?.ZONE || ZONES || [];
  const currentUnits = settings?.UNIT || UNITS || [];

  const [form, setForm] = useState({ 
    zone: (globalZone && globalZone !== 'ALL') ? globalZone : (currentZones[0] || ''), 
    wo: '', 
    unit: currentUnits[0] || '', 
    passQty: '', 
    failedPieces: '', 
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

  const handleSubmit = async (status: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.run('api_saveAQLReport', { ...form, ...selectedWO, auditStatus: status, inspector: user.username, timestamp: new Date().toISOString() });
      triggerSuccess(`AQL AUDIT ${status} SUBMITTED SUCCESSFULLY`);
      setForm({ ...form, passQty: '', failedPieces: '', remarks: '' });
    } catch (error) {
      alert('Error saving AQL report');
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Pass Quantity</label>
          <input type="number" placeholder="Enter Pass Qty" value={form.passQty} onChange={e => setForm({...form, passQty: e.target.value})} />
        </div>
        <div>
          <label>Failed Pieces</label>
          <input type="number" placeholder="Enter Failed Pieces" value={form.failedPieces} onChange={e => setForm({...form, failedPieces: e.target.value})} />
        </div>
      </div>
      <div>
        <label>Remarks</label>
        <textarea placeholder="Enter any remarks here..." value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => handleSubmit('PASS')} 
          disabled={isSubmitting}
          className="bg-emerald-500 text-white py-4 rounded-xl font-bold hover:bg-emerald-600 transition-all"
        >
          {isSubmitting ? 'PROCESSING...' : 'AUDIT PASS'}
        </button>
        <button 
          onClick={() => handleSubmit('FAIL')} 
          disabled={isSubmitting}
          className="bg-rose-500 text-white py-4 rounded-xl font-bold hover:bg-rose-600 transition-all"
        >
          {isSubmitting ? 'PROCESSING...' : 'AUDIT FAIL'}
        </button>
      </div>
    </div>
  );
};

export default AQLInspection;
