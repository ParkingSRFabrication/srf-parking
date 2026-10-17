import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Calculator,
  RefreshCw,
  AlertCircle,
  Car,
  Bike,
  Truck,
  Bus,
  Calendar,
  DollarSign,
  ShieldCheck,
  Search,
  Check,
  Package,
  HardHat,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import { formatCurrency, formatDuration, CATEGORY_LABELS, formatCategoryName } from '../utils/formatters.js';
import './TariffsPage.css';

// Preset vehicle suggestions for parking owner convenience
const PRESET_VEHICLES = [
  { id: 'bike', label: 'Two Wheeler (Bike)', defaultDaily: 20, defaultMonthly: 200, icon: Bike },
  { id: 'car', label: 'Four Wheeler (Car)', defaultDaily: 40, defaultMonthly: 400, icon: Car },
  { id: 'lorry', label: 'Lorry / Goods Carrier', defaultDaily: 70, defaultMonthly: 700, icon: Truck },
  { id: 'jcb', label: 'JCB / Earthmover', defaultDaily: 70, defaultMonthly: 700, icon: Truck },
  { id: 'bus', label: 'Bus / Passenger Van', defaultDaily: 70, defaultMonthly: 700, icon: Bus },
  { id: 'truck', label: 'Big Vehicles / Heavy Truck', defaultDaily: 70, defaultMonthly: 800, icon: Truck },
  { id: 'auto', label: 'Auto Rickshaw', defaultDaily: 30, defaultMonthly: 300, icon: Compass },
  { id: 'cycle', label: 'Bicycle', defaultDaily: 10, defaultMonthly: 100, icon: Bike },
  { id: 'tempo', label: 'Tempo / Carrier', defaultDaily: 70, defaultMonthly: 500, icon: Truck },
  { id: 'tractor', label: 'Tractor / Farm Vehicle', defaultDaily: 60, defaultMonthly: 600, icon: Truck },
  { id: 'crane', label: 'Crane / Heavy Machinery', defaultDaily: 100, defaultMonthly: 1000, icon: Truck }
];

export function TariffsPage() {
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit / Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [editingTariff, setEditingTariff] = useState(null);

  // Form Fields
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [formCategory, setFormCategory] = useState('bike');
  const [formName, setFormName] = useState('');
  const [formBillingMethod, setFormBillingMethod] = useState('24_hour_daily');
  const [formFirstSlab, setFormFirstSlab] = useState(20);
  const [formAdditionalDay, setFormAdditionalDay] = useState(20);
  const [formMonthlyAmount, setFormMonthlyAmount] = useState(200);
  const [formHourly, setFormHourly] = useState(0);
  const [formGrace, setFormGrace] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSaving, setFormSaving] = useState(false);

  // Delete Confirmation state
  const [deleteConfirmTariff, setDeleteConfirmTariff] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Scenario Preview Calculator State
  const [previewCategory, setPreviewCategory] = useState('bike');
  const [previewEntry, setPreviewEntry] = useState(() => {
    const d = new Date(Date.now() - 25 * 3600000); // 25 hours ago
    return d.toISOString().slice(0, 16);
  });
  const [previewExit, setPreviewExit] = useState(() => {
    return new Date().toISOString().slice(0, 16);
  });
  const [previewResult, setPreviewResult] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchTariffs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/tariffs');
      if (res.data?.success) {
        setTariffs(res.data.tariffs || []);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTariffs();
  }, []);

  const showNotification = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Open Edit Modal
  const handleOpenEdit = (t) => {
    setIsNew(false);
    setEditingTariff(t);
    setIsCustomCategory(!PRESET_VEHICLES.some(p => p.id === t.category));
    setFormCategory(t.category);
    setFormName(t.name);
    setFormBillingMethod(t.billingMethod || '24_hour_daily');
    setFormFirstSlab(t.firstSlabAmount !== undefined ? t.firstSlabAmount : 20);
    setFormAdditionalDay(t.additionalDayAmount !== undefined ? t.additionalDayAmount : 20);
    setFormMonthlyAmount(t.monthlyAmount !== undefined ? t.monthlyAmount : 0);
    setFormHourly(t.hourlyAmount || 0);
    setFormGrace(t.freeGraceMinutes || 0);
    setFormIsActive(t.isActive !== false);
    setIsModalOpen(true);
  };

  // Open New Modal
  const handleOpenNew = (presetId = null) => {
    setIsNew(true);
    setEditingTariff(null);

    const preset = PRESET_VEHICLES.find(p => p.id === presetId) || PRESET_VEHICLES[0];

    setIsCustomCategory(!presetId);
    setFormCategory(preset.id);
    setFormName(preset.label ? `${preset.label} 24h Daily` : 'Custom Vehicle Tariff');
    setFormBillingMethod('24_hour_daily');
    setFormFirstSlab(preset.defaultDaily);
    setFormAdditionalDay(preset.defaultDaily);
    setFormMonthlyAmount(preset.defaultMonthly);
    setFormHourly(0);
    setFormGrace(0);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  // Handle Preset selection during modal form
  const handleSelectPreset = (preset) => {
    setIsCustomCategory(false);
    setFormCategory(preset.id);
    setFormName(`${preset.label} 24h Daily`);
    setFormFirstSlab(preset.defaultDaily);
    setFormAdditionalDay(preset.defaultDaily);
    setFormMonthlyAmount(preset.defaultMonthly);
  };

  // Save Tariff
  const handleSaveTariff = async (e) => {
    e.preventDefault();
    setFormSaving(true);
    try {
      const cleanCategory = formCategory.toLowerCase().trim().replace(/\s+/g, '_');
      if (!cleanCategory) {
        alert('Please enter a valid vehicle category identifier');
        setFormSaving(false);
        return;
      }

      const payload = {
        category: cleanCategory,
        name: formName.trim(),
        billingMethod: formBillingMethod,
        firstSlabAmount: Number(formFirstSlab),
        additionalDayAmount: Number(formAdditionalDay),
        monthlyAmount: Number(formMonthlyAmount),
        hourlyAmount: Number(formHourly),
        freeGraceMinutes: Number(formGrace),
        isActive: formIsActive
      };

      if (isNew) {
        await api.post('/tariffs', payload);
        showNotification(`Vehicle tariff for "${payload.name}" created successfully!`);
      } else {
        await api.patch(`/tariffs/${editingTariff._id}`, payload);
        showNotification(`Rates for "${payload.name}" updated successfully!`);
      }

      setIsModalOpen(false);
      fetchTariffs();
    } catch (err) {
      alert(`Failed to save tariff: ${getErrorMessage(err)}`);
    } finally {
      setFormSaving(false);
    }
  };

  // Delete Tariff
  const handleDeleteTariff = async () => {
    if (!deleteConfirmTariff) return;
    setDeleting(true);
    try {
      await api.delete(`/tariffs/${deleteConfirmTariff._id}`);
      showNotification(`Tariff "${deleteConfirmTariff.name}" removed successfully.`);
      setDeleteConfirmTariff(null);
      fetchTariffs();
    } catch (err) {
      alert(`Failed to delete tariff: ${getErrorMessage(err)}`);
    } finally {
      setDeleting(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (t) => {
    try {
      const nextState = !t.isActive;
      await api.patch(`/tariffs/${t._id}`, { isActive: nextState });
      setTariffs(prev => prev.map(item => item._id === t._id ? { ...item, isActive: nextState } : item));
      showNotification(`${t.name} is now ${nextState ? 'Active' : 'Inactive'}`);
    } catch (err) {
      alert(`Could not toggle tariff status: ${getErrorMessage(err)}`);
    }
  };

  // Simulate calculation
  const handleRunPreview = async () => {
    setPreviewLoading(true);
    try {
      const selectedT = tariffs.find(t => t.category === previewCategory) || {
        category: previewCategory,
        billingMethod: '24_hour_daily',
        firstSlabAmount: 20,
        additionalDayAmount: 20
      };

      const res = await api.post('/tariffs/preview', {
        tariff: selectedT,
        entryTime: previewEntry,
        exitTime: previewExit
      });

      if (res.data?.success) {
        setPreviewResult(res.data.calculation);
      }
    } catch (err) {
      alert(`Preview failed: ${getErrorMessage(err)}`);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Filtered tariffs list
  const filteredTariffs = useMemo(() => {
    if (!searchQuery.trim()) return tariffs;
    const q = searchQuery.toLowerCase().trim();
    return tariffs.filter(t =>
      t.category.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      (CATEGORY_LABELS[t.category] && CATEGORY_LABELS[t.category].toLowerCase().includes(q))
    );
  }, [tariffs, searchQuery]);

  // Find quick rates for summary cards
  const bikeTariff = tariffs.find(t => t.category === 'bike');
  const carTariff = tariffs.find(t => t.category === 'car');
  const busTariff = tariffs.find(t => t.category === 'bus');
  const lorryTariff = tariffs.find(t => t.category === 'lorry');
  const truckTariff = tariffs.find(t => t.category === 'truck');

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* Owner Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 rounded-3xl shadow-sm dark:shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00A884]/10 border border-[#00A884]/30 rounded-full text-xs font-bold text-[#00A884] mb-2 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00A884]" />
            <span>PARKING OWNER CONTROL PORTAL • RATES & VEHICLES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">
            Vehicle Tariffs & Pricing Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Update your daily parking amounts, additional day fees, and monthly pass prices. Add any vehicle type (Lorry, JCB, Bus, etc.) directly to the system.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => handleOpenNew()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00A884] hover:bg-[#008F6F] active:scale-[0.99] text-white rounded-2xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle & Rates</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Parking Owner Quick Rate Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Bike */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs flex flex-col justify-between hover:border-[#00A884]/40 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#00A884]/15 rounded-xl text-[#00A884]">
                <Bike className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">Two Wheeler (Bike)</span>
            </div>
            {bikeTariff && (
              <button
                onClick={() => handleOpenEdit(bikeTariff)}
                className="text-[11px] text-[#00A884] hover:underline font-semibold"
              >
                Edit
              </button>
            )}
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block">Daily</span>
              <span className="text-lg font-black text-[#00A884] font-mono">
                {formatCurrency(bikeTariff?.firstSlabAmount ?? 20)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block">Monthly Pass</span>
              <span className="text-lg font-black text-[#00A884] font-mono">
                {formatCurrency(bikeTariff?.monthlyAmount ?? 200)}
              </span>
            </div>
          </div>
        </div>

        {/* Car */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs flex flex-col justify-between hover:border-[#00A884]/40 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                <Car className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">Four Wheeler (Car)</span>
            </div>
            {carTariff && (
              <button
                onClick={() => handleOpenEdit(carTariff)}
                className="text-[11px] text-blue-500 hover:underline font-semibold"
              >
                Edit
              </button>
            )}
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block">Daily</span>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
                {formatCurrency(carTariff?.firstSlabAmount ?? 40)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block">Monthly Pass</span>
              <span className="text-lg font-black text-[#00A884] font-mono">
                {formatCurrency(carTariff?.monthlyAmount ?? 400)}
              </span>
            </div>
          </div>
        </div>

        {/* Lorry / JCB / Bus */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs flex flex-col justify-between hover:border-[#00A884]/40 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                <Truck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">Lorry / JCB / Bus</span>
            </div>
            {(lorryTariff || busTariff) && (
              <button
                onClick={() => handleOpenEdit(lorryTariff || busTariff)}
                className="text-[11px] text-amber-500 hover:underline font-semibold"
              >
                Edit
              </button>
            )}
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block">Daily</span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                {formatCurrency(lorryTariff?.firstSlabAmount ?? 70)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block">Monthly Pass</span>
              <span className="text-lg font-black text-[#00A884] font-mono">
                {formatCurrency(lorryTariff?.monthlyAmount ?? 700)}
              </span>
            </div>
          </div>
        </div>

        {/* Big Vehicles (Truck) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 shadow-xs flex flex-col justify-between hover:border-[#00A884]/40 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500">
                <Truck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">Big Vehicles / Heavy</span>
            </div>
            {truckTariff && (
              <button
                onClick={() => handleOpenEdit(truckTariff)}
                className="text-[11px] text-purple-500 hover:underline font-semibold"
              >
                Edit
              </button>
            )}
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block">Daily</span>
              <span className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono">
                {formatCurrency(truckTariff?.firstSlabAmount ?? 70)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block">Monthly Pass</span>
              <span className="text-lg font-black text-[#00A884] font-mono">
                {formatCurrency(truckTariff?.monthlyAmount ?? 800)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table / Management Card */}
      <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vehicle type or tariff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#00A884] w-56 sm:w-64"
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {filteredTariffs.length} vehicle type{filteredTariffs.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchTariffs}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
              title="Refresh tariffs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => handleOpenNew()}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#00A884] hover:bg-[#008F6F] active:scale-[0.99] text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vehicle</span>
            </button>
          </div>
        </div>

        {/* Mobile View: Tariff Cards (< md) */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-white/5">
          {filteredTariffs.map(t => (
            <div key={t._id} className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition space-y-3 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 dark:text-white capitalize text-sm">
                      {formatCategoryName(t.category)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.isActive
                        ? 'bg-[#00A884]/15 text-[#00A884] border border-[#00A884]/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5'
                    }`}>
                      {t.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.name}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-2 bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 text-indigo-600 dark:text-indigo-300 rounded-xl font-bold text-xs"
                    title="Edit vehicle rates"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmTariff(t)}
                    className="p-2 bg-rose-50 dark:bg-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/30 text-rose-600 dark:text-rose-300 rounded-xl font-bold text-xs"
                    title="Delete tariff"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Mobile Rate Grid */}
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-white/5 text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block">Daily (24h)</span>
                  <span className="text-sm font-black text-[#00A884] font-mono">
                    {formatCurrency(t.firstSlabAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block">Addl. Day</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">
                    {t.billingMethod === '24_hour_daily' ? formatCurrency(t.additionalDayAmount) : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#00A884] uppercase font-mono block">Monthly Pass</span>
                  <span className="text-sm font-black text-[#00A884] font-mono">
                    {t.monthlyAmount ? formatCurrency(t.monthlyAmount) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredTariffs.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No vehicle tariffs found matching your search.
            </div>
          )}
        </div>

        {/* Desktop View: Full Table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-white/10 font-mono text-[11px]">
                <th className="py-3 px-4">Vehicle Category</th>
                <th className="py-3 px-4">Tariff Name</th>
                <th className="py-3 px-4">Billing Method</th>
                <th className="py-3 px-4 text-[#00A884]">Daily Rate (24h)</th>
                <th className="py-3 px-4 text-slate-700 dark:text-slate-300">Addl. Day</th>
                <th className="py-3 px-4 text-[#00A884]">Monthly Pass</th>
                <th className="py-3 px-4">Grace</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredTariffs.map(t => (
                <tr key={t._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white capitalize">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00A884]"></span>
                      <span>{formatCategoryName(t.category)}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {t.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                      {t.billingMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-black text-[#00A884] text-sm font-mono">
                    {formatCurrency(t.firstSlabAmount)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300 font-mono">
                    {t.billingMethod === '24_hour_daily' ? formatCurrency(t.additionalDayAmount) : '-'}
                  </td>
                  <td className="py-3.5 px-4 font-black text-[#00A884] text-sm font-mono">
                    {t.monthlyAmount ? (
                      <span className="px-2 py-0.5 rounded-lg bg-[#00A884]/10 border border-[#00A884]/30">
                        {formatCurrency(t.monthlyAmount)}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">N/A</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">
                    {t.freeGraceMinutes ? `${t.freeGraceMinutes}m` : '0m'}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleActive(t)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                        t.isActive
                          ? 'bg-[#00A884]/15 text-[#00A884] border border-[#00A884]/30 hover:bg-[#00A884]/25'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5 hover:bg-slate-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${t.isActive ? 'bg-[#00A884]' : 'bg-slate-400'}`} />
                      <span>{t.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-lg transition"
                        title="Edit rates"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmTariff(t)}
                        className="p-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-lg transition"
                        title="Delete vehicle tariff"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTariffs.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    No vehicle tariffs found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scenario Preview Calculator Card */}
      <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl p-5 sm:p-7 space-y-4">
        <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
          <div className="p-2 bg-[#00A884]/15 text-[#00A884] rounded-xl">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
              Interactive Tariff Billing Simulator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verify exact billable days and rupee fees for edge-case durations (e.g. 23h59m vs 24h01m) before saving
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 font-mono">
              Vehicle Category
            </label>
            <select
              value={previewCategory}
              onChange={(e) => setPreviewCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white capitalize focus:outline-none focus:border-[#00A884]"
            >
              {tariffs.map(t => (
                <option key={t.category} value={t.category} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {formatCategoryName(t.category)} (₹{t.firstSlabAmount}/day)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 font-mono">
              Entry Timestamp
            </label>
            <input
              type="datetime-local"
              value={previewEntry}
              onChange={(e) => setPreviewEntry(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#00A884]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 font-mono">
              Exit Timestamp
            </label>
            <input
              type="datetime-local"
              value={previewExit}
              onChange={(e) => setPreviewExit(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#00A884]"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunPreview}
          disabled={previewLoading}
          className="px-5 py-2.5 bg-[#00A884] hover:bg-[#008F6F] active:scale-[0.99] text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
        >
          {previewLoading ? 'Calculating...' : 'Simulate Tariff Calculation'}
        </button>

        {previewResult && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-950/80 border border-[#00A884]/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
            <div className="space-y-1 text-xs">
              <div className="text-slate-700 dark:text-slate-300">
                Elapsed Duration: <strong className="text-slate-900 dark:text-white">{formatDuration(previewResult.durationMinutes)}</strong>
              </div>
              <div className="text-slate-700 dark:text-slate-300">
                Billable Units: <strong className="text-[#00A884]">{previewResult.billableUnits} Day(s) / Session</strong>
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                Formula: Math.ceil(elapsedMs / 86,400,000)
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono">Calculated Fee</span>
              <div className="text-3xl font-black text-[#00A884] font-mono">
                {formatCurrency(previewResult.amountBilled)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit / Add Vehicle & Tariff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-[#111B21] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white font-outfit">
                  {isNew ? 'Add New Vehicle Type & Rates' : `Edit Rates: ${editingTariff?.name}`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Set daily parking fee, additional days, and monthly commuter pass rate
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTariff} className="space-y-4">
              {/* Presets or Custom Category */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5 font-mono">
                  Vehicle Type / Category
                </label>
                
                {isNew && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {PRESET_VEHICLES.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPreset(p)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                          !isCustomCategory && formCategory === p.id
                            ? 'bg-[#00A884] text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>{p.label.split(' ')[0]}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCategory(true);
                        setFormCategory('');
                        setFormName('');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                        isCustomCategory
                          ? 'bg-[#00A884] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      + Custom Type
                    </button>
                  </div>
                )}

                {isCustomCategory ? (
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. lorry, jcb, trailer, crane, electric_van"
                      value={formCategory}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/\s+/g, '_');
                        setFormCategory(val);
                        if (!formName || formName.includes('Tariff')) {
                          setFormName(`${formatCategoryName(val)} 24h Daily`);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#00A884] font-mono"
                    />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                      Type any custom vehicle identifier without spaces (e.g. lorry, jcb, big_vehicle)
                    </span>
                  </div>
                ) : (
                  <select
                    disabled={!isNew}
                    value={formCategory}
                    onChange={(e) => {
                      const selected = PRESET_VEHICLES.find(p => p.id === e.target.value);
                      if (selected) handleSelectPreset(selected);
                      else setFormCategory(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white capitalize disabled:opacity-60 focus:outline-none focus:border-[#00A884]"
                  >
                    {PRESET_VEHICLES.map(p => (
                      <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{p.label}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Tariff Display Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 font-mono">
                  Display Name on Receipt & Token
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lorry / Goods Carrier 24h Daily"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#00A884]"
                />
              </div>

              {/* Rates Grid: Daily & Additional Day & Monthly Pass */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-white/5 space-y-3">
                <span className="text-[10px] font-bold text-[#00A884] uppercase font-mono block">
                  Tariff Rates Configuration (₹ INR)
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Daily Rate (First 24 hrs) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formFirstSlab}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormFirstSlab(val);
                          // Auto suggest additional day if same
                          if (formAdditionalDay === formFirstSlab) {
                            setFormAdditionalDay(val);
                          }
                        }}
                        className="w-full pl-7 pr-3 py-2 text-xs font-black text-[#00A884] bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#00A884]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Additional Day Rate *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formAdditionalDay}
                        onChange={(e) => setFormAdditionalDay(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 text-xs font-black text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#00A884]"
                      />
                    </div>
                  </div>
                </div>

                {/* Monthly Pass Amount Field */}
                <div>
                  <label className="block text-[11px] font-bold text-[#00A884] uppercase mb-1">
                    Monthly Pass Rate (₹ / Month) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00A884] font-bold text-xs">₹</span>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="e.g. 200 for bike, 400 for car, 700 for lorry"
                      value={formMonthlyAmount}
                      onChange={(e) => setFormMonthlyAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2.5 text-xs font-black text-[#00A884] bg-white dark:bg-slate-800 border border-slate-200 dark:border-[#00A884]/30 rounded-xl focus:outline-none focus:border-[#00A884]"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                    Used to auto-calculate commuter monthly passes (1 month, 6 months, 12 months)
                  </span>
                </div>
              </div>

              {/* Billing Method & Grace Period */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 font-mono">
                    Billing Method
                  </label>
                  <select
                    value={formBillingMethod}
                    onChange={(e) => setFormBillingMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#00A884]"
                  >
                    <option value="24_hour_daily" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">24-Hour Whole Session Daily</option>
                    <option value="hourly" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Hourly Billing</option>
                    <option value="fixed" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Fixed Charge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 font-mono">
                    Grace Period (Mins)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formGrace}
                    onChange={(e) => setFormGrace(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#00A884]"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded text-[#00A884] bg-white dark:bg-slate-800 border-slate-300 dark:border-white/20 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isActiveCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Active (Ready for check-in tokens & monthly passes)
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#00A884] hover:bg-[#008F6F] active:scale-[0.99] rounded-xl transition shadow-md cursor-pointer"
                >
                  {formSaving ? 'Saving Rates...' : isNew ? 'Create Vehicle Tariff' : 'Update Rates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTariff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-[#111B21] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2 bg-rose-500/10 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">Delete Vehicle Tariff</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete the tariff for <strong className="text-slate-900 dark:text-white">"{deleteConfirmTariff.name}"</strong>?
              This will remove the category from rate lists.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTariff(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteTariff}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition cursor-pointer"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
