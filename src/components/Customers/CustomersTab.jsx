import React, { useState, useMemo } from 'react';
import { 
  Users, UserPlus, Search, Phone, MessageSquare, Calendar, Award, 
  DollarSign, Clock, Edit, Trash2, ExternalLink, ChevronRight, 
  CheckCircle2, AlertCircle, Ticket, Wallet, Download, Sunrise, 
  MapPin, Star
} from 'lucide-react';

const CustomersTab = ({
  customers = [],
  bookings = [],
  students = [],
  onOpenAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onBookForCustomer,
  onEnrollCustomer,
  onOpenWalletTopup,
  onViewCRM
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const enrichedCustomers = useMemo(() => {
    return customers.map(cust => {
      const custBookings = bookings.filter(b => 
        (b.playerPhone && b.playerPhone === cust.phone) || 
        (b.playerName && b.playerName === cust.name)
      );

      const totalMatches = custBookings.length;
      const totalHours = custBookings.reduce((sum, b) => sum + (Number(b.duration) || 0), 0);
      const totalSpend = custBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0) + (Number(cust.totalSpend) || 0);
      const totalPendingDue = custBookings.reduce((sum, b) => sum + (Number(b.pendingAmount) || 0), 0);

      const courtCounts = {};
      custBookings.forEach(b => {
        if (b.court) {
          courtCounts[b.court] = (courtCounts[b.court] || 0) + 1;
        }
      });
      const favoriteCourt = Object.keys(courtCounts).length > 0 
        ? Object.keys(courtCounts).reduce((a, b) => courtCounts[a] > courtCounts[b] ? a : b) 
        : '-';

      const custStudents = students.filter(s => 
        (s.parentPhone && s.parentPhone === cust.phone) || 
        (s.parentName && s.parentName === cust.name)
      );
      
      const enrollmentsCount = custStudents.length;
      const enrolledPrograms = [...new Set(custStudents.map(s => s.program))].filter(Boolean);

      const isCourtPlayer = totalMatches > 0;
      const isAcademyStudent = enrollmentsCount > 0;

      return {
        ...cust,
        totalMatches,
        totalHours,
        totalSpend,
        totalPendingDue,
        favoriteCourt,
        isCourtPlayer,
        isAcademyStudent,
        enrollmentsCount,
        enrolledPrograms,
      };
    }).sort((a, b) => b.totalSpend - a.totalSpend);
  }, [customers, bookings, students]);

  const filteredCustomers = useMemo(() => {
    return enrichedCustomers.filter(cust => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        cust.name?.toLowerCase().includes(search) || 
        cust.phone?.toLowerCase().includes(search) ||
        cust.area?.toLowerCase().includes(search) ||
        cust.email?.toLowerCase().includes(search) ||
        cust.occupation?.toLowerCase().includes(search) ||
        cust.membershipType?.toLowerCase().includes(search);

      if (!matchesSearch) return false;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Determine if active: isActive !== false and (created recently or has some activity)
      // For simplicity, we just use isActive flag if present, else assume active
      const isActive = cust.isActive !== false;
      
      switch (activeTab) {
        case 'Court Players': return cust.isCourtPlayer;
        case 'Academy': return cust.isAcademyStudent;
        case 'Morning': return cust.preferredTime === 'Morning' || cust.preferredTime === 'Both';
        case 'Evening': return cust.preferredTime === 'Evening' || cust.preferredTime === 'Both';
        case 'Active': return isActive;
        case 'Inactive': return !isActive;
        case 'All':
        default: return true;
      }
    });
  }, [enrichedCustomers, searchTerm, activeTab]);

  const handleExportCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Area', 'Preferred Time', 'Service', 'Membership', 'Occupation', 'Total Spend', 'Total Hours', 'Status'];
    
    const csvRows = filteredCustomers.map(cust => {
      const services = [];
      if (cust.isCourtPlayer) services.push('Court');
      if (cust.isAcademyStudent) services.push('Academy');
      
      return [
        `"${cust.name || ''}"`,
        `"${cust.phone || ''}"`,
        `"${cust.email || ''}"`,
        `"${cust.area || ''}"`,
        `"${cust.preferredTime || ''}"`,
        `"${services.join(', ')}"`,
        `"${cust.membershipType || 'Walk-in'}"`,
        `"${cust.occupation || ''}"`,
        cust.totalSpend || 0,
        cust.totalHours || 0,
        cust.isActive !== false ? 'Active' : 'Inactive'
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `panda_customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMembershipBadge = (type) => {
    switch (type) {
      case 'Regular': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Monthly': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Annual': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'VIP': return 'bg-[#d33638]/10 text-[#d33638] border-[#d33638]/20';
      case 'Walk-in':
      default: return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    }
  };

  const getPreferredTimeBadge = (time) => {
    switch (time) {
      case 'Morning': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Evening': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Both': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Flexible':
      default: return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    }
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const newThisMonthCount = enrichedCustomers.filter(c => {
    if (!c.createdAt) return false;
    const d = new Date(c.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;
  
  const morningPlayersCount = enrichedCustomers.filter(c => c.preferredTime === 'Morning' || c.preferredTime === 'Both').length;

  const kpis = [
    { label: 'Total Registered', value: enrichedCustomers.length, icon: Users, color: '#d33638', bg: 'bg-[#d33638]/10' },
    { label: 'Court Players', value: enrichedCustomers.filter(c => c.isCourtPlayer).length, icon: Calendar, color: '#3b82f6', bg: 'bg-blue-100' },
    { label: 'Academy Members', value: enrichedCustomers.filter(c => c.isAcademyStudent).length, icon: Award, color: '#10b981', bg: 'bg-emerald-100' },
    { label: 'Total Spend', value: `₹${enrichedCustomers.reduce((sum, c) => sum + c.totalSpend, 0).toLocaleString()}`, icon: DollarSign, color: '#10b981', bg: 'bg-emerald-100' },
    { label: 'Morning Players', value: morningPlayersCount, icon: Sunrise, color: '#f59e0b', bg: 'bg-amber-100' },
    { label: 'New This Month', value: newThisMonthCount, icon: UserPlus, color: '#a855f7', bg: 'bg-purple-100' },
  ];

  const tabs = [
    { id: 'All', label: 'All', count: enrichedCustomers.length },
    { id: 'Court Players', label: 'Court Players', count: enrichedCustomers.filter(c => c.isCourtPlayer).length },
    { id: 'Academy', label: 'Academy', count: enrichedCustomers.filter(c => c.isAcademyStudent).length },
    { id: 'Morning', label: 'Morning', count: morningPlayersCount },
    { id: 'Evening', label: 'Evening', count: enrichedCustomers.filter(c => c.preferredTime === 'Evening' || c.preferredTime === 'Both').length },
    { id: 'Active', label: 'Active', count: enrichedCustomers.filter(c => c.isActive !== false).length },
    { id: 'Inactive', label: 'Inactive', count: enrichedCustomers.filter(c => c.isActive === false).length },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-zinc-900">Customer Directory</h2>
          <p className="text-xs font-medium text-zinc-500 mt-1">Manage players, students, and memberships</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search name, phone, area, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#d33638]/20 focus:border-[#d33638] transition-all"
            />
          </div>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-black text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download CSV</span>
          </button>
          <button 
            onClick={onOpenAddCustomer}
            className="flex items-center gap-2 bg-[#d33638] hover:bg-[#b0292b] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm shadow-[#d33638]/20 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Customer</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center shrink-0`}>
              <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{kpi.label}</p>
              <h3 className="text-xl font-black text-zinc-900">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide whitespace-nowrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2
              ${activeTab === tab.id 
                ? 'bg-zinc-900 text-white shadow-sm' 
                : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
              }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-200">
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider w-[220px]">Customer</th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Time & Membership</th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Service</th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Court Hours</th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Pass / Wallet</th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right">Spend</th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                        <Users className="w-6 h-6 text-zinc-400" />
                      </div>
                      <p className="text-sm font-bold text-zinc-900">No customers found</p>
                      <p className="text-xs text-zinc-500 mt-1">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center shrink-0 border border-zinc-200/50">
                          <span className="text-sm font-black text-zinc-600">
                            {cust.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-zinc-900">{cust.name}</span>
                            {cust.membershipType === 'VIP' && (
                              <Star className="w-3.5 h-3.5 text-[#d33638] fill-[#d33638]" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-zinc-500">
                            <Phone className="w-3 h-3" />
                            {cust.phone}
                          </div>
                          {cust.area && (
                            <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-zinc-400">
                              <MapPin className="w-3 h-3" />
                              {cust.area}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-2 items-start">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${getPreferredTimeBadge(cust.preferredTime)}`}>
                          <Clock className="w-3 h-3" />
                          {cust.preferredTime || 'Flexible'}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${getMembershipBadge(cust.membershipType)}`}>
                          <Award className="w-3 h-3" />
                          {cust.membershipType || 'Walk-in'}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        {cust.isCourtPlayer && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg w-fit border border-blue-200">
                            <Calendar className="w-3.5 h-3.5" />
                            Court Player
                          </div>
                        )}
                        {cust.isAcademyStudent && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg w-fit border border-emerald-200">
                            <Award className="w-3.5 h-3.5" />
                            Academy
                          </div>
                        )}
                        {!cust.isCourtPlayer && !cust.isAcademyStudent && (
                          <span className="text-xs font-medium text-zinc-400">-</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs font-bold text-zinc-700">{cust.totalHours} hrs</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-2">
                        {Number(cust.prepaidHours) > 0 ? (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                            <Ticket className="w-3.5 h-3.5" />
                            {cust.prepaidHours}h Pass
                          </div>
                        ) : (
                          <span className="text-[11px] font-medium text-zinc-400">No active pass</span>
                        )}
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-700">
                          <Wallet className="w-3.5 h-3.5 text-zinc-400" />
                          ₹{Number(cust.walletBalance || 0).toLocaleString()}
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-bold text-zinc-900">₹{cust.totalSpend.toLocaleString()}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onBookForCustomer && onBookForCustomer(cust)}
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-black text-white text-[11px] font-bold rounded-lg transition-colors"
                        >
                          Book
                        </button>
                        <button
                          onClick={() => onOpenWalletTopup && onOpenWalletTopup(cust)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold rounded-lg transition-colors"
                        >
                          Top-Up
                        </button>
                        <a 
                          href={`https://wa.me/91${cust.phone}?text=Hi%20${cust.name},%20Greetings%20from%20Panda%20Sports%20Academy!`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-lg transition-colors"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => onViewCRM && onViewCRM(cust)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
                          title="CRM Profile"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditCustomer && onEditCustomer(cust)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${cust.name}?`)) {
                              onDeleteCustomer && onDeleteCustomer(cust.id, cust.name);
                            }
                          }}
                          className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="bg-zinc-50 border-t border-zinc-200 p-4 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-zinc-500">
            Showing <span className="text-zinc-900">{filteredCustomers.length}</span> of <span className="text-zinc-900">{enrichedCustomers.length}</span> customers
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomersTab;
