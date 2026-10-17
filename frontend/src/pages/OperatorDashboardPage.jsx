import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  Ticket,
  CreditCard,
  Search,
  CalendarCheck,
  Car,
  Clock,
  IndianRupee,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency, formatDateTime } from '../utils/formatters.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import './DashboardPage.css';

export function OperatorDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [insideTokens, setInsideTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOperatorData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, tokensRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/parking/tokens?status=INSIDE&limit=8')
      ]);

      if (summaryRes.data?.success) setData(summaryRes.data);
      if (tokensRes.data?.success) setInsideTokens(tokensRes.data.tokens || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperatorData();
  }, []);

  const summary = data?.summary || {
    vehiclesInside: 0,
    entriesToday: 0,
    exitsToday: 0,
    activePasses: 0
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-slate-100">
      {/* Top Shift Operator Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#00A884]/10 border border-[#00A884]/20 rounded-full text-[11px] font-bold text-[#00A884] mb-2 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-pulse" />
            <span>TERMINAL BOOTH OPERATOR CONTROL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Gate Shift Terminal</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Logged in as <span className="text-slate-900 dark:text-white font-bold">{user?.name}</span> (ID: <span className="font-mono text-[#00A884] font-bold">{user?.operatorId}</span>). Daily vehicle check-in, exit billing calculations, pass verification, and token audit ledger.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchOperatorData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10 transition active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/entry"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#00A884] hover:bg-[#008F6F] text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Fast Entry</span>
          </Link>
          <Link
            to="/exit"
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Process Exit</span>
          </Link>
        </div>
      </div>

      {/* Role Notice & Security Boundary */}
      <div className="px-4 py-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/50 text-xs text-sky-800 dark:text-sky-300 flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
        <span>
          <strong>Operator Access Level:</strong> Authorized for daily terminal vehicle entries, exits, token generation, and pass issuances. Tariff pricing alterations and user account administration are restricted to System Administrators.
        </span>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Shift Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Vehicles Inside */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vehicles Inside</span>
            <div className="w-7 h-7 rounded-xl bg-[#00A884]/10 text-[#00A884] flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {summary.vehiclesInside || 0}
          </div>
          <div className="text-[11px] text-[#00A884] mt-1 font-medium">Currently parked in plaza</div>
        </div>

        {/* Entries Today */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Entries Today</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {summary.entriesToday || 0}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Tokens dispatched</div>
        </div>

        {/* Exits Processed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Exits Cleared</span>
            <div className="w-7 h-7 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {summary.exitsToday || 0}
          </div>
          <div className="text-[11px] text-sky-600 dark:text-sky-400 mt-1 font-medium">Clearances billed</div>
        </div>

        {/* Active Passes */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Passes</span>
            <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {summary.activePasses || 0}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 font-medium">Commuters verified</div>
        </div>
      </div>

      {/* Prominent Quick-Action Gate Operations Grid */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
          Gate Quick Action Launchpad
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/entry"
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-[#00A884]/5 dark:hover:bg-[#00A884]/10 border border-slate-200/80 dark:border-white/10 hover:border-[#00A884]/50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00A884]/10 text-[#00A884] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">Generate Vehicle Entry</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fast plate entry & QR token print</div>
              </div>
            </div>
          </Link>

          <Link
            to="/exit"
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-sky-500/5 dark:hover:bg-sky-500/10 border border-slate-200/80 dark:border-white/10 hover:border-sky-500/50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">Process Vehicle Exit</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">24h railway tariff calculation & collection</div>
              </div>
            </div>
          </Link>

          <Link
            to="/monthly-pass"
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-purple-500/5 dark:hover:bg-purple-500/10 border border-slate-200/80 dark:border-white/10 hover:border-purple-500/50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">Issue Monthly Pass</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">1, 6, 12 month daily commuter pass</div>
              </div>
            </div>
          </Link>

          <Link
            to="/tokens"
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 hover:border-slate-400 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">All Parking Tokens</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Lookup inside & completed tokens</div>
              </div>
            </div>
          </Link>

          <Link
            to="/passes"
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-purple-500/5 dark:hover:bg-purple-500/10 border border-slate-200/80 dark:border-white/10 hover:border-purple-500/50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">Monthly Pass Ledger</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Search passes & process renewals</div>
              </div>
            </div>
          </Link>

          <Link
            to="/vehicles"
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-amber-500/5 dark:hover:bg-amber-500/10 border border-slate-200/80 dark:border-white/10 hover:border-amber-500/50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">Vehicle Plate Search</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Check visit history & pass validity</div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Active Vehicles Inside Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Live Parked Vehicles (Inside Lot)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Rapid exit billing shortcuts</p>
          </div>
          <Link to="/tokens" className="text-xs font-bold text-[#00A884] hover:text-[#008F6F]">
            View All &rarr;
          </Link>
        </div>

        {insideTokens.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-white/5">
            No vehicles currently parked inside the lot.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-white/5 bg-transparent">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-mono border-b border-slate-200/90 dark:border-white/10">
                <tr>
                  <th className="py-2.5 px-3">Token #</th>
                  <th className="py-2.5 px-3">Vehicle Plate</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Entry Time</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {insideTokens.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#00A884]">{t.tokenNumber}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{t.vehicleNumber}</td>
                    <td className="py-2.5 px-3 capitalize text-slate-600 dark:text-slate-300">{t.vehicleType}</td>
                    <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 font-mono">{formatDateTime(t.entryTime)}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => navigate(`/exit?token=${t.tokenNumber}`)}
                        className="px-2.5 py-1 bg-[#00A884] hover:bg-[#008F6F] text-white rounded-lg font-bold text-[11px] transition shadow-xs active:scale-95"
                      >
                        Exit & Bill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
