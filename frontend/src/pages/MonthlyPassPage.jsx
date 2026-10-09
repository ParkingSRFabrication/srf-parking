import React, { useState } from 'react';
import {
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle,
  User,
  Phone,
  ShieldAlert,
  Car
} from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import { formatCurrency, formatDate, normalizeVehicleNumber, CATEGORY_LABELS } from '../utils/formatters.js';
import { ReceiptModal } from '../components/common/ReceiptModal.jsx';

export function MonthlyPassPage() {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('bike');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [durationMonths, setDurationMonths] = useState(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState(300);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentReference, setPaymentReference] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const [createdPass, setCreatedPass] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Suggested rates when duration or type changes
  const handleDurationChange = (months) => {
    setDurationMonths(months);
    const baseMonthRate = vehicleType === 'car' ? 600 : vehicleType === 'auto' ? 450 : 300;
    setAmount(baseMonthRate * months);
  };

  const handleTypeChange = (type) => {
    setVehicleType(type);
    const baseMonthRate = type === 'car' ? 600 : type === 'auto' ? 450 : 300;
    setAmount(baseMonthRate * durationMonths);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDuplicateWarning(null);

    try {
      const res = await api.post('/passes', {
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        vehicleType,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        durationMonths,
        startDate,
        amount: Number(amount),
        paymentMethod,
        paymentReference: paymentReference.trim(),
        notes: notes.trim()
      });

      if (res.data?.success && res.data?.pass) {
        setCreatedPass(res.data.pass);
        setShowReceipt(true);
        // Reset form
        setVehicleNumber('');
        setCustomerName('');
        setCustomerPhone('');
        setPaymentReference('');
        setNotes('');
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setDuplicateWarning(err.response.data);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-[#142B4A] tracking-tight">
          Issue Monthly Parking Pass
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Create long-term parking passes for daily railway commuters with calendar-month validity
        </p>
      </div>

      {/* Duplicate Warning */}
      {duplicateWarning && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3 text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-sm block mb-1">
              Active Pass Already Exists!
            </span>
            <p>{duplicateWarning.message}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Pass Duration Period
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { months: 1, label: '1 Month', desc: 'Standard Monthly' },
                { months: 6, label: '6 Months', desc: 'Half Yearly' },
                { months: 12, label: '12 Months', desc: 'Annual Commuter' }
              ].map((opt) => (
                <button
                  key={opt.months}
                  type="button"
                  onClick={() => handleDurationChange(opt.months)}
                  className={`p-3.5 rounded-2xl border text-center transition ${
                    durationMonths === opt.months
                      ? 'border-[#2457A7] bg-blue-50/70 shadow-xs ring-2 ring-[#2457A7]/20 font-bold text-[#142B4A]'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="text-sm font-bold">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Vehicle Registration (Required)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. KA03MG4567"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(normalizeVehicleNumber(e.target.value))}
                className="w-full px-4 py-2.5 font-mono font-bold text-sm uppercase bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2457A7] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Vehicle Category
              </label>
              <select
                value={vehicleType}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2457A7] focus:bg-white transition capitalize"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Commuter / Customer Name (Required)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Full name of pass holder"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2457A7] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mobile Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="10-digit mobile"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2457A7] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Dates & Billing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2457A7] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pass Fee Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 font-bold text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2457A7] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Collection Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2457A7]"
              >
                <option value="CASH">CASH</option>
                <option value="UPI">UPI</option>
                <option value="CARD">CARD</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Reference / Notes
              </label>
              <input
                type="text"
                placeholder="e.g. UPI UTR number or receipt reference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2457A7]"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading || !vehicleNumber || !customerName}
              className="w-full py-3.5 px-6 bg-[#142B4A] hover:bg-[#2457A7] text-white font-extrabold text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-5 h-5 text-purple-300" />
                  <span>Issue Pass ({formatCurrency(amount)}) & Generate Card Slip</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Pass Receipt Modal */}
      <ReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        data={createdPass}
        type="pass"
      />
    </div>
  );
}
