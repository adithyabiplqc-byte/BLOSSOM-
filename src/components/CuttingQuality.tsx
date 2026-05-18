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
}

const CuttingQuality: React.FC<CuttingQualityProps> = ({ user, settings, workorders, triggerSuccess, globalZone }) => {
  const currentZones = settings?.ZONE || ZONES || [];
  const [form, setForm] = useState({ 
    zone: (globalZone && globalZone !== 'ALL') ? globalZone : (currentZones[0] || ''), 
    cardNumber: '',
    wo: '', 
    bundleNo: '', 
    totalQty: '', 
    checkedQty: '', 
    passQty: '', 
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Use the specific API for cards if cardNumber is provided
      if (form.cardNumber) {
        await api.run('api_saveCUTTINGQUALITY', { ...form, ...selectedWO, inspector: user.username, timestamp: new Date().toISOString() });
      } else {
        await api.run('api_saveCuttingReport', { ...form, ...selectedWO, inspector: user.username, timestamp: new Date().toISOString() });
      }
      triggerSuccess('CUTTING DATA SUBMITTED SUCCESSFULLY');
      setForm({ ...form, cardNumber: '', bundleNo: '', totalQty: '', checkedQty: '', passQty: '', failQty: '', remarks: '' });
    } catch (error) {
      alert('Error saving cutting report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label>Scan/Type PVC Card</label>
          <div className="flex gap-2">
             <input 
               type="text" 
               placeholder="Scan Card..." 
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
      </div>

      <WorkorderDetailCard wo={selectedWO} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label>Bundle Number</label>
          <input type="text" placeholder="Enter Bundle No" value={form.bundleNo} onChange={e => setForm({...form, bundleNo: e.target.value})} required />
        </div>
        <div>
          <label>Total Qty</label>
          <input type="number" placeholder="Enter Total Qty" value={form.totalQty} onChange={e => setForm({...form, totalQty: e.target.value})} required />
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
        {isSubmitting ? 'SUBMITTING...' : <><Icon name="save" size={20} /> SUBMIT CUTTING DATA</>}
      </button>
    </form>
  );
};

export default CuttingQuality;
