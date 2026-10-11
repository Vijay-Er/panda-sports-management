import React, { useMemo } from 'react';
import { 
  X, User, Phone, MessageSquare, Calendar, Award, Clock, 
  MapPin, Briefcase, Star, Cake, ChevronRight, Plus, Sparkles
} from 'lucide-react';

export default function CustomerProfileModal({
  isOpen,
  onClose,
  customer,
  bookings = [],
  onBookForPlayer
}) {
  if (!isOpen || !customer) return null;

  const {
    name,
    phone,
    email,
    area,
    preferredTime,
    preferredService,
    skillLevel,
    occupation,
    interests = [],
    membershipType,
    dateOfBirth,
    walletBalance,
    passHours,
    notes,
    createdAt
  } = customer;

  const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
  const cleanName = (name || '').trim().toLowerCase();

  // Match bookings accurately
  const playerBookings = useMemo(() => {
    return bookings.filter(b => {
      const bPhone = (b.customerPhone || b.playerPhone || '').replace(/\D/g, '').slice(-10);
      if (cleanPhone && bPhone) return cleanPhone === bPhone;
      const bName = (b.customerName || b.playerName || '').trim().toLowerCase();
      return bName && bName === cleanName;
    }).sort((a, b) => new Date(b.date + ' ' + (b.startTime || '')) - new Date(a.date + ' ' + (a.startTime || '')));
  }, [bookings, cleanPhone, cleanName]);

  const totalMatches = playerBookings.length;
  const totalMinutes = playerBookings.reduce((sum, b) => sum + (Number(b.duration) || 60), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const totalSpend = playerBookings.reduce((sum, b) => sum + (Number(b.paidAmount || b.price || b.totalAmount) || 0), 0) + (Number(customer.totalSpend) || 0);

  // Favorite Court
  const courtCounts = {};
  playerBookings.forEach(b => {
    const court = b.resourceName || b.courtName;
    if (court) {
      courtCounts[court] = (courtCounts[court] || 0) + 1;
    }
  });
  const favoriteCourt = Object.entries(courtCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Not recorded yet';

  // Check if birthday is coming up (within 7 days)
  const isBirthdaySoon = useMemo(() => {
    if (!dateOfBirth) return false;
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return false;
    const today = new Date();
    const thisYearBday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    const diffDays = Math.round((thisYearBday - today) / (1000 * 60 * 60 * 24));
    return diffDays >= -1 && diffDays <= 7;
  }, [dateOfBirth]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-zinc-900 to-zinc-950 text-white flex justify-between items-start shrink-0 relative">
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-2">
              <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                {membershipType || 'Regular Player'}
              </span>
              {membershipType === 'VIP' && (
                <span className="text-amber-400 flex items-center gap-1 text-[10px] font-bold">
                  <Star size={12} className="fill-amber-400" /> VIP Member
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-white">{name}</h3>
            <div className="flex items-center gap-3 text-xs text-zinc-300 font-semibold">
              <span className="flex items-center gap-1">
                <Phone size={13} className="text-emerald-400" />
                +91 {cleanPhone}
              </span>
              {area && (
                <span className="flex items-center gap-1 text-zinc-400">
                  <MapPin size={13} className="text-[#d33638]" />
                  {area}
                </span>
              )}
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Action Bar */}
        <div className="px-6 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {cleanPhone && (
              <a
                href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(name)},%20greetings%20from%20Panda%20Sports%20Academy!%20🎾`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <MessageSquare size={14} className="text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            )}
            {cleanPhone && (
              <a
                href={`tel:+91${cleanPhone}`}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Phone size={13} />
                <span>Call</span>
              </a>
            )}
          </div>

          {onBookForPlayer && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onBookForPlayer(customer);
              }}
              className="px-4 py-1.5 bg-[#d33638] hover:bg-[#b0292b] text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Plus size={14} />
              <span>Book Slot</span>
            </button>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Birthday Banner */}
          {isBirthdaySoon && (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Cake size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-900">Upcoming Birthday! 🎂</h4>
                  <p className="text-[11px] text-amber-700 font-medium">Send greeting or special pass discount</p>
                </div>
              </div>
              {cleanPhone && (
                <a
                  href={`https://wa.me/91${cleanPhone}?text=Happy%20Birthday%20${encodeURIComponent(name)}!%20🎉%20Greetings%20from%20Panda%20Sports%20Academy!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
                >
                  Wish
                </a>
              )}
            </div>
          )}

          {/* CRM Stats Grid */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-zinc-50 p-2.5 rounded-2xl border border-zinc-200">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Matches</span>
              <span className="text-lg font-black text-zinc-900">{totalMatches}</span>
            </div>
            <div className="bg-zinc-50 p-2.5 rounded-2xl border border-zinc-200">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Hours</span>
              <span className="text-lg font-black text-blue-600">{totalHours}h</span>
            </div>
            <div className="bg-zinc-50 p-2.5 rounded-2xl border border-zinc-200">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Spend</span>
              <span className="text-lg font-black text-emerald-600">₹{totalSpend.toLocaleString()}</span>
            </div>
            <div className="bg-zinc-50 p-2.5 rounded-2xl border border-zinc-200">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Wallet</span>
              <span className="text-lg font-black text-[#d33638]">₹{walletBalance || 0}</span>
            </div>
          </div>

          {/* Player Preferences Summary */}
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#d33638]" />
              <span>Playing Preferences</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-zinc-200/80">
                <span className="text-[10px] font-bold text-zinc-400 block uppercase">Timing</span>
                <span className="font-black text-zinc-900">
                  {preferredTime === 'Morning' && '🌅 Morning Slots'}
                  {preferredTime === 'Evening' && '🌆 Evening Slots'}
                  {(preferredTime === 'Both' || !preferredTime) && '🔄 Flexible Timing'}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-zinc-200/80">
                <span className="text-[10px] font-bold text-zinc-400 block uppercase">Play Style</span>
                <span className="font-black text-zinc-900">
                  {preferredService === 'Court Booking' && '🏸 Court Booking'}
                  {preferredService === 'Group Game' && '👥 Group Matches'}
                  {(preferredService === 'Both' || !preferredService) && '⚡ Court & Group'}
                </span>
              </div>

              {occupation && (
                <div className="bg-white p-2.5 rounded-xl border border-zinc-200/80 col-span-2">
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase">Occupation</span>
                  <span className="font-black text-zinc-900">{occupation}</span>
                </div>
              )}

              {interests && interests.length > 0 && (
                <div className="bg-white p-2.5 rounded-xl border border-zinc-200/80 col-span-2">
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase mb-1">Interests</span>
                  <div className="flex flex-wrap gap-1">
                    {interests.map(i => (
                      <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-[#d33638] border border-red-200">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Favorite Court */}
          <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <Award size={18} className="text-amber-600" />
              <span>Favorite Court:</span>
              <span className="font-extrabold text-amber-950">{favoriteCourt}</span>
            </div>
            <span className="text-[10px] text-amber-700 font-bold">
              {courtCounts[favoriteCourt] || 0} bookings
            </span>
          </div>

          {/* Notes */}
          {notes && (
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
              <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-0.5">Admin Notes</span>
              <p className="text-zinc-700 font-medium">{notes}</p>
            </div>
          )}

          {/* Recent Match History */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 mb-2">
              Recent Matches ({playerBookings.length})
            </h4>

            {playerBookings.length === 0 ? (
              <p className="text-xs text-zinc-400 italic text-center py-4 bg-zinc-50 rounded-xl">
                No past matches recorded yet.
              </p>
            ) : (
              <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-2xl overflow-hidden bg-white max-h-44 overflow-y-auto">
                {playerBookings.slice(0, 5).map(b => (
                  <div key={b.id} className="p-3 hover:bg-zinc-50 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-black text-zinc-900 block">{b.resourceName || b.courtName}</span>
                      <span className="text-[10px] text-zinc-400 font-bold">{b.date} • {b.startTime} - {b.endTime}</span>
                    </div>
                    <span className="font-extrabold text-emerald-600 text-xs">
                      ₹{b.paidAmount || b.price || b.totalAmount || 0}
                    </span>
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
