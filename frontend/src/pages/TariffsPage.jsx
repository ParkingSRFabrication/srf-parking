import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  Calculator,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import { formatCurrency, formatDuration, CATEGORY_LABELS } from '../utils/formatters.js';
import './TariffsPage.css';

export function TariffsPage() {
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit / Create Modal state
  const [editingTariff, setEditingTariff] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [formCategory, setFormCategory] = useState('bike');
  const [formName, setFormName] = useState('');
  const [formBillingMethod, setFormBillingMethod] = useState('24_hour_daily');
  const [formFirstSlab, setFormFirstSlab] = useState(20);
  const [formAdditionalDay, setFormAdditionalDay] = useState(20);
  const [formHourly, setFormHourly] = useState(0);
  const [formGrace, setFormGrace] = useState(0);
  const [formSaving, setFormSaving] = useState(false);

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

  const handleOpenEdit = (t) => {
    setIsNew(false);
    setEditingTariff(t);
    setFormCategory(t.category);
    setFormName(t.name);
    setFormBillingMethod(t.billingMethod);
    setFormFirstSlab(t.firstSlabAmount);
    setFormAdditionalDay(t.additionalDayAmount);
    setFormHourly(t.hourlyAmount || 0);
    setFormGrace(t.freeGraceMinutes || 0);
  };

  const handleOpenNew = () => {
    setIsNew(true);
    setEditingTariff({});
    setFormCategory('bike');
    setFormName('Two Wheeler Standard');
    setFormBillingMethod('24_hour_daily');
    setFormFirstSlab(20);
    setFormAdditionalDay(20);
    setFormHourly(0);
    setFormGrace(0);
  };

  const handleSaveTariff = async (e) => {
    e.preventDefault();
    setFormSaving(true);
    try {
      const payload = {
        category: formCategory,
        name: formName,
        billingMethod: formBillingMethod,
        firstSlabAmount: Number(formFirstSlab),
        additionalDayAmount: Number(formAdditionalDay),
        hourlyAmount: Number(formHourly),
        freeGraceMinutes: Number(formGrace)
      };

      if (isNew) {
        await api.post('/tariffs', payload);
      } else {
        await api.patch(`/tariffs/${editingTariff._id}`, payload);
      }

      setEditingTariff(null);
      fetchTariffs();
    } catch (err) {
      alert(`Failed to save tariff: ${getErrorMessage(err)}`);
    } finally {
      setFormSaving(false);
    }
  };

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#142B4A] tracking-tight">
            Tariff Rate Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure 24-hour daily railway tariffs, hourly cloakrooms, and test billing scenarios
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#142B4A] hover:bg-[#2457A7] text-white rounded-xl text-xs font-bold transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>New Tariff Rule</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Tariffs Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Active Category Rates & Policies
          </h2>
          <button onClick={fetchTariffs} className="p-1 text-slate-400 hover:text-slate-600">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Mobile View: Tariff Cards (< md) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {tariffs.map(t => (
            <div key={t._id} className="p-3.5 hover:bg-slate-50 transition space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 capitalize text-sm">
                    {CATEGORY_LABELS[t.category] || t.category}
                  </span>
                  <span className="block text-[11px] text-slate-500">{t.name}</span>
                </div>
                <button
                  onClick={() => handleOpenEdit(t)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-xs"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-[11px]">
                <span className="text-slate-600">Base: <strong className="text-slate-900">{formatCurrency(t.firstSlabAmount)}</strong></span>
                <span className="text-slate-600">Addl: <strong className="text-slate-900">{t.billingMethod === '24_hour_daily' ? formatCurrency(t.additionalDayAmount) : '-'}</strong></span>
                <span className="text-slate-500">Grace: {t.freeGraceMinutes ? `${t.freeGraceMinutes}m` : '0m'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Full Table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Tariff Name</th>
                <th className="py-3 px-4">Billing Method</th>
                <th className="py-3 px-4">First Slab Rate</th>
                <th className="py-3 px-4">Addl. Day Rate</th>
                <th className="py-3 px-4">Grace Period</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tariffs.map(t => (
                <tr key={t._id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold text-slate-800 capitalize">
                    {CATEGORY_LABELS[t.category] || t.category}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {t.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 uppercase">
                      {t.billingMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-black text-slate-900">
                    {formatCurrency(t.firstSlabAmount)}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-700">
                    {t.billingMethod === '24_hour_daily' ? formatCurrency(t.additionalDayAmount) : '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {t.freeGraceMinutes ? `${t.freeGraceMinutes} mins` : 'None'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      ACTIVE
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scenario Preview Calculator Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-800">
          <Calculator className="w-5 h-5 text-[#2457A7]" />
          <h2 className="text-sm font-bold uppercase tracking-wider">
            Interactive Tariff Scenario Preview Calculator
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Test and verify exact billable units and rupee amounts for edge-case durations (e.g. 23h59m vs 24h01m) before saving rates.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Vehicle Category
            </label>
            <select
              value={previewCategory}
              onChange={(e) => setPreviewCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            >
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Entry Timestamp
            </label>
            <input
              type="datetime-local"
              value={previewEntry}
              onChange={(e) => setPreviewEntry(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Exit Timestamp
            </label>
            <input
              type="datetime-local"
              value={previewExit}
              onChange={(e) => setPreviewExit(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunPreview}
          disabled={previewLoading}
          className="px-5 py-2.5 bg-[#2457A7] hover:bg-[#142B4A] text-white text-xs font-bold rounded-xl transition"
        >
          {previewLoading ? 'Calculating...' : 'Simulate Tariff Calculation'}
        </button>

        {previewResult && (
          <div className="mt-4 p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
            <div className="space-y-1 text-xs">
              <div className="text-slate-600">
                Elapsed Duration: <strong>{formatDuration(previewResult.durationMinutes)}</strong>
              </div>
              <div className="text-slate-600">
                Billable Units: <strong>{previewResult.billableUnits} Day(s) / Units</strong>
              </div>
              <div className="text-slate-500 text-[11px]">
                Formula: Math.ceil(elapsedMs / 86,400,000)
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Calculated Fee</span>
              <div className="text-3xl font-black text-[#142B4A]">
                {formatCurrency(previewResult.amountBilled)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit / Create Modal */}
      {editingTariff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-4 border border-slate-200">
            <h3 className="font-black text-lg text-[#142B4A]">
              {isNew ? 'Create New Tariff' : `Edit Tariff: ${editingTariff.name}`}
            </h3>

            <form onSubmit={handleSaveTariff} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Category
                </label>
                <select
                  disabled={!isNew}
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl capitalize disabled:opacity-60"
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Tariff Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Billing Method
                </label>
                <select
                  value={formBillingMethod}
                  onChange={(e) => setFormBillingMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="24_hour_daily">24-Hour Whole Session Daily</option>
                  <option value="hourly">Hourly Billing</option>
                  <option value="fixed">Fixed Charge</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    First Slab Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formFirstSlab}
                    onChange={(e) => setFormFirstSlab(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Additional Day (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formAdditionalDay}
                    onChange={(e) => setFormAdditionalDay(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTariff(null)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="flex-1 py-2 text-xs font-bold text-white bg-[#142B4A] hover:bg-[#2457A7] rounded-xl"
                >
                  {formSaving ? 'Saving...' : 'Save Tariff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
