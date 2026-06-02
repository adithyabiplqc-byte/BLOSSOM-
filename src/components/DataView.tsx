import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  const currentZones = settings?.ZONE || settings?.ZONES || ['KERALA', 'TIRUPUR', 'BANGLORE'];
  const currentItems = settings?.ITEMS || settings?.ITEM || ['T-SHIRT', 'POLO', 'HOODIE', 'JACKET', 'PANTS'];

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>(globalZone || user.zone || user.location || 'ALL');
  const [selectedItem, setSelectedItem] = useState<string>('ALL');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; row: any }>({ isOpen: false, row: null });
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = (row: any) => {
    if (user.role !== 'ADMIN') return;
    setDeleteConfirmation({ isOpen: true, row });
  };

  const handleConfirmDelete = async () => {
    const row = deleteConfirmation.row;
    if (!row) return;

    const sheetMapping: { [key: string]: string } = {
      'B1': 'api_deleteMaterialData',
      'B2': 'api_deleteCuttingData',
      'B3': 'api_deleteInlineData',
      'B4': 'api_deleteEndlineData',
      'B5': 'api_deleteAQLData',
      'B6': 'api_deleteFinalAuditData',
      'B8': 'api_deleteWorkorder',
    };
    
    if (!sheetMapping[id]) {
      setDeleteConfirmation({ isOpen: false, row: null });
      return alert('Delete not supported for this module yet.');
    }
    
    setDeleting(true);
    try {
      const res = await api.run(sheetMapping[id], row.id || row.workorderNumber);
      if (res && res.success === false) throw new Error(res.error);
      
      setDeleteConfirmation({ isOpen: false, row: null });
      // Clear deleting status
      setDeleting(false);
      fetchData();
    } catch (error: any) {
      setDeleting(false);
      alert(`Error deleting record: ${error.message || "Unknown error"}`);
    }
  };

  const getRowDescription = (row: any) => {
    if (!row) return '';
    const parts = [];
    if (row.workorderNumber) parts.push(`Workorder: #${row.workorderNumber}`);
    if (row.style) parts.push(`Style: ${row.style}`);
    if (row.grn) parts.push(`GRN: ${row.grn}`);
    if (row.billNo) parts.push(`Bill No: ${row.billNo}`);
    if (row.supplierName) parts.push(`Supplier: ${row.supplierName}`);
    if (row.itemName) parts.push(`Item: ${row.itemName}`);
    if (row.username) parts.push(`User: ${row.username}`);
    
    if (parts.length === 0) {
      const keys = Object.keys(row).filter(k => k !== 'id' && typeof row[k] !== 'object');
      if (keys.length > 0) {
        parts.push(`${keys[0].toUpperCase()}: ${row[keys[0]]}`);
      } else {
        parts.push(`ID: ${row.id || 'Unknown'}`);
      }
    }
    return parts.join(' • ');
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
    if (id === 'B1') {
      base.push('style');
    }
    return base;
  }, [id]);

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
    
    if (id === 'B1') {
      const b1Order = [
        'timestamp',
        'receivedDate',
        'checkingDate',
        'grn',
        'billNo',
        'supplierName',
        'itemName',
        'style',
        'receivedQuantity',
        'checkedQuantity',
        'passQuantity',
        'rejectedQuantity',
        'itemRemarks',
        'generalRemarks',
        'zone',
        'inspector'
      ];
      const orderedHeaders = b1Order.filter(k => allKeys.has(k));
      const remainingHeaders = Array.from(allKeys).filter(k => !b1Order.includes(k));
      return [...orderedHeaders, ...remainingHeaders];
    }
    
    // Sort headers: timestamp first, then others
    const sorted = Array.from(allKeys);
    return sorted.sort((a, b) => {
      if (a === 'timestamp' || a === 'createdAt') return -1;
      if (b === 'timestamp' || b === 'createdAt') return 1;
      return a.localeCompare(b);
    });
  }, [filteredData, id, hiddenColumns]);

  // Data to display
  const displayData = filteredData;

  const formatHeaderLabel = (h: string) => {
    const mappings: { [key: string]: string } = {
      timestamp: 'TIMESTAMP',
      receivedDate: 'RECEIVED DATE',
      checkingDate: 'CHECKED DATE',
      grn: 'GRN',
      billNo: 'BILL NO',
      supplierName: 'SUPPLIER NAME',
      itemName: 'ITEM NAME',
      style: 'STYLE',
      receivedQuantity: 'TOTAL QUANTITY RECEIVED',
      checkedQuantity: 'CHECKED QTY',
      passQuantity: 'PASS QTY',
      rejectedQuantity: 'REJECTED QTY',
      itemRemarks: 'ITEM REMARKS',
      generalRemarks: 'GENERAL REMARKS',
      zone: 'ZONE',
      inspector: 'INSPECTOR',
      id: 'ID',
    };
    if (mappings[h]) return mappings[h];
    const result = h.replace(/([A-Z])/g, ' $1');
    return (result.charAt(0).toUpperCase() + result.slice(1)).toUpperCase();
  };

  const renderCellContent = (h: string, val: any) => {
    if (val === null || val === undefined) return '-';

    if (h === 'timestamp' || h === 'createdAt') {
      try {
        return new Date(val).toLocaleString();
      } catch (e) {
        return String(val);
      }
    }

    if (h === 'receivedDate' || h === 'checkingDate' || h.toLowerCase().endsWith('date')) {
      try {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
      } catch (e) {
        // Ignore and fall through
      }
    }

    const valStr = String(val).trim();
    const upperVal = valStr.toUpperCase();

    // Standard statuses
    if (upperVal === 'PASS' || upperVal === 'APPROVED' || upperVal === 'COMPLETED' || upperVal === 'YES' || upperVal === 'LIVE' || upperVal === 'STABLE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {valStr}
        </span>
      );
    }

    if (upperVal === 'FAIL' || upperVal === 'REJECT' || upperVal === 'REJECTED' || upperVal === 'NO' || upperVal === 'BLOCKED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          {valStr}
        </span>
      );
    }

    if (upperVal === 'PENDING' || upperVal === 'REWORK' || upperVal === 'WARNING' || upperVal === 'HOLD') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          {valStr}
        </span>
      );
    }

    // Role styling
    if (h.toLowerCase() === 'role' || h.toLowerCase() === 'userrole') {
      if (upperVal === 'ADMIN') {
        return <span className="px-2 py-0.5 text-[9px] font-black bg-indigo-100 text-indigo-800 rounded uppercase tracking-wider border border-indigo-200">ADMIN</span>;
      }
      if (upperVal === 'WORKORDER') {
        return <span className="px-2 py-0.5 text-[9px] font-black bg-teal-100 text-teal-800 rounded uppercase tracking-wider border border-teal-200">WORKORDER</span>;
      }
      return <span className="px-2 py-0.5 text-[9px] font-black bg-slate-100 text-slate-700 rounded uppercase tracking-wider border border-slate-200">{valStr}</span>;
    }

    // Zone / Location badge
    if (h.toLowerCase() === 'zone' || h.toLowerCase() === 'location') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200 uppercase">
          <Icon name="map-pin" size={10} className="text-indigo-500" />
          {valStr}
        </span>
      );
    }

    // Workorder number formatting
    if (h === 'workorderNumber' || h === 'wo') {
      return (
        <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100 text-[10px]">
          #{valStr}
        </span>
      );
    }

    // Default formatting
    return valStr;
  };

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
              {headers.map(h => <th key={h} className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-widest">{formatHeaderLabel(h)}</th>)}
              {user.role === 'ADMIN' && <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-widest text-right">Action</th>}
            </tr>
          </thead>
          <tbody>
            {displayData.length === 0 ? (
              <tr><td colSpan={headers.length + (user.role === 'ADMIN' ? 1 : 0)} className="p-10 text-center text-slate-400 italic text-sm">No data matches your filters.</td></tr>
            ) : (
              displayData.map((row, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  {headers.map(h => (
                    <td key={h} className="p-3 text-xs text-slate-650 font-medium">
                      {renderCellContent(h, row[h])}
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

      <AnimatePresence>
        {deleteConfirmation.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleting && setDeleteConfirmation({ isOpen: false, row: null })}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              id="delete-modal-backdrop"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-150 overflow-hidden"
              id="delete-modal-box"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 border border-rose-100 flex-shrink-0">
                  <Icon name="alert-triangle" size={24} />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Confirm Record Deletion</h3>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase tracking-normal">
                    Are you sure you want to permanently delete this record from the Data Center? This action is irreversible and will remove all associated logs instantly.
                  </p>
                </div>
              </div>

              {/* Record Summary Preview */}
              {deleteConfirmation.row && (
                <div className="mt-4 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col gap-1.5 shadow-inner">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">TARGET RECORD</span>
                  <p className="text-xs font-black text-indigo-900 uppercase tracking-tight">
                    {getRowDescription(deleteConfirmation.row)}
                  </p>
                  {deleteConfirmation.row.timestamp && (
                    <span className="text-[10px] font-bold text-slate-400 font-mono block uppercase">
                      Created: {new Date(deleteConfirmation.row.timestamp).toLocaleString()}
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeleteConfirmation({ isOpen: false, row: null })}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-655 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 font-sans"
                  id="delete-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md shadow-rose-200 hover:scale-[1.01] active:scale-95 flex items-center gap-2 font-sans"
                  id="delete-btn-confirm"
                >
                  {deleting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Icon name="trash-2" size={12} />
                      Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DataView;
