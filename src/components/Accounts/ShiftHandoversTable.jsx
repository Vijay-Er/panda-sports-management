import React from 'react';
import { 
  Sun, Moon, ArrowRight, CheckCircle2, AlertTriangle, 
  Banknote, MessageSquare, Printer, Clock 
} from 'lucide-react';

export default function ShiftHandoversTable({ handovers = [] }) {
  const handleShareWhatsAppSlip = (h) => {
    const shiftLabel = h.shiftType === 'day' ? '☀️ DAY SHIFT (6 AM - 2 PM)' : '🌙 EVENING SHIFT (2 PM - 10 PM)';
    const dateFormatted = new Date(h.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    const diffText = h.difference === 0 
      ? '✅ Balanced (₹0 diff)' 
      : h.difference < 0 
      ? `⚠️ Shortage: -₹${Math.abs(h.difference)}` 
      : `ℹ️ Excess: +₹${h.difference}`;

    const message = [
      `🐼 *PANDA SPORTS ACADEMY — SHIFT HANDOVER REPORT*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `⏱️ *Shift:* ${shiftLabel}`,
      `📅 *Date & Time:* ${dateFormatted}`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `👤 *Outgoing Staff:* ${h.outgoingStaff}`,
      `👤 *Incoming Staff:* ${h.incomingStaff}`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `💰 *Expected System Cash:* ₹${h.expectedCash.toLocaleString()}`,
      `💵 *Physical Cash Counted:* ₹${h.physicalCash.toLocaleString()}`,
      `⚖️ *Reconciliation Status:* ${diffText}`,
      `🪙 *Retained Float for Next Shift:* ₹${h.openingFloat.toLocaleString()}`,
      ...(h.notes ? [`📝 *Handover Notes:* ${h.notes}`] : []),
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `📍 *Register Closed at Front Desk, Panda Sports Academy*`
    ].join('\n');

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  if (handovers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center">
        <Clock size={36} className="mx-auto text-zinc-300 mb-2" />
        <h4 className="font-extrabold text-sm text-zinc-800">No Shift Handovers Recorded Yet</h4>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
          Click "Handover Shift" to perform a cash till audit and hand over responsibility between morning and evening staff.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-100/70 border-b border-zinc-200 text-xs font-bold text-zinc-600">
              <th className="p-3.5">Date & Time</th>
              <th className="p-3.5">Shift</th>
              <th className="p-3.5">Handed Over By</th>
              <th className="p-3.5">Taken Over By</th>
              <th className="p-3.5 text-right">Expected Cash</th>
              <th className="p-3.5 text-right">Counted Cash</th>
              <th className="p-3.5 text-center">Audit Status</th>
              <th className="p-3.5 text-right">Opening Float</th>
              <th className="p-3.5">Notes</th>
              <th className="p-3.5 text-center">Slip</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-xs">
            {handovers.map((h, idx) => {
              const dateFormatted = new Date(h.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
              const isBalanced = h.difference === 0;
              const isShort = h.difference < 0;

              return (
                <tr key={h.id || idx} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="p-3.5 text-zinc-500 whitespace-nowrap font-medium">
                    {dateFormatted}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    {h.shiftType === 'day' ? (
                      <span className="inline-flex items-center gap-1 font-extrabold text-[10px] uppercase bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                        <Sun size={11} className="text-amber-500" />
                        <span>Day Shift</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-extrabold text-[10px] uppercase bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-md border border-indigo-200">
                        <Moon size={11} className="text-indigo-500" />
                        <span>Evening Shift</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 font-bold text-zinc-900 whitespace-nowrap">
                    {h.outgoingStaff}
                  </td>
                  <td className="p-3.5 font-bold text-zinc-900 whitespace-nowrap">
                    <span className="flex items-center gap-1 text-zinc-700">
                      <ArrowRight size={12} className="text-zinc-400" />
                      <span>{h.incomingStaff}</span>
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-medium text-zinc-500 whitespace-nowrap">
                    ₹{h.expectedCash.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-black text-zinc-900 whitespace-nowrap">
                    ₹{h.physicalCash.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-center whitespace-nowrap">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      isBalanced 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : isShort 
                        ? 'bg-red-50 text-red-800 border-red-200' 
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}>
                      {isBalanced && 'Balanced'}
                      {isShort && `-₹${Math.abs(h.difference)} Short`}
                      {!isBalanced && !isShort && `+₹${h.difference} Excess`}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-semibold text-zinc-600 whitespace-nowrap">
                    ₹{h.openingFloat.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-zinc-500 max-w-xs truncate italic">
                    {h.notes || '—'}
                  </td>
                  <td className="p-3.5 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleShareWhatsAppSlip(h)}
                      className="p-1.5 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                      title="Share WhatsApp shift handover slip"
                    >
                      <MessageSquare size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
