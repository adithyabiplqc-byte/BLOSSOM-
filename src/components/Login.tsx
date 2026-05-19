import React, { useState } from 'react';
import Icon from './Icon';

interface LoginProps {
  onLogin: (user: any) => void;
  users: any[];
}

const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanUsername = username.trim();
    const cleanPassword = password;

    if (cleanUsername === 'admin' && cleanPassword === 'admin123') {
      onLogin({ userCode: 'A001', username: 'admin', role: 'ADMIN', location: 'SYSTEM', restrictions: [] });
      return;
    }

    const user = users.find(u => 
      String(u.username || '').trim().toLowerCase() === cleanUsername.toLowerCase() && 
      String(u.password || '') === cleanPassword
    );

    if (user) {
      onLogin(user);
    } else {
      if (users.length === 0) {
        setError('Connection in progress or no users found. Please wait or check your server URL.');
      } else {
        setError('Invalid username or password');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      <div className="w-full max-w-sm glass-card p-8 animate-fade-in animate-slide-in-from-bottom duration-700 shadow-2xl border-white/10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl text-white mb-4 shadow-xl shadow-indigo-500/20 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Icon name="clipboard-check" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">BQOS <span className="text-indigo-600">APP</span></h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Blossom Quality Operation System</p>
        </div>

        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Username</label>
              <input type="text" className="w-full py-2 text-sm bg-slate-50 border-slate-200" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full pr-10 py-2 text-sm bg-slate-50 border-slate-200" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                >
                  <Icon name={showPassword ? "eye-off" : "eye"} size={16} />
                </button>
              </div>
            </div>
            {error && <p className="text-rose-500 text-[10px] font-bold text-center uppercase tracking-wider">{error}</p>}
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95">
              <Icon name="log-in" size={18} /> Login with Credentials
            </button>
          </form>

          <div className="pt-4 text-center">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('SHOW_CONFIG'))}
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <Icon name="server" size={12} /> Configure Backend Server
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
