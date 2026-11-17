export type WorkorderStage =
  | 'PRECUTTING'
  | 'CUTTING'
  | 'INLINE'
  | 'ENDLINE'
  | 'AQL'
  | 'FINAL';

/**
 * Normalizes a workorder workflow status string by uppercasing, converting '&' to 'AND',
 * and stripping non-alphanumeric separators (e.g. 'PRECUTTING_PASS_AND_HOLD' -> 'PRECUTTINGPASSANDHOLD').
 * Defaults empty/missing status to 'PRECUTTING'.
 */
export const normalizeWorkorderStatus = (statusStr: any): string => {
  const s = String(statusStr || '')
    .toUpperCase()
    .trim()
    .replace(/&/g, 'AND')
    .replace(/[^A-Z0-9]/g, '');
  return s || 'PRECUTTING';
};

/**
 * Determines whether a workorder with the given status should appear in a module's dropdown:
 * - Create WO -> 'PRECUTTING' (visible only in Precutting)
 * - Precutting Pass & Hold -> 'PRECUTTING_PASS_AND_HOLD' (visible in Precutting & Cutting)
 * - Precutting Pass -> 'CUTTING' (visible only in Cutting)
 * - Cutting Pass & Hold -> 'CUTTING_PASS_AND_HOLD' (visible in Cutting, Inline & Endline)
 * - Cutting Pass -> 'INLINE_AND_ENDLINE' (visible in Inline & Endline simultaneously)
 * - Endline Pass & Hold -> 'ENDLINE_PASS_AND_HOLD' (visible in Inline, Endline & AQL)
 * - Endline 100% Pass -> 'AQL' (visible only in AQL)
 * - AQL Pass & Hold -> 'AQL_PASS_AND_HOLD' (visible in AQL & Final Audit)
 * - AQL Pass -> 'FINAL' (visible only in Final Audit)
 * - Final Record Only / Pass & Hold -> 'FINAL_PASS_AND_HOLD' (visible only in Final Audit)
 * - Final Complete -> 'COMPLETED' / 'CLOSED' (hidden from all operational stage dropdowns)
 */
export const isWorkorderVisibleInStage = (statusStr: any, stage: WorkorderStage): boolean => {
  const s = normalizeWorkorderStatus(statusStr);
  if (s === 'COMPLETED' || s === 'CLOSED') {
    return false;
  }

  switch (stage) {
    case 'PRECUTTING':
      return s === 'PRECUTTING' || s === 'PRECUTTINGPASSANDHOLD';
    case 'CUTTING':
      return s === 'PRECUTTINGPASSANDHOLD' || s === 'CUTTING' || s === 'CUTTINGPASSANDHOLD';
    case 'INLINE':
      return (
        s === 'CUTTINGPASSANDHOLD' ||
        s === 'INLINEANDENDLINE' ||
        s === 'INLINE' ||
        s === 'ENDLINE' ||
        s === 'INLINEPASSANDHOLD' ||
        s === 'ENDLINEPASSANDHOLD'
      );
    case 'ENDLINE':
      return (
        s === 'CUTTINGPASSANDHOLD' ||
        s === 'INLINEANDENDLINE' ||
        s === 'INLINE' ||
        s === 'ENDLINE' ||
        s === 'INLINEPASSANDHOLD' ||
        s === 'ENDLINEPASSANDHOLD'
      );
    case 'AQL':
      return s === 'ENDLINEPASSANDHOLD' || s === 'AQL' || s === 'AQLPASSANDHOLD';
    case 'FINAL':
      return s === 'AQLPASSANDHOLD' || s === 'FINAL' || s === 'FINALPASSANDHOLD';
    default:
      return false;
  }
};
