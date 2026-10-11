import React from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';
import { 
  Banknote, Smartphone, CreditCard, TrendingUp, 
  TrendingDown, Scale, Coffee, PieChart as PieIcon, 
  BarChart2, DollarSign 
} from 'lucide-react';

export default function AccountCharts({ 
  accounts, 
  periodMetrics, 
  periodLabel,
  periodFilteredTransactions = [] 
}) {
  // 1. Payment Modes & Register Balances Data (Matching Cash, UPI, TurfTown)
  const paymentBalanceData = [
    { name: 'Cash in Hand', value: accounts.cash || 0, color: '#10b981' },
    { name: 'UPI Balance', value: accounts.upi || 0, color: '#3b82f6' },
    { name: 'TurfTown Balance', value: accounts.turftown || 0, color: '#a855f7' }
  ];
  const totalLiquidFunds = (accounts.cash || 0) + (accounts.upi || 0) + (accounts.turftown || 0);
  const hasPaymentData = paymentBalanceData.some(item => item.value > 0);

  // 2. Beverage & Snack Breakdown Pie Data
  const beveragePalette = ['#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#6366f1'];
  const beverageData = Object.entries(accounts.beveragesBreakdown || {}).map(([name, amount], index) => ({
    name,
    value: Number(amount) || 0,
    color: beveragePalette[index % beveragePalette.length]
  })).filter(i => i.value > 0);
  const totalBeverageSales = beverageData.reduce((sum, item) => sum + item.value, 0);

  // 3. Period Revenue vs Deductions / Expenses Bar Chart Data
  const flowBarData = [
    {
      name: 'Revenue Inflow',
      amount: periodMetrics.income || 0,
      fill: '#10b981'
    },
    {
      name: 'Deductions / Expenses',
      amount: periodMetrics.expense || 0,
      fill: '#ef4444'
    },
    {
      name: 'Net Operating Flow',
      amount: Math.max(0, periodMetrics.net || 0),
      fill: '#18181b'
    }
  ];

  // 4. Revenue By Category Donut Data
  const categoryCounts = {};
  periodFilteredTransactions.filter(t => t.type === 'income').forEach(t => {
    const cat = t.category || 'Court Booking';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + (Number(t.amount) || 0);
  });
  const categoryColors = {
    'Court Booking': '#3b82f6',
    'Beverage': '#f59e0b',
    'Academy Batch': '#10b981',
    'Panda Pass': '#d33638',
    'Tournament': '#8b5cf6',
    'Other': '#71717a'
  };
  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
    color: categoryColors[name] || '#64748b'
  })).filter(i => i.value > 0);

  // Custom Currency Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-zinc-900 text-white px-3 py-2 rounded-xl text-xs shadow-lg border border-zinc-800">
          <p className="font-bold">{data.name}</p>
          <p className="text-emerald-400 font-black text-sm">
            ₹{Number(data.value).toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in fade-in duration-200">
      {/* CHART 1: Current Register & Payment Distribution (Donut Chart) */}
      <div className="bg-white p-5 rounded-3xl border border-zinc-200/90 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Liquid Register Balance
            </span>
            <h4 className="text-sm font-black text-zinc-900 flex items-center gap-1.5 mt-0.5">
              <PieIcon size={16} className="text-emerald-600" />
              <span>Payment Mode Share</span>
            </h4>
          </div>
          <span className="text-xs font-black text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-xl">
            Total ₹{totalLiquidFunds.toLocaleString()}
          </span>
        </div>

        <div className="h-52 w-full my-2 flex items-center justify-center relative">
          {hasPaymentData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={paymentBalanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {paymentBalanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-zinc-400 text-xs">
              <p className="font-bold">Register is cleared</p>
              <p className="text-[11px] mt-0.5">No active cash, UPI, or TurfTown funds</p>
            </div>
          )}

          {/* Center Text inside Donut */}
          {hasPaymentData && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">In Register</span>
              <span className="text-base font-black text-zinc-900">₹{totalLiquidFunds.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Legend pills */}
        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-zinc-100 text-[11px]">
          <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-100 text-center">
            <span className="text-[10px] font-bold text-emerald-800 block truncate">Cash</span>
            <span className="font-black text-emerald-950">₹{accounts.cash || 0}</span>
          </div>
          <div className="bg-blue-50/70 p-2 rounded-xl border border-blue-100 text-center">
            <span className="text-[10px] font-bold text-blue-800 block truncate">UPI</span>
            <span className="font-black text-blue-950">₹{accounts.upi || 0}</span>
          </div>
          <div className="bg-purple-50/70 p-2 rounded-xl border border-purple-100 text-center">
            <span className="text-[10px] font-bold text-purple-800 block truncate">TurfTown</span>
            <span className="font-black text-purple-950">₹{accounts.turftown || 0}</span>
          </div>
        </div>
      </div>

      {/* CHART 2: Period Cash Flow Comparison (Bar Chart) */}
      <div className="bg-white p-5 rounded-3xl border border-zinc-200/90 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              {periodLabel}
            </span>
            <h4 className="text-sm font-black text-zinc-900 flex items-center gap-1.5 mt-0.5">
              <BarChart2 size={16} className="text-blue-600" />
              <span>Revenue vs Deductions</span>
            </h4>
          </div>
          <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${
            periodMetrics.net >= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
          }`}>
            Net: ₹{periodMetrics.net.toLocaleString()}
          </span>
        </div>

        <div className="h-52 w-full my-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={flowBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 10, fontWeight: 600, fill: '#a1a1aa' }} 
              />
              <Tooltip 
                formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Amount']}
                contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: 'none', color: '#fff' }}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {flowBarData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown bar footer */}
        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-zinc-100 text-[11px]">
          <div className="text-center">
            <span className="text-[10px] font-bold text-zinc-400 block">Revenue</span>
            <span className="font-black text-emerald-600">₹{periodMetrics.income.toLocaleString()}</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] font-bold text-zinc-400 block">Expenses</span>
            <span className="font-black text-red-600">₹{periodMetrics.expense.toLocaleString()}</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] font-bold text-zinc-400 block">Margin</span>
            <span className={`font-black ${periodMetrics.net >= 0 ? 'text-zinc-900' : 'text-red-600'}`}>
              ₹{periodMetrics.net.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* CHART 3: Beverage & Snack Breakdown Donut / Pie Chart */}
      <div className="bg-white p-5 rounded-3xl border border-zinc-200/90 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              POS Store Items
            </span>
            <h4 className="text-sm font-black text-zinc-900 flex items-center gap-1.5 mt-0.5">
              <Coffee size={16} className="text-amber-600" />
              <span>Beverage & Snack Share</span>
            </h4>
          </div>
          <span className="text-xs font-black text-zinc-900 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-xl">
            Total ₹{totalBeverageSales.toLocaleString()}
          </span>
        </div>

        <div className="h-52 w-full my-2 flex items-center justify-center relative">
          {beverageData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={beverageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {beverageData.map((entry, index) => (
                    <Cell key={`bev-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-zinc-400 text-xs">
              <Coffee size={28} className="mx-auto mb-1.5 opacity-30" />
              <p className="font-bold">No beverage sales yet</p>
              <p className="text-[11px] mt-0.5">Sales from Protein Bars & Drinks will chart here</p>
            </div>
          )}

          {/* Center Label */}
          {beverageData.length > 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">POS Sales</span>
              <span className="text-sm font-black text-zinc-900">₹{totalBeverageSales.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Item pills list */}
        <div className="pt-2 border-t border-zinc-100 space-y-1 max-h-20 overflow-y-auto pr-1">
          {beverageData.length === 0 ? (
            <p className="text-[11px] text-zinc-400 italic text-center py-1">No items recorded</p>
          ) : (
            beverageData.map(item => (
              <div key={item.name} className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-zinc-700 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="font-black text-zinc-900 shrink-0">₹{item.value.toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
