import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";

const CONFIG_FILE = path.join(process.cwd(), ".gas_url");
const SPREADSHEET_FILE = path.join(process.cwd(), ".gas_spreadsheet_id");
const HARDCODED_GAS_URLS = [
  "https://script.google.com/macros/s/AKfycbwKzzjUDaMsIKCOX9Drbf2Fob6PMIjALyv3WkLtZEZl542eI1bCGFVb75J7uXYJlfLT8g/exec",
  "https://script.google.com/macros/s/AKfycbzrSntR0NNT-tAifyZ5K5Jh4y3St8jMm2PqZJTGTgyYEDKVvhUHEEUKyjJNRNNI9UHb7A/exec"
];
const HARDCODED_GAS_URL = HARDCODED_GAS_URLS[0];

let cachedFsConfig: any = null;
let lastFsFetchTime = 0;
const CACHE_TTL = 3 * 60 * 1000; // Cache Firestore config for 3 minutes to keep requests extremely fast

async function getFirestoreConfig() {
  const now = Date.now();
  if (cachedFsConfig && (now - lastFsFetchTime < CACHE_TTL)) {
    return cachedFsConfig;
  }
  try {
    const url = "https://firestore.googleapis.com/v1/projects/gen-lang-client-0333084315/databases/(default)/documents/system_config/global";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000); // Fast 2 second timeout so we never hang the app if Firestore is slow
    const res = await fetch(url, { signal: controller.signal as any });
    clearTimeout(timeout);
    if (res.ok) {
      const data: any = await res.json();
      const fields = data.fields || {};
      const gasUrl = fields.gasUrl?.stringValue || "";
      const spreadsheetId = fields.spreadsheetId?.stringValue || "";
      cachedFsConfig = { gasUrl, spreadsheetId };
      lastFsFetchTime = now;
      return cachedFsConfig;
    }
  } catch (e) {
    console.warn("[SERVER FIRESTORE] Error loading config from Firestore:", e);
  }
  return cachedFsConfig; // Return previous cached values or null if none
}

async function saveFirestoreConfig(gasUrl: string, spreadsheetId: string) {
  try {
    const url = "https://firestore.googleapis.com/v1/projects/gen-lang-client-0333084315/databases/(default)/documents/system_config/global";
    
    let currentGasUrl = gasUrl;
    let currentSpreadsheetId = spreadsheetId;
    
    // Fetch and merge current config to make sure we don't clear existing valid coordinates
    if (!currentGasUrl || !currentSpreadsheetId) {
      const active = await getFirestoreConfig();
      if (active) {
        if (!currentGasUrl) currentGasUrl = active.gasUrl;
        if (!currentSpreadsheetId) currentSpreadsheetId = active.spreadsheetId;
      }
    }

    const fields: any = {};
    const fieldPaths: string[] = ["updatedAt"];
    fields.updatedAt = { stringValue: new Date().toISOString() };

    if (currentGasUrl) {
      fields.gasUrl = { stringValue: currentGasUrl };
      fieldPaths.push("gasUrl");
    }
    if (currentSpreadsheetId) {
      fields.spreadsheetId = { stringValue: currentSpreadsheetId };
      fieldPaths.push("spreadsheetId");
    }

    const body = { fields };
    const maskParams = fieldPaths.map(p => `updateMask.fieldPaths=${p}`).join("&");
    const patchUrl = `${url}?${maskParams}`;
    
    const res = await fetch(patchUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    
    if (res.ok) {
      console.log(`[SERVER FIRESTORE] Synced connection config (gasUrl: ${currentGasUrl}, spreadsheetId: ${currentSpreadsheetId}) to Firestore.`);
      cachedFsConfig = { gasUrl: currentGasUrl, spreadsheetId: currentSpreadsheetId };
      lastFsFetchTime = Date.now();
    } else {
      console.warn("[SERVER FIRESTORE] Auto-sync PATCH failed:", await res.text());
    }
  } catch (e: any) {
    console.error("[SERVER FIRESTORE] Error auto-syncing config to Firestore:", e.message);
  }
}

// ==========================================
// INTEGRATED LOCAL FILESYSTEM DATABASE ENGINE
// ==========================================
const LOCAL_DB_FILE = path.join(process.cwd(), ".local_db.json");

function readLocalDb(): any {
  try {
    if (fs.existsSync(LOCAL_DB_FILE)) {
      const content = fs.readFileSync(LOCAL_DB_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("[LOCAL DB] Error reading local db:", e);
  }
  
  // Seed database
  const seed = {
    users: [
      { userCode: "U001", username: "user1", password: "pass1", role: "USER", location: "KERALA", restrictions: [], canDownload: true },
      { userCode: "A001", username: "admin", password: "admin123", role: "ADMIN", location: "KERALA", restrictions: [], canDownload: true },
      { userCode: "W001", username: "wo1", password: "123", role: "WORKORDER", location: "KERALA", restrictions: [], canDownload: true }
    ],
    workorders: [
      { id: "wo-1", workorderNumber: "WO-001", style: "Polo Shirt", buyer: "Nike", orderQty: 5000, status: "CUTTING", zone: "KERALA", location: "KERALA", createdAt: "2026-05-25T00:00:00.000Z" },
      { id: "wo-2", workorderNumber: "WO-002", style: "Sport Shorts", buyer: "Adidas", orderQty: 3000, status: "INLINE", zone: "TIRUPUR", location: "TIRUPUR", createdAt: "2026-05-25T01:00:00.000Z" },
      { id: "wo-3", workorderNumber: "WO-003", style: "Running Tee", buyer: "Puma", orderQty: 4500, status: "ENDLINE", zone: "BANGLORE", location: "BANGLORE", createdAt: "2026-05-25T02:00:00.000Z" }
    ],
    material_reports: [] as any[],
    cutting_reports: [] as any[],
    sewing_reports: [] as any[],
    endline_reports: [] as any[],
    aql_reports: [] as any[],
    final_reports: [] as any[],
    rework_reports: [] as any[],
    admin_logs: [
      { timestamp: new Date().toISOString(), module: "SYSTEM", action: "BOOT", details: "Local fallback database initialized successfully", admin: "SYSTEM" }
    ],
    settings: {
      "GLOBAL": {
        "ZONE": ["KERALA", "TIRUPUR", "BANGLORE"],
        "SUPPLIER": ["Fabric Corp", "Yarn Trade Ltd", "Button & Co"],
        "ITEMS": ["100% Cotton Single Jersey", "TC Fleece", "Rib 1x1"],
        "COLOR": ["BLACK", "WHITE", "NAVY BLUE", "MELANGE GREY"],
        "DEFECTS": ["Hole", "Stain", "Shading", "Skew", "Drop Stitch", "Puckering", "Broken Stitch", "Uncut Thread"],
        "WORKERS": ["John Doe", "Jane Smith", "Sam Wilson"],
        "MACHINE": ["M-01", "M-02", "M-03"],
        "OPERATION": ["Front Collar Stitching", "Sleeve Attachment", "Hemming"],
        "SIZE": ["S", "M", "L", "XL", "XXL"],
        "CUPSIZE": ["A", "B", "C", "D"],
        "UNIT": ["KG", "MTR", "YARD", "PCS"],
        "LINE": ["Line-1", "Line-2", "Line-3"]
      }
    } as Record<string, any>
  };
  writeLocalDb(seed);
  return seed;
}

function writeLocalDb(data: any) {
  try {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error("[LOCAL DB] Error writing local db:", e);
  }
}

function executeLocalAction(action: string, params: any[]): any {
  console.log(`[LOCAL DB FALLBACK] Executing ${action} locally.`);
  const db = readLocalDb();
  
  switch (action) {
    case 'api_ping':
      return { success: true, status: "Connected (Local Fallback)", timestamp: new Date().toISOString() };
      
    case 'api_getInitialData': {
      const zone = params[0]?.zone;
      const userCode = params[0]?.userCode;
      let workorders = db.workorders || [];
      if (zone && zone !== 'ALL' && zone !== 'WORKORDER') {
        workorders = workorders.filter((w: any) => {
          const zVal = String(w.zone || w.location || '').toUpperCase().trim();
          return zVal === String(zone).toUpperCase().trim();
        });
      }
      db.settings = db.settings || {};
      const settings = userCode ? (db.settings[userCode] || db.settings['GLOBAL'] || {}) : (db.settings['GLOBAL'] || {});
      return {
        users: db.users || [],
        workorders: workorders,
        settings: settings,
        serverTime: new Date().toISOString(),
        success: true
      };
    }
    
    case 'api_getUsers':
      return db.users || [];
      
    case 'api_saveUser': {
      const user = params[0];
      const structuredUser = {
        userCode: user.userCode,
        username: user.username,
        password: user.password,
        role: user.role,
        location: user.location,
        restrictions: user.restrictions || [],
        canDownload: user.canDownload !== false
      };
      
      db.users = db.users || [];
      // Prevent duplicates
      db.users = db.users.filter((u: any) => u.userCode !== user.userCode);
      db.users.push(structuredUser);
      writeLocalDb(db);
      return { success: true };
    }
    
    case 'api_updateUser': {
      const user = params[0];
      db.users = db.users || [];
      const idx = db.users.findIndex((u: any) => u.userCode === user.userCode);
      if (idx !== -1) {
        db.users[idx] = { ...db.users[idx], ...user };
        writeLocalDb(db);
      }
      return { success: true };
    }
    
    case 'api_deleteUser': {
      const userCode = params[0];
      db.users = db.users || [];
      db.users = db.users.filter((u: any) => u.userCode !== userCode);
      writeLocalDb(db);
      return { success: true };
    }
    
    case 'api_getWorkorders': {
      const arg = params[0];
      const zone = (typeof arg === 'string' ? arg : arg?.zone);
      let workorders = db.workorders || [];
      if (zone && zone !== 'ALL' && zone !== 'WORKORDER') {
        workorders = workorders.filter((w: any) => {
          const zVal = String(w.zone || w.location || '').toUpperCase().trim();
          return zVal === String(zone).toUpperCase().trim();
        });
      }
      return workorders;
    }
    
    case 'api_saveWorkorder': {
      const wo = params[0];
      wo.id = wo.id || 'wo-' + Math.random().toString(36).substr(2, 9);
      if (!wo.status) wo.status = 'CUTTING';
      db.workorders = db.workorders || [];
      db.workorders.push(wo);
      writeLocalDb(db);
      return { success: true };
    }
    
    case 'api_updateWorkorder': {
      const wo = params[0];
      db.workorders = db.workorders || [];
      const idx = db.workorders.findIndex((w: any) => String(w.id) === String(wo.id) || String(w.workorderNumber) === String(wo.workorderNumber));
      if (idx !== -1) {
        db.workorders[idx] = { ...db.workorders[idx], ...wo };
        writeLocalDb(db);
      }
      return { success: true };
    }
    
    case 'api_deleteWorkorder': {
      const id = params[0];
      db.workorders = db.workorders || [];
      db.workorders = db.workorders.filter((w: any) => String(w.id) !== String(id) && String(w.workorderNumber) !== String(id));
      writeLocalDb(db);
      return { success: true };
    }
    
    case 'api_getUserSettings': {
      const target = params[0] || 'GLOBAL';
      db.settings = db.settings || {};
      return db.settings[target] || db.settings['GLOBAL'] || {};
    }
    
    case 'api_saveUserSettings':
    case 'api_saveSettings': {
      const target = params[0] || 'GLOBAL';
      const settings = params[1];
      db.settings = db.settings || {};
      db.settings[target] = settings;
      writeLocalDb(db);
      return { success: true };
    }
    
    case 'api_getAdminLogs':
      return db.admin_logs || [];
      
    case 'api_logAdminActivity': {
      const details = params[0];
      db.admin_logs = db.admin_logs || [];
      db.admin_logs.push({
        timestamp: new Date().toISOString(),
        module: details.module || 'SYSTEM',
        action: details.action || 'ACTIVITY',
        details: details.details || '',
        admin: details.admin || 'SYSTEM'
      });
      writeLocalDb(db);
      return { success: true };
    }
    
    case 'api_saveMATERIALREPORT':
    case 'api_saveMaterialReport': {
      db.material_reports = db.material_reports || [];
      const report = params[0];
      report.id = report.id || 'mat-' + Math.random().toString(36).substr(2, 9);
      if (!report.timestamp) report.timestamp = new Date().toISOString();
      db.material_reports.push(report);
      writeLocalDb(db);
      return { success: true };
    }
    
    case 'api_saveCUTTINGQUALITY':
    case 'api_saveCuttingReport': {
      db.cutting_reports = db.cutting_reports || [];
      const report = params[0];
      report.id = report.id || 'cut-' + Math.random().toString(36).substr(2, 9);
      if (!report.timestamp) report.timestamp = new Date().toISOString();
      db.cutting_reports.push(report);
      
      // Update WO status
      if (report.moveToInline && report.wo) {
        db.workorders = db.workorders || [];
        const woIdx = db.workorders.findIndex((w: any) => String(w.workorderNumber) === String(report.wo));
        if (woIdx !== -1) db.workorders[woIdx].status = 'INLINE';
      }
      writeLocalDb(db);
      return { success: true };
    }
    
    case 'api_saveSEWINGDEFECT':
    case 'api_saveInlineReport': {
      db.sewing_reports = db.sewing_reports || [];
      const report = params[0];
      report.id = report.id || 'sew-' + Math.random().toString(36).substr(2, 9);
      if (!report.timestamp) report.timestamp = new Date().toISOString();
      db.sewing_reports.push(report);
      
      // Update WO status
      if (report.moveToEndline && report.wo) {
        db.workorders = db.workorders || [];
        const woIdx = db.workorders.findIndex((w: any) => String(w.workorderNumber) === String(report.wo));
        if (woIdx !== -1) db.workorders[woIdx].status = 'ENDLINE';
      }
      writeLocalDb(db);
      return { success: true };
    }

    case 'api_save8ROUNDSYSTEM': {
      db.sewing_reports = db.sewing_reports || [];
      const report = params[0];
      report.id = report.id || 'sew-' + Math.random().toString(36).substr(2, 9);
      if (!report.timestamp) report.timestamp = new Date().toISOString();
      db.sewing_reports.push(report);
      writeLocalDb(db);
      return { success: true };
    }

    case 'api_update8ROUNDSYSTEM': {
      db.sewing_reports = db.sewing_reports || [];
      const report = params[0];
      const idx = db.sewing_reports.findIndex((r: any) => String(r.id) === String(report.id));
      if (idx !== -1) {
        db.sewing_reports[idx] = { ...db.sewing_reports[idx], ...report };
        writeLocalDb(db);
        return { success: true };
      }
      return { success: false, error: 'Record not found' };
    }
    
    case 'api_saveENDLINEQUALITY':
    case 'api_saveEndlineReport': {
      db.endline_reports = db.endline_reports || [];
      const report = params[0];
      report.id = report.id || 'end-' + Math.random().toString(36).substr(2, 9);
      if (!report.timestamp) report.timestamp = new Date().toISOString();
      db.endline_reports.push(report);
      
      // Update WO status
      if (report.moveToAQL && report.wo) {
        db.workorders = db.workorders || [];
        const woIdx = db.workorders.findIndex((w: any) => String(w.workorderNumber) === String(report.wo));
        if (woIdx !== -1) db.workorders[woIdx].status = 'AQL';
      }
      writeLocalDb(db);
      return { success: true };
    }
    
    case 'api_saveAQLREPORT': {
      db.aql_reports = db.aql_reports || [];
      const report = params[0];
      report.id = report.id || 'aql-' + Math.random().toString(36).substr(2, 9);
      if (!report.timestamp) report.timestamp = new Date().toISOString();
      db.aql_reports.push(report);
      
      // Update WO status
      if (report.moveToFinal && report.wo) {
        db.workorders = db.workorders || [];
        const woIdx = db.workorders.findIndex((w: any) => String(w.workorderNumber) === String(report.wo));
        if (woIdx !== -1) db.workorders[woIdx].status = 'FINAL';
      }
      writeLocalDb(db);
      return { success: true };
    }
    
    case 'api_saveFINALAUDIT': {
      db.final_reports = db.final_reports || [];
      const report = params[0];
      report.id = report.id || 'fin-' + Math.random().toString(36).substr(2, 9);
      if (!report.timestamp) report.timestamp = new Date().toISOString();
      db.final_reports.push(report);
      
      // Update WO status
      if (report.moveToComplete && report.wo) {
        db.workorders = db.workorders || [];
        const woIdx = db.workorders.findIndex((w: any) => String(w.workorderNumber) === String(report.wo));
        if (woIdx !== -1) db.workorders[woIdx].status = 'COMPLETED';
      }
      writeLocalDb(db);
      return { success: true };
    }
    
    case 'api_saveREWORK':
    case 'api_saveReworkReport': {
      db.rework_reports = db.rework_reports || [];
      const report = params[0];
      report.id = report.id || 'rew-' + Math.random().toString(36).substr(2, 9);
      if (!report.timestamp) report.timestamp = new Date().toISOString();
      db.rework_reports.push(report);
      writeLocalDb(db);
      return { success: true };
    }
    
    case 'api_getMaterialData': {
      const zone = params[0]?.zone;
      let data = db.material_reports || [];
      if (zone && zone !== 'ALL') {
        data = data.filter((r: any) => String(r.zone || r.location || '').toUpperCase() === String(zone).toUpperCase());
      }
      return data;
    }
    
    case 'api_getCuttingData': {
      const zone = params[0]?.zone;
      let data = db.cutting_reports || [];
      if (zone && zone !== 'ALL') {
        data = data.filter((r: any) => String(r.zone || r.location || '').toUpperCase() === String(zone).toUpperCase());
      }
      return data;
    }
    
    case 'api_getInlineData': {
      const zone = params[0]?.zone;
      let data = db.sewing_reports || [];
      if (zone && zone !== 'ALL') {
        data = data.filter((r: any) => String(r.zone || r.location || '').toUpperCase() === String(zone).toUpperCase());
      }
      return data;
    }
    
    case 'api_get8ROUNDSYSTEMData': {
      const zone = params[0]?.zone;
      let data = db.sewing_reports || [];
      if (zone && zone !== 'ALL') {
        data = data.filter((r: any) => String(r.zone || r.location || '').toUpperCase() === String(zone).toUpperCase());
      }
      return data;
    }
    
    case 'api_getEndlineData': {
      const zone = params[0]?.zone;
      let data = db.endline_reports || [];
      if (zone && zone !== 'ALL') {
        data = data.filter((r: any) => String(r.zone || r.location || '').toUpperCase() === String(zone).toUpperCase());
      }
      return data;
    }
    
    case 'api_getAQLData': {
      const zone = params[0]?.zone;
      let data = db.aql_reports || [];
      if (zone && zone !== 'ALL') {
        data = data.filter((r: any) => String(r.zone || r.location || '').toUpperCase() === String(zone).toUpperCase());
      }
      return data;
    }
    
    case 'api_getFinalAuditData': {
      const zone = params[0]?.zone;
      let data = db.final_reports || [];
      if (zone && zone !== 'ALL') {
        data = data.filter((r: any) => String(r.zone || r.location || '').toUpperCase() === String(zone).toUpperCase());
      }
      return data;
    }
    
    case 'api_deleteMaterialData': {
      const id = params[0];
      db.material_reports = (db.material_reports || []).filter((r: any) => String(r.id) !== String(id));
      writeLocalDb(db);
      return { success: true };
    }
    
    case 'api_deleteCuttingData': {
      const id = params[0];
      db.cutting_reports = (db.cutting_reports || []).filter((r: any) => String(r.id) !== String(id));
      writeLocalDb(db);
      return { success: true };
    }
    
    case 'api_deleteInlineData': {
      const id = params[0];
      db.sewing_reports = (db.sewing_reports || []).filter((r: any) => String(r.id) !== String(id));
      writeLocalDb(db);
      return { success: true };
    }
    
    case 'api_deleteEndlineData': {
      const id = params[0];
      db.endline_reports = (db.endline_reports || []).filter((r: any) => String(r.id) !== String(id));
      writeLocalDb(db);
      return { success: true };
    }
    
    case 'api_deleteAQLData': {
      const id = params[0];
      db.aql_reports = (db.aql_reports || []).filter((r: any) => String(r.id) !== String(id));
      writeLocalDb(db);
      return { success: true };
    }
    
    case 'api_deleteFinalAuditData': {
      const id = params[0];
      db.final_reports = (db.final_reports || []).filter((r: any) => String(r.id) !== String(id));
      writeLocalDb(db);
      return { success: true };
    }
    
    case 'api_bulkSave': {
      const sheetName = params[0];
      const records = params[1] || [];
      records.forEach((r: any) => {
        r.id = r.id || 'bulk-' + Math.random().toString(36).substr(2, 9);
        if (!r.timestamp) r.timestamp = new Date().toISOString();
      });
      
      const keyMap: any = {
        'USERS': 'users',
        'WORKORDER': 'workorders',
        'MATERIAL REPORT': 'material_reports',
        'CUTTING QUALITY': 'cutting_reports',
        'INLINE': 'sewing_reports',
        'SEWING DEFECT': 'sewing_reports',
        '8ROUND SYSTEM': 'sewing_reports',
        'ENDLINE QUALITY': 'endline_reports',
        'AQL REPORT': 'aql_reports',
        'FINAL AUDIT': 'final_reports',
        'REWORK': 'rework_reports',
        'ADMIN': 'admin_logs'
      };
      const dbKey = keyMap[sheetName] || sheetName;
      db[dbKey] = db[dbKey] || [];
      db[dbKey].push(...records);
      writeLocalDb(db);
      return { success: true, count: records.length };
    }
    
    case 'api_saveMaterialReportBulk': {
      const data = params[0] || {};
      const { zone, billNo, supplierName, grn, checkingDate, receivedDate, remarks, inspector, timestamp, items } = data;
      if (!items || !Array.isArray(items)) return { success: true, count: 0 };
      
      const mappedItems = items.map((item: any) => ({
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
        id: 'bulk-' + Math.random().toString(36).substr(2, 9)
      }));
      
      db.material_reports = db.material_reports || [];
      db.material_reports.push(...mappedItems);
      writeLocalDb(db);
      return { success: true, count: items.length, total: items.length };
    }
    
    default:
      console.warn(`[LOCAL DB FALLBACK] Unknown action requested: ${action}`);
      return { success: false, error: `Method ${action} not supported locally.` };
  }
}

async function startServer() {
  // Ensure local DB is initialized on boot
  readLocalDb();

  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Proxy for Google Apps Script
  app.get("/api/config", async (req, res) => {
    let fileUrl = null;
    let fileSpreadsheetId = null;
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        fileUrl = fs.readFileSync(CONFIG_FILE, 'utf8').trim();
      }
      if (fs.existsSync(SPREADSHEET_FILE)) {
        fileSpreadsheetId = fs.readFileSync(SPREADSHEET_FILE, 'utf8').trim();
      }
    } catch (e) {}

    // Load from Firestore as well to auto-heal
    let fsUrl = "";
    let fsSpreadsheetId = "";
    const fsConfig = await getFirestoreConfig();
    if (fsConfig) {
      fsUrl = fsConfig.gasUrl;
      fsSpreadsheetId = fsConfig.spreadsheetId;
    }

    const envUrl = process.env.VITE_GAS_URL;
    const hasEnv = !!envUrl && !envUrl.includes("REPLACE_WITH");

    const finalUrlExists = hasEnv || !!fileUrl || !!fsUrl || !!HARDCODED_GAS_URL;

    res.json({
      hasGasUrl: finalUrlExists,
      gasUrlPlaceholder: envUrl?.includes("REPLACE_WITH"),
      isPermanent: !!fileUrl || hasEnv || !!fsUrl || !!HARDCODED_GAS_URL,
      source: fileUrl ? 'file' : (fsUrl ? 'firestore' : (hasEnv ? 'env' : 'hardcoded')),
      gasUrl: fileUrl || fsUrl || (hasEnv ? envUrl : HARDCODED_GAS_URL),
      spreadsheetId: fileSpreadsheetId || fsSpreadsheetId || process.env.VITE_SPREADSHEET_ID || ""
    });
  });

  app.get("/api/code-gs", (req, res) => {
    try {
      const codePath = path.join(process.cwd(), "Code.gs");
      if (fs.existsSync(codePath)) {
        const content = fs.readFileSync(codePath, "utf8");
        res.setHeader("Content-Type", "text/plain");
        return res.send(content);
      }
      res.status(404).send("Code.gs not found");
    } catch (e: any) {
      res.status(500).send("Failed to read Code.gs: " + e.message);
    }
  });

  app.post("/api/save-config", async (req, res) => {
    const { url, spreadsheetId } = req.body;
    
    try {
      if (url) {
        if (!url.startsWith("https://script.google.com/macros/s/")) {
          return res.status(400).json({ success: false, error: "Invalid Google Script URL" });
        }
        fs.writeFileSync(CONFIG_FILE, url.trim());
        console.log(`[CONFIG] Permanent GAS URL saved to ${CONFIG_FILE}`);
      }
      
      if (spreadsheetId) {
        fs.writeFileSync(SPREADSHEET_FILE, spreadsheetId.trim());
        console.log(`[CONFIG] Permanent Spreadsheet ID saved to ${SPREADSHEET_FILE}`);
      }

      // Sync the new configuration changes to Firestore
      try {
        await saveFirestoreConfig(url || "", spreadsheetId || "");
      } catch (fsErr: any) {
        console.warn("[CONFIG] Non-blocking Firestore sync warning:", fsErr.message);
      }
      
      res.json({ success: true, message: "Configuration saved permanently on server" });
    } catch (e: any) {
      console.error("[CONFIG] Failed to save config:", e);
      res.status(500).json({ success: false, error: "Failed to write configuration to server storage: " + e.message });
    }
  });

  app.post("/api/gas", async (req, res) => {
    try {
      // Load Firestore config in case we need to auto-heal
      const fsConfig = await getFirestoreConfig();

      // Priority: 1. Request Header, 2. Persistent File (Setup tool), 3. Firestore, 4. Env Var, 5. Hardcoded Fallbacks
      let gasUrl = req.headers['x-gas-url'];
      let source = 'header';
      
      if (!gasUrl) {
        try {
          if (fs.existsSync(CONFIG_FILE)) {
            gasUrl = fs.readFileSync(CONFIG_FILE, 'utf8').trim();
            source = 'file';
          }
        } catch (e) {}
      }

      if (!gasUrl && fsConfig && fsConfig.gasUrl) {
        gasUrl = fsConfig.gasUrl;
        source = 'firestore';
      }

      if (!gasUrl || (typeof gasUrl === 'string' && gasUrl.includes("REPLACE_WITH_YOUR_EXEC_URL"))) {
        gasUrl = process.env.VITE_GAS_URL;
        source = 'env';
      }

      // Check if env var is actually set
      if (!gasUrl || (typeof gasUrl === 'string' && gasUrl.includes("REPLACE_WITH"))) {
        gasUrl = HARDCODED_GAS_URL;
        source = 'hardcoded';
      }

      const candidateUrls: string[] = [];
      if (gasUrl && typeof gasUrl === 'string') {
        const trimmed = gasUrl.trim();
        if (trimmed && !trimmed.includes("REPLACE_WITH")) {
          candidateUrls.push(trimmed);
        }
      }
      HARDCODED_GAS_URLS.forEach(url => {
        if (!candidateUrls.includes(url)) {
          candidateUrls.push(url);
        }
      });

      if (candidateUrls.length === 0) {
        console.error("[PROXY ERROR] GAS URL missing even after fallbacks.");
        return res.status(500).json({ 
          success: false, 
          error: "CONFIGURATION_REQUIRED",
          details: "Google Sheets Connection not configured. Use the setup tool or add VITE_GAS_URL." 
        });
      }

      // In-flight body preparation: if spreadsheetId is missing from client, inject from server backups and Firestore
      const bodyPayload = { ...req.body };
      if (!bodyPayload.spreadsheetId) {
        try {
          if (fs.existsSync(SPREADSHEET_FILE)) {
            bodyPayload.spreadsheetId = fs.readFileSync(SPREADSHEET_FILE, 'utf8').trim();
            console.log(`[API PROXY] Recovered spreadsheetId from local file: ${bodyPayload.spreadsheetId}`);
          }
        } catch (e) {}
      }
      if (!bodyPayload.spreadsheetId && fsConfig && fsConfig.spreadsheetId) {
        bodyPayload.spreadsheetId = fsConfig.spreadsheetId;
        console.log(`[API PROXY] Recovered and injected missing spreadsheetId from Firestore: ${fsConfig.spreadsheetId}`);
      }
      if (!bodyPayload.spreadsheetId && process.env.VITE_SPREADSHEET_ID && !process.env.VITE_SPREADSHEET_ID.includes("REPLACE_WITH")) {
        bodyPayload.spreadsheetId = process.env.VITE_SPREADSHEET_ID;
        console.log(`[API PROXY] Recovered and injected spreadsheetId from env: ${bodyPayload.spreadsheetId}`);
      }

      const action = bodyPayload.action || 'unknown';
      const payloadSize = JSON.stringify(bodyPayload).length;
      console.log(`[API PROXY] Action: ${action} | Size: ${(payloadSize / 1024).toFixed(2)}KB | Pool Size: ${candidateUrls.length} | Source: ${source}`);
      
      let lastError: any = null;
      let lastResponseText = "";
      let lastResponseStatus = 200;
      let responseData: any = null;
      let success = false;

      for (const targetUrl of candidateUrls) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 40000); // 40 seconds per attempt (prevents client timeouts and accommodates GAS startup/execution)
          
          const response = await fetch(targetUrl, {
            method: "POST",
            body: JSON.stringify(bodyPayload),
            headers: { "Content-Type": "application/json" },
            redirect: 'follow',
            signal: controller.signal as any
          });
          clearTimeout(timeoutId);

          lastResponseStatus = response.status;
          const text = await response.text();
          lastResponseText = text;

          if (response.ok) {
            try {
              const parsed = JSON.parse(text);
              if (parsed && (parsed.success === true || (parsed.success !== false && !parsed.error))) {
                responseData = parsed;
                success = true;
                break; // Valid, successful JSON output received! Exit candidate pool loop
              } else {
                console.warn(`[API PROXY] GAS URL ${targetUrl} returned failure payload:`, parsed);
                lastError = new Error(parsed?.error || "GAS endpoint returned success=false");
              }
            } catch (pErr) {
              console.warn(`[API PROXY] JSON parse failed for URL ${targetUrl}. Trying next in pool if available.`);
              lastError = new Error("Invalid JSON response from Google Script.");
            }
          } else {
            console.warn(`[API PROXY] GAS URL ${targetUrl} returned HTTP ${response.status}. Trying next in pool if available.`);
            lastError = new Error(`HTTP ${response.status}`);
          }
        } catch (fetchErr: any) {
          console.warn(`[API PROXY] Failed to fetch GAS URL ${targetUrl}:`, fetchErr.message);
          lastError = fetchErr;
        }
      }

      if (success && responseData) {
        return res.json(responseData);
      }

      // If we are here, all candidates failed
      console.warn(`[API PROXY] All backend targets failed or unconfigured. Falling back to LOCAL file-backed DATABASE execution for action: ${action}`);
      try {
        const localResponse = executeLocalAction(action, bodyPayload.params || []);
        return res.json(localResponse);
      } catch (localErr: any) {
        console.error(`[API PROXY] Local database execution also failed:`, localErr.message);
        
        const statusToSend = lastResponseStatus >= 400 ? lastResponseStatus : 500;
        let errorMessage = lastError?.message || "Failed to communicate with Google Sheets.";
        
        if (lastResponseStatus === 401 || lastResponseStatus === 403) {
          errorMessage = "Permission Denied: Web App must be 'Anyone' access.";
        } else if (lastResponseStatus === 404) {
          errorMessage = "Deployment Not Found. Check URL.";
        }

        return res.status(statusToSend).json({
          success: false,
          error: errorMessage,
          details: lastResponseText.slice(0, 500) || lastError?.message || ""
        });
      }

    } catch (error: any) {
      console.error("[API PROXY] Request Execution Failed:", error.message);
      res.status(500).json({ 
        success: false, 
        error: error.name === 'AbortError' ? "Request Timed Out (GAS limit)" : "Failed to communicate with Google Sheets.",
        details: error.message 
      });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (process.env.VITE_GAS_URL && !process.env.VITE_GAS_URL.includes("REPLACE_WITH")) {
      console.log("BASE CONFIG: Permanent VITE_GAS_URL detected in environment.");
    } else {
      console.log("BASE CONFIG: No permanent VITE_GAS_URL found. Relying on client-side setup.");
    }
  });
}

startServer();
