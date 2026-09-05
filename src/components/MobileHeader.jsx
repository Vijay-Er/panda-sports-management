import React from 'react';
import { Volume2, VolumeX, LogOut, BellRing } from 'lucide-react';

export default function MobileHeader({ 
  activeTab, 
  setActiveTab, 
  soundEnabled, 
  setSoundEnabled,
  onTestSound,
  currentUser,
  onLogout 
}) {
  const isSuperAdmin = currentUser?.role === 'super_admin';

  return (
    <header className="md:hidden bg-white p-3 border-b border-zinc-200 flex justify-between items-center shrink-0 print:hidden shadow-sm">
      <div className="flex items-center space-x-2.5">
        <img 
          src="/panda-logo.png" 
          alt="Panda Sports Academy" 
          className="h-7 w-auto object-contain"
        />
        <div className="border-l border-zinc-200 pl-2">
          <span className="text-[10px] text-zinc-800 font-extrabold block leading-none">
            {currentUser?.name || 'Staff'}
          </span>
          <span className="text-[9px] text-panda-600 font-black uppercase tracking-wide">
            {isSuperAdmin ? 'Super Admin' : 'Admin'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Test Alarm sound button */}
        <button
          type="button"
          onClick={onTestSound}
          className="p-1 text-zinc-600 hover:text-amber-600 rounded-lg hover:bg-zinc-100"
          title="Test alarm chime"
        >
          <BellRing size={16} className="text-amber-600" />
        </button>

        {/* Toggle Sound */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1 text-zinc-600 hover:text-black rounded-lg hover:bg-zinc-100"
          title="Sound alert toggle"
        >
          {soundEnabled ? <Volume2 size={16} className="text-emerald-600" /> : <VolumeX size={16} className="text-zinc-400" />}
        </button>

        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-bold py-1 px-1.5 focus:outline-none"
        >
          <option value="dashboard">Dashboard</option>
          <option value="bookings">Bookings</option>
          <option value="customers">Customers</option>
          <option value="classes">Classes & Batches</option>
          <option value="tournaments">Tournaments</option>
          <option value="beverages">Beverages POS</option>
          <option value="accounts">Accounts</option>
          {isSuperAdmin && <option value="admins">Admin Directory</option>}
        </select>

        <button
          onClick={onLogout}
          className="p-1 text-zinc-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          title="Logout session"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
