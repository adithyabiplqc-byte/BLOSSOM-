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
  const currentSuppliers = settings?.SUPPLIER || settings?.SUPPLIERS || [];
  const currentItems = settings?.ITEMS || settings?.ITEM || [];
  const currentZones = settings?.ZONE || settings?.ZONES || ['KERALA', 'TIRUPUR', 'BANGLORE'];
  const currentStyles = settings?.STYLE_NAME || settings?.['STYLE_NAME'] || settings?.['STYLE NAME'] || settings?.STYLE || settings?.STYLES || [];

  const [header, setHeader] = useState({
    zone: (globalZone && globalZone !== 'ALL') ? globalZone : (currentZones[0] || ''),
    billNo: '',
    supplierName: currentSuppliers[0] || '',
    grn: '',
    receivedDate: new Date().toISOString().split('T')[0],
    checkingDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  const [items, setItems] = useState([
    { itemName: currentItems[0] || '', receivedQuantity: '', checkedQuantity: '', passQuantity: '', rejectedQuantity: '', remarks: '' }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initial values when settings load
  React.useEffect(() => {
    if (!header.supplierName && currentSuppliers.length > 0) {
      setHeader(prev => ({ ...prev, supplierName: currentSuppliers[0] }));
    }
    if (items.length === 1 && currentItems.length > 0) {
      if (!items[0].itemName) updateItem(0, 'itemName', currentItems[0]);
    }
  }, [currentSuppliers, currentItems]);

  // Sync zone with globalZone
  React.useEffect(() => {
    if (globalZone && globalZone !== 'ALL') {
      setHeader(prev => ({ ...prev, zone: globalZone }));
    } else if (!header.zone && currentZones.length > 0) {
      setHeader(prev => ({ ...prev, zone: currentZones[0] }));
    }
  }, [globalZone, currentZones]);

  const addItem = () => {
    setItems([...items, { itemName: currentItems[0] || '', receivedQuantity: '', checkedQuantity: '', passQuantity: '', rejectedQuantity: '', remarks: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleClear = () => {
    setHeader({
      zone: (globalZone && globalZone !== 'ALL') ? globalZone : (currentZones[0] || ''),
      billNo: '',
      supplierName: currentSuppliers[0] || '',
      grn: '',
      receivedDate: new Date().toISOString().split('T')[0],
      checkingDate: new Date().toISOString().split('T')[0],
      remarks: ''
    });
    setItems([{ itemName: currentItems[0] || '', receivedQuantity: '', checkedQuantity: '', passQuantity: '', rejectedQuantity: '', remarks: '' }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!header.billNo || !header.supplierName || !header.grn) {
      return alert("Please enter Bill No, Supplier and GRN");
    }

    setIsSubmitting(true);
    try {
      await api.run('api_saveMaterialReportBulk', { 
        ...header, 
        items,
        inspector: user.username, 
        timestamp: new Date().toISOString() 
      });
      triggerSuccess('MATERIAL INSPECTION SUBMITTED SUCCESSFULLY');
      handleClear();
    } catch (error) {
      alert('Error saving material inspection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zone</label>
          <select 
            value={header.zone} 
            onChange={e => setHeader({...header, zone: e.target.value})} 
            required 
            className="w-full bg-white border-2 border-slate-100 focus:border-indigo-500 rounded-xl disabled:bg-slate-50"
          >
            {currentZones.map((z: string) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bill No</label>
          <input 
            type="text" 
            placeholder="Enter Bill No" 
            value={header.billNo} 
            onChange={e => setHeader({...header, billNo: e.target.value})} 
            required 
            className="w-full bg-white border-2 border-slate-100 focus:border-indigo-500 rounded-xl"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Supplier Name</label>
          <select 
            value={header.supplierName} 
            onChange={e => setHeader({...header, supplierName: e.target.value})} 
            required 
            className="w-full bg-white border-2 border-slate-100 focus:border-indigo-500 rounded-xl"
          >
            <option value="">Select Supplier...</option>
            {currentSuppliers.map((s: string) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GRN</label>
          <input 
            type="text" 
            placeholder="Enter GRN" 
            value={header.grn} 
            onChange={e => setHeader({...header, grn: e.target.value})} 
            required 
            className="w-full bg-white border-2 border-slate-100 focus:border-indigo-500 rounded-xl"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Received Date</label>
          <input 
            type="date" 
            value={header.receivedDate} 
            onChange={e => setHeader({...header, receivedDate: e.target.value})} 
            required 
            className="w-full bg-white border-2 border-slate-100 focus:border-indigo-500 rounded-xl"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Checked Date</label>
          <input 
            type="date" 
            value={header.checkingDate} 
            onChange={e => setHeader({...header, checkingDate: e.target.value})} 
            required 
            className="w-full bg-white border-2 border-slate-100 focus:border-indigo-500 rounded-xl"
          />
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <Icon name="list" size={16} className="text-indigo-600" />
            Inspection Items
          </h3>
          <button 
            type="button" 
            onClick={addItem}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
          >
            <Icon name="plus" size={14} /> Add Item
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-fade-in relative group">
              <div className="flex-1 space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Item Name</label>
                <select 
                  value={item.itemName} 
                  onChange={e => updateItem(idx, 'itemName', e.target.value)}
                  className="w-full text-xs font-bold"
                >
                  {currentItems.map((i: string) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="w-full md:w-24 space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Received Quantity</label>
                <input 
                  type="number" 
                  placeholder="0"
                  value={item.receivedQuantity} 
                  onChange={e => updateItem(idx, 'receivedQuantity', e.target.value)}
                  required
                  className="w-full text-xs font-bold"
                />
              </div>
              <div className="w-full md:w-24 space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Checked Quantity</label>
                <input 
                  type="number" 
                  placeholder="0"
                  value={item.checkedQuantity} 
                  onChange={e => updateItem(idx, 'checkedQuantity', e.target.value)}
                  required
                  className="w-full text-xs font-bold"
                />
              </div>
              <div className="w-full md:w-24 space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Pass Quantity</label>
                <input 
                  type="number" 
                  placeholder="0"
                  value={item.passQuantity} 
                  onChange={e => updateItem(idx, 'passQuantity', e.target.value)}
                  required
                  className="w-full text-xs font-bold bg-emerald-50"
                />
              </div>
              <div className="w-full md:w-24 space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Rejected Quantity</label>
                <input 
                  type="number" 
                  placeholder="0"
                  value={item.rejectedQuantity} 
                  onChange={e => updateItem(idx, 'rejectedQuantity', e.target.value)}
                  required
                  className="w-full text-xs font-bold bg-rose-50"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Remarks</label>
                <input 
                  type="text" 
                  placeholder="Notes"
                  value={item.remarks} 
                  onChange={e => updateItem(idx, 'remarks', e.target.value)}
                  className="w-full text-xs font-bold"
                />
              </div>
              {items.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeItem(idx)}
                  className="md:self-end p-2.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                >
                  <Icon name="trash-2" size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">General Remarks</label>
        <textarea 
          placeholder="Enter any additional remarks here..." 
          value={header.remarks} 
          onChange={e => setHeader({...header, remarks: e.target.value})} 
          className="w-full min-h-[100px] bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all"
        />
      </div>

      <div className="flex gap-4">
        <button 
          type="button"
          onClick={handleClear}
          className="btn-secondary flex-1 py-4 text-sm font-black uppercase tracking-widest"
        >
          Clear Form
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="btn-primary flex-[3] py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-200"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Icon name="refresh-cw" size={18} className="animate-spin" />
              PROCESSING SUBMISSION...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Icon name="save" size={18} />
              FINAL SUBMIT INSPECTION
            </span>
          )}
        </button>
      </div>
    </form>
  );
};

export default MaterialInspection;
