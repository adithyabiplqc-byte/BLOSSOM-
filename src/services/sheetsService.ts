import { getAccessToken } from './auth';

export function resolveSynonymValue(header: string, record: any): any {
  if (!record) return "";
  const normHeader = header.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
  
  const groups = [
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
    },
    {
      canonical: 'worker',
      synonyms: ['worker', 'workername', 'operator', 'operatorname', 'workers', 'operators']
    },
    {
      canonical: 'machine',
      synonyms: ['machine', 'machineno', 'machinenumber', 'machines']
    },
    {
      canonical: 'round',
      synonyms: ['round', 'roundlabel', 'rounds', 'hourlyround', 'roundno']
    },
    {
      canonical: 'checkingdate',
      synonyms: ['checkingdate', 'date', 'checkingDate']
    }
  ];

  const recordKeys = Object.keys(record);
  
  // 1. Exact case-insensitive alphanumeric first
  const exactMatchKey = recordKeys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === normHeader);
  if (exactMatchKey !== undefined && record[exactMatchKey] !== undefined && record[exactMatchKey] !== null) {
    return record[exactMatchKey];
  }

  // 2. Synonyms groups
  const matchingGroup = groups.find(g => g.synonyms.includes(normHeader) || g.canonical === normHeader);
  if (matchingGroup) {
    for (const syn of matchingGroup.synonyms) {
      const matchKey = recordKeys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === syn);
      if (matchKey !== undefined && record[matchKey] !== undefined && record[matchKey] !== null && record[matchKey] !== '') {
        return record[matchKey];
      }
    }
  }

  // 3. Fallback
  const val = record[header];
  return val !== undefined ? val : "";
}

function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const DEFAULT_SETTINGS = {
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

const OFFLINE_SEED_USERS = [
  { userCode: 'U001', username: 'user1', password: 'pass1', role: 'USER' as const, location: 'UNIT A', zone: 'KERALA', restrictions: [], canDownload: true },
  { userCode: 'A001', username: 'admin', password: 'admin123', role: 'ADMIN' as const, location: 'SYSTEM', zone: 'SYSTEM', restrictions: [], canDownload: true },
  { userCode: 'W001', username: 'wo1', password: '123', role: 'WORKORDER' as const, location: 'UNIT A', zone: 'KERALA', restrictions: [], canDownload: true }
];

const OFFLINE_SEED_WORKORDERS = [
  { id: '1', workorderNumber: 'WO-2026-001', buyer: 'Blossom Brand', style: 'Polo Shirt', item: 'ITEM 1', color: 'BLACK', orderQty: 1200, unit: 'UNIT 1', line: 'LINE 1', shipDate: '2026-06-15', status: 'CUTTING', timestamp: new Date().toISOString() },
  { id: '2', workorderNumber: 'WO-2026-002', buyer: 'Aura Fashion', style: 'Summer Dress', item: 'ITEM 2', color: 'NAVY', orderQty: 850, unit: 'UNIT 2', line: 'LINE 2', shipDate: '2026-06-20', status: 'INLINE', timestamp: new Date().toISOString() },
  { id: '3', workorderNumber: 'WO-2026-003', buyer: 'Apex Sport', style: 'Running Shorts', item: 'ITEM 1', color: 'WHITE', orderQty: 2000, unit: 'UNIT 1', line: 'LINE 1', shipDate: '2026-06-30', status: 'ENDLINE', timestamp: new Date().toISOString() }
];

const mapDefaultSettingsToRows = () => {
  const categories = ['ZONE', 'SUPPLIER', 'ITEMS', 'COLOR', 'DEFECTS', 'WORKERS', 'MACHINE', 'OPERATION', 'SIZE', 'CUPSIZE', 'UNIT', 'LINE', 'STYLE_NAME'];
  let maxLen = 0;
  categories.forEach(cat => {
    const list = DEFAULT_SETTINGS[cat as keyof typeof DEFAULT_SETTINGS];
    if (list && list.length > maxLen) maxLen = list.length;
  });

  const records: any[] = [];
  for (let i = 0; i < maxLen; i++) {
    const record: any = {};
    categories.forEach(cat => {
      const list = DEFAULT_SETTINGS[cat as keyof typeof DEFAULT_SETTINGS];
      const val = list && list[i];
      record[cat] = val !== undefined && val !== null ? val : "";
    });
    records.push(record);
  }
  return records;
};

export const sheetsService = {
  getSpreadsheetId(): string | null {
    if (localStorage.getItem('BQOS_DEMO_MODE') === 'true') {
      return 'DEMO_SANDBOX_SPREADSHEET_ID';
    }
    return localStorage.getItem('VITE_SPREADSHEET_ID');
  },

  setSpreadsheetId(id: string) {
    if (localStorage.getItem('BQOS_DEMO_MODE') === 'true') {
      return;
    }
    if (id.includes('/d/')) {
      const match = id.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match) id = match[1];
    }
    localStorage.setItem('VITE_SPREADSHEET_ID', id.trim());
  },

  // OFFLINE FALLBACK ENGINE
  getOfflineData(sheetName: string): any[] {
    const key = `bqos_local_sheet_${sheetName}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn(`Failed to parse offline data for ${sheetName}`);
      }
    }

    // Seed defaults
    let initial: any[] = [];
    if (sheetName === 'USERS') {
      initial = OFFLINE_SEED_USERS;
    } else if (sheetName === 'WORKORDER') {
      initial = OFFLINE_SEED_WORKORDERS;
    } else if (sheetName === 'SETTINGS' || sheetName === 'GLOBAL') {
      initial = mapDefaultSettingsToRows();
    }
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  },

  saveOfflineData(sheetName: string, record: any) {
    const key = `bqos_local_sheet_${sheetName}`;
    const current = this.getOfflineData(sheetName);
    current.push(record);
    localStorage.setItem(key, JSON.stringify(current));
  },

  saveOfflineBulk(sheetName: string, records: any[]) {
    const key = `bqos_local_sheet_${sheetName}`;
    const current = this.getOfflineData(sheetName);
    records.forEach(r => {
      if (!r.id && !r.workorderNumber) {
        r.id = generateUuid();
      }
      current.push(r);
    });
    localStorage.setItem(key, JSON.stringify(current));
  },

  updateOfflineData(sheetName: string, record: any) {
    const key = `bqos_local_sheet_${sheetName}`;
    const current = this.getOfflineData(sheetName);
    const id = record.id || record.workorderNumber;
    
    const idx = current.findIndex(item => 
      String(item.id || item.workorderNumber) === String(id) || 
      (record.userCode && String(item.userCode) === String(record.userCode))
    );

    if (idx !== -1) {
      current[idx] = { ...current[idx], ...record };
    } else {
      current.push(record);
    }
    localStorage.setItem(key, JSON.stringify(current));
  },

  deleteOfflineData(sheetName: string, id: any) {
    const key = `bqos_local_sheet_${sheetName}`;
    const current = this.getOfflineData(sheetName);
    const filtered = current.filter(item => 
      String(item.id || item.workorderNumber || item.userCode) !== String(id)
    );
    localStorage.setItem(key, JSON.stringify(filtered));
  },

  async request(path: string, options: RequestInit = {}) {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error('AUTH_REQUIRED');
    }

    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${accessToken}`);
    headers.set('Content-Type', 'application/json');

    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${path}`, {
      ...options,
      headers
    });

    if (res.status === 401) {
      localStorage.removeItem('GOOGLE_ACCESS_TOKEN');
      throw new Error('AUTH_REQUIRED');
    }

    if (!res.ok) {
      const text = await res.text();
      let err;
      try {
        err = JSON.parse(text);
      } catch (e) {
        err = { error: { message: text } };
      }
      throw new Error(err?.error?.message || `Google API error: ${res.status}`);
    }

    return await res.json();
  },

  async checkSpreadsheetValid(id: string): Promise<boolean> {
    if (localStorage.getItem('BQOS_DEMO_MODE') === 'true') {
      return true;
    }
    try {
      const accessToken = getAccessToken();
      if (!accessToken) return false;
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  async createNewSpreadsheet(): Promise<string> {
    if (localStorage.getItem('BQOS_DEMO_MODE') === 'true') {
      return 'DEMO_SANDBOX_SPREADSHEET_ID';
    }

    const defaultSheets = [
      'USERS', 
      'MATERIAL REPORT',
      'WORKORDER', 'SETTINGS', 'ADMIN', 
      'CUTTING QUALITY', 'INLINE', 
      'ENDLINE QUALITY', 'AQL REPORT', 'FINAL AUDIT'
    ];

    const body = {
      properties: {
        title: "BQOS - Blossom Quality Operation System"
      },
      sheets: defaultSheets.map(title => ({
        properties: { title }
      }))
    };

    const data = await this.request('', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    const id = data.spreadsheetId;
    this.setSpreadsheetId(id);

    // Seed default USERS and SETTINGS
    try {
      const defaultUser = {
        userCode: 'A001',
        username: 'admin',
        password: 'admin123',
        role: 'ADMIN',
        location: 'KERALA',
        restrictions: [],
        canDownload: true
      };
      
      await this.saveData('USERS', defaultUser);

      await this.saveSettings('SETTINGS', DEFAULT_SETTINGS);
    } catch (seedError) {
      console.warn('Seeding spreadsheet database failed, will lazy seed rows:', seedError);
    }

    return id;
  },

  async ensureSheetExists(sheetName: string) {
    if (localStorage.getItem('BQOS_DEMO_MODE') === 'true') return;
    const spreadsheetId = this.getSpreadsheetId();
    if (!spreadsheetId) throw new Error('SPREADSHEET_NOT_FOUND');

    const metadata = await this.request(spreadsheetId);
    const resolvedName = this.resolveSynonymSheetNameClient(sheetName, metadata.sheets || []);
    const existing = metadata.sheets?.some((s: any) => s.properties?.title === resolvedName);

    if (!existing) {
      await this.request(`${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        body: JSON.stringify({
          requests: [{
            addSheet: {
              properties: { title: sheetName }
            }
          }]
        })
      });
    }
  },

  resolveSynonymSheetNameClient(sheetName: string, sheets: any[], record?: any): string {
    const titleList = sheets.map((s: any) => s.properties?.title || "");
    if (titleList.includes(sheetName)) return sheetName;

    const synonymsMap: { [key: string]: string[] } = {
      'USERS': ['USERS'],
      'MATERIAL REPORT': [
        'MATERIAL', 'MATERIAL - KERALA', 'MATERIAL - TIRUPUR', 'MATERIAL - BANGLORE',
        'MATERIAL REPORT', 'MATERIAL QUALITY KERALA', 'MATERIAL QUALITY TIRUPUR', 'MATERIAL QUALITY BANGLORE',
        'MATERIAL QUALITY', 'STORE MATERIAL INSPECTION DATA', 'MATERIAL INSPECTION',
        'MATERIAL REPORT - KERALA', 'MATERIAL REPORT - TIRUPUR', 'MATERIAL REPORT - BANGLORE',
        'MATERIAL QUALITY - KERALA', 'MATERIAL QUALITY - TIRUPUR', 'MATERIAL QUALITY - BANGLORE',
        'MATERIAL REPORT KERALA', 'MATERIAL REPORT TIRUPUR', 'MATERIAL REPORT BANGLORE'
      ],
      'CUTTING QUALITY': ['CUTTING QUALITY', 'CUTTING REPORT', 'CUTTING', 'CUTTING - KERALA', 'CUTTING - TIRUPUR', 'CUTTING - BANGLORE'],
      'INLINE': ['INLINE', 'INLINE REPORT', 'INLINE QUALITY', 'SEWING DEFECT', 'SEWING DEFECTS', 'INLINE - KERALA', 'INLINE - TIRUPUR', 'INLINE - BANGLORE', '8ROUND SYSTEM', '8ROUND SYSTEM - KERALA', '8ROUND SYSTEM - TIRUPUR', '8ROUND SYSTEM - BANGLORE', '8ROUND_SYSTEM', '8 ROUND SYSTEM', '8ROUND', '8 ROUNDS'],
      'ENDLINE QUALITY': ['ENDLINE QUALITY', 'ENDLINE REPORT', 'ENDLINE', 'ENDLINE - KERALA', 'ENDLINE - TIRUPUR', 'ENDLINE - BANGLORE'],
      'AQL REPORT': ['AQL REPORT', 'AQL INSPECTION', 'AQL', 'AQL - KERALA', 'AQL - TIRUPUR', 'AQL - BANGLORE'],
      'FINAL AUDIT': ['FINAL AUDIT', 'FINAL AUDIT REPORT', 'FINAL REPORT', 'FINAL', 'FINAL - KERALA', 'FINAL - TIRUPUR', 'FINAL - BANGLORE'],
      'WORKORDER': ['WORKORDER', 'WORKORDERS']
    };

    const canonicalKeys: { [key: string]: string } = {
      'MATERIAL': 'MATERIAL REPORT',
      'MATERIAL QUALITY KERALA': 'MATERIAL REPORT',
      'MATERIAL QUALITY TIRUPUR': 'MATERIAL REPORT',
      'MATERIAL QUALITY BANGLORE': 'MATERIAL REPORT',
      'MATERIAL QUALITY': 'MATERIAL REPORT',
      'CUTTING': 'CUTTING QUALITY',
      'CUTTING REPORT': 'CUTTING QUALITY',
      'INLINE': 'INLINE',
      'INLINE REPORT': 'INLINE',
      'INLINE QUALITY': 'INLINE',
      'SEWING DEFECT': 'INLINE',
      'SEWING DEFECTS': 'INLINE',
      'ENDLINE': 'ENDLINE QUALITY',
      'ENDLINE REPORT': 'ENDLINE QUALITY',
      'AQL': 'AQL REPORT',
      'AQL INSPECTION': 'AQL REPORT',
      'FINAL': 'FINAL AUDIT',
      'FINAL AUDIT REPORT': 'FINAL AUDIT',
      'FINAL REPORT': 'FINAL AUDIT',
      '8ROUND': 'INLINE',
      '8 ROUNDS': 'INLINE',
      '8ROUND_SYSTEM': 'INLINE',
      '8 ROUND SYSTEM': 'INLINE',
      '8ROUND SYSTEM': 'INLINE'
    };

    let baseName = sheetName;
    const hyphenIdx = sheetName.indexOf(' - ');
    if (hyphenIdx !== -1) {
      baseName = sheetName.slice(0, hyphenIdx);
    }

    if (canonicalKeys[baseName]) {
      baseName = canonicalKeys[baseName];
    }

    const normalizedBase = String(baseName || '').trim().toUpperCase();
    if (normalizedBase === 'USERS' || normalizedBase === 'SETTINGS' || normalizedBase === 'GLOBAL' || normalizedBase === 'ADMIN') {
      if (normalizedBase === 'USERS') return 'USERS';
      if (normalizedBase === 'SETTINGS' || normalizedBase === 'GLOBAL') return 'SETTINGS';
      if (normalizedBase === 'ADMIN') return 'ADMIN';
      const synonyms = synonymsMap[baseName];
      if (synonyms) {
        for (const syn of synonyms) {
          if (titleList.includes(syn)) return syn;
        }
      }
      return baseName;
    }

    // Restore zone-routing for A1-A6 modules (e.g. MATERIAL REPORT, CUTTING QUALITY, etc)
    const zoneRouteModules = ['MATERIAL REPORT', 'CUTTING QUALITY', 'INLINE', 'ENDLINE QUALITY', 'AQL REPORT', 'FINAL AUDIT', 'WORKORDER'];
    if (zoneRouteModules.includes(baseName)) {
      const zone = record?.zone || record?.location;
      if (zone && zone !== 'ALL' && zone !== 'SYSTEM' && zone !== 'WORKORDER') {
        const zonedName1 = baseName + " - " + zone;
        const zonedName2 = baseName + " " + zone;
        for (const name of [zonedName1, zonedName2]) {
          if (titleList.includes(name)) return name;
        }
        const baseSyns = synonymsMap[baseName] || [];
        for (const syn of baseSyns) {
          if (titleList.includes(syn + " - " + zone) || titleList.includes(syn + " " + zone)) {
            return titleList.includes(syn + " - " + zone) ? (syn + " - " + zone) : (syn + " " + zone);
          }
          if (syn.endsWith(zone) && titleList.includes(syn)) {
            return syn;
          }
        }
        
        // If a zone is specified, do NOT fall back to an unzoned sheet.
        // Instead return the zonedName1 directly so that a zoned sheet is used/created.
        return zonedName1;
      }
    }

    const synonyms = synonymsMap[baseName];
    if (synonyms) {
      for (const syn of synonyms) {
        if (titleList.includes(syn)) {
          return syn;
        }
      }
      return synonyms[0] || baseName;
    }

    return baseName;
  },

  async getData(sheetName: string): Promise<any[]> {
    if (localStorage.getItem('BQOS_DEMO_MODE') === 'true') {
      return this.getOfflineData(sheetName);
    }

    const spreadsheetId = this.getSpreadsheetId();
    if (!spreadsheetId) throw new Error('SPREADSHEET_NOT_FOUND');

    try {
      const metadata = await this.request(spreadsheetId);
      const sheetTitles = (metadata.sheets || []).map((s: any) => s.properties?.title || "");

      const synonymsMap: { [key: string]: string[] } = {
        'USERS': ['USERS'],
        'MATERIAL REPORT': [
          'MATERIAL', 'MATERIAL - KERALA', 'MATERIAL - TIRUPUR', 'MATERIAL - BANGLORE',
          'MATERIAL REPORT', 'MATERIAL REPORT - KERALA', 'MATERIAL REPORT - TIRUPUR', 'MATERIAL REPORT - BANGLORE'
        ],
        'CUTTING QUALITY': ['CUTTING QUALITY', 'CUTTING REPORT', 'CUTTING', 'CUTTING - KERALA', 'CUTTING - TIRUPUR', 'CUTTING - BANGLORE'],
        'INLINE': ['INLINE', 'INLINE REPORT', 'INLINE QUALITY', 'INLINE - KERALA', 'INLINE - TIRUPUR', 'INLINE - BANGLORE'],
        'ENDLINE QUALITY': ['ENDLINE QUALITY', 'ENDLINE REPORT', 'ENDLINE', 'ENDLINE - KERALA', 'ENDLINE - TIRUPUR', 'ENDLINE - BANGLORE'],
        'AQL REPORT': ['AQL REPORT', 'AQL INSPECTION', 'AQL', 'AQL - KERALA', 'AQL - TIRUPUR', 'AQL - BANGLORE'],
        'FINAL AUDIT': ['FINAL AUDIT', 'FINAL AUDIT REPORT', 'FINAL REPORT', 'FINAL', 'FINAL AUDIT - KERALA', 'FINAL AUDIT - TIRUPUR', 'FINAL AUDIT - BANGLORE'],
        'WORKORDER': ['WORKORDER', 'WORKORDERS', 'WORKORDER - KERALA', 'WORKORDER - TIRUPUR', 'WORKORDER - BANGLORE']
      };

      const possibleNames = synonymsMap[sheetName] || [sheetName];
      let allValues: any[] = [];
      const seenIds = new Set();

      // Find all matching sheets inside the spreadsheet for aggregation
      const matchingTitles = sheetTitles.filter((title: string) => {
        const uTitle = title.toUpperCase().trim();
        if (sheetName === 'USERS' || sheetName === 'SETTINGS' || sheetName === 'ADMIN') {
          return uTitle === sheetName;
        }
        const uPossibleNames = possibleNames.map(pn => pn.toUpperCase().trim());
        if (uPossibleNames.includes(uTitle)) return true;
        return uPossibleNames.some(pn => uTitle.startsWith(pn + " - ") || uTitle.startsWith(pn + " ") || uTitle === pn);
      });

      if (matchingTitles.length === 0) {
        const resolvedName = this.resolveSynonymSheetNameClient(sheetName, metadata.sheets || []);
        matchingTitles.push(resolvedName);
      }

      for (const title of matchingTitles) {
        try {
          const data = await this.request(`${spreadsheetId}/values/${encodeURIComponent(title)}!A1:Z5000`);
          if (!data.values || data.values.length < 2) continue;

          const headers: string[] = data.values[0];
          for (let i = 1; i < data.values.length; i++) {
            const row = data.values[i];
            const record: any = {};
            for (let j = 0; j < headers.length; j++) {
              const header = headers[j];
              let val = row[j] !== undefined ? row[j] : '';
              
              if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
                try {
                  val = JSON.parse(val);
                } catch (e) {}
              }
              record[header] = val;
              
              // Map to canonical keys for safe usage across the application
              const normKey = String(header || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
              const hasLocationCol = headers.some((h: string) => String(h || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '') === 'location');
              const hasZoneCol = headers.some((h: string) => String(h || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '') === 'zone');

              if (normKey === 'usercode') record['userCode'] = val;
              if (normKey === 'username' || normKey === 'name') record['username'] = val;
              if (normKey === 'password') record['password'] = val;
              if (normKey === 'role') record['role'] = val;
              if (normKey === 'location') {
                record['location'] = val;
                if (!hasZoneCol && record['zone'] === undefined) {
                  record['zone'] = val;
                }
              }
              if (normKey === 'zone') {
                record['zone'] = val;
                if (!hasLocationCol && record['location'] === undefined) {
                  record['location'] = val;
                }
              }
              if (normKey === 'restrictions') record['restrictions'] = val;
              if (normKey === 'candownload') record['canDownload'] = val;

              if (normKey === 'workordernumber' || normKey === 'workorderno') record['workorderNumber'] = val;
              if (normKey === 'orderqty' || normKey === 'qty' || normKey === 'quantity') record['orderQty'] = val;
              if (normKey === 'style' || normKey === 'stylename') {
                record['style'] = val;
                record['styleName'] = val;
              }
              if (normKey === 'item') record['item'] = val;
              if (normKey === 'color' || normKey === 'colour') {
                record['color'] = val;
                record['colour'] = val;
              }
              if (normKey === 'unit') record['unit'] = val;
              if (normKey === 'line') record['line'] = val;
              if (normKey === 'shipdate') record['shipDate'] = val;
              if (normKey === 'status') record['status'] = val;

              if (normKey === 'worker' || normKey === 'workername' || normKey === 'operator' || normKey === 'operatorname') {
                record['worker'] = val;
              }
              if (normKey === 'machine' || normKey === 'machineno' || normKey === 'machinenumber') {
                record['machine'] = val;
              }
              if (normKey === 'round' || normKey === 'roundlabel' || normKey === 'rounds' || normKey === 'hourlyround') {
                record['round'] = val;
              }
              if (normKey === 'checkingdate' || normKey === 'checkingDate') {
                record['checkingDate'] = val;
              }
            }

            const uniqueId = (sheetName === 'WORKORDER')
              ? (record.id || record.workorderNumber)
              : (record.id || record.userCode);
            if (uniqueId) {
              if (seenIds.has(uniqueId)) continue;
              seenIds.add(uniqueId);
            }
            allValues.push(record);
          }
        } catch (err) {
          console.warn(`[SHEETS SERVICE] Skipping non-existent or inaccessible sub-sheet: ${title}`);
        }
      }

      // Sort consolidated values on date basis (newest first)
      allValues.sort((a, b) => {
        const dateA = a.timestamp || a.checkingDate || a.receivedDate || a.date || a.createdAt;
        const dateB = b.timestamp || b.checkingDate || b.receivedDate || b.date || b.createdAt;
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        const timeA = new Date(dateA).getTime();
        const timeB = new Date(dateB).getTime();
        if (isNaN(timeA) && isNaN(timeB)) return 0;
        if (isNaN(timeA)) return 1;
        if (isNaN(timeB)) return -1;
        return timeB - timeA;
      });

      return allValues;
    } catch (error: any) {
      if (error.message?.includes('not found') || error.message?.includes('400')) {
        await this.ensureSheetExists(sheetName);
        return [];
      }
      throw error;
    }
  },

  async saveData(sheetName: string, record: any): Promise<{ success: boolean }> {
    if (localStorage.getItem('BQOS_DEMO_MODE') === 'true') {
      this.saveOfflineData(sheetName, record);
      return { success: true };
    }

    const spreadsheetId = this.getSpreadsheetId();
    if (!spreadsheetId) throw new Error('SPREADSHEET_NOT_FOUND');

    await this.ensureSheetExists(sheetName);

    const metadata = await this.request(spreadsheetId);
    const resolvedName = this.resolveSynonymSheetNameClient(sheetName, metadata.sheets || [], record);

    const existingRows = await this.request(`${spreadsheetId}/values/${encodeURIComponent(resolvedName)}!A1:Z1`).catch(() => ({ values: [] }));
    let headers: string[] = (existingRows.values && existingRows.values[0]) || [];

    const normSheet = sheetName.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const normResolved = resolvedName.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const isUserSheet = normSheet.indexOf('USER') !== -1 || normResolved.indexOf('USER') !== -1;

    if (headers.length === 0) {
      if (normSheet.indexOf('MATERIAL') !== -1 || normResolved.indexOf('MATERIAL') !== -1) {
        headers = ['timestamp', 'receivedDate', 'checkingDate', 'grn', 'billNo', 'supplierName', 'itemName', 'style', 'receivedQuantity', 'checkedQuantity', 'passQuantity', 'rejectedQuantity', 'itemRemarks', 'generalRemarks', 'zone', 'inspector', 'id'];
      } else if (isUserSheet) {
        headers = ['userCode', 'username', 'password', 'role', 'location', 'zone', 'restrictions', 'canDownload'];
      } else {
        headers = Object.keys(record);
      }
      await this.request(`${spreadsheetId}/values/${encodeURIComponent(resolvedName)}!A1?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        body: JSON.stringify({ values: [headers] })
      });
    } else {
      const normHeaders = headers.map(h => String(h || '').trim().toLowerCase());
      let headersChanged = false;
      
      // Special check for user sheet
      if (isUserSheet && !normHeaders.includes('zone')) {
        headers.push('zone');
        headersChanged = true;
      }
      
      // Dynamic columns healing for other sheets
      for (const key of Object.keys(record)) {
        const cleanKey = String(key || '').trim().toLowerCase();
        if (cleanKey && !normHeaders.includes(cleanKey)) {
          headers.push(key);
          headersChanged = true;
        }
      }
      
      if (headersChanged) {
        await this.request(`${spreadsheetId}/values/${encodeURIComponent(resolvedName)}!A1?valueInputOption=USER_ENTERED`, {
          method: 'PUT',
          body: JSON.stringify({ values: [headers] })
        });
      }
    }

    const row = headers.map(header => {
      const val = resolveSynonymValue(header, record);
      return (val && typeof val === 'object') ? JSON.stringify(val) : (val === undefined ? "" : val);
    });

    await this.request(`${spreadsheetId}/values/${encodeURIComponent(resolvedName)}!A1:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      body: JSON.stringify({ values: [row] })
    });

    return { success: true };
  },

  async saveBulk(sheetName: string, records: any[]): Promise<{ success: boolean; count: number }> {
    if (localStorage.getItem('BQOS_DEMO_MODE') === 'true') {
      this.saveOfflineBulk(sheetName, records);
      return { success: true, count: records.length };
    }

    if (!records || records.length === 0) return { success: true, count: 0 };
    
    const spreadsheetId = this.getSpreadsheetId();
    if (!spreadsheetId) throw new Error('SPREADSHEET_NOT_FOUND');

    await this.ensureSheetExists(sheetName);

    const metadata = await this.request(spreadsheetId);
    const resolvedName = this.resolveSynonymSheetNameClient(sheetName, metadata.sheets || []);

    const existingRows = await this.request(`${spreadsheetId}/values/${encodeURIComponent(resolvedName)}!A1:Z1`).catch(() => ({ values: [] }));
    let headers: string[] = (existingRows.values && existingRows.values[0]) || [];

    const normSheet = sheetName.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const normResolved = resolvedName.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const isUserSheet = normSheet.indexOf('USER') !== -1 || normResolved.indexOf('USER') !== -1;

    if (headers.length === 0) {
      if (normSheet.indexOf('MATERIAL') !== -1 || normResolved.indexOf('MATERIAL') !== -1) {
        headers = ['timestamp', 'receivedDate', 'checkingDate', 'grn', 'billNo', 'supplierName', 'itemName', 'style', 'receivedQuantity', 'checkedQuantity', 'passQuantity', 'rejectedQuantity', 'itemRemarks', 'generalRemarks', 'zone', 'inspector', 'id'];
      } else if (isUserSheet) {
        headers = ['userCode', 'username', 'password', 'role', 'location', 'zone', 'restrictions', 'canDownload'];
      } else {
        headers = Object.keys(records[0]);
      }
      await this.request(`${spreadsheetId}/values/${encodeURIComponent(resolvedName)}!A1?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        body: JSON.stringify({ values: [headers] })
      });
    } else if (isUserSheet) {
      const normHeaders = headers.map(h => String(h || '').trim().toLowerCase());
      if (normHeaders.indexOf('zone') === -1) {
        const nextColChar = String.fromCharCode(65 + headers.length);
        await this.request(`${spreadsheetId}/values/${encodeURIComponent(resolvedName)}!${nextColChar}1?valueInputOption=USER_ENTERED`, {
          method: 'PUT',
          body: JSON.stringify({ values: [['zone']] })
        });
        headers.push('zone');
      }
    }

    const rows = records.map(record => {
      if (!record.id && !record.workorderNumber) {
        record.id = generateUuid();
      }
      return headers.map(header => {
        const val = resolveSynonymValue(header, record);
        return (val && typeof val === 'object') ? JSON.stringify(val) : (val === undefined ? "" : val);
      });
    });

    await this.request(`${spreadsheetId}/values/${encodeURIComponent(resolvedName)}!A1:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      body: JSON.stringify({ values: rows })
    });

    return { success: true, count: rows.length };
  },

  async updateData(sheetName: string, record: any): Promise<{ success: boolean }> {
    if (localStorage.getItem('BQOS_DEMO_MODE') === 'true') {
      this.updateOfflineData(sheetName, record);
      return { success: true };
    }

    const spreadsheetId = this.getSpreadsheetId();
    if (!spreadsheetId) throw new Error('SPREADSHEET_NOT_FOUND');

    const metadata = await this.request(spreadsheetId);
    const resolvedName = this.resolveSynonymSheetNameClient(sheetName, metadata.sheets || [], record);

    const data = await this.request(`${spreadsheetId}/values/${encodeURIComponent(resolvedName)}!A1:Z5000`);
    if (!data.values || data.values.length === 0) return { success: false };

    const headers: string[] = data.values[0];
    const id = record.id || record.workorderNumber || record.userCode;
    
    const normHeaders = headers.map(h => String(h || '').toLowerCase().replace(/[^a-z0-9]/g, ''));
    let idIdx = normHeaders.indexOf('id');
    if (idIdx === -1) idIdx = normHeaders.indexOf('workordernumber');
    if (idIdx === -1) idIdx = normHeaders.indexOf('usercode');

    if (idIdx === -1) throw new Error('ID or Code column not found in database sheet');

    let matchedRowIndex = -1;
    for (let i = 1; i < data.values.length; i++) {
      if (String(data.values[i][idIdx]) === String(id)) {
        matchedRowIndex = i;
        break;
      }
    }

    if (matchedRowIndex === -1) {
      return await this.saveData(resolvedName, record);
    }

    const row = headers.map(header => {
      const val = resolveSynonymValue(header, record);
      return (val && typeof val === 'object') ? JSON.stringify(val) : (val === undefined ? "" : val);
    });

    const excelRow = matchedRowIndex + 1;
    await this.request(`${spreadsheetId}/values/${encodeURIComponent(resolvedName)}!A${excelRow}:Z${excelRow}?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      body: JSON.stringify({ values: [row] })
    });

    return { success: true };
  },

  async deleteData(sheetName: string, id: any): Promise<{ success: boolean }> {
    if (localStorage.getItem('BQOS_DEMO_MODE') === 'true') {
      this.deleteOfflineData(sheetName, id);
      return { success: true };
    }

    const spreadsheetId = this.getSpreadsheetId();
    if (!spreadsheetId) throw new Error('SPREADSHEET_NOT_FOUND');

    const metadata = await this.request(spreadsheetId);
    const resolvedName = this.resolveSynonymSheetNameClient(sheetName, metadata.sheets || []);

    const data = await this.request(`${spreadsheetId}/values/${encodeURIComponent(resolvedName)}!A1:Z5000`);
    if (!data.values || data.values.length === 0) return { success: false };

    const headers: string[] = data.values[0];
    
    const normHeaders = headers.map(h => String(h || '').toLowerCase().replace(/[^a-z0-9]/g, ''));
    let idIdx = normHeaders.indexOf('id');
    if (idIdx === -1) idIdx = normHeaders.indexOf('workordernumber');
    if (idIdx === -1) idIdx = normHeaders.indexOf('usercode');

    if (idIdx === -1) throw new Error('ID or Code column not found in spreadsheet');

    const filteredValues = [headers];
    let matched = false;

    for (let i = 1; i < data.values.length; i++) {
      if (String(data.values[i][idIdx]) === String(id)) {
        matched = true;
      } else {
        filteredValues.push(data.values[i]);
      }
    }

    if (!matched) return { success: false };

    await this.request(`${spreadsheetId}/values/${encodeURIComponent(resolvedName)}!A1:Z5000:clear`, {
      method: 'POST'
    });

    await this.request(`${spreadsheetId}/values/${encodeURIComponent(resolvedName)}!A1?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      body: JSON.stringify({ values: filteredValues })
    });

    return { success: true };
  },

  async getSettings(sheetName: string): Promise<any> {
    try {
      const isGlobal = (sheetName === 'GLOBAL' || sheetName === 'SETTINGS');
      let targetSheet = isGlobal ? 'SETTINGS' : sheetName;

      const records = await this.getData(targetSheet).catch(() => []);
      const categories = ['ZONE', 'SUPPLIER', 'ITEMS', 'COLOR', 'DEFECTS', 'WORKERS', 'MACHINE', 'OPERATION', 'SIZE', 'CUPSIZE', 'UNIT', 'LINE', 'STYLE_NAME'];
      const settings: any = {};
      categories.forEach(cat => settings[cat] = []);
      
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

      records.forEach(row => {
        categories.forEach(cat => {
          const aliases = ALIASES[cat as keyof typeof ALIASES] || [cat];
          let foundVal = undefined;
          
          for (const alias of aliases) {
            for (const rowKey of Object.keys(row)) {
              if (rowKey.toUpperCase().trim() === alias.toUpperCase()) {
                foundVal = row[rowKey];
                break;
              }
            }
            if (foundVal !== undefined) break;
          }
          
          if (foundVal !== undefined && foundVal !== null && foundVal !== "") {
            settings[cat].push(foundVal);
          }
        });
      });

      const isEmpty = Object.values(settings).every((arr: any) => arr.length === 0);
      if (isEmpty) {
        if (!isGlobal) {
          return await this.getSettings('SETTINGS');
        }
        return DEFAULT_SETTINGS;
      }
      return settings;
    } catch (e) {
      if (sheetName !== 'SETTINGS' && sheetName !== 'GLOBAL') {
        return await this.getSettings('SETTINGS');
      }
      return DEFAULT_SETTINGS;
    }
  },

  async saveSettings(sheetName: string, settings: any): Promise<{ success: boolean }> {
    const isGlobal = (sheetName === 'GLOBAL' || sheetName === 'SETTINGS');

    if (localStorage.getItem('BQOS_DEMO_MODE') === 'true') {
      if (!isGlobal) {
        const localUsers = await this.getData('USERS').catch(() => []);
        let found = false;
        localUsers.forEach((u: any) => {
          if (u.userCode === sheetName || u.username === sheetName) {
            u.settings = settings;
            found = true;
          }
        });
        if (found) {
          localStorage.setItem('bqos_local_sheet_USERS', JSON.stringify(localUsers));
        }
        return { success: true };
      }

      const categories = ['ZONE', 'SUPPLIER', 'ITEMS', 'COLOR', 'DEFECTS', 'WORKERS', 'MACHINE', 'OPERATION', 'SIZE', 'CUPSIZE', 'UNIT', 'LINE', 'STYLE_NAME'];
      let maxLen = 0;
      categories.forEach(cat => {
        if (settings[cat] && settings[cat].length > maxLen) maxLen = settings[cat].length;
      });

      const records: any[] = [];
      for (let i = 0; i < maxLen; i++) {
        const record: any = {};
        categories.forEach(cat => {
          const list = settings[cat];
          const val = list && list[i];
          record[cat] = val !== undefined && val !== null ? val : "";
        });
        records.push(record);
      }
      localStorage.setItem(`bqos_local_sheet_SETTINGS`, JSON.stringify(records));
      return { success: true };
    }

    if (!isGlobal) {
      const spreadsheetId = this.getSpreadsheetId();
      if (!spreadsheetId) throw new Error('SPREADSHEET_NOT_FOUND');

      await this.ensureSheetExists(sheetName);

      const categories = ['ZONE', 'SUPPLIER', 'ITEMS', 'COLOR', 'DEFECTS', 'WORKERS', 'MACHINE', 'OPERATION', 'SIZE', 'CUPSIZE', 'UNIT', 'LINE', 'STYLE_NAME'];

      let maxLen = 0;
      categories.forEach(cat => {
        if (settings[cat] && settings[cat].length > maxLen) maxLen = settings[cat].length;
      });

      const rows = [categories];
      for (let i = 0; i < maxLen; i++) {
         const row = categories.map(cat => {
           const val = settings[cat] && settings[cat][i];
           return val !== undefined && val !== null ? val : "";
         });
         rows.push(row);
      }

      await this.request(`${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:Z5000:clear`, {
        method: 'POST'
      });

      await this.request(`${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        body: JSON.stringify({ values: rows })
      });

      return { success: true };
    }

    const spreadsheetId = this.getSpreadsheetId();
    if (!spreadsheetId) throw new Error('SPREADSHEET_NOT_FOUND');

    await this.ensureSheetExists('SETTINGS');

    const categories = ['ZONE', 'SUPPLIER', 'ITEMS', 'COLOR', 'DEFECTS', 'WORKERS', 'MACHINE', 'OPERATION', 'SIZE', 'CUPSIZE', 'UNIT', 'LINE', 'STYLE_NAME'];

    let maxLen = 0;
    categories.forEach(cat => {
      if (settings[cat] && settings[cat].length > maxLen) maxLen = settings[cat].length;
    });

    const rows = [categories];
    for (let i = 0; i < maxLen; i++) {
       const row = categories.map(cat => {
         const val = settings[cat] && settings[cat][i];
         return val !== undefined && val !== null ? val : "";
       });
       rows.push(row);
    }

    await this.request(`${spreadsheetId}/values/SETTINGS!A1:Z5000:clear`, {
      method: 'POST'
    });

    await this.request(`${spreadsheetId}/values/SETTINGS!A1?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      body: JSON.stringify({ values: rows })
    });

    return { success: true };
  }
};
