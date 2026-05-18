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

    // Execute Request
    try {
      const customUrl = localStorage.getItem('VITE_GAS_URL');
      const fallbackUrl = "https://script.google.com/macros/s/.../exec"; // PLACEHOLDER: Please provide your URL for hardcoding
      const finalGasUrl = customUrl || fallbackUrl;

      // Attempt 1: Call Local Server Proxy (Cloud Run / Full-stack)
      try {
        const proxyHeaders: any = { 'Content-Type': 'application/json' };
        if (customUrl) proxyHeaders['x-gas-url'] = customUrl;

        const response = await fetch("/api/gas", {
          method: 'POST',
          headers: proxyHeaders,
          body: JSON.stringify({ action: gasMethod, params: gasArgs })
        });

        // Check if proxy actually exists/works
        if (response.status === 404) throw new Error("Proxy Not Found");
        
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || `Proxy error ${response.status}`);
        return result;

      } catch (proxyError: any) {
        // Attempt 2: Direct Call to GAS (For Netlify/GitHub Static Pages)
        if (proxyError.message === "Proxy Not Found" || proxyError.name === "TypeError") {
           console.log("[API] Server proxy unavailable, attempting direct call to GAS...");
           
           if (!finalGasUrl || finalGasUrl.includes("REPLACE_WITH")) {
             throw new Error("CONFIGURATION_REQUIRED");
           }

           // GAS WebApp requires POST for exec. 
           // NOTE: Direct calls may hit CORS if Code.gs doesn't return correct Content-Type/Headers
           const response = await fetch(finalGasUrl, {
             method: 'POST',
             mode: 'cors',
             body: JSON.stringify({ action: gasMethod, params: gasArgs })
           });

           return await response.json();
        }
        throw proxyError;
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
