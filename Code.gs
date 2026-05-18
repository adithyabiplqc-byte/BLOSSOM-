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
    
    // Check for the function in the global scope
    // In GAS, this often refers to the global object
    let func = null;
    try {
      func = this[action];
    } catch (err) {}

    if (typeof func === 'function' && action.startsWith('api_')) {
      const result = func.apply(this, params);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      // Fallback: try looking up the function name directly if this[action] failed
      // This is sometimes needed if "this" binding is weird in some GAS versions
      try {
        const fallbackFunc = eval(action);
        if (typeof fallbackFunc === 'function' && action.startsWith('api_')) {
          const result = fallbackFunc.apply(null, params);
          return ContentService.createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);
        }
      } catch (err) {}

      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Invalid action: " + action }))
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
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function saveDataToSheet(sheetName, data, adminActivity = false, admin = 'SYSTEM', module = 'SYSTEM') {
  try {
    clearSheetCache(sheetName);
    const sheet = getOrCreateSheet(sheetName);
    const lastCol = sheet.getLastColumn();
    let headers = lastCol === 0 ? [] : sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    if (headers.length === 0) {
      headers = Object.keys(data);
      sheet.appendRow(headers);
    }
    
    const row = headers.map(header => {
      const val = data[header];
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

    return {
      users: users,
      workorders: api_getWorkorders(),
      cards: api_getCards(),
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
      const categories = ['ZONE', 'SUPPLIER', 'ITEMS', 'DEFECTS', 'WORKERS', 'MACHINE', 'OPERATION', 'SIZE', 'CUPSIZE', 'UNIT', 'LINE'];
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
    const categories = ['ZONE', 'SUPPLIER', 'ITEMS', 'DEFECTS', 'WORKERS', 'MACHINE', 'OPERATION', 'SIZE', 'CUPSIZE', 'UNIT', 'LINE'];
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
function api_saveWorkorder(wo) { 
  wo.id = wo.id || Utilities.getUuid();
  return saveDataToSheet('WORKORDER', wo); 
}

function api_getWorkorders(sheetName) { 
  return getDataFromSheet(sheetName || 'WORKORDER'); 
}

function api_updateWorkorder(wo) {
  return api_updateDataBySheet('WORKORDER', wo);
}

function api_deleteWorkorder(id) {
  return api_deleteDataBySheet('WORKORDER', id);
}

// Data Entry Saving
function api_saveMATERIALREPORT(report) { return saveDataToSheet('MATERIAL REPORT', report); }
function api_saveMATERIALTRACEABILITY(report) { 
  const res = saveDataToSheet('MATERIAL TRACEABILITY', report);
  if (res.success && report.cardNumber) {
    api_updateCardStatus(report.cardNumber, { 
      currentStatus: 'MATERIAL',
      workorderNumber: report.workorderNumber 
    });
  }
  return res; 
}
function api_saveCUTTINGQUALITY(report) { 
  const res = saveDataToSheet('CUTTING QUALITY', report);
  if (res.success && report.cardNumber) {
    api_updateCardStatus(report.cardNumber, { currentStatus: 'CUTTING' });
  }
  return res;
}
function api_saveSEWINGDEFECT(report) { 
  const res = saveDataToSheet('SEWING DEFECT', report);
  if (res.success && report.cardNumber) {
    api_updateCardStatus(report.cardNumber, { currentStatus: 'INLINE' });
  }
  return res;
}
function api_saveENDLINEQUALITY(report) { 
  const res = saveDataToSheet('ENDLINE QUALITY', report);
  if (res.success && report.cardNumber) {
    api_updateCardStatus(report.cardNumber, { currentStatus: 'ENDLINE' });
  }
  return res;
}
function api_saveAQLREPORT(report) { 
  const res = saveDataToSheet('AQL REPORT', report);
  if (res.success && report.cardNumber) {
    api_updateCardStatus(report.cardNumber, { currentStatus: 'AQL' });
  }
  return res;
}
function api_saveFINALAUDIT(report) { 
  const res = saveDataToSheet('FINAL AUDIT', report);
  if (res.success && report.cardNumber) {
    // Final Audit frees the card
    api_updateCardStatus(report.cardNumber, { 
      currentStatus: 'IDLE',
      workorderNumber: '' 
    });
  }
  return res;
}
function api_saveREWORK(report) { return saveDataToSheet('REWORK', report); }

// Card Management
function api_saveCard(card) {
  try {
    card.currentStatus = card.currentStatus || 'IDLE';
    card.updatedAt = new Date().toISOString();
    
    // Check if card exists for upsert
    clearSheetCache('CARDS');
    const sheet = getOrCreateSheet('CARDS');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const cardIdx = headers.indexOf('cardNumber');
    
    if (cardIdx !== -1) {
      for (let i = 1; i < data.length; i++) {
        if (data[i][cardIdx] === card.cardNumber) {
          const newRow = headers.map(h => {
             // Keep existing values if not provided in update
             const val = card[h] !== undefined ? card[h] : data[i][headers.indexOf(h)];
             return (val && typeof val === 'object') ? JSON.stringify(val) : (val === undefined ? "" : val);
          });
          sheet.getRange(i + 1, 1, 1, headers.length).setValues([newRow]);
          return { success: true, action: 'UPDATE' };
        }
      }
    }
    
    // Create new
    return saveDataToSheet('CARDS', card);
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function api_getCards() {
  return getDataFromSheet('CARDS');
}

function api_updateCardStatus(cardNumber, updates) {
  try {
    clearSheetCache('CARDS');
    const sheet = getOrCreateSheet('CARDS');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const cardIdx = headers.indexOf('cardNumber');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][cardIdx] === cardNumber) {
        headers.forEach((h, colIdx) => {
          if (updates[h] !== undefined) {
            sheet.getRange(i + 1, colIdx + 1).setValue(updates[h]);
          }
        });
        sheet.getRange(i + 1, headers.indexOf('updatedAt') + 1).setValue(new Date().toISOString());
        return { success: true };
      }
    }
    return { success: false, error: "Card not found" };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function api_getCardByNumber(cardNumber) {
  const cards = api_getCards();
  return cards.find(c => c.cardNumber === cardNumber) || null;
}

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

function api_deleteDataBySheet(sheetName, id) {
  try {
    clearSheetCache(sheetName);
    const sheet = getOrCreateSheet(sheetName);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idIdx = headers.indexOf('id') !== -1 ? headers.indexOf('id') : headers.indexOf('workorderNumber');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIdx] === id) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    return { success: false, error: "Record not found" };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function api_updateDataBySheet(sheetName, record) {
  try {
    clearSheetCache(sheetName);
    const sheet = getOrCreateSheet(sheetName);
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

// User Settings (Dropdown Options)
function api_getUserSettings(userCode) {
  try {
    const ss = getSS();
    const sheet = ss.getSheetByName(userCode);
    if (!sheet) return api_getGlobalSettings();
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return api_getGlobalSettings();
    
    // Assume columns: ZONE, SUPPLIER, ITEMS, DEFECTS, WORKERS, MACHINE, OPERATION, SIZE, CUPSIZE, UNIT, LINE
    const categories = ['ZONE', 'SUPPLIER', 'ITEMS', 'DEFECTS', 'WORKERS', 'MACHINE', 'OPERATION', 'SIZE', 'CUPSIZE', 'UNIT', 'LINE'];
    const settings = {};
    categories.forEach(cat => settings[cat] = []);
    
    for (let col = 0; col < 11; col++) {
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
  // Fallback global settings if user sheet doesn't exist
  const data = getDataFromSheet('SETTINGS');
  if (data && data.length > 0) return data[0];
  
  return {
    ZONE: ['KERALA', 'TAMILNADU', 'BANGLORE'],
    SUPPLIER: ['SUPPLIER A', 'SUPPLIER B'],
    ITEMS: ['ITEM 1', 'ITEM 2'],
    DEFECTS: ['STAIN', 'HOLE', 'SHADING'],
    WORKERS: ['WORKER 1', 'WORKER 2'],
    MACHINE: ['M001', 'M002'],
    OPERATION: ['OP 1', 'OP 2'],
    SIZE: ['S', 'M', 'L', 'XL'],
    CUPSIZE: ['A', 'B', 'C'],
    UNIT: ['UNIT 1', 'UNIT 2'],
    LINE: ['LINE 1', 'LINE 2']
  };
}
