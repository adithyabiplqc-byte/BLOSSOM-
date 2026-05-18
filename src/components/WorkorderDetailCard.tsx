import React from 'react';

interface WorkorderDetailCardProps {
  wo: any;
}

const WorkorderDetailCard: React.FC<WorkorderDetailCardProps> = ({ wo }) => {
  if (!wo) return null;
  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in animate-zoom-in">
      <div><label>Item</label><p className="font-bold text-sm text-slate-800">{wo.item}</p></div>
      <div><label>Style</label><p className="font-bold text-sm text-slate-800">{wo.style}</p></div>
      <div><label>Colour</label><p className="font-bold text-sm text-slate-800">{wo.colour}</p></div>
      <div><label>Qty</label><p className="font-bold text-sm text-slate-800">{wo.quantity}</p></div>
    </div>
  );
};

export default WorkorderDetailCard;
