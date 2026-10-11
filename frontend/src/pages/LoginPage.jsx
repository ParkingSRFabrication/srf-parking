import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  Mail,
  Zap,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Smartphone,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { BrandLogo } from '../components/common/BrandLogo.jsx';
import { getErrorMessage } from '../services/api.js';
import './LoginPage.css';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, requestOtp, verifyOtp, loginWithGoogle } = useAuth();

  // Active tab: 'otp' | 'google' | 'operator'
  const [activeTab, setActiveTab] = useState('operator');
  const [operatorAuthMode, setOperatorAuthMode] = useState('password'); // 'password' | 'mpin'

  // Operator credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mpin, setMpin] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Email OTP state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoCode, setDemoCode] = useState('');

  // Google simulated account picker modal
  const [googlePickerOpen, setGooglePickerOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isExpired = new URLSearchParams(location.search).get('expired') === 'true';

  // Handle Operator / Admin Login
  const handleOperatorSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        username: username.trim(),
        ...(operatorAuthMode === 'password' ? { password } : { mpin })
      };

      await login(payload);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await requestOtp(email);
      setOtpSent(true);
      if (res.demoCode) {
        setDemoCode(res.demoCode);
      }
      setSuccess(`Verification code dispatched to ${email}. Check your inbox!`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await verifyOtp({
        email,
        otp: otp.trim(),
        name: name.trim() || undefined,
        role: 'operator'
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login
  const handleGoogleSelect = async (account) => {
    setGooglePickerOpen(false);
    setLoading(true);
    setError(null);

    try {
      await loginWithGoogle({
        email: account.email,
        name: account.name,
        googleId: account.sub,
        picture: account.picture
      });
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
    <div className="min-h-screen bg-[#090D16] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden text-slate-100">
      {/* Background Decorative Rings & Ambient Glows */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Back to Home & User Manual Link */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 z-10 px-2 text-xs">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
        </Link>
        <Link
          to="/#manual"
          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition font-semibold"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>User Manuals</span>
        </Link>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-10 backdrop-blur-xl">
        {/* Header Banner */}
        <div className="bg-[#142B4A] p-6 text-center text-white relative">
          <div className="flex justify-center mb-2">
            <BrandLogo size="default" inverted={true} />
          </div>
          <div className="text-xs text-blue-200 mt-1 font-medium">
            Railway Station SmartPark Terminal Access
          </div>
        </div>

        {/* Form Container */}
        <div className="p-5 sm:p-8 space-y-4">
          {/* Expired Session Notice */}
          {isExpired && (
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Your session has expired. Please sign in again.</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {/* Instant Demo Code Notice */}
          {demoCode && (
            <div className="p-3 bg-indigo-500/20 border border-indigo-500/40 rounded-xl text-xs text-indigo-300 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Free Verification Code:</span>
              </div>
              <div className="text-base font-black font-mono tracking-widest text-cyan-300">
                {demoCode}
              </div>
            </div>
          )}

          {/* Top Method Tabs */}
          <div className="flex p-1 bg-slate-950 rounded-xl border border-white/5 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setActiveTab('operator'); setError(null); }}
              className={`flex-1 py-2 rounded-lg transition ${
                activeTab === 'operator' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Booth Staff
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('otp'); setError(null); }}
              className={`flex-1 py-2 rounded-lg transition ${
                activeTab === 'otp' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Email OTP
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('google'); setError(null); }}
              className={`flex-1 py-2 rounded-lg transition ${
                activeTab === 'google' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Google
            </button>
          </div>

          {/* METHOD 1: OPERATOR / ADMIN CREDENTIALS */}
          {activeTab === 'operator' && (
            <div className="space-y-4">
              <div className="flex p-0.5 bg-slate-950 rounded-lg border border-white/5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => { setOperatorAuthMode('password'); setError(null); }}
                  className={`flex-1 py-1.5 rounded transition ${
                    operatorAuthMode === 'password' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                >
                  Password Login
                </button>
                <button
                  type="button"
                  onClick={() => { setOperatorAuthMode('mpin'); setError(null); }}
                  className={`flex-1 py-1.5 rounded transition flex items-center justify-center gap-1 ${
                    operatorAuthMode === 'mpin' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                >
                  <KeyRound className="w-3 h-3 text-cyan-400" />
                  <span>4-Digit MPIN</span>
                </button>
              </div>

              <form onSubmit={handleOperatorSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
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
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {operatorAuthMode === 'password' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-slate-400 hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      4-Digit Security MPIN
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        pattern="\d{4}"
                        required
                        placeholder="••••"
                        value={mpin}
                        onChange={(e) => setMpin(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-10 pr-4 py-2.5 text-center bg-slate-950 border border-white/10 rounded-xl text-white font-mono font-bold tracking-widest text-lg focus:outline-none focus:border-cyan-400 transition"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-glow flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Authenticate Terminal</span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Test Logins */}
              <div className="pt-3 border-t border-white/10 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Development Test Accounts
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleFillDemo('admin')}
                    className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-lg transition"
                  >
                    Admin (admin)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('operator')}
                    className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-lg transition"
                  >
                    Booth (operator1)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* METHOD 2: EMAIL OTP (FREE GMAIL ACCESS) */}
          {activeTab === 'otp' && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleRequestOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Your Email (Gmail or any account)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="youremail@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      New users get automatically registered with instant free access!
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-glow flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-cyan-300" />
                        <span>Send 6-Digit OTP</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Your Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Enter 6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-center font-mono font-bold tracking-widest text-lg focus:outline-none focus:border-cyan-400 transition"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="flex-1 py-2.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700 transition"
                    >
                      Change Email
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-glowEmerald flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify & Sign In</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* METHOD 3: CONTINUE WITH GOOGLE */}
          {activeTab === 'google' && (
            <div className="space-y-4 text-center py-2">
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect your Google Account to automatically sign in or register with verified credentials.
              </p>

              <button
                type="button"
                onClick={() => setGooglePickerOpen(true)}
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-bold text-xs shadow-md transition flex items-center justify-center gap-3 border border-slate-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="text-[10px] text-slate-500">
                SR Fabrication protects your privacy. Authorized Indian Railway authentication.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GOOGLE SIMULATED ACCOUNT PICKER MODAL */}
      {googlePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-white text-slate-900 rounded-3xl shadow-2xl p-6 space-y-4">
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
              <p className="text-xs text-slate-500">Choose an account to continue to SRF Parking</p>
            </div>

            <div className="divide-y divide-slate-100 border-y border-slate-100">
              {[
                { name: 'Aman (Primary)', email: 'aman.railway@gmail.com', sub: 'g-101' },
                { name: 'Commuter User', email: 'commuter.user@gmail.com', sub: 'g-102' },
                { name: 'Station Staff', email: 'railway.operator@gmail.com', sub: 'g-103' }
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleGoogleSelect(acc)}
                  className="w-full py-3 px-2 flex items-center gap-3 text-left hover:bg-slate-50 rounded-xl transition"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {acc.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">{acc.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{acc.email}</div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setGooglePickerOpen(false)}
              className="w-full py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
