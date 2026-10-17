import React, { useState } from 'react';
import {
  Search,
  Camera,
  CheckCircle,
  AlertCircle,
  Clock,
  IndianRupee,
  CreditCard,
  Printer,
  ShieldCheck,
  Check,
  Wallet,
  Zap,
  ArrowRight
} from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import {
  formatCurrency,
  formatDateTime,
  formatDuration,
  CATEGORY_LABELS,
  normalizeVehicleNumber
} from '../utils/formatters.js';
import { QRScannerModal } from '../components/common/QRScannerModal.jsx';
import { ReceiptModal } from '../components/common/ReceiptModal.jsx';
import './ExitPage.css';

export function ExitPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [activeSession, setActiveSession] = useState(null);
  const [liveCharge, setLiveCharge] = useState(null);

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentReference, setPaymentReference] = useState('');
  const [processingExit, setProcessingExit] = useState(false);
  const [exitError, setExitError] = useState(null);

  // Modals
  const [showScanner, setShowScanner] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const handleLookup = async (queryToSearch) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q) return;

    setSearching(true);
    setSearchError(null);
    setActiveSession(null);
    setLiveCharge(null);
    setExitError(null);

    try {
      const res = await api.get(`/parking/lookup?query=${encodeURIComponent(q)}`);
      if (res.data?.success && res.data?.token) {
        setActiveSession(res.data.token);
        setLiveCharge(res.data.liveCharge);
        // Default to PASS payment method if pass holder
        if (res.data.liveCharge?.isCoveredByPass) {
          setPaymentMethod('PASS');
        } else {
          setPaymentMethod('CASH');
        }
      }
    } catch (err) {
      setSearchError(getErrorMessage(err));
    } finally {
      setSearching(false);
    }
  };

  const handleScanSuccess = (scannedText) => {
    setSearchQuery(scannedText);
    handleLookup(scannedText);
  };

  const handleProcessExit = async () => {
    if (!activeSession) return;
    setProcessingExit(true);
    setExitError(null);

    try {
      const res = await api.post(`/parking/tokens/${activeSession._id}/exit`, {
        paymentMethod,
        paymentReference: paymentReference.trim()
      });

      if (res.data?.success) {
        setCompletedReceipt(res.data.receipt);
        setShowReceipt(true);
        // Clear active session
        setActiveSession(null);
        setLiveCharge(null);
        setSearchQuery('');
        setPaymentReference('');
      }
    } catch (err) {
      setExitError(getErrorMessage(err));
    } finally {
      setProcessingExit(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* Page Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#00A884]/10 border border-[#00A884]/30 rounded-full text-[11px] font-bold text-[#00A884] mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-pulse" />
          <span>VEHICLE CHECK-OUT • BARRIER GATE EXIT</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">
          Vehicle Exit & Fee Settlement
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Scan QR barcode or enter token / vehicle plate to calculate parking duration and charges
        </p>
      </div>

      {/* Lookup Card */}
      <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-slate-200/90 dark:border-white/10 p-5 sm:p-7 space-y-3 shadow-sm dark:shadow-2xl">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
          Find Active Parking Session
        </label>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Scan Barcode / Token (SRF-...) or Plate (MH12...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              className="w-full pl-12 pr-10 py-3.5 text-base sm:text-lg font-mono font-black uppercase bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                aria-label="Clear query"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleLookup()}
              disabled={searching || !searchQuery.trim()}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-[#00A884] hover:bg-[#008F6F] active:scale-[0.99] text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 shadow-md min-h-[48px]"
            >
              {searching ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Lookup</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="px-4 py-3.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-[#00A884] font-bold rounded-2xl transition flex items-center justify-center gap-2 text-sm border border-slate-200 dark:border-[#00A884]/30 min-h-[48px]"
            >
              <Camera className="w-5 h-5 text-[#00A884]" />
              <span className="text-xs">Camera Scan</span>
            </button>
          </div>
        </div>

        {searchError && (
          <div className="mt-3 p-3 bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* Active Session Billing Details Card */}
      {activeSession && liveCharge && (
        <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-lg dark:shadow-2xl overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-[#00A884] p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#008F6F]">
            <div>
              <div className="text-xs text-emerald-100 font-mono font-semibold uppercase">
                Active Session Found
              </div>
              <div className="text-xl sm:text-2xl font-mono font-black text-white mt-0.5">
                {activeSession.tokenNumber}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider text-white border border-white/20">
                {activeSession.vehicleNumber}
              </span>
              <span className="bg-black/20 px-3 py-1 rounded-full text-xs font-semibold capitalize text-white">
                {CATEGORY_LABELS[activeSession.vehicleType] || activeSession.vehicleType}
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-8 space-y-6">
            {/* Tariff & Timing Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-white/5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-mono">
                  Entry Time
                </span>
                <span className="font-semibold text-xs text-slate-900 dark:text-white mt-1 block">
                  {formatDateTime(activeSession.entryTime)}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-white/5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-mono">
                  Duration
                </span>
                <span className="font-bold text-xs text-[#00A884] mt-1 block">
                  {formatDuration(liveCharge.durationMinutes)}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-white/5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-mono">
                  Billable Units
                </span>
                <span className="font-bold text-xs text-slate-900 dark:text-white mt-1 block">
                  {liveCharge.billableUnits} Slab(s)
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-white/5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-mono">
                  Rate Policy
                </span>
                <span className="font-semibold text-xs text-[#00A884] mt-1 block">
                  ₹{liveCharge.firstSlabAmount} + ₹{liveCharge.additionalDayAmount}/slab
                </span>
              </div>
            </div>

            {/* Monthly Pass Coverage Banner */}
            {liveCharge.isCoveredByPass && (
              <div className="p-4 bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-sm text-purple-900 dark:text-purple-200">
                    Active Monthly Pass Holder
                  </div>
                  <div className="text-purple-700 dark:text-purple-300 mt-0.5">
                    Pass: <strong>{liveCharge.passDetails?.passNumber}</strong> (Customer: {liveCharge.passDetails?.customerName}).
                    Parking fee is fully exempt (₹0).
                  </div>
                </div>
              </div>
            )}

            {/* Calculated Fee Highlight Box */}
            <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-mono">
                  Total Parking Fee Payable
                </span>
                <div className="text-3xl font-black font-mono text-[#00A884] mt-1">
                  {formatCurrency(liveCharge.amountToPay)}
                </div>
                {liveCharge.isGracePeriod && (
                  <span className="text-xs text-[#00A884] font-semibold">
                    Within free grace period
                  </span>
                )}
              </div>

              {/* Payment Method Selector */}
              {!liveCharge.isCoveredByPass && liveCharge.amountToPay > 0 && (
                <div className="w-full sm:w-auto">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-4 sm:flex gap-2">
                    {['CASH', 'UPI', 'CARD', 'OTHER'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition border text-center ${
                          paymentMethod === method
                            ? 'bg-[#00A884] text-white border-[#00A884] shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div className="mt-3">
                      <input
                        type="text"
                        placeholder="UPI Transaction ID / UTR (Optional)"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#00A884]"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {exitError && (
              <div className="p-3 bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{exitError}</span>
              </div>
            )}

            {/* Confirm Checkout Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleProcessExit}
                disabled={processingExit}
                className="w-full min-h-[56px] py-4 px-6 bg-[#00A884] hover:bg-[#008F6F] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processingExit ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-white shrink-0" />
                    <span>
                      Collect {formatCurrency(liveCharge.amountToPay)} & Complete Vehicle Exit
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* Exit Receipt Modal */}
      <ReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        data={completedReceipt}
        type="exit"
      />
    </div>
  );
}
