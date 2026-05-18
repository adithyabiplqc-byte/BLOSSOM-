import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import { ZONES } from '../constants';
import Icon from './Icon';

import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface WorkorderDashboardProps {
  workorders: any[];
  setWorkorders: (wo: any[]) => void;
  cards: any[];
  user: any;
  settings: any;
  refreshData: () => Promise<void>;
  triggerSuccess: (message: string) => void;
  globalZone?: string;
}

const PVC_RATIO = 85.6 / 53.98;

const CardTemplate = ({ card, settings, id }: { card: any, settings: any, id: string }) => (
  <div 
    id={id}
    className="bg-white text-slate-900 w-[1011px] h-[638px] flex flex-col p-12 relative overflow-hidden border border-slate-100"
    style={{ 
      fontFamily: '"Montserrat", sans-serif',
      boxSizing: 'border-box'
    }}
  >
    {/* Background Design Elements */}
    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600 rounded-full -mr-80 -mt-80 opacity-[0.07] z-0" />
    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-900 rounded-full -ml-40 -mb-40 opacity-[0.03] z-0" />
    <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] border-[40px] border-indigo-500/5 rounded-full -translate-x-1/2 -translate-y-1/2 z-0" />
    
    <div className="relative z-10 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
              <Icon name="shield-check" size={36} />
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tighter text-indigo-700 uppercase leading-none">{settings.companyName || 'TRACEABILITY SYSTEM'}</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.4em] mt-2 italic">{settings.slogan || 'PRODUCTION CONTROL UNIT'}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-slate-900 text-white px-6 py-2 text-sm font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-slate-900/10">
            SECURED ID CARD
          </div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">ISO CR80 STANDARD</p>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex items-center gap-20 flex-1">
        <div className="bg-white p-6 border-[3px] border-slate-100 rounded-[2.5rem] shadow-2xl relative">
          <div className="absolute -inset-1 border border-indigo-100 rounded-[2.6rem] opacity-50" />
          <QRCodeCanvas 
            value={card.cardNumber} 
            size={300} 
            level="H" 
            includeMargin={true}
            style={{ borderRadius: '1rem' }}
          />
        </div>
        
        <div className="space-y-10 flex-1">
          <div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-2">UNIQUE IDENTIFIER</p>
            <p className="text-8xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">{card.cardNumber}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-2">
              <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">ASSIGNED WORKORDER</p>
              <p className="text-2xl font-black text-slate-800 uppercase">{card.workorderNumber || 'UNASSIGNED'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">SYSTEM AUTHORITY</p>
              <p className="text-2xl font-black text-slate-800 uppercase">TRACE HUB OPS</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-10 border-t-2 border-slate-50 flex justify-between items-end">
        <div className="space-y-2 max-w-lg">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed italic">
            {settings.footerText || 'Scan this card at each production station to maintain real-time material and quality traceability.'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-1">
             {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 bg-indigo-600/20 rounded-full" />)}
          </div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic tracking-[0.2em]">Ver: 2026.QR.SEC</p>
        </div>
      </div>
    </div>
  </div>
);

const WorkorderDashboard: React.FC<WorkorderDashboardProps> = ({ workorders, setWorkorders, cards, user, settings, refreshData, triggerSuccess, globalZone }) => {
  const currentZones = settings?.ZONE || ZONES || [];
  const initialZone = (globalZone && globalZone !== 'ALL') ? globalZone : (user?.location !== 'SYSTEM' ? user?.location : (currentZones && currentZones.length > 0 ? currentZones[0] : ZONES[0]));

  const [form, setForm] = useState({ 
    zone: initialZone, 
    workorderNumber: '', 
    item: '', 
    style: '', 
    sizeRange: '', 
    quantity: '', 
    colour: '',
    cardNumber: '' // Link to card
  });
  const [search, setSearch] = useState('');
  const [selectedWO, setSelectedWO] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [cardDesign, setCardDesign] = useState({
    companyName: 'TRACEABILITY SYSTEM',
    slogan: 'PRODUCTION CONTROL UNIT',
    footerText: 'Scan at each station for real-time tracking.'
  });

  // Load design settings
  React.useEffect(() => {
    api.run('api_getUserSettings', 'GLOBAL_SYSTEM').then((s: any) => {
      if (s && s.CARD_CONFIG) {
        try {
          setCardDesign(JSON.parse(s.CARD_CONFIG[0]));
        } catch(e) {}
      }
    });
  }, []);

  const [exportCard, setExportCard] = useState<any>(null);

  const handleDownloadPDF = async (card: any) => {
    setExportCard(card);
    const element = document.getElementById(`pvc-export-template-wo`);
    if (!element) return;
    
    setIsExporting(true);
    try {
      // Small delay to ensure state update and QR render
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 53.98]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98);
      pdf.save(`TRACE_CARD_${card.cardNumber}.pdf`);
      triggerSuccess('PROFESSIONAL CARD DOWNLOADED');
    } catch (e) {
      alert('Error generating PDF');
    } finally {
      setIsExporting(false);
      setExportCard(null);
    }
  };

  const availableCards = React.useMemo(() => {
    return cards.filter(c => c.currentStatus === 'IDLE' || c.workorderNumber === form.workorderNumber);
  }, [cards, form.workorderNumber]);

  const generateCard = async () => {
    if (isSubmitting) return;
    const num = 'C' + Math.floor(Math.random() * 90000 + 10000);
    setForm(prev => ({ ...prev, cardNumber: num }));
    triggerSuccess(`NEW CARD ${num} GENERATED`);
  };

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

      // Handle card status update if linked
      if (form.cardNumber) {
        await api.run('api_saveCard', { 
          cardNumber: form.cardNumber, 
          workorderNumber: woNum,
          currentStatus: 'IDLE', // It's idle until production starts, but assigned
          updatedAt: new Date().toISOString()
        });
      }

      setForm({ 
        zone: (globalZone && globalZone !== 'ALL') ? globalZone : (user?.location !== 'SYSTEM' ? user?.location : ZONES[0]), 
        workorderNumber: '', 
        item: '', 
        style: '', 
        sizeRange: '', 
        quantity: '', 
        colour: '',
        cardNumber: ''
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
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
        <div className="glass-card p-4 border-l-4 border-blue-500 bg-white">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total WOs</p>
          <p className="text-3xl font-black text-slate-800">{workorders.length}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-indigo-500 bg-white">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zone Filtered</p>
          <p className="text-3xl font-black text-slate-800">{filteredWorkorders.length}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-emerald-500 bg-white">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Qty</p>
          <p className="text-3xl font-black text-slate-800">
            {filteredWorkorders.reduce((sum, w) => sum + (Number(w.quantity) || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="glass-card p-4 border-l-4 border-amber-500 bg-white">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Styles</p>
          <p className="text-3xl font-black text-slate-800">
            {new Set(filteredWorkorders.map(w => w.style)).size}
          </p>
        </div>
      </div>

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
              <div className="pt-4 border-t border-slate-100">
                <label className="text-indigo-600 font-black">Link PVC Card</label>
                <div className="flex gap-2">
                  <select 
                    className="flex-1"
                    value={form.cardNumber} 
                    onChange={e => setForm({...form, cardNumber: e.target.value})}
                  >
                    <option value="">No Card Linked</option>
                    {availableCards.map(c => (
                      <option key={c.cardNumber} value={c.cardNumber}>{c.cardNumber} ({c.currentStatus})</option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    onClick={generateCard}
                    className="bg-indigo-50 text-indigo-600 p-2 rounded-xl hover:bg-indigo-100 transition-colors"
                    title="Generate New Card"
                  >
                    <Icon name="plus" size={20} />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest italic">Assigning a card enables digital traceability.</p>
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

              {/* Workflow View */}
              <div className="mt-12 pt-8 border-t border-slate-100">
                 <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-2">
                   <Icon name="git-pull-request" size={16} className="text-indigo-600" />
                   Traceability Workflow
                 </h3>
                 
                 {cards.filter(c => c.workorderNumber === selectedWO.workorderNumber).length > 0 ? (
                   <div className="space-y-8">
                      {cards.filter(c => c.workorderNumber === selectedWO.workorderNumber).map(card => {
                        const STAGES = ['MATERIAL', 'CUTTING', 'INLINE', 'ENDLINE', 'AQL', 'FINAL'];
                        const currentIdx = STAGES.indexOf(card.currentStatus);
                        
                        return (
                          <div key={card.cardNumber} className="glass-card bg-slate-50 p-6 border-2 border-indigo-100/50">
                              <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                   <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black tracking-tighter">CARD: {card.cardNumber}</span>
                                   <button 
                                     onClick={() => handleDownloadPDF(card)}
                                     disabled={isExporting}
                                     className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100"
                                     title="Download Card Design"
                                   >
                                     {isExporting ? <Icon name="refresh-cw" size={14} className="animate-spin" /> : <Icon name="download" size={14} />}
                                   </button>
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Updated {new Date(card.updatedAt).toLocaleString()}</span>
                                
                                {/* Hidden Export Template */}
                                <div className="absolute -left-[9999px] top-0 pointer-events-none">
                                   <CardTemplate card={card} settings={cardDesign} id="pvc-export-template-wo" />
                                </div>
                             </div>

                             <div className="relative">
                                {/* Track Line */}
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2" />
                                <div 
                                  className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 transition-all duration-1000" 
                                  style={{ width: `${((currentIdx + 1) / STAGES.length) * 100}%` }} 
                                />

                                <div className="relative flex justify-between">
                                  {STAGES.map((stage, sIdx) => {
                                    const isDone = sIdx <= currentIdx;
                                    const isCurrent = sIdx === currentIdx;
                                    
                                    return (
                                      <div key={stage} className="flex flex-col items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${isDone ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-white border-2 border-slate-200 text-slate-300'}`}>
                                          {isDone ? <Icon name="check" size={14} /> : <span className="text-[10px] font-black">{sIdx + 1}</span>}
                                        </div>
                                        <span className={`text-[8px] font-black uppercase tracking-tighter ${isCurrent ? 'text-indigo-600 animate-pulse' : (isDone ? 'text-emerald-600' : 'text-slate-400')}`}>
                                          {stage}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                             </div>
                          </div>
                        );
                      })}

                      {/* Hidden Export Template (Moved outside loop) */}
                      <div className="absolute -left-[9999px] top-0 pointer-events-none">
                        {(exportCard || (cards.length > 0 ? cards[0] : null)) && (
                          <CardTemplate 
                            card={exportCard || cards[0]} 
                            settings={cardDesign} 
                            id="pvc-export-template-wo" 
                          />
                        )}
                      </div>
                   </div>
                 ) : (
                   <div className="p-12 border-2 border-dashed border-slate-100 rounded-3xl text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl mx-auto flex items-center justify-center text-slate-200">
                        <Icon name="link-2" size={32} />
                      </div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No PVC Card attached to this workorder yet.</p>
                      {user?.role === 'ADMIN' && <p className="text-[9px] text-indigo-500 font-bold uppercase underline cursor-pointer">Assign a Card in Admin Dashboard</p>}
                   </div>
                 )}
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
