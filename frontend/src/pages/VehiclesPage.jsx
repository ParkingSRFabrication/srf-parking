import React, { useState } from 'react';
import {
  Search,
  Car,
  History,
  CalendarCheck,
  IndianRupee,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import {
  formatCurrency,
  formatDateTime,
  formatDate,
  formatDuration,
  CATEGORY_LABELS,
  normalizeVehicleNumber
} from '../utils/formatters.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import './VehiclesPage.css';

export function VehiclesPage() {
  const [searchReg, setSearchReg] = useState('');
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const clean = normalizeVehicleNumber(searchReg);
    if (!clean) return;

    setLoading(true);
    setError(null);
    setVehicleData(null);

    try {
      const res = await api.get(`/vehicles/${clean}/history`);
      if (res.data?.success) {
        setVehicleData(res.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const vehicle = vehicleData?.vehicle;
  const stats = vehicleData?.stats || {};
  const currentOpenSession = vehicleData?.currentOpenSession;
  const currentActivePass = vehicleData?.currentActivePass;
  const tokens = vehicleData?.tokens || [];
  const passes = vehicleData?.passes || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#00A884]/10 border border-[#00A884]/30 rounded-full text-[11px] font-bold text-[#00A884] mb-1 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-pulse" />
          <span>VEHICLE LOOKUP & TELEMETRY LEDGER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">
          Vehicle Parking History & Profile
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Lookup lifetime visits, active sessions, previous payments, and commuter passes by registration number
        </p>
      </div>

      {/* Search Bar Card */}
      <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-slate-200/90 dark:border-white/10 p-6 shadow-sm dark:shadow-2xl">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Vehicle Number (e.g. MH12AB1234)..."
              value={searchReg}
              onChange={(e) => setSearchReg(e.target.value.toUpperCase())}
              className="w-full pl-12 pr-4 py-3 text-sm font-mono font-bold uppercase bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchReg.trim()}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#00A884] hover:bg-[#008F6F] active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition disabled:opacity-50 min-h-[48px]"
          >
            {loading ? 'Searching...' : 'Lookup Vehicle'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3.5 bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Vehicle Profile Details */}
      {vehicleData && (
        <div className="space-y-6 animate-slide-up">
          {/* Header Summary Card */}
          <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-slate-200/90 dark:border-white/10 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#00A884]/15 border border-[#00A884]/30 text-[#00A884] flex items-center justify-center font-mono font-black text-xl shadow-xs">
                <Car className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xl font-mono font-black text-slate-900 dark:text-white tracking-wider">
                  {vehicle.registrationNumber}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {CATEGORY_LABELS[vehicle.type] || vehicle.type}
                  {vehicle.ownerName && ` • Owner: ${vehicle.ownerName}`}
                  {vehicle.ownerPhone && ` (${vehicle.ownerPhone})`}
                </div>
              </div>
            </div>

            {/* Quick Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {currentOpenSession ? (
                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#00A884]/15 text-[#00A884] border border-[#00A884]/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00A884] animate-pulse" />
                  Currently Inside Station
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                  Not Inside
                </span>
              )}

              {currentActivePass && (
                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Active Monthly Pass
                </span>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white dark:bg-[#111B21] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                Total Visits
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {stats.totalVisits || 0}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-[#111B21] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                Lifetime Revenue
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#00A884] mt-1 block truncate">
                {formatCurrency(stats.totalLifetimeRevenue || 0)}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-[#111B21] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                Issued Passes
              </span>
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
                {passes.length}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-[#111B21] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                Current Token
              </span>
              <span className="text-sm font-mono font-bold text-[#00A884] mt-1.5 block truncate">
                {currentOpenSession ? currentOpenSession.tokenNumber : 'None'}
              </span>
            </div>
          </div>

          {/* Historical Parking Sessions Table */}
          <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
                Historical Parking Tokens ({tokens.length} Sessions)
              </h2>
            </div>

            {/* Mobile View: Cards (< md) */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-white/5">
              {tokens.length > 0 ? (
                tokens.map(t => (
                  <div key={t._id} className="p-3.5 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{t.tokenNumber}</span>
                      <StatusBadge status={t.status} />
                    </div>
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                      <span>In: {formatDateTime(t.entryTime)}</span>
                      <span>{t.exitTime ? `Out: ${formatDateTime(t.exitTime)}` : 'Inside now'}</span>
                    </div>
                    <div className="flex items-center justify-between font-semibold pt-1">
                      <span className="text-slate-600 dark:text-slate-400">
                        {t.durationMinutes ? formatDuration(t.durationMinutes) : '-'} • {t.paymentMethod || 'NONE'}
                      </span>
                      <span className="text-[#00A884] font-bold font-mono">
                        {t.amountPaid ? formatCurrency(t.amountPaid) : (t.amountBilled ? formatCurrency(t.amountBilled) : '-')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No parking token history found for this vehicle.
                </div>
              )}
            </div>

            {/* Desktop View: Table (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-white/10 font-mono">
                    <th className="py-3 px-4">Token #</th>
                    <th className="py-3 px-4">Entry Time</th>
                    <th className="py-3 px-4">Exit Time</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Billed Amount</th>
                    <th className="py-3 px-4">Paid Amount</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {tokens.length > 0 ? (
                    tokens.map(t => (
                      <tr key={t._id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {t.tokenNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {formatDateTime(t.entryTime)}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {t.exitTime ? formatDateTime(t.exitTime) : '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {t.exitTime ? formatDuration(t.durationMinutes) : '-'}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200 font-mono">
                          {t.amountBilled ? formatCurrency(t.amountBilled) : '-'}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#00A884] font-mono">
                          {t.amountPaid ? formatCurrency(t.amountPaid) : '-'}
                        </td>
                        <td className="py-3 px-4 uppercase text-slate-600 dark:text-slate-400">
                          {t.paymentMethod || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={t.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No parking token history found for this vehicle.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
