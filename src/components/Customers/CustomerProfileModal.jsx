import React from 'react';
import { 
  X, User, Phone, MessageSquare, Calendar, Award, Banknote, Clock, 
  CheckCircle2, ChevronRight, Plus, MapPin, Briefcase, Star, Heart, 
  Shield, Mail, Cake 
} from 'lucide-react';
import { openWhatsAppShare } from '../../utils/whatsapp';

export default function CustomerProfileModal({
  isOpen,
  onClose,
  customer,
  bookings = [],
  onBookForPlayer
}) {
  if (!isOpen || !customer) return null;

  const {
    name,
    phone,
    email,
    area,
    address,
    joiningDate,
    createdAt,
    membershipType,
    status,
    preferredTime,
    preferredService,
    preferredSports = [],
    skillLevel,
    playFrequency,
    preferredDays = [],
    preferredCourt,
    dateOfBirth,
    gender,
    bloodGroup,
    occupation,
    company,
    interests = [],
    referredBy,
    emergencyContactName,
    emergencyContactPhone
  } = customer;

  const customerPhone = phone;
  const customerName = name;

  // Filter bookings
  const customerBookings = bookings
    .filter(b => b.customerPhone === customerPhone)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Key metrics
  const totalMatches = customerBookings.length;
  const totalHours = customerBookings.reduce((sum, b) => sum + (b.duration || 1), 0);
  const totalSpend = customerBookings.reduce((sum, b) => {
    return sum + (b.paymentStatus === 'Paid' ? (b.paidAmount || b.price) : (b.paidAmount || 0));
  }, 0);
  const totalPending = customerBookings.reduce((sum, b) => {
    return sum + (b.paymentStatus !== 'Paid' ? ((b.price || 0) - (b.paidAmount || 0)) : 0);
  }, 0);

  const favoriteCourt = customerBookings.length > 0
    ? Object.entries(customerBookings.reduce((acc, b) => {
        acc[b.courtName] = (acc[b.courtName] || 0) + 1;
        return acc;
      }, {})).sort((a, b) => b[1] - a[1])[0][0]
    : 'None yet';

  const memberSince = joiningDate || createdAt || null;

  // Membership badge mapping
  const getMembershipBadge = (type) => {
    switch (type) {
      case 'Walk-in': return 'bg-zinc-100 text-zinc-700 border-zinc-200';
      case 'Regular': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Monthly': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Annual': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'VIP': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const getSkillBadge = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-green-50 text-green-700 border-green-200';
      case 'Intermediate': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Advanced': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Pro': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-zinc-50 text-zinc-700 border-zinc-200';
    }
  };

  const checkBirthdayNear = (dobString) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    
    const today = new Date();
    // Use current year to check distance
    const thisYearBday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    
    // Check diff in days
    const diffTime = thisYearBday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= -7 && diffDays <= 7) {
      return {
        isUpcoming: diffDays > 0,
        isToday: diffDays === 0,
        days: Math.abs(diffDays),
        dateFormatted: dob.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        ageWillBe: today.getFullYear() - dob.getFullYear()
      };
    }
    return null;
  };

  const birthdayInfo = checkBirthdayNear(dateOfBirth);

  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const ageDifMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const InfoItem = ({ label, value, icon: Icon }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    return (
      <div className="flex items-start gap-3">
        {Icon && <Icon className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />}
        <div>
          <div className="text-xs font-medium text-zinc-500 mb-0.5">{label}</div>
          <div className="text-sm text-zinc-900 font-medium">{value}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header Section */}
        <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 pt-10 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start justify-between mb-2">
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider flex items-center gap-1 w-fit ${getMembershipBadge(membershipType)}`}>
              {membershipType === 'VIP' && <Star className="w-3 h-3 fill-current" />}
              {membershipType || 'Walk-in'}
            </div>
            
            {status && (
              <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-500/20 text-zinc-400'}`}>
                {status}
              </div>
            )}
          </div>
          
          <h2 className="text-3xl font-black mb-2 truncate">{customerName}</h2>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-300">
            <div className="flex items-center gap-1.5 font-medium">
              <Phone className="w-4 h-4" />
              +91 {customerPhone}
            </div>
            {email && (
              <div className="flex items-center gap-1.5 truncate">
                <Mail className="w-4 h-4" />
                {email}
              </div>
            )}
            {(area || address) && (
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-4 h-4" />
                {area || address}
              </div>
            )}
          </div>
          
          {memberSince && (
            <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center gap-2 text-xs text-zinc-400 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              Member since {new Date(memberSince).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 p-4 bg-zinc-50 border-b border-zinc-100 shrink-0">
          <button 
            onClick={() => openWhatsAppShare(customerPhone, `Hi ${customerName}, greeting from Panda Sports Academy!`)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-sm font-bold transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            WhatsApp
          </button>
          <a 
            href={`tel:+91${customerPhone}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-xl text-sm font-bold transition-colors"
          >
            <Phone className="w-4 h-4" />
            Call
          </a>
          {onBookForPlayer && (
            <button 
              onClick={() => {
                onClose();
                onBookForPlayer(customer);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#d33638] hover:bg-[#b02d2f] text-white rounded-xl text-sm font-bold transition-colors shadow-sm shadow-red-900/20"
            >
              <Plus className="w-4 h-4" />
              Book Slot
            </button>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Birthday Alert */}
          {birthdayInfo && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <div className="bg-amber-100 p-2 rounded-xl shrink-0">
                <Cake className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-800 mb-0.5">
                  {birthdayInfo.isToday ? "It's their birthday today! 🎉" : `Birthday on ${birthdayInfo.dateFormatted}`}
                </h4>
                <p className="text-xs text-amber-700 font-medium">
                  {birthdayInfo.isToday ? `Turning ${birthdayInfo.ageWillBe}. Send them your best wishes!` : `${birthdayInfo.isUpcoming ? 'Turning' : 'Turned'} ${birthdayInfo.ageWillBe} ${birthdayInfo.isUpcoming ? 'in ' + birthdayInfo.days + ' days' : birthdayInfo.days + ' days ago'}.`}
                </p>
              </div>
              <button 
                onClick={() => openWhatsAppShare(customerPhone, `Happy Birthday ${customerName}! 🎂 Wishing you a fantastic year ahead from all of us at Panda Sports Academy! 🏸`)}
                className="ml-auto px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Send Wish
              </button>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <Award className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Matches</span>
              </div>
              <div className="text-2xl font-black text-zinc-900">{totalMatches}</div>
            </div>
            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Hours</span>
              </div>
              <div className="text-2xl font-black text-zinc-900">{totalHours}</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <Banknote className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Spend</span>
              </div>
              <div className="text-2xl font-black text-emerald-700">₹{totalSpend}</div>
            </div>
            <div className={`border rounded-2xl p-4 ${totalPending > 0 ? 'bg-red-50 border-red-100' : 'bg-zinc-50 border-zinc-100'}`}>
              <div className={`flex items-center gap-2 mb-2 ${totalPending > 0 ? 'text-red-600' : 'text-zinc-500'}`}>
                <Banknote className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Due</span>
              </div>
              <div className={`text-2xl font-black ${totalPending > 0 ? 'text-red-700' : 'text-zinc-900'}`}>
                ₹{totalPending}
              </div>
            </div>
          </div>

          {/* Player Preferences Section */}
          {(preferredTime || preferredService || (preferredSports && preferredSports.length > 0) || skillLevel || playFrequency || (preferredDays && preferredDays.length > 0) || preferredCourt) && (
            <div>
              <h3 className="text-sm font-bold text-zinc-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                <TargetIcon className="w-4 h-4 text-zinc-400" /> Player Preferences
              </h3>
              <div className="flex flex-wrap gap-2">
                {preferredTime && (
                  <div className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    {preferredTime === 'Morning' ? '🌅' : '🌆'} {preferredTime}
                  </div>
                )}
                {preferredService && (
                  <div className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    {preferredService === 'Court Booking' ? '🏸' : '👥'} {preferredService}
                  </div>
                )}
                {skillLevel && (
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${getSkillBadge(skillLevel)}`}>
                    <Award className="w-3.5 h-3.5" />
                    {skillLevel}
                  </div>
                )}
                {preferredSports?.map(sport => (
                  <div key={sport} className="px-3 py-1.5 bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-xl text-xs font-bold">
                    {sport}
                  </div>
                ))}
                {preferredDays?.map(day => (
                  <div key={day} className="px-3 py-1.5 bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-xl text-xs font-bold">
                    {day}
                  </div>
                ))}
                {playFrequency && (
                  <div className="px-3 py-1.5 bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-xl text-xs font-bold">
                    {playFrequency}
                  </div>
                )}
                {preferredCourt && (
                  <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {preferredCourt}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Personal & Background Section */}
          {(dateOfBirth || gender || bloodGroup || occupation || company || (interests && interests.length > 0) || referredBy || emergencyContactName) && (
            <div>
              <h3 className="text-sm font-bold text-zinc-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-400" /> Background Info
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <InfoItem 
                  label="Date of Birth" 
                  value={dateOfBirth ? `${new Date(dateOfBirth).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} ${calculateAge(dateOfBirth) ? `(${calculateAge(dateOfBirth)} yrs)` : ''}` : null} 
                  icon={Calendar} 
                />
                <InfoItem label="Gender" value={gender} icon={User} />
                <InfoItem label="Blood Group" value={bloodGroup} icon={Heart} />
                <InfoItem label="Occupation" value={occupation} icon={Briefcase} />
                <InfoItem label="Company" value={company} icon={Briefcase} />
                <InfoItem label="Referred By" value={referredBy} icon={User} />
                
                {(emergencyContactName || emergencyContactPhone) && (
                  <div className="col-span-2 pt-3 mt-1 border-t border-zinc-200 flex items-start gap-3">
                    <Shield className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-red-500 mb-0.5">Emergency Contact</div>
                      <div className="text-sm text-zinc-900 font-medium">
                        {emergencyContactName} {emergencyContactPhone ? `• ${emergencyContactPhone}` : ''}
                      </div>
                    </div>
                  </div>
                )}
                
                {interests && interests.length > 0 && (
                  <div className="col-span-2 pt-3 mt-1 border-t border-zinc-200">
                    <div className="text-xs font-medium text-zinc-500 mb-2">Interests</div>
                    <div className="flex flex-wrap gap-1.5">
                      {interests.map(interest => (
                        <span key={interest} className="px-2 py-1 bg-white border border-zinc-200 text-zinc-600 rounded-lg text-[10px] font-bold">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Favorite Court */}
          {favoriteCourt !== 'None yet' && (
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-2xl p-4 flex items-center justify-between text-white shadow-lg">
              <div>
                <p className="text-xs text-zinc-400 font-medium mb-1">Most Played Court</p>
                <p className="text-lg font-black">{favoriteCourt}</p>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
            </div>
          )}

          {/* Recent Bookings */}
          <div>
            <h3 className="text-sm font-bold text-zinc-900 mb-4 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-400" /> Recent Bookings
            </h3>
            
            <div className="space-y-3">
              {customerBookings.slice(0, 5).map((booking, idx) => (
                <div key={idx} className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm hover:border-zinc-300 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-zinc-900 text-sm">{booking.courtName}</h4>
                      <p className="text-xs text-zinc-500 font-medium mt-0.5">
                        {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1
                      ${booking.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                        booking.paymentStatus === 'Partial' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                        'bg-red-50 text-red-700 border border-red-200'}`}>
                      {booking.paymentStatus === 'Paid' && <CheckCircle2 className="w-3 h-3" />}
                      {booking.paymentStatus}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs font-medium">
                    <div className="flex gap-3 text-zinc-600">
                      <span className="flex items-center gap-1 bg-zinc-100 px-2 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5" />
                        {booking.startTime} ({booking.duration} hr)
                      </span>
                    </div>
                    <div className="text-sm font-black text-zinc-900">
                      ₹{booking.price}
                    </div>
                  </div>
                </div>
              ))}

              {customerBookings.length === 0 && (
                <div className="text-center py-8 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <Calendar className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-zinc-500">No bookings yet</p>
                  <p className="text-xs text-zinc-400 mt-1">Book their first slot!</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Just an icon to use for Player Preferences since we used TargetIcon
const TargetIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
