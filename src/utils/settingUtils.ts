import { ZONES, UNITS, SUPPLIERS, ITEMS, COLORS, SIZES, CUPSIZES, MACHINES, WORKERS, OPERATIONS, DEFECTS, STYLES, LINES } from '../constants';

/**
 * Universal setting parser that safely extracts an array of non-empty strings
 * from an array, newline-separated string, comma-separated string, or JSON array.
 * Always returns fallback if the extracted result is empty.
 */
export const parseSettingList = (val: any, fallback: string[] = []): string[] => {
  if (Array.isArray(val) && val.length > 0) {
    const cleaned = val.map(s => String(s || '').trim()).filter(Boolean);
    if (cleaned.length > 0) return cleaned;
  }
  if (typeof val === 'string' && val.trim()) {
    const trimmed = val.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.map(s => String(s || '').trim()).filter(Boolean);
          if (cleaned.length > 0) return cleaned;
        }
      } catch (e) {}
    }
    const parts = trimmed.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    if (parts.length > 0) return parts;
  }
  return fallback;
};

/**
 * Universal helper to match a database record against a target zone.
 * Prevents records from matching incorrect zones when empty unit mappings exist.
 */
export const isRecordMatchingZone = (
  r: any,
  targetZone: string,
  zoneRows: any[] = [],
  workorders: any[] = []
): boolean => {
  if (!r) return false;
  if (!targetZone || targetZone === 'ALL' || targetZone === 'SELECT...' || targetZone === '') return true;

  const clean = (s: string) => String(s || '').trim().toUpperCase().replace(/^(ZONE|UNIT|MODULE|ZMAP)[-\s]*/i, '').replace(/[^A-Z0-9]/g, '');
  const cTarget = clean(targetZone);
  if (!cTarget || cTarget === 'ALL') return true;

  let rZone = String(r.zone || r.location || '').trim().toUpperCase();
  let rUnit = String(r.unit || '').trim().toUpperCase();

  // 1. If zone missing on record, attempt resolution from associated workorder
  if (!rZone && (r.workorderNumber || r.wo) && Array.isArray(workorders) && workorders.length > 0) {
    const targetWo = String(r.workorderNumber || r.wo).trim();
    const matchWo = workorders.find((w: any) => String(w.workorderNumber || w.wo || w.id).trim() === targetWo);
    if (matchWo) {
      rZone = String(matchWo.zone || matchWo.location || '').trim().toUpperCase();
      if (!rUnit) rUnit = String(matchWo.unit || '').trim().toUpperCase();
    }
  }

  // 2. If still no zone, check if unit can resolve zone via zone mappings
  if (!rZone && rUnit && Array.isArray(zoneRows) && zoneRows.length > 0) {
    const cUnit = clean(rUnit);
    const matchedZm = zoneRows.find((zm: any) => {
      const u = clean(zm.unit || '');
      return u && (u === cUnit || u.includes(cUnit) || cUnit.includes(u));
    });
    if (matchedZm && matchedZm.zone) {
      rZone = String(matchedZm.zone).trim().toUpperCase();
    }
  }

  const KNOWN_ZONES = ['KERALA', 'TIRUPUR', 'BANGALORE'];
  const cZone = clean(rZone);
  const cUnit = clean(rUnit);

  // If the record is explicitly assigned to a known zone and target is a different known zone, it cannot match
  if (cZone && KNOWN_ZONES.includes(cZone) && KNOWN_ZONES.includes(cTarget) && cZone !== cTarget) {
    return false;
  }

  // Direct exact zone or unit match
  if (rZone === targetZone || rUnit === targetZone) return true;
  if (cZone && cZone === cTarget) return true;
  if (cUnit && cUnit === cTarget) return true;

  // Substring match for non-trivial strings (length >= 3)
  if (cZone && cZone.length >= 3 && (cZone.includes(cTarget) || cTarget.includes(cZone))) return true;
  if (cUnit && cUnit.length >= 3 && (cUnit.includes(cTarget) || cTarget.includes(cUnit))) return true;

  // 3. Check zone mappings: unit belongs to the target zone
  if (Array.isArray(zoneRows) && zoneRows.length > 0) {
    for (const zm of zoneRows) {
      const zmZone = clean(zm.zone || zm.id || '');
      const zmUnit = clean(zm.unit || '');

      // Guard: zmUnit MUST be non-empty string to avoid matching all records
      if (zmZone === cTarget && zmUnit && cUnit) {
        if (zmUnit === cUnit || zmUnit.includes(cUnit) || cUnit.includes(zmUnit)) {
          return true;
        }
      }

      if (zmUnit === cTarget && zmZone && cZone) {
        if (zmZone === cZone || zmZone.includes(cZone) || cZone.includes(zmZone)) {
          return true;
        }
      }
    }
  }

  return false;
};


/**
 * Extracts zones combining zoneMappings, cached zone mappings, settings, and defaults.
 * Guaranteed to NEVER return an empty array.
 */
export const getEffectiveZones = (settings?: any, zoneMappings: any[] = [], user?: any): string[] => {
  let effectiveUser = user;
  if (!effectiveUser) {
    try {
      const saved = localStorage.getItem('bqos_session');
      if (saved) effectiveUser = JSON.parse(saved);
    } catch (e) {}
  }

  // If user is not admin and has an assigned zone (e.g. "KERALA"), only that zone is shown
  if (effectiveUser && effectiveUser.role !== 'ADMIN') {
    const uZone = String(effectiveUser.zone || effectiveUser.location || '').trim().toUpperCase();
    if (uZone && uZone !== 'ALL' && uZone !== 'COMMON' && uZone !== 'SYSTEM') {
      return [uZone];
    }
  }

  // If settings.ZONE was restricted by server to 1 zone:
  if (settings?.ZONE && Array.isArray(settings.ZONE) && settings.ZONE.length === 1 && settings.ZONE[0] && settings.ZONE[0] !== 'ALL' && settings.ZONE[0] !== 'COMMON') {
    return settings.ZONE;
  }

  if (Array.isArray(zoneMappings) && zoneMappings.length > 0) {
    const fromMap = zoneMappings
      .filter((z: any) => String(z.zone || '').trim())
      .map((z: any) => String(z.zone).toUpperCase().trim())
      .filter((z: string) => z && !z.startsWith('ZMAP-'));
    const unique = Array.from(new Set(fromMap));
    if (unique.length > 0) return unique;
  }

  try {
    const cached = JSON.parse(localStorage.getItem('bqos_cache_zm') || '[]');
    if (Array.isArray(cached) && cached.length > 0) {
      const fromMap = cached
        .filter((z: any) => String(z.zone || '').trim())
        .map((z: any) => String(z.zone).toUpperCase().trim())
        .filter((z: string) => z && !z.startsWith('ZMAP-'));
      const unique = Array.from(new Set(fromMap));
      if (unique.length > 0) return unique;
    }
  } catch (e) {}

  const list = parseSettingList(settings?.ZONE || settings?.ZONES || settings?.zone, ZONES);
  const filtered = list.filter((z: string) => z && !z.toUpperCase().startsWith('ZMAP-') && z.toUpperCase() !== 'ALL');
  return filtered.length > 0 ? filtered : ZONES;
};

/**
 * Extracts units for a given zone or all units.
 * Guaranteed to NEVER return an empty array.
 */
export const getEffectiveUnits = (settings?: any, zoneMappings: any[] = [], targetZone?: string, user?: any): string[] => {
  let effectiveUser = user;
  if (!effectiveUser) {
    try {
      const saved = localStorage.getItem('bqos_session');
      if (saved) effectiveUser = JSON.parse(saved);
    } catch (e) {}
  }

  let zClean = targetZone ? String(targetZone).trim().toUpperCase() : '';
  if ((!zClean || zClean === 'ALL' || zClean === 'COMMON') && effectiveUser && effectiveUser.role !== 'ADMIN') {
    const uZone = String(effectiveUser.zone || effectiveUser.location || '').trim().toUpperCase();
    if (uZone && uZone !== 'ALL' && uZone !== 'COMMON' && uZone !== 'SYSTEM') {
      zClean = uZone;
    }
  }

  let zm = Array.isArray(zoneMappings) && zoneMappings.length > 0 ? zoneMappings : [];
  if (zm.length === 0) {
    try {
      const cached = JSON.parse(localStorage.getItem('bqos_cache_zm') || '[]');
      if (Array.isArray(cached) && cached.length > 0) zm = cached;
    } catch (e) {}
  }

  if (zm.length > 0 && zClean && zClean !== 'ALL' && zClean !== 'COMMON' && zClean !== 'SYSTEM') {
    const matched = zm.filter((z: any) => {
      const rZone = String(z.zone || z.id || '').toUpperCase().trim();
      return rZone === zClean || rZone.includes(zClean) || zClean.includes(rZone);
    });
    const fromMap = matched
      .filter((z: any) => String(z.unit || '').trim())
      .map((z: any) => String(z.unit).toUpperCase().trim())
      .filter(Boolean);
    const unique = Array.from(new Set(fromMap));
    if (unique.length > 0) return unique;
  }

  // If settings.UNIT has been restricted by server:
  if (settings?.UNIT && Array.isArray(settings.UNIT) && settings.UNIT.length > 0) {
    return settings.UNIT;
  }

  const list = parseSettingList(settings?.UNIT || settings?.UNITS || settings?.unit, UNITS);
  return list.length > 0 ? list : UNITS;
};

/**
 * Universal dropbox selector that extracts the options for any column
 * from the user's connected sheet settings, checking aliases and falling back
 * to the master list. Guaranteed to NEVER return an empty array if fallback is provided.
 */
export const getDropboxList = (settings: any, category: string, fallback: string[] = []): string[] => {
  if (!settings || typeof settings !== 'object') {
    return fallback;
  }

  const cleanCat = String(category || '').trim().toUpperCase();
  const ALIAS_MAP: Record<string, string[]> = {
    SUPPLIER: ['SUPPLIER', 'SUPPLIERS', 'SUPPLIER_NAME', 'SUPPLIER NAME', 'supplier', 'suppliers'],
    ITEMS: ['ITEMS', 'ITEM', 'ITEM_NAME', 'ITEM NAME', 'items', 'item', 'FABRIC', 'FABRICS'],
    STYLE_NAME: ['STYLE_NAME', 'STYLE NAME', 'STYLE', 'STYLES', 'STYLE_NAMES', 'STYLE NAMES', 'style', 'styles'],
    DEFECTS: ['DEFECTS', 'DEFECT', 'DEFECT_NAME', 'DEFECT NAME', 'defects', 'defect'],
    COLOR: ['COLOR', 'COLORS', 'COLOUR', 'COLOURS', 'color', 'colors'],
    SIZE: ['SIZE', 'SIZES', 'SIZE_RANGE', 'SIZE RANGE', 'size', 'sizes'],
    CUPSIZE: ['CUPSIZE', 'CUPSIZES', 'CUP', 'CUPS', 'cupsize', 'cupsizes'],
    MACHINE: ['MACHINE', 'MACHINES', 'MACHINE_NAME', 'MACHINE NAME', 'machine', 'machines'],
    OPERATION: ['OPERATION', 'OPERATIONS', 'OPERATION_NAME', 'OPERATION NAME', 'operation', 'operations'],
    LINE: ['LINE', 'LINES', 'LINE_NAME', 'LINE NAME', 'line', 'lines'],
    WORKERS: ['WORKERS', 'WORKER', 'WORKER_NAME', 'WORKER NAME', 'worker', 'workers', 'OPERATOR', 'OPERATORS'],
    UNIT: ['UNIT', 'UNITS', 'unit', 'units'],
    ZONE: ['ZONE', 'ZONES', 'zone', 'zones']
  };

  const USER_CUSTOMIZABLE_CATS = new Set(['STYLE_NAME', 'SIZE', 'CUPSIZE', 'COLOR', 'MACHINE', 'OPERATION', 'LINE', 'DEFECTS']);

  const lookupKeys = ALIAS_MAP[cleanCat] || [cleanCat, cleanCat.toLowerCase(), cleanCat + 'S'];
  for (const key of lookupKeys) {
    if (settings[key] !== undefined && settings[key] !== null) {
      if (Array.isArray(settings[key])) {
        const cleaned = settings[key].map((s: any) => String(s || '').trim()).filter(Boolean);
        // If it's a user-customizable category and was explicitly set as empty array, respect empty
        if (cleaned.length === 0 && USER_CUSTOMIZABLE_CATS.has(cleanCat)) {
          return [];
        }
        if (cleaned.length > 0) {
          if (cleaned.length <= 2 && (cleaned[0] === 'ITEM 1' || cleaned[0] === 'SUPPLIER A') && fallback.length > 2) {
            continue;
          }
          return cleaned;
        }
      } else if (typeof settings[key] === 'string') {
        const trimmed = settings[key].trim();
        if (!trimmed && USER_CUSTOMIZABLE_CATS.has(cleanCat)) {
          return [];
        }
        const parts = trimmed.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
        if (parts.length > 0) return parts;
        if (parts.length === 0 && USER_CUSTOMIZABLE_CATS.has(cleanCat)) return [];
      }
    }
  }

  // If this category is user-customizable and user settings are provided, default to empty if not given
  if (USER_CUSTOMIZABLE_CATS.has(cleanCat) && (settings.__isUserSettings || settings.__strictEmpty)) {
    return [];
  }

  return fallback;
};
