import React, { useState } from 'react';
import { 
  X, Sun, Moon, CheckCircle2, AlertTriangle, 
  Banknote, User, MessageSquare, Printer 
} from 'lucide-react';

export default function ShiftHandoverModal({ 
  isOpen, 
  onClose, 
  currentCashBalance, 
  users = [], 
  currentUser, 
  onSaveHandover 
}) {
  const now = new Date();
  const currentHour = now.getHours();
  // Auto-suggest Day shift if before 2 PM (14:00), else Evening shift
  const defaultShift = currentHour >= 6 && currentHour < 14 ? 'day' : 'evening';

  const [shiftType, setShiftType] = useState(defaultShift);
  const [outgoingStaff, setOutgoingStaff] = useState(currentUser?.name || '');
  const [incomingStaff, setIncomingStaff] = useState('');
  const [physicalCash, setPhysicalCash] = useState(currentCashBalance.toString());
  const [openingFloat, setOpeningFloat] = useState('500'); // Default ₹500 retained float
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const expectedCash = Number(currentCashBalance) || 0;
  const countedCash = parseFloat(physicalCash) || 0;
  const difference = countedCash - expectedCash;
  const isShortage = difference < 0;
  const isExcess = difference > 0;
  const isBalanced = difference === 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!outgoingStaff.trim()) {
      alert("Please provide the outgoing staff person name.");
      return;
    }
    if (!incomingStaff.trim()) {
      alert("Please specify the taking-over staff person name.");
      return;
    }

    const handoverRecord = {
      id: Date.now(),
      date: now.toISOString(),
      shiftType, // 'day' | 'evening'
      outgoingStaff: outgoingStaff.trim(),
      incomingStaff: incomingStaff.trim(),
      expectedCash,
      physicalCash: countedCash,
      difference,
      openingFloat: parseFloat(openingFloat) || 0,
      notes: notes.trim()
    };

    onSaveHandover(handoverRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 shrink-0">
          <div>
            <h3 className="font-extrabold text-base text-zinc-900 flex items-center gap-2">
              <span>🔄 Staff Shift Handover & Till Audit</span>
            </h3>
            <p className="text-[11px] text-zinc-500 font-medium">
              Reconcile physical cash drawer and hand over keys between shifts
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-800 p-1">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Shift Type Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Shift Closing Now
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setShiftType('day')}
                className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                  shiftType === 'day'
                    ? 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-400/40 shadow-sm'
                    : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                <Sun size={17} className="text-amber-500" />
                <div className="text-left">
                  <div className="leading-tight">Day / Morning Shift</div>
                  <div className="text-[10px] text-amber-700 font-normal">6:00 AM – 2:00 PM</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShiftType('evening')}
                className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                  shiftType === 'evening'
                    ? 'bg-indigo-50 text-indigo-950 border-indigo-300 ring-2 ring-indigo-400/40 shadow-sm'
                    : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                <Moon size={17} className="text-indigo-600" />
                <div className="text-left">
                  <div className="leading-tight">Evening / Night Shift</div>
                  <div className="text-[10px] text-indigo-700 font-normal">2:00 PM – 10:00 PM</div>
                </div>
              </button>
            </div>
          </div>

          {/* Staff Persons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
            {/* Outgoing Person */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Handing Over (Outgoing Staff)
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Rahul / Staff"
                value={outgoingStaff}
                onChange={e => setOutgoingStaff(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 outline-none focus:border-black"
              />
              <span className="text-[10px] text-zinc-400 mt-0.5 block">Finishing active shift</span>
            </div>

            {/* Incoming Person */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Taking Over (Incoming Staff)
              </label>
              <input
                required
                type="text"
                list="staff-suggestions"
                placeholder="e.g. Karthik / Staff"
                value={incomingStaff}
                onChange={e => setIncomingStaff(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 outline-none focus:border-black"
              />
              <datalist id="staff-suggestions">
                {users.map(u => (
                  <option key={u.id} value={u.name} />
                ))}
              </datalist>
              <span className="text-[10px] text-zinc-400 mt-0.5 block">Starting next shift</span>
            </div>
          </div>

          {/* Cash Reconcilation Box */}
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-3">
            <div className="flex justify-between items-center text-xs text-zinc-600">
              <span className="font-semibold">System Expected Cash in Register:</span>
              <span className="font-extrabold text-sm text-zinc-900">₹{expectedCash.toLocaleString()}</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                Actual Physical Cash Counted in Drawer (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-400 font-black text-sm">₹</span>
                <input
                  required
                  type="number"
                  min="0"
                  step="any"
                  value={physicalCash}
                  onChange={e => setPhysicalCash(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-xl pl-8 pr-4 py-2.5 text-lg font-black text-zinc-900 outline-none focus:ring-2 focus:ring-[#d33638]"
                />
              </div>
            </div>

            {/* Discrepancy Status Card */}
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
              isBalanced 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                : isShortage 
                ? 'bg-red-50 text-red-900 border-red-200' 
                : 'bg-blue-50 text-blue-900 border-blue-200'
            }`}>
              <div className="flex items-center gap-2">
                {isBalanced && <CheckCircle2 size={16} className="text-emerald-600" />}
                {isShortage && <AlertTriangle size={16} className="text-red-600" />}
                {isExcess && <Banknote size={16} className="text-blue-600" />}
                <span>
                  {isBalanced && 'Cash Drawer Perfectly Balanced!'}
                  {isShortage && `Cash Shortage: -₹${Math.abs(difference).toLocaleString()}`}
                  {isExcess && `Cash Surplus: +₹${difference.toLocaleString()}`}
                </span>
              </div>
              <span className="text-sm font-black">
                {difference === 0 ? '₹0 diff' : `${difference > 0 ? '+' : ''}₹${difference}`}
              </span>
            </div>
          </div>

          {/* Retained Opening Float for Next Shift */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Opening Cash Float Retained in Drawer (₹)
            </label>
            <input
              type="number"
              min="0"
              value={openingFloat}
              onChange={e => setOpeningFloat(e.target.value)}
              placeholder="e.g. 500"
              className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 outline-none focus:border-black"
            />
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Cash left in drawer for 10s and 20s change for incoming staff.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Handover Remarks / Discrepancy Explanation
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. All courts locked and swept, ₹500 change in till, keys handed over..."
              className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-2.5 text-xs font-medium outline-none focus:border-black resize-none"
            />
          </div>

          {/* Confirm Button */}
          <button
            type="submit"
            className="w-full bg-[#d33638] hover:bg-[#b42628] text-white py-3.5 rounded-xl font-extrabold text-sm transition-all shadow-md shadow-red-900/20 active:scale-[0.99] flex items-center justify-center gap-2 uppercase tracking-wider font-sports"
          >
            <CheckCircle2 size={16} />
            <span>Confirm & Record Shift Handover</span>
          </button>
        </form>
      </div>
    </div>
  );
}
