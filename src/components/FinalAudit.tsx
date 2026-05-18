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
  const currentZones = settings?.ZONE || ZONES || [];
  const currentUnits = settings?.UNIT || UNITS || [];

  const [form, setForm] = useState({ 
    zone: (globalZone && globalZone !== 'ALL') ? globalZone : (currentZones[0] || ''), 
    cardNumber: '',
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

  const selectedWO = workorders.find(w => w.workorderNumber === form.wo);

  const handleCardLookup = async (num: string) => {
    if (!num) return;
    try {
      const card = await api.run('api_getCardByNumber', num);
      if (card && card.workorderNumber) {
        setForm(prev => ({ ...prev, wo: card.workorderNumber }));
        triggerSuccess(`CARD ${num} LINKED TO WO ${card.workorderNumber}`);
      } else if (card) {
        alert("This card is not assigned to any workorder.");
      } else {
        alert("Card not found.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (form.cardNumber) {
        await api.run('api_saveFINALAUDIT', { ...form, ...selectedWO, inspector: user.username, timestamp: new Date().toISOString() });
        triggerSuccess('FINAL AUDIT SUBMITTED - PVC CARD FREED FOR REUSE');
      } else {
        await api.run('api_saveFinalAudit', { ...form, ...selectedWO, inspector: user.username, timestamp: new Date().toISOString() });
        triggerSuccess('FINAL AUDIT SUBMITTED SUCCESSFULLY');
      }
      setForm({ ...form, cardNumber: '', totalAudited: '', pass: '', rejected: '', remarks: '' });
    } catch (error) {
      alert('Error saving final audit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label>Scan PVC Card</label>
          <div className="flex gap-2">
             <input 
               type="text" 
               placeholder="Scan..." 
               value={form.cardNumber}
               onChange={e => setForm({...form, cardNumber: e.target.value.toUpperCase()})}
               onBlur={() => handleCardLookup(form.cardNumber)}
             />
             <button type="button" onClick={() => handleCardLookup(form.cardNumber)} className="btn-secondary px-4"><Icon name="search" size={16} /></button>
          </div>
        </div>
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
      
      <div>
        <label>Total Audited Quantity</label>
        <input type="number" placeholder="Enter Total Audited" value={form.totalAudited} onChange={e => setForm({...form, totalAudited: e.target.value})} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Pass Quantity</label>
          <input type="number" placeholder="Enter Pass Qty" value={form.pass} onChange={e => setForm({...form, pass: e.target.value})} />
        </div>
        <div>
          <label>Rejected Quantity</label>
          <input type="number" placeholder="Enter Rejected Qty" value={form.rejected} onChange={e => setForm({...form, rejected: e.target.value})} />
        </div>
      </div>
      <div>
        <label>Remarks</label>
        <textarea placeholder="Enter any remarks here..." value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} />
      </div>
      <button 
        onClick={handleSubmit} 
        disabled={isSubmitting}
        className="btn-primary w-full py-5 text-xl transition-all"
      >
        {isSubmitting ? 'SUBMITTING...' : 'SUBMIT FINAL AUDIT'}
      </button>
    </div>
  );
};

export default FinalAudit;
