import React, { useState, useMemo } from 'react';
import { 
  UserCheck, Clock, CalendarDays, RefreshCw, CheckCircle2, 
  Users, TrendingUp, Banknote, Smartphone, CreditCard, ArrowRight,
  ShieldCheck, AlertCircle, Edit3, Check
} from 'lucide-react';
import { SHIFT_TYPES, DEFAULT_STAFF_MEMBERS } from '../../constants/shifts';
import { getLocalYYYYMMDD } from '../../utils/slots';

export default function ShiftsTab({
  activeShift,
  onOpenSwitchShiftModal,
  onSyncTodayBookingsToStaff,
  onReassignSingleBooking,
  bookings = [],
  transactions = [],
  users = []
}) {
  const todayStr = getLocalYYYYMMDD();
  const [selectedStaffToSync, setSelectedStaffToSync] = useState(activeShift?.staffName || 'Vignesh');
  const [inlineEditingBookingId, setInlineEditingBookingId] = useState(null);

  // Combine staff names
  const allStaffNames = useMemo(() => {
    return Array.from(new Set([
      ...DEFAULT_STAFF_MEMBERS,
      ...users.map(u => u.name).filter(Boolean),
      activeShift?.staffName
    ].filter(Boolean)));
  }, [users, activeShift]);

  // Today's Bookings
  const todayBookings = useMemo(() => {
    return bookings.filter(b => b.date === todayStr);
  }, [bookings, todayStr]);

  // Today's Transactions
  const todayTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = t.date ? getLocalYYYYMMDD(t.date) : todayStr;
      return tDate === todayStr;
    });
  }, [transactions, todayStr]);

  // Performance breakdown by staff for today
  const staffPerformance = useMemo(() => {
    const statsMap = {};

    // Initialize all known staff
    allStaffNames.forEach(name => {
      statsMap[name] = {
        name,
        bookingsCount: 0,
        totalHours: 0,
        cashCollected: 0,
        upiCollected: 0,
        turftownCollected: 0,
        totalRevenue: 0,
        activeOnDuty: activeShift?.staffName === name
      };
    });

    // Aggregate today's bookings
    todayBookings.forEach(b => {
      const staff = b.createdBy || b.bookedBy || 'Staff';
      if (!statsMap[staff]) {
        statsMap[staff] = {
          name: staff,
          bookingsCount: 0,
          totalHours: 0,
          cashCollected: 0,
          upiCollected: 0,
          turftownCollected: 0,
          totalRevenue: 0,
          activeOnDuty: activeShift?.staffName === staff
        };
      }
      statsMap[staff].bookingsCount += 1;
      statsMap[staff].totalHours += (parseFloat(b.duration) || 60) / 60;
    });

    // Aggregate today's transactions
    todayTransactions.forEach(t => {
      if (t.type !== 'income') return;
      const staff = t.createdBy || 'Staff';
      if (!statsMap[staff]) {
        statsMap[staff] = {
          name: staff,
          bookingsCount: 0,
          totalHours: 0,
          cashCollected: 0,
          upiCollected: 0,
          turftownCollected: 0,
          totalRevenue: 0,
          activeOnDuty: activeShift?.staffName === staff
        };
      }
      const amt = Number(t.amount) || 0;
      statsMap[staff].totalRevenue += amt;
      if (t.paymentMode === 'cash') statsMap[staff].cashCollected += amt;
      else if (t.paymentMode === 'upi') statsMap[staff].upiCollected += amt;
      else if (t.paymentMode === 'turftown') statsMap[staff].turftownCollected += amt;
    });

    // Return only staff with activity or active on duty
    return Object.values(statsMap)
      .filter(s => s.activeOnDuty || s.bookingsCount > 0 || s.totalRevenue > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [allStaffNames, todayBookings, todayTransactions, activeShift]);

  // Current shift details
  const activeShiftInfo = SHIFT_TYPES.find(st => st.name === activeShift?.shiftType) || SHIFT_TYPES[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2.5">
            <UserCheck className="text-[#d33638]" size={26} />
            Shift Management & Duty Roster
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Manage who is running the counter today. All new bookings and collections automatically attribute to the on-duty staff.
          </p>
        </div>

        {/* Quick Shift Switch Button */}
        <button
          onClick={onOpenSwitchShiftModal}
          className="bg-[#d33638] hover:bg-[#b42628] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-red-900/20 active:scale-95 flex items-center gap-2"
        >
          <RefreshCw size={15} />
          <span>Switch On-Duty Staff</span>
        </button>
      </div>

      {/* Hero: Active On-Duty Card */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white p-6 rounded-3xl shadow-xl border border-zinc-800 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
                ACTIVE ON-DUTY STAFF
              </span>
              <span className="text-xs text-zinc-400 font-medium ml-2">
                Today: {todayStr}
              </span>
            </div>

            <div>
              <h3 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                {activeShift?.staffName || 'Staff Member'}
                <span className="text-xl">
                  {activeShiftInfo.icon}
                </span>
              </h3>
              <p className="text-sm font-semibold text-zinc-300 mt-1 flex items-center gap-2">
                <span>{activeShift?.shiftType || 'Morning Shift'}</span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">{activeShiftInfo.hours}</span>
              </p>
            </div>

            <p className="text-xs text-zinc-400 max-w-xl">
              Every booking and counter transaction created today is automatically registered under{' '}
              <strong className="text-white font-extrabold">{activeShift?.staffName}</strong>'s name.
            </p>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col gap-3 w-full lg:w-auto min-w-[280px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
              1-Click Booking Reattribution
            </span>

            <button
              onClick={() => onSyncTodayBookingsToStaff(activeShift?.staffName || 'Staff')}
              className="bg-white hover:bg-zinc-100 text-zinc-950 font-extrabold text-xs py-2.5 px-3.5 rounded-xl transition-all flex items-center justify-between gap-2 shadow-sm active:scale-95"
              title="Assign all bookings scheduled today to this on-duty staff"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Assign All Today's Bookings</span>
              </div>
              <span className="bg-zinc-200 text-zinc-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                {todayBookings.length}
              </span>
            </button>

            <button
              onClick={onOpenSwitchShiftModal}
              className="bg-zinc-800/80 hover:bg-zinc-800 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl border border-zinc-700 transition-all flex items-center justify-between gap-2 active:scale-95"
            >
              <div className="flex items-center gap-2">
                <RefreshCw size={15} className="text-amber-400" />
                <span>Switch Shift or Staff</span>
              </div>
              <ArrowRight size={14} className="text-zinc-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Staff Performance & Collections Today */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-base text-zinc-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-[#d33638]" />
              Today's Shift Performance & Collections
            </h3>
            <p className="text-xs text-zinc-400">
              Revenue and bookings attributed to each staff member today ({todayStr})
            </p>
          </div>
        </div>

        {staffPerformance.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 text-xs italic">
            No bookings or transactions logged today yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffPerformance.map((staff) => (
              <div 
                key={staff.name}
                className={`p-4 rounded-2xl border transition-all ${
                  staff.activeOnDuty 
                    ? 'bg-red-50/40 border-[#d33638]/40 shadow-sm ring-1 ring-[#d33638]/20' 
                    : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-zinc-900 flex items-center gap-1.5">
                      {staff.name}
                      {staff.activeOnDuty && (
                        <span className="text-[9px] font-black uppercase bg-[#d33638] text-white px-2 py-0.2 rounded-full">
                          ON DUTY
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-zinc-500 font-medium">
                      {staff.bookingsCount} bookings • {staff.totalHours.toFixed(1)} hrs played
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Collections</span>
                    <span className="text-base font-black text-zinc-900">₹{staff.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>

                {/* Register Breakdown */}
                <div className="grid grid-cols-3 gap-1.5 pt-2.5 border-t border-zinc-200/80 text-center text-xs">
                  <div className="bg-white p-2 rounded-xl border border-zinc-200/60">
                    <span className="text-[9px] font-bold uppercase text-emerald-700 block">Cash</span>
                    <span className="font-black text-zinc-900 text-xs">₹{staff.cashCollected}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-zinc-200/60">
                    <span className="text-[9px] font-bold uppercase text-blue-700 block">UPI</span>
                    <span className="font-black text-zinc-900 text-xs">₹{staff.upiCollected}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-zinc-200/60">
                    <span className="text-[9px] font-bold uppercase text-purple-700 block">TurfTown</span>
                    <span className="font-black text-zinc-900 text-xs">₹{staff.turftownCollected}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's Bookings Attribution Audit Table */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-extrabold text-base text-zinc-900 flex items-center gap-2">
              <CalendarDays size={18} className="text-zinc-600" />
              Today's Bookings & Staff Attribution Audit ({todayBookings.length})
            </h3>
            <p className="text-xs text-zinc-400">
              Review who is assigned to each court booking scheduled today
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStaffToSync}
              onChange={(e) => setSelectedStaffToSync(e.target.value)}
              className="bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-800 outline-none"
            >
              {allStaffNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            <button
              onClick={() => onSyncTodayBookingsToStaff(selectedStaffToSync)}
              className="bg-zinc-900 hover:bg-black text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 shrink-0"
              title={`Set all ${todayBookings.length} today bookings to ${selectedStaffToSync}`}
            >
              <Check size={14} />
              <span>Assign All Today to {selectedStaffToSync}</span>
            </button>
          </div>
        </div>

        {todayBookings.length === 0 ? (
          <div className="text-center py-10 text-zinc-400 text-xs italic">
            No court bookings found for today ({todayStr}).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-[11px] font-black uppercase text-zinc-400 tracking-wider">
                  <th className="py-2.5 px-3">Court / Slot</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Booked Under (Staff)</th>
                  <th className="py-2.5 px-3 text-right">Quick Reassign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {todayBookings.map((b) => {
                  const staffName = b.createdBy || b.bookedBy || 'Staff';
                  const isAssignedToActive = staffName === activeShift?.staffName;

                  return (
                    <tr key={b.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-zinc-900 block">{b.resourceName}</span>
                        <span className="text-[11px] text-zinc-500 font-semibold">{b.startTime} - {b.endTime}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-zinc-900 block">{b.customerName}</span>
                        {b.customerPhone && (
                          <span className="text-[10px] text-zinc-400 font-medium">📱 {b.customerPhone}</span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-semibold text-zinc-600">
                        {b.duration} mins
                      </td>

                      <td className="py-3 px-3 font-extrabold text-zinc-900">
                        ₹{b.totalPrice || b.paidAmount || 0}
                      </td>

                      <td className="py-3 px-3">
                        <span className="uppercase text-[10px] font-black px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                          {b.paymentMode || 'Cash'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg border ${
                          isAssignedToActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                        }`}>
                          <UserCheck size={12} className={isAssignedToActive ? 'text-emerald-600' : 'text-zinc-500'} />
                          {staffName}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <select
                          value={staffName}
                          onChange={(e) => onReassignSingleBooking(b.id, e.target.value)}
                          className="bg-white border border-zinc-200 rounded-lg px-2 py-1 text-[11px] font-bold text-zinc-700 outline-none hover:border-zinc-400 cursor-pointer"
                        >
                          {allStaffNames.map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
