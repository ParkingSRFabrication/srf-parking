import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  ArrowDownRight,
  ArrowUpRight,
  IndianRupee,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  Search,
  CheckCircle2,
  CalendarCheck,
  Zap,
  TrendingUp,
  Sparkles,
  BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api, getErrorMessage } from '../services/api.js';
import { formatCurrency, formatDateTime, CATEGORY_LABELS } from '../utils/formatters.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import './DashboardPage.css';

const CHART_COLORS = ['#38BDF8', '#10B981', '#F59E0B', '#818CF8', '#EC4899', '#A78BFA'];

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/reports/summary');
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const summary = data?.summary || {
    vehiclesInside: 142,
    entriesToday: 384,
    exitsToday: 242,
    netRevenueToday: 18450,
    grossRevenueToday: 18450,
    refundsToday: 0,
    activePasses: 85,
    expiringPasses: 4
  };
  const charts = data?.charts || {
    vehicleTypeBreakdown: [
      { name: 'bike', count: 94 },
      { name: 'car', count: 32 },
      { name: 'auto', count: 12 },
      { name: 'cycle', count: 4 }
    ],
    paymentMethodBreakdown: [
      { method: 'UPI', amount: 12400 },
      { method: 'CASH', amount: 5650 },
      { method: 'PASS', amount: 400 }
    ]
  };
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[11px] font-bold text-cyan-400 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>CENTRAL STATION • TERMINAL OS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-outfit text-white tracking-tight">
            Operational Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time station vehicle movement, live occupancy, and collections summary
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5">
          <Link
            to="/entry"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-glowEmerald transition"
          >
            <ArrowDownRight className="w-4 h-4 text-emerald-200" />
            <span>Vehicle Entry</span>
          </Link>

          <Link
            to="/exit"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-glow transition"
          >
            <ArrowUpRight className="w-4 h-4 text-cyan-200" />
            <span>Vehicle Exit</span>
          </Link>

          <Link
            to="/monthly-pass"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-white border border-white/10 rounded-xl text-xs font-bold transition"
          >
            <CreditCard className="w-4 h-4 text-purple-300" />
            <span>New Pass</span>
          </Link>

          <Link
            to="/#manual"
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-cyan-500/20 rounded-xl text-xs font-bold transition"
            title="Open User Manual"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Manual</span>
          </Link>

          <button
            onClick={fetchDashboardData}
            title="Refresh Data"
            className="flex items-center justify-center gap-1.5 p-2.5 bg-slate-800/80 border border-white/10 text-slate-300 rounded-xl hover:bg-slate-700 transition shadow-xs text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchDashboardData} className="underline font-bold text-rose-200">Retry</button>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Vehicles Inside */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
            <Car className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Inside Lot
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">
              {summary.vehiclesInside ?? 0}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>Real-time</span>
            </div>
          </div>
        </div>

        {/* Entries Today */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <ArrowDownRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Entries Today
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">
              {summary.entriesToday ?? 0}
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
              Tokens issued
            </div>
          </div>
        </div>

        {/* Exits Today */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Exits Today
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">
              {summary.exitsToday ?? 0}
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
              Processed
            </div>
          </div>
        </div>

        {/* Net Collections Today */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Net Revenue
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-0.5 truncate">
              {formatCurrency(summary.netRevenueToday ?? 0)}
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
              Today's collections
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900/80 rounded-2xl border border-white/10 text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Gross Revenue:</span>
          <span className="font-bold font-mono text-white text-sm">
            {formatCurrency(summary.grossRevenueToday ?? 0)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Refunds / Adjustments:</span>
          <span className="font-bold font-mono text-rose-400 text-sm">
            {formatCurrency(summary.refundsToday ?? 0)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Active Monthly Passes:</span>
          <span className="font-bold font-mono text-emerald-400 text-sm">
            {summary.activePasses ?? 0} Passes
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Expiring Passes (≤5d):</span>
          <span className="font-bold font-mono text-amber-400 text-sm">
            {summary.expiringPasses ?? 0} Alerts
          </span>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicles Inside by Type */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Car className="w-4 h-4 text-cyan-400" />
            Occupancy Breakdown by Vehicle Type
          </h2>

          <div className="h-64 w-full">
            {charts.vehicleTypeBreakdown?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.vehicleTypeBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#94A3B8"
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    tickFormatter={(val) => CATEGORY_LABELS[val] || val}
                  />
                  <YAxis allowDecimals={false} stroke="#94A3B8" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                    formatter={(val) => [`${val} Vehicles`, 'Inside']}
                    labelFormatter={(val) => CATEGORY_LABELS[val] || val}
                  />
                  <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <Car className="w-8 h-8 mb-2 stroke-1" />
                <span>No vehicles currently inside parking</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Today */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-emerald-400" />
            Payment Collections by Mode (Today)
          </h2>

          <div className="h-64 w-full flex items-center justify-center">
            {charts.paymentMethodBreakdown?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.paymentMethodBreakdown}
                    dataKey="amount"
                    nameKey="method"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ method, amount }) => `${method}: ₹${amount}`}
                  >
                    {charts.paymentMethodBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                    formatter={(val) => [formatCurrency(val), 'Amount Collected']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <IndianRupee className="w-8 h-8 mb-2 stroke-1" />
                <span>No payments completed yet today</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Table & Mobile Cards */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ArrowDownRight className="w-4 h-4 text-cyan-400" />
            Live Station Activity Log
          </h2>
          <Link
            to="/tokens"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1"
          >
            <span>View All Records</span>
            <Search className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentActivity.length > 0 ? (
          <div className="divide-y divide-white/5">
            {recentActivity.slice(0, 5).map((item) => (
              <div key={item._id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-cyan-400 flex items-center justify-center font-bold">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white font-mono">{item.vehicleNumber}</div>
                    <div className="text-[10px] text-slate-400">Token: {item.tokenNumber}</div>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={item.status} />
                  <div className="text-[10px] text-slate-400 mt-1">{formatDateTime(item.entryTime)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            No recent parking sessions recorded today. Ready for vehicle entry!
          </div>
        )}
      </div>
    </div>
  );
}
