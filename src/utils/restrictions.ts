/**
 * BQOS User Access Restrictions Helper
 * Ensures restriction codes are safely normalized and checked against modules and submodules
 */

export const normalizeRestrictions = (raw: any): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .flatMap(item => String(item).split(/[,;|\s]+/))
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .flatMap(item => String(item).split(/[,;|\s]+/))
          .map(s => s.trim().toUpperCase())
          .filter(Boolean);
      }
    } catch (e) {}
    return raw
      .split(/[,;|\s]+/)
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);
  }
  return [];
};

export const isModuleRestricted = (user: any, moduleId: string): boolean => {
  if (!user || user.role === 'ADMIN') return false;
  const restrictions = normalizeRestrictions(user?.restrictions);
  if (restrictions.length === 0) return false;

  const targetId = String(moduleId || '').trim().toUpperCase();
  const targetCategory = targetId.charAt(0);

  return restrictions.includes(targetId) || restrictions.includes(targetCategory);
};
