import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, CheckCircle2, User, Phone, Calendar, 
  DollarSign, Banknote, Smartphone, MessageSquare,
  Search, Sparkles, UserCheck
} from 'lucide-react';
import { getLocalYYYYMMDD } from '../../utils/slots';

export default function EnrollStudentModal({ 
  isOpen, 
  onClose, 
  batches = [], 
  onEnrollStudent,
  initialBatchId = null,
  customers = [],
  prefilledCustomer = null
}) {
  const todayStr = getLocalYYYYMMDD();
  
  // Calculate default next renewal date (1 month from today)
  const nextMonthDate = new Date();
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
  const defaultRenewalStr = getLocalYYYYMMDD(nextMonthDate);

  const [studentName, setStudentName] = useState('');
  const [phone, setPhone] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [selectedBatchId, setSelectedBatchId] = useState(initialBatchId || (batches[0]?.id || ''));
  const [feePlan, setFeePlan] = useState('monthly');
  const [paymentMode, setPaymentMode] = useState('upi');
  const [renewalDate, setRenewalDate] = useState(defaultRenewalStr);
  const [uniformIssued, setUniformIssued] = useState(false);
  const [notes, setNotes] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Pre-fill if prefilledCustomer is provided
  useEffect(() => {
    if (prefilledCustomer && isOpen) {
      setStudentName(prefilledCustomer.name || '');
      setPhone((prefilledCustomer.phone || '').replace(/\D/g, '').slice(-10));
    }
  }, [prefilledCustomer, isOpen]);

  const activeBatch = batches.find(b => b.id.toString() === selectedBatchId?.toString()) || batches[0];
  const [customFee, setCustomFee] = useState(activeBatch?.monthlyFee ? activeBatch.monthlyFee.toString() : '1500');

  // Autocomplete matching
  const matchedCustomer = useMemo(() => {
    const cleanPhone = (phone || '').trim();
    const nameLower = (studentName || '').trim().toLowerCase();
    if (!cleanPhone && !nameLower) return null;
    return customers.find(c => {
      const cClean = (c.phone || '').replace(/\D/g, '').slice(-10);
      if (cleanPhone && cleanPhone.length === 10 && cClean === cleanPhone) return true;
      if (nameLower && c.name?.toLowerCase().trim() === nameLower) return true;
      return false;
    });
  }, [customers, phone, studentName]);

  const customerSuggestions = useMemo(() => {
    const qName = (studentName || '').trim().toLowerCase();
    const qPhone = (phone || '').trim();
    if ((!qName || qName.length < 2) && (!qPhone || qPhone.length < 3)) return [];
    return customers.filter(c => {
      const matchName = qName && qName.length >= 2 && c.name?.toLowerCase().includes(qName);
      const matchPhone = qPhone && qPhone.length >= 3 && (c.phone || '').replace(/\D/g, '').includes(qPhone);
      return matchName || matchPhone;
    }).slice(0, 5);
  }, [customers, studentName, phone]);

  const handleSelectCustomer = (c) => {
    setStudentName(c.name);
    setPhone((c.phone || '').replace(/\D/g, '').slice(-10));
    setShowCustomerDropdown(false);
  };

  // Update fee when batch changes
  const handleBatchChange = (bId) => {
    setSelectedBatchId(bId);
    const b = batches.find(x => x.id.toString() === bId.toString());
    if (b) {
      setCustomFee(b.monthlyFee.toString());
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!studentName.trim() || !phone.trim() || !activeBatch) {
      alert("Please provide the student name, mobile number, and select an academy batch.");
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '').slice(0, 10);
    const feeAmount = parseFloat(customFee) || 0;

    const studentRecord = {
      id: Date.now(),
      name: studentName.trim(),
      phone: cleanPhone,
      level: level.trim(),
      batchId: activeBatch.id,
      batchName: activeBatch.name,
      category: activeBatch.category,
      feePlan,
      lastFeePaidDate: todayStr,
      nextRenewalDate: renewalDate,
      feeAmount,
      paymentMode,
      uniformIssued,
      status: 'active',
      notes: notes.trim()
    };

    // Prepare ledger transaction
    const categoryName = activeBatch.category === 'karate' 
      ? 'Karate Fee' 
      : activeBatch.category === 'yoga' 
      ? 'Yoga Fee' 
      : 'Class Fee';

    const transactionRecord = {
      id: Date.now() + 1,
      type: 'income',
      amount: feeAmount,
      category: categoryName,
      paymentMode,
      description: `${activeBatch.name} - ${studentName.trim()} (${feePlan.toUpperCase()} Fee)`,
      date: new Date().toISOString()
    };

    onEnrollStudent(studentRecord, transactionRecord);

    // Format optional WhatsApp welcome slip
    const welcomeMsg = [
      `🐼 *PANDA SPORTS ACADEMY — ENROLLMENT RECEIPT*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `🥋 *Program / Batch:* ${activeBatch.name}`,
      `👤 *Student Name:* ${studentName.trim()} (${level})`,
      `📱 *Parent Mobile:* +91 ${cleanPhone}`,
      `📅 *Class Schedule:* ${activeBatch.days.join(', ')} (${activeBatch.startTime} – ${activeBatch.endTime})`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `💰 *Fee Paid:* ₹${feeAmount.toLocaleString()} (${paymentMode.toUpperCase()})`,
      `🗓️ *Next Renewal Due:* ${renewalDate}`,
      ...(uniformIssued ? [`🥋 *Academy Uniform:* Issued`] : []),
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `📍 *Panda Sports Academy, Coimbatore*`,
      `Welcome to the Academy! Please ensure your child arrives 5 minutes before class.`
    ].join('\n');

    const whatsappUrl = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(welcomeMsg)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 shrink-0">
          <div>
            <h3 className="font-extrabold text-base text-zinc-900 flex items-center gap-2">
              <span>👤 Enroll Student / Member</span>
            </h3>
            <p className="text-[11px] text-zinc-500 font-medium">
              Register for Karate, Yoga, or Coaching with instant fee logging & WhatsApp receipt
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-800 p-1">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Select Batch */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Select Academy Program / Batch
            </label>
            <select
              value={selectedBatchId}
              onChange={e => handleBatchChange(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-black"
            >
              {batches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.icon || '🥋'} {b.name} ({b.days.join(', ')} • {b.startTime}-{b.endTime}) - ₹{b.monthlyFee}/mo
                </option>
              ))}
            </select>
          </div>

          {/* Student Name & Phone with Autocomplete & Auto-Registration */}
          <div className="space-y-2">
            <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1 flex items-center justify-between">
                  <span>Student / Member Name</span>
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
                  type="text"
                  placeholder="e.g. Arjun Kumar"
                  value={studentName}
                  onFocus={() => {
                    if (customerSuggestions.length > 0) setShowCustomerDropdown(true);
                  }}
                  onChange={e => {
                    setStudentName(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                  Parent / Member Mobile (+91)
                </label>
                <input
                  required
                  type="tel"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={phone}
                  onFocus={() => {
                    if (customerSuggestions.length > 0) setShowCustomerDropdown(true);
                  }}
                  onChange={e => {
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                    setShowCustomerDropdown(true);
                  }}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638]"
                />
              </div>

              {/* Floating Customer Suggestions Dropdown */}
              {showCustomerDropdown && customerSuggestions.length > 0 && (
                <div className="absolute top-[100%] left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-30 max-h-56 overflow-y-auto py-1">
                  <div className="px-3 py-1.5 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider flex justify-between items-center border-b border-zinc-100 bg-zinc-50">
                    <span className="flex items-center gap-1">
                      <Search size={12} className="text-[#d33638]" /> Select Registered Customer / Member
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
                  Directory Member
                </span>
              </div>
            ) : (
              studentName.trim().length >= 2 && (
                <div className="flex items-center gap-1.5 text-[11px] bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-100">
                  <Sparkles size={13} className="text-emerald-600 shrink-0" />
                  <span className="font-semibold">
                    New student! Will automatically save to <strong>Customer Directory</strong> across all services.
                  </span>
                </div>
              )
            )}
          </div>

          {/* Level / Belt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Belt / Experience Level
              </label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 outline-none focus:border-black"
              >
                <option value="White Belt (Beginner)">White Belt (Beginner)</option>
                <option value="Yellow Belt">Yellow Belt</option>
                <option value="Orange Belt">Orange Belt</option>
                <option value="Green Belt">Green Belt</option>
                <option value="Blue / Brown Belt">Blue / Brown Belt</option>
                <option value="Black Belt">Black Belt</option>
                <option value="Beginner">Beginner (Yoga/Fitness)</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Fee Plan
              </label>
              <select
                value={feePlan}
                onChange={e => {
                  setFeePlan(e.target.value);
                  if (e.target.value === 'quarterly' && activeBatch) {
                    setCustomFee((activeBatch.monthlyFee * 3 * 0.9).toFixed(0)); // 10% discount for quarterly
                  } else if (activeBatch) {
                    setCustomFee(activeBatch.monthlyFee.toString());
                  }
                }}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 outline-none focus:border-black"
              >
                <option value="monthly">Monthly Subscription (1 Month)</option>
                <option value="quarterly">Quarterly Plan (3 Months)</option>
                <option value="dropin">Single Drop-In Class Pass</option>
              </select>
            </div>
          </div>

          {/* Fee Amount & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                Fee Amount Collected (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-zinc-400 font-bold text-xs">₹</span>
                <input
                  required
                  type="number"
                  min="0"
                  value={customFee}
                  onChange={e => setCustomFee(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-xl pl-7 pr-3 py-1.5 text-sm font-black text-emerald-600 outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMode('upi')}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                    paymentMode === 'upi'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  <Smartphone size={13} />
                  <span>UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('cash')}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                    paymentMode === 'cash'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  <Banknote size={13} />
                  <span>Cash</span>
                </button>
              </div>
            </div>
          </div>

          {/* Next Renewal Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Next Fee Renewal Due Date
              </label>
              <input
                required
                type="date"
                value={renewalDate}
                onChange={e => setRenewalDate(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-900 outline-none focus:border-black"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-zinc-800">
                <input
                  type="checkbox"
                  checked={uniformIssued}
                  onChange={e => setUniformIssued(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-zinc-300"
                />
                <span>Academy Uniform / Gi Issued</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Enrollment Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Paid in full, brother also enrolled in Yoga..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-black"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#d33638] hover:bg-[#b42628] text-white py-3.5 rounded-xl font-extrabold text-sm transition-all shadow-md shadow-red-900/20 active:scale-[0.99] flex items-center justify-center gap-2 uppercase tracking-wider font-sports"
          >
            <CheckCircle2 size={16} />
            <span>Complete Enrollment & Issue WhatsApp Pass</span>
          </button>
        </form>
      </div>
    </div>
  );
}
