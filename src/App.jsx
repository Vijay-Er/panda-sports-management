import React, { useState, useEffect, useMemo } from 'react';
import { DEFAULT_BEVERAGES } from './constants/resources';
import { loadFromStorage, saveToStorage } from './utils/storage';
import { playAlertSound, playConfirmationBeep, unlockAudio } from './utils/audio';
import { getLocalYYYYMMDD } from './utils/slots';
import { 
  getActiveSession, 
  setActiveSession, 
  clearActiveSession, 
  getStoredUsers, 
  toggleUserStatus, 
  deleteStoredUser 
} from './utils/authStorage';

import LoginScreen from './components/Auth/LoginScreen';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import Toast from './components/Toast';
import AlertsBanner from './components/AlertsBanner';

import DashboardTab from './components/Dashboard/DashboardTab';
import BookingsTab from './components/Bookings/BookingsTab';
import BookingModal from './components/Bookings/BookingModal';
import ClassesTab from './components/Classes/ClassesTab';
import CustomersTab from './components/Customers/CustomersTab';
import CustomerModal from './components/Customers/CustomerModal';
import WalletTopupModal from './components/Customers/WalletTopupModal';
import CustomerProfileModal from './components/Customers/CustomerProfileModal';
import BeveragesTab from './components/Beverages/BeveragesTab';
import BeverageModal from './components/Beverages/BeverageModal';
import AccountsTab from './components/Accounts/AccountsTab';
import ExpenseModal from './components/Accounts/ExpenseModal';
import SettleModal from './components/Accounts/SettleModal';
import AdminsTab from './components/Admins/AdminsTab';
import TournamentsTab from './components/Tournaments/TournamentsTab';

import { 
  DEFAULT_ACADEMY_CATEGORIES,
  INITIAL_BATCHES, 
  INITIAL_STUDENTS, 
  INITIAL_SHIFT_HANDOVERS 
} from './constants/classes';
import { INITIAL_CUSTOMERS } from './constants/customers';
import { INITIAL_TOURNAMENTS } from './constants/tournaments';

// Initial starter seed data if storage is fresh
const INITIAL_TRANSACTIONS = [
  {
    id: 1725530000001,
    type: 'income',
    amount: 800,
    category: 'Court Booking',
    paymentMode: 'cash',
    description: 'Court 1 (Premium) - Rahul Team (Today)',
    createdBy: 'Academy Director',
    date: new Date().toISOString()
  },
  {
    id: 1725530000002,
    type: 'income',
    amount: 50,
    category: 'Beverage',
    paymentMode: 'upi',
    description: 'Sold 1x Protein Bar',
    createdBy: 'Staff Manager',
    date: new Date().toISOString()
  },
  {
    id: 1725530000003,
    type: 'income',
    amount: 60,
    category: 'Beverage',
    paymentMode: 'cash',
    description: 'Sold 1x Lemon Drink',
    createdBy: 'Staff Manager',
    date: new Date().toISOString()
  }
];

// Helper to create starter bookings including one ending in ~12 mins to demonstrate alarm
const getInitialBookings = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');

  // Active game ending in 12 minutes from now
  const gameStart = new Date(now.getTime() - 48 * 60000);
  const gameEnd = new Date(now.getTime() + 12 * 60000);

  const startTimeStr = `${pad(gameStart.getHours())}:${pad(gameStart.getMinutes())}`;
  const endTimeStr = `${pad(gameEnd.getHours())}:${pad(gameEnd.getMinutes())}`;

  return [
    {
      id: 1725530000101,
      serviceType: 'court',
      resourceId: 'court-1',
      resourceName: 'Court 1 (Premium)',
      customerName: 'Rahul Team (Ending Soon)',
      startTime: startTimeStr,
      endTime: endTimeStr,
      duration: '60',
      date: getLocalYYYYMMDD(now),
      comments: 'Active game ending in 12 mins - triggers sound alarm',
      status: 'active',
      createdBy: 'Academy Director',
      alerted: false
    },
    {
      id: 1725530000102,
      serviceType: 'court',
      resourceId: 'court-2',
      resourceName: 'Court 2 (Standard)',
      customerName: 'Sanjay & Friends (Group Match)',
      startTime: '16:00',
      endTime: '17:30',
      duration: '90',
      date: getLocalYYYYMMDD(now),
      comments: 'Completed group match',
      status: 'finished',
      createdBy: 'Staff Manager',
      alerted: false
    }
  ];
};

export default function App() {
  // Authentication & Users State
  const [currentUser, setCurrentUser] = useState(() => getActiveSession());
  const [users, setUsers] = useState(() => getStoredUsers());

  const [activeTab, setActiveTab] = useState('dashboard');

  // Persistent State with LocalStorage
  const [transactions, setTransactions] = useState(() => 
    loadFromStorage('transactions', INITIAL_TRANSACTIONS)
  );
  const [bookings, setBookings] = useState(() => 
    loadFromStorage('bookings', getInitialBookings())
  );
  const [beverages, setBeverages] = useState(() => 
    loadFromStorage('beverages', DEFAULT_BEVERAGES)
  );
  const [soundEnabled, setSoundEnabled] = useState(() => 
    loadFromStorage('soundEnabled', true)
  );

  // Batches, Students, Academy Categories & Shift Handovers State
  const [academyCategories, setAcademyCategories] = useState(() => 
    loadFromStorage('academy_categories', DEFAULT_ACADEMY_CATEGORIES)
  );
  const [batches, setBatches] = useState(() => 
    loadFromStorage('batches', INITIAL_BATCHES)
  );
  const [students, setStudents] = useState(() => 
    loadFromStorage('students', INITIAL_STUDENTS)
  );
  const [shiftHandovers, setShiftHandovers] = useState(() => 
    loadFromStorage('shift_handovers', INITIAL_SHIFT_HANDOVERS)
  );

  // Centralized Customers State (Shared across Court Bookings, Group Matches & Academy Classes)
  const [customers, setCustomers] = useState(() => 
    loadFromStorage('customers', INITIAL_CUSTOMERS)
  );
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [prefilledCustomerForBooking, setPrefilledCustomerForBooking] = useState(null);
  const [prefilledCustomerForEnrollment, setPrefilledCustomerForEnrollment] = useState(null);
  const [selectedCustomerForWallet, setSelectedCustomerForWallet] = useState(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Tournaments & Box Leagues State
  const [tournaments, setTournaments] = useState(() => 
    loadFromStorage('tournaments', INITIAL_TOURNAMENTS)
  );

  // CRM Customer Profile Modal State
  const [selectedCustomerForCRM, setSelectedCustomerForCRM] = useState(null);

  // Sync to LocalStorage on changes
  useEffect(() => {
    saveToStorage('transactions', transactions);
  }, [transactions]);

  useEffect(() => {
    saveToStorage('bookings', bookings);
  }, [bookings]);

  useEffect(() => {
    saveToStorage('beverages', beverages);
  }, [beverages]);

  useEffect(() => {
    saveToStorage('soundEnabled', soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    saveToStorage('academy_categories', academyCategories);
  }, [academyCategories]);

  useEffect(() => {
    saveToStorage('batches', batches);
  }, [batches]);

  useEffect(() => {
    saveToStorage('students', students);
  }, [students]);

  useEffect(() => {
    saveToStorage('shift_handovers', shiftHandovers);
  }, [shiftHandovers]);

  useEffect(() => {
    saveToStorage('customers', customers);
  }, [customers]);

  useEffect(() => {
    saveToStorage('tournaments', tournaments);
  }, [tournaments]);

  // If activeTab is 'admins' but currentUser is not super_admin, switch back to dashboard
  useEffect(() => {
    if (activeTab === 'admins' && currentUser?.role !== 'super_admin') {
      setActiveTab('dashboard');
    }
  }, [activeTab, currentUser]);

  // Dashboard Filters
  const [dateFilter, setDateFilter] = useState({ 
    start: getLocalYYYYMMDD(), 
    end: getLocalYYYYMMDD() 
  });
  const [statusFilter, setStatusFilter] = useState('all');

  // Notifications & Live Alerts
  const [alerts, setAlerts] = useState([]);
  const [toast, setToast] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Quick Sell Mode
  const [quickSellMode, setQuickSellMode] = useState('cash');

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingModalServiceType, setBookingModalServiceType] = useState('court');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isAddBeverageModalOpen, setIsAddBeverageModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);

  // Sound Handlers
  const handleToggleSound = (enabled) => {
    setSoundEnabled(enabled);
    if (enabled) {
      unlockAudio();
      playConfirmationBeep();
      showToast('Sound alerts enabled (Chime active).');
    } else {
      showToast('Sound alerts muted.');
    }
  };

  const handleTestSound = () => {
    unlockAudio();
    playAlertSound(true);
    showToast('🔔 Playing court ending alarm chime...');
  };

  // Timer: Check finished bookings and 15-minute countdown alerts every 10 seconds
  useEffect(() => {
    const checkTimers = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      const todayStr = getLocalYYYYMMDD(now);

      setBookings(prevBookings => {
        let alertsTriggered = false;
        const newAlerts = [];
        let stateChanged = false;

        const updated = prevBookings.map(b => {
          if (b.status === 'canceled') return b;

          const [endH, endM] = b.endTime.split(':').map(Number);
          const endTimeDate = new Date();
          endTimeDate.setHours(endH, endM, 0, 0);

          // Auto-mark as finished if slot has elapsed today
          if (b.date === todayStr && now >= endTimeDate && b.status !== 'finished') {
            stateChanged = true;
            return { ...b, status: 'finished' };
          }

          // 15-min warning alert for today's active games
          if (b.date === todayStr && b.status === 'active' && !b.alerted) {
            const diffMs = endTimeDate - now;
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins > 0 && diffMins <= 15) {
              alertsTriggered = true;
              newAlerts.push(`${b.resourceName} (${b.customerName}) ends in ${diffMins} mins!`);
              stateChanged = true;
              return { ...b, alerted: true };
            }
          }
          return b;
        });

        if (alertsTriggered) {
          playAlertSound(soundEnabled);
          setAlerts(prev => [...prev, ...newAlerts]);
        }

        return stateChanged ? updated : prevBookings;
      });
    }, 10000);

    return () => clearInterval(checkTimers);
  }, [soundEnabled]);

  // Periodic alert beeper when warnings are active
  useEffect(() => {
    let beepInterval;
    if (alerts.length > 0 && soundEnabled) {
      beepInterval = setInterval(() => playAlertSound(soundEnabled), 4000);
    }
    return () => clearInterval(beepInterval);
  }, [alerts, soundEnabled]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Auth Handlers
  const handleLoginSuccess = (user) => {
    unlockAudio();
    setCurrentUser(user);
    showToast(`Welcome back, ${user.name}! (${user.role === 'super_admin' ? 'Super Admin' : 'Staff Admin'})`);
  };

  const handleLogout = () => {
    clearActiveSession();
    setCurrentUser(null);
    showToast('Logged out successfully.');
  };

  const handleAdminCreated = (newAdmin, updatedUsers) => {
    setUsers(updatedUsers);
    showToast(`Admin account for ${newAdmin.name} created!`);
  };

  const handleToggleStatus = (userId) => {
    const updated = toggleUserStatus(userId);
    setUsers(updated);
    showToast('Admin account status updated.');
  };

  const handleDeleteAdmin = (userId, name) => {
    if (window.confirm(`Are you sure you want to permanently delete the admin account for ${name}?`)) {
      const res = deleteStoredUser(userId, currentUser?.id);
      if (res.success) {
        setUsers(res.updatedUsers);
        showToast(`Account for ${name} removed.`);
      } else {
        alert(res.error);
      }
    }
  };

  // Accounts Balances & Beverage Breakdown
  const accounts = useMemo(() => {
    let cash = 0;
    let upi = 0;
    let turftown = 0;
    const beveragesBreakdown = {};

    transactions.forEach(t => {
      const amount = Number(t.amount) || 0;
      const modifier = t.type === 'income' ? 1 : -1;

      if (t.paymentMode === 'cash') cash += amount * modifier;
      if (t.paymentMode === 'upi') upi += amount * modifier;
      if (t.paymentMode === 'turftown') turftown += amount * modifier;

      if (t.category === 'Beverage' && t.type === 'income') {
        const match = t.description.match(/Sold 1x (.+)/);
        const name = match ? match[1] : 'Other';
        beveragesBreakdown[name] = (beveragesBreakdown[name] || 0) + amount;
      }
    });

    return {
      cash,
      upi,
      turftown,
      total: cash + upi + turftown,
      beveragesBreakdown
    };
  }, [transactions]);

  // Handlers
  const handleOpenBookingModal = (serviceType = 'court') => {
    unlockAudio();
    setBookingModalServiceType(serviceType);
    setIsBookingModalOpen(true);
  };

  const handleAddBooking = (newBooking, createdTransactions) => {
    const enrichedBooking = {
      ...newBooking,
      createdBy: currentUser?.name || 'Staff'
    };

    const enrichedTransactions = (createdTransactions || []).map(t => ({
      ...t,
      createdBy: currentUser?.name || 'Staff'
    }));

    if (enrichedTransactions.length > 0) {
      setTransactions(prev => [...enrichedTransactions, ...prev]);
    }
    setBookings(prev => [enrichedBooking, ...prev]);

    // AUTO-SAVE TO CUSTOMER DIRECTORY (PRIMARY USE CASE)
    // 1st booking immediately adds user to shared directory across all services
    const cleanPhone = (newBooking.customerPhone || '').replace(/\D/g, '').slice(-10);
    const rawName = (newBooking.customerName || '').trim();

    if (rawName) {
      setCustomers(prevCustomers => {
        const existingIndex = prevCustomers.findIndex(c => {
          if (cleanPhone && c.phone) {
            return c.phone.replace(/\D/g, '').slice(-10) === cleanPhone;
          }
          return c.name.toLowerCase() === rawName.toLowerCase();
        });

        const paid = Number(newBooking.paidAmount) || Number(newBooking.totalPrice) || 0;
        const pending = Number(newBooking.pendingBalance) || 0;
        const durHours = (parseFloat(newBooking.duration) || 60) / 60;

        if (existingIndex >= 0) {
          const existing = prevCustomers[existingIndex];
          const services = existing.enrolledServices || [];
          const updatedServices = services.includes('Badminton / Pickleball Court') 
            ? services 
            : [...services, 'Badminton / Pickleball Court'];

          const walletDed = Number(newBooking.walletDeducted) || 0;
          const passDed = Number(newBooking.passHoursDeducted) || 0;

          const updatedList = [...prevCustomers];
          updatedList[existingIndex] = {
            ...existing,
            enrolledServices: updatedServices,
            totalSpend: (existing.totalSpend || 0) + paid,
            pendingDues: (existing.pendingDues || 0) + pending,
            courtHours: Number(((existing.courtHours || 0) + durHours).toFixed(1)),
            walletBalance: Math.max(0, (existing.walletBalance || 0) - walletDed),
            passHours: Math.max(0, Number(((existing.passHours || 0) - passDed).toFixed(1))),
            favoriteCourt: newBooking.resourceName || existing.favoriteCourt,
            lastVisit: newBooking.date || getLocalYYYYMMDD()
          };
          return updatedList;
        } else {
          const newCust = {
            id: Date.now(),
            name: rawName,
            phone: cleanPhone ? `+91 ${cleanPhone}` : '',
            enrolledServices: ['Badminton / Pickleball Court'],
            courtHours: Number(durHours.toFixed(1)),
            favoriteCourt: newBooking.resourceName || 'Court 1',
            totalSpend: paid,
            pendingDues: pending,
            notes: 'Auto-registered via Court Booking',
            lastVisit: newBooking.date || getLocalYYYYMMDD(),
            createdAt: new Date().toISOString()
          };
          return [newCust, ...prevCustomers];
        }
      });
    }

    showToast(`Successfully booked ${newBooking.resourceName}!`);
  };

  const handleCancelBooking = (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'canceled' } : b));
      showToast("Booking canceled.");
    }
  };

  const handleSellBeverage = (item) => {
    // Decrement stock
    setBeverages(prev => prev.map(b => b.id === item.id ? {
      ...b,
      stock: Math.max(0, (typeof b.stock === 'number' ? b.stock : 20) - 1)
    } : b));

    const newTransaction = {
      id: Date.now(),
      type: 'income',
      amount: item.price,
      category: 'Beverage',
      paymentMode: quickSellMode,
      description: `Sold 1x ${item.name}`,
      createdBy: currentUser?.name || 'Staff',
      date: new Date().toISOString()
    };
    setTransactions(prev => [newTransaction, ...prev]);
    showToast(`Sold 1x ${item.name} (${quickSellMode.toUpperCase()})`);
  };

  const handleRestockBeverage = (beverageId, quantity) => {
    setBeverages(prev => prev.map(b => b.id === beverageId ? {
      ...b,
      stock: (typeof b.stock === 'number' ? b.stock : 20) + quantity
    } : b));
    showToast(`Restocked +${quantity} units!`);
  };

  const handleAddBeverage = (newItem) => {
    setBeverages(prev => [...prev, newItem]);
    showToast(`Added ${newItem.name} to inventory!`);
  };

  const handleDeleteBeverage = (id) => {
    setBeverages(prev => prev.filter(b => b.id !== id));
    showToast("Product removed from inventory.");
  };

  // Batches, Academy Programs & Categories Handlers
  const handleAddCategory = (newCat) => {
    setAcademyCategories(prev => {
      if (prev.some(c => c.id === newCat.id)) return prev;
      return [...prev, newCat];
    });
    showToast(`Added sport category "${newCat.name}"!`);
  };

  const handleSaveBatch = (batchData) => {
    if (batchData.id) {
      setBatches(prev => prev.map(b => b.id === batchData.id ? { ...b, ...batchData } : b));
      showToast(`Batch "${batchData.name}" updated successfully!`);
    } else {
      const newBatch = {
        ...batchData,
        id: 'batch-' + Date.now(),
        enrolledCount: 0,
        status: 'active'
      };
      setBatches(prev => [...prev, newBatch]);
      showToast(`Created program batch "${batchData.name}"!`);
    }
  };

  const handleDeleteBatch = (batchId) => {
    setBatches(prev => prev.filter(b => b.id !== batchId));
    showToast("Batch removed.");
  };

  const handleEnrollStudent = (studentData) => {
    const newStudent = {
      ...studentData,
      id: 'student-' + Date.now(),
      status: 'active'
    };
    setStudents(prev => [...prev, newStudent]);

    // Increment batch enrolled count
    if (studentData.batchId) {
      setBatches(prev => prev.map(b => b.id === studentData.batchId ? {
        ...b,
        enrolledCount: (b.enrolledCount || 0) + 1
      } : b));
    }

    // Log registration fee as income in financial register
    const feeAmount = Number(studentData.feeAmount) || Number(studentData.monthlyFee) || 0;
    if (feeAmount > 0) {
      const newTx = {
        id: Date.now(),
        type: 'income',
        amount: feeAmount,
        category: 'Academy & Classes',
        paymentMode: studentData.paymentMode || 'upi',
        description: `Enrollment Fee: ${studentData.name} (${studentData.batchName || 'Academy Batch'})`,
        createdBy: currentUser?.name || 'Staff',
        date: new Date().toISOString()
      };
      setTransactions(prev => [newTx, ...prev]);
    }

    // Auto-save/update to centralized customer directory
    const cleanPhone = (studentData.phone || '').replace(/\D/g, '').slice(-10);
    const rawName = (studentData.name || '').trim();

    if (rawName) {
      setCustomers(prevCustomers => {
        const existingIndex = prevCustomers.findIndex(c => {
          if (cleanPhone && c.phone) {
            return c.phone.replace(/\D/g, '').slice(-10) === cleanPhone;
          }
          return c.name.toLowerCase() === rawName.toLowerCase();
        });

        const serviceName = studentData.batchName ? `Academy (${studentData.batchName})` : 'Academy Classes';

        if (existingIndex >= 0) {
          const existing = prevCustomers[existingIndex];
          const services = existing.enrolledServices || [];
          const updatedServices = services.includes(serviceName) ? services : [...services, serviceName];
          const updatedList = [...prevCustomers];
          updatedList[existingIndex] = {
            ...existing,
            enrolledServices: updatedServices,
            totalSpend: (existing.totalSpend || 0) + feeAmount,
            lastVisit: getLocalYYYYMMDD()
          };
          return updatedList;
        } else {
          const newCust = {
            id: Date.now(),
            name: rawName,
            phone: cleanPhone ? `+91 ${cleanPhone}` : '',
            enrolledServices: [serviceName],
            courtHours: 0,
            favoriteCourt: 'N/A',
            totalSpend: feeAmount,
            pendingDues: 0,
            notes: `Enrolled in ${serviceName}`,
            lastVisit: getLocalYYYYMMDD(),
            createdAt: new Date().toISOString()
          };
          return [newCust, ...prevCustomers];
        }
      });
    }

    showToast(`Enrolled ${studentData.name} into ${studentData.batchName}!`);
  };

  // Centralized Customer Directory Handlers
  const handleOpenAddCustomer = () => {
    setCustomerToEdit(null);
    setIsCustomerModalOpen(true);
  };

  const handleEditCustomer = (customer) => {
    setCustomerToEdit(customer);
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = (customerData) => {
    if (customerData.id) {
      setCustomers(prev => prev.map(c => c.id === customerData.id ? { ...c, ...customerData } : c));
      showToast(`Updated customer "${customerData.name}"!`);
    } else {
      const newCustomer = {
        ...customerData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      setCustomers(prev => [newCustomer, ...prev]);
      showToast(`Added "${customerData.name}" to Customer Directory!`);
    }
  };

  const handleDeleteCustomer = (customerId, customerName) => {
    if (window.confirm(`Are you sure you want to remove ${customerName} from the customer directory?`)) {
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      showToast(`Customer ${customerName} removed.`);
    }
  };

  const handleBookForCustomer = (customer) => {
    setPrefilledCustomerForBooking(customer);
    setBookingModalServiceType('court');
    setIsBookingModalOpen(true);
  };

  const handleEnrollCustomer = (customer) => {
    setPrefilledCustomerForEnrollment(customer);
    setActiveTab('classes');
  };

  const handleTopupWallet = (customerId, { addedAmount, addedHours, transaction, packageTitle, chargeAmount }) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          walletBalance: (c.walletBalance || 0) + addedAmount,
          passHours: Number(((c.passHours || 0) + addedHours).toFixed(1)),
          totalSpend: (c.totalSpend || 0) + chargeAmount
        };
      }
      return c;
    }));

    if (transaction) {
      setTransactions(prev => [{ ...transaction, createdBy: currentUser?.name || 'Staff' }, ...prev]);
    }

    showToast(`Successfully added ${packageTitle}!`);
  };

  // Tournament & League Handlers
  const handleSaveTournament = (newTournament, feeTransaction) => {
    setTournaments(prev => [newTournament, ...prev]);
    if (feeTransaction) {
      setTransactions(prev => [{ ...feeTransaction, createdBy: currentUser?.name || 'Staff' }, ...prev]);
    }
    showToast(`Created tournament "${newTournament.name}"!`);
  };

  const handleUpdateMatchScore = (tournamentId, matchId, matchUpdate) => {
    setTournaments(prevTournaments => {
      return prevTournaments.map(t => {
        if (t.id !== tournamentId) return t;

        const updatedMatches = t.matches.map(m => {
          if (m.id === matchId) {
            return { ...m, ...matchUpdate };
          }
          return m;
        });

        const updatedTeams = t.teams.map(team => {
          let played = 0;
          let won = 0;
          let lost = 0;
          let pointsDiff = 0;
          let points = 0;

          updatedMatches.forEach(m => {
            if (m.status === 'completed' && (m.team1 === team.name || m.team2 === team.name)) {
              played++;
              const isTeam1 = m.team1 === team.name;
              const teamScore = isTeam1 ? parseInt(m.score1, 10) : parseInt(m.score2, 10);
              const oppScore = isTeam1 ? parseInt(m.score2, 10) : parseInt(m.score1, 10);

              if (!isNaN(teamScore) && !isNaN(oppScore)) {
                pointsDiff += (teamScore - oppScore);
                if (teamScore > oppScore) {
                  won++;
                  points += 3;
                } else if (teamScore < oppScore) {
                  lost++;
                } else {
                  points += 1;
                }
              }
            }
          });

          return {
            ...team,
            played,
            won,
            lost,
            pointsDiff,
            points
          };
        });

        return {
          ...t,
          teams: updatedTeams,
          matches: updatedMatches
        };
      });
    });

    showToast("Match score updated & standings recalculated!");
  };

  const handleDeleteTournament = (tournamentId) => {
    setTournaments(prev => prev.filter(t => t.id !== tournamentId));
    showToast("Tournament removed.");
  };

  const handleDeleteStudent = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (student && student.batchId) {
      setBatches(prev => prev.map(b => b.id === student.batchId ? {
        ...b,
        enrolledCount: Math.max(0, (b.enrolledCount || 1) - 1)
      } : b));
    }
    setStudents(prev => prev.filter(s => s.id !== studentId));
    showToast("Student removed from batch roster.");
  };

  const handleCollectStudentRenewal = (studentId, paymentMode = 'upi') => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const todayStr = getLocalYYYYMMDD();
    const baseDate = student.nextRenewalDate && student.nextRenewalDate > todayStr 
      ? new Date(student.nextRenewalDate) 
      : new Date();
    baseDate.setDate(baseDate.getDate() + 30);
    const newRenewalDate = getLocalYYYYMMDD(baseDate);

    setStudents(prev => prev.map(s => s.id === studentId ? {
      ...s,
      lastPaymentDate: todayStr,
      nextRenewalDate: newRenewalDate,
      paymentMode
    } : s));

    // Log renewal fee into financial ledger
    const renewalTx = {
      id: Date.now(),
      type: 'income',
      amount: Number(student.monthlyFee),
      category: 'Academy & Classes',
      paymentMode,
      description: `Class Fee Renewal: ${student.name} (${student.batchName})`,
      createdBy: currentUser?.name || 'Staff',
      date: new Date().toISOString()
    };
    setTransactions(prev => [renewalTx, ...prev]);
    showToast(`Collected ₹${student.monthlyFee} renewal for ${student.name}!`);
  };

  const handleAddCoachPayout = (payoutData) => {
    const payoutTx = {
      id: Date.now(),
      type: 'expense',
      amount: parseFloat(payoutData.amount),
      category: 'Expense',
      paymentMode: payoutData.paymentMode || 'cash',
      description: `Coach Payout: ${payoutData.instructorName} (${payoutData.batchName || 'Academy'}) - ${payoutData.payoutType === 'commission' ? 'Per-Student Commission' : 'Monthly Salary'}`,
      createdBy: currentUser?.name || 'Staff',
      date: new Date().toISOString()
    };
    setTransactions(prev => [payoutTx, ...prev]);
    showToast(`Logged coach payout of ₹${payoutData.amount} for ${payoutData.instructorName}!`);
  };

  const handleSaveShiftHandover = (handoverRecord) => {
    setShiftHandovers(prev => [handoverRecord, ...prev]);
    showToast(`Recorded shift handover (${handoverRecord.shiftType === 'day' ? 'Day Shift' : 'Evening Shift'})!`);
  };

  const handleAddExpense = (expenseTransaction) => {
    const enrichedExpense = {
      ...expenseTransaction,
      createdBy: currentUser?.name || 'Staff'
    };
    setTransactions(prev => [enrichedExpense, ...prev]);
    showToast(`Deducted ₹${expenseTransaction.amount} expense.`);
  };

  const handleCollectBalance = (bookingId, collectedAmount, paymentMode) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const newPending = Math.max(0, (booking.pendingBalance || 0) - collectedAmount);
    setBookings(prev => prev.map(b => b.id === bookingId ? {
      ...b,
      pendingBalance: newPending,
      paidAmount: (b.paidAmount || 0) + collectedAmount,
      paymentStatus: newPending === 0 ? 'full' : 'advance'
    } : b));

    const newTx = {
      id: Date.now(),
      type: 'income',
      amount: collectedAmount,
      category: 'Court Booking',
      paymentMode,
      description: `Balance Cleared - ${booking.customerName} (${booking.resourceName})`,
      createdBy: currentUser?.name || 'Staff',
      date: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
    showToast(`Collected ₹${collectedAmount} balance for ${booking.customerName}!`);
  };

  const handleSettleAccounts = () => {
    const settlements = [];
    const nowISO = new Date().toISOString();
    const adminName = currentUser?.name || 'Staff';

    if (accounts.cash > 0) {
      settlements.push({
        id: Date.now() + 1,
        type: 'expense',
        amount: accounts.cash,
        category: 'Settlement',
        paymentMode: 'cash',
        description: 'Cleared Cash to Safe/Bank Register',
        createdBy: adminName,
        date: nowISO
      });
    }

    if (accounts.upi > 0) {
      settlements.push({
        id: Date.now() + 2,
        type: 'expense',
        amount: accounts.upi,
        category: 'Settlement',
        paymentMode: 'upi',
        description: 'Cleared UPI Account Register',
        createdBy: adminName,
        date: nowISO
      });
    }

    if (accounts.turftown > 0) {
      settlements.push({
        id: Date.now() + 3,
        type: 'expense',
        amount: accounts.turftown,
        category: 'Settlement',
        paymentMode: 'turftown',
        description: 'Cleared Turftown Payout Register',
        createdBy: adminName,
        date: nowISO
      });
    }

    if (settlements.length === 0) {
      showToast("Registers are already at ₹0 balance.");
      setIsSettleModalOpen(false);
      return;
    }

    setTransactions(prev => [...settlements, ...prev]);
    setIsSettleModalOpen(false);
    showToast("Register successfully settled to ₹0 balance!");
  };

  // If not logged in, display the Login Screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans text-zinc-900 relative">
      {/* Toast Notification */}
      <Toast toast={toast} />

      {/* 15-Minute Ending Audio/Visual Alerts Banner */}
      <AlertsBanner 
        alerts={alerts} 
        setAlerts={setAlerts}
        onPlaySound={handleTestSound}
      />

      {/* Desktop Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundEnabled={soundEnabled}
        setSoundEnabled={handleToggleSound}
        onTestSound={handleTestSound}
        allAppData={{ transactions, bookings, beverages, batches, students, shiftHandovers, academyCategories, customers, tournaments }}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden print:overflow-visible print:h-auto">
        {/* Mobile Header */}
        <MobileHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          soundEnabled={soundEnabled}
          setSoundEnabled={handleToggleSound}
          onTestSound={handleTestSound}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Dynamic Body Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 print:p-0">
          <div className="max-w-7xl mx-auto pb-20 print:pb-0">
            {activeTab === 'dashboard' && (
              <DashboardTab
                bookings={bookings}
                transactions={transactions}
                accounts={accounts}
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                currentTime={currentTime}
                onCancelBooking={handleCancelBooking}
                onCollectBalance={handleCollectBalance}
                onSelectCustomer={(cust) => setSelectedCustomerForCRM(cust)}
              />
            )}

            {activeTab === 'bookings' && (
              <BookingsTab
                bookings={bookings}
                onOpenBookingModal={handleOpenBookingModal}
                onCancelBooking={handleCancelBooking}
                onCollectBalance={handleCollectBalance}
                onSelectCustomer={(cust) => setSelectedCustomerForCRM(cust)}
              />
            )}

            {activeTab === 'customers' && (
              <CustomersTab
                customers={customers}
                bookings={bookings}
                students={students}
                onOpenAddCustomer={handleOpenAddCustomer}
                onEditCustomer={handleEditCustomer}
                onDeleteCustomer={handleDeleteCustomer}
                onBookForCustomer={handleBookForCustomer}
                onEnrollCustomer={handleEnrollCustomer}
                onOpenWalletTopup={(cust) => {
                  setSelectedCustomerForWallet(cust);
                  setIsWalletModalOpen(true);
                }}
                onViewCRM={(cust) => setSelectedCustomerForCRM(cust)}
              />
            )}

            {activeTab === 'classes' && (
              <ClassesTab
                batches={batches}
                students={students}
                categories={academyCategories}
                onAddCategory={handleAddCategory}
                onSaveBatch={handleSaveBatch}
                onDeleteBatch={handleDeleteBatch}
                onEnrollStudent={handleEnrollStudent}
                onDeleteStudent={handleDeleteStudent}
                onCollectStudentRenewal={handleCollectStudentRenewal}
                onAddCoachPayout={handleAddCoachPayout}
                customers={customers}
                prefilledCustomer={prefilledCustomerForEnrollment}
                onClearPrefilledCustomer={() => setPrefilledCustomerForEnrollment(null)}
              />
            )}

            {activeTab === 'tournaments' && (
              <TournamentsTab
                tournaments={tournaments}
                onSaveTournament={handleSaveTournament}
                onUpdateMatchScore={handleUpdateMatchScore}
                onDeleteTournament={handleDeleteTournament}
              />
            )}

            {activeTab === 'beverages' && (
              <BeveragesTab
                beverages={beverages}
                quickSellMode={quickSellMode}
                setQuickSellMode={setQuickSellMode}
                onSellBeverage={handleSellBeverage}
                onOpenAddModal={() => setIsAddBeverageModalOpen(true)}
                onDeleteBeverage={handleDeleteBeverage}
                onRestockBeverage={handleRestockBeverage}
              />
            )}

            {activeTab === 'accounts' && (
              <AccountsTab
                transactions={transactions}
                accounts={accounts}
                bookings={bookings}
                onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
                onOpenSettleModal={() => setIsSettleModalOpen(true)}
                shiftHandovers={shiftHandovers}
                users={users}
                currentUser={currentUser}
                onSaveHandover={handleSaveShiftHandover}
              />
            )}

            {activeTab === 'admins' && currentUser?.role === 'super_admin' && (
              <AdminsTab
                users={users}
                currentUser={currentUser}
                onAdminCreated={handleAdminCreated}
                onToggleStatus={handleToggleStatus}
                onDeleteAdmin={handleDeleteAdmin}
              />
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setPrefilledCustomerForBooking(null);
        }}
        initialServiceType={bookingModalServiceType}
        bookings={bookings}
        onAddBooking={handleAddBooking}
        customers={customers}
        prefilledCustomer={prefilledCustomerForBooking}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => {
          setIsCustomerModalOpen(false);
          setCustomerToEdit(null);
        }}
        customer={customerToEdit}
        onSaveCustomer={handleSaveCustomer}
      />

      <WalletTopupModal
        isOpen={isWalletModalOpen}
        onClose={() => {
          setIsWalletModalOpen(false);
          setSelectedCustomerForWallet(null);
        }}
        customer={selectedCustomerForWallet}
        onTopupWallet={handleTopupWallet}
      />

      <BeverageModal
        isOpen={isAddBeverageModalOpen}
        onClose={() => setIsAddBeverageModalOpen(false)}
        onAddBeverage={handleAddBeverage}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onAddExpense={handleAddExpense}
      />

      <SettleModal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        onSettle={handleSettleAccounts}
        accounts={accounts}
      />

      {/* Customer CRM Profile Modal */}
      {selectedCustomerForCRM && (
        <CustomerProfileModal
          isOpen={!!selectedCustomerForCRM}
          onClose={() => setSelectedCustomerForCRM(null)}
          customerPhone={selectedCustomerForCRM.phone}
          customerName={selectedCustomerForCRM.name}
          bookings={bookings}
          onBookForPlayer={() => {
            const cust = selectedCustomerForCRM;
            setSelectedCustomerForCRM(null);
            handleBookForCustomer(cust);
          }}
        />
      )}
    </div>
  );
}
