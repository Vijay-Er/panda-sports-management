import React, { useState, useMemo } from 'react';
import { X, Plus, Minus, Coffee, UtensilsCrossed, Banknote, Smartphone, Check, AlertCircle } from 'lucide-react';

export default function AddDrinksToBookingModal({
  isOpen,
  onClose,
  booking,
  beverages = [],
  onAddDrinks,
  activeShift = null
}) {
  const [selectedItems, setSelectedItems] = useState({}); // { [beverageId]: qty }
  const [paymentOption, setPaymentOption] = useState('add_to_bill'); // 'add_to_bill' | 'pay_now'
  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash' | 'upi'
  const [activeCategory, setActiveCategory] = useState('all');

  // Reset when opened
  React.useEffect(() => {
    if (isOpen) {
      setSelectedItems({});
      setPaymentOption('add_to_bill');
      setPaymentMode('cash');
    }
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const handleUpdateQty = (itemId, delta, maxStock) => {
    setSelectedItems(prev => {
      const current = prev[itemId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      if (typeof maxStock === 'number' && next > maxStock) {
        return prev;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const filteredBeverages = beverages.filter(item => {
    if (activeCategory === 'all') return true;
    return (item.category || 'Beverage').toLowerCase() === activeCategory.toLowerCase();
  });

  const orderItems = Object.entries(selectedItems)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const item = beverages.find(b => b.id.toString() === id.toString());
      if (!item) return null;
      return {
        id: item.id,
        name: item.name,
        price: Number(item.price) || 0,
        quantity: qty,
        subtotal: (Number(item.price) || 0) * qty,
        icon: item.icon || '🥤'
      };
    })
    .filter(Boolean);

  const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      alert("Please select at least one drink or snack.");
      return;
    }

    onAddDrinks(booking.id, orderItems, paymentOption, paymentMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-900 text-white flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                Add Refreshments
              </span>
              <span className="text-zinc-400 text-xs font-bold">
                {booking.resourceName}
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-0.5">
              {booking.customerName}
            </h3>
            <p className="text-[11px] text-zinc-400">
              Slot: {booking.startTime} - {booking.endTime} ({booking.date})
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Existing Drinks Already on this Booking */}
        {booking.drinks && booking.drinks.length > 0 && (
          <div className="bg-amber-50/70 border-b border-amber-200/80 px-6 py-2.5 text-xs flex items-center justify-between">
            <span className="text-amber-900 font-bold">
              Current Drinks on Tab:
            </span>
            <div className="flex flex-wrap gap-1">
              {booking.drinks.map((d, idx) => (
                <span key={idx} className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded-md border border-amber-300">
                  {d.icon || '🥤'} {d.quantity}x {d.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className="px-6 pt-3 flex gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'all' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            All Items
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('Beverage')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeCategory === 'Beverage' ? 'bg-blue-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            <Coffee size={12} />
            <span>Drinks</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('Snack')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeCategory === 'Snack' ? 'bg-amber-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            <UtensilsCrossed size={12} />
            <span>Snacks</span>
          </button>
        </div>

        {/* Product Selection List */}
        <div className="p-6 space-y-2.5 overflow-y-auto flex-1">
          {filteredBeverages.map(item => {
            const stock = typeof item.stock === 'number' ? item.stock : 20;
            const isOutOfStock = stock <= 0;
            const qty = selectedItems[item.id] || 0;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  qty > 0
                    ? 'bg-red-50/50 border-[#d33638]/40 shadow-sm'
                    : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl select-none shrink-0">
                    {item.icon || (item.category === 'Snack' ? '🍫' : '🥤')}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-xs text-zinc-900 truncate">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-black text-emerald-700 text-xs">
                        ₹{item.price}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        stock <= 3 ? 'text-red-700 bg-red-100' : 'text-zinc-500 bg-zinc-200/60'
                      }`}>
                        {stock <= 0 ? 'Out of stock' : `${stock} left`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Counter Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={qty === 0}
                    onClick={() => handleUpdateQty(item.id, -1, stock)}
                    className="w-7 h-7 rounded-lg bg-white border border-zinc-300 hover:bg-zinc-100 disabled:opacity-40 flex items-center justify-center font-bold text-zinc-700 active:scale-95 transition-all"
                  >
                    <Minus size={13} />
                  </button>

                  <span className="w-6 text-center font-black text-sm text-zinc-900">
                    {qty}
                  </span>

                  <button
                    type="button"
                    disabled={isOutOfStock || qty >= stock}
                    onClick={() => handleUpdateQty(item.id, 1, stock)}
                    className="w-7 h-7 rounded-lg bg-zinc-900 text-white hover:bg-black disabled:opacity-40 flex items-center justify-center font-bold active:scale-95 transition-all"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Billing & Settlement Options */}
        <div className="p-6 bg-zinc-50 border-t border-zinc-200 space-y-3 shrink-0">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-500">
              Refreshments Total:
            </span>
            <span className="text-xl font-black text-emerald-700">
              ₹{totalAmount}
            </span>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-600 block">
              How will this be billed?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentOption('add_to_bill')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  paymentOption === 'add_to_bill'
                    ? 'bg-amber-50 border-amber-300 text-amber-950 font-black shadow-sm ring-1 ring-amber-400'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <div className="text-xs font-black">🧾 Add to Booking Bill</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Pay combined at desk checkout</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentOption('pay_now')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  paymentOption === 'pay_now'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-black shadow-sm ring-1 ring-emerald-400'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <div className="text-xs font-black">⚡ Pay Right Now</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Collect Cash / UPI immediately</div>
              </button>
            </div>
          </div>

          {/* If Pay Now selected, show Cash or UPI */}
          {paymentOption === 'pay_now' && (
            <div className="flex items-center gap-2 pt-1 animate-in fade-in">
              <span className="text-[11px] font-bold text-zinc-500">Mode:</span>
              <button
                type="button"
                onClick={() => setPaymentMode('cash')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  paymentMode === 'cash'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-zinc-200 text-zinc-700'
                }`}
              >
                <Banknote size={13} />
                <span>Cash</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('upi')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  paymentMode === 'upi'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-zinc-200 text-zinc-700'
                }`}
              >
                <Smartphone size={13} />
                <span>UPI</span>
              </button>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="button"
            disabled={orderItems.length === 0}
            onClick={handleSubmit}
            className="w-full py-3 bg-[#d33638] hover:bg-[#b0292b] disabled:bg-zinc-300 disabled:text-zinc-500 text-white rounded-2xl font-black text-sm shadow-md shadow-red-900/20 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Check size={16} />
            <span>
              {orderItems.length === 0
                ? 'Select Items Above'
                : paymentOption === 'add_to_bill'
                ? `Add ₹${totalAmount} to Booking Tab`
                : `Collect ₹${totalAmount} Now (${paymentMode.toUpperCase()})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
