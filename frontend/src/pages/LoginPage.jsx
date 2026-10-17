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
  BookOpen,
  Car,
  Users,
  Shield,
  Phone,
  UserPlus,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { BrandLogo } from '../components/common/BrandLogo.jsx';
import { GoogleAccountPickerModal } from '../components/common/GoogleAccountPickerModal.jsx';
import { ThemeToggle } from '../components/common/ThemeToggle.jsx';
import { getErrorMessage } from '../services/api.js';
import './LoginPage.css';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, requestOtp, verifyOtp, loginWithGoogle } = useAuth();

  // Mode: 'signin' | 'register'
  const [authMode, setAuthMode] = useState('signin');

  // Sign In Role Tab: 'customer' | 'operator' | 'admin'
  const [signInRole, setSignInRole] = useState('customer');

  // Method for customer login: 'credentials' | 'otp' | 'google'
  const [customerMethod, setCustomerMethod] = useState('credentials');

  // Credentials state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mpin, setMpin] = useState('');
  const [authModeType, setAuthModeType] = useState('password'); // 'password' | 'mpin'
  const [showPassword, setShowPassword] = useState(false);

  // Email OTP state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoCode, setDemoCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isLiveSmtp, setIsLiveSmtp] = useState(false);

  // Register Form State (Vehicle User Only)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regVehicleNumber, setRegVehicleNumber] = useState('');
  const [regVehicleType, setRegVehicleType] = useState('bike');

  // Google simulated account picker modal
  const [googlePickerOpen, setGooglePickerOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isExpired = new URLSearchParams(location.search).get('expired') === 'true';

  const redirectByRole = (role) => {
    if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (role === 'operator') {
      navigate('/operator/dashboard', { replace: true });
    } else {
      navigate('/customer/dashboard', { replace: true });
    }
  };

  // Handle Standard Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        username: username.trim(),
        ...(authModeType === 'password' ? { password } : { mpin })
      };

      const res = await login(payload);
      redirectByRole(res?.user?.role);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle Customer Public Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        name: regName.trim(),
        email: regEmail.trim() || undefined,
        phone: regPhone.trim() || undefined,
        password: regPassword,
        vehicleNumber: regVehicleNumber.trim() ? regVehicleNumber.trim().toUpperCase() : undefined,
        vehicleType: regVehicleType
      };

      const res = await register(payload);
      setSuccess('Vehicle User account registered successfully! Redirecting to dashboard...');
      setTimeout(() => {
        redirectByRole(res?.user?.role || 'customer');
      }, 500);
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
      setEmailSent(Boolean(res.emailSent));
      setIsLiveSmtp(Boolean(res.isLiveSmtp));

      if (res.emailSent) {
        setSuccess(`Verification code dispatched to ${email}. Check your inbox!`);
      } else {
        setSuccess(`OTP code generated! Live SMTP is not configured, use code: ${res.demoCode || '123456'}`);
      }
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
      const res = await verifyOtp({
        email,
        otp: otp.trim()
      });
      redirectByRole(res?.user?.role || 'customer');
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
      const res = await loginWithGoogle({
        email: account.email,
        name: account.name,
        googleId: account.sub,
        picture: account.picture
      });
      redirectByRole(res?.user?.role || 'customer');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Fill Demo Credentials for grading/testing
  const handleFillDemo = (type) => {
    setError(null);
    setAuthMode('signin');
    if (type === 'admin') {
      setSignInRole('admin');
      setUsername('admin');
      setPassword('Admin@1234');
      setMpin('1234');
      setAuthModeType('password');
    } else if (type === 'operator') {
      setSignInRole('operator');
      setUsername('operator1');
      setPassword('Operator@123');
      setMpin('4321');
      setAuthModeType('password');
    } else {
      setSignInRole('customer');
      setCustomerMethod('credentials');
      setUsername('customer1');
      setPassword('Customer@123');
      setMpin('1111');
      setAuthModeType('password');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#0B141A] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden text-slate-900 dark:text-slate-100 transition-colors">
      {/* Background Decorative Rings & Ambient Glows */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#00A884]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[#008F6F]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Back to Home & User Manual Link & Theme Toggle */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 z-10 px-2 text-xs">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-[#00A884] dark:hover:text-white transition font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/#manual"
            className="flex items-center gap-1 text-[#00A884] hover:underline transition font-semibold"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>User Manuals</span>
          </Link>
          <ThemeToggle variant="icon" />
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#111B21] border border-slate-200/90 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden relative z-10 backdrop-blur-xl">
        {/* Header Banner */}
        <div className="bg-[#00A884] p-6 text-center text-white relative">
          <div className="flex justify-center mb-2">
            <BrandLogo size="default" inverted={true} />
          </div>
          <div className="text-xs text-white/90 mt-1 font-medium">
            Railway Station SmartPark Role-Based Portal
          </div>
        </div>

        {/* Primary Action Switch: Sign In vs Create Account */}
        <div className="p-1.5 bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-white/5 flex text-xs font-bold font-mono gap-1">
          <button
            type="button"
            onClick={() => { setAuthMode('signin'); setError(null); setSuccess(null); }}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
              authMode === 'signin'
                ? 'bg-[#00A884] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Role Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('register'); setError(null); setSuccess(null); }}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
              authMode === 'register'
                ? 'bg-[#00A884] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Vehicle User</span>
          </button>
        </div>

        {/* Form Container */}
        <div className="p-5 sm:p-7 space-y-4">
          {/* Expired Session Notice */}
          {isExpired && (
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>Your session has expired. Please sign in again.</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#00A884]" />
              <span>{success}</span>
            </div>
          )}

          {/* Instant Demo Code Notice */}
          {demoCode && (
            <div className="p-3 bg-[#00A884]/10 border border-[#00A884]/30 rounded-xl text-xs text-[#00A884] space-y-1">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00A884]" />
                <span>Verification Code:</span>
              </div>
              <div className="text-base font-black font-mono tracking-widest text-[#00A884]">
                {demoCode}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 1: SIGN IN VIEW (3 DISTINCT ROLES)                  */}
          {/* ======================================================== */}
          {authMode === 'signin' && (
            <div className="space-y-4">
              {/* Role Select Tabs */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                  Select User Role
                </label>
                <div className="grid grid-cols-3 p-1 bg-slate-100 dark:bg-slate-950/80 rounded-xl border border-slate-200/80 dark:border-white/5 text-xs font-bold gap-1">
                  <button
                    type="button"
                    onClick={() => { setSignInRole('customer'); setError(null); }}
                    className={`py-2 px-1 rounded-lg transition flex flex-col items-center gap-1 text-[11px] ${
                      signInRole === 'customer'
                        ? 'bg-[#00A884] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Customer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSignInRole('operator'); setError(null); }}
                    className={`py-2 px-1 rounded-lg transition flex flex-col items-center gap-1 text-[11px] ${
                      signInRole === 'operator'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Operator</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSignInRole('admin'); setError(null); }}
                    className={`py-2 px-1 rounded-lg transition flex flex-col items-center gap-1 text-[11px] ${
                      signInRole === 'admin'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              {/* Sub-Methods for Vehicle User (Password vs OTP vs Google) */}
              {signInRole === 'customer' && (
                <div className="flex p-0.5 bg-slate-100 dark:bg-slate-950/80 rounded-lg border border-slate-200/80 dark:border-white/5 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => { setCustomerMethod('credentials'); setError(null); }}
                    className={`flex-1 py-1.5 rounded transition ${
                      customerMethod === 'credentials' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Password Login
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCustomerMethod('otp'); setError(null); }}
                    className={`flex-1 py-1.5 rounded transition ${
                      customerMethod === 'otp' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Email OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCustomerMethod('google'); setError(null); }}
                    className={`flex-1 py-1.5 rounded transition ${
                      customerMethod === 'google' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Google
                  </button>
                </div>
              )}

              {/* OPERATOR OR ADMIN MPIN TOGGLE */}
              {signInRole !== 'customer' && (
                <div className="flex p-0.5 bg-slate-100 dark:bg-slate-950/80 rounded-lg border border-slate-200/80 dark:border-white/5 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => { setAuthModeType('password'); setError(null); }}
                    className={`flex-1 py-1.5 rounded transition ${
                      authModeType === 'password' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthModeType('mpin'); setError(null); }}
                    className={`flex-1 py-1.5 rounded transition flex items-center justify-center gap-1 ${
                      authModeType === 'mpin' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <KeyRound className="w-3 h-3 text-[#00A884]" />
                    <span>4-Digit MPIN</span>
                  </button>
                </div>
              )}

              {/* STANDARD CREDENTIALS FORM */}
              {(signInRole !== 'customer' || customerMethod === 'credentials') && (
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                      {signInRole === 'admin'
                        ? 'Admin Username / ID'
                        : signInRole === 'operator'
                        ? 'Operator ID or Username'
                        : 'Username, Email, or Phone'}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder={
                          signInRole === 'admin'
                            ? 'admin or ADM-001'
                            : signInRole === 'operator'
                            ? 'operator1 or OP-001'
                            : 'customer1 or 9876543211'
                        }
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#00A884] focus:border-[#00A884] transition"
                      />
                    </div>
                  </div>

                  {authModeType === 'password' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
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
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#00A884] focus:border-[#00A884] transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                        4-Digit Terminal MPIN
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
                          className="w-full pl-10 pr-4 py-2.5 text-center bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-mono font-bold tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-[#00A884] focus:border-[#00A884] transition"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50 ${
                      signInRole === 'admin'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : signInRole === 'operator'
                        ? 'bg-sky-600 hover:bg-sky-700'
                        : 'bg-[#00A884] hover:bg-[#008F6F]'
                    }`}
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Sign In as {signInRole === 'admin' ? 'Administrator' : signInRole === 'operator' ? 'Parking Operator' : 'Vehicle User'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* CUSTOMER OTP FORM */}
              {signInRole === 'customer' && customerMethod === 'otp' && (
                <div className="space-y-3.5">
                  {!otpSent ? (
                    <form onSubmit={handleRequestOtp} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                          Customer Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="customer@example.com"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#00A884] focus:border-[#00A884] transition"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#00A884] hover:bg-[#008F6F] text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            <span>Request 6-Digit Verification Code</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                      {/* OTP Guidance / Simulation Card */}
                      <div className="rounded-xl p-3 text-xs border border-amber-500/30 bg-amber-500/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                            {emailSent ? 'Code Dispatched' : 'Verification OTP'}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold">
                            {emailSent ? 'Inbox Delivery' : 'Simulation Mode'}
                          </span>
                        </div>

                        {!emailSent ? (
                          <>
                            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                              Live SMTP is not configured in <span className="font-mono text-amber-600 dark:text-amber-200">backend/.env</span>. Use your generated OTP code below:
                            </p>
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <div className="bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-amber-500/40 text-amber-700 dark:text-amber-300 font-mono font-bold text-base tracking-widest">
                                {demoCode || '123456'}
                              </div>
                              <button
                                type="button"
                                onClick={() => setOtp(demoCode || '123456')}
                                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-bold rounded-lg transition active:scale-95 flex items-center gap-1 border border-amber-500/30"
                              >
                                <span>Auto-fill OTP</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setOtp('123456')}
                                className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg transition"
                                title="Default Master OTP"
                              >
                                Use 123456
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-[11px] text-slate-600 dark:text-slate-300">
                            Code sent to <span className="font-mono font-bold text-slate-900 dark:text-white">{email}</span>. Please check inbox and spam.
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-[10px] text-slate-400">Testing?</span>
                              <button
                                type="button"
                                onClick={() => setOtp('123456')}
                                className="text-[10px] text-amber-600 dark:text-amber-400 underline hover:text-amber-700 font-medium"
                              >
                                Click here to fill Master OTP (123456)
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                          Enter 6-Digit OTP Code
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="••••••"
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-center font-mono font-bold tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-[#00A884] focus:border-[#00A884] transition"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        >
                          Change Email
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 py-2.5 bg-[#00A884] hover:bg-[#008F6F] text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition active:scale-[0.98] disabled:opacity-50"
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

              {/* CUSTOMER GOOGLE SIGN IN */}
              {signInRole === 'customer' && customerMethod === 'google' && (
                <div className="space-y-4 text-center py-2">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Sign in with Google to access your vehicles, monthly passes, and digital parking receipts.
                  </p>

                  <button
                    type="button"
                    onClick={() => setGooglePickerOpen(true)}
                    className="w-full py-3.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-3 border border-slate-200 dark:border-white/10 active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>
              )}

              {/* Fast 1-Click Demo Logins for Evaluation */}
              <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 text-center">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2 font-mono">
                  1-Click Role Login Shortcuts
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleFillDemo('customer')}
                    className="py-1.5 px-1 bg-[#00A884]/10 hover:bg-[#00A884]/20 text-[#00A884] text-[11px] font-mono rounded-lg border border-[#00A884]/30 transition truncate active:scale-95"
                  >
                    🚗 Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('operator')}
                    className="py-1.5 px-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-[11px] font-mono rounded-lg border border-sky-500/30 transition truncate active:scale-95"
                  >
                    🎫 Operator
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('admin')}
                    className="py-1.5 px-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-[11px] font-mono rounded-lg border border-purple-500/30 transition truncate active:scale-95"
                  >
                    👑 Admin
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 2: REGISTER VEHICLE USER (PUBLIC SIGN UP)           */}
          {/* ======================================================== */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Security Boundary Notice */}
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-[11px] text-emerald-800 dark:text-emerald-300 leading-snug">
                <strong>Public Registration:</strong> Creates <strong>Vehicle User / Customer</strong> accounts only. Operator accounts are issued exclusively by station administrators.
              </div>

              {/* Fixed Role Badge */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 font-mono">
                  Account Role (Fixed & Enforced)
                </label>
                <div className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-[#00A884]/30 rounded-xl text-[#00A884] font-bold text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-[#00A884]" />
                    <span>Vehicle User / Customer</span>
                  </span>
                  <span className="text-[10px] font-mono bg-[#00A884]/15 px-2 py-0.5 rounded text-[#00A884]">
                    Non-Selectable
                  </span>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#00A884] focus:border-[#00A884] transition"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 font-mono">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#00A884] focus:border-[#00A884] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 font-mono">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="98765 43210"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#00A884] focus:border-[#00A884] transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Password (min 6 chars) *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Create a strong password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#00A884] focus:border-[#00A884] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Vehicle Number & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 font-mono">
                    Vehicle Plate (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MH 12 AB 1234"
                    value={regVehicleNumber}
                    onChange={(e) => setRegVehicleNumber(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-mono uppercase text-xs focus:outline-none focus:ring-2 focus:ring-[#00A884] focus:border-[#00A884] transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 font-mono">
                    Category
                  </label>
                  <select
                    value={regVehicleType}
                    onChange={(e) => setRegVehicleType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs capitalize focus:outline-none focus:ring-2 focus:ring-[#00A884] focus:border-[#00A884] transition"
                  >
                    <option value="bike">Two Wheeler (Bike)</option>
                    <option value="car">Four Wheeler (Car)</option>
                    <option value="auto">Auto Rickshaw</option>
                    <option value="cycle">Bicycle</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#00A884] hover:bg-[#008F6F] text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Complete Vehicle User Registration</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* GOOGLE DEVICE ACCOUNTS PICKER MODAL */}
      <GoogleAccountPickerModal
        isOpen={googlePickerOpen}
        onClose={() => setGooglePickerOpen(false)}
        onSelectAccount={handleGoogleSelect}
        loading={loading}
      />
    </div>
  );
}
