/**
 * BQOS User Access Restrictions Helper
 * Ensures restriction codes are safely normalized and checked against modules and submodules
 */

export const normalizeRestrictions = (raw: any): string[] => {
  if (!raw) return [];
  let list: string[] = [];
  if (Array.isArray(raw)) {
    list = raw
      .flatMap(item => String(item).split(/[,;|\s]+/))
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);
  } else if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        list = parsed
          .flatMap(item => String(item).split(/[,;|\s]+/))
          .map(s => s.trim().toUpperCase())
          .filter(Boolean);
      }
    } catch (e) {}
    if (list.length === 0) {
      list = raw
        .split(/[,;|\s]+/)
        .map(s => s.trim().toUpperCase())
        .filter(Boolean);
    }
  }

  // Seamlessly remap legacy Module B codes ONLY IF B10 is present (indicating legacy 10-module data):
  // Old B7 (Inspectors) -> omitted
  // Old B8 (Workorders) -> B7
  // Old B9 (SOP & Audit Documents) -> B8
  // Old B10 (Customer Complaints) -> B9
  if (list.includes('B10')) {
    const remapped = list.map(code => {
      if (code === 'B7') return null;
      if (code === 'B8') return 'B7';
      if (code === 'B9') return 'B8';
      if (code === 'B10') return 'B9';
      return code;
    }).filter(Boolean) as string[];
    return Array.from(new Set(remapped));
  }

  return Array.from(new Set(list));
};

export const isModuleRestricted = (user: any, moduleId: string): boolean => {
  if (!user || user.role === 'ADMIN') return false;
  const restrictions = normalizeRestrictions(user?.restrictions);
  if (restrictions.length === 0) return false;

  const targetId = String(moduleId || '').trim().toUpperCase();
  const targetCategory = targetId.charAt(0);

  return restrictions.includes(targetId) || restrictions.includes(targetCategory);
};
