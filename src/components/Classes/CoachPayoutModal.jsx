import React, { useState } from 'react';
import { X, CheckCircle2, Award, Banknote, Smartphone, DollarSign } from 'lucide-react';

export default function CoachPayoutModal({ isOpen, onClose, batches = [], onAddPayout }) {
  const [instructor, setInstructor] = useState(batches[0]?.instructor || '');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('upi');
  const [payoutType, setPayoutType] = useState('monthly_salary');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const instructorsList = Array.from(new Set(batches.map(b => b.instructor).filter(Boolean)));

  const handleSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !instructor.trim()) {
      alert("Please specify the instructor name and valid payout amount.");
      return;
    }

    const payoutRecord = {
      id: Date.now(),
      type: 'expense',
      amount: amt,
      category: 'Coach Payout',
      paymentMode,
      description: `Instructor Payout - ${instructor.trim()} (${payoutType === 'monthly_salary' ? 'Monthly Retainer' : 'Batch Revenue Share'})`,
      date: new Date().toISOString(),
      notes: notes.trim()
    };

    onAddPayout(payoutRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 shrink-0">
          <div>
            <h3 className="font-extrabold text-base text-zinc-900 flex items-center gap-2">
              <Award size={18} className="text-[#d33638]" />
              <span>Coach / Trainer Payout</span>
            </h3>
            <p className="text-[11px] text-zinc-500 font-medium">Record instructor salary or commission</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-800 p-1">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Instructor Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Coach / Sensei / Trainer Name
            </label>
            <input
              required
              type="text"
              list="instructors-list"
              placeholder="e.g. Sensei Anand"
              value={instructor}
              onChange={e => setInstructor(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 outline-none focus:border-black"
            />
            <datalist id="instructors-list">
              {instructorsList.map(inst => (
                <option key={inst} value={inst} />
              ))}
            </datalist>
          </div>

          {/* Payout Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Payout Category
            </label>
            <select
              value={payoutType}
              onChange={e => setPayoutType(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 outline-none focus:border-black"
            >
              <option value="monthly_salary">Fixed Monthly Retainer / Salary</option>
              <option value="revenue_share">Batch Revenue Commission (e.g. 70/30)</option>
              <option value="per_class">Per-Class Session Honorarium</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Payout Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-zinc-400 font-bold text-sm">₹</span>
              <input
                required
                type="number"
                min="1"
                placeholder="10000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-8 pr-4 py-2 text-base font-black text-red-600 outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Disbursed Via
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('upi')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  paymentMode === 'upi'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                <Smartphone size={14} />
                <span>UPI / Bank</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('cash')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  paymentMode === 'cash'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                <Banknote size={14} />
                <span>Cash Register</span>
              </button>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Notes / Voucher Reference
            </label>
            <input
              type="text"
              placeholder="e.g. September month Karate batch payout"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-black"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-zinc-900 hover:bg-black text-white py-3 rounded-xl font-bold text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>Record Coach Payout</span>
          </button>
        </form>
      </div>
    </div>
  );
}
