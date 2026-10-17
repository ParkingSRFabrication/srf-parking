import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Download,
  Building,
  MapPin,
  Clock,
  Printer,
  ShieldCheck,
  CheckCircle,
  Database,
  Palette
} from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import { ThemeToggle } from '../components/common/ThemeToggle.jsx';
import './SettingsPage.css';

export function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.data?.success) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setError(null);
    try {
      const res = await api.patch('/settings', settings);
      if (res.data?.success) {
        setSettings(res.data.settings);
        setSuccessMsg('Business and station configuration saved successfully!');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleBackupExport = async () => {
    try {
      const res = await api.get('/backup/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `srf_parking_database_export_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert(`Export failed: ${getErrorMessage(err)}`);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading station settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            System & Station Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Appearance themes, station branding, receipt headers, and database backups
          </p>
        </div>

        <button
          onClick={handleBackupExport}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          <Database className="w-4 h-4 text-[#00A884]" />
          <span>Export Database JSON</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#00A884] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* 1. APPEARANCE & THEME CARD (User Requested) */}
      <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-xs dark:shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
          <h2 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#00A884]" />
            <span>1. Website Appearance & Color Theme</span>
          </h2>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#00A884]/15 text-[#008F6F] dark:text-[#2DD4BF] font-bold">
            Arattai Engine
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Switch between clean White mode and Arattai Deep Slate dark mode. This preference applies across all pages and is saved to your device.
        </p>
        <ThemeToggle variant="settings" />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Branding & Entity Card */}
        <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-xs dark:shadow-md space-y-4">
          <h2 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-3">
            <Building className="w-4 h-4 text-[#00A884]" />
            <span>2. Business Entity & Station Branding</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Contractor / Business Name
              </label>
              <input
                type="text"
                required
                value={settings?.businessName || ''}
                onChange={(e) => handleChange('businessName', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#00A884] font-bold text-slate-800 dark:text-white transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                System Tagline
              </label>
              <input
                type="text"
                value={settings?.tagline || ''}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#00A884] text-slate-800 dark:text-white transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Location Name
              </label>
              <input
                type="text"
                value={settings?.locationName || ''}
                onChange={(e) => handleChange('locationName', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#00A884] text-slate-800 dark:text-white transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Station Code
              </label>
              <input
                type="text"
                value={settings?.stationCode || ''}
                onChange={(e) => handleChange('stationCode', e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#00A884] text-slate-800 dark:text-white transition"
              />
            </div>
          </div>
        </div>

        {/* Operational Prefixes & Timezone Card */}
        <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-xs dark:shadow-md space-y-4">
          <h2 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-3">
            <Clock className="w-4 h-4 text-[#00A884]" />
            <span>3. Token Numbering & Timezone</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Token Prefix
              </label>
              <input
                type="text"
                value={settings?.tokenPrefix || ''}
                onChange={(e) => handleChange('tokenPrefix', e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-[#00A884]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block font-mono">e.g. SRF-20261009-0001</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Monthly Pass Prefix
              </label>
              <input
                type="text"
                value={settings?.passPrefix || ''}
                onChange={(e) => handleChange('passPrefix', e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-[#00A884]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block font-mono">e.g. SRF-PASS-...</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Pass Expiry Alert (Days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings?.passExpiringSoonDays || 5}
                onChange={(e) => handleChange('passExpiringSoonDays', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-[#00A884]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Highlight expiring passes</span>
            </div>
          </div>
        </div>

        {/* Receipt Headers & Notices Card */}
        <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-xs dark:shadow-md space-y-4">
          <h2 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-3">
            <Printer className="w-4 h-4 text-[#00A884]" />
            <span>4. Thermal Receipt Layout & Notices</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Receipt Header Lines
              </label>
              <textarea
                rows={3}
                value={settings?.receiptHeader || ''}
                onChange={(e) => handleChange('receiptHeader', e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl font-mono text-slate-800 dark:text-white focus:outline-none focus:border-[#00A884]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Receipt Footer Disclaimer / Lost Token Notice
              </label>
              <textarea
                rows={3}
                value={settings?.receiptFooter || ''}
                onChange={(e) => handleChange('receiptFooter', e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl font-mono text-slate-800 dark:text-white focus:outline-none focus:border-[#00A884]"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-[#00A884] hover:bg-[#008F6F] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Configuration Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
