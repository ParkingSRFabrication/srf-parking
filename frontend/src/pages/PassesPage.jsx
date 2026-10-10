import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  RefreshCw,
  Download,
  Printer,
  RotateCw,
  XCircle,
  CalendarCheck,
  AlertTriangle,
  History,
  Filter,
  Phone
} from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  CATEGORY_LABELS
} from '../utils/formatters.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { ReceiptModal } from '../components/common/ReceiptModal.jsx';
import './PassesPage.css';

export function PassesPage() {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [expiringSoon, setExpiringSoon] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Modals
  const [selectedPass, setSelectedPass] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Renewal Modal
  const [renewingPass, setRenewingPass] = useState(null);
  const [renewalMonths, setRenewalMonths] = useState(1);
  const [renewalAmount, setRenewalAmount] = useState(300);
  const [renewalPaymentMethod, setRenewalPaymentMethod] = useState('CASH');
  const [renewalRef, setRenewalRef] = useState('');
  const [renewingLoading, setRenewingLoading] = useState(false);

  // History Modal
  const [historyPass, setHistoryPass] = useState(null);

  const fetchPasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        ...(search && { search }),
        ...(status && { status }),
        ...(vehicleType && { vehicleType }),
        ...(expiringSoon && { expiringSoon: 'true' })
      });

      const res = await api.get(`/passes?${params.toString()}`);
      if (res.data?.success) {
        setPasses(res.data.passes || []);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasses();
  }, [status, vehicleType, expiringSoon]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPasses();
  };

  const handleOpenRenew = (pass) => {
    setRenewingPass(pass);
    setRenewalMonths(1);
    const baseMonthRate = pass.vehicleType === 'car' ? 600 : pass.vehicleType === 'auto' ? 450 : 300;
    setRenewalAmount(baseMonthRate);
    setRenewalPaymentMethod('CASH');
    setRenewalRef('');
  };

  const handleConfirmRenew = async () => {
    if (!renewingPass) return;
    setRenewingLoading(true);
    try {
      const res = await api.post(`/passes/${renewingPass._id}/renew`, {
        durationMonths: renewalMonths,
        amount: Number(renewalAmount),
        paymentMethod: renewalPaymentMethod,
        paymentReference: renewalRef.trim()
      });

      if (res.data?.success) {
        setRenewingPass(null);
        setSelectedPass(res.data.pass);
        setShowReceiptModal(true);
        fetchPasses();
      }
    } catch (err) {
      alert(`Renewal failed: ${getErrorMessage(err)}`);
    } finally {
      setRenewingLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (passes.length === 0) return;
    const headers = [
      'Pass Number',
      'Vehicle Number',
      'Category',
      'Customer Name',
      'Customer Phone',
      'Duration (Months)',
      'Start Date',
      'Expiry Date',
      'Amount (INR)',
      'Status'
    ];

    const rows = passes.map(p => [
      p.passNumber,
      p.vehicleNumber,
      p.vehicleType,
      p.customerName,
      p.customerPhone,
      p.durationMonths,
      new Date(p.startDate).toISOString().split('T')[0],
      new Date(p.expiryDate).toISOString().split('T')[0],
      p.amount,
      p.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `srf_passes_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#142B4A] tracking-tight">
            Monthly Pass Repository
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage long-term passes, track renewal history, and check expiring commuter passes
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchPasses}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition shadow-xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="space-y-2.5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Pass #, Vehicle Reg, or Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 sm:py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2457A7] focus:bg-white"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`md:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition ${
                showMobileFilters || status || vehicleType || expiringSoon
                  ? 'bg-purple-50 border-purple-300 text-purple-700'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            <button
              type="submit"
              className="hidden md:inline-flex px-4 py-2 bg-[#142B4A] hover:bg-[#2457A7] text-white font-bold text-xs rounded-xl transition"
            >
              Search
            </button>
          </div>

          <div className={`${showMobileFilters ? 'flex' : 'hidden md:flex'} flex-wrap items-center gap-2 pt-1`}>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2457A7]"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2457A7]"
            >
              <option value="">All Vehicle Types</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            <label className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={expiringSoon}
                onChange={(e) => setExpiringSoon(e.target.checked)}
                className="rounded text-amber-600 focus:ring-0"
              />
              <span>Expiring Soon (≤ 5 Days)</span>
            </label>

            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-[#142B4A] hover:bg-[#2457A7] text-white font-bold text-xs rounded-xl transition"
            >
              Apply Filter
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Table & Mobile Cards Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Mobile View: Clean Interactive Cards (< md) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-slate-300 border-t-[#142B4A] rounded-full animate-spin mx-auto mb-2" />
              <span>Loading monthly passes...</span>
            </div>
          ) : passes.length > 0 ? (
            passes.map((pass) => (
              <div key={pass._id} className="p-4 hover:bg-slate-50 transition space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs text-[#142B4A]">
                      {pass.passNumber}
                    </span>
                    <span className="bg-slate-100 text-slate-900 font-mono font-bold text-xs px-2 py-0.5 rounded border border-slate-200">
                      {pass.vehicleNumber}
                    </span>
                  </div>
                  <StatusBadge status={pass.status} />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{pass.customerName}</span>
                    {pass.customerPhone && (
                      <a
                        href={`tel:${pass.customerPhone}`}
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{pass.customerPhone}</span>
                      </a>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">{formatCurrency(pass.amount)}</span>
                    <span className="block text-[10px] text-slate-500 capitalize">
                      {CATEGORY_LABELS[pass.vehicleType] || pass.vehicleType}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-50">
                  <span className="text-slate-500">From: {formatDate(pass.startDate)}</span>
                  <div className="flex items-center gap-1">
                    <span className={pass.isExpiringSoon ? 'text-amber-600 font-bold' : pass.isExpired ? 'text-rose-600 font-bold' : 'text-emerald-700 font-semibold'}>
                      Until: {formatDate(pass.expiryDate)}
                    </span>
                    {pass.isExpiringSoon && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold">
                        Expiring!
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1.5 border-t border-slate-100">
                  <button
                    onClick={() => { setSelectedPass(pass); setShowReceiptModal(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Card Slip</span>
                  </button>

                  {pass.renewalHistory?.length > 0 && (
                    <button
                      onClick={() => setHistoryPass(pass)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl transition"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>History</span>
                    </button>
                  )}

                  {pass.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleOpenRenew(pass)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-xl transition border border-emerald-200"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Renew</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No monthly passes found.
            </div>
          )}
        </div>

        {/* Desktop View: Full Table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Pass #</th>
                <th className="py-3 px-4">Vehicle Reg</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">Valid From</th>
                <th className="py-3 px-4">Valid Until</th>
                <th className="py-3 px-4">Fee Paid</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-slate-300 border-t-[#142B4A] rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading monthly passes...</span>
                  </td>
                </tr>
              ) : passes.length > 0 ? (
                passes.map((pass) => (
                  <tr key={pass._id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#142B4A]">
                      {pass.passNumber}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-900">
                        {pass.vehicleNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-700">
                      {CATEGORY_LABELS[pass.vehicleType] || pass.vehicleType}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {pass.customerName}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {pass.customerPhone || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDate(pass.startDate)}
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      <span className={pass.isExpiringSoon ? 'text-amber-600 font-bold' : pass.isExpired ? 'text-rose-600' : 'text-emerald-700'}>
                        {formatDate(pass.expiryDate)}
                      </span>
                      {pass.isExpiringSoon && (
                        <span className="ml-1 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                          Expiring!
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {formatCurrency(pass.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={pass.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => { setSelectedPass(pass); setShowReceiptModal(true); }}
                          title="Print Pass Card"
                          className="p-1.5 text-slate-600 hover:text-[#142B4A] hover:bg-slate-100 rounded-lg transition"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {pass.renewalHistory?.length > 0 && (
                          <button
                            onClick={() => setHistoryPass(pass)}
                            title="View Renewal History"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        )}

                        {pass.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleOpenRenew(pass)}
                            title="Renew Pass"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          >
                            <RotateCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No monthly passes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renewal Modal */}
      {renewingPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-4 border border-slate-200">
            <div className="text-[#142B4A] font-black text-lg flex items-center gap-2">
              <RotateCw className="w-5 h-5 text-emerald-600" /> Renew Monthly Pass
            </div>
            <p className="text-xs text-slate-600">
              Renewing pass <strong>{renewingPass.passNumber}</strong> for {renewingPass.customerName} ({renewingPass.vehicleNumber}).
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Extension Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 6, 12].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setRenewalMonths(m);
                        const base = renewingPass.vehicleType === 'car' ? 600 : renewingPass.vehicleType === 'auto' ? 450 : 300;
                        setRenewalAmount(base * m);
                      }}
                      className={`py-2 text-xs font-bold rounded-xl border ${
                        renewalMonths === m
                          ? 'bg-[#142B4A] text-white border-[#142B4A]'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {m} Month{m > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Renewal Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={renewalAmount}
                  onChange={(e) => setRenewalAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Payment Method
                  </label>
                  <select
                    value={renewalPaymentMethod}
                    onChange={(e) => setRenewalPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="CASH">CASH</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">CARD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Reference
                  </label>
                  <input
                    type="text"
                    placeholder="Ref / UTR"
                    value={renewalRef}
                    onChange={(e) => setRenewalRef(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRenewingPass(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={renewingLoading}
                onClick={handleConfirmRenew}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50"
              >
                {renewingLoading ? 'Processing...' : `Confirm (${formatCurrency(renewalAmount)})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renewal History Modal */}
      {historyPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="text-[#142B4A] font-black text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" /> Renewal History
              </span>
              <button onClick={() => setHistoryPass(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Pass #{historyPass.passNumber} — {historyPass.customerName}
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {historyPass.renewalHistory?.map((h, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl text-xs border border-slate-200 space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Renewal #{i + 1} ({h.durationMonths} Mo)</span>
                    <span className="text-emerald-700">{formatCurrency(h.amountPaid)}</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Date: {formatDateTime(h.renewedAt)}
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Extended: {formatDate(h.previousExpiryDate)} → <strong>{formatDate(h.newExpiryDate)}</strong>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setHistoryPass(null)}
              className="w-full py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Pass Receipt Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        data={selectedPass}
        type="pass"
      />
    </div>
  );
}
