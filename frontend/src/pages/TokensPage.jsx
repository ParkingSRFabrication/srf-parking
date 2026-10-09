import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Search,
  Filter,
  Download,
  Printer,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import {
  formatCurrency,
  formatDateTime,
  formatDuration,
  CATEGORY_LABELS
} from '../utils/formatters.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { ReceiptModal } from '../components/common/ReceiptModal.jsx';

export function TokensPage() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected token for receipt reprint or cancellation
  const [selectedToken, setSelectedToken] = useState(null);
  const [receiptType, setReceiptType] = useState('entry');
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Cancellation modal state
  const [cancellingToken, setCancellingToken] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingLoading, setCancellingLoading] = useState(false);

  const fetchTokens = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page,
        limit: 15,
        ...(search && { search }),
        ...(status && { status }),
        ...(vehicleType && { vehicleType }),
        ...(paymentMethod && { paymentMethod }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const res = await api.get(`/parking/tokens?${params.toString()}`);
      if (res.data?.success) {
        setTokens(res.data.tokens || []);
        setTotalPages(res.data.pagination?.pages || 1);
        setTotalCount(res.data.pagination?.total || 0);
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
    setReceiptType(token.status === 'EXITED' ? 'exit' : 'entry');
    setShowReceiptModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingToken || !cancelReason.trim()) return;
    setCancellingLoading(true);
    try {
      await api.post(`/parking/tokens/${cancellingToken._id}/cancel`, {
        reason: cancelReason.trim()
      });
      setCancellingToken(null);
      setCancelReason('');
      fetchTokens();
    } catch (err) {
      alert(`Cancellation failed: ${getErrorMessage(err)}`);
    } finally {
      setCancellingLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (tokens.length === 0) return;
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
    <div className="space-y-6 animate-fade-in">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#142B4A] tracking-tight">
            Parking Token Repository
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, filter, reprint slips, and export historical parking token sessions ({totalCount} total)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchTokens}
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
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Token Number or Vehicle Registration..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2457A7] focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2457A7]"
            >
              <option value="">All Statuses</option>
              <option value="INSIDE">INSIDE</option>
              <option value="EXITED">EXITED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            <select
              value={vehicleType}
              onChange={(e) => { setVehicleType(e.target.value); setPage(1); }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2457A7]"
            >
              <option value="">All Vehicle Types</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            <select
              value={paymentMethod}
              onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2457A7]"
            >
              <option value="">All Payment Modes</option>
              <option value="CASH">CASH</option>
              <option value="UPI">UPI</option>
              <option value="CARD">CARD</option>
              <option value="PASS">PASS</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-[#142B4A] hover:bg-[#2457A7] text-white font-bold text-xs rounded-xl transition"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Tokens Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-slate-300 border-t-[#142B4A] rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading parking records...</span>
                  </td>
                </tr>
              ) : tokens.length > 0 ? (
                tokens.map((token) => (
                  <tr key={token._id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#142B4A]">
                      {token.tokenNumber}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-900">
                        {token.vehicleNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-700">
                      {CATEGORY_LABELS[token.vehicleType] || token.vehicleType}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDateTime(token.entryTime)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {token.exitTime ? formatDateTime(token.exitTime) : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {token.exitTime ? formatDuration(token.durationMinutes) : '-'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {token.amountBilled ? formatCurrency(token.amountBilled) : '-'}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {token.amountPaid ? formatCurrency(token.amountPaid) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-semibold text-slate-600 uppercase">
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
                          className="p-1.5 text-slate-600 hover:text-[#142B4A] hover:bg-slate-100 rounded-lg transition"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {token.status === 'INSIDE' && (
                          <button
                            onClick={() => setCancellingToken(token)}
                            title="Cancel Session"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
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
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition flex items-center gap-1"
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
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-slate-200">
            <div className="text-rose-600 font-bold text-base flex items-center gap-2">
              <XCircle className="w-5 h-5" /> Cancel Parking Token
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel token <strong>{cancellingToken.tokenNumber}</strong> for vehicle {cancellingToken.vehicleNumber}?
            </p>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Reason for Cancellation (Required):
              </label>
              <textarea
                rows={2}
                required
                placeholder="e.g. Operator entered wrong number, immediate turnaround"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setCancellingToken(null); setCancelReason(''); }}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
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
