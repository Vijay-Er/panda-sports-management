import React, { useState } from 'react';
import { X, User, Phone, FileText, CheckCircle2 } from 'lucide-react';

export default function CustomerModal({
  isOpen,
  onClose,
  onSaveCustomer,
  initialCustomer = null
}) {
  const [name, setName] = useState(initialCustomer?.name || '');
  const [phone, setPhone] = useState(initialCustomer?.phone || '');
  const [notes, setNotes] = useState(initialCustomer?.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert("Please provide the customer name and 10-digit mobile number.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(0, 10);
    if (cleanPhone.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    const customerData = {
      id: initialCustomer?.id || ('cust-' + cleanPhone),
      name: name.trim(),
      phone: cleanPhone,
      notes: notes.trim(),
      createdAt: initialCustomer?.createdAt || new Date().toISOString()
    };

    onSaveCustomer(customerData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
          <div>
            <h3 className="font-extrabold text-base text-zinc-900 flex items-center gap-2">
              <User size={18} className="text-[#d33638]" />
              <span>{initialCustomer ? 'Edit Customer Profile' : 'Add New Customer'}</span>
            </h3>
            <p className="text-[11px] text-zinc-500 font-medium">
              Save player details across court bookings & academy batches
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-800 p-1">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Customer / Player Name
            </label>
            <input
              required
              autoFocus
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
              WhatsApp Mobile Number
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-bold text-zinc-400">+91</span>
              <input
                required
                type="tel"
                maxLength={10}
                placeholder="98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-11 pr-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638] tracking-wider"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Notes / Player Preferences (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Regular weekend player, prefers Court 1, Kids Karate batch student"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-medium text-zinc-900 outline-none focus:border-[#d33638]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#d33638] hover:bg-[#b42628] text-white py-3 rounded-xl font-bold text-xs transition-all shadow-md shadow-red-900/20 active:scale-[0.99] flex items-center justify-center gap-1.5 uppercase tracking-wider"
          >
            <CheckCircle2 size={16} />
            <span>{initialCustomer ? 'Update Customer' : 'Save Customer to Directory'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
