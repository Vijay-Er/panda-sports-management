import React, { useState } from 'react';
import { X, CheckCircle2, Banknote, Smartphone, Scale } from 'lucide-react';

export default function CollectBalanceModal({ isOpen, onClose, booking, onCollectBalance }) {
  const [collectAmount, setCollectAmount] = useState(booking?.pendingBalance ? booking.pendingBalance.toString() : '0');
  const [paymentMode, setPaymentMode] = useState('cash');

  // Update collectAmount if booking changes
  React.useEffect(() => {
    if (booking?.pendingBalance) {
      setCollectAmount(booking.pendingBalance.toString());
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(collectAmount);
    if (!amt || amt <= 0) return;

    onCollectBalance(booking.id, amt, paymentMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-amber-100 bg-amber-50 flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-sm text-amber-950">Collect Pending Balance</h3>
            <p className="text-[11px] text-amber-700 font-semibold">{booking.customerName}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-800 p-1">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-xs space-y-1">
            <div className="flex justify-between text-zinc-600">
              <span>Court:</span>
              <span className="font-bold text-zinc-900">{booking.resourceName}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Date & Slot:</span>
              <span className="font-bold text-zinc-900">{booking.date} ({booking.startTime} - {booking.endTime})</span>
            </div>
            <div className="flex justify-between text-amber-800 pt-1 border-t border-zinc-200 font-bold">
              <span>Outstanding Due:</span>
              <span className="text-sm font-black text-amber-900">₹{booking.pendingBalance?.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Amount to Collect Right Now (₹)
            </label>
            <input
              required
              autoFocus
              type="number"
              min="1"
              max={booking.pendingBalance}
              value={collectAmount}
              onChange={e => setCollectAmount(e.target.value)}
              className="w-full border border-zinc-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-black outline-none font-black text-xl text-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('cash')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                  paymentMode === 'cash'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                <Banknote size={15} />
                <span>Cash</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('upi')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                  paymentMode === 'upi'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                <Smartphone size={15} />
                <span>UPI</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-zinc-900 hover:bg-black text-white py-3.5 rounded-xl font-bold text-xs transition-colors shadow-md shadow-black/10 flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>Record Payment & Settle Balance</span>
          </button>
        </form>
      </div>
    </div>
  );
}
