import React, { useMemo } from 'react';
import { 
  X, User, Phone, MessageSquare, Calendar, 
  Award, Banknote, Clock, CheckCircle2, ChevronRight, Plus 
} from 'lucide-react';
import { openWhatsAppShare } from '../../utils/whatsapp';

export default function CustomerProfileModal({ 
  customerPhone, 
  customerName, 
  bookings = [], 
  isOpen, 
  onClose,
  onBookForPlayer
}) {
  if (!isOpen || (!customerPhone && !customerName)) return null;

  const cleanPhone = (customerPhone || '').replace(/\D/g, '');

  // Filter all bookings matching this customer's phone or name
  const playerBookings = useMemo(() => {
    return bookings.filter(b => {
      const bPhone = (b.customerPhone || '').replace(/\D/g, '');
      if (cleanPhone && bPhone) {
        return bPhone === cleanPhone;
      }
      if (customerName && b.customerName) {
        return b.customerName.toLowerCase().trim() === customerName.toLowerCase().trim();
      }
      return false;
    }).sort((a, b) => new Date(b.date + ' ' + b.startTime) - new Date(a.date + ' ' + a.startTime));
  }, [bookings, cleanPhone, customerName]);

  // Compute CRM metrics
  const totalMatches = playerBookings.length;
  const totalMins = playerBookings.reduce((sum, b) => sum + (Number(b.duration) || 0), 0);
  const totalHours = (totalMins / 60).toFixed(1);
  const totalSpent = playerBookings.reduce((sum, b) => sum + (Number(b.paidAmount || b.price) || 0), 0);
  const totalPendingDue = playerBookings.reduce((sum, b) => sum + (Number(b.pendingBalance) || 0), 0);

  // Determine favorite court
  const courtCounts = {};
  playerBookings.forEach(b => {
    if (b.resourceName) {
      courtCounts[b.resourceName] = (courtCounts[b.resourceName] || 0) + 1;
    }
  });
  const favoriteCourt = Object.entries(courtCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Court 1';

  // Primary displayName
  const displayName = customerName || playerBookings[0]?.customerName || 'Panda Sports Player';

  const handleWhatsApp = () => {
    if (cleanPhone) {
      window.open(`https://api.whatsapp.com/send?phone=91${cleanPhone}&text=Hello%20${encodeURIComponent(displayName)},%20greetings%20from%20Panda%20Sports%20Academy!%20🎾`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCall = () => {
    if (cleanPhone) {
      window.location.href = `tel:+91${cleanPhone}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 bg-gradient-to-r from-zinc-900 to-zinc-950 text-white flex justify-between items-start shrink-0 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-10 text-white pointer-events-none">
            <User size={120} />
          </div>

          <div className="space-y-1 z-10">
            <div className="inline-flex items-center gap-1.5 bg-red-600/30 text-red-300 border border-red-500/40 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
              <span>🎾 Regular Academy Player</span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">{displayName}</h3>
            {cleanPhone && (
              <p className="text-xs text-zinc-300 font-bold flex items-center gap-1.5">
                <Phone size={13} className="text-emerald-400" />
                <span>+91 {cleanPhone}</span>
              </p>
            )}
          </div>

          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 z-10">
            <X size={20} />
          </button>
        </div>

        {/* Quick Actions Bar */}
        <div className="px-6 py-2.5 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {cleanPhone && (
              <>
                <button
                  onClick={handleWhatsApp}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare size={14} className="text-emerald-600" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={handleCall}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Phone size={14} className="text-blue-600" />
                  <span>Call</span>
                </button>
              </>
            )}
          </div>

          {onBookForPlayer && (
            <button
              onClick={() => {
                onClose();
                onBookForPlayer({ name: displayName, phone: cleanPhone });
              }}
              className="px-3.5 py-1.5 bg-[#d33638] hover:bg-[#b42628] text-white rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={14} />
              <span>Book Slot</span>
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Matches</span>
              <span className="text-xl font-black text-zinc-900">{totalMatches}</span>
            </div>

            <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Hours Played</span>
              <span className="text-xl font-black text-blue-600">{totalHours}h</span>
            </div>

            <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Spend</span>
              <span className="text-xl font-black text-emerald-600">₹{totalSpent.toLocaleString()}</span>
            </div>

            <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Pending Due</span>
              <span className={`text-xl font-black ${totalPendingDue > 0 ? 'text-amber-600' : 'text-zinc-900'}`}>
                ₹{totalPendingDue.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Favorite Court Banner */}
          <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <Award size={18} className="text-amber-600" />
              <span>Favorite Court:</span>
              <span className="font-extrabold text-amber-950">{favoriteCourt}</span>
            </div>
            <span className="text-[10px] text-amber-700 font-bold">
              {courtCounts[favoriteCourt] || 0} times booked
            </span>
          </div>

          {/* Bookings History */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2.5 flex items-center justify-between">
              <span>Match & Reservation History ({playerBookings.length})</span>
            </h4>

            {playerBookings.length === 0 ? (
              <p className="text-xs text-zinc-400 italic text-center py-6">No matches recorded for this player.</p>
            ) : (
              <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-2xl overflow-hidden bg-white">
                {playerBookings.map((b) => (
                  <div key={b.id} className="p-3 hover:bg-zinc-50 flex items-center justify-between gap-3 text-xs transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-zinc-900">{b.resourceName}</span>
                        <span className="text-[10px] font-bold text-zinc-400">
                          {b.date} • {b.startTime} - {b.endTime}
                        </span>
                      </div>

                      <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1.5">
                        <span>Fee: ₹{Number(b.totalPrice || b.price || 0).toLocaleString()}</span>
                        <span>•</span>
                        <span className="font-bold text-emerald-600">Paid: ₹{Number(b.paidAmount || b.price || 0).toLocaleString()}</span>
                        {(b.pendingBalance || 0) > 0 && (
                          <span className="text-amber-700 font-bold bg-amber-100 px-1.5 py-0.2 rounded text-[10px]">
                            Due: ₹{b.pendingBalance}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => openWhatsAppShare(b)}
                      className="p-1 text-zinc-400 hover:text-emerald-600 rounded"
                      title="Resend WhatsApp slip"
                    >
                      <MessageSquare size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
