export const api = {
  async getServerConfig() {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);
      const response = await fetch("/api/config", { signal: controller.signal });
      clearTimeout(id);
      return await response.json();
    } catch (e) {
      return { hasGasUrl: false };
    }
  },

  async saveServerConfig(url: string) {
    const response = await fetch("/api/save-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    return await response.json();
  },

  disconnect() {
    localStorage.removeItem('VITE_GAS_URL');
    window.location.reload();
  },

  async run(method: string, ...args: any[]) {
    // Map frontend methods to Apps Script methods if they differ
    let gasMethod = method;
    let gasArgs = args;

    const customUrl = localStorage.getItem('VITE_GAS_URL');
    const envUrl = (import.meta as any).env?.VITE_GAS_URL;
    const finalGasUrl = customUrl || envUrl;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    // Execute Request
    try {
      // Attempt 1: Call Local Server Proxy (Cloud Run / Full-stack)
      try {
        const proxyHeaders: any = { 'Content-Type': 'application/json' };
        if (customUrl) proxyHeaders['x-gas-url'] = customUrl;

        const response = await fetch("/api/gas", {
          method: 'POST',
          headers: proxyHeaders,
          body: JSON.stringify({ action: gasMethod, params: gasArgs }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Check if proxy actually exists/works
        if (response.status === 404) throw new Error("Proxy Not Found");
        
        const result = await response.json();
        if (!response.ok) {
           if (result.error === "CONFIGURATION_REQUIRED") throw new Error("CONFIGURATION_REQUIRED");
           throw new Error(result.error || `Proxy error ${response.status}`);
        }
        return result;

      } catch (proxyError: any) {
        if (proxyError.message === "CONFIGURATION_REQUIRED") throw proxyError;
        if (proxyError.name === 'AbortError') throw new Error("Connection Timeout: Server is taking too long to respond.");

        // Attempt 2: Direct Call to GAS (Fallback)
        // Fallback if proxy is missing, network error, or if the proxy explicitly failed to connect
        const isNetworkError = proxyError.name === "TypeError" || proxyError.message.includes("Failed to fetch") || proxyError.message.includes("NetworkError");
        const isProxyMissing = proxyError.message === "Proxy Not Found";
        const isConnectionError = proxyError.message.includes("Failed to communicate") || proxyError.message.includes("Unable to connect");

        if (isProxyMissing || isNetworkError || isConnectionError) {
           // If we reach here, and we don't have a local URL, then we really are missing config
           if (!finalGasUrl || finalGasUrl.includes("REPLACE_WITH")) {
              throw new Error("CONFIGURATION_REQUIRED");
           }

           console.log("[API] Server proxy unavailable or failed, attempting direct call to GAS...");
           
           try {
             const directController = new AbortController();
             const directTimeoutId = setTimeout(() => directController.abort(), 15000);

             // GAS WebApp requires POST for exec. 
             const response = await fetch(finalGasUrl, {
               method: 'POST',
               mode: 'cors',
               body: JSON.stringify({ action: gasMethod, params: gasArgs }),
               signal: directController.signal
             });

             clearTimeout(directTimeoutId);

             if (!response.ok) {
                const text = await response.text();
                throw new Error(`GAS ${response.status}: ${text.slice(0, 50)}`);
             }

             return await response.json();
           } catch (directError: any) {
             if (directError.name === 'AbortError') throw new Error("Connection Timeout: Google Script is not responding.");
             console.error("[API] Direct call failed:", directError);
             throw new Error("Unable to connect to Google Script. Check your URL and ensure it's deployed to 'Anyone'.");
           }
        }
        throw proxyError;
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.warn(`[API] Execution failed for ${method}: ${error.message}`);
      throw error;
    }
  }
};
