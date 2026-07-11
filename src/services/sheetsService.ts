import { getAccessToken } from './auth';

export function areSynonyms(h1: string, h2: string): boolean {
  if (!h1 || !h2) return false;
  const norm1 = h1.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
  const norm2 = h2.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (norm1 === norm2) return true;

  const groups = [
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

  for (const group of groups) {
    const hasNorm1 = group.includes(norm1);
    const hasNorm2 = group.includes(norm2);
    if (hasNorm1 && hasNorm2) return true;
  }
  return false;
}

export function resolveSynonymValue(header: string, record: any): any {
  if (!record) return "";
  const normHeader = header.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
  
  const groups = [
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

const OFFLINE_SEED_USERS = [
  { userCode: 'U001', username: 'user1', password: 'pass1', role: 'USER' as const, location: 'UNIT A', zone: 'SYSTEM', restrictions: [], canDownload: true },
  { userCode: 'A001', username: 'admin', password: 'admin123', role: 'ADMIN' as const, location: 'SYSTEM', zone: 'SYSTEM', restrictions: [], canDownload: true },
  { userCode: 'W001', username: 'wo1', password: '123', role: 'WORKORDER' as const, location: 'UNIT A', zone: 'SYSTEM', restrictions: [], canDownload: true }
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
    } else if (sheetName === 'ZONE') {
      initial = [];
    } else if (sheetName === 'WORKORDER') {
      initial = OFFLINE_SEED_WORKORDERS;
    } else if (sheetName === 'SETTINGS' || sheetName === 'GLOBAL') {
      initial = mapDefaultSettingsToRows();
    } else if (sheetName === 'INLINE' || sheetName === 'SEWING_DEFECT') {
      initial = [
        {
          id: "sew-offline-mock-01",
          zone: "KERALA",
          wo: "WO-2026-001",
          workorderNumber: "WO-2026-001",
          checkingDate: "2026-06-17",
          date: "2026-06-17",
          worker: "John Doe",
          machine: "M001",
          round: "9 TO 10",
          roundIndex: 1,
          checkedQty: 50,
          pcsChecked: 50,
          complaintPcs: 0,
          failQty: 0,
          remarks: "Stitches are clean and stable.",
          item: "ITEM 1",
          style: "Polo Shirt",
          color: "BLACK",
          line: "LINE 1",
          unit: "UNIT A",
          inspector: "admin",
          timestamp: "2026-06-17T09:12:00.000Z"
        },
        {
          id: "sew-offline-mock-02",
          zone: "KERALA",
          wo: "WO-2026-001",
          workorderNumber: "WO-2026-001",
          checkingDate: "2026-06-17",
          date: "2026-06-17",
          worker: "John Doe",
          machine: "M001",
          round: "10 TO 11",
          roundIndex: 2,
          checkedQty: 48,
          pcsChecked: 48,
          complaintPcs: 1,
          failQty: 1,
          remarks: "1 puckering issue corrected on collar attachment.",
          item: "ITEM 1",
          style: "Polo Shirt",
          color: "BLACK",
          line: "LINE 1",
          unit: "UNIT A",
          inspector: "admin",
          timestamp: "2026-06-17T10:15:00.000Z"
        },
        {
          id: "sew-offline-mock-03",
          zone: "KERALA",
          wo: "WO-2026-001",
          workorderNumber: "WO-2026-001",
          checkingDate: "2026-06-17",
          date: "2026-06-17",
          worker: "John Doe",
          machine: "M001",
          round: "11 TO 12",
          roundIndex: 3,
          checkedQty: 52,
          pcsChecked: 52,
          complaintPcs: 0,
          failQty: 0,
          remarks: "Running steady, excellent tension.",
          item: "ITEM 1",
          style: "Polo Shirt",
          color: "BLACK",
          line: "LINE 1",
          unit: "UNIT A",
          inspector: "admin",
          timestamp: "2026-06-17T11:20:00.000Z"
        },
        {
          id: "sew-offline-mock-04",
          zone: "KERALA",
          wo: "WO-2026-001",
          workorderNumber: "WO-2026-001",
          checkingDate: "2026-06-17",
          date: "2026-06-17",
          worker: "John Doe",
          machine: "M001",
          round: "12 TO 1.30",
          roundIndex: 4,
          checkedQty: 50,
          pcsChecked: 50,
          complaintPcs: 0,
          failQty: 0,
          remarks: "Operations clean.",
          item: "ITEM 1",
          style: "Polo Shirt",
          color: "BLACK",
          line: "LINE 1",
          unit: "UNIT A",
          inspector: "admin",
          timestamp: "2026-06-17T12:30:00.000Z"
        },
        {
          id: "sew-offline-mock-05",
          zone: "KERALA",
          wo: "WO-2026-001",
          workorderNumber: "WO-2026-001",
          checkingDate: "2026-06-17",
          date: "2026-06-17",
          worker: "John Doe",
          machine: "M001",
          round: "1.30 TO 2.30",
          roundIndex: 5,
          checkedQty: 49,
          pcsChecked: 49,
          complaintPcs: 1,
          failQty: 1,
          remarks: "1 needle skipped stitch, needle replaced.",
          item: "ITEM 1",
          style: "Polo Shirt",
          color: "BLACK",
          line: "LINE 1",
          unit: "UNIT A",
          inspector: "admin",
          timestamp: "2026-06-17T14:12:00.000Z"
        },
        {
          id: "sew-offline-mock-06",
          zone: "KERALA",
          wo: "WO-2026-001",
          workorderNumber: "WO-2026-001",
          checkingDate: "2026-06-17",
          date: "2026-06-17",
          worker: "John Doe",
          machine: "M001",
          round: "2.30 TO 3.30",
          roundIndex: 6,
          checkedQty: 51,
          pcsChecked: 51,
          complaintPcs: 0,
          failQty: 0,
          remarks: "No issues observed.",
          item: "ITEM 1",
          style: "Polo Shirt",
          color: "BLACK",
          line: "LINE 1",
          unit: "UNIT A",
          inspector: "admin",
          timestamp: "2026-06-17T15:10:00.000Z"
        },
        {
          id: "sew-offline-mock-07",
          zone: "KERALA",
          wo: "WO-2026-001",
          workorderNumber: "WO-2026-001",
          checkingDate: "2026-06-17",
          date: "2026-06-17",
          worker: "John Doe",
          machine: "M001",
          round: "3.30 TO 4.30",
          roundIndex: 7,
          checkedQty: 48,
          pcsChecked: 48,
          complaintPcs: 0,
          failQty: 0,
          remarks: "Consistent stitch spacing.",
          item: "ITEM 1",
          style: "Polo Shirt",
          color: "BLACK",
          line: "LINE 1",
          unit: "UNIT A",
          inspector: "admin",
          timestamp: "2026-06-17T16:15:00.000Z"
        },
        {
          id: "sew-offline-mock-08",
          zone: "KERALA",
          wo: "WO-2026-001",
          workorderNumber: "WO-2026-001",
          checkingDate: "2026-06-17",
          date: "2026-06-17",
          worker: "John Doe",
          machine: "M001",
          round: "4.30 TO 5.30",
          roundIndex: 8,
          checkedQty: 50,
          pcsChecked: 50,
          complaintPcs: 0,
          failQty: 0,
          remarks: "Finished daily rounds.",
          item: "ITEM 1",
          style: "Polo Shirt",
          color: "BLACK",
          line: "LINE 1",
          unit: "UNIT A",
          inspector: "admin",
          timestamp: "2026-06-17T17:15:00.000Z"
        }
      ];
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
    
    const idx = current.findIndex(item => {
      if (record.userCode && item.userCode) {
        return String(item.userCode) === String(record.userCode);
      }
      if (record.id && item.id) {
        return String(item.id) === String(record.id);
      }
      if (record.workorderNumber && item.workorderNumber) {
        return String(item.workorderNumber) === String(record.workorderNumber);
      }
      return false;
    });

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
    const existing = metadata.sheets?.some((s: any) => String(s.properties?.title || '').toUpperCase().trim() === String(sheetName).toUpperCase().trim());

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
      'MATERIAL': [
        'MATERIAL', 'MATERIAL REPORT', 'MATERIAL QUALITY', 'STORE MATERIAL INSPECTION DATA', 'MATERIAL INSPECTION',
        'MATERIAL - KERALA', 'MATERIAL - TIRUPUR', 'MATERIAL - BANGLORE',
        'MATERIAL REPORT - KERALA', 'MATERIAL REPORT - TIRUPUR', 'MATERIAL REPORT - BANGLORE',
        'MATERIAL QUALITY - KERALA', 'MATERIAL QUALITY - TIRUPUR', 'MATERIAL QUALITY - BANGLORE',
        'MATERIAL REPORT KERALA', 'MATERIAL REPORT TIRUPUR', 'MATERIAL REPORT BANGLORE'
      ],
      'CUTTING': ['CUTTING', 'CUTTING QUALITY', 'CUTTING REPORT', 'CUTTING - KERALA', 'CUTTING - TIRUPUR', 'CUTTING - BANGLORE'],
      'INLINE': ['INLINE', 'INLINE REPORT', 'INLINE QUALITY', 'SEWING DEFECT', 'SEWING DEFECTS', 'INLINE - KERALA', 'INLINE - TIRUPUR', 'INLINE - BANGLORE', '8ROUND SYSTEM', '8ROUND SYSTEM - KERALA', '8ROUND SYSTEM - TIRUPUR', '8ROUND SYSTEM - BANGLORE', '8ROUND_SYSTEM', '8 ROUND SYSTEM', '8ROUND', '8 ROUNDS'],
      'ENDLINE': ['ENDLINE', 'ENDLINE QUALITY', 'ENDLINE REPORT', 'ENDLINE - KERALA', 'ENDLINE - TIRUPUR', 'ENDLINE - BANGLORE'],
      'AQL': ['AQL', 'AQL REPORT', 'AQL INSPECTION', 'AQL - KERALA', 'AQL - TIRUPUR', 'AQL - BANGLORE'],
      'FINAL AUDIT': ['FINAL AUDIT', 'FINAL AUDIT REPORT', 'FINAL REPORT', 'FINAL', 'FINAL - KERALA', 'FINAL - TIRUPUR', 'FINAL - BANGLORE'],
      'WORKORDER': ['WORKORDER', 'WORKORDERS', 'WORK ORDER', 'WORKORDERS - KERALA', 'WORKORDER - KERALA', 'WORKORDER - TIRUPUR', 'WORKORDER - BANGLORE'],
      'REPORTS_SOP': ['REPORTS_SOP', 'REPORTS - SOP', 'SOP REPORTS', 'SOP_REPORTS', 'REPORTS & SOPS', 'REPORTS', 'SOPS'],
      'ZONE': ['ZONE', 'ZONES'],
      'REWORK': ['REWORK', 'REWORK REPORT', 'REWORK QUALITY', 'REWORK - KERALA', 'REWORK - TIRUPUR', 'REWORK - BANGLORE']
    };

    const canonicalKeys: { [key: string]: string } = {
      'REWORK': 'REWORK',
      'REWORK REPORT': 'REWORK',
      'REWORK QUALITY': 'REWORK',
      'MATERIAL': 'MATERIAL',
      'MATERIAL REPORT': 'MATERIAL',
      'MATERIAL QUALITY KERALA': 'MATERIAL',
      'MATERIAL QUALITY TIRUPUR': 'MATERIAL',
      'MATERIAL QUALITY BANGLORE': 'MATERIAL',
      'MATERIAL QUALITY': 'MATERIAL',
      'STORE MATERIAL INSPECTION DATA': 'MATERIAL',
      'MATERIAL INSPECTION': 'MATERIAL',
      'CUTTING': 'CUTTING',
      'CUTTING QUALITY': 'CUTTING',
      'CUTTING REPORT': 'CUTTING',
      'INLINE': 'INLINE',
      'INLINE REPORT': 'INLINE',
      'INLINE QUALITY': 'INLINE',
      'SEWING DEFECT': 'INLINE',
      'SEWING DEFECTS': 'INLINE',
      'ENDLINE': 'ENDLINE',
      'ENDLINE QUALITY': 'ENDLINE',
      'ENDLINE REPORT': 'ENDLINE',
      'AQL': 'AQL',
      'AQL REPORT': 'AQL',
      'AQL INSPECTION': 'AQL',
      'FINAL': 'FINAL AUDIT',
      'FINAL AUDIT': 'FINAL AUDIT',
      'FINAL AUDIT REPORT': 'FINAL AUDIT',
      'FINAL REPORT': 'FINAL AUDIT',
      '8ROUND': 'INLINE',
      '8 ROUNDS': 'INLINE',
      '8ROUND_SYSTEM': 'INLINE',
      '8 ROUND SYSTEM': 'INLINE',
      '8ROUND SYSTEM': 'INLINE',
      'REPORTS': 'REPORTS_SOP',
      'SOP REPORTS': 'REPORTS_SOP',
      'SOPS': 'REPORTS_SOP',
      'REPORTS & SOPS': 'REPORTS_SOP',
      'WORKORDER': 'WORKORDER',
      'WORKORDERS': 'WORKORDER',
      'WORK ORDER': 'WORKORDER'
    };

    let baseName = sheetName;
    const hyphenIdx = sheetName.indexOf(' - ');
    if (hyphenIdx !== -1) {
      baseName = sheetName.slice(0, hyphenIdx);
    }

    const normBase = baseName.toUpperCase().trim();
    if (canonicalKeys[normBase]) {
      baseName = canonicalKeys[normBase];
    } else if (canonicalKeys[baseName]) {
      baseName = canonicalKeys[baseName];
    }

    const normalizedBase = String(baseName || '').trim().toUpperCase();
    const userSynonyms = ['USERS', 'USER', 'SERVER USERS', 'USERLOGIN DETAILS', 'USERLOGIN', 'USER LOGIN', 'USER_LOGIN', 'USER_LOGIN_DETAILS', 'USERLOGIN_DETAILS', 'SERVER_USERS'];
    const isUserSheet = userSynonyms.includes(normalizedBase);
    if (isUserSheet || normalizedBase === 'SETTINGS' || normalizedBase === 'GLOBAL' || normalizedBase === 'ADMIN' || normalizedBase === 'ZONE' || normalizedBase === 'UNIT') {
      if (isUserSheet) return 'USERS';
      if (normalizedBase === 'SETTINGS' || normalizedBase === 'GLOBAL') return 'SETTINGS';
      if (normalizedBase === 'ADMIN') return 'ADMIN';
      if (normalizedBase === 'ZONE') return 'ZONE';
      if (normalizedBase === 'UNIT') return 'UNIT';
      const synonyms = synonymsMap[baseName];
      if (synonyms) {
        for (const syn of synonyms) {
          if (titleList.includes(syn)) return syn;
        }
      }
      return baseName;
    }

    // Restore zone-routing for A1-A6 modules (e.g. MATERIAL, CUTTING, etc)
    const zoneRouteModules = ['MATERIAL', 'CUTTING', 'INLINE', 'ENDLINE', 'AQL', 'FINAL AUDIT', 'WORKORDER', 'REWORK'];
    if (zoneRouteModules.includes(baseName)) {
      const rawZone = record?.zone || record?.location;
      const zone = String(rawZone || '').trim().toUpperCase();
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

      const canonicalKeys: { [key: string]: string } = {
        'MATERIAL': 'MATERIAL',
        'MATERIAL REPORT': 'MATERIAL',
        'MATERIAL QUALITY': 'MATERIAL',
        'CUTTING': 'CUTTING',
        'CUTTING QUALITY': 'CUTTING',
        'CUTTING REPORT': 'CUTTING',
        'INLINE': 'INLINE',
        'INLINE REPORT': 'INLINE',
        'INLINE QUALITY': 'INLINE',
        'ENDLINE': 'ENDLINE',
        'ENDLINE QUALITY': 'ENDLINE',
        'ENDLINE REPORT': 'ENDLINE',
        'AQL': 'AQL',
        'AQL REPORT': 'AQL',
        'AQL INSPECTION': 'AQL',
        'FINAL': 'FINAL AUDIT',
        'FINAL AUDIT': 'FINAL AUDIT',
        'FINAL AUDIT REPORT': 'FINAL AUDIT',
        'FINAL REPORT': 'FINAL AUDIT',
        'WORKORDER': 'WORKORDER',
        'WORKORDERS': 'WORKORDER',
        'WORK ORDER': 'WORKORDER',
        'REPORTS_SOP': 'REPORTS_SOP',
        'ZONE': 'ZONE',
        'REWORK': 'REWORK',
        'REWORK REPORT': 'REWORK',
        'REWORK QUALITY': 'REWORK'
      };

      const normBase = sheetName.toUpperCase().trim();
      const canonicalName = canonicalKeys[normBase] || sheetName;

      const synonymsMap: { [key: string]: string[] } = {
        'USERS': ['USERS'],
        'MATERIAL': [
          'MATERIAL', 'MATERIAL - KERALA', 'MATERIAL - TIRUPUR', 'MATERIAL - BANGLORE',
          'MATERIAL REPORT', 'MATERIAL QUALITY', 'MATERIAL INSPECTION', 'STORE MATERIAL INSPECTION DATA',
          'MATERIAL REPORT - KERALA', 'MATERIAL REPORT - TIRUPUR', 'MATERIAL REPORT - BANGLORE',
          'MATERIAL QUALITY - KERALA', 'MATERIAL QUALITY - TIRUPUR', 'MATERIAL QUALITY - BANGLORE',
          'MATERIAL REPORT KERALA', 'MATERIAL REPORT TIRUPUR', 'MATERIAL REPORT BANGLORE'
        ],
        'CUTTING': ['CUTTING', 'CUTTING QUALITY', 'CUTTING REPORT', 'CUTTING - KERALA', 'CUTTING - TIRUPUR', 'CUTTING - BANGLORE'],
        'INLINE': ['INLINE', 'INLINE REPORT', 'INLINE QUALITY', 'SEWING DEFECT', 'SEWING DEFECTS', 'INLINE - KERALA', 'INLINE - TIRUPUR', 'INLINE - BANGLORE', '8ROUND SYSTEM', '8ROUND SYSTEM - KERALA', '8ROUND SYSTEM - TIRUPUR', '8ROUND SYSTEM - BANGLORE', '8ROUND_SYSTEM', '8 ROUND SYSTEM', '8ROUND', '8 ROUNDS'],
        'ENDLINE': ['ENDLINE', 'ENDLINE QUALITY', 'ENDLINE REPORT', 'ENDLINE - KERALA', 'ENDLINE - TIRUPUR', 'ENDLINE - BANGLORE'],
        'AQL': ['AQL', 'AQL REPORT', 'AQL INSPECTION', 'AQL - KERALA', 'AQL - TIRUPUR', 'AQL - BANGLORE'],
        'FINAL AUDIT': ['FINAL AUDIT', 'FINAL AUDIT REPORT', 'FINAL REPORT', 'FINAL', 'FINAL - KERALA', 'FINAL - TIRUPUR', 'FINAL - BANGLORE'],
        'WORKORDER': ['WORKORDER', 'WORKORDERS', 'WORK ORDER', 'WORKORDER - KERALA', 'WORKORDER - TIRUPUR', 'WORKORDER - BANGLORE'],
        'REPORTS_SOP': ['REPORTS_SOP', 'REPORTS - SOP', 'SOP REPORTS', 'SOP_REPORTS', 'REPORTS & SOPS', 'REPORTS', 'SOPS'],
        'ZONE': ['ZONE', 'ZONES'],
        'REWORK': ['REWORK', 'REWORK REPORT', 'REWORK QUALITY', 'REWORK - KERALA', 'REWORK - TIRUPUR', 'REWORK - BANGLORE']
      };

      const possibleNames = synonymsMap[canonicalName] || [sheetName];
      let allValues: any[] = [];
      const seenIds = new Set();

      // Find all matching sheets inside the spreadsheet for aggregation
      const matchingTitles = sheetTitles.filter((title: string) => {
        const uTitle = title.toUpperCase().trim();
        if (canonicalName === 'USERS' || canonicalName === 'SETTINGS' || canonicalName === 'ADMIN') {
          return uTitle === canonicalName;
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
              if (normKey === 'zone' || normKey === 'zones' || normKey === 'zonename' || normKey === 'zonenames') {
                record['zone'] = val;
                if (!hasLocationCol && record['location'] === undefined) {
                  record['location'] = val;
                }
              }
              if (normKey === 'restrictions') record['restrictions'] = val;
              if (normKey === 'candownload') record['canDownload'] = val;

              if (normKey === 'workordernumber' || normKey === 'workorderno' || normKey === 'wo' || normKey === 'wonum' || normKey === 'wonumber' || normKey === 'workorder') record['workorderNumber'] = val;
              if (normKey === 'orderqty' || normKey === 'qty' || normKey === 'quantity') {
                record['orderQty'] = val;
                record['quantity'] = val;
              }
              if (normKey === 'style' || normKey === 'stylename') {
                record['style'] = val;
                record['styleName'] = val;
              }
              if (normKey === 'size' || normKey === 'sizes') {
                record['size'] = val;
              }
              if (normKey === 'cup' || normKey === 'cupsize' || normKey === 'cups') {
                record['cup'] = val;
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
              if (normKey === 'roundindex' || normKey === 'roundidx') {
                record['roundIndex'] = parseInt(val, 10) || 0;
              }
              if (normKey === 'checkingdate' || normKey === 'checkingDate' || normKey === 'date' || normKey === 'checkingdatetime') {
                record['checkingDate'] = val;
                record['date'] = val;
              }
              if (normKey === 'checkedqty' || normKey === 'pcschecked' || normKey === 'pieceschecked') {
                record['checkedQty'] = parseInt(val, 10) || 0;
                record['pcsChecked'] = parseInt(val, 10) || 0;
              }
              if (normKey === 'complaintpcs' || normKey === 'failqty' || normKey === 'failedpieces') {
                record['complaintPcs'] = parseInt(val, 10) || 0;
                record['failQty'] = parseInt(val, 10) || 0;
              }
            }

            let uniqueId = undefined;
            if (sheetName === 'USERS') {
              uniqueId = record.id || record.userCode;
            } else if (sheetName === 'WORKORDER') {
              uniqueId = record.id || record.workorderNumber;
            } else {
              uniqueId = record.id;
            }

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

    const metadata = await this.request(spreadsheetId);
    const resolvedName = this.resolveSynonymSheetNameClient(sheetName, metadata.sheets || [], record);

    await this.ensureSheetExists(resolvedName);

    const existingRows = await this.request(`${spreadsheetId}/values/${encodeURIComponent(resolvedName)}!A1:Z1`).catch(() => ({ values: [] }));
    let headers: string[] = (existingRows.values && existingRows.values[0]) || [];

    const normSheet = sheetName.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const normResolved = resolvedName.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const userSynonyms = ['USERS', 'USER', 'SERVER USERS', 'USERLOGIN DETAILS', 'USERLOGIN', 'USER LOGIN', 'USER_LOGIN', 'USER_LOGIN_DETAILS', 'USERLOGIN_DETAILS', 'SERVER_USERS'];
    const isUserSheet = userSynonyms.includes(normSheet) || userSynonyms.includes(normResolved);

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
        let hasSynonym = false;
        for (const h of headers) {
          if (areSynonyms(h, key)) {
            hasSynonym = true;
            break;
          }
        }
        if (key && !hasSynonym) {
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

    const metadata = await this.request(spreadsheetId);
    const resolvedName = this.resolveSynonymSheetNameClient(sheetName, metadata.sheets || [], records[0]);

    await this.ensureSheetExists(resolvedName);

    const existingRows = await this.request(`${spreadsheetId}/values/${encodeURIComponent(resolvedName)}!A1:Z1`).catch(() => ({ values: [] }));
    let headers: string[] = (existingRows.values && existingRows.values[0]) || [];

    const normSheet = sheetName.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const normResolved = resolvedName.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const userSynonyms = ['USERS', 'USER', 'SERVER USERS', 'USERLOGIN DETAILS', 'USERLOGIN', 'USER LOGIN', 'USER_LOGIN', 'USER_LOGIN_DETAILS', 'USERLOGIN_DETAILS', 'SERVER_USERS'];
    const isUserSheet = userSynonyms.includes(normSheet) || userSynonyms.includes(normResolved);

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
    if (idIdx === -1) idIdx = normHeaders.indexOf('workorderno');
    if (idIdx === -1) idIdx = normHeaders.indexOf('wo');
    if (idIdx === -1) idIdx = normHeaders.indexOf('wonum');
    if (idIdx === -1) idIdx = normHeaders.indexOf('wonumber');
    if (idIdx === -1) idIdx = normHeaders.indexOf('workorder');
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
    if (idIdx === -1) idIdx = normHeaders.indexOf('workorderno');
    if (idIdx === -1) idIdx = normHeaders.indexOf('wo');
    if (idIdx === -1) idIdx = normHeaders.indexOf('wonum');
    if (idIdx === -1) idIdx = normHeaders.indexOf('wonumber');
    if (idIdx === -1) idIdx = normHeaders.indexOf('workorder');
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
      
      const spreadsheetId = this.getSpreadsheetId();
      let sheetTitles: string[] = [];
      if (spreadsheetId) {
        try {
          const metadata = await this.request(spreadsheetId);
          sheetTitles = (metadata.sheets || []).map((s: any) => String(s.properties?.title || '').trim().toUpperCase());
        } catch (err) {
          console.error("Failed to get spreadsheet metadata in getSettings:", err);
        }
      }

      let targetSheet = isGlobal ? 'SETTINGS' : sheetName;

      if (!isGlobal) {
        // Search in local USERS sheet first
        const users = await this.getData('USERS').catch(() => []);
        const user = users.find(u => String(u.userCode || '').trim() === String(sheetName).trim() || String(u.username || '').trim() === String(sheetName).trim());
        if (user) {
          // If the user belongs to a specific zone/location, check if there are zone-specific settings
          const userZone = user.location || user.zone;
          if (userZone && userZone !== 'ALL' && userZone !== 'SYSTEM') {
            const zonedSettings = await this.getSettings('SETTINGS - ' + userZone.toUpperCase()).catch(() => null);
            if (zonedSettings) return zonedSettings;
          }

          const uSheetName = String(sheetName || '').trim().toUpperCase();
          const uUsername = String(user.username || '').trim().toUpperCase();
          const hasUserSheet = sheetTitles.includes(uSheetName) || (user.username && sheetTitles.includes(uUsername));

          if (!hasUserSheet) {
            const rawSettings = user.userSettings || user.settings;
            if (rawSettings) {
              try {
                const val = typeof rawSettings === 'string' ? JSON.parse(rawSettings) : rawSettings;
                if (val && typeof val === 'object') {
                  return val;
                }
              } catch (pErr) {
                console.error("Error parsing user.settings from local users:", pErr);
              }
            }
          } else {
            targetSheet = sheetTitles.includes(uSheetName) ? sheetName : user.username;
          }
        }
      }

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

      let finalSettings = settings;
      if (!isGlobal) {
        const globalSettings = await this.getSettings('SETTINGS').catch(() => ({}));
        categories.forEach(cat => {
          if (!settings[cat] || settings[cat].length === 0) {
            settings[cat] = globalSettings[cat] || [];
          }
        });
        finalSettings = settings;
      } else {
        const isEmpty = Object.values(settings).every((arr: any) => arr.length === 0);
        if (isEmpty) {
          finalSettings = { ...DEFAULT_SETTINGS };
        }
      }

       try {
        const zoneRows = await this.getData('ZONE').catch(() => []);
        
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

        const validZoneRows = zoneRows.filter((r: any) => {
          let z = String(r.zone || '').trim().toUpperCase();
          if (z.startsWith('ZMAP-')) {
            z = zoneIdToNameMap.get(z) || z;
          }
          return z && !z.startsWith('ZMAP-');
        });

        const dynamicZones = Array.from(
          new Set(
            validZoneRows.map((r: any) => {
              let z = String(r.zone || '').trim().toUpperCase();
              if (z.startsWith('ZMAP-')) {
                z = zoneIdToNameMap.get(z) || z;
              }
              return z;
            }).filter(z => z && !z.startsWith('ZMAP-'))
          )
        );

        const dynamicUnits = Array.from(
          new Set(
            validZoneRows
              .filter((r: any) => String(r.unit || '').trim())
              .map((r: any) => String(r.unit || '').trim().toUpperCase())
              .filter(Boolean)
          )
        );

        finalSettings = {
          ...finalSettings as any,
          ZONE: dynamicZones.length > 0 ? (dynamicZones as string[]) : (finalSettings.ZONE && finalSettings.ZONE.length > 0 ? finalSettings.ZONE : []),
          ZONES: dynamicZones.length > 0 ? (dynamicZones as string[]) : (finalSettings.ZONES && finalSettings.ZONES.length > 0 ? finalSettings.ZONES : []),
          UNIT: dynamicUnits.length > 0 ? (dynamicUnits as string[]) : (finalSettings.UNIT && finalSettings.UNIT.length > 0 ? finalSettings.UNIT : []),
          UNITS: dynamicUnits.length > 0 ? (dynamicUnits as string[]) : (finalSettings.UNITS && finalSettings.UNITS.length > 0 ? finalSettings.UNITS : [])
        };
      } catch (zoneErr) {
        console.error("Failed to load dynamic zones/units:", zoneErr);
      }

      return finalSettings;
    } catch (e) {
      if (sheetName !== 'SETTINGS' && sheetName !== 'GLOBAL') {
        return await this.getSettings('SETTINGS');
      }
      
      let fallback: any = { ...DEFAULT_SETTINGS };
      try {
        const zoneRows = await this.getData('ZONE').catch(() => []);
        
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

        const validZoneRows = zoneRows.filter((r: any) => {
          let z = String(r.zone || '').trim().toUpperCase();
          if (z.startsWith('ZMAP-')) {
            z = zoneIdToNameMap.get(z) || z;
          }
          return z && !z.startsWith('ZMAP-');
        });

        const dynamicZones = Array.from(
          new Set(
            validZoneRows.map((r: any) => {
              let z = String(r.zone || '').trim().toUpperCase();
              if (z.startsWith('ZMAP-')) {
                z = zoneIdToNameMap.get(z) || z;
              }
              return z;
            }).filter(z => z && !z.startsWith('ZMAP-'))
          )
        );

        const dynamicUnits = Array.from(
          new Set(
            validZoneRows
              .filter((r: any) => String(r.unit || '').trim())
              .map((r: any) => String(r.unit || '').trim().toUpperCase())
              .filter(Boolean)
          )
        );

        fallback = {
          ...fallback as any,
          ZONE: dynamicZones.length > 0 ? (dynamicZones as string[]) : (fallback.ZONE && fallback.ZONE.length > 0 ? fallback.ZONE : []),
          ZONES: dynamicZones.length > 0 ? (dynamicZones as string[]) : (fallback.ZONES && fallback.ZONES.length > 0 ? fallback.ZONES : []),
          UNIT: dynamicUnits.length > 0 ? (dynamicUnits as string[]) : (fallback.UNIT && fallback.UNIT.length > 0 ? fallback.UNIT : []),
          UNITS: dynamicUnits.length > 0 ? (dynamicUnits as string[]) : (fallback.UNITS && fallback.UNITS.length > 0 ? fallback.UNITS : [])
        };
      } catch (zErr) {}
      return fallback;
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
            u.settings = typeof settings === 'string' ? settings : JSON.stringify(settings);
            found = true;
          }
        });
        if (found) {
          localStorage.setItem('bqos_local_sheet_USERS', JSON.stringify(localUsers));
        }

        // Also save to separate local sheet for the user
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
        localStorage.setItem(`bqos_local_sheet_${sheetName.toUpperCase()}`, JSON.stringify(records));
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
      // 1. Save locally to USERS row as fallback/compatibility
      try {
        const users = await this.getData('USERS');
        const user = users.find(u => String(u.userCode || '').trim() === String(sheetName).trim() || String(u.username || '').trim() === String(sheetName).trim());
        if (user) {
          user.userSettings = typeof settings === 'string' ? JSON.parse(settings) : settings;
          user.settings = typeof settings === 'string' ? settings : JSON.stringify(settings);
          await this.updateData('USERS', user);
        }
      } catch (e) {
        console.warn("Failed to update fallback USERS settings cell:", e);
      }

      // 2. Feed directly to the dedicated sheet for this user!
      const targetSheetName = sheetName;
      const spreadsheetId = this.getSpreadsheetId();
      if (!spreadsheetId) throw new Error('SPREADSHEET_NOT_FOUND');

      await this.ensureSheetExists(targetSheetName);

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

      await this.request(`${spreadsheetId}/values/${encodeURIComponent(targetSheetName)}!A1:Z5000:clear`, {
        method: 'POST'
      });

      await this.request(`${spreadsheetId}/values/${encodeURIComponent(targetSheetName)}!A1?valueInputOption=USER_ENTERED`, {
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
  },

  async uploadFileToDrive(file: File, customName?: string): Promise<string> {
    const accessToken = getAccessToken();
    if (!accessToken) throw new Error('Authorization required to upload to Google Drive.');

    const name = customName || file.name;
    const metadata = {
      name: name,
      mimeType: file.type || 'application/octet-stream'
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink';
    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: form
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google Drive upload failed: ${errText}`);
    }

    const resJson = await res.json();
    const fileId = resJson.id;

    // Set permissions to reader for anyone (optional/graceful)
    try {
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone'
        })
      });
    } catch (permErr) {
      console.warn("Failed to set public reader permission on Drive file:", permErr);
    }

    return resJson.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;
  }
};
