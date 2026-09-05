import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className="fixed top-6 right-6 z-[120] animate-in slide-in-from-top-5 fade-in duration-300">
      <div className="bg-zinc-950 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-semibold border border-zinc-800">
        <CheckCircle className="text-emerald-400 shrink-0" size={22} />
        <span className="text-sm">{toast}</span>
      </div>
    </div>
  );
}
