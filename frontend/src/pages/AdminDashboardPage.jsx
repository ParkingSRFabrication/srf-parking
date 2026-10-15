import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  IndianRupee,
  Layers,
  Users,
  Settings,
  BarChart3,
  ShieldAlert,
  ArrowDownRight,
  ArrowUpRight,
  Car,
  Ticket,
  CalendarCheck,
  RefreshCw,
  TrendingUp,
  Download,
  AlertTriangle,
  Zap,
  CheckCircle2
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
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency, formatDateTime } from '../utils/formatters.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import './DashboardPage.css';

const CHART_COLORS = ['#818CF8', '#38BDF8', '#10B981', '#F59E0B', '#EC4899', '#A78BFA'];

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [tariffs, setTariffs] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, tariffsRes, operatorsRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/tariffs'),
        api.get('/operators')
      ]);

      if (summaryRes.data?.success) setData(summaryRes.data);
      if (tariffsRes.data?.success) setTariffs(tariffsRes.data.tariffs || []);
      if (operatorsRes.data?.success) setOperators(operatorsRes.data.operators || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const summary = data?.summary || {
    vehiclesInside: 0,
    entriesToday: 0,
    exitsToday: 0,
    netRevenueToday: 0,
    grossRevenueToday: 0,
    activePasses: 0,
    expiringPasses: 0
  };

  const charts = data?.charts || {
    vehicleTypeBreakdown: [],
    paymentMethodBreakdown: []
  };

  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Top Banner: Admin Identification */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-950/40 to-slate-900 border border-purple-500/30 backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-[11px] font-bold text-purple-300 mb-2 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>CENTRAL STATION • SYSTEM ADMINISTRATOR PORTAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-outfit text-white tracking-tight flex items-center gap-2">
            <span>Executive Station Governance</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Logged in as <span className="text-white font-bold">{user?.name}</span> ({user?.operatorId}). Full administrative oversight over tariffs, pass pricing, booth operators, settings, and financial audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-white/10 transition active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/tariffs"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg transition active:scale-95"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Tariffs & Prices</span>
          </Link>
          <Link
            to="/operators"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold shadow-lg transition active:scale-95"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Operators</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Gross Revenue Today */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Net Revenue</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-outfit text-white">
            {formatCurrency(summary.netRevenueToday || 0)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>Gross: {formatCurrency(summary.grossRevenueToday || 0)}</span>
          </div>
        </div>

        {/* Vehicles Currently Inside */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live Occupancy</span>
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-outfit text-white">
            {summary.vehiclesInside || 0}
          </div>
          <div className="text-[11px] text-cyan-400 font-medium mt-1">
            <span>Vehicles inside station lot</span>
          </div>
        </div>

        {/* Active Passes */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monthly Passes</span>
            <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-outfit text-white">
            {summary.activePasses || 0}
          </div>
          <div className="text-[11px] text-purple-400 font-medium mt-1">
            <span>{summary.expiringPasses || 0} expiring within 5 days</span>
          </div>
        </div>

        {/* Staff & Booth Operators */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/30 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Booth Operators</span>
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-outfit text-white">
            {operators.length}
          </div>
          <div className="text-[11px] text-indigo-400 font-medium mt-1">
            <span>{operators.filter(o => o.isActive).length} active duty accounts</span>
          </div>
        </div>
      </div>

      {/* Admin Fast Control Hub */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Administrative Control Hub
            </h2>
          </div>
          <span className="text-xs text-slate-400">Exclusive Administrator Privileges</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/tariffs"
            className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600/20 border border-white/5 hover:border-indigo-500/40 text-center transition group"
          >
            <Layers className="w-5 h-5 mx-auto text-cyan-400 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-white mt-2">Tariff Rates</div>
            <div className="text-[10px] text-slate-400">Set parking fees</div>
          </Link>

          <Link
            to="/operators"
            className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-purple-600/20 border border-white/5 hover:border-purple-500/40 text-center transition group"
          >
            <Users className="w-5 h-5 mx-auto text-purple-400 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-white mt-2">Booth Staff</div>
            <div className="text-[10px] text-slate-400">Create & manage operators</div>
          </Link>

          <Link
            to="/reports"
            className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-emerald-600/20 border border-white/5 hover:border-emerald-500/40 text-center transition group"
          >
            <BarChart3 className="w-5 h-5 mx-auto text-emerald-400 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-white mt-2">Reports & P&L</div>
            <div className="text-[10px] text-slate-400">Financial audits</div>
          </Link>

          <Link
            to="/settings"
            className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-amber-600/20 border border-white/5 hover:border-amber-500/40 text-center transition group"
          >
            <Settings className="w-5 h-5 mx-auto text-amber-400 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-white mt-2">Settings</div>
            <div className="text-[10px] text-slate-400">Station configuration</div>
          </Link>

          <Link
            to="/audit-logs"
            className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-rose-600/20 border border-white/5 hover:border-rose-500/40 text-center transition group"
          >
            <ShieldAlert className="w-5 h-5 mx-auto text-rose-400 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-white mt-2">Audit Logs</div>
            <div className="text-[10px] text-slate-400">Security event trail</div>
          </Link>

          <Link
            to="/entry"
            className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-cyan-600/20 border border-white/5 hover:border-cyan-500/40 text-center transition group"
          >
            <Zap className="w-5 h-5 mx-auto text-cyan-400 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-white mt-2">Gate View</div>
            <div className="text-[10px] text-slate-400">Terminal operations</div>
          </Link>
        </div>
      </div>

      {/* Two Column Section: Live Tariff Pricing & Operator Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tariffs & Pass Prices Snapshot */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Current Vehicle Category Tariffs
              </h2>
              <p className="text-[11px] text-slate-400">Official railway parking rates</p>
            </div>
            <Link
              to="/tariffs"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
            >
              Configure Tariffs &rarr;
            </Link>
          </div>

          <div className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/5 bg-slate-950/60">
            {tariffs.slice(0, 5).map((t) => (
              <div key={t._id} className="p-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white capitalize">{t.category} ({t.name})</div>
                  <div className="text-[10px] text-slate-400">Method: {t.billingMethod}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-400">{formatCurrency(t.firstSlabAmount)}/day</div>
                  <div className="text-[10px] text-purple-300 font-mono">Pass: {formatCurrency(t.monthlyAmount)}/mo</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booth Operators Snapshot */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Authorized Booth Staff
              </h2>
              <p className="text-[11px] text-slate-400">Station operators on duty</p>
            </div>
            <Link
              to="/operators"
              className="text-xs font-bold text-purple-400 hover:text-purple-300 transition"
            >
              Manage Operators &rarr;
            </Link>
          </div>

          <div className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/5 bg-slate-950/60">
            {operators.slice(0, 5).map((op) => (
              <div key={op._id} className="p-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{op.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">({op.operatorId})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">Role: {op.role}</div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    op.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {op.isActive ? 'Active Duty' : 'Deactivated'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
