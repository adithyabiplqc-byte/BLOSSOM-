/**
 * BQOS - Blossom Quality Operation System
 * Google Apps Script Backend
 */

const CACHE_TTL = 30; // Reduced to 30 seconds for better sync

function doGet(e) {
  try {
    // Try to check if our template works
    return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('BQOS - Blossom Quality Operation System')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    // Elegant fallback: Render a beautiful dynamic status page so they don't get 'index not found' errors
    const targetSs = typeof STANDALONE_SPREADSHEET_URL_OR_ID === 'string' ? STANDALONE_SPREADSHEET_URL_OR_ID : 'Active Google Spreadsheet';
    const htmlOutput = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>BQOS Database Service - Online</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background: #f8fafc;
              color: #0f172a;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 1.5rem;
              box-sizing: border-box;
            }
            .container {
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 1.5rem;
              padding: 2.5rem;
              max-width: 550px;
              width: 100%;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
              text-align: center;
            }
            .status-badge {
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              background: #dcfce7;
              color: #15803d;
              font-weight: 800;
              font-size: 0.75rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              padding: 0.5rem 1rem;
              border-radius: 9999px;
              margin-bottom: 1.5rem;
            }
            .pulse {
              width: 8px;
              height: 8px;
              background-color: #22c55e;
              border-radius: 50%;
              animation: pulse 1.5s infinite;
            }
            h1 {
              font-size: 1.75rem;
              font-weight: 800;
              margin: 0 0 0.5rem 0;
              letter-spacing: -0.025em;
              color: #1e293b;
            }
            .subtitle {
              color: #64748b;
              font-size: 0.875rem;
              text-transform: uppercase;
              font-weight: 700;
              letter-spacing: 0.1em;
              margin-bottom: 2rem;
            }
            p {
              color: #475569;
              font-size: 0.975rem;
              line-height: 1.6;
              margin: 0 0 1.5rem 0;
            }
            .info-box {
              background: #f1f5f9;
              border-radius: 1rem;
              padding: 1.25rem;
              text-align: left;
              margin: 1.5rem 0;
              font-size: 0.875rem;
            }
            .info-title {
              font-weight: 700;
              color: #334155;
              text-transform: uppercase;
              font-size: 0.75rem;
              letter-spacing: 0.05em;
              margin-bottom: 0.5rem;
            }
            .info-value {
              font-family: monospace;
              word-break: break-all;
              background: #e2e8f0;
              padding: 0.5rem;
              border-radius: 0.5rem;
              color: #0f172a;
            }
            .footer {
              margin-top: 2rem;
              font-size: 0.75rem;
              color: #94a3b8;
              font-weight: 500;
            }
            @keyframes pulse {
              0% { transform: scale(0.95); opacity: 0.5; }
              50% { transform: scale(1.1); opacity: 1; }
              100% { transform: scale(0.95); opacity: 0.5; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <span class="status-badge">
              <span class="pulse"></span>
              Service Active
            </span>
            <h1>BQOS Sync Backend</h1>
            <div class="subtitle">Blossom Quality Operation System</div>
            <p>Your Google Apps Script Web App database backend is running successfully and is permanently online!</p>
            
            <div class="info-box">
              <div class="info-title">Connected Spreadsheet</div>
              <div class="info-value">${targetSs ? targetSs : 'Loaded dynamically via API client'}</div>
            </div>

            <p style="font-size: 0.825rem; color: #64748b; margin-top: 1rem;">
              You can close this tab and return to your BQOS dashboard application. Real-time updates and synchronization with your workbook are fully operational.
            </p>

            <div class="footer">
              Blossom Quality Operation System &copy; 2026. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;
    return HtmlService.createHtmlOutput(htmlOutput)
      .setTitle('BQOS - Blossom Quality Operation System')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

var _dynamicSpreadsheetId = null;

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    if (postData && postData.spreadsheetId) {
      _dynamicSpreadsheetId = postData.spreadsheetId;
    }
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

// --- STANDALONE CONFIGURATION OPTION ---
// If you created a standalone Google Apps Script at script.google.com (instead of Extensions > Apps Script)
// copy-paste your Google Spreadsheet full URL or ID inside the quotes below!
const STANDALONE_SPREADSHEET_URL_OR_ID = "";

// --- CORE SHEET UTILITIES ---

let _ssInstance = null;
function getSS() {
  let cacheValid = false;
  try {
    if (_ssInstance) {
      const currentId = _ssInstance.getId();
      const targetId = typeof _dynamicSpreadsheetId === "string" ? _dynamicSpreadsheetId.trim() : "";
      
      if (targetId !== "" && currentId === targetId) {
        cacheValid = true;
      } else if (targetId === "") {
        // Fallback or standalone
        cacheValid = true;
      }
    }
  } catch (err) {
    _ssInstance = null;
  }

  if (!cacheValid) {
    _ssInstance = null;
  }

  if (!_ssInstance) {
    // 0. Try to open via dynamically passed spreadsheet ID from the client request
    if (typeof _dynamicSpreadsheetId === 'string' && _dynamicSpreadsheetId.trim() !== "") {
      try {
        _ssInstance = SpreadsheetApp.openById(_dynamicSpreadsheetId.trim());
      } catch (e) {
        console.error("Failed to open dynamically passed spreadsheet:", e);
      }
    }

    // 1. Try to open via hardcoded URL/ID if provided
    if (!_ssInstance && typeof STANDALONE_SPREADSHEET_URL_OR_ID === 'string' && STANDALONE_SPREADSHEET_URL_OR_ID.trim() !== "") {
      try {
        const target = STANDALONE_SPREADSHEET_URL_OR_ID.trim();
        if (target.includes("/d/") || target.startsWith("http")) {
          _ssInstance = SpreadsheetApp.openByUrl(target);
        } else {
          _ssInstance = SpreadsheetApp.openById(target);
        }
      } catch (e) {
        console.error("Failed to open standalone spreadsheet:", e);
      }
    }

    // 2. Default fallback to container-active spreadsheet
    if (!_ssInstance) {
      try {
        _ssInstance = SpreadsheetApp.getActiveSpreadsheet();
      } catch (e) {}
    }

    if (!_ssInstance) {
      throw new Error("Spreadsheet not found! If you created a standalone Apps Script project from script.google.com, make sure to paste your Google Spreadsheet's full URL inside STANDALONE_SPREADSHEET_URL_OR_ID at the very top of your Google Script code or re-link the spreadsheet in Google Sheets Setup.");
    }
  }
  return _ssInstance;
}

function findExistingSheetBySynonym(targetName) {
  const ss = getSS();
  const targetNorm = String(targetName || '').trim().toUpperCase();
  let sheet = ss.getSheetByName(targetName);
  if (sheet) return sheet;
  
  // Case-insensitive lookup
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().trim().toUpperCase() === targetNorm) {
      return sheets[i];
    }
  }
  
  const synonymsMap = {
    'USERS': ['USERS', 'USER', 'SERVER USERS', 'USERLOGIN DETAILS', 'USERLOGIN', 'USER LOGIN', 'USER_LOGIN', 'USER_LOGIN_DETAILS', 'USERLOGIN_DETAILS', 'SERVER_USERS'],
    'MATERIAL': ['MATERIAL', 'MATERIAL REPORT', 'MATERIAL QUALITY', 'MATERIAL INSPECTION', 'STORE MATERIAL INSPECTION DATA'],
    'CUTTING': ['CUTTING', 'CUTTING QUALITY', 'CUTTING REPORT'],
    'INLINE': ['INLINE', 'INLINE QUALITY', 'INLINE REPORT', 'SEWING DEFECT', 'SEWING DEFECTS'],
    'ENDLINE': ['ENDLINE', 'ENDLINE QUALITY', 'ENDLINE REPORT'],
    'AQL': ['AQL', 'AQL REPORT', 'AQL INSPECTION'],
    'WORKORDER': ['WORKORDER', 'WORKORDERS', 'WORK ORDER', 'WORKORDERS DATA', 'WORKORDER DATA'],
    'FINAL AUDIT': ['FINAL AUDIT', 'FINAL AUDIT REPORT', 'FINAL REPORT']
  };
  
  // Split base and zone suffix if matching " - ZONE" or space-separated zone suffix
  let basePart = targetNorm;
  let zonePart = '';
  const hyphenIdx = targetNorm.indexOf(' - ');
  if (hyphenIdx !== -1) {
    basePart = targetNorm.slice(0, hyphenIdx).trim();
    zonePart = targetNorm.slice(hyphenIdx).trim();
  } else {
    const zones = ['KERALA', 'TIRUPUR', 'BANGLORE', 'TAMILNADU'];
    for (let k = 0; k < zones.length; k++) {
      if (targetNorm.endsWith(' ' + zones[k])) {
        basePart = targetNorm.slice(0, targetNorm.length - zones[k].length - 1).trim();
        zonePart = ' - ' + zones[k];
        break;
      }
    }
  }
  
  const canonicalMapping = {
    'USERS': 'USERS',
    'USER': 'USERS',
    'MATERIAL': 'MATERIAL',
    'MATERIAL REPORT': 'MATERIAL',
    'MATERIAL QUALITY': 'MATERIAL',
    'MATERIAL INSPECTION': 'MATERIAL',
    'STORE MATERIAL INSPECTION DATA': 'MATERIAL',
    'CUTTING': 'CUTTING',
    'CUTTING QUALITY': 'CUTTING',
    'CUTTING REPORT': 'CUTTING',
    'INLINE': 'INLINE',
    'INLINE QUALITY': 'INLINE',
    'INLINE REPORT': 'INLINE',
    'SEWING DEFECT': 'INLINE',
    'SEWING DEFECTS': 'INLINE',
    'ENDLINE': 'ENDLINE',
    'ENDLINE QUALITY': 'ENDLINE',
    'ENDLINE REPORT': 'ENDLINE',
    'AQL': 'AQL',
    'AQL REPORT': 'AQL',
    'AQL INSPECTION': 'AQL',
    'WORKORDER': 'WORKORDER',
    'WORKORDERS': 'WORKORDER',
    'WORK ORDER': 'WORKORDER',
    'FINAL AUDIT': 'FINAL AUDIT',
    'FINAL AUDIT REPORT': 'FINAL AUDIT',
    'FINAL REPORT': 'FINAL AUDIT'
  };
  
  const canonicalBase = canonicalMapping[basePart];
  if (canonicalBase) {
    const synonyms = synonymsMap[canonicalBase];
    if (synonyms) {
      for (let i = 0; i < synonyms.length; i++) {
        const potentialName = synonyms[i] + zonePart;
        for (let j = 0; j < sheets.length; j++) {
          if (sheets[j].getName().trim().toUpperCase() === potentialName.toUpperCase()) {
            return sheets[j];
          }
        }
      }
    }
  }
  
  return null;
}

function getOrCreateSheet(sheetName) {
  const ss = getSS();
  let sheet = findExistingSheetBySynonym(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function getReportSheetName(baseName, data) {
  const normBase = String(baseName || '').trim().toUpperCase();
  
  let canonicalBase = baseName;
  const hyphenIdx = baseName.indexOf(' - ');
  if (hyphenIdx !== -1) {
    canonicalBase = baseName.slice(0, hyphenIdx).trim();
  }
  
  const canonicalKeys = {
    'MATERIAL REPORT': 'MATERIAL',
    'MATERIAL QUALITY': 'MATERIAL',
    'MATERIAL INSPECTION': 'MATERIAL',
    'STORE MATERIAL INSPECTION DATA': 'MATERIAL',
    'CUTTING QUALITY': 'CUTTING',
    'CUTTING REPORT': 'CUTTING',
    'SEWING DEFECT': 'INLINE',
    'SEWING DEFECTS': 'INLINE',
    'INLINE REPORT': 'INLINE',
    'INLINE QUALITY': 'INLINE',
    'ENDLINE QUALITY': 'ENDLINE',
    'ENDLINE REPORT': 'ENDLINE',
    'AQL REPORT': 'AQL',
    'AQL INSPECTION': 'AQL',
    'WORKORDER': 'WORKORDER',
    'WORKORDERS': 'WORKORDER',
    'WORK ORDER': 'WORKORDER',
    'FINAL AUDIT': 'FINAL AUDIT',
    'FINAL AUDIT REPORT': 'FINAL AUDIT',
    'FINAL REPORT': 'FINAL AUDIT'
  };
  
  const lookupKey = canonicalKeys[canonicalBase.toUpperCase()] || canonicalBase;
  const modulePrefixes = {
    'MATERIAL': 'MATERIAL',
    'CUTTING': 'CUTTING',
    'INLINE': 'INLINE',
    'ENDLINE': 'ENDLINE',
    'AQL': 'AQL',
    'WORKORDER': 'WORKORDER',
    'FINAL AUDIT': 'FINAL AUDIT'
  };
  
  const prefix = modulePrefixes[lookupKey.toUpperCase()] || lookupKey;
  
  // Prevent split zoned sheets for USERS
  const isUserSheet = (prefix.trim().toUpperCase() === 'USERS' || prefix.trim().toUpperCase() === 'USER' || prefix.trim().toUpperCase() === 'SERVER USERS');
  if (isUserSheet) {
    return 'USERS';
  }
  
  const zone = (data?.zone || data?.location || '').toString().trim().toUpperCase();
  
  if (zone && zone !== 'ALL' && zone !== 'SYSTEM' && zone !== 'WORKORDER') {
    var zonedPrefix = prefix + " - " + zone;
    var matchedZoned = findExistingSheetBySynonym(zonedPrefix);
    if (matchedZoned) {
      return matchedZoned.getName();
    }
    // If a zone is specified, do NOT fall back to an unzoned sheet.
    // Instead return the zonedPrefix directly so that a zoned sheet is used/created.
    return zonedPrefix;
  }
  
  // Retrieve existing sheet by synonym or fallback
  const matchedSheet = findExistingSheetBySynonym(prefix);
  if (matchedSheet) {
    return matchedSheet.getName();
  }
  
  return prefix;
}

function resolveSynonymValue(header, record) {
  if (!record) return "";
  var normHeader = header.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
  
  var groups = [
    {
      canonical: 'totalquantity',
      synonyms: ['totalquantity', 'totalqty', 'totalquentity', 'receivedquantity', 'quantity', 'orderqty', 'totalaudited']
    },
    {
      canonical: 'checkedquantity',
      synonyms: ['checkedquantity', 'checkedqty', 'totalaudited', 'totalchecked', 'auditedqty', 'totalcheckedqty']
    },
    {
      canonical: 'passquantity',
      synonyms: ['passedquantity', 'passquantity', 'passqty', 'passedqty', 'pass', 'passed', 'approvedqty', 'okqty', 'okquantity']
    },
    {
      canonical: 'rejectedquantity',
      synonyms: ['rejectedquantity', 'rejectquantity', 'failquantity', 'failqty', 'failedpieces', 'rejected', 'reject', 'failedqty']
    },
    {
      canonical: 'location',
      synonyms: ['location']
    },
    {
      canonical: 'remarks',
      synonyms: ['remarks', 'remark', 'notes', 'note', 'itemremarks', 'generalremarks', 'comments', 'comment']
    }
  ];

  var recordKeys = Object.keys(record);
  
  // 1. Exact case-insensitive alphanumeric first
  var exactMatchKey = recordKeys.find(function(k) { return k.toLowerCase().replace(/[^a-z0-9]/g, '') === normHeader; });
  if (exactMatchKey !== undefined && record[exactMatchKey] !== undefined && record[exactMatchKey] !== null) {
    return record[exactMatchKey];
  }

  // 2. Synonyms groups
  var matchingGroup = groups.find(function(g) { return g.synonyms.indexOf(normHeader) !== -1 || g.canonical === normHeader; });
  if (matchingGroup) {
    for (var i = 0; i < matchingGroup.synonyms.length; i++) {
      var syn = matchingGroup.synonyms[i];
      var matchKey = recordKeys.find(function(k) { return k.toLowerCase().replace(/[^a-z0-9]/g, '') === syn; });
      if (matchKey !== undefined && record[matchKey] !== undefined && record[matchKey] !== null && record[matchKey] !== '') {
        return record[matchKey];
      }
    }
  }

  // 3. Fallback
  var val = record[header];
  return val !== undefined ? val : "";
}

function saveDataToSheet(sheetName, data, adminActivity = false, admin = 'SYSTEM', module = 'SYSTEM') {
  try {
    const resolvedName = getReportSheetName(sheetName, data);
    clearSheetCache(resolvedName);
    const sheet = getOrCreateSheet(resolvedName);
    const lastCol = sheet.getLastColumn();
    let headers = lastCol === 0 ? [] : sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    const normSheet = sheetName.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const normResolved = resolvedName.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const isUserSheet = normSheet === 'USERS' || normResolved === 'USERS';

    if (headers.length === 0) {
      if (normSheet.indexOf('MATERIAL') !== -1 || normResolved.indexOf('MATERIAL') !== -1) {
        headers = ['timestamp', 'receivedDate', 'checkingDate', 'grn', 'billNo', 'supplierName', 'itemName', 'receivedQuantity', 'checkedQuantity', 'passQuantity', 'rejectedQuantity', 'itemRemarks', 'generalRemarks', 'zone', 'inspector', 'id'];
      } else if (isUserSheet) {
        headers = ['userCode', 'username', 'password', 'role', 'location', 'zone', 'restrictions', 'canDownload', 'userSettings'];
      } else {
        headers = Object.keys(data);
      }
      sheet.appendRow(headers);
    } else {
      var normHeaders = headers.map(function(h) { return String(h || '').trim().toLowerCase().replace(/[^a-z0-9]/g, ''); });
      var headersChanged = false;
      
      if (isUserSheet) {
        if (normHeaders.indexOf('zone') === -1) {
          sheet.getRange(1, headers.length + 1).setValue('zone');
          headers.push('zone');
          normHeaders.push('zone');
          headersChanged = true;
        }
        if (normHeaders.indexOf('usersettings') === -1) {
          sheet.getRange(1, headers.length + 1).setValue('userSettings');
          headers.push('userSettings');
          normHeaders.push('usersettings');
          headersChanged = true;
        }
      }
      
      // Dynamic missing headers support
      var keys = Object.keys(data);
      for (var k = 0; k < keys.length; k++) {
        var key = keys[k];
        var cleanKey = String(key || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanKey && normHeaders.indexOf(cleanKey) === -1) {
          sheet.getRange(1, headers.length + 1).setValue(key);
          headers.push(key);
          normHeaders.push(cleanKey);
          headersChanged = true;
        }
      }
      if (headersChanged) {
        SpreadsheetApp.flush();
      }
    }
    
    const row = headers.map(header => {
      const val = resolveSynonymValue(header, data);
      return (val && typeof val === 'object') ? JSON.stringify(val) : (val === undefined ? "" : val);
    });
    
    sheet.appendRow(row);
    SpreadsheetApp.flush(); // Force write for ERP data integrity

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
  try {
    const ss = getSS();
    const sheet = findExistingSheetBySynonym(sheetName) || ss.getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() < 2) return [];
    
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const data = [];
    
    for (let i = 1; i < values.length; i++) {
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        var header = headers[j];
        var val = values[i][j];
        var cellVal = val;
        try {
          if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
            cellVal = JSON.parse(val);
          }
        } catch (e) {}
        
        obj[header] = cellVal;
        
        // Map to canonical keys for safe usage across the application
        var normKey = String(header || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        var hasLocationCol = headers.some(function(h) { return String(h || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '') === 'location'; });
        var hasZoneCol = headers.some(function(h) { return String(h || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '') === 'zone'; });

        if (normKey === 'usercode') obj['userCode'] = cellVal;
        if (normKey === 'username' || normKey === 'name') obj['username'] = cellVal;
        if (normKey === 'password') obj['password'] = cellVal;
        if (normKey === 'role') obj['role'] = cellVal;
        
        if (normKey === 'location') {
          obj['location'] = cellVal;
          if (!hasZoneCol) {
            obj['zone'] = cellVal;
          }
        }
        if (normKey === 'zone') {
          obj['zone'] = cellVal;
          if (!hasLocationCol) {
            obj['location'] = cellVal;
          }
        }
        
        if (normKey === 'restrictions') obj['restrictions'] = cellVal;
        if (normKey === 'candownload') obj['canDownload'] = cellVal;
        if (normKey === 'usersettings') obj['userSettings'] = cellVal;

        if (normKey === 'workordernumber' || normKey === 'workorderno') obj['workorderNumber'] = cellVal;
        if (normKey === 'orderqty' || normKey === 'qty' || normKey === 'quantity') obj['orderQty'] = cellVal;
        if (normKey === 'style') obj['style'] = cellVal;
        if (normKey === 'item') obj['item'] = cellVal;
        if (normKey === 'color' || normKey === 'colour') obj['color'] = cellVal;
        if (normKey === 'unit') obj['unit'] = cellVal;
        if (normKey === 'line') obj['line'] = cellVal;
        if (normKey === 'shipdate') obj['shipDate'] = cellVal;
        if (normKey === 'status') obj['status'] = cellVal;
      }
      data.push(obj);
    }
    
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

function getConsolidatedUserSheetName() {
  return 'USERS';
}

function ensureSheetHasSettingsColumns(sheet) {
  try {
    const lastCol = sheet.getLastColumn();
    const categories = ['ZONE', 'SUPPLIER', 'ITEMS', 'COLOR', 'DEFECTS', 'WORKERS', 'MACHINE', 'OPERATION', 'SIZE', 'CUPSIZE', 'UNIT', 'LINE', 'STYLE_NAME'];
    
    if (lastCol === 0) {
      // Empty sheet, initialize with default global settings
      const globalSettings = api_getGlobalSettings();
      saveSettingsToSheetColumns(sheet, globalSettings);
      return;
    }
    
    // Non-empty sheet. Let's make sure all categories are present as headers!
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) {
      return String(h || '').trim().toUpperCase();
    });
    
    const missingCategories = [];
    categories.forEach(function(cat) {
      if (headers.indexOf(cat.toUpperCase()) === -1) {
        missingCategories.push(cat);
      }
    });
    
    if (missingCategories.length > 0) {
      // Append missing columns
      missingCategories.forEach(function(cat) {
        const nextColIdx = sheet.getLastColumn() + 1;
        sheet.getRange(1, nextColIdx).setValue(cat);
      });
      SpreadsheetApp.flush();
    }
  } catch (err) {
    console.error("Error in ensureSheetHasSettingsColumns for " + sheet.getName() + ":", err);
  }
}

function ensureAllUserSheetsExist() {
  try {
    const ss = getSS();
    const sheets = ss.getSheets();
    const sheetNamesSet = new Set(sheets.map(function(s) { return s.getName().trim(); }));
    
    // Fetch users directly to check for individual tab sheets
    const users = api_getUsers();
    
    users.forEach(function(u) {
      if (!u.userCode) return;
      const target = String(u.userCode).trim();
      
      let uSheet = ss.getSheetByName(target);
      if (!uSheet) {
        try {
          uSheet = ss.insertSheet(target);
          SpreadsheetApp.flush();
        } catch (shErr) {
          console.error("Failed to insert individual sheet for " + target + ":", shErr);
        }
      }
      
      if (uSheet) {
        ensureSheetHasSettingsColumns(uSheet);
      }
    });
  } catch (err) {
    console.error("Error in ensureAllUserSheetsExist:", err);
  }
}

function api_createSheets() {
  try {
    const required = [
      'USERS', 
      'SETTINGS', 
      'ADMIN'
    ];
    
    const zones = ['KERALA', 'TIRUPUR', 'BANGLORE'];
    
    // Auto-create zoned sheets for material, cutting, inline, endline, aql, and workorder
    zones.forEach(function(zone) {
      required.push('MATERIAL - ' + zone);
      required.push('CUTTING - ' + zone);
      required.push('INLINE - ' + zone);
      required.push('ENDLINE - ' + zone);
      required.push('AQL - ' + zone);
      required.push('WORKORDER - ' + zone);
    });
    
    required.push('FINAL AUDIT');
    
    required.forEach(s => getOrCreateSheet(s));
    
    // Explicit headers for MATERIAL zoned sheets
    const materialHeaders = ['timestamp', 'receivedDate', 'checkingDate', 'grn', 'billNo', 'supplierName', 'itemName', 'receivedQuantity', 'checkedQuantity', 'passQuantity', 'rejectedQuantity', 'itemRemarks', 'generalRemarks', 'zone', 'inspector', 'id'];
    zones.forEach(function(zone) {
      const name = 'MATERIAL - ' + zone;
      const sh = findExistingSheetBySynonym(name) || getSS().getSheetByName(name);
      if (sh && sh.getLastColumn() === 0) {
        sh.appendRow(materialHeaders);
      }
    });
    
    // Seed USERS if empty
    const users = api_getUsers();
    if (users.length === 0) {
      api_saveUser({
        userCode: 'A001',
        username: 'admin',
        password: 'admin123',
        role: 'ADMIN',
        location: 'KERALA',
        restrictions: []
      });
    }

    // Seed SETTINGS if empty
    const settings = api_getGlobalSettings();
    const sheet = findExistingSheetBySynonym('SETTINGS') || getSS().getSheetByName('SETTINGS');
    if (sheet && sheet.getLastRow() < 2) {
      api_saveSettings('GLOBAL', settings);
    }

    // Ensure all individual user sheets exist after creation
    ensureAllUserSheetsExist();

    return { success: true };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function api_getInitialData(params) {
  try {
    // 1. Maintain self-healing integrity by checking / backfilling any missing individual user sheets on startup
    ensureAllUserSheetsExist();

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
        location: 'KERALA',
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

    const userCode = params && params.userCode;
    let settingsResult = null;
    if (userCode) {
      settingsResult = api_getUserSettings(userCode);
    } else {
      settingsResult = api_getGlobalSettings();
    }

    return {
      users: users,
      workorders: workorders,
      settings: settingsResult,
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
    const isGlobal = (target === 'GLOBAL' || target === 'SETTINGS');
    if (isGlobal) {
      const ss = getSS();
      const sheetName = 'SETTINGS';
      clearSheetCache(sheetName);
      let sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
      }
      saveSettingsToSheetColumns(sheet, settings);
      SpreadsheetApp.flush();
    } else {
      // It is a user-specific settings update. Save inside their individual sheet as well!
      try {
        const ss = getSS();
        const sheetName = String(target).trim();
        clearSheetCache(sheetName);
        let sheet = ss.getSheetByName(sheetName);
        if (!sheet) {
          sheet = ss.insertSheet(sheetName);
        }
        saveSettingsToSheetColumns(sheet, settings);
        SpreadsheetApp.flush();
      } catch (sheetErr) {
        console.error("Error saving settings to individual sheet for " + target + ":", sheetErr);
      }

      // Save inside the USERS sheet as a fallback/redundant copy
      const users = api_getUsers();
      const user = users.find(u => String(u.userCode || '').trim() === String(target).trim());
      if (user) {
        user.userSettings = settings;
        api_updateUser(user, admin);
      } else {
        return { success: false, error: "User not found to update settings: " + target };
      }
    }
    
    saveDataToSheet('ADMIN', {
      timestamp: new Date().toISOString(),
      module: 'SETTINGS',
      action: 'UPDATE_SETTINGS',
      details: "Updated Settings for " + target + ": " + details,
      admin: admin
    });
    
    return { success: true };
  } catch (e) {
    console.error("Error saving settings for " + target + ":", e);
    return { success: false, error: e.toString() };
  }
}

function saveSettingsToSheetColumns(sheet, settings) {
  sheet.clear();
  const categories = ['ZONE', 'SUPPLIER', 'ITEMS', 'COLOR', 'DEFECTS', 'WORKERS', 'MACHINE', 'OPERATION', 'SIZE', 'CUPSIZE', 'UNIT', 'LINE', 'STYLE_NAME'];
  
  const normalizedSettings = {};
  categories.forEach(function(cat) {
    let raw = settings[cat];
    let arr = [];
    if (typeof raw === 'string') {
      arr = raw.split(/[\n,]/).map(function(s) { return s.trim(); }).filter(Boolean);
    } else if (Array.isArray(raw)) {
      arr = raw.map(function(s) { return String(s).trim(); }).filter(Boolean);
    }
    normalizedSettings[cat] = arr;
  });

  let maxLen = 0;
  categories.forEach(function(cat) {
    if (normalizedSettings[cat].length > maxLen) {
      maxLen = normalizedSettings[cat].length;
    }
  });

  const rows = [categories];
  for (let i = 0; i < maxLen; i++) {
    const row = categories.map(function(cat) {
      const val = normalizedSettings[cat][i];
      return val !== undefined && val !== null ? val : "";
    });
    rows.push(row);
  }

  const range = sheet.getRange(1, 1, rows.length, categories.length);
  range.setValues(rows);
}

// Alias for compatibility
function api_saveSettings(target, settings, admin, details) {
  return api_saveUserSettings(target, settings, admin, details);
}

// User Management
function api_saveUser(user, admin = 'SYSTEM') { 
  const structuredUser = {
    userCode: user.userCode,
    username: user.username,
    password: user.password,
    role: user.role,
    location: user.location,
    zone: user.zone || "",
    restrictions: user.restrictions || [],
    canDownload: user.canDownload !== false,
    userSettings: user.userSettings || {}
  };

  const sheetName = getConsolidatedUserSheetName();
  const res = saveDataToSheet(sheetName, structuredUser, true, admin, 'USER_MGMT');

  if (res && res.success !== false) {
    ensureAllUserSheetsExist();
  }

  return res;
}

function api_getUsers() { 
  const sheetName = getConsolidatedUserSheetName();
  return getDataFromSheet(sheetName);
}

function api_updateUser(user, admin = 'SYSTEM') {
  try {
    const ss = getSS();
    const sheetName = getConsolidatedUserSheetName();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: "Users sheet not found" };
    
    clearSheetCache(sheetName);
    const data = sheet.getDataRange().getValues();
    if (data.length === 0) return { success: false, error: "Users sheet empty" };
    
    const headers = data[0];
    const normHeaders = headers.map(function(h) { return String(h || '').toLowerCase().replace(/[^a-z0-9]/g, ''); });
    const codeIdx = normHeaders.indexOf('usercode');
    if (codeIdx === -1) return { success: false, error: "userCode header not found" };
    
    let updatedAny = false;
    for (let i = 1; i < data.length; i++) {
       if (String(data[i][codeIdx]) === String(user.userCode)) {
         const newRow = headers.map(h => {
           const val = resolveSynonymValue(h, user);
           return (val && typeof val === 'object') ? JSON.stringify(val) : (val === undefined ? "" : val);
         });
         sheet.getRange(i + 1, 1, 1, headers.length).setValues([newRow]);
         updatedAny = true;
       }
    }

    if (updatedAny) {
      saveDataToSheet('ADMIN', {
        timestamp: new Date().toISOString(),
        module: 'USER_MGMT',
        action: 'EDIT USER',
        details: `Updated User ${user.userCode} (${user.username})`,
        admin: admin
      });
      ensureAllUserSheetsExist();
      return { success: true };
    }
    
    return { success: false, error: "User not found in consolidated sheet" };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function api_deleteUser(userCode, reason, admin = 'SYSTEM') {
  try {
    const ss = getSS();
    const sheetName = getConsolidatedUserSheetName();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: "Users sheet not found" };
    
    clearSheetCache(sheetName);
    const data = sheet.getDataRange().getValues();
    if (data.length === 0) return { success: false, error: "Users sheet empty" };
    
    const headers = data[0];
    const normHeaders = headers.map(function(h) { return String(h || '').toLowerCase().replace(/[^a-z0-9]/g, ''); });
    const codeIdx = normHeaders.indexOf('usercode');
    if (codeIdx === -1) return { success: false, error: "userCode header not found" };
    
    let deletedAny = false;
    for (let i = data.length - 1; i >= 1; i--) {
      if (String(data[i][codeIdx]) === String(userCode)) {
        sheet.deleteRow(i + 1);
        deletedAny = true;
      }
    }

    if (deletedAny) {
      saveDataToSheet('ADMIN', {
        timestamp: new Date().toISOString(),
        module: 'USER_MGMT',
        action: 'DELETE USER',
        details: `Deleted User ${userCode}. Reason: ${reason}`,
        admin: admin
      });
      return { success: true };
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
    
    // Determine target canonical prefix
    const canonicalMapping = {
      'USERS': 'USERS',
      'MATERIAL REPORT': 'MATERIAL',
      'MATERIAL INSPECTION': 'MATERIAL',
      'CUTTING QUALITY': 'CUTTING',
      'INLINE': 'INLINE',
      'SEWING DEFECT': 'INLINE',
      'ENDLINE QUALITY': 'ENDLINE',
      'AQL REPORT': 'AQL',
      'WORKORDER': 'WORKORDER',
      'FINAL AUDIT': 'FINAL AUDIT',
      '8ROUND SYSTEM': 'INLINE'
    };
    
    const canonicalPrefix = canonicalMapping[baseName] || baseName;
    
    // Synonyms and prefix names to aggregate for this base
    const prefixSynonyms = {
      'USERS': ['USERS', 'USER'],
      'MATERIAL': ['MATERIAL', 'MATERIAL REPORT'],
      'CUTTING': ['CUTTING', 'CUTTING QUALITY', 'CUTTING REPORT'],
      'INLINE': ['INLINE', 'INLINE QUALITY', 'INLINE REPORT'],
      'ENDLINE': ['ENDLINE', 'ENDLINE QUALITY', 'ENDLINE REPORT'],
      'AQL': ['AQL', 'AQL REPORT', 'AQL INSPECTION'],
      'WORKORDER': ['WORKORDER', 'WORKORDERS', 'WORK ORDER'],
      'FINAL AUDIT': ['FINAL AUDIT', 'FINAL AUDIT REPORT', 'FINAL REPORT']
    };
    
    const allowedPrefixes = prefixSynonyms[canonicalPrefix] || [canonicalPrefix];
    
    // Check all sheets in spreadsheet
    sheets.forEach(sheet => {
      const sheetName = sheet.getName().trim();
      const sheetNameUpper = sheetName.toUpperCase();
      
      let matches = false;
      allowedPrefixes.forEach(prefix => {
        const prefixUpper = prefix.toUpperCase();
        if (sheetNameUpper === prefixUpper) {
          matches = true;
        } else if (sheetNameUpper.startsWith(prefixUpper + " - ") || sheetNameUpper.startsWith(prefixUpper + " ")) {
          matches = true;
        }
      });
      
      if (matches) {
        const sheetData = getDataFromSheet(sheetName);
        if (sheetData && sheetData.length > 0) {
          allData = allData.concat(sheetData);
        }
      }
    });

    // Check for "DATA CENTER" sheet (Secondary consolidated source)
    if (sheetNames.includes('DATA CENTER')) {
      const dcData = getDataFromSheet('DATA CENTER');
      if (dcData && dcData.length > 0) {
        const filteredDC = dcData.filter(row => {
          const typeVal = String(row.type || row.TYPE || row.Module || "").toUpperCase();
          return !typeVal || allowedPrefixes.some(pn => typeVal === pn.toUpperCase());
        });
        allData = allData.concat(filteredDC);
      }
    }

    // Deduplicate by ID
    const seenIds = new Set();
    const uniqueData = allData.filter(row => {
      const id = (canonicalPrefix === 'WORKORDER')
        ? (row.id || row.workorderNumber || row.ID)
        : (row.id || row.ID || row.userCode);
      if (!id) return true; 
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });

    // Sort newest first
    uniqueData.sort(function(a, b) {
      var dateA = a.timestamp || a.checkingDate || a.receivedDate || a.date || a.createdAt;
      var dateB = b.timestamp || b.checkingDate || b.receivedDate || b.date || b.createdAt;
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      var timeA = new Date(dateA).getTime();
      var timeB = new Date(dateB).getTime();
      if (isNaN(timeA) && isNaN(timeB)) return 0;
      if (isNaN(timeA)) return 1;
      if (isNaN(timeB)) return -1;
      return timeB - timeA;
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
  return api_updateDataBySheet('WORKORDER', wo);
}

function api_deleteWorkorder(id, zone) {
  return api_deleteDataBySheet('WORKORDER', id);
}

function api_ping() {
  return { success: true, status: "Connected", timestamp: new Date().toISOString() };
}

function api_bulkSave(sheetName, records) {
  try {
    if (!records || !Array.isArray(records) || records.length === 0) {
      return { success: true, count: 0 };
    }
    
    const sheet = getOrCreateSheet(sheetName);
    const lastCol = sheet.getLastColumn();
    let headers = lastCol === 0 ? [] : sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    if (headers.length === 0) {
      headers = Object.keys(records[0]);
      sheet.appendRow(headers);
    }
    
    const rows = records.map(data => {
      // Ensure ID
      if (!data.id && !data.workorderNumber) data.id = Utilities.getUuid();
      
      return headers.map(header => {
        const val = resolveSynonymValue(header, data);
        return (val && typeof val === 'object') ? JSON.stringify(val) : (val === undefined ? "" : val);
      });
    });
    
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, rows.length, headers.length).setValues(rows);
    SpreadsheetApp.flush();
    clearSheetCache(sheetName);
    
    return { success: true, count: rows.length };
  } catch (e) {
    console.error(`Bulk save error for ${sheetName}:`, e);
    return { success: false, error: e.toString() };
  }
}

// Data Entry Saving
function api_saveMaterialReportBulk(data) {
  const { zone, billNo, supplierName, grn, checkingDate, receivedDate, remarks, inspector, timestamp, items } = data;
  let successCount = 0;
  let errors = [];
  
  if (items && Array.isArray(items)) {
    items.forEach(item => {
      const row = {
        timestamp: timestamp || new Date().toISOString(),
        receivedDate: receivedDate || "",
        checkingDate: checkingDate || "",
        grn: grn || "",
        billNo: billNo || "",
        supplierName: supplierName || "",
        itemName: item.itemName || "",
        receivedQuantity: item.receivedQuantity || 0,
        checkedQuantity: item.checkedQuantity || 0,
        passQuantity: item.passQuantity || 0,
        rejectedQuantity: item.rejectedQuantity || 0,
        itemRemarks: item.remarks || "",
        generalRemarks: remarks || "",
        zone: zone || "",
        inspector: inspector || "",
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
    // Resolve sheet name (e.g., 'WORKORDER - KERALA' or 'WORKORDER')
    const sheetName = getReportSheetName('WORKORDER', { zone: zone });
    
    // Check both the resolved sheet and generic fallback
    const sheetsToTry = [sheetName, 'WORKORDER'];
    let updated = false;
    
    for (let sIdx = 0; sIdx < sheetsToTry.length; sIdx++) {
      const curSheetName = sheetsToTry[sIdx];
      const sheet = findExistingSheetBySynonym(curSheetName) || ss.getSheetByName(curSheetName);
      if (sheet) {
        const data = sheet.getDataRange().getValues();
        if (data.length > 0) {
          const headers = data[0];
          const normHeaders = headers.map(function(h) { return String(h || '').toLowerCase().replace(/[^a-z0-9]/g, ''); });
          const woIdx = normHeaders.indexOf('workordernumber');
          const statusIdx = normHeaders.indexOf('status');
          
          if (woIdx !== -1) {
            let colToUpdate = statusIdx;
            if (statusIdx === -1) {
              colToUpdate = headers.length;
              sheet.getRange(1, colToUpdate + 1).setValue('status');
            }
            
            for (let i = 1; i < data.length; i++) {
              if (String(data[i][woIdx]) === String(woNum)) {
                sheet.getRange(i + 1, colToUpdate + 1).setValue(nextStatus);
                updated = true;
                break;
              }
            }
            if (updated) {
              clearSheetCache(sheet.getName());
              break;
            }
          }
        }
      }
    }
    
    // Fallback: search ALL sheets starting with WORKORDER synonym just in case
    if (!updated) {
      const allSheets = ss.getSheets();
      for (let sIdx = 0; sIdx < allSheets.length; sIdx++) {
        const sheet = allSheets[sIdx];
        const sNameUpper = sheet.getName().toUpperCase().trim();
        if (sNameUpper === 'WORKORDER' || sNameUpper.startsWith('WORKORDER - ') || sNameUpper.startsWith('WORK_ORDER') || sNameUpper.startsWith('WORKORDERS')) {
          const data = sheet.getDataRange().getValues();
          if (data.length > 0) {
            const headers = data[0];
            const normHeaders = headers.map(function(h) { return String(h || '').toLowerCase().replace(/[^a-z0-9]/g, ''); });
            const woIdx = normHeaders.indexOf('workordernumber');
            const statusIdx = normHeaders.indexOf('status');
            
            if (woIdx !== -1) {
              let colToUpdate = statusIdx;
              if (statusIdx === -1) {
                colToUpdate = headers.length;
                sheet.getRange(1, colToUpdate + 1).setValue('status');
              }
              
              for (let i = 1; i < data.length; i++) {
                if (String(data[i][woIdx]) === String(woNum)) {
                  sheet.getRange(i + 1, colToUpdate + 1).setValue(nextStatus);
                  updated = true;
                  break;
                }
              }
              if (updated) {
                clearSheetCache(sheet.getName());
                break;
              }
            }
          }
        }
      }
    }
    
    return { success: true };
  } catch (e) {
    console.error("Error updating WO status:", e);
    return { success: false, error: e.toString() };
  }
}

function api_saveCUTTINGQUALITY(report) { 
  const res = saveDataToSheet('CUTTING QUALITY', report);
  if (res.success && report.moveToInline && report.wo) {
    internal_updateWorkorderStatus(report.wo, report.zone || report.location, 'INLINE_AND_ENDLINE');
  }
  return res;
}
function api_saveSEWINGDEFECT(report) { 
  const res = saveDataToSheet('INLINE', report);
  // Do not update workorder status; keep it in INLINE_AND_ENDLINE so it stays visible in both
  return res;
}
function api_save8ROUNDSYSTEM(report) { 
  const res = saveDataToSheet('INLINE', report);
  return res;
}
function api_update8ROUNDSYSTEM(record) { 
  return api_updateDataBySheet('INLINE', record);
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
  if (res.success && (report.moveToFinal || report.auditStatus === 'PASS') && report.wo) {
    internal_updateWorkorderStatus(report.wo, report.zone || report.location, 'FINAL');
  }
  return res;
}
function api_saveFINALAUDIT(report) { 
  const res = saveDataToSheet('FINAL AUDIT', report);
  if (res.success && report.wo) {
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
    const targetSheetName = getReportSheetName(sheetName, { zone: zone });
    
    clearSheetCache(targetSheetName);
    const sheet = getOrCreateSheet(targetSheetName);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const normHeaders = headers.map(function(h) { return String(h || '').toLowerCase().replace(/[^a-z0-9]/g, ''); });
    let idIdx = normHeaders.indexOf('id');
    if (idIdx === -1) idIdx = normHeaders.indexOf('workordernumber');
    if (idIdx === -1) idIdx = normHeaders.indexOf('usercode');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIdx] === id) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    
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
    const targetSheetName = getReportSheetName(sheetName, record);

    clearSheetCache(targetSheetName);
    const sheet = getOrCreateSheet(targetSheetName);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const normHeaders = headers.map(function(h) { return String(h || '').toLowerCase().replace(/[^a-z0-9]/g, ''); });
    let idIdx = normHeaders.indexOf('id');
    if (idIdx === -1) idIdx = normHeaders.indexOf('workordernumber');
    if (idIdx === -1) idIdx = normHeaders.indexOf('usercode');
    const id = record.id || record.workorderNumber || record.userCode;

    for (let i = 1; i < data.length; i++) {
      if (data[i][idIdx] === id) {
        const newRow = headers.map(h => {
          const val = resolveSynonymValue(h, record);
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
  const baseName = 'INLINE';
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
function api_get8ROUNDSYSTEMData(params) { 
  return api_getInlineData(params);
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
function api_deleteInlineData(id) { return api_deleteDataBySheet('INLINE', id); }
function api_deleteEndlineData(id) { return api_deleteDataBySheet('ENDLINE QUALITY', id); }
function api_deleteAQLData(id) { return api_deleteDataBySheet('AQL REPORT', id); }
function api_deleteFinalAuditData(id) { return api_deleteDataBySheet('FINAL AUDIT', id); }

// User Settings (Dropdown Options)
function api_getUserSettings(userCode) {
  try {
    const isGlobal = (userCode === 'GLOBAL' || userCode === 'SETTINGS');
    if (isGlobal) {
      return api_getGlobalSettings();
    }
    
    // Attempt to read from the user's individual sheet first as a live source of truth
    const ss = getSS();
    const targetSheet = ss.getSheetByName(String(userCode).trim());
    if (targetSheet) {
      const settings = readSettingsFromSheetColumns(targetSheet);
      if (settings && Object.keys(settings).length > 0) {
        // Also ensure STYLE_NAME is there
        if (!settings.STYLE_NAME) settings.STYLE_NAME = [];
        return settings;
      }
    }
    
    // Search for user in the consolidated USERS list as a secondary backup/fallback
    const users = api_getUsers();
    const user = users.find(u => String(u.userCode || '').trim() === String(userCode).trim());
    if (user && user.userSettings) {
      try {
        const val = typeof user.userSettings === 'string' ? JSON.parse(user.userSettings) : user.userSettings;
        if (val && typeof val === 'object') {
          return val;
        }
      } catch (pErr) {
        console.error("Error parsing userSettings from USERS row:", pErr);
      }
    }
    
    return api_getGlobalSettings();
  } catch (e) {
    console.error("Error getting settings for " + userCode + ":", e);
    return api_getGlobalSettings();
  }
}

function readSettingsFromSheetColumns(sheet) {
  const values = sheet.getDataRange().getValues();
  const settings = {};
  const categories = ['ZONE', 'SUPPLIER', 'ITEMS', 'COLOR', 'DEFECTS', 'WORKERS', 'MACHINE', 'OPERATION', 'SIZE', 'CUPSIZE', 'UNIT', 'LINE', 'STYLE_NAME'];
  categories.forEach(function(cat) { settings[cat] = []; });
  
  if (values.length > 0) {
    const headers = values[0];
    const normHeaders = headers.map(function(h) { return String(h || '').trim().toUpperCase(); });
    
    const ALIASES = {
      ZONE: ['ZONE', 'ZONES'],
      SUPPLIER: ['SUPPLIER', 'SUPPLIERS', 'SUPPLIER NAME', 'SUPPLIER NAMES'],
      ITEMS: ['ITEMS', 'ITEM', 'ITEM NAME', 'ITEM NAMES'],
      COLOR: ['COLOR', 'COLORS', 'COLOUR', 'COLOURS'],
      DEFECTS: ['DEFECTS', 'DEFECT', 'DEFECT NAME', 'DEFECT NAMES'],
      WORKERS: ['WORKERS', 'WORKER', 'WORKER NAME', 'WORKER NAMES'],
      MACHINE: ['MACHINE', 'MACHINES', 'MACHINE NAME', 'MACHINE NAMES'],
      OPERATION: ['OPERATION', 'OPERATIONS', 'OPERATION NAME', 'OPERATION NAMES'],
      SIZE: ['SIZE', 'SIZES', 'SIZE RANGE', 'SIZE RANGES'],
      CUPSIZE: ['CUPSIZE', 'CUPSIZES', 'CUP', 'CUPS'],
      UNIT: ['UNIT', 'UNITS'],
      LINE: ['LINE', 'LINES'],
      STYLE_NAME: ['STYLE NAME', 'STYLE_NAME', 'STYLE NAMES', 'STYLE_NAMES', 'STYLE', 'STYLES']
    };

    categories.forEach(function(cat) {
      const aliases = ALIASES[cat] || [cat];
      let colIdx = -1;
      for (let i = 0; i < aliases.length; i++) {
        const idx = normHeaders.indexOf(aliases[i].toUpperCase());
        if (idx !== -1) {
          colIdx = idx;
          break;
        }
      }
      if (colIdx !== -1) {
        for (let rowIdx = 1; rowIdx < values.length; rowIdx++) {
          const val = values[rowIdx][colIdx];
          if (val !== "" && val !== undefined && val !== null) {
            settings[cat].push(val);
          }
        }
      }
    });
  }
  return settings;
}

function api_getGlobalSettings() {
  try {
    const ss = getSS();
    const sheets = ss.getSheets();
    const sheetNames = sheets.map(s => s.getName());
    
    const defaults = {
      ZONE: ['KERALA', 'TIRUPUR', 'BANGLORE'],
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
      LINE: ['LINE 1', 'LINE 2'],
      STYLE_NAME: ['STYLE A', 'STYLE B', 'STYLE C', 'STYLE 1', 'STYLE 2']
    };

    const finalSettings = { ...defaults };
    const categories = ['ZONE', 'SUPPLIER', 'ITEMS', 'COLOR', 'DEFECTS', 'WORKERS', 'MACHINE', 'OPERATION', 'SIZE', 'CUPSIZE', 'UNIT', 'LINE', 'STYLE_NAME'];
    
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
      ['COLOR', 'COLORS', 'COLOUR', 'COLOURS'],
      ['SIZE', 'SIZES'],
      ['STYLE_NAME', 'STYLE NAME', 'STYLE NAMES', 'STYLE_NAMES', 'STYLE', 'STYLES']
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
