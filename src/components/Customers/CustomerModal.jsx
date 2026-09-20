import React, { useState, useEffect } from 'react';
import { 
  X, User, Phone as PhoneIcon, FileText, CheckCircle2, 
  MapPin, Heart, Briefcase, Calendar, Shield, Clock, 
  Star, Users, ChevronRight 
} from 'lucide-react';
import { 
  GENDER_OPTIONS, BLOOD_GROUP_OPTIONS, PREFERRED_TIME_OPTIONS, 
  PREFERRED_SERVICE_OPTIONS, PREFERRED_SPORTS_OPTIONS, 
  SKILL_LEVEL_OPTIONS, PLAY_FREQUENCY_OPTIONS, DAYS_OF_WEEK, 
  INTEREST_OPTIONS, REFERRAL_SOURCE_OPTIONS, MEMBERSHIP_TYPE_OPTIONS 
} from '../../constants/customers';

export default function CustomerModal({ isOpen, onClose, onSaveCustomer, initialCustomer = null }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    area: '',
    address: '',
    pincode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    preferredTime: '',
    preferredService: '',
    preferredSports: [],
    preferredCourt: '',
    skillLevel: '',
    playFrequency: '',
    preferredDays: [],
    occupation: '',
    company: '',
    interests: [],
    referredBy: '',
    membershipType: '',
    notes: ''
  });

  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (initialCustomer) {
      setFormData({
        name: initialCustomer.name || '',
        phone: initialCustomer.phone || '',
        email: initialCustomer.email || '',
        dateOfBirth: initialCustomer.dateOfBirth || '',
        gender: initialCustomer.gender || '',
        bloodGroup: initialCustomer.bloodGroup || '',
        area: initialCustomer.area || '',
        address: initialCustomer.address || '',
        pincode: initialCustomer.pincode || '',
        emergencyContactName: initialCustomer.emergencyContactName || '',
        emergencyContactPhone: initialCustomer.emergencyContactPhone || '',
        preferredTime: initialCustomer.preferredTime || '',
        preferredService: initialCustomer.preferredService || '',
        preferredSports: initialCustomer.preferredSports || [],
        preferredCourt: initialCustomer.preferredCourt || '',
        skillLevel: initialCustomer.skillLevel || '',
        playFrequency: initialCustomer.playFrequency || '',
        preferredDays: initialCustomer.preferredDays || [],
        occupation: initialCustomer.occupation || '',
        company: initialCustomer.company || '',
        interests: initialCustomer.interests || [],
        referredBy: initialCustomer.referredBy || '',
        membershipType: initialCustomer.membershipType || '',
        notes: initialCustomer.notes || ''
      });
    } else {
      setFormData({
        name: '', phone: '', email: '', dateOfBirth: '', gender: '', bloodGroup: '',
        area: '', address: '', pincode: '', emergencyContactName: '', emergencyContactPhone: '',
        preferredTime: '', preferredService: '', preferredSports: [], preferredCourt: '',
        skillLevel: '', playFrequency: '', preferredDays: [], occupation: '', company: '',
        interests: [], referredBy: '', membershipType: '', notes: ''
      });
    }
    setActiveTab(0);
  }, [initialCustomer, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleChip = (field, value) => {
    setFormData(prev => {
      const current = prev[field] || [];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const renderChips = (field, options) => (
    <div className="flex flex-wrap gap-2">
      {options.map(option => {
        const isSelected = (formData[field] || []).includes(option);
        return (
          <div
            key={option}
            onClick={() => toggleChip(field, option)}
            className={`border rounded-lg px-2.5 py-1 text-[11px] font-bold cursor-pointer transition-all ${
              isSelected
                ? 'bg-[#d33638] text-white border-[#d33638]'
                : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
            }`}
          >
            {option}
          </div>
        );
      })}
    </div>
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Name and Phone are required.");
      return;
    }
    if (formData.phone.length !== 10) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    const customerData = {
      ...formData,
      id: initialCustomer?.id || 'cust-' + formData.phone,
      createdAt: initialCustomer?.createdAt || new Date().toISOString(),
    };

    onSaveCustomer(customerData);
    onClose();
  };

  const tabs = [
    { id: 0, label: 'Personal', icon: User },
    { id: 1, label: 'Location', icon: MapPin },
    { id: 2, label: 'Preferences', icon: Star },
    { id: 3, label: 'Background', icon: Briefcase },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-zinc-900">
              {initialCustomer ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <p className="text-xs font-bold text-zinc-500 mt-1">
              {initialCustomer ? 'Update customer details' : 'Enter details for the new customer'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500 hover:text-zinc-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 shrink-0">
          <div className="flex space-x-1 bg-zinc-100 p-1 rounded-2xl overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-1 justify-center ${
                    isActive
                      ? 'bg-white shadow-sm text-zinc-900'
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="customer-form" onSubmit={handleSubmit} className="space-y-6">
            {/* TAB 0: Personal */}
            {activeTab === 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    autoFocus
                    required
                    placeholder="Enter full name"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    WhatsApp Number*
                  </label>
                  <div className="flex relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs pointer-events-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      maxLength={10}
                      placeholder="9876543210"
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-10 pr-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Blood Group
                    </label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638]"
                    >
                      <option value="">Select...</option>
                      {BLOOD_GROUP_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638]"
                  >
                    <option value="">Select...</option>
                    {GENDER_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* TAB 1: Location */}
            {activeTab === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Area / Locality
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="e.g. Anna Nagar, T. Nagar"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Full Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Enter full address"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638] resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    maxLength={6}
                    placeholder="600001"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638]"
                  />
                </div>
                <div className="pt-4 border-t border-zinc-100 space-y-4">
                  <h3 className="text-sm font-extrabold text-zinc-900 flex items-center gap-2">
                    <Heart size={16} className="text-red-500" />
                    Emergency Contact
                  </h3>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                      placeholder="Name"
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Contact Phone
                    </label>
                    <div className="flex relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs pointer-events-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        name="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={handleChange}
                        maxLength={10}
                        placeholder="9876543210"
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-10 pr-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Preferences */}
            {activeTab === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
                    Preferred Sports
                  </label>
                  {renderChips('preferredSports', PREFERRED_SPORTS_OPTIONS)}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
                    Preferred Days
                  </label>
                  {renderChips('preferredDays', DAYS_OF_WEEK)}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Preferred Time
                    </label>
                    <select
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleChange}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638]"
                    >
                      <option value="">Select...</option>
                      {PREFERRED_TIME_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Service Preference
                    </label>
                    <select
                      name="preferredService"
                      value={formData.preferredService}
                      onChange={handleChange}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638]"
                    >
                      <option value="">Select...</option>
                      {PREFERRED_SERVICE_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Skill Level
                    </label>
                    <select
                      name="skillLevel"
                      value={formData.skillLevel}
                      onChange={handleChange}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638]"
                    >
                      <option value="">Select...</option>
                      {SKILL_LEVEL_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Play Frequency
                    </label>
                    <select
                      name="playFrequency"
                      value={formData.playFrequency}
                      onChange={handleChange}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638]"
                    >
                      <option value="">Select...</option>
                      {PLAY_FREQUENCY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Preferred Court
                    </label>
                    <select
                      name="preferredCourt"
                      value={formData.preferredCourt}
                      onChange={handleChange}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638]"
                    >
                      <option value="">Select...</option>
                      <option value="Court 1">Court 1</option>
                      <option value="Court 2">Court 2</option>
                      <option value="Court 3">Court 3</option>
                      <option value="No Preference">No Preference</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Background */}
            {activeTab === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Occupation
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    placeholder="e.g. Software Engineer, Student"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Tech Corp"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
                    Interests
                  </label>
                  {renderChips('interests', INTEREST_OPTIONS)}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Heard About Us
                    </label>
                    <select
                      name="referredBy"
                      value={formData.referredBy}
                      onChange={handleChange}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638]"
                    >
                      <option value="">Select...</option>
                      {REFERRAL_SOURCE_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Membership Type
                    </label>
                    <select
                      name="membershipType"
                      value={formData.membershipType}
                      onChange={handleChange}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638]"
                    >
                      <option value="">Select...</option>
                      {MEMBERSHIP_TYPE_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Admin Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Any special requirements, observations, etc."
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#d33638] resize-none"
                  ></textarea>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-100 shrink-0 bg-white rounded-b-3xl">
          <button
            type="submit"
            form="customer-form"
            className="w-full flex items-center justify-center space-x-2 bg-[#d33638] text-white py-4 rounded-xl hover:bg-[#b02a2c] transition-colors font-extrabold shadow-lg shadow-red-900/20"
          >
            <CheckCircle2 size={18} />
            <span>{initialCustomer ? 'Update Customer' : 'Save Customer'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
