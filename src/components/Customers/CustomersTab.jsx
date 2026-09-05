import React, { useState, useMemo } from 'react';
import { 
  Users, UserPlus, Search, Phone, MessageSquare, 
  Calendar, Award, DollarSign, Clock, Edit, Trash2, 
  ExternalLink, ChevronRight, CheckCircle2, AlertCircle, Ticket, Wallet 
} from 'lucide-react';
import CustomerModal from './CustomerModal';

export default function CustomersTab({
  customers = [],
  bookings = [],
  students = [],
  onSaveCustomer,
  onDeleteCustomer,
  onViewCustomerProfile,
  onBookForCustomer,
  onEnrollCustomer,
  onOpenWalletTopup
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'court_players', 'academy_students'
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Compute CRM stats for every customer
  const enrichedCustomers = useMemo(() => {
    return customers.map(cust => {
      const cleanPhone = (cust.phone || '').replace(/\D/g, '');

      // Match player bookings by phone or name
      const playerBookings = bookings.filter(b => {
        const bPhone = (b.customerPhone || '').replace(/\D/g, '');
        if (cleanPhone && bPhone) return bPhone === cleanPhone;
        if (cust.name && b.customerName) {
          return b.customerName.toLowerCase().trim() === cust.name.toLowerCase().trim();
        }
        return false;
      });

      // Match academy enrollments by phone or name
      const playerEnrollments = students.filter(s => {
        const sPhone = (s.phone || '').replace(/\D/g, '');
        if (cleanPhone && sPhone) return sPhone === cleanPhone;
        if (cust.name && s.name) {
          return s.name.toLowerCase().trim() === cust.name.toLowerCase().trim();
        }
        return false;
      });

      const totalMatches = playerBookings.length;
      const totalMinutes = playerBookings.reduce((sum, b) => sum + (Number(b.duration) || 0), 0);
      const totalHours = (totalMinutes / 60).toFixed(1);
      
      const bookingSpend = playerBookings.reduce((sum, b) => sum + (Number(b.paidAmount || b.price) || 0), 0);
      const studentSpend = playerEnrollments.reduce((sum, s) => sum + (Number(s.feeAmount || s.monthlyFee) || 0), 0);
      const totalSpend = bookingSpend + studentSpend;

      const totalPendingDue = playerBookings.reduce((sum, b) => sum + (Number(b.pendingBalance) || 0), 0);

      // Favorite court
      const courtCounts = {};
      playerBookings.forEach(b => {
        if (b.resourceName) {
          courtCounts[b.resourceName] = (courtCounts[b.resourceName] || 0) + 1;
        }
      });
      const favoriteCourt = Object.entries(courtCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

      const isCourtPlayer = playerBookings.length > 0;
      const isAcademyStudent = playerEnrollments.length > 0;

      return {
        ...cust,
        totalMatches,
        totalHours,
        totalSpend,
        totalPendingDue,
        favoriteCourt,
        isCourtPlayer,
        isAcademyStudent,
        enrollmentsCount: playerEnrollments.length,
        enrolledPrograms: playerEnrollments.map(e => e.batchName).join(', ')
      };
    });
  }, [customers, bookings, students]);

  // Filtered customers by search and filter type
  const filteredCustomers = useMemo(() => {
    return enrichedCustomers.filter(c => {
      const matchesSearch = !searchQuery || 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterType === 'court_players') return c.isCourtPlayer;
      if (filterType === 'academy_students') return c.isAcademyStudent;
      return true;
    });
  }, [enrichedCustomers, searchQuery, filterType]);

  // Overall metrics
  const totalCustomersCount = customers.length;
  const totalCourtPlayersCount = enrichedCustomers.filter(c => c.isCourtPlayer).length;
  const totalStudentsCount = enrichedCustomers.filter(c => c.isAcademyStudent).length;
  const totalOverallSpend = enrichedCustomers.reduce((sum, c) => sum + c.totalSpend, 0);

  const handleOpenWhatsApp = (c) => {
    const cleanPhone = (c.phone || '').replace(/\D/g, '');
    if (cleanPhone) {
      window.open(`https://api.whatsapp.com/send?phone=91${cleanPhone}&text=Hello%20${encodeURIComponent(c.name)},%20greetings%20from%20Panda%20Sports%20Academy!%20🎾`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCall = (c) => {
    const cleanPhone = (c.phone || '').replace(/\D/g, '');
    if (cleanPhone) {
      window.open(`tel:+91${cleanPhone}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Customer & Player Directory</h2>
            <span className="bg-red-50 text-[#d33638] text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-red-200">
              Shared Cross-Service CRM
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-0.5">
            Centralized member database shared across court bookings, academy batches, and POS sales
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCustomer(null);
            setIsCustomerModalOpen(true);
          }}
          className="bg-[#d33638] hover:bg-[#b42628] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-md shadow-red-900/20 active:scale-95"
        >
          <UserPlus size={16} />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-center">
          <span className="text-[11px] font-bold text-zinc-500 uppercase flex items-center gap-1.5 mb-1">
            <Users size={14} className="text-[#d33638]" /> Total Registered
          </span>
          <span className="text-2xl font-black text-zinc-900">{totalCustomersCount}</span>
          <span className="text-[10px] text-zinc-400 font-semibold mt-0.5">Players & academy members</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-center">
          <span className="text-[11px] font-bold text-blue-700 uppercase flex items-center gap-1.5 mb-1">
            <Calendar size={14} className="text-blue-600" /> Court Players
          </span>
          <span className="text-2xl font-black text-blue-950">{totalCourtPlayersCount}</span>
          <span className="text-[10px] text-zinc-400 font-semibold mt-0.5">Booked slots on courts</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-center">
          <span className="text-[11px] font-bold text-emerald-700 uppercase flex items-center gap-1.5 mb-1">
            <Award size={14} className="text-emerald-600" /> Academy Members
          </span>
          <span className="text-2xl font-black text-emerald-950">{totalStudentsCount}</span>
          <span className="text-[10px] text-zinc-400 font-semibold mt-0.5">Enrolled in Karate batches</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-center">
          <span className="text-[11px] font-bold text-zinc-600 uppercase flex items-center gap-1.5 mb-1">
            <DollarSign size={14} className="text-emerald-600" /> Total Spend Recorded
          </span>
          <span className="text-2xl font-black text-zinc-900">₹{totalOverallSpend.toLocaleString()}</span>
          <span className="text-[10px] text-zinc-400 font-semibold mt-0.5">Across bookings & batches</span>
        </div>
      </div>

      {/* Toolbar: Search & Filter Tabs */}
      <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, mobile, or notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold outline-none focus:border-[#d33638]"
          />
        </div>

        <div className="flex gap-1.5 bg-zinc-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            All ({enrichedCustomers.length})
          </button>
          <button
            onClick={() => setFilterType('court_players')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'court_players'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Court Players ({totalCourtPlayersCount})
          </button>
          <button
            onClick={() => setFilterType('academy_students')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'academy_students'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Academy ({totalStudentsCount})
          </button>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-100/70 border-b border-zinc-200 text-xs font-bold text-zinc-600">
                <th className="p-3.5">Customer Name & Mobile</th>
                <th className="p-3.5">Service Association</th>
                <th className="p-3.5">Court Hours</th>
                <th className="p-3.5">Favorite Court</th>
                <th className="p-3.5">Prepaid Pass / Wallet</th>
                <th className="p-3.5">Total Spend</th>
                <th className="p-3.5">Pending Dues</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-zinc-400 italic">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(cust => (
                  <tr key={cust.id} className="hover:bg-zinc-50/70 transition-colors">
                    {/* Name & Phone */}
                    <td className="p-3.5">
                      <div>
                        <span className="font-extrabold text-sm text-zinc-900 block leading-tight">
                          {cust.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => onViewCustomerProfile && onViewCustomerProfile(cust)}
                            className="font-mono text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1"
                            title="Open detailed CRM Profile"
                          >
                            <span>📱 +91 {cust.phone}</span>
                          </button>
                        </div>
                        {cust.notes && (
                          <p className="text-[11px] text-zinc-400 italic mt-0.5 line-clamp-1">
                            {cust.notes}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Service Type Tags */}
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {cust.isCourtPlayer && (
                          <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            🏸 Court ({cust.totalMatches} matches)
                          </span>
                        )}
                        {cust.isAcademyStudent && (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            🥋 {cust.enrolledPrograms || 'Academy Batch'}
                          </span>
                        )}
                        {!cust.isCourtPlayer && !cust.isAcademyStudent && (
                          <span className="bg-zinc-100 text-zinc-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            New Member
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Court Hours */}
                    <td className="p-3.5 font-bold text-zinc-800">
                      {cust.totalHours} hrs
                    </td>

                    {/* Favorite Court */}
                    <td className="p-3.5">
                      <span className="text-[11px] font-semibold text-zinc-600">
                        {cust.favoriteCourt}
                      </span>
                    </td>

                    {/* Prepaid Pass / Wallet */}
                    <td className="p-3.5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                            ₹{cust.walletBalance || 0}
                          </span>
                          {(cust.passHours || 0) > 0 && (
                            <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-red-50 text-[#d33638] border border-red-200">
                              {(cust.passHours || 0).toFixed(1)}h Pass
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenWalletTopup && onOpenWalletTopup(cust)}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-extrabold hover:underline text-left flex items-center gap-1"
                        >
                          <Ticket size={11} /> Top-Up / Buy Pass
                        </button>
                      </div>
                    </td>

                    {/* Total Spend */}
                    <td className="p-3.5 font-black text-emerald-700">
                      ₹{cust.totalSpend.toLocaleString()}
                    </td>

                    {/* Pending Dues */}
                    <td className="p-3.5">
                      {cust.totalPendingDue > 0 ? (
                        <span className="text-[11px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                          Due: ₹{cust.totalPendingDue}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-600">
                          Cleared
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Book Court for this customer */}
                        <button
                          type="button"
                          onClick={() => onBookForCustomer && onBookForCustomer(cust)}
                          className="px-2.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 shadow-sm"
                          title="Open Booking Modal pre-filled with this customer"
                        >
                          <Calendar size={12} />
                          <span>Book</span>
                        </button>

                        {/* Top-up Wallet or Pass */}
                        <button
                          type="button"
                          onClick={() => onOpenWalletTopup && onOpenWalletTopup(cust)}
                          className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 shadow-sm"
                          title="Top-Up Wallet or Buy Pass"
                        >
                          <Ticket size={12} className="text-emerald-700" />
                          <span>Top-Up</span>
                        </button>

                        {/* WhatsApp Shortcut */}
                        <button
                          type="button"
                          onClick={() => handleOpenWhatsApp(cust)}
                          className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                          title="Open WhatsApp chat"
                        >
                          <MessageSquare size={14} />
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCustomer(cust);
                            setIsCustomerModalOpen(true);
                          }}
                          className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-colors"
                          title="Edit Customer"
                        >
                          <Edit size={14} />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove "${cust.name}" from directory?`)) {
                              onDeleteCustomer(cust.id);
                            }
                          }}
                          className="p-1.5 text-zinc-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete customer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Create / Edit Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => {
          setIsCustomerModalOpen(false);
          setEditingCustomer(null);
        }}
        initialCustomer={editingCustomer}
        onSaveCustomer={onSaveCustomer}
      />
    </div>
  );
}
