import React, { useState, useMemo } from 'react';
import { 
  Users, UserPlus, Search, Phone, MessageSquare, Calendar, Award, 
  DollarSign, Clock, Edit, Trash2, ExternalLink, Download, Sunrise, 
  Sunset, MapPin, Briefcase, Ticket, Wallet, Star
} from 'lucide-react';

export default function CustomersTab({
  customers = [],
  bookings = [],
  students = [],
  onOpenAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onBookForCustomer,
  onEnrollCustomer,
  onOpenWalletTopup,
  onViewCRM
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Enrich customer records with real booking & academy metrics
  const enrichedCustomers = useMemo(() => {
    return customers.map(cust => {
      const cleanPhone = (cust.phone || '').replace(/\D/g, '').slice(-10);
      const custName = (cust.name || '').trim().toLowerCase();

      // Find all bookings for this customer
      const playerBookings = bookings.filter(b => {
        const bPhone = (b.customerPhone || b.playerPhone || '').replace(/\D/g, '').slice(-10);
        if (cleanPhone && bPhone) return cleanPhone === bPhone;
        const bName = (b.customerName || b.playerName || '').trim().toLowerCase();
        return bName && bName === custName;
      });

      // Find all academy student enrollments
      const playerStudents = students.filter(s => {
        const sPhone = (s.phone || s.parentPhone || '').replace(/\D/g, '').slice(-10);
        if (cleanPhone && sPhone) return cleanPhone === sPhone;
        const sName = (s.name || s.studentName || '').trim().toLowerCase();
        return sName && sName === custName;
      });

      const totalMatches = playerBookings.length;
      const totalMinutes = playerBookings.reduce((sum, b) => sum + (Number(b.duration) || 60), 0);
      const totalHours = (totalMinutes / 60).toFixed(1);

      const bookingSpend = playerBookings.reduce((sum, b) => sum + (Number(b.paidAmount || b.price || b.totalAmount) || 0), 0);
      const studentSpend = playerStudents.reduce((sum, s) => sum + (Number(s.feeAmount || s.monthlyFee) || 0), 0);
      const totalSpend = bookingSpend + studentSpend + (Number(cust.totalSpend) || 0);

      const isCourtPlayer = totalMatches > 0;
      const isAcademyStudent = playerStudents.length > 0;

      return {
        ...cust,
        totalMatches,
        totalHours,
        totalSpend,
        isCourtPlayer,
        isAcademyStudent
      };
    }).sort((a, b) => b.totalSpend - a.totalSpend);
  }, [customers, bookings, students]);

  // Filter list
  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return enrichedCustomers.filter(cust => {
      const matchesSearch = !term ||
        cust.name?.toLowerCase().includes(term) ||
        cust.phone?.includes(term) ||
        cust.area?.toLowerCase().includes(term) ||
        cust.occupation?.toLowerCase().includes(term) ||
        cust.email?.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      switch (activeFilter) {
        case 'Court': return cust.isCourtPlayer || cust.preferredService === 'Court Booking';
        case 'Academy': return cust.isAcademyStudent || cust.preferredService === 'Academy Only';
        case 'Morning': return cust.preferredTime === 'Morning' || cust.preferredTime === 'Both';
        case 'Evening': return cust.preferredTime === 'Evening' || cust.preferredTime === 'Both';
        case 'All':
        default: return true;
      }
    });
  }, [enrichedCustomers, searchTerm, activeFilter]);

  // Stats
  const totalCustomers = enrichedCustomers.length;
  const morningCount = enrichedCustomers.filter(c => c.preferredTime === 'Morning' || c.preferredTime === 'Both').length;
  const eveningCount = enrichedCustomers.filter(c => c.preferredTime === 'Evening' || c.preferredTime === 'Both').length;
  const totalSpendSum = enrichedCustomers.reduce((sum, c) => sum + (Number(c.totalSpend) || 0), 0);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Name', 'Phone', 'Area', 'Time Preference', 'Play Style', 'Occupation', 'Interests', 'Total Hours', 'Total Spend'];
    const rows = filteredCustomers.map(c => [
      `"${c.name || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.area || ''}"`,
      `"${c.preferredTime || ''}"`,
      `"${c.preferredService || ''}"`,
      `"${c.occupation || ''}"`,
      `"${(c.interests || []).join('; ')}"`,
      `"${c.totalHours || 0}"`,
      `"${c.totalSpend || 0}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Panda_Customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black text-zinc-900 tracking-tight">Customer Database</h2>
            <span className="bg-red-50 text-[#d33638] text-[11px] font-black px-2.5 py-0.5 rounded-full border border-red-200">
              {totalCustomers} Players
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Player preferences, morning/evening slots, localities, and direct booking
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex-1 md:flex-none px-3.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            title="Download CSV report"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddCustomer}
            className="flex-1 md:flex-none px-4 py-2.5 bg-[#d33638] hover:bg-[#b0292b] text-white rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-sm shadow-red-900/20 active:scale-95"
          >
            <UserPlus size={16} />
            <span>+ Add Customer</span>
          </button>
        </div>
      </div>

      {/* 2. Sleek Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-red-50 text-[#d33638] flex items-center justify-center font-bold shrink-0">
            <Users size={20} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">Total Players</span>
            <span className="text-2xl font-black text-zinc-900 leading-none">{totalCustomers}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Sunrise size={20} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">Morning Regulars</span>
            <span className="text-2xl font-black text-zinc-900 leading-none">{morningCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <Sunset size={20} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">Evening Regulars</span>
            <span className="text-2xl font-black text-zinc-900 leading-none">{eveningCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <DollarSign size={20} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">Total Spend</span>
            <span className="text-2xl font-black text-emerald-700 leading-none">₹{totalSpendSum.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 3. Search Bar & Clean Filter Pills */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-3 rounded-2xl border border-zinc-200/80 shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search player name, mobile, area (e.g. Anna Nagar), or occupation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 focus:border-[#d33638] focus:bg-white rounded-xl text-xs font-semibold text-zinc-900 outline-none transition-all placeholder:text-zinc-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'All', label: 'All', count: totalCustomers },
            { id: 'Morning', label: '🌅 Morning', count: morningCount },
            { id: 'Evening', label: '🌆 Evening', count: eveningCount },
            { id: 'Court', label: '🏸 Court' },
            { id: 'Academy', label: '🥋 Academy' }
          ].map(f => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <span>{f.label}</span>
                {f.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-600'
                  }`}>
                    {f.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Customer Directory List */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-200 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                <th className="p-4">Customer Details</th>
                <th className="p-4">Preferences</th>
                <th className="p-4">Hours & Pass</th>
                <th className="p-4">Total Spend</th>
                <th className="p-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-zinc-400">
                    <Users size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="font-bold text-sm text-zinc-700">No customers found</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Try searching with a different name, phone, or area</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(cust => {
                  const cleanPhone = (cust.phone || '').replace(/\D/g, '').slice(-10);
                  
                  return (
                    <tr key={cust.id} className="hover:bg-zinc-50/60 transition-colors">
                      {/* Name & Contact */}
                      <td className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-50 to-red-100 text-[#d33638] font-black text-sm flex items-center justify-center shrink-0 border border-red-200/60">
                            {cust.name?.charAt(0)?.toUpperCase() || 'P'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-zinc-900 text-sm leading-snug">
                                {cust.name}
                              </span>
                              {cust.membershipType === 'VIP' && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <Star size={10} className="fill-amber-600 text-amber-600" /> VIP
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 mt-1 text-[11px] font-medium text-zinc-500">
                              <button
                                type="button"
                                onClick={() => onViewCRM && onViewCRM(cust)}
                                className="font-mono text-zinc-700 font-bold hover:text-[#d33638] flex items-center gap-1"
                              >
                                <Phone size={12} className="text-zinc-400" />
                                <span>+91 {cleanPhone}</span>
                              </button>

                              {cust.area && (
                                <span className="flex items-center gap-0.5 text-zinc-600 font-semibold bg-zinc-100 px-1.5 py-0.5 rounded">
                                  <MapPin size={11} className="text-[#d33638]" /> {cust.area}
                                </span>
                              )}
                            </div>

                            {cust.occupation && (
                              <p className="text-[10px] text-zinc-400 font-medium mt-0.5 flex items-center gap-1">
                                <Briefcase size={10} /> {cust.occupation}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Preferences */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1 items-start">
                          <div className="flex items-center gap-1.5">
                            {cust.preferredTime === 'Morning' && (
                              <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1">
                                <Sunrise size={11} /> Morning
                              </span>
                            )}
                            {cust.preferredTime === 'Evening' && (
                              <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1">
                                <Sunset size={11} /> Evening
                              </span>
                            )}
                            {(cust.preferredTime === 'Both' || !cust.preferredTime) && (
                              <span className="bg-zinc-100 text-zinc-700 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                                Flexible Time
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] font-bold text-zinc-500 mt-0.5">
                            {cust.preferredService === 'Court Booking' && '🏸 Court Booking'}
                            {cust.preferredService === 'Group Game' && '👥 Group Matches'}
                            {(cust.preferredService === 'Both' || !cust.preferredService) && '⚡ Court & Group'}
                          </div>
                        </div>
                      </td>

                      {/* Hours & Wallet */}
                      <td className="p-4">
                        <div>
                          <span className="font-extrabold text-zinc-900 block">
                            {cust.totalHours} hrs played
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              ₹{cust.walletBalance || 0}
                            </span>
                            {(Number(cust.passHours) || 0) > 0 && (
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-red-50 text-[#d33638] border border-red-200">
                                {cust.passHours}h Pass
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Total Spend */}
                      <td className="p-4">
                        <span className="font-black text-sm text-zinc-900 block">
                          ₹{cust.totalSpend.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {cust.totalMatches} bookings
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Click Book Slot */}
                          <button
                            type="button"
                            onClick={() => onBookForCustomer && onBookForCustomer(cust)}
                            className="px-3 py-1.5 bg-[#d33638] hover:bg-[#b0292b] text-white rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow-sm active:scale-95"
                            title="Book slot for this player"
                          >
                            <Calendar size={13} />
                            <span>Book</span>
                          </button>

                          {/* Profile CRM View */}
                          <button
                            type="button"
                            onClick={() => onViewCRM && onViewCRM(cust)}
                            className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                            title="Open full customer profile"
                          >
                            <ExternalLink size={13} />
                            <span className="hidden sm:inline">Profile</span>
                          </button>

                          {/* Direct WhatsApp Chat */}
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(cust.name)},%20greetings%20from%20Panda%20Sports%20Academy!%20🎾`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
                              title="Message on WhatsApp"
                            >
                              <MessageSquare size={14} />
                            </a>
                          )}

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => onEditCustomer && onEditCustomer(cust)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-xl transition-colors"
                            title="Edit details"
                          >
                            <Edit size={14} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to remove "${cust.name}"?`)) {
                                onDeleteCustomer && onDeleteCustomer(cust.id, cust.name);
                              }
                            }}
                            className="p-1.5 text-zinc-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Delete customer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
