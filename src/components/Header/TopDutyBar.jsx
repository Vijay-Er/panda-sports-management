import React from 'react';
import { UserCheck, RefreshCw, Plus, Coffee, Calendar, Clock } from 'lucide-react';
import { getLocalYYYYMMDD } from '../../utils/slots';
import { SHIFT_TYPES } from '../../constants/shifts';

export default function TopDutyBar({
  activeShift,
  onOpenSwitchShiftModal,
  onOpenBookingModal,
  onOpenQuickBeverage
}) {
  const todayStr = getLocalYYYYMMDD();
  const shiftInfo = SHIFT_TYPES.find(s => s.name === activeShift?.shiftType) || SHIFT_TYPES[0];

  return (
    <div className="bg-white border-b border-zinc-200/80 px-4 md:px-8 py-2.5 print:hidden sticky top-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Active On-Duty Staff Indicator */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200/80 rounded-xl px-3 py-1.5 shadow-sm">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>

            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              On Duty:
            </span>

            <span className="text-xs font-black text-zinc-900 flex items-center gap-1">
              {activeShift?.staffName || 'Staff Member'}
            </span>

            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
              <span>{shiftInfo.icon}</span>
              <span>{activeShift?.shiftType || 'Morning Shift'}</span>
            </span>
          </div>

          {/* Quick Switch Button */}
          <button
            onClick={onOpenSwitchShiftModal}
            className="text-[11px] font-bold text-zinc-700 hover:text-black bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-xl px-2.5 py-1.5 transition-all flex items-center gap-1 active:scale-95"
            title="Change who is on duty or switch shift"
          >
            <RefreshCw size={12} className="text-[#d33638]" />
            <span>Switch Shift</span>
          </button>
        </div>

        {/* Right: Quick Action Shortcuts */}
        <div className="flex items-center gap-2">
          {/* Quick Court Booking */}
          {onOpenBookingModal && (
            <button
              onClick={() => onOpenBookingModal('court')}
              className="bg-[#d33638] hover:bg-[#b42628] text-white px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm shadow-red-900/20 active:scale-95 flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Book Court</span>
            </button>
          )}

          {/* Quick Beverage Drink */}
          {onOpenQuickBeverage && (
            <button
              onClick={onOpenQuickBeverage}
              className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1"
            >
              <Coffee size={13} />
              <span className="hidden sm:inline">Sell Drink</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
