import React, { useState, useEffect, useRef } from 'react';
import { 
  X, User, Phone, MapPin, Briefcase, Users, 
  Calendar, CheckCircle2, Clock, FileText, Plus, 
  Search, ChevronDown, Check
} from 'lucide-react';
import { 
  GENDER_OPTIONS, 
  PARTICULARS_OPTIONS, 
  PROFESSION_TYPE_OPTIONS,
  DAYS_OF_WEEK,
  COUNTRY_DIAL_CODES
} from '../../constants/customers';

export default function CustomerModal({ 
  isOpen, 
  onClose, 
  onSaveCustomer, 
  initialCustomer = null,
  customers = []
}) {
  const [formData, setFormData] = useState({
    name: '',
    phoneRegionCode: '+91',
    phone: '',
    contact2RegionCode: '+91',
    contact2: '',
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
    associatedMembers: [],
    remarks: '',
    membershipType: 'Regular',
    walletBalance: 0,
    passHours: 0
  });

  // Autocomplete / Search States for Teammates & Referral
  const [memberSearch, setMemberSearch] = useState('');
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const memberDropdownRef = useRef(null);

  const [refSearch, setRefSearch] = useState('');
  const [isRefDropdownOpen, setIsRefDropdownOpen] = useState(false);
  const refDropdownRef = useRef(null);

  useEffect(() => {
    if (initialCustomer) {
      // Parse associated members into an array of names
      let membersArr = [];
      if (Array.isArray(initialCustomer.associatedMembers)) {
        membersArr = initialCustomer.associatedMembers;
      } else if (typeof initialCustomer.associatedMembers === 'string' && initialCustomer.associatedMembers.trim()) {
        membersArr = initialCustomer.associatedMembers.split(',').map(s => s.trim()).filter(Boolean);
      }

      setFormData({
        name: initialCustomer.name || '',
        phoneRegionCode: initialCustomer.phoneRegionCode || '+91',
        phone: (initialCustomer.phone || '').replace(/\D/g, '').slice(-10),
        contact2RegionCode: initialCustomer.contact2RegionCode || '+91',
        contact2: (initialCustomer.contact2 || initialCustomer.emergencyPhone || '').replace(/\D/g, '').slice(-10),
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
        associatedMembers: membersArr,
        remarks: initialCustomer.remarks || initialCustomer.comments || initialCustomer.notes || '',
        membershipType: initialCustomer.membershipType || 'Regular',
        walletBalance: initialCustomer.walletBalance || 0,
        passHours: initialCustomer.passHours || 0
      });
      setRefSearch(initialCustomer.referredBy || '');
    } else {
      setFormData({
        name: '',
        phoneRegionCode: '+91',
        phone: '',
        contact2RegionCode: '+91',
        contact2: '',
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
        associatedMembers: [],
        remarks: '',
        membershipType: 'Regular',
        walletBalance: 0,
        passHours: 0
      });
      setRefSearch('');
    }
    setMemberSearch('');
    setIsMemberDropdownOpen(false);
    setIsRefDropdownOpen(false);
  }, [initialCustomer, isOpen]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(e.target)) {
        setIsMemberDropdownOpen(false);
      }
      if (refDropdownRef.current && !refDropdownRef.current.contains(e.target)) {
        setIsRefDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Associated Members / Teammates handlers
  const addTeammate = (nameToAdd) => {
    const trimmed = nameToAdd.trim();
    if (!trimmed) return;
    if (!formData.associatedMembers.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        associatedMembers: [...prev.associatedMembers, trimmed]
      }));
    }
    setMemberSearch('');
    setIsMemberDropdownOpen(false);
  };

  const removeTeammate = (nameToRemove) => {
    setFormData(prev => ({
      ...prev,
      associatedMembers: prev.associatedMembers.filter(m => m !== nameToRemove)
    }));
  };

  // Filtered existing customers for member search
  const filteredExistingMembers = customers.filter(c => {
    const nameMatch = c.name?.toLowerCase().includes(memberSearch.toLowerCase());
    const phoneMatch = c.phone?.includes(memberSearch);
    const notSelf = initialCustomer ? c.id !== initialCustomer.id : true;
    const notAlreadyAdded = !formData.associatedMembers.includes(c.name);
    return (nameMatch || phoneMatch) && notSelf && notAlreadyAdded;
  });

  // Filtered existing customers for referral search
  const filteredReferralCustomers = customers.filter(c => {
    const match = c.name?.toLowerCase().includes(refSearch.toLowerCase()) || c.phone?.includes(refSearch);
    const notSelf = initialCustomer ? c.id !== initialCustomer.id : true;
    return match && notSelf;
  });

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
      contact2: formData.contact2.trim(),
      emergencyPhone: formData.contact2.trim(), // backwards compatibility
      associatedMembers: formData.associatedMembers.join(', '),
      referredBy: refSearch.trim() || formData.referredBy,
      notes: formData.remarks,
      comments: formData.remarks,
      id: initialCustomer?.id || `cust-${formData.phone.trim()}`,
      preferredTime: formData.availableTime.toLowerCase().includes('morning') ? 'Morning' : (formData.availableTime.toLowerCase().includes('evening') ? 'Evening' : 'Both'),
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
                Player contacts, schedule, profession, team & remarks
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
          
          {/* SECTION 1: CUSTOMER NAME & CONTACTS (WITH REGION CODE) */}
          <div className="bg-zinc-50/70 p-4 rounded-2xl border border-zinc-200/80 space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
              <User size={14} className="text-[#d33638]" />
              <span>Customer Name & Contacts</span>
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
              {/* Contact 1 with Country Region Code Selector */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
                  Contact 1 (Primary WhatsApp) <span className="text-[#d33638]">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <select
                    value={formData.phoneRegionCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneRegionCode: e.target.value }))}
                    className="bg-white border border-zinc-200 focus:border-[#d33638] rounded-xl px-2 py-2 text-xs font-black text-zinc-800 outline-none w-24 shrink-0"
                    title="Select country code"
                  >
                    {COUNTRY_DIAL_CODES.map(c => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <input
                    required
                    type="tel"
                    placeholder="98401 12233"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange('phone', e)}
                    className="flex-1 bg-white border border-zinc-200 focus:border-[#d33638] rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 outline-none tracking-wider placeholder:text-zinc-400"
                  />
                </div>
              </div>

              {/* Contact 2 with Country Region Code Selector */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
                  Contact 2 (Secondary Number)
                </label>
                <div className="flex items-center gap-1.5">
                  <select
                    value={formData.contact2RegionCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact2RegionCode: e.target.value }))}
                    className="bg-white border border-zinc-200 focus:border-[#d33638] rounded-xl px-2 py-2 text-xs font-black text-zinc-800 outline-none w-24 shrink-0"
                    title="Select country code"
                  >
                    {COUNTRY_DIAL_CODES.map(c => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="98409 98877"
                    maxLength={10}
                    value={formData.contact2}
                    onChange={(e) => handlePhoneChange('contact2', e)}
                    className="flex-1 bg-white border border-zinc-200 focus:border-[#d33638] rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 outline-none tracking-wider placeholder:text-zinc-400"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="col-span-2 sm:col-span-1">
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
                    className="w-full bg-white border border-zinc-200 focus:border-[#d33638] rounded-xl pl-8 pr-3 py-2 text-xs font-semibold text-zinc-900 outline-none placeholder:text-zinc-400"
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
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Male', 'Female'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gender: g }))}
                      className={`py-1.5 rounded-xl font-bold border transition-all text-center ${
                        formData.gender === g
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: PARTICULARS & SCHEDULE (NO BADMINTON) */}
          <div className="bg-zinc-50/70 p-4 rounded-2xl border border-zinc-200/80 space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
              <Calendar size={14} className="text-[#d33638]" />
              <span>Particulars & Playing Routine</span>
            </h4>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 mb-1.5">
                Particulars (Select all that apply)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Court Booking', label: '🏸 Court Booking', sub: 'Court slot booking' },
                  { id: 'Group Game', label: '👥 Group Game', sub: 'Open matches & matches' },
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

          {/* SECTION 3: TEAM & ASSOCIATED MEMBERS (WITH SEARCH EXISTING CUSTOMERS) */}
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

            {/* Associated Members with Live Search of Existing Customers */}
            <div ref={memberDropdownRef} className="relative">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
                Associated Members / Teammates (Search existing or type)
              </label>

              {/* Tag chips for selected members */}
              {formData.associatedMembers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formData.associatedMembers.map(member => (
                    <span 
                      key={member}
                      className="inline-flex items-center gap-1 bg-red-50 text-[#d33638] border border-red-200 text-xs font-bold px-2.5 py-1 rounded-lg"
                    >
                      <span>{member}</span>
                      <button
                        type="button"
                        onClick={() => removeTeammate(member)}
                        className="hover:text-red-900 p-0.5 rounded-full"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Search input with Add button */}
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search existing customer or type teammate name..."
                    value={memberSearch}
                    onFocus={() => setIsMemberDropdownOpen(true)}
                    onChange={(e) => {
                      setMemberSearch(e.target.value);
                      setIsMemberDropdownOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (memberSearch.trim()) addTeammate(memberSearch);
                      }
                    }}
                    className="w-full bg-white border border-zinc-200 focus:border-[#d33638] rounded-xl pl-8 pr-3 py-2 text-xs font-semibold text-zinc-900 outline-none placeholder:text-zinc-400"
                  />
                </div>
                {memberSearch.trim() && (
                  <button
                    type="button"
                    onClick={() => addTeammate(memberSearch)}
                    className="px-3 py-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold shrink-0 transition-colors flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                )}
              </div>

              {/* Dropdown list of existing customers */}
              {isMemberDropdownOpen && filteredExistingMembers.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-2xl shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-zinc-50">
                  <div className="px-3 py-1.5 bg-zinc-50 text-[10px] font-bold text-zinc-400 uppercase">
                    Select from Registered Customers:
                  </div>
                  {filteredExistingMembers.map(cust => (
                    <button
                      key={cust.id}
                      type="button"
                      onClick={() => addTeammate(cust.name)}
                      className="w-full px-3 py-2 text-left hover:bg-red-50/60 flex items-center justify-between text-xs transition-colors"
                    >
                      <span className="font-bold text-zinc-900">{cust.name}</span>
                      <span className="text-[11px] font-mono text-zinc-400">+91 {cust.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: PROFESSION & REFERENCE (WITH SEARCH EXISTING CUSTOMERS) */}
          <div className="bg-zinc-50/70 p-4 rounded-2xl border border-zinc-200/80 space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
              <Briefcase size={14} className="text-[#d33638]" />
              <span>Profession & Reference Details</span>
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

              {/* Reference (Who Referred?) with Live Search of Existing Customers */}
              <div ref={refDropdownRef} className="relative">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
                  Reference (Who Referred?)
                </label>
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search referring customer or type name / Walk-in..."
                    value={refSearch}
                    onFocus={() => setIsRefDropdownOpen(true)}
                    onChange={(e) => {
                      setRefSearch(e.target.value);
                      setFormData(prev => ({ ...prev, referredBy: e.target.value }));
                      setIsRefDropdownOpen(true);
                    }}
                    className="w-full bg-white border border-zinc-200 focus:border-[#d33638] rounded-xl pl-8 pr-3 py-2 text-xs font-semibold text-zinc-900 outline-none placeholder:text-zinc-400"
                  />
                </div>

                {isRefDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-2xl shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-zinc-50">
                    <div className="px-3 py-1.5 bg-zinc-50 text-[10px] font-bold text-zinc-400 uppercase">
                      Quick Select:
                    </div>
                    {['Walk-in', 'Friends & Family', 'Instagram / Social Media', 'Google Maps'].map(source => (
                      <button
                        key={source}
                        type="button"
                        onClick={() => {
                          setRefSearch(source);
                          setFormData(prev => ({ ...prev, referredBy: source }));
                          setIsRefDropdownOpen(false);
                        }}
                        className="w-full px-3 py-1.5 text-left hover:bg-zinc-100 text-xs font-semibold text-zinc-700"
                      >
                        {source}
                      </button>
                    ))}
                    {filteredReferralCustomers.length > 0 && (
                      <div className="px-3 py-1.5 bg-zinc-50 text-[10px] font-bold text-zinc-400 uppercase">
                        Or Existing Member:
                      </div>
                    )}
                    {filteredReferralCustomers.map(cust => (
                      <button
                        key={cust.id}
                        type="button"
                        onClick={() => {
                          const refVal = `${cust.name} (+91 ${cust.phone})`;
                          setRefSearch(refVal);
                          setFormData(prev => ({ ...prev, referredBy: refVal }));
                          setIsRefDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-red-50/60 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-zinc-900">{cust.name}</span>
                        <span className="text-[11px] font-mono text-zinc-400">+91 {cust.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Profession Comments */}
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
          </div>

          {/* SECTION 5: REMARKS & SPECIAL NOTES (SEPARATE DEDICATED SECTION) */}
          <div className="bg-zinc-50/70 p-4 rounded-2xl border border-zinc-200/80 space-y-2">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
              <FileText size={14} className="text-[#d33638]" />
              <span>Remarks & Special Notes</span>
            </h4>
            <p className="text-[10px] text-zinc-400 font-medium">
              Miscellaneous observations, special requests, player history, or preferences
            </p>
            <textarea
              rows={3}
              name="remarks"
              placeholder="e.g. Regular evening player, prefers Court 1, participates in weekend tournaments"
              value={formData.remarks}
              onChange={handleChange}
              className="w-full bg-white border border-zinc-200 focus:border-[#d33638] rounded-xl px-3.5 py-2.5 text-xs font-medium text-zinc-900 outline-none transition-all placeholder:text-zinc-400"
            />
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
