import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, CalendarDays, Users, Plus, Minus, Trash2, 
  Smartphone, Tag, Info, AlertCircle, Receipt, Search, Sparkles, UserCheck,
  Clock, Check, CheckCircle2, Sun, Moon, LayoutGrid, Coffee, UtensilsCrossed 
} from 'lucide-react';
import { 
  generateTimeSlots, 
  calculateEndFromSlots, 
  isSlotFullyBooked, 
  timeToMins, 
  assignResource, 
  getLocalYYYYMMDD,
  formatTo12Hour,
  minsToTimeString,
  generateSlotsFromStartAndDuration
} from '../../utils/slots';

export default function BookingModal({
  isOpen,
  onClose,
  initialServiceType = 'court',
  bookings,
  onAddBooking,
  customers = [],
  prefilledCustomer = null,
  activeShift = null,
  beverages = []
}) {
  const [bookingForm, setBookingForm] = useState({
    serviceType: initialServiceType,
    customerName: '',
    customerPhone: '',
    date: getLocalYYYYMMDD(),
    selectedSlots: [],
    courtPrice: '600',
    paymentMode: 'upi',
    paymentStatus: 'full', // 'full' or 'advance'
    advancePaid: '',
    comments: ''
  });

  // Rental Add-ons State (Paddles, Shoes, Ball Cans)
  const [rentals, setRentals] = useState({
    paddles: 0,
    shoes: 0,
    shoeSizes: '',
    balls: 0
  });

  // Drinks & Refreshments State (Merged with Court Booking)
  const [selectedDrinks, setSelectedDrinks] = useState({}); // { [beverageId]: quantity }

  // 18% GST Invoice State (For Corporate / Business Clients)
  const [gstInvoiceEnabled, setGstInvoiceEnabled] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyGstin, setCompanyGstin] = useState('');

  const [groupPlayers, setGroupPlayers] = useState([
    { id: 1, name: '', amount: '', paymentMode: 'cash' },
    { id: 2, name: '', amount: '', paymentMode: 'cash' }
  ]);

  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // User-Friendly Time Picker State (12h format + 1-click duration presets)
  const [timePickerMode, setTimePickerMode] = useState('simple'); // 'simple' (default) or 'grid'
  const [startTime, setStartTime] = useState(() => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes() >= 30 ? '30' : '00';
    const startH = Math.max(6, Math.min(22, h));
    return `${String(startH).padStart(2, '0')}:${m}`;
  });
  const [durationMins, setDurationMins] = useState(60);

  // Sync slots and price calculation helper
  const applyTimeSelection = (sTime, dur, curDate = bookingForm.date) => {
    const newSlots = generateSlotsFromStartAndDuration(sTime, dur);
    const durationHours = dur / 60;
    const [y, m, d] = (curDate || getLocalYYYYMMDD()).split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const hasEvening = newSlots.some(s => parseInt(s.split(':')[0], 10) >= 18);
    const ratePerHour = (isWeekend || hasEvening) ? 700 : 500;
    const suggestedPrice = Math.round(durationHours * ratePerHour);

    setBookingForm(prev => ({
      ...prev,
      selectedSlots: newSlots,
      courtPrice: suggestedPrice.toString()
    }));
  };

  // Sync on modal open
  useEffect(() => {
    if (isOpen) {
      applyTimeSelection(startTime, durationMins, bookingForm.date);
    }
  }, [isOpen]);

  const handleStartTimeChange = (newStartTime) => {
    setStartTime(newStartTime);
    applyTimeSelection(newStartTime, durationMins, bookingForm.date);
  };

  const handleDurationChange = (newDurationMins) => {
    setDurationMins(newDurationMins);
    applyTimeSelection(startTime, newDurationMins, bookingForm.date);
  };

  const handleEndTimeChange = (newEndTime) => {
    const endM = timeToMins(newEndTime);
    const startM = timeToMins(startTime);
    if (endM > startM) {
      const diff = endM - startM;
      setDurationMins(diff);
      applyTimeSelection(startTime, diff, bookingForm.date);
    }
  };

  const handleDateChange = (newDate) => {
    setBookingForm(prev => ({ ...prev, date: newDate }));
    applyTimeSelection(startTime, durationMins, newDate);
  };

  const selectedEndTime = useMemo(() => {
    return minsToTimeString(timeToMins(startTime) + durationMins);
  }, [startTime, durationMins]);

  const assignedFreeCourt = useMemo(() => {
    const startM = timeToMins(startTime);
    const endM = startM + durationMins;
    return assignResource(startM, endM, bookingForm.date, bookingForm.serviceType, bookings);
  }, [startTime, durationMins, bookingForm.date, bookingForm.serviceType, bookings]);

  // Pre-fill or sync customer when prefilledCustomer is provided
  React.useEffect(() => {
    if (prefilledCustomer && isOpen) {
      setBookingForm(prev => ({
        ...prev,
        customerName: prefilledCustomer.name || '',
        customerPhone: (prefilledCustomer.phone || '').replace(/\D/g, '').slice(-10)
      }));
    }
  }, [prefilledCustomer, isOpen]);

  // Sync serviceType when modal opens
  React.useEffect(() => {
    setBookingForm(prev => ({
      ...prev,
      serviceType: initialServiceType === 'group' ? 'group' : 'court'
    }));
  }, [initialServiceType, isOpen]);

  // Check if current name or phone matches an existing customer
  const matchedCustomer = useMemo(() => {
    const cleanPhone = (bookingForm.customerPhone || '').trim();
    const nameLower = (bookingForm.customerName || '').trim().toLowerCase();
    if (!cleanPhone && !nameLower) return null;
    return customers.find(c => {
      const cClean = (c.phone || '').replace(/\D/g, '').slice(-10);
      if (cleanPhone && cleanPhone.length === 10 && cClean === cleanPhone) return true;
      if (nameLower && c.name?.toLowerCase().trim() === nameLower) return true;
      return false;
    });
  }, [customers, bookingForm.customerPhone, bookingForm.customerName]);

  // Autocomplete suggestions
  const customerSuggestions = useMemo(() => {
    const qName = (bookingForm.customerName || '').trim().toLowerCase();
    const qPhone = (bookingForm.customerPhone || '').trim();
    if ((!qName || qName.length < 2) && (!qPhone || qPhone.length < 3)) return [];
    return customers.filter(c => {
      const matchName = qName && qName.length >= 2 && c.name?.toLowerCase().includes(qName);
      const matchPhone = qPhone && qPhone.length >= 3 && (c.phone || '').replace(/\D/g, '').includes(qPhone);
      return matchName || matchPhone;
    }).slice(0, 5);
  }, [customers, bookingForm.customerName, bookingForm.customerPhone]);

  const handleSelectCustomer = (c) => {
    setBookingForm(prev => ({
      ...prev,
      customerName: c.name,
      customerPhone: (c.phone || '').replace(/\D/g, '').slice(-10)
    }));
    setShowCustomerDropdown(false);
  };

  const timeSlots = useMemo(() => generateTimeSlots(6, 24), []);

  // Compute Rental Subtotal
  const rentalsSubtotal = useMemo(() => {
    return (rentals.paddles * 50) + (rentals.shoes * 50) + (rentals.balls * 250);
  }, [rentals]);

  // Compute Drinks & Snacks Subtotal
  const drinksSubtotal = useMemo(() => {
    return Object.entries(selectedDrinks).reduce((sum, [id, qty]) => {
      const item = beverages.find(b => b.id.toString() === id.toString());
      return sum + (item ? ((Number(item.price) || 0) * qty) : 0);
    }, 0);
  }, [selectedDrinks, beverages]);

  // Compute Base Subtotal (Court + Rentals + Refreshments)
  const baseSubtotal = useMemo(() => {
    const courtBase = parseFloat(bookingForm.courtPrice) || 0;
    return courtBase + rentalsSubtotal + drinksSubtotal;
  }, [bookingForm.courtPrice, rentalsSubtotal, drinksSubtotal]);

  // Compute GST (18%: 9% CGST + 9% SGST)
  const cgst = useMemo(() => gstInvoiceEnabled ? Math.round(baseSubtotal * 0.09) : 0, [gstInvoiceEnabled, baseSubtotal]);
  const sgst = useMemo(() => gstInvoiceEnabled ? Math.round(baseSubtotal * 0.09) : 0, [gstInvoiceEnabled, baseSubtotal]);
  const gstAmount = cgst + sgst;

  // Compute Total Price (Base + GST)
  const totalCalculatedPrice = useMemo(() => {
    return baseSubtotal + gstAmount;
  }, [baseSubtotal, gstAmount]);

  // Compute Pending Balance
  const computedPendingBalance = useMemo(() => {
    if (bookingForm.paymentStatus === 'full') return 0;
    const adv = parseFloat(bookingForm.advancePaid) || 0;
    return Math.max(0, totalCalculatedPrice - adv);
  }, [bookingForm.paymentStatus, bookingForm.advancePaid, totalCalculatedPrice]);

  // Determine if active selection or date is in Peak hours (Weekends or Weekdays 18:00+)
  const isPeakTiming = useMemo(() => {
    if (!bookingForm.date) return false;
    const [y, m, d] = bookingForm.date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const hasEveningSlot = bookingForm.selectedSlots.some(s => {
      const h = parseInt(s.split(':')[0], 10);
      return h >= 18;
    });
    return isWeekend || hasEveningSlot;
  }, [bookingForm.date, bookingForm.selectedSlots]);

  if (!isOpen) return null;

  const handleSlotClick = (slot) => {
    setBookingForm(prev => {
      let newSlots = [...prev.selectedSlots];
      if (newSlots.includes(slot)) {
        newSlots = newSlots.filter(s => s !== slot);
      } else {
        newSlots.push(slot);
      }

      if (newSlots.length === 0) return { ...prev, selectedSlots: [] };
      newSlots.sort();

      // Auto-fill contiguous gaps
      if (newSlots.length > 1) {
        const firstMins = timeToMins(newSlots[0]);
        const lastMins = timeToMins(newSlots[newSlots.length - 1]);
        newSlots = [];
        for (let m = firstMins; m <= lastMins; m += 30) {
          const h = Math.floor(m / 60).toString().padStart(2, '0');
          const mins = (m % 60).toString().padStart(2, '0');
          newSlots.push(`${h}:${mins}`);
        }
      }

      const hasConflict = newSlots.some(s => isSlotFullyBooked(s, prev.date, prev.serviceType, bookings));
      if (hasConflict) {
        if (!isSlotFullyBooked(slot, prev.date, prev.serviceType, bookings)) {
          return { ...prev, selectedSlots: [slot] };
        }
        return prev;
      }

      // Auto-suggest court price based on duration and peak/off-peak rate (Peak: ₹700/hr, Off-peak: ₹500/hr)
      const durationHours = (newSlots.length * 30) / 60;
      const [y, m, d] = prev.date.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayOfWeek = dateObj.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const hasEvening = newSlots.some(s => parseInt(s.split(':')[0], 10) >= 18);
      const ratePerHour = (isWeekend || hasEvening) ? 700 : 500;
      const suggestedPrice = Math.round(durationHours * ratePerHour);

      return { 
        ...prev, 
        selectedSlots: newSlots,
        courtPrice: suggestedPrice.toString()
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalStartTime = bookingForm.selectedSlots.length > 0 ? bookingForm.selectedSlots[0] : startTime;
    const finalEndTime = bookingForm.selectedSlots.length > 0 ? calculateEndFromSlots(bookingForm.selectedSlots) : selectedEndTime;
    const finalDuration = bookingForm.selectedSlots.length > 0 ? (bookingForm.selectedSlots.length * 30) : durationMins;

    const resource = assignResource(
      timeToMins(finalStartTime),
      timeToMins(finalEndTime),
      bookingForm.date,
      bookingForm.serviceType,
      bookings
    );

    if (!resource) {
      alert("No available court for the selected time slot. Please select another time slot or date.");
      return;
    }

    const createdTransactions = [];
    let finalCustomerName = bookingForm.customerName;
    let finalCollectedAmount = 0;
    let finalPendingBalance = 0;

    if (bookingForm.serviceType === 'group') {
      const validPlayers = groupPlayers.filter(p => p.name.trim() && parseFloat(p.amount) > 0);
      if (validPlayers.length === 0) {
        alert("Please provide at least one player name and amount.");
        return;
      }

      finalCustomerName = `Group: ${validPlayers.map(p => p.name.trim()).join(', ')}`;
      finalCollectedAmount = validPlayers.reduce((sum, p) => sum + parseFloat(p.amount), 0);

      validPlayers.forEach((p, idx) => {
        createdTransactions.push({
          id: Date.now() + idx + Math.random(),
          type: 'income',
          amount: parseFloat(p.amount),
          category: 'Group Booking',
          paymentMode: p.paymentMode,
          description: `${resource.name} - ${p.name.trim()} (Group) (${bookingForm.date})`,
          date: new Date().toISOString()
        });
      });
    } else {
      if (bookingForm.paymentStatus === 'advance') {
        finalCollectedAmount = parseFloat(bookingForm.advancePaid) || 0;
        finalPendingBalance = computedPendingBalance;
      } else {
        finalCollectedAmount = totalCalculatedPrice;
        finalPendingBalance = 0;
      }

      const drinksList = Object.entries(selectedDrinks)
        .filter(([_, q]) => q > 0)
        .map(([id, q]) => {
          const item = beverages.find(b => b.id.toString() === id.toString());
          return item ? {
            id: item.id,
            name: item.name,
            price: Number(item.price) || 0,
            quantity: q,
            subtotal: (Number(item.price) || 0) * q,
            icon: item.icon || '🥤'
          } : null;
        })
        .filter(Boolean);

      const drinksNote = drinksSubtotal > 0 
        ? ` (+₹${drinksSubtotal} Refreshments: ${drinksList.map(d => `${d.quantity}x ${d.name}`).join(', ')})`
        : '';

      if (finalCollectedAmount > 0) {
        const rentalNote = rentalsSubtotal > 0 
          ? ` (+₹${rentalsSubtotal} Rentals: ${rentals.paddles}p, ${rentals.shoes}s, ${rentals.balls}b)` 
          : '';
        const gstNote = gstInvoiceEnabled ? ` [18% GST Invoice #${companyGstin || 'B2C'}]` : '';

        createdTransactions.push({
          id: Date.now(),
          type: 'income',
          amount: finalCollectedAmount,
          category: gstInvoiceEnabled ? 'Court Booking (GST)' : 'Court Booking',
          paymentMode: bookingForm.paymentMode,
          description: `${resource.name} - ${bookingForm.customerName.trim()} (${bookingForm.paymentStatus === 'advance' ? 'Advance ' : ''}${bookingForm.date})${rentalNote}${drinksNote}${gstNote}`,
          date: new Date().toISOString()
        });
      }
    }

    const drinksList = Object.entries(selectedDrinks)
      .filter(([_, q]) => q > 0)
      .map(([id, q]) => {
        const item = beverages.find(b => b.id.toString() === id.toString());
        return item ? {
          id: item.id,
          name: item.name,
          price: Number(item.price) || 0,
          quantity: q,
          subtotal: (Number(item.price) || 0) * q,
          icon: item.icon || '🥤'
        } : null;
      })
      .filter(Boolean);

    const newBooking = {
      id: Date.now(),
      serviceType: bookingForm.serviceType,
      resourceId: resource.id,
      resourceName: resource.name,
      customerName: finalCustomerName,
      customerPhone: bookingForm.customerPhone.trim(),
      startTime: finalStartTime,
      endTime: finalEndTime,
      duration: finalDuration.toString(),
      date: bookingForm.date,
      courtPrice: parseFloat(bookingForm.courtPrice) || 0,
      rentals: {
        paddles: rentals.paddles,
        shoes: rentals.shoes,
        shoeSizes: rentals.shoeSizes.trim(),
        balls: rentals.balls,
        subtotal: rentalsSubtotal
      },
      // Refreshments & Drinks (Billed Together)
      drinks: drinksList,
      drinksSubtotal,
      // GST Invoice Details
      gstEnabled: gstInvoiceEnabled,
      gstRate: gstInvoiceEnabled ? 18 : 0,
      basePrice: baseSubtotal,
      cgst,
      sgst,
      gstAmount,
      companyName: gstInvoiceEnabled ? companyName.trim() : '',
      companyGstin: gstInvoiceEnabled ? companyGstin.trim() : '',
      academyGstin: '33AAECP4589K1Z4',

      totalPrice: totalCalculatedPrice,
      paidAmount: finalCollectedAmount,
      pendingBalance: finalPendingBalance,
      paymentStatus: finalPendingBalance > 0 ? 'advance' : 'full',
      paymentMode: bookingForm.paymentMode,
      walletDeducted: bookingForm.paymentMode === 'wallet' ? finalCollectedAmount : 0,
      passHoursDeducted: bookingForm.paymentMode === 'pass' ? (duration / 60) : 0,
      matchedCustomerId: matchedCustomer?.id || null,
      comments: bookingForm.comments,
      status: 'active',
      alerted: false
    };

    onAddBooking(newBooking, createdTransactions);
    onClose();
  };

  const groupTotal = groupPlayers.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 shrink-0">
          <h3 className="font-extrabold text-base text-zinc-900 flex items-center gap-2">
            {bookingForm.serviceType === 'group' ? (
              <Users className="text-purple-600" size={20} />
            ) : (
              <CalendarDays className="text-blue-600" size={20} />
            )}
            New {bookingForm.serviceType === 'group' ? 'Group Match (Split Pay)' : 'Court Reservation'}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-800 p-1">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Date & Time Slot Selection */}
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-4">
            {/* Play Date with Quick Today / Tomorrow Buttons */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                  <CalendarDays size={14} className="text-[#d33638]" />
                  Play Date
                </label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDateChange(getLocalYYYYMMDD())}
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg border transition-all ${
                      bookingForm.date === getLocalYYYYMMDD()
                        ? 'bg-[#d33638] text-white border-[#d33638] shadow-sm'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const tom = new Date();
                      tom.setDate(tom.getDate() + 1);
                      handleDateChange(getLocalYYYYMMDD(tom));
                    }}
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg border transition-all ${
                      bookingForm.date !== getLocalYYYYMMDD()
                        ? 'bg-[#d33638] text-white border-[#d33638] shadow-sm'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    Tomorrow
                  </button>
                </div>
              </div>
              <input
                required
                type="date"
                value={bookingForm.date}
                onChange={e => handleDateChange(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 outline-none focus:ring-2 focus:ring-[#d33638]"
              />
            </div>

            {/* Time Selection Header with Mode Toggle */}
            <div className="flex justify-between items-center pt-2 border-t border-zinc-200/60">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <Clock size={14} className="text-[#d33638]" />
                Select Playing Time
              </span>
              <button
                type="button"
                onClick={() => setTimePickerMode(prev => prev === 'simple' ? 'grid' : 'simple')}
                className="text-[11px] font-extrabold text-[#d33638] hover:underline flex items-center gap-1 bg-white border border-red-200 px-2 py-0.5 rounded-lg transition-colors"
              >
                {timePickerMode === 'simple' ? '🔲 Switch to Slot Grid' : '⚡ Simple Time Picker'}
              </button>
            </div>

            {timePickerMode === 'simple' ? (
              <div className="space-y-3.5">
                {/* Quick Period Buttons: Morning / Afternoon / Evening / Night */}
                <div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStartTimeChange('06:00')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                        timeToMins(startTime) < 720
                          ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm font-black'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      <span>🌅 Morning</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartTimeChange('14:00')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                        timeToMins(startTime) >= 720 && timeToMins(startTime) < 1020
                          ? 'bg-blue-100 text-blue-900 border-blue-300 shadow-sm font-black'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      <span>☀️ Afternoon</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartTimeChange('18:00')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                        timeToMins(startTime) >= 1020
                          ? 'bg-purple-100 text-purple-900 border-purple-300 shadow-sm font-black'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      <span>🌆 Evening / Prime</span>
                    </button>
                  </div>
                </div>

                {/* Start Time & End Time Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-zinc-600 mb-1">
                      Start Time (12-Hour AM/PM)
                    </label>
                    <select
                      value={startTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-black text-zinc-900 outline-none focus:ring-2 focus:ring-[#d33638] shadow-sm cursor-pointer"
                    >
                      <optgroup label="🌅 Morning (06:00 AM – 12:00 PM)">
                        {timeSlots.filter(s => timeToMins(s) < 720).map(s => {
                          const booked = isSlotFullyBooked(s, bookingForm.date, bookingForm.serviceType, bookings);
                          return (
                            <option key={s} value={s}>
                              {formatTo12Hour(s)} {booked ? '(Courts Busy)' : ''}
                            </option>
                          );
                        })}
                      </optgroup>
                      <optgroup label="☀️ Afternoon (12:00 PM – 05:00 PM)">
                        {timeSlots.filter(s => timeToMins(s) >= 720 && timeToMins(s) < 1020).map(s => {
                          const booked = isSlotFullyBooked(s, bookingForm.date, bookingForm.serviceType, bookings);
                          return (
                            <option key={s} value={s}>
                              {formatTo12Hour(s)} {booked ? '(Courts Busy)' : ''}
                            </option>
                          );
                        })}
                      </optgroup>
                      <optgroup label="🌆 Evening / Prime (05:00 PM – 10:00 PM)">
                        {timeSlots.filter(s => timeToMins(s) >= 1020 && timeToMins(s) < 1320).map(s => {
                          const booked = isSlotFullyBooked(s, bookingForm.date, bookingForm.serviceType, bookings);
                          return (
                            <option key={s} value={s}>
                              {formatTo12Hour(s)} {booked ? '(Courts Busy)' : ''}
                            </option>
                          );
                        })}
                      </optgroup>
                      <optgroup label="🌙 Night (10:00 PM – 11:30 PM)">
                        {timeSlots.filter(s => timeToMins(s) >= 1320).map(s => {
                          const booked = isSlotFullyBooked(s, bookingForm.date, bookingForm.serviceType, bookings);
                          return (
                            <option key={s} value={s}>
                              {formatTo12Hour(s)} {booked ? '(Courts Busy)' : ''}
                            </option>
                          );
                        })}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-zinc-600 mb-1">
                      End Time
                    </label>
                    <select
                      value={selectedEndTime}
                      onChange={(e) => handleEndTimeChange(e.target.value)}
                      className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-black text-zinc-900 outline-none focus:ring-2 focus:ring-[#d33638] shadow-sm cursor-pointer"
                    >
                      {timeSlots.filter(s => timeToMins(s) > timeToMins(startTime)).concat(['24:00']).map(s => {
                        const dur = timeToMins(s) - timeToMins(startTime);
                        return (
                          <option key={s} value={s}>
                            {formatTo12Hour(s)} ({dur} mins)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Quick 1-Click Duration Chips */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-zinc-600 mb-1.5 flex items-center justify-between">
                    <span>Quick Duration Presets (1-Click)</span>
                    <span className="text-[10px] text-zinc-400 font-semibold">{durationMins} mins selected</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {[
                      { mins: 30, label: '30 mins' },
                      { mins: 60, label: '1 Hour' },
                      { mins: 90, label: '1.5 Hours' },
                      { mins: 120, label: '2 Hours' },
                      { mins: 180, label: '3 Hours' }
                    ].map(d => {
                      const isSelected = durationMins === d.mins;
                      return (
                        <button
                          key={d.mins}
                          type="button"
                          onClick={() => handleDurationChange(d.mins)}
                          className={`py-2 px-1.5 rounded-xl text-xs font-black border transition-all text-center ${
                            isSelected
                              ? 'bg-[#d33638] text-white border-[#d33638] shadow-md shadow-red-900/20 scale-[1.02]'
                              : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Slot Summary & Court Allocation Badge */}
                <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 transition-all ${
                  assignedFreeCourt
                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                    : 'bg-red-50/90 border-red-200 text-red-950'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      assignedFreeCourt ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      <Clock size={18} />
                    </div>
                    <div>
                      <span className="text-xs font-black block text-zinc-900">
                        {formatTo12Hour(startTime)} → {formatTo12Hour(selectedEndTime)} ({durationMins} mins)
                      </span>
                      <span className="text-[11px] font-semibold text-zinc-600">
                        {assignedFreeCourt ? `Allocated: ${assignedFreeCourt.name}` : 'All courts are occupied for this slot'}
                      </span>
                    </div>
                  </div>

                  <div className="self-end sm:self-auto shrink-0">
                    {assignedFreeCourt ? (
                      <span className="text-[10px] font-black uppercase bg-emerald-200 text-emerald-900 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                        <CheckCircle2 size={12} /> Court Free
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase bg-red-200 text-red-900 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                        <AlertCircle size={12} /> Slot Busy
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Classic Slot Grid View (If Toggled) */
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-zinc-600">Click 30-min buttons to toggle slots:</span>
                  {bookingForm.selectedSlots.length > 0 && (
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      {bookingForm.selectedSlots.length * 30} mins
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-44 overflow-y-auto p-2 bg-white border border-zinc-200 rounded-xl">
                  {timeSlots.map(slot => {
                    const booked = isSlotFullyBooked(slot, bookingForm.date, bookingForm.serviceType, bookings);
                    const selected = bookingForm.selectedSlots.includes(slot);

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={booked}
                        onClick={() => handleSlotClick(slot)}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                          booked
                            ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed line-through'
                            : selected
                            ? 'bg-[#d33638] text-white shadow-sm border-[#d33638]'
                            : 'bg-white text-zinc-700 border border-zinc-200 hover:border-[#d33638] hover:bg-red-50'
                        }`}
                      >
                        {formatTo12Hour(slot)}
                      </button>
                    );
                  })}
                </div>

                {bookingForm.selectedSlots.length > 0 && (
                  <div className="mt-2 text-center bg-zinc-100/90 py-1.5 rounded-xl text-xs font-bold text-zinc-800 border border-zinc-200">
                    {formatTo12Hour(bookingForm.selectedSlots[0])} → {formatTo12Hour(calculateEndFromSlots(bookingForm.selectedSlots))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Customer Name & Mobile with Auto-Suggest and Auto-Registration Info */}
          <div className="space-y-2">
            <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1 flex items-center justify-between">
                  <span>Customer / Team Name</span>
                  {customerSuggestions.length > 0 && !showCustomerDropdown && (
                    <button
                      type="button"
                      onClick={() => setShowCustomerDropdown(true)}
                      className="text-[10px] text-[#d33638] hover:underline font-bold"
                    >
                      {customerSuggestions.length} found
                    </button>
                  )}
                </label>
                <input
                  required
                  autoFocus
                  type="text"
                  value={bookingForm.customerName}
                  onFocus={() => {
                    if (customerSuggestions.length > 0) setShowCustomerDropdown(true);
                  }}
                  onChange={e => {
                    setBookingForm({ ...bookingForm, customerName: e.target.value });
                    setShowCustomerDropdown(true);
                  }}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#d33638] outline-none text-xs font-bold"
                  placeholder="e.g. Rahul Team / Manoj"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                  Customer Mobile (WhatsApp)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-[11px] font-bold text-zinc-400">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={bookingForm.customerPhone}
                    onFocus={() => {
                      if (customerSuggestions.length > 0) setShowCustomerDropdown(true);
                    }}
                    onChange={e => {
                      setBookingForm({ ...bookingForm, customerPhone: e.target.value.replace(/\D/g, '').slice(0, 10) });
                      setShowCustomerDropdown(true);
                    }}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-[#d33638] outline-none text-xs font-bold tracking-wider"
                    placeholder="98765 43210"
                  />
                </div>
              </div>

              {/* Floating Customer Suggestions Dropdown */}
              {showCustomerDropdown && customerSuggestions.length > 0 && (
                <div className="absolute top-[100%] left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-30 max-h-56 overflow-y-auto py-1">
                  <div className="px-3 py-1.5 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider flex justify-between items-center border-b border-zinc-100 bg-zinc-50">
                    <span className="flex items-center gap-1">
                      <Search size={12} className="text-[#d33638]" /> Select Registered Customer
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setShowCustomerDropdown(false)}
                      className="text-zinc-400 hover:text-zinc-800 font-black text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  {customerSuggestions.map(cust => (
                    <div
                      key={cust.id}
                      onClick={() => handleSelectCustomer(cust)}
                      className="px-3 py-2.5 hover:bg-red-50/80 cursor-pointer flex items-center justify-between transition-colors border-b border-zinc-50 last:border-0"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {cust.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-900 truncate">{cust.name}</p>
                          <p className="text-[10px] text-zinc-500 font-semibold">{cust.phone || 'No mobile'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {cust.courtHours > 0 && (
                          <span className="text-[10px] text-zinc-400 font-semibold hidden sm:inline">
                            {cust.courtHours} hrs
                          </span>
                        )}
                        <span className="text-[10px] bg-[#d33638] text-white px-2 py-0.5 rounded-md font-extrabold shadow-sm">
                          Select
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Smart Customer Recognition / Auto-Save Indicator */}
            {matchedCustomer ? (
              <div className="flex items-center justify-between text-[11px] bg-blue-50 text-blue-800 px-3 py-1.5 rounded-xl border border-blue-100">
                <span className="flex items-center gap-1.5 font-bold truncate">
                  <UserCheck size={14} className="text-blue-600 shrink-0" />
                  Recognized: <strong>{matchedCustomer.name}</strong> ({matchedCustomer.phone})
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded shrink-0">
                  {matchedCustomer.favoriteCourt ? `Fav: ${matchedCustomer.favoriteCourt}` : 'Directory Member'}
                </span>
              </div>
            ) : (
              bookingForm.customerName.trim().length >= 2 && (
                <div className="flex items-center gap-1.5 text-[11px] bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-100">
                  <Sparkles size={13} className="text-emerald-600 shrink-0" />
                  <span className="font-semibold">
                    First-time player! Will automatically save to <strong>Customer Directory</strong> for all services.
                  </span>
                </div>
              )
            )}
          </div>

          {/* EQUIPMENT & SHOE RENTAL ADD-ONS SECTION */}
          <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>🏓</span> Equipment & Shoe Rentals
              </span>
              {rentalsSubtotal > 0 && (
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  +₹{rentalsSubtotal}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Pro Paddle Rental */}
              <div className="bg-white p-2.5 rounded-xl border border-zinc-200 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-zinc-800">🏓 Pro Paddle</span>
                    <p className="text-[10px] text-zinc-400 font-semibold">₹50 / paddle</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setRentals({ ...rentals, paddles: Math.max(0, rentals.paddles - 1) })}
                    className="w-6 h-6 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-xs text-zinc-900">{rentals.paddles}</span>
                  <button
                    type="button"
                    onClick={() => setRentals({ ...rentals, paddles: rentals.paddles + 1 })}
                    className="w-6 h-6 rounded-lg bg-zinc-900 text-white hover:bg-black flex items-center justify-center font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Shoe Rental */}
              <div className="bg-white p-2.5 rounded-xl border border-zinc-200 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-zinc-800">👟 Court Shoes</span>
                    <p className="text-[10px] text-zinc-400 font-semibold">₹50 / pair</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setRentals({ ...rentals, shoes: Math.max(0, rentals.shoes - 1) })}
                    className="w-6 h-6 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-xs text-zinc-900">{rentals.shoes}</span>
                  <button
                    type="button"
                    onClick={() => setRentals({ ...rentals, shoes: rentals.shoes + 1 })}
                    className="w-6 h-6 rounded-lg bg-zinc-900 text-white hover:bg-black flex items-center justify-center font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Tournament Ball Can */}
              <div className="bg-white p-2.5 rounded-xl border border-zinc-200 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-zinc-800">🎾 Ball Can (Buy)</span>
                    <p className="text-[10px] text-zinc-400 font-semibold">₹250 / can</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setRentals({ ...rentals, balls: Math.max(0, rentals.balls - 1) })}
                    className="w-6 h-6 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-xs text-zinc-900">{rentals.balls}</span>
                  <button
                    type="button"
                    onClick={() => setRentals({ ...rentals, balls: rentals.balls + 1 })}
                    className="w-6 h-6 rounded-lg bg-zinc-900 text-white hover:bg-black flex items-center justify-center font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Optional Shoe Size Note */}
            {rentals.shoes > 0 && (
              <div className="pt-1">
                <input
                  type="text"
                  placeholder="Shoe sizes requested (e.g. Size 8, 9)"
                  value={rentals.shoeSizes}
                  onChange={e => setRentals({ ...rentals, shoeSizes: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-black font-medium"
                />
              </div>
            )}
          </div>

          {/* REFRESHMENTS & DRINKS SECTION (BILLED TOGETHER WITH COURT) */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <Coffee size={15} className="text-amber-700" />
                <span>Drinks & Refreshments (Billed With Court)</span>
              </span>
              {drinksSubtotal > 0 && (
                <span className="text-xs font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                  +₹{drinksSubtotal}
                </span>
              )}
            </div>

            {beverages.length === 0 ? (
              <p className="text-[11px] text-zinc-400 italic">No beverages in inventory.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {beverages.map(item => {
                  const qty = selectedDrinks[item.id] || 0;
                  const stock = typeof item.stock === 'number' ? item.stock : 20;

                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                        qty > 0 
                          ? 'bg-white border-amber-400 shadow-sm ring-1 ring-amber-300' 
                          : 'bg-white/80 border-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg select-none">{item.icon || '🥤'}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-zinc-900 truncate">{item.name}</p>
                          <p className="text-[10px] font-black text-emerald-700">₹{item.price}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-zinc-100">
                        <button
                          type="button"
                          disabled={qty <= 0}
                          onClick={() => {
                            setSelectedDrinks(prev => {
                              const next = (prev[item.id] || 0) - 1;
                              if (next <= 0) {
                                const copy = { ...prev };
                                delete copy[item.id];
                                return copy;
                              }
                              return { ...prev, [item.id]: next };
                            });
                          }}
                          className="w-6 h-6 rounded-lg bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30 flex items-center justify-center font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="font-extrabold text-xs text-zinc-900">{qty}</span>
                        <button
                          type="button"
                          disabled={stock <= 0 || qty >= stock}
                          onClick={() => {
                            setSelectedDrinks(prev => ({
                              ...prev,
                              [item.id]: (prev[item.id] || 0) + 1
                            }));
                          }}
                          className="w-6 h-6 rounded-lg bg-zinc-900 text-white hover:bg-black disabled:opacity-30 flex items-center justify-center font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 18% GST TAX INVOICE TOGGLE (For Corporate & Business Clients) */}
          <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt size={17} className="text-[#d33638]" />
                <div>
                  <span className="text-xs font-bold text-zinc-900 block leading-tight">
                    Include 18% GST Tax Invoice
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    For corporate tournaments & business tax deduction
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={gstInvoiceEnabled}
                  onChange={e => setGstInvoiceEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#d33638]"></div>
              </label>
            </div>

            {gstInvoiceEnabled && (
              <div className="pt-2 border-t border-zinc-200 space-y-2 animate-in fade-in duration-150">
                <div className="text-[10px] font-bold text-zinc-500 flex justify-between">
                  <span>Academy GSTIN:</span>
                  <span className="font-mono text-zinc-800 font-bold">33AAECP4589K1Z4</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-0.5">
                      Company / Organization Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Infosys Ltd / Tech Corp"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      className="w-full bg-white border border-zinc-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-[#d33638]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-0.5">
                      Client GSTIN (15-Digit)
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="33AAAAA0000A1Z5"
                      value={companyGstin}
                      onChange={e => setCompanyGstin(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-zinc-300 rounded-xl px-2.5 py-1.5 text-xs font-mono font-semibold outline-none focus:border-[#d33638]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pricing, Advance Payment & Method */}
          {bookingForm.serviceType === 'group' ? (
            /* Group Split Payments */
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                  Player Split Details
                </label>
                <button
                  type="button"
                  onClick={() => setGroupPlayers([...groupPlayers, { id: Date.now(), name: '', amount: '', paymentMode: 'cash' }])}
                  className="text-xs font-bold bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg hover:bg-purple-200 flex items-center gap-1 transition-colors"
                >
                  <Plus size={14} /> Add Player
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {groupPlayers.map((player, idx) => (
                  <div key={player.id} className="flex gap-2 items-center bg-white border border-zinc-200 p-2 rounded-xl">
                    <input
                      required
                      type="text"
                      placeholder={`Player ${idx + 1}`}
                      value={player.name}
                      onChange={e => {
                        const updated = [...groupPlayers];
                        updated[idx].name = e.target.value;
                        setGroupPlayers(updated);
                      }}
                      className="w-1/3 text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-2 outline-none focus:border-purple-500 font-medium"
                    />
                    <div className="relative w-1/4">
                      <span className="absolute left-2 top-2 text-xs font-bold text-zinc-400">₹</span>
                      <input
                        required
                        type="number"
                        placeholder="Amt"
                        value={player.amount}
                        onChange={e => {
                          const updated = [...groupPlayers];
                          updated[idx].amount = e.target.value;
                          setGroupPlayers(updated);
                        }}
                        className="w-full text-xs pl-5 bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-2 outline-none font-bold text-purple-700 focus:border-purple-500"
                      />
                    </div>
                    <select
                      value={player.paymentMode}
                      onChange={e => {
                        const updated = [...groupPlayers];
                        updated[idx].paymentMode = e.target.value;
                        setGroupPlayers(updated);
                      }}
                      className="w-1/4 text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-2 outline-none font-bold text-zinc-700"
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                    </select>
                    {groupPlayers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setGroupPlayers(groupPlayers.filter(p => p.id !== player.id))}
                        className="text-zinc-400 hover:text-red-600 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-right text-xs font-bold text-zinc-600 pt-1">
                Total Collected: <span className="text-purple-700 text-sm font-black">₹{groupTotal.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            /* Standard Court Pricing & Partial Payment */
            <div className="space-y-3.5">
              {/* Fee Breakdown */}
              <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-600 font-medium">Court Booking Fee:</span>
                    {isPeakTiming ? (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        ⚡ Peak Rate (₹700/h)
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        🌿 Off-Peak (₹500/h)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-zinc-700">₹</span>
                    <input
                      type="number"
                      value={bookingForm.courtPrice}
                      onChange={e => setBookingForm({ ...bookingForm, courtPrice: e.target.value })}
                      className="w-20 bg-white border border-zinc-300 rounded-lg px-2 py-1 text-xs font-bold text-right outline-none"
                    />
                  </div>
                </div>

                {rentalsSubtotal > 0 && (
                  <div className="flex justify-between items-center text-xs text-emerald-700 font-semibold">
                    <span>Rentals Subtotal:</span>
                    <span>+₹{rentalsSubtotal}</span>
                  </div>
                )}

                {drinksSubtotal > 0 && (
                  <div className="flex justify-between items-center text-xs text-amber-800 font-semibold">
                    <span>Refreshments (Drinks & Snacks):</span>
                    <span>+₹{drinksSubtotal}</span>
                  </div>
                )}

                {gstInvoiceEnabled && (
                  <>
                    <div className="flex justify-between items-center text-xs text-zinc-500 font-medium">
                      <span>Base Subtotal:</span>
                      <span>₹{baseSubtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-blue-700 font-semibold">
                      <span>CGST (9%):</span>
                      <span>+₹{cgst.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-blue-700 font-semibold">
                      <span>SGST (9%):</span>
                      <span>+₹{sgst.toLocaleString()}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-zinc-200 text-sm font-black text-zinc-900">
                  <span>Total Billable Amount {gstInvoiceEnabled ? '(incl. 18% GST)' : ''}:</span>
                  <span className="text-base text-emerald-700">₹{totalCalculatedPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Full Payment vs Partial Advance Toggle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  Payment Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingForm({ ...bookingForm, paymentStatus: 'full' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      bookingForm.paymentStatus === 'full'
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    Full Payment (₹{totalCalculatedPrice})
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingForm({ ...bookingForm, paymentStatus: 'advance', advancePaid: (totalCalculatedPrice / 2).toString() })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      bookingForm.paymentStatus === 'advance'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    Advance Paid (Balance Due)
                  </button>
                </div>
              </div>

              {/* If Advance, Input Advance Amount and Show Remaining Balance */}
              {bookingForm.paymentStatus === 'advance' && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">
                      Advance Paid Right Now (₹)
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      max={totalCalculatedPrice}
                      value={bookingForm.advancePaid}
                      onChange={e => setBookingForm({ ...bookingForm, advancePaid: e.target.value })}
                      className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-900 outline-none"
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-amber-800 uppercase">Balance Due:</span>
                    <p className="text-base font-black text-amber-900">₹{computedPendingBalance.toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Payment Mode for Amount Collected Now */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5 flex items-center justify-between">
                  <span>Paid Via (Register Mode)</span>
                  {matchedCustomer && (
                    <span className="text-[10px] text-zinc-500 font-semibold">
                      Credits: ₹{matchedCustomer.walletBalance || 0} Cash • {(matchedCustomer.passHours || 0).toFixed(1)}h Pass
                    </span>
                  )}
                </label>

                {/* VIP Customer Pass / Wallet Quick Buttons if available */}
                {matchedCustomer && ((matchedCustomer.walletBalance || 0) > 0 || (matchedCustomer.passHours || 0) > 0) && (
                  <div className="mb-2 p-2 bg-gradient-to-r from-red-50 to-amber-50 rounded-xl border border-red-200/80 flex items-center justify-between flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-700 flex items-center gap-1">
                      <Sparkles size={13} className="text-[#d33638]" /> VIP Member Credits:
                    </span>
                    <div className="flex gap-1.5">
                      {(matchedCustomer.walletBalance || 0) >= totalCalculatedPrice && (
                        <button
                          type="button"
                          onClick={() => setBookingForm({ ...bookingForm, paymentMode: 'wallet' })}
                          className={`text-[10px] font-black px-2 py-1 rounded-lg border transition-all ${
                            bookingForm.paymentMode === 'wallet'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                          }`}
                        >
                          💳 Pay from Wallet (₹{matchedCustomer.walletBalance})
                        </button>
                      )}
                      {(matchedCustomer.passHours || 0) >= ((bookingForm.selectedSlots.length * 30) / 60) && (
                        <button
                          type="button"
                          onClick={() => setBookingForm({ ...bookingForm, paymentMode: 'pass' })}
                          className={`text-[10px] font-black px-2 py-1 rounded-lg border transition-all ${
                            bookingForm.paymentMode === 'pass'
                              ? 'bg-[#d33638] text-white border-[#d33638] shadow-sm'
                              : 'bg-white text-[#d33638] border-red-300 hover:bg-red-50'
                          }`}
                        >
                          🎟️ Deduct Pass ({(matchedCustomer.passHours || 0).toFixed(1)}h left)
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {['cash', 'upi', 'turftown', 'wallet', 'pass'].map(mode => {
                    if (mode === 'wallet' && (!matchedCustomer || (matchedCustomer.walletBalance || 0) <= 0)) return null;
                    if (mode === 'pass' && (!matchedCustomer || (matchedCustomer.passHours || 0) <= 0)) return null;

                    return (
                      <label
                        key={mode}
                        className={`cursor-pointer text-center border rounded-xl py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                          bookingForm.paymentMode === mode
                            ? mode === 'wallet'
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                              : mode === 'pass'
                              ? 'bg-[#d33638] border-[#d33638] text-white shadow-sm'
                              : 'bg-zinc-900 border-zinc-900 text-white shadow-sm'
                            : 'bg-white border-zinc-300 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payMode"
                          value={mode}
                          className="hidden"
                          checked={bookingForm.paymentMode === mode}
                          onChange={() => setBookingForm({ ...bookingForm, paymentMode: mode })}
                        />
                        {mode === 'pass' ? '🎟️ Pass' : mode === 'wallet' ? '💳 Wallet' : mode}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Comments / Notes (Optional)
            </label>
            <input
              type="text"
              value={bookingForm.comments}
              onChange={e => setBookingForm({ ...bookingForm, comments: e.target.value })}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-black outline-none text-xs font-medium"
              placeholder="e.g. Paid via PhonePe, non-marking shoes issued..."
            />
          </div>

          {/* On-Duty Staff Attribution Note */}
          <div className="flex items-center justify-between text-[11px] text-zinc-600 bg-zinc-100/80 px-3.5 py-2 rounded-xl border border-zinc-200">
            <span className="font-semibold">Attributed To On-Duty Staff:</span>
            <span className="font-extrabold text-zinc-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {activeShift?.staffName || 'Staff Member'} ({activeShift?.shiftType || 'Shift'})
            </span>
          </div>

          <button
            type="submit"
            disabled={bookingForm.selectedSlots.length === 0 || !assignedFreeCourt}
            className="w-full bg-[#d33638] text-white py-3.5 rounded-xl font-extrabold text-sm hover:bg-[#b42628] transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] uppercase tracking-wider font-sports"
          >
            {assignedFreeCourt ? 'Confirm & Lock Court Reservation' : '⚠️ No Court Available For This Slot'}
          </button>
        </form>
      </div>
    </div>
  );
}
