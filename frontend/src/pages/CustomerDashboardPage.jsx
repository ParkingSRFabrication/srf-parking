import React, { useState, useEffect } from 'react';
import {
  Car,
  Bike,
  PlusCircle,
  Trash2,
  CalendarCheck,
  Receipt,
  Clock,
  IndianRupee,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Printer,
  X,
  ExternalLink,
  RefreshCw,
  QrCode,
  MapPin
} from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency, formatDateTime } from '../utils/formatters.js';
import { BrandLogo } from '../components/common/BrandLogo.jsx';
import './DashboardPage.css';

export function CustomerDashboardPage({ defaultTab = 'overview' }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // New vehicle modal state
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newRegNumber, setNewRegNumber] = useState('');
  const [newVehicleType, setNewVehicleType] = useState('bike');
  const [newNickname, setNewNickname] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Receipt modal state
  const [selectedReceiptToken, setSelectedReceiptToken] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const fetchCustomerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/customer/dashboard');
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!newRegNumber.trim()) return;

    setAddLoading(true);
    setError(null);
    try {
      const res = await api.post('/customer/vehicles', {
        registrationNumber: newRegNumber.trim(),
        vehicleType: newVehicleType,
        nickname: newNickname.trim()
      });

      if (res.data?.success) {
        setSuccess(`Vehicle ${newRegNumber.toUpperCase()} registered to your account!`);
        setShowAddVehicleModal(false);
        setNewRegNumber('');
        setNewNickname('');
        fetchCustomerData();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemoveVehicle = async (regNumber) => {
    if (!window.confirm(`Are you sure you want to remove vehicle ${regNumber} from your account?`)) {
      return;
    }

    try {
      const res = await api.delete(`/customer/vehicles/${regNumber}`);
      if (res.data?.success) {
        setSuccess(`Vehicle ${regNumber} removed.`);
        fetchCustomerData();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleViewReceipt = async (token) => {
    setSelectedReceiptToken(token);
    setReceiptModalOpen(true);
    setReceiptLoading(true);
    try {
      const res = await api.get(`/customer/receipt/${token._id}`);
      if (res.data?.success) {
        setReceiptData(res.data.receipt);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setReceiptLoading(false);
    }
  };

  const stats = data?.stats || {
    totalVehicles: 0,
    vehiclesParkedNow: 0,
    activePassesCount: 0,
    totalVisits: 0,
    totalSpent: 0
  };

  const vehicles = data?.vehicles || [];
  const activeTokens = data?.activeTokens || [];
  const activePasses = data?.activePasses || [];
  const history = data?.recentHistory || [];

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-slate-100">
      {/* Customer Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#00A884]/10 border border-[#00A884]/20 rounded-full text-[11px] font-bold text-[#00A884] mb-2 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-pulse" />
            <span>CENTRAL STATION • VEHICLE OWNER PORTAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Customer ID: <span className="font-mono text-[#00A884] font-bold">{user?.operatorId}</span> | Manage your registered vehicles, live parking tokens, commuter passes, and digital receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCustomerData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10 transition active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => { setShowAddVehicleModal(true); setError(null); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#00A884] hover:bg-[#008F6F] text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00A884]" />
          <span>{success}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200/90 dark:border-white/10 gap-2 overflow-x-auto pb-1 text-xs font-bold font-mono">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'overview'
              ? 'bg-[#00A884] text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }`}
        >
          Overview & Live Status
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'vehicles'
              ? 'bg-[#00A884] text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>My Vehicles ({vehicles.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('passes')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'passes'
              ? 'bg-[#00A884] text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Monthly Passes ({activePasses.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-[#00A884] text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Parking History & Receipts</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Live Parking Status Alert Card */}
          {activeTokens.length > 0 ? (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#00A884] animate-ping" />
                  <span className="font-mono text-xs font-bold text-[#00A884] uppercase tracking-widest">
                    ACTIVE PARKING SESSION IN PROGRESS
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#00A884]/10 text-[#00A884] font-mono text-xs font-bold border border-[#00A884]/20">
                  {activeTokens.length} Vehicle(s) Parked Inside
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTokens.map((t) => (
                  <div key={t._id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-black font-mono text-slate-900 dark:text-white tracking-wider">
                        {t.vehicleNumber}
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold uppercase">
                        {t.vehicleType}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>Central Station Main Plaza ({t.locationCode || 'SRF-MAIN'})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-sky-500" />
                        <span>Entered: {formatDateTime(t.entryTime)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[#00A884] font-bold">
                        <span>Token ID: {t.tokenNumber}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#00A884]/10 text-[#00A884] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">All Vehicles Outside</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">None of your registered vehicles are currently parked inside the station plaza.</div>
              </div>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">My Registered Vehicles</div>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">{stats.totalVehicles}</div>
              <div className="text-[11px] text-[#00A884] mt-0.5">Linked to account</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Monthly Passes</div>
              <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400 mt-1">{stats.activePassesCount}</div>
              <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5">Commuter subscriptions</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lifetime Visits</div>
              <div className="text-2xl font-black font-mono text-sky-600 dark:text-sky-400 mt-1">{stats.totalVisits}</div>
              <div className="text-[11px] text-sky-600 dark:text-sky-400 mt-0.5">Station entries logged</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Spent</div>
              <div className="text-2xl font-black font-mono text-[#00A884] mt-1">{formatCurrency(stats.totalSpent)}</div>
              <div className="text-[11px] text-[#00A884] mt-0.5">Verified receipts</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY VEHICLES */}
      {(activeTab === 'vehicles' || activeTab === 'overview') && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                My Registered Vehicles
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage vehicle registration numbers linked to your account</p>
            </div>
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00A884] hover:bg-[#008F6F] text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Vehicle</span>
            </button>
          </div>

          {vehicles.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-2">
              <Car className="w-8 h-8 mx-auto text-slate-400" />
              <div>No vehicles registered yet.</div>
              <button
                onClick={() => setShowAddVehicleModal(true)}
                className="text-xs text-[#00A884] hover:underline font-bold"
              >
                Register your first vehicle now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {vehicles.map((v) => (
                <div key={v.registrationNumber} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 space-y-2 relative group">
                  <div className="flex items-center justify-between">
                    <div className="font-mono font-black text-slate-900 dark:text-white text-base tracking-wider">
                      {v.registrationNumber}
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#00A884]/10 text-[#00A884] text-[10px] font-bold uppercase border border-[#00A884]/20">
                      {v.vehicleType}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {v.nickname || 'Personal Vehicle'}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/5 text-[10px] text-slate-400">
                    <span>Added: {new Date(v.addedAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleRemoveVehicle(v.registrationNumber)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded transition opacity-80 hover:opacity-100"
                      title="Remove vehicle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MONTHLY PASSES */}
      {(activeTab === 'passes' || activeTab === 'overview') && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                My Monthly Commuter Passes
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Active and past railway station parking passes</p>
            </div>
          </div>

          {activePasses.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-2">
              <CalendarCheck className="w-8 h-8 mx-auto text-slate-400" />
              <div>No monthly passes currently issued for your registered vehicles.</div>
              <div className="text-[11px] text-slate-500">Contact the station parking booth operator to issue a 1, 6, or 12-month commuter pass.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePasses.map((p) => (
                <div key={p._id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">{p.passNumber}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold uppercase">
                      {p.status}
                    </span>
                  </div>
                  <div>
                    <div className="font-mono font-bold text-slate-900 dark:text-white text-base">{p.vehicleNumber}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">{p.vehicleType} • {p.durationMonths} Month(s)</div>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-2 border-t border-slate-200/60 dark:border-white/5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Valid Until:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{new Date(p.expiryDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Amount Paid:</span>
                      <span className="font-bold text-[#00A884]">{formatCurrency(p.amount)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PARKING HISTORY & DIGITAL RECEIPTS */}
      {(activeTab === 'history' || activeTab === 'overview') && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Parking Sessions & Receipts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Download or print official station parking receipts</p>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-white/5">
              No previous parking sessions found for your vehicles.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-white/5 bg-transparent">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-mono border-b border-slate-200/90 dark:border-white/10">
                  <tr>
                    <th className="py-2.5 px-3">Token #</th>
                    <th className="py-2.5 px-3">Vehicle</th>
                    <th className="py-2.5 px-3">Entry Time</th>
                    <th className="py-2.5 px-3">Exit Time</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Paid</th>
                    <th className="py-2.5 px-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {history.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#00A884]">{t.tokenNumber}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{t.vehicleNumber}</td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 font-mono">{formatDateTime(t.entryTime)}</td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 font-mono">
                        {t.exitTime ? formatDateTime(t.exitTime) : <span className="text-[#00A884] font-bold">Currently Inside</span>}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'EXITED' ? 'bg-[#00A884]/10 text-[#00A884]' : 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#00A884]">
                        {formatCurrency(t.amountPaid || 0)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleViewReceipt(t)}
                          className="px-2.5 py-1 bg-[#00A884]/10 hover:bg-[#00A884] text-[#00A884] hover:text-white rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1 border border-[#00A884]/30"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#111B21] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <div className="font-bold text-slate-900 dark:text-white text-sm">Register New Vehicle</div>
              <button
                onClick={() => setShowAddVehicleModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Vehicle Registration Number (Plate) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MH 12 AB 1234"
                  value={newRegNumber}
                  onChange={(e) => setNewRegNumber(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-[#00A884] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Vehicle Category *
                </label>
                <select
                  value={newVehicleType}
                  onChange={(e) => setNewVehicleType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white capitalize focus:ring-2 focus:ring-[#00A884] focus:outline-none"
                >
                  <option value="bike">Two Wheeler (Bike / Scooter)</option>
                  <option value="car">Four Wheeler (Car / SUV)</option>
                  <option value="auto">Auto Rickshaw</option>
                  <option value="cycle">Bicycle</option>
                  <option value="other">Other Vehicle</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Nickname / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Commute Scooter"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A884] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-4 py-2 bg-[#00A884] hover:bg-[#008F6F] text-white rounded-xl font-bold transition shadow-md active:scale-95"
                >
                  {addLoading ? 'Registering...' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {receiptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#111B21] text-slate-900 dark:text-white rounded-2xl p-6 shadow-2xl relative space-y-4 print:p-0 border border-slate-200/80 dark:border-white/10">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2 no-print">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase font-mono">Digital Parking Receipt</span>
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {receiptLoading ? (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">Loading verified receipt...</div>
            ) : receiptData ? (
              <div className="space-y-3 text-xs font-mono leading-relaxed">
                {/* Receipt Header */}
                <div className="text-center border-b border-slate-100 dark:border-white/10 pb-3">
                  <div className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">{receiptData.settings?.businessName || 'SR FABRICATION'}</div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400">RAILWAY STATION PARKING PLAZA</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-500">{receiptData.settings?.locationName}</div>
                </div>

                {/* Details */}
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">TOKEN #:</span>
                    <span className="font-bold text-[#00A884]">{receiptData.token?.tokenNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">VEHICLE:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{receiptData.token?.vehicleNumber} ({receiptData.token?.vehicleType})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">ENTRY:</span>
                    <span className="text-slate-700 dark:text-slate-300">{formatDateTime(receiptData.token?.entryTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">EXIT:</span>
                    <span className="text-slate-700 dark:text-slate-300">{receiptData.token?.exitTime ? formatDateTime(receiptData.token.exitTime) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">DURATION:</span>
                    <span className="text-slate-700 dark:text-slate-300">{Math.round(receiptData.token?.durationMinutes || 0)} mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">PAYMENT:</span>
                    <span className="text-slate-700 dark:text-slate-300">{receiptData.token?.paymentMethod} ({receiptData.token?.paymentStatus})</span>
                  </div>
                </div>

                {/* Amount Paid */}
                <div className="border-t border-b border-slate-100 dark:border-white/10 py-2 flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-900 dark:text-white">TOTAL PAID:</span>
                  <span className="text-base font-black text-[#00A884]">{formatCurrency(receiptData.token?.amountPaid || 0)}</span>
                </div>

                {/* Footer note */}
                <div className="text-[9px] text-center text-slate-500 dark:text-slate-400 leading-tight">
                  Authorized Railway Parking Contractor. Keep for expense claim and record.
                </div>

                {/* Print button */}
                <div className="flex gap-2 pt-2 no-print">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2 bg-[#00A884] hover:bg-[#008F6F] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-xs shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>
                  <button
                    onClick={() => setReceiptModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-rose-500">Could not retrieve receipt.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
