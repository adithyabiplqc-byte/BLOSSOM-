import React, { useState } from 'react';
import { api } from '../services/api';
import { SUPPLIERS, ITEMS, COLORS, SIZES } from '../constants';
import Icon from './Icon';

interface MaterialInspectionProps {
  user: any;
  settings: any;
  triggerSuccess: (message: string) => void;
  globalZone?: string;
}

const MaterialInspection: React.FC<MaterialInspectionProps> = ({ user, settings, triggerSuccess, globalZone }) => {
  const currentSuppliers = settings?.SUPPLIER || SUPPLIERS || [];
  const currentItems = settings?.ITEMS || ITEMS || [];
  const currentColors = settings?.COLORS || COLORS || [];
  const currentSizes = settings?.SIZES || SIZES || [];
  const currentZones = settings?.ZONE || [];

  const [form, setForm] = useState({ 
    zone: (globalZone && globalZone !== 'ALL') ? globalZone : (user.location !== 'SYSTEM' ? user.location : (currentZones[0] || '')),
    supplier: currentSuppliers[0] || '', 
    item: currentItems[0] || '', 
    color: currentColors[0] || '', 
    size: currentSizes[0] || '', 
    rollNo: '', 
    totalPoints: '', 
    width: '', 
    length: '', 
    status: 'PASS', 
    remarks: '' 
  });

  // Sync zone with globalZone
  React.useEffect(() => {
    if (globalZone && globalZone !== 'ALL') {
      setForm(prev => ({ ...prev, zone: globalZone }));
    }
  }, [globalZone]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.run('api_saveMaterialReport', { ...form, inspector: user.username, timestamp: new Date().toISOString() });
      triggerSuccess('MATERIAL INSPECTION SUBMITTED SUCCESSFULLY');
      setForm({ ...form, rollNo: '', totalPoints: '', width: '', length: '', remarks: '' });
    } catch (error) {
      alert('Error saving material inspection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label>Zone</label>
          <select value={form.zone} onChange={e => setForm({...form, zone: e.target.value})}>
            {currentZones.map((z: string) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div>
          <label>Supplier</label>
          <select value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})}>
            {currentSuppliers.map((s: string) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label>Item Name</label>
          <select value={form.item} onChange={e => setForm({...form, item: e.target.value})}>
            {currentItems.map((i: string) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <label>Color</label>
          <select value={form.color} onChange={e => setForm({...form, color: e.target.value})}>
            {currentColors.map((c: string) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label>Size</label>
          <select value={form.size} onChange={e => setForm({...form, size: e.target.value})}>
            {currentSizes.map((s: string) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label>Roll Number</label>
          <input type="text" placeholder="Enter Roll No" value={form.rollNo} onChange={e => setForm({...form, rollNo: e.target.value})} required />
        </div>
        <div>
          <label>Total Points</label>
          <input type="number" placeholder="Enter Points" value={form.totalPoints} onChange={e => setForm({...form, totalPoints: e.target.value})} required />
        </div>
        <div>
          <label>Width (inch)</label>
          <input type="number" placeholder="Enter Width" value={form.width} onChange={e => setForm({...form, width: e.target.value})} required />
        </div>
        <div>
          <label>Length (mtr)</label>
          <input type="number" placeholder="Enter Length" value={form.length} onChange={e => setForm({...form, length: e.target.value})} required />
        </div>
      </div>

      <div>
        <label>Status</label>
        <div className="flex gap-4">
          {['PASS', 'FAIL', 'HOLD'].map(s => (
            <button 
              key={s} 
              type="button"
              onClick={() => setForm({...form, status: s})}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${form.status === s ? (s === 'PASS' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : s === 'FAIL' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-amber-500 text-white shadow-lg shadow-amber-200') : 'bg-slate-100 text-slate-400'}`}
            >
              {s}
            </button>
          ))}
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
        {isSubmitting ? 'SUBMITTING...' : <><Icon name="save" size={20} /> SUBMIT INSPECTION</>}
      </button>
    </form>
  );
};

export default MaterialInspection;
