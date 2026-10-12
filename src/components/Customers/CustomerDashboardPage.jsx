import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, User, Phone, MessageSquare, Calendar, Award, Clock, 
  MapPin, Briefcase, Star, Cake, Plus, Sparkles, Users, FileText,
  DollarSign, Coffee, UtensilsCrossed, Receipt, Shield, CheckCircle2,
  AlertCircle, ChevronRight, Edit, ExternalLink, Banknote, Smartphone, Wallet
} from 'lucide-react';
import { openWhatsAppShare } from '../../utils/whatsapp';

export default function CustomerDashboardPage({
  customer,
  onBack,
  bookings = [],
  transactions = [],
  beverages = [],
  onBookForCustomer,
  onEditCustomer,
  onOpenWalletTopup,
  onOpenAddDrinks,
  onCollectBalance
}) {
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'drinks' | 'ledger' | 'details'

  if (!customer) return null;

  const {
    id: customerId,
    name,
    phoneRegionCode = '+91',
    phone,
    contact2RegionCode = '+91',
    contact2,
    emergencyPhone,
    area,
    age,
    gender,
    particulars = [],
    preferredTime,
    availableTime,
    availableDays = [],
    professionType,
    workTime,
    professionComments,
    referredBy,
    parentName,
    teamName,
    associatedMembers,
    remarks,
    comments,
    notes,
    membershipType,
    dateOfBirth,
    walletBalance = 0,
    passHours = 0,
    createdAt
  } = customer;

  const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
  const cleanContact2 = (contact2 || emergencyPhone || '').replace(/\D/g, '').slice(-10);
  const cleanName = (name || '').trim().toLowerCase();

  // 1. Match bookings for this customer
  const customerBookings = useMemo(() => {
    return bookings.filter(b => {
      const bPhone = (b.customerPhone || b.playerPhone || '').replace(/\D/g, '').slice(-10);
      if (cleanPhone && bPhone) return cleanPhone === bPhone;
      const bName = (b.customerName || b.playerName || '').trim().toLowerCase();
      return bName && bName === cleanName;
    }).sort((a, b) => new Date(b.date + ' ' + (b.startTime || '')) - new Date(a.date + ' ' + (a.startTime || '')));
  }, [bookings, cleanPhone, cleanName]);

  // Total Played Time
  const totalMinutes = useMemo(() => {
    return customerBookings.reduce((sum, b) => sum + (Number(b.duration) || 60), 0);
  }, [customerBookings]);

  const totalPlayedHours = (totalMinutes / 60).toFixed(1);
  const formattedPlayedTime = `${Math.floor(totalMinutes / 60)} hrs ${totalMinutes % 60 > 0 ? `${totalMinutes % 60} mins` : ''}`.trim();
  const totalMatchesCount = customerBookings.length;

  // 2. Extract Drinks & Snacks purchased by this customer (both from bookings and standalone transactions)
  const customerDrinksPurchases = useMemo(() => {
    const list = [];

    // From court bookings:
    customerBookings.forEach(b => {
      if (b.drinks && Array.isArray(b.drinks)) {
        b.drinks.forEach(d => {
          list.push({
            id: `booking-${b.id}-${d.id}-${Math.random()}`,
            name: d.name,
            icon: d.icon || '🥤',
            price: Number(d.price) || 0,
            quantity: Number(d.quantity) || 1,
            subtotal: Number(d.subtotal) || (Number(d.price) * Number(d.quantity)) || 0,
            date: b.date,
            time: b.startTime,
            source: `Court Booking (${b.resourceName || 'Court'})`,
            bookingId: b.id,
            staff: b.createdBy || b.bookedBy || 'Staff'
          });
        });
      }
    });

    // From standalone transactions if tagged with customer phone or name:
    transactions.forEach(t => {
      if (t.category === 'Beverage' && t.type === 'income') {
        const desc = (t.description || '').toLowerCase();
        const matchesCustomer = (cleanPhone && desc.includes(cleanPhone)) || (cleanName && desc.includes(cleanName));
        const isFromBooking = t.bookingId && customerBookings.some(b => b.id === t.bookingId);

        if ((matchesCustomer || isFromBooking) && !list.some(item => item.id.includes(t.id))) {
          const matchItemName = t.description?.match(/Sold \d+x (.+?)(\s|$|\()/i)?.[1] || 'Refreshment';
          list.push({
            id: `tx-${t.id}`,
            name: matchItemName,
            icon: '🥤',
            price: Number(t.amount) || 0,
            quantity: 1,
            subtotal: Number(t.amount) || 0,
            date: t.date?.split('T')?.[0] || 'Recent',
            time: '',
            source: 'Counter POS Sale',
            staff: t.createdBy || 'Staff'
          });
        }
      }
    });

    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [customerBookings, transactions, cleanPhone, cleanName]);

  const totalDrinksSpend = useMemo(() => {
    return customerDrinksPurchases.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
  }, [customerDrinksPurchases]);

  const totalDrinksCount = useMemo(() => {
    return customerDrinksPurchases.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }, [customerDrinksPurchases]);

  // Total Court Bookings Spend
  const totalCourtBookingsSpend = useMemo(() => {
    return customerBookings.reduce((sum, b) => {
      const courtFee = Number(b.courtPrice || b.basePrice || b.paidAmount || b.totalPrice || 0);
      return sum + courtFee;
    }, 0);
  }, [customerBookings]);

  // Pending balance across all customer bookings
  const totalPendingDue = useMemo(() => {
    return customerBookings.reduce((sum, b) => sum + (Number(b.pendingBalance) || 0), 0) + (Number(customer.pendingDues) || 0);
  }, [customerBookings, customer.pendingDues]);

  // Overall Total Spend (Court + Drinks + Baseline Customer Spend)
  const totalOverallPayment = useMemo(() => {
    const fromBookings = customerBookings.reduce((sum, b) => sum + (Number(b.paidAmount || b.totalPrice) || 0), 0);
    const baseCustSpend = Number(customer.totalSpend) || 0;
    return Math.max(fromBookings + totalDrinksSpend, baseCustSpend);
  }, [customerBookings, totalDrinksSpend, customer.totalSpend]);

  // Favorite Court
  const courtCounts = {};
  customerBookings.forEach(b => {
    const court = b.resourceName || b.courtName;
    if (court) {
      courtCounts[court] = (courtCounts[court] || 0) + 1;
    }
  });
  const favoriteCourt = Object.entries(courtCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || customer.favoriteCourt || 'Not played yet';

  // Transactions list for this customer
  const customerTransactions = useMemo(() => {
    return transactions.filter(t => {
      const desc = (t.description || '').toLowerCase();
      const matchPhone = cleanPhone && desc.includes(cleanPhone);
      const matchName = cleanName && desc.includes(cleanName);
      const matchBooking = t.bookingId && customerBookings.some(b => b.id === t.bookingId);
      return matchPhone || matchName || matchBooking;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, cleanPhone, cleanName, customerBookings]);

  const displayRemarks = remarks || comments || notes || '';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Top Breadcrumb & Navigation Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-zinc-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 flex items-center justify-center transition-colors active:scale-95"
            title="Back to Customers Directory"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
                Customer Dashboard
              </span>
              <span className="text-zinc-300">•</span>
              <span className="bg-red-50 text-[#d33638] text-[10px] font-black px-2 py-0.5 rounded-full border border-red-200">
                {membershipType || 'Regular Player'}
              </span>
              {membershipType === 'VIP' && (
                <span className="text-amber-500 flex items-center gap-1 text-[10px] font-black">
                  <Star size={11} className="fill-amber-500" /> VIP
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2 mt-0.5">
              {name}
            </h1>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {onBookForCustomer && (
            <button
              type="button"
              onClick={() => onBookForCustomer(customer)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-[#d33638] hover:bg-[#b0292b] text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-red-900/20 active:scale-95"
            >
              <Calendar size={15} />
              <span>+ Book Court</span>
            </button>
          )}

          {cleanPhone && (
            <a
              href={`https://wa.me/${phoneRegionCode.replace(/\D/g, '')}${cleanPhone}?text=Hello%20${encodeURIComponent(name)},%20greetings%20from%20Panda%20Sports%20Academy!%20🎾`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <MessageSquare size={15} className="text-emerald-600" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}

          {cleanPhone && (
            <a
              href={`tel:${phoneRegionCode}${cleanPhone}`}
              className="px-3.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Phone size={14} />
              <span className="hidden sm:inline">Call</span>
            </a>
          )}

          {onOpenWalletTopup && (
            <button
              type="button"
              onClick={() => onOpenWalletTopup(customer)}
              className="px-3.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Recharge Player Wallet"
            >
              <Wallet size={14} className="text-[#d33638]" />
              <span>Wallet</span>
            </button>
          )}

          {onEditCustomer && (
            <button
              type="button"
              onClick={() => onEditCustomer(customer)}
              className="p-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition-colors"
              title="Edit Customer Profile"
            >
              <Edit size={15} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Key Metrics Overview Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Played Time */}
        <div className="bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">Total Played</span>
            <Clock size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600 leading-none">
            {totalPlayedHours}h
          </div>
          <span className="text-[10px] text-zinc-400 font-bold block mt-1">
            {formattedPlayedTime}
          </span>
        </div>

        {/* Total Matches / Bookings */}
        <div className="bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">Total Matches</span>
            <Calendar size={16} className="text-purple-600" />
          </div>
          <div className="text-2xl font-black text-zinc-900 leading-none">
            {totalMatchesCount}
          </div>
          <span className="text-[10px] text-zinc-400 font-bold block mt-1">
            Court Bookings
          </span>
        </div>

        {/* Overall Payment / Spend */}
        <div className="bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">Overall Spend</span>
            <DollarSign size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 leading-none">
            ₹{totalOverallPayment.toLocaleString()}
          </div>
          <span className="text-[10px] text-zinc-400 font-bold block mt-1">
            Court + Drinks + All
          </span>
        </div>

        {/* Drinks & Snacks Total */}
        <div className="bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">Drinks & Snacks</span>
            <Coffee size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 leading-none">
            ₹{totalDrinksSpend.toLocaleString()}
          </div>
          <span className="text-[10px] text-zinc-400 font-bold block mt-1">
            {totalDrinksCount} Refreshments
          </span>
        </div>

        {/* Pending Balance / Due */}
        <div className={`p-4 rounded-3xl border shadow-sm ${
          totalPendingDue > 0 
            ? 'bg-amber-50/70 border-amber-300' 
            : 'bg-white border-zinc-200/80'
        }`}>
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className={`text-[10px] font-black uppercase tracking-wider ${
              totalPendingDue > 0 ? 'text-amber-900' : 'text-zinc-400'
            }`}>
              Balance Due
            </span>
            <AlertCircle size={16} className={totalPendingDue > 0 ? 'text-amber-600' : 'text-zinc-300'} />
          </div>
          <div className={`text-2xl font-black leading-none ${
            totalPendingDue > 0 ? 'text-amber-800' : 'text-zinc-900'
          }`}>
            ₹{totalPendingDue}
          </div>
          {totalPendingDue > 0 ? (
            <span className="text-[10px] font-extrabold text-amber-700 block mt-1">
              ⚠️ Needs Collection
            </span>
          ) : (
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">
              ✅ All Settled
            </span>
          )}
        </div>

        {/* Wallet Balance */}
        <div className="bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">Wallet Balance</span>
            <Wallet size={16} className="text-[#d33638]" />
          </div>
          <div className="text-2xl font-black text-[#d33638] leading-none">
            ₹{walletBalance}
          </div>
          <span className="text-[10px] text-zinc-400 font-bold block mt-1">
            Instant Pass Credit
          </span>
        </div>
      </div>

      {/* 3. Customer Profile & Habit Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card A: Contact, Location & Personal Details */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
            <h3 className="font-black text-xs uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <User size={14} className="text-[#d33638]" />
              Personal & Contact Details
            </h3>
            {age && (
              <span className="text-[11px] font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-lg">
                {age} yrs {gender ? `• ${gender}` : ''}
              </span>
            )}
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-start justify-between">
              <span className="text-zinc-400 font-bold">Contact 1 (Primary):</span>
              <span className="font-mono font-black text-zinc-900 flex items-center gap-1">
                <Phone size={12} className="text-emerald-500" />
                {phoneRegionCode} {cleanPhone}
              </span>
            </div>

            {(cleanContact2) && (
              <div className="flex items-start justify-between">
                <span className="text-zinc-400 font-bold">Contact 2:</span>
                <span className="font-mono font-bold text-zinc-800">
                  {contact2RegionCode} {cleanContact2}
                </span>
              </div>
            )}

            {area && (
              <div className="flex items-start justify-between">
                <span className="text-zinc-400 font-bold">Location / Area:</span>
                <span className="font-black text-zinc-900 flex items-center gap-1">
                  <MapPin size={12} className="text-[#d33638]" />
                  {area}
                </span>
              </div>
            )}

            <div className="flex items-start justify-between">
              <span className="text-zinc-400 font-bold">Favorite Court:</span>
              <span className="font-extrabold text-zinc-900 flex items-center gap-1">
                <Award size={12} className="text-amber-500" />
                {favoriteCourt} ({courtCounts[favoriteCourt] || 0} games)
              </span>
            </div>

            {createdAt && (
              <div className="flex items-start justify-between">
                <span className="text-zinc-400 font-bold">Member Since:</span>
                <span className="font-semibold text-zinc-600">
                  {new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card B: Play Habits, Particulars & Profession */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
            <h3 className="font-black text-xs uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Calendar size={14} className="text-[#d33638]" />
              Play Routine & Preferences
            </h3>
            <span className="text-[10px] font-extrabold text-zinc-500 uppercase">
              {availableTime || preferredTime || 'Flexible'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                Particulars & Services:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(particulars.length > 0 ? particulars : ['Court Booking']).map((p, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-blue-50 text-blue-900 border border-blue-200"
                  >
                    {p === 'Court Booking' ? '🏸 Court Booking' : p === 'Group Game' ? '👥 Group Game' : p === 'Karate' ? '🥋 Karate' : p}
                  </span>
                ))}
              </div>
            </div>

            {availableDays && availableDays.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                  Available Playing Days:
                </span>
                <div className="flex flex-wrap gap-1">
                  {availableDays.map((d, idx) => (
                    <span key={idx} className="bg-zinc-100 text-zinc-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(professionType || workTime || professionComments) && (
              <div className="pt-1 border-t border-zinc-100">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                  Profession & Schedule:
                </span>
                {professionType && (
                  <p className="font-black text-zinc-900">💼 {professionType}</p>
                )}
                {workTime && (
                  <p className="text-[11px] text-zinc-600 mt-0.5">Work Time: {workTime}</p>
                )}
                {professionComments && (
                  <p className="text-[11px] text-zinc-500 italic mt-0.5">{professionComments}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Card C: Team, Teammates & Remarks */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
            <h3 className="font-black text-xs uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Users size={14} className="text-[#d33638]" />
              Team, Social & Remarks
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            {teamName && (
              <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-200">
                <span className="text-[10px] font-black uppercase text-blue-800 block">Team Name:</span>
                <span className="font-black text-blue-950 text-sm">{teamName}</span>
              </div>
            )}

            {associatedMembers && (
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase block">Associated Teammates:</span>
                <p className="font-semibold text-zinc-800 mt-0.5">{associatedMembers}</p>
              </div>
            )}

            {referredBy && (
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase block">Referred By:</span>
                <p className="font-black text-emerald-700 mt-0.5">🌟 {referredBy}</p>
              </div>
            )}

            {parentName && (
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase block">Parent / Guardian:</span>
                <p className="font-semibold text-zinc-800 mt-0.5">{parentName}</p>
              </div>
            )}

            {displayRemarks && (
              <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80 mt-2">
                <span className="text-[10px] font-black uppercase text-amber-900 block flex items-center gap-1">
                  <FileText size={11} className="text-amber-700" />
                  Remarks & Instructions:
                </span>
                <p className="text-amber-950 font-medium text-xs mt-1 leading-relaxed">
                  {displayRemarks}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Interactive Tabs for Booking History, Drinks Purchases & Financial Ledger */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="border-b border-zinc-200 px-6 pt-4 flex gap-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`pb-3.5 px-2 text-xs font-black transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'border-[#d33638] text-[#d33638]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Calendar size={15} />
            <span>Court Bookings ({customerBookings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('drinks')}
            className={`pb-3.5 px-2 text-xs font-black transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'drinks'
                ? 'border-[#d33638] text-[#d33638]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Coffee size={15} />
            <span>Drinks & Snacks ({customerDrinksPurchases.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`pb-3.5 px-2 text-xs font-black transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'ledger'
                ? 'border-[#d33638] text-[#d33638]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Receipt size={15} />
            <span>Payment Ledger ({customerTransactions.length})</span>
          </button>
        </div>

        {/* Tab 1: Court Bookings History */}
        {activeTab === 'bookings' && (
          <div className="p-6 space-y-4">
            {customerBookings.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">
                <Calendar size={36} className="mx-auto mb-2 text-zinc-300" />
                <p className="font-bold text-xs">No court bookings recorded yet.</p>
                <button
                  type="button"
                  onClick={() => onBookForCustomer && onBookForCustomer(customer)}
                  className="mt-3 px-4 py-2 bg-[#d33638] text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Book First Court Slot
                </button>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {customerBookings.map(b => {
                  const hasRentals = b.rentals && (b.rentals.paddles > 0 || b.rentals.shoes > 0 || b.rentals.balls > 0);
                  const hasDrinks = b.drinks && Array.isArray(b.drinks) && b.drinks.length > 0;
                  const isPending = (b.pendingBalance || 0) > 0;

                  return (
                    <div key={b.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-zinc-50/50 -mx-3 px-3 rounded-2xl transition-colors">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-sm text-zinc-900">
                            {b.resourceName || 'Court'}
                          </span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700">
                            {b.duration} mins
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            b.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600'
                          }`}>
                            {b.status}
                          </span>
                          {isPending && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                              Due: ₹{b.pendingBalance}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                          <span className="font-bold text-zinc-800">{b.date}</span>
                          <span>•</span>
                          <span className="font-bold text-zinc-900">{b.startTime} - {b.endTime}</span>
                          <span>•</span>
                          <span className="font-extrabold text-emerald-700">
                            ₹{b.totalPrice || b.paidAmount || 0}
                          </span>
                          <span className="uppercase text-[10px] bg-zinc-100 px-1.5 py-0.2 rounded font-bold text-zinc-600">
                            {b.paymentMode || 'cash'}
                          </span>
                          <span>•</span>
                          <span className="text-[11px] font-semibold text-zinc-500">
                            Logged by: {b.createdBy || b.bookedBy || 'Staff'}
                          </span>
                        </div>

                        {/* Rental Chips */}
                        {hasRentals && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {b.rentals.paddles > 0 && (
                              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                                🏓 {b.rentals.paddles}x Paddles
                              </span>
                            )}
                            {b.rentals.shoes > 0 && (
                              <span className="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md">
                                👟 {b.rentals.shoes}x Shoes
                              </span>
                            )}
                          </div>
                        )}

                        {/* Merged Drinks & Snacks on this Court Booking */}
                        {hasDrinks && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] font-extrabold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Coffee size={11} className="text-amber-700" />
                              <span>Refreshments:</span>
                            </span>
                            {b.drinks.map((d, i) => (
                              <span key={i} className="text-[10px] font-bold bg-amber-100/70 text-amber-950 border border-amber-200 px-2 py-0.5 rounded-md">
                                {d.icon || '🥤'} {d.quantity}x {d.name} (₹{d.subtotal || d.price * d.quantity})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Quick Add Drinks to this active booking */}
                        {onOpenAddDrinks && (
                          <button
                            type="button"
                            onClick={() => onOpenAddDrinks(b)}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                            title="Add drinks / snacks to this court tab"
                          >
                            <Coffee size={13} className="text-amber-700" />
                            <span>+ Drinks</span>
                          </button>
                        )}

                        {/* WhatsApp receipt */}
                        <button
                          type="button"
                          onClick={() => openWhatsAppShare(b)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                          title="Share pass on WhatsApp"
                        >
                          <MessageSquare size={13} className="text-emerald-600" />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Drinks & Snacks History */}
        {activeTab === 'drinks' && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80">
              <div>
                <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                  <Coffee size={14} className="text-amber-700" />
                  <span>Customer Refreshments Summary</span>
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  All beverages and snacks purchased by {name} across court bookings and counter POS
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-800 uppercase block">Total Spent:</span>
                <span className="text-xl font-black text-amber-950">₹{totalDrinksSpend.toLocaleString()}</span>
              </div>
            </div>

            {customerDrinksPurchases.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">
                <Coffee size={36} className="mx-auto mb-2 text-zinc-300" />
                <p className="font-bold text-xs">No drinks or snacks purchased yet.</p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Add refreshments while booking a court or using the POS tab.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {customerDrinksPurchases.map((d) => (
                  <div key={d.id} className="py-3.5 flex items-center justify-between hover:bg-zinc-50/60 -mx-3 px-3 rounded-2xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100/70 text-amber-900 flex items-center justify-center text-xl shrink-0">
                        {d.icon || '🥤'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-zinc-900">{d.name}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600">
                            Qty: {d.quantity}x
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                          {d.date} {d.time ? `• ${d.time}` : ''} • <span className="font-semibold text-zinc-700">{d.source}</span> • Logged by: {d.staff}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-sm text-emerald-700 block">
                        ₹{d.subtotal}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        ₹{d.price} each
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Financial Ledger & Transactions */}
        {activeTab === 'ledger' && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
              <div>
                <h4 className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
                  <Receipt size={14} className="text-[#d33638]" />
                  <span>Customer Ledger & Audit History</span>
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Complete chronological register of receipts, court payments, and refreshments
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-zinc-500 uppercase block">Total Settled:</span>
                <span className="text-xl font-black text-emerald-700">₹{totalOverallPayment.toLocaleString()}</span>
              </div>
            </div>

            {customerTransactions.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">
                <Receipt size={36} className="mx-auto mb-2 text-zinc-300" />
                <p className="font-bold text-xs">No direct transactions logged under this name yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {customerTransactions.map(t => (
                  <div key={t.id} className="py-3 flex items-center justify-between hover:bg-zinc-50/60 -mx-3 px-3 rounded-2xl transition-colors">
                    <div>
                      <span className="font-bold text-xs text-zinc-900 block">{t.description}</span>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400">
                        <span>{t.date?.split('T')?.[0]}</span>
                        <span>•</span>
                        <span className="uppercase font-bold text-zinc-700 bg-zinc-100 px-1.5 py-0.2 rounded">
                          {t.paymentMode}
                        </span>
                        <span>•</span>
                        <span>Logged by: {t.createdBy || 'Staff'}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`font-black text-sm block ${
                        t.type === 'income' ? 'text-emerald-700' : 'text-red-600'
                      }`}>
                        {t.type === 'income' ? '+' : '-'}₹{t.amount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
