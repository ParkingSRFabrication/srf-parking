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
  ShieldAlert
} from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import { ReceiptModal } from '../components/common/ReceiptModal.jsx';
import { normalizeVehicleNumber } from '../utils/formatters.js';

const VEHICLE_CATEGORIES = [
  { id: 'bike', label: 'Two Wheeler', sub: 'Bike / Scooter', icon: Bike },
  { id: 'car', label: 'Four Wheeler', sub: 'Car / SUV', icon: Car },
  { id: 'auto', label: 'Auto Rickshaw', sub: 'Three Wheeler', icon: Car },
  { id: 'cycle', label: 'Bicycle', sub: 'Cycle', icon: Bike },
  { id: 'bus', label: 'Bus / Van', sub: 'Heavy Passenger', icon: Bus },
  { id: 'truck', label: 'Truck', sub: 'Heavy Goods', icon: Truck },
  { id: 'tempo', label: 'Tempo', sub: 'Carrier', icon: Truck },
  { id: 'helmet', label: 'Helmet Deposit', sub: 'Cloakroom', icon: HardHat },
  { id: 'locker', label: 'Locker Deposit', sub: 'Luggage Cloak', icon: Package },
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
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-[#142B4A] tracking-tight">
          New Vehicle Entry Token
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Select category and record vehicle registration to generate entry slip
        </p>
      </div>

      {/* Duplicate Open Session Alert */}
      {duplicateWarning && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3 text-amber-900 animate-shake">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-sm block mb-1">
              Duplicate Vehicle Entry Prevented!
            </span>
            <p>{duplicateWarning.message}</p>
            {duplicateWarning.existingToken && (
              <div className="mt-2 p-2.5 bg-amber-100/70 rounded-xl font-mono text-xs">
                <span>Existing Open Token: <strong>{duplicateWarning.existingToken.tokenNumber}</strong></span>
                <span className="mx-2">•</span>
                <span>Entered: {new Date(duplicateWarning.existingToken.entryTime).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generic Error */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Entry Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Select Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              1. Select Vehicle / Item Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {VEHICLE_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = vehicleType === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setVehicleType(cat.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#2457A7] bg-blue-50/70 shadow-sm ring-2 ring-[#2457A7]/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-[#2457A7]' : 'text-slate-400'}`} />
                    <div>
                      <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-[#142B4A]' : 'text-slate-800'}`}>
                        {cat.label}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {cat.sub}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Vehicle Registration & Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            {/* Vehicle Number */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                2. Vehicle Registration Number (Required)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. MH12AB1234 or DL01CA9999"
                  value={vehicleNumber}
                  onChange={handleVehicleNumberChange}
                  className="w-full px-4 py-3 text-lg font-mono font-bold tracking-widest uppercase bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-[#2457A7] focus:bg-white transition"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Enter without spaces. Automatically converted to uppercase.
              </p>
            </div>

            {/* Customer Mobile */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Customer Mobile Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2457A7] focus:bg-white transition"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Operational Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Helmet kept on bike, scratch on door"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2457A7] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading || !vehicleNumber}
              className="w-full py-3.5 px-6 bg-[#142B4A] hover:bg-[#2457A7] text-white font-extrabold text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <PlusCircle className="w-5 h-5 text-emerald-400" />
                  <span>Generate Entry Token & Print Slip</span>
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
