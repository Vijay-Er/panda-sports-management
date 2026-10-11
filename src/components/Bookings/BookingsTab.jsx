import React, { useState, useMemo } from 'react';
import { 
  CalendarDays, Users, Plus, Clock, Ban, MessageSquare, 
  Banknote, Search, UserCheck, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { openWhatsAppShare } from '../../utils/whatsapp';
import { getLocalYYYYMMDD } from '../../utils/slots';
import CollectBalanceModal from './CollectBalanceModal';

export default function BookingsTab({ 
  onOpenBookingModal, 
  bookings = [], 
  onCancelBooking,
  onCollectBalance,
  onSelectCustomer
}) {
  const [selectedBookingForBalance, setSelectedBookingForBalance] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'today', 'active', 'due'

  const todayStr = getLocalYYYYMMDD();

  // Filter bookings based on query and status filter
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        b.customerName?.toLowerCase().includes(q) ||
        b.customerPhone?.includes(q) ||
        b.resourceName?.toLowerCase().includes(q) ||
        b.createdBy?.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (statusFilter === 'today') return b.date === todayStr;
      if (statusFilter === 'active') return b.status === 'active';
      if (statusFilter === 'due') return (b.pendingBalance || 0) > 0;

      return true;
    });
  }, [bookings, searchQuery, statusFilter, todayStr]);

  const activeCount = bookings.filter(b => b.status === 'active').length;
  const todayCount = bookings.filter(b => b.date === todayStr).length;
  const pendingDueCount = bookings.filter(b => (b.pendingBalance || 0) > 0).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="text-[#d33638]" size={26} />
            Court Reservations
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Create bookings, track counter equipment rentals, and view staff attribution
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => onOpenBookingModal('court')} 
            className="flex-1 sm:flex-initial bg-[#d33638] hover:bg-[#b42628] text-white py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm shadow-red-900/20 active:scale-95"
          >
            <Plus size={16} /> 
            <span>+ Book Court Slot</span>
          </button>

          <button 
            onClick={() => onOpenBookingModal('group')} 
            className="flex-1 sm:flex-initial bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
          >
            <Users size={16} /> 
            <span>+ Group Match (Split)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search player, phone, court or staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-zinc-800 outline-none focus:ring-2 focus:ring-[#d33638]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
            }`}
          >
            All ({bookings.length})
          </button>

          <button
            onClick={() => setStatusFilter('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'today'
                ? 'bg-[#d33638] text-white shadow-sm'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
            }`}
          >
            Today ({todayCount})
          </button>

          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'active'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
            }`}
          >
            Active Right Now ({activeCount})
          </button>

          <button
            onClick={() => setStatusFilter('due')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'due'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
            }`}
          >
            Payment Due ({pendingDueCount})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-5 space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <CalendarDays size={36} className="mx-auto mb-2 text-zinc-300" />
            <p className="text-xs font-bold">No bookings match the selected filter.</p>
            <p className="text-[11px] text-zinc-400 mt-1">Try clearing your search query or switching filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filteredBookings.map(b => {
              const hasRentals = b.rentals && (b.rentals.paddles > 0 || b.rentals.shoes > 0 || b.rentals.balls > 0);
              const hasPending = (b.pendingBalance || 0) > 0;
              const isToday = b.date === todayStr;

              return (
                <div key={b.id} className="py-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 hover:bg-zinc-50/50 -mx-3 px-3 rounded-2xl transition-colors">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-sm text-zinc-900">{b.customerName}</span>

                      {b.customerPhone && (
                        <button
                          type="button"
                          onClick={() => onSelectCustomer && onSelectCustomer({ name: b.customerName, phone: b.customerPhone })}
                          className="text-[11px] text-blue-700 hover:text-blue-900 font-bold bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 transition-colors flex items-center gap-1"
                          title="Click to view player match history & CRM profile"
                        >
                          <span>📱 {b.customerPhone}</span>
                        </button>
                      )}

                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${
                        b.resourceName?.includes('Premium') 
                          ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                          : 'bg-zinc-100 text-zinc-700'
                      }`}>
                        {b.resourceName}
                      </span>

                      {/* Status badge */}
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        b.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : b.status === 'finished' 
                          ? 'bg-zinc-100 text-zinc-600' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {b.status}
                      </span>

                      {hasPending && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                          Due: ₹{b.pendingBalance}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                      <span className={`font-bold ${isToday ? 'text-[#d33638]' : 'text-zinc-700'}`}>
                        {isToday ? 'Today' : b.date}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-zinc-800">{b.startTime} - {b.endTime}</span>
                      <span>({b.duration} mins)</span>
                      <span>•</span>
                      <span className="font-extrabold text-zinc-900">₹{b.totalPrice || b.paidAmount || 0}</span>
                      <span className="uppercase text-[10px] bg-zinc-100 px-1.5 py-0.2 rounded font-bold text-zinc-600">
                        {b.paymentMode || 'cash'}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <UserCheck size={12} />
                        Logged by: {b.createdBy || b.bookedBy || 'Staff'}
                      </span>
                    </div>

                    {/* Rental items chips */}
                    {hasRentals && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {b.rentals.paddles > 0 && (
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                            🏓 {b.rentals.paddles}x Paddles
                          </span>
                        )}
                        {b.rentals.shoes > 0 && (
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md">
                            👟 {b.rentals.shoes}x Shoes {b.rentals.shoeSizes ? `(${b.rentals.shoeSizes})` : ''}
                          </span>
                        )}
                        {b.rentals.balls > 0 && (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                            🎾 {b.rentals.balls}x Ball Can
                          </span>
                        )}
                      </div>
                    )}

                    {b.comments && (
                      <div className="text-[11px] text-zinc-400 italic">"{b.comments}"</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Collect Balance Button */}
                    {hasPending && (
                      <button
                        onClick={() => setSelectedBookingForBalance(b)}
                        className="flex items-center gap-1 text-xs font-extrabold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition-all border border-amber-300 shadow-sm active:scale-95"
                        title="Collect remaining pending payment"
                      >
                        <Banknote size={14} />
                        <span>Collect ₹{b.pendingBalance}</span>
                      </button>
                    )}

                    {/* WhatsApp Button */}
                    <button
                      onClick={() => openWhatsAppShare(b)}
                      className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95"
                      title="Share digital booking receipt via WhatsApp"
                    >
                      <MessageSquare size={13} className="text-emerald-600" />
                      <span>WhatsApp</span>
                    </button>

                    {/* Cancel Button */}
                    {b.status === 'active' && (
                      <button 
                        onClick={() => onCancelBooking(b.id)}
                        className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-xl transition-all"
                        title="Cancel reservation"
                      >
                        <Ban size={13} />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Collect Balance Modal */}
      <CollectBalanceModal
        isOpen={!!selectedBookingForBalance}
        onClose={() => setSelectedBookingForBalance(null)}
        booking={selectedBookingForBalance}
        onCollectBalance={onCollectBalance}
      />
    </div>
  );
}
