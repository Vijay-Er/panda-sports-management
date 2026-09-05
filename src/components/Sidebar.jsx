import React from 'react';
import { 
  LayoutDashboard, CalendarDays, Users, Trophy, Coffee, Wallet, GraduationCap,
  Volume2, VolumeX, DownloadCloud, ShieldCheck, LogOut, BellRing 
} from 'lucide-react';
import { exportAllDataJSON } from '../utils/storage';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  soundEnabled, 
  setSoundEnabled,
  onTestSound,
  allAppData,
  currentUser,
  onLogout
}) {
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'bookings', label: 'Manage Bookings', icon: <CalendarDays size={20} /> },
    { id: 'customers', label: 'Customer Directory', icon: <Users size={20} /> },
    { id: 'classes', label: 'Classes & Batches', icon: <GraduationCap size={20} /> },
    { id: 'tournaments', label: 'Tournaments & Cups', icon: <Trophy size={20} /> },
    { id: 'beverages', label: 'Beverages POS', icon: <Coffee size={20} /> },
    { id: 'accounts', label: 'Accounts Ledger', icon: <Wallet size={20} /> },
    ...(isSuperAdmin ? [
      { id: 'admins', label: 'Admin Management', icon: <ShieldCheck size={20} /> }
    ] : [])
  ];

  return (
    <aside className="w-64 bg-white border-r border-zinc-200 hidden md:flex flex-col z-10 print:hidden select-none">
      {/* Brand Header with Official Logo */}
      <div className="p-5 border-b border-zinc-100 flex flex-col items-center justify-center text-center bg-gradient-to-b from-white to-zinc-50/50">
        <div className="w-full flex justify-center items-center py-1">
          <img 
            src="/panda-logo.png" 
            alt="Panda Sports Academy" 
            className="h-12 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform"
          />
        </div>
        <div className="mt-1.5 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-panda-600 animate-pulse"></span>
          <p className="text-[10px] text-zinc-500 font-extrabold tracking-widest uppercase font-sports">
            Official Management Portal
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-[#d33638] text-white shadow-md shadow-red-900/20 translate-x-1'
                  : 'text-zinc-600 hover:bg-red-50 hover:text-[#d33638]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Current User Card */}
      {currentUser && (
        <div className="px-4 py-3 border-t border-zinc-100 bg-zinc-50/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white shrink-0 ${
                isSuperAdmin ? 'bg-purple-900' : 'bg-zinc-900'
              }`}>
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-zinc-900 truncate leading-tight">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                    isSuperAdmin 
                      ? 'bg-purple-100 text-purple-800 border-purple-200' 
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  }`}>
                    {isSuperAdmin ? 'Super Admin' : 'Admin'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="text-zinc-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-white transition-colors"
              title="Logout session"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Footer controls: Sound Alert Mute Toggle, Test Alarm, & Data Backup */}
      <div className="p-4 border-t border-zinc-100 space-y-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              soundEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100'
            }`}
            title="Toggle audio buzzer for 15-minute ending notifications"
          >
            <span className="flex items-center gap-1.5">
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              Sound
            </span>
            <span className="uppercase text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-white/80">
              {soundEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Direct Sound Test Button */}
          <button
            type="button"
            onClick={onTestSound}
            className="px-2.5 py-2.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 flex items-center gap-1 transition-all active:scale-95"
            title="Test alert sound right now"
          >
            <BellRing size={14} className="text-amber-600" />
            <span>Test</span>
          </button>
        </div>

        <button
          onClick={() => exportAllDataJSON(allAppData)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
          title="Download complete JSON backup file"
        >
          <DownloadCloud size={14} />
          <span>Export Backup JSON</span>
        </button>
      </div>
    </aside>
  );
}
