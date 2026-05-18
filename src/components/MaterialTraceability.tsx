import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { motion, AnimatePresence } from 'motion/react';

interface MaterialTraceabilityProps {
  user: any;
  onBack: () => void;
  api: any;
  workorders: any[];
}

const MaterialTraceability: React.FC<MaterialTraceabilityProps> = ({ user, onBack, api, workorders }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [activeCard, setActiveCard] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [formData, setFormData] = useState({
    itemName: '',
    billNumber: '',
    remarks: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const lookupCard = async (num: string) => {
    if (!num) return;
    try {
      const card = await api.run('api_getCardByNumber', num);
      if (card) {
        if (!card.workorderNumber) {
          setMessage({ type: 'error', text: 'This card is not assigned to any Workorder. Please contact Admin.' });
          setActiveCard(null);
        } else {
          setActiveCard(card);
          setIsScanning(false);
          setMessage(null);
          // Pre-fill item name if workorder found
          const wo = workorders.find(w => w.workorderNumber === card.workorderNumber);
          if (wo) {
            setFormData(prev => ({ ...prev, itemName: wo.item }));
          }
        }
      } else {
        setMessage({ type: 'error', text: 'Card not found. Please check number or contact Admin.' });
        setActiveCard(null);
      }
    } catch (e) {
      console.error("Lookup error:", e);
      setMessage({ type: 'error', text: 'Error searching for card.' });
    }
  };

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    lookupCard(cardNumber);
  };

  const handlePass = async () => {
    if (!formData.itemName || !formData.billNumber) {
      alert("Please enter Item Name and Bill Number.");
      return;
    }

    setSubmitting(true);
    try {
      const report = {
        ...formData,
        cardNumber: activeCard.cardNumber,
        workorderNumber: activeCard.workorderNumber,
        status: 'PASS',
        inspector: user.username,
        timestamp: new Date().toISOString()
      };

      const res = await api.run('api_saveMATERIALTRACEABILITY', report);
      if (res.success) {
        setMessage({ type: 'success', text: 'Material Traceability Recorded & Card Advanced!' });
        setTimeout(() => {
          onBack();
        }, 2000);
      } else {
        throw new Error(res.error || 'Failed to save');
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error saving record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold uppercase text-[10px] tracking-widest transition-colors">
          <Icon name="arrow-left" size={16} />
          Back to Menu
        </button>
        <div className="text-right">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Material <span className="text-indigo-600">Traceability</span></h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Stage 1: Material Verification</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isScanning ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-12 text-center space-y-8"
          >
            <div className="w-24 h-24 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-2xl shadow-indigo-200 animate-pulse">
              <Icon name="qr-code" size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Scan PVC Card</h3>
              <p className="text-xs text-slate-400 font-medium font-mono uppercase tracking-widest leading-relaxed">
                Position the card QR code in front of the scanner <br/> or type the card number below.
              </p>
            </div>
            
            <form onSubmit={handleScan} className="max-w-xs mx-auto space-y-4">
              <input 
                type="text" 
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.toUpperCase())}
                autoFocus
                placeholder="ENTER CARD NUMBER"
                className="w-full text-center font-mono text-xl tracking-widest bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 rounded-2xl py-4 transition-all"
              />
              <button 
                type="submit"
                className="w-full btn-primary py-4 text-xs font-black uppercase tracking-[0.2em]"
              >
                Continue to Verification
              </button>
            </form>

            {message?.type === 'error' && (
              <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-50 py-2 inline-block px-4 rounded-full border border-rose-100">
                {message.text}
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Card Info Sidebar */}
            <div className="md:col-span-1 space-y-6">
              <div className="glass-card overflow-hidden bg-slate-900 border-slate-800 shadow-2xl">
                 <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white min-h-[160px] flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <div className="relative">
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Active Card</p>
                      <h4 className="text-3xl font-black tracking-tighter">{activeCard?.cardNumber}</h4>
                    </div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-[8px] font-black text-white/60 uppercase tracking-widest">Assigned Workorder</p>
                        <p className="text-lg font-black">{activeCard?.workorderNumber}</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Icon name="cpu" size={24} />
                      </div>
                    </div>
                 </div>
                 <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                       <span className="text-slate-500">Current Status</span>
                       <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">IDLE</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                       <div className="w-1/6 h-full bg-emerald-500" />
                    </div>
                 </div>
              </div>

              <button 
                onClick={() => { setIsScanning(true); setActiveCard(null); setCardNumber(''); }}
                className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <Icon name="refresh-ccw" size={14} />
                Switch Card
              </button>
            </div>

            {/* Verification Form */}
            <div className="md:col-span-2 space-y-6">
              <div className="glass-card p-8 bg-white border-slate-100 shadow-xl space-y-8">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Material Name / Description</label>
                    <input 
                      type="text"
                      value={formData.itemName}
                      onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                      className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-600 rounded-xl py-3 px-4 transition-all"
                      placeholder="e.g. 100% COTTON FABRIC"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Bill / Batch Number</label>
                    <input 
                      type="text"
                      value={formData.billNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, billNumber: e.target.value }))}
                      className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-600 rounded-xl py-3 px-4 transition-all"
                      placeholder="e.g. BL-9921/2024"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Special Remarks</label>
                    <textarea 
                      rows={3}
                      value={formData.remarks}
                      onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                      className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-600 rounded-xl py-3 px-4 transition-all"
                      placeholder="Observation during inward..."
                    />
                  </div>
                </div>

                {message?.type === 'success' && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-500 text-white p-4 rounded-xl flex items-center gap-3">
                    <Icon name="check-circle" size={20} />
                    <p className="text-xs font-black uppercase tracking-widest">{message.text}</p>
                  </motion.div>
                )}

                <button 
                  onClick={handlePass}
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-slate-900 text-white py-6 rounded-2xl flex items-center justify-center gap-4 transition-all shadow-2xl shadow-indigo-100"
                >
                  {submitting ? (
                    <Icon name="refresh-cw" size={24} className="animate-spin" />
                  ) : (
                    <>
                      <span className="text-sm font-black uppercase tracking-[0.3em]">Verify & Pass Material</span>
                      <Icon name="arrow-right" size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MaterialTraceability;
