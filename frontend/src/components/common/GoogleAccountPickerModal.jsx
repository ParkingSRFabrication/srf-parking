import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Mail, CheckCircle, ShieldCheck, AlertCircle, ArrowRight, User } from 'lucide-react';

const STORAGE_KEY = 'srf_device_google_accounts';

export function GoogleAccountPickerModal({
  isOpen,
  onClose,
  onSelectAccount,
  onSendOtpEmail,
  loading = false
}) {
  const [deviceAccounts, setDeviceAccounts] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [inputError, setInputError] = useState('');

  // Load device accounts from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setDeviceAccounts(JSON.parse(stored));
      } else {
        // Initially empty or provide empty state
        setDeviceAccounts([]);
      }
    } catch (e) {
      setDeviceAccounts([]);
    }
  }, [isOpen]);

  // If no device accounts, open the "Add Account" input by default
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem(STORAGE_KEY);
      const accounts = stored ? JSON.parse(stored) : [];
      if (accounts.length === 0) {
        setIsAddingNew(true);
      } else {
        setIsAddingNew(false);
      }
      setInputError('');
      setNewEmail('');
      setNewName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndSelect = (e) => {
    e.preventDefault();
    setInputError('');

    const trimmedEmail = newEmail.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setInputError('Please enter a valid Google / Gmail address');
      return;
    }

    const name = newName.trim() || trimmedEmail.split('@')[0];
    const newAccount = {
      name,
      email: trimmedEmail,
      sub: `device-${Date.now()}`
    };

    // Save to device storage
    const updated = [
      newAccount,
      ...deviceAccounts.filter(a => a.email !== trimmedEmail)
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setDeviceAccounts(updated);
    setIsAddingNew(false);

    // Trigger select
    onSelectAccount(newAccount);
  };

  const handleRemoveAccount = (emailToRemove, e) => {
    e.stopPropagation();
    const updated = deviceAccounts.filter(a => a.email !== emailToRemove);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setDeviceAccounts(updated);
    if (updated.length === 0) {
      setIsAddingNew(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-white text-slate-900 rounded-3xl shadow-2xl p-6 space-y-4 border border-slate-100">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="flex justify-center mb-1">
            <svg className="w-8 h-8" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-800">Sign in with Google</h3>
          <p className="text-xs text-slate-500">
            Select an account on this device to continue to SRF Parking
          </p>
        </div>

        {/* Device Accounts List */}
        {!isAddingNew && deviceAccounts.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Accounts on this device
            </div>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
              {deviceAccounts.map((acc) => (
                <div
                  key={acc.email}
                  onClick={() => !loading && onSelectAccount(acc)}
                  className="w-full py-3 px-3 flex items-center justify-between gap-3 text-left hover:bg-slate-50 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                      {acc.name ? acc.name.charAt(0).toUpperCase() : acc.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">{acc.name || acc.email}</div>
                      <div className="text-[11px] text-slate-500 truncate">{acc.email}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleRemoveAccount(acc.email, e)}
                    className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition"
                    title="Remove from this device"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Another Account on this device */}
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="w-full py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
            >
              <Plus className="w-4 h-4" />
              <span>Use another Google account</span>
            </button>
          </div>
        )}

        {/* Form to Add / Enter Device Google Account */}
        {isAddingNew && (
          <form onSubmit={handleSaveAndSelect} className="space-y-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Add your Google Account
            </div>

            {inputError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{inputError}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Google Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. yourname@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Your Name (Optional)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Aman"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              {deviceAccounts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Security badge & Nodemailer delivery notice */}
        <div className="pt-2 border-t border-slate-100 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Direct verification sent via Nodemailer</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
