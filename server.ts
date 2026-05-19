import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fetch from "node-fetch";
import fs from "fs";

const CONFIG_FILE = path.join(process.cwd(), ".gas_url");
const HARDCODED_GAS_URL = "https://script.google.com/macros/s/AKfycbzrSntR0NNT-tAifyZ5K5Jh4y3St8jMm2PqZJTGTgyYEDKVvhUHEEUKyjJNRNNI9UHb7A/exec";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Proxy for Google Apps Script
  app.get("/api/config", (req, res) => {
    let fileUrl = null;
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        fileUrl = fs.readFileSync(CONFIG_FILE, 'utf8').trim();
      }
    } catch (e) {}

    const envUrl = process.env.VITE_GAS_URL;
    const hasEnv = !!envUrl && !envUrl.includes("REPLACE_WITH");

    res.json({
      hasGasUrl: hasEnv || !!fileUrl || !!HARDCODED_GAS_URL,
      gasUrlPlaceholder: envUrl?.includes("REPLACE_WITH"),
      isPermanent: !!fileUrl || hasEnv || !!HARDCODED_GAS_URL,
      source: fileUrl ? 'file' : (hasEnv ? 'env' : 'hardcoded')
    });
  });

  app.post("/api/save-config", (req, res) => {
    const { url } = req.body;
    if (!url || !url.startsWith("https://script.google.com/macros/s/")) {
      return res.status(400).json({ success: false, error: "Invalid Google Script URL" });
    }
    try {
      fs.writeFileSync(CONFIG_FILE, url);
      console.log(`[CONFIG] Permanent GAS URL saved to ${CONFIG_FILE}`);
      res.json({ success: true, message: "URL saved permanently on server" });
    } catch (e) {
      console.error("[CONFIG] Failed to save URL:", e);
      res.status(500).json({ success: false, error: "Failed to write configuration to server storage." });
    }
  });

  app.post("/api/gas", async (req, res) => {
    try {
      // Priority: 1. Request Header, 2. Persistent File (Setup tool), 3. Env Var, 4. Hardcoded Fallback
      let gasUrl = req.headers['x-gas-url'];
      
      if (!gasUrl) {
        try {
          if (fs.existsSync(CONFIG_FILE)) {
            gasUrl = fs.readFileSync(CONFIG_FILE, 'utf8').trim();
          }
        } catch (e) {}
      }

      if (!gasUrl || (typeof gasUrl === 'string' && gasUrl.includes("REPLACE_WITH_YOUR_EXEC_URL"))) {
        gasUrl = process.env.VITE_GAS_URL;
      }

      // Check if env var is actually set
      if (!gasUrl || (typeof gasUrl === 'string' && gasUrl.includes("REPLACE_WITH"))) {
        gasUrl = HARDCODED_GAS_URL;
        if (gasUrl) console.log(`[API PROXY] Using hardcoded fallback GAS URL`);
      }
      
      if (!gasUrl) {
        console.error("VITE_GAS_URL is not configured.");
        return res.status(500).json({ 
          success: false, 
          error: "CONFIGURATION_REQUIRED",
          details: "Google Sheets Connection not configured. Please use the setup tool in the UI or add VITE_GAS_URL to your settings." 
        });
      }

      console.log(`[API PROXY] Routing to GAS: ${req?.body?.action || 'unknown'} | URL Source: ${req.headers['x-gas-url'] ? 'header' : (fs.existsSync(CONFIG_FILE) ? 'file' : (process.env.VITE_GAS_URL ? 'env' : 'hardcoded'))}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout for GAS
      
      const response = await fetch(gasUrl as string, {
        method: "POST",
        body: JSON.stringify(req.body),
        headers: { "Content-Type": "application/json" },
        redirect: 'follow',
        signal: controller.signal as any
      });
      clearTimeout(timeoutId);

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
    if (process.env.VITE_GAS_URL && !process.env.VITE_GAS_URL.includes("REPLACE_WITH")) {
      console.log("BASE CONFIG: Permanent VITE_GAS_URL detected in environment.");
    } else {
      console.log("BASE CONFIG: No permanent VITE_GAS_URL found. Relying on client-side setup.");
    }
  });
}

startServer();
