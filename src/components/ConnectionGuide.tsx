import React from 'react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { sheetsService } from '../services/sheetsService';
import { googleSignIn, logout, getAccessToken, auth } from '../services/auth';
import Icon from './Icon';

interface ConnectionGuideProps {
  error: string;
  onClose?: () => void;
  isPermanentlyConnected?: boolean;
}

export default function ConnectionGuide({ error, onClose, isPermanentlyConnected }: ConnectionGuideProps) {
  const [inputUrl, setInputUrl] = React.useState(localStorage.getItem('VITE_GAS_URL') || '');
  const [spreadsheetInput, setSpreadsheetInput] = React.useState(sheetsService.getSpreadsheetId() || '');
  const [pinging, setPinging] = React.useState(false);
  const [processingOAuth, setProcessingOAuth] = React.useState(false);
  const [pingResult, setPingResult] = React.useState<{success: boolean, message: string} | null>(null);
  const [oauthResult, setOauthResult] = React.useState<{success: boolean, message: string} | null>(null);
  const [showForceButton, setShowForceButton] = React.useState(false);
  const [copyingScript, setCopyingScript] = React.useState(false);
  const [copiedFeedback, setCopiedFeedback] = React.useState(false);
  const [showManualCode, setShowManualCode] = React.useState(false);
  const [rawCodeText, setRawCodeText] = React.useState('');
  
  // Track Google Account state
  const [googleUser, setGoogleUser] = React.useState<any>(auth.currentUser);
  const [googleToken, setGoogleToken] = React.useState<string | null>(getAccessToken());
  const [sheetId, setSheetId] = React.useState<string | null>(sheetsService.getSpreadsheetId());

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setGoogleUser(user);
      setGoogleToken(getAccessToken());
      setSheetId(sheetsService.getSpreadsheetId());
    });
    return () => unsubscribe();
  }, []);

  const isConfigMode = error === "User Configuration Mode" || error === "CONFIGURATION_MODE";

  const handleGoogleSignIn = async () => {
    setProcessingOAuth(true);
    setOauthResult(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        setOauthResult({ success: true, message: "Logged in successfully! Let's choose a spreadsheet next." });
      }
    } catch (e: any) {
      setOauthResult({ success: false, message: e.message || "Failed to sign in with Google." });
    } finally {
      setProcessingOAuth(false);
    }
  };

  const handleLogout = async () => {
    setProcessingOAuth(true);
    try {
      await logout();
      setGoogleUser(null);
      setGoogleToken(null);
      setSheetId(null);
      setOauthResult({ success: true, message: "Logged out of your Google account." });
      setTimeout(() => window.location.reload(), 1000);
    } catch (e: any) {
      setOauthResult({ success: false, message: "Logout failed." });
    } finally {
      setProcessingOAuth(false);
    }
  };

  const handleCreateNewSheet = async () => {
    setProcessingOAuth(true);
    setOauthResult(null);
    try {
      const id = await sheetsService.createNewSpreadsheet();
      setSheetId(id);
      await api.saveServerConfig("", id);
      setOauthResult({ success: true, message: `Successfully created sheet: "${id}". Database configured!` });
      setTimeout(() => window.location.reload(), 1500);
    } catch (e: any) {
      setOauthResult({ success: false, message: e.message || "Failed to build Google Sheet database." });
    } finally {
      setProcessingOAuth(false);
    }
  };

  const forceLinkSpreadsheet = () => {
    if (!spreadsheetInput) {
      setOauthResult({ success: false, message: "Please input a Google Sheet ID or URL first." });
      return;
    }
    let id = spreadsheetInput.trim();
    if (id.includes('/d/')) {
      const match = id.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match) id = match[1];
    }
    sheetsService.setSpreadsheetId(id);
    setSheetId(id);
    api.saveServerConfig("", id).catch(() => {});
    setOauthResult({ success: true, message: "Force Linked Sheet Target successfully! Refreshing App..." });
    setTimeout(() => window.location.reload(), 1500);
  };

  const handleCopyCode = async () => {
    setCopyingScript(true);
    try {
      const res = await fetch('/api/code-gs');
      if (!res.ok) throw new Error("Could not retrieve script file");
      const text = await res.text();
      setRawCodeText(text);
      try {
        await navigator.clipboard.writeText(text);
        setCopiedFeedback(true);
        setTimeout(() => setCopiedFeedback(false), 3000);
      } catch (clipboardError) {
        console.warn("Clipboard access blocked by browser sandbox/iframe constraints. Displaying original text block.");
        setShowManualCode(true);
      }
    } catch (e) {
      setShowManualCode(true);
    } finally {
      setCopyingScript(false);
    }
  };

  const handleConnectSpreadsheet = async () => {
    if (!spreadsheetInput) {
      setOauthResult({ success: false, message: "Please input a Google Sheet ID or full spreadsheet URL" });
      setShowForceButton(false);
      return;
    }
    setProcessingOAuth(true);
    setOauthResult(null);
    setShowForceButton(false);
    try {
      let id = spreadsheetInput.trim();
      if (id.includes('/d/')) {
        const match = id.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match) id = match[1];
      }

      const isValid = await sheetsService.checkSpreadsheetValid(id);
      if (isValid) {
        sheetsService.setSpreadsheetId(id);
        setSheetId(id);
        await api.saveServerConfig("", id);
        setOauthResult({ success: true, message: "Spreadsheet linked successfully! Syncing database..." });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setOauthResult({ success: false, message: "Could not verify sheet API access. If Popups were blocked during Sign-In, or permissions are restricted, try Force Connecting below, or open app in a new tab." });
        setShowForceButton(true);
      }
    } catch (e: any) {
      setOauthResult({ success: false, message: e.message || "Spreadsheet connection failed." });
      setShowForceButton(true);
    } finally {
      setProcessingOAuth(false);
    }
  };

  const testConnection = async () => {
    if (!inputUrl.includes('/exec')) {
      setPingResult({ success: false, message: "URL must end in /exec" });
      return;
    }
    
    setPinging(true);
    setPingResult(null);
    try {
      // Proxied Ping (server-to-server) to bypass all browser CORS and sandbox iframe blocks
      const response = await fetch("/api/gas", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gas-url': inputUrl
        },
        body: JSON.stringify({ action: 'api_ping' })
      });
      
      const data = await response.json();
      if (data && data.success) {
        setPingResult({ success: true, message: "Connection Successful! Your Script is responding perfectly through our server database proxy." });
      } else {
        throw new Error("Proxy test returned failure, falling back to direct...");
      }
    } catch (e) {
      // Fallback: Try direct request in case the server proxy isn't available or running in different scope
      try {
        const response = await fetch(inputUrl, {
          method: 'POST',
          mode: 'cors',
          body: JSON.stringify({ action: 'api_ping' })
        });
        const data = await response.json();
        if (data && data.success) {
          setPingResult({ success: true, message: "Connection Successful! (Direct Browser Sync Mode)" });
        } else {
          setPingResult({ success: false, message: "Script responded but ping failed. Check permissions internally on Google." });
        }
      } catch (directError) {
        setPingResult({ 
          success: false, 
          message: "Network Error: Google Script did not respond. Verify your deployment: 'Deploy > New Deployment > Web App > Execute as: Me, Who has access: Anyone' and re-paste the URL." 
        });
      }
    } finally {
      setPinging(false);
    }
  };

  const saveUrl = () => {
    if (inputUrl.includes('/exec')) {
      localStorage.setItem('VITE_GAS_URL', inputUrl);
      window.location.reload();
    } else {
      alert("Please enter a valid Google Apps Script Web App URL ending in /exec");
    }
  };

  const makePermanent = async () => {
    if (!inputUrl.includes('/exec')) {
      setPingResult({ success: false, message: "Invalid URL" });
      return;
    }
    
    setPinging(true);
    try {
      const currentSpreadsheetId = spreadsheetInput.trim() || sheetsService.getSpreadsheetId() || '';
      const res = await api.saveServerConfig(inputUrl, currentSpreadsheetId) as any;
      if (res.success) {
        setPingResult({ success: true, message: "URL saved permanently on server! You can now use this app from any browser." });
        localStorage.removeItem('VITE_GAS_URL');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setPingResult({ success: false, message: res.error || "Failed to save permanently" });
      }
    } catch (e) {
      setPingResult({ success: false, message: "Failed to communicate with server backend." });
    } finally {
      setPinging(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border-2 ${isConfigMode ? 'border-indigo-500' : 'border-rose-500'} rounded-2xl shadow-2xl overflow-hidden max-w-2xl mx-auto my-8`}
    >
      <div className={`${isConfigMode ? 'bg-indigo-600' : 'bg-rose-500'} p-6 flex items-center justify-between text-white`}>
        <div className="flex items-center gap-3">
          <Icon name={isConfigMode ? "settings" : "link-2-off"} size={28} />
          <h2 className="text-xl font-black uppercase tracking-tighter italic">Google Sheets Setup</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <Icon name="x" size={24} />
          </button>
        )}
      </div>

      <div className="p-8 space-y-8">
        
        {/* MULTI-DEVICE ALL USERS SYNC NOTICE */}
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-3xl p-6 space-y-3 shadow-md shadow-indigo-100">
          <div className="flex items-center gap-3 border-b pb-3 border-indigo-100/60">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-black">★</span>
            <h3 className="text-sm font-black text-indigo-950 uppercase tracking-wider">Multi-Device shared connection notice</h3>
          </div>
          <p className="text-xs text-indigo-900 font-bold leading-relaxed">
            To connect the database server so that <strong>ALL users on ALL devices</strong> instantly get connected to the same Google Spreadsheet without requiring individual Google accounts or logins, you <strong>MUST use Option C (Google Apps Script Connection)</strong> below. 
          </p>
          <p className="text-xs text-indigo-850 font-semibold leading-relaxed">
            If you connect using <em>Option B (Direct Google Account Link)</em>, it only connects that specific browser/device. Other devices will default to the local fallback database unless they also sign in with the exact same Google Account.
          </p>
        </div>

        {/* INSTANT DEMO SANDBOX DATABASE OPTION (1-CLICK ACTIVATE) */}
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-6 space-y-4 shadow-sm shadow-emerald-100">
          <div className="flex items-center justify-between border-b pb-3 border-emerald-100/60">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-sm font-black animate-pulse">⚡</span>
              <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wider">Option A: 1-Click Instant Sandbox Database</h3>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full animate-pulse">Easiest Connection</span>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs text-emerald-900 font-bold leading-relaxed">
              Skip all Google login popup prompts, Apps Script code deploys, and iframe sandbox blocks! Activating the localized instant sandbox spins up a full-featured mock-free browser database on your browser instantly.
            </p>
            {localStorage.getItem('BQOS_DEMO_MODE') === 'true' ? (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-extrabold bg-white/80 border border-emerald-200 px-3 py-1.5 rounded-xl shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  Your Browser Sandbox is active and running!
                </span>
                <button
                  onClick={() => {
                    localStorage.removeItem('BQOS_DEMO_MODE');
                    localStorage.removeItem('VITE_SPREADSHEET_ID');
                    window.location.reload();
                  }}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest px-4 py-2.5 rounded-xl transition duration-150"
                >
                  Reset Settings & Live Connect Google Sheets
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('BQOS_DEMO_MODE', 'true');
                    localStorage.setItem('VITE_SPREADSHEET_ID', 'DEMO_SANDBOX_SPREADSHEET_ID');
                    window.location.reload();
                  }}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[11px] tracking-widest px-6 py-4 rounded-xl transition duration-150 shadow-md shadow-emerald-200 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Icon name="zap" size={14} />
                  Connect Instantly with 1-Click
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* RECOMMENDED OAUTH ROADPANEL */}
        <div className="bg-slate-50 border-2 border-indigo-100 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-3 border-indigo-50">
             <div className="flex items-center gap-2">
               <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-black">★</span>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Option B: Single-Device Direct Google Link (Personal Link Only)</h3>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">Personal Use</span>
          </div>

          {/* Iframe Pop-up Warning Alert Block */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 flex items-start gap-4">
            <div className="bg-amber-500 text-white rounded-full p-1.5 shrink-0">
              <Icon name="alert-triangle" size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">Are you inside the AI Studio editor?</h4>
              <p className="text-[11px] text-amber-850 leading-relaxed font-semibold">
                Browsers block secure Google login windows and Google Sheets API checks from displaying inside sandboxed preview iframes. To connect standard Google Sheets cleanly, click the button below to open the app in a new browser tab first!
              </p>
              <div className="pt-2">
                <a 
                  href={window.location.href} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black uppercase text-[10px] tracking-wider px-3.5 py-2 rounded-xl transition shadow shadow-amber-200"
                >
                  <Icon name="external-link" size={12} />
                  Open Application in New Tab to Sign In
                </a>
              </div>
            </div>
          </div>

          {!googleUser ? (
            <div className="text-center py-4 space-y-4 border-t border-slate-100/60 pt-4">
              <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
                Store and synchronize all your ERP, Quality Forms, and inspection data directly onto your personal Google Drive Sheets securely.
              </p>
              
              {/* Google Sign In Button - Styled with Material colors */}
              <button 
                onClick={handleGoogleSignIn}
                disabled={processingOAuth}
                className="gsi-material-button inline-flex items-center bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 transition-all text-xs cursor-pointer disabled:opacity-50"
              >
                <div className="gsi-material-button-content-wrapper flex items-center gap-3">
                  <div className="gsi-material-button-icon w-4 h-4 flex items-center justify-center shrink-0">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents font-black uppercase text-[10px] tracking-wider">Sign in with Google Account</span>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  {googleUser.photoURL ? (
                    <img src={googleUser.photoURL} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full" alt="profile" />
                  ) : (
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold rounded-full">G</div>
                  )}
                  <div>
                    <h4 className="text-sm font-black text-slate-800">{googleUser.displayName || 'Authorized'}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">{googleUser.email}</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-100 p-2 rounded-lg transition-all"
                >
                  Sign Out
                </button>
              </div>

              {!sheetId ? (
                <div className="space-y-4 bg-white border border-indigo-50 p-6 rounded-xl shadow-sm">
                  <div className="text-center py-2">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-tight mb-2">Configure Your Cloud Sheet Database</p>
                    <button
                      onClick={handleCreateNewSheet}
                      disabled={processingOAuth}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[11px] tracking-widest py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-150 active:scale-[0.98]"
                    >
                      <Icon name="file-spreadsheet" size={16} />
                      {processingOAuth ? 'Creating database...' : 'Create New Google Sheet Automatically'}
                    </button>
                  </div>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-150"></div>
                    <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">or link existing</span>
                    <div className="flex-grow border-t border-slate-150"></div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-slate-500 text-[10px] font-black uppercase tracking-wider block">Spreadsheet ID or full URL:</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={spreadsheetInput}
                        onChange={(e) => setSpreadsheetInput(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                        className="flex-1 bg-white border-2 border-slate-200 rounded-xl px-4 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition-all shadow-inner"
                      />
                      <button 
                        onClick={handleConnectSpreadsheet}
                        disabled={processingOAuth}
                        className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50 shrink-0"
                      >
                        {processingOAuth ? 'Checking...' : 'Link Sheet'}
                      </button>
                    </div>

                    {showForceButton && (
                      <div className="mt-3 bg-red-50 border border-red-200 p-4 rounded-xl space-y-2">
                        <p className="text-[11px] text-red-800 font-bold">
                          ⚠️ Unable to automatically verify sheet API access (can occur due to iframe limitations or scopes). If this is a valid sheet, you can bypass validation and connect directly!
                        </p>
                        <button
                          type="button"
                          onClick={forceLinkSpreadsheet}
                          className="bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-widest py-2 px-4 rounded-xl transition duration-150 shadow"
                        >
                          Bypass Verification & Link Sheet ID Anyway
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <Icon name="shield-check" size={20} />
                    <h4 className="text-xs font-black uppercase tracking-wider leading-none">Spreadsheet Successfully Connected!</h4>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 py-1">
                    <a 
                      href={`https://docs.google.com/spreadsheets/d/${sheetId}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex-1 text-center bg-white text-emerald-700 border border-emerald-200 font-bold text-[10px] uppercase tracking-wider py-2 rounded-lg hover:bg-emerald-100/50 transition-all shadow-sm"
                    >
                      Open Google Spreadsheet ↗
                    </a>
                    
                    <button 
                      onClick={async () => {
                        await api.disconnect();
                      }}
                      className="text-slate-500 hover:text-red-600 bg-white border border-slate-200 rounded-lg py-2 px-4 hover:bg-red-50 transition-all font-bold text-[10px] uppercase tracking-wider"
                    >
                      Change Sheet
                    </button>
                  </div>
                  
                  <p className="text-[9px] text-emerald-600 font-black tracking-wide uppercase italic">
                    All forms, workorders, quality inspection, and bulk report entries are synchronized with your spreadsheet in real time.
                  </p>
                </div>
              )}
            </div>
          )}

          {oauthResult && (
            <div className={`p-3 rounded-xl mt-1 text-[10px] font-black uppercase tracking-tight text-center ${oauthResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
              {oauthResult.message}
            </div>
          )}
        </div>

        {/* --- RECOMMENDED: MANUAL SCRIPT WEB APP CONNECTION --- */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Option C: Universal Google Sheets Connection via Apps Script (RECOMMENDED FOR MULTI-DEVICE ALL USERS SYNC)</h3>
          </div>
          
          <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-200/60 space-y-5">
            <div className="space-y-3">
              <h4 className="text-[11px] font-black uppercase text-indigo-600 tracking-wider">How to connect any standard Google Sheet (No login popup required):</h4>
              <ol className="text-xs text-slate-600 space-y-3 list-decimal list-inside font-medium leading-relaxed">
                <li>Create a <strong>new blank Google Spreadsheet</strong> in your Google Drive.</li>
                <li>In the top menu, go to <strong>Extensions &gt; Apps Script</strong>.</li>
                <li>Delete any default code, and copy-paste the backend code. Click below to copy it instantly:</li>
                <div className="py-1 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      disabled={copyingScript}
                      className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-black uppercase text-[10px] tracking-wider px-3.5 py-2.5 rounded-xl transition duration-150"
                    >
                      <Icon name={copiedFeedback ? "check" : "copy"} size={13} className={copiedFeedback ? "text-emerald-600 animate-bounce" : ""} />
                      {copyingScript ? 'Retrieving code...' : (copiedFeedback ? 'Copied code successfully!' : 'Copy Script Code to Clipboard')}
                    </button>
                    
                    <button
                      type="button"
                      onClick={async () => {
                        if (!rawCodeText) {
                          setCopyingScript(true);
                          try {
                            const res = await fetch('/api/code-gs');
                            const text = await res.text();
                            setRawCodeText(text);
                          } catch (e) {}
                          setCopyingScript(false);
                        }
                        setShowManualCode(!showManualCode);
                      }}
                      className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase text-[9px] tracking-wide px-3 py-2 rounded-xl border border-slate-200"
                    >
                      <Icon name="eye" size={12} />
                      {showManualCode ? 'Hide Manual Code Box' : 'Show Manual Code Box'}
                    </button>
                  </div>
                  
                  {/* Manual Backup code Container */}
                  {(showManualCode || !!rawCodeText) && showManualCode && (
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-xl space-y-2 max-h-68 overflow-hidden flex flex-col border border-slate-800 animate-fade-in">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wildest">📋 Apps Script Code Backup</span>
                        <button 
                          type="button"
                          onClick={() => {
                            const textarea = document.getElementById('code-textarea') as HTMLTextAreaElement;
                            if (textarea) {
                              textarea.select();
                              document.execCommand('copy');
                              setCopiedFeedback(true);
                              setTimeout(() => setCopiedFeedback(false), 3000);
                            }
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg text-white transition"
                        >
                          Select & Copy All
                        </button>
                      </div>
                      <textarea
                        id="code-textarea"
                        readOnly
                        value={rawCodeText || "Click 'Copy Script Code' above to load."}
                        onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                        className="w-full h-32 bg-slate-950 text-slate-300 font-mono text-[10px] p-2.5 rounded-xl border border-slate-850 outline-none resize-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <p className="text-[9px] text-slate-400 leading-tight">
                        💡 If the blue copy button failed, click <b>Select & Copy All</b> above, then paste directly into Google Apps Script!
                      </p>
                    </div>
                  )}
                </div>
                <li>Click <strong>Deploy &gt; New Deployment</strong> (top right menu).</li>
                <li>Click the ⚙️ next to "Select type" and choose <strong>Web App</strong>.</li>
                <li>Set <strong>Execute as:</strong> <code>Me</code> and <strong>Who has access:</strong> <code>Anyone</code> (this is required so the application can communicate).</li>
                <li>Click <strong>Deploy</strong>, authorize requested permissions with your account, and <strong>copy the Web App URL</strong> (ends in <code>/exec</code>).</li>
                <li>Paste the URL below to configure your spreadsheet database!</li>
              </ol>
            </div>

            <div className="border-t border-slate-200/60 pt-4 space-y-3">
              <p className="text-slate-400 font-black italic uppercase text-[9px] tracking-widest leading-none">Active Server/GAS Mode Status:</p>
              <p className="text-slate-600 text-xs font-mono bg-white p-2.5 rounded-lg border border-slate-150 truncate">{error}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-slate-500 font-black uppercase text-[9px] tracking-widest block">Script Deployment Web App URL:</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={inputUrl}
                  onChange={(e) => { setInputUrl(e.target.value); setPingResult(null); }}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="flex-1 bg-white border-2 border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:border-indigo-500 outline-none transition-all shadow-inner"
                />
                <button 
                  onClick={testConnection}
                  disabled={pinging}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 disabled:opacity-50"
                >
                  {pinging ? 'Pinging...' : 'Test'}
                </button>
                <button 
                  onClick={makePermanent}
                  disabled={pinging}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 disabled:opacity-50"
                  title="Save URL to server permanently"
                >
                  Save
                </button>
              </div>
              
              {pingResult && (
                <div className={`p-2 rounded mt-1 text-[10px] font-bold uppercase tracking-tight ${pingResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                  {pingResult.message}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button 
            onClick={() => window.location.reload()}
            className="bg-slate-900 text-white px-6 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Icon name="refresh-cw" size={16} />
            Try Reconnecting / Reload App
          </button>
        </div>
      </div>
    </motion.div>
  );
}
