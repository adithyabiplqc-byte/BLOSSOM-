import { 
  db, 
  collection, 
  getDocs, 
  handleFirestoreError,
  OperationType
} from '../firebase';

export const api = {
  async run(method: string, ...args: any[]) {
    // Map frontend methods to Apps Script methods if they differ
    let gasMethod = method;
    let gasArgs = args;

    // Report Mappings for Data Fetching consistency with Code.gs
    const reportGetMappings: Record<string, string> = {
      'api_getMaterialData': 'MATERIAL',
      'api_getCuttingData': 'CUTTING',
      'api_getInlineData': 'INLINE',
      'api_getEndlineData': 'ENDLINE',
      'api_getAQLData': 'AQL',
      'api_getFinalAuditData': 'FINAL-AUDIT'
    };
    
    const reportDeleteMappings: Record<string, string> = {
      'api_deleteMaterialData': 'MATERIAL',
      'api_deleteCuttingData': 'CUTTING',
      'api_deleteInlineData': 'INLINE',
      'api_deleteEndlineData': 'ENDLINE',
      'api_deleteAQLData': 'AQL',
      'api_deleteFinalAuditData': 'FINAL-AUDIT'
    };
    
    const reportSaveMappings: Record<string, string> = {
      'api_saveMaterialReport': 'MATERIAL',
      'api_saveCuttingReport': 'CUTTING',
      'api_saveInlineReport': 'INLINE',
      'api_saveEndlineReport': 'ENDLINE',
      'api_saveAQLReport': 'AQL',
      'api_saveFinalAudit': 'FINAL-AUDIT'
    };

    // Helper to resolve dynamic sheet name based on zone (Warehouse Model)
    // Format: [BaseName] - [Zone] (e.g. Material - Kerala)
    const resolveSheetName = (baseName: string, data: any) => {
      const zone = data?.zone || data?.location || data?.userZone;
      
      if (!zone || zone === 'SYSTEM' || zone === 'ALL') {
        return baseName.toUpperCase().replace(/\s+/g, '-');
      }

      // Format as "Base - Zone" (e.g. Material - Kerala)
      const formattedBase = baseName.charAt(0).toUpperCase() + baseName.slice(1).toLowerCase();
      const formattedZone = zone.charAt(0).toUpperCase() + zone.slice(1).toLowerCase();
      
      return `${formattedBase} - ${formattedZone}`;
    };

    if (reportGetMappings[method]) {
      gasMethod = 'api_getDataBySheet';
      gasArgs = [resolveSheetName(reportGetMappings[method], args[0])];
    } else if (reportDeleteMappings[method]) {
      gasMethod = 'api_deleteDataBySheet';
      const baseName = reportDeleteMappings[method];
      const data = args[1] || {};
      gasArgs = [resolveSheetName(baseName, data), args[0]];
    } else if (reportSaveMappings[method]) {
      gasMethod = 'api_saveDataBySheet';
      const baseName = reportSaveMappings[method];
      gasArgs = [resolveSheetName(baseName, args[0]), args[0]];
    }
    // Workorder methods use their native names in Code.gs and target 'WORKORDER' sheet by default

    try {
      // Primary Attempt: Local API Proxy (which calls Google Apps Script)
      console.log(`[API] Calling Proxy: ${gasMethod}`, gasArgs);
      
      const response = await fetch("/api/gas", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: gasMethod,
          params: gasArgs
        })
      });

      const result = await response.json();

      if (response.ok) {
        if (result && result.success !== false) {
          return result;
        }
        // If GAS explicitly returned success: false
        throw new Error(result.error || "Google Script execution failed");
      } else {
        // If Proxy returned 500 or 404, we include the summary error
        const msg = result.error || `Server responded with status ${response.status}`;
        throw new Error(msg);
      }
    } catch (error: any) {
      console.warn(`[API] Proxy failed for ${method}: ${error.message}`);
      
      // Secondary Logic: Firebase Fallback (Only for specific legacy methods during migration)
      if (method === 'api_getInitialData' || method === 'api_getUsers') {
        try {
          const usersSnap = await getDocs(collection(db, 'users'));
          const users = usersSnap.docs.map(d => ({ ...d.data(), id: d.id }));
          
          if (method === 'api_getInitialData') {
            return {
              users,
              workorders: [],
              success: true,
              _isFallback: true
            };
          }
          return users;
        } catch (e) {
          handleFirestoreError(e, OperationType.LIST, 'fallback');
        }
      }
      
      throw error;
    }
  }
};
