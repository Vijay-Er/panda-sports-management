import React, { useState, useEffect } from 'react';
import { 
  X, User, Phone, MapPin, Briefcase, Star, 
  ChevronDown, ChevronUp, CheckCircle2, Clock, Sparkles
} from 'lucide-react';
import { 
  SKILL_LEVEL_OPTIONS, 
  MEMBERSHIP_TYPE_OPTIONS 
} from '../../constants/customers';

export default function CustomerModal({ 
  isOpen, 
  onClose, 
  onSaveCustomer, 
  initialCustomer = null 
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    area: '',
    preferredTime: 'Evening',
    preferredService: 'Both',
    occupation: '',
    interests: [],
    // Optional / Extra fields
    email: '',
    dateOfBirth: '',
    skillLevel: 'Intermediate',
    membershipType: 'Regular',
    notes: ''
  });

  const [showMoreDetails, setShowMoreDetails] = useState(false);

  useEffect(() => {
    if (initialCustomer) {
      setFormData({
        name: initialCustomer.name || '',
        phone: (initialCustomer.phone || '').replace(/\D/g, '').slice(-10),
        area: initialCustomer.area || '',
        preferredTime: initialCustomer.preferredTime || 'Evening',
        preferredService: initialCustomer.preferredService || 'Both',
        occupation: initialCustomer.occupation || '',
        interests: initialCustomer.interests || [],
        email: initialCustomer.email || '',
        dateOfBirth: initialCustomer.dateOfBirth || '',
        skillLevel: initialCustomer.skillLevel || 'Intermediate',
        membershipType: initialCustomer.membershipType || 'Regular',
        notes: initialCustomer.notes || ''
      });
      // If customer has extra details, auto-expand the section
      if (initialCustomer.email || initialCustomer.dateOfBirth || initialCustomer.notes) {
        setShowMoreDetails(true);
      }
    } else {
      setFormData({
        name: '',
        phone: '',
        area: '',
        preferredTime: 'Evening',
        preferredService: 'Both',
        occupation: '',
        interests: [],
        email: '',
        dateOfBirth: '',
        skillLevel: 'Intermediate',
        membershipType: 'Regular',
        notes: ''
      });
      setShowMoreDetails(false);
    }
  }, [initialCustomer, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, phone: clean }));
  };

  const toggleInterest = (interest) => {
    setFormData(prev => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists 
          ? prev.interests.filter(i => i !== interest)
          : [...prev.interests, interest]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter customer name.");
      return;
    }
    if (!formData.phone.trim() || formData.phone.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    const payload = {
      ...(initialCustomer || {}),
      ...formData,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      id: initialCustomer?.id || `cust-${formData.phone.trim()}`,
      createdAt: initialCustomer?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: initialCustomer?.isActive !== undefined ? initialCustomer.isActive : true
    };

    onSaveCustomer(payload);
    onClose();
  };

  const commonInterests = [
    'Fitness',
    'Weekend Matches',
    'Tournaments',
    'Social Play',
    'Coaching / Training'
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#d33638] flex items-center justify-center font-bold">
              <User size={18} />
            </div>
            <div>
              <h3 className="font-black text-base text-zinc-900 leading-tight">
                {initialCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <p className="text-[11px] text-zinc-500 font-medium">
                Quick 30-second player registration
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {/* 1. Essential Info */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-zinc-700 mb-1">
                Player / Customer Name <span className="text-[#d33638]">*</span>
              </label>
              <input
                required
                autoFocus
                type="text"
                name="name"
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#d33638] focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-bold text-zinc-900 outline-none transition-all placeholder:text-zinc-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-zinc-700 mb-1">
                  WhatsApp Number <span className="text-[#d33638]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-black text-zinc-400">+91</span>
                  <input
                    required
                    type="tel"
                    placeholder="98765 43210"
                    maxLength={10}
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#d33638] focus:bg-white rounded-xl pl-11 pr-3 py-2.5 text-sm font-bold text-zinc-900 outline-none transition-all tracking-wide placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-zinc-700 mb-1">
                  Area / Locality
                </label>
                <div className="relative flex items-center">
                  <MapPin size={15} className="absolute left-3 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    name="area"
                    placeholder="e.g. Anna Nagar, T. Nagar"
                    value={formData.area}
                    onChange={handleChange}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#d33638] focus:bg-white rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold text-zinc-900 outline-none transition-all placeholder:text-zinc-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Quick Timing Preference */}
          <div className="pt-2 border-t border-zinc-100">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-zinc-700 mb-2">
              Preferred Playing Time
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Morning', label: '🌅 Morning', sub: '6 AM - 12 PM' },
                { id: 'Evening', label: '🌆 Evening', sub: '4 PM - 11 PM' },
                { id: 'Both', label: '🔄 Flexible / Both', sub: 'Anytime' }
              ].map(opt => {
                const isSelected = formData.preferredTime === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, preferredTime: opt.id }))}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                      isSelected 
                        ? 'bg-red-50 border-[#d33638] text-[#d33638] shadow-sm ring-1 ring-[#d33638]' 
                        : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="text-xs font-black">{opt.label}</div>
                    <div className={`text-[10px] font-medium mt-0.5 ${isSelected ? 'text-red-700' : 'text-zinc-400'}`}>
                      {opt.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Booking / Play Type Preference */}
          <div className="pt-2 border-t border-zinc-100">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-zinc-700 mb-2">
              Play Style Preference
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Court Booking', label: '🏸 Court Booking', desc: 'Private slots' },
                { id: 'Group Game', label: '👥 Group Game', desc: 'Social / matches' },
                { id: 'Both', label: '⚡ Both', desc: 'All formats' }
              ].map(opt => {
                const isSelected = formData.preferredService === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, preferredService: opt.id }))}
                    className={`py-2 px-2 rounded-xl border text-center transition-all ${
                      isSelected 
                        ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm' 
                        : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="text-xs font-black">{opt.label}</div>
                    <div className={`text-[10px] font-medium mt-0.5 ${isSelected ? 'text-zinc-300' : 'text-zinc-400'}`}>
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Occupation & Interests */}
          <div className="pt-2 border-t border-zinc-100 space-y-3">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-zinc-700 mb-1">
                Occupation / Profession
              </label>
              <div className="relative flex items-center">
                <Briefcase size={15} className="absolute left-3 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  name="occupation"
                  placeholder="e.g. Software Engineer, Doctor, Student, Business"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#d33638] focus:bg-white rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-zinc-900 outline-none transition-all placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-zinc-700 mb-1.5">
                Player Interests
              </label>
              <div className="flex flex-wrap gap-1.5">
                {commonInterests.map(interest => {
                  const isSelected = formData.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-[#d33638] text-white border-[#d33638] shadow-sm'
                          : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. Optional Collapsible Extra Details */}
          <div className="pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setShowMoreDetails(!showMoreDetails)}
              className="w-full py-2 flex items-center justify-between text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                <span>{showMoreDetails ? 'Hide Extra Details' : '+ Add More Optional Details (Email, DOB, Skill, Notes)'}</span>
              </span>
              {showMoreDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showMoreDetails && (
              <div className="mt-3 p-4 bg-zinc-50/70 border border-zinc-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="player@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium text-zinc-900 outline-none focus:border-[#d33638]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium text-zinc-900 outline-none focus:border-[#d33638]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 mb-1">
                      Skill Level
                    </label>
                    <select
                      name="skillLevel"
                      value={formData.skillLevel}
                      onChange={handleChange}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-900 outline-none focus:border-[#d33638]"
                    >
                      {SKILL_LEVEL_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 mb-1">
                      Membership Tier
                    </label>
                    <select
                      name="membershipType"
                      value={formData.membershipType}
                      onChange={handleChange}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-900 outline-none focus:border-[#d33638]"
                    >
                      {MEMBERSHIP_TYPE_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 mb-1">
                    Special Notes / Preferences
                  </label>
                  <textarea
                    rows={2}
                    name="notes"
                    placeholder="e.g. Prefers Court 1, plays with family on Sundays"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium text-zinc-900 outline-none focus:border-[#d33638]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#d33638] hover:bg-[#b0292b] text-white py-3.5 rounded-2xl font-black text-sm transition-all shadow-md shadow-red-900/20 active:scale-[0.99] flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <CheckCircle2 size={18} />
              <span>{initialCustomer ? 'Update Customer Profile' : 'Save Customer to Directory'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
