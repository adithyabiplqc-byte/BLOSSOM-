/**
 * Smart flexible search matching helper.
 * Supports:
 * - Substring matching (case-insensitive)
 * - Space & punctuation insensitive matching (e.g. "T SHIRT" matches "T-SHIRT" or "TSHIRT")
 * - Multi-word token matching (e.g. "kerala polo" matches rows containing both "kerala" and "polo" anywhere)
 * - Deep object search
 */
export function flexibleSearchMatch(target: any, query: string): boolean {
  if (!query || typeof query !== 'string') return true;
  const rawQuery = query.trim().toLowerCase();
  if (!rawQuery) return true;
  if (target === null || target === undefined) return false;

  // Flatten target object or value into a string representation
  let targetStr = '';
  if (typeof target === 'string' || typeof target === 'number' || typeof target === 'boolean') {
    targetStr = String(target);
  } else if (typeof target === 'object') {
    targetStr = Object.values(target)
      .map(v => {
        if (v === null || v === undefined) return '';
        if (typeof v === 'object') {
          try {
            return JSON.stringify(v);
          } catch (e) {
            return '';
          }
        }
        return String(v);
      })
      .join(' ');
  }

  const rawTargetLower = targetStr.toLowerCase();

  // 1. Direct exact substring match
  if (rawTargetLower.includes(rawQuery)) return true;

  // 2. Alphanumeric normalized match (ignoring spaces, hyphens, underscores, dots, etc.)
  const normTarget = rawTargetLower.replace(/[^a-z0-9]/g, '');
  const normQuery = rawQuery.replace(/[^a-z0-9]/g, '');

  if (normQuery.length > 0 && normTarget.includes(normQuery)) return true;

  // 3. Multi-term token matching (all words in search query must match somewhere in target)
  const queryTokens = rawQuery.split(/\s+/).filter(Boolean);
  if (queryTokens.length > 0) {
    const allTokensMatch = queryTokens.every(token => {
      const cleanToken = token.trim();
      if (!cleanToken) return true;
      if (rawTargetLower.includes(cleanToken)) return true;
      const alphaToken = cleanToken.replace(/[^a-z0-9]/g, '');
      if (alphaToken.length > 0 && normTarget.includes(alphaToken)) return true;
      return false;
    });
    if (allTokensMatch) return true;
  }

  return false;
}
