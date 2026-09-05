import React, { useState } from 'react';
import { X, CheckCircle2, Calendar, Clock, DollarSign, Users, Award, Plus, Sparkles } from 'lucide-react';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EMOJI_OPTIONS = ['🥋', '🧘', '🏸', '🏓', '🥊', '⚽', '🏊', '🎾', '🏃', '🏆'];

export default function BatchModal({ 
  isOpen, 
  onClose, 
  onSaveBatch, 
  initialBatch = null,
  categories = [{ id: 'karate', name: 'Karate', icon: '🥋' }],
  onAddCategory
}) {
  const defaultCategory = initialBatch?.category || (categories[0]?.id || 'karate');

  const [formData, setFormData] = useState({
    name: initialBatch?.name || '',
    category: defaultCategory,
    instructor: initialBatch?.instructor || '',
    days: initialBatch?.days || ['Mon', 'Wed', 'Fri'],
    startTime: initialBatch?.startTime || '17:00',
    endTime: initialBatch?.endTime || '18:00',
    monthlyFee: initialBatch?.monthlyFee ? initialBatch.monthlyFee.toString() : '2000',
    capacity: initialBatch?.capacity ? initialBatch.capacity.toString() : '20',
    notes: initialBatch?.notes || ''
  });

  // Inline "Add New Sport / Program" State
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🥋');

  if (!isOpen) return null;

  const handleToggleDay = (day) => {
    setFormData(prev => {
      const exists = prev.days.includes(day);
      if (exists) {
        return { ...prev, days: prev.days.filter(d => d !== day) };
      } else {
        return { ...prev, days: [...prev.days, day] };
      }
    });
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const catId = newCatName.trim().toLowerCase().replace(/\s+/g, '_');
    const newCategoryObj = {
      id: catId,
      name: newCatName.trim(),
      icon: newCatIcon
    };

    if (onAddCategory) {
      onAddCategory(newCategoryObj);
    }
    setFormData(prev => ({ ...prev, category: catId }));
    setNewCatName('');
    setIsAddingNewCategory(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.instructor.trim() || formData.days.length === 0) {
      alert("Please fill in the Batch Name, Instructor Name, and select at least one schedule day.");
      return;
    }

    const currentCatObj = categories.find(c => c.id === formData.category) || { name: 'Karate', icon: '🥋' };

    const batchRecord = {
      id: initialBatch?.id || ('batch-' + Date.now()),
      name: formData.name.trim(),
      category: formData.category,
      categoryName: currentCatObj.name,
      icon: currentCatObj.icon || '🥋',
      instructor: formData.instructor.trim(),
      days: formData.days,
      startTime: formData.startTime,
      endTime: formData.endTime,
      monthlyFee: parseFloat(formData.monthlyFee) || 0,
      capacity: parseInt(formData.capacity, 10) || 20,
      notes: formData.notes.trim()
    };

    onSaveBatch(batchRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 shrink-0">
          <div>
            <h3 className="font-extrabold text-base text-zinc-900 flex items-center gap-2">
              <span>{initialBatch ? 'Edit Academy Batch' : 'Create New Academy Batch'}</span>
            </h3>
            <p className="text-[11px] text-zinc-500 font-medium">
              Setup training batches, instructor, schedule, and monthly fees
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-800 p-1">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Dynamic Program / Sport Type Selector */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
                Service / Sport Program Type
              </label>
              {!isAddingNewCategory && (
                <button
                  type="button"
                  onClick={() => setIsAddingNewCategory(true)}
                  className="text-xs text-[#d33638] hover:text-[#b42628] font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus size={13} />
                  <span>Add New Sport</span>
                </button>
              )}
            </div>

            {/* List of Admin-Defined Sport Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => {
                const isSelected = formData.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-red-50 text-[#d33638] border-[#d33638] ring-2 ring-red-200 shadow-sm'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    <span className="text-base">{cat.icon || '🥋'}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Inline Add New Sport Box */}
            {isAddingNewCategory && (
              <div className="mt-2.5 p-3 bg-red-50/50 rounded-2xl border border-red-200 space-y-2.5 animate-in fade-in duration-150">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-extrabold uppercase tracking-wide text-zinc-700">
                    Add New Program Type
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCategory(false)}
                    className="text-zinc-400 hover:text-zinc-700 text-xs"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Yoga, Badminton, Swimming"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    className="flex-1 bg-white border border-zinc-300 rounded-xl px-3 py-1.5 text-xs font-semibold outline-none focus:border-[#d33638]"
                  />

                  {/* Emoji selector */}
                  <select
                    value={newCatIcon}
                    onChange={e => setNewCatIcon(e.target.value)}
                    className="bg-white border border-zinc-300 rounded-xl px-2 py-1.5 text-sm outline-none"
                  >
                    {EMOJI_OPTIONS.map(em => (
                      <option key={em} value={em}>{em}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="bg-[#d33638] hover:bg-[#b42628] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Batch Name & Instructor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Batch Name
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Kids Karate Evening Batch"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Coach / Sensei / Instructor
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Sensei Rajesh Kumar"
                value={formData.instructor}
                onChange={e => setFormData({ ...formData, instructor: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Days of Week */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Class Schedule Days
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DAYS_OF_WEEK.map(day => {
                const isSelected = formData.days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`flex-1 min-w-[40px] py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-[#d33638] text-white border-[#d33638] shadow-sm'
                        : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots (No Room/Hall option) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Fee & Capacity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Monthly Fee per Student (₹)
              </label>
              <input
                required
                type="number"
                min="0"
                value={formData.monthlyFee}
                onChange={e => setFormData({ ...formData, monthlyFee: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-sm font-black text-emerald-600 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Batch Capacity (Max Students)
              </label>
              <input
                type="number"
                min="1"
                value={formData.capacity}
                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-sm font-black text-zinc-900 outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Class Notes & Syllabus (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. For kids aged 6-14, uniforms provided"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-black"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#d33638] hover:bg-[#b42628] text-white py-3.5 rounded-xl font-extrabold text-sm transition-all shadow-md shadow-red-900/20 active:scale-[0.99] flex items-center justify-center gap-2 uppercase tracking-wider font-sports"
          >
            <CheckCircle2 size={16} />
            <span>{initialBatch ? 'Update Academy Batch' : 'Save & Launch Academy Batch'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
