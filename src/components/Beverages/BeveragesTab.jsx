import React, { useState } from 'react';
import { Plus, Trash2, Banknote, Smartphone, UtensilsCrossed, Coffee, Tag, AlertCircle } from 'lucide-react';

export default function BeveragesTab({
  beverages,
  quickSellMode,
  setQuickSellMode,
  onSellBeverage,
  onOpenAddModal,
  onDeleteBeverage,
  onRestockBeverage
}) {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredItems = beverages.filter(item => {
    if (activeCategory === 'all') return true;
    return (item.category || 'Beverage').toLowerCase() === activeCategory.toLowerCase();
  });

  const handleDeleteClick = (e, item) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove "${item.name}" from your POS inventory?`)) {
      onDeleteBeverage(item.id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Beverages & Snacks POS</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Tap to sell refreshments with instant Cash or UPI register logging
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="bg-[#d33638] hover:bg-[#b42628] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 shadow-md shadow-red-900/20 active:scale-95"
        >
          <Plus size={16} />
          <span>Create New Product</span>
        </button>
      </div>

      {/* Control Bar: Category Tabs & Quick Sell Mode */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-sm">
        {/* Category Filter Tabs */}
        <div className="flex gap-1.5 p-1 bg-zinc-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'all'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            All Items ({beverages.length})
          </button>
          <button
            onClick={() => setActiveCategory('Beverage')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCategory === 'Beverage'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Coffee size={13} />
            <span>Drinks</span>
          </button>
          <button
            onClick={() => setActiveCategory('Snack')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCategory === 'Snack'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <UtensilsCrossed size={13} />
            <span>Snacks</span>
          </button>
        </div>

        {/* Quick Sell Payment Mode */}
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-xs uppercase tracking-wider text-zinc-500">Quick Sell Mode:</span>
          <div className="flex bg-zinc-100 p-1 rounded-xl">
            <button
              onClick={() => setQuickSellMode('cash')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                quickSellMode === 'cash'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Banknote size={14} />
              <span>Cash</span>
            </button>
            <button
              onClick={() => setQuickSellMode('upi')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                quickSellMode === 'upi'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Smartphone size={14} />
              <span>UPI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Interactive "Add Product" Tile */}
        <button
          onClick={onOpenAddModal}
          className="border-2 border-dashed border-zinc-300 hover:border-zinc-900 bg-zinc-50/60 hover:bg-white rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-2.5 transition-all group min-h-[220px]"
        >
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-500 group-hover:bg-zinc-900 group-hover:text-white flex items-center justify-center transition-colors">
            <Plus size={24} />
          </div>
          <div>
            <p className="font-extrabold text-xs text-zinc-900">Create New Item</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">Add drink or snack to catalog</p>
          </div>
        </button>

        {/* Existing Products */}
        {filteredItems.map(item => {
          const isSnack = (item.category || '').toLowerCase() === 'snack';

          return (
            <div
              key={item.id}
              className="relative group bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 hover:border-zinc-900 hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]"
            >
              {/* Card Header: Category Tag & Visible Delete Button */}
              <div className="flex justify-between items-center w-full mb-1">
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                  isSnack 
                    ? 'bg-amber-50 text-amber-800 border-amber-200' 
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}>
                  {isSnack ? 'Snack' : 'Drink'}
                </span>

                {/* Explicit, visible Delete button */}
                <button
                  type="button"
                  onClick={(e) => handleDeleteClick(e, item)}
                  className="text-zinc-300 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                  title={`Delete ${item.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Item Info */}
              <div className="my-auto text-center py-2">
                <span className="text-4xl mb-2 block filter drop-shadow-sm select-none">
                  {item.icon || (isSnack ? '🍫' : '🥤')}
                </span>
                <h3 className="font-extrabold text-zinc-900 text-xs sm:text-sm leading-tight line-clamp-1">
                  {item.name}
                </h3>
                <p className="text-emerald-700 font-black text-sm mt-1">
                  ₹{item.price}
                </p>

                {/* Stock Indicator & Quick Restock */}
                {(() => {
                  const itemStock = typeof item.stock === 'number' ? item.stock : 20;
                  return (
                    <div className="flex items-center justify-center gap-1 mt-1.5">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                        itemStock <= 0
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : itemStock <= 5
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                      }`}>
                        {itemStock <= 0 ? 'Out of Stock' : itemStock <= 5 ? `Low: ${itemStock} left` : `Stock: ${itemStock}`}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const added = prompt(`Add stock count for "${item.name}":`, "12");
                          const parsed = parseInt(added, 10);
                          if (parsed && parsed > 0 && onRestockBeverage) {
                            onRestockBeverage(item.id, parsed);
                          }
                        }}
                        className="text-[10px] font-bold text-zinc-600 hover:text-black bg-zinc-100 hover:bg-zinc-200 px-1.5 py-0.5 rounded transition-colors"
                        title="Add incoming stock"
                      >
                        + Restock
                      </button>
                    </div>
                  );
                })()}
              </div>

              {/* Quick Sell Action Button */}
              {(() => {
                const itemStock = typeof item.stock === 'number' ? item.stock : 20;
                const isOutOfStock = itemStock <= 0;

                return (
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => onSellBeverage(item)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm mt-2 flex items-center justify-center gap-1.5 ${
                      isOutOfStock
                        ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                        : quickSellMode === 'cash' 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <span>{isOutOfStock ? 'Out of Stock' : `Sell 1x (${quickSellMode.toUpperCase()})`}</span>
                  </button>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
