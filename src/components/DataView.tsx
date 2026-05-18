import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SUBMODULES } from '../constants';
import Icon from './Icon';

interface DataViewProps {
  id: string;
  user: any;
  globalZone?: string;
}

const DataView: React.FC<DataViewProps> = ({ id, user, globalZone }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>(globalZone || user.location || 'ALL');
  const [selectedItem, setSelectedItem] = useState<string>('ALL');

  useEffect(() => {
    fetchData();
  }, [id, selectedZone, selectedItem]);

  const fetchData = async () => {
    setLoading(true);
    const sheetMapping: { [key: string]: string } = {
      'B1': 'api_getMaterialData',
      'B2': 'api_getCuttingData',
      'B3': 'api_getInlineData',
      'B4': 'api_getEndlineData',
      'B5': 'api_getAQLData',
      'B6': 'api_getFinalAuditData',
      'B7': 'api_getUsers',
      'B8': 'api_getWorkorders',
    };
    try {
      const res = await api.run(sheetMapping[id] as any, { zone: selectedZone, item: selectedItem });
      setData(res || []);
    } catch (error) {
      console.error("Fetch Data Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row: any) => {
    if (user.role !== 'ADMIN') return;
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    const sheetMapping: { [key: string]: string } = {
      'B1': 'api_deleteMaterialData',
      'B2': 'api_deleteCuttingData',
      'B3': 'api_deleteInlineData',
      'B4': 'api_deleteEndlineData',
      'B5': 'api_deleteAQLData',
      'B6': 'api_deleteFinalAuditData',
      'B8': 'api_deleteWorkorder',
    };
    
    if (!sheetMapping[id]) return alert('Delete not supported for this module yet.');
    
    try {
      await api.run(sheetMapping[id], row.id || row.workorderNumber);
      alert('Record Deleted');
      fetchData();
    } catch (error) {
      alert('Error deleting record');
    }
  };

  const exportToCSV = () => {
    if (filteredData.length === 0) return;
    const headers = Object.keys(filteredData[0]);
    const rows = filteredData.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${SUBMODULES.find(s => s.id === id)?.name || 'data'}_${selectedZone}_${selectedItem}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Loading data...</div>;

  const filteredData = data.filter(row => {
    // Zone filter
    const zoneMatch = selectedZone === 'ALL' || 
                      (row.zone && row.zone === selectedZone) || 
                      (row.location && row.location === selectedZone);
    
    // Item filter
    const itemMatch = selectedItem === 'ALL' || 
                      (row.item && row.item === selectedItem) ||
                      (row.items && row.items === selectedItem);

    const rowStr = Object.values(row).join(' ').toLowerCase();
    const searchMatch = rowStr.includes(search.toLowerCase());

    return zoneMatch && itemMatch && searchMatch;
  });

  const headers = data.length > 0 ? Object.keys(data[0]).filter(h => h !== 'id' && h !== 'restrictions') : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zone:</span>
            <select 
              className="py-1 px-3 text-xs w-32 disabled:bg-slate-50 disabled:text-slate-400"
              value={selectedZone}
              onChange={e => setSelectedZone(e.target.value)}
              disabled={!!globalZone && globalZone !== 'ALL'}
            >
              <option value="ALL">ALL ZONES</option>
              {['KERALA', 'TAMILNADU', 'BANGLORE'].map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Item:</span>
            <select 
              className="py-1 px-3 text-xs w-32"
              value={selectedItem}
              onChange={e => setSelectedItem(e.target.value)}
            >
              <option value="ALL">ALL ITEMS</option>
              {['T-SHIRT', 'POLO', 'HOODIE', 'JACKET', 'PANTS'].map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 py-1.5 text-xs"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          {user.canDownload !== false && (
            <button onClick={exportToCSV} className="btn-secondary flex items-center gap-2 py-1.5 px-3 text-[10px] whitespace-nowrap">
              <Icon name="download" size={12} /> EXPORT
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto glass-card">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {headers.map(h => <th key={h} className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-widest">{h}</th>)}
              {user.role === 'ADMIN' && <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-widest text-right">Action</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr><td colSpan={headers.length + (user.role === 'ADMIN' ? 1 : 0)} className="p-10 text-center text-slate-400 italic text-sm">No data matches your filters.</td></tr>
            ) : (
              filteredData.map((row, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  {headers.map(h => (
                    <td key={h} className="p-3 text-xs text-slate-600">
                      {h === 'timestamp' || h === 'createdAt' ? new Date(row[h]).toLocaleString() : String(row[h] || '-')}
                    </td>
                  ))}
                  {user.role === 'ADMIN' && (
                    <td className="p-3 text-right">
                      <button onClick={() => handleDelete(row)} className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                        <Icon name="trash-2" size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataView;
