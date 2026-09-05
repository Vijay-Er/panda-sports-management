import React, { useState } from 'react';
import { 
  Filter, Activity, CheckCircle, Coffee, Clock, 
  Banknote, Smartphone, CreditCard, MessageSquare 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { COURTS } from '../../constants/resources';
import { getLocalYYYYMMDD } from '../../utils/slots';
import { openWhatsAppShare } from '../../utils/whatsapp';
import CollectBalanceModal from '../Bookings/CollectBalanceModal';

export default function DashboardTab({
  bookings,
  transactions,
  accounts,
  dateFilter,
  setDateFilter,
  statusFilter,
  setStatusFilter,
  currentTime,
  onCancelBooking,
  onCollectBalance,
  onSelectCustomer
}) {
  const [selectedBookingForBalance, setSelectedBookingForBalance] = useState(null);
  // Filter bookings based on selected Date Range and Status
  const filteredBookings = bookings.filter(b => {
    const inRange = b.date >= dateFilter.start && b.date <= dateFilter.end;
    const statusMatch = statusFilter === 'all' || b.status === statusFilter;
    return inRange && statusMatch;
  });

  const activeCount = filteredBookings.filter(b => b.status === 'active').length;
  const finishedCount = filteredBookings.filter(b => b.status === 'finished').length;

  // Filter Transactions for the selected date range
  const filteredTransactions = transactions.filter(t => {
    const tDate = getLocalYYYYMMDD(t.date);
    return tDate >= dateFilter.start && tDate <= dateFilter.end;
  });

  const filteredRevenue = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const beveragesSoldCount = filteredTransactions
    .filter(t => (t.category === 'Beverage' || t.category === 'Snacks') && t.type === 'income')
    .length;

  // Aggregating Data for the Chart
  const chartData = [
    { name: 'Standard Courts', Revenue: 0 },
    { name: 'Group Matches', Revenue: 0 },
    { name: 'Store & Snacks', Revenue: 0 },
  ];

  filteredTransactions.forEach(t => {
    if (t.type !== 'income') return;
    if (t.category === 'Court Booking') chartData[0].Revenue += t.amount;
    else if (t.category === 'Group Booking') chartData[1].Revenue += t.amount;
    else if (t.category === 'Beverage' || t.category === 'Snacks') chartData[2].Revenue += t.amount;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-zinc-800 font-bold text-sm">
          <Filter size={18} className="text-zinc-500" />
          <span>Analytics & Court Schedule Filter</span>
        </div>
        <div className="flex flex-wrap gap-2.5 items-center w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5">
            <span className="text-xs text-zinc-400 font-medium">From</span>
            <input 
              type="date" 
              value={dateFilter.start} 
              onChange={e => setDateFilter({...dateFilter, start: e.target.value})} 
              className="bg-transparent text-xs font-semibold outline-none text-zinc-700" 
            />
          </div>
          <span className="text-zinc-400 text-xs font-bold">to</span>
          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5">
            <span className="text-xs text-zinc-400 font-medium">To</span>
            <input 
              type="date" 
              value={dateFilter.end} 
              onChange={e => setDateFilter({...dateFilter, end: e.target.value})} 
              className="bg-transparent text-xs font-semibold outline-none text-zinc-700" 
            />
          </div>

          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)} 
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs outline-none font-bold text-zinc-700 focus:border-zinc-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="finished">Finished Only</option>
            <option value="canceled">Canceled Only</option>
          </select>

          <button
            onClick={() => setDateFilter({ start: getLocalYYYYMMDD(), end: getLocalYYYYMMDD() })}
            className="text-xs px-3 py-2 bg-panda-50 hover:bg-panda-100 text-panda-700 border border-panda-200 rounded-xl font-bold transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100/80">
          <p className="text-xs text-blue-600 font-bold uppercase mb-1 flex items-center gap-1.5">
            <Activity size={15} /> Active Bookings
          </p>
          <p className="text-2xl font-black text-blue-950">{activeCount}</p>
          <p className="text-[11px] text-zinc-400 mt-1 font-medium">In selected date range</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100/80">
          <p className="text-xs text-emerald-600 font-bold uppercase mb-1 flex items-center gap-1.5">
            <CheckCircle size={15} /> Finished Games
          </p>
          <p className="text-2xl font-black text-emerald-950">{finishedCount}</p>
          <p className="text-[11px] text-zinc-400 mt-1 font-medium">Completed matches</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-100/80">
          <p className="text-xs text-amber-600 font-bold uppercase mb-1 flex items-center gap-1.5">
            <Coffee size={15} /> POS Items Sold
          </p>
          <p className="text-2xl font-black text-amber-950">{beveragesSoldCount}</p>
          <p className="text-[11px] text-zinc-400 mt-1 font-medium">Drinks & Snacks</p>
        </div>
        <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-panda-950 p-5 rounded-2xl shadow-md border border-panda-900/40 text-white">
          <p className="text-xs text-panda-300 font-bold uppercase mb-1 tracking-wider">Total Revenue</p>
          <p className="text-2xl font-black text-white">₹{filteredRevenue.toLocaleString()}</p>
          <p className="text-[11px] text-zinc-400 mt-1 font-medium">Courts & Store</p>
        </div>
      </div>

      {/* Graph Chart & Current Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-zinc-900">
              Revenue Breakdown by Category
            </h3>
            <span className="text-xs text-zinc-500 font-medium">Period: {dateFilter.start} to {dateFilter.end}</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d33638" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d33638" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} allowDecimals={false} />
                <Tooltip 
                  cursor={{ stroke: '#d33638', strokeWidth: 2, strokeDasharray: '3 3' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(211,54,56,0.15)' }} 
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="Revenue" stroke="#d33638" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current Balances Box */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-zinc-900 mb-1">Current Active Balances</h3>
            <p className="text-xs text-zinc-500 mb-4">Cash in drawer, UPI & Turftown receivables</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-100">
                <span className="font-bold text-emerald-800 flex items-center gap-2 text-sm">
                  <Banknote size={18} /> Cash in Hand
                </span>
                <span className="font-extrabold text-emerald-950 text-base">₹{accounts.cash.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-blue-50/80 rounded-xl border border-blue-100">
                <span className="font-bold text-blue-800 flex items-center gap-2 text-sm">
                  <Smartphone size={18} /> UPI Register
                </span>
                <span className="font-extrabold text-blue-950 text-base">₹{accounts.upi.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-purple-50/80 rounded-xl border border-purple-100">
                <span className="font-bold text-purple-800 flex items-center gap-2 text-sm">
                  <CreditCard size={18} /> Turftown
                </span>
                <span className="font-extrabold text-purple-950 text-base">₹{accounts.turftown.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-zinc-100 flex justify-between items-center text-sm font-bold text-zinc-700">
            <span>Combined Total:</span>
            <span className="text-zinc-900 text-lg">₹{accounts.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Live Court Status Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
            <Clock size={19} className="text-zinc-600" />
            Live Court Schedule (4 Courts)
          </h3>
          <span className="text-xs text-zinc-500 font-medium">
            Auto-refreshes every 10s
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COURTS.map(resource => {
            const resourceBookings = filteredBookings
              .filter(b => b.resourceId === resource.id)
              .sort((a, b) => {
                if (a.date === b.date) return a.startTime.localeCompare(b.startTime);
                return a.date.localeCompare(b.date);
              });

            return (
              <div key={resource.id} className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-2.5 mb-3">
                  <h4 className="font-bold text-sm text-zinc-900">{resource.name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                    resource.name.includes('Premium')
                      ? 'bg-panda-50 text-panda-700 border-panda-200'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                  }`}>
                    Court
                  </span>
                </div>

                <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[320px] pr-1">
                  {resourceBookings.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-xs text-zinc-400 italic">No bookings scheduled</p>
                    </div>
                  ) : (
                    resourceBookings.map(b => {
                      const isToday = b.date === getLocalYYYYMMDD(currentTime);
                      let diffMins = null;
                      if (isToday && b.status === 'active') {
                        const [endH, endM] = b.endTime.split(':').map(Number);
                        const ends = new Date(currentTime);
                        ends.setHours(endH, endM, 0, 0);
                        const diffMs = ends - currentTime;
                        diffMins = Math.ceil(diffMs / 60000);
                      }

                      return (
                        <div 
                          key={b.id} 
                          className={`p-3 rounded-xl border-l-4 relative group transition-all ${
                            b.status === 'canceled' 
                              ? 'bg-zinc-100/70 border-zinc-400 opacity-60' 
                              : b.status === 'finished' 
                              ? 'bg-emerald-50/70 border-emerald-500' 
                              : b.alerted 
                              ? 'bg-amber-50 border-amber-500' 
                              : 'bg-zinc-50 border-panda-600 hover:bg-white hover:shadow-sm'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <span className="text-[11px] font-bold text-zinc-600 bg-zinc-200/60 px-1.5 py-0.5 rounded">
                              {b.date}
                            </span>
                            
                            <div className="flex gap-1.5 items-center">
                              {diffMins !== null && diffMins > 0 && diffMins <= 120 && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse ${
                                  diffMins <= 15 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                }`}>
                                  Ends in {diffMins}m
                                </span>
                              )}

                              {b.status === 'active' && (
                                <button 
                                  onClick={() => onCancelBooking(b.id)} 
                                  className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                                >
                                  Cancel
                                </button>
                              )}

                              {b.status === 'finished' && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                  Done
                                </span>
                              )}
                              {b.status === 'canceled' && (
                                <span className="text-[10px] font-bold text-zinc-500 bg-zinc-200 px-1.5 py-0.5 rounded">
                                  Canceled
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="font-extrabold text-zinc-800 text-xs tracking-tight">
                            {b.startTime} - {b.endTime} ({b.duration} mins)
                          </div>
                          <div className="flex items-center justify-between gap-1 mt-1">
                            <span className="text-zinc-700 font-semibold text-xs leading-tight line-clamp-1">
                              {b.customerName}
                            </span>
                            {b.customerPhone && (
                              <button
                                type="button"
                                onClick={() => onSelectCustomer && onSelectCustomer({ name: b.customerName, phone: b.customerPhone })}
                                className="text-[10px] text-blue-700 hover:text-blue-900 font-bold bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 transition-colors shrink-0"
                                title="Open CRM Profile"
                              >
                                📱 {b.customerPhone}
                              </button>
                            )}
                          </div>
                          {b.comments && (
                            <div className="text-[11px] text-zinc-500 italic mt-1 bg-white/60 p-1 rounded border border-zinc-100 line-clamp-1">
                              {b.comments}
                            </div>
                          )}
                          {/* Rentals indicators */}
                          {b.rentals && (b.rentals.paddles > 0 || b.rentals.shoes > 0 || b.rentals.balls > 0) && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {b.rentals.paddles > 0 && (
                                <span className="text-[9px] font-extrabold bg-emerald-100/80 text-emerald-800 px-1.5 py-0.5 rounded">
                                  🏓 {b.rentals.paddles}
                                </span>
                              )}
                              {b.rentals.shoes > 0 && (
                                <span className="text-[9px] font-extrabold bg-blue-100/80 text-blue-800 px-1.5 py-0.5 rounded">
                                  👟 {b.rentals.shoes} {b.rentals.shoeSizes ? `(${b.rentals.shoeSizes})` : ''}
                                </span>
                              )}
                              {b.rentals.balls > 0 && (
                                <span className="text-[9px] font-extrabold bg-amber-100/80 text-amber-800 px-1.5 py-0.5 rounded">
                                  🎾 {b.rentals.balls}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-1.5 mt-2.5 pt-2 border-t border-zinc-200/50">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-extrabold text-zinc-500 uppercase bg-zinc-200/70 px-1.5 py-0.5 rounded">
                                {b.serviceType}
                              </span>
                              {(b.pendingBalance || 0) > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedBookingForBalance(b)}
                                  className="text-[9px] font-black uppercase bg-amber-100 hover:bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300 transition-colors flex items-center gap-0.5"
                                  title="Click to collect pending balance"
                                >
                                  <span>Due: ₹{b.pendingBalance}</span>
                                </button>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => openWhatsAppShare(b)}
                              className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1 transition-colors border border-emerald-200"
                              title="Share WhatsApp confirmation slip"
                            >
                              <MessageSquare size={11} />
                              <span>WhatsApp</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collect Balance Modal */}
      {onCollectBalance && (
        <CollectBalanceModal
          isOpen={!!selectedBookingForBalance}
          onClose={() => setSelectedBookingForBalance(null)}
          booking={selectedBookingForBalance}
          onCollectBalance={onCollectBalance}
        />
      )}
    </div>
  );
}
