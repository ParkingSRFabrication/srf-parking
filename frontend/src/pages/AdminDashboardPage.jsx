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
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-slate-100">
      {/* Top Banner: Admin Identification */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[11px] font-bold text-purple-700 dark:text-purple-300 mb-2 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>CENTRAL STATION • SYSTEM ADMINISTRATOR PORTAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Executive Station Governance</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Logged in as <span className="text-slate-900 dark:text-white font-bold">{user?.name}</span> ({user?.operatorId}). Full administrative oversight over tariffs, pass pricing, booth operators, settings, and financial audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10 transition active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/tariffs"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#00A884] hover:bg-[#008F6F] text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Tariffs & Prices</span>
          </Link>
          <Link
            to="/operators"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Operators</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Gross Revenue Today */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Net Revenue</span>
            <div className="w-7 h-7 rounded-xl bg-[#00A884]/10 text-[#00A884] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#00A884]">
            {formatCurrency(summary.netRevenueToday || 0)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            <TrendingUp className="w-3 h-3 text-[#00A884]" />
            <span>Gross: {formatCurrency(summary.grossRevenueToday || 0)}</span>
          </div>
        </div>

        {/* Vehicles Currently Inside */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live Occupancy</span>
            <div className="w-7 h-7 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
            {summary.vehiclesInside || 0}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            <span>Vehicles inside station lot</span>
          </div>
        </div>

        {/* Active Passes */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monthly Passes</span>
            <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
            {summary.activePasses || 0}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            <span>{summary.expiringPasses || 0} expiring within 5 days</span>
          </div>
        </div>

        {/* Staff & Booth Operators */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Booth Operators</span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
            {operators.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            <span>{operators.filter(o => o.isActive).length} active duty accounts</span>
          </div>
        </div>
      </div>

      {/* Admin Fast Control Hub */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00A884]" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
              Administrative Control Hub
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Exclusive Administrator Privileges</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/tariffs"
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-[#00A884]/5 dark:hover:bg-[#00A884]/10 border border-slate-200/80 dark:border-white/10 text-center transition group"
          >
            <Layers className="w-5 h-5 mx-auto text-[#00A884] group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-slate-900 dark:text-white mt-2">Tariff Rates</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Set parking fees</div>
          </Link>

          <Link
            to="/operators"
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-sky-500/5 dark:hover:bg-sky-500/10 border border-slate-200/80 dark:border-white/10 text-center transition group"
          >
            <Users className="w-5 h-5 mx-auto text-sky-600 dark:text-sky-400 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-slate-900 dark:text-white mt-2">Booth Staff</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Create & manage operators</div>
          </Link>

          <Link
            to="/reports"
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10 border border-slate-200/80 dark:border-white/10 text-center transition group"
          >
            <BarChart3 className="w-5 h-5 mx-auto text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-slate-900 dark:text-white mt-2">Reports & P&L</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Financial audits</div>
          </Link>

          <Link
            to="/settings"
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-amber-500/5 dark:hover:bg-amber-500/10 border border-slate-200/80 dark:border-white/10 text-center transition group"
          >
            <Settings className="w-5 h-5 mx-auto text-amber-600 dark:text-amber-400 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-slate-900 dark:text-white mt-2">Settings</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Station configuration</div>
          </Link>

          <Link
            to="/audit-logs"
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-rose-500/5 dark:hover:bg-rose-500/10 border border-slate-200/80 dark:border-white/10 text-center transition group"
          >
            <ShieldAlert className="w-5 h-5 mx-auto text-rose-600 dark:text-rose-400 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-slate-900 dark:text-white mt-2">Audit Logs</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Security event trail</div>
          </Link>

          <Link
            to="/entry"
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-cyan-500/5 dark:hover:bg-cyan-500/10 border border-slate-200/80 dark:border-white/10 text-center transition group"
          >
            <Zap className="w-5 h-5 mx-auto text-[#00A884] group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-slate-900 dark:text-white mt-2">Gate View</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Terminal operations</div>
          </Link>
        </div>
      </div>

      {/* Two Column Section: Live Tariff Pricing & Operator Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tariffs & Pass Prices Snapshot */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                Current Vehicle Category Tariffs
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Official railway parking rates</p>
            </div>
            <Link
              to="/tariffs"
              className="text-xs font-bold text-[#00A884] hover:text-[#008F6F] transition"
            >
              Configure Tariffs &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5 overflow-hidden rounded-xl border border-slate-200/80 dark:border-white/5 bg-transparent">
            {tariffs.slice(0, 5).map((t) => (
              <div key={t._id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white capitalize">{t.category} ({t.name})</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Method: {t.billingMethod}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-[#00A884]">{formatCurrency(t.firstSlabAmount)}/day</div>
                  <div className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">Pass: {formatCurrency(t.monthlyAmount)}/mo</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booth Operators Snapshot */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                Authorized Booth Staff
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Station operators on duty</p>
            </div>
            <Link
              to="/operators"
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-500 transition"
            >
              Manage Operators &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5 overflow-hidden rounded-xl border border-slate-200/80 dark:border-white/5 bg-transparent">
            {operators.slice(0, 5).map((op) => (
              <div key={op._id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{op.name}</span>
                    <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">({op.operatorId})</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">Role: {op.role}</div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    op.isActive ? 'bg-[#00A884]/10 text-[#00A884] border border-[#00A884]/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
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
