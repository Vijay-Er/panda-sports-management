import React, { useState } from 'react';
import { X, CreditCard, Sparkles, CheckCircle2, Ticket, Wallet, Banknote, Smartphone } from 'lucide-react';

export default function WalletTopupModal({
  isOpen,
  onClose,
  customer,
  onTopupWallet
}) {
  if (!isOpen || !customer) return null;

  const [topupMode, setTopupMode] = useState('pass10'); // 'pass10', 'pass20', 'custom_cash'
  const [customAmount, setCustomAmount] = useState('2000');
  const [paymentMode, setPaymentMode] = useState('upi'); // 'upi', 'cash'

  const PACKAGES = {
    pass10: {
      name: 'Panda 10-Hour Court Pass',
      hours: 10,
      price: 5000,
      description: 'Prepaid 10 hours court credits at ₹500/hr (Save ₹1,000 off peak rates)'
    },
    pass20: {
      name: 'Panda 20-Hour Pro Pass',
      hours: 20,
      price: 9000,
      description: 'Prepaid 20 hours court credits at ₹450/hr (Save ₹3,000 off peak rates)'
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let addedHours = 0;
    let addedAmount = 0;
    let chargeAmount = 0;
    let packageTitle = '';

    if (topupMode === 'pass10') {
      addedHours = 10;
      chargeAmount = PACKAGES.pass10.price;
      packageTitle = PACKAGES.pass10.name;
    } else if (topupMode === 'pass20') {
      addedHours = 20;
      chargeAmount = PACKAGES.pass20.price;
      packageTitle = PACKAGES.pass20.name;
    } else {
      addedAmount = parseFloat(customAmount) || 0;
      chargeAmount = addedAmount;
      packageTitle = `Prepaid Wallet Top-Up (₹${addedAmount})`;
    }

    if (chargeAmount <= 0) {
      alert("Please enter a valid top-up amount.");
      return;
    }

    const transaction = {
      id: Date.now(),
      type: 'income',
      amount: chargeAmount,
      category: 'Wallet / Play Pass',
      paymentMode,
      description: `${packageTitle} - ${customer.name} (+91 ${customer.phone || 'N/A'})`,
      date: new Date().toISOString()
    };

    onTopupWallet(customer.id, {
      addedAmount,
      addedHours,
      transaction,
      packageTitle,
      chargeAmount
    });

    // Optional WhatsApp receipt
    const cleanPhone = (customer.phone || '').replace(/\D/g, '').slice(-10);
    if (cleanPhone) {
      const msg = [
        `🐼 *PANDA SPORTS ACADEMY — PLAY PASS RECEIPT*`,
        `━━━━━━━━━━━━━━━━━━━━━━`,
        `👤 *Player Name:* ${customer.name}`,
        `🎟️ *Package:* ${packageTitle}`,
        `💰 *Amount Paid:* ₹${chargeAmount} (${paymentMode.toUpperCase()})`,
        addedHours > 0 ? `⏱️ *Pass Balance Added:* +${addedHours} Hours` : `💳 *Wallet Cash Added:* +₹${addedAmount}`,
        `━━━━━━━━━━━━━━━━━━━━━━`,
        `🎾 *Thank you for being a Panda Sports VIP Member!*`
      ].join('\n');

      window.open(`https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-gradient-to-r from-zinc-900 to-zinc-950 text-white">
          <div className="flex items-center gap-2">
            <Ticket className="text-[#d33638]" size={20} />
            <div>
              <h3 className="font-extrabold text-sm text-white">Prepaid Wallet & Play Passes</h3>
              <p className="text-[10px] text-zinc-400">Add prepaid credits for {customer.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Customer Status */}
          <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-500 block">Current Balance</span>
              <p className="text-xs font-black text-zinc-900">
                ₹{customer.walletBalance || 0} Cash • {(customer.passHours || 0).toFixed(1)} Play Hrs
              </p>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
              Active Player
            </span>
          </div>

          {/* Package Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
              Select Package or Custom Cash
            </label>

            {/* 10-Hour Pass Card */}
            <div
              onClick={() => setTopupMode('pass10')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                topupMode === 'pass10'
                  ? 'border-[#d33638] bg-red-50/50 shadow-sm'
                  : 'border-zinc-200 hover:border-zinc-300 bg-white'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#d33638] text-white flex items-center justify-center font-black text-xs">
                    10h
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900">Panda 10-Hour Court Pass</h4>
                    <p className="text-[10px] text-zinc-500">10 hours court credits at ₹500/hr</p>
                  </div>
                </div>
                <span className="text-xs font-black text-zinc-900">₹5,000</span>
              </div>
            </div>

            {/* 20-Hour Pass Card */}
            <div
              onClick={() => setTopupMode('pass20')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                topupMode === 'pass20'
                  ? 'border-[#d33638] bg-red-50/50 shadow-sm'
                  : 'border-zinc-200 hover:border-zinc-300 bg-white'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-black text-xs">
                    20h
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900">Panda 20-Hour Pro Pass</h4>
                    <p className="text-[10px] text-zinc-500">20 hours court credits at ₹450/hr</p>
                  </div>
                </div>
                <span className="text-xs font-black text-zinc-900">₹9,000</span>
              </div>
            </div>

            {/* Custom Cash Wallet Top-up */}
            <div
              onClick={() => setTopupMode('custom_cash')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                topupMode === 'custom_cash'
                  ? 'border-[#d33638] bg-red-50/50 shadow-sm'
                  : 'border-zinc-200 hover:border-zinc-300 bg-white'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                    ₹
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900">Custom Cash Top-Up</h4>
                    <p className="text-[10px] text-zinc-500">Add prepaid wallet cash</p>
                  </div>
                </div>
              </div>

              {topupMode === 'custom_cash' && (
                <div className="mt-2 pt-2 border-t border-zinc-200 flex items-center gap-2">
                  <span className="text-xs font-black text-zinc-500">₹</span>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={customAmount}
                    onChange={e => setCustomAmount(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none focus:border-[#d33638]"
                    placeholder="Enter amount (e.g. 2000)"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Payment Method Received
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('upi')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  paymentMode === 'upi'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                <Smartphone size={14} /> UPI / GPay
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('cash')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  paymentMode === 'cash'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                <Banknote size={14} /> Counter Cash
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 font-bold text-xs hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#d33638] hover:bg-red-700 text-white font-black text-xs shadow-md shadow-red-900/20"
            >
              Confirm Top-Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
