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
    
    // Explicit map of API functions for guaranteed Google Apps Script V8 runtime resolution
    const apiMap = {
      'api_createSheets': api_createSheets,
      'api_getInitialData': api_getInitialData,
      'api_getAdminLogs': api_getAdminLogs,
      'api_saveUserSettings': api_saveUserSettings,
      'api_saveSettings': api_saveSettings,
      'api_saveUser': api_saveUser,
      'api_getUsers': api_getUsers,
      'api_updateUser': api_updateUser,
      'api_deleteUser': api_deleteUser,
      'api_logAdminActivity': api_logAdminActivity,
      'api_saveWorkorder': api_saveWorkorder,
      'api_getWorkorders': api_getWorkorders,
      'api_updateWorkorder': api_updateWorkorder,
      'api_deleteWorkorder': api_deleteWorkorder,
      'api_ping': api_ping,
      'api_bulkSave': api_bulkSave,
      'api_saveMaterialReportBulk': api_saveMaterialReportBulk,
      'api_saveMATERIALREPORT': api_saveMATERIALREPORT,
      'api_saveCUTTINGQUALITY': api_saveCUTTINGQUALITY,
      'api_saveSEWINGDEFECT': api_saveSEWINGDEFECT,
      'api_save8ROUNDSYSTEM': api_save8ROUNDSYSTEM,
      'api_update8ROUNDSYSTEM': api_update8ROUNDSYSTEM,
      'api_saveENDLINEQUALITY': api_saveENDLINEQUALITY,
      'api_saveAQLREPORT': api_saveAQLREPORT,
      'api_saveFINALAUDIT': api_saveFINALAUDIT,
      'api_saveREWORK': api_saveREWORK,
      'api_saveMaterialReport': api_saveMaterialReport,
      'api_saveCuttingReport': api_saveCuttingReport,
      'api_saveInlineReport': api_saveInlineReport,
      'api_saveEndlineReport': api_saveEndlineReport,
      'api_saveReworkReport': api_saveReworkReport,
      'api_saveDataBySheet': api_saveDataBySheet,
      'api_getDataBySheet': api_getDataBySheet,
      'api_deleteDataBySheet': api_deleteDataBySheet,
      'api_updateDataBySheet': api_updateDataBySheet,
      'api_getMISData': api_getMISData,
      'api_getMaterialData': api_getMaterialData,
      'api_getCuttingData': api_getCuttingData,
      'api_getInlineData': api_getInlineData,
      'api_get8ROUNDSYSTEMData': api_get8ROUNDSYSTEMData,
      'api_getEndlineData': api_getEndlineData,
      'api_getAQLData': api_getAQLData,
      'api_getFinalAuditData': api_getFinalAuditData,
      'api_deleteMaterialData': api_deleteMaterialData,
      'api_deleteCuttingData': api_deleteCuttingData,
      'api_deleteInlineData': api_deleteInlineData,
      'api_deleteEndlineData': api_deleteEndlineData,
      'api_deleteAQLData': api_deleteAQLData,
      'api_deleteFinalAuditData': api_deleteFinalAuditData,
      'api_getUserSettings': api_getUserSettings,
      'api_getGlobalSettings': api_getGlobalSettings,
      'api_uploadSOPFile': api_uploadSOPFile,
      'api_saveREPORTS_SOP': api_saveREPORTS_SOP,
      'api_getREPORTS_SOPData': api_getREPORTS_SOPData,
      'api_deleteREPORTS_SOP': api_deleteREPORTS_SOP,
      'api_getZoneMappings': api_getZoneMappings,
      'api_saveZoneMapping': api_saveZoneMapping,
      'api_deleteZoneMapping': api_deleteZoneMapping,
      'api_resetAllDatabase': api_resetAllDatabase
    };
    
    let func = apiMap[action];
    
    // Dynamic fallback for any unmapped/newly added functions starting with 'api_'
    if (!func) {
      try {
        func = (typeof globalThis !== 'undefined' ? globalThis[action] : null) || this[action] || eval(action);
      } catch (err) {}
    }

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
  
  // Strict case-insensitive exact match
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().trim().toUpperCase() === targetNorm) {
      return sheets[i];
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

function getCanonicalBase(baseName) {
  if (!baseName) return '';
  const norm = baseName.toUpperCase().trim();
  
  let cleanBase = norm;
  const hyphenIdx = norm.indexOf(' - ');
  if (hyphenIdx !== -1) {
    cleanBase = norm.slice(0, hyphenIdx).trim();
  }
  
  const mapping = {
    'USERS': 'USERS', 'USER': 'USERS', 'SERVER USERS': 'USERS', 'USERLOGIN DETAILS': 'USERS', 'USERLOGIN': 'USERS', 'USER LOGIN': 'USERS', 'USER_LOGIN': 'USERS', 'USER_LOGIN_DETAILS': 'USERS', 'USERLOGIN_DETAILS': 'USERS', 'SERVER_USERS': 'USERS',
    'MATERIAL': 'MATERIAL', 'MATERIAL REPORT': 'MATERIAL', 'MATERIAL QUALITY': 'MATERIAL', 'MATERIAL INSPECTION': 'MATERIAL', 'STORE MATERIAL INSPECTION DATA': 'MATERIAL',
    'CUTTING': 'CUTTING', 'CUTTING QUALITY': 'CUTTING', 'CUTTING REPORT': 'CUTTING',
    'INLINE': 'INLINE', 'INLINE REPORT': 'INLINE', 'INLINE QUALITY': 'INLINE', 'SEWING DEFECT': 'INLINE', 'SEWING DEFECTS': 'INLINE', '8ROUND SYSTEM': 'INLINE', '8ROUND': 'INLINE', '8 ROUND SYSTEM': 'INLINE', '8ROUND_SYSTEM': 'INLINE', '8 ROUNDS': 'INLINE',
    'ENDLINE': 'ENDLINE', 'ENDLINE QUALITY': 'ENDLINE', 'ENDLINE REPORT': 'ENDLINE',
    'AQL': 'AQL', 'AQL REPORT': 'AQL', 'AQL INSPECTION': 'AQL',
    'WORKORDER': 'WORKORDER', 'WORKORDERS': 'WORKORDER', 'WORK ORDER': 'WORKORDER',
    'FINAL AUDIT': 'FINAL AUDIT', 'FINAL AUDIT REPORT': 'FINAL AUDIT', 'FINAL REPORT': 'FINAL AUDIT', 'FINAL': 'FINAL AUDIT',
    'REWORK': 'REWORK', 'REWORK REPORT': 'REWORK', 'REWORK QUALITY': 'REWORK',
    'REPORTS_SOP': 'REPORTS_SOP', 'REPORTS_SOPDATA': 'REPORTS_SOP', 'SOP': 'REPORTS_SOP', 'REPORTS - SOP': 'REPORTS_SOP', 'SOP REPORTS': 'REPORTS_SOP', 'SOP_REPORTS': 'REPORTS_SOP', 'REPORTS & SOPS': 'REPORTS_SOP', 'REPORTS': 'REPORTS_SOP', 'SOPS': 'REPORTS_SOP',
    'ZONE': 'ZONE', 'ZONES': 'ZONE', 'ZONE_MAPPINGS': 'ZONE',
    'UNIT': 'UNIT', 'UNITS': 'UNIT',
    'SETTINGS': 'SETTINGS', 'GLOBAL': 'SETTINGS',
    'ADMIN': 'ADMIN'
  };
  
  return mapping[cleanBase] || cleanBase;
}

function getReportSheetName(baseName, data) {
  const canonical = getCanonicalBase(baseName);
  const systemSheets = ['USERS', 'ZONE', 'UNIT', 'SETTINGS', 'ADMIN', 'REPORTS_SOP'];
  if (systemSheets.indexOf(canonical) !== -1) {
    return canonical;
  }
  
  const rawZone = data?.zone || data?.location;
  const zone = String(rawZone || '').trim().toUpperCase();
  if (zone && zone !== 'ALL' && zone !== 'SYSTEM' && zone !== 'WORKORDER' && zone !== 'COMMON') {
    return canonical + " - " + zone;
  }

  // Dynamic fallback sheet synonym alignment
  const ss = getSS();
  if (canonical === 'CUTTING' && (ss.getSheetByName('CUTTING QUALITY') || ss.getSheetByName('Cutting Quality'))) {
    return 'CUTTING QUALITY';
  }
  if (canonical === 'MATERIAL' && (ss.getSheetByName('MATERIAL REPORT') || ss.getSheetByName('Material Report'))) {
    return 'MATERIAL REPORT';
  }
  if (canonical === 'ENDLINE' && (ss.getSheetByName('ENDLINE QUALITY') || ss.getSheetByName('Endline Quality'))) {
    return 'ENDLINE QUALITY';
  }
  if (canonical === 'AQL' && (ss.getSheetByName('AQL REPORT') || ss.getSheetByName('AQL Report'))) {
    return 'AQL REPORT';
  }

  return canonical;
}

function areSynonyms(h1, h2) {
  if (!h1 || !h2) return false;
  var norm1 = h1.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
  var norm2 = h2.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (norm1 === norm2) return true;

  var groups = [
    ['totalquantity', 'totalqty', 'totalquentity', 'receivedquantity', 'quantity', 'orderqty', 'totalaudited', 'qty'],
    ['checkedquantity', 'checkedqty', 'totalaudited', 'totalchecked', 'auditedqty', 'totalcheckedqty'],
    ['passedquantity', 'passquantity', 'passqty', 'passedqty', 'pass', 'passed', 'approvedqty', 'okqty', 'okquantity'],
    ['rejectedquantity', 'rejectquantity', 'failquantity', 'failqty', 'failedpieces', 'rejected', 'reject', 'failedqty'],
    ['remarks', 'remark', 'notes', 'note', 'itemremarks', 'generalremarks', 'comments', 'comment'],
    ['style', 'stylename', 'style_name', 'styles', 'stylenames'],
    ['color', 'colour', 'colors', 'colours'],
    ['workordernumber', 'workorderno', 'workorderNumber', 'workorderNo', 'wo', 'wonum', 'wonumber'],
    ['unit', 'units'],
    ['line', 'lines'],
    ['size', 'sizes'],
    ['cupsize', 'cup', 'cups']
  ];

  for (var i = 0; i < groups.length; i++) {
    var group = groups[i];
    var hasNorm1 = group.indexOf(norm1) !== -1;
    var hasNorm2 = group.indexOf(norm2) !== -1;
    if (hasNorm1 && hasNorm2) return true;
  }
  return false;
}

function resolveSynonymValue(header, record) {
  if (!record) return "";
  var normHeader = header.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
  
  var groups = [
    {
      canonical: 'totalquantity',
      synonyms: ['totalquantity', 'totalqty', 'totalquentity', 'receivedquantity', 'quantity', 'orderqty', 'totalaudited', 'qty']
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
    },
    {
      canonical: 'style',
      synonyms: ['style', 'stylename', 'style_name', 'styles', 'stylenames']
    },
    {
      canonical: 'color',
      synonyms: ['color', 'colour', 'colors', 'colours']
    },
    {
      canonical: 'workordernumber',
      synonyms: ['workordernumber', 'workorderno', 'workorderNumber', 'workorderNo', 'wo', 'wonum', 'wonumber']
    },
    {
      canonical: 'unit',
      synonyms: ['unit', 'units']
    },
    {
      canonical: 'line',
      synonyms: ['line', 'lines']
    },
    {
      canonical: 'size',
      synonyms: ['size', 'sizes']
    },
    {
      canonical: 'cupsize',
      synonyms: ['cupsize', 'cup', 'cups']
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
        var hasSynonym = false;
        for (var hIdx = 0; hIdx < headers.length; hIdx++) {
          if (areSynonyms(headers[hIdx], key)) {
            hasSynonym = true;
            break;
          }
        }
        if (cleanKey && !hasSynonym) {
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
    const cacheKey = `BQOS_CACHE_${sheetName.replace(/\s+/g, '_')}`;
    try {
      const cache = CacheService.getScriptCache();
      const cached = cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (cacheErr) {
      console.warn("Cache read failed:", cacheErr);
    }

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
        if (normKey === 'zone' || normKey === 'zones' || normKey === 'zonename' || normKey === 'zonenames') {
          obj['zone'] = cellVal;
          if (!hasLocationCol) {
            obj['location'] = cellVal;
          }
        }
        
        if (normKey === 'restrictions') obj['restrictions'] = cellVal;
        if (normKey === 'candownload') obj['canDownload'] = cellVal;
        if (normKey === 'usersettings') obj['userSettings'] = cellVal;

        if (normKey === 'workordernumber' || normKey === 'workorderno' || normKey === 'wo' || normKey === 'wonum' || normKey === 'wonumber' || normKey === 'workorder') obj['workorderNumber'] = cellVal;
        if (normKey === 'orderqty' || normKey === 'qty' || normKey === 'quantity') {
          obj['orderQty'] = cellVal;
          obj['quantity'] = cellVal;
        }
        if (normKey === 'style' || normKey === 'stylename') {
          obj['style'] = cellVal;
          obj['styleName'] = cellVal;
        }
        if (normKey === 'size' || normKey === 'sizes') {
          obj['size'] = cellVal;
        }
        if (normKey === 'cup' || normKey === 'cupsize' || normKey === 'cups') {
          obj['cup'] = cellVal;
        }
        if (normKey === 'item') obj['item'] = cellVal;
        if (normKey === 'color' || normKey === 'colour') obj['color'] = cellVal;
        if (normKey === 'unit') obj['unit'] = cellVal;
        if (normKey === 'line') obj['line'] = cellVal;
        if (normKey === 'shipdate') obj['shipDate'] = cellVal;
        if (normKey === 'status') obj['status'] = cellVal;
        
        // Inline / Sewing defect mapping normalizations
        if (normKey === 'worker' || normKey === 'workername' || normKey === 'operator' || normKey === 'operatorname') {
          obj['worker'] = cellVal;
        }
        if (normKey === 'machine' || normKey === 'machineno' || normKey === 'machinenumber') {
          obj['machine'] = cellVal;
        }
        if (normKey === 'round' || normKey === 'roundlabel' || normKey === 'rounds' || normKey === 'hourlyround') {
          obj['round'] = cellVal;
        }
        if (normKey === 'roundindex' || normKey === 'roundidx') {
          obj['roundIndex'] = parseInt(cellVal, 10) || 0;
        }
        if (normKey === 'checkingdate' || normKey === 'checkingdate' || normKey === 'date' || normKey === 'checkingdatetime') {
          obj['checkingDate'] = cellVal;
          obj['date'] = cellVal;
        }
        if (normKey === 'checkedqty' || normKey === 'pcschecked' || normKey === 'pieceschecked') {
          obj['checkedQty'] = parseInt(cellVal, 10) || 0;
          obj['pcsChecked'] = parseInt(cellVal, 10) || 0;
        }
        if (normKey === 'complaintpcs' || normKey === 'failqty' || normKey === 'failedpieces') {
          obj['complaintPcs'] = parseInt(cellVal, 10) || 0;
          obj['failQty'] = parseInt(cellVal, 10) || 0;
        }
      }
      let isRowEmpty = true;
      for (let j = 0; j < headers.length; j++) {
        const valCheck = values[i][j];
        if (valCheck !== undefined && valCheck !== null && String(valCheck).trim() !== "") {
          isRowEmpty = false;
          break;
        }
      }
      if (!isRowEmpty) {
        data.push(obj);
      }
    }
    
    try {
      const cache = CacheService.getScriptCache();
      const stringified = JSON.stringify(data);
      if (stringified.length < 100000) {
        cache.put(cacheKey, stringified, 600); // 10 minutes cache
      }
    } catch (cacheErr) {
      console.warn("Cache write failed:", cacheErr);
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
    const categories = ['ZONE', 'SUPPLIER', 'ITEMS', 'COLOR', 'DEFECTS', 'WORKERS', 'MACHINE', 'OPERATION', 'SIZE', 'CUPSIZE', 'UNIT', 'LINE', 'STYLE_NAME'];
    
    const lastCol = sheet.getLastColumn();
    if (lastCol === 0) {
      // Empty sheet, initialize with default global settings
      const globalSettings = api_getGlobalSettings();
      saveSettingsToSheetColumns(sheet, globalSettings);
      return;
    }
    
    const currentSettings = readSettingsFromSheetColumns(sheet);
    
    // Check if the headers are exactly matching in the correct order
    let headersMatch = true;
    if (lastCol === categories.length) {
      const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) {
        return String(h || '').trim().toUpperCase();
      });
      for (let i = 0; i < categories.length; i++) {
        if (headers[i] !== categories[i]) {
          headersMatch = false;
          break;
        }
      }
    } else {
      headersMatch = false;
    }
    
    if (!headersMatch) {
      // Re-align the sheet!
      // If the sheet was completely empty, populate with global settings as fallback
      const isEmpty = categories.every(function(cat) {
        return !currentSettings[cat] || currentSettings[cat].length === 0;
      });
      
      if (isEmpty) {
        const globalSettings = api_getGlobalSettings();
        saveSettingsToSheetColumns(sheet, globalSettings);
      } else {
        saveSettingsToSheetColumns(sheet, currentSettings);
      }
    }
  } catch (err) {
    console.error("Error in ensureSheetHasSettingsColumns for " + sheet.getName() + ":", err);
  }
}

function ensureAllUserSheetsExist() {
  try {
    const ss = getSS();
    const users = api_getUsers();
    users.forEach(function(u) {
      const uCode = u.userCode ? String(u.userCode).trim().toUpperCase() : '';
      if (uCode) {
        let sh = ss.getSheetByName(uCode);
        if (!sh) {
          sh = ss.insertSheet(uCode);
        }
        ensureSheetHasSettingsColumns(sh);
      }
    });
  } catch (err) {
    console.error("Error in ensureAllUserSheetsExist:", err);
  }
  mergeAndCleanUserSheets();
}

function mergeAndCleanUserSheets() {
  try {
    const ss = getSS();
    const sheets = ss.getSheets();
    let mainUsersSheet = ss.getSheetByName('USERS');
    
    // Find sheets that are synonyms for users but not exactly 'USERS'
    const synonyms = ['USER', 'SERVER USERS', 'USERLOGIN DETAILS', 'USERLOGIN', 'USER LOGIN', 'USER_LOGIN', 'USER_LOGIN_DETAILS', 'USERLOGIN_DETAILS', 'SERVER_USERS'];
    const synonymSheets = [];
    
    sheets.forEach(function(sh) {
      const name = sh.getName();
      const nameUpper = name.trim().toUpperCase();
      if (nameUpper !== 'USERS' && synonyms.indexOf(nameUpper) !== -1) {
        synonymSheets.push(sh);
      }
    });
    
    if (synonymSheets.length === 0) return;
    
    if (!mainUsersSheet) {
      // If we don't have 'USERS' but have e.g. 'USER', rename the first synonym sheet to 'USERS'
      mainUsersSheet = synonymSheets.shift();
      mainUsersSheet.setName('USERS');
      console.log("Renamed sheet " + mainUsersSheet.getName() + " to USERS");
    }
    
    // If we still have other synonym sheets, merge their data into 'USERS' and delete them
    if (synonymSheets.length > 0) {
      // Fetch existing user codes in mainUsersSheet
      const existingUserCodes = {};
      const existingUsernames = {};
      try {
        const mainData = getDataFromSheet('USERS');
        mainData.forEach(function(u) {
          if (u.userCode) existingUserCodes[String(u.userCode).trim().toUpperCase()] = true;
          if (u.username) existingUsernames[String(u.username).trim().toUpperCase()] = true;
        });
      } catch (e) {
        console.error("Error reading main USERS sheet for merge:", e);
      }
      
      synonymSheets.forEach(function(synSheet) {
        try {
          const name = synSheet.getName();
          const synData = getDataFromSheet(name);
          synData.forEach(function(u) {
            const uCode = u.userCode ? String(u.userCode).trim().toUpperCase() : '';
            const uName = u.username ? String(u.username).trim().toUpperCase() : '';
            
            // If user code and username are both empty, skip
            if (!uCode && !uName) return;
            
            // Check if user already exists
            const codeExists = uCode && existingUserCodes[uCode];
            const nameExists = uName && existingUsernames[uName];
            
            if (!codeExists && !nameExists) {
              // Add to USERS
              api_saveUser(u, 'SYSTEM_MERGE');
              if (uCode) existingUserCodes[uCode] = true;
              if (uName) existingUsernames[uName] = true;
            }
          });
          
          // Delete synonym sheet
          ss.deleteSheet(synSheet);
          console.log("Merged and deleted user synonym sheet: " + name);
        } catch (err) {
          console.error("Error merging synonym sheet: " + synSheet.getName(), err);
        }
      });
    }
  } catch (globalErr) {
    console.error("Global error in mergeAndCleanUserSheets:", globalErr);
  }
}

function api_createSheets() {
  try {
    const required = [
      'USERS', 
      'SETTINGS', 
      'ADMIN',
      'ZONE',
      'UNIT'
    ];
    
    let zones = [];
    const zoneSheet = findExistingSheetBySynonym('ZONE') || getSS().getSheetByName('ZONE');
    if (zoneSheet && zoneSheet.getLastRow() >= 2) {
      const rangeVals = zoneSheet.getDataRange().getValues();
      const headers = rangeVals[0].map(h => String(h || '').trim().toUpperCase());
      const zoneColIdx = headers.indexOf('ZONE');
      if (zoneColIdx !== -1) {
        const rawZones = [];
        for (let r = 1; r < rangeVals.length; r++) {
          const zVal = rangeVals[r][zoneColIdx];
          if (zVal !== "" && zVal !== null && zVal !== undefined) {
            rawZones.push(String(zVal).trim().toUpperCase());
          }
        }
        zones = Array.from(new Set(rawZones));
      }
    }
    
    // Auto-create zoned sheets for material, cutting, inline, endline, aql, and workorder based on active zones only!
    zones.forEach(function(zone) {
      required.push('MATERIAL - ' + zone);
      required.push('CUTTING - ' + zone);
      required.push('INLINE - ' + zone);
      required.push('ENDLINE - ' + zone);
      required.push('AQL - ' + zone);
      required.push('WORKORDER - ' + zone);
    });
    
    required.push('INLINE');
    required.push('FINAL AUDIT');
    
    required.forEach(s => getOrCreateSheet(s));
    
    // Explicit headers for unified ZONE sheet showing units
    if (zoneSheet && zoneSheet.getLastColumn() === 0) {
      zoneSheet.appendRow(['id', 'zone', 'unit', 'timestamp']);
    }

    const unitSheet = findExistingSheetBySynonym('UNIT') || getSS().getSheetByName('UNIT');
    if (unitSheet && unitSheet.getLastColumn() === 0) {
      unitSheet.appendRow(['id', 'unit', 'zone', 'timestamp']);
    }

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
        location: 'SYSTEM',
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
    const users = api_getUsers();
    // Bootstrap default users if none exist
    if (users.length === 0) {
      const defaultUser = {
        userCode: 'U001',
        username: 'user1',
        password: 'pass1',
        role: 'USER',
        location: 'SYSTEM',
        restrictions: []
      };
      const defaultAdmin = {
        userCode: 'A001',
        username: 'admin',
        password: 'admin123',
        role: 'ADMIN',
        location: 'SYSTEM',
        restrictions: []
      };
      const defaultWO = {
        userCode: 'W001',
        username: 'wo1',
        password: '123',
        role: 'WORKORDER',
        location: 'SYSTEM',
        restrictions: []
      };
      api_saveUser(defaultUser);
      api_saveUser(defaultAdmin);
      api_saveUser(defaultWO);
      users.push(defaultUser, defaultAdmin, defaultWO);
    }

    const zone = params && params.zone;
    let workorders = [];
    if (zone && zone !== 'ALL' && zone !== 'COMMON') {
      try {
        var uppercaseZone = String(zone).toUpperCase().trim();
        var allowedZones = {};
        allowedZones[uppercaseZone] = true;

        var zoneRows = api_getWorkorders('ZONE') || [];
        for (var i = 0; i < zoneRows.length; i++) {
          var z = String(zoneRows[i].zone || '').toUpperCase().trim();
          var id = String(zoneRows[i].id || '').toUpperCase().trim();
          if (z === uppercaseZone || id === uppercaseZone || z.replace(/^ZMAP-/, '') === uppercaseZone || id.replace(/^ZMAP-/, '') === uppercaseZone) {
            if (z) allowedZones[z] = true;
            if (id) allowedZones[id] = true;
            if (z.replace(/^ZMAP-/, '')) allowedZones[z.replace(/^ZMAP-/, '')] = true;
            if (id.replace(/^ZMAP-/, '')) allowedZones[id.replace(/^ZMAP-/, '')] = true;
          }
        }

        workorders = api_getWorkorders('WORKORDER').filter(function(wo) {
          var zVal = String(wo.zone || wo.location || '').toUpperCase().trim();
          var zClean = zVal.replace(/^ZMAP-/, '');
          return allowedZones[zVal] || allowedZones[zClean];
        });
      } catch (err) {
        workorders = api_getWorkorders('WORKORDER').filter(function(wo) {
          return String(wo.location || wo.zone || '').toUpperCase().trim() === String(zone).toUpperCase().trim();
        });
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
    const isZone = String(target).startsWith('ZONE_');
    
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
    } else if (isZone) {
      const zoneName = String(target).replace('ZONE_', '').trim().toUpperCase();
      const ss = getSS();
      const sheetName = 'SETTINGS - ' + zoneName;
      clearSheetCache(sheetName);
      let sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
      }
      saveSettingsToSheetColumns(sheet, settings);
      SpreadsheetApp.flush();
    } else {
      // It is a user-specific settings update. Save inside the USERS sheet row as fallback
      const users = api_getUsers();
      const user = users.find(u => String(u.userCode || '').trim() === String(target).trim() || String(u.username || '').trim() === String(target).trim());
      if (user) {
        user.userSettings = settings;
        api_updateUser(user, admin);
      }
      
      // And ALSO feed directly to the dedicated sheet for this user!
      const ss = getSS();
      const sheetName = String(target).trim().toUpperCase();
      clearSheetCache(sheetName);
      let sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
      }
      saveUserSpecificSettingsToSheetColumns(sheet, settings);
      SpreadsheetApp.flush();
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

function saveUserSpecificSettingsToSheetColumns(sheet, settings) {
  saveSettingsToSheetColumns(sheet, settings);
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
      try {
        const uCodeUpper = String(userCode).trim().toUpperCase();
        const shToDelete = ss.getSheetByName(uCodeUpper);
        if (shToDelete) {
          ss.deleteSheet(shToDelete);
        }
      } catch (err) {}

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
      '8ROUND SYSTEM': 'INLINE',
      '8ROUND': 'INLINE',
      '8 ROUND SYSTEM': 'INLINE',
      '8ROUND_SYSTEM': 'INLINE',
      '8 ROUNDS': 'INLINE',
      'REWORK': 'REWORK',
      'REWORK REPORT': 'REWORK',
      'REWORK QUALITY': 'REWORK'
    };
    
    const canonicalPrefix = canonicalMapping[baseName] || baseName;
    
    // Synonyms and prefix names to aggregate for this base
    const prefixSynonyms = {
      'USERS': ['USERS', 'USER'],
      'MATERIAL': ['MATERIAL', 'MATERIAL REPORT'],
      'CUTTING': ['CUTTING', 'CUTTING QUALITY', 'CUTTING REPORT'],
      'INLINE': ['INLINE', 'INLINE QUALITY', 'INLINE REPORT', 'SEWING DEFECT', 'SEWING DEFECTS', '8ROUND SYSTEM', '8ROUND_SYSTEM', '8ROUND', '8 ROUNDS', '8 ROUND SYSTEM'],
      'ENDLINE': ['ENDLINE', 'ENDLINE QUALITY', 'ENDLINE REPORT'],
      'AQL': ['AQL', 'AQL REPORT', 'AQL INSPECTION'],
      'WORKORDER': ['WORKORDER', 'WORKORDERS', 'WORK ORDER'],
      'FINAL AUDIT': ['FINAL AUDIT', 'FINAL AUDIT REPORT', 'FINAL REPORT'],
      'REWORK': ['REWORK', 'REWORK REPORT', 'REWORK QUALITY']
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
  
  if (zone && zone !== 'ALL' && zone !== 'WORKORDER' && zone !== 'COMMON') {
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
    const allSheets = ss.getSheets();
    let updated = false;
    
    for (let sIdx = 0; sIdx < allSheets.length; sIdx++) {
      const sheet = allSheets[sIdx];
      const sNameUpper = sheet.getName().toUpperCase().trim();
      if (sNameUpper === 'WORKORDER' || sNameUpper.startsWith('WORKORDER - ') || sNameUpper.startsWith('WORK_ORDER') || sNameUpper.startsWith('WORKORDERS')) {
        const data = sheet.getDataRange().getValues();
        if (data.length > 0) {
          const headers = data[0];
          const normHeaders = headers.map(function(h) { return String(h || '').toLowerCase().replace(/[^a-z0-9]/g, ''); });
          
          let woIdx = normHeaders.indexOf('workordernumber');
          if (woIdx === -1) woIdx = normHeaders.indexOf('workorderno');
          if (woIdx === -1) woIdx = normHeaders.indexOf('wo');
          if (woIdx === -1) woIdx = normHeaders.indexOf('wonum');
          if (woIdx === -1) woIdx = normHeaders.indexOf('wonumber');
          if (woIdx === -1) woIdx = normHeaders.indexOf('workorder');
          
          let statusIdx = normHeaders.indexOf('status');
          if (statusIdx === -1) statusIdx = normHeaders.indexOf('state');
          
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
  report = report || {};
  if (!report.id || report.id === report.wo || report.id === report.workorderNumber) {
    report.id = 'cut-' + Utilities.getUuid();
  }
  const res = saveDataToSheet('CUTTING QUALITY', report);
  if (res.success && (report.wo || report.workorderNumber)) {
    var woTarget = report.wo || report.workorderNumber;
    var nextStatus = 'INLINE_AND_ENDLINE';
    if (report.submodule === 'PRECUTTING') {
      nextStatus = (report.passAndHold === true || report.passAndHold === 'true') ? 'PRECUTTINGPASSANDHOLD' : 'PRECUTTINGPASSED';
    } else {
      nextStatus = (report.passAndHold === true || report.passAndHold === 'true') ? 'CUTTINGPASSANDHOLD' : 'INLINE_AND_ENDLINE';
    }
    internal_updateWorkorderStatus(woTarget, report.zone || report.location, nextStatus);
  }
  return res;
}
function api_saveSEWINGDEFECT(report) { 
  const res = saveDataToSheet('INLINE', report);
  // Do not update workorder status; keep it in INLINE_AND_ENDLINE so it stays visible in both
  return res;
}
function normalizeDateToYYYYMMDD_GAS(val) {
  if (!val) return '';
  if (val instanceof Date) {
    const year = val.getFullYear();
    const month = String(val.getMonth() + 1).padStart(2, '0');
    const day = String(val.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }
  const s = String(val).trim();
  const datePartOnly = s.split(/[ T]/)[0];
  const normalizedStr = datePartOnly.replace(/[\/.]/g, '-');
  const parts = normalizedStr.split('-');
  
  if (parts.length === 3) {
    let year = 0, month = 0, day = 0;
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    const p2 = parseInt(parts[2], 10);
    
    if (parts[0].length === 4) {
      year = p0; month = p1; day = p2;
    } else if (parts[2].length === 4) {
      year = p2; month = p1; day = p0;
    } else if (parts[2].length === 2) {
      year = 2000 + p2; month = p1; day = p0;
    } else if (parts[0].length === 2 && p0 > 31) {
      year = 2000 + p0; month = p1; day = p2;
    } else {
      year = parts[2].length === 2 ? 2000 + p2 : p2; month = p1; day = p0;
    }
    if (month > 12 && day <= 12) {
      const temp = month; month = day; day = temp;
    }
    if (year >= 2000 && year < 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    }
  }
  return s.substring(0, 10);
}

function api_save8ROUNDSYSTEM(report) { 
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000); // Wait up to 15 seconds for previous writes to complete safely
  } catch (e) {
    console.warn("Concurrency lock acquisition timed out: " + e.toString());
  }
  try {
    const sheetName = getReportSheetName('INLINE', report);
    const ss = getSS();
    const sheet = findExistingSheetBySynonym(sheetName) || ss.getSheetByName(sheetName);
    if (sheet && sheet.getLastRow() >= 2) {
      const values = sheet.getDataRange().getValues();
      const headers = values[0];
      const normHeaders = headers.map(function(h) { return String(h || '').trim().toLowerCase().replace(/[^a-z0-9]/g, ''); });
      
      const workerColIdx = normHeaders.indexOf('worker');
      const roundIdxColIdx = normHeaders.indexOf('roundindex');
      const roundColIdx = normHeaders.indexOf('round');
      const zoneColIdx = normHeaders.indexOf('zone');
      const inspectorColIdx = normHeaders.indexOf('inspector');
      
      let dateColIdx = normHeaders.indexOf('checkingdate');
      if (dateColIdx === -1) dateColIdx = normHeaders.indexOf('date');
      
      const machineColIdx = normHeaders.indexOf('machine');
      const woColIdx = normHeaders.indexOf('workordernumber') !== -1 ? normHeaders.indexOf('workordernumber') : normHeaders.indexOf('wo');
      const styleColIdx = normHeaders.indexOf('style') !== -1 ? normHeaders.indexOf('style') : normHeaders.indexOf('stylename');
      const colorColIdx = normHeaders.indexOf('color') !== -1 ? normHeaders.indexOf('color') : normHeaders.indexOf('colour');
      const sizeColIdx = normHeaders.indexOf('size');
      const cupColIdx = normHeaders.indexOf('cup') !== -1 ? normHeaders.indexOf('cup') : normHeaders.indexOf('cupsize');
      
      if (workerColIdx !== -1 && dateColIdx !== -1) {
        const sWorker = String(report.worker || '').trim().toUpperCase();
        const sRoundIdx = Number(report.roundIndex || 0);
        const sRound = String(report.round || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        const sDate = normalizeDateToYYYYMMDD_GAS(report.checkingDate || report.date);
        const sZone = String(report.zone || report.location || '').trim().toUpperCase();
        const sInspector = String(report.inspector || report.checker || '').trim().toUpperCase();
        
        const sMachine = String(report.machine || report.machineNo || report.machineNumber || '').trim().toUpperCase();
        const sWo = String(report.workorderNumber || report.wo || '').trim().toUpperCase();
        const sStyle = String(report.style || report.styleName || '').trim().toUpperCase();
        const sColor = String(report.color || report.colour || '').trim().toUpperCase();
        const sSize = String(report.size || report.sizeRange || '').trim().toUpperCase();
        const sCup = String(report.cup || report.cupSize || report.cupsize || '').trim().toUpperCase();
        
        let duplicateRowIdx = -1;
        for (let i = 1; i < values.length; i++) {
          const row = values[i];
          const rWorker = String(row[workerColIdx] || '').trim().toUpperCase();
          const rRoundIdx = roundIdxColIdx !== -1 ? Number(row[roundIdxColIdx] || 0) : 0;
          const rRound = roundColIdx !== -1 ? String(row[roundColIdx] || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
          const rDate = normalizeDateToYYYYMMDD_GAS(row[dateColIdx]);
          const rZone = zoneColIdx !== -1 ? String(row[zoneColIdx] || '').trim().toUpperCase() : '';
          const rInspector = inspectorColIdx !== -1 ? String(row[inspectorColIdx] || '').trim().toUpperCase() : '';
          
          const rMachine = machineColIdx !== -1 ? String(row[machineColIdx] || '').trim().toUpperCase() : '';
          const rWo = woColIdx !== -1 ? String(row[woColIdx] || '').trim().toUpperCase() : '';
          if (rWo !== sWo && woColIdx !== -1) {
            // Check synonyms
          }
          const rStyle = styleColIdx !== -1 ? String(row[styleColIdx] || '').trim().toUpperCase() : '';
          const rColor = colorColIdx !== -1 ? String(row[colorColIdx] || '').trim().toUpperCase() : '';
          const rSize = sizeColIdx !== -1 ? String(row[sizeColIdx] || '').trim().toUpperCase() : '';
          const rCup = cupColIdx !== -1 ? String(row[cupColIdx] || '').trim().toUpperCase() : '';
          
          const roundMatches = (rRoundIdx === sRoundIdx) || (rRound === sRound && rRound !== '');
          const dateMatches = (rDate === sDate);
          const zoneMatches = (rZone === sZone || sZone === '' || rZone === '');
          
          const otherFieldsMatch = 
            (machineColIdx === -1 || rMachine === sMachine) &&
            (woColIdx === -1 || rWo === sWo) &&
            (styleColIdx === -1 || rStyle === sStyle) &&
            (colorColIdx === -1 || rColor === sColor) &&
            (sizeColIdx === -1 || rSize === sSize) &&
            (cupColIdx === -1 || rCup === sCup);
          
          if (rWorker === sWorker && roundMatches && dateMatches && zoneMatches && rWorker !== '' && rDate !== '') {
            duplicateRowIdx = i + 1; // 1-indexed row number in sheet
            break;
          }
        }
        
        if (duplicateRowIdx !== -1) {
          return { 
            success: false, 
            error: "A quality check has already been logged for worker " + report.worker + " in Round " + report.round + " on this date. Re-submission is blocked." 
          };
        }
      }
    }
  } catch (e) {
    console.error("Error in duplicate check:", e);
  } finally {
    try {
      lock.releaseLock();
    } catch (e) {}
  }
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
    const normHeaders = headers.map(function(h) { return String(h || '').toLowerCase().trim().replace(/[^a-z0-9]/g, ''); });
    let idIdx = normHeaders.indexOf('id');
    if (idIdx === -1) idIdx = normHeaders.indexOf('workordernumber');
    if (idIdx === -1) idIdx = normHeaders.indexOf('usercode');
    
    if (idIdx !== -1) {
      for (let i = 1; i < data.length; i++) {
        var cellVal = String(data[i][idIdx] || '').trim();
        var targetId = String(id || '').trim();
        if (cellVal === targetId) {
          sheet.deleteRow(i + 1);
          return { success: true };
        }
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
    
    let settings = null;
    const ss = getSS();
    
    const isZone = String(userCode).startsWith('ZONE_');
    if (isZone) {
      const zoneName = String(userCode).replace('ZONE_', '').trim().toUpperCase();
      const sheetName = 'SETTINGS - ' + zoneName;
      const sheet = ss.getSheetByName(sheetName);
      if (sheet) {
        settings = readSettingsFromSheetColumns(sheet);
      }
    }

    // Search for user in the consolidated USERS list as the primary source of truth
    const users = api_getUsers();
    const user = users.find(u => String(u.userCode || '').trim() === String(userCode).trim());
    
    if (!settings && user) {
      // Check if user belongs to a zone/location and if there's a common settings sheet for that zone
      const userZone = String(user.location || user.zone || '').trim().toUpperCase();
      if (userZone && userZone !== 'ALL' && userZone !== 'SYSTEM') {
        const sheetName = 'SETTINGS - ' + userZone;
        const sheet = ss.getSheetByName(sheetName);
        if (sheet) {
          settings = readSettingsFromSheetColumns(sheet);
        }
      }
    }

    if (!settings) {
      // Check for user-specific sheet
      const uCodeUpper = String(userCode).trim().toUpperCase();
      const userSheet = ss.getSheetByName(uCodeUpper);
      if (userSheet) {
        settings = readSettingsFromSheetColumns(userSheet);
      }
    }

    if (!settings && user && user.userSettings) {
      try {
        const val = typeof user.userSettings === 'string' ? JSON.parse(user.userSettings) : user.userSettings;
        if (val && typeof val === 'object') {
          settings = val;
        }
      } catch (pErr) {
        console.error("Error parsing userSettings from USERS row:", pErr);
      }
    }
    
    if (!settings) {
      return api_getGlobalSettings();
    }

    // Merge with global settings so any missing categories get global values
    const globalSettings = api_getGlobalSettings();
    const categories = ['ZONE', 'SUPPLIER', 'ITEMS', 'COLOR', 'DEFECTS', 'WORKERS', 'MACHINE', 'OPERATION', 'SIZE', 'CUPSIZE', 'UNIT', 'LINE', 'STYLE_NAME'];
    categories.forEach(function(cat) {
      if (!settings[cat] || settings[cat].length === 0) {
        settings[cat] = globalSettings[cat] || [];
      }
    });

    return settings;
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
      ZONE: [],
      SUPPLIER: ['SUPPLIER A', 'SUPPLIER B'],
      ITEMS: ['ITEM 1', 'ITEM 2'],
      COLOR: ['BLACK', 'WHITE', 'NAVY'],
      DEFECTS: ['STAIN', 'HOLE', 'SHADING'],
      WORKERS: ['WORKER 1', 'WORKER 2'],
      MACHINE: ['M001', 'M002'],
      OPERATION: ['OP 1', 'OP 2'],
      SIZE: ['S', 'M', 'L', 'XL'],
      CUPSIZE: ['A', 'B', 'C'],
      UNIT: [],
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
            let vals = [];
            if (name === 'ZONE') {
              const rangeVals = sheet.getDataRange().getValues();
              const headers = rangeVals[0].map(h => String(h || '').trim().toUpperCase());
              const zoneColIdx = headers.indexOf('ZONE');
              const idColIdx = headers.indexOf('ID');
              const unitColIdx = headers.indexOf('UNIT');
              
              // Build a map of ZMAP-ID -> Human Name
              const zoneIdToNameMap = {};
              if (zoneColIdx !== -1 && idColIdx !== -1) {
                for (let r = 1; r < rangeVals.length; r++) {
                  const z = String(rangeVals[r][zoneColIdx] || '').trim().toUpperCase();
                  const id = String(rangeVals[r][idColIdx] || '').trim().toUpperCase();
                  if (z.indexOf('ZMAP-') === 0 && id && id.indexOf('ZMAP-') !== 0) {
                    zoneIdToNameMap[z] = rangeVals[r][idColIdx]; // Keep original case
                  } else if (id.indexOf('ZMAP-') === 0 && z && z.indexOf('ZMAP-') !== 0) {
                    zoneIdToNameMap[id] = rangeVals[r][zoneColIdx]; // Keep original case
                  }
                }
              }

              if (zoneColIdx !== -1) {
                const rawZones = [];
                for (let r = 1; r < rangeVals.length; r++) {
                  let zVal = String(rangeVals[r][zoneColIdx] || '').trim();
                  if (zVal.toUpperCase().indexOf('ZMAP-') === 0) {
                    zVal = zoneIdToNameMap[zVal.toUpperCase()] || zVal;
                  }
                  if (zVal && zVal.toUpperCase().indexOf('ZMAP-') !== 0) {
                    rawZones.push(zVal);
                  }
                }
                vals = Array.from(new Set(rawZones));
              } else {
                vals = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat().filter(v => v !== "" && v !== null);
              }
            } else {
              vals = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat().filter(v => v !== "" && v !== null);
            }
            if (vals.length > 0) {
              finalSettings[cat] = vals;
              break; 
            }
          }
        }
      }
    });

    // If UNIT is still empty, try to populate it from the 'ZONE' mapping sheet
    if ((!finalSettings['UNIT'] || finalSettings['UNIT'].length === 0) && sheetNames.includes('ZONE')) {
      const zoneSheet = ss.getSheetByName('ZONE');
      if (zoneSheet.getLastRow() >= 2) {
        const rangeVals = zoneSheet.getDataRange().getValues();
        const headers = rangeVals[0].map(h => String(h || '').trim().toUpperCase());
        const unitColIdx = headers.indexOf('UNIT');
        if (unitColIdx !== -1) {
          const rawUnits = [];
          for (let r = 1; r < rangeVals.length; r++) {
            const uVal = rangeVals[r][unitColIdx];
            if (uVal !== "" && uVal !== null && uVal !== undefined) {
              rawUnits.push(String(uVal).trim());
            }
          }
          if (rawUnits.length > 0) {
            finalSettings['UNIT'] = Array.from(new Set(rawUnits));
          }
        }
      }
    }

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

    // Dynamic Zone & Unit Override: ALWAYS fetch actual zones and units from the 'ZONE' sheet to maintain 100% integrity with user additions and deletions!
    const dynamicZones = [];
    const dynamicUnits = [];
    if (sheetNames.includes('ZONE')) {
      const zoneData = getDataFromSheet('ZONE') || [];
      const seenZ = {};
      const seenU = {};
      
      // Build a map of ZMAP-ID -> Human Name
      const zoneIdToNameMap = {};
      zoneData.forEach(function(row) {
        const z = String(row.zone || '').trim().toUpperCase();
        const id = String(row.id || '').trim().toUpperCase();
        if (z.indexOf('ZMAP-') === 0 && id && id.indexOf('ZMAP-') !== 0) {
          zoneIdToNameMap[z] = String(row.id).trim(); // Keep original case
        } else if (id.indexOf('ZMAP-') === 0 && z && z.indexOf('ZMAP-') !== 0) {
          zoneIdToNameMap[id] = String(row.zone).trim(); // Keep original case
        }
      });

      for (let zIdx = 0; zIdx < zoneData.length; zIdx++) {
        let zVal = String(zoneData[zIdx].zone || '').trim().toUpperCase();
        const uVal = String(zoneData[zIdx].unit || '').trim().toUpperCase();
        if (zVal.indexOf('ZMAP-') === 0) {
          const mapped = zoneIdToNameMap[zVal];
          if (mapped) {
            zVal = mapped.toUpperCase();
          }
        }
        if (zVal && zVal.indexOf('ZMAP-') !== 0) {
          if (!seenZ[zVal]) {
            seenZ[zVal] = true;
            dynamicZones.push(zVal);
          }
        }
        if (uVal) {
          if (!seenU[uVal]) {
            seenU[uVal] = true;
            dynamicUnits.push(uVal);
          }
        }
      }
    }
    finalSettings['ZONE'] = (dynamicZones.length > 0) ? dynamicZones : (finalSettings['ZONE'] && finalSettings['ZONE'].length > 0 ? finalSettings['ZONE'] : []);
    finalSettings['ZONES'] = (dynamicZones.length > 0) ? dynamicZones : (finalSettings['ZONES'] && finalSettings['ZONES'].length > 0 ? finalSettings['ZONES'] : []);
    finalSettings['UNIT'] = (dynamicUnits.length > 0) ? dynamicUnits : (finalSettings['UNIT'] && finalSettings['UNIT'].length > 0 ? finalSettings['UNIT'] : []);
    finalSettings['UNITS'] = (dynamicUnits.length > 0) ? dynamicUnits : (finalSettings['UNITS'] && finalSettings['UNITS'].length > 0 ? finalSettings['UNITS'] : []);

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

/**
 * Uploads a base64 encoded document (like a PDF) directly to the Google Drive of the Apps Script owner,
 * and organizes them into category folders under a main "Blossom Quality Documents" folder.
 */
function api_uploadSOPFile(fileName, base64Data, mimeType, category) {
  try {
    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, mimeType, fileName);
    
    // Find or create the main folder
    var mainFolderName = "Blossom Quality Documents";
    var mainFolders = DriveApp.getFoldersByName(mainFolderName);
    var mainFolder;
    if (mainFolders.hasNext()) {
      mainFolder = mainFolders.next();
    } else {
      mainFolder = DriveApp.createFolder(mainFolderName);
    }
    
    // Determine sub-folder category
    var subFolderName = category || "Others";
    // Normalize sub-folder names to match standard casing
    var standardCategories = {
      "SOP": "SOP",
      "SUPPLIER AUDIT": "Inspection Reports",
      "CHANNEL PARTNER AUDIT": "Inspection Reports",
      "SHOP AUDIT": "Inspection Reports",
      "OTHER AUDITS": "Others",
      "INSPECTION REPORTS": "Inspection Reports",
      "SPECIFICATIONS": "Specifications",
      "TEST REPORTS": "Test Reports",
      "LAB REPORTS": "Lab Reports",
      "WORK INSTRUCTIONS": "Work Instructions",
      "DRAWINGS": "Drawings",
      "QUALITY MANUALS": "Quality Manuals",
      "OTHERS": "Others",
      "OTHER": "Others"
    };
    
    var resolvedFolder = standardCategories[subFolderName.toUpperCase()] || subFolderName;
    
    // Find or create category sub-folder
    var subFolders = mainFolder.getFoldersByName(resolvedFolder);
    var subFolder;
    if (subFolders.hasNext()) {
      subFolder = subFolders.next();
    } else {
      subFolder = mainFolder.createFolder(resolvedFolder);
    }
    
    // Create the file in the category sub-folder
    var file = subFolder.createFile(blob);
    
    try {
      // Set access permissons to allow anyone with url to read
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (shareErr) {
      console.error("Warning: setting file sharing permissions failed in Apps Script", shareErr);
    }
    
    return {
      success: true,
      url: file.getUrl(),
      name: file.getName(),
      id: file.getId(),
      downloadUrl: "https://drive.google.com/uc?export=download&id=" + file.getId()
    };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Saves an SOP document metadata row directly to Google Sheets database.
 * Supports updating an existing row if `report.id` matches.
 */
function api_saveREPORTS_SOP(report) {
  try {
    const sheet = getOrCreateSheet('REPORTS_SOP');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const normHeaders = headers.map(function(h) { return String(h || '').toLowerCase().replace(/[^a-z0-9]/g, ''); });
    const idIdx = normHeaders.indexOf('id');
    
    // Generate an ID if not exists
    if (!report.id) {
      report.id = 'sop-' + Math.random().toString(36).substr(2, 9);
    }
    
    // Check if we are updating an existing row
    if (idIdx !== -1 && data.length > 1) {
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][idIdx]) === String(report.id)) {
          // Found matching row to update. Generate row array matching original headers
          const updatedRow = headers.map(function(header) {
            const val = resolveSynonymValue(header, report);
            return (val && typeof val === 'object') ? JSON.stringify(val) : (val === undefined ? "" : val);
          });
          sheet.getRange(i + 1, 1, 1, headers.length).setValues([updatedRow]);
          clearSheetCache('REPORTS_SOP');
          return { success: true, id: report.id };
        }
      }
    }
    
    // Fallback: Use standard append row route
    const res = saveDataToSheet('REPORTS_SOP', report);
    if (res.success) {
      res.id = report.id;
    }
    return res;
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Retrieves all registered SOP and PDF document nodes in Google Sheets.
 */
function api_getREPORTS_SOPData(params) {
  var ss = getSS();
  var allSheets = ss.getSheets();
  var mergedData = [];
  var seenIds = {};
  
  // 1. Fetch from the main 'REPORTS_SOP' sheet
  var mainData = getDataFromSheet('REPORTS_SOP') || [];
  if (Array.isArray(mainData)) {
    for (var i = 0; i < mainData.length; i++) {
      var row = mainData[i];
      if (row && row.id) {
        mergedData.push(row);
        seenIds[String(row.id)] = true;
      }
    }
  }
  
  // 2. Fetch from any other zoned SOP sheets (like 'REPORTS_SOP - KERALA')
  for (var s = 0; s < allSheets.length; s++) {
    var sheet = allSheets[s];
    var name = sheet.getName().toUpperCase().trim();
    if (name.indexOf('REPORTS_SOP - ') === 0 || name === 'REPORTS_SOP_KERALA' || name === 'REPORTS_SOP_ADMIN') {
      var zonedData = getDataFromSheet(sheet.getName()) || [];
      if (Array.isArray(zonedData)) {
        for (var j = 0; j < zonedData.length; j++) {
          var zRow = zonedData[j];
          if (zRow && zRow.id && !seenIds[String(zRow.id)]) {
            mergedData.push(zRow);
            seenIds[String(zRow.id)] = true;
          }
        }
      }
    }
  }
  
  return mergedData;
}

/**
 * Removes an SOP spreadsheet row by its custom ID.
 */
function api_deleteREPORTS_SOP(id) {
  try {
    const ss = getSS();
    const allSheets = ss.getSheets();
    const targetId = String(id || '').trim();
    
    for (let s = 0; s < allSheets.length; s++) {
      const sheet = allSheets[s];
      const name = sheet.getName().toUpperCase().trim();
      
      if (name === 'REPORTS_SOP' || name.indexOf('REPORTS_SOP - ') === 0 || name === 'REPORTS_SOP_KERALA' || name === 'REPORTS_SOP_ADMIN') {
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const normHeaders = headers.map(function(h) { return String(h || '').toLowerCase().trim().replace(/[^a-z0-9]/g, ''); });
        const idIdx = normHeaders.indexOf('id');
        
        if (idIdx !== -1) {
          for (let i = 1; i < data.length; i++) {
            var cellVal = String(data[i][idIdx] || '').trim();
            if (cellVal === targetId) {
              // Robustly attempt to parse the attachment URL and trash the file from Google Drive
              try {
                var urlIdx = normHeaders.indexOf('attachmenturl');
                if (urlIdx !== -1) {
                  var fileUrl = String(data[i][urlIdx] || '');
                  if (fileUrl) {
                    var fileId = null;
                    var match = fileUrl.match(/\/d\/([^\/]+)/);
                    if (match && match[1]) {
                      fileId = match[1];
                    } else {
                      var matchId = fileUrl.match(/id=([^&]+)/);
                      if (matchId && matchId[1]) {
                        fileId = matchId[1];
                      }
                    }
                    if (fileId) {
                      var file = DriveApp.getFileById(fileId);
                      file.setTrashed(true);
                    }
                  }
                }
              } catch (driveErr) {
                console.error("Warning: Could not trash file from Google Drive: " + driveErr.toString());
              }

              sheet.deleteRow(i + 1);
              clearSheetCache(sheet.getName());
              clearSheetCache('REPORTS_SOP');
              return { success: true };
            }
          }
        }
      }
    }
    return { success: false, error: "Record not found with ID " + id };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Retrieves all registered Zone/Unit/Worker mapping records in Google Sheets.
 */
function api_getZoneMappings() {
  try {
    const ss = getSS();
    const zoneSheet = ss.getSheetByName('ZONE') || getOrCreateSheet('ZONE');
    
    // Ensure the sheet has the proper headers if it's empty
    const lastCol = zoneSheet.getLastColumn();
    if (lastCol === 0) {
      zoneSheet.appendRow(['id', 'zone', 'unit', 'timestamp']);
      SpreadsheetApp.flush();
    }
    
    const zoneRows = getDataFromSheet('ZONE') || [];
    const result = [];
    
    // Build a map of ZMAP-ID -> Human Name
    const zoneIdToNameMap = {};
    zoneRows.forEach(function(row) {
      const z = String(row.zone || '').trim().toUpperCase();
      const id = String(row.id || '').trim().toUpperCase();
      if (z.indexOf('ZMAP-') === 0 && id && id.indexOf('ZMAP-') !== 0) {
        zoneIdToNameMap[z] = String(row.id).trim(); // Keep original case
      } else if (id.indexOf('ZMAP-') === 0 && z && z.indexOf('ZMAP-') !== 0) {
        zoneIdToNameMap[id] = String(row.zone).trim(); // Keep original case
      }
    });
    
    // Step 1: Gather workers from each unit-specific sheet mapped in ZONE
    zoneRows.forEach(function(row) {
      const unitName = String(row.unit || '').trim().toUpperCase();
      let zoneName = String(row.zone || '').trim().toUpperCase();
      let idValue = String(row.id || '').trim();

      if (zoneName.indexOf('ZMAP-') === 0) {
        const mapped = zoneIdToNameMap[zoneName];
        if (mapped) {
          zoneName = mapped.toUpperCase();
        }
      } else if (zoneName.indexOf('ZMAP-') === 0 && idValue && idValue.toUpperCase().indexOf('ZMAP-') !== 0) {
        var temp = zoneName;
        zoneName = idValue.toUpperCase();
        idValue = temp;
      }

      if (!zoneName || zoneName.indexOf('ZMAP-') === 0) return;
      
      if (unitName) {
        const unitSpecSheet = findExistingSheetBySynonym(unitName);
        if (unitSpecSheet) {
          const workerRows = getDataFromSheet(unitName) || [];
          var hasWorker = false;
          workerRows.forEach(function(wRow) {
            const workerName = String(wRow.worker || '').trim().toUpperCase();
            if (!workerName) return;
            hasWorker = true;
            
            const wId = wRow.id || ('zmap-' + Math.floor(Math.random() * 10000000));
            result.push({
              id: wId,
              zone: zoneName,
              unit: unitName,
              worker: workerName,
              timestamp: wRow.timestamp || new Date().toISOString()
            });
          });
          
          if (!hasWorker) {
            // Include unit with empty worker
            result.push({
              id: idValue || row.id || ('zmap-' + Math.floor(Math.random() * 10000000)),
              zone: zoneName,
              unit: unitName,
              worker: '',
              timestamp: row.timestamp || new Date().toISOString()
            });
          }
        } else {
          // No unit-specific sheet, still show unit
          result.push({
            id: idValue || row.id || ('zmap-' + Math.floor(Math.random() * 10000000)),
            zone: zoneName,
            unit: unitName,
            worker: '',
            timestamp: row.timestamp || new Date().toISOString()
          });
        }
      } else {
        // Just a zone with no unit
        result.push({
          id: idValue || row.id || ('zmap-' + Math.floor(Math.random() * 10000000)),
          zone: zoneName,
          unit: '',
          worker: '',
          timestamp: row.timestamp || new Date().toISOString()
        });
      }
    });
    
    return result;
  } catch (e) {
    console.error("Error in api_getZoneMappings:", e);
    return [];
  }
}

/**
 * Saves a Zone/Unit/Worker mapping record in Google Sheets.
 */
function api_saveZoneMapping(record) {
  try {
    if (!record.id) {
      record.id = 'zmap-' + Math.floor(Math.random() * 10000000);
    }
    if (!record.timestamp) {
      record.timestamp = new Date().toISOString();
    }
    
    const zone = String(record.zone || '').trim().toUpperCase();
    const unit = String(record.unit || '').trim().toUpperCase();
    const worker = String(record.worker || '').trim().toUpperCase();
    
    // Case 1: Saving a Worker
    if (worker) {
      if (!unit) {
        return { success: false, error: "Unit is required to save a worker." };
      }
      // Save worker details inside the sheet named after the unit
      const unitSheet = getOrCreateSheet(unit);
      
      // Initialize columns if empty
      const lastCol = unitSheet.getLastColumn();
      if (lastCol === 0) {
        unitSheet.appendRow(['id', 'worker', 'timestamp']);
        SpreadsheetApp.flush();
      }
      
      const workerRecord = {
        id: record.id,
        worker: worker,
        timestamp: record.timestamp
      };
      
      return saveDataToSheet(unit, workerRecord);
    }
    
    // Case 2: Saving a Unit
    if (unit) {
      if (!zone) {
        return { success: false, error: "Zone is required to save a unit." };
      }
      // Save unit inside the unified 'ZONE' sheet
      const zoneSheet = getOrCreateSheet('ZONE');
      const lastCol = zoneSheet.getLastColumn();
      if (lastCol === 0) {
        zoneSheet.appendRow(['id', 'zone', 'unit', 'timestamp']);
        SpreadsheetApp.flush();
      }
      
      // Ensure unit sheet itself is also created (for adding workers later)
      const unitSheet = getOrCreateSheet(unit);
      const unitLastCol = unitSheet.getLastColumn();
      if (unitLastCol === 0) {
        unitSheet.appendRow(['id', 'worker', 'timestamp']);
        SpreadsheetApp.flush();
      }
      
      const unitRecord = {
        id: record.id,
        zone: zone,
        unit: unit,
        timestamp: record.timestamp
      };
      
      saveDataToSheet('UNIT', unitRecord);
      return saveDataToSheet('ZONE', unitRecord);
    }
    
    // Case 3: Saving a Zone
    if (zone) {
      const zoneSheet = getOrCreateSheet('ZONE');
      const lastCol = zoneSheet.getLastColumn();
      if (lastCol === 0) {
        zoneSheet.appendRow(['id', 'zone', 'unit', 'timestamp']);
        SpreadsheetApp.flush();
      }
      
      const zoneRecord = {
        id: record.id,
        zone: zone,
        unit: '',
        timestamp: record.timestamp
      };
      
      return saveDataToSheet('ZONE', zoneRecord);
    }
    
    return { success: false, error: "Invalid zone mapping record." };
  } catch (e) {
    console.error("Error in api_saveZoneMapping:", e);
    return { success: false, error: e.toString() };
  }
}

/**
 * Removes a Zone/Unit/Worker mapping record in Google Sheets by ID or by name values as a fallback.
 * Supports robust cascading deletion.
 */
function api_deleteZoneMapping(param) {
  try {
    const ss = getSS();
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

    // Case 1: If it's a Worker row (has a worker name and unit sheet)
    if (targetWorker && targetUnit) {
      const sheet = findExistingSheetBySynonym(targetUnit);
      if (sheet && sheet.getLastRow() >= 2) {
        const range = sheet.getDataRange();
        const data = range.getValues();
        const headers = data[0];
        const normHeaders = headers.map(function(h) { return String(h || '').trim().toLowerCase(); });
        const idIdx = normHeaders.indexOf('id');
        const workerIdx = normHeaders.indexOf('worker');
        
        let deleted = false;
        for (let i = data.length - 1; i >= 1; i--) {
          let match = false;
          if (idIdx !== -1 && targetIdStr && String(data[i][idIdx]).trim() === targetIdStr) {
            match = true;
          } else if (workerIdx !== -1 && String(data[i][workerIdx]).trim().toUpperCase() === targetWorker) {
            match = true;
          }
          if (match) {
            sheet.deleteRow(i + 1);
            deleted = true;
          }
        }
        if (deleted) {
          SpreadsheetApp.flush();
          clearSheetCache(targetUnit);
          return { success: true, details: "Deleted worker " + targetWorker + " from unit sheet " + targetUnit };
        }
      }
    }

    // Case 2: If it's a Unit row (has a unit name and zone, but no worker)
    if (targetUnit && !targetWorker) {
      const sheet = findExistingSheetBySynonym('ZONE');
      if (sheet && sheet.getLastRow() >= 2) {
        const range = sheet.getDataRange();
        const data = range.getValues();
        const headers = data[0];
        const normHeaders = headers.map(function(h) { return String(h || '').trim().toLowerCase(); });
        const idIdx = normHeaders.indexOf('id');
        const unitIdx = normHeaders.indexOf('unit');
        const zoneIdx = normHeaders.indexOf('zone');
        
        let deleted = false;
        for (let i = data.length - 1; i >= 1; i--) {
          let match = false;
          if (idIdx !== -1 && targetIdStr && String(data[i][idIdx]).trim() === targetIdStr) {
            match = true;
          } else if (unitIdx !== -1 && String(data[i][unitIdx]).trim().toUpperCase() === targetUnit) {
            if (zoneIdx === -1 || !targetZone || String(data[i][zoneIdx]).trim().toUpperCase() === targetZone) {
              match = true;
            }
          }
          if (match) {
            sheet.deleteRow(i + 1);
            deleted = true;
          }
        }
      }
      
      // Cascade delete: Delete the unit sheet as well to clean up workers
      const unitSpecSheet = findExistingSheetBySynonym(targetUnit);
      if (unitSpecSheet) {
        try { ss.deleteSheet(unitSpecSheet); } catch(e) {}
      }
      
      SpreadsheetApp.flush();
      clearSheetCache('ZONE');
      clearSheetCache(targetUnit);
      return { success: true, details: "Deleted unit " + targetUnit + " and its worker sheet." };
    }

    // Case 3: If it's a Zone row (has a zone name, but no unit and no worker)
    if (targetZone && !targetUnit && !targetWorker) {
      // 1. Delete the zone and its associated units from ZONE sheet
      const zoneSheet = findExistingSheetBySynonym('ZONE');
      if (zoneSheet && zoneSheet.getLastRow() >= 2) {
        const range = zoneSheet.getDataRange();
        const data = range.getValues();
        const headers = data[0];
        const normHeaders = headers.map(function(h) { return String(h || '').trim().toLowerCase(); });
        const idIdx = normHeaders.indexOf('id');
        const zoneIdx = normHeaders.indexOf('zone');
        const unitIdx = normHeaders.indexOf('unit');
        
        for (let i = data.length - 1; i >= 1; i--) {
          let match = false;
          if (idIdx !== -1 && targetIdStr && String(data[i][idIdx]).trim() === targetIdStr) {
            match = true;
          } else if (zoneIdx !== -1 && String(data[i][zoneIdx]).trim().toUpperCase() === targetZone) {
            match = true;
          }
          if (match) {
            const unitName = unitIdx !== -1 ? String(data[i][unitIdx] || '').trim() : '';
            if (unitName) {
              const unitSpecSheet = findExistingSheetBySynonym(unitName);
              if (unitSpecSheet) {
                try { ss.deleteSheet(unitSpecSheet); } catch(e) {}
              }
              try { clearSheetCache(unitName); } catch(e) {}
            }
            zoneSheet.deleteRow(i + 1);
          }
        }
      }
      
      // 2. Delete or clear zone-specific sheets for this zone (e.g. MATERIAL - KERALA, CUTTING - KERALA, etc.)
      const modules = ['MATERIAL', 'CUTTING', 'INLINE', 'ENDLINE', 'AQL', 'WORKORDER'];
      modules.forEach(function(mod) {
        const zoneSheetName = mod + ' - ' + targetZone;
        const zSheet = findExistingSheetBySynonym(zoneSheetName);
        if (zSheet) {
          try { ss.deleteSheet(zSheet); } catch(e) {}
        }
        try { clearSheetCache(zoneSheetName); } catch(e) {}
      });
      
      SpreadsheetApp.flush();
      clearSheetCache('ZONE');
      return { success: true, details: "Deleted zone " + targetZone + " and all its units/workers/quality data sheets." };
    }

    // Fallback: Search by pure ID across all sheets
    if (targetIdStr) {
      const sheetsToSearch = ['ZONE'];
      const sheets = ss.getSheets();
      sheets.forEach(function(sh) {
        const name = sh.getName();
        const nameUpper = name.toUpperCase();
        const isSystemSheet = ['USERS', 'SETTINGS', 'ADMIN', 'FINAL AUDIT', 'MATERIAL', 'CUTTING', 'INLINE', 'ENDLINE', 'AQL', 'WORKORDER'].some(function(sys) {
          return nameUpper === sys || nameUpper.startsWith(sys + " - ") || nameUpper.startsWith(sys + " ");
        });
        if (!isSystemSheet && nameUpper !== 'ZONE') {
          sheetsToSearch.push(name);
        }
      });
      
      for (let s = 0; s < sheetsToSearch.length; s++) {
        const sheetName = sheetsToSearch[s];
        const sheet = ss.getSheetByName(sheetName);
        if (!sheet || sheet.getLastRow() < 2) continue;
        
        const range = sheet.getDataRange();
        const data = range.getValues();
        const headers = data[0];
        const normHeaders = headers.map(function(h) { return String(h || '').trim().toLowerCase(); });
        const idIdx = normHeaders.indexOf('id');
        if (idIdx === -1) continue;
        
        for (let i = 1; i < data.length; i++) {
          if (String(data[i][idIdx]).trim() === targetIdStr) {
            sheet.deleteRow(i + 1);
            SpreadsheetApp.flush();
            clearSheetCache(sheetName);
            return { success: true, details: "Deleted by ID from fallback sheet: " + sheetName };
          }
        }
      }
    }
    
    return { success: false, error: "Mapping not found" };
  } catch (e) {
    console.error("Error in api_deleteZoneMapping:", e);
    return { success: false, error: e.toString() };
  }
}

/**
 * Fully resets/wipes all zones and data, but preserves structural system sheets
 * with their canonical headers, and re-seeds standard admin users and settings.
 */
function api_resetAllDatabase() {
  try {
    const ss = getSS();
    const sheets = ss.getSheets();
    const standardSheets = ['USERS', 'SETTINGS', 'ADMIN', 'ZONE', 'UNIT'];
    
    // 1. Delete all unit-specific worker sheets and other dynamically added sheets (including any legacy UNIT sheet)
    sheets.forEach(function(sh) {
      const name = sh.getName();
      const nameUpper = name.toUpperCase();
      
      // Explicitly delete legacy / split users sheets (e.g. USERS - KERALA, USERS - HEAD OFFICE, or exact user codes like A001)
      const isLegacyUserSheet = (nameUpper !== 'USERS') && (
        nameUpper.startsWith('USERS - ') || 
        nameUpper.startsWith('USERS ') || 
        nameUpper.startsWith('USER - ') || 
        nameUpper.startsWith('USER ') ||
        /^[A-Z]\d{3,4}$/.test(nameUpper)
      );

      if (isLegacyUserSheet) {
        try {
          ss.deleteSheet(sh);
        } catch (e) {
          console.error("Could not delete legacy user sheet: " + name, e);
        }
        return;
      }
      
      const isSystemSheet = standardSheets.indexOf(nameUpper) !== -1 ||
        ['MATERIAL', 'CUTTING', 'INLINE', 'ENDLINE', 'AQL', 'WORKORDER', 'FINAL AUDIT'].some(function(sys) {
          return nameUpper === sys || nameUpper.startsWith(sys + " - ") || nameUpper.startsWith(sys + " ");
        });
      
      if (!isSystemSheet) {
        try {
          ss.deleteSheet(sh);
        } catch (e) {
          console.error("Could not delete custom sheet: " + name, e);
        }
      }
    });

    // Clear caches
    try {
      const cache = CacheService.getScriptCache();
      sheets.forEach(function(sh) {
        cache.remove(`BQOS_CACHE_${sh.getName().replace(/\s+/g, '_')}`);
      });
    } catch (e) {}

    // 2. Re-initialize standard sheets by clearing rows below headers
    const canonicalHeaders = {
      'ZONE': ['id', 'zone', 'unit', 'timestamp'],
      'UNIT': ['id', 'unit', 'zone', 'timestamp'],
      'USERS': ['userCode', 'username', 'password', 'role', 'location', 'zone', 'restrictions', 'canDownload', 'userSettings'],
      'ADMIN': ['timestamp', 'module', 'action', 'details', 'admin'],
      'SETTINGS': ['ZONE', 'SUPPLIER', 'ITEMS', 'COLOR', 'DEFECTS', 'WORKERS', 'MACHINE', 'OPERATION', 'SIZE', 'CUPSIZE', 'UNIT', 'LINE', 'STYLE_NAME']
    };

    // Recreate/re-align standard sheets
    standardSheets.forEach(function(shName) {
      let sh = ss.getSheetByName(shName);
      if (!sh) {
        sh = ss.insertSheet(shName);
      }
      sh.clear();
      const headers = canonicalHeaders[shName];
      if (headers) {
        sh.appendRow(headers);
      }
    });

    // Explicitly allow UNIT to remain as a separate sheet as requested

    // Clear contents of any leftover module sheets
    const sheetsNow = ss.getSheets();
    sheetsNow.forEach(function(sh) {
      const name = sh.getName();
      const nameUpper = name.toUpperCase();
      const isStandard = standardSheets.indexOf(nameUpper) !== -1;
      if (!isStandard) {
        sh.clear();
      }
    });

    // Let's run api_createSheets to re-build empty sheets with precise headers
    api_createSheets();

    // Re-seed standard users and settings
    // 1. Seed USERS
    const usersSheet = ss.getSheetByName('USERS');
    if (usersSheet) {
      usersSheet.clear();
      usersSheet.appendRow(canonicalHeaders['USERS']);
    }
    
    // Save Admin
    api_saveUser({
      userCode: 'A001',
      username: 'admin',
      password: 'admin123',
      role: 'ADMIN',
      location: 'SYSTEM',
      restrictions: []
    });
    // Save default users
    api_saveUser({
      userCode: 'U001',
      username: 'user1',
      password: 'pass1',
      role: 'USER',
      location: 'SYSTEM',
      restrictions: []
    });
    api_saveUser({
      userCode: 'W001',
      username: 'wo1',
      password: '123',
      role: 'WORKORDER',
      location: 'SYSTEM',
      restrictions: []
    });

    // 2. Seed SETTINGS
    const settingsSheet = ss.getSheetByName('SETTINGS');
    if (settingsSheet) {
      settingsSheet.clear();
      const defaultSettings = api_getGlobalSettings();
      saveSettingsToSheetColumns(settingsSheet, defaultSettings);
    }

    // Force flush
    SpreadsheetApp.flush();

    return { success: true, details: "Wiped all data, zones, and custom sheets. Standard system sheets re-initialized." };
  } catch (err) {
    console.error("Wipe failed:", err);
    return { success: false, error: err.toString() };
  }
}



