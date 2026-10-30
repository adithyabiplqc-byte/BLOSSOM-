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

  // Map legacy B10 to modern B9 without erasing B7
  if (list.includes('B10')) {
    list = list.map(code => code === 'B10' ? 'B9' : code);
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
