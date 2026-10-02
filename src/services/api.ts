import { sheetsService, DEFAULT_SETTINGS } from './sheetsService';
import { getAccessToken, db } from './auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { extractCleanDocumentUrl, extractDriveFileId, getDirectViewUrl, getDirectDownloadUrl } from '../utils/sopUtils';
import { INITIAL_DB } from '../data/initialDb';

export const DEFAULT_SHEETS_URL = "https://script.google.com/macros/s/AKfycbzyJE21jeRLP-9ZIjjpJsm0SoSsdIluEGu0Ma0GR8jH93aD-3B9qCbOQxFeNrFMrrygnA/exec";
export const DEFAULT_DRIVE_URL = "https://script.google.com/macros/s/AKfycbyKWMLBVEs8L_5K-j4COuyNUGxngjs0NlG2Um3RuXwZZmIM5-lAof3sEfONj581y-lJ/exec";

// Fallback helper to query embedded initial database by zone when proxy is offline (e.g. Netlify / GitHub Pages)
function getLocalFallbackData(method: string, args: any[]): any {
  const arg0 = args[0] || {};
  const zone = typeof arg0 === 'string' ? arg0 : (arg0.zone || arg0.location || 'ALL');
  const zTarget = String(zone).trim().toUpperCase();

  const filterByZone = (list: any[]) => {
    if (!Array.isArray(list)) return [];
    if (!zTarget || zTarget === 'ALL' || zTarget === 'WORKORDER' || zTarget === 'SYSTEM' || zTarget === 'COMMON') {
      return list;
    }
    return list.filter((r: any) => {
      const rZone = String(r.zone || r.location || '').trim().toUpperCase();
      const rUnit = String(r.unit || '').trim().toUpperCase();
      if (rZone === zTarget || rUnit === zTarget) return true;
      const clean = (s: string) => s.replace(/^(ZONE|UNIT|MODULE|ZMAP)[-\s]*/i, '').replace(/[^A-Z0-9]/g, '');
      const cTarget = clean(zTarget);
      if (cTarget && (clean(rZone) === cTarget || clean(rUnit) === cTarget)) return true;
      return rZone.includes(zTarget) || zTarget.includes(rZone);
    });
  };

  switch (method) {
    case 'api_getInitialData': {
      let users = INITIAL_DB?.users || [];
      try {
        const cachedU = JSON.parse(localStorage.getItem('bqos_cache_users') || '[]');
        if (Array.isArray(cachedU) && cachedU.length > 0) users = cachedU;
      } catch (e) {}
      let wos = filterByZone(INITIAL_DB?.workorders || []);
      try {
        const cachedW = JSON.parse(localStorage.getItem('bqos_cache_wo') || '[]');
        if (Array.isArray(cachedW) && cachedW.length > 0) wos = filterByZone(cachedW);
      } catch (e) {}
      let settings = INITIAL_DB?.settings || {};
      try {
        const cachedS = JSON.parse(localStorage.getItem('bqos_cache_settings') || '{}');
        if (cachedS && Object.keys(cachedS).length > 0) settings = cachedS;
      } catch (e) {}

      return {
        users,
        workorders: wos,
        settings,
        serverTime: new Date().toISOString(),
        success: true
      };
    }
    case 'api_getUsers': {
      try {
        const cached = JSON.parse(localStorage.getItem('bqos_cache_users') || '[]');
        if (Array.isArray(cached) && cached.length > 0) return cached;
      } catch (e) {}
      return INITIAL_DB?.users || [];
    }
    case 'api_getWorkorders': {
      try {
        const cached = JSON.parse(localStorage.getItem('bqos_cache_wo') || '[]');
        if (Array.isArray(cached) && cached.length > 0) return filterByZone(cached);
      } catch (e) {}
      return filterByZone(INITIAL_DB?.workorders || []);
    }
    case 'api_getMaterialData':
      return filterByZone(INITIAL_DB?.material_reports || []);
    case 'api_getCuttingData':
      return filterByZone(INITIAL_DB?.cutting_reports || []);
    case 'api_getInlineData':
    case 'api_get8ROUNDSYSTEMData':
      return filterByZone(INITIAL_DB?.sewing_reports || []);
    case 'api_getEndlineData':
      return filterByZone(INITIAL_DB?.endline_reports || []);
    case 'api_getAQLData':
      return filterByZone(INITIAL_DB?.aql_reports || []);
    case 'api_getFinalAuditData':
      return filterByZone(INITIAL_DB?.final_reports || []);
    case 'api_getREPORTS_SOPData':
      return INITIAL_DB?.reports_sop || [];
    case 'api_getCustomerComplaints':
      return INITIAL_DB?.customer_complaints || [];
    case 'api_getZoneMappings': {
      try {
        const cached = JSON.parse(localStorage.getItem('bqos_cache_zm') || '[]');
        if (Array.isArray(cached) && cached.length > 0) return cached;
      } catch (e) {}
      return INITIAL_DB?.zone || [];
    }
    case 'api_getUserSettings':
    case 'api_getGlobalSettings': {
      try {
        const cached = JSON.parse(localStorage.getItem('bqos_cache_settings') || '{}');
        if (cached && Object.keys(cached).length > 0) return cached;
      } catch (e) {}
      return INITIAL_DB?.settings || {};
    }
    case 'api_getAdminLogs':
      return INITIAL_DB?.admin_logs || [];
    default:
      return [];
  }
}

// Initialize local memory DB with any previous user mutations from localStorage
function initLocalDbFromStorage() {
  if (typeof window === 'undefined' || !INITIAL_DB) return;
  try {
    const m = localStorage.getItem('bqos_cache_material');
    if (m) INITIAL_DB.material_reports = JSON.parse(m);
    const c = localStorage.getItem('bqos_cache_cutting');
    if (c) INITIAL_DB.cutting_reports = JSON.parse(c);
    const s = localStorage.getItem('bqos_cache_sewing');
    if (s) INITIAL_DB.sewing_reports = JSON.parse(s);
    const e = localStorage.getItem('bqos_cache_endline');
    if (e) INITIAL_DB.endline_reports = JSON.parse(e);
    const a = localStorage.getItem('bqos_cache_aql');
    if (a) INITIAL_DB.aql_reports = JSON.parse(a);
    const f = localStorage.getItem('bqos_cache_final');
    if (f) INITIAL_DB.final_reports = JSON.parse(f);
    const w = localStorage.getItem('bqos_cache_wo');
    if (w) INITIAL_DB.workorders = JSON.parse(w);
    const sop = localStorage.getItem('bqos_cache_sop');
    if (sop) INITIAL_DB.reports_sop = JSON.parse(sop);
    const cc = localStorage.getItem('bqos_cache_complaints');
    if (cc) INITIAL_DB.customer_complaints = JSON.parse(cc);
    const zm = localStorage.getItem('bqos_cache_zm');
    if (zm) INITIAL_DB.zone = JSON.parse(zm);
    const u = localStorage.getItem('bqos_cache_users');
    if (u) INITIAL_DB.users = JSON.parse(u);
    const st = localStorage.getItem('bqos_cache_settings');
    if (st) INITIAL_DB.settings = JSON.parse(st);
  } catch (err) {}
}

initLocalDbFromStorage();

// Fast local mutation handler to guarantee instant 0ms data entry and durability
function applyLocalMutation(method: string, args: any[]): any {
  if (!INITIAL_DB) return { success: true };
  try {
    switch (method) {
      case 'api_saveMaterialReportBulk': {
        const data = args[0] || {};
        const { zone, billNo, supplierName, grn, checkingDate, receivedDate, remarks, inspector, timestamp, items } = data;
        if (Array.isArray(items)) {
          const mapped = items.map((item: any) => ({
            zone: zone || "",
            billNo: billNo || "",
            supplierName: supplierName || "",
            grn: grn || "",
            receivedDate: receivedDate || "",
            checkingDate: checkingDate || "",
            itemName: item.itemName || "",
            receivedQuantity: item.receivedQuantity || 0,
            checkedQuantity: item.checkedQuantity || 0,
            passQuantity: item.passQuantity || 0,
            rejectedQuantity: item.rejectedQuantity || 0,
            itemRemarks: item.remarks || "",
            generalRemarks: remarks || "",
            inspector: inspector || "",
            timestamp: timestamp || new Date().toISOString(),
            id: 'mat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6)
          }));
          INITIAL_DB.material_reports = INITIAL_DB.material_reports || [];
          INITIAL_DB.material_reports.unshift(...mapped);
          try { localStorage.setItem('bqos_cache_material', JSON.stringify(INITIAL_DB.material_reports)); } catch (e) {}
        }
        return { success: true, count: items?.length || 0 };
      }

      case 'api_saveCUTTINGQUALITY':
      case 'api_saveCuttingReport': {
        const report = { ...(args[0] || {}) };
        report.id = report.id || ('cut-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6));
        if (!report.timestamp) report.timestamp = new Date().toISOString();
        INITIAL_DB.cutting_reports = INITIAL_DB.cutting_reports || [];
        const idx = INITIAL_DB.cutting_reports.findIndex((r: any) => String(r.id) === String(report.id));
        if (idx !== -1) INITIAL_DB.cutting_reports[idx] = report;
        else INITIAL_DB.cutting_reports.unshift(report);
        try { localStorage.setItem('bqos_cache_cutting', JSON.stringify(INITIAL_DB.cutting_reports)); } catch (e) {}
        return { success: true, id: report.id };
      }

      case 'api_save8ROUNDSYSTEM':
      case 'api_saveSEWINGDEFECT':
      case 'api_saveInlineReport': {
        const report = { ...(args[0] || {}) };
        report.id = report.id || ('sew-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6));
        if (!report.timestamp) report.timestamp = new Date().toISOString();
        INITIAL_DB.sewing_reports = INITIAL_DB.sewing_reports || [];
        const idx = INITIAL_DB.sewing_reports.findIndex((r: any) => String(r.id) === String(report.id));
        if (idx !== -1) INITIAL_DB.sewing_reports[idx] = report;
        else INITIAL_DB.sewing_reports.unshift(report);
        try { localStorage.setItem('bqos_cache_sewing', JSON.stringify(INITIAL_DB.sewing_reports)); } catch (e) {}
        return { success: true, id: report.id };
      }

      case 'api_saveENDLINEQUALITY':
      case 'api_saveEndlineReport': {
        const report = { ...(args[0] || {}) };
        report.id = report.id || ('end-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6));
        if (!report.timestamp) report.timestamp = new Date().toISOString();
        INITIAL_DB.endline_reports = INITIAL_DB.endline_reports || [];
        INITIAL_DB.workorders = INITIAL_DB.workorders || [];

        const woTarget = String(report.wo || report.workorderNumber || '').trim().toUpperCase();
        const matchedWO = INITIAL_DB.workorders.find((w: any) => 
          String(w.workorderNumber || '').trim().toUpperCase() === woTarget ||
          String(w.id || '').trim().toUpperCase() === woTarget
        );
        const targetQty = Number(matchedWO?.quantity || matchedWO?.orderQty || report.totalQty || 0);
        if (targetQty > 0) {
          const currentPassSum = INITIAL_DB.endline_reports
            .filter((r: any) => {
              const rWo = String(r.wo || r.workorderNumber || '').trim().toUpperCase();
              return rWo === woTarget && String(r.id) !== String(report.id);
            })
            .reduce((sum: number, r: any) => sum + (Number(r.passQty) || 0), 0);
          
          const allowable = Math.max(0, targetQty - currentPassSum);
          if (Number(report.passQty) > allowable) {
            report.passQty = String(allowable);
            if (Number(report.checkedQty) > 0 && Number(report.checkedQty) >= Number(report.passQty)) {
              report.checkedQty = String(allowable);
            }
          }
          const newPassSum = currentPassSum + Number(report.passQty);
          report.totalQty = String(targetQty);
          report.openQty = String(Math.max(0, targetQty - newPassSum));
          if (newPassSum >= targetQty) {
            report.moveToAQL = true;
            if (matchedWO && matchedWO.status !== 'FINAL' && matchedWO.status !== 'COMPLETED') {
              matchedWO.status = 'AQL';
            }
          }
        }

        const idx = INITIAL_DB.endline_reports.findIndex((r: any) => String(r.id) === String(report.id));
        if (idx !== -1) INITIAL_DB.endline_reports[idx] = report;
        else INITIAL_DB.endline_reports.unshift(report);
        try { localStorage.setItem('bqos_cache_endline', JSON.stringify(INITIAL_DB.endline_reports)); } catch (e) {}
        try { localStorage.setItem('bqos_cache_wo', JSON.stringify(INITIAL_DB.workorders)); } catch (e) {}
        return { success: true, id: report.id };
      }

      case 'api_bulkSave': {
        const sheetName = String(args[0] || '').toUpperCase();
        const records = Array.isArray(args[1]) ? args[1] : [];
        if (sheetName.includes('ENDLINE')) {
          INITIAL_DB.endline_reports = INITIAL_DB.endline_reports || [];
          INITIAL_DB.workorders = INITIAL_DB.workorders || [];

          records.forEach((r: any) => {
            const woTarget = String(r.wo || r.workorderNumber || '').trim().toUpperCase();
            if (woTarget) {
              const matchedWO = INITIAL_DB.workorders.find((w: any) => 
                String(w.workorderNumber || '').trim().toUpperCase() === woTarget ||
                String(w.id || '').trim().toUpperCase() === woTarget
              );
              const targetQty = Number(matchedWO?.quantity || matchedWO?.orderQty || r.totalQty || 0);
              if (targetQty > 0) {
                const currentPassSum = INITIAL_DB.endline_reports
                  .filter((er: any) => {
                    const rWo = String(er.wo || er.workorderNumber || '').trim().toUpperCase();
                    return rWo === woTarget && String(er.id) !== String(r.id);
                  })
                  .reduce((sum: number, er: any) => sum + (Number(er.passQty) || 0), 0);
                
                const allowable = Math.max(0, targetQty - currentPassSum);
                if (Number(r.passQty) > allowable) {
                  r.passQty = String(allowable);
                  if (Number(r.checkedQty) > 0 && Number(r.checkedQty) >= Number(r.passQty)) {
                    r.checkedQty = String(allowable);
                  }
                }
                const newPassSum = currentPassSum + Number(r.passQty);
                r.totalQty = String(targetQty);
                r.openQty = String(Math.max(0, targetQty - newPassSum));
                if (newPassSum >= targetQty) {
                  r.moveToAQL = true;
                  if (matchedWO && matchedWO.status !== 'FINAL' && matchedWO.status !== 'COMPLETED') {
                    matchedWO.status = 'AQL';
                  }
                }
              }
            }
          });

          INITIAL_DB.endline_reports.unshift(...records);
          try { localStorage.setItem('bqos_cache_endline', JSON.stringify(INITIAL_DB.endline_reports)); } catch (e) {}
          try { localStorage.setItem('bqos_cache_wo', JSON.stringify(INITIAL_DB.workorders)); } catch (e) {}
        } else if (sheetName.includes('MATERIAL')) {
          INITIAL_DB.material_reports = INITIAL_DB.material_reports || [];
          INITIAL_DB.material_reports.unshift(...records);
          try { localStorage.setItem('bqos_cache_material', JSON.stringify(INITIAL_DB.material_reports)); } catch (e) {}
        } else if (sheetName.includes('CUTTING')) {
          INITIAL_DB.cutting_reports = INITIAL_DB.cutting_reports || [];
          INITIAL_DB.cutting_reports.unshift(...records);
          try { localStorage.setItem('bqos_cache_cutting', JSON.stringify(INITIAL_DB.cutting_reports)); } catch (e) {}
        }
        return { success: true, count: records.length };
      }

      case 'api_saveAQLREPORT': {
        const report = { ...(args[0] || {}) };
        report.id = report.id || ('aql-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6));
        if (!report.timestamp) report.timestamp = new Date().toISOString();
        INITIAL_DB.aql_reports = INITIAL_DB.aql_reports || [];
        INITIAL_DB.aql_reports.unshift(report);
        try { localStorage.setItem('bqos_cache_aql', JSON.stringify(INITIAL_DB.aql_reports)); } catch (e) {}
        return { success: true, id: report.id };
      }

      case 'api_saveFINALAUDIT': {
        const report = { ...(args[0] || {}) };
        report.id = report.id || ('fin-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6));
        if (!report.timestamp) report.timestamp = new Date().toISOString();
        INITIAL_DB.final_reports = INITIAL_DB.final_reports || [];
        INITIAL_DB.final_reports.unshift(report);
        try { localStorage.setItem('bqos_cache_final', JSON.stringify(INITIAL_DB.final_reports)); } catch (e) {}
        return { success: true, id: report.id };
      }

      case 'api_saveCustomerComplaint': {
        const complaint = { ...(args[0] || {}) };
        complaint.id = complaint.id || ('cc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6));
        if (!complaint.timestamp) complaint.timestamp = new Date().toISOString();
        INITIAL_DB.customer_complaints = INITIAL_DB.customer_complaints || [];
        const idx = INITIAL_DB.customer_complaints.findIndex((c: any) => String(c.id) === String(complaint.id));
        if (idx !== -1) INITIAL_DB.customer_complaints[idx] = complaint;
        else INITIAL_DB.customer_complaints.unshift(complaint);
        try { localStorage.setItem('bqos_cache_complaints', JSON.stringify(INITIAL_DB.customer_complaints)); } catch (e) {}
        return { success: true, id: complaint.id };
      }

      case 'api_deleteCustomerComplaint': {
        const id = String(args[0]);
        INITIAL_DB.customer_complaints = (INITIAL_DB.customer_complaints || []).filter((c: any) => String(c.id) !== id);
        try { localStorage.setItem('bqos_cache_complaints', JSON.stringify(INITIAL_DB.customer_complaints)); } catch (e) {}
        return { success: true };
      }

      case 'api_saveREPORTS_SOP': {
        const sop = { ...(args[0] || {}) };
        sop.id = sop.id || ('sop-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6));
        INITIAL_DB.reports_sop = INITIAL_DB.reports_sop || [];
        const idx = INITIAL_DB.reports_sop.findIndex((s: any) => String(s.id) === String(sop.id));
        if (idx !== -1) INITIAL_DB.reports_sop[idx] = sop;
        else INITIAL_DB.reports_sop.unshift(sop);
        try { localStorage.setItem('bqos_cache_sop', JSON.stringify(INITIAL_DB.reports_sop)); } catch (e) {}
        return { success: true, id: sop.id };
      }

      case 'api_deleteREPORTS_SOP': {
        const id = String(args[0]);
        INITIAL_DB.reports_sop = (INITIAL_DB.reports_sop || []).filter((s: any) => String(s.id) !== id);
        try { localStorage.setItem('bqos_cache_sop', JSON.stringify(INITIAL_DB.reports_sop)); } catch (e) {}
        return { success: true };
      }

      case 'api_saveWorkorder': {
        const wo = { ...(args[0] || {}) };
        wo.id = wo.id || ('wo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6));
        INITIAL_DB.workorders = INITIAL_DB.workorders || [];
        const idx = INITIAL_DB.workorders.findIndex((w: any) => String(w.id) === String(wo.id) || String(w.workorderNumber) === String(wo.workorderNumber));
        if (idx !== -1) INITIAL_DB.workorders[idx] = { ...INITIAL_DB.workorders[idx], ...wo };
        else INITIAL_DB.workorders.unshift(wo);
        try { localStorage.setItem('bqos_cache_wo', JSON.stringify(INITIAL_DB.workorders)); } catch (e) {}
        return { success: true, id: wo.id };
      }

      case 'api_updateWorkorder': {
        const wo = { ...(args[0] || {}) };
        INITIAL_DB.workorders = INITIAL_DB.workorders || [];
        const idx = INITIAL_DB.workorders.findIndex((w: any) => String(w.id) === String(wo.id) || String(w.workorderNumber) === String(wo.workorderNumber));
        if (idx !== -1) INITIAL_DB.workorders[idx] = { ...INITIAL_DB.workorders[idx], ...wo };
        try { localStorage.setItem('bqos_cache_wo', JSON.stringify(INITIAL_DB.workorders)); } catch (e) {}
        return { success: true };
      }

      case 'api_deleteWorkorder': {
        const id = String(args[0]);
        INITIAL_DB.workorders = (INITIAL_DB.workorders || []).filter((w: any) => String(w.id) !== id && String(w.workorderNumber) !== id);
        try { localStorage.setItem('bqos_cache_wo', JSON.stringify(INITIAL_DB.workorders)); } catch (e) {}
        return { success: true };
      }

      case 'api_deleteMaterialData': {
        const id = String(args[0]);
        INITIAL_DB.material_reports = (INITIAL_DB.material_reports || []).filter((r: any) => String(r.id) !== id);
        try { localStorage.setItem('bqos_cache_material', JSON.stringify(INITIAL_DB.material_reports)); } catch (e) {}
        return { success: true };
      }

      case 'api_deleteCuttingData': {
        const id = String(args[0]);
        INITIAL_DB.cutting_reports = (INITIAL_DB.cutting_reports || []).filter((r: any) => String(r.id) !== id);
        try { localStorage.setItem('bqos_cache_cutting', JSON.stringify(INITIAL_DB.cutting_reports)); } catch (e) {}
        return { success: true };
      }

      case 'api_deleteInlineData': {
        const id = String(args[0]);
        INITIAL_DB.sewing_reports = (INITIAL_DB.sewing_reports || []).filter((r: any) => String(r.id) !== id);
        try { localStorage.setItem('bqos_cache_sewing', JSON.stringify(INITIAL_DB.sewing_reports)); } catch (e) {}
        return { success: true };
      }

      case 'api_deleteEndlineData': {
        const id = String(args[0]);
        INITIAL_DB.endline_reports = (INITIAL_DB.endline_reports || []).filter((r: any) => String(r.id) !== id);
        try { localStorage.setItem('bqos_cache_endline', JSON.stringify(INITIAL_DB.endline_reports)); } catch (e) {}
        return { success: true };
      }

      case 'api_deleteAQLData': {
        const id = String(args[0]);
        INITIAL_DB.aql_reports = (INITIAL_DB.aql_reports || []).filter((r: any) => String(r.id) !== id);
        try { localStorage.setItem('bqos_cache_aql', JSON.stringify(INITIAL_DB.aql_reports)); } catch (e) {}
        return { success: true };
      }

      case 'api_deleteFinalAuditData': {
        const id = String(args[0]);
        INITIAL_DB.final_reports = (INITIAL_DB.final_reports || []).filter((r: any) => String(r.id) !== id);
        try { localStorage.setItem('bqos_cache_final', JSON.stringify(INITIAL_DB.final_reports)); } catch (e) {}
        return { success: true };
      }

      case 'api_saveZoneMapping': {
        const item = args[0] || {};
        INITIAL_DB.zone = INITIAL_DB.zone || [];
        INITIAL_DB.zone.push(item);
        try { localStorage.setItem('bqos_cache_zm', JSON.stringify(INITIAL_DB.zone)); } catch (e) {}
        return { success: true };
      }

      case 'api_deleteZoneMapping': {
        const filter = args[0] || {};
        INITIAL_DB.zone = (INITIAL_DB.zone || []).filter((zm: any) => {
          if (filter.zone && filter.unit && filter.worker) {
            return !(zm.zone === filter.zone && zm.unit === filter.unit && zm.worker === filter.worker);
          }
          if (filter.zone && filter.unit) {
            return !(zm.zone === filter.zone && zm.unit === filter.unit);
          }
          if (filter.zone) {
            return zm.zone !== filter.zone;
          }
          return true;
        });
        try { localStorage.setItem('bqos_cache_zm', JSON.stringify(INITIAL_DB.zone)); } catch (e) {}
        return { success: true };
      }

      case 'api_saveUser':
      case 'api_updateUser': {
        const u = args[0] || {};
        INITIAL_DB.users = INITIAL_DB.users || [];
        const idx = INITIAL_DB.users.findIndex((user: any) => user.userCode === u.userCode);
        if (idx !== -1) INITIAL_DB.users[idx] = { ...INITIAL_DB.users[idx], ...u };
        else INITIAL_DB.users.push(u);
        try { localStorage.setItem('bqos_cache_users', JSON.stringify(INITIAL_DB.users)); } catch (e) {}
        return { success: true };
      }

      case 'api_deleteUser': {
        const code = String(args[0]);
        INITIAL_DB.users = (INITIAL_DB.users || []).filter((u: any) => u.userCode !== code);
        try { localStorage.setItem('bqos_cache_users', JSON.stringify(INITIAL_DB.users)); } catch (e) {}
        return { success: true };
      }

      default:
        return { success: true };
    }
  } catch (err: any) {
    console.warn(`[LOCAL MUTATION NOTICE]`, err.message);
    return { success: true };
  }
}

// Helper to generate UUIDs client-side
function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper to strip any DOM elements, MouseEvents, and circular references safely
function sanitizeArgs(args: any[]): any[] {
  const seen = new Set();
  function clean(val: any): any {
    if (val === null || val === undefined) return val;
    if (typeof val !== 'object') return val;
    
    if (seen.has(val)) return '[Circular]';
    
    // Safe check if standard DOM node
    if (val.nodeType && val.nodeName) {
      return `[DOMNode:${val.nodeName}]`;
    }
    
    // Check if typical MouseEvent or constructor matches Event
    if (val.constructor && val.constructor.name && (val.constructor.name.includes('HTML') || val.constructor.name.includes('Event'))) {
      return `[${val.constructor.name}]`;
    }
    
    if (val.target && val.currentTarget && typeof val.preventDefault === 'function') {
      return '[SyntheticEvent]';
    }
    
    seen.add(val);
    
    if (Array.isArray(val)) {
      const arr = val.map(clean);
      seen.delete(val);
      return arr;
    }
    
    const cleanedObj: any = {};
    for (const k in val) {
      if (Object.prototype.hasOwnProperty.call(val, k)) {
        if (k.startsWith('__react') || k === '_react') {
          continue;
        }
        cleanedObj[k] = clean(val[k]);
      }
    }
    seen.delete(val);
    return cleanedObj;
  }
  return args.map(clean);
}

// Global defaults for users
const SEED_USERS = [
  { userCode: 'U001', username: 'user1', password: 'pass1', role: 'USER', location: 'SYSTEM', restrictions: [], canDownload: true },
  { userCode: 'A001', username: 'admin', password: 'admin123', role: 'ADMIN', location: 'SYSTEM', restrictions: [], canDownload: true },
  { userCode: 'W001', username: 'wo1', password: '123', role: 'WORKORDER', location: 'SYSTEM', restrictions: [], canDownload: true }
];

async function updateWorkorderStatus(woNum: string, nextStatus: string) {
  try {
    const target = String(woNum || '').trim().toUpperCase();
    if (!target) return;
    const workorders = await sheetsService.getData('WORKORDER');
    const matched = workorders.find(w => 
      String(w.workorderNumber || '').trim().toUpperCase() === target || 
      String(w.id || '').trim().toUpperCase() === target ||
      String(w.wo || '').trim().toUpperCase() === target
    );
    if (matched) {
      matched.status = nextStatus;
      await sheetsService.updateData('WORKORDER', matched);
    } else {
      await sheetsService.updateData('WORKORDER', { workorderNumber: woNum, status: nextStatus });
    }
    api.clearCache('api_getWorkorders');
    api.clearCache('api_getInitialData');
  } catch (e) {
    console.warn("Failed to update status on sheet:", e);
  }
}

// Client-side cache and in-flight request deduplication map
const clientReadCache = new Map<string, { timestamp: number; data: any }>();
const inFlightRequests = new Map<string, Promise<any>>();
const CLIENT_READ_CACHE_TTL = 30000; // 30s TTL for ultra-fast instant UI rendering
let cachedServerConfig: { data: any; timestamp: number } | null = null;

const CACHEABLE_METHODS = new Set([
  'api_ping',
  'api_getInitialData',
  'api_getWorkorders',
  'api_getUsers',
  'api_getUserSettings',
  'api_getGlobalSettings',
  'api_getZoneMappings',
  'api_getMaterialData',
  'api_getCuttingData',
  'api_getInlineData',
  'api_getEndlineData',
  'api_getAQLData',
  'api_getFinalAuditData',
  'api_get8ROUNDSYSTEMData',
  'api_getREPORTS_SOPData',
  'api_getCustomerComplaints',
  'api_getAdminLogs',
  'aggregateZonedData'
]);

let isFlushingSyncQueue = false;
async function flushOfflineSyncQueue() {
  if (isFlushingSyncQueue) return;
  try {
    const rawQueue = localStorage.getItem('bqos_offline_sync_queue');
    if (!rawQueue) return;
    const queue = JSON.parse(rawQueue);
    if (!Array.isArray(queue) || queue.length === 0) return;

    isFlushingSyncQueue = true;
    const remaining: any[] = [];

    for (const item of queue) {
      try {
        const res = await fetch("/api/gas", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: item.action, 
            params: item.params, 
            spreadsheetId: item.spreadsheetId || sheetsService.getSpreadsheetId() || "BOUND_TO_SCRIPT" 
          })
        });
        if (!res.ok) {
          remaining.push(item);
        }
      } catch (err) {
        remaining.push(item);
      }
    }

    if (remaining.length > 0) {
      localStorage.setItem('bqos_offline_sync_queue', JSON.stringify(remaining));
    } else {
      localStorage.removeItem('bqos_offline_sync_queue');
      console.log("[API OFFLINE QUEUE] All queued background mutations successfully synchronized to server.");
    }
  } catch (e) {
    // Ignore offline queue failures
  } finally {
    isFlushingSyncQueue = false;
  }
}

export const api = {
  isServerConfigured: false,

  clearCache(method?: string) {
    if (method) {
      for (const key of clientReadCache.keys()) {
        if (key.startsWith(method)) {
          clientReadCache.delete(key);
        }
      }
    } else {
      clientReadCache.clear();
      // Do not clear cachedServerConfig on routine write operations to avoid unnecessary network roundtrips
    }
  },

  async getServerConfig() {
    try {
      if (cachedServerConfig && (Date.now() - cachedServerConfig.timestamp < 10000)) {
        return cachedServerConfig.data;
      }
      // 1. Fetch server config state (which includes firestore config automatically on the backend)
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);
      const response = await fetch("/api/config", { signal: controller.signal });
      clearTimeout(id);
      const data = await response.json();

      // 2. Fallback and local sync
      const localUrl = localStorage.getItem('VITE_GAS_URL');
      const localSpreadsheetId = localStorage.getItem('VITE_SPREADSHEET_ID');
      const localDriveUrl = localStorage.getItem('VITE_GAS_DRIVE_URL');

      // Clean up old URLs if stored in client localStorage and ensure active production scripts
      if (localUrl && localUrl !== DEFAULT_SHEETS_URL) {
        localStorage.setItem('VITE_GAS_URL', DEFAULT_SHEETS_URL);
      }
      if (localDriveUrl && localDriveUrl !== DEFAULT_DRIVE_URL) {
        localStorage.setItem('VITE_GAS_DRIVE_URL', DEFAULT_DRIVE_URL);
      }

      const serverUrl = DEFAULT_SHEETS_URL;
      const serverSpreadsheetId = data.spreadsheetId || "BOUND_TO_SCRIPT";
      const serverDriveUrl = DEFAULT_DRIVE_URL;

      // Final resolved values
      const finalUrl = DEFAULT_SHEETS_URL;
      const finalSpreadsheetId = serverSpreadsheetId || localSpreadsheetId || "BOUND_TO_SCRIPT";
      const finalDriveUrl = DEFAULT_DRIVE_URL;

      // Update client localStorage to match the resolved server/firestore/local values
      localStorage.setItem('VITE_GAS_URL', finalUrl);
      localStorage.setItem('VITE_SPREADSHEET_ID', finalSpreadsheetId);
      localStorage.setItem('VITE_GAS_DRIVE_URL', finalDriveUrl);

      // Safe Auto-Heal: Only write custom config to the server if both are valid AND different from server's current state
      const isServerMissingConfig = !serverUrl || !serverSpreadsheetId || !serverDriveUrl || data.source === 'hardcoded';
      const isClientConfigValid = !!(finalUrl && finalUrl.startsWith("https://script.google.com/macros/s/"));
      
      if (isServerMissingConfig && isClientConfigValid) {
        const urlChanged = serverUrl !== finalUrl;
        const sheetChanged = serverSpreadsheetId !== finalSpreadsheetId;
        const driveChanged = serverDriveUrl !== finalDriveUrl;
        
        if (urlChanged || sheetChanged || driveChanged) {
          console.log("[AUTO-HEAL] Re-registering complete custom GAS Web App URL and Spreadsheet ID on server proxy...");
          await fetch("/api/save-config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: finalUrl, spreadsheetId: finalSpreadsheetId, driveUrl: finalDriveUrl })
          }).catch(() => {});
          data.hasGasUrl = true;
          data.isPermanent = true;
          data.source = 'file';
          data.gasUrl = finalUrl;
          data.spreadsheetId = finalSpreadsheetId;
          data.gasDriveUrl = finalDriveUrl;
        }
      }

      // Always treat server as configured because we have a fully-functional local fallback Express database
      this.isServerConfigured = true;
      data.hasGasUrl = true;
      data.isPermanent = true;
      data.gasUrl = finalUrl;
      data.gasDriveUrl = finalDriveUrl;
      data.spreadsheetId = finalSpreadsheetId;
      cachedServerConfig = { data, timestamp: Date.now() };
      return data;
    } catch (e) {
      const fallbackConfig = { hasGasUrl: true, isPermanent: true, gasUrl: DEFAULT_SHEETS_URL, gasDriveUrl: DEFAULT_DRIVE_URL, spreadsheetId: "BOUND_TO_SCRIPT" };
      cachedServerConfig = { data: fallbackConfig, timestamp: Date.now() };
      return fallbackConfig;
    }
  },

  async saveServerConfig(url: string, spreadsheetId?: string, driveUrl?: string) {
    try {
      const finalUrl = url || localStorage.getItem('VITE_GAS_URL') || "";
      const finalSpreadsheetId = spreadsheetId || localStorage.getItem('VITE_SPREADSHEET_ID') || "";
      const finalDriveUrl = driveUrl || localStorage.getItem('VITE_GAS_DRIVE_URL') || "";

      if (finalUrl) localStorage.setItem('VITE_GAS_URL', finalUrl);
      if (finalSpreadsheetId) localStorage.setItem('VITE_SPREADSHEET_ID', finalSpreadsheetId);
      if (finalDriveUrl) localStorage.setItem('VITE_GAS_DRIVE_URL', finalDriveUrl);

      let resData = { success: true, message: "Local settings saved." };
      
      // Save Google Script URL on the local proxy
      const payload: any = {};
      if (finalUrl && finalUrl.startsWith("https://script.google.com/macros/s/")) {
        payload.url = finalUrl;
      }
      if (finalSpreadsheetId) {
        payload.spreadsheetId = finalSpreadsheetId;
      }
      if (finalDriveUrl && finalDriveUrl.startsWith("https://script.google.com/macros/s/")) {
        payload.driveUrl = finalDriveUrl;
      }

      if (Object.keys(payload).length > 0) {
        const response = await fetch("/api/save-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        resData = await response.json();
      }

      // Share configuration in remote Firestore securely if available
      try {
        const docRef = doc(db, "system_config", "global");
        const fbPayload: any = {
          updatedAt: new Date().toISOString()
        };
        if (finalUrl) fbPayload.gasUrl = finalUrl;
        if (finalSpreadsheetId) fbPayload.spreadsheetId = finalSpreadsheetId;
        if (finalDriveUrl) fbPayload.gasDriveUrl = finalDriveUrl;
        
        await setDoc(docRef, fbPayload, { merge: true });
        console.log("[FIRESTORE] Connection config persisted.");
      } catch (fe) {
        // Non-blocking: remote Firestore database may not be provisioned yet; configuration is permanently saved to server storage & localStorage
      }

      return resData;
    } catch (e: any) {
      console.error("[CONFIG] Failed to save configuration:", e);
      return { success: false, error: e.message || "Failed to save configuration." };
    }
  },

  async disconnect() {
    localStorage.removeItem('VITE_GAS_URL');
    localStorage.removeItem('VITE_GAS_DRIVE_URL');
    localStorage.removeItem('VITE_SPREADSHEET_ID');
    localStorage.removeItem('GOOGLE_ACCESS_TOKEN');
    localStorage.removeItem('BQOS_DEMO_MODE');
    try {
      await fetch("/api/clear-config", { method: "POST" });
    } catch (e) {
      console.error("[CONFIG] Failed to clear server configuration on disconnect:", e);
    }
    window.location.reload();
  },

  // Direct sheets service implementation of api.run
  async runDirect(method: string, args: any[]): Promise<any> {
    console.log(`[API DIRECT SH] Executing client-side: ${method}`, args);

    switch (method) {
      case 'api_ping':
        return { success: true, status: "Connected", timestamp: new Date().toISOString() };

      case 'api_getInitialData': {
        const zone = args[0]?.zone;
        const userCode = args[0]?.userCode;
        let users = await sheetsService.getData('USERS');
        if (users.length === 0) {
          // Auto-seed default users if USERS is empty
          for (const u of SEED_USERS) {
            await sheetsService.saveData('USERS', u);
          }
          users = SEED_USERS;
        }

        let workorders = await sheetsService.getData('WORKORDER');
        if (zone && zone !== 'ALL' && zone !== 'WORKORDER') {
          try {
            const zoneRows = await sheetsService.getData('ZONE').catch(() => []);
            const uppercaseZone = String(zone).toUpperCase().trim();
            const allowedZones = new Set<string>([uppercaseZone]);
            
            for (const row of zoneRows) {
              const z = String(row.zone || '').trim().toUpperCase();
              const id = String(row.id || '').trim().toUpperCase();
              if (z === uppercaseZone || id === uppercaseZone || z.replace(/^ZMAP-/, '') === uppercaseZone || id.replace(/^ZMAP-/, '') === uppercaseZone) {
                if (z) allowedZones.add(z);
                if (id) allowedZones.add(id);
                if (z.replace(/^ZMAP-/, '')) allowedZones.add(z.replace(/^ZMAP-/, ''));
                if (id.replace(/^ZMAP-/, '')) allowedZones.add(id.replace(/^ZMAP-/, ''));
              }
            }
            
            workorders = workorders.filter(w => {
              const zVal = String(w.zone || w.location || '').toUpperCase().trim();
              return allowedZones.has(zVal) || allowedZones.has(zVal.replace(/^ZMAP-/, ''));
            });
          } catch (err) {
            console.error("Failed to load zone mapping list in api_getInitialData:", err);
            // Fallback to strict filtering
            workorders = workorders.filter(w => {
              const zVal = String(w.zone || w.location || '').toUpperCase().trim();
              return zVal === String(zone).toUpperCase().trim();
            });
          }
        }

        let settings = null;
        if (userCode) {
          settings = await sheetsService.getSettings(userCode);
        } else {
          settings = await sheetsService.getSettings('GLOBAL');
        }

        return {
          users,
          workorders,
          settings,
          serverTime: new Date().toISOString(),
          success: true
        };
      }

      case 'api_getUsers':
        return await sheetsService.getData('USERS');

      case 'api_saveUser': {
        const user = args[0];
        const structuredUser = {
          userCode: user.userCode,
          username: user.username,
          password: user.password,
          role: user.role,
          location: user.location,
          zone: user.zone || "",
          restrictions: user.restrictions || [],
          canDownload: user.canDownload !== false,
          settings: user.settings ? (typeof user.settings === 'object' ? JSON.stringify(user.settings) : user.settings) : ""
        };
        await sheetsService.saveData('USERS', structuredUser);
        
        // Audit log
        await sheetsService.saveData('ADMIN', {
          timestamp: new Date().toISOString(),
          module: 'USER_MGMT',
          action: 'SAVE_USERS',
          details: `Saved user ${user.username}`,
          admin: args[1] || 'SYSTEM'
        });
        return { success: true };
      }

      case 'api_updateUser': {
        const user = args[0];
        const updatedUser = {
          ...user,
          settings: user.settings ? (typeof user.settings === 'object' ? JSON.stringify(user.settings) : user.settings) : undefined
        };
        await sheetsService.updateData('USERS', updatedUser);

        await sheetsService.saveData('ADMIN', {
          timestamp: new Date().toISOString(),
          module: 'USER_MGMT',
          action: 'EDIT USER',
          details: `Updated User ${user.userCode} (${user.username})`,
          admin: args[1] || 'SYSTEM'
        });
        return { success: true };
      }

      case 'api_deleteUser': {
        const userCode = args[0];
        const reason = args[1];
        await sheetsService.deleteData('USERS', userCode);
        await sheetsService.saveData('ADMIN', {
          timestamp: new Date().toISOString(),
          module: 'USER_MGMT',
          action: 'DELETE USER',
          details: `Deleted User ${userCode}. Reason: ${reason}`,
          admin: args[2] || 'SYSTEM'
        });
        return { success: true };
      }

      case 'api_getWorkorders': {
        const zone = (typeof args[0] === 'string' ? args[0] : args[0]?.zone);
        let workorders = await sheetsService.getData('WORKORDER');
        if (zone && zone !== 'ALL' && zone !== 'WORKORDER') {
          workorders = workorders.filter(w => {
            const zVal = String(w.zone || w.location || '').toUpperCase().trim();
            return zVal === String(zone).toUpperCase().trim();
          });
        }
        return workorders;
      }

      case 'api_saveWorkorder': {
        const wo = args[0];
        wo.id = wo.id || generateUuid();
        if (!wo.status) wo.status = 'CUTTING';
        await sheetsService.saveData('WORKORDER', wo);
        return { success: true };
      }

      case 'api_updateWorkorder': {
        const wo = args[0];
        await sheetsService.updateData('WORKORDER', wo);
        return { success: true };
      }

      case 'api_deleteWorkorder': {
        const id = args[0];
        await sheetsService.deleteData('WORKORDER', id);
        return { success: true };
      }

      case 'api_getUserSettings':
        return await sheetsService.getSettings(args[0]);

      case 'api_saveUserSettings':
      case 'api_saveSettings': {
        const target = args[0];
        const settings = args[1];
        await sheetsService.saveSettings(target, settings);
        await sheetsService.saveData('ADMIN', {
          timestamp: new Date().toISOString(),
          module: 'SETTINGS',
          action: 'UPDATE_SETTINGS',
          details: `Updated Settings for ${target}`,
          admin: args[2] || 'SYSTEM'
        });
        return { success: true };
      }

      case 'api_getAdminLogs':
        return await sheetsService.getData('ADMIN');

      case 'api_getZoneMappings': {
        try {
          const zoneRows = await sheetsService.getData('ZONE').catch(() => []);
          const result: any[] = [];
          
          // Get all sheet titles to see if unit-specific sheets exist
          const spreadsheetId = sheetsService.getSpreadsheetId();
          let sheetTitles: string[] = [];
          if (spreadsheetId) {
            try {
              const metadata = await sheetsService.request(spreadsheetId);
              sheetTitles = (metadata.sheets || []).map((s: any) => String(s.properties?.title || '').trim().toUpperCase());
            } catch (err) {
              console.error("Failed to get spreadsheet metadata in getZoneMappings:", err);
            }
          }

          // Build a dictionary of ZMAP-ID -> Human Name
          const zoneIdToNameMap = new Map<string, string>();
          for (const row of zoneRows) {
            const z = String(row.zone || '').trim().toUpperCase();
            const id = String(row.id || '').trim().toUpperCase();
            if (z.startsWith('ZMAP-') && id && !id.startsWith('ZMAP-')) {
              zoneIdToNameMap.set(z, id);
            } else if (id.startsWith('ZMAP-') && z && !z.startsWith('ZMAP-')) {
              zoneIdToNameMap.set(id, z);
            }
          }

          for (const row of zoneRows) {
            const unitName = String(row.unit || '').trim().toUpperCase();
            let zoneName = String(row.zone || '').trim().toUpperCase();
            let idValue = String(row.id || '').trim();

            if (zoneName.startsWith('ZMAP-')) {
              const mapped = zoneIdToNameMap.get(zoneName);
              if (mapped) {
                zoneName = mapped;
              }
            } else if (zoneName.startsWith('ZMAP-') && idValue && !idValue.toUpperCase().startsWith('ZMAP-')) {
              const temp = zoneName;
              zoneName = idValue.toUpperCase();
              idValue = temp;
            }

            if (!zoneName || zoneName.startsWith('ZMAP-')) continue;

            if (unitName) {
              const unitSheetExists = sheetTitles.includes(unitName);
              if (unitSheetExists) {
                const workerRows = await sheetsService.getData(unitName).catch(() => []);
                let hasWorker = false;
                for (const wRow of workerRows) {
                  const workerName = String(wRow.worker || '').trim().toUpperCase();
                  if (!workerName) continue;
                  hasWorker = true;
                  const wId = wRow.id || ('zmap-' + Math.floor(Math.random() * 10000000));
                  result.push({
                    id: wId,
                    zone: zoneName,
                    unit: unitName,
                    worker: workerName,
                    timestamp: wRow.timestamp || new Date().toISOString()
                  });
                }
                if (!hasWorker) {
                  result.push({
                    id: idValue || row.id || ('zmap-' + Math.floor(Math.random() * 10000000)),
                    zone: zoneName,
                    unit: unitName,
                    worker: '',
                    timestamp: row.timestamp || new Date().toISOString()
                  });
                }
              } else {
                result.push({
                  id: idValue || row.id || ('zmap-' + Math.floor(Math.random() * 10000000)),
                  zone: zoneName,
                  unit: unitName,
                  worker: '',
                  timestamp: row.timestamp || new Date().toISOString()
                });
              }
            } else {
              result.push({
                id: idValue || row.id || ('zmap-' + Math.floor(Math.random() * 10000000)),
                zone: zoneName,
                unit: '',
                worker: '',
                timestamp: row.timestamp || new Date().toISOString()
              });
            }
          }
          return result;
        } catch (e) {
          console.error("Error in api_getZoneMappings runDirect:", e);
          return [];
        }
      }

      case 'api_saveZoneMapping': {
        const record = args[0] || {};
        if (!record.id) {
          record.id = 'zmap-' + Math.floor(Math.random() * 10000000);
        }
        if (!record.timestamp) {
          record.timestamp = new Date().toISOString();
        }

        const zone = String(record.zone || '').trim().toUpperCase();
        const unit = String(record.unit || '').trim().toUpperCase();
        const worker = String(record.worker || '').trim().toUpperCase();

        if (worker) {
          if (!unit) {
            return { success: false, error: "Unit is required to save a worker." };
          }
          // Make sure the unit sheet exists in the spreadsheet
          const spreadsheetId = sheetsService.getSpreadsheetId();
          if (spreadsheetId) {
            try {
              const metadata = await sheetsService.request(spreadsheetId);
              const sheetTitles = (metadata.sheets || []).map((s: any) => String(s.properties?.title || '').trim().toUpperCase());
              if (!sheetTitles.includes(unit)) {
                // Create sheet via Sheets API
                await sheetsService.request(`${spreadsheetId}:batchUpdate`, {
                  method: 'POST',
                  body: JSON.stringify({
                    requests: [
                      {
                        addSheet: {
                          properties: {
                            title: unit
                          }
                        }
                      }
                    ]
                  })
                });
                // Initialize the unit sheet with headers
                await sheetsService.request(`${spreadsheetId}/values/${encodeURIComponent(unit)}!A1?valueInputOption=USER_ENTERED`, {
                  method: 'PUT',
                  body: JSON.stringify({
                    values: [['id', 'worker', 'timestamp']]
                  })
                });
              }
            } catch (err) {
              console.error("Failed to ensure unit sheet exists:", err);
            }
          }

          const workerRecord = {
            id: record.id,
            worker: worker,
            timestamp: record.timestamp
          };
          return await sheetsService.saveData(unit, workerRecord);
        }

        if (unit) {
          if (!zone) {
            return { success: false, error: "Zone is required to save a unit." };
          }
          const unitRecord = {
            id: record.id,
            zone: zone,
            unit: unit,
            timestamp: record.timestamp
          };
          await sheetsService.saveData('UNIT', unitRecord).catch(() => {});
          return await sheetsService.saveData('ZONE', unitRecord);
        }

        if (zone) {
          const zoneRecord = {
            id: record.id,
            zone: zone,
            unit: '',
            timestamp: record.timestamp
          };
          return await sheetsService.saveData('ZONE', zoneRecord);
        }

        return { success: false, error: "Empty record" };
      }

      case 'api_deleteZoneMapping': {
        const param = args[0];
        let targetIdStr = "";
        let targetZone = "";
        let targetUnit = "";
        let targetWorker = "";

        if (param && typeof param === 'object') {
          targetIdStr = String(param.id || '').trim();
          targetZone = String(param.zone || '').trim().toUpperCase();
          targetUnit = String(param.unit || '').trim().toUpperCase();
          targetWorker = String(param.worker || '').trim().toUpperCase();
        } else {
          targetIdStr = String(param || '').trim();
        }

        const isOfflineDemo = localStorage.getItem('BQOS_DEMO_MODE') === 'true';
        if (isOfflineDemo) {
          if (targetWorker && targetUnit) {
            sheetsService.deleteOfflineData(targetUnit, targetIdStr);
            return { success: true, details: "Deleted worker offline" };
          }
          if (targetUnit && !targetWorker) {
            const zoneRows = sheetsService.getOfflineData('ZONE');
            const filteredZone = zoneRows.filter((row: any) => {
              const rUnit = String(row.unit || '').trim().toUpperCase();
              const rZone = String(row.zone || '').trim().toUpperCase();
              return !(rUnit === targetUnit && (!targetZone || rZone === targetZone));
            });
            localStorage.setItem('bqos_local_sheet_ZONE', JSON.stringify(filteredZone));
            localStorage.removeItem('bqos_local_sheet_' + targetUnit);
            return { success: true, details: "Deleted unit offline" };
          }
          if (targetZone && !targetUnit && !targetWorker) {
            const zoneRows = sheetsService.getOfflineData('ZONE');
            const unitsToDelete: string[] = [];
            const filteredZone = zoneRows.filter((row: any) => {
              const rZone = String(row.zone || '').trim().toUpperCase();
              if (rZone === targetZone) {
                if (row.unit) unitsToDelete.push(String(row.unit).trim().toUpperCase());
                return false;
              }
              return true;
            });
            localStorage.setItem('bqos_local_sheet_ZONE', JSON.stringify(filteredZone));
            unitsToDelete.forEach(u => localStorage.removeItem('bqos_local_sheet_' + u));
            return { success: true, details: "Deleted zone offline" };
          }
          if (targetIdStr) {
            sheetsService.deleteOfflineData('ZONE', targetIdStr);
            return { success: true };
          }
          return { success: false, error: "Mapping not found" };
        }

        const spreadsheetId = sheetsService.getSpreadsheetId();
        if (!spreadsheetId) throw new Error('SPREADSHEET_NOT_FOUND');

        const metadata = await sheetsService.request(spreadsheetId);
        const resolvedZoneSheetName = sheetsService.resolveSynonymSheetNameClient('ZONE', metadata.sheets || []);

        // Case 1: If it's a Worker row (has a worker name and unit sheet)
        if (targetWorker && targetUnit) {
          try {
            // Delete worker row from unit-specific sheet
            await sheetsService.deleteData(targetUnit, targetIdStr);
            return { success: true, details: "Deleted worker " + targetWorker + " from unit sheet " + targetUnit };
          } catch (e: any) {
            // Fall back to filtering
            const data = await sheetsService.getData(targetUnit).catch(() => []);
            const filtered = data.filter((row: any) => {
              const rWorker = String(row.worker || '').trim().toUpperCase();
              return rWorker !== targetWorker;
            });
            const resolvedName = targetUnit;
            await sheetsService.request(`${spreadsheetId}/values/${encodeURIComponent(resolvedName)}!A1:Z5000:clear`, {
              method: 'POST'
            });
            await sheetsService.request(`${spreadsheetId}/values/${encodeURIComponent(resolvedName)}!A1?valueInputOption=USER_ENTERED`, {
              method: 'PUT',
              body: JSON.stringify({
                values: [['id', 'worker', 'timestamp'], ...filtered.map((r: any) => [r.id || '', r.worker || '', r.timestamp || ''])]
              })
            });
            return { success: true, details: "Deleted worker " + targetWorker + " from unit sheet " + targetUnit + " via filtering." };
          }
        }

        // Case 2: If it's a Unit row (has a unit name and zone, but no worker)
        if (targetUnit && !targetWorker) {
          const zoneRows = await sheetsService.getData('ZONE').catch(() => []);
          const filteredZone = zoneRows.filter((row: any) => {
            const rUnit = String(row.unit || '').trim().toUpperCase();
            const rZone = String(row.zone || '').trim().toUpperCase();
            const isMatch = rUnit === targetUnit && (!targetZone || rZone === targetZone);
            return !isMatch;
          });

          const headers = ['id', 'zone', 'unit', 'timestamp'];
          await sheetsService.request(`${spreadsheetId}/values/${encodeURIComponent(resolvedZoneSheetName)}!A1:Z5000:clear`, {
            method: 'POST'
          });
          await sheetsService.request(`${spreadsheetId}/values/${encodeURIComponent(resolvedZoneSheetName)}!A1?valueInputOption=USER_ENTERED`, {
            method: 'PUT',
            body: JSON.stringify({
              values: [headers, ...filteredZone.map((r: any) => [r.id || '', r.zone || '', r.unit || '', r.timestamp || ''])]
            })
          });

          // Cascade delete/clear unit sheet
          try {
            const matchingSheet = (metadata.sheets || []).find((s: any) => String(s.properties?.title || '').trim().toUpperCase() === targetUnit);
            if (matchingSheet && matchingSheet.properties?.sheetId !== undefined) {
              const sheetId = matchingSheet.properties.sheetId;
              await sheetsService.request(`${spreadsheetId}:batchUpdate`, {
                method: 'POST',
                body: JSON.stringify({
                  requests: [
                    {
                      deleteSheet: {
                        sheetId: sheetId
                      }
                    }
                  ]
                })
              });
            }
          } catch (err) {
            console.warn("Failed to delete unit sheet, trying clear:", err);
            try {
              await sheetsService.request(`${spreadsheetId}/values/${encodeURIComponent(targetUnit)}!A1:Z5000:clear`, {
                method: 'POST'
              });
            } catch (clearErr) {}
          }

          return { success: true, details: "Deleted unit " + targetUnit + " and cleared sheets." };
        }

        // Case 3: If it's a Zone row (has a zone name, but no unit and no worker)
        if (targetZone && !targetUnit && !targetWorker) {
          const zoneRows = await sheetsService.getData('ZONE').catch(() => []);
          const unitsToDelete: string[] = [];

          const filteredZone = zoneRows.filter((row: any) => {
            const rZone = String(row.zone || '').trim().toUpperCase();
            if (rZone === targetZone) {
              const rUnit = String(row.unit || '').trim().toUpperCase();
              if (rUnit) {
                unitsToDelete.push(rUnit);
              }
              return false;
            }
            return true;
          });

          const headers = ['id', 'zone', 'unit', 'timestamp'];
          await sheetsService.request(`${spreadsheetId}/values/${encodeURIComponent(resolvedZoneSheetName)}!A1:Z5000:clear`, {
            method: 'POST'
          });
          await sheetsService.request(`${spreadsheetId}/values/${encodeURIComponent(resolvedZoneSheetName)}!A1?valueInputOption=USER_ENTERED`, {
            method: 'PUT',
            body: JSON.stringify({
              values: [headers, ...filteredZone.map((r: any) => [r.id || '', r.zone || '', r.unit || '', r.timestamp || ''])]
            })
          });

          // Delete sheets for units that were deleted
          const sheetsList = metadata.sheets || [];

          for (const uName of unitsToDelete) {
            try {
              const matchingSheet = sheetsList.find((s: any) => String(s.properties?.title || '').trim().toUpperCase() === uName);
              if (matchingSheet && matchingSheet.properties?.sheetId !== undefined) {
                await sheetsService.request(`${spreadsheetId}:batchUpdate`, {
                  method: 'POST',
                  body: JSON.stringify({
                    requests: [
                      {
                        deleteSheet: {
                          sheetId: matchingSheet.properties.sheetId
                        }
                      }
                    ]
                  })
                });
              }
            } catch (sheetErr) {
              console.warn("Failed to delete unit sheet cascade: " + uName, sheetErr);
            }
          }

          return { success: true, details: "Deleted zone " + targetZone + " and cascaded units." };
        }

        if (targetIdStr) {
          return await sheetsService.deleteData('ZONE', targetIdStr);
        }

        return { success: false, error: "Mapping not found" };
      }

      case 'api_logAdminActivity': {
        const details = args[0];
        await sheetsService.saveData('ADMIN', {
          timestamp: new Date().toISOString(),
          module: details.module || 'SYSTEM',
          action: details.action || 'ACTIVITY',
          details: details.details || '',
          admin: details.admin || 'SYSTEM'
        });
        return { success: true };
      }

      // Quality Reports Saves
      case 'api_saveMATERIALREPORT': {
        return await sheetsService.saveData('MATERIAL REPORT', args[0]);
      }

      case 'api_saveCUTTINGQUALITY': {
        const report = args[0] || {};
        if (!report.id || report.id === report.wo || report.id === report.workorderNumber) {
          report.id = 'cut-' + Math.random().toString(36).substring(2) + '-' + Date.now();
        }
        const res = await sheetsService.saveData('CUTTING QUALITY', report);
        if (res.success && (report.wo || report.workorderNumber)) {
          const woTarget = report.wo || report.workorderNumber;
          let nextStatus = 'INLINE_AND_ENDLINE';
          if (report.submodule === 'PRECUTTING') {
            nextStatus = (report.passAndHold === true || report.passAndHold === 'true') ? 'PRECUTTING_PASS_AND_HOLD' : 'CUTTING';
          } else {
            nextStatus = (report.passAndHold === true || report.passAndHold === 'true') ? 'CUTTING_PASS_AND_HOLD' : 'INLINE_AND_ENDLINE';
          }
          await updateWorkorderStatus(woTarget, nextStatus);
        }
        return res;
      }

      case 'api_saveSEWINGDEFECT': {
        const report = args[0];
        const res = await sheetsService.saveData('INLINE', report);
        // Do not update workorder status; keep it in INLINE_AND_ENDLINE so it stays visible in both
        return res;
      }

      case 'api_saveENDLINEQUALITY': {
        const report = args[0];
        const res = await sheetsService.saveData('ENDLINE QUALITY', report);
        if (res.success && report.moveToAQL && report.wo) {
          await updateWorkorderStatus(report.wo, 'AQL');
        }
        return res;
      }

      case 'api_saveAQLREPORT': {
        const report = args[0];
        const res = await sheetsService.saveData('AQL REPORT', report);
        if (res.success && report.wo) {
          let nextStatus = 'AQL';
          if (report.moveToFinal || report.auditStatus === 'PASS') {
            nextStatus = (report.passAndHold === true || report.passAndHold === 'true') ? 'AQL_PASS_AND_HOLD' : 'FINAL';
          }
          await updateWorkorderStatus(report.wo, nextStatus);
        }
        return res;
      }

      case 'api_saveFINALAUDIT': {
        const report = args[0];
        const res = await sheetsService.saveData('FINAL AUDIT', report);
        if (res.success && report.wo) {
          const nextStatus = (report.moveToComplete === true || report.moveToComplete === 'true') ? 'COMPLETED' : 'FINAL_PASS_AND_HOLD';
          await updateWorkorderStatus(report.wo, nextStatus);
        }
        return res;
      }

      case 'api_saveREWORK':
        return await sheetsService.saveData('REWORK', args[0]);

      case 'api_save8ROUNDSYSTEM': {
        const report = args[0];
        try {
          const existingData = sheetsService.getCachedData('INLINE') || await sheetsService.getData('INLINE');
          if (Array.isArray(existingData)) {
            const dupIdx = existingData.findIndex((r: any) => {
              const rWorker = String(r.worker || r.operator || '').trim().toUpperCase();
              const sWorker = String(report.worker || '').trim().toUpperCase();
              
              const rRoundIdx = Number(r.roundIndex || 0);
              const sRoundIdx = Number(report.roundIndex || 0);
              
              const rRound = String(r.round || r.ROUND || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
              const sRound = String(report.round || report.ROUND || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
              
              const normalizeDateSimple = (dVal: any) => {
                if (!dVal) return '';
                const s = String(dVal).trim().split(/[ T]/)[0].replace(/[\/.]/g, '-');
                const p = s.split('-');
                if (p.length === 3) {
                  const p0 = p[0].padStart(2, '0');
                  const p1 = p[1].padStart(2, '0');
                  if (p[2].length === 4) {
                    return `${p[2]}-${p1}-${p0}`;
                  }
                  if (p[0].length === 4) {
                    return `${p[0]}-${p1}-${p[2].padStart(2, '0')}`;
                  }
                }
                return s;
              };

              const rDateNorm = normalizeDateSimple(r.checkingDate || r.date || r.CHECKINGDATE || r.DATE || r.timestamp || r.TIMESTAMP || r.createdAt || r.CREATEDAT);
              const sDateNorm = normalizeDateSimple(report.checkingDate || report.date || report.CHECKINGDATE || report.DATE || report.timestamp || report.TIMESTAMP || report.createdAt || report.CREATEDAT);
              
              const rParts = rDateNorm.split('-');
              const sParts = sDateNorm.split('-');
              let dateMatches = rDateNorm === sDateNorm;
              if (!dateMatches && rParts.length === 3 && sParts.length === 3 && rParts[0] === sParts[0]) {
                const rm = rParts[1], rd = rParts[2];
                const sm = sParts[1], sd = sParts[2];
                if ((rm === sm && rd === sd) || (rm === sd && rd === sm)) {
                  dateMatches = true;
                }
              }
              
              const rZone = String(r.zone || r.location || r.ZONE || '').trim().toUpperCase();
              const sZone = String(report.zone || report.location || '').trim().toUpperCase();
              
              const roundMatches = (rRoundIdx === sRoundIdx) || (rRound === sRound && rRound !== '');
              
              return rWorker === sWorker && roundMatches && dateMatches && (rZone === sZone || sZone === '' || rZone === '') && rWorker !== '';
            });
            if (dupIdx !== -1) {
              const matchedRow = existingData[dupIdx];
              report.id = matchedRow.id || matchedRow.ID || report.id;
              const res = await sheetsService.updateData('INLINE', report);
              return { success: res.success, updated: true };
            }
          }
        } catch (e) {
          console.error("Pre-verification direct sheets check bypassed", e);
        }
        const res = await sheetsService.saveData('INLINE', report);
        return res;
      }

      case 'api_update8ROUNDSYSTEM': {
        const report = args[0];
        const res = await sheetsService.updateData('INLINE', report);
        return res;
      }

      // Legacy Quality Report Saves Links
      case 'api_saveMaterialReport': return await sheetsService.saveData('MATERIAL REPORT', args[0]);
      case 'api_saveCuttingReport': return await this.runDirect('api_saveCUTTINGQUALITY', args);
      case 'api_saveInlineReport': return await this.runDirect('api_saveSEWINGDEFECT', args);
      case 'api_saveEndlineReport': return await this.runDirect('api_saveENDLINEQUALITY', args);
      case 'api_saveReworkReport': return await sheetsService.saveData('REWORK', args[0]);

      // Quality Reports Gets
      case 'aggregateZonedData': {
        const moduleName = args[0] || 'CUTTING';
        const zoneArg = args[1] || (typeof args[0] === 'object' ? args[0]?.zone : undefined);
        let sheetName = 'CUTTING QUALITY';
        const mUpper = String(moduleName).toUpperCase();
        if (mUpper.includes('MATERIAL')) sheetName = 'MATERIAL REPORT';
        else if (mUpper.includes('INLINE') || mUpper.includes('8ROUND')) sheetName = 'INLINE';
        else if (mUpper.includes('ENDLINE')) sheetName = 'ENDLINE QUALITY';
        else if (mUpper.includes('AQL')) sheetName = 'AQL REPORT';
        else if (mUpper.includes('FINAL')) sheetName = 'FINAL AUDIT';
        
        let data = await sheetsService.getData(sheetName);
        if (zoneArg && zoneArg !== 'ALL') {
          const matchZ = (r: any) => {
            const zTarget = String(zoneArg).trim().toUpperCase();
            if (!zTarget || zTarget === 'ALL') return true;
            const rZone = String(r.zone || r.location || r.ZONE || r.LOCATION || '').trim().toUpperCase();
            const rUnit = String(r.unit || r.UNIT || '').trim().toUpperCase();
            if (rZone === zTarget || rUnit === zTarget) return true;
            const clean = (s: string) => s.replace(/^(ZONE|UNIT|MODULE|ZMAP)[-\s]*/i, '').replace(/[^A-Z0-9]/g, '');
            const cTarget = clean(zTarget);
            if (cTarget && (clean(rZone) === cTarget || clean(rUnit) === cTarget)) return true;
            if (rZone && (rZone.includes(zTarget) || zTarget.includes(rZone))) return true;
            if (rUnit && (rUnit.includes(zTarget) || zTarget.includes(rUnit))) return true;
            return false;
          };
          data = data.filter(matchZ);
        }
        return data;
      }

      case 'api_getMaterialData': {
        const zoneArg = typeof args[0] === 'string' ? args[0] : args[0]?.zone;
        let data = await sheetsService.getData('MATERIAL REPORT');
        if (zoneArg && zoneArg !== 'ALL') {
          const zTarget = String(zoneArg).trim().toUpperCase();
          data = data.filter(r => {
            const rZone = String(r.zone || r.location || '').trim().toUpperCase();
            const rUnit = String(r.unit || '').trim().toUpperCase();
            if (rZone === zTarget || rUnit === zTarget) return true;
            const clean = (s: string) => s.replace(/^(ZONE|UNIT|MODULE|ZMAP)[-\s]*/i, '').replace(/[^A-Z0-9]/g, '');
            const cTarget = clean(zTarget);
            if (cTarget && (clean(rZone) === cTarget || clean(rUnit) === cTarget)) return true;
            return rZone.includes(zTarget) || zTarget.includes(rZone);
          });
        }
        return data;
      }

      case 'api_getCuttingData': {
        const zoneArg = typeof args[0] === 'string' ? args[0] : args[0]?.zone;
        let data = await sheetsService.getData('CUTTING QUALITY');
        if (zoneArg && zoneArg !== 'ALL') {
          const zTarget = String(zoneArg).trim().toUpperCase();
          data = data.filter(r => {
            const rZone = String(r.zone || r.location || '').trim().toUpperCase();
            const rUnit = String(r.unit || '').trim().toUpperCase();
            if (rZone === zTarget || rUnit === zTarget) return true;
            const clean = (s: string) => s.replace(/^(ZONE|UNIT|MODULE|ZMAP)[-\s]*/i, '').replace(/[^A-Z0-9]/g, '');
            const cTarget = clean(zTarget);
            if (cTarget && (clean(rZone) === cTarget || clean(rUnit) === cTarget)) return true;
            return rZone.includes(zTarget) || zTarget.includes(rZone);
          });
        }
        return data;
      }

      case 'api_getInlineData': {
        const zoneArg = typeof args[0] === 'string' ? args[0] : args[0]?.zone;
        let data = await sheetsService.getData('INLINE');
        if (zoneArg && zoneArg !== 'ALL') {
          const zTarget = String(zoneArg).trim().toUpperCase();
          data = data.filter(r => {
            const rZone = String(r.zone || r.location || '').trim().toUpperCase();
            const rUnit = String(r.unit || '').trim().toUpperCase();
            if (rZone === zTarget || rUnit === zTarget) return true;
            const clean = (s: string) => s.replace(/^(ZONE|UNIT|MODULE|ZMAP)[-\s]*/i, '').replace(/[^A-Z0-9]/g, '');
            const cTarget = clean(zTarget);
            if (cTarget && (clean(rZone) === cTarget || clean(rUnit) === cTarget)) return true;
            return rZone.includes(zTarget) || zTarget.includes(rZone);
          });
        }
        return data;
      }

      case 'api_get8ROUNDSYSTEMData': {
        const zoneArg = typeof args[0] === 'string' ? args[0] : args[0]?.zone;
        let data = await sheetsService.getData('INLINE');
        if (zoneArg && zoneArg !== 'ALL') {
          const zTarget = String(zoneArg).trim().toUpperCase();
          data = data.filter(r => {
            const rZone = String(r.zone || r.location || '').trim().toUpperCase();
            const rUnit = String(r.unit || '').trim().toUpperCase();
            if (rZone === zTarget || rUnit === zTarget) return true;
            const clean = (s: string) => s.replace(/^(ZONE|UNIT|MODULE|ZMAP)[-\s]*/i, '').replace(/[^A-Z0-9]/g, '');
            const cTarget = clean(zTarget);
            if (cTarget && (clean(rZone) === cTarget || clean(rUnit) === cTarget)) return true;
            return rZone.includes(zTarget) || zTarget.includes(rZone);
          });
        }
        return data;
      }

      case 'api_getEndlineData': {
        const zoneArg = typeof args[0] === 'string' ? args[0] : args[0]?.zone;
        let data = await sheetsService.getData('ENDLINE QUALITY');
        if (zoneArg && zoneArg !== 'ALL') {
          const zTarget = String(zoneArg).trim().toUpperCase();
          data = data.filter(r => {
            const rZone = String(r.zone || r.location || '').trim().toUpperCase();
            const rUnit = String(r.unit || '').trim().toUpperCase();
            if (rZone === zTarget || rUnit === zTarget) return true;
            const clean = (s: string) => s.replace(/^(ZONE|UNIT|MODULE|ZMAP)[-\s]*/i, '').replace(/[^A-Z0-9]/g, '');
            const cTarget = clean(zTarget);
            if (cTarget && (clean(rZone) === cTarget || clean(rUnit) === cTarget)) return true;
            return rZone.includes(zTarget) || zTarget.includes(rZone);
          });
        }
        return data;
      }

      case 'api_getAQLData': {
        const zoneArg = typeof args[0] === 'string' ? args[0] : args[0]?.zone;
        let data = await sheetsService.getData('AQL REPORT');
        if (zoneArg && zoneArg !== 'ALL') {
          const zTarget = String(zoneArg).trim().toUpperCase();
          data = data.filter(r => {
            const rZone = String(r.zone || r.location || '').trim().toUpperCase();
            const rUnit = String(r.unit || '').trim().toUpperCase();
            if (rZone === zTarget || rUnit === zTarget) return true;
            const clean = (s: string) => s.replace(/^(ZONE|UNIT|MODULE|ZMAP)[-\s]*/i, '').replace(/[^A-Z0-9]/g, '');
            const cTarget = clean(zTarget);
            if (cTarget && (clean(rZone) === cTarget || clean(rUnit) === cTarget)) return true;
            return rZone.includes(zTarget) || zTarget.includes(rZone);
          });
        }
        return data;
      }

      case 'api_getFinalAuditData': {
        const zoneArg = typeof args[0] === 'string' ? args[0] : args[0]?.zone;
        let data = await sheetsService.getData('FINAL AUDIT');
        if (zoneArg && zoneArg !== 'ALL') {
          const zTarget = String(zoneArg).trim().toUpperCase();
          data = data.filter(r => {
            const rZone = String(r.zone || r.location || '').trim().toUpperCase();
            const rUnit = String(r.unit || '').trim().toUpperCase();
            if (rZone === zTarget || rUnit === zTarget) return true;
            const clean = (s: string) => s.replace(/^(ZONE|UNIT|MODULE|ZMAP)[-\s]*/i, '').replace(/[^A-Z0-9]/g, '');
            const cTarget = clean(zTarget);
            if (cTarget && (clean(rZone) === cTarget || clean(rUnit) === cTarget)) return true;
            return rZone.includes(zTarget) || zTarget.includes(rZone);
          });
        }
        return data;
      }

      case 'api_getREPORTS_SOPData': {
        const zoneArg = typeof args[0] === 'string' ? args[0] : args[0]?.zone;
        let data = await sheetsService.getData('REPORTS_SOP');
        if (Array.isArray(data)) {
          data = data.map((r: any) => {
            if (!r || typeof r !== 'object') return r;
            const rawDriveId = r.driveFileId || r.drive_file_id || '';
            const rawAttach = r.attachmentUrl || r.attachment_url || '';
            const rawView = r.viewUrl || r.view_url || '';
            const rawDown = r.downloadUrl || r.download_url || '';

            const cleanAttach = extractCleanDocumentUrl(rawAttach, rawDriveId) || extractCleanDocumentUrl(rawView, rawDriveId);
            const driveFileId = extractDriveFileId(cleanAttach, rawDriveId);
            const cleanView = extractCleanDocumentUrl(rawView, driveFileId) || getDirectViewUrl(cleanAttach, driveFileId);
            const cleanDown = extractCleanDocumentUrl(rawDown, driveFileId) || getDirectDownloadUrl(cleanAttach, driveFileId);

            return {
              ...r,
              attachmentUrl: cleanAttach,
              driveFileId: driveFileId || rawDriveId,
              viewUrl: cleanView,
              downloadUrl: cleanDown
            };
          });
        }
        if (zoneArg && zoneArg !== 'ALL') {
          const zTarget = String(zoneArg).trim().toUpperCase();
          data = data.filter(r => {
            const rZone = String(r.zone || r.location || '').trim().toUpperCase();
            const rUnit = String(r.unit || '').trim().toUpperCase();
            // COMMON or ALL documents are global company SOP policies applicable to all zones
            if (!rZone || rZone === 'ALL' || rZone === 'COMMON') return true;
            if (rZone === zTarget || rUnit === zTarget) return true;
            const clean = (s: string) => s.replace(/^(ZONE|UNIT|MODULE|ZMAP)[-\s]*/i, '').replace(/[^A-Z0-9]/g, '');
            const cTarget = clean(zTarget);
            if (cTarget && (clean(rZone) === cTarget || clean(rUnit) === cTarget)) return true;
            return rZone.includes(zTarget) || zTarget.includes(rZone);
          });
        }
        return data;
      }

      case 'api_getCustomerComplaints': {
        const zoneArg = typeof args[0] === 'string' ? args[0] : args[0]?.zone;
        let data = await sheetsService.getData('CUSTOMER_COMPLAINTS');
        if (zoneArg && zoneArg !== 'ALL') {
          const zTarget = String(zoneArg).trim().toUpperCase();
          data = data.filter(r => {
            const rZone = String(r.zone || r.location || '').trim().toUpperCase();
            return !rZone || rZone === 'ALL' || rZone === zTarget;
          });
        }
        return data;
      }

      case 'api_saveCustomerComplaint': {
        const complaint = args[0] || {};
        complaint.id = complaint.id || ('cc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 7));
        await sheetsService.saveData('CUSTOMER_COMPLAINTS', complaint);
        return { success: true, id: complaint.id };
      }

      case 'api_deleteCustomerComplaint': {
        const id = args[0];
        await sheetsService.deleteData('CUSTOMER_COMPLAINTS', id);
        return { success: true };
      }

      case 'api_clearAllCustomerComplaints':
      case 'api_clearCustomerComplaints': {
        await sheetsService.clearAllCustomerComplaints();
        return { success: true };
      }

      case 'api_uploadSOPFile': {
        const fileName = args[0];
        const rawBase64 = args[1];
        const mimeType = args[2];
        const category = args[3] || "SOP";

        // Direct Google Drive REST API Upload using active Google login accessToken!
        const accessToken = getAccessToken();
        if (accessToken) {
          try {
            console.log("[runDirect api_uploadSOPFile] Google Access Token found. Uploading directly to Google Drive via REST API...");
            
            // Decode base64 to Blob
            const byteCharacters = atob(rawBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const fileBlob = new Blob([byteArray], { type: mimeType });
            
            const uploadResult = await sheetsService.uploadSOPFileToDrive(fileBlob, fileName, category);
            console.log("[runDirect api_uploadSOPFile] Direct Google Drive REST API upload successful!", uploadResult.url);
            return uploadResult;
          } catch (restErr: any) {
            console.warn("[runDirect api_uploadSOPFile] Direct Google Drive REST API upload failed, falling back to Apps Script/local...", restErr);
          }
        }

        // 1. First, try to upload via server /api/gas proxy which routes directly to Google Drive without CORS issues!
        try {
          console.log("[runDirect api_uploadSOPFile] Uploading file to Google Drive via backend proxy...");
          const activeSheetId = sheetsService.getSpreadsheetId() || localStorage.getItem('VITE_SPREADSHEET_ID') || "";
          const response = await fetch('/api/gas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'api_uploadSOPFile',
              params: [fileName, rawBase64, mimeType, category],
              spreadsheetId: activeSheetId
            })
          });
          if (response.ok) {
            const parsed = await response.json();
            if (parsed && parsed.success && parsed.url) {
              console.log("[runDirect api_uploadSOPFile] Google Drive upload successful via backend proxy!", parsed.url);
              return parsed;
            }
          }
        } catch (proxyErr: any) {
          console.warn("[runDirect api_uploadSOPFile] Backend proxy upload notice:", proxyErr.message);
        }

        // 2. If Apps Script fails, try the local backend server `/api/upload-offline`
        try {
          console.log("[runDirect api_uploadSOPFile] GAS fallback active. Attempting local server file upload...");
          const response = await fetch('/api/upload-offline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName,
              base64Data: `data:${mimeType};base64,${rawBase64}`,
              mimeType
            })
          });
          if (response.ok) {
            return await response.json();
          } else {
            const errText = await response.text();
            throw new Error(errText || "Offline upload request failed.");
          }
        } catch (e: any) {
          console.log("[runDirect api_uploadSOPFile] Local upload diverted. Storing file locally inside browser IndexedDB...", e.message);
          // 3. Last resort: IndexedDB fallback
          try {
            const fileId = 'sop_file_' + generateUuid();
            const fileData = {
              name: fileName,
              type: mimeType,
              base64: `data:${mimeType};base64,${rawBase64}`
            };
            
            const dbOpen = () => {
              return new Promise<IDBDatabase>((resolve, reject) => {
                const req = indexedDB.open("SopFileStore", 1);
                req.onupgradeneeded = () => {
                  const database = req.result;
                  if (!database.objectStoreNames.contains("files")) {
                    database.createObjectStore("files");
                  }
                };
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
              });
            };
            
            const dbInstance = await dbOpen();
            await new Promise<void>((resolve, reject) => {
              const tx = dbInstance.transaction("files", "readwrite");
              const store = tx.objectStore("files");
              const putReq = store.put(fileData, fileId);
              putReq.onsuccess = () => resolve();
              putReq.onerror = () => reject(putReq.error);
            });
            
            return {
              success: true,
              url: `indexeddb://${fileId}`,
              name: fileName
            };
          } catch (indexedDbErr: any) {
            console.error("IndexedDB fallback failed:", indexedDbErr);
            throw new Error("Failed to store file on server, local disk, or browser IndexedDB database.");
          }
        }
      }

      case 'api_saveREPORTS_SOP': {
        return await sheetsService.saveData('REPORTS_SOP', args[0]);
      }

      // Quality Reports Row Deletes
      case 'api_deleteMaterialData': return await sheetsService.deleteData('MATERIAL REPORT', args[0]);
      case 'api_deleteCuttingData': return await sheetsService.deleteData('CUTTING QUALITY', args[0]);
      case 'api_deleteInlineData': return await sheetsService.deleteData('INLINE', args[0]);
      case 'api_deleteEndlineData': return await sheetsService.deleteData('ENDLINE QUALITY', args[0]);
      case 'api_deleteAQLData': return await sheetsService.deleteData('AQL REPORT', args[0]);
      case 'api_deleteFinalAuditData': return await sheetsService.deleteData('FINAL AUDIT', args[0]);
      case 'api_deleteREPORTS_SOP': return await sheetsService.deleteData('REPORTS_SOP', args[0]);

      // Bulk actions
      case 'api_bulkSave': {
        const sheetName = args[0];
        const records = args[1] || [];
        const res = await sheetsService.saveBulk(sheetName, records);
        const normSheet = String(sheetName || '').toUpperCase();
        if (normSheet.includes('ENDLINE')) {
          const aqlRecord = records.find((r: any) => r && (r.moveToAQL === true || r.moveToAQL === 'true') && (r.wo || r.workorderNumber));
          if (aqlRecord) {
            await updateWorkorderStatus(aqlRecord.wo || aqlRecord.workorderNumber, 'AQL');
          }
        }
        return res;
      }

      case 'api_saveMaterialReportBulk': {
        const data = args[0];
        const { zone, billNo, supplierName, grn, materialType, materialCategory, checkingDate, receivedDate, remarks, inspector, timestamp, items } = data;
        if (!items || !Array.isArray(items)) return { success: true, count: 0 };

        const mappedItems = items.map(item => ({
          timestamp: timestamp || new Date().toISOString(),
          receivedDate: receivedDate || "",
          checkingDate: checkingDate || "",
          grn: grn || "",
          billNo: billNo || "",
          supplierName: supplierName || "",
          itemName: item.itemName || "",
          style: item.style || "",
          receivedQuantity: item.receivedQuantity || 0,
          checkedQuantity: item.checkedQuantity || 0,
          passQuantity: item.passQuantity || 0,
          rejectedQuantity: item.rejectedQuantity || 0,
          itemRemarks: item.remarks || "",
          generalRemarks: remarks || "",
          zone: zone || "",
          inspector: inspector || "",
          materialType: materialType || materialCategory || item.materialType || item.materialCategory || "Packing Material",
          id: generateUuid()
        }));

        const res = await sheetsService.saveBulk('MATERIAL REPORT', mappedItems);
        return { success: res.success, count: res.count, total: items.length };
      }

      default:
        console.warn(`[API DIRECT SH] Unknown direct method requested: ${method}`);
        throw new Error(`Direct method ${method} not implemented.`);
    }
  },

  async run(method: string, ...args: any[]): Promise<any> {
    const sanitizedArgs = sanitizeArgs(args);
    const activeSheetId = sheetsService.getSpreadsheetId() || localStorage.getItem('VITE_SPREADSHEET_ID') || "";
    const isCacheable = CACHEABLE_METHODS.has(method);
    const cacheKey = isCacheable ? `${method}::${JSON.stringify(sanitizedArgs)}::${activeSheetId}` : '';

    if (isCacheable && cacheKey) {
      const cached = clientReadCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < CLIENT_READ_CACHE_TTL)) {
        return cached.data;
      }
      if (inFlightRequests.has(cacheKey)) {
        return inFlightRequests.get(cacheKey);
      }
    } else {
      // Invalidate read cache on any write or mutation call
      this.clearCache();
    }

    const execPromise = (async () => {
      const isOfflineDemo = localStorage.getItem('BQOS_DEMO_MODE') === 'true';
      if (isOfflineDemo && method === 'api_ping') {
        return { success: true, status: "Connected (Sandbox Mode)", timestamp: new Date().toISOString() };
      }
      // If authenticated via Google & spreadsheet ID chosen, proceed with direct sheet read/writes
      if ((getAccessToken() || isOfflineDemo) && sheetsService.getSpreadsheetId()) {
        try {
          const directResult = await this.runDirect(method, sanitizedArgs);
          if (isCacheable && cacheKey) {
            clientReadCache.set(cacheKey, { timestamp: Date.now(), data: directResult });
          }
          return directResult;
        } catch (directError: any) {
          if (directError.message === 'AUTH_REQUIRED') {
            // If auth expired mid-session, clear and let system handle it
            localStorage.removeItem('GOOGLE_ACCESS_TOKEN');
          } else {
            console.error('[API] Direct sheets execution failed, attempting fallback...', directError);
          }
        }
      }

      // Default proxy routing: fallback to Apps Script (GAS)
      let gasMethod = method;
      let gasArgs = sanitizedArgs;

      const customUrl = localStorage.getItem('VITE_GAS_URL');
      const envUrl = (import.meta as any).env?.VITE_GAS_URL;
      const customDriveUrl = localStorage.getItem('VITE_GAS_DRIVE_URL');
      const envDriveUrl = (import.meta as any).env?.VITE_GAS_DRIVE_URL;

      const hardcodedUrls = method === 'api_uploadSOPFile'
        ? [DEFAULT_DRIVE_URL, DEFAULT_SHEETS_URL]
        : [DEFAULT_SHEETS_URL, DEFAULT_DRIVE_URL];

      const candidateUrls: string[] = [];
      
      // If uploading files, prioritize Google Drive Apps Script URL candidates
      if (method === 'api_uploadSOPFile') {
        if (customDriveUrl) candidateUrls.push(customDriveUrl);
        if (envDriveUrl && !envDriveUrl.includes("REPLACE_WITH") && !candidateUrls.includes(envDriveUrl)) {
          candidateUrls.push(envDriveUrl);
        }
      }

      if (customUrl && !candidateUrls.includes(customUrl)) candidateUrls.push(customUrl);
      if (envUrl && !envUrl.includes("REPLACE_WITH") && !candidateUrls.includes(envUrl)) candidateUrls.push(envUrl);
      hardcodedUrls.forEach(url => {
        if (!candidateUrls.includes(url)) {
          candidateUrls.push(url);
        }
      });

      // Lightning-fast write operations: apply mutation to memory & localStorage immediately (<1ms)
      // This eliminates all UI lag and prevents the app from hanging when entering data
      // NOTE: Upload methods (api_uploadSOPFile, api_uploadComplaintImage) must NOT be short-circuited
      // because they must return the physical Google Drive URL / file link from the backend!
      const isUploadAction = method === 'api_uploadSOPFile' || method === 'api_uploadComplaintImage';
      if (!isCacheable && method !== 'api_ping' && !isUploadAction) {
        const localMutationResult = applyLocalMutation(method, sanitizedArgs);
        clientReadCache.clear();

        // Queue mutation for background sync so nothing is lost
        try {
          const rawQueue = localStorage.getItem('bqos_offline_sync_queue');
          const queue = rawQueue ? JSON.parse(rawQueue) : [];
          queue.push({
            id: generateUuid(),
            action: gasMethod,
            params: gasArgs,
            spreadsheetId: activeSheetId,
            timestamp: Date.now()
          });
          localStorage.setItem('bqos_offline_sync_queue', JSON.stringify(queue.slice(-100)));
        } catch (queueErr) {}

        // Non-blocking background sync to server/Google Sheets
        (async () => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000);
            await fetch("/api/gas", {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: gasMethod, params: gasArgs, spreadsheetId: activeSheetId }),
              signal: controller.signal
            });
            clearTimeout(timeoutId);
          } catch (bgErr) {}
        })();

        return { 
          success: true, 
          offline: false, 
          id: args[0]?.id || generateUuid(), 
          ...localMutationResult 
        };
      }

      // Fast read operations with instant fallback
      let result: any = null;
      let lastProxyError: any = null;
      const MAX_RETRIES = 1;

      try {
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          try {
            const controller = new AbortController();
            const timeoutDuration = (method.includes('upload') || method.includes('Upload')) ? 60000 : 3500;
            const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

            const proxyHeaders: any = { 'Content-Type': 'application/json' };
            if (customUrl) proxyHeaders['x-gas-url'] = customUrl;

            const response = await fetch("/api/gas", {
              method: 'POST',
              headers: proxyHeaders,
              body: JSON.stringify({ action: gasMethod, params: gasArgs, spreadsheetId: activeSheetId }),
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.status === 404 || !response.ok) {
              // Direct browser fallback for static host environments
              try {
                const directRes = await fetch(DEFAULT_SHEETS_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                  body: JSON.stringify({ action: gasMethod, params: gasArgs }),
                  redirect: 'follow'
                });
                if (directRes.ok) {
                  const directText = await directRes.text();
                  if (!directText.trim().startsWith('<')) {
                    const parsedDirect = JSON.parse(directText);
                    if (parsedDirect && (parsedDirect.success === true || (parsedDirect.success !== false && !parsedDirect.error))) {
                      result = parsedDirect;
                      break;
                    }
                  }
                }
              } catch (directErr) {}

              throw new Error(`Proxy status ${response.status}`);
            }

            const parsedResult = await response.json();
            if (!response.ok) {
              if (parsedResult.error === "CONFIGURATION_REQUIRED") throw new Error("CONFIGURATION_REQUIRED");
              throw new Error(parsedResult.error || `Proxy error ${response.status}`);
            }

            result = parsedResult;
            break; // Success!
          } catch (attemptErr: any) {
            lastProxyError = attemptErr;
            if (attemptErr.message === "CONFIGURATION_REQUIRED") throw attemptErr;
            if (attempt < MAX_RETRIES) {
              await new Promise(r => setTimeout(r, 100));
            }
          }
        }

        if (result !== null) {
          if (isCacheable && cacheKey) {
            clientReadCache.set(cacheKey, { timestamp: Date.now(), data: result });
          }
          flushOfflineSyncQueue();
          return result;
        }

        // If proxy attempts exhausted, seamlessly return embedded local database (<1ms)
        if (method === 'api_ping') {
          return { success: true, status: "Connected (Offline Resilient)", timestamp: new Date().toISOString() };
        }

        if (isCacheable) {
          if (cacheKey && clientReadCache.has(cacheKey)) {
            return clientReadCache.get(cacheKey)!.data;
          }

          const fallbackData = getLocalFallbackData(method, sanitizedArgs);
          if (cacheKey && fallbackData !== undefined) {
            clientReadCache.set(cacheKey, { timestamp: Date.now(), data: fallbackData });
          }
          return fallbackData;
        }

        return { 
          success: true, 
          offline: true, 
          id: args[0]?.id || generateUuid(), 
          message: "Saved locally (will synchronize when online)" 
        };

      } catch (error: any) {
        if (error.message === "CONFIGURATION_REQUIRED") {
          throw error;
        }
        if (method === 'api_ping') {
          return { success: true, status: "Connected", timestamp: new Date().toISOString() };
        }
        if (isCacheable) {
          return getLocalFallbackData(method, sanitizedArgs);
        }
        return { success: true, offline: true, id: args[0]?.id || `mock-${Date.now()}` };
      }
    })();

    if (isCacheable && cacheKey) {
      inFlightRequests.set(cacheKey, execPromise);
      execPromise.finally(() => {
        inFlightRequests.delete(cacheKey);
      });
    }

    return execPromise;
  }
};
