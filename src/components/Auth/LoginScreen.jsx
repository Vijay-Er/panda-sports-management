import React, { useState } from 'react';
import { Smartphone, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { authenticateUser } from '../../utils/authStorage';

export default function LoginScreen({ onLoginSuccess }) {
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanMobile = mobile.trim().replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (pin.trim().length !== 4) {
      setError('Please enter your 4-digit security PIN.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const result = authenticateUser(cleanMobile, pin.trim());
      setLoading(false);
      if (result.success) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error);
      }
    }, 200);
  };

  const handleQuickFill = (quickMobile, quickPin) => {
    setMobile(quickMobile);
    setPin(quickPin);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 via-zinc-50 to-panda-50/40 flex flex-col justify-center items-center p-4 selection:bg-panda-600 selection:text-white">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-zinc-200/80 p-8 sm:p-10 space-y-7 animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
        
        {/* Top subtle brand accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-panda-700 via-panda-600 to-panda-500"></div>

        {/* Brand Header with Official Logo */}
        <div className="text-center space-y-3 pt-1">
          <div className="w-full flex justify-center items-center">
            <img 
              src="/panda-logo.png" 
              alt="Panda Sports Academy" 
              className="h-16 sm:h-20 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-panda-50 border border-panda-100">
            <span className="w-1.5 h-1.5 rounded-full bg-panda-600 animate-pulse"></span>
            <span className="text-[10px] text-panda-800 font-extrabold tracking-widest uppercase font-sports">
              Staff & Administrator Portal
            </span>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-panda-50 border border-panda-200 text-panda-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-2">
            <AlertCircle size={16} className="shrink-0 text-panda-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mobile Number Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Mobile Number
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center gap-1.5 text-zinc-400 font-bold text-xs pointer-events-none border-r border-zinc-200 pr-2">
                <Smartphone size={15} />
                <span>+91</span>
              </div>
              <input
                required
                autoFocus
                type="tel"
                maxLength={10}
                placeholder="98765 43210"
                value={mobile}
                onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl pl-20 pr-4 py-3 text-sm font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-[#d33638] focus:border-[#d33638] outline-none tracking-wider transition-all"
              />
            </div>
          </div>

          {/* 4-digit PIN Field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
                4-Digit Security PIN
              </label>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
                <Lock size={16} />
              </div>
              <input
                required
                type={showPin ? 'text' : 'password'}
                maxLength={4}
                placeholder="••••"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl pl-10 pr-12 py-3 text-base font-black text-zinc-900 focus:bg-white focus:ring-2 focus:ring-[#d33638] focus:border-[#d33638] outline-none tracking-widest transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 text-zinc-400 hover:text-zinc-700 p-1 transition-colors"
                tabIndex={-1}
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Login Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d33638] hover:bg-[#b42628] text-white font-black py-3.5 rounded-2xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-900/25 active:scale-[0.99] disabled:opacity-60 uppercase tracking-wider font-sports"
          >
            {loading ? (
              <span>Verifying Session...</span>
            ) : (
              <>
                <span>Sign In to Academy Dashboard</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="pt-2 border-t border-zinc-100">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
            <Sparkles size={13} className="text-panda-600" />
            <span>Instant Demo Accounts</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('9876543210', '1234')}
              className="p-2.5 text-left border border-zinc-200 hover:border-panda-500 hover:bg-panda-50/50 rounded-xl bg-zinc-50 transition-all group"
            >
              <div className="flex items-center gap-1 font-bold text-xs text-zinc-800 group-hover:text-panda-800">
                <span>👑 Super Admin</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">9876543210 (PIN: 1234)</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('9123456780', '1234')}
              className="p-2.5 text-left border border-zinc-200 hover:border-panda-500 hover:bg-panda-50/50 rounded-xl bg-zinc-50 transition-all group"
            >
              <div className="flex items-center gap-1 font-bold text-xs text-zinc-800 group-hover:text-panda-800">
                <span>👤 Staff Admin</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">9123456780 (PIN: 1234)</p>
            </button>
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <p className="text-xs text-zinc-400 text-center mt-6 font-medium">
        Panda Sports Academy Operations & Accounts Management • Local Secured Session
      </p>
    </div>
  );
}
