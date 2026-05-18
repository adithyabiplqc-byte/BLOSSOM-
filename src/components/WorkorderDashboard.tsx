import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import { ZONES } from '../constants';
import Icon from './Icon';

interface WorkorderDashboardProps {
  workorders: any[];
  setWorkorders: (wo: any[]) => void;
  user: any;
  settings: any;
  refreshData: () => Promise<void>;
  triggerSuccess: (message: string) => void;
  globalZone?: string;
}

const WorkorderDashboard: React.FC<WorkorderDashboardProps> = ({ workorders, setWorkorders, user, settings, refreshData, triggerSuccess, globalZone }) => {
  const currentZones = settings?.ZONE || ZONES || [];
  const initialZone = (globalZone && globalZone !== 'ALL') ? globalZone : (user?.location !== 'SYSTEM' ? user?.location : (currentZones && currentZones.length > 0 ? currentZones[0] : ZONES[0]));

  const [form, setForm] = useState({ 
    zone: initialZone, 
    workorderNumber: '', 
    item: '', 
    style: '', 
    sizeRange: '', 
    quantity: '', 
    colour: ''
  });
  const [search, setSearch] = useState('');
  const [selectedWO, setSelectedWO] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const woNum = String(form.workorderNumber).trim();
      
      if (!woNum) {
        alert("Workorder Number is required");
        setIsSubmitting(false);
        return;
      }

      const woData = { 
        ...form, 
        id: isEditing ? selectedWO.id : Date.now(), 
        createdAt: isEditing ? selectedWO.createdAt : new Date().toISOString() 
      };

      if (isEditing) {
        await api.run('api_updateWorkorder', woData);
        triggerSuccess(`WORKORDER ${woNum} UPDATED`);
      } else {
        const exists = workorders.some(w => String(w.workorderNumber) === woNum);
        if (exists) {
          alert(`Workorder ${woNum} already exists!`);
          setIsSubmitting(false);
          return;
        }
        await api.run('api_saveWorkorder', woData);
        triggerSuccess(`WORKORDER ${woNum} CREATED`);
      }

      setForm({ 
        zone: (globalZone && globalZone !== 'ALL') ? globalZone : (user?.location !== 'SYSTEM' ? user?.location : ZONES[0]), 
        workorderNumber: '', 
        item: '', 
        style: '', 
        sizeRange: '', 
        quantity: '', 
        colour: ''
      });
      setIsEditing(false);
      setSelectedWO(null);
      await refreshData();
    } catch (err: any) {
      console.error("WO Save Error:", err);
      alert('Error saving workorder');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (wo: any) => {
    if (!window.confirm('Delete this workorder?')) return;
    setWorkorders(workorders.filter(w => w.id !== wo.id));
    api.run('api_deleteWorkorder', wo.id, wo).then(() => refreshData());
    setSelectedWO(null);
  };

  const startEdit = (wo: any) => {
    setForm(wo);
    setSelectedWO(wo);
    setIsEditing(true);
  };

  const filteredWorkorders = React.useMemo(() => {
    return workorders.filter(wo => {
      const zoneMatch = !globalZone || globalZone === 'ALL' || wo.zone === globalZone;
      const searchMatch = String(wo.workorderNumber).toLowerCase().includes(search.toLowerCase()) ||
                          String(wo.item).toLowerCase().includes(search.toLowerCase()) ||
                          String(wo.style).toLowerCase().includes(search.toLowerCase());
      return zoneMatch && searchMatch;
    });
  }, [workorders, globalZone, search]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="glass-card p-8 sticky top-24">
            <h2 className="text-2xl font-bold mb-6 text-indigo-800 border-b pb-4">{isEditing ? 'Edit Workorder' : 'New Entry'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label>Zone</label>
                <select className="w-full" value={form.zone} onChange={e => setForm({...form, zone: e.target.value})}>
                  {currentZones.map((z: string) => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label>Workorder Number</label>
                <input type="number" placeholder="Enter WO Number" className="w-full" value={form.workorderNumber} onChange={e => setForm({...form, workorderNumber: e.target.value})} required />
              </div>
              <div>
                <label>Item Name</label>
                <input type="text" placeholder="Enter Item Name" className="w-full" value={form.item} onChange={e => setForm({...form, item: e.target.value})} required />
              </div>
              <div>
                <label>Style</label>
                <input type="text" placeholder="Enter Style" className="w-full" value={form.style} onChange={e => setForm({...form, style: e.target.value})} required />
              </div>
              <div>
                <label>Size Range</label>
                <input type="text" placeholder="Enter Size Range" className="w-full" value={form.sizeRange} onChange={e => setForm({...form, sizeRange: e.target.value})} required />
              </div>
              <div>
                <label>Quantity</label>
                <input type="number" placeholder="Enter Quantity" className="w-full" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required />
              </div>
              <div>
                <label>Colour</label>
                <input type="text" placeholder="Enter Colour" className="w-full" value={form.colour} onChange={e => setForm({...form, colour: e.target.value})} required />
              </div>
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`btn-primary flex-1 py-4 text-xs font-black italic tracking-widest uppercase mt-4 transition-all shadow-xl shadow-indigo-100 hover:scale-[1.02]`}
                >
                  {isSubmitting ? 'SAVING...' : (isEditing ? 'UPDATE WO' : 'SUBMIT WO')}
                </button>
                {isEditing && <button type="button" onClick={() => { setIsEditing(false); setSelectedWO(null); setForm({ zone: ZONES[0], workorderNumber: '', item: '', style: '', sizeRange: '', quantity: '', colour: '' }); }} className="btn-secondary mt-4">CANCEL</button>}
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {selectedWO && !isEditing && (
            <div className="glass-card p-8 border-l-[12px] border-indigo-600 animate-in slide-in-from-right-4">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 uppercase">Workorder Details</h2>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Detailed View</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(selectedWO)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Icon name="edit" size={20} /></button>
                  <button onClick={() => handleDelete(selectedWO)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><Icon name="trash-2" size={20} /></button>
                  <button onClick={() => setSelectedWO(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><Icon name="x" size={24} /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                  <span className="text-indigo-400 block uppercase text-[10px] font-black tracking-widest">WO Number</span>
                  <span className="font-bold text-slate-800 text-2xl">{selectedWO.workorderNumber}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-indigo-400 block uppercase text-[10px] font-black tracking-widest">Zone</span>
                  <span className="font-bold text-slate-800 text-2xl">{selectedWO.zone}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-indigo-400 block uppercase text-[10px] font-black tracking-widest">Item</span>
                  <span className="font-bold text-slate-800 text-2xl">{selectedWO.item}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-indigo-400 block uppercase text-[10px] font-black tracking-widest">Style</span>
                  <span className="font-bold text-slate-800 text-2xl">{selectedWO.style}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-indigo-400 block uppercase text-[10px] font-black tracking-widest">Colour</span>
                  <span className="font-bold text-slate-800 text-2xl">{selectedWO.colour}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-indigo-400 block uppercase text-[10px] font-black tracking-widest">Quantity</span>
                  <span className="font-bold text-slate-800 text-2xl">{selectedWO.quantity}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-indigo-400 block uppercase text-[10px] font-black tracking-widest">Size Range</span>
                  <span className="font-bold text-slate-800 text-2xl">{selectedWO.sizeRange}</span>
                </div>
              </div>
            </div>
          )}

          <div className="glass-card p-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Existing Workorders</h2>
              <div className="relative w-full md:w-64">
                <input 
                  type="text" 
                  placeholder="Search WO, Item, Style..." 
                  className="pl-10 py-2 text-sm"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-xs font-bold uppercase text-slate-500">WO #</th>
                    <th className="p-4 text-xs font-bold uppercase text-slate-500">Item</th>
                    <th className="p-4 text-xs font-bold uppercase text-slate-500">Style</th>
                    <th className="p-4 text-xs font-bold uppercase text-slate-500">Colour</th>
                    <th className="p-4 text-xs font-bold uppercase text-slate-500 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkorders.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-400 italic">No workorders found.</td></tr>
                  ) : (
                    filteredWorkorders.map((wo, i) => (
                      <tr 
                        key={i} 
                        onClick={() => setSelectedWO(wo)}
                        className={`border-b border-slate-100 hover:bg-indigo-50 cursor-pointer transition-colors ${selectedWO?.id === wo.id ? 'bg-indigo-50' : ''}`}
                      >
                        <td className="p-4 font-mono text-indigo-600 font-bold">{wo.workorderNumber}</td>
                        <td className="p-4 font-semibold">{wo.item}</td>
                        <td className="p-4">{wo.style}</td>
                        <td className="p-4">{wo.colour}</td>
                        <td className="p-4 text-right font-bold">{wo.quantity}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkorderDashboard;
