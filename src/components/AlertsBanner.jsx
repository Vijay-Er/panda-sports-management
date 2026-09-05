import React from 'react';
import { BellRing, X, Volume2 } from 'lucide-react';

export default function AlertsBanner({ alerts, setAlerts, onPlaySound }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-[110] space-y-3 w-88 max-w-[calc(100vw-2rem)] pointer-events-none">
      <div className="pointer-events-auto bg-red-600 text-white p-3.5 rounded-2xl shadow-xl flex justify-between items-center animate-in slide-in-from-right fade-in duration-300">
        <span className="text-xs font-black flex items-center gap-2">
          <BellRing size={17} className="animate-pulse" />
          <span>Court Ending Alerts ({alerts.length})</span>
        </span>
        <div className="flex items-center gap-1.5">
          {onPlaySound && (
            <button
              onClick={onPlaySound}
              className="bg-red-700 hover:bg-red-800 text-white p-1.5 rounded-lg text-xs font-bold transition-colors"
              title="Play alarm chime"
            >
              <Volume2 size={15} />
            </button>
          )}
          <button
            onClick={() => setAlerts([])}
            className="bg-white text-red-600 px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-red-50 active:scale-95 transition-all shadow-sm"
          >
            Snooze All
          </button>
        </div>
      </div>

      {alerts.map((alert, idx) => (
        <div
          key={idx}
          className="pointer-events-auto bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-2xl shadow-lg flex justify-between items-center animate-in slide-in-from-right fade-in duration-300"
        >
          <div className="flex items-center space-x-2.5 text-amber-950">
            <BellRing className="animate-bounce shrink-0 text-amber-600" size={18} />
            <span className="font-bold text-xs leading-snug">{alert}</span>
          </div>
          <button
            onClick={() => setAlerts(alerts.filter((_, i) => i !== idx))}
            className="text-amber-500 hover:text-amber-800 p-1 ml-2 transition-colors"
            title="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
