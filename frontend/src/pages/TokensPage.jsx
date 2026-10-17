import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Search,
  Filter,
  Download,
  Printer,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Car
} from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { ReceiptModal } from '../components/common/ReceiptModal.jsx';
import {
  formatCurrency,
  formatDateTime,
  formatDuration
} from '../utils/formatters.js';
import './TokensPage.css';

const CATEGORY_LABELS = {
  bike: 'Two Wheeler',
  car: 'Four Wheeler',
  lorry: 'Lorry',
  jcb: 'JCB',
  bus: 'Bus / Van',
  truck: 'Big Vehicles',
  auto: 'Auto Rickshaw',
  cycle: 'Bicycle',
  tempo: 'Tempo / Carrier',
  helmet: 'Helmet Deposit',
  locker: 'Locker Deposit'
};

export function TokensPage() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Mobile filters toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Modals
  const [selectedToken, setSelectedToken] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptType, setReceiptType] = useState('entry'); // 'entry' | 'exit'

  // Cancellation Modal
  const [cancellingToken, setCancellingToken] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingLoading, setCancellingLoading] = useState(false);

  const fetchTokens = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 15,
        sort: '-entryTime'
      };
      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;
      if (vehicleType) params.vehicleType = vehicleType;
      if (paymentMethod) params.paymentMethod = paymentMethod;

      const res = await api.get('/tokens', { params });
      if (res.data?.success) {
        setTokens(res.data.tokens || []);
        setTotalPages(res.data.pages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, [page, status, vehicleType, paymentMethod]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTokens();
  };

  const handlePrintReceipt = (token) => {
    setSelectedToken(token);
    setReceiptType(token.status === 'INSIDE' ? 'entry' : 'exit');
    setShowReceiptModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingToken || !cancelReason.trim()) return;
    setCancellingLoading(true);
    try {
      const res = await api.post(`/tokens/${cancellingToken._id}/cancel`, {
        reason: cancelReason.trim()
      });
      if (res.data?.success) {
        setCancellingToken(null);
        setCancelReason('');
        fetchTokens();
      }
    } catch (err) {
      alert(`Cancellation failed: ${getErrorMessage(err)}`);
    } finally {
      setCancellingLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!tokens.length) return;
    const headers = [
      'Token Number',
      'Vehicle Number',
      'Vehicle Type',
      'Status',
      'Entry Time',
      'Exit Time',
      'Duration (Mins)',
      'Billable Days',
      'Amount Billed (INR)',
      'Amount Paid (INR)',
      'Payment Status',
      'Payment Method'
    ];

    const rows = tokens.map(t => [
      t.tokenNumber,
      t.vehicleNumber,
      t.vehicleType,
      t.status,
      new Date(t.entryTime).toISOString(),
      t.exitTime ? new Date(t.exitTime).toISOString() : '',
      t.durationMinutes || 0,
      t.billableUnits || 1,
      t.amountBilled || 0,
      t.amountPaid || 0,
      t.paymentStatus || '',
      t.paymentMethod || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `srf_tokens_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Parking Token Repository
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Search, filter, reprint slips, and export historical parking token sessions ({totalCount} total)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchTokens}
            className="p-2.5 bg-white dark:bg-[#111B21] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Download className="w-4 h-4 text-[#00A884]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-slate-200/90 dark:border-white/10 p-3.5 sm:p-4 shadow-xs dark:shadow-md space-y-3">
        <form onSubmit={handleSearchSubmit} className="space-y-2.5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Token # or Vehicle Reg..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 sm:py-2 text-xs font-mono uppercase bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-[#00A884] focus:bg-white dark:focus:bg-slate-950 transition"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`md:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition ${
                showMobileFilters || status || vehicleType || paymentMethod
                  ? 'bg-[#00A884]/15 border-[#00A884] text-[#00755B] dark:text-[#2DD4BF]'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            <button
              type="submit"
              className="hidden md:inline-flex px-4 py-2 bg-[#00A884] hover:bg-[#008F6F] text-white font-bold text-xs rounded-xl transition shadow-xs"
            >
              Search
            </button>
          </div>

          <div className={`${showMobileFilters ? 'flex' : 'hidden md:flex'} flex-wrap items-center gap-2 pt-1`}>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="flex-1 sm:flex-none px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#00A884] text-slate-800 dark:text-slate-200"
            >
              <option value="">All Statuses</option>
              <option value="INSIDE">INSIDE</option>
              <option value="EXITED">EXITED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            <select
              value={vehicleType}
              onChange={(e) => { setVehicleType(e.target.value); setPage(1); }}
              className="flex-1 sm:flex-none px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#00A884] text-slate-800 dark:text-slate-200"
            >
              <option value="">All Vehicle Types</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            <select
              value={paymentMethod}
              onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }}
              className="flex-1 sm:flex-none px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#00A884] text-slate-800 dark:text-slate-200"
            >
              <option value="">All Payment Modes</option>
              <option value="CASH">CASH</option>
              <option value="UPI">UPI</option>
              <option value="CARD">CARD</option>
              <option value="PASS">PASS</option>
            </select>

            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-[#00A884] hover:bg-[#008F6F] text-white font-bold text-xs rounded-xl transition"
            >
              Apply Filter
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Tokens Table & Mobile Cards Card */}
      <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs dark:shadow-md overflow-hidden">
        {/* Mobile View: High-Density Interactive Cards (< md) */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-white/5">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-700 border-t-[#00A884] rounded-full animate-spin mx-auto mb-2" />
              <span>Loading parking records...</span>
            </div>
          ) : tokens.length > 0 ? (
            tokens.map((token) => (
              <div key={token._id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-850 transition space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs text-[#00A884] dark:text-[#2DD4BF]">
                      {token.tokenNumber}
                    </span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-xs px-2 py-0.5 rounded border border-slate-200 dark:border-white/10">
                      {token.vehicleNumber}
                    </span>
                  </div>
                  <StatusBadge status={token.status} />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span className="capitalize text-slate-500 dark:text-slate-400 font-medium">
                    {CATEGORY_LABELS[token.vehicleType] || token.vehicleType}
                    {token.durationMinutes ? ` • ${formatDuration(token.durationMinutes)}` : ''}
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {token.amountPaid ? formatCurrency(token.amountPaid) : (token.amountBilled ? formatCurrency(token.amountBilled) : '-')}
                    </span>
                    {token.paymentMethod && token.paymentMethod !== 'NONE' && (
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">
                        {token.paymentMethod}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-white/5">
                  <span>In: {formatDateTime(token.entryTime)}</span>
                  <span>{token.exitTime ? `Out: ${formatDateTime(token.exitTime)}` : 'Inside now'}</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1.5 border-t border-slate-100 dark:border-white/5">
                  <button
                    onClick={() => handlePrintReceipt(token)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Slip</span>
                  </button>
                  {token.status === 'INSIDE' && (
                    <button
                      onClick={() => setCancellingToken(token)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 font-semibold text-xs rounded-xl transition border border-rose-200 dark:border-rose-800"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No token records match your criteria.
            </div>
          )}
        </div>

        {/* Desktop View: Full Table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                <th className="py-3 px-4">Token #</th>
                <th className="py-3 px-4">Vehicle Reg</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Entry Time</th>
                <th className="py-3 px-4">Exit Time</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Billed</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-700 border-t-[#00A884] rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading parking records...</span>
                  </td>
                </tr>
              ) : tokens.length > 0 ? (
                tokens.map((token) => (
                  <tr key={token._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#00A884] dark:text-[#2DD4BF]">
                      {token.tokenNumber}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-900 dark:text-white border border-slate-200 dark:border-white/10">
                        {token.vehicleNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-700 dark:text-slate-300">
                      {CATEGORY_LABELS[token.vehicleType] || token.vehicleType}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {formatDateTime(token.entryTime)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {token.exitTime ? formatDateTime(token.exitTime) : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {token.exitTime ? formatDuration(token.durationMinutes) : '-'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {token.amountBilled ? formatCurrency(token.amountBilled) : '-'}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#00755B] dark:text-emerald-400">
                      {token.amountPaid ? formatCurrency(token.amountPaid) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase">
                        {token.paymentMethod !== 'NONE' ? token.paymentMethod : '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={token.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handlePrintReceipt(token)}
                          title="Print / View Slip"
                          className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {token.status === 'INSIDE' && (
                          <button
                            onClick={() => setCancellingToken(token)}
                            title="Cancel Session"
                            className="p-1.5 text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    No token records match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div>
              Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cancellation Modal */}
      {cancellingToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111B21] rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-slate-200 dark:border-white/10">
            <div className="text-rose-600 dark:text-rose-400 font-bold text-base flex items-center gap-2">
              <XCircle className="w-5 h-5" /> Cancel Parking Token
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to cancel token <strong>{cancellingToken.tokenNumber}</strong> for vehicle {cancellingToken.vehicleNumber}?
            </p>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Reason for Cancellation (Required):
              </label>
              <textarea
                rows={2}
                required
                placeholder="e.g. Operator entered wrong number, immediate turnaround"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setCancellingToken(null); setCancelReason(''); }}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl"
              >
                Keep Active
              </button>
              <button
                type="button"
                disabled={cancellingLoading || !cancelReason.trim()}
                onClick={handleConfirmCancel}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50"
              >
                {cancellingLoading ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        data={selectedToken}
        type={receiptType}
      />
    </div>
  );
}
