import React, { useState } from 'react';
import { CalendarDays, Users, Plus, Clock, Ban, MessageSquare, Banknote } from 'lucide-react';
import { openWhatsAppShare } from '../../utils/whatsapp';
import CollectBalanceModal from './CollectBalanceModal';

export default function BookingsTab({ 
  onOpenBookingModal, 
  bookings, 
  onCancelBooking,
  onCollectBalance,
  onSelectCustomer
}) {
  const [selectedBookingForBalance, setSelectedBookingForBalance] = useState(null);
  const activeBookings = bookings.filter(b => b.status === 'active');

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Quick Action Buttons */}
      <div>
        <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Court Reservations & Rentals</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Schedule single court matches or split-payment group games with equipment & shoe rentals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Court Booking Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200 flex flex-col items-center text-center justify-between space-y-5 hover:border-panda-500 hover:shadow-md transition-all group">
          <div className="w-16 h-16 bg-red-50 text-[#d33638] rounded-2xl flex items-center justify-center group-hover:bg-[#d33638] group-hover:text-white transition-all shadow-sm">
            <CalendarDays size={32} />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-zinc-900">Standard Court Reservation</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed max-w-sm">
              Book Court 1 (Premium), 2, 3, or 4 with equipment add-ons (Paddles, Non-marking Shoes, Balls). Supports full or advance payments.
            </p>
          </div>
          <button 
            onClick={() => onOpenBookingModal('court')} 
            className="w-full bg-[#d33638] hover:bg-[#b42628] text-white py-3.5 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-red-900/20 active:scale-[0.99]"
          >
            <Plus size={16} /> Book Court Slot
          </button>
        </div>

        {/* Group Game Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200 flex flex-col items-center text-center justify-between space-y-5 hover:border-black hover:shadow-md transition-all group">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
            <Users size={32} />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-zinc-900">Group Match (Split Payment)</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed max-w-sm">
              Split payment across multiple individual players. Each player can pay their share with Cash or UPI.
            </p>
          </div>
          <button 
            onClick={() => onOpenBookingModal('group')} 
            className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus size={16} /> Book Group Game
          </button>
        </div>
      </div>

      {/* Active Bookings Quick Overview */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
              <Clock size={18} className="text-zinc-500" />
              Active Bookings Right Now ({activeBookings.length})
            </h3>
            <p className="text-xs text-zinc-400">Court slots currently active or upcoming today</p>
          </div>
        </div>

        {activeBookings.length === 0 ? (
          <p className="text-sm text-zinc-400 italic text-center py-6">No active bookings scheduled.</p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {activeBookings.map(b => {
              const hasRentals = b.rentals && (b.rentals.paddles > 0 || b.rentals.shoes > 0 || b.rentals.balls > 0);
              const hasPending = (b.pendingBalance || 0) > 0;

              return (
                <div key={b.id} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-zinc-900">{b.customerName}</span>
                      {b.customerPhone && (
                        <button
                          type="button"
                          onClick={() => onSelectCustomer && onSelectCustomer({ name: b.customerName, phone: b.customerPhone })}
                          className="text-xs text-blue-700 hover:text-blue-900 font-bold bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 transition-colors flex items-center gap-1"
                          title="Click to view player match history & CRM profile"
                        >
                          <span>📱 +91 {b.customerPhone}</span>
                        </button>
                      )}
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                        {b.resourceName}
                      </span>
                      {b.gstEnabled && (
                        <span 
                          className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200"
                          title={`Academy GSTIN: 33AAECP4589K1Z4 | Billed to: ${b.companyName || 'Corporate'} (${b.companyGstin || 'Unregistered'})`}
                        >
                          🧾 18% GST ({b.companyName || 'Corporate'})
                        </span>
                      )}
                      {hasPending && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          Due: ₹{b.pendingBalance}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-zinc-500">
                      Date: {b.date} • {b.startTime} - {b.endTime} ({b.duration} mins)
                      {b.createdBy && <span className="ml-2 font-medium text-zinc-400">• Logged by {b.createdBy}</span>}
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
                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                    {/* Collect Balance Button */}
                    {hasPending && (
                      <button
                        onClick={() => setSelectedBookingForBalance(b)}
                        className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-1.5 rounded-lg transition-colors border border-amber-300 shadow-sm"
                        title="Collect remaining pending payment"
                      >
                        <Banknote size={14} />
                        <span>Collect ₹{b.pendingBalance}</span>
                      </button>
                    )}

                    {/* WhatsApp Button */}
                    <button
                      onClick={() => openWhatsAppShare(b)}
                      className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors shadow-sm"
                      title="Share digital booking receipt via WhatsApp"
                    >
                      <MessageSquare size={14} className="text-emerald-600" />
                      <span>WhatsApp Slip</span>
                    </button>

                    {/* Cancel Button */}
                    <button 
                      onClick={() => onCancelBooking(b.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <Ban size={14} />
                      <span>Cancel</span>
                    </button>
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
