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
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Top Shift Operator Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-900/40 via-cyan-950/40 to-slate-900 border border-cyan-500/30 backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-[11px] font-bold text-cyan-300 mb-2 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>TERMINAL BOOTH OPERATOR CONTROL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-outfit text-white tracking-tight flex items-center gap-2">
            <span>Gate Shift Terminal</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Logged in as <span className="text-white font-bold">{user?.name}</span> (ID: <span className="font-mono text-cyan-300 font-bold">{user?.operatorId}</span>). Daily vehicle check-in, exit billing calculations, pass verification, and token audit ledger.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchOperatorData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-white/10 transition active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/entry"
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950 transition active:scale-95"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Fast Entry</span>
          </Link>
          <Link
            to="/exit"
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-950 transition active:scale-95"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Process Exit</span>
          </Link>
        </div>
      </div>

      {/* Role Notice & Security Boundary */}
      <div className="px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong>Operator Access Level:</strong> Authorized for daily terminal vehicle entries, exits, token generation, and pass issuances. Tariff pricing alterations and user account administration are restricted to System Administrators.
        </span>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Shift Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Vehicles Inside */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vehicles Inside</span>
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-outfit text-white">
            {summary.vehiclesInside || 0}
          </div>
          <div className="text-[11px] text-cyan-400 mt-1 font-medium">Currently parked in plaza</div>
        </div>

        {/* Entries Today */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Entries Today</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-outfit text-white">
            {summary.entriesToday || 0}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-medium">Tokens dispatched</div>
        </div>

        {/* Exits Processed */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Exits Cleared</span>
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-outfit text-white">
            {summary.exitsToday || 0}
          </div>
          <div className="text-[11px] text-indigo-400 mt-1 font-medium">Clearances billed</div>
        </div>

        {/* Active Passes */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Passes</span>
            <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-outfit text-white">
            {summary.activePasses || 0}
          </div>
          <div className="text-[11px] text-purple-400 mt-1 font-medium">Commuters verified</div>
        </div>
      </div>

      {/* Prominent Quick-Action Gate Operations Grid */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-sm space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
          Gate Quick Action Launchpad
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/entry"
            className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 hover:border-emerald-400 transition group hover:shadow-lg hover:shadow-emerald-950/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">Generate Vehicle Entry</div>
                <div className="text-xs text-slate-400 mt-0.5">Fast plate entry & QR token print</div>
              </div>
            </div>
          </Link>

          <Link
            to="/exit"
            className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-slate-900 border border-cyan-500/30 hover:border-cyan-400 transition group hover:shadow-lg hover:shadow-cyan-950/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">Process Vehicle Exit</div>
                <div className="text-xs text-slate-400 mt-0.5">24h railway tariff calculation & collection</div>
              </div>
            </div>
          </Link>

          <Link
            to="/monthly-pass"
            className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/60 to-slate-900 border border-purple-500/30 hover:border-purple-400 transition group hover:shadow-lg hover:shadow-purple-950/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">Issue Monthly Pass</div>
                <div className="text-xs text-slate-400 mt-0.5">1, 6, 12 month daily commuter pass</div>
              </div>
            </div>
          </Link>

          <Link
            to="/tokens"
            className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 hover:border-indigo-500/50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">All Parking Tokens</div>
                <div className="text-xs text-slate-400 mt-0.5">Lookup inside & completed tokens</div>
              </div>
            </div>
          </Link>

          <Link
            to="/passes"
            className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 hover:border-indigo-500/50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">Monthly Pass Ledger</div>
                <div className="text-xs text-slate-400 mt-0.5">Search passes & process renewals</div>
              </div>
            </div>
          </Link>

          <Link
            to="/vehicles"
            className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 hover:border-indigo-500/50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">Vehicle Plate Search</div>
                <div className="text-xs text-slate-400 mt-0.5">Check visit history & pass validity</div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Active Vehicles Inside Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Live Parked Vehicles (Inside Lot)
            </h2>
            <p className="text-xs text-slate-400">Rapid exit billing shortcuts</p>
          </div>
          <Link to="/tokens" className="text-xs font-bold text-cyan-400 hover:text-cyan-300">
            View All &rarr;
          </Link>
        </div>

        {insideTokens.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs bg-slate-950/40 rounded-xl border border-white/5">
            No vehicles currently parked inside the lot.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-950/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-mono border-b border-white/5">
                <tr>
                  <th className="py-2.5 px-3">Token #</th>
                  <th className="py-2.5 px-3">Vehicle Plate</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Entry Time</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {insideTokens.map((t) => (
                  <tr key={t._id} className="hover:bg-white/5 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-300">{t.tokenNumber}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{t.vehicleNumber}</td>
                    <td className="py-2.5 px-3 capitalize text-slate-300">{t.vehicleType}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{formatDateTime(t.entryTime)}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => navigate(`/exit?token=${t.tokenNumber}`)}
                        className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-[11px] transition shadow-xs active:scale-95"
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
