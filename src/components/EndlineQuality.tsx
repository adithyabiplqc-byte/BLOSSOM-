import React, { useState, useMemo, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { ZONES, UNITS, DEFECTS, OPERATIONS, WORKERS, MACHINES, SIZES, COLORS } from '../constants';
import Icon from './Icon';
import SearchableSelect from './SearchableSelect';

interface EndlineQualityProps {
  user: any;
  settings: any;
  workorders: any[];
  users: any[];
  triggerSuccess: (message: string) => void;
  globalZone?: string;
  onNavigate?: (newSubId: string) => void;
  refreshData?: () => void;
}

// Helpers
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
  const matches = datePartOnly.match(/\d+/g);
  if (matches && matches.length >= 3) {
    let year = 0;
    let month = 0;
    let day = 0;
    const yearIdx = matches.findIndex(m => m.length === 4);
    if (yearIdx !== -1) {
      year = parseInt(matches[yearIdx], 10);
      const remaining = matches.filter((_, idx) => idx !== yearIdx);
      if (remaining.length >= 2) {
        month = parseInt(remaining[0], 10);
        day = parseInt(remaining[1], 10);
      }
    }
    if (year > 0 && month > 0 && day > 0) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
  return s.substring(0, 10);
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

const EndlineQuality: React.FC<EndlineQualityProps> = ({ 
  user, 
  settings, 
  workorders, 
  users = [],
  triggerSuccess, 
  globalZone,
  onNavigate,
  refreshData
}) => {
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
        console.error("Failed to load zone mappings in Endline:", e);
      }
    };
    loadZoneMappings();
  }, []);

  // Retrieve settings lists with robust fallbacks
  const currentZones = useMemo(() => {
    const userZone = String(user?.zone || user?.location || '').trim().toUpperCase();
    if (user?.role !== 'ADMIN' && user?.zone !== 'COMMON' && userZone && userZone !== 'SYSTEM') {
      return [userZone];
    }
    const list = ensureArray(settings?.ZONE || settings?.ZONES, ZONES);
    return list;
  }, [settings, user]);
  const currentDefects = useMemo(() => ensureArray(settings?.DEFECTS || settings?.DEFECT, [
    'SHOULDER STRAP DAMAGE', 
    'STAIN', 
    'BROKEN STITCH', 
    'UNEVEN HEM', 
    'REJECT', 
    'LABEL MISMATCH', 
    'PUCKERING'
  ]), [settings]);
  const currentOperations = useMemo(() => ensureArray(settings?.OPERATION || settings?.OPERATIONS, [
    'FRONT ATTACH', 
    'SHOULDER JOIN', 
    'HEMMING', 
    'BACK CLOSURE', 
    'STRAP ASSEMBLY'
  ]), [settings]);
  const currentMachines = useMemo(() => ensureArray(settings?.MACHINE || settings?.MACHINES, [
    'SNLS', 
    'OVERLOCK', 
    'FLATLOCK', 
    'ZIGZAG'
  ]), [settings]);
  const currentLines = useMemo(() => ensureArray(settings?.LINE || settings?.LINES, ['1', '2', '3', '4', '5']), [settings]);
  const currentCupSizes = useMemo(() => ensureArray(settings?.CUPSIZE || settings?.CUPSIZES, ['A', 'B', 'C', 'D', 'E', 'F']), [settings]);
  const currentSizes = useMemo(() => ensureArray(settings?.SIZE || settings?.SIZES, ['28', '30', '32', '34', '36', '38', '40', '42', '44']), [settings]);
  const currentColors = useMemo(() => ensureArray(settings?.COLORS || settings?.COLOR || settings?.COLOURS || settings?.COLOUR, COLORS), [settings]);

  // Form State
  const [form, setForm] = useState({ 
    zone: '', 
    wo: '', 
    color: '',
    size: '',
    unit: '',
    cupsize: '',
    line: '3',
    remarks: ''
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
      list = ensureArray(settings?.UNIT || settings?.UNITS || settings?.UNIT_NAME, UNITS);
    }
    return Array.from(new Set(['COMMON', ...list])).map(u => String(u).toUpperCase());
  }, [settings, zoneMappings, form.zone, user]);

  useEffect(() => {
    if (currentUnits.length === 1 && form.unit !== currentUnits[0]) {
      setForm(prev => ({ ...prev, unit: currentUnits[0] }));
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
    
    // 3. Fallback to defaults if absolutely no mapped workers found
    if (combined.size === 0) {
      const defaults = ensureArray(settings?.WORKERS || settings?.WORKER, [
        'MADAMS', 
        'PRATHEEASHA', 
        'VIMAL', 
        'SOPHIYA', 
        'AMBILI', 
        'DEEPA', 
        'SREEJITH'
      ]);
      defaults.forEach(w => {
        if (w && typeof w === 'string' && w.trim()) {
          combined.add(w.trim());
        }
      });
    }

    return Array.from(combined).sort((a, b) => a.localeCompare(b));
  }, [settings, zoneMappings, form.zone, form.unit]);

  const [activeInspector, setActiveInspector] = useState(user?.username || 'user1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [endlineRecords, setEndlineRecords] = useState<any[]>([]);

  // 10pcs Bundle State (Defect counter)
  const [defectCount, setDefectCount] = useState<number>(0);
  const [defectItems, setDefectItems] = useState<any[]>([]);

  // Local/synced rework board queue state
  const [reworkQueue, setReworkQueue] = useState<any[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  // Initialize dropdown specifications
  useEffect(() => {
    const defaultZone = globalZone && globalZone !== 'ALL' ? globalZone : (currentZones[0] || '');
    const defaultUnit = currentUnits[0] || 'MUVATTUPUZHA';
    const defaultCupSize = currentCupSizes[4] || 'E'; // Match image default 'E' if available
    const defaultSize = currentSizes[7] || '42';      // Match image default '42' if available
    const defaultColor = currentColors[0] || 'WHITE';

    setForm(prev => ({
      ...prev,
      zone: (globalZone && globalZone !== 'ALL') ? globalZone : (prev.zone && currentZones.includes(prev.zone) ? prev.zone : defaultZone),
      unit: prev.unit || defaultUnit,
      size: prev.size || defaultSize,
      cupsize: prev.cupsize || defaultCupSize,
      color: prev.color || defaultColor
    }));
  }, [globalZone, currentZones, currentUnits, currentCupSizes, currentSizes, currentColors, form.zone]);

  // Set initial inspector matching login user
  useEffect(() => {
    if (user?.username) {
      setActiveInspector(user.username);
    }
  }, [user]);

  // Fetch zone logs for stats & completeness queries
  const fetchEndlineRecords = async () => {
    if (!form.zone) return;
    try {
      const data = await api.run('api_getEndlineData', { zone: form.zone }) as any[];
      if (Array.isArray(data)) {
        setEndlineRecords(data);
      }
    } catch (e) {
      console.error("Failed to load endline log database:", e);
    }
  };

  useEffect(() => {
    fetchEndlineRecords();
  }, [form.zone]);

  // Derive chosen workorder record
  const selectedWO = useMemo(() => {
    return workorders.find(w => String(w.workorderNumber) === String(form.wo));
  }, [workorders, form.wo]);

  // Track previous workorder to only pre-fill on actual switch
  const prevWoRef = useRef<string>('');

  // Dynamic pre-fills from selected workorder spec (runs only on form.wo switch to prevent resetting user selections)
  useEffect(() => {
    if (form.wo && form.wo !== prevWoRef.current) {
      prevWoRef.current = form.wo;
      if (selectedWO) {
        setForm(prev => ({
          ...prev,
          color: selectedWO.colour || selectedWO.color || (currentColors[0] || 'BLACK'),
          size: selectedWO.size || selectedWO.SIZE || (currentSizes[0] || '42'),
          cupsize: selectedWO.cupsize || selectedWO.CUPSIZE || (currentCupSizes[0] || 'E'),
          line: selectedWO.line || selectedWO.LINE || prev.line || '3',
          unit: selectedWO.unit || selectedWO.UNIT || selectedWO.location || prev.unit || 'MUVATTUPUZHA'
        }));
      }
    } else if (!form.wo) {
      prevWoRef.current = '';
    }
  }, [form.wo, selectedWO, currentCupSizes, currentSizes, currentColors]);

  // Computed metrics
  const totalQuantity = Number(selectedWO?.quantity || 0);

  const passedSoFar = useMemo(() => {
    if (!form.wo) return 0;
    return endlineRecords
      .filter(r => String(r.wo || r.workorderNumber) === String(form.wo))
      .reduce((sum, r) => sum + (Number(r.passQty) || 0), 0);
  }, [endlineRecords, form.wo]);

  const checkedSoFar = useMemo(() => {
    if (!form.wo) return 0;
    return endlineRecords
      .filter(r => String(r.wo || r.workorderNumber) === String(form.wo))
      .filter(r => {
        const isResolution = r.remarks && r.remarks.includes("Rework pieces declared as:");
        const isResId = r.id && String(r.id).startsWith("endline_rework_resolution_");
        return !isResolution && !isResId;
      })
      .reduce((sum, r) => {
        const valStr = r.checkedQty !== undefined ? r.checkedQty : r.passQty;
        return sum + (Number(valStr) || 0);
      }, 0);
  }, [endlineRecords, form.wo]);

  const openQuantity = useMemo(() => {
    return Math.max(0, totalQuantity - checkedSoFar);
  }, [totalQuantity, checkedSoFar]);

  const nextBundleNo = useMemo(() => {
    if (!form.wo) return 'B1';
    const count = endlineRecords.filter(r => String(r.wo || r.workorderNumber) === String(form.wo)).length;
    return `B${count + 1}`;
  }, [endlineRecords, form.wo]);

  // Local storage backup for active reworks
  useEffect(() => {
    if (form.wo) {
      localStorage.setItem(`bqos_rework_queue_${form.wo}`, JSON.stringify(reworkQueue));
    }
  }, [reworkQueue, form.wo]);

  useEffect(() => {
    if (form.wo) {
      const stored = localStorage.getItem(`bqos_rework_queue_${form.wo}`);
      if (stored) {
        try {
          setReworkQueue(JSON.parse(stored));
        } catch (e) {
          setReworkQueue([]);
        }
      } else {
        setReworkQueue([]);
      }
    } else {
      setReworkQueue([]);
    }
    setLocalError(null);
    setDefectCount(0);
    setDefectItems([]);
  }, [form.wo]);

  // Handle auto-clear of completed or closed workorders from dropdown selection
  useEffect(() => {
    if (form.wo) {
      const activeWO = workorders.find(w => String(w.workorderNumber) === String(form.wo));
      if (activeWO) {
        const targetQty = Number(activeWO.quantity || activeWO.orderQty || 0);
        const passedQty = endlineRecords
          .filter(r => String(r.wo || r.workorderNumber) === String(form.wo))
          .reduce((sum, r) => sum + (Number(r.passQty) || 0), 0);
        
        const statusUpper = String(activeWO.status || '').toUpperCase();
        const isClosed = ['AQL', 'FINAL', 'COMPLETED', 'CLOSED'].includes(statusUpper) || (targetQty > 0 && passedQty >= targetQty);

        if (isClosed) {
          setForm(prev => ({ ...prev, wo: '' }));
        }
      }
    }
  }, [endlineRecords, workorders, form.wo]);

  // Manage custom configurations for each defect unit
  useEffect(() => {
    // If defectCount is 10 (Bundle Rework), we only need 1 defect item to let them select details once
    const targetLength = defectCount === 10 ? 1 : defectCount;

    if (targetLength > defectItems.length) {
      const needed = targetLength - defectItems.length;
      const added = Array.from({ length: needed }).map(() => ({
        id: 'def_' + Math.random().toString(36).substr(2, 4),
        worker: currentWorkers[0] || 'MADAMS',
        operation: currentOperations[0] || 'FRONT ATTACH',
        defect: currentDefects[0] || 'SHOULDER STRAP DAMAGE',
        machine: currentMachines[0] || 'SNLS'
      }));
      setDefectItems(prev => [...prev, ...added]);
    } else if (targetLength < defectItems.length) {
      setDefectItems(prev => prev.slice(0, targetLength));
    }
  }, [defectCount, currentWorkers, currentOperations, currentDefects, currentMachines]);

  // Sync existing defect items' workers when currentWorkers changes
  useEffect(() => {
    if (currentWorkers.length > 0) {
      setDefectItems(prev => {
        const updated = prev.map(item => {
          if (!currentWorkers.includes(item.worker)) {
            return { ...item, worker: currentWorkers[0] };
          }
          return item;
        });
        if (JSON.stringify(updated) !== JSON.stringify(prev)) {
          return updated;
        }
        return prev;
      });
    }
  }, [currentWorkers]);

  // Duplicate settings helper that duplicates selected defect item, inserts it below, and increments defectCount
  const handleDuplicateDefectItem = (index: number) => {
    if (defectCount >= 10) return;
    const sourceItem = defectItems[index];
    if (!sourceItem) return;

    const newItem = {
      ...sourceItem,
      id: 'def_' + Math.random().toString(36).substr(2, 4)
    };

    const updatedItems = [...defectItems];
    updatedItems.splice(index + 1, 0, newItem);

    setDefectItems(updatedItems);
    setDefectCount(prev => prev + 1);
  };

  const handleDefectItemChange = (index: number, key: string, value: string) => {
    const items = [...defectItems];
    items[index] = {
      ...items[index],
      [key]: value
    };
    setDefectItems(items);
  };

  const todayDateStr = getTodayDateString();
  const inspectorTodayStats = useMemo(() => {
    const todayRecords = endlineRecords.filter(r => {
      const itemDate = r.timestamp || r.checkingDate;
      return normalizeDateToYYYYMMDD(itemDate) === todayDateStr && 
             String(r.inspector || 'SYSTEM').toUpperCase().trim() === String(activeInspector).toUpperCase().trim();
    });

    const total = todayRecords.reduce((sum, r) => sum + (Number(r.checkedQty) || 0), 0);
    const pass = todayRecords.reduce((sum, r) => sum + (Number(r.passQty) || 0), 0);
    
    // Rework count: Reworks created minus reworks resolved today
    const reworkCreated = todayRecords.reduce((sum, r) => sum + (Number(r.reworkQty) || 0), 0);
    const reworkResolved = todayRecords.reduce((sum, r) => {
      const isRes = (Number(r.reworkQty) || 0) === 0 && r.worker && (Number(r.passQty) > 0 || Number(r.failQty) > 0);
      return sum + (isRes ? 1 : 0);
    }, 0);
    const rework = Math.max(0, reworkCreated - reworkResolved);

    const fail = todayRecords.reduce((sum, r) => sum + (Number(r.failQty) || 0), 0);

    return { total, pass, rework, fail };
  }, [endlineRecords, todayDateStr, activeInspector]);

  // Route to AQL when fully completed
  const checkAndTriggerAQLTransition = async (addedPassQty: number) => {
    const totalQty = Number(selectedWO?.quantity || selectedWO?.orderQty || 0);
    const newPassedTotal = passedSoFar + addedPassQty;
    if (totalQty > 0 && newPassedTotal >= totalQty) {
      setIsSubmitting(true);
      try {
        if (refreshData) {
          refreshData();
        }
        if (onNavigate) {
          triggerSuccess("WORKORDER FULLY PASSED FROM ENDLINE! NAVIGATION TO AQL INSTATED.");
          onNavigate('A5');
        } else {
          triggerSuccess("WORKORDER FULLY PASSED TO AQL.");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSubmitting(false);
      }
      return true;
    }
    return false;
  };

  // Submit Bundle is the primary driver
  const handleFinalBundleSubmit = async () => {
    // Explicit comprehensive validation for all boxes, dropboxes, date selection and remarks
    if (!form.zone) {
      setLocalError("Please select a Zone.");
      return;
    }
    if (!form.wo) {
      setLocalError("Please select a Workorder.");
      return;
    }
    if (!form.unit) {
      setLocalError("Please select a Unit.");
      return;
    }
    if (!form.line) {
      setLocalError("Please select a Line.");
      return;
    }
    if (!form.color) {
      setLocalError("Please select a Color.");
      return;
    }
    if (!form.size) {
      setLocalError("Please select a Size.");
      return;
    }
    if (!form.cupsize) {
      setLocalError("Please select a Cup size.");
      return;
    }

    if (defectCount > 0) {
      const targetLength = defectCount === 10 ? 1 : defectCount;
      for (let i = 0; i < targetLength; i++) {
        const item = defectItems[i];
        if (!item || !item.worker) {
          setLocalError(`Please select a Worker for defect row ${i + 1}.`);
          return;
        }
        if (!item.operation) {
          setLocalError(`Please select an Operation for defect row ${i + 1}.`);
          return;
        }
        if (!item.defect) {
          setLocalError(`Please select a Defect type for defect row ${i + 1}.`);
          return;
        }
        if (!item.machine) {
          setLocalError(`Please select a Machine for defect row ${i + 1}.`);
          return;
        }
      }
    }

    setLocalError(null);
    setIsSubmitting(true);

    const activeBundleNo = nextBundleNo;
    const D = defectCount;
    const passQty = 10 - D;

    const totalQty = Number(selectedWO?.quantity || selectedWO?.orderQty || 0);
    const isFullyPassed = totalQty > 0 && (passedSoFar + passQty) >= totalQty;

    try {
      const savePromises = [];
      const optimisticRecords = [];

      // 1. Log Passed part of the bundle
      if (passQty > 0) {
        const passPayload = {
          id: 'endline_bpass_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          zone: form.zone,
          wo: form.wo,
          workorderNumber: form.wo,
          style: selectedWO?.style || selectedWO?.STYLE_NAME || '',
          color: form.color,
          size: form.size,
          cupsize: form.cupsize,
          line: form.line,
          unit: form.unit,
          bundleNo: activeBundleNo,
          checkedQty: String(passQty),
          passQty: String(passQty),
          reworkQty: '0',
          failQty: '0',
          worker: '',
          operation: '',
          defect: '',
          machine: '',
          totalQty: String(totalQuantity),
          openQty: String(Math.max(0, openQuantity - passQty)),
          remarks: form.remarks || `Passed pieces from Bundle ${activeBundleNo}`,
          inspector: activeInspector,
          timestamp: new Date().toISOString(),
          moveToAQL: isFullyPassed
        };
        savePromises.push(api.run('api_saveENDLINEQUALITY', passPayload));
        optimisticRecords.push(passPayload);
      }

      // 2. Log Defective parts and feed to Queue
      const queueItemsToAdd: any[] = [];
      for (let i = 0; i < D; i++) {
        const item = defectCount === 10 ? defectItems[0] : defectItems[i];
        if (!item) continue;
        const defectPayload = {
          id: 'endline_bdefect_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2, 4),
          zone: form.zone,
          wo: form.wo,
          workorderNumber: form.wo,
          style: selectedWO?.style || selectedWO?.STYLE_NAME || '',
          color: form.color,
          size: form.size,
          cupsize: form.cupsize,
          line: form.line,
          unit: form.unit,
          bundleNo: activeBundleNo,
          checkedQty: '1',
          passQty: '0',
          reworkQty: '1',
          failQty: '0',
          worker: item.worker,
          operation: item.operation,
          defect: item.defect,
          machine: item.machine,
          totalQty: String(totalQuantity),
          openQty: String(openQuantity),
          remarks: `Rework queued: ${item.defect} assigned to ${item.worker}`,
          inspector: activeInspector,
          timestamp: new Date().toISOString(),
          moveToAQL: false
        };

        savePromises.push(api.run('api_saveENDLINEQUALITY', defectPayload));
        optimisticRecords.push(defectPayload);

        queueItemsToAdd.push({
          id: 'rework_unit_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2, 4),
          worker: item.worker,
          operation: item.operation,
          defect: item.defect,
          machine: item.machine,
          line: form.line,
          size: form.size,
          cupsize: form.cupsize,
          unit: form.unit,
          bundleNo: activeBundleNo,
          style: selectedWO?.style || selectedWO?.STYLE_NAME || selectedWO?.workorderNumber || form.wo,
          timestamp: new Date().toISOString()
        });
      }

      // Optimistically push all records to local list first to update counters IMMEDIATELY other than waiting for roundtrips
      setEndlineRecords(prev => [...prev, ...optimisticRecords]);

      // Sync and reset local bundle checkers in parallel
      setReworkQueue(prev => [...prev, ...queueItemsToAdd]);
      setDefectCount(0);
      setDefectItems([]);

      await Promise.all(savePromises);

      const redirected = await checkAndTriggerAQLTransition(passQty);
      if (!redirected) {
        triggerSuccess(`BUNDLE ${activeBundleNo} COMMITTED: ${passQty} PASS WITH ${D} REWORKS ADDED!`);
        fetchEndlineRecords();
      }
    } catch (e) {
      console.error(e);
      setLocalError("Failed to synchronize final bundle elements.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resolve rework item
  const handleDeclareReworkVerdict = async (id: string, verdict: 'PASS' | 'FAIL') => {
    const targetItem = reworkQueue.find(r => r.id === id);
    if (!targetItem) return;

    setIsSubmitting(true);
    setLocalError(null);

    const activeBundleNo = targetItem.bundleNo || nextBundleNo;
    const totalQty = Number(selectedWO?.quantity || selectedWO?.orderQty || 0);
    const passDelta = verdict === 'PASS' ? 1 : 0;
    const isFullyPassed = totalQty > 0 && (passedSoFar + passDelta) >= totalQty;

    try {
      const payload = {
        id: 'endline_rework_resolution_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        zone: form.zone,
        wo: form.wo,
        workorderNumber: form.wo,
        style: selectedWO?.style || selectedWO?.STYLE_NAME || '',
        color: form.color,
        size: targetItem.size,
        cupsize: targetItem.cupsize,
        line: targetItem.line,
        unit: targetItem.unit,
        bundleNo: activeBundleNo,
        checkedQty: '0',
        passQty: verdict === 'PASS' ? '1' : '0',
        reworkQty: '0',
        failQty: verdict === 'FAIL' ? '1' : '0',
        worker: targetItem.worker,
        operation: targetItem.operation,
        defect: targetItem.defect,
        machine: targetItem.machine,
        remarks: `Rework pieces declared as: ${verdict}`,
        inspector: activeInspector,
        timestamp: new Date().toISOString(),
        moveToAQL: isFullyPassed
      };

      // Optimistically add to state to make counter and UI refresh instant!
      setEndlineRecords(prev => [...prev, payload]);
      setReworkQueue(prev => prev.filter(item => item.id !== id));

      await api.run('api_saveENDLINEQUALITY', payload);

      const redirected = await checkAndTriggerAQLTransition(passDelta);
      if (!redirected) {
        triggerSuccess(`REWORK PIECE DECLARED SUCCESSFULLY AS: ${verdict}`);
        fetchEndlineRecords();
      }
    } catch (err) {
      console.error(err);
      setLocalError("Failed to update corrective rework verdict.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in text-slate-800 font-sans pb-12">
      
      {/* 1. STATS BANNER: Today: 10 | Pass: 9 | Rework: 1 | Fail: 0 */}
      <div className="bg-[#EAF0F2] rounded-2xl py-4 px-6 text-center font-bold text-sm text-slate-705 tracking-wide shadow-sm flex flex-col md:flex-row justify-between items-center gap-2 border border-slate-300">
        <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-500">QC inspector dashboard stats</span>
        <div className="flex gap-4 md:gap-8 text-xs md:text-sm font-semibold">
          <div>Today: <span className="text-slate-900 font-black">{inspectorTodayStats.total}</span></div>
          <div className="h-4 w-[1px] bg-slate-300"></div>
          <div>Pass: <span className="text-emerald-600 font-black">{inspectorTodayStats.pass}</span></div>
          <div className="h-4 w-[1px] bg-slate-300"></div>
          <div>Rework: <span className="text-amber-600 font-black">{inspectorTodayStats.rework}</span></div>
          <div className="h-4 w-[1px] bg-slate-300"></div>
          <div>Fail: <span className="text-rose-600 font-black">{inspectorTodayStats.fail}</span></div>
        </div>
      </div>

      {localError && (
        <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl text-rose-800 text-xs font-semibold text-center animate-shake">
          {localError}
        </div>
      )}

      {/* 2. PREMIUM HORIZONTAL SELECTORS GRID */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5 pl-0.5">
            <Icon name="sliders" size={14} className="text-indigo-600" />
            Parameter Selection
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          
          {/* Dropdown 3: Unit */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block pl-0.5 text-left">
              Unit / Location
            </label>
            <SearchableSelect
              value={form.unit}
              onChange={e => setForm({ ...form, unit: e.target.value })}
              className="w-full bg-white border border-slate-200 transition-colors duration-150 text-slate-800 text-xs font-bold rounded-xl py-2.5 px-3 shadow-sm focus:outline-none focus:border-indigo-500 cursor-pointer hover:bg-slate-50"
            >
              <option value="">Select Location...</option>
              {currentUnits.map((u: string) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </SearchableSelect>
          </div>

          {/* Dropdown 4: Active Workorder / STYLE Spec */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block pl-0.5 text-left">
              Active Job / Style
            </label>
            <SearchableSelect
              value={form.wo}
              onChange={e => setForm({ ...form, wo: e.target.value })}
              className="w-full bg-white border border-slate-200 transition-colors duration-150 text-slate-800 text-xs font-bold rounded-xl py-2.5 px-3 shadow-sm focus:outline-none focus:border-indigo-500 cursor-pointer hover:bg-slate-50"
            >
              <option value="">Select Job...</option>
              {workorders
                .filter(w => {
                  const wZone = String(w.zone || w.location || '').toUpperCase().trim();
                  const fZone = String(form.zone).toUpperCase().trim();
                  let matchesZone = wZone === fZone || fZone === '' || fZone === 'ALL';
                  if (!matchesZone && zoneMappings.length > 0 && fZone !== '') {
                    const matchingRows = zoneMappings.filter(m => 
                      String(m.zone || '').toUpperCase().trim() === fZone || 
                      String(m.id || '').toUpperCase().trim() === fZone
                    );
                    matchesZone = matchingRows.some(m => 
                      String(m.zone || '').toUpperCase().trim() === wZone || 
                      String(m.id || '').toUpperCase().trim() === wZone
                    );
                  }
                  if (!matchesZone) return false;

                  const statusUpper = normalizeStatus(w.status);
                  if (
                    statusUpper !== 'ENDLINE' && 
                    statusUpper !== 'INLINEANDENDLINE' && 
                    statusUpper !== 'INLINE' &&
                    statusUpper !== 'PRECUTTINGPASSANDHOLD' &&
                    statusUpper !== 'CUTTINGPASSANDHOLD' &&
                    statusUpper !== 'PASSANDHOLD' && 
                    !statusUpper.includes('HOLD')
                  ) {
                    return false;
                  }

                  const targetQty = Number(w.quantity || w.orderQty || 0);
                  const passedQty = endlineRecords
                    .filter(r => String(r.wo || r.workorderNumber) === String(w.workorderNumber))
                    .reduce((sum, r) => sum + (Number(r.passQty) || 0), 0);

                  if (targetQty > 0 && passedQty >= targetQty) {
                    return false;
                  }

                  return true;
                })
                .map(w => (
                  <option key={w.id || w.workorderNumber} value={w.workorderNumber}>
                    {w.workorderNumber} ({w.style || w.styleName || w.itemName || w.item || 'N/A'})
                  </option>
                ))}
            </SearchableSelect>
          </div>

          {/* Dropdown 4b: Colour Specifications Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-indigo-500 uppercase tracking-wider block pl-0.5 text-left font-bold">
              Select Colour
            </label>
            <SearchableSelect
              value={form.color}
              onChange={e => setForm({ ...form, color: e.target.value })}
              className="w-full bg-white border-2 border-indigo-150 transition-colors duration-150 text-slate-800 text-xs font-bold rounded-xl py-2 px-3 shadow-sm focus:outline-none focus:border-indigo-500 cursor-pointer hover:bg-slate-50"
            >
              <option value="">Select Color...</option>
              {currentColors.map((c: string) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SearchableSelect>
          </div>

          {/* Dropdown 5: Line Reference */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block pl-0.5 text-left">
              Line Code
            </label>
            <SearchableSelect
              value={form.line}
              onChange={e => setForm({ ...form, line: e.target.value })}
              align="right"
              className="w-full bg-white border border-slate-200 transition-colors duration-150 text-slate-800 text-xs font-bold rounded-xl py-2.5 px-3 shadow-sm focus:outline-none focus:border-indigo-500 cursor-pointer hover:bg-slate-50"
            >
              {currentLines.map((l: string) => (
                <option key={l} value={l}>
                  Line {l}
                </option>
              ))}
            </SearchableSelect>
          </div>

          {/* Dropdown 6: Cup Category */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block pl-0.5 text-left">
              Cup Category
            </label>
            <SearchableSelect
              value={form.cupsize}
              onChange={e => setForm({ ...form, cupsize: e.target.value })}
              align="right"
              className="w-full bg-white border border-slate-200 transition-colors duration-150 text-slate-800 text-xs font-bold rounded-xl py-2.5 px-3 shadow-sm focus:outline-none focus:border-indigo-500 cursor-pointer hover:bg-slate-50"
            >
              {currentCupSizes.map((c: string) => (
                <option key={c} value={c}>
                  Cup {c}
                </option>
              ))}
            </SearchableSelect>
          </div>

          {/* Dropdown 7: Size */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block pl-0.5 text-left">
              Garment Size
            </label>
            <SearchableSelect
              value={form.size}
              onChange={e => setForm({ ...form, size: e.target.value })}
              align="right"
              className="w-full bg-white border border-slate-200 transition-colors duration-150 text-slate-800 text-xs font-bold rounded-xl py-2.5 px-3 shadow-sm focus:outline-none focus:border-indigo-500 cursor-pointer hover:bg-slate-50"
            >
              {currentSizes.map((s: string) => (
                <option key={s} value={s}>
                  Size {s}
                </option>
              ))}
            </SearchableSelect>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENTS PANELS split grids for desktop system rendering */}
      {selectedWO ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: specification summary and active rework queue */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-6">
            
            {/* WORKORDER DETAILS DISPLAY PANEL */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center bg-slate-50 px-4 py-2 border-b border-slate-100 rounded-xl">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Selected Job Profile</span>
                <span className="font-mono bg-indigo-50 text-indigo-700 font-extrabold text-[11px] px-2.5 py-0.5 rounded-lg border border-indigo-150">
                  {selectedWO.workorderNumber}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-medium text-slate-600 bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200">
                <div>Style Name: <span className="font-black text-slate-800 tracking-tight block text-sm mt-0.5">{selectedWO.style || selectedWO.STYLE_NAME || 'N/A'}</span></div>
                <div>Color Spec: <span className="font-black text-slate-800 tracking-tight block text-sm mt-0.5">{form.color || selectedWO.colour || selectedWO.color || 'N/A'}</span></div>
                <div>Size Range: <span className="font-black text-slate-800 tracking-tight block text-sm mt-0.5">{selectedWO.size || selectedWO.SIZE || 'N/A'}</span></div>
                <div>Cup Category: <span className="font-black text-slate-800 tracking-tight block text-sm mt-0.5">{selectedWO.cup || selectedWO.cupsize || selectedWO.CUPSIZE || '-'}</span></div>
              </div>

              {/* Progress Gauges */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-center">
                  <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Full Target</div>
                  <div className="font-mono font-black text-base mt-0.5 text-slate-800">{totalQuantity}</div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center">
                  <div className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Checked</div>
                  <div className="font-mono font-black text-base mt-0.5 text-emerald-700">{checkedSoFar}</div>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-center">
                  <div className="text-[8px] font-bold text-amber-500 uppercase tracking-widest">Open Remaining</div>
                  <div className="font-mono font-black text-base mt-0.5 text-amber-700">{openQuantity}</div>
                </div>
              </div>

              {/* Visual meter */}
              <div className="space-y-1 pl-0.5">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
                  <span>Batch completeness</span>
                  <span>{totalQuantity > 0 ? Math.round((checkedSoFar / totalQuantity) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-indigo-500 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${totalQuantity > 0 ? Math.min(100, (checkedSoFar / totalQuantity) * 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* REWORK QUEUE INTEGRATED SIDEBAR SECTION */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-2 border-slate-150">
                <h3 className="font-extrabold text-[13px] text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pl-0.5">
                  <Icon name="activity" size={14} className="text-amber-500" />
                  Rework Queue
                </h3>
                {reworkQueue.length > 0 && (
                  <span className="font-mono text-[10px] font-black bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-lg border border-amber-200">
                    {reworkQueue.length} PENDING
                  </span>
                )}
              </div>

              {reworkQueue.length > 0 ? (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {reworkQueue.map((item, idx) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between gap-4 py-3 px-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-350 transition-all animate-zoom-in text-left"
                    >
                      <div className="flex-1 min-w-0 pr-1">
                        <p className="font-extrabold text-slate-805 text-xs truncate">
                          [{idx + 1}] <span className="text-[#2C3E50] uppercase font-black">{item.worker}</span>
                          {' '}-{' '}
                          <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">{item.defect}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                          Style: <span className="bg-indigo-50 text-indigo-700 px-1 rounded font-bold">{item.style || selectedWO?.style || selectedWO?.STYLE_NAME || 'N/A'}</span> • Size: <span className="font-semibold text-slate-700">{item.size}{item.cupsize}</span> • Line: {item.line}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button 
                          type="button"
                          onClick={() => handleDeclareReworkVerdict(item.id, 'PASS')}
                          disabled={isSubmitting}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform"
                        >
                          Pass
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDeclareReworkVerdict(item.id, 'FAIL')}
                          disabled={isSubmitting}
                          className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform"
                        >
                          Fail
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  No active items pending in the corrective rework board
                </p>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: verification bundle controllers console */}
          <div className="lg:col-span-12 xl:col-span-7 bg-white p-5 rounded-2xl border border-slate-205 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 pl-0.5">
                <Icon name="check-square" size={15} className="text-emerald-500" />
                Bundle Verification Control Box
              </h3>
            </div>

            <div className="space-y-4">
              
              {/* 3. green PASS block (static layout, based on defectCount) */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block pl-0.5 font-bold">Passed pieces status</span>
                <div
                  className="w-full py-4 bg-[#4CAF50] text-white rounded-xl font-black text-sm tracking-widest text-center select-none shadow-sm flex items-center justify-center gap-2"
                >
                  <Icon name="check" size={16} />
                  PASS ({10 - defectCount} PCS)
                </div>
              </div>

              {/* 4. orange ADD DEFECT block (reactive counter) */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block pl-0.5">Flag defects in bundle</span>
                <div className="w-full bg-[#FF9800] text-white rounded-xl py-3 px-4 flex items-center justify-between shadow-sm select-none font-bold">
                  <span className="font-extrabold text-xs uppercase tracking-wider pl-1 flex items-center gap-1.5">
                    <Icon name="alert-triangle" size={14} />
                    ADD DEFECTIVE PIECES
                  </span>
                  <div className="flex items-center gap-5 bg-[#E68A00] px-3.5 py-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setDefectCount(prev => Math.max(0, prev - 1))}
                      disabled={isSubmitting || defectCount === 0}
                      className="font-black text-lg hover:scale-125 transition-transform px-1.5 focus:outline-none disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="font-mono font-black text-base min-w-[14px] text-center">
                      {defectCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDefectCount(prev => Math.min(10, prev + 1))}
                      disabled={isSubmitting || defectCount >= 10}
                      className="font-black text-lg hover:scale-125 transition-transform px-1.5 focus:outline-none disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* DYNAMIC INDIVIDUAL DEFECT ENTRY CARDS */}
              {defectCount > 0 && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center pl-0.5">
                    <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest leading-none">
                      Staged Defect Details ({defectCount === 10 ? "Full Bundle" : `${defectCount} Pieces`})
                    </h4>
                    <button
                      type="button"
                      onClick={() => setDefectCount(0)}
                      className="text-rose-600 hover:text-rose-700 font-extrabold text-[10px] uppercase flex items-center gap-1 transition-colors cursor-pointer"
                      title="Remove core bundle rework details"
                    >
                      <Icon name="trash-2" size={12} />
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                    {defectItems.map((item, idx) => (
                      <div 
                        key={item.id} 
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3.5 relative hover:border-slate-350 transition-all text-left"
                      >
                        <div className="flex items-center justify-between border-b pb-1.5 border-slate-100">
                          <span className="font-black text-[11px] text-slate-800 uppercase tracking-wider">
                            {defectCount === 10 ? "Full Bundle Rework (10 Pieces)" : `PCS Defect-${idx + 1}`}
                          </span>
                          
                          {defectCount < 10 && (
                            <button
                              type="button"
                              onClick={() => handleDuplicateDefectItem(idx)}
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border border-indigo-150 transition-colors flex items-center gap-1 shadow-sm cursor-pointer shrink-0"
                            >
                              <Icon name="copy" size={10} />
                              DUP
                            </button>
                          )}
                        </div>

                        {/* Defect Piece Specifications */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase block pl-0.5">operator</label>
                            <SearchableSelect
                              value={item.worker}
                              onChange={e => handleDefectItemChange(idx, 'worker', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs text-slate-700 outline-none hover:border-slate-300 font-bold cursor-pointer"
                            >
                              {currentWorkers.map((w: string) => <option key={w} value={w}>{w}</option>)}
                            </SearchableSelect>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase block pl-0.5">operation</label>
                            <SearchableSelect
                              value={item.operation}
                              onChange={e => handleDefectItemChange(idx, 'operation', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs text-slate-700 outline-none hover:border-slate-300 font-bold cursor-pointer"
                            >
                              {currentOperations.map((op: string) => <option key={op} value={op}>{op}</option>)}
                            </SearchableSelect>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase block pl-0.5">defect description</label>
                            <SearchableSelect
                              value={item.defect}
                              onChange={e => handleDefectItemChange(idx, 'defect', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs text-slate-700 outline-none hover:border-slate-300 font-bold cursor-pointer"
                            >
                              {currentDefects.map((df: string) => <option key={df} value={df}>{df}</option>)}
                            </SearchableSelect>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase block pl-0.5">machine reference</label>
                            <SearchableSelect
                              value={item.machine}
                              onChange={e => handleDefectItemChange(idx, 'machine', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs text-slate-700 outline-none hover:border-slate-300 font-bold cursor-pointer"
                            >
                              {currentMachines.map((m: string) => <option key={m} value={m}>{m}</option>)}
                            </SearchableSelect>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cancel / Clear staged bundle rework details block with trash icon at bottom */}
                  <div className="pt-2 border-t border-slate-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setDefectCount(0)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-150 shadow-sm"
                    >
                      <Icon name="trash-2" size={13} className="text-rose-500" />
                      DELETE BUNDLE REWORK
                    </button>
                  </div>
                </div>
              )}

              {/* ACTION SUBMIT BLOCK (Stacked vertical rows as requested for full length buttons) */}
              <div className="flex flex-col gap-3 pt-2">
                
                {/* FINAL BUNDLE SUBMIT */}
                <button
                  type="button"
                  onClick={handleFinalBundleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#2C3E50] hover:bg-[#1A252F] active:translate-y-0.5 text-white rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow transition-all text-center focus:outline-none disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Icon name="refresh-cw" className="animate-spin" size={16} />
                  ) : (
                    <>
                      <Icon name="check-circle" size={15} />
                      FINAL BUNDLE SUBMIT
                    </>
                  )}
                </button>

                {/* Bundle Rework (10 pcs) block */}
                <button
                  type="button"
                  onClick={() => setDefectCount(10)}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#E53E3E] hover:bg-[#C53030] active:translate-y-0.5 text-white rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow transition-all text-center focus:outline-none disabled:opacity-50 cursor-pointer"
                >
                  <Icon name="rotate-ccw" size={15} />
                  Bundle Rework (10 pcs)
                </button>
                
              </div>

            </div>
          </div>

        </div>
      ) : (
        <div className="p-12 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-250 text-[#D97706] text-center font-black uppercase text-xs tracking-wider flex flex-col justify-center items-center gap-2 shadow-sm animate-pulse">
          <Icon name="info" size={24} className="text-[#D97706]" />
          Please select an active Job Spec above to unlock verification controllers
        </div>
      )}
    </div>
  );
};

export default EndlineQuality;
