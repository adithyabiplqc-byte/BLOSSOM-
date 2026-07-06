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
  { userCode: 'U001', username: 'user1', password: 'pass1', role: 'USER', location: 'SYSTEM', restrictions: [], canDownload: true },
  { userCode: 'A001', username: 'admin', password: 'admin123', role: 'ADMIN', location: 'SYSTEM', restrictions: [], canDownload: true },
  { userCode: 'W001', username: 'wo1', password: '123', role: 'WORKORDER', location: 'SYSTEM', restrictions: [], canDownload: true }
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
      // 1. Fetch server config state (which includes firestore config automatically on the backend)
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);
      const response = await fetch("/api/config", { signal: controller.signal });
      clearTimeout(id);
      const data = await response.json();

      // 2. Fallback and local sync
      const localUrl = localStorage.getItem('VITE_GAS_URL');
      const localSpreadsheetId = localStorage.getItem('VITE_SPREADSHEET_ID');

      const serverUrl = data.gasUrl || "";
      const serverSpreadsheetId = data.spreadsheetId || "";

      // Final resolved values
      const finalUrl = serverUrl || localUrl || "";
      const finalSpreadsheetId = serverSpreadsheetId || localSpreadsheetId || "";

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
        const report = args[0];
        const res = await sheetsService.saveData('CUTTING QUALITY', report);
        if (res.success && report.wo) {
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
        try {
          const existingData = await sheetsService.getData('INLINE');
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

      case 'api_getREPORTS_SOPData': {
        const zone = args[0]?.zone;
        let data = await sheetsService.getData('REPORTS_SOP');
        if (zone && zone !== 'ALL') {
          data = data.filter(r => String(r.zone || r.location || '').toUpperCase() === String(zone).toUpperCase());
        }
        return data;
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
