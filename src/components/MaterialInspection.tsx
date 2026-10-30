import React, { useState, useMemo, useEffect } from 'react';
import { api } from '../services/api';
import { SUPPLIERS, ITEMS, ZONES } from '../constants';
import Icon from './Icon';
import SearchableSelect from './SearchableSelect';
import { parseSettingList, getEffectiveZones, getDropboxList } from '../utils/settingUtils';

interface MaterialInspectionProps {
  user: any;
  settings: any;
  triggerSuccess: (message: string) => void;
  globalZone?: string;
  refreshData?: () => void;
}

interface InspectionItem {
  itemName: string;
  receivedQuantity: string;
  checkedQuantity: string;
  passQuantity: string;
  rejectedQuantity: string;
  remarks: string;
}

const MaterialInspection: React.FC<MaterialInspectionProps> = ({ user, settings, triggerSuccess, globalZone, refreshData }) => {
  const currentSuppliers = useMemo(() => {
    return getDropboxList(settings, 'SUPPLIER', SUPPLIERS);
  }, [settings]);

  const currentItems = useMemo(() => {
    return getDropboxList(settings, 'ITEMS', ITEMS);
  }, [settings]);

  const currentZones = useMemo(() => {
    const userZone = String(user?.zone || user?.location || '').trim().toUpperCase();
    if (user?.role !== 'ADMIN' && user?.zone !== 'COMMON' && userZone && userZone !== 'SYSTEM') {
      return [userZone];
    }
    const list = getEffectiveZones(settings, undefined, user);
    return list.filter((z: string) => z && z.toUpperCase() !== 'ALL');
  }, [settings, user]);

  const userZone = String(user?.zone || user?.location || '').trim().toUpperCase();
  const isUserLocked = user?.role !== 'ADMIN' && user?.zone !== 'COMMON' && userZone && userZone !== 'SYSTEM';
  const initialZone = isUserLocked ? userZone : ((globalZone && globalZone !== 'ALL') ? globalZone : (currentZones[0] || ''));

  const [header, setHeader] = useState({
    zone: initialZone,
    billNo: '',
    supplierName: '',
    grn: '',
    materialType: '',
    receivedDate: new Date().toISOString().split('T')[0],
    checkingDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  const [items, setItems] = useState<InspectionItem[]>([
    { itemName: '', receivedQuantity: '', checkedQuantity: '', passQuantity: '', rejectedQuantity: '', remarks: '' }
  ]);

  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync zone with globalZone when changed
  useEffect(() => {
    if (globalZone && globalZone !== 'ALL') {
      setHeader(prev => ({ ...prev, zone: globalZone }));
    }
  }, [globalZone]);

  const addItem = () => {
    setItems(prev => [
      ...prev,
      { itemName: '', receivedQuantity: '', checkedQuantity: '', passQuantity: '', rejectedQuantity: '', remarks: '' }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
    setValidationErrors(prev => {
      const copy = { ...prev };
      Object.keys(copy).forEach(k => {
        if (k.startsWith(`item_${index}_`)) delete copy[k];
      });
      return copy;
    });
  };

  const updateHeader = (field: string, value: string) => {
    setHeader(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
    if (errorMessage) setErrorMessage(null);
  };

  const updateItem = (index: number, field: keyof InspectionItem, value: string) => {
    setItems(prev => {
      const copy = [...prev];
      const current = { ...copy[index], [field]: value };

      // Auto-calculations for rapid inspection data entry
      if (field === 'receivedQuantity' && (!current.checkedQuantity || current.checkedQuantity === '0')) {
        current.checkedQuantity = value;
      }
      if (field === 'checkedQuantity' || field === 'passQuantity') {
        const chk = parseFloat(field === 'checkedQuantity' ? value : current.checkedQuantity);
        const pass = parseFloat(field === 'passQuantity' ? value : current.passQuantity);
        if (!isNaN(chk) && !isNaN(pass) && chk >= pass) {
          current.rejectedQuantity = String(Math.max(0, chk - pass));
        }
      }

      copy[index] = current;
      return copy;
    });

    const errKey = `item_${index}_${field}`;
    if (validationErrors[errKey]) {
      setValidationErrors(prev => {
        const copy = { ...prev };
        delete copy[errKey];
        return copy;
      });
    }
    if (errorMessage) setErrorMessage(null);
  };

  const handleClear = () => {
    setHeader({
      zone: (globalZone && globalZone !== 'ALL') ? globalZone : (currentZones[0] || ''),
      billNo: '',
      supplierName: '',
      grn: '',
      materialType: '',
      receivedDate: new Date().toISOString().split('T')[0],
      checkingDate: new Date().toISOString().split('T')[0],
      remarks: ''
    });
    setItems([{ itemName: '', receivedQuantity: '', checkedQuantity: '', passQuantity: '', rejectedQuantity: '', remarks: '' }]);
    setValidationErrors({});
    setErrorMessage(null);
  };

  const validateAllFields = (): boolean => {
    const errors: Record<string, boolean> = {};
    const missingFields: string[] = [];

    // Header validations
    if (!header.zone || !header.zone.trim() || header.zone === 'ALL' || header.zone.toLowerCase().includes('select')) {
      errors['zone'] = true;
      missingFields.push('Zone');
    }
    if (!header.billNo || !header.billNo.trim()) {
      errors['billNo'] = true;
      missingFields.push('Bill No');
    }
    if (!header.supplierName || !header.supplierName.trim() || header.supplierName.toLowerCase().includes('select')) {
      errors['supplierName'] = true;
      missingFields.push('Supplier Name');
    }
    if (!header.grn || !header.grn.trim()) {
      errors['grn'] = true;
      missingFields.push('GRN');
    }
    if (!header.materialType || !header.materialType.trim() || header.materialType.toLowerCase().includes('select')) {
      errors['materialType'] = true;
      missingFields.push('Material Type');
    }
    if (!header.receivedDate || !header.receivedDate.trim()) {
      errors['receivedDate'] = true;
      missingFields.push('Received Date');
    }
    if (!header.checkingDate || !header.checkingDate.trim()) {
      errors['checkingDate'] = true;
      missingFields.push('Checked Date');
    }
    if (!header.remarks || !header.remarks.trim()) {
      errors['remarks'] = true;
      missingFields.push('General Remarks');
    }

    // Items table validations
    if (items.length === 0) {
      missingFields.push('Item Row');
    }

    items.forEach((item, idx) => {
      const rowNum = idx + 1;
      if (!item.itemName || !item.itemName.trim() || item.itemName.toLowerCase().includes('select')) {
        errors[`item_${idx}_itemName`] = true;
        missingFields.push(`Row ${rowNum} Item Name`);
      }
      if (item.receivedQuantity === '' || item.receivedQuantity === null || isNaN(Number(item.receivedQuantity))) {
        errors[`item_${idx}_receivedQuantity`] = true;
        missingFields.push(`Row ${rowNum} Received Qty`);
      }
      if (item.checkedQuantity === '' || item.checkedQuantity === null || isNaN(Number(item.checkedQuantity))) {
        errors[`item_${idx}_checkedQuantity`] = true;
        missingFields.push(`Row ${rowNum} Checked Qty`);
      }
      if (item.passQuantity === '' || item.passQuantity === null || isNaN(Number(item.passQuantity))) {
        errors[`item_${idx}_passQuantity`] = true;
        missingFields.push(`Row ${rowNum} Pass Qty`);
      }
      if (item.rejectedQuantity === '' || item.rejectedQuantity === null || isNaN(Number(item.rejectedQuantity))) {
        errors[`item_${idx}_rejectedQuantity`] = true;
        missingFields.push(`Row ${rowNum} Rejected Qty`);
      }
      if (!item.remarks || !item.remarks.trim()) {
        errors[`item_${idx}_remarks`] = true;
        missingFields.push(`Row ${rowNum} Remarks`);
      }
    });

    setValidationErrors(errors);

    if (missingFields.length > 0) {
      setErrorMessage(`Please fill all boxes! Missing: ${missingFields.slice(0, 5).join(', ')}${missingFields.length > 5 ? ` and ${missingFields.length - 5} more` : ''}.`);
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const isValid = validateAllFields();
    if (!isValid) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.run('api_saveMaterialReportBulk', { 
        ...header, 
        items,
        inspector: user?.username || 'SYSTEM', 
        timestamp: new Date().toISOString() 
      });
      triggerSuccess('MATERIAL INSPECTION ENTRY UPLOADED SUCCESSFULLY');
      if (refreshData) refreshData();
      handleClear();
    } catch (error: any) {
      console.error("Submission error:", error);
      setErrorMessage(`Error saving inspection: ${error?.message || 'Check connection'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in" noValidate>
      {/* Error Message Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-300 shadow-sm animate-shake">
          <div className="flex items-center gap-2">
            <Icon name="alert-circle" size={18} className="text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-600 p-1"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      )}

      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        {/* Zone */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
            Zone
          </label>
          <SearchableSelect 
            value={header.zone} 
            onChange={e => updateHeader('zone', e.target.value)} 
            className={`w-full bg-white dark:bg-slate-900 border-2 rounded-xl text-xs font-bold py-2 px-3 outline-none transition-all ${
              validationErrors['zone'] 
                ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-950' 
                : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
            }`}
          >
            <option value="">Select Zone...</option>
            {currentZones.map((z: string) => <option key={z} value={z}>{z}</option>)}
          </SearchableSelect>
        </div>

        {/* Bill No */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
            Bill No
          </label>
          <input 
            type="text" 
            placeholder="Enter Bill No" 
            value={header.billNo} 
            onChange={e => updateHeader('billNo', e.target.value)} 
            className={`w-full bg-white dark:bg-slate-900 border-2 rounded-xl text-xs font-bold py-2.5 px-3 outline-none transition-all ${
              validationErrors['billNo'] 
                ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-950' 
                : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
            }`}
          />
        </div>

        {/* Supplier Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
            Supplier Name
          </label>
          <SearchableSelect 
            value={header.supplierName} 
            onChange={e => updateHeader('supplierName', e.target.value)} 
            className={`w-full bg-white dark:bg-slate-900 border-2 rounded-xl text-xs font-bold py-2 px-3 outline-none transition-all ${
              validationErrors['supplierName'] 
                ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-950' 
                : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
            }`}
          >
            <option value="">Select Supplier...</option>
            {currentSuppliers.map((s: string) => <option key={s} value={s}>{s}</option>)}
          </SearchableSelect>
        </div>

        {/* GRN */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
            GRN
          </label>
          <input 
            type="text" 
            placeholder="Enter GRN" 
            value={header.grn} 
            onChange={e => updateHeader('grn', e.target.value)} 
            className={`w-full bg-white dark:bg-slate-900 border-2 rounded-xl text-xs font-bold py-2.5 px-3 outline-none transition-all ${
              validationErrors['grn'] 
                ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-950' 
                : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
            }`}
          />
        </div>

        {/* Material Type */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
            Material Type
          </label>
          <SearchableSelect 
            value={header.materialType} 
            onChange={e => updateHeader('materialType', e.target.value)} 
            className={`w-full bg-white dark:bg-slate-900 border-2 rounded-xl text-xs font-bold py-2 px-3 outline-none transition-all ${
              validationErrors['materialType'] 
                ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-950' 
                : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
            }`}
          >
            <option value="">Select Material Type...</option>
            <option value="Packing Material">Packing Material</option>
            <option value="Raw Material">Raw Material</option>
          </SearchableSelect>
        </div>

        {/* Received Date */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
            Received Date
          </label>
          <input 
            type="date" 
            value={header.receivedDate} 
            onChange={e => updateHeader('receivedDate', e.target.value)} 
            className={`w-full bg-white dark:bg-slate-900 border-2 rounded-xl text-xs font-bold py-2 px-3 outline-none transition-all ${
              validationErrors['receivedDate'] 
                ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-950' 
                : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
            }`}
          />
        </div>

        {/* Checked Date */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
            Checked Date
          </label>
          <input 
            type="date" 
            value={header.checkingDate} 
            onChange={e => updateHeader('checkingDate', e.target.value)} 
            className={`w-full bg-white dark:bg-slate-900 border-2 rounded-xl text-xs font-bold py-2 px-3 outline-none transition-all ${
              validationErrors['checkingDate'] 
                ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-950' 
                : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
            }`}
          />
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <Icon name="list" size={16} className="text-indigo-600" />
            Inspection Items
          </h3>
          <button 
            type="button" 
            onClick={addItem}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl font-black text-[10px] uppercase hover:bg-indigo-600 hover:text-white transition-all shadow-xs cursor-pointer"
          >
            <Icon name="plus" size={14} /> Add Item Row
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div 
              key={idx} 
              className="flex flex-col md:flex-row gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs relative transition-all"
            >
              {/* Row index indicator */}
              <div className="self-start md:self-center px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-500">
                #{idx + 1}
              </div>

              {/* Item Name */}
              <div className="flex-1 space-y-1">
                <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                  Item Name
                </label>
                <SearchableSelect 
                  value={item.itemName} 
                  onChange={e => updateItem(idx, 'itemName', e.target.value)}
                  className={`w-full text-xs font-bold py-1.5 px-2.5 rounded-lg border-2 outline-none transition-all ${
                    validationErrors[`item_${idx}_itemName`]
                      ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-950'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                  }`}
                >
                  <option value="">Select Item...</option>
                  {currentItems.map((i: string) => <option key={i} value={i}>{i}</option>)}
                </SearchableSelect>
              </div>

              {/* Received Qty */}
              <div className="w-full md:w-28 space-y-1">
                <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                  Received Qty
                </label>
                <input 
                  type="number" 
                  min="0"
                  placeholder="0"
                  value={item.receivedQuantity} 
                  onChange={e => updateItem(idx, 'receivedQuantity', e.target.value)}
                  className={`w-full text-xs font-bold py-1.5 px-2.5 rounded-lg border-2 outline-none transition-all ${
                    validationErrors[`item_${idx}_receivedQuantity`]
                      ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-950'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                  }`}
                />
              </div>

              {/* Checked Qty */}
              <div className="w-full md:w-28 space-y-1">
                <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                  Checked Qty
                </label>
                <input 
                  type="number" 
                  min="0"
                  placeholder="0"
                  value={item.checkedQuantity} 
                  onChange={e => updateItem(idx, 'checkedQuantity', e.target.value)}
                  className={`w-full text-xs font-bold py-1.5 px-2.5 rounded-lg border-2 outline-none transition-all ${
                    validationErrors[`item_${idx}_checkedQuantity`]
                      ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-950'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                  }`}
                />
              </div>

              {/* Pass Qty */}
              <div className="w-full md:w-28 space-y-1">
                <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                  Pass Qty
                </label>
                <input 
                  type="number" 
                  min="0"
                  placeholder="0"
                  value={item.passQuantity} 
                  onChange={e => updateItem(idx, 'passQuantity', e.target.value)}
                  className={`w-full text-xs font-bold py-1.5 px-2.5 rounded-lg border-2 outline-none transition-all ${
                    validationErrors[`item_${idx}_passQuantity`]
                      ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-950'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                  }`}
                />
              </div>

              {/* Rejected Qty */}
              <div className="w-full md:w-28 space-y-1">
                <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                  Rejected Qty
                </label>
                <input 
                  type="number" 
                  min="0"
                  placeholder="0"
                  value={item.rejectedQuantity} 
                  onChange={e => updateItem(idx, 'rejectedQuantity', e.target.value)}
                  className={`w-full text-xs font-bold py-1.5 px-2.5 rounded-lg border-2 outline-none transition-all ${
                    validationErrors[`item_${idx}_rejectedQuantity`]
                      ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-950'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                  }`}
                />
              </div>

              {/* Item Remarks */}
              <div className="flex-1 space-y-1">
                <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                  Remarks
                </label>
                <input 
                  type="text" 
                  placeholder="Remarks"
                  value={item.remarks} 
                  onChange={e => updateItem(idx, 'remarks', e.target.value)}
                  className={`w-full text-xs font-bold py-1.5 px-2.5 rounded-lg border-2 outline-none transition-all ${
                    validationErrors[`item_${idx}_remarks`]
                      ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-950'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                  }`}
                />
              </div>

              {items.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeItem(idx)}
                  className="md:self-end p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                  title="Remove Item Row"
                >
                  <Icon name="trash-2" size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* General Remarks */}
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
          General Remarks
        </label>
        <textarea 
          placeholder="Enter general remarks and observations here..." 
          value={header.remarks} 
          onChange={e => updateHeader('remarks', e.target.value)} 
          rows={3}
          className={`w-full bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl p-4 text-xs font-medium outline-none transition-all ${
            validationErrors['remarks']
              ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-950'
              : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500'
          }`}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <button 
          type="button"
          onClick={handleClear}
          className="btn-secondary py-4 px-6 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
        >
          Clear Form
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="btn-primary flex-1 py-4 px-8 text-xs font-black uppercase tracking-wider rounded-xl shadow-xl shadow-indigo-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Icon name="refresh-cw" size={16} className="animate-spin" />
              <span>Saving Inspection...</span>
            </>
          ) : (
            <>
              <Icon name="save" size={16} />
              <span>Submit Material Inspection</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default MaterialInspection;
