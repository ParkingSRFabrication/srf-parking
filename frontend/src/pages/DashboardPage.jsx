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
  CalendarCheck
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

const CHART_COLORS = ['#2457A7', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];

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

  const summary = data?.summary || {};
  const charts = data?.charts || {};
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#142B4A] tracking-tight">
            Operational Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time station vehicle movement, live occupancy, and collections summary
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5">
          <Link
            to="/entry"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 bg-[#142B4A] hover:bg-[#2457A7] text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <ArrowDownRight className="w-4 h-4 text-emerald-400" />
            <span>Vehicle Entry</span>
          </Link>

          <Link
            to="/exit"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 bg-[#2457A7] hover:bg-[#142B4A] text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <ArrowUpRight className="w-4 h-4 text-amber-300" />
            <span>Vehicle Exit</span>
          </Link>

          <Link
            to="/monthly-pass"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <CreditCard className="w-4 h-4 text-purple-300" />
            <span>New Pass</span>
          </Link>

          <button
            onClick={fetchDashboardData}
            title="Refresh Data"
            className="flex items-center justify-center gap-1.5 p-2 sm:p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition shadow-xs text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="sm:hidden">Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium flex items-center justify-between">
          <span>Failed to load live metrics: {error}</span>
          <button onClick={fetchDashboardData} className="underline font-bold">Retry</button>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Vehicles Inside */}
        <div className="p-3.5 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-[#2457A7] flex items-center justify-center shrink-0">
            <Car className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Inside Now
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#142B4A] mt-0.5">
              {loading ? '...' : summary.vehiclesInside ?? 0}
            </div>
            <div className="text-[9px] sm:text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>Live</span>
            </div>
          </div>
        </div>

        {/* Entries Today */}
        <div className="p-3.5 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ArrowDownRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Entries Today
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-800 mt-0.5">
              {loading ? '...' : summary.entriesToday ?? 0}
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium mt-0.5 truncate">
              Tokens in
            </div>
          </div>
        </div>

        {/* Exits Today */}
        <div className="p-3.5 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Exits Today
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-800 mt-0.5">
              {loading ? '...' : summary.exitsToday ?? 0}
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium mt-0.5 truncate">
              Processed
            </div>
          </div>
        </div>

        {/* Net Collections Today */}
        <div className="p-3.5 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Net Revenue
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 truncate">
              {loading ? '...' : formatCurrency(summary.netRevenueToday ?? 0)}
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium mt-0.5 truncate">
              Today's total
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs">
        <div>
          <span className="text-slate-500 block">Gross Billed Today:</span>
          <span className="font-bold text-slate-800 text-sm">
            {formatCurrency(summary.grossRevenueToday ?? 0)}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Refunds / Adjustments:</span>
          <span className="font-bold text-rose-600 text-sm">
            {formatCurrency(summary.refundsToday ?? 0)}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Active Monthly Passes:</span>
          <span className="font-bold text-emerald-700 text-sm">
            {summary.activePasses ?? 0} Passes
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Passes Expiring Soon:</span>
          <span className="font-bold text-amber-700 text-sm">
            {summary.expiringPasses ?? 0} Expiring (≤ 5 Days)
          </span>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicles Inside by Type */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Car className="w-4 h-4 text-[#2457A7]" />
            Occupancy Breakdown by Vehicle Type
          </h2>

          <div className="h-64 w-full">
            {charts.vehicleTypeBreakdown?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.vehicleTypeBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => CATEGORY_LABELS[val] || val}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val) => [`${val} Vehicles`, 'Inside']}
                    labelFormatter={(val) => CATEGORY_LABELS[val] || val}
                  />
                  <Bar dataKey="count" fill="#2457A7" radius={[6, 6, 0, 0]} />
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
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
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
                  <Tooltip formatter={(val) => [formatCurrency(val), 'Amount Collected']} />
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

      {/* Recent Activity: Mobile Cards View (< md) + Desktop Table (>= md) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <ArrowDownRight className="w-4 h-4 text-blue-600" />
            Recent Parking Sessions
          </h2>
          <Link
            to="/tokens"
            className="text-xs font-semibold text-[#2457A7] hover:underline"
          >
            All Tokens →
          </Link>
        </div>

        {/* Mobile View: High-density interactive cards */}
        <div className="block md:hidden divide-y divide-slate-100">
          {recentActivity.length > 0 ? (
            recentActivity.map((token) => (
              <div key={token._id} className="p-3.5 hover:bg-slate-50 transition space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs text-[#142B4A]">
                      {token.tokenNumber}
                    </span>
                    <span className="bg-slate-100 text-slate-800 font-mono font-bold text-xs px-2 py-0.5 rounded border border-slate-200">
                      {token.vehicleNumber}
                    </span>
                  </div>
                  <StatusBadge status={token.status} />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="capitalize text-slate-500 text-[11px]">
                    {CATEGORY_LABELS[token.vehicleType] || token.vehicleType}
                  </span>
                  <span className="font-bold text-slate-900">
                    {token.amountPaid ? formatCurrency(token.amountPaid) : (token.amountBilled ? formatCurrency(token.amountBilled) : 'Pending')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                  <span>In: {formatDateTime(token.entryTime)}</span>
                  <span>{token.exitTime ? `Out: ${formatDateTime(token.exitTime)}` : 'Inside now'}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No recent parking activity found.
            </div>
          )}
        </div>

        {/* Desktop View: Full data table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Token #</th>
                <th className="py-3 px-4">Vehicle Reg</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Entry Time</th>
                <th className="py-3 px-4">Exit Time</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentActivity.length > 0 ? (
                recentActivity.map((token) => (
                  <tr key={token._id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#142B4A]">
                      {token.tokenNumber}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                        {token.vehicleNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 capitalize">
                      {CATEGORY_LABELS[token.vehicleType] || token.vehicleType}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDateTime(token.entryTime)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {token.exitTime ? formatDateTime(token.exitTime) : '-'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {token.amountPaid ? formatCurrency(token.amountPaid) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={token.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No recent parking activity found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
