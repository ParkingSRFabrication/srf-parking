import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { BrandLogo } from '../components/common/BrandLogo.jsx';
import { getErrorMessage } from '../services/api.js';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [authMode, setAuthMode] = useState('password'); // 'password' | 'mpin'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mpin, setMpin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isExpired = new URLSearchParams(location.search).get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        username: username.trim(),
        ...(authMode === 'password' ? { password } : { mpin })
      };

      await login(payload);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type) => {
    if (type === 'admin') {
      setUsername('admin');
      setPassword('Admin@1234');
      setMpin('1234');
    } else {
      setUsername('operator1');
      setPassword('Operator@123');
      setMpin('4321');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative z-10">
        {/* Header Banner */}
        <div className="bg-[#142B4A] p-8 text-center text-white relative">
          <div className="flex justify-center mb-3">
            <BrandLogo size="large" inverted={true} />
          </div>
          <div className="text-xs text-blue-200 mt-2 font-medium">
            Authorized Railway Operator & Admin Portal
          </div>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-8">
          {/* Expired Session Notice */}
          {isExpired && (
            <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Your session has expired. Please sign in again.</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Mode Switch Tabs (Password vs 4-Digit MPIN) */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setAuthMode('password'); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                authMode === 'password'
                  ? 'bg-white text-[#142B4A] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('mpin'); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                authMode === 'mpin'
                  ? 'bg-white text-[#142B4A] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-[#2457A7]" />
              Quick MPIN (4-Digit)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Operator ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username or Operator ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. admin or OP-001"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2457A7] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Password Field */}
            {authMode === 'password' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2457A7] focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  4-Digit Security MPIN
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    maxLength={4}
                    pattern="\d{4}"
                    required
                    placeholder="••••"
                    value={mpin}
                    onChange={(e) => setMpin(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-2.5 text-sm tracking-widest font-mono text-center bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2457A7] focus:bg-white transition text-lg"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Convenience MPIN for fast terminal operation. Subject to automatic rate limits.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#142B4A] hover:bg-[#2457A7] text-white font-bold rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate & Enter</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
              Development Test Accounts
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin')}
                className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
              >
                Fill Admin (admin)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('operator')}
                className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
              >
                Fill Booth (operator1)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
