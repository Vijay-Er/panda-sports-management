import React, { useState, useEffect } from 'react';
import { 
  X, User, Phone, MapPin, Briefcase, Users, 
  Calendar, CheckCircle2, Clock, Heart, Shield, FileText, Sparkles
} from 'lucide-react';
import { 
  GENDER_OPTIONS, 
  BLOOD_GROUP_OPTIONS, 
  PARTICULARS_OPTIONS, 
  PROFESSION_TYPE_OPTIONS,
  DAYS_OF_WEEK 
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
    emergencyPhone: '',
    bloodGroup: '',
    area: '',
    age: '',
    gender: 'Male',
    particulars: ['Court Booking'],
    availableTime: 'Evening',
    preferredTime: 'Evening',
    availableDays: ['Mon', 'Wed', 'Fri'],
    professionType: 'Working',
    workTime: '',
    professionComments: '',
    referredBy: '',
    parentName: '',
    teamName: '',
    associatedMembers: '',
    comments: '',
    membershipType: 'Regular',
    walletBalance: 0,
    passHours: 0
  });

  useEffect(() => {
    if (initialCustomer) {
      setFormData({
        name: initialCustomer.name || '',
        phone: (initialCustomer.phone || '').replace(/\D/g, '').slice(-10),
        emergencyPhone: (initialCustomer.emergencyPhone || '').replace(/\D/g, '').slice(-10),
        bloodGroup: initialCustomer.bloodGroup || '',
        area: initialCustomer.area || '',
        age: initialCustomer.age || '',
        gender: initialCustomer.gender || 'Male',
        particulars: initialCustomer.particulars || (initialCustomer.preferredService ? [initialCustomer.preferredService] : ['Court Booking']),
        availableTime: initialCustomer.availableTime || initialCustomer.preferredTime || 'Evening',
        preferredTime: initialCustomer.preferredTime || 'Evening',
        availableDays: initialCustomer.availableDays || (initialCustomer.preferredDays || ['Sat', 'Sun']),
        professionType: initialCustomer.professionType || 'Working',
        workTime: initialCustomer.workTime || '',
        professionComments: initialCustomer.professionComments || initialCustomer.company || '',
        referredBy: initialCustomer.referredBy || '',
        parentName: initialCustomer.parentName || '',
        teamName: initialCustomer.teamName || '',
        associatedMembers: initialCustomer.associatedMembers || '',
        comments: initialCustomer.comments || initialCustomer.notes || '',
        membershipType: initialCustomer.membershipType || 'Regular',
        walletBalance: initialCustomer.walletBalance || 0,
        passHours: initialCustomer.passHours || 0
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        emergencyPhone: '',
        bloodGroup: '',
        area: '',
        age: '',
        gender: 'Male',
        particulars: ['Court Booking'],
        availableTime: 'Evening',
        preferredTime: 'Evening',
        availableDays: ['Tue', 'Thu', 'Sat', 'Sun'],
        professionType: 'Working',
        workTime: '',
        professionComments: '',
        referredBy: '',
        parentName: '',
        teamName: '',
        associatedMembers: '',
        comments: '',
        membershipType: 'Regular',
        walletBalance: 0,
        passHours: 0
      });
    }
  }, [initialCustomer, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (field, e) => {
    const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, [field]: clean }));
  };

  const toggleParticular = (item) => {
    setFormData(prev => {
      const exists = prev.particulars.includes(item);
      const updated = exists 
        ? prev.particulars.filter(p => p !== item)
        : [...prev.particulars, item];
      return { 
        ...prev, 
        particulars: updated,
        preferredService: updated.includes('Court Booking') && updated.includes('Group Game') 
          ? 'Both' 
          : updated[0] || 'Court Booking'
      };
    });
  };

  const toggleDay = (day) => {
    setFormData(prev => {
      const exists = prev.availableDays.includes(day);
      return {
        ...prev,
        availableDays: exists
          ? prev.availableDays.filter(d => d !== day)
          : [...prev.availableDays, day]
      };
    });
  };

  const selectDayPreset = (preset) => {
    if (preset === 'All') setFormData(prev => ({ ...prev, availableDays: [...DAYS_OF_WEEK] }));
    if (preset === 'Weekdays') setFormData(prev => ({ ...prev, availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }));
    if (preset === 'Weekends') setFormData(prev => ({ ...prev, availableDays: ['Sat', 'Sun'] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please provide the Customer Name.");
      return;
    }
    if (!formData.phone.trim() || formData.phone.length !== 10) {
      alert("Please provide a valid 10-digit primary contact number (Contact 1).");
      return;
    }

    const payload = {
      ...(initialCustomer || {}),
      ...formData,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      id: initialCustomer?.id || `cust-${formData.phone.trim()}`,
      preferredTime: formData.availableTime.toLowerCase().includes('morning') ? 'Morning' : (formData.availableTime.toLowerCase().includes('evening') ? 'Evening' : 'Both'),
      notes: formData.comments,
      createdAt: initialCustomer?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: initialCustomer?.isActive !== undefined ? initialCustomer.isActive : true
    };

    onSaveCustomer(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#d33638] flex items-center justify-center font-bold">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-black text-base text-zinc-900 leading-tight">
                {initialCustomer ? 'Edit Customer Details' : 'Add Customer to Directory'}
              </h3>
              <p className="text-[11px] text-zinc-500 font-medium">
                Complete player profile, schedule, profession & team details
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
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          {/* SECTION 1: CUSTOMER NAME & CONTACTS */}
          <div className="bg-zinc-50/70 p-4 rounded-2xl border border-zinc-200/80 space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
              <User size={14} className="text-[#d33638]" />
              <span>Customer Name & Contact Information</span>
            </h4>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
                Customer Name <span className="text-[#d33638]">*</span>
              </label>
              <input
                required
                autoFocus
                type="text"
                name="name"
                placeholder="e.g. Prasanna / Dr. Sanjay Ramesh"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-white border border-zinc-200 focus:border-[#d33638] rounded-xl px-3.5 py-2.5 text-sm font-bold text-zinc-900 outline-none transition-all placeholder:text-zinc-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
                  Contact 1 (Primary WhatsApp) <span className="text-[#d33638]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-black text-zinc-400">+91</span>
                  <input
                    required
                    type="tel"
                    placeholder="98401 12233"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange('phone', e)}
                    className="w-full bg-white border border-zinc-200 focus:border-[#d33638] rounded-xl pl-11 pr-3 py-2 text-xs font-bold text-zinc-900 outline-none transition-all tracking-wider placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
                  Emergency Contact 2
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-black text-zinc-400">+91</span>
                  <input
                    type="tel"
                    placeholder="98409 98877"
                    maxLength={10}
                    value={formData.emergencyPhone}
                    onChange={(e) => handlePhoneChange('emergencyPhone', e)}
                    className="w-full bg-white border border-zinc-200 focus:border-[#d33638] rounded-xl pl-11 pr-3 py-2 text-xs font-bold text-zinc-900 outline-none transition-all tracking-wider placeholder:text-zinc-400"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="col-span-2 sm:col-span-2">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
                  Location / Area
                </label>
                <div className="relative flex items-center">
                  <MapPin size={13} className="absolute left-3 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    name="area"
                    placeholder="e.g. Anna Nagar, T. Nagar"
                    value={formData.area}
                    onChange={handleChange}
                    className="w-full bg-white border border-zinc-200 focus:border-[#d33638] rounded-xl pl-8 pr-3 py-2 text-xs font-semibold text-zinc-900 outline-none transition-all placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  placeholder="e.g. 32"
                  min="4"
                  max="99"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full bg-white border border-zinc-200 focus:border-[#d33638] rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 outline-none text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
                  Blood Group (Bgr)
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full bg-white border border-zinc-200 focus:border-[#d33638] rounded-xl px-2 py-2 text-xs font-bold text-zinc-900 outline-none"
                >
                  <option value="">Select</option>
                  {BLOOD_GROUP_OPTIONS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                {GENDER_OPTIONS.map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, gender: g }))}
                    className={`py-1.5 rounded-xl font-bold border transition-all text-center ${
                      formData.gender === g
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: PARTICULARS & SCHEDULE */}
          <div className="bg-zinc-50/70 p-4 rounded-2xl border border-zinc-200/80 space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
              <Calendar size={14} className="text-[#d33638]" />
              <span>Particulars & Playing Routine</span>
            </h4>

            {/* Particulars (Court, Group Game, Karate) */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 mb-1.5">
                Particulars (Select all that apply)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Court Booking', label: '🏸 Court', sub: 'Badminton / Pickleball' },
                  { id: 'Group Game', label: '👥 Group Game', sub: 'Open matches' },
                  { id: 'Karate', label: '🥋 Karate', sub: 'Academy batches' }
                ].map(item => {
                  const isChecked = formData.particulars.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleParticular(item.id)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        isChecked
                          ? 'bg-red-50 border-[#d33638] text-[#d33638] ring-1 ring-[#d33638] shadow-sm'
                          : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      <div className="font-black text-xs">{item.label}</div>
                      <div className={`text-[9px] mt-0.5 ${isChecked ? 'text-red-700 font-bold' : 'text-zinc-400'}`}>
                        {item.sub}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Available Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
                  Available Time Slot
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Morning', 'Evening', 'Both'].map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, availableTime: slot, preferredTime: slot }))}
                      className={`py-1.5 rounded-xl font-bold border transition-all text-center ${
                        formData.availableTime === slot
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      {slot === 'Morning' && '🌅 Morning'}
                      {slot === 'Evening' && '🌆 Evening'}
                      {slot === 'Both' && '🔄 Flexible'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
                  Specific Time Details (Optional)
                </label>
                <input
                  type="text"
                  name="availableTime"
                  placeholder="e.g. 6 AM - 8 AM / 7 PM - 9 PM"
                  value={formData.availableTime}
                  onChange={handleChange}
                  className="w-full bg-white border border-zinc-200 focus:border-[#d33638] rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-900 outline-none"
                />
              </div>
            </div>

            {/* Available Days */}
            <div className="pt-1">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-600">
                  Available Days
                </label>
                <div className="flex gap-1">
                  {['All', 'Weekdays', 'Weekends'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => selectDayPreset(preset)}
                      className="text-[10px] font-bold text-zinc-500 hover:text-zinc-900 bg-white px-2 py-0.5 rounded border border-zinc-200"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DAYS_OF_WEEK.map(day => {
                  const isDaySelected = formData.availableDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-lg border font-black text-xs transition-all ${
                        isDaySelected
                          ? 'bg-[#d33638] text-white border-[#d33638] shadow-sm'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 3: TEAM & ASSOCIATED MEMBERS */}
          <div className="bg-zinc-50/70 p-4 rounded-2xl border border-zinc-200/80 space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
              <Users size={14} className="text-[#d33638]" />
              <span>Team, Associated Members & Parents</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
                  Team / Group Name
                </label>
                <input
                  type="text"
                  name="teamName"
                  placeholder="for example: Prasanna Team"
                  value={formData.teamName}
                  onChange={handleChange}
                  className="w-full bg-white border border-zinc-200 focus:border-[#d33638] rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 outline-none placeholder:text-zinc-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
                  Parents Name (for kids / students)
                </label>
                <input
                  type="text"
                  name="parentName"
                  placeholder="e.g. Suresh Patel (Father)"
                  value={formData.parentName}
                  onChange={handleChange}
                  className="w-full bg-white border border-zinc-200 focus:border-[#d33638] rounded-xl px-3 py-2 text-xs font-semibold text-zinc-900 outline-none placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
                Associated Members / Teammates
              </label>
              <input
                type="text"
                name="associatedMembers"
                placeholder="for example: Vignesh, Selva, Dinesh"
                value={formData.associatedMembers}
                onChange={handleChange}
                className="w-full bg-white border border-zinc-200 focus:border-[#d33638] rounded-xl px-3 py-2 text-xs font-semibold text-zinc-900 outline-none placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* SECTION 4: PROFESSION, REFERENCE & COMMENTS */}
          <div className="bg-zinc-50/70 p-4 rounded-2xl border border-zinc-200/80 space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
              <Briefcase size={14} className="text-[#d33638]" />
              <span>Profession, Reference & Miscellaneous Comments</span>
            </h4>

            {/* Working / Business Selector */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
                Profession Type
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {PROFESSION_TYPE_OPTIONS.map(pt => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, professionType: pt }))}
                    className={`py-1.5 rounded-xl font-bold border transition-all text-center ${
                      formData.professionType === pt
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    {pt}
                  </button>
                ))}
              </div>
            </div>

            {/* If working - then work time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
                  Work Time (if working)
                </label>
                <input
                  type="text"
                  name="workTime"
                  placeholder="e.g. 9:30 AM - 6:30 PM / Shift hours"
                  value={formData.workTime}
                  onChange={handleChange}
                  className="w-full bg-white border border-zinc-200 focus:border-[#d33638] rounded-xl px-3 py-2 text-xs font-semibold text-zinc-900 outline-none placeholder:text-zinc-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
                  Reference (Who Referred?)
                </label>
                <input
                  type="text"
                  name="referredBy"
                  placeholder="e.g. Vignesh / Friend / Walk-in"
                  value={formData.referredBy}
                  onChange={handleChange}
                  className="w-full bg-white border border-zinc-200 focus:border-[#d33638] rounded-xl px-3 py-2 text-xs font-semibold text-zinc-900 outline-none placeholder:text-zinc-400"
                />
              </div>
            </div>

            {/* Profession Comments (e.g. hybrid base - 2 days to Bangalore / Medical equipments manufacturer) */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
                Profession Comments & Details
              </label>
              <input
                type="text"
                name="professionComments"
                placeholder="for example: hybrid base - 2 days to Bangalore (or) Medical equipments manufacturer"
                value={formData.professionComments}
                onChange={handleChange}
                className="w-full bg-white border border-zinc-200 focus:border-[#d33638] rounded-xl px-3 py-2 text-xs font-semibold text-zinc-900 outline-none placeholder:text-zinc-400"
              />
            </div>

            {/* Comments (Miscellaneous details) */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
                Comments (Miscellaneous details)
              </label>
              <textarea
                rows={2}
                name="comments"
                placeholder="Any special remarks, court preferences, box league participant, etc."
                value={formData.comments}
                onChange={handleChange}
                className="w-full bg-white border border-zinc-200 focus:border-[#d33638] rounded-xl px-3 py-2 text-xs font-medium text-zinc-900 outline-none placeholder:text-zinc-400"
              />
            </div>
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
