import React from 'react';
import { motion } from 'motion/react';
import Icon from './Icon';

interface ConnectionGuideProps {
  error: string;
  onClose?: () => void;
}

export default function ConnectionGuide({ error, onClose }: ConnectionGuideProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-2 border-rose-500 rounded-2xl shadow-2xl overflow-hidden max-w-2xl mx-auto my-8"
    >
      <div className="bg-rose-500 p-6 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <Icon name="link-2-off" size={28} />
          <h2 className="text-xl font-black uppercase tracking-tighter italic">Google Sheets Connection Error</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <Icon name="x" size={24} />
          </button>
        )}
      </div>

      <div className="p-8 space-y-6">
        <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
          <p className="text-rose-900 font-bold mb-1 italic">Message from Server:</p>
          <p className="text-rose-700 text-sm font-mono leading-relaxed">{error}</p>
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
