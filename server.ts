import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Proxy for Google Apps Script
  app.post("/api/gas", async (req, res) => {
    try {
      const gasUrl = process.env.VITE_GAS_URL;
      
      if (!gasUrl || gasUrl.includes("REPLACE_WITH_YOUR_EXEC_URL")) {
        console.error("VITE_GAS_URL is not configured.");
        return res.status(500).json({ 
          success: false, 
          error: "Google Sheets Connection not configured. Please add VITE_GAS_URL to your project settings." 
        });
      }

      console.log(`[API PROXY] Action: ${req.body.action}`);

      const response = await fetch(gasUrl, {
        method: "POST",
        body: JSON.stringify(req.body),
        headers: { "Content-Type": "application/json" },
        redirect: 'follow' 
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`[API PROXY] GAS returned ${response.status}:`, text);
        
        let errorMessage = "Google Script responded with an error.";
        if (response.status === 401 || response.status === 403) {
          errorMessage = "Permission Denied: Ensure your Google Apps Script is deployed as a Web App with 'Execute as: Me' and 'Who has access: Anyone'.";
        } else if (response.status === 404 || text.includes("Page not found")) {
          errorMessage = "Deployment Not Found: Check if your VITE_GAS_URL is correct and the script is correctly deployed as a Web App.";
        } else if (text.includes("Script function not found")) {
          errorMessage = `Function '${req.body.action}' not found in your Google Script.`;
        }
        
        return res.status(response.status).json({ 
          success: false, 
          error: errorMessage,
          details: text.slice(0, 500)
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("[API PROXY] Error:", error);
      res.status(500).json({ success: false, error: "Failed to communicate with Google Sheets. Check your Network and GAS Deployment URL." });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
