import React, { useState } from 'react';
import { X, UserPlus, Shield, Smartphone, Lock, User, AlertCircle } from 'lucide-react';
import { createNewAdmin } from '../../utils/authStorage';

export default function AddAdminModal({ isOpen, onClose, onAdminCreated }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanMobile = mobile.trim().replace(/\D/g, '');
    const cleanPin = pin.trim().replace(/\D/g, '');

    if (!name.trim()) {
      setError('Please provide the administrator\'s full name.');
      return;
    }

    if (cleanMobile.length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    if (cleanPin.length !== 4) {
      setError('Security PIN must be exactly 4 digits.');
      return;
    }

    const res = createNewAdmin({
      name: name.trim(),
      mobile: cleanMobile,
      pin: cleanPin,
      role
    });

    if (res.success) {
      onAdminCreated(res.user, res.updatedUsers);
      setName('');
      setMobile('');
      setPin('');
      setRole('admin');
      onClose();
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 shrink-0">
          <h3 className="font-extrabold text-base text-zinc-900 flex items-center gap-2">
            <UserPlus className="text-zinc-800" size={19} />
            <span>Create New Administrator</span>
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-800 p-1">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Full Name
            </label>
            <div className="relative flex items-center">
              <User size={16} className="absolute left-3.5 text-zinc-400" />
              <input
                required
                autoFocus
                type="text"
                placeholder="e.g. Coach Ramesh / Anand"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-semibold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-black outline-none"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
              10-Digit Mobile Number (Login ID)
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center gap-1 text-zinc-400 font-bold text-xs pointer-events-none border-r border-zinc-200 pr-2">
                <Smartphone size={14} />
                <span>+91</span>
              </div>
              <input
                required
                type="tel"
                maxLength={10}
                placeholder="98421 00000"
                value={mobile}
                onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-20 pr-3.5 py-2.5 text-xs font-bold text-zinc-900 tracking-wider focus:bg-white focus:ring-2 focus:ring-black outline-none"
              />
            </div>
          </div>

          {/* 4-digit PIN */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
              4-Digit Security PIN
            </label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-zinc-400" />
              <input
                required
                type="text"
                maxLength={4}
                placeholder="4-digit PIN (e.g. 5678)"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-bold text-zinc-900 tracking-widest focus:bg-white focus:ring-2 focus:ring-black outline-none"
              />
            </div>
            <p className="text-[10px] text-zinc-400 mt-1 font-medium">This PIN will be used along with mobile number for logging in.</p>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Assigned Role & Access Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`cursor-pointer p-3 border rounded-2xl transition-all ${
                  role === 'admin'
                    ? 'border-black bg-zinc-900 text-white shadow-sm'
                    : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800'
                }`}
              >
                <input
                  type="radio"
                  name="adminRole"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                  className="hidden"
                />
                <div className="font-extrabold text-xs">👤 Staff Admin</div>
                <div className={`text-[10px] mt-0.5 leading-snug ${role === 'admin' ? 'text-zinc-300' : 'text-zinc-400'}`}>
                  Manage bookings, POS, and accounts
                </div>
              </label>

              <label
                className={`cursor-pointer p-3 border rounded-2xl transition-all ${
                  role === 'super_admin'
                    ? 'border-purple-600 bg-purple-900 text-white shadow-sm'
                    : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800'
                }`}
              >
                <input
                  type="radio"
                  name="adminRole"
                  value="super_admin"
                  checked={role === 'super_admin'}
                  onChange={() => setRole('super_admin')}
                  className="hidden"
                />
                <div className="font-extrabold text-xs flex items-center gap-1">
                  <span>👑 Super Admin</span>
                </div>
                <div className={`text-[10px] mt-0.5 leading-snug ${role === 'super_admin' ? 'text-purple-200' : 'text-zinc-400'}`}>
                  Full access + Manage & create admins
                </div>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-zinc-900 text-white py-3.5 rounded-2xl font-bold text-xs hover:bg-black transition-colors shadow-lg shadow-black/10"
            >
              Create Administrator Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
