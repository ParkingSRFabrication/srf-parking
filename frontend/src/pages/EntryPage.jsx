import React, { useState } from 'react';
import {
  Bike,
  Car,
  Bus,
  Truck,
  HardHat,
  Package,
  PlusCircle,
  AlertTriangle,
  CheckCircle,
  Printer,
  ShieldAlert,
  Compass,
  Sparkles
} from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import { ReceiptModal } from '../components/common/ReceiptModal.jsx';
import { normalizeVehicleNumber } from '../utils/formatters.js';
import './EntryPage.css';

const VEHICLE_CATEGORIES = [
  { id: 'bike', label: 'Two Wheeler', sub: 'Bike / Scooter', icon: Bike, badge: '₹20' },
  { id: 'car', label: 'Four Wheeler', sub: 'Car / Sedan / SUV', icon: Car, badge: '₹50' },
  { id: 'auto', label: 'Auto Rickshaw', sub: 'Three Wheeler', icon: Compass, badge: '₹30' },
  { id: 'cycle', label: 'Bicycle', sub: 'Pedal Cycle', icon: Bike, badge: '₹10' },
  { id: 'bus', label: 'Bus / Van', sub: 'Heavy Passenger', icon: Bus, badge: '₹100' },
  { id: 'truck', label: 'Commercial Truck', sub: 'Heavy Goods', icon: Truck, badge: '₹150' },
  { id: 'tempo', label: 'Tempo / Carrier', sub: 'Light Goods', icon: Truck, badge: '₹80' },
  { id: 'helmet', label: 'Helmet Deposit', sub: 'Cloakroom Locker', icon: HardHat, badge: '₹10' },
  { id: 'locker', label: 'Locker Deposit', sub: 'Luggage Storage', icon: Package, badge: '₹30' },
];

export function EntryPage() {
  const [vehicleType, setVehicleType] = useState('bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const [createdToken, setCreatedToken] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const handleVehicleNumberChange = (e) => {
    setVehicleNumber(normalizeVehicleNumber(e.target.value));
    setDuplicateWarning(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDuplicateWarning(null);

    try {
      const res = await api.post('/parking/entries', {
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        vehicleType,
        customerPhone: customerPhone.trim(),
        notes: notes.trim()
      });

      if (res.data?.success && res.data?.token) {
        setCreatedToken(res.data.token);
        setShowReceipt(true);
        // Reset form for next entry
        setVehicleNumber('');
        setCustomerPhone('');
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
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-slate-100">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] font-bold text-emerald-400 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>VEHICLE CHECK-IN • BARRIER GATE 01</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-outfit text-white tracking-tight">
          Issue Entry Token
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Select vehicle category and record registration plate to generate barcode slip
        </p>
      </div>

      {/* Duplicate Open Session Alert */}
      {duplicateWarning && (
        <div className="p-4 bg-amber-500/15 border-2 border-amber-500/40 rounded-2xl flex items-start gap-3 text-amber-200 animate-shake">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-sm block mb-1 text-amber-300">
              Duplicate Vehicle Entry Prevented!
            </span>
            <p>{duplicateWarning.message}</p>
            {duplicateWarning.existingToken && (
              <div className="mt-2 p-2.5 bg-amber-950/60 rounded-xl font-mono text-xs border border-amber-500/30">
                <span>Existing Token: <strong>{duplicateWarning.existingToken.tokenNumber}</strong></span>
                <span className="mx-2">•</span>
                <span>Entered: {new Date(duplicateWarning.existingToken.entryTime).toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generic Error */}
      {error && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Entry Form Card */}
      <div className="glass-panel rounded-3xl border border-white/10 p-5 sm:p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Select Category */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 font-mono">
              1. Select Vehicle / Item Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2.5">
              {VEHICLE_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = vehicleType === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setVehicleType(cat.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between relative overflow-hidden ${
                      isSelected
                        ? 'border-cyan-400 bg-indigo-600/30 shadow-glow'
                        : 'border-white/5 bg-slate-900/60 hover:border-white/20 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                        isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {cat.badge}
                      </span>
                    </div>
                    <div>
                      <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {cat.label}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {cat.sub}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Vehicle Registration & Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
            {/* Vehicle Number */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                2. Vehicle Registration Number (Required)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. MH12AB1234 or DL01CA9999"
                  value={vehicleNumber}
                  onChange={handleVehicleNumberChange}
                  className="w-full px-4 py-3.5 pr-12 text-xl sm:text-2xl font-mono font-black tracking-widest uppercase bg-slate-950 border-2 border-white/10 rounded-2xl text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
                {vehicleNumber && (
                  <button
                    type="button"
                    onClick={() => setVehicleNumber('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
                    aria-label="Clear vehicle registration"
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Enter without spaces. Automatically converted to uppercase.
              </p>
            </div>

            {/* Customer Mobile */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Customer Mobile Number (Optional)
              </label>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full px-4 py-3 text-sm bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Operational Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Helmet kept on bike, scratch on door"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={loading || !vehicleNumber}
              className="w-full min-h-[52px] py-4 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-glowEmerald transition flex items-center justify-center gap-2 disabled:opacity-50 transform active:scale-[0.99]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Printer className="w-5 h-5 text-emerald-200 shrink-0" />
                  <span>Generate Entry Token & Print Thermal Slip</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Entry Receipt Modal */}
      <ReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        data={createdToken}
        type="entry"
      />
    </div>
  );
}
