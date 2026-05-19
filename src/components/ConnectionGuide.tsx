import React from 'react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import Icon from './Icon';

interface ConnectionGuideProps {
  error: string;
  onClose?: () => void;
  isPermanentlyConnected?: boolean;
}

export default function ConnectionGuide({ error, onClose, isPermanentlyConnected }: ConnectionGuideProps) {
  const [inputUrl, setInputUrl] = React.useState(localStorage.getItem('VITE_GAS_URL') || '');
  const [pinging, setPinging] = React.useState(false);
  const [pingResult, setPingResult] = React.useState<{success: boolean, message: string} | null>(null);
  const isConfigMode = error === "User Configuration Mode";

  const testConnection = async () => {
    if (!inputUrl.includes('/exec')) {
      setPingResult({ success: false, message: "URL must end in /exec" });
      return;
    }
    
    setPinging(true);
    setPingResult(null);
    try {
      const response = await fetch(inputUrl, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({ action: 'api_ping' })
      });
      const data = await response.json();
      if (data && data.success) {
        setPingResult({ success: true, message: "Connection Successful! Your Script is responding." });
      } else {
        setPingResult({ success: false, message: "Script responded but ping failed. Check permissions." });
      }
    } catch (e) {
      setPingResult({ success: false, message: "Network Error: Ensure CORS is enabled and Who has access is set to 'Anyone'." });
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
      const res = await api.saveServerConfig(inputUrl);
      if (res.success) {
        setPingResult({ success: true, message: "URL saved permanently on server! You can now use this app from any browser." });
        localStorage.removeItem('VITE_GAS_URL'); // Use server config instead
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
          <h2 className="text-xl font-black uppercase tracking-tighter italic">{isConfigMode ? "System Configuration" : "Google Sheets Setup"}</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <Icon name="x" size={24} />
          </button>
        )}
      </div>

      <div className="p-8 space-y-6">
        <div className={`${isConfigMode ? 'bg-indigo-50 border-indigo-100' : 'bg-rose-50 border-rose-100'} p-6 rounded-xl border-2 space-y-4`}>
          <div>
            <p className={`${isConfigMode ? 'text-indigo-900' : 'text-rose-900'} font-black mb-1 italic uppercase text-[10px] tracking-widest`}>{isConfigMode ? "Current Configuration:" : "Status / Error:"}</p>
            <p className={`${isConfigMode ? 'text-indigo-700' : 'text-rose-700'} text-sm font-mono leading-relaxed bg-white/50 p-2 rounded border ${isConfigMode ? 'border-indigo-100' : 'border-rose-100'}`}>{error}</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-gray-700 font-black uppercase text-[10px] tracking-widest">Connect to your Google Apps Script:</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={inputUrl}
                onChange={(e) => { setInputUrl(e.target.value); setPingResult(null); }}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 bg-white border-2 border-slate-200 rounded-xl px-4 py-2 text-sm font-medium focus:border-indigo-500 outline-none transition-all shadow-inner"
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
                className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-xl font-black uppercase text-[11px] tracking-widest hover:bg-indigo-700 disabled:opacity-50 shadow-xl shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                title="Save URL to server permanently"
              >
                <Icon name="shield-check" size={14} />
                {pinging ? 'Connecting...' : 'Connect Permanently'}
              </button>
              <button 
                onClick={saveUrl}
                className="bg-slate-100 text-slate-600 px-4 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
              >
                Local Only
              </button>
            </div>
            
            {pingResult && (
              <div className={`p-2 rounded mt-1 text-[10px] font-bold uppercase tracking-tight ${pingResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                {pingResult.message}
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              {localStorage.getItem('VITE_GAS_URL') ? (
                 <button 
                   onClick={() => api.disconnect()}
                   className="flex items-center gap-1 text-[9px] font-bold text-rose-600 uppercase hover:bg-rose-50 px-2 py-1 rounded transition-all"
                 >
                   <Icon name="link-2-off" size={10} />
                   Disconnect / Forget URL
                 </button>
              ) : <div className="text-[9px] font-bold text-slate-400 italic">No temporary URL saved.</div>}
              
              {isPermanentlyConnected ? (
                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded">
                  <Icon name="shield-check" size={10} />
                  <span>Permanent Connection Active (Env Var)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase">
                  <Icon name="info" size={10} />
                  <span>Permanent? Set VITE_GAS_URL in Settings.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-black uppercase italic text-gray-900">How to fix this:</h3>
          
          <div className="grid gap-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-black shrink-0">1</div>
              <div>
                <p className="font-bold text-gray-900">Check Script Deployment</p>
                <p className="text-sm text-gray-500">Open your Google Sheet {'>'} Extensions {'>'} Apps Script. Click <b>Deploy</b> {'>'} <b>New Deployment</b>.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-black shrink-0">2</div>
              <div>
                <p className="font-bold text-gray-900">Configure Web App Settings</p>
                <div className="text-sm text-gray-500 space-y-1 mt-1">
                  <p>• Select Type: <b>Web App</b></p>
                  <p>• Execute As: <b>Me</b></p>
                  <p>• Who has access: <b className="text-rose-600 underline">Anyone</b> (Required for integration)</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-black shrink-0">3</div>
              <div>
                <p className="font-bold text-gray-900">Update Environment URL</p>
                <p className="text-sm text-gray-500">Copy the <b>Web App URL</b> and paste it into your <b>VITE_GAS_URL</b> in the project settings.</p>
                <p className="text-[11px] text-rose-600 mt-1 font-black uppercase tracking-widest italic">Important: It must be the ".exec" URL from deployment, not the Sheet or Script Editor URL.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button 
            onClick={() => window.location.reload()}
            className="bg-gray-900 text-white px-6 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
          >
            <Icon name="refresh-cw" size={16} />
            Try Reconnecting
          </button>
        </div>
      </div>
    </motion.div>
  );
}
