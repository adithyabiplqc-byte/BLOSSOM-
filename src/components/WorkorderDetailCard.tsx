import React from 'react';

interface WorkorderDetailCardProps {
  wo: any;
  settings?: any;
}

const normalizeStatus = (statusStr: string): string => {
  return String(statusStr || "")
    .toUpperCase()
    .trim()
    .replace(/&/g, "AND")
    .replace(/[^A-Z0-9]/g, "");
};

const WorkorderDetailCard: React.FC<WorkorderDetailCardProps> = ({ wo, settings }) => {
  if (!wo) return null;

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

  const styleLabel = getStyleLabel();
  const colorLabel = getColorLabel();

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 md:grid-cols-5 gap-4 animate-fade-in animate-zoom-in">
      <div><label className="text-[10px] uppercase font-bold text-slate-400">{styleLabel}</label><p className="font-bold text-sm text-slate-800">{wo.style || wo.styleName}</p></div>
      <div><label className="text-[10px] uppercase font-bold text-slate-400">Size Range</label><p className="font-bold text-sm text-slate-800">{wo.size}</p></div>
      <div><label className="text-[10px] uppercase font-bold text-slate-400">Cup</label><p className="font-bold text-sm text-slate-800">{wo.cup || '-'}</p></div>
      <div><label className="text-[10px] uppercase font-bold text-slate-400">{colorLabel}</label><p className="font-bold text-sm text-slate-800">{wo.colour || wo.color}</p></div>
      <div><label className="text-[10px] uppercase font-bold text-slate-400">Qty</label><p className="font-bold text-sm text-slate-800">{wo.quantity}</p></div>
      
      {/* Dynamic Workflow Tracker Inline */}
      <div className="col-span-2 md:col-span-5 border-t border-slate-150 pt-3 mt-1">
        <label className="text-[9px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Live Production Progress</label>
        <div className="flex flex-wrap md:flex-row items-center justify-between gap-y-3 gap-x-1.5 md:gap-4 font-sans text-left">
          {['CUTTING', 'INLINE', 'ENDLINE', 'AQL', 'FINAL', 'COMPLETED'].map((step, idx) => {
            const statusVal = normalizeStatus(wo.status || 'CUTTING');
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
              <React.Fragment key={step}>
                <div className="flex items-center gap-2 shrink-0">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border transition-all ${
                    isPast ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' :
                    isActive ? 'bg-indigo-600 border-indigo-600 text-white ring-2 ring-indigo-100 scale-105 animate-pulse' :
                    'bg-white border-slate-200 text-slate-405'
                  }`}>
                    {isPast ? '✓' : idx + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[9px] font-extrabold uppercase tracking-tight leading-none ${
                      isActive ? 'text-indigo-650' : isPast ? 'text-emerald-650' : 'text-slate-405'
                    }`}>
                      {step}
                    </span>
                    <span className="text-[7.5px] font-semibold text-slate-400 uppercase tracking-tighter leading-none mt-0.5">
                      {isActive ? 'Active' : isPast ? 'Done' : 'Wait'}
                    </span>
                  </div>
                </div>
                {idx < 5 && (
                  <div className={`hidden md:block flex-1 h-0.5 min-w-[12px] rounded transition-colors ${
                    isPast || (statusVal === 'INLINEANDENDLINE' && idx < 2) ? 'bg-emerald-500' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkorderDetailCard;
