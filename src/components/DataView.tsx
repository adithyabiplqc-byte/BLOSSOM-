import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import { api } from '../services/api';
import { SUBMODULES, ZONES } from '../constants';
import Icon from './Icon';
import SearchableSelect from './SearchableSelect';
import { flexibleSearchMatch } from '../utils/search';
import { getDirectImageUrl, parseAndNormalizeImages, resolveIndexedDbImage } from '../utils/imageUtils';
import SmartImage from './SmartImage';

const HOURLY_ROUNDS = [
  { index: 1, label: '9 TO 10' },
  { index: 2, label: '10 TO 11' },
  { index: 3, label: '11 TO 12' },
  { index: 4, label: '12 TO 1.30' },
  { index: 5, label: '1.30 TO 2.30' },
  { index: 6, label: '2.30 TO 3.30' },
  { index: 7, label: '3.30 TO 4.30' },
  { index: 8, label: '4.30 TO 5.30' }
];

const normalizeDateToYYYYMMDD = (val: any): string => {
  if (!val) return '';
  if (val instanceof Date) {
    const year = val.getFullYear();
    const month = String(val.getMonth() + 1).padStart(2, '0');
    const day = String(val.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const s = String(val).trim();
  
  // If it's a full ISO timestamp or contains time (contains 'T'), parse as a Date 
  // and offset it to Indian Standard Time (UTC+5:30) to match Google Apps Script's timezone representation.
  if (s.includes('T')) {
    try {
      const d = new Date(s);
      if (!isNaN(d.getTime())) {
        const istTime = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
        const year = istTime.getUTCFullYear();
        const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
        const day = String(istTime.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (e) {}
  }

  const datePartOnly = s.split(/[ T]/)[0];
  const normalizedStr = datePartOnly.replace(/[\/.]/g, '-');
  const parts = normalizedStr.split('-');
  
  if (parts.length === 3) {
    let year = 0;
    let month = 0;
    let day = 0;
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    const p2 = parseInt(parts[2], 10);
    
    if (parts[0].length === 4) {
      year = p0;
      month = p1;
      day = p2;
    } else if (parts[2].length === 4) {
      year = p2;
      month = p1;
      day = p0;
    } else {
      year = parts[2].length === 2 ? 2000 + p2 : p2;
      month = p1;
      day = p0;
    }
    if (year >= 2000 && year < 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
  return s.substring(0, 10);
};

const DataViewImageItem: React.FC<{
  img: any;
  idx: number;
  total?: number;
  onPreview: () => void;
}> = ({ img, idx, onPreview }) => {
  return (
    <div className="relative group/img flex-shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPreview();
        }}
        title={`Click to preview photo: ${img.name || `Photo ${idx + 1}`}`}
        className="relative overflow-hidden rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all duration-200 bg-slate-100 dark:bg-slate-800 block text-left group w-12 h-12"
      >
        <SmartImage
          image={img}
          alt={img.name || `Photo ${idx + 1}`}
          className="w-full h-full"
          imgClassName="w-full h-full object-cover"
        />
        {/* Eye Icon Badge Overlay */}
        <div className="absolute inset-0 bg-indigo-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white rounded-lg pointer-events-none z-20">
          <Icon name="eye" size={15} className="text-white drop-shadow animate-pulse" />
          <span className="text-[7px] font-black uppercase mt-0.5 tracking-tighter text-indigo-200">View</span>
        </div>
      </button>
    </div>
  );
};

interface DataViewProps {
  id: string;
  user: any;
  globalZone?: string;
  settings?: any;
  setGlobalZone?: (z: string) => void;
  workorders?: any[];
}

const DataView: React.FC<DataViewProps> = ({ id, user, globalZone, settings, setGlobalZone, workorders }) => {
  const currentZones = settings?.ZONE || settings?.ZONES || ZONES;
  const currentItems = settings?.ITEMS || settings?.ITEM || ['T-SHIRT', 'POLO', 'HOODIE', 'JACKET', 'PANTS'];

  const isCommonOrAdmin = user?.role === 'ADMIN' || user?.zone === 'COMMON' || user?.location === 'COMMON';
  const userAssignedZone = user?.zone || user?.location || 'ALL';

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>(isCommonOrAdmin ? (globalZone || 'ALL') : userAssignedZone);
  const [selectedItem, setSelectedItem] = useState<string>('ALL');
  const [selectedMatrixDate, setSelectedMatrixDate] = useState<string>('ALL');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; row: any }>({ isOpen: false, row: null });
  const [deleting, setDeleting] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [lightboxData, setLightboxData] = useState<{
    images: any[];
    activeIndex: number;
    title?: string;
    useEmbed?: boolean;
  } | null>(null);
  const [selectedComplaintDetail, setSelectedComplaintDetail] = useState<any | null>(null);

  const exportMatrixToImage = async (mode: 'DOWNLOAD' | 'DRIVE') => {
    const element = document.getElementById('dataview-matrix-board-container');
    if (!element) {
      alert("Matrix board container not found.");
      return;
    }
    
    setIsExportingImage(true);
    try {
      await new Promise(r => setTimeout(r, 200));
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      
      if (mode === 'DOWNLOAD') {
        const link = document.createElement('a');
        link.download = `DataView_Matrix_Report_${selectedZone}_${selectedMatrixDate}.png`;
        link.href = dataUrl;
        link.click();
        alert("Success: PNG Image report downloaded!");
      } else {
        const rawBase64 = dataUrl.split(',')[1];
        const res = await api.run(
          'api_uploadSOPFile', 
          `DataView_Matrix_Report_${selectedZone}_${selectedMatrixDate}.png`, 
          rawBase64, 
          'image/png'
        ) as any;
        
        if (res && res.success) {
          alert("Successfully uploaded image report!");
          if (res.url) {
            if (res.url.startsWith('indexeddb://')) {
              try {
                const key = res.url.replace('indexeddb://', '');
                const req = indexedDB.open("SopFileStore", 1);
                req.onsuccess = () => {
                  const db = req.result;
                  const tx = db.transaction("files", "readonly");
                  const store = tx.objectStore("files");
                  const getReq = store.get(key);
                  getReq.onsuccess = () => {
                    const fileData = getReq.result;
                    if (fileData) {
                      fetch(fileData.base64).then(r => r.blob()).then(blob => {
                        const objectUrl = URL.createObjectURL(blob);
                        window.open(objectUrl, '_blank');
                      });
                    }
                  };
                };
              } catch (err) {
                console.error("Failed to open local report:", err);
              }
            } else {
              window.open(res.url, '_blank');
            }
          }
        } else {
          throw new Error(res?.error || "Unknown Apps Script Drive upload error.");
        }
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to export image report: " + err.message);
    } finally {
      setIsExportingImage(false);
    }
  };

  // Sync with globalZone if it changes and user is common/admin
  useEffect(() => {
    if (isCommonOrAdmin && globalZone) {
      setSelectedZone(globalZone);
    } else if (!isCommonOrAdmin) {
      setSelectedZone(userAssignedZone);
    }
  }, [globalZone, isCommonOrAdmin, userAssignedZone]);

  useEffect(() => {
    fetchData();
  }, [id, selectedZone, selectedItem, refreshKey]);

  const fetchData = async (forceRefresh = false) => {
    if (forceRefresh) {
      api.clearCache();
    }
    setLoading(true);
    setActiveSearch(searchTerm); // Sync active search with term on fetch or button click
    console.log(`[DataView] Fetching data for id: ${id}`, { selectedZone, selectedItem, forceRefresh });
    const sheetMapping: { [key: string]: string } = {
      'B1': 'api_getMaterialData',
      'B2': 'api_getCuttingData',
      'B3': 'api_getInlineData',
      'B4': 'api_getEndlineData',
      'B5': 'api_getAQLData',
      'B6': 'api_getFinalAuditData',
      'B7': 'api_getUsers',
      'B8': 'api_getWorkorders',
      'B10': 'api_getCustomerComplaints',
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
      console.warn(`[DataView] Fetch data notice for ${id}:`, error.message);
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
      'B10': 'api_deleteCustomerComplaint',
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
    
    const rows = displayData.map(row => exportHeaders.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return '""';

      // Format images column cleanly for Google Sheets / Excel download
      if (h === 'images' || h === 'image' || h === 'photos' || h === 'photo' || (Array.isArray(val) && val.some((v: any) => v && (v.url || v.downloadUrl)))) {
        let imgList: any[] = [];
        if (Array.isArray(val)) {
          imgList = val;
        } else if (typeof val === 'string' && val.trim()) {
          try {
            imgList = JSON.parse(val);
          } catch (e) {
            if (val.startsWith('http') || val.startsWith('data:image')) {
              imgList = [{ url: val, name: 'Image' }];
            }
          }
        }

        if (Array.isArray(imgList) && imgList.length > 0) {
          const links = imgList.map((img: any, idx: number) => {
            const url = typeof img === 'string' ? img : (img.url || img.downloadUrl || img.data || '');
            const name = typeof img === 'object' ? (img.name || `Photo ${idx + 1}`) : `Photo ${idx + 1}`;
            if (url && (url.startsWith('http') || url.startsWith('data:image'))) {
              return `=HYPERLINK("${url}", "${name}")`;
            }
            return name || url;
          }).filter(Boolean);
          if (links.length > 0) {
            return JSON.stringify(links.join(' | '));
          }
        }
      }

      if (typeof val === 'object') {
        return JSON.stringify(JSON.stringify(val));
      }
      return JSON.stringify(String(val));
    }).join(','));

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
    const base = ['id', 'ID', 'restrictions', 'canDownload', 'createdAt', 'userCode', 'location'];
    if (id === 'B1') {
      base.push('style');
    }
    return base;
  }, [id]);

  const normalizedData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map(r => {
      if (!r) return null;
      const row = { ...r };

      // Standardize ID fields
      if (row.ID !== undefined && row.id === undefined) {
        row.id = row.ID;
      }

      // Dynamic comprehensive synonym map for key unification
      const canonicalKeys: { [canonical: string]: string[] } = {
        wo: ['wo', 'workorder', 'workordernumber', 'workorderno', 'wonum', 'wonumber', 'workorderNo', 'workOrderNumber', 'work_order_number', 'wo_number', 'woNo', 'wono', 'WO'],
        totalQty: ['totalqty', 'orderqty', 'order_qty', 'orderquantity', 'quantity', 'totalQty', 'orderQty', 'orderQuantity', 'receivedquantity', 'receivedqty', 'received_qty', 'receivedQuantity'],
        checkedQty: ['checkedqty', 'pcschecked', 'pcs_checked', 'checkedquantity', 'checked_quantity', 'pcscheckedqty', 'totalaudited', 'totalchecked', 'auditedqty', 'totalcheckedqty', 'CHECKEDQTY', 'pcsChecked', 'checkedQty', 'checkedQuantity'],
        reworkQty: ['reworkqty', 'rework_qty', 'reworkqty', 'reworkQty', 'rework'],
        rejectedQty: ['rejectedqty', 'rejected_qty', 'rejectedquantity', 'rejected_quantity', 'failqty', 'fail_qty', 'complaintpcs', 'complaint_pcs', 'rejected', 'reject', 'failedqty', 'failQty', 'complaintPcs', 'REJECTEDQTY', 'REJECTED_QTY'],
        passQty: ['passqty', 'passedquantity', 'passquantity', 'passedqty', 'pass', 'passed', 'approvedqty', 'okqty', 'okquantity', 'passedqty', 'PASSQTY', 'passQty', 'passedQty'],
        style: ['style', 'stylename', 'style_name', 'styles', 'stylenames', 'styleName'],
        color: ['color', 'colour', 'colors', 'colours'],
        size: ['size', 'sizes'],
        cupsize: ['cupsize', 'cup', 'cups', 'cupSize', 'cup_size'],
        relaxingTime: ['relaxingtime', 'relaxtime', 'relax_time', 'relaxingTime', 'relaxTime', 'relaxationTime', 'relaxationtime'],
        receivedDate: ['receiveddate', 'received_date', 'receivedDate', 'date_received', 'received_date_time'],
        checkingDate: ['checkingdate', 'checkeddate', 'checkdate', 'checking_date', 'checked_date', 'checkingDate'],
        itemRemarks: ['itemremarks', 'itemremark', 'item_remarks', 'item_remark', 'itemRemarks', 'itemRemark'],
        generalRemarks: ['generalremarks', 'generalremark', 'general_remarks', 'general_remark', 'generalRemarks', 'generalRemark'],
        remarks: ['remarks', 'remark', 'notes', 'note', 'comments', 'comment'],
        unit: ['unit', 'units'],
        line: ['line', 'lines'],
        worker: ['worker', 'operator', 'operatorname', 'operator_name', 'workername', 'worker_name', 'WORKER', 'Worker', 'operatorName', 'workerName'],
        materialType: ['materialtype', 'material_type', 'materialcategory', 'material_category', 'materialType', 'materialCategory'],
        customerName: ['customername', 'customer_name', 'customer', 'customerName', 'shop', 'distributor', 'customer_shop_distributor', 'customershopdistributor', 'customer_shop', 'customershop'],
        complaintDetails: ['complaintdetails', 'complaint_details', 'complaintDetails', 'details_of_complaint', 'detailsofcomplaint', 'complaint', 'details', 'defectdetails', 'defect_details'],
        pcsCount: ['pcscount', 'pcs_count', 'pcsCount', 'noofpcs', 'no_of_pcs', 'pieces', 'pcs', 'complaintpcs', 'complaint_pcs'],
        immediateAction: ['immediateaction', 'immediate_action', 'immediateAction', 'immediateactiontaken', 'immediate_action_taken'],
        rootCause: ['rootcause', 'root_cause', 'rootCause', 'rootcauseofcomplaint', 'root_cause_of_complaint'],
        correctiveAction: ['correctiveaction', 'corrective_action', 'correctiveAction', 'correctiveactiontakenonrootcause', 'corrective_action_taken_on_root_cause', 'corrective_action_taken'],
        pendingAction: ['pendingaction', 'pending_action', 'pendingAction', 'pendingactionifany', 'pending_action_if_any'],
        effectiveAfterThreeMonths: ['effectiveafterthreemonths', 'effective_after_three_months', 'effectiveAfterThreeMonths', 'whethereffectiveafterthreemonths', 'whether_effective_after_three_months'],
        closedOn: ['closedon', 'closed_on', 'closedOn', 'closeddate', 'closed_date'],
        dateTime: ['datetime', 'date_time', 'dateTime', 'dateandtime', 'date_and_time', 'complaintdate', 'complaint_date'],
        images: [
          'images', 'image', 'attachedimages', 'attachedimage', 'attached_images', 'attached images', 'attachedphoto', 'attachedphotos', 'attached_photos', 'attached photos', 'photos', 'photo', 'evidence', 'photoevidence', 'photo_evidence', 'complaintimages', 'complaintphotos', 'complaint_images', 'complaint_photos', 'attachments', 'attachment', 'attachmenturl', 'attachment_url', 'photolink', 'imagelink', 'drivelink', 'driveurl', 'drive_url', 'fileurl', 'file_url', 'files', 'file'
        ]
      };

      const isBlankVal = (v: any) => {
        if (v === undefined || v === null) return true;
        if (typeof v === 'string') {
          const s = v.trim();
          return s === '' || s === '-' || s === '[]' || s === '{}' || s === 'null' || s === 'undefined';
        }
        if (Array.isArray(v)) return v.length === 0;
        if (typeof v === 'object') return Object.keys(v).length === 0;
        return false;
      };

      // For each canonical target, find and unify matching keys in the row
      Object.entries(canonicalKeys).forEach(([canonical, synonyms]) => {
        const matchedKeys = Object.keys(row).filter(k => {
          if (k === canonical) return false; // Don't match itself
          const kNorm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          return synonyms.some(syn => syn.toLowerCase().replace(/[^a-z0-9]/g, '') === kNorm);
        });
        
        matchedKeys.forEach(k => {
          if (isBlankVal(row[canonical]) && !isBlankVal(row[k])) {
            row[canonical] = row[k];
          }
        });
      });

      // Ensure workorder number is resolved from internal wo- id if available
      const rawWo = row.workorderNumber || row.wo;
      if (rawWo && String(rawWo).startsWith('wo-')) {
        const match = (workorders || []).find((w: any) => w.id === rawWo || w.workorderNumber === rawWo);
        if (match?.workorderNumber) {
          row.workorderNumber = match.workorderNumber;
          row.wo = match.workorderNumber;
        }
      }

      // Consolidate B8 fields so duplicate synonym columns (e.g. style vs styleName, color vs colour) do not appear
      if (id === 'B8') {
        const finalWo = row.workorderNumber || row.wo || row.workorderNo || row.workorder || '';
        row.workorderNumber = finalWo;
        row.wo = finalWo;
        row.style = row.style || row.styleName || '';
        row.colour = row.colour || row.color || '';
        row.size = row.size || '';
        row.cup = row.cup || row.cupsize || '';
        row.quantity = row.quantity || row.totalQty || row.orderQty || '';
        row.status = row.status || 'PRECUTTING';
        row.zone = row.zone || row.location || '';
        row.createdBy = row.createdBy || row.creator || '';
        row.createdAt = row.createdAt || row.timestamp || '';
      }

      return row;
    }).filter(Boolean) as any[];
  }, [data, workorders, id]);

  const filteredData = useMemo(() => {
    if (!Array.isArray(normalizedData)) return [];
    const matched = normalizedData.filter(row => {
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

      const searchMatch = flexibleSearchMatch(row, searchTerm || activeSearch);

      return zoneMatch && itemMatch && searchMatch;
    });

    const seenKeys = new Set();
    const result: any[] = [];
    matched.forEach(row => {
      const key = row.id || `${row.workorderNumber || row.wo || ''}_${row.checkingDate || row.date || row.timestamp || ''}_${row.submodule || ''}_${row.bundleNo || ''}_${row.round || ''}_${row.reworkQty || ''}_${row.checkedQty || ''}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        result.push(row);
      }
    });

    return result;
  }, [normalizedData, selectedZone, selectedItem, activeSearch]);

  const uniqueDatesInInline = useMemo(() => {
    if (id !== 'B3' || !Array.isArray(normalizedData)) return [];
    const dates = new Set<string>();
    normalizedData.forEach(r => {
      const d = normalizeDateToYYYYMMDD(r.checkingDate || r.date || r.CHECKINGDATE || r.DATE || r.timestamp);
      if (d) dates.add(d);
    });
    return Array.from(dates).sort((a, b) => b.localeCompare(a));
  }, [normalizedData, id]);

  const inlineMatrixData = useMemo(() => {
    if (id !== 'B3' || !Array.isArray(filteredData)) return [];
    const grouped: { [key: string]: {
      date: string;
      worker: string;
      machine: string;
      wo: string;
      style: string;
      color: string;
      size: string;
      cup: string;
      checkers: string[];
      rounds: { [key: number]: any };
      totalChecked: number;
      totalDefects: number;
      remarks: string[];
    }} = {};

    filteredData.forEach(r => {
      // Find operator / worker
      const workerName = String(r.worker || r.Worker || r.operator || r.operatorName || r.WORKER || '').trim();
      if (!workerName) return;

      const dateStr = normalizeDateToYYYYMMDD(r.checkingDate || r.date || r.CHECKINGDATE || r.DATE || r.timestamp);
      if (!dateStr) return;

      // Filter by selected matrix date
      if (selectedMatrixDate !== 'ALL' && dateStr !== selectedMatrixDate) return;

      const machineVal = String(r.machine || r.machineNo || r.machineNumber || r.MACHINE || r.Machine || '').trim();
      const woVal = String(r.workorderNumber || r.wo || r.WO || '').trim();
      const styleVal = String(r.style || r.styleName || r.STYLE || '').trim();
      const colorVal = String(r.color || r.colour || r.COLOR || '').trim();
      const sizeVal = String(r.size || r.sizeRange || r.SIZE || '').trim();
      const cupVal = String(r.cup || r.cupSize || r.cupsize || r.CUP || '').trim();

      const key = `${dateStr}_${workerName.toUpperCase()}_${machineVal.toUpperCase()}_${woVal.toUpperCase()}_${styleVal.toUpperCase()}_${colorVal.toUpperCase()}_${sizeVal.toUpperCase()}_${cupVal.toUpperCase()}`;

      if (!grouped[key]) {
        grouped[key] = {
          date: dateStr,
          worker: workerName,
          machine: machineVal || '-',
          wo: woVal || '-',
          style: styleVal,
          color: colorVal,
          size: sizeVal,
          cup: cupVal,
          checkers: [],
          rounds: {},
          totalChecked: 0,
          totalDefects: 0,
          remarks: []
        };
      }

      const ins = String(r.inspector || r.checker || r.INSPECTOR || r.user || '').trim();
      if (ins && !grouped[key].checkers.includes(ins)) {
        grouped[key].checkers.push(ins);
      }

      // Map to round index
      let rdIdx = Number(r.roundIndex || r.ROUNDINDEX || r.round_index || 0);
      if (isNaN(rdIdx) || rdIdx < 1 || rdIdx > 8) {
        const rLabel = String(r.round || r.ROUND || '').trim().toUpperCase().replace(/\s+/g, '');
        const matchedRound = HOURLY_ROUNDS.find(hr => {
          const lClean = hr.label.toUpperCase().replace(/\s+/g, '');
          return rLabel === lClean || rLabel.includes(lClean) || lClean.includes(rLabel);
        });
        if (matchedRound) {
          rdIdx = matchedRound.index;
        } else {
          const match = String(r.round || r.ROUND || '').match(/\d+/);
          if (match) {
            const parsedVal = Number(match[0]);
            if (parsedVal >= 1 && parsedVal <= 8) {
              rdIdx = parsedVal;
            }
          }
        }
      }

      if (!isNaN(rdIdx) && rdIdx >= 1 && rdIdx <= 8) {
        if (!grouped[key].rounds[rdIdx]) {
          grouped[key].rounds[rdIdx] = {
            checkedQty: 0,
            complaintPcs: 0,
            remarks: [],
            inspectors: []
          };
        }
        
        const existingRound = grouped[key].rounds[rdIdx];
        existingRound.checkedQty += Number(r.checkedQty || r.pcsChecked || 0);
        existingRound.complaintPcs += Number(r.complaintPcs || r.failQty || 0);
        
        const rem = String(r.remarks || r.itemRemarks || r.generalRemarks || '').trim();
        if (rem && !existingRound.remarks.includes(rem)) {
          existingRound.remarks.push(rem);
        }
        
        if (ins && !existingRound.inspectors.includes(ins)) {
          existingRound.inspectors.push(ins);
        }

        grouped[key].totalChecked += Number(r.checkedQty || r.pcsChecked || 0);
        grouped[key].totalDefects += Number(r.complaintPcs || r.failQty || 0);
      }

      // Collect remarks at upper level too
      const rRemarks = String(r.remarks || r.REMARKS || r.itemRemarks || r.generalRemarks || r.item_remarks || '').trim();
      if (rRemarks && !grouped[key].remarks.includes(rRemarks)) {
        grouped[key].remarks.push(rRemarks);
      }
    });

    // Sort by date desc, then worker name asc
    return Object.values(grouped).sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return a.worker.localeCompare(b.worker);
    });
  }, [filteredData, id, selectedMatrixDate]);

  const headers = useMemo(() => {
    const customOrders: { [key: string]: string[] } = {
      'B1': [
        'timestamp',
        'receivedDate',
        'checkingDate',
        'supplierName',
        'billNo',
        'grn',
        'materialType',
        'itemName',
        'totalQty',
        'checkedQty',
        'passQty',
        'rejectedQty',
        'itemRemarks',
        'generalRemarks',
        'inspector',
        'zone'
      ],
      'B2': [
        'timestamp',
        'wo',
        'style',
        'color',
        'size',
        'cupsize',
        'totalQty',
        'fabricType',
        'checkedQty',
        'reworkQty',
        'reworkPercent',
        'rejectedQty',
        'rejectionPercent',
        'relaxingTime',
        'cuttableWidth',
        'layLength',
        'shade',
        'layLengthCheck',
        'alignmentCheck',
        'plyCountCheck',
        'markerCheck',
        'ratioCheck',
        'inspector',
        'zone'
      ],
      'B3': [
        'wo',
        'style',
        'color',
        'size',
        'cupsize',
        'totalQty',
        'checkedQty',
        'failQty',
        'reworkPercent',
        'line',
        'unit',
        'worker',
        'machine',
        'round',
        'status',
        'remarks',
        'checkingDate',
        'timestamp',
        'inspector',
        'zone'
      ],
      'B4': [
        'wo',
        'style',
        'color',
        'size',
        'cupsize',
        'totalQty',
        'openQty',
        'checkedQty',
        'reworkQty',
        'reworkPercent',
        'passQty',
        'failQty',
        'line',
        'unit',
        'worker',
        'operation',
        'defect',
        'machineWorker',
        'status',
        'remarks',
        'checkingDate',
        'timestamp',
        'inspector',
        'zone'
      ],
      'B5': [
        'wo',
        'style',
        'color',
        'size',
        'cupsize',
        'totalQty',
        'sampleSize',
        'allowedDefects',
        'foundDefects',
        'reworkPercent',
        'status',
        'remarks',
        'checkingDate',
        'timestamp',
        'inspector',
        'zone'
      ],
      'B6': [
        'wo',
        'style',
        'color',
        'size',
        'cupsize',
        'totalQty',
        'checkedQty',
        'cartonsChecked',
        'reworkPercent',
        'passQty',
        'failQty',
        'status',
        'remarks',
        'checkingDate',
        'timestamp',
        'inspector',
        'zone'
      ],
      'B10': [
        'dateTime',
        'customerName',
        'style',
        'size',
        'complaintDetails',
        'pcsCount',
        'immediateAction',
        'rootCause',
        'correctiveAction',
        'pendingAction',
        'effectiveAfterThreeMonths',
        'closedOn',
        'status',
        'images',
        'createdBy',
        'zone',
        'timestamp'
      ],
      'B8': [
        'workorderNumber',
        'style',
        'colour',
        'size',
        'cup',
        'quantity',
        'status',
        'zone',
        'createdBy',
        'createdAt'
      ]
    };

    const targetOrder = customOrders[id];

    if (filteredData.length === 0) {
      if (targetOrder) {
        return targetOrder.filter(k => !hiddenColumns.includes(k));
      }
      return [];
    }

    // Collect all unique keys from all rows to ensure no missing columns
    const allKeys = new Set<string>();
    filteredData.forEach(row => {
      Object.keys(row).forEach(key => {
        if (!hiddenColumns.includes(key)) allKeys.add(key);
      });
      // Virtual column for rework %
      if (!hiddenColumns.includes('reworkPercent') && id !== 'B10' && id !== 'A8' && id !== 'B8') {
        allKeys.add('reworkPercent');
      }
    });
    
    if (targetOrder) {
      const filteredTarget = targetOrder.filter(k => !hiddenColumns.includes(k));
      if (id === 'B2' || id === 'B1' || id === 'B8') {
        return filteredTarget;
      }
      const remainingHeaders = Array.from(allKeys).filter(k => !targetOrder.includes(k));
      return [...filteredTarget, ...remainingHeaders];
    }
    
    // Sort headers: main keys first, metadata keys last
    const sorted = Array.from(allKeys);
    return sorted.sort((a, b) => {
      const lastKeys = ['status', 'submodule', 'remarks', 'itemRemarks', 'generalRemarks', 'checkingDate', 'receivedDate', 'timestamp', 'createdAt', 'inspector', 'zone'];
      const aIsLast = lastKeys.includes(a);
      const bIsLast = lastKeys.includes(b);
      if (aIsLast && !bIsLast) return 1;
      if (!aIsLast && bIsLast) return -1;
      return a.localeCompare(b);
    });
  }, [filteredData, id, hiddenColumns]);

  // Data to display in the table
  const displayData = filteredData;

  const formatHeaderLabel = (h: string) => {
    const mappings: { [key: string]: string } = {
      timestamp: 'TIMESTAMP',
      receivedDate: 'RECEIVED DATE',
      checkingDate: 'CHECKED DATE',
      submodule: 'SUBMODULE',
      fabricType: 'FABRIC TYPE',
      relaxingTime: 'RELAX TIME',
      relaxTime: 'RELAX TIME',
      cuttableWidth: 'CUTTABLE WIDTH',
      layLength: 'LAYLENGTH',
      shade: 'SHADE',
      layLengthCheck: 'LAY LENGTH CHK',
      alignmentCheck: 'ALIGNMENT CHK',
      plyCountCheck: 'PLY COUNT CHK',
      markerCheck: 'MARKER CHK',
      ratioCheck: 'RATIO CHK',
      grn: 'GRN',
      billNo: 'BILL NO',
      supplierName: 'SUPPLIER NAME',
      itemName: 'ITEM NAME',
      style: 'STYLE',
      receivedQuantity: 'TOTAL QUANTITY RECEIVED',
      checkedQuantity: 'CHECKED QTY',
      passQuantity: 'PASS QTY',
      rejectedQuantity: 'REJECTION QTY',
      itemRemarks: 'ITEM REMARK',
      generalRemarks: 'GENERAL REMARK',
      zone: 'ZONE',
      inspector: 'INSPECTOR',
      materialType: 'MATERIAL TYPE',
      materialCategory: 'MATERIAL TYPE',
      createdBy: 'CREATED BY',
      creator: 'CREATED BY',
      userCode: 'USER CODE',
      wo: 'WORKORDER #',
      workorderNumber: 'WORKORDER #',
      color: 'COLOUR',
      colour: 'COLOUR',
      size: 'SIZE',
      cup: 'CUP SIZE',
      cupsize: 'CUP SIZE',
      quantity: 'QUANTITY',
      orderQty: 'ORDER QTY',
      totalQty: id === 'B1' ? 'TOTAL QTY' : (id === 'B8' ? 'QUANTITY' : 'ORDER QTY'),
      status: 'STATUS',
      createdAt: 'CREATED DATE',
      remarks: 'REMARKS',
      dateTime: 'DATE & TIME',
      customerName: 'CUSTOMER / SHOP / DISTRIBUTOR',
      complaintDetails: 'DETAILS OF COMPLAINT',
      pcsCount: 'NO. OF PCS',
      immediateAction: 'IMMEDIATE ACTION TAKEN',
      rootCause: 'ROOT CAUSE OF COMPLAINT',
      correctiveAction: 'CORRECTIVE ACTION TAKEN',
      pendingAction: 'PENDING ACTION IF ANY',
      effectiveAfterThreeMonths: 'EFFECTIVE AFTER 3 MONTHS',
      closedOn: 'CLOSED ON',
      images: 'ATTACHED IMAGES',
      worker: 'WORKER / OPERATOR',
      machine: 'MACHINE #',
      round: 'ROUND',
      pcsChecked: 'PCS CHECKED',
      complaintPcs: 'COMPLAINT PCS',
      passedQty: 'PASSED QTY',
      rejectedQty: 'REJECTION QTY',
      cartonsChecked: 'CARTONS CHECKED',
      operation: 'OPERATION',
      defect: 'DEFECT',
      machineWorker: 'MACHINE WORKER',
    };
    if (mappings[h]) return mappings[h];
    const result = h.replace(/([A-Z])/g, ' $1');
    return (result.charAt(0).toUpperCase() + result.slice(1)).toUpperCase();
  };

  const renderCellContent = (h: string, val: any, row?: any) => {
    if (h === 'reworkPercent') {
      let valStr = '';
      if (val !== undefined && val !== null && val !== '') {
        valStr = String(val);
        if (!valStr.endsWith('%') && !isNaN(Number(valStr))) {
          valStr = Number(valStr).toFixed(1) + '%';
        }
      } else if (row) {
        const chk = Number(row.checkedQty || row.checkedQuantity || row.pcsChecked || row.totalQty || row.sampleSize || 0);
        const rw = Number(row.reworkQty || row.foundDefects || row.failQty || 0);
        if (chk > 0) {
          valStr = ((rw / chk) * 100).toFixed(1) + '%';
        } else {
          valStr = '0.0%';
        }
      } else {
        valStr = '0.0%';
      }
      return (
        <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px]">
          {valStr}
        </span>
      );
    }

    if (h === 'rejectionPercent') {
      let valStr = '';
      if (val !== undefined && val !== null && val !== '') {
        valStr = String(val);
        if (!valStr.endsWith('%') && !isNaN(Number(valStr))) {
          valStr = Number(valStr).toFixed(1) + '%';
        }
      } else if (row) {
        const chk = Number(row.checkedQty || row.checkedQuantity || row.pcsChecked || row.totalQty || row.sampleSize || 0);
        const rej = Number(row.rejectedQty || row.failQty || 0);
        if (chk > 0) {
          valStr = ((rej / chk) * 100).toFixed(1) + '%';
        } else {
          valStr = '0.0%';
        }
      } else {
        valStr = '0.0%';
      }
      return (
        <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[10px]">
          {valStr}
        </span>
      );
    }

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
      let displayVal = valStr;
      if (displayVal.startsWith('wo-')) {
        const match = (workorders || []).find((w: any) => w.id === displayVal || w.workorderNumber === displayVal);
        if (match?.workorderNumber) {
          displayVal = match.workorderNumber;
        }
      }
      return (
        <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100 text-[10px] whitespace-nowrap inline-block">
          #{displayVal}
        </span>
      );
    }

    // Images cell formatting
    const isImageCol = 
      h === 'images' || 
      h.toLowerCase() === 'attached images' || 
      h.toLowerCase() === 'attachedimages' || 
      h.toLowerCase() === 'attached_images' ||
      h.toLowerCase() === 'image' || 
      h.toLowerCase() === 'photos' || 
      h.toLowerCase() === 'photo' ||
      h.toLowerCase() === 'attachments' ||
      h.toLowerCase() === 'attachment' ||
      h.toLowerCase().includes('image') ||
      h.toLowerCase().includes('photo') ||
      h.toLowerCase().includes('attach');

    if (isImageCol) {
      let imgList = parseAndNormalizeImages(val);
      if (imgList.length === 0 && row) {
        imgList = parseAndNormalizeImages(row);
      }
      if (imgList.length === 0) {
        return (
          <span className="text-[11px] text-slate-400 font-medium italic select-none">
            No photos
          </span>
        );
      }
      return (
        <div className="flex flex-wrap items-center gap-2 max-w-md py-1">
          {/* Prominent Eye Preview Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxData({
                images: imgList,
                activeIndex: 0,
                title: row?.customerName ? `${row.customerName} - ${row.style || 'Customer Complaint'}` : (row?.style ? `${row.style} - Attached Evidence` : `${imgList.length} Attached Photo(s)`),
                useEmbed: false
              });
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-lg text-[10px] font-black uppercase tracking-wider transition shadow-sm cursor-pointer hover:scale-105 active:scale-95 flex-shrink-0"
            title={`Click to preview all ${imgList.length} attached photo(s)`}
          >
            <Icon name="eye" size={13} className="text-indigo-600 dark:text-indigo-400" />
            <span>{imgList.length === 1 ? 'Preview Photo' : `View (${imgList.length})`}</span>
          </button>

          {/* Thumbnails */}
          {imgList.slice(0, 3).map((img, idx) => (
            <DataViewImageItem
              key={idx}
              img={img}
              idx={idx}
              total={imgList.length}
              onPreview={() => {
                setLightboxData({
                  images: imgList,
                  activeIndex: idx,
                  title: row?.customerName ? `${row.customerName} - ${row.style || 'Customer Complaint'}` : img.name,
                  useEmbed: false
                });
              }}
            />
          ))}
          {imgList.length > 3 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxData({
                  images: imgList,
                  activeIndex: 3,
                  title: row?.customerName ? `${row.customerName} - ${row.style || 'Customer Complaint'}` : `${imgList.length} Attached Photo(s)`,
                  useEmbed: false
                });
              }}
              className="text-[9px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg px-2 py-1 border border-indigo-200 hover:bg-indigo-100 transition cursor-pointer"
            >
              +{imgList.length - 3}
            </button>
          )}
        </div>
      );
    }

    // Default formatting
    return valStr;
  };



  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zone:</span>
            <SearchableSelect 
              className="py-1 px-3 text-xs w-32 disabled:bg-slate-50 disabled:text-slate-400 font-bold bg-white border border-slate-200 rounded-lg shadow-sm"
              value={selectedZone}
              onChange={e => {
                const newZone = e.target.value;
                setSelectedZone(newZone);
                if (setGlobalZone && isCommonOrAdmin) {
                  setGlobalZone(newZone);
                }
              }}
              disabled={!isCommonOrAdmin}
            >
              {isCommonOrAdmin ? (
                <>
                  <option value="ALL">ALL ZONES</option>
                  {currentZones.map((z: string) => <option key={z} value={z}>{z}</option>)}
                </>
              ) : (
                <option value={userAssignedZone}>{userAssignedZone}</option>
              )}
            </SearchableSelect>
          </div>
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
          <button 
            id="dataview-refresh-btn"
            title="Refresh attached data & sync from server"
            onClick={() => fetchData(true)} 
            disabled={loading}
            className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer"
          >
            <Icon name="refresh-cw" size={14} className={loading ? "animate-spin text-indigo-600" : ""} />
          </button>
        </div>
      </div>

      <div className="relative min-h-[200px] space-y-6">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center min-h-[200px] rounded-2xl">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-3 animate-pulse">Syncing Database...</p>
          </div>
        )}

        {id === 'B3' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 animate-fade-in animate-duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-md font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <Icon name="grid" size={18} className="text-indigo-600 text-violet-600" />
                Hourly 8-Round Quality Matrix Report Board
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Aggregated operator quality logs across rounds matching active filters.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => exportMatrixToImage('DOWNLOAD')}
                disabled={isExportingImage || inlineMatrixData.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer animate-in fade-in"
              >
                <Icon name="download" size={13} /> Export PNG
              </button>

              {/* Matrix Date Selector Filter */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-xl shadow-sm self-start sm:self-auto">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Icon name="calendar" size={12} className="text-slate-400" />
                  Date Filter:
                </span>
                <SearchableSelect 
                  value={selectedMatrixDate}
                  onChange={e => setSelectedMatrixDate(e.target.value)}
                  className="py-0.5 px-2 text-xs bg-transparent border-none font-bold text-slate-700 focus:ring-0 cursor-pointer min-w-[120px]"
                >
                  <option value="ALL">ALL RECORDS</option>
                  {uniqueDatesInInline.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </SearchableSelect>
              </div>
            </div>
          </div>

          <div id="dataview-matrix-board-container" className="p-4 bg-white border border-slate-100 rounded-2xl space-y-6">
            <div className="flex justify-between items-center border-b pb-2 border-slate-100">
              <div>
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">{selectedZone !== 'ALL' ? selectedZone : 'ALL'} ZONE MATRIX ANALYSIS</h4>
                <p className="text-[10px] text-slate-400">Date Filter: {selectedMatrixDate}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">BQOS Quality Analytics</span>
              </div>
            </div>

            {/* METRICS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Operators</div>
                <div className="text-xl font-black text-slate-700 mt-0.5">{inlineMatrixData.length}</div>
              </div>
              <div className="bg-violet-50 p-4 rounded-2xl border border-violet-100/50 text-center">
                <div className="text-[10px] font-black text-violet-400 uppercase tracking-wider">Inspected Pcs</div>
                <div className="text-xl font-black text-violet-700 mt-0.5">
                  {inlineMatrixData.reduce((acc, r) => acc + r.totalChecked, 0)}
                </div>
              </div>
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100/50 text-center">
                <div className="text-[10px] font-black text-rose-400 uppercase tracking-wider">Defect Pcs</div>
                <div className="text-xl font-black text-rose-600 mt-0.5">
                  {inlineMatrixData.reduce((acc, r) => acc + r.totalDefects, 0)}
                </div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100/50 text-center">
                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Overall Defect Rate</div>
                <div className="text-xl font-black text-emerald-700 mt-0.5">
                  {(() => {
                    const tot = inlineMatrixData.reduce((acc, r) => acc + r.totalChecked, 0);
                    const def = inlineMatrixData.reduce((acc, r) => acc + r.totalDefects, 0);
                    return tot > 0 ? ((def / tot) * 100).toFixed(1) + "%" : "0.0%";
                  })()}
                </div>
              </div>
            </div>

            {inlineMatrixData.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-400 font-medium italic">No compiled matrix data found for the active criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-150">
                <table className="w-full text-left border-collapse border-spacing-0">
                  <thead>
                    <tr className="bg-slate-50/80 backdrop-blur text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">
                      {selectedMatrixDate === 'ALL' && <th className="py-3 px-4">Date</th>}
                      <th className="py-3 px-4">Operator / Worker</th>
                      <th className="py-3 px-2">M/C</th>
                      <th className="py-3 px-2">Workorder</th>
                      <th className="py-3 px-2">Style</th>
                      <th className="py-3 px-2 text-indigo-600 font-bold">Size/Cup</th>
                      <th className="py-3 px-2">Color</th>
                      <th className="py-3 px-2">Checker</th>
                      {HOURLY_ROUNDS.map(r => (
                        <th key={r.index} className="py-3 px-2 text-center" title={r.label}>R{r.index}</th>
                      ))}
                      <th className="py-3 px-2 text-center">Checked</th>
                      <th className="py-3 px-2 text-center">Defects</th>
                      <th className="py-3 px-4 text-center">Defect %</th>
                      <th className="py-3 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {inlineMatrixData.map((row, idx) => {
                      const defectRate = row.totalChecked > 0 ? ((row.totalDefects / row.totalChecked) * 100) : 0;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/55 transition-colors animate-fade-in">
                          {selectedMatrixDate === 'ALL' && (
                            <td className="py-3 px-4 font-mono font-bold text-slate-500 text-[11px]">{row.date}</td>
                          )}
                          <td className="py-3 px-4 font-black text-slate-800 uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0"></span>
                            <span>{row.worker}</span>
                          </td>
                          <td className="py-3 px-2 text-slate-500 font-mono font-medium lowercase">{row.machine}</td>
                          <td className="py-3 px-2 text-indigo-650 font-mono font-bold">#{row.wo}</td>
                          <td className="py-3 px-2 text-slate-500 font-medium truncate max-w-[100px]" title={row.style}>{row.style || '-'}</td>
                          <td className="py-3 px-2 text-indigo-700 font-bold font-mono text-[11px] whitespace-nowrap">
                            {row.size || '-'}{row.cup ? ` / ${row.cup}` : ''}
                          </td>
                          <td className="py-3 px-2 text-slate-500 font-medium truncate max-w-[80px]" title={row.color}>{row.color || '-'}</td>
                          <td className="py-3 px-2 text-slate-500 font-mono text-[10px] font-medium" title={row.checkers.join(', ')}>
                            {row.checkers.length > 0 ? row.checkers.join(', ') : '-'}
                          </td>
                          
                          {/* 8 ROUNDS RENDERING */}
                          {HOURLY_ROUNDS.map(round => {
                            const roundCheck = row.rounds[round.index];
                            if (!roundCheck) {
                              return (
                                <td key={round.index} className="py-3 px-2 text-center text-slate-300 font-mono">-</td>
                              );
                            }
                            const defects = Number(roundCheck.complaintPcs || roundCheck.failQty || 0);
                            const chk = Number(roundCheck.checkedQty || roundCheck.pcsChecked || 0);
                            
                            if (defects > 0) {
                              return (
                                <td key={round.index} className="py-2 px-1 text-center">
                                  <div className="inline-flex flex-col items-center justify-center bg-rose-50 text-rose-750 min-w-12 px-2 py-1 rounded-lg border border-rose-200 shadow-sm leading-none" title={`${chk} checked / ${defects} defects`}>
                                    <span className="font-bold text-[10px]">{chk}</span>
                                    <span className="text-[8px] font-black mt-0.5 text-rose-600 block">🚨 {defects}</span>
                                  </div>
                                </td>
                              );
                            } else {
                              return (
                                <td key={round.index} className="py-2 px-1 text-center">
                                  <div className="inline-flex flex-col items-center justify-center bg-emerald-50 text-emerald-750 min-w-12 px-2 py-1 rounded-lg border border-emerald-200 shadow-sm leading-none" title={`${chk} pieces OK`}>
                                    <span className="font-bold text-[10px]">{chk}</span>
                                    <span className="text-[8px] font-black mt-0.5 text-emerald-600 block">✓</span>
                                  </div>
                                </td>
                              );
                            }
                          })}

                          <td className="py-3 px-2 text-center font-black text-slate-700 font-mono">{row.totalChecked}</td>
                          <td className={`py-3 px-2 text-center font-black font-mono ${row.totalDefects > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                            {row.totalDefects}
                          </td>
                          <td className="py-3 px-4 text-center font-black font-mono">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] border font-black ${
                              defectRate > 0 
                                ? 'bg-rose-50 text-rose-700 border-rose-150' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-150'
                            }`}>
                              {defectRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium whitespace-normal max-w-xs break-words">
                            {row.remarks.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {row.remarks.map((rem, remIdx) => (
                                  <span key={remIdx} className="inline-block bg-slate-50 text-slate-600 text-[9px] px-1.5 py-0.5 rounded border border-slate-155 shadow-sm">
                                    {rem}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Transactional Log Records Ledger</span>
            <span className="text-[10px] text-slate-400 font-medium">Below is the historical raw inspection ledger</span>
          </div>
        </div>
      )}

      <div className="overflow-x-auto glass-card">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
              {headers.map(h => <th key={h} className="p-3 text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">{formatHeaderLabel(h)}</th>)}
              {(id === 'B10' || user.role === 'ADMIN') && <th className="p-3 text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest text-right">Action</th>}
            </tr>
          </thead>
          <tbody>
            {displayData.length === 0 ? (
              <tr><td colSpan={headers.length + (id === 'B10' || user.role === 'ADMIN' ? 1 : 0)} className="p-10 text-center text-slate-400 italic text-sm">No data matches your filters.</td></tr>
            ) : (
              displayData.map((row, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  {headers.map(h => (
                    <td key={h} className="p-3 text-xs text-slate-650 dark:text-slate-300 font-medium">
                      {renderCellContent(h, row[h], row)}
                    </td>
                  ))}
                  {(id === 'B10' || user.role === 'ADMIN') && (
                    <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                      {id === 'B10' && (
                        <button
                          type="button"
                          onClick={() => setSelectedComplaintDetail(row)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-lg text-[10px] font-black uppercase tracking-wider transition shadow-sm cursor-pointer hover:scale-105 active:scale-95"
                          title="View complete customer complaint file & all attached photos"
                        >
                          <Icon name="eye" size={12} className="text-indigo-600 dark:text-indigo-400" />
                          <span>View</span>
                        </button>
                      )}
                      {user.role === 'ADMIN' && (
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors inline-flex items-center justify-center cursor-pointer"
                          title="Delete record"
                        >
                          <Icon name="trash-2" size={14} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-150 dark:border-slate-800 overflow-hidden"
              id="delete-modal-box"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 rounded-2xl text-rose-600 border border-rose-100 dark:border-rose-900 flex-shrink-0">
                  <Icon name="alert-triangle" size={24} />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Confirm Record Deletion</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed uppercase tracking-normal">
                    Are you sure you want to permanently delete this record from the Data Center? This action is irreversible and will remove all associated logs instantly.
                  </p>
                </div>
              </div>

              {/* Record Summary Preview */}
              {deleteConfirmation.row && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl flex flex-col gap-1.5 shadow-inner">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">TARGET RECORD</span>
                  <p className="text-xs font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-tight">
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
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeleteConfirmation({ isOpen: false, row: null })}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-655 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 font-sans"
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

        {/* Rich Lightbox Image Carousel & Viewer Modal */}
        {lightboxData && (() => {
          const rawImages = Array.isArray(lightboxData.images) ? lightboxData.images : [lightboxData.images];
          const validImages = rawImages.filter(Boolean);
          if (validImages.length === 0) return null;

          const total = validImages.length;
          const safeIndex = Math.min(Math.max(0, lightboxData.activeIndex || 0), total - 1);
          const rawCurrent = validImages[safeIndex] || validImages[0];
          const currentImg = typeof rawCurrent === 'object' ? rawCurrent : { url: String(rawCurrent), previewUrl: String(rawCurrent), name: `Photo ${safeIndex + 1}` };
          const hasMultiple = total > 1;

          const handlePrev = (e?: React.MouseEvent) => {
            if (e) e.stopPropagation();
            setLightboxData(prev => prev ? { ...prev, activeIndex: (safeIndex - 1 + total) % total } : null);
          };

          const handleNext = (e?: React.MouseEvent) => {
            if (e) e.stopPropagation();
            setLightboxData(prev => prev ? { ...prev, activeIndex: (safeIndex + 1) % total } : null);
          };

          return (
            <div
              className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none animate-fadeIn"
              onClick={() => setLightboxData(null)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setLightboxData(null);
                if (e.key === 'ArrowLeft') handlePrev();
                if (e.key === 'ArrowRight') handleNext();
              }}
              tabIndex={0}
            >
              <div
                className="relative w-full max-w-5xl max-h-[95vh] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header Bar */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-950/90 border-b border-slate-800 text-white">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
                      <Icon name="eye" size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 truncate">
                        {lightboxData.title || currentImg.name || 'Attached Photo Evidence'}
                      </h4>
                      {hasMultiple && (
                        <p className="text-[10px] text-slate-400 font-mono">
                          Photo {safeIndex + 1} of {total}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle Drive Embed Viewer if Drive ID is available */}
                    {currentImg.embedUrl && (
                      <button
                        type="button"
                        onClick={() => setLightboxData(prev => prev ? { ...prev, useEmbed: !prev.useEmbed } : null)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
                          lightboxData.useEmbed
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-800 hover:bg-slate-700 text-indigo-300'
                        }`}
                        title="Toggle in-app Google Drive Document/Photo viewer"
                      >
                        <Icon name="file-text" size={13} />
                        <span className="hidden sm:inline">{lightboxData.useEmbed ? 'Direct Image' : 'Drive Viewer'}</span>
                      </button>
                    )}

                    {/* Open in Drive / Tab */}
                    {(currentImg.downloadUrl || currentImg.url) && (
                      <a
                        href={currentImg.downloadUrl || currentImg.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition"
                        title="Open full file in new browser tab / Google Drive"
                      >
                        <Icon name="external-link" size={13} />
                        <span className="hidden sm:inline">Open Drive</span>
                      </a>
                    )}

                    {/* Close */}
                    <button
                      type="button"
                      onClick={() => setLightboxData(null)}
                      className="p-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl transition cursor-pointer"
                      title="Close preview (Esc)"
                    >
                      <Icon name="x" size={18} />
                    </button>
                  </div>
                </div>

                {/* Main Image Stage */}
                <div className="relative flex-1 min-h-[360px] max-h-[68vh] bg-slate-950 flex items-center justify-center p-3 overflow-hidden select-none">
                  {lightboxData.useEmbed && currentImg.embedUrl ? (
                    <iframe
                      src={currentImg.embedUrl}
                      title={currentImg.name || 'Google Drive Preview'}
                      className="w-full h-[65vh] rounded-xl border border-slate-800 bg-white"
                      allow="autoplay"
                    />
                  ) : (
                    <img
                      key={currentImg.previewUrl || currentImg.url}
                      src={currentImg.previewUrl || currentImg.url}
                      alt={currentImg.name || 'Inspection Photo'}
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-2xl transition-all duration-200"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (currentImg.proxyUrl && target.src !== currentImg.proxyUrl && !target.src.includes('/api/drive-proxy')) {
                          target.src = currentImg.proxyUrl;
                        } else if (currentImg.fallbackUrl && target.src !== currentImg.fallbackUrl) {
                          target.src = currentImg.fallbackUrl;
                        } else if (currentImg.fallbackUrl2 && target.src !== currentImg.fallbackUrl2) {
                          target.src = currentImg.fallbackUrl2;
                        } else if (currentImg.downloadUrl && target.src !== currentImg.downloadUrl) {
                          target.src = currentImg.downloadUrl;
                        } else if (currentImg.embedUrl) {
                          setLightboxData(prev => prev ? { ...prev, useEmbed: true } : null);
                        }
                      }}
                    />
                  )}

                  {/* Previous Button */}
                  {hasMultiple && (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-indigo-600 text-white rounded-2xl backdrop-blur-md transition-all shadow-xl cursor-pointer hover:scale-110 active:scale-95"
                      title="Previous Photo (Left Arrow)"
                    >
                      <Icon name="chevron-left" size={20} />
                    </button>
                  )}

                  {/* Next Button */}
                  {hasMultiple && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-indigo-600 text-white rounded-2xl backdrop-blur-md transition-all shadow-xl cursor-pointer hover:scale-110 active:scale-95"
                      title="Next Photo (Right Arrow)"
                    >
                      <Icon name="chevron-right" size={20} />
                    </button>
                  )}
                </div>

                {/* Footer Thumbnail Carousel Strip */}
                {hasMultiple && (
                  <div className="px-4 py-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-center gap-2 overflow-x-auto">
                    {validImages.map((img: any, idx: number) => {
                      const isActive = idx === safeIndex;
                      const thumbUrl = typeof img === 'object' ? (img.previewUrl || img.url) : String(img);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setLightboxData(prev => prev ? { ...prev, activeIndex: idx } : null)}
                          className={`relative rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                            isActive
                              ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/20'
                              : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
                          }`}
                        >
                          <img
                            src={thumbUrl}
                            alt={(typeof img === 'object' ? img.name : null) || `Thumb ${idx + 1}`}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 object-cover"
                            onError={(e) => {
                              if (typeof img === 'object' && img.fallbackUrl) e.currentTarget.src = img.fallbackUrl;
                            }}
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] font-black text-white text-center py-0.5">
                            {idx + 1}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Customer Complaint Detailed View Modal (For B10) */}
        {selectedComplaintDetail && (() => {
          const compImgs = parseAndNormalizeImages(
            selectedComplaintDetail.images ||
            selectedComplaintDetail['ATTACHED IMAGES'] ||
            selectedComplaintDetail['attachedImages'] ||
            selectedComplaintDetail['ATTACHED_IMAGES'] ||
            selectedComplaintDetail.image ||
            selectedComplaintDetail.photos ||
            selectedComplaintDetail.photo ||
            selectedComplaintDetail
          );

          return (
            <div
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
              onClick={() => setSelectedComplaintDetail(null)}
            >
              <div
                className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col my-auto max-h-[92vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-900 to-indigo-950 text-white flex items-start justify-between border-b border-indigo-800/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 rounded-full text-[10px] font-black uppercase tracking-wider">
                        B10 Customer Complaint Record
                      </span>
                      {selectedComplaintDetail.status ? (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          selectedComplaintDetail.status.toUpperCase() === 'CLOSED'
                            ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40'
                            : 'bg-amber-500/30 text-amber-300 border border-amber-400/40'
                        }`}>
                          {selectedComplaintDetail.status}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-xl font-black tracking-tight text-white uppercase">
                      {selectedComplaintDetail.customerName || 'Customer Complaint File'}
                    </h3>
                    <p className="text-xs text-indigo-200 font-medium">
                      Style: <span className="font-bold text-white">{selectedComplaintDetail.style || '-'}</span> • Size: <span className="font-bold text-white">{selectedComplaintDetail.size || '-'}</span> • Quantity: <span className="font-bold text-white">{selectedComplaintDetail.pcsCount || '-'} PCS</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedComplaintDetail(null)}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition cursor-pointer"
                    title="Close file"
                  >
                    <Icon name="x" size={18} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
                  {/* Key Stats Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Date & Time</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                        {selectedComplaintDetail.dateTime || selectedComplaintDetail.timestamp || '-'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Zone / Plant</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                        {selectedComplaintDetail.zone || '-'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Created By</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                        {selectedComplaintDetail.createdBy || selectedComplaintDetail.inspector || '-'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Closed On</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                        {selectedComplaintDetail.closedOn || (selectedComplaintDetail.status === 'OPEN' ? 'Still Open' : '-')}
                      </span>
                    </div>
                  </div>

                  {/* Complaint Analysis Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                        <Icon name="alert-circle" size={13} />
                        Details of Complaint
                      </span>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
                        {selectedComplaintDetail.complaintDetails || 'No specific details logged.'}
                      </p>
                    </div>

                    <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-2xl space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <Icon name="search" size={13} />
                        Root Cause of Complaint
                      </span>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
                        {selectedComplaintDetail.rootCause || 'Root cause investigation pending.'}
                      </p>
                    </div>

                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                        <Icon name="zap" size={13} />
                        Immediate Action Taken
                      </span>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
                        {selectedComplaintDetail.immediateAction || 'No immediate action recorded.'}
                      </p>
                    </div>

                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <Icon name="check-circle-2" size={13} />
                        Corrective Action Taken
                      </span>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
                        {selectedComplaintDetail.correctiveAction || 'No corrective action recorded.'}
                      </p>
                    </div>
                  </div>

                  {/* Secondary Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Pending Action If Any</span>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                        {selectedComplaintDetail.pendingAction || '-'}
                      </p>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Effective After 3 Months</span>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                        {selectedComplaintDetail.effectiveAfterThreeMonths || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Photo Evidence Gallery */}
                  <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <Icon name="image" size={15} className="text-indigo-600 dark:text-indigo-400" />
                        Attached Image Evidence ({compImgs.length})
                      </span>
                      {compImgs.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setLightboxData({
                            images: compImgs,
                            activeIndex: 0,
                            title: `${selectedComplaintDetail.customerName || 'Customer Complaint'} - All Photos`,
                            useEmbed: false
                          })}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                        >
                          <Icon name="eye" size={12} />
                          Preview Lightbox
                        </button>
                      )}
                    </div>

                    {compImgs.length === 0 ? (
                      <div className="py-6 text-center space-y-2 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-4">
                        <Icon name="image" size={24} className="mx-auto text-slate-400" />
                        <p className="text-xs text-slate-400 font-bold italic">
                          No image evidence attached to this complaint record.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {compImgs.map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => setLightboxData({
                              images: compImgs,
                              activeIndex: idx,
                              title: `${selectedComplaintDetail.customerName || 'Customer Complaint'} - Photo ${idx + 1}`,
                              useEmbed: false
                            })}
                            className="group relative bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
                          >
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                              <SmartImage
                                image={img}
                                alt={img.name}
                                className="w-full h-full"
                                imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-indigo-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity z-20">
                                <Icon name="eye" size={18} className="text-white animate-pulse" />
                                <span className="text-[8px] font-black uppercase mt-1">Preview</span>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[10px]">
                              <span className="font-bold text-slate-700 dark:text-slate-300 truncate">
                                {img.name || `Photo ${idx + 1}`}
                              </span>
                              <a
                                href={img.downloadUrl || img.url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-indigo-600 hover:text-indigo-800 font-black flex items-center gap-0.5"
                                title="Open in Google Drive / New Tab"
                              >
                                <Icon name="external-link" size={11} />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedComplaintDetail(null)}
                    className="px-5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black uppercase tracking-wider transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

export default DataView;
