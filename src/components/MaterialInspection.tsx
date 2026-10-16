import React, { useState, useMemo, useEffect } from 'react';
import { api } from '../services/api';
import { SUPPLIERS, ITEMS, ZONES } from '../constants';
import Icon from './Icon';
import SearchableSelect from './SearchableSelect';

interface MaterialInspectionProps {
  user: any;
  settings: any;
  triggerSuccess: (message: string) => void;
  globalZone?: string;
}

interface InspectionItem {
  itemName: string;
  receivedQuantity: string;
  checkedQuantity: string;
  passQuantity: string;
  rejectedQuantity: string;
  remarks: string;
}

const MaterialInspection: React.FC<MaterialInspectionProps> = ({ user, settings, triggerSuccess, globalZone }) => {
  const currentSuppliers = useMemo(() => {
    const list = settings?.SUPPLIER || settings?.SUPPLIERS || SUPPLIERS || [];
    return Array.isArray(list) ? list.filter(Boolean) : [];
  }, [settings]);

  const currentItems = useMemo(() => {
    const list = settings?.ITEMS || settings?.ITEM || ITEMS || [];
    return Array.isArray(list) ? list.filter(Boolean) : [];
  }, [settings]);

  const hasSpreadsheet = typeof localStorage !== 'undefined' && (localStorage.getItem('VITE_SPREADSHEET_ID') || localStorage.getItem('VITE_GAS_URL'));
  const currentZones = useMemo(() => {
    const list = settings?.ZONE || settings?.ZONES || (hasSpreadsheet ? [] : ZONES);
    const arr = Array.isArray(list) ? list.filter(Boolean) : [];
    return arr.filter((z: string) => z && z.toUpperCase() !== 'ALL');
  }, [settings, hasSpreadsheet]);

  const initialZone = (globalZone && globalZone !== 'ALL') ? globalZone : (currentZones[0] || 'A');

  const [header, setHeader] = useState({
    zone: initialZone,
    billNo: '',
    supplierName: currentSuppliers[0] || '',
    grn: '',
    materialType: 'Packing Material',
    receivedDate: new Date().toISOString().split('T')[0],
    checkingDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  const [items, setItems] = useState<InspectionItem[]>([
    { itemName: currentItems[0] || '', receivedQuantity: '', checkedQuantity: '', passQuantity: '', rejectedQuantity: '', remarks: '' }
  ]);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initial values when settings load
  useEffect(() => {
    if (!header.supplierName && currentSuppliers.length > 0) {
      setHeader(prev => ({ ...prev, supplierName: currentSuppliers[0] }));
    }
    if (items.length === 1 && currentItems.length > 0 && !items[0].itemName) {
      updateItem(0, 'itemName', currentItems[0]);
    }
  }, [currentSuppliers, currentItems]);

  // Sync zone with globalZone
  useEffect(() => {
    if (globalZone && globalZone !== 'ALL') {
      setHeader(prev => ({ ...prev, zone: globalZone }));
    } else if (currentZones && currentZones.length > 0 && (!header.zone || !currentZones.includes(header.zone))) {
      setHeader(prev => ({ ...prev, zone: currentZones[0] }));
    }
  }, [globalZone, currentZones]);

  const addItem = () => {
    setItems(prev => [
      ...prev,
      { itemName: currentItems[0] || '', receivedQuantity: '', checkedQuantity: '', passQuantity: '', rejectedQuantity: '', remarks: '' }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
    // Clear item-specific errors
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
      copy[index] = { ...copy[index], [field]: value };
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
      zone: (globalZone && globalZone !== 'ALL') ? globalZone : (currentZones[0] || 'A'),
      billNo: '',
      supplierName: currentSuppliers[0] || '',
      grn: '',
      materialType: 'Packing Material',
      receivedDate: new Date().toISOString().split('T')[0],
      checkingDate: new Date().toISOString().split('T')[0],
      remarks: ''
    });
    setItems([{ itemName: currentItems[0] || '', receivedQuantity: '', checkedQuantity: '', passQuantity: '', rejectedQuantity: '', remarks: '' }]);
    setValidationErrors({});
    setErrorMessage(null);
  };

  const validateAllFields = (): boolean => {
    const errors: Record<string, string> = {};
    const missingFields: string[] = [];

    // Header validations: All boxes and dropboxes are mandatory!
    if (!header.zone || !header.zone.trim() || header.zone === 'ALL') {
      errors['zone'] = 'Zone selection is mandatory.';
      missingFields.push('Zone (dropbox)');
    }
    if (!header.billNo || !header.billNo.trim()) {
      errors['billNo'] = 'Bill No is mandatory.';
      missingFields.push('Bill No (box)');
    }
    if (!header.supplierName || !header.supplierName.trim() || header.supplierName.toLowerCase().includes('select')) {
      errors['supplierName'] = 'Supplier Name selection is mandatory.';
      missingFields.push('Supplier Name (dropbox)');
    }
    if (!header.grn || !header.grn.trim()) {
      errors['grn'] = 'GRN is mandatory.';
      missingFields.push('GRN (box)');
    }
    if (!header.materialType || !header.materialType.trim()) {
      errors['materialType'] = 'Material Type selection is mandatory.';
      missingFields.push('Material Type (dropbox)');
    }
    if (!header.receivedDate || !header.receivedDate.trim()) {
      errors['receivedDate'] = 'Received Date is mandatory.';
      missingFields.push('Received Date (box)');
    }
    if (!header.checkingDate || !header.checkingDate.trim()) {
      errors['checkingDate'] = 'Checked Date is mandatory.';
      missingFields.push('Checked Date (box)');
    }
    if (!header.remarks || !header.remarks.trim()) {
      errors['remarks'] = 'General Remarks is mandatory.';
      missingFields.push('General Remarks (box)');
    }

    // Items table validations: All boxes and dropboxes in all item rows are mandatory!
    if (items.length === 0) {
      missingFields.push('At least one item row is mandatory.');
    }

    items.forEach((item, idx) => {
      const rowNum = idx + 1;
      if (!item.itemName || !item.itemName.trim() || item.itemName.toLowerCase().includes('select')) {
        errors[`item_${idx}_itemName`] = `Row ${rowNum}: Item Name is mandatory.`;
        missingFields.push(`Row ${rowNum} Item Name (dropbox)`);
      }
      if (item.receivedQuantity === '' || item.receivedQuantity === null || item.receivedQuantity === undefined || isNaN(Number(item.receivedQuantity))) {
        errors[`item_${idx}_receivedQuantity`] = `Row ${rowNum}: Received Quantity is mandatory.`;
        missingFields.push(`Row ${rowNum} Received Quantity (box)`);
      }
      if (item.checkedQuantity === '' || item.checkedQuantity === null || item.checkedQuantity === undefined || isNaN(Number(item.checkedQuantity))) {
        errors[`item_${idx}_checkedQuantity`] = `Row ${rowNum}: Checked Quantity is mandatory.`;
        missingFields.push(`Row ${rowNum} Checked Quantity (box)`);
      }
      if (item.passQuantity === '' || item.passQuantity === null || item.passQuantity === undefined || isNaN(Number(item.passQuantity))) {
        errors[`item_${idx}_passQuantity`] = `Row ${rowNum}: Pass Quantity is mandatory.`;
        missingFields.push(`Row ${rowNum} Pass Quantity (box)`);
      }
      if (item.rejectedQuantity === '' || item.rejectedQuantity === null || item.rejectedQuantity === undefined || isNaN(Number(item.rejectedQuantity))) {
        errors[`item_${idx}_rejectedQuantity`] = `Row ${rowNum}: Rejected Quantity is mandatory.`;
        missingFields.push(`Row ${rowNum} Rejected Quantity (box)`);
      }
      if (!item.remarks || !item.remarks.trim()) {
        errors[`item_${idx}_remarks`] = `Row ${rowNum}: Item Remarks is mandatory.`;
        missingFields.push(`Row ${rowNum} Item Remarks (box)`);
      }
    });

    setValidationErrors(errors);

    if (missingFields.length > 0) {
      setErrorMessage(`Cannot upload entry! All boxes and dropboxes are mandatory. Please fill: ${missingFields.slice(0, 4).join(', ')}${missingFields.length > 4 ? ` and ${missingFields.length - 4} more` : ''}.`);
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
      // Scroll to the error alert smoothly
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
      handleClear();
    } catch (error: any) {
      console.error("Submission error:", error);
      setErrorMessage(`Error uploading inspection: ${error?.message || 'Check connection'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in" noValidate>
      {/* Top Banner Notice for Mandatory Fields */}
      <div className="flex items-center justify-between p-4 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl text-xs">
        <div className="flex items-center gap-2.5 text-indigo-900 dark:text-indigo-200 font-bold">
          <Icon name="alert-circle" size={18} className="text-indigo-600 shrink-0" />
          <span>A1 Material Inspection — <strong>All boxes and dropboxes are mandatory</strong> (including Item Remarks and General Remarks).</span>
        </div>
        <span className="text-[10px] uppercase font-black tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-full border border-rose-200">
          Strict Validation Active
        </span>
      </div>

      {/* Prominent Error Banner if any box/dropbox is unfilled */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-400 dark:border-rose-800 rounded-2xl flex items-start gap-3 shadow-lg shadow-rose-500/10 animate-shake">
          <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
            <Icon name="alert-triangle" size={18} />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-rose-900 dark:text-rose-200">
              Upload Blocked — Mandatory Fields Required
            </h4>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 font-semibold leading-relaxed">
              {errorMessage}
            </p>
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
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
            Zone <span className="text-rose-600 font-black">*</span>
          </label>
          <SearchableSelect 
            value={header.zone} 
            onChange={e => updateHeader('zone', e.target.value)} 
            required 
            className={`w-full bg-white dark:bg-slate-900 border-2 rounded-xl text-xs font-bold py-2 px-3 ${
              validationErrors['zone'] 
                ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20' 
                : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
            }`}
          >
            <option value="">Select Zone...</option>
            {currentZones.map((z: string) => <option key={z} value={z}>{z}</option>)}
          </SearchableSelect>
          {validationErrors['zone'] && (
            <p className="text-[10px] text-rose-600 font-bold ml-1">{validationErrors['zone']}</p>
          )}
        </div>

        {/* Bill No */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
            Bill No <span className="text-rose-600 font-black">*</span>
          </label>
          <input 
            type="text" 
            placeholder="Enter Bill No (Mandatory)" 
            value={header.billNo} 
            onChange={e => updateHeader('billNo', e.target.value)} 
            required 
            className={`w-full bg-white dark:bg-slate-900 border-2 rounded-xl text-xs font-bold py-2.5 px-3 outline-none ${
              validationErrors['billNo'] 
                ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20' 
                : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
            }`}
          />
          {validationErrors['billNo'] && (
            <p className="text-[10px] text-rose-600 font-bold ml-1">{validationErrors['billNo']}</p>
          )}
        </div>

        {/* Supplier Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
            Supplier Name <span className="text-rose-600 font-black">*</span>
          </label>
          <SearchableSelect 
            value={header.supplierName} 
            onChange={e => updateHeader('supplierName', e.target.value)} 
            required 
            className={`w-full bg-white dark:bg-slate-900 border-2 rounded-xl text-xs font-bold py-2 px-3 ${
              validationErrors['supplierName'] 
                ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20' 
                : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
            }`}
          >
            <option value="">Select Supplier...</option>
            {currentSuppliers.map((s: string) => <option key={s} value={s}>{s}</option>)}
          </SearchableSelect>
          {validationErrors['supplierName'] && (
            <p className="text-[10px] text-rose-600 font-bold ml-1">{validationErrors['supplierName']}</p>
          )}
        </div>

        {/* GRN */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
            GRN <span className="text-rose-600 font-black">*</span>
          </label>
          <input 
            type="text" 
            placeholder="Enter GRN (Mandatory)" 
            value={header.grn} 
            onChange={e => updateHeader('grn', e.target.value)} 
            required 
            className={`w-full bg-white dark:bg-slate-900 border-2 rounded-xl text-xs font-bold py-2.5 px-3 outline-none ${
              validationErrors['grn'] 
                ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20' 
                : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
            }`}
          />
          {validationErrors['grn'] && (
            <p className="text-[10px] text-rose-600 font-bold ml-1">{validationErrors['grn']}</p>
          )}
        </div>

        {/* Material Type */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
            Material Type <span className="text-rose-600 font-black">*</span>
          </label>
          <SearchableSelect 
            value={header.materialType} 
            onChange={e => updateHeader('materialType', e.target.value)} 
            required 
            className={`w-full bg-white dark:bg-slate-900 border-2 rounded-xl text-xs font-bold py-2 px-3 ${
              validationErrors['materialType'] 
                ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20' 
                : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
            }`}
          >
            <option value="">Select Material Type...</option>
            <option value="Packing Material">Packing Material</option>
            <option value="Raw Material">Raw Material</option>
          </SearchableSelect>
          {validationErrors['materialType'] && (
            <p className="text-[10px] text-rose-600 font-bold ml-1">{validationErrors['materialType']}</p>
          )}
        </div>

        {/* Received Date */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
            Received Date <span className="text-rose-600 font-black">*</span>
          </label>
          <input 
            type="date" 
            value={header.receivedDate} 
            onChange={e => updateHeader('receivedDate', e.target.value)} 
            required 
            className={`w-full bg-white dark:bg-slate-900 border-2 rounded-xl text-xs font-bold py-2 px-3 outline-none ${
              validationErrors['receivedDate'] 
                ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20' 
                : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
            }`}
          />
          {validationErrors['receivedDate'] && (
            <p className="text-[10px] text-rose-600 font-bold ml-1">{validationErrors['receivedDate']}</p>
          )}
        </div>

        {/* Checked Date */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
            Checked Date <span className="text-rose-600 font-black">*</span>
          </label>
          <input 
            type="date" 
            value={header.checkingDate} 
            onChange={e => updateHeader('checkingDate', e.target.value)} 
            required 
            className={`w-full bg-white dark:bg-slate-900 border-2 rounded-xl text-xs font-bold py-2 px-3 outline-none ${
              validationErrors['checkingDate'] 
                ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20' 
                : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
            }`}
          />
          {validationErrors['checkingDate'] && (
            <p className="text-[10px] text-rose-600 font-bold ml-1">{validationErrors['checkingDate']}</p>
          )}
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2">
              <Icon name="list" size={16} className="text-indigo-600" />
              Inspection Items
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              ({items.length} {items.length === 1 ? 'item' : 'items'} — all fields required)
            </span>
          </div>
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
              className={`flex flex-col md:flex-row gap-3 p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-xs relative transition-all ${
                Object.keys(validationErrors).some(k => k.startsWith(`item_${idx}_`))
                  ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-950/50'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Row index indicator */}
              <div className="self-start md:self-center px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-500">
                #{idx + 1}
              </div>

              {/* Item Name */}
              <div className="flex-1 space-y-1">
                <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                  Item Name <span className="text-rose-600 font-black">*</span>
                </label>
                <SearchableSelect 
                  value={item.itemName} 
                  onChange={e => updateItem(idx, 'itemName', e.target.value)}
                  className={`w-full text-xs font-bold py-1.5 px-2.5 rounded-lg border-2 ${
                    validationErrors[`item_${idx}_itemName`]
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <option value="">Select Item...</option>
                  {currentItems.map((i: string) => <option key={i} value={i}>{i}</option>)}
                </SearchableSelect>
                {validationErrors[`item_${idx}_itemName`] && (
                  <p className="text-[9px] text-rose-600 font-bold">{validationErrors[`item_${idx}_itemName`]}</p>
                )}
              </div>

              {/* Received Qty */}
              <div className="w-full md:w-28 space-y-1">
                <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                  Received Qty <span className="text-rose-600 font-black">*</span>
                </label>
                <input 
                  type="number" 
                  min="0"
                  placeholder="0"
                  value={item.receivedQuantity} 
                  onChange={e => updateItem(idx, 'receivedQuantity', e.target.value)}
                  required
                  className={`w-full text-xs font-bold py-1.5 px-2.5 rounded-lg border-2 outline-none ${
                    validationErrors[`item_${idx}_receivedQuantity`]
                      ? 'border-rose-500 bg-rose-50/20 ring-2 ring-rose-200'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                  }`}
                />
                {validationErrors[`item_${idx}_receivedQuantity`] && (
                  <p className="text-[9px] text-rose-600 font-bold">{validationErrors[`item_${idx}_receivedQuantity`]}</p>
                )}
              </div>

              {/* Checked Qty */}
              <div className="w-full md:w-28 space-y-1">
                <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                  Checked Qty <span className="text-rose-600 font-black">*</span>
                </label>
                <input 
                  type="number" 
                  min="0"
                  placeholder="0"
                  value={item.checkedQuantity} 
                  onChange={e => updateItem(idx, 'checkedQuantity', e.target.value)}
                  required
                  className={`w-full text-xs font-bold py-1.5 px-2.5 rounded-lg border-2 outline-none ${
                    validationErrors[`item_${idx}_checkedQuantity`]
                      ? 'border-rose-500 bg-rose-50/20 ring-2 ring-rose-200'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                  }`}
                />
                {validationErrors[`item_${idx}_checkedQuantity`] && (
                  <p className="text-[9px] text-rose-600 font-bold">{validationErrors[`item_${idx}_checkedQuantity`]}</p>
                )}
              </div>

              {/* Pass Qty */}
              <div className="w-full md:w-28 space-y-1">
                <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                  Pass Qty <span className="text-rose-600 font-black">*</span>
                </label>
                <input 
                  type="number" 
                  min="0"
                  placeholder="0"
                  value={item.passQuantity} 
                  onChange={e => updateItem(idx, 'passQuantity', e.target.value)}
                  required
                  className={`w-full text-xs font-bold py-1.5 px-2.5 rounded-lg border-2 outline-none bg-emerald-50/30 dark:bg-emerald-950/20 ${
                    validationErrors[`item_${idx}_passQuantity`]
                      ? 'border-rose-500 bg-rose-50/20 ring-2 ring-rose-200'
                      : 'border-emerald-200 dark:border-emerald-800 focus:border-emerald-500'
                  }`}
                />
                {validationErrors[`item_${idx}_passQuantity`] && (
                  <p className="text-[9px] text-rose-600 font-bold">{validationErrors[`item_${idx}_passQuantity`]}</p>
                )}
              </div>

              {/* Rejected Qty */}
              <div className="w-full md:w-28 space-y-1">
                <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                  Rejected Qty <span className="text-rose-600 font-black">*</span>
                </label>
                <input 
                  type="number" 
                  min="0"
                  placeholder="0"
                  value={item.rejectedQuantity} 
                  onChange={e => updateItem(idx, 'rejectedQuantity', e.target.value)}
                  required
                  className={`w-full text-xs font-bold py-1.5 px-2.5 rounded-lg border-2 outline-none bg-rose-50/30 dark:bg-rose-950/20 ${
                    validationErrors[`item_${idx}_rejectedQuantity`]
                      ? 'border-rose-500 bg-rose-50/20 ring-2 ring-rose-200'
                      : 'border-rose-200 dark:border-rose-800 focus:border-rose-500'
                  }`}
                />
                {validationErrors[`item_${idx}_rejectedQuantity`] && (
                  <p className="text-[9px] text-rose-600 font-bold">{validationErrors[`item_${idx}_rejectedQuantity`]}</p>
                )}
              </div>

              {/* Item Remarks (Mandatory!) */}
              <div className="flex-1 space-y-1">
                <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                  Item Remarks <span className="text-rose-600 font-black">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Item inspection remarks (Mandatory)"
                  value={item.remarks} 
                  onChange={e => updateItem(idx, 'remarks', e.target.value)}
                  required
                  className={`w-full text-xs font-bold py-1.5 px-2.5 rounded-lg border-2 outline-none ${
                    validationErrors[`item_${idx}_remarks`]
                      ? 'border-rose-500 bg-rose-50/20 ring-2 ring-rose-200'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                  }`}
                />
                {validationErrors[`item_${idx}_remarks`] && (
                  <p className="text-[9px] text-rose-600 font-bold">{validationErrors[`item_${idx}_remarks`]}</p>
                )}
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

      {/* General Remarks (Mandatory!) */}
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
          General Remarks <span className="text-rose-600 font-black">*</span>
        </label>
        <textarea 
          placeholder="Enter mandatory general inspection remarks and observations here..." 
          value={header.remarks} 
          onChange={e => updateHeader('remarks', e.target.value)} 
          required
          rows={3}
          className={`w-full bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl p-4 text-xs font-medium outline-none transition-all ${
            validationErrors['remarks']
              ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20'
              : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500'
          }`}
        />
        {validationErrors['remarks'] && (
          <p className="text-[10px] text-rose-600 font-bold ml-1">{validationErrors['remarks']}</p>
        )}
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
              <span>Validating & Uploading Entry...</span>
            </>
          ) : (
            <>
              <Icon name="save" size={16} />
              <span>Final Submit & Upload Inspection (All Mandatory)</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default MaterialInspection;
