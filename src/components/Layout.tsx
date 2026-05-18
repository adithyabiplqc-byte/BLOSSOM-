import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { User } from '../types';
import { LogOut, User as UserIcon, Settings, ClipboardList } from 'lucide-react';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
}

export default function Layout({ user, onLogout }: LayoutProps) {
  const navigate = useNavigate();

  if (!user) return <Outlet />;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <ClipboardList size={24} />
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-800">BQOS</h1>
            <p className="text-xs text-slate-500 uppercase tracking-wider">{user.role} DASHBOARD</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="font-semibold text-slate-700">{user.username}</span>
            <span className="text-xs text-slate-500">{user.location}</span>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
