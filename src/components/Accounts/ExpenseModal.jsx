import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function ExpenseModal({ isOpen, onClose, onAddExpense }) {
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    description: '',
    paymentMode: 'cash'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!expenseForm.amount || !expenseForm.description) return;

    onAddExpense({
      id: Date.now(),
      type: 'expense',
      amount: parseFloat(expenseForm.amount),
      category: 'Expense',
      paymentMode: expenseForm.paymentMode,
      description: expenseForm.description.trim(),
      date: new Date().toISOString()
    });

    setExpenseForm({ amount: '', description: '', paymentMode: 'cash' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex justify-between items-center">
          <h3 className="font-extrabold text-base text-red-900">Record Facility Expense</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-800 p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Expense Description
            </label>
            <input
              required
              autoFocus
              type="text"
              value={expenseForm.description}
              onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
              className="w-full border border-zinc-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-500 outline-none text-xs font-semibold"
              placeholder="e.g. Floodlights repair, Ball replenishment, Electricity bill"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Paid Out Via
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['cash', 'upi', 'turftown'].map(mode => (
                <label
                  key={mode}
                  className={`cursor-pointer text-center border rounded-xl py-2 text-xs font-extrabold uppercase tracking-wider transition-all ${
                    expenseForm.paymentMode === mode
                      ? 'bg-red-600 border-red-600 text-white shadow-sm'
                      : 'bg-white border-zinc-300 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="expMode"
                    value={mode}
                    className="hidden"
                    checked={expenseForm.paymentMode === mode}
                    onChange={() => setExpenseForm({ ...expenseForm, paymentMode: mode })}
                  />
                  {mode}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Amount Paid Out (₹)
            </label>
            <input
              required
              type="number"
              min="1"
              value={expenseForm.amount}
              onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              className="w-full border border-zinc-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-500 outline-none font-black text-xl text-red-600"
              placeholder="0"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold text-xs hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
          >
            Deduct & Log Expense
          </button>
        </form>
      </div>
    </div>
  );
}
