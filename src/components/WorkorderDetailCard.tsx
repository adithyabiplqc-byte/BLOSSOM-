import React from 'react';

interface WorkorderDetailCardProps {
  wo: any;
}

const WorkorderDetailCard: React.FC<WorkorderDetailCardProps> = ({ wo }) => {
  if (!wo) return null;
  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 md:grid-cols-5 gap-4 animate-fade-in animate-zoom-in">
      <div><label>Style</label><p className="font-bold text-sm text-slate-800">{wo.style}</p></div>
      <div><label>Size</label><p className="font-bold text-sm text-slate-800">{wo.size}</p></div>
      <div><label>Cup</label><p className="font-bold text-sm text-slate-800">{wo.cup}</p></div>
      <div><label>Colour</label><p className="font-bold text-sm text-slate-800">{wo.colour}</p></div>
      <div><label>Qty</label><p className="font-bold text-sm text-slate-800">{wo.quantity}</p></div>
      <div className="md:col-span-1">
        <label>Flow Status</label>
        <p className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full inline-block ${
          wo.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
          wo.status === 'CUTTING' ? 'bg-amber-100 text-amber-700' :
          wo.status === 'INLINE' ? 'bg-indigo-100 text-indigo-700' :
          'bg-slate-200 text-slate-600'
        }`}>
          {wo.status || 'CUTTING'}
        </p>
      </div>
    </div>
  );
};

export default WorkorderDetailCard;
