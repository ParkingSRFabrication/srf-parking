import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  RefreshCw,
  IndianRupee,
  Car,
  CreditCard,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import {
  formatCurrency,
  formatDateTime,
  formatDate,
  CATEGORY_LABELS
} from '../utils/formatters.js';

export function ReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date filters
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [preset, setPreset] = useState('today');
  const [paymentMethod, setPaymentMethod] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        ...(paymentMethod && { paymentMethod })
      });

      const res = await api.get(`/reports/detailed?${params.toString()}`);
      if (res.data?.success) {
        setReportData(res.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, paymentMethod]);

  const handlePresetChange = (p) => {
    setPreset(p);
    const now = new Date();
    if (p === 'today') {
      const d = now.toISOString().split('T')[0];
      setStartDate(d);
      setEndDate(d);
    } else if (p === 'yesterday') {
      const y = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
      setStartDate(y);
      setEndDate(y);
    } else if (p === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const today = now.toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(today);
    }
  };

  const metrics = reportData?.metrics || {};
  const payments = reportData?.payments || [];
  const paymentMethodsSummary = reportData?.paymentMethodsSummary || {};

  const handleExportCSV = () => {
    if (payments.length === 0) return;
    const headers = [
      'Payment ID',
      'Type',
      'Amount (INR)',
      'Method',
      'Status',
      'Transaction Ref',
      'Date & Time',
      'Operator'
    ];

    const rows = payments.map(p => [
      p.paymentId,
      p.type,
      p.amount,
      p.method,
      p.status,
      p.transactionReference || '',
      new Date(p.createdAt).toISOString(),
      p.operator?.name || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `srf_financial_report_${startDate}_to_${endDate}.csv`);
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
            Financial & Operational Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-grade accounting reports, parking collections vs passes, and payment method summaries
          </p>
        </div>

        <div className="flex items-center gap-2.5 no-print">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#142B4A] hover:bg-[#2457A7] text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Date Filters Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 no-print">
        {/* Preset Buttons */}
        <div className="flex items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'month', label: 'This Month' },
            { id: 'custom', label: 'Custom' }
          ].map(btn => (
            <button
              key={btn.id}
              type="button"
              onClick={() => handlePresetChange(btn.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                preset === btn.id
                  ? 'bg-[#142B4A] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Date Inputs */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPreset('custom'); }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPreset('custom'); }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          >
            <option value="">All Payment Modes</option>
            <option value="CASH">CASH</option>
            <option value="UPI">UPI</option>
            <option value="CARD">CARD</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Accounting KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Collected */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Net Collected Revenue
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {loading ? '...' : formatCurrency(metrics.netCollected ?? 0)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Gross minus recorded refunds
          </div>
        </div>

        {/* Parking Tokens Revenue */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Parking Token Revenue
          </div>
          <div className="text-2xl font-black text-[#2457A7] mt-1">
            {loading ? '...' : formatCurrency(metrics.parkingCollected ?? 0)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Standard daily / hourly exits
          </div>
        </div>

        {/* Monthly Pass Revenue */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Monthly Pass Revenue
          </div>
          <div className="text-2xl font-black text-purple-700 mt-1">
            {loading ? '...' : formatCurrency(metrics.passCollected ?? 0)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Commuter passes issued/renewed
          </div>
        </div>

        {/* Operational Movements */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Vehicle Movements
          </div>
          <div className="text-lg font-bold text-slate-800 mt-1">
            {metrics.totalEntries ?? 0} In / {metrics.totalExits ?? 0} Out
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Cancelled: {metrics.totalCancelled ?? 0}
          </div>
        </div>
      </div>

      {/* Payment Modes Breakdown Card */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          Collections by Payment Mode
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {['CASH', 'UPI', 'CARD', 'OTHER'].map(mode => (
            <div key={mode} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block uppercase font-bold text-[10px]">{mode}</span>
              <span className="text-base font-black text-slate-800 mt-0.5 block">
                {formatCurrency(paymentMethodsSummary[mode] ?? 0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Records Detail Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Underlying Payment Transactions ({payments.length} Records)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Reference Item</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Recorded Time</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading transactions...
                  </td>
                </tr>
              ) : payments.length > 0 ? (
                payments.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#142B4A]">
                      {p.paymentId}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.type === 'PARKING_TOKEN'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {p.type === 'PARKING_TOKEN' ? 'TOKEN' : 'PASS'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {p.parkingToken?.tokenNumber || p.monthlyPass?.passNumber || '-'}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3 px-4 uppercase font-semibold text-slate-600">
                      {p.method}
                      {p.transactionReference && (
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {p.transactionReference}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDateTime(p.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {p.operator?.name || 'Operator'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No payment records found for the selected period.
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
