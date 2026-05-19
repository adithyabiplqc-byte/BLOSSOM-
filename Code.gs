/**
 * BQOS - Blossom Quality Operation System
 * Google Apps Script Backend
 */

const CACHE_TTL = 30; // Reduced to 30 seconds for better sync

function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('BQOS - Blossom Quality Operation System')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    const params = postData.params || [];
    
    // In GAS, functions are in the global scope (this or globalThis)
    let func = null;
    try {
      func = (typeof globalThis !== 'undefined' ? globalThis[action] : null) || this[action] || eval(action);
    } catch (err) {}

    if (typeof func === 'function' && action.startsWith('api_')) {
      const result = func.apply(null, params);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Invalid action or function not found: " + action }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// --- CORE SHEET UTILITIES ---

let _ssInstance = null;
function getSS() {
  if (!_ssInstance) {
    _ssInstance = SpreadsheetApp.getActiveSpreadsheet();
    if (!_ssInstance) {
      throw new Error("Spreadsheet not found. Please ensure this script is bound to a Google Sheet.");
    }
  }
  return _ssInstance;
}

function getOrCreateSheet(sheetName) {
  const ss = getSS();
  let sheet = ss.getSheetByName(sheetName);
  
  // Fallback for renamed Material Report sheet
  if (!sheet && sheetName === 'MATERIAL REPORT') {
    sheet = ss.getSheetByName('STORE MATERIAL INSPECTION DATA') || ss.getSheetByName('MATERIAL INSPECTION');
    if (sheet) {
      sheet.setName('MATERIAL REPORT'); // Rename it for future consistency
      return sheet;
    }
  }

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function getReportSheetName(baseName, data) {
  const zone = data?.zone || data?.location;
  // Consolidate Material Reports into one sheet as requested
  if (baseName === 'MATERIAL REPORT') return baseName;
  
  if (zone && zone !== 'ALL' && zone !== 'SYSTEM' && zone !== 'WORKORDER') {
    return `${baseName} - ${zone}`;
  }
  return baseName;
}

function saveDataToSheet(sheetName, data, adminActivity = false, admin = 'SYSTEM', module = 'SYSTEM') {
  try {
    const resolvedName = getReportSheetName(sheetName, data);
    clearSheetCache(resolvedName);
    const sheet = getOrCreateSheet(resolvedName);
    const lastCol = sheet.getLastColumn();
    let headers = lastCol === 0 ? [] : sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    if (headers.length === 0) {
      headers = Object.keys(data);
      sheet.appendRow(headers);
    }
    
    // Create a mapping for case-insensitive lookup
    const dataKeys = Object.keys(data);
    const keyMap = {};
    dataKeys.forEach(k => keyMap[k.toUpperCase().replace(/\s+/g, '')] = k);

    const row = headers.map(header => {
      const hUpper = header.toString().toUpperCase().replace(/\s+/g, '');
      const originalKey = keyMap[hUpper] || header;
      const val = data[originalKey] !== undefined ? data[originalKey] : data[header];
      return (val && typeof val === 'object') ? JSON.stringify(val) : (val === undefined ? "" : val);
    });
    
    sheet.appendRow(row);

    // Log admin activity if requested
    if (adminActivity) {
      saveDataToSheet('ADMIN', {
        timestamp: new Date().toISOString(),
        module: module,
        action: `SAVE_${sheetName.replace(/\s+/g, '_')}`,
        details: `Saved record to ${sheetName}`,
        admin: admin
      });
    }

    return { success: true };
  } catch (e) {
    console.error(`Error saving to ${sheetName}:`, e);
    return { success: false, error: e.toString() };
  }
}

function getDataFromSheet(sheetName) {
  const cache = CacheService.getScriptCache();
  const cacheKey = `BQOS_CACHE_${sheetName.replace(/\s+/g, '_')}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {}
  }

  try {
    const ss = getSS();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() < 2) return [];
    
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const data = [];
    
    for (let i = 1; i < values.length; i++) {
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        const val = values[i][j];
        try {
          if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
            obj[headers[j]] = JSON.parse(val);
          } else {
            obj[headers[j]] = val;
          }
        } catch (e) {
          obj[headers[j]] = val;
        }
      }
      data.push(obj);
    }
    
    try {
      const jsonStr = JSON.stringify(data);
      if (jsonStr.length < 100000) {
        cache.put(cacheKey, jsonStr, CACHE_TTL);
      }
    } catch (e) {}
    
    return data;
  } catch (e) {
    console.error(`Error getting data from ${sheetName}:`, e);
    return [];
  }
}

function clearSheetCache(sheetName) {
  try {
    const cache = CacheService.getScriptCache();
    cache.remove(`BQOS_CACHE_${sheetName.replace(/\s+/g, '_')}`);
  } catch (e) {}
}

// --- API ENDPOINTS ---

function api_createSheets() {
  try {
    const required = ['USERS', 'WORKORDER', 'SETTINGS', 'ADMIN', 'MATERIAL REPORT', 'CUTTING QUALITY', 'SEWING DEFECT', 'ENDLINE QUALITY', 'AQL REPORT', 'FINAL AUDIT'];
    required.forEach(s => getOrCreateSheet(s));
    
    // Explicit headers for MATERIAL REPORT
    const materialSheet = getSS().getSheetByName('MATERIAL REPORT');
    if (materialSheet.getLastColumn() === 0) {
      materialSheet.appendRow(['zone', 'billNo', 'supplierName', 'grn', 'receivedDate', 'checkingDate', 'itemName', 'receivedQuantity', 'checkedQuantity', 'passQuantity', 'rejectedQuantity', 'itemRemarks', 'generalRemarks', 'inspector', 'timestamp', 'id']);
    }
    
    // Seed USERS if empty
    const users = api_getUsers();
    if (users.length === 0) {
      api_saveUser({
        userCode: 'A001',
        username: 'admin',
        password: 'admin123',
        role: 'ADMIN',
        location: 'HEAD OFFICE',
        restrictions: []
      });
    }

    // Seed SETTINGS if empty
    const settings = api_getGlobalSettings();
    const sheet = getSS().getSheetByName('SETTINGS');
    if (sheet.getLastRow() < 2) {
      api_saveSettings('GLOBAL', settings);
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function api_getInitialData(params) {
  try {
    const users = api_getUsers();
    // Bootstrap default users if none exist
    if (users.length === 0) {
      const defaultUser = {
        userCode: 'U001',
        username: 'user1',
        password: 'pass1',
        role: 'USER',
        location: 'KERALA',
        restrictions: []
      };
      const defaultAdmin = {
        userCode: 'A001',
        username: 'admin',
        password: 'admin123',
        role: 'ADMIN',
        location: 'HEAD OFFICE',
        restrictions: []
      };
      const defaultWO = {
        userCode: 'W001',
        username: 'wo1',
        password: '123',
        role: 'WORKORDER',
        location: 'KERALA',
        restrictions: []
      };
      api_saveUser(defaultUser);
      api_saveUser(defaultAdmin);
      api_saveUser(defaultWO);
      users.push(defaultUser, defaultAdmin, defaultWO);
    }

    const zone = params && params.zone;
    // If zone is a specific one (not ALL), try to fetch from that sheet first, then fallback to WORKORDER
    let workorders = [];
    if (zone && zone !== 'ALL') {
      workorders = api_getWorkorders(zone);
      if (workorders.length === 0) {
        // Filter global workorders by zone instead
        workorders = api_getWorkorders('WORKORDER').filter(wo => wo.location === zone || wo.zone === zone);
      }
    } else {
      workorders = api_getWorkorders('WORKORDER');
    }

    return {
      users: users,
      workorders: workorders,
      serverTime: new Date().toISOString(),
      success: true
    };
  } catch (e) {
    console.error("Error in api_getInitialData:", e);
    return { users: [], workorders: [], error: e.toString(), success: false };
  }
}

function api_getAdminLogs() {
  try {
    return getDataFromSheet('ADMIN');
  } catch (e) {
    console.error("Error in api_getAdminLogs:", e);
    return [];
  }
}

function api_saveUserSettings(target, settings, admin = 'SYSTEM', details = 'Dropdown Update') {
  try {
    if (target === 'GLOBAL') {
      const sheet = getOrCreateSheet('SETTINGS');
      sheet.clear();
      const headers = Object.keys(settings);
      sheet.appendRow(headers);
      const row = headers.map(h => {
        const val = settings[h];
        return (val && typeof val === 'object') ? JSON.stringify(val) : (val === undefined ? "" : val);
      });
      sheet.appendRow(row);
    } else {
      const sheet = getOrCreateSheet(target);
      sheet.clear();
      const categories = ['ZONE', 'SUPPLIER', 'ITEMS', 'COLOR', 'DEFECTS', 'WORKERS', 'MACHINE', 'OPERATION', 'SIZE', 'CUPSIZE', 'UNIT', 'LINE'];
      sheet.appendRow(categories);
      
      let maxLen = 0;
      categories.forEach(cat => {
        if (settings[cat] && settings[cat].length > maxLen) maxLen = settings[cat].length;
      });
      
      const rows = [];
      for (let i = 0; i < maxLen; i++) {
        const row = categories.map(cat => (settings[cat] && settings[cat][i]) || "");
        rows.push(row);
      }
      if (rows.length > 0) {
        sheet.getRange(2, 1, rows.length, categories.length).setValues(rows);
      }
      // Formatting
      sheet.getRange(1, 1, 1, categories.length).setFontWeight("bold").setBackground("#f3f3f3");
      sheet.setFrozenRows(1);
      sheet.autoResizeColumns(1, categories.length);
    }
    
    saveDataToSheet('ADMIN', {
      timestamp: new Date().toISOString(),
      module: 'SETTINGS',
      action: 'UPDATE_SETTINGS',
      details: `Updated Settings for ${target}: ${details}`,
      admin: admin
    });
    
    return { success: true };
  } catch (e) {
    console.error(`Error saving settings for ${target}:`, e);
    return { success: false, error: e.toString() };
  }
}

// Alias for compatibility
function api_saveSettings(target, settings, admin, details) {
  return api_saveUserSettings(target, settings, admin, details);
}

// User Management
function api_saveUser(user, admin = 'SYSTEM') { 
  // Ensure correct column order for USERS sheet: userCode, username, password, role, location, restrictions
  const structuredUser = {
    userCode: user.userCode,
    username: user.username,
    password: user.password,
    role: user.role,
    location: user.location,
    restrictions: user.restrictions || [],
    canDownload: user.canDownload !== false
  };

  try {
    // Automatically create a dedicated sheet for the user's dropdown settings
    const categories = ['ZONE', 'SUPPLIER', 'ITEMS', 'COLOR', 'DEFECTS', 'WORKERS', 'MACHINE', 'OPERATION', 'SIZE', 'CUPSIZE', 'UNIT', 'LINE'];
    const ss = getSS();
    if (!ss.getSheetByName(user.userCode)) {
      const userSheet = ss.insertSheet(user.userCode);
      userSheet.appendRow(categories);
      // Formatting for new sheet
      userSheet.getRange(1, 1, 1, categories.length).setFontWeight("bold").setBackground("#f3f3f3");
      userSheet.setFrozenRows(1);
      userSheet.autoResizeColumns(1, categories.length);
    }
  } catch (e) {
    console.error("Warning: Could not create user-specific settings sheet:", e);
    // We continue anyway so the user record is still saved
  }

  return saveDataToSheet('USERS', structuredUser, true, admin, 'USER_MGMT'); 
}

function api_getUsers() { 
  return getDataFromSheet('USERS'); 
}

function api_updateUser(user, admin = 'SYSTEM') {
  try {
    clearSheetCache('USERS');
    const sheet = getOrCreateSheet('USERS');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const codeIdx = headers.indexOf('userCode');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][codeIdx] === user.userCode) {
        const newRow = headers.map(h => {
          const val = user[h];
          return (val && typeof val === 'object') ? JSON.stringify(val) : (val === undefined ? "" : val);
        });
        sheet.getRange(i + 1, 1, 1, headers.length).setValues([newRow]);
        
        saveDataToSheet('ADMIN', {
          timestamp: new Date().toISOString(),
          module: 'USER_MGMT',
          action: 'EDIT USER',
          details: `Updated User ${user.userCode} (${user.username})`,
          admin: admin
        });
        
        return { success: true };
      }
    }
    return { success: false, error: "User not found" };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function api_deleteUser(userCode, reason, admin = 'SYSTEM') {
  try {
    clearSheetCache('USERS');
    const sheet = getOrCreateSheet('USERS');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const codeIdx = headers.indexOf('userCode');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][codeIdx] === userCode) {
        sheet.deleteRow(i + 1);
        
        // Also delete the user-specific settings sheet
        try {
          const ss = getSS();
          const userSheet = ss.getSheetByName(userCode);
          if (userSheet) {
            ss.deleteSheet(userSheet);
          }
        } catch (sheetErr) {
          console.warn(`Could not delete sheet for ${userCode}:`, sheetErr);
        }

        saveDataToSheet('ADMIN', {
          timestamp: new Date().toISOString(),
          module: 'USER_MGMT',
          action: 'DELETE USER',
          details: `Deleted User ${userCode}. Reason: ${reason}`,
          admin: admin
        });
        
        return { success: true };
      }
    }
    return { success: false, error: "User not found" };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// --- LOGGING ---
function api_logAdminActivity(details) {
  try {
    return saveDataToSheet('ADMIN', {
      timestamp: new Date().toISOString(),
      module: details.module || 'SYSTEM',
      action: details.action || 'ACTIVITY',
      details: details.details || '',
      admin: details.admin || 'SYSTEM'
    });
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// Workorder Management
function aggregateZonedData(baseName) {
  try {
    const ss = getSS();
    const sheets = ss.getSheets();
    const sheetNames = sheets.map(s => s.getName());
    let allData = [];
    
    // 1. Master data (Primary source)
    const possibleNames = [baseName];
    if (baseName === 'MATERIAL REPORT') {
      possibleNames.push('STORE MATERIAL INSPECTION DATA');
      possibleNames.push('MATERIAL INSPECTION');
    }
    
    possibleNames.forEach(bn => {
      if (sheetNames.includes(bn)) {
        const masterData = getDataFromSheet(bn);
        if (masterData && masterData.length > 0) allData = allData.concat(masterData);
      }
    });
    
    // 2. Check for "DATA CENTER" sheet (Secondary consolidated source)
    if (sheetNames.includes('DATA CENTER')) {
      const dcData = getDataFromSheet('DATA CENTER');
      if (dcData && dcData.length > 0) {
        const filteredDC = dcData.filter(row => {
          const typeVal = String(row.type || row.TYPE || row.Module || "").toUpperCase();
          // Check against all possible names
          return !typeVal || possibleNames.some(pn => typeVal === pn.toUpperCase());
        });
        allData = allData.concat(filteredDC);
      }
    }
    
    // 3. Zoned data 
    sheetNames.forEach(name => {
      possibleNames.forEach(bn => {
        if (name.startsWith(bn + " - ")) {
          const zd = getDataFromSheet(name);
          if (zd && zd.length > 0) allData = allData.concat(zd);
        }
      });
    });

    // Deduplicate by ID
    const seenIds = new Set();
    const uniqueData = allData.filter(row => {
      const id = row.id || row.workorderNumber || row.ID;
      if (!id) return true; 
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });

    return uniqueData;
  } catch (e) {
    console.error(`Error aggregating data for ${baseName}:`, e);
    return [];
  }
}

// Workorder Management
function api_saveWorkorder(wo) { 
  wo.id = wo.id || Utilities.getUuid();
  if (!wo.status) wo.status = 'CUTTING';
  return saveDataToSheet('WORKORDER', wo);
}

function api_getWorkorders(params) { 
  const baseName = 'WORKORDER';
  const zone = (typeof params === 'string' ? params : params?.zone);
  
  const allData = aggregateZonedData(baseName);
  
  if (zone && zone !== 'ALL' && zone !== 'WORKORDER') {
    const zoneUpper = zone.toUpperCase().trim();
    return allData.filter(wo => {
       const zVal = String(wo.zone || wo.location || "").toUpperCase().trim();
       return zVal === zoneUpper;
    });
  }
  
  return allData;
}

function api_updateWorkorder(wo) {
  const zone = wo.zone || wo.location || 'WORKORDER';
  api_updateDataBySheet('WORKORDER', wo);
  
  if (zone !== 'WORKORDER' && zone !== 'SYSTEM' && zone !== 'ALL') {
    return api_updateDataBySheet(zone, wo);
  }
  return { success: true };
}

function api_deleteWorkorder(id, zone) {
  api_deleteDataBySheet('WORKORDER', id);
  if (zone && zone !== 'WORKORDER' && zone !== 'SYSTEM' && zone !== 'ALL') {
    return api_deleteDataBySheet(zone, id);
  }
  return { success: true };
}

function api_ping() {
  return { success: true, status: "Connected", timestamp: new Date().toISOString() };
}

// Data Entry Saving
function api_saveMaterialReportBulk(data) {
  const { zone, billNo, supplierName, grn, checkingDate, receivedDate, remarks, inspector, timestamp, items } = data;
  let successCount = 0;
  let errors = [];
  
  if (items && Array.isArray(items)) {
    items.forEach(item => {
      const row = {
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
        id: Utilities.getUuid()
      };
      const res = saveDataToSheet('MATERIAL REPORT', row);
      if (res.success) {
        successCount++;
      } else {
        errors.push(res.error);
      }
    });
  }
  
  if (errors.length > 0 && successCount === 0) {
    return { success: false, error: errors[0] };
  }
  
  return { success: true, count: successCount, total: items?.length };
}

function api_saveMATERIALREPORT(report) { return saveDataToSheet('MATERIAL REPORT', report); }

function internal_updateWorkorderStatus(woNum, zone, nextStatus) {
  try {
    const ss = getSS();
    const sheetsToUpdate = ['WORKORDER'];
    if (zone && zone !== 'ALL') sheetsToUpdate.push(`WORKORDER - ${zone}`);
    
    sheetsToUpdate.forEach(sheetName => {
      const sheet = ss.getSheetByName(sheetName);
      if (sheet) {
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const woIdx = headers.indexOf('workorderNumber');
        const statusIdx = headers.indexOf('status');
        
        if (woIdx !== -1) {
          let colToUpdate = statusIdx;
          if (statusIdx === -1) {
            colToUpdate = headers.length;
            sheet.getRange(1, colToUpdate + 1).setValue('status');
          }
          
          for (let i = 1; i < data.length; i++) {
            if (String(data[i][woIdx]) === String(woNum)) {
              sheet.getRange(i + 1, colToUpdate + 1).setValue(nextStatus);
              break;
            }
          }
          clearSheetCache(sheetName);
        }
      }
    });
    return { success: true };
  } catch (e) {
    console.error("Error updating WO status:", e);
    return { success: false, error: e.toString() };
  }
}

function api_saveCUTTINGQUALITY(report) { 
  const res = saveDataToSheet('CUTTING QUALITY', report);
  if (res.success && report.moveToInline && report.wo) {
    internal_updateWorkorderStatus(report.wo, report.zone || report.location, 'INLINE');
  }
  return res;
}
function api_saveSEWINGDEFECT(report) { 
  const res = saveDataToSheet('SEWING DEFECT', report);
  if (res.success && report.moveToEndline && report.wo) {
    internal_updateWorkorderStatus(report.wo, report.zone || report.location, 'ENDLINE');
  }
  return res;
}
function api_saveENDLINEQUALITY(report) { 
  const res = saveDataToSheet('ENDLINE QUALITY', report);
  if (res.success && report.moveToAQL && report.wo) {
    internal_updateWorkorderStatus(report.wo, report.zone || report.location, 'AQL');
  }
  return res;
}
function api_saveAQLREPORT(report) { 
  const res = saveDataToSheet('AQL REPORT', report);
  if (res.success && report.moveToFinal && report.wo) {
    internal_updateWorkorderStatus(report.wo, report.zone || report.location, 'FINAL');
  }
  return res;
}
function api_saveFINALAUDIT(report) { 
  const res = saveDataToSheet('FINAL AUDIT', report);
  if (res.success && report.moveToComplete && report.wo) {
    internal_updateWorkorderStatus(report.wo, report.zone || report.location, 'COMPLETED');
  }
  return res;
}
function api_saveREWORK(report) { return saveDataToSheet('REWORK', report); }

// Legacy aliases for compatibility
function api_saveMaterialReport(report) { return api_saveMATERIALREPORT(report); }
function api_saveCuttingReport(report) { return api_saveCUTTINGQUALITY(report); }
function api_saveInlineReport(report) { return api_saveSEWINGDEFECT(report); }
function api_saveEndlineReport(report) { return api_saveENDLINEQUALITY(report); }
function api_saveReworkReport(report) { return api_saveREWORK(report); }

// Data Center
function api_saveDataBySheet(sheetName, record) {
  return saveDataToSheet(sheetName, record);
}

function api_getDataBySheet(sheetName) { 
  return getDataFromSheet(sheetName); 
}

function api_deleteDataBySheet(sheetName, id, zone) {
  try {
    const resolvedName = zone && zone !== 'ALL' ? `${sheetName} - ${zone}` : sheetName;
    const ss = getSS();
    let targetSheetName = resolvedName;
    
    // If specific zone sheet doesn't exist, fallback to base
    if (!ss.getSheetByName(targetSheetName)) targetSheetName = sheetName;
    
    clearSheetCache(targetSheetName);
    const sheet = getOrCreateSheet(targetSheetName);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idIdx = headers.indexOf('id') !== -1 ? headers.indexOf('id') : headers.indexOf('workorderNumber');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIdx] === id) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    
    // If not found in zoned sheet and we were looking there, try the base sheet as absolute last resort
    if (targetSheetName !== sheetName) {
       return api_deleteDataBySheet(sheetName, id);
    }
    
    return { success: false, error: "Record not found" };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function api_updateDataBySheet(sheetName, record) {
  try {
    const zone = record.zone || record.location;
    const resolvedName = zone && zone !== 'ALL' ? `${sheetName} - ${zone}` : sheetName;
    const ss = getSS();
    let targetSheetName = resolvedName;
    
    if (!ss.getSheetByName(targetSheetName)) targetSheetName = sheetName;

    clearSheetCache(targetSheetName);
    const sheet = getOrCreateSheet(targetSheetName);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idIdx = headers.indexOf('id') !== -1 ? headers.indexOf('id') : headers.indexOf('workorderNumber');
    const id = record.id || record.workorderNumber;

    for (let i = 1; i < data.length; i++) {
      if (data[i][idIdx] === id) {
        const newRow = headers.map(h => {
          const val = record[h];
          return (val && typeof val === 'object') ? JSON.stringify(val) : (val === undefined ? "" : val);
        });
        sheet.getRange(i + 1, 1, 1, headers.length).setValues([newRow]);
        return { success: true };
      }
    }
    return { success: false, error: "Record not found" };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// MIS Data
function api_getMISData(sheetName) {
  return getDataFromSheet(sheetName);
}

function api_getMaterialData(params) { 
  const baseName = 'MATERIAL REPORT';
  let data = aggregateZonedData(baseName);
  
  const zone = params?.zone;
  if (zone && zone !== 'ALL') {
    data = data.filter(row => {
      const zVal = (row.zone || row.location || row.ZONE || row.LOCATION || "").toString().toUpperCase();
      return zVal === zone.toUpperCase();
    });
  }
  
  return data;
}
function api_getCuttingData(params) { 
  const baseName = 'CUTTING QUALITY';
  const data = aggregateZonedData(baseName);
  const zone = params?.zone;
  if (zone && zone !== 'ALL') {
    return data.filter(row => {
      const zVal = (row.zone || row.location || row.ZONE || row.LOCATION || "").toString().toUpperCase();
      return zVal === zone.toUpperCase();
    });
  }
  return data;
}
function api_getInlineData(params) { 
  const baseName = 'SEWING DEFECT';
  const data = aggregateZonedData(baseName);
  const zone = params?.zone;
  if (zone && zone !== 'ALL') {
    return data.filter(row => {
      const zVal = (row.zone || row.location || row.ZONE || row.LOCATION || "").toString().toUpperCase();
      return zVal === zone.toUpperCase();
    });
  }
  return data;
}
function api_getEndlineData(params) { 
  const baseName = 'ENDLINE QUALITY';
  const data = aggregateZonedData(baseName);
  const zone = params?.zone;
  if (zone && zone !== 'ALL') {
    return data.filter(row => {
      const zVal = (row.zone || row.location || row.ZONE || row.LOCATION || "").toString().toUpperCase();
      return zVal === zone.toUpperCase();
    });
  }
  return data;
}
function api_getAQLData(params) { 
  const baseName = 'AQL REPORT';
  const data = aggregateZonedData(baseName);
  const zone = params?.zone;
  if (zone && zone !== 'ALL') {
    return data.filter(row => {
      const zVal = (row.zone || row.location || row.ZONE || row.LOCATION || "").toString().toUpperCase();
      return zVal === zone.toUpperCase();
    });
  }
  return data;
}
function api_getFinalAuditData(params) { 
  const baseName = 'FINAL AUDIT';
  const data = aggregateZonedData(baseName);
  const zone = params?.zone;
  if (zone && zone !== 'ALL') {
    return data.filter(row => {
      const zVal = (row.zone || row.location || row.ZONE || row.LOCATION || "").toString().toUpperCase();
      return zVal === zone.toUpperCase();
    });
  }
  return data;
}

function api_deleteMaterialData(id) { return api_deleteDataBySheet('MATERIAL REPORT', id); }
function api_deleteCuttingData(id) { return api_deleteDataBySheet('CUTTING QUALITY', id); }
function api_deleteInlineData(id) { return api_deleteDataBySheet('SEWING DEFECT', id); }
function api_deleteEndlineData(id) { return api_deleteDataBySheet('ENDLINE QUALITY', id); }
function api_deleteAQLData(id) { return api_deleteDataBySheet('AQL REPORT', id); }
function api_deleteFinalAuditData(id) { return api_deleteDataBySheet('FINAL AUDIT', id); }

// User Settings (Dropdown Options)
function api_getUserSettings(userCode) {
  try {
    const ss = getSS();
    const sheet = ss.getSheetByName(userCode);
    if (!sheet) return api_getGlobalSettings();
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return api_getGlobalSettings();
    
    // Assume columns: ZONE, SUPPLIER, ITEMS, DEFECTS, WORKERS, MACHINE, OPERATION, SIZE, CUPSIZE, UNIT, LINE
    const categories = ['ZONE', 'SUPPLIER', 'ITEMS', 'COLOR', 'DEFECTS', 'WORKERS', 'MACHINE', 'OPERATION', 'SIZE', 'CUPSIZE', 'UNIT', 'LINE'];
    const settings = {};
    categories.forEach(cat => settings[cat] = []);
    
    for (let col = 0; col < categories.length; col++) {
      const cat = categories[col];
      for (let row = 1; row < data.length; row++) {
        const val = data[row][col];
        if (val !== "" && val !== undefined) {
          settings[cat].push(val);
        }
      }
    }
    return settings;
  } catch (e) {
    console.error(`Error getting settings for ${userCode}:`, e);
    return api_getGlobalSettings();
  }
}

function api_getGlobalSettings() {
  try {
    const ss = getSS();
    const sheets = ss.getSheets();
    const sheetNames = sheets.map(s => s.getName());
    
    const defaults = {
      ZONE: ['KERALA', 'TAMILNADU', 'BANGLORE'],
      SUPPLIER: ['SUPPLIER A', 'SUPPLIER B'],
      ITEMS: ['ITEM 1', 'ITEM 2'],
      COLOR: ['BLACK', 'WHITE', 'NAVY'],
      DEFECTS: ['STAIN', 'HOLE', 'SHADING'],
      WORKERS: ['WORKER 1', 'WORKER 2'],
      MACHINE: ['M001', 'M002'],
      OPERATION: ['OP 1', 'OP 2'],
      SIZE: ['S', 'M', 'L', 'XL'],
      CUPSIZE: ['A', 'B', 'C'],
      UNIT: ['UNIT 1', 'UNIT 2'],
      LINE: ['LINE 1', 'LINE 2']
    };

    const finalSettings = { ...defaults };
    const categories = ['ZONE', 'SUPPLIER', 'ITEMS', 'COLOR', 'DEFECTS', 'WORKERS', 'MACHINE', 'OPERATION', 'SIZE', 'CUPSIZE', 'UNIT', 'LINE'];
    
    // 1. Check in a master "SETTINGS" sheet
    if (sheetNames.includes('SETTINGS')) {
      const settingsSheet = ss.getSheetByName('SETTINGS');
      const values = settingsSheet.getDataRange().getValues();
      if (values.length > 0) {
        const headers = values[0];
        for (let col = 0; col < headers.length; col++) {
          const header = headers[col];
          if (!header) continue;
          const key = header.toString().toUpperCase().trim();
          const colData = [];
          for (let row = 1; row < values.length; row++) {
            const val = values[row][col];
            if (val !== "" && val !== undefined && val !== null) colData.push(val);
          }
          if (colData.length > 0) finalSettings[key] = colData;
        }
      }
    }

    // 2. Check for individual sheets named after categories
    categories.forEach(cat => {
      const possibleNames = [cat, cat + 'S', cat + ' NAME', cat + 'S NAME'];
      for (const name of possibleNames) {
        if (sheetNames.includes(name)) {
          const sheet = ss.getSheetByName(name);
          if (sheet.getLastRow() >= 2) {
            const vals = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat().filter(v => v !== "" && v !== null);
            if (vals.length > 0) {
              finalSettings[cat] = vals;
              break; 
            }
          }
        }
      }
    });

    // 3. Mirror plural/singular/aliases
    const aliasesGroup = [
      ['ITEMS', 'ITEM', 'ITEM NAME'],
      ['SUPPLIER', 'SUPPLIERS', 'SUPPLIER NAME'],
      ['ZONE', 'ZONES'],
      ['OPERATION', 'OPERATIONS'],
      ['MACHINE', 'MACHINES'],
      ['WORKER', 'WORKERS'],
      ['DEFECT', 'DEFECTS'],
      ['UNIT', 'UNITS'],
      ['LINE', 'LINES'],
      ['COLOR', 'COLORS'],
      ['SIZE', 'SIZES'],
    ];

    aliasesGroup.forEach(group => {
      const updatedKey = group.find(key => finalSettings[key] && !arraysEqual(finalSettings[key], defaults[key] || []));
      if (updatedKey) {
        group.forEach(key => {
          if (key !== updatedKey) finalSettings[key] = finalSettings[updatedKey];
        });
      }
    });

    return finalSettings;
  } catch (e) {
    console.error("Error in getGlobalSettings:", e);
    return defaults;
  }
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
