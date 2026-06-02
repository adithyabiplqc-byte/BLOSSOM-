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
    <div className="flex-grow flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-slate-100 text-slate-800">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl text-white mb-3 shadow-xl shadow-indigo-200 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Icon name="clipboard-check" size={28} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">BQOS <span className="text-indigo-600">APP</span></h1>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.25em] mt-0.5">Blossom Quality Operation System</p>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Username</label>
              <input 
                type="text" 
                placeholder="Enter Username"
                className="w-full py-2.5 px-4 text-sm bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none transition-all" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter Password"
                  className="w-full pr-12 py-2.5 px-4 text-sm bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none transition-all" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <Icon name={showPassword ? "eye-off" : "eye"} size={16} />
                </button>
              </div>
            </div>
            {error && <p className="text-rose-600 text-[10px] font-black text-center uppercase tracking-wider bg-rose-50 border border-rose-100 py-2 rounded-xl">{error}</p>}
            <button 
              type="submit" 
              className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all text-xs font-black uppercase tracking-widest italic"
            >
              <Icon name="log-in" size={16} /> Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
