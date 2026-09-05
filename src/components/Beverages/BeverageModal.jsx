import React, { useState } from 'react';
import { X, Tag, Sparkles } from 'lucide-react';
import { EMOJI_PICKER_OPTIONS } from '../../constants/resources';

export default function BeverageModal({ isOpen, onClose, onAddBeverage }) {
  const [formData, setFormData] = useState({ 
    name: '', 
    price: '', 
    category: 'Beverage', 
    icon: '🥤' 
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) return;

    onAddBeverage({
      id: Date.now(),
      name: formData.name.trim(),
      category: formData.category,
      price: parseFloat(formData.price),
      icon: formData.icon || (formData.category === 'Snack' ? '🍫' : '🥤')
    });

    setFormData({ name: '', price: '', category: 'Beverage', icon: '🥤' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 shrink-0">
          <div>
            <h3 className="font-extrabold text-base text-zinc-900">Create New POS Product</h3>
            <p className="text-[11px] text-zinc-500 font-medium">Add drinks, snacks, or energy refreshments</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-800 p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Category Toggle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Product Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, category: 'Beverage', icon: '🥤' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  formData.category === 'Beverage'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                🥤 Beverage / Drink
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, category: 'Snack', icon: '🍫' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  formData.category === 'Snack'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                🍫 Snack / Food
              </button>
            </div>
          </div>

          {/* Icon & Name */}
          <div className="flex gap-3">
            <div className="w-1/3">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Emoji Icon
              </label>
              <input
                required
                type="text"
                maxLength={2}
                value={formData.icon}
                onChange={e => setFormData({ ...formData, icon: e.target.value })}
                className="w-full border border-zinc-300 rounded-xl px-2 py-2.5 focus:ring-2 focus:ring-black outline-none text-center text-2xl"
              />
            </div>
            <div className="w-2/3">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Item Name
              </label>
              <input
                required
                autoFocus
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-black outline-none text-xs font-semibold"
                placeholder={formData.category === 'Snack' ? 'e.g. Protein Bar / Peanuts' : 'e.g. Tender Coconut / Gatorade'}
              />
            </div>
          </div>

          {/* Preset Icon Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500" />
              <span>Tap to Pick Icon:</span>
            </label>
            <div className="flex flex-wrap gap-1.5 justify-start bg-zinc-50 p-2.5 border border-zinc-200 rounded-xl max-h-32 overflow-y-auto">
              {EMOJI_PICKER_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: emoji })}
                  className={`text-lg w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                    formData.icon === emoji
                      ? 'bg-black shadow text-white scale-110'
                      : 'bg-white border border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Selling Price (₹)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-bold text-zinc-400">₹</span>
              <input
                required
                type="number"
                min="0"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full border border-zinc-300 rounded-xl pl-8 pr-3 py-2.5 focus:ring-2 focus:ring-black outline-none font-bold text-sm"
                placeholder="40"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-zinc-900 text-white py-3.5 rounded-xl font-bold text-xs hover:bg-black transition-colors shadow-md shadow-black/10"
          >
            Save & Add to Store Catalog
          </button>
        </form>
      </div>
    </div>
  );
}
