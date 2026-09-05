import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function SettleModal({ isOpen, onClose, onSettle, accounts }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <AlertTriangle size={32} />
          </div>

          <h3 className="font-extrabold text-lg text-zinc-900">Settle & Clear Register?</h3>
          <p className="text-zinc-500 text-xs leading-relaxed">
            This will record withdrawal settlements for your current register balances and reset Cash, UPI, and Turftown balances to ₹0.
          </p>

          <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200 text-left space-y-1 text-xs">
            <div className="flex justify-between font-semibold text-zinc-700">
              <span>Cash to Safe/Bank:</span>
              <span className="font-bold text-zinc-900">₹{accounts.cash.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-zinc-700">
              <span>UPI Balance Cleared:</span>
              <span className="font-bold text-zinc-900">₹{accounts.upi.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-zinc-700">
              <span>Turftown Balance Cleared:</span>
              <span className="font-bold text-zinc-900">₹{accounts.turftown.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-xs bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSettle}
              className="flex-1 py-3 rounded-xl font-bold text-xs bg-zinc-900 text-white hover:bg-black transition-colors shadow-md"
            >
              Yes, Settle All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
