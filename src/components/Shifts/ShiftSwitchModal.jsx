import React, { useState } from 'react';
import { X, UserCheck, Clock, Check, Users, Sparkles, RefreshCw } from 'lucide-react';
import { SHIFT_TYPES, DEFAULT_STAFF_MEMBERS } from '../../constants/shifts';
import { getLocalYYYYMMDD } from '../../utils/slots';

export default function ShiftSwitchModal({
  isOpen,
  onClose,
  activeShift,
  onSwitchShift,
  todayBookingsCount = 0,
  users = []
}) {
  const [selectedStaff, setSelectedStaff] = useState(activeShift?.staffName || 'Vignesh');
  const [customStaff, setCustomStaff] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [shiftType, setShiftType] = useState(activeShift?.shiftType || 'Morning Shift');
  const [syncTodayBookings, setSyncTodayBookings] = useState(true);

  if (!isOpen) return null;

  // Combine default staff with any registered system users
  const knownStaff = Array.from(new Set([
    ...DEFAULT_STAFF_MEMBERS,
    ...users.map(u => u.name).filter(Boolean)
  ]));

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalStaff = (isCustom ? customStaff.trim() : selectedStaff) || 'Staff Member';

    onSwitchShift({
      staffName: finalStaff,
      shiftType: shiftType,
      shiftDate: getLocalYYYYMMDD(),
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: `Active shift updated at ${new Date().toLocaleTimeString()}`
    }, syncTodayBookings);

    onClose();
  };

  const currentChosenStaff = isCustom ? (customStaff || 'Staff') : selectedStaff;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border border-zinc-100">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400">
              <UserCheck size={22} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                Shift & On-Duty Management
              </h3>
              <p className="text-xs text-zinc-300">
                Select who is currently working and managing the counter
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Active Duty Indicator Preview */}
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Assigning On-Duty Responsibility:
                </span>
                <span className="text-sm font-black text-emerald-950">
                  {currentChosenStaff} • {shiftType}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
              Today: {getLocalYYYYMMDD()}
            </span>
          </div>

          {/* 1. Who is on shift today? */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2 flex items-center gap-1.5">
              <Users size={14} className="text-[#d33638]" />
              Select Staff Member On Duty
            </label>

            {/* Quick Staff Selection Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2.5">
              {knownStaff.map((staff) => {
                const isSelected = !isCustom && selectedStaff === staff;
                return (
                  <button
                    key={staff}
                    type="button"
                    onClick={() => {
                      setSelectedStaff(staff);
                      setIsCustom(false);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#d33638] text-white border-[#d33638] shadow-sm shadow-red-900/20'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    <span>{staff}</span>
                    {isSelected && <Check size={14} />}
                  </button>
                );
              })}

              {/* Custom Staff Option */}
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                  isCustom
                    ? 'bg-[#d33638] text-white border-[#d33638] shadow-sm'
                    : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                }`}
              >
                <span>+ Other Name</span>
                {isCustom && <Check size={14} />}
              </button>
            </div>

            {isCustom && (
              <div className="animate-in fade-in duration-150">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Enter staff person's full name"
                  value={customStaff}
                  onChange={(e) => setCustomStaff(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:ring-2 focus:ring-[#d33638] outline-none"
                />
              </div>
            )}
          </div>

          {/* 2. Shift Slot / Timing */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2 flex items-center gap-1.5">
              <Clock size={14} className="text-[#d33638]" />
              Select Shift Timing
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SHIFT_TYPES.map((st) => {
                const isSelected = shiftType === st.name;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setShiftType(st.name)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    <div className="text-base mb-1">{st.icon}</div>
                    <div className="text-xs font-bold leading-tight">{st.name}</div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      {st.hours}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Automatic Today's Bookings Attribution Switch */}
          <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={syncTodayBookings}
                onChange={(e) => setSyncTodayBookings(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#d33638] focus:ring-[#d33638] cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-extrabold text-amber-950 block">
                  Assign All Today's Bookings to {currentChosenStaff}
                </span>
                <span className="text-amber-800 text-[11px] block mt-0.5 leading-relaxed">
                  Automatically set {currentChosenStaff} as the booked-by staff member for all{' '}
                  <span className="font-bold underline">{todayBookingsCount} booking(s)</span> scheduled today.
                </span>
              </div>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] py-3 px-4 bg-[#d33638] hover:bg-[#b42628] text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-red-900/20 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <RefreshCw size={15} />
              <span>Confirm & Activate Shift</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
