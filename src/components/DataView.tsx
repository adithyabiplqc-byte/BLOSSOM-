import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { SUBMODULES } from '../constants';
import Icon from './Icon';

interface DataViewProps {
  id: string;
  user: any;
  globalZone?: string;
  settings?: any;
}

const DataView: React.FC<DataViewProps> = ({ id, user, globalZone, settings }) => {
  const currentZones = settings?.ZONE || ['KERALA', 'TAMILNADU', 'BANGLORE'];
  const currentItems = settings?.ITEMS || ['T-SHIRT', 'POLO', 'HOODIE', 'JACKET', 'PANTS'];

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>(globalZone || user.location || 'ALL');
  const [selectedItem, setSelectedItem] = useState<string>('ALL');

  // Sync with globalZone if it changes
  useEffect(() => {
    if (globalZone) {
      setSelectedZone(globalZone);
    }
  }, [globalZone]);

  useEffect(() => {
    fetchData();
  }, [id, selectedZone, selectedItem, refreshKey]);

  const fetchData = async () => {
    setLoading(true);
    setActiveSearch(searchTerm); // Sync active search with term on fetch or button click
    console.log(`[DataView] Fetching data for id: ${id}`, { selectedZone, selectedItem });
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

    if (!sheetMapping[id]) {
      console.warn(`[DataView] No API mapping found for id: ${id}`);
      setData([]);
      setLoading(false);
      return;
    }

    try {
      const res = await api.run(sheetMapping[id] as any, { zone: selectedZone, item: selectedItem });
      console.log(`[DataView] Received response for ${id}:`, res);
      
      if (res && res.success === false) {
        throw new Error(res.error || "Server returned failure");
      }
      
      if (Array.isArray(res)) {
        setData(res);
      } else {
        console.warn(`[DataView] Expected array but got:`, typeof res, res);
        setData([]);
      }
    } catch (error: any) {
      console.error("Fetch Data Error:", error);
      alert(`Error loading data: ${error.message || "Unknown error"}`);
      setData([]);
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
      const res = await api.run(sheetMapping[id], row.id || row.workorderNumber);
      if (res && res.success === false) throw new Error(res.error);
      alert('Record Deleted');
      fetchData();
    } catch (error: any) {
      alert(`Error deleting record: ${error.message || "Unknown error"}`);
    }
  };

  const exportToCSV = () => {
    if (!Array.isArray(displayData) || displayData.length === 0) return;
    const exportHeaders = headers.length > 0 ? headers : Object.keys(displayData[0]);
    const rows = displayData.map(row => exportHeaders.map(h => JSON.stringify(row[h] || '')).join(','));
    const csvContent = [exportHeaders.join(','), ...rows].join('\n');
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

  // Define which columns to hide
  const hiddenColumns = useMemo(() => {
    const base = ['id', 'restrictions', 'canDownload'];
    return base;
  }, []);

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter(row => {
      if (!row) return false;
      // Zone filter
      const zoneMatch = selectedZone === 'ALL' || 
                        (row.zone && String(row.zone).toUpperCase() === selectedZone.toUpperCase()) || 
                        (row.location && String(row.location).toUpperCase() === selectedZone.toUpperCase());
      
      // Item filter
      const itemMatch = selectedItem === 'ALL' || 
                        (row.item && row.item === selectedItem) ||
                        (row.items && row.items === selectedItem) ||
                        (row.itemName && row.itemName === selectedItem);

      const rowStr = Object.values(row as object).map(v => {
        if (v === null || v === undefined) return '';
        if (typeof v === 'object') return JSON.stringify(v);
        return String(v);
      }).join(' ').toLowerCase();
      const searchMatch = !activeSearch || rowStr.includes(activeSearch.toLowerCase());

      return zoneMatch && itemMatch && searchMatch;
    });
  }, [data, selectedZone, selectedItem, activeSearch]);

  const headers = useMemo(() => {
    if (filteredData.length === 0) return [];
    // Collect all unique keys from all rows to ensure no missing columns
    const allKeys = new Set<string>();
    filteredData.forEach(row => {
      Object.keys(row).forEach(key => {
        if (!hiddenColumns.includes(key)) allKeys.add(key);
      });
    });
    
    // Sort headers: timestamp first, then others
    const sorted = Array.from(allKeys);
    return sorted.sort((a, b) => {
      if (a === 'timestamp' || a === 'createdAt') return -1;
      if (b === 'timestamp' || b === 'createdAt') return 1;
      return a.localeCompare(b);
    });
  }, [filteredData]);

  // Data to display
  const displayData = filteredData;

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-medium animate-pulse">Synchronizing Data...</p>
    </div>
  );

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
              {currentZones.map((z: string) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          {id !== 'B1' && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Item:</span>
              <select 
                className="py-1 px-3 text-xs w-32"
                value={selectedItem}
                onChange={e => setSelectedItem(e.target.value)}
              >
                <option value="ALL">ALL ITEMS</option>
                {currentItems.map((i: string) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1 pr-2 w-full md:w-64">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 py-1.5 text-xs border-none bg-transparent focus:ring-0"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchData()}
              />
              <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <button 
              type="button"
              onClick={() => fetchData()}
              className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-sm"
            >
              Search
            </button>
          </div>
          {user.canDownload !== false && (
            <button onClick={exportToCSV} className="btn-secondary flex items-center gap-2 py-1.5 px-3 text-[10px] whitespace-nowrap">
              <Icon name="download" size={12} /> EXPORT
            </button>
          )}
          <button onClick={() => setRefreshKey(prev => prev + 1)} className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors">
            <Icon name="refresh-cw" size={14} />
          </button>
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
            {displayData.length === 0 ? (
              <tr><td colSpan={headers.length + (user.role === 'ADMIN' ? 1 : 0)} className="p-10 text-center text-slate-400 italic text-sm">No data matches your filters.</td></tr>
            ) : (
              displayData.map((row, i) => (
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
