import { sheetsService, DEFAULT_SETTINGS } from './sheetsService';
import { getAccessToken, db } from './auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
  { userCode: 'U001', username: 'user1', password: 'pass1', role: 'USER', location: 'KERALA', restrictions: [], canDownload: true },
  { userCode: 'A001', username: 'admin', password: 'admin123', role: 'ADMIN', location: 'KERALA', restrictions: [], canDownload: true },
  { userCode: 'W001', username: 'wo1', password: '123', role: 'WORKORDER', location: 'KERALA', restrictions: [], canDownload: true }
];

async function updateWorkorderStatus(woNum: string, nextStatus: string) {
  try {
    const workorders = await sheetsService.getData('WORKORDER');
    const matched = workorders.find(w => String(w.workorderNumber) === String(woNum));
    if (matched) {
      matched.status = nextStatus;
      await sheetsService.updateData('WORKORDER', matched);
    }
  } catch (e) {
    console.warn("Failed to update status on sheet:", e);
  }
}

export const api = {
  isServerConfigured: false,

  async getServerConfig() {
    try {
      // 1. Fetch server config state
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);
      const response = await fetch("/api/config", { signal: controller.signal });
      clearTimeout(id);
      const data = await response.json();

      // 2. Try loading custom persistent config from Firestore
      let firestoreUrl = "";
      let firestoreSpreadsheetId = "";
      try {
        const docRef = doc(db, "system_config", "global");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const configData = docSnap.data();
          firestoreUrl = configData.gasUrl || "";
          firestoreSpreadsheetId = configData.spreadsheetId || "";
        }
      } catch (fe) {
        console.warn("[FIRESTORE] Optional load config failed:", fe);
      }

      // 3. Fallback and local sync
      const localUrl = localStorage.getItem('VITE_GAS_URL');
      const localSpreadsheetId = localStorage.getItem('VITE_SPREADSHEET_ID');

      const serverUrl = data.gasUrl || "";
      const serverSpreadsheetId = data.spreadsheetId || "";

      // Final resolved values
      const finalUrl = serverUrl || firestoreUrl || localUrl || "";
      const finalSpreadsheetId = serverSpreadsheetId || firestoreSpreadsheetId || localSpreadsheetId || "";

      // Update client localStorage to match the resolved server/firestore/local values
      if (finalUrl && finalUrl.startsWith("https://script.google.com/macros/s/")) {
        if (localUrl !== finalUrl) {
          localStorage.setItem('VITE_GAS_URL', finalUrl);
        }
      }
      if (finalSpreadsheetId) {
        if (localSpreadsheetId !== finalSpreadsheetId) {
          localStorage.setItem('VITE_SPREADSHEET_ID', finalSpreadsheetId);
        }
      }

      // Safe Auto-Heal: Only write custom config to the server if both are valid AND different from server's current state
      const isServerMissingConfig = !serverUrl || !serverSpreadsheetId || data.source === 'hardcoded';
      const isClientConfigValid = !!(finalUrl && finalUrl.startsWith("https://script.google.com/macros/s/") && finalSpreadsheetId);
      
      if (isServerMissingConfig && isClientConfigValid) {
        const urlChanged = serverUrl !== finalUrl;
        const sheetChanged = serverSpreadsheetId !== finalSpreadsheetId;
        
        if (urlChanged || sheetChanged) {
          console.log("[AUTO-HEAL] Re-registering complete custom GAS Web App URL and Spreadsheet ID on server proxy...");
          await fetch("/api/save-config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: finalUrl, spreadsheetId: finalSpreadsheetId })
          }).catch(() => {});
          data.hasGasUrl = true;
          data.isPermanent = true;
          data.source = 'file';
          data.gasUrl = finalUrl;
          data.spreadsheetId = finalSpreadsheetId;
        }
      }

      if (data && (data.gasUrl || finalUrl)) {
        this.isServerConfigured = true;
      }
      return data;
    } catch (e) {
      return { hasGasUrl: false };
    }
  },

  async saveServerConfig(url: string, spreadsheetId?: string) {
    try {
      const finalUrl = url || localStorage.getItem('VITE_GAS_URL') || "";
      const finalSpreadsheetId = spreadsheetId || localStorage.getItem('VITE_SPREADSHEET_ID') || "";

      if (finalUrl) localStorage.setItem('VITE_GAS_URL', finalUrl);
      if (finalSpreadsheetId) localStorage.setItem('VITE_SPREADSHEET_ID', finalSpreadsheetId);

      let resData = { success: true, message: "Local settings saved." };
      
      // Save Google Script URL on the local proxy
      const payload: any = {};
      if (finalUrl && finalUrl.startsWith("https://script.google.com/macros/s/")) {
        payload.url = finalUrl;
      }
      if (finalSpreadsheetId) {
        payload.spreadsheetId = finalSpreadsheetId;
      }

      if (Object.keys(payload).length > 0) {
        const response = await fetch("/api/save-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        resData = await response.json();
      }

      // Share configuration in remote Firestore securely
      try {
        const docRef = doc(db, "system_config", "global");
        const fbPayload: any = {
          updatedAt: new Date().toISOString()
        };
        if (finalUrl) fbPayload.gasUrl = finalUrl;
        if (finalSpreadsheetId) fbPayload.spreadsheetId = finalSpreadsheetId;
        
        await setDoc(docRef, fbPayload, { merge: true });
        console.log("[FIRESTORE] Connection config persisted.");
      } catch (fe) {
        console.error("[FIRESTORE] Failed to save config:", fe);
      }

      return resData;
    } catch (e: any) {
      console.error("[CONFIG] Failed to save configuration:", e);
      return { success: false, error: e.message || "Failed to save configuration." };
    }
  },

  disconnect() {
    localStorage.removeItem('VITE_GAS_URL');
    localStorage.removeItem('VITE_SPREADSHEET_ID');
    localStorage.removeItem('GOOGLE_ACCESS_TOKEN');
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
          workorders = workorders.filter(w => {
            const zVal = String(w.zone || w.location || '').toUpperCase().trim();
            return zVal === String(zone).toUpperCase().trim();
          });
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
        const report = args[0];
        const res = await sheetsService.saveData('CUTTING QUALITY', report);
        if (res.success && report.moveToInline && report.wo) {
          await updateWorkorderStatus(report.wo, 'INLINE_AND_ENDLINE');
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
        if (res.success && (report.moveToFinal || report.auditStatus === 'PASS') && report.wo) {
          await updateWorkorderStatus(report.wo, 'FINAL');
        }
        return res;
      }

      case 'api_saveFINALAUDIT': {
        const report = args[0];
        const res = await sheetsService.saveData('FINAL AUDIT', report);
        if (res.success && report.wo) {
          await updateWorkorderStatus(report.wo, 'COMPLETED');
        }
        return res;
      }

      case 'api_saveREWORK':
        return await sheetsService.saveData('REWORK', args[0]);

      case 'api_save8ROUNDSYSTEM': {
        const report = args[0];
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
      case 'api_getMaterialData': {
        const zone = args[0]?.zone;
        let data = await sheetsService.getData('MATERIAL REPORT');
        if (zone && zone !== 'ALL') {
          data = data.filter(r => String(r.zone || r.location || '').toUpperCase() === String(zone).toUpperCase());
        }
        return data;
      }

      case 'api_getCuttingData': {
        const zone = args[0]?.zone;
        let data = await sheetsService.getData('CUTTING QUALITY');
        if (zone && zone !== 'ALL') {
          data = data.filter(r => String(r.zone || r.location || '').toUpperCase() === String(zone).toUpperCase());
        }
        return data;
      }

      case 'api_getInlineData': {
        const zone = args[0]?.zone;
        let data = await sheetsService.getData('INLINE');
        if (zone && zone !== 'ALL') {
          data = data.filter(r => String(r.zone || r.location || '').toUpperCase() === String(zone).toUpperCase());
        }
        return data;
      }

      case 'api_get8ROUNDSYSTEMData': {
        const zone = args[0]?.zone;
        let data = await sheetsService.getData('INLINE');
        if (zone && zone !== 'ALL') {
          data = data.filter(r => String(r.zone || r.location || '').toUpperCase() === String(zone).toUpperCase());
        }
        return data;
      }

      case 'api_getEndlineData': {
        const zone = args[0]?.zone;
        let data = await sheetsService.getData('ENDLINE QUALITY');
        if (zone && zone !== 'ALL') {
          data = data.filter(r => String(r.zone || r.location || '').toUpperCase() === String(zone).toUpperCase());
        }
        return data;
      }

      case 'api_getAQLData': {
        const zone = args[0]?.zone;
        let data = await sheetsService.getData('AQL REPORT');
        if (zone && zone !== 'ALL') {
          data = data.filter(r => String(r.zone || r.location || '').toUpperCase() === String(zone).toUpperCase());
        }
        return data;
      }

      case 'api_getFinalAuditData': {
        const zone = args[0]?.zone;
        let data = await sheetsService.getData('FINAL AUDIT');
        if (zone && zone !== 'ALL') {
          data = data.filter(r => String(r.zone || r.location || '').toUpperCase() === String(zone).toUpperCase());
        }
        return data;
      }

      // Quality Reports Row Deletes
      case 'api_deleteMaterialData': return await sheetsService.deleteData('MATERIAL REPORT', args[0]);
      case 'api_deleteCuttingData': return await sheetsService.deleteData('CUTTING QUALITY', args[0]);
      case 'api_deleteInlineData': return await sheetsService.deleteData('INLINE', args[0]);
      case 'api_deleteEndlineData': return await sheetsService.deleteData('ENDLINE QUALITY', args[0]);
      case 'api_deleteAQLData': return await sheetsService.deleteData('AQL REPORT', args[0]);
      case 'api_deleteFinalAuditData': return await sheetsService.deleteData('FINAL AUDIT', args[0]);

      // Bulk actions
      case 'api_bulkSave':
        return await sheetsService.saveBulk(args[0], args[1]);

      case 'api_saveMaterialReportBulk': {
        const data = args[0];
        const { zone, billNo, supplierName, grn, checkingDate, receivedDate, remarks, inspector, timestamp, items } = data;
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

  async run(method: string, ...args: any[]) {
    const sanitizedArgs = sanitizeArgs(args);

    // Immediate offline cache synchronization for user management operations
    if (method === 'api_saveUser') {
      try {
        const u = sanitizedArgs[0];
        const key = 'bqos_local_sheet_USERS';
        const current = JSON.parse(localStorage.getItem(key) || '[]');
        const filtered = current.filter((item: any) => item.userCode !== u.userCode);
        filtered.push({
          userCode: u.userCode,
          username: u.username,
          password: u.password,
          role: u.role,
          location: u.location,
          restrictions: u.restrictions || [],
          canDownload: u.canDownload !== false,
          createdAt: u.createdAt || new Date().toISOString()
        });
        localStorage.setItem(key, JSON.stringify(filtered));
      } catch (e) {
        console.error("Failed to copy saved user to offline localStorage cache:", e);
      }
    } else if (method === 'api_updateUser') {
      try {
        const u = sanitizedArgs[0];
        const key = 'bqos_local_sheet_USERS';
        const current = JSON.parse(localStorage.getItem(key) || '[]');
        const idx = current.findIndex((item: any) => item.userCode === u.userCode);
        if (idx !== -1) {
          current[idx] = { ...current[idx], ...u };
        } else {
          current.push(u);
        }
        localStorage.setItem(key, JSON.stringify(current));
      } catch (e) {
        console.error("Failed to update user in offline localStorage cache:", e);
      }
    } else if (method === 'api_deleteUser') {
      try {
        const userCode = sanitizedArgs[0];
        const key = 'bqos_local_sheet_USERS';
        const current = JSON.parse(localStorage.getItem(key) || '[]');
        const filtered = current.filter((item: any) => item.userCode !== userCode);
        localStorage.setItem(key, JSON.stringify(filtered));
      } catch (e) {
        console.error("Failed to delete user in offline localStorage cache:", e);
      }
    }

    const isOfflineDemo = localStorage.getItem('BQOS_DEMO_MODE') === 'true';
    if (isOfflineDemo && method === 'api_ping') {
      return { success: true, status: "Connected (Sandbox Mode)", timestamp: new Date().toISOString() };
    }
    // If authenticated via Google & spreadsheet ID chosen, proceed with direct sheet read/writes
    if ((getAccessToken() || isOfflineDemo) && sheetsService.getSpreadsheetId()) {
      try {
        return await this.runDirect(method, sanitizedArgs);
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
    const hardcodedUrls = [
      "https://script.google.com/macros/s/AKfycbwKzzjUDaMsIKCOX9Drbf2Fob6PMIjALyv3WkLtZEZl542eI1bCGFVb75J7uXYJlfLT8g/exec",
      "https://script.google.com/macros/s/AKfycbzrSntR0NNT-tAifyZ5K5Jh4y3St8jMm2PqZJTGTgyYEDKVvhUHEEUKyjJNRNNI9UHb7A/exec"
    ];

    const candidateUrls: string[] = [];
    if (customUrl) candidateUrls.push(customUrl);
    if (envUrl && !envUrl.includes("REPLACE_WITH") && !candidateUrls.includes(envUrl)) candidateUrls.push(envUrl);
    hardcodedUrls.forEach(url => {
      if (!candidateUrls.includes(url)) {
        candidateUrls.push(url);
      }
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s for large ERP data

    try {
      try {
        const proxyHeaders: any = { 'Content-Type': 'application/json' };
        if (customUrl) proxyHeaders['x-gas-url'] = customUrl;

        const activeSheetId = sheetsService.getSpreadsheetId() || localStorage.getItem('VITE_SPREADSHEET_ID') || "";
        const response = await fetch("/api/gas", {
          method: 'POST',
          headers: proxyHeaders,
          body: JSON.stringify({ action: gasMethod, params: gasArgs, spreadsheetId: activeSheetId }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.status === 404) throw new Error("Proxy Not Found");
        
        const result = await response.json();
        if (!response.ok) {
           if (result.error === "CONFIGURATION_REQUIRED") throw new Error("CONFIGURATION_REQUIRED");
           throw new Error(result.error || `Proxy error ${response.status}`);
        }
        return result;

      } catch (proxyError: any) {
        if (proxyError.message === "CONFIGURATION_REQUIRED") throw proxyError;

        // If proxy failed, perform an auto-healing direct fallback to the Google Apps Script Web App candidates!
        if (candidateUrls.length > 0) {
          console.log("[API] Server proxy failed or unavailable. Initiating direct fallback to Google Apps Script Web App...", proxyError.message);
          
          let lastDirectError: any = null;
          for (const targetUrl of candidateUrls) {
            try {
              const directController = new AbortController();
              const directTimeoutId = setTimeout(() => directController.abort(), 30000); // 30 seconds per attempt

              const activeSheetId = sheetsService.getSpreadsheetId() || localStorage.getItem('VITE_SPREADSHEET_ID') || "";
              const response = await fetch(targetUrl, {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify({ action: gasMethod, params: gasArgs, spreadsheetId: activeSheetId }),
                signal: directController.signal
              });

              clearTimeout(directTimeoutId);

              if (!response.ok) {
                const text = await response.text();
                throw new Error(`GAS ${response.status}: ${text.slice(0, 100)}`);
              }

              const parsedData = await response.json();
              if (parsedData && (parsedData.success === true || (parsedData.success !== false && !parsedData.error))) {
                return parsedData;
              }
              throw new Error(parsedData?.error || "Direct GAS returned success=false");

            } catch (directError: any) {
              console.warn(`[API] Fallback attempt failed for URL ${targetUrl}:`, directError.message);
              lastDirectError = directError;
            }
          }

          // If we exhaust all candidates, let's process the error
          const isConnectionError = 
            lastDirectError?.name === 'TypeError' || 
            lastDirectError?.message?.includes('Failed to fetch') || 
            lastDirectError?.message?.includes('NetworkError') || 
            lastDirectError?.message?.includes('Failed to communicate') ||
            lastDirectError?.message?.includes('Unable to connect');

          if (isConnectionError && this.isServerConfigured) {
            const detailMsg = proxyError.message ? ` Reason: ${proxyError.message}` : "";
            throw new Error(`Unable to connect to Google Sheets server proxy or direct Web App.${detailMsg} Please check your connection or redeploy the Web App.`);
          }
          throw new Error(lastDirectError?.message || proxyError.message || "Failed to communicate with Google Sheets.");
        }

        if (this.isServerConfigured) {
          throw new Error(proxyError.message ? `Unable to connect to Google Sheets server proxy. Reason: ${proxyError.message}` : "Unable to connect to Google Sheets server proxy. Please check your internet connection and try again.");
        }
        
        throw new Error("CONFIGURATION_REQUIRED");
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.warn(`[API] Execution failed for ${method}: ${error.message}`);
      throw error;
    }
  }
};
