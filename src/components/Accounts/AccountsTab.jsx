import React, { useState, useMemo } from 'react';
import { 
  Download, Printer, TrendingDown, TrendingUp, AlertTriangle, 
  Search, Filter, Banknote, Smartphone, CreditCard, Calendar,
  ChevronDown, FileSpreadsheet, ArrowUpRight, ArrowDownRight, Scale,
  Clock, Sun, Moon
} from 'lucide-react';
import { getLocalYYYYMMDD } from '../../utils/slots';
import ShiftHandoverModal from './ShiftHandoverModal';
import ShiftHandoversTable from './ShiftHandoversTable';
import EODSummaryModal from './EODSummaryModal';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const QUARTERS = [
  { id: 0, label: 'Q1 (Jan - Mar)', short: 'Q1' },
  { id: 1, label: 'Q2 (Apr - Jun)', short: 'Q2' },
  { id: 2, label: 'Q3 (Jul - Sep)', short: 'Q3' },
  { id: 3, label: 'Q4 (Oct - Dec)', short: 'Q4' }
];

export default function AccountsTab({
  transactions,
  accounts,
  onOpenExpenseModal,
  onOpenSettleModal,
  shiftHandovers = [],
  bookings = [],
  users = [],
  currentUser,
  onSaveHandover
}) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentQuarter = Math.floor(currentMonth / 3);

  // Sub-view State ('transactions' vs 'shifts')
  const [activeAccountView, setActiveAccountView] = useState('transactions');
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isEODModalOpen, setIsEODModalOpen] = useState(false);

  // Period Filter State
  const [periodType, setPeriodType] = useState('month'); // 'all', 'month', 'quarter', 'year', 'custom'
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedQuarter, setSelectedQuarter] = useState(currentQuarter);
  const [customRange, setCustomRange] = useState({
    start: getLocalYYYYMMDD(new Date(currentYear, currentMonth, 1)),
    end: getLocalYYYYMMDD(today)
  });

  // Category & Payment Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMode, setFilterMode] = useState('all');

  // Available Years (e.g., 2024 to currentYear + 1)
  const availableYears = useMemo(() => {
    const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [currentYear]);

  // Label for active period
  const periodLabel = useMemo(() => {
    switch (periodType) {
      case 'month':
        return `${MONTHS[selectedMonth]} ${selectedYear}`;
      case 'quarter':
        return `Quarter ${selectedQuarter + 1} (${QUARTERS[selectedQuarter].short}) ${selectedYear}`;
      case 'year':
        return `Year ${selectedYear}`;
      case 'custom':
        return `${customRange.start} to ${customRange.end}`;
      case 'all':
      default:
        return 'All Time History';
    }
  }, [periodType, selectedYear, selectedMonth, selectedQuarter, customRange]);

  // Filter Transactions by Time Period
  const periodFilteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      const tYear = d.getFullYear();
      const tMonth = d.getMonth();

      if (periodType === 'month') {
        return tYear === selectedYear && tMonth === selectedMonth;
      }
      if (periodType === 'quarter') {
        const tQuarter = Math.floor(tMonth / 3);
        return tYear === selectedYear && tQuarter === selectedQuarter;
      }
      if (periodType === 'year') {
        return tYear === selectedYear;
      }
      if (periodType === 'custom') {
        const dateStr = getLocalYYYYMMDD(d);
        return dateStr >= customRange.start && dateStr <= customRange.end;
      }
      return true; // 'all'
    });
  }, [transactions, periodType, selectedYear, selectedMonth, selectedQuarter, customRange]);

  // Secondary Filter by Category, Payment Mode, and Search Query
  const displayedTransactions = useMemo(() => {
    return periodFilteredTransactions.filter(t => {
      const matchesSearch = !searchQuery || 
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.createdBy && t.createdBy.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
      const matchesMode = filterMode === 'all' || t.paymentMode === filterMode;
      return matchesSearch && matchesCategory && matchesMode;
    });
  }, [periodFilteredTransactions, searchQuery, filterCategory, filterMode]);

  // Financial Metrics for the Filtered Period
  const periodMetrics = useMemo(() => {
    let income = 0;
    let expense = 0;
    let cashIncome = 0;
    let upiIncome = 0;
    let turftownIncome = 0;

    periodFilteredTransactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        income += amt;
        if (t.paymentMode === 'cash') cashIncome += amt;
        if (t.paymentMode === 'upi') upiIncome += amt;
        if (t.paymentMode === 'turftown') turftownIncome += amt;
      } else if (t.type === 'expense') {
        expense += amt;
      }
    });

    const net = income - expense;
    return { income, expense, net, cashIncome, upiIncome, turftownIncome };
  }, [periodFilteredTransactions]);

  // Export Filtered Accounts CSV
  const exportAccountsCSV = () => {
    const headers = ['Date,Time,Description,Category,Payment Mode,Amount (INR),Transaction Type,Created By\n'];
    const rows = displayedTransactions.map(t => {
      const d = new Date(t.date);
      const safeDesc = `"${t.description.replace(/"/g, '""')}"`;
      const safeAuthor = `"${(t.createdBy || 'Staff').replace(/"/g, '""')}"`;
      return `"${d.toLocaleDateString()}","${d.toLocaleTimeString()}",${safeDesc},"${t.category}","${t.paymentMode}",${t.amount},${t.type},${safeAuthor}`;
    });

    const safePeriodFilename = periodLabel.replace(/[^a-zA-Z0-9]/g, '_');
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Panda_Sports_Accounts_${safePeriodFilename}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Main Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Accounts & Cash Register</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Audit trail, periodic revenue analysis, and register settlement
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 items-center">
          {/* Download CSV */}
          <button
            onClick={exportAccountsCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm active:scale-95"
            title="Download filtered transactions as Excel-compatible CSV file"
          >
            <Download size={15} />
            <span>Download CSV ({displayedTransactions.length})</span>
          </button>

          {/* Print PDF Statement */}
          <button
            onClick={() => window.print()}
            className="bg-white border border-zinc-200 text-zinc-700 px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-zinc-50 transition-colors flex items-center space-x-1.5 shadow-sm"
            title="Print or Save official PDF Statement"
          >
            <Printer size={15} />
            <span>Print PDF</span>
          </button>

          {/* Record Expense */}
          <button
            onClick={onOpenExpenseModal}
            className="bg-red-50 text-red-600 border border-red-200 px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <TrendingDown size={15} />
            <span>Record Expense</span>
          </button>

          {/* Shift Handover */}
          <button
            onClick={() => setIsShiftModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm active:scale-95"
            title="Perform Day/Evening cash drawer audit and staff handover"
          >
            <Clock size={15} />
            <span>Handover Shift</span>
          </button>

          {/* End-of-Day Director Report */}
          <button
            type="button"
            onClick={() => setIsEODModalOpen(true)}
            className="bg-gradient-to-r from-purple-900 to-zinc-900 hover:from-purple-950 hover:to-black text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md active:scale-95 border border-purple-800"
            title="Generate 10:00 PM End-of-Day WhatsApp Revenue Report for Academy Director"
          >
            <Moon size={15} className="text-amber-400" />
            <span>EOD Director Report</span>
          </button>

          {/* Settle Register */}
          <button
            onClick={onOpenSettleModal}
            className="bg-[#d33638] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#b42628] transition-colors flex items-center space-x-1.5 shadow-md shadow-red-900/20"
          >
            <AlertTriangle size={15} className="text-amber-300" />
            <span>Settle Register</span>
          </button>
        </div>
      </div>

      {/* Subview Selector Tabs */}
      <div className="flex gap-2 border-b border-zinc-200 pb-3 print:hidden">
        <button
          onClick={() => setActiveAccountView('transactions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeAccountView === 'transactions'
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <FileSpreadsheet size={15} />
          <span>Financial Ledger & Analytics</span>
        </button>

        <button
          onClick={() => setActiveAccountView('shifts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeAccountView === 'shifts'
              ? 'bg-[#d33638] text-white shadow-sm'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <Clock size={15} />
          <span>Shift Handovers Audit ({shiftHandovers.length})</span>
        </button>
      </div>

      {/* Official Print Header (Only visible when printing/saving PDF) */}
      {activeAccountView === 'shifts' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-amber-50/80 p-4 rounded-2xl border border-amber-200">
            <div>
              <h3 className="text-sm font-black text-amber-950 flex items-center gap-2">
                <Clock size={16} className="text-amber-700" />
                Staff Shift Handover & Cash Reconciliation History
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Staff register accountability for Day Shift (6 AM - 2 PM) & Evening Shift (2 PM - 10 PM) with WhatsApp slip audit.
              </p>
            </div>
            <button
              onClick={() => setIsShiftModalOpen(true)}
              className="bg-[#d33638] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#b42628] transition-all shadow-sm active:scale-95 shrink-0 flex items-center gap-1.5"
            >
              <Clock size={14} />
              <span>Record Shift Handover</span>
            </button>
          </div>
          <ShiftHandoversTable handovers={shiftHandovers} />
        </div>
      ) : (
        <>
          {/* Official Print Header (Only visible when printing/saving PDF) */}
      <div className="hidden print:block mb-6 border-b pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/panda-logo.png" 
              alt="Panda Sports Academy" 
              className="h-12 w-auto object-contain"
            />
            <div className="border-l-2 border-zinc-300 pl-3">
              <h1 className="text-xl font-black text-black tracking-tight">Panda Sports Academy</h1>
              <p className="text-xs font-bold text-zinc-600 mt-0.5">
                Financial Statement & Accounts Ledger • {periodLabel}
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-zinc-500">
            <p className="font-bold">Generated: {new Date().toLocaleString()}</p>
            <p>Total Records: {displayedTransactions.length}</p>
          </div>
        </div>

        {/* Printable Summary KPI bar */}
        <div className="grid grid-cols-3 gap-4 mt-4 p-3 bg-zinc-50 border rounded-xl text-center">
          <div>
            <span className="text-[10px] font-bold uppercase text-zinc-500">Period Income</span>
            <p className="text-sm font-black text-emerald-700">₹{periodMetrics.income.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-zinc-500">Period Expenses</span>
            <p className="text-sm font-black text-red-600">₹{periodMetrics.expense.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-zinc-500">Net Operating Flow</span>
            <p className={`text-sm font-black ${periodMetrics.net >= 0 ? 'text-zinc-900' : 'text-red-600'}`}>
              ₹{periodMetrics.net.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* PERIOD FILTER TOOLBAR (Monthly, Quarterly, Yearly, Custom) - Hidden on Print */}
      <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm space-y-3.5 print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          {/* Period Type Preset Tabs */}
          <div className="flex flex-wrap gap-1 bg-zinc-100 p-1 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setPeriodType('month')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                periodType === 'month'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              📅 Monthly
            </button>
            <button
              onClick={() => setPeriodType('quarter')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                periodType === 'quarter'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              📊 Quarterly
            </button>
            <button
              onClick={() => setPeriodType('year')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                periodType === 'year'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              🗓️ Yearly
            </button>
            <button
              onClick={() => setPeriodType('custom')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                periodType === 'custom'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Custom Range
            </button>
            <button
              onClick={() => setPeriodType('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                periodType === 'all'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Active Period Badge */}
          <div className="text-xs font-extrabold text-zinc-700 bg-zinc-100 px-3 py-1.5 rounded-xl border border-zinc-200">
            Selected: <span className="text-black">{periodLabel}</span>
          </div>
        </div>

        {/* Dynamic Period Selectors */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-zinc-100">
          {/* Monthly Controls */}
          {periodType === 'month' && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 uppercase">Select Month:</span>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}
                className="bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-800 outline-none focus:border-black"
              >
                {MONTHS.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-800 outline-none focus:border-black"
              >
                {availableYears.map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>

              <button
                onClick={() => { setSelectedMonth(currentMonth); setSelectedYear(currentYear); }}
                className="text-[11px] font-bold text-zinc-600 hover:text-black bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                This Month
              </button>
            </div>
          )}

          {/* Quarterly Controls */}
          {periodType === 'quarter' && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 uppercase">Select Quarter:</span>
              <select
                value={selectedQuarter}
                onChange={e => setSelectedQuarter(Number(e.target.value))}
                className="bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-800 outline-none focus:border-black"
              >
                {QUARTERS.map(q => (
                  <option key={q.id} value={q.id}>{q.label}</option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-800 outline-none focus:border-black"
              >
                {availableYears.map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>

              <button
                onClick={() => { setSelectedQuarter(currentQuarter); setSelectedYear(currentYear); }}
                className="text-[11px] font-bold text-zinc-600 hover:text-black bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                This Quarter ({QUARTERS[currentQuarter].short})
              </button>
            </div>
          )}

          {/* Yearly Controls */}
          {periodType === 'year' && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 uppercase">Select Year:</span>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-1.5 text-xs font-bold text-zinc-800 outline-none focus:border-black"
              >
                {availableYears.map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>

              <button
                onClick={() => setSelectedYear(currentYear)}
                className="text-[11px] font-bold text-zinc-600 hover:text-black bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                This Year ({currentYear})
              </button>
            </div>
          )}

          {/* Custom Date Range Controls */}
          {periodType === 'custom' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-300 rounded-xl px-2.5 py-1">
                <span className="text-[11px] text-zinc-400 font-bold uppercase">From</span>
                <input
                  type="date"
                  value={customRange.start}
                  onChange={e => setCustomRange({ ...customRange, start: e.target.value })}
                  className="bg-transparent text-xs font-semibold outline-none text-zinc-800"
                />
              </div>
              <span className="text-zinc-400 text-xs font-bold">to</span>
              <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-300 rounded-xl px-2.5 py-1">
                <span className="text-[11px] text-zinc-400 font-bold uppercase">To</span>
                <input
                  type="date"
                  value={customRange.end}
                  onChange={e => setCustomRange({ ...customRange, end: e.target.value })}
                  className="bg-transparent text-xs font-semibold outline-none text-zinc-800"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FILTERED PERIOD STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Income in Period */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
              <ArrowUpRight size={15} /> Period Revenue ({periodLabel})
            </p>
            <p className="text-2xl font-black text-emerald-950 mt-1">
              ₹{periodMetrics.income.toLocaleString()}
            </p>
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
              Cash: ₹{periodMetrics.cashIncome.toLocaleString()} • UPI: ₹{periodMetrics.upiIncome.toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Total Expenses in Period */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1">
              <ArrowDownRight size={15} /> Period Deductions / Expenses
            </p>
            <p className="text-2xl font-black text-red-950 mt-1">
              ₹{periodMetrics.expense.toLocaleString()}
            </p>
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
              Facility maintenance, repairs & bills
            </p>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
            <TrendingDown size={24} />
          </div>
        </div>

        {/* Net Flow in Period */}
        <div className="bg-zinc-950 p-5 rounded-2xl shadow-md border border-zinc-800 text-white flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Scale size={15} /> Net Flow ({periodLabel})
            </p>
            <p className={`text-2xl font-black mt-1 ${periodMetrics.net >= 0 ? 'text-white' : 'text-red-400'}`}>
              ₹{periodMetrics.net.toLocaleString()}
            </p>
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
              Revenue minus logged expenses
            </p>
          </div>
          <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-emerald-400">
            <Banknote size={24} />
          </div>
        </div>
      </div>

      {/* ACTIVE REGISTER BALANCES SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-100/80 flex flex-col justify-center">
          <span className="text-[11px] font-bold text-emerald-700 uppercase mb-1 flex items-center gap-1.5">
            <Banknote size={15} /> Current Cash in Hand
          </span>
          <span className="text-2xl font-black text-emerald-950">₹{accounts.cash.toLocaleString()}</span>
        </div>

        <div className="bg-blue-50/80 p-4 rounded-2xl border border-blue-100/80 flex flex-col justify-center">
          <span className="text-[11px] font-bold text-blue-700 uppercase mb-1 flex items-center gap-1.5">
            <Smartphone size={15} /> Current UPI Balance
          </span>
          <span className="text-2xl font-black text-blue-950">₹{accounts.upi.toLocaleString()}</span>
        </div>

        <div className="bg-purple-50/80 p-4 rounded-2xl border border-purple-100/80 flex flex-col justify-center">
          <span className="text-[11px] font-bold text-purple-700 uppercase mb-1 flex items-center gap-1.5">
            <CreditCard size={15} /> Current Turftown Balance
          </span>
          <span className="text-2xl font-black text-purple-950">₹{accounts.turftown.toLocaleString()}</span>
        </div>

        {/* Beverage Sales Breakdown */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 flex flex-col justify-start overflow-y-auto max-h-36 shadow-sm">
          <span className="text-[11px] font-bold text-zinc-500 uppercase mb-2 sticky top-0 bg-white">
            Beverage & Snack Breakdown
          </span>
          <div className="space-y-1 pr-1">
            {Object.entries(accounts.beveragesBreakdown).length === 0 ? (
              <span className="text-xs text-zinc-400 italic">No sales recorded yet</span>
            ) : (
              Object.entries(accounts.beveragesBreakdown).map(([name, amount]) => (
                <div key={name} className="flex justify-between items-center text-xs border-b border-zinc-50 pb-1">
                  <span className="text-zinc-700 font-medium truncate mr-2">{name}</span>
                  <span className="font-bold text-zinc-900 shrink-0">₹{Number(amount).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Search & Category Filter Toolbar - Hidden on print */}
      <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search description, staff, or category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold outline-none focus:border-zinc-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-zinc-700 outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Court Booking">Court Bookings</option>
            <option value="Group Booking">Group Bookings</option>
            <option value="Beverage">Beverages & Snacks</option>
            <option value="Expense">Expenses</option>
            <option value="Settlement">Settlement</option>
          </select>

          <select
            value={filterMode}
            onChange={e => setFilterMode(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-zinc-700 outline-none"
          >
            <option value="all">All Payment Modes</option>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="turftown">Turftown</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden print:border-none print:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse print:text-xs">
            <thead>
              <tr className="bg-zinc-100/70 border-b border-zinc-200 print:bg-zinc-50">
                <th className="p-3.5 text-xs font-bold text-zinc-600">Date & Time</th>
                <th className="p-3.5 text-xs font-bold text-zinc-600">Description</th>
                <th className="p-3.5 text-xs font-bold text-zinc-600">Category</th>
                <th className="p-3.5 text-xs font-bold text-zinc-600">Payment Mode</th>
                <th className="p-3.5 text-xs font-bold text-zinc-600">Logged By</th>
                <th className="p-3.5 text-xs font-bold text-zinc-600 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {displayedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-zinc-400 italic">
                    No transactions matching {periodLabel}.
                  </td>
                </tr>
              ) : (
                displayedTransactions.map((t, index) => (
                  <tr
                    key={t.id}
                    className={`border-b border-zinc-100 hover:bg-zinc-50/80 transition-colors print:border-b-zinc-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-zinc-50/40'
                    }`}
                  >
                    <td className="p-3.5 text-xs text-zinc-500 whitespace-nowrap font-medium">
                      {new Date(t.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-3.5 text-xs font-semibold text-zinc-900">
                      {t.description}
                    </td>
                    <td className="p-3.5 text-xs">
                      <span className="bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-md text-[11px] font-bold print:border print:bg-transparent">
                        {t.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-xs">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider print:border print:bg-transparent print:text-black ${
                          t.paymentMode === 'cash'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.paymentMode === 'upi'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {t.paymentMode}
                      </span>
                    </td>
                    <td className="p-3.5 text-xs text-zinc-500 font-medium">
                      {t.createdBy || 'Staff'}
                    </td>
                    <td
                      className={`p-3.5 text-xs font-extrabold text-right whitespace-nowrap ${
                        t.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}

      {/* Shift Handover Modal */}
      <ShiftHandoverModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        currentCashBalance={accounts.cash}
        users={users}
        currentUser={currentUser}
        onSaveHandover={(handover) => {
          onSaveHandover(handover);
          setIsShiftModalOpen(false);
        }}
      />

      {/* 10:00 PM End-of-Day Director Summary Modal */}
      <EODSummaryModal
        isOpen={isEODModalOpen}
        onClose={() => setIsEODModalOpen(false)}
        transactions={transactions}
        bookings={bookings}
        shiftHandovers={shiftHandovers}
        currentUser={currentUser}
      />
    </div>
  );
}
