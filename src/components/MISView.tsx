import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import Icon from './Icon';

interface MISViewProps {
  id: string;
  globalZone?: string;
}

const MISView: React.FC<MISViewProps> = ({ id, globalZone }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.run('api_getEndlineData');
      if (res && res.length > 0) {
        // Apply Global Zone Filter
        const filtered = globalZone && globalZone !== 'ALL' 
          ? res.filter((r: any) => (r.zone === globalZone || r.location === globalZone))
          : res;

        const grouped = filtered.reduce((acc: any, curr: any) => {
          const date = new Date(curr.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
          if (!acc[date]) acc[date] = { name: date, pass: 0, rework: 0, fail: 0, total: 0 };
          acc[date].pass += Number(curr.passQty || 0);
          acc[date].rework += Number(curr.reworkQty || 0);
          acc[date].fail += Number(curr.failQty || 0);
          acc[date].total += (Number(curr.passQty || 0) + Number(curr.reworkQty || 0) + Number(curr.failQty || 0));
          return acc;
        }, {});
        setData(Object.values(grouped));
      } else {
        setData([
          { name: 'Mon', pass: 400, rework: 20, fail: 24 },
          { name: 'Tue', pass: 300, rework: 15, fail: 13 },
          { name: 'Wed', pass: 200, rework: 40, fail: 98 },
          { name: 'Thu', pass: 278, rework: 10, fail: 39 },
          { name: 'Fri', pass: 189, rework: 25, fail: 48 },
          { name: 'Sat', pass: 239, rework: 30, fill: 38 },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, globalZone]);

  const summary = useMemo(() => {
    const totalPass = data.reduce((acc, curr) => acc + curr.pass, 0);
    const totalRework = data.reduce((acc, curr) => acc + (curr.rework || 0), 0);
    const totalFail = data.reduce((acc, curr) => acc + curr.fail, 0);
    const total = totalPass + totalRework + totalFail;
    const avgEff = total > 0 ? ((totalPass / total) * 100).toFixed(1) : 0;
    return { totalPass, totalRework, totalFail, avgEff };
  }, [data]);

  if (loading) return <div className="p-12 text-center text-slate-400">Loading Report...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3 glass-card border-l-4 border-indigo-500">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Pass</span>
          <p className="text-xl font-black text-slate-800">{summary.totalPass}</p>
        </div>
        <div className="p-3 glass-card border-l-4 border-amber-500">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Rework</span>
          <p className="text-xl font-black text-slate-800">{summary.totalRework}</p>
        </div>
        <div className="p-3 glass-card border-l-4 border-rose-500">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Fail</span>
          <p className="text-xl font-black text-slate-800">{summary.totalFail}</p>
        </div>
        <div className="p-3 glass-card border-l-4 border-emerald-500">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quality Efficiency</span>
          <p className="text-xl font-black text-slate-800">{summary.avgEff}%</p>
        </div>
      </div>

      <div className="h-72 w-full glass-card p-4">
        <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Quality Trend Analysis</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '10px'}} />
            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{fontSize: '10px'}} />
            <Area type="monotone" dataKey="pass" stroke="#10b981" fillOpacity={1} fill="url(#colorPass)" strokeWidth={2} />
            <Area type="monotone" dataKey="rework" stroke="#f59e0b" fillOpacity={0} strokeWidth={2} />
            <Area type="monotone" dataKey="fail" stroke="#ef4444" fillOpacity={0} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-60 glass-card p-4">
          <h3 className="text-[10px] font-bold text-slate-500 mb-4 uppercase tracking-wider">Defect Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', fontSize: '10px'}} />
              <Bar dataKey="fail" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="rework" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-60 glass-card p-4">
          <h3 className="text-[10px] font-bold text-slate-500 mb-4 uppercase tracking-wider">Overall Quality Status</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={[
                  {name: 'Pass', value: summary.totalPass}, 
                  {name: 'Rework', value: summary.totalRework},
                  {name: 'Fail', value: summary.totalFail}
                ]} 
                innerRadius={45} 
                outerRadius={65} 
                paddingAngle={6} 
                dataKey="value"
                stroke="none"
              >
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
                <Cell fill="#f43f5e" />
              </Pie>
              <Tooltip contentStyle={{borderRadius: '8px', border: 'none', fontSize: '10px'}} />
              <Legend verticalAlign="bottom" wrapperStyle={{fontSize: '10px'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MISView;
