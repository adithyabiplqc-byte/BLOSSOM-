import React, { useState, useEffect, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import { api } from '../services/api';
import { ZONES, UNITS, WORKERS, MACHINES, COLORS, SIZES, CUPSIZES } from '../constants';
import Icon from './Icon';
import WorkorderDetailCard from './WorkorderDetailCard';

interface InlineQualityProps {
  user: any;
  settings: any;
  workorders: any[];
  triggerSuccess: (message: string) => void;
  globalZone?: string;
  refreshData?: () => void;
}

const HOURLY_ROUNDS = [
  { index: 1, label: '9 TO 10', startHour: 9, startMin: 0, endHour: 10, endMin: 0 },
  { index: 2, label: '10 TO 11', startHour: 10, startMin: 0, endHour: 11, endMin: 0 },
  { index: 3, label: '11 TO 12', startHour: 11, startMin: 0, endHour: 12, endMin: 0 },
  { index: 4, label: '12 TO 1.30', startHour: 12, startMin: 0, endHour: 13, endMin: 30 },
  { index: 5, label: '1.30 TO 2.30', startHour: 13, startMin: 30, endHour: 14, endMin: 30 },
  { index: 6, label: '2.30 TO 3.30', startHour: 14, startMin: 30, endHour: 15, endMin: 30 },
  { index: 7, label: '3.30 TO 4.30', startHour: 15, startMin: 30, endHour: 16, endMin: 30 },
  { index: 8, label: '4.30 TO 5.30', startHour: 16, startMin: 30, endHour: 17, endMin: 30 }
];

// Safe timezone-proof local date helper
const getLocalYYYYMMDD = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Extremely robust timezone and locale agnostic date string parser
export const normalizeDateToYYYYMMDD = (val: any): string => {
  if (!val) return '';
  if (val instanceof Date) {
    return getLocalYYYYMMDD(val);
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

  // Fallback to parts-based parsing for YYYY-MM-DD or DD/MM/YYYY
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
    } else if (parts[2].length === 2) {
      // 2-digit year at the end, e.g. "06/06/26"
      year = 2000 + p2;
      month = p1;
      day = p0;
    } else if (parts[0].length === 2 && p0 > 31) {
      // 2-digit year at start, e.g. "26/06/06"
      year = 2000 + p0;
      month = p1;
      day = p2;
    } else {
      year = parts[2].length === 2 ? 2000 + p2 : p2;
      month = p1;
      day = p0;
    }
    
    // Ensure month and day boundaries are correct
    if (month > 12 && day <= 12) {
      const temp = month;
      month = day;
      day = temp;
    }
    
    if (year > 2000 && year < 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // Fallback to simpler parsing or JS date parsing
  try {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      return getLocalYYYYMMDD(d);
    }
  } catch (e) {}

  return s.substring(0, 10);
};

const isSameCheckingDate = (date1: any, date2: any) => {
  if (!date1 || !date2) return false;
  const nd1 = normalizeDateToYYYYMMDD(date1);
  const nd2 = normalizeDateToYYYYMMDD(date2);
  if (!nd1 || !nd2) return false;
  
  if (nd1 === nd2) return true;
  
  // Also treat as same if they have the same year and their month/day are inverted
  const p1 = nd1.split('-');
  const p2 = nd2.split('-');
  if (p1.length === 3 && p2.length === 3 && p1[0] === p2[0]) {
    const m1 = p1[1], d1 = p1[2];
    const m2 = p2[1], d2 = p2[2];
    if ((m1 === m2 && d1 === d2) || (m1 === d2 && d1 === m2)) {
      return true;
    }
  }
  return false;
};

// Local storage caching disabled so that sheet acts as the single source of truth
const getLocalSubmissions = (): any[] => {
  return [];
};

const saveLocalSubmissions = (reports: any[]) => {
  // no-op: nothing to store in the app
};

const ensureArray = (val: any, fallback: string[] = []): string[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && val.trim()) {
    if (val.includes('\n')) return val.split('\n').map(s => s.trim()).filter(Boolean);
    if (val.includes(',')) return val.split(',').map(s => s.trim()).filter(Boolean);
    return [val.trim()];
  }
  const hasSpreadsheet = localStorage.getItem('VITE_SPREADSHEET_ID') || localStorage.getItem('VITE_GAS_URL');
  if (hasSpreadsheet) {
    return [];
  }
  return fallback;
};

const normalizeStatus = (statusStr: string): string => {
  return String(statusStr || "")
    .toUpperCase()
    .trim()
    .replace(/&/g, "AND")
    .replace(/[^A-Z0-9]/g, "");
};

const InlineQuality: React.FC<InlineQualityProps> = ({ user, settings, workorders, triggerSuccess, globalZone, refreshData }) => {
  const currentZones = useMemo(() => {
    const userZone = String(user?.zone || user?.location || '').trim().toUpperCase();
    if (user?.role !== 'ADMIN' && user?.zone !== 'COMMON' && userZone && userZone !== 'SYSTEM') {
      return [userZone];
    }
    const list = ensureArray(settings?.ZONE || settings?.ZONES, ZONES);
    return list;
  }, [settings, user]);
  
  const [zoneSettings, setZoneSettings] = useState<any>(settings);
  const [zoneMappings, setZoneMappings] = useState<any[]>([]);

  // Load ZONE sheet mappings for dynamic filtering
  useEffect(() => {
    const loadZoneMappings = async () => {
      try {
        const res = await api.run('api_getZoneMappings');
        if (Array.isArray(res)) {
          setZoneMappings(res);
        }
      } catch (e) {
        console.error("Failed to load zone mappings in Inline:", e);
      }
    };
    loadZoneMappings();
  }, []);

  // Sync zoneSettings with parent settings prop upon initial load or edit
  useEffect(() => {
    setZoneSettings(settings);
  }, [settings]);

  const fetchZoneSettings = async (zoneName: string) => {
    try {
      const res = await api.run('api_getUserSettings', `ZONE_${zoneName}`);
      if (res && typeof res === 'object') {
        setZoneSettings(res);
      }
    } catch (err) {
      console.error("[Inline] Failed to load zone settings", err);
    }
  };

  const currentMachines = useMemo(() => ensureArray(zoneSettings?.MACHINE || zoneSettings?.MACHINES, MACHINES), [zoneSettings]);
  const currentColors = useMemo(() => ensureArray(zoneSettings?.COLORS || zoneSettings?.COLOR || zoneSettings?.COLOURS || zoneSettings?.COLOUR, COLORS), [zoneSettings]);
  const currentSizes = useMemo(() => ensureArray(zoneSettings?.SIZES || zoneSettings?.SIZE, SIZES), [zoneSettings]);
  const currentCups = useMemo(() => ensureArray(zoneSettings?.CUPSIZES || zoneSettings?.CUPSIZE || zoneSettings?.CUPS || zoneSettings?.CUP, CUPSIZES), [zoneSettings]);

  const [currentTime, setCurrentTime] = useState(new Date());

  const getActiveRoundIndexByTime = () => {
    const currentH = currentTime.getHours();
    const currentM = currentTime.getMinutes();

    // If before 9 AM, default to first round (index 0)
    if (currentH < 9) {
      return 0;
    }
    // If after 5:30 PM (17:30), default to last round (index 7)
    if (currentH > 17 || (currentH === 17 && currentM >= 30)) {
      return 7;
    }

    for (let i = 0; i < HOURLY_ROUNDS.length; i++) {
      const r = HOURLY_ROUNDS[i];
      const isAfterStart = currentH > r.startHour || (currentH === r.startHour && currentM >= r.startMin);
      const isBeforeEnd = currentH < r.endHour || (currentH === r.endHour && currentM < r.endMin);
      if (isAfterStart && isBeforeEnd) {
        return i;
      }
    }
    return 0; // fallback
  };

  const activeRoundIdx = getActiveRoundIndexByTime();
  const [selectedRoundIdx, setSelectedRoundIdx] = useState<number>(activeRoundIdx);
  const lastSyncKeyRef = useRef("");

  // Sync selectedRoundIdx with activeRoundIdx when activeRoundIdx changes, but only if they haven't chosen something else
  useEffect(() => {
    setSelectedRoundIdx(activeRoundIdx);
  }, [activeRoundIdx]);

  const [form, setForm] = useState({ 
    zone: (globalZone && globalZone !== 'ALL') ? globalZone : (currentZones[0] || ''), 
    unit: '',
    wo: '', 
    checkingDate: getLocalYYYYMMDD(),
    worker: '',
    machine: '',
    color: '',
    size: '',
    cupsize: ''
  });

  const currentUnits = useMemo(() => {
    const userLoc = String(user?.location || '').trim().toUpperCase();
    const userZone = String(user?.zone || '').trim().toUpperCase();
    const isCommonOrAdmin = user?.role === 'ADMIN' || userZone === 'COMMON' || userLoc === 'COMMON' || userZone === 'SYSTEM';

    if (!isCommonOrAdmin && userLoc && userLoc !== 'SYSTEM') {
      return [userLoc];
    }

    let list: string[] = [];
    if (zoneMappings.length > 0) {
      const matched = zoneMappings
        .filter(z => String(z.zone || '').toUpperCase() === String(form.zone || '').toUpperCase() && z.unit)
        .map(z => z.unit);
      if (matched.length > 0) {
        list = Array.from(new Set(matched));
      }
    }
    if (list.length === 0) {
      list = ensureArray(zoneSettings?.UNIT || zoneSettings?.UNITS || zoneSettings?.unit, []);
    }
    return Array.from(new Set(['COMMON', ...list])).map(u => String(u).toUpperCase());
  }, [zoneSettings, zoneMappings, form.zone, user]);

  useEffect(() => {
    if (currentUnits.length === 1 && form.unit !== currentUnits[0]) {
      setForm(prev => ({ ...prev, unit: currentUnits[0], wo: '' }));
    }
  }, [currentUnits, form.unit]);

  const currentWorkers = useMemo(() => {
    const combined = new Set<string>();
    
    const currentZoneUpper = String(form.zone || '').trim().toUpperCase();
    const currentUnitUpper = String(form.unit || '').trim().toUpperCase();

    const isZoneWide = !currentUnitUpper || currentUnitUpper === 'COMMON' || currentUnitUpper === 'ALL';

    if (zoneMappings.length > 0) {
      if (!isZoneWide) {
        // 1. Try exact Match: Match zone AND unit
        const unitMatch = zoneMappings.filter(z => 
          String(z.zone || '').toUpperCase() === currentZoneUpper &&
          String(z.unit || '').toUpperCase() === currentUnitUpper &&
          z.worker
        );
        if (unitMatch.length > 0) {
          unitMatch.forEach(z => {
            if (z.worker && typeof z.worker === 'string' && z.worker.trim()) {
              combined.add(z.worker.trim());
            }
          });
        }
      }

      // 2. Fallback Match: Match zone only (if unit match is empty or unit is zone-wide / COMMON)
      if (combined.size === 0) {
        const zoneMatch = zoneMappings.filter(z => 
          String(z.zone || '').toUpperCase() === currentZoneUpper &&
          z.worker
        );
        zoneMatch.forEach(z => {
          if (z.worker && typeof z.worker === 'string' && z.worker.trim()) {
            combined.add(z.worker.trim());
          }
        });
      }
    }
    
    // 3. Fallback to settings / global list ONLY if absolutely no mapped workers found
    if (combined.size === 0) {
      const settingsWorkers = ensureArray(zoneSettings?.WORKERS || zoneSettings?.WORKER, WORKERS);
      settingsWorkers.forEach(w => {
        if (w && typeof w === 'string' && w.trim()) {
          combined.add(w.trim());
        }
      });
      if (combined.size === 0) {
        WORKERS.forEach(w => {
          if (w && typeof w === 'string' && w.trim()) {
            combined.add(w.trim());
          }
        });
      }
    }
    
    return Array.from(combined).sort((a, b) => a.localeCompare(b));
  }, [zoneSettings, zoneMappings, form.zone, form.unit]);

  const [roundInputs, setRoundInputs] = useState({
    checkedQty: '',
    complaintPcs: '',
    remarks: ''
  });

  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);

  const exportMatrixToImage = async (mode: 'DOWNLOAD' | 'DRIVE') => {
    const element = document.getElementById('inline-matrix-board-container');
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
        link.download = `Inline_Matrix_Report_${form.zone}_${form.checkingDate}.png`;
        link.href = dataUrl;
        link.click();
        triggerSuccess("Success: PNG Image report downloaded!");
      } else {
        const rawBase64 = dataUrl.split(',')[1];
        triggerSuccess("Uploading image report to Google Drive...");
        const res = await api.run(
          'api_uploadSOPFile', 
          `Inline_Matrix_Report_${form.zone}_${form.checkingDate}.png`, 
          rawBase64, 
          'image/png'
        ) as any;
        
        if (res && res.success) {
          triggerSuccess("Successfully uploaded image report!");
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

  const [matrixSearch, setMatrixSearch] = useState('');

  const dailyMatrixData = useMemo(() => {
    // Group existing reports by composite run key (worker, machine, wo, style, color, size, cup)
    const grouped: Record<string, {
      worker: string;
      machine: string;
      wo: string;
      style: string;
      color: string;
      size: string;
      cup: string;
      checkers: string[];
      rounds: Record<number, any>;
      totalChecked: number;
      totalDefects: number;
    }> = {};

    savedReports.forEach(r => {
      // Filter by active checking date
      const rDate = r.checkingDate || r.date || r.CHECKINGDATE || r.DATE || r.timestamp;
      if (!isSameCheckingDate(rDate, form.checkingDate)) return;

      const workerName = String(r.worker || r.Worker || r.operator || r.operatorName || r.WORKER || '').trim();
      if (!workerName) return;

      const machineVal = String(r.machine || r.machineNo || r.machineNumber || r.MACHINE || r.Machine || '').trim();
      const woVal = String(r.workorderNumber || r.wo || r.WO || '').trim();
      const styleVal = String(r.style || r.styleName || r.STYLE || '').trim();
      const colorVal = String(r.color || r.colour || r.COLOR || '').trim();
      const sizeVal = String(r.size || r.sizeRange || r.SIZE || '').trim();
      const cupVal = String(r.cup || r.cupSize || r.cupsize || r.CUP || '').trim();

      const compositeKey = `${workerName.toUpperCase()}_${machineVal.toUpperCase()}_${woVal.toUpperCase()}_${styleVal.toUpperCase()}_${colorVal.toUpperCase()}_${sizeVal.toUpperCase()}_${cupVal.toUpperCase()}`;

      if (!grouped[compositeKey]) {
        grouped[compositeKey] = {
          worker: workerName,
          machine: machineVal,
          wo: woVal,
          style: styleVal,
          color: colorVal,
          size: sizeVal,
          cup: cupVal,
          checkers: [],
          rounds: {},
          totalChecked: 0,
          totalDefects: 0
        };
      }

      const ins = String(r.inspector || r.checker || r.INSPECTOR || r.user || '').trim();
      if (ins && !grouped[compositeKey].checkers.includes(ins)) {
        grouped[compositeKey].checkers.push(ins);
      }

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
        if (!grouped[compositeKey].rounds[rdIdx]) {
          grouped[compositeKey].rounds[rdIdx] = {
            checkedQty: 0,
            complaintPcs: 0,
            remarks: [],
            inspectors: []
          };
        }
        
        const existingRound = grouped[compositeKey].rounds[rdIdx];
        existingRound.checkedQty += Number(r.checkedQty || r.pcsChecked || 0);
        existingRound.complaintPcs += Number(r.complaintPcs || r.failQty || 0);
        
        const rem = String(r.remarks || r.itemRemarks || r.generalRemarks || '').trim();
        if (rem && !existingRound.remarks.includes(rem)) {
          existingRound.remarks.push(rem);
        }
        
        if (ins && !existingRound.inspectors.includes(ins)) {
          existingRound.inspectors.push(ins);
        }

        grouped[compositeKey].totalChecked += Number(r.checkedQty || r.pcsChecked || 0);
        grouped[compositeKey].totalDefects += Number(r.complaintPcs || r.failQty || 0);
      }
    });

    return Object.values(grouped);
  }, [savedReports, form.checkingDate]);

  const filteredMatrix = useMemo(() => {
    return dailyMatrixData.filter(row => {
      const searchStr = `${row.worker} ${row.machine} ${row.wo} ${row.style} ${row.color} ${row.size} ${row.cup}`.toLowerCase();
      return searchStr.includes(matrixSearch.toLowerCase());
    });
  }, [dailyMatrixData, matrixSearch]);

  const handleMatrixRowClick = (row: any) => {
    setForm(prev => ({
      ...prev,
      worker: row.worker,
      machine: row.machine || prev.machine,
      wo: row.wo || prev.wo,
      color: row.color || prev.color,
      size: row.size || prev.size,
      cupsize: row.cup || prev.cupsize
    }));
    triggerSuccess(`Loaded operator ${row.worker} details!`);
  };

  // Dynamic Worker/Machine loaders to pull in ANY workers/machines recorded in existing reports
  const dynamicWorkers = useMemo(() => {
    const list = new Set<string>();
    currentWorkers.forEach((w: string) => {
      if (w && typeof w === 'string' && w.trim()) {
        list.add(w.trim());
      }
    });

    const currentUnitUpper = String(form.unit || '').trim().toUpperCase();

    savedReports.forEach(r => {
      // If a specific unit is chosen, only pull from savedReports matching that unit
      if (currentUnitUpper) {
        const rUnit = String(r.unit || r.UNIT || r.Unit || '').trim().toUpperCase();
        if (rUnit !== currentUnitUpper) return;
      }

      const name = r.worker || r.Worker || r.operator || r.operatorName || r.WORKER;
      if (name && typeof name === 'string' && name.trim()) {
        const trimmed = name.trim();
        const exists = Array.from(list).some(existing => existing.toUpperCase() === trimmed.toUpperCase());
        if (!exists) {
          list.add(trimmed);
        }
      }
    });

    return Array.from(list).sort((a, b) => a.localeCompare(b));
  }, [currentWorkers, savedReports, form.unit]);

  const dynamicMachines = useMemo(() => {
    const list = new Set<string>();
    currentMachines.forEach((m: string) => {
      if (m && typeof m === 'string' && m.trim()) {
        list.add(m.trim());
      }
    });

    savedReports.forEach(r => {
      const name = r.machine || r.Machine || r.machineNo || r.machineNumber || r.MACHINE;
      if (name && typeof name === 'string' && name.trim()) {
        const trimmed = name.trim();
        const exists = Array.from(list).some(existing => existing.toUpperCase() === trimmed.toUpperCase());
        if (!exists) {
          list.add(trimmed);
        }
      }
    });

    return Array.from(list).sort((a, b) => a.localeCompare(b));
  }, [currentMachines, savedReports]);

  const fetchInlineData = async (silent = false) => {
    if (!silent) setLoadingReports(true);
    try {
      const res = await api.run('api_get8ROUNDSYSTEMData', { zone: form.zone });
      if (Array.isArray(res)) {
        setSavedReports(() => {
          // Keep server items, and merge with any local items that are in localStorage but not yet in server's res
          const merged = [...res];
          const cachedSubmissions = getLocalSubmissions();

          cachedSubmissions.forEach(localItem => {
            const alreadyInRes = res.some(serverItem => {
              const rWorker = String(serverItem.worker || serverItem.Worker || serverItem.operator || serverItem.operatorName || serverItem.WORKER || '').trim().toUpperCase();
              const lWorker = String(localItem.worker).trim().toUpperCase();
              
              const rRoundIdx = Number(serverItem.roundIndex || serverItem.ROUNDINDEX || serverItem.round_index || 0);
              const lRoundIdx = Number(localItem.roundIndex || 0);
              
              const rRound = String(serverItem.round || serverItem.ROUND || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
              const lRound = String(localItem.round).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

              const roundMatches = (rRoundIdx === lRoundIdx) || (rRound === lRound && rRound !== '');
              const dateMatches = isSameCheckingDate(serverItem.checkingDate || serverItem.date || serverItem.CHECKINGDATE || serverItem.DATE || serverItem.timestamp || serverItem.TIMESTAMP || serverItem.createdAt || serverItem.CREATEDAT, localItem.checkingDate);
              
              return rWorker === lWorker && roundMatches && dateMatches;
            });

            if (!alreadyInRes) {
              const dateMatchesCurrent = isSameCheckingDate(localItem.checkingDate, form.checkingDate);
              const zoneMatches = String(localItem.zone || '').trim().toUpperCase() === String(form.zone || '').trim().toUpperCase();
              
              if (dateMatchesCurrent && zoneMatches) {
                merged.push(localItem);
              }
            }
          });
          return merged;
        });
      }
    } catch (e) {
      console.error("[Inline] Failed to load inline data", e);
    } finally {
      if (!silent) setLoadingReports(false);
    }
  };

  // Keep the active round index strictly synchronized with current time and pull the latest reports silently
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      if (form.zone) {
        fetchInlineData(true);
      }
    }, 5000); // Check every 5 seconds for rapid multi-user synchronization

    return () => clearInterval(interval);
  }, [form.zone, form.checkingDate]);

  // Sync with globalZone
  useEffect(() => {
    if (globalZone && globalZone !== 'ALL') {
      setForm(prev => ({ ...prev, zone: globalZone }));
    } else if (currentZones && currentZones.length > 0 && (!form.zone || !currentZones.includes(form.zone))) {
      setForm(prev => ({ ...prev, zone: currentZones[0] }));
    }
  }, [globalZone, currentZones, form.zone]);

  // Load saved 8round quality checks for the selected parameters to power live syncing and coloring
  useEffect(() => {
    fetchInlineData();
  }, [form.zone, form.unit, form.wo, form.checkingDate, form.worker]);

  const selectedWO = workorders.find(w => String(w.workorderNumber) === String(form.wo));

  // Track previous workorder to only pre-fill on actual switch
  const prevWoRef = useRef<string>('');

  // Sync selected workorder's default parameters (color, size, cup size) into form state on WO switch
  useEffect(() => {
    if (form.wo && form.wo !== prevWoRef.current) {
      prevWoRef.current = form.wo;
      if (selectedWO) {
        setForm(prev => ({
          ...prev,
          color: selectedWO.colour || selectedWO.color || (currentColors[0] || ''),
          size: selectedWO.size || selectedWO.sizeRange || (currentSizes[0] || ''),
          cupsize: selectedWO.cup || selectedWO.cupSize || (currentCups[0] || '')
        }));
      }
    } else if (!form.wo) {
      prevWoRef.current = '';
      setForm(prev => ({
        ...prev,
        color: '',
        size: '',
        cupsize: ''
      }));
    }
  }, [form.wo, selectedWO, currentColors, currentSizes, currentCups]);

  // Synchronize selected worker when currentWorkers list changes (e.g., when switching units/zones)
  useEffect(() => {
    if (currentWorkers.length > 0) {
      const isStillValid = currentWorkers.some(w => String(w).trim().toUpperCase() === String(form.worker || '').trim().toUpperCase());
      if (!isStillValid) {
        setForm(prev => ({ ...prev, worker: currentWorkers[0] }));
      }
    } else {
      setForm(prev => ({ ...prev, worker: '' }));
    }
  }, [currentWorkers]);

  // Synchronize selected machine when currentMachines list changes
  useEffect(() => {
    if (currentMachines.length > 0) {
      const isStillValid = currentMachines.some(m => String(m).trim().toUpperCase() === String(form.machine || '').trim().toUpperCase());
      if (!isStillValid) {
        setForm(prev => ({ ...prev, machine: currentMachines[0] }));
      }
    } else {
      setForm(prev => ({ ...prev, machine: '' }));
    }
  }, [currentMachines]);

  // When selected round, selected worker, or checking-date changes, 
  // synchronize the input boxes with any already recorded report details
  useEffect(() => {
    const currentRound = HOURLY_ROUNDS[selectedRoundIdx];
    if (!currentRound || !form.worker) {
      setRoundInputs({ checkedQty: '', complaintPcs: '', remarks: '' });
      lastSyncKeyRef.current = '';
      return;
    }

    const syncKey = `${selectedRoundIdx}_${form.worker}_${form.checkingDate}`;
    const hasKeyChanged = lastSyncKeyRef.current !== syncKey;

    const matched = savedReports.find(r => {
      const rWorker = String(r.worker || r.Worker || r.operator || r.operatorName || r.WORKER || '').trim().toUpperCase();
      const sWorker = String(form.worker || '').trim().toUpperCase();
      
      const rRoundIdx = Number(r.roundIndex || r.ROUNDINDEX || r.round_index || 0);
      const rRound = String(r.round || r.ROUND || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      const sRound = String(currentRound.label).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

      const roundMatches = (rRoundIdx === currentRound.index) || (rRound === sRound && rRound !== '');
      const dateMatches = isSameCheckingDate(r.checkingDate || r.date || r.CHECKINGDATE || r.DATE || r.timestamp || r.TIMESTAMP || r.createdAt || r.CREATEDAT, form.checkingDate);
      
      return rWorker === sWorker && roundMatches && dateMatches;
    });

    if (matched) {
      const newChecked = String(matched.checkedQty || matched.pcsChecked || matched.CHECKEDQTY || matched.PCSCHECKED || '');
      const newComplaint = String(matched.complaintPcs || matched.failQty || matched.failedPieces || matched.defectQty || matched.COMPLAINTPCS || matched.FAILQTY || '');
      const newRemarks = String(matched.remarks || matched.itemRemarks || matched.generalRemarks || matched.REMARKS || '');

      if (hasKeyChanged) {
        setRoundInputs({
          checkedQty: newChecked,
          complaintPcs: newComplaint,
          remarks: newRemarks
        });
        lastSyncKeyRef.current = syncKey;
      } else {
        // If the key didn't change but the user hasn't typed anything yet,
        // and we have a newly saved report from the server, we load it.
        if (!roundInputs.checkedQty && !roundInputs.complaintPcs && !roundInputs.remarks) {
          if (newChecked || newComplaint || newRemarks) {
            setRoundInputs({
              checkedQty: newChecked,
              complaintPcs: newComplaint,
              remarks: newRemarks
            });
          }
        }
      }
    } else {
      if (hasKeyChanged) {
        setRoundInputs({ checkedQty: '', complaintPcs: '', remarks: '' });
        lastSyncKeyRef.current = syncKey;
      }
    }
  }, [selectedRoundIdx, form.worker, form.checkingDate, savedReports, roundInputs]);

  // Determine round clock state
  const getRoundState = (round: typeof HOURLY_ROUNDS[0]) => {
    if (!form.worker) {
      return 'ORANGE'; // default fallback before worker is chosen
    }

    const isCompleted = savedReports.some(r => {
      const rWorker = String(r.worker || r.Worker || r.operator || r.operatorName || r.WORKER || '').trim().toUpperCase();
      const sWorker = String(form.worker).trim().toUpperCase();
      
      // Robust worker match (remove spaces to match "79 - RAJANIN" vs "79 - RAJANI N" or similar)
      const rWorkerClean = rWorker.replace(/\s+/g, '');
      const sWorkerClean = sWorker.replace(/\s+/g, '');
      const workersMatch = (rWorkerClean === sWorkerClean) || (rWorker === sWorker);
      
      let rIdx = Number(r.roundIndex || r.ROUNDINDEX || r.round_index || 0);
      if (isNaN(rIdx) || rIdx < 1 || rIdx > 8) {
        const rLabel = String(r.round || r.ROUND || '').trim().toUpperCase().replace(/\s+/g, '');
        const matchedRound = HOURLY_ROUNDS.find(hr => {
          const lClean = hr.label.toUpperCase().replace(/\s+/g, '');
          return rLabel === lClean || rLabel.includes(lClean) || lClean.includes(rLabel);
        });
        if (matchedRound) {
          rIdx = matchedRound.index;
        } else {
          const match = String(r.round || r.ROUND || '').match(/\d+/);
          if (match) {
            const parsedVal = Number(match[0]);
            if (parsedVal >= 1 && parsedVal <= 8) {
              rIdx = parsedVal;
            }
          }
        }
      }

      const roundMatches = rIdx === round.index;
      const dateMatches = isSameCheckingDate(r.checkingDate || r.date || r.CHECKINGDATE || r.DATE || r.timestamp || r.TIMESTAMP || r.createdAt || r.CREATEDAT, form.checkingDate);
      
      return workersMatch && roundMatches && dateMatches;
    });

    if (isCompleted) {
      return 'GREEN';
    }

    return 'RED';
  };

  const isRoundLocked = (round: typeof HOURLY_ROUNDS[0]) => {
    if (!form.worker) {
      return true; // Lock before operator is chosen
    }
    const state = getRoundState(round);
    if (state === 'GREEN') {
      return true; // DONT ALLOW TO ENTER DATA if completed/uploaded (permanently green and locked)
    }

    // ADMIN BYPASS: Allow administrators to bypass temporal lock constraints (past/future) for testing/supervision
    if (user?.role === 'ADMIN') {
      return false;
    }

    const roundIdx = HOURLY_ROUNDS.findIndex(r => r.index === round.index);
    const todayStr = getLocalYYYYMMDD();
    const isPastTime = roundIdx < activeRoundIdx || form.checkingDate < todayStr;
    const isFutureTime = roundIdx > activeRoundIdx || form.checkingDate > todayStr;

    if (isPastTime) {
      return true; // IF THE ROUND TIME GOES ... NOT ALLOW TO UPLOAD DATA
    }
    if (isFutureTime) {
      return true; // Lock future rounds as well since time hasn't reached yet
    }
    return false;
  };

  const handleSaveRound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Compulsory field validation for all dropdowns, inputs, date selectors and remarks
    if (!form.zone) {
      return alert("Please select a Zone");
    }
    if (!form.unit) {
      return alert("Please select a Unit");
    }
    if (!form.wo) {
      return alert("Please select a Workorder");
    }
    if (!form.checkingDate) {
      return alert("Please select a Checking Date");
    }
    if (!form.worker) {
      return alert("Please select a Worker Operator");
    }
    if (!form.machine) {
      return alert("Please select a Machine Number");
    }
    if (!form.color) {
      return alert("Please select a Color");
    }
    if (!form.size) {
      return alert("Please select a Size");
    }
    if (!form.cupsize) {
      return alert("Please select a Cup size");
    }

    const currentRound = HOURLY_ROUNDS[selectedRoundIdx];
    
    // Strict block if the round is locked (due to time or completed status)
    if (isRoundLocked(currentRound)) {
      return alert("This round is locked.");
    }

    if (roundInputs.checkedQty === '' || roundInputs.checkedQty === null) {
      return alert("Please enter the number of Pcs Checked");
    }
    if (roundInputs.complaintPcs === '' || roundInputs.complaintPcs === null) {
      return alert("Please enter the number of Complaint Pcs");
    }

    // Set submitting flag immediately to block duplicate fast clicks
    setIsSubmitting(true);

    try {
      // Submit raw insert row with full workorder details so that the Inline sheet receives exhaustive column attributes
      const report = {
        id: 'inline_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        zone: form.zone,
        wo: form.wo,
        workorderNumber: form.wo,
        checkingDate: form.checkingDate,
        date: form.checkingDate,
        worker: form.worker,
        machine: form.machine,
        round: currentRound.label,
        roundIndex: currentRound.index,
        checkedQty: Number(roundInputs.checkedQty) || 0,
        pcsChecked: Number(roundInputs.checkedQty) || 0,
        complaintPcs: Number(roundInputs.complaintPcs) || 0,
        failQty: Number(roundInputs.complaintPcs) || 0,
        remarks: roundInputs.remarks,
        itemRemarks: roundInputs.remarks,
        generalRemarks: roundInputs.remarks,
        item: selectedWO?.item || selectedWO?.itemName || '',
        itemName: selectedWO?.item || selectedWO?.itemName || '',
        line: selectedWO?.line || selectedWO?.lineNo || '',
        unit: form.unit || selectedWO?.unit || '',
        style: selectedWO?.style || selectedWO?.styleName || '',
        color: form.color || selectedWO?.colour || selectedWO?.color || '',
        size: form.size || selectedWO?.size || selectedWO?.sizeRange || '',
        cup: form.cupsize || selectedWO?.cup || selectedWO?.cupSize || '',
        quantity: selectedWO?.quantity || selectedWO?.qty || 0,
        inspector: user.username,
        timestamp: new Date().toISOString(),
        isOptimistic: true
      };

      const res = await api.run('api_save8ROUNDSYSTEM', report);
      if (res && res.success === false) {
        setIsSubmitting(false);
        return alert(res.error || "Duplicate round submission detected by internal system.");
      }

      // Add to local submissions cache to keep the green tick permanent for the day!
      try {
        const cachedSubmissions = getLocalSubmissions();
        const updatedCache = cachedSubmissions.filter(item => {
          const isSame = String(item.worker).toUpperCase().trim() === String(report.worker).toUpperCase().trim() &&
                         Number(item.roundIndex) === Number(report.roundIndex) &&
                         isSameCheckingDate(item.checkingDate, report.checkingDate);
          return !isSame;
        });
        saveLocalSubmissions([...updatedCache, { ...report, isOptimistic: true }]);
      } catch (e) {
        console.warn("Could not write local submissions cache", e);
      }

      triggerSuccess(`ROUND ${currentRound.label} LOGGED FOR ${form.worker}`);
      if (refreshData) {
        refreshData();
      }
      
      let updatedList: any[] = [];
      setSavedReports(prev => {
        const filtered = prev.filter(r => {
          const rWorker = String(r.worker || r.Worker || r.operator || r.operatorName || r.WORKER || '').trim().toUpperCase();
          const sWorker = String(form.worker).trim().toUpperCase();
          
          const rRoundIdx = Number(r.roundIndex || r.ROUNDINDEX || r.round_index || 0);
          const rRound = String(r.round || r.ROUND || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
          const sRound = String(currentRound.label).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

          const roundMatches = (rRoundIdx === currentRound.index) || (rRound === sRound && rRound !== '');
          const dateMatches = isSameCheckingDate(r.checkingDate || r.date || r.CHECKINGDATE || r.DATE || r.timestamp || r.TIMESTAMP || r.createdAt || r.CREATEDAT, form.checkingDate);
          
          return !(rWorker === sWorker && roundMatches && dateMatches);
        });
        updatedList = [...filtered, report];
        return updatedList;
      });

      // Simple set timeout to auto-advance to the next unlogged round
      setTimeout(() => {
        const nextIdx = HOURLY_ROUNDS.findIndex((round) => {
          const isCompleted = updatedList.some(r => {
            const rWorker = String(r.worker || r.Worker || r.operator || r.operatorName || r.WORKER || '').trim().toUpperCase();
            const sWorker = String(form.worker).trim().toUpperCase();
            
            const rRoundIdx = Number(r.roundIndex || r.ROUNDINDEX || r.round_index || 0);
            const rRound = String(r.round || r.ROUND || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
            const sRound = String(round.label).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

            const roundMatches = (rRoundIdx === round.index) || (rRound === sRound && rRound !== '');
            const dateMatches = isSameCheckingDate(r.checkingDate || r.date || r.CHECKINGDATE || r.DATE || r.timestamp || r.TIMESTAMP || r.createdAt || r.CREATEDAT, round.index === currentRound.index ? report.checkingDate : form.checkingDate);
            
            return rWorker === sWorker && roundMatches && dateMatches;
          });
          return !isCompleted;
        });

        if (nextIdx !== -1) {
          setSelectedRoundIdx(nextIdx);
        }
      }, 50);

      await fetchInlineData();
    } catch (error) {
      console.error(error);
      alert('Error saving round check');
    } finally {
      setIsSubmitting(false);
    }
  };

  // List of saved matches to display dynamically at bottom for the selected Worker + Date
  const currentWorkerHistory = savedReports.filter(r => {
    const rWorker = String(r.worker || r.Worker || r.operator || r.operatorName || r.WORKER || '').trim().toUpperCase();
    const sWorker = String(form.worker || '').trim().toUpperCase();
    const dateMatches = isSameCheckingDate(r.checkingDate || r.date || r.CHECKINGDATE || r.DATE || r.timestamp || r.TIMESTAMP || r.createdAt || r.CREATEDAT, form.checkingDate);
    return rWorker === sWorker && dateMatches;
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* SECTION 1: ZONE, UNIT, WORKORDER, DATE SELECTORS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zone Selection</label>
          <select 
            value={form.zone} 
            onChange={e => {
              const newZone = e.target.value;
              setForm(prev => ({...prev, zone: newZone, unit: '', wo: ''}));
              fetchZoneSettings(newZone);
            }} 
            className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold py-2.5 focus:border-indigo-500 transition-all font-sans"
          >
            {currentZones.map((z: string) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1 font-bold">Unit Selection</label>
          <select 
            value={form.unit} 
            onChange={e => setForm({...form, unit: e.target.value, wo: ''})} 
            className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold py-2.5 focus:border-indigo-500 transition-all font-sans"
          >
            <option value="">All Units</option>
            {currentUnits.map((u: string) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Workorder #</label>
          <select 
            value={form.wo} 
            onChange={e => setForm({...form, wo: e.target.value})} 
            required 
            className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold py-2.5 focus:border-indigo-500 transition-all font-sans"
          >
            <option value="">Select Workorder</option>
            {workorders
              .filter(w => {
                const wZone = String(w.zone || w.location || "").toUpperCase().trim();
                const fZone = String(form.zone).toUpperCase().trim();
                const wUnit = String(w.unit || "").toUpperCase().trim();
                const fUnit = String(form.unit || "").toUpperCase().trim();
                const status = normalizeStatus(w.status);
                
                let matchesZone = (wZone === fZone || fZone === "" || fZone === "ALL" || fZone === "COMMON" || fZone === "SYSTEM");
                if (!matchesZone && zoneMappings.length > 0 && fZone !== '' && fZone !== 'ALL' && fZone !== 'COMMON') {
                  const matchingRows = zoneMappings.filter(m => 
                    String(m.zone || '').toUpperCase().trim() === fZone || 
                    String(m.id || '').toUpperCase().trim() === fZone
                  );
                  matchesZone = matchingRows.some(m => 
                    String(m.zone || '').toUpperCase().trim() === wZone || 
                    String(m.id || '').toUpperCase().trim() === wZone
                  );
                }
                const matchesUnit = (fUnit === "" || fUnit === "COMMON" || wUnit === "" || wUnit === fUnit || wUnit === "COMMON");
                const matchesStatus = (
                  status === 'INLINE' || 
                  status === 'INLINEANDENDLINE' || 
                  status === 'PASSANDHOLD' || 
                  status.includes('HOLD')
                );
                
                return matchesZone && matchesUnit && matchesStatus;
              })
              .map(w => <option key={w.id} value={w.workorderNumber}>{w.workorderNumber} ({w.style})</option>)
            }
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Checking Date</label>
          <input 
            type="date" 
            value={form.checkingDate} 
            onChange={e => setForm({...form, checkingDate: e.target.value})} 
            required 
            className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold py-2.5 focus:border-indigo-500 transition-all font-sans"
          />
        </div>
      </div>

      {/* SECTION 2: OPERATOR DETAILS & GARMENT PARAMETERS SPECIFICATION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-sans">Worker / Operator</label>
          <select 
            value={form.worker} 
            onChange={e => setForm({...form, worker: e.target.value})} 
            required 
            className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold py-2 px-3 focus:border-indigo-500 transition-all font-sans text-xs"
          >
            <option value="">Select Worker...</option>
            {dynamicWorkers.map((w: string) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-sans">Machine Dropdown</label>
          <select 
            value={form.machine} 
            onChange={e => setForm({...form, machine: e.target.value})} 
            required 
            className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold py-2 px-3 focus:border-indigo-500 transition-all font-sans text-xs"
          >
            <option value="">Select Machine...</option>
            {dynamicMachines.map((m: string) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1 font-sans font-bold">Select Colour</label>
          <select 
            value={form.color} 
            onChange={e => setForm({...form, color: e.target.value})} 
            required 
            className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold py-2 px-3 focus:border-indigo-500 transition-all font-sans text-xs"
          >
            <option value="">Select Color...</option>
            {currentColors.map((c: string) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 font-sans font-bold">Garment Size</label>
          <select 
            value={form.size} 
            onChange={e => setForm({...form, size: e.target.value})} 
            required 
            className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold py-2 px-3 focus:border-indigo-500 transition-all font-sans text-xs"
          >
            <option value="">Select Size...</option>
            {currentSizes.map((s: string) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-sans font-bold">Cup Category</label>
          <select 
            value={form.cupsize} 
            onChange={e => setForm({...form, cupsize: e.target.value})} 
            required 
            className="w-full bg-white border-2 border-slate-100 rounded-xl font-bold py-2 px-3 focus:border-indigo-500 transition-all font-sans text-xs"
          >
            <option value="">Select Cup...</option>
            {currentCups.map((c: string) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {selectedWO && (
        <div className="animate-zoom-in">
          <WorkorderDetailCard wo={selectedWO} settings={settings} />
        </div>
      )}

      {/* SECTION 3: 8 HOURLY ROUNDS CHECKING HOURLY SELECTORS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 font-sans">
              <Icon name="clock" size={16} className="text-indigo-600" />
              Hourly Rounds (8 Checks Daily)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Status is calculated per Worker. Green indicates the quality check has been completed for that round, while Red indicates the check has not been logged or is pending.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 font-sans shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            SYSTEM TIME: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>

         <div className="flex flex-wrap justify-center items-center gap-4 py-2">
          {HOURLY_ROUNDS.map((round, idx) => {
            const state = getRoundState(round);
            const isSelected = selectedRoundIdx === idx;
            const isActiveHour = activeRoundIdx === idx;
            const isCompleted = state === 'GREEN';
            
            let colorClasses = "";
            let iconEl = null;

            const todayStr = getLocalYYYYMMDD();
            const isPastTime = idx < activeRoundIdx || form.checkingDate < todayStr;
            const isFutureTime = idx > activeRoundIdx || form.checkingDate > todayStr;

            if (isCompleted) {
              // Completed -> neat solid green
              colorClasses = "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-100";
              iconEl = <Icon name="check" size={10} className="text-white font-extrabold" />;
            } else if (isPastTime) {
              // Past unsubmitted -> expired, locked out (RED)
              colorClasses = "bg-rose-600 text-white border-rose-700 shadow-md shadow-rose-100 cursor-not-allowed hover:bg-rose-700";
              iconEl = <Icon name="lock" size={10} className="text-white font-extrabold" />;
            } else if (isFutureTime) {
              // Future -> locked, upcoming
              colorClasses = "bg-slate-50 text-slate-400 border-slate-200 opacity-70 cursor-not-allowed hover:bg-slate-100";
              iconEl = <Icon name="lock" size={10} className="text-slate-300" />;
            } else {
              // Active right now
              colorClasses = "bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-100";
              iconEl = <Icon name="edit-3" size={10} className="text-white font-bold animate-pulse" />;
            }

            return (
              <button
                type="button"
                key={round.index}
                onClick={() => setSelectedRoundIdx(idx)}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-300 relative select-none cursor-pointer ${colorClasses} ${
                  isSelected ? 'ring-4 ring-indigo-600 ring-offset-2 scale-110 z-10 font-bold' : 'opacity-95 hover:scale-105 active:scale-95'
                }`}
              >
                {isActiveHour && (
                  <span className={`absolute -top-2 ${isCompleted ? 'bg-emerald-600' : 'bg-indigo-600'} text-[5px] text-white font-black tracking-normal px-1 py-0.5 rounded-full shadow-sm`}>
                    {isCompleted ? 'SUBMITTED' : 'ACTIVE'}
                  </span>
                )}
                <span className="text-[7px] md:text-[8px] font-bold block opacity-95 leading-none">
                  RD {round.index}
                </span>
                <span className="text-[8px] md:text-[9px] font-black tracking-tighter leading-none mt-0.5 select-none">
                  {round.label.split(' TO ')[0]}
                </span>
                <div className="mt-0.5 flex items-center justify-center">
                  {iconEl}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: DETAILED ROUND FORM INPUT AND REMARK SUBMISSION PANEL */}
      <form onSubmit={handleSaveRound} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4 border-slate-100">
          <h4 className="text-sm font-black text-indigo-700 uppercase tracking-wide flex items-center gap-2">
            <Icon name="edit-3" size={16} />
            ROUND {HOURLY_ROUNDS[selectedRoundIdx].index} DATA ENTRY ({HOURLY_ROUNDS[selectedRoundIdx].label})
          </h4>
          <span className="text-[10px] font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-600">
            Operator: {form.worker || 'None Selected'}
          </span>
        </div>

        {(() => {
          const state = getRoundState(HOURLY_ROUNDS[selectedRoundIdx]);
          const round = HOURLY_ROUNDS[selectedRoundIdx];
          const todayStr = getLocalYYYYMMDD();
          const isPastTime = selectedRoundIdx < activeRoundIdx || form.checkingDate < todayStr;
          const isFutureTime = selectedRoundIdx > activeRoundIdx || form.checkingDate > todayStr;
          
          if (!form.worker) {
            return (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold animate-fade-in">
                <Icon name="info" size={18} className="text-amber-600 flex-shrink-0" />
                <span>Please select an Operator to check round lock status and enter data.</span>
              </div>
            );
          }
          if (state === 'GREEN') {
            return (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold animate-fade-in">
                <Icon name="check-circle" size={18} className="text-emerald-600 flex-shrink-0" />
                <span>This round has already been submitted and is LOCKED. Data is safely saved and cannot be overwritten.</span>
              </div>
            );
          }
          if (isPastTime) {
            return (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold animate-fade-in">
                <Icon name="alert-triangle" size={18} className="text-rose-600 flex-shrink-0" />
                <span>This round is EXPIRED and locked. The time has gone, and no quality check was uploaded. Data submission is blocked.</span>
              </div>
            );
          }
          if (isFutureTime) {
            return (
              <div className="bg-slate-100 border border-slate-200 text-slate-600 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold animate-fade-in">
                <Icon name="lock" size={18} className="text-slate-400 flex-shrink-0" />
                <span>This round is UPCOMING and locked. Please wait until {round.label} to log quality checks.</span>
              </div>
            );
          }
          return (
            <div className="bg-indigo-50 border border-indigo-150 text-indigo-900 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold animate-fade-in">
              <Icon name="edit-3" size={18} className="text-indigo-600 flex-shrink-0 animate-pulse" />
              <span>This round is ACTIVE. Enter pieces checked and any complaints, then save to complete!</span>
            </div>
          );
        })()}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 font-sans">
              No. of Pcs Checked
            </label>
            <input 
              type="number" 
              placeholder="Enter number of pieces checked"
              value={roundInputs.checkedQty} 
              onChange={e => setRoundInputs({...roundInputs, checkedQty: e.target.value})}
              required
              min="0"
              disabled={isRoundLocked(HOURLY_ROUNDS[selectedRoundIdx]) || loadingReports || isSubmitting}
              className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl font-bold py-3 px-4 transition-all text-sm font-sans placeholder-slate-300 disabled:opacity-50 disabled:bg-slate-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 font-sans">
              Complaint Pcs (Defective / Faulty)
            </label>
            <input 
              type="number" 
              placeholder="Enter number of complaint pieces"
              value={roundInputs.complaintPcs} 
              onChange={e => setRoundInputs({...roundInputs, complaintPcs: e.target.value})}
              min="0"
              disabled={isRoundLocked(HOURLY_ROUNDS[selectedRoundIdx]) || loadingReports || isSubmitting}
              className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl font-bold py-3 px-4 transition-all text-sm font-sans placeholder-slate-300 disabled:opacity-50 disabled:bg-slate-100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 font-sans">
            Remarks & Defect Details
          </label>
          <textarea 
            placeholder="Type any operator quality issues, complaint descriptions or checking feedback..." 
            value={roundInputs.remarks} 
            onChange={e => setRoundInputs({...roundInputs, remarks: e.target.value})}
            disabled={isRoundLocked(HOURLY_ROUNDS[selectedRoundIdx]) || loadingReports || isSubmitting}
            className="w-full min-h-[100px] bg-slate-50 border-2 border-slate-100 rounded-xl p-4 focus:border-indigo-500 outline-none transition-all font-medium text-sm font-sans placeholder-slate-300 disabled:opacity-50 disabled:bg-slate-100"
          />
        </div>

        <div className="flex">
          {(() => {
            const isCompleted = getRoundState(HOURLY_ROUNDS[selectedRoundIdx]) === 'GREEN';
            const todayStr = getLocalYYYYMMDD();
            const isPastTime = selectedRoundIdx < activeRoundIdx || form.checkingDate < todayStr;
            const isFutureTime = selectedRoundIdx > activeRoundIdx || form.checkingDate > todayStr;
            const isLocked = isRoundLocked(HOURLY_ROUNDS[selectedRoundIdx]);

            let btnText = <><Icon name="save" size={18} /> Save Hourly Report & Remark</>;
            if (isSubmitting) {
              btnText = <Icon name="refresh-cw" size={18} className="animate-spin" />;
            } else if (isCompleted) {
              btnText = <><Icon name="check-circle" size={18} /> Round Completed & Locked</>;
            } else if (isPastTime) {
              btnText = <><Icon name="slash" size={18} /> Round Expired (Locked)</>;
            } else if (isFutureTime) {
              btnText = <><Icon name="clock" size={18} /> Upcoming Round (Locked)</>;
            }

            return (
              <button 
                type="submit" 
                disabled={isSubmitting || loadingReports || isLocked || !form.wo || !form.worker || !form.machine}
                className={`w-full py-4 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl rounded-xl transition duration-200 cursor-pointer ${
                  isCompleted 
                    ? 'bg-emerald-600/70 text-emerald-100 cursor-not-allowed shadow-none' 
                    : (isLocked 
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
                        : 'btn-primary shadow-indigo-100'
                      )
                }`}
              >
                {btnText}
              </button>
            );
          })()}
        </div>
      </form>

      {/* SECTION 5: DAILY INLINE REPORT (8-ROUND MATRIX) & ACTIVE OPERATOR TIMELINE */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Icon name="grid" size={16} className="text-indigo-600" />
                Daily Inline 8-Round Quality Matrix Board
              </h3>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                Real-time tracking of operator checking logs for {form.zone} on {form.checkingDate}. Click any row to load into entry form.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => exportMatrixToImage('DOWNLOAD')}
                disabled={isExportingImage || filteredMatrix.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer animate-in fade-in"
              >
                <Icon name="download" size={13} /> Export PNG
              </button>

              <div className="relative w-full sm:w-48">
                <input
                  type="text"
                  placeholder="Search..."
                  value={matrixSearch}
                  onChange={e => setMatrixSearch(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-4 font-sans font-medium"
                />
                <div className="absolute left-3 top-2.5 text-slate-400">
                  <Icon name="search" size={14} />
                </div>
              </div>
            </div>
          </div>

          <div id="inline-matrix-board-container" className="p-4 bg-white border border-slate-100 rounded-2xl space-y-6">
            <div className="flex justify-between items-center border-b pb-2 border-slate-100">
              <div>
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">{form.zone} ZONE MATRIX REPORT</h4>
                <p className="text-[10px] text-slate-400">Date: {form.checkingDate}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">BQOS Quality Operation</span>
              </div>
            </div>

            {/* METRICS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/85 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Operators</div>
                <div className="text-lg font-black text-slate-700 mt-0.5">{dailyMatrixData.length}</div>
              </div>
              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100/50 text-center">
                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Inspected Pcs</div>
                <div className="text-lg font-black text-indigo-700 mt-0.5">
                  {dailyMatrixData.reduce((acc, r) => acc + r.totalChecked, 0)}
                </div>
              </div>
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-100/50 text-center">
                <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Defect Pcs</div>
                <div className="text-lg font-black text-rose-600 mt-0.5">
                  {dailyMatrixData.reduce((acc, r) => acc + r.totalDefects, 0)}
                </div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100/50 text-center">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Overall Defect Rate</div>
                <div className="text-lg font-black text-emerald-700 mt-0.5">
                  {(() => {
                    const tot = dailyMatrixData.reduce((acc, r) => acc + r.totalChecked, 0);
                    const def = dailyMatrixData.reduce((acc, r) => acc + r.totalDefects, 0);
                    return tot > 0 ? ((def / tot) * 100).toFixed(1) + "%" : "0.0%";
                  })()}
                </div>
              </div>
            </div>

            {filteredMatrix.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                <p className="text-xs text-slate-400 font-medium italic">No operator checks logged for the selected date and zone.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
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
                      <th className="py-3 px-4 text-right">Defect %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredMatrix.map((row, idx) => {
                      const defectRate = row.totalChecked > 0 ? ((row.totalDefects / row.totalChecked) * 100) : 0;
                      const isSelected = String(form.worker || '').toUpperCase() === String(row.worker || '').toUpperCase();
                      
                      return (
                        <tr 
                          key={idx} 
                          onClick={() => handleMatrixRowClick(row)}
                          className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                            isSelected ? 'bg-indigo-50/40 hover:bg-indigo-50/60 font-semibold' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-bold text-slate-700 flex items-center gap-2">
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
                            {row.worker}
                          </td>
                          <td className="py-3 px-2 text-slate-500 font-mono font-medium">{row.machine}</td>
                          <td className="py-3 px-2 text-slate-400 font-mono font-medium">{row.wo}</td>
                          <td className="py-3 px-2 text-slate-500 font-medium truncate max-w-[100px]" title={row.style}>{row.style || '-'}</td>
                          <td className="py-3 px-2 text-indigo-750 font-bold font-mono text-[11px]">
                            {row.size || '-'}{row.cup ? ` / ${row.cup}` : ''}
                          </td>
                          <td className="py-3 px-2 text-slate-500 font-medium truncate max-w-[80px]" title={row.color}>{row.color || '-'}</td>
                          <td className="py-3 px-2 text-slate-500 font-mono text-[10px] font-medium" title={row.checkers.join(', ')}>
                            {row.checkers.length > 0 ? row.checkers.join(', ') : '-'}
                          </td>
                          
                          {/* 8 ROUND CHECK STATUS */}
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
                                <td key={round.index} className="py-2 px-1 text-center font-sans">
                                  <span className="inline-flex flex-col items-center justify-center bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-md border border-rose-100 font-semibold text-[9px] leading-tight animate-pulse" title={`${chk} checked / ${defects} defects`}>
                                    <span>{chk}</span>
                                    <span className="text-[7px] opacity-80">🚨 {defects}</span>
                                  </span>
                                </td>
                              );
                            } else {
                              return (
                                <td key={round.index} className="py-2 px-1 text-center font-sans">
                                  <span className="inline-flex flex-col items-center justify-center bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md border border-emerald-100 font-bold text-[9px] leading-tight" title={`${chk} pieces OK`}>
                                    <span>{chk}</span>
                                    <span className="text-[7px] font-black">✓</span>
                                  </span>
                                </td>
                              );
                            }
                          })}

                          <td className="py-3 px-2 text-center font-bold text-slate-600 font-mono">{row.totalChecked}</td>
                          <td className={`py-3 px-2 text-center font-bold font-mono ${row.totalDefects > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                            {row.totalDefects}
                          </td>
                          <td className="py-3 px-4 text-right font-black font-mono">
                            <span className={`px-2 py-0.5 rounded ${
                              defectRate > 5 ? 'bg-rose-50 text-rose-600' : defectRate > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                            }`}>
                              {defectRate.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* WORKER DETAILS ACCORDION - ONLY VISIBLE IF A WORKER IS CHOSEN */}
        {form.worker && (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 animate-fade-in animate-zoom-in">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Icon name="list" size={14} className="text-emerald-600" />
                  Hourly Logs Ledger for {form.worker}
                </h4>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">Logs specifically for {form.worker} on {form.checkingDate}</p>
              </div>
              <span className="text-[10px] font-bold bg-white border px-3 py-1 rounded-full text-slate-500">
                Total Checked Rounds: {currentWorkerHistory.length} / 8
              </span>
            </div>

            {currentWorkerHistory.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No checking has been submitted for {form.worker} on the selected date yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-1">
                {currentWorkerHistory.map((report, rIdx) => {
                  const complains = Number(report.complaintPcs || report.failQty || 0);
                  return (
                    <div key={rIdx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between text-xs">
                      <div>
                        <div className="font-extrabold text-indigo-600">Round {report.round}</div>
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                          WO: #{report.workorderNumber || report.wo} • M/C: {report.machine}
                        </div>
                        {report.remarks && (
                          <div className="text-[10px] text-slate-500 italic mt-1 font-sans">
                            "{report.remarks}"
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-black text-slate-700">Checked: {report.checkedQty || report.pcsChecked || 0}</div>
                        <div className={`text-[10px] font-extrabold mt-0.5 px-1.5 py-0.5 rounded-full inline-block ${
                          complains > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {complains > 0 ? `Defects: ${complains}` : 'Clear'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InlineQuality;
