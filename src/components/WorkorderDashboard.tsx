import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import { ZONES, COLORS, SIZES, CUPSIZES } from '../constants';
import Icon from './Icon';
import SearchableSelect from './SearchableSelect';

interface WorkorderDashboardProps {
  workorders: any[];
  setWorkorders: (wo: any[]) => void;
  user: any;
  settings: any;
  refreshData: () => Promise<void>;
  triggerSuccess: (message: string) => void;
  globalZone?: string;
}

const normalizeStatus = (statusStr: string): string => {
  return String(statusStr || "")
    .toUpperCase()
    .trim()
    .replace(/&/g, "AND")
    .replace(/[^A-Z0-9]/g, "");
};

const WorkorderDashboard: React.FC<WorkorderDashboardProps> = ({ workorders, setWorkorders, user, settings, refreshData, triggerSuccess, globalZone }) => {
  const getParsedSettingList = (keys: string[], defaultVal: string[] = []) => {
    const hasSpreadsheet = localStorage.getItem('VITE_SPREADSHEET_ID') || localStorage.getItem('VITE_GAS_URL');
    const fallbackVal = hasSpreadsheet ? [] : defaultVal;
    if (!settings) return fallbackVal;
    for (const key of keys) {
      const raw = settings[key] || settings[key.toUpperCase()] || settings[key.toLowerCase()];
      if (raw !== undefined && raw !== null) {
        if (typeof raw === 'string') {
          return raw.split('\n').map((s: string) => s.trim()).filter(Boolean);
        }
        if (Array.isArray(raw)) {
          return raw.map((s: any) => String(s).trim()).filter(Boolean);
        }
      }
    }
    return fallbackVal;
  };

  const currentZones = React.useMemo(() => {
    const list = getParsedSettingList(['ZONE', 'ZONES'], ZONES);
    return list;
  }, [settings]);
  const currentSizes = React.useMemo(() => getParsedSettingList(['SIZE', 'SIZES', 'SIZE_RANGE', 'SIZE RANGE'], SIZES), [settings]);
  const currentCups = React.useMemo(() => getParsedSettingList(['CUPSIZE', 'CUPSIZES', 'CUP', 'CUPS'], CUPSIZES), [settings]);
  const currentColors = React.useMemo(() => getParsedSettingList(['COLOR', 'COLORS', 'COLOUR', 'COLOURS'], COLORS), [settings]);
  const currentStyles = React.useMemo(() => getParsedSettingList(['STYLE_NAME', 'STYLE NAME', 'STYLE NAMES', 'STYLE_NAMES', 'STYLE', 'STYLES'], ['STYLE A', 'STYLE B', 'STYLE C']), [settings]);
  const initialZone = (globalZone && globalZone !== 'ALL') ? globalZone : (user?.zone || (user?.location !== 'SYSTEM' ? user?.location : (currentZones && currentZones.length > 0 ? currentZones[0] : '')));

  const getStyleLabel = () => {
    if (settings) {
      const keys = Object.keys(settings);
      const match = keys.find(k => {
        const u = k.trim().toUpperCase();
        return u === 'STYLE_NAME' || u === 'STYLE NAME' || u === 'STYLE NAMES' || u === 'STYLE' || u === 'STYLES';
      });
      if (match) return match.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
    return 'Style Name';
  };

  const getColorLabel = () => {
    if (settings) {
      const keys = Object.keys(settings);
      const match = keys.find(k => {
        const u = k.trim().toUpperCase();
        return u === 'COLOUR' || u === 'COLOURS' || u === 'COLOR' || u === 'COLORS';
      });
      if (match) return match.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    }
    return 'Colour';
  };

  const [form, setForm] = useState({ 
    zone: initialZone, 
    workorderNumber: '', 
    style: '', 
    sizeFrom: '',
    sizeTo: '',
    cup: '', 
    quantity: '', 
    colour: '',
    status: 'CUTTING'
  });

  const [search, setSearch] = useState('');
  const [selectedWO, setSelectedWO] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayStyles = React.useMemo(() => {
    const list = [...currentStyles];
    if (form.style && !list.includes(form.style)) {
      list.push(form.style);
    }
    return list;
  }, [currentStyles, form.style]);

  const displayColors = React.useMemo(() => {
    const list = [...currentColors];
    if (form.colour && !list.includes(form.colour)) {
      list.push(form.colour);
    }
    return list;
  }, [currentColors, form.colour]);

  const displayCups = React.useMemo(() => {
    const list = [...currentCups];
    if (form.cup && !list.includes(form.cup)) {
      list.push(form.cup);
    }
    return list;
  }, [currentCups, form.cup]);

  const displaySizesFrom = React.useMemo(() => {
    const list = [...currentSizes];
    if (form.sizeFrom && !list.includes(form.sizeFrom)) {
      list.push(form.sizeFrom);
    }
    return list;
  }, [currentSizes, form.sizeFrom]);

  const displaySizesTo = React.useMemo(() => {
    const list = [...currentSizes];
    if (form.sizeTo && !list.includes(form.sizeTo)) {
      list.push(form.sizeTo);
    }
    return list;
  }, [currentSizes, form.sizeTo]);

  React.useEffect(() => {
    if (isEditing) return;
    setForm(prev => ({
      ...prev,
      style: prev.style || currentStyles[0] || '',
      colour: prev.colour || currentColors[0] || '',
      sizeFrom: prev.sizeFrom || currentSizes[0] || '',
      sizeTo: prev.sizeTo || currentSizes[0] || '',
      cup: prev.cup || currentCups[0] || ''
    }));
  }, [currentStyles, currentColors, currentSizes, currentCups, isEditing]);

  React.useEffect(() => {
    if (isEditing) return;
    if (globalZone && globalZone !== 'ALL') {
      setForm(prev => ({ ...prev, zone: globalZone }));
    } else if (currentZones && currentZones.length > 0 && (!form.zone || !currentZones.includes(form.zone))) {
      setForm(prev => ({ ...prev, zone: currentZones[0] }));
    }
  }, [globalZone, currentZones, form.zone, isEditing]);

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

      const mergedSize = form.sizeFrom && form.sizeTo 
        ? `${form.sizeFrom.trim()} - ${form.sizeTo.trim()}`
        : (form.sizeFrom || form.sizeTo || '');

      const woData = { 
        zone: form.zone,
        workorderNumber: woNum,
        style: form.style,
        size: mergedSize,
        cup: form.cup,
        quantity: form.quantity,
        colour: form.colour,
        id: isEditing ? selectedWO.id : Date.now(), 
        status: form.status,
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
        zone: (globalZone && globalZone !== 'ALL') ? globalZone : (user?.zone || (user?.location !== 'SYSTEM' ? user?.location : (currentZones[0] || ''))), 
        workorderNumber: '', 
        style: '', 
        sizeFrom: '', 
        sizeTo: '', 
        cup: '',
        quantity: '', 
        colour: '',
        status: 'CUTTING'
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
    if (user?.role !== 'ADMIN') {
      alert('Unauthorized: Delete option is restricted to admin user only.');
      return;
    }
    if (!window.confirm('Delete this workorder?')) return;
    setWorkorders(workorders.filter(w => w.id !== wo.id));
    api.run('api_deleteWorkorder', wo.id, wo.zone || wo.location).then(() => refreshData());
    setSelectedWO(null);
  };

  const startEdit = (wo: any) => {
    let sizeFrom = '';
    let sizeTo = '';
    if (wo.size) {
      const parts = String(wo.size).split(' - ');
      if (parts.length > 1) {
        sizeFrom = parts[0];
        sizeTo = parts[1];
      } else {
        sizeFrom = wo.size;
      }
    }
    setForm({
      zone: wo.zone || wo.location || '',
      workorderNumber: wo.workorderNumber || '',
      style: wo.style || '',
      sizeFrom,
      sizeTo,
      cup: wo.cup || '',
      quantity: wo.quantity || '',
      colour: wo.colour || '',
      status: wo.status || 'CUTTING'
    });
    setSelectedWO(wo);
    setIsEditing(true);
  };

  const filteredWorkorders = React.useMemo(() => {
    return workorders.filter(wo => {
      const wZone = String(wo.zone || wo.location || "").toUpperCase().trim();
      const gZone = String(globalZone || "ALL").toUpperCase().trim();
      const zoneMatch = gZone === 'ALL' || wZone === gZone;
      const searchMatch = String(wo.workorderNumber).toLowerCase().includes(search.toLowerCase()) ||
                          String(wo.style).toLowerCase().includes(search.toLowerCase());
      return zoneMatch && searchMatch;
    });
  }, [workorders, globalZone, search]);

  const canManage = user?.role === 'ADMIN' || user?.role === 'WORKORDER';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {canManage && (
          <div className="lg:col-span-1">
            <div className="glass-card p-8 sticky top-24">
              <h2 className="text-2xl font-bold mb-6 text-indigo-800 border-b pb-4">{isEditing ? 'Edit Workorder' : 'New Entry'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label>Zone</label>
                  <SearchableSelect className="w-full" value={form.zone} onChange={e => setForm({...form, zone: e.target.value})}>
                    {currentZones.map((z: string) => <option key={z} value={z}>{z}</option>)}
                  </SearchableSelect>
                </div>
                <div>
                  <label>Workorder Number</label>
                  <input type="text" placeholder="Enter WO Number" className="w-full" value={form.workorderNumber} onChange={e => setForm({...form, workorderNumber: e.target.value})} required />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label>{getStyleLabel()}</label>
                    <SearchableSelect 
                      className="w-full" 
                      value={form.style} 
                      onChange={e => setForm({...form, style: e.target.value})} 
                      required 
                    >
                      <option value="">Select Style</option>
                      {displayStyles.map((s: string) => <option key={s} value={s}>{s}</option>)}
                    </SearchableSelect>
                  </div>
                  <div>
                    <label>{getColorLabel()}</label>
                    <SearchableSelect 
                      className="w-full" 
                      value={form.colour} 
                      onChange={e => setForm({...form, colour: e.target.value})} 
                      required 
                    >
                      <option value="">Select Colour</option>
                      {displayColors.map((c: string) => <option key={c} value={c}>{c}</option>)}
                    </SearchableSelect>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label>Size From</label>
                    <SearchableSelect 
                      className="w-full" 
                      value={form.sizeFrom} 
                      onChange={e => setForm({...form, sizeFrom: e.target.value})} 
                      required 
                    >
                      <option value="">Select Size From</option>
                      {displaySizesFrom.map((s: string) => <option key={s} value={s}>{s}</option>)}
                    </SearchableSelect>
                  </div>
                  <div>
                    <label>Size To</label>
                    <SearchableSelect 
                      className="w-full" 
                      value={form.sizeTo} 
                      onChange={e => setForm({...form, sizeTo: e.target.value})} 
                      required 
                    >
                      <option value="">Select Size To</option>
                      {displaySizesTo.map((s: string) => <option key={s} value={s}>{s}</option>)}
                    </SearchableSelect>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label>Cup (Optional)</label>
                    <SearchableSelect 
                      className="w-full" 
                      value={form.cup} 
                      onChange={e => setForm({...form, cup: e.target.value})} 
                    >
                      <option value="">Select Cup (Optional)</option>
                      {displayCups.map((s: string) => <option key={s} value={s}>{s}</option>)}
                    </SearchableSelect>
                  </div>
                  <div>
                    <label>Quantity</label>
                    <input type="number" placeholder="Enter Quantity" className="w-full" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required />
                  </div>
                </div>
                <div>
                  <label>Workflow Status</label>
                  <SearchableSelect className="w-full font-bold text-slate-800" value={form.status} onChange={e => setForm({...form, status: e.target.value})} required>
                    <option value="CUTTING">CUTTING</option>
                    <option value="INLINE">INLINE</option>
                    <option value="ENDLINE">ENDLINE</option>
                    <option value="INLINE_AND_ENDLINE">INLINE & ENDLINE</option>
                    <option value="PASS_AND_HOLD">PASS & HOLD</option>
                    <option value="AQL">AQL</option>
                    <option value="FINAL">FINAL AUDIT</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </SearchableSelect>
                </div>
                <div className="flex gap-2">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`btn-primary flex-1 py-4 text-xs font-black italic tracking-widest uppercase mt-4 transition-all shadow-xl shadow-indigo-100 hover:scale-[1.02]`}
                  >
                    {isSubmitting ? 'SAVING...' : (isEditing ? 'UPDATE WO' : 'SUBMIT WO')}
                  </button>
                  {isEditing && <button type="button" onClick={() => { setIsEditing(false); setSelectedWO(null); setForm({ zone: currentZones[0] || '', workorderNumber: '', style: '', sizeFrom: '', sizeTo: '', cup: '', quantity: '', colour: '', status: 'CUTTING' }); }} className="btn-secondary mt-4">CANCEL</button>}
                </div>
              </form>
            </div>
          </div>
        )}

        <div className={`${canManage ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-8`}>
          {selectedWO && !isEditing && (
            <div className="glass-card p-8 border-l-[12px] border-indigo-600 animate-in slide-in-from-right-4">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 uppercase">Workorder Details</h2>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Detailed View</p>
                </div>
                <div className="flex gap-2">
                  {canManage && (
                    <>
                      <button onClick={() => startEdit(selectedWO)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Icon name="edit" size={20} /></button>
                      {user?.role === 'ADMIN' && (
                        <button onClick={() => handleDelete(selectedWO)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><Icon name="trash-2" size={20} /></button>
                      )}
                    </>
                  )}
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
                  <span className="text-indigo-400 block uppercase text-[10px] font-black tracking-widest">{getStyleLabel()}</span>
                  <span className="font-bold text-slate-800 text-2xl">{selectedWO.style}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-indigo-400 block uppercase text-[10px] font-black tracking-widest">{getColorLabel()}</span>
                  <span className="font-bold text-slate-800 text-2xl">{selectedWO.colour}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-indigo-400 block uppercase text-[10px] font-black tracking-widest">Quantity</span>
                  <span className="font-bold text-slate-800 text-2xl">{selectedWO.quantity}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-indigo-400 block uppercase text-[10px] font-black tracking-widest">Size Range</span>
                  <span className="font-bold text-slate-800 text-2xl">{selectedWO.size} {selectedWO.cup}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-indigo-400 block uppercase text-[10px] font-black tracking-widest">Workflow Status</span>
                  <span className={`block font-black text-xl uppercase tracking-tighter ${
                    selectedWO.status === 'COMPLETED' ? 'text-emerald-500' :
                    selectedWO.status === 'CUTTING' ? 'text-amber-500' :
                    'text-indigo-500'
                  }`}>
                    {selectedWO.status || 'CUTTING'}
                  </span>
                </div>

                {/* Process Status Pipeline Stepper */}
                <div className="col-span-2 md:col-span-3 border-t border-slate-100 pt-6 mt-4">
                  <span className="text-indigo-500 block uppercase text-[10px] font-black tracking-widest mb-4">Live Production Flow Tracker</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 font-sans text-left md:text-center">
                    {['CUTTING', 'INLINE', 'ENDLINE', 'AQL', 'FINAL', 'COMPLETED'].map((step, idx) => {
                      const statusVal = normalizeStatus(selectedWO.status || 'CUTTING');
                      let isPast = false;
                      let isActive = false;
                      
                      if (statusVal === 'INLINEANDENDLINE') {
                        if (step === 'CUTTING') {
                          isPast = true;
                        } else if (step === 'INLINE' || step === 'ENDLINE') {
                          isActive = true;
                        }
                      } else if (statusVal === 'PASSANDHOLD') {
                        if (step === 'CUTTING' || step === 'INLINE' || step === 'ENDLINE') {
                          isActive = true;
                        }
                      } else {
                        const activeIdx = ['CUTTING', 'INLINE', 'ENDLINE', 'AQL', 'FINAL', 'COMPLETED'].indexOf(statusVal);
                        isPast = idx < activeIdx;
                        isActive = idx === activeIdx;
                      }
                      
                      return (
                        <div key={step} className="flex flex-row md:flex-col items-center md:items-center gap-3 md:gap-2 relative">
                           {/* Connecting Line */}
                           {idx < 5 && (
                             <div className={`hidden md:block absolute top-[15px] left-[60%] right-[-40%] h-1 rounded transition-colors ${
                               isPast || (statusVal === 'INLINEANDENDLINE' && idx < 2) ? 'bg-emerald-500' : 'bg-slate-200'
                             }`} />
                           )}
                          
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all z-10 shrink-0 ${
                            isPast ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-100' :
                            isActive ? 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-50 scale-110' :
                            'bg-white border-slate-200 text-slate-400'
                          }`}>
                            {isPast ? '✓' : idx + 1}
                          </div>
                          <div className="flex flex-col md:items-center">
                            <span className={`text-[10px] font-black uppercase tracking-tight leading-none ${
                              isActive ? 'text-indigo-600 font-extrabold' : isPast ? 'text-emerald-600' : 'text-slate-400'
                            }`}>
                              {step}
                            </span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                              {isActive ? 'Current' : isPast ? 'Done' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
                  placeholder="Search WO, Style..." 
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
                    <th className="p-4 text-xs font-bold uppercase text-slate-500">{getStyleLabel()}</th>
                    <th className="p-4 text-xs font-bold uppercase text-slate-500">Status</th>
                    <th className="p-4 text-xs font-bold uppercase text-slate-500">Size</th>
                    <th className="p-4 text-xs font-bold uppercase text-slate-500">{getColorLabel()}</th>
                    <th className="p-4 text-xs font-bold uppercase text-slate-500 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkorders.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-400 italic">No workorders found.</td></tr>
                  ) : (
                    filteredWorkorders.map((wo, i) => (
                      <tr 
                        key={i} 
                        onClick={() => setSelectedWO(wo)}
                        className={`border-b border-slate-100 hover:bg-indigo-50 cursor-pointer transition-colors ${selectedWO?.id === wo.id ? 'bg-indigo-50' : ''}`}
                      >
                        <td className="p-4 font-mono text-indigo-600 font-bold">{wo.workorderNumber}</td>
                        <td className="p-4 font-semibold">{wo.style}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                            (() => {
                              const nStatus = normalizeStatus(wo.status || 'CUTTING');
                              if (nStatus === 'COMPLETED') return 'bg-emerald-100 text-emerald-700';
                              if (nStatus === 'CUTTING') return 'bg-amber-100 text-amber-700';
                              if (nStatus === 'INLINE') return 'bg-indigo-100 text-indigo-700';
                              if (nStatus === 'PASSANDHOLD' || nStatus.includes('HOLD')) return 'bg-pink-100 text-pink-700 border border-pink-200';
                              return 'bg-slate-100 text-slate-600';
                            })()
                          }`}>
                            {wo.status || 'CUTTING'}
                          </span>
                        </td>
                        <td className="p-4 text-xs">{wo.size} {wo.cup}</td>
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
