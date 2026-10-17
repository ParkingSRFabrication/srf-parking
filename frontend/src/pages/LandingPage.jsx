import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Smartphone,
  Download,
  BookOpen,
  ArrowRight,
  Sparkles,
  Zap,
  Clock,
  Car,
  Bike,
  CheckCircle2,
  ChevronRight,
  QrCode,
  CreditCard,
  Printer,
  KeyRound,
  FileText,
  HelpCircle,
  Mail,
  UserCheck,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layers,
  BarChart3,
  Users,
  Compass,
  Laptop,
  Check,
  Share2,
  Lock,
  X,
  Menu,
  ArrowUp
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo.jsx';
import { ThemeToggle } from '../components/common/ThemeToggle.jsx';
import { GoogleAccountPickerModal } from '../components/common/GoogleAccountPickerModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { usePWAInstall } from '../utils/usePWAInstall.js';
import { getErrorMessage } from '../services/api.js';
import './LandingPage.css';

export function LandingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, requestOtp, verifyOtp, loginWithGoogle } = useAuth();
  const { canInstall, isInstalled, isIOS, install } = usePWAInstall();

  // Navigation & Active manual persona
  const [activeManualTab, setActiveManualTab] = useState('operator'); // 'operator' | 'admin' | 'commuter' | 'hardware'
  const [activeFaq, setActiveFaq] = useState(null);

  // Responsive mobile menu & scroll-to-top state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('otp'); // 'otp' | 'google' | 'operator'
  const [authSubmode, setAuthSubmode] = useState('login'); // 'login' | 'signup'

  // Email OTP state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtpCode, setDemoOtpCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isLiveSmtp, setIsLiveSmtp] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(null);

  // Operator credentials state
  const [operatorId, setOperatorId] = useState('');
  const [password, setPassword] = useState('');
  const [mpin, setMpin] = useState('');
  const [operatorMode, setOperatorMode] = useState('password'); // 'password' | 'mpin'

  // Google simulated account picker modal
  const [googlePickerOpen, setGooglePickerOpen] = useState(false);

  // iOS Install Instructions Modal
  const [iosModalOpen, setIosModalOpen] = useState(false);

  // Interactive Tariff Calculator State
  const [calcVehicle, setCalcVehicle] = useState('bike');
  const [calcDuration, setCalcDuration] = useState('4h');

  // Handle PWA Install click
  const handleInstallClick = async () => {
    if (isIOS) {
      setIosModalOpen(true);
      return;
    }
    if (canInstall) {
      await install();
    } else {
      // In desktop/browsers where prompt is not available, show guidance
      setIosModalOpen(true);
    }
  };

  // Handle Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setOtpLoading(true);

    try {
      const res = await requestOtp(email);
      setOtpSent(true);
      if (res.demoCode) {
        setDemoOtpCode(res.demoCode);
      }
      setEmailSent(Boolean(res.emailSent));
      setIsLiveSmtp(Boolean(res.isLiveSmtp));

      if (res.emailSent) {
        setAuthSuccess(`Verification code dispatched to ${email}. Check your inbox!`);
      } else {
        setAuthSuccess(`OTP code generated! Live SMTP is not configured, use code: ${res.demoCode || '123456'}`);
      }
    } catch (err) {
      setAuthError(getErrorMessage(err));
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setOtpLoading(true);

    try {
      await verifyOtp({
        email,
        otp: otp.trim(),
        name: fullName.trim() || undefined
      });
      setAuthModalOpen(false);
      navigate('/dashboard');
    } catch (err) {
      setAuthError(getErrorMessage(err));
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle Google Login Simulation / Execution
  const handleGoogleSelect = async (account) => {
    setGooglePickerOpen(false);
    setOtpLoading(true);
    try {
      await loginWithGoogle({
        email: account.email,
        name: account.name,
        googleId: account.sub,
        picture: account.picture
      });
      setAuthModalOpen(false);
      navigate('/dashboard');
    } catch (err) {
      setAuthError(getErrorMessage(err));
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle Operator / Admin / Customer Login
  const handleOperatorLogin = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setOtpLoading(true);

    try {
      await login({
        username: operatorId.trim(),
        ...(operatorMode === 'password' ? { password } : { mpin })
      });
      setAuthModalOpen(false);
      navigate('/dashboard');
    } catch (err) {
      setAuthError(getErrorMessage(err));
    } finally {
      setOtpLoading(false);
    }
  };

  // Demo Autofills
  const fillDemoCreds = (type) => {
    if (type === 'admin') {
      setOperatorId('admin');
      setPassword('Admin@1234');
      setMpin('1234');
    } else if (type === 'operator') {
      setOperatorId('operator1');
      setPassword('Operator@123');
      setMpin('4321');
    } else {
      setOperatorId('customer1');
      setPassword('Customer@123');
      setMpin('1111');
    }
    setAuthError(null);
  };

  // Tariff calculator lookup
  const getTariffEstimate = () => {
    const baseRates = {
      bike: { '1h': 10, '4h': 20, '12h': 40, '24h': 60, '1m': 400 },
      car: { '1h': 25, '4h': 50, '12h': 100, '24h': 150, '1m': 1200 },
      auto: { '1h': 15, '4h': 30, '12h': 60, '24h': 90, '1m': 600 },
      cycle: { '1h': 5, '4h': 10, '12h': 15, '24h': 20, '1m': 150 },
      bus: { '1h': 50, '4h': 100, '12h': 200, '24h': 300, '1m': 2500 }
    };
    const rate = baseRates[calcVehicle]?.[calcDuration] || 30;
    const gst = Math.round(rate * 0.18);
    return {
      subtotal: rate,
      gst,
      total: rate + gst
    };
  };

  const tariffEstimate = getTariffEstimate();

  return (
    <div className="landing-root min-h-screen bg-[#F0F2F5] dark:bg-[#0B141A] text-slate-800 dark:text-slate-100 selection:bg-[#00A884] selection:text-white transition-colors duration-200">
      {/* BACKGROUND AMBIENT GLOWS */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-10 w-[450px] h-[450px] bg-teal-500/10 dark:bg-teal-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* TOP FLOATING LUXURY NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0B141A]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0" onClick={() => setMobileMenuOpen(false)}>
            <BrandLogo size="default" inverted={false} subtitleClassName="hidden sm:flex" />
          </Link>

          {/* Center Navigation Links (Desktop lg+) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#manual" className="hover:text-[#00A884] dark:hover:text-[#00A884] transition flex items-center gap-1.5 py-1">
              <BookOpen className="w-3.5 h-3.5 text-[#00A884]" />
              <span>User Manual</span>
            </a>
            <a href="#features" className="hover:text-[#00A884] dark:hover:text-[#00A884] transition flex items-center gap-1.5 py-1">
              <Zap className="w-3.5 h-3.5 text-[#00A884]" />
              <span>Features</span>
            </a>
            <a href="#tariffs" className="hover:text-amber-500 transition flex items-center gap-1.5 py-1">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Tariff Rates</span>
            </a>
            <a href="#install-pwa" className="hover:text-emerald-500 transition flex items-center gap-1.5 py-1">
              <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
              <span>Mobile PWA App</span>
            </a>
            <a href="#faq" className="hover:text-slate-900 dark:hover:text-white transition py-1">
              FAQ
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Theme Toggle Icon Button */}
            <ThemeToggle variant="icon" />

            {/* Install PWA Mobile Button */}
            <button
              onClick={handleInstallClick}
              className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-[#00A884] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-xs font-bold transition shadow-xs"
              title="Install Web App on your phone"
            >
              <Download className="w-3.5 h-3.5 text-[#00A884] dark:text-emerald-400" />
              <span>Install App</span>
            </button>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#00A884] hover:bg-[#008F6F] text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-[0.98]"
              >
                <span>Terminal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthTab('otp');
                    setAuthSubmode('login');
                    setAuthModalOpen(true);
                  }}
                  className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthTab('otp');
                    setAuthSubmode('signup');
                    setAuthModalOpen(true);
                  }}
                  className="hidden xs:flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#00A884] hover:bg-[#008F6F] text-white rounded-xl text-xs font-bold shadow-sm transition transform active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white/90" />
                  <span>Free Sign Up</span>
                </button>
              </>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="lg:hidden p-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#00A884]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE NAVIGATION DRAWER */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2.5 pt-3 border-t border-slate-200 dark:border-white/10 animate-slide-down space-y-3 pb-1">
            <nav className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <a
                href="#manual"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/5 transition"
              >
                <BookOpen className="w-4 h-4 text-[#00A884] dark:text-cyan-400 shrink-0" />
                <span className="truncate">User Manual</span>
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/5 transition"
              >
                <Zap className="w-4 h-4 text-[#00A884] shrink-0" />
                <span className="truncate">Core Features</span>
              </a>
              <a
                href="#tariffs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/5 transition"
              >
                <Layers className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">Tariff Rates</span>
              </a>
              <a
                href="#install-pwa"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/5 transition"
              >
                <Smartphone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">Mobile PWA App</span>
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/5 transition col-span-2"
              >
                <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">Frequently Asked Questions (FAQ)</span>
              </a>
            </nav>

            {/* Mobile Drawer Quick Action Buttons */}
            <div className="pt-1 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleInstallClick();
                }}
                className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-[#00A884] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4 text-[#00A884]" />
                <span>Install Application on Mobile Device</span>
              </button>

              {!isAuthenticated && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthTab('otp');
                      setAuthSubmode('signup');
                      setAuthModalOpen(true);
                    }}
                    className="py-2.5 bg-[#00A884] hover:bg-[#008F6F] text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white/90" />
                    <span>Free Sign Up</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthTab('operator');
                      setAuthModalOpen(true);
                    }}
                    className="py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00A884]" />
                    <span>Booth Staff</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-8 sm:pt-14 pb-12 sm:pb-20 px-3 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] sm:text-xs font-semibold text-[#00A884] dark:text-emerald-300 max-w-full">
                <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#00A884] animate-pulse shrink-0" />
                <span className="truncate sm:whitespace-normal">SR FABRICATION • INDIAN RAILWAYS COMPLIANT VEHICLE SYSTEM</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-black font-outfit tracking-tight leading-[1.15] sm:leading-[1.1] text-slate-900 dark:text-white">
                Next-Gen Smart <br />
                <span className="text-[#00A884]">Railway Parking</span> OS & Mobile App
              </h1>

              {/* Description */}
              <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                A high-throughput, mission-critical parking system designed for Indian Railway stations.
                Issue QR tokens in under <strong>2 seconds</strong>, automate multi-tier tariffs, manage digital monthly passes, and prevent revenue leakage with tamper-proof real-time audit trails.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 pt-2">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 bg-[#00A884] hover:bg-[#008F6F] text-white rounded-2xl text-xs sm:text-sm font-black shadow-sm flex items-center justify-center gap-2.5 transition transform active:scale-95"
                  >
                    <span>Launch Parking Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setAuthTab('otp');
                      setAuthSubmode('signup');
                      setAuthModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 bg-[#00A884] hover:bg-[#008F6F] text-white rounded-2xl text-xs sm:text-sm font-black shadow-sm flex items-center justify-center gap-2.5 transition transform active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-white/90" />
                    <span>Get Free Access with Gmail</span>
                  </button>
                )}

                <button
                  onClick={handleInstallClick}
                  className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition shadow-xs"
                >
                  <Smartphone className="w-4 h-4 text-[#00A884]" />
                  <span>Install as Mobile App</span>
                </button>

                <a
                  href="#manual"
                  className="w-full sm:w-auto px-4 sm:px-5 py-3 sm:py-3.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <BookOpen className="w-4 h-4 text-[#00A884]" />
                  <span>User Manuals</span>
                </a>
              </div>

              {/* Live Metric Tickers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-5 sm:pt-6 border-t border-slate-200/80 dark:border-white/10">
                <div className="p-2.5 sm:p-3 bg-white dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5 text-center shadow-xs">
                  <div className="text-lg sm:text-2xl font-black font-mono text-[#00A884]">&lt; 1.8s</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Token Issuing Speed</div>
                </div>
                <div className="p-2.5 sm:p-3 bg-white dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5 text-center shadow-xs">
                  <div className="text-lg sm:text-2xl font-black font-mono text-emerald-500 dark:text-emerald-400">99.98%</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Station Gate Uptime</div>
                </div>
                <div className="p-2.5 sm:p-3 bg-white dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5 text-center shadow-xs">
                  <div className="text-lg sm:text-2xl font-black font-mono text-teal-600 dark:text-teal-400">50,000+</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Daily Commuters</div>
                </div>
                <div className="p-2.5 sm:p-3 bg-white dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5 text-center shadow-xs">
                  <div className="text-lg sm:text-2xl font-black font-mono text-amber-500 dark:text-amber-400">100%</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Reconciliation</div>
                </div>
              </div>
            </div>

            {/* Hero Right: Station Plaza Operational Telemetry & Authorized Terminal Panel */}
            <div className="lg:col-span-5 max-w-xl mx-auto lg:max-w-none w-full scroll-mt-24">
              <div className="relative">
                {/* Decorative glowing gradient border */}
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 rounded-3xl blur-md opacity-40 animate-pulse" />

                <div className="relative bg-white dark:bg-[#111B21] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-white/10 shadow-xl space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-3.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 bg-emerald-500/10 text-[#00A884] rounded-xl shrink-0 border border-emerald-500/20">
                        <ShieldCheck className="w-5 h-5 text-[#00A884]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate font-outfit">
                          Central Station Terminal Plaza
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                          Zone 01 • Main Gate Entry & Exit Lanes
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-[#00A884] border border-emerald-500/30 rounded-full text-[10px] font-bold tracking-wide shrink-0 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-pulse" />
                      PLAZA ACTIVE
                    </span>
                  </div>

                  {/* Real-time Plaza Telemetry Card */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Station Lot Occupancy</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">284 / 400 Spaces (71%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-200/50 dark:border-white/5">
                      <div className="bg-[#00A884] h-full rounded-full transition-all duration-500" style={{ width: '71%' }} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono pt-1">
                      <span>Available: 116 Spaces</span>
                      <span>Total Plaza Capacity: 400</span>
                    </div>
                  </div>

                  {/* Operational Gate Status */}
                  <div className="space-y-2 text-xs">
                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                      Gate Terminals & Booth Lanes
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#00A884]" />
                          <span className="font-semibold text-slate-800 dark:text-white text-xs">Lane 01 (Entry Gate)</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#00A884] bg-emerald-500/10 px-2 py-0.5 rounded">Thermal QR Terminal</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#00A884]" />
                          <span className="font-semibold text-slate-800 dark:text-white text-xs">Lane 02 (Exit Gate)</span>
                        </div>
                        <span className="text-[10px] font-mono text-teal-600 dark:text-cyan-400 bg-teal-500/10 px-2 py-0.5 rounded">POS & Settlement</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#00A884]" />
                          <span className="font-semibold text-slate-800 dark:text-white text-xs">Lane 03 (Commuter Pass)</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#00A884] bg-emerald-500/10 px-2 py-0.5 rounded">Express Monthly Pass</span>
                      </div>
                    </div>
                  </div>

                  {/* Security Notice on Restricted Access */}
                  <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl space-y-1 text-left">
                    <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold text-xs">
                      <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Authorized Parking Personnel Only</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Vehicle ticketing, tariff collection, and commuter monthly pass issuance/activation are strictly restricted to authenticated <strong>Booth Maintainers</strong> and <strong>Station Administrators</strong> inside the parking facility.
                    </p>
                  </div>

                  {/* Action CTA for Authenticated Staff */}
                  <div className="pt-1 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab('operator');
                        setAuthModalOpen(true);
                      }}
                      className="w-full py-3 bg-[#00A884] hover:bg-[#008F6F] text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition active:scale-[0.98]"
                    >
                      <KeyRound className="w-4 h-4 text-white/90" />
                      <span>Booth Maintainer & Admin Sign In</span>
                    </button>
                    <div className="text-center text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      SR Fabrication • Railway Station Commercial Parking Division
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="py-12 sm:py-20 px-3 sm:px-6 lg:px-8 border-t border-slate-200/80 dark:border-white/10 relative scroll-mt-20">
        <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold text-[#00A884]">
              <Zap className="w-3.5 h-3.5" />
              <span>INDIAN RAILWAY CERTIFIED PLATFORM</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">
              Enterprise Station Parking Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Engineered specifically for busy railway station entry gates, multi-tier tariff enforcement, contactless commuter passes, and zero-leakage fiscal audits.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-[#111B21] p-4 sm:p-6 space-y-3 landing-card-glow border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[#00A884] flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-outfit">Sub-2s Thermal QR Ticketing</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                High-speed vehicle entry with instant 80mm & 58mm thermal token printing. Compatible with ESC/POS USB, Bluetooth, and LAN network ticket printers.
              </p>
            </div>

            <div className="bg-white dark:bg-[#111B21] p-4 sm:p-6 space-y-3 landing-card-glow border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-outfit">Multi-Tier Tariff Automation</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Automated 0-2h, 4h, 12h, 24h, and lost-token penalty slab calculation compliant with Indian Railways rate circulars, including automated 18% GST segregation.
              </p>
            </div>

            <div className="bg-white dark:bg-[#111B21] p-4 sm:p-6 space-y-3 landing-card-glow border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[#00A884] flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-outfit">Digital Monthly Pass Passes</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Express commuter entry with verifiable QR passes for daily train passengers. Real-time expiry alerts, instant renewals, and multi-month discount tiers.
              </p>
            </div>

            <div className="bg-white dark:bg-[#111B21] p-4 sm:p-6 space-y-3 landing-card-glow border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-outfit">Shift Settlement & Cash Handover</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Eliminate booth shortages with automated end-of-shift cash drawer balancing, UPI payment reconciliation, and signed handover statements for station superintendents.
              </p>
            </div>

            <div className="bg-white dark:bg-[#111B21] p-4 sm:p-6 space-y-3 landing-card-glow border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[#00A884] flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-outfit">100% Offline Station Resilience</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Service Worker PWA engine caches critical terminal logic on device. Booth gates keep issuing tokens even during station network failures, syncing automatically upon reconnect.
              </p>
            </div>

            <div className="bg-white dark:bg-[#111B21] p-4 sm:p-6 space-y-3 landing-card-glow border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-outfit">Tamper-Proof Audit Logging</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Every token cancellation, tariff override, and gate emergency release is immutably timestamped with Operator ID and mandatory justification for commercial audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPREHENSIVE INTERACTIVE USER MANUAL SECTION */}
      <section id="manual" className="py-12 sm:py-20 px-3 sm:px-6 lg:px-8 border-t border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-950/60 relative scroll-mt-20">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold text-[#00A884]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>OFFICIAL DOCUMENTATION & OPERATIONAL WORKFLOWS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">
              Complete User Manual for All Station Users
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Comprehensive operational SOPs, terminal guidelines, pass issuing steps, and hardware instructions tailored for every role in the railway ecosystem.
            </p>
          </div>

          {/* Role Persona Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 rounded-2xl max-w-5xl mx-auto w-full">
            {[
              { id: 'operator', label: '1. Booth Attendant / Operator', icon: UserCheck, desc: 'Entry, Exit, POS Cash' },
              { id: 'admin', label: '2. Station Admin / Manager', icon: ShieldCheck, desc: 'Tariffs, Staff, Audits' },
              { id: 'commuter', label: '3. Commuter / Vehicle Owner', icon: CreditCard, desc: 'Monthly Pass, Renewals' },
              { id: 'hardware', label: '4. Hardware & POS Setup', icon: Printer, desc: 'Thermal Print, Barcode, PWA' }
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeManualTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveManualTab(tab.id)}
                  className={`p-2.5 sm:p-3 rounded-xl text-left transition flex items-center gap-2.5 w-full ${
                    active
                      ? 'bg-[#00A884] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate leading-tight">{tab.label}</div>
                    <div className={`text-[10px] truncate ${active ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>{tab.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OPERATOR & BOOTH ATTENDANT MANUAL */}
          {activeManualTab === 'operator' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="glass-card p-6 space-y-3">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-xs font-mono font-black">
                    1
                  </div>
                  <span>Vehicle Check-In Workflow</span>
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Issuing Fast QR Tokens</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When a vehicle arrives at the barrier:
                </p>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Tap the <strong>Vehicle Entry</strong> button on mobile bottom bar or dashboard.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Select the category: <strong>2-Wheeler, 4-Wheeler, Auto, Cycle, Bus</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Input license plate number. Phone number is optional for SMS notifications.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Hit <strong>Issue & Print Token</strong>. Thermal POS immediately prints 80mm barcode token.</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card p-6 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-xs font-mono font-black">
                    2
                  </div>
                  <span>Vehicle Exit & Fee Slabs</span>
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Barcode Scanning & Calculation</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When customer returns to exit the parking facility:
                </p>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Open <strong>Vehicle Exit</strong> screen on terminal or mobile phone.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Scan customer QR token with mobile camera or laser scanner, or type Token Number.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>System calculates parking duration and slab tier breakdown automatically.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Lost token option applies official Indian Railways penalty tariff automatically.</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card p-6 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xs font-mono font-black">
                    3
                  </div>
                  <span>Payment Collection</span>
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Cash & Dynamic UPI Reconciliation</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Seamless dual collection support:
                </p>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Cash Payment:</strong> Enter tendered amount; system displays exact change return.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>UPI QR Payment:</strong> Tap UPI to generate dynamic QR with exact rupee amount encoded.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Print customer exit receipt with GST breakdown and release exit barrier.</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card p-6 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-xs font-mono font-black">
                    4
                  </div>
                  <span>End of Shift Settlement</span>
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Cash Drawer Handover SOP</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  At the end of an 8-hour or 12-hour operator shift:
                </p>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>View <strong>Shift Summary</strong> under dashboard.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>Tally physical cash drawer with system recorded cash total.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>Print Shift Settlement Statement for station manager sign-off.</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card p-6 space-y-3">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-xs font-mono font-black">
                    5
                  </div>
                  <span>4-Digit MPIN Security</span>
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Quick Terminal Lock & Unlock</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Fast booth security for relief operators:
                </p>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span>Unlock terminal in 1 second using personal 4-digit security MPIN.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span>Automatic lockout protection activates after 5 consecutive failed attempts.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span>Session tracks all issued tokens specifically to your Operator ID.</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card p-6 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <div className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center text-xs font-mono font-black">
                    6
                  </div>
                  <span>Emergency Overrides</span>
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Emergency Barrier & VIP Entry</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Protocols for VIP or emergency ambulances:
                </p>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>Ambulance, Fire, Police, and Railway Officers park free of charge.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>Select 'Official Vehicle' toggle in Entry form to log license plate with ₹0 tariff.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>Action is permanently timestamped in the Railway Audit Logs.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: STATION ADMIN & MANAGER MANUAL */}
          {activeManualTab === 'admin' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="glass-card p-6 space-y-3">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                  <BarChart3 className="w-4 h-4" />
                  <span>Real-Time Telemetry</span>
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Live Occupancy & Capacity Alarms</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Monitor capacity at a glance:
                </p>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>View live slot occupancy dials for 2-Wheelers, 4-Wheelers, and Premium bays.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Automatic warning indicator triggers when lot exceeds 90% capacity.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Real-time vehicle movement graph tracks morning & evening train rush hours.</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card p-6 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <Layers className="w-4 h-4" />
                  <span>Dynamic Tariff Engine</span>
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Configuring Slab Rules & GST</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Set rates compliant with railway circulars:
                </p>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Navigate to <strong>Tariff Management</strong> in the admin sidebar.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Configure hourly tiers (0-2h, 2-6h, 6-12h, 12-24h, Over 24h cap).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Configure helmet deposit fee, night parking premium, and GST percentage (18%).</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card p-6 space-y-3">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                  <Users className="w-4 h-4" />
                  <span>Booth Operator Management</span>
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Staff Accounts & Shift Assignment</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Maintain booth operator security:
                </p>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span>Add new operators with unique Operator ID (e.g. OP-104) and name.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span>Assign 4-digit security MPIN for rapid barrier login.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span>Temporarily deactivate accounts or reset credentials in 1 click.</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card p-6 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>Financial & GST Audits</span>
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Settlement Statements & Exports</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Comprehensive fiscal accountability:
                </p>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Generate daily, weekly, and monthly gross revenue statements.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Review breakdown of Cash collections versus direct UPI bank settlement.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Export audit-compliant CSV and print PDF statements for Railway Commercial Audits.</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card p-6 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Tamper-Proof Audit Trail</span>
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Security & Manual Override Logs</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Zero tolerance for revenue evasion:
                </p>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>Every token cancellation requires mandatory operator justification.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>All rate slab edits, failed logins, and gate overrides are permanently logged.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>Search audit logs by date, operator ID, or vehicle number in seconds.</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card p-6 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Compass className="w-4 h-4" />
                  <span>Station Hardware Integration</span>
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Receipt Header & Printer Rules</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tailor POS configuration:
                </p>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>Customize railway station name, division code, and GSTIN number.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>Configure paper width (80mm vs 58mm POS thermal printers).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>Set receipt footer disclaimer and railway grievance helpline contacts.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: COMMUTER & VEHICLE OWNER MANUAL */}
          {activeManualTab === 'commuter' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="glass-card p-6 space-y-3">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                  <CreditCard className="w-4 h-4" />
                  <span>Monthly Passes</span>
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Applying for a Railway Pass</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  For daily office train commuters:
                </p>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span>Apply at booth or online for 1-month, 6-month, or 12-month pass.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span>Provides <strong>up to 60% savings</strong> compared to hourly parking tokens.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span>Receive instant digital pass card on your mobile screen with personal QR.</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card p-6 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <QrCode className="w-4 h-4" />
                  <span>Contactless Fast Gate Access</span>
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Express Lane Barrier Entry</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Zero waiting in line:
                </p>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Show digital pass QR to the optical scanner or attendant.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>System validates pass status in under 500 milliseconds and opens gate.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>No need to collect paper tickets or pay cash each morning.</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card p-6 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span>Pass Renewal & Alerts</span>
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Hassle-Free Validity Extension</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Never miss an expiry:
                </p>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Validity date clearly printed on physical and digital card.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Renew your pass anytime in 1 click before or upon expiration.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Instant payment via UPI scan or cash receipt.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: HARDWARE & POS SETUP MANUAL */}
          {activeManualTab === 'hardware' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="glass-card p-6 space-y-3">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                  <Printer className="w-4 h-4" />
                  <span>Thermal POS Printers</span>
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">ESC/POS 80mm & 58mm Drivers</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Compatible with all standard station hardware:
                </p>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>Connect via USB, Ethernet LAN, or Bluetooth to terminal / tablet.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>Automated print dialog initiates when issuing tokens or receipts.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>High-contrast monochrome QR prints scan easily even with phone cameras.</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card p-6 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <QrCode className="w-4 h-4" />
                  <span>Optical Barcode Scanners</span>
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">USB HID & Mobile Camera Scanners</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ultra-fast token readout:
                </p>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Plug and play USB 2D QR scanners emulate automatic keyboard strokes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>On mobile phones, tap the Camera icon to trigger high-speed camera scanner.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Works in low-light night conditions with device flashlight support.</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card p-6 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Smartphone className="w-4 h-4" />
                  <span>Mobile PWA Offline Cache</span>
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Station Offline Resilience</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Guaranteed operation even if internet drops:
                </p>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>PWA Service Worker caches core application bundle locally on device.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Token generation continues uninterrupted at gate booths.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Automatic sync reconciles records once network connection is restored.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* INTERACTIVE TARIFF RATES & CALCULATOR */}
      <section id="tariffs" className="py-12 sm:py-20 px-3 sm:px-6 lg:px-8 border-t border-slate-200/80 dark:border-white/10 relative scroll-mt-20">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-bold text-amber-600 dark:text-amber-400">
              <Layers className="w-3.5 h-3.5" />
              <span>OFFICIAL TARIFF SLAB CALCULATOR</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">
              Transparent Station Parking Tariffs
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Check official Indian Railways slab rates for any vehicle type and calculate your estimated cost in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Tariff Matrix Table */}
            <div className="lg:col-span-7 bg-white dark:bg-[#111B21] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-white/10 space-y-3 sm:space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-3 gap-1 sm:gap-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Official Standard Rates Schedule
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">GST 18% Inclusive</span>
              </div>

              {/* Mobile swipe helper badge */}
              <div className="sm:hidden text-[10px] text-[#00A884] dark:text-teal-400 font-mono text-center bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-lg py-1 px-2">
                ← Swipe horizontally to view full rate table →
              </div>

              <div className="tariff-table-wrap">
                <table className="w-full text-left text-xs min-w-[460px] sm:min-w-full">
                  <thead>
                    <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-white/10 font-mono text-[11px]">
                      <th className="py-2.5">Category</th>
                      <th className="py-2.5">0 - 4 Hrs</th>
                      <th className="py-2.5">4 - 12 Hrs</th>
                      <th className="py-2.5">12 - 24 Hrs</th>
                      <th className="py-2.5">Monthly Pass</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 dark:divide-white/5 text-slate-800 dark:text-slate-200">
                    <tr>
                      <td className="py-3 font-bold flex items-center gap-2">
                        <Bike className="w-4 h-4 text-[#00A884] shrink-0" />
                        <span>2-Wheeler / Bike</span>
                      </td>
                      <td className="py-3 font-mono">₹20</td>
                      <td className="py-3 font-mono">₹40</td>
                      <td className="py-3 font-mono">₹60</td>
                      <td className="py-3 font-mono font-bold text-[#00A884]">₹400</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold flex items-center gap-2">
                        <Car className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span>4-Wheeler / Car</span>
                      </td>
                      <td className="py-3 font-mono">₹50</td>
                      <td className="py-3 font-mono">₹100</td>
                      <td className="py-3 font-mono">₹150</td>
                      <td className="py-3 font-mono font-bold text-[#00A884]">₹1,200</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold flex items-center gap-2">
                        <Compass className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Auto-Rickshaw (3W)</span>
                      </td>
                      <td className="py-3 font-mono">₹30</td>
                      <td className="py-3 font-mono">₹60</td>
                      <td className="py-3 font-mono">₹90</td>
                      <td className="py-3 font-mono font-bold text-[#00A884]">₹600</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Bicycle / Cycle</span>
                      </td>
                      <td className="py-3 font-mono">₹10</td>
                      <td className="py-3 font-mono">₹15</td>
                      <td className="py-3 font-mono">₹20</td>
                      <td className="py-3 font-mono font-bold text-[#00A884]">₹150</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Interactive Tariff Calculator */}
            <div className="lg:col-span-5 max-w-xl mx-auto lg:max-w-none w-full bg-white dark:bg-[#111B21] p-4 sm:p-6 border border-slate-200/80 dark:border-white/10 space-y-4 rounded-2xl sm:rounded-3xl shadow-xs">
              <div className="flex items-center gap-2 text-[#00A884] font-bold text-xs uppercase tracking-wider">
                <CreditCard className="w-4 h-4" />
                <span>Live Cost Estimator</span>
              </div>

              {/* Vehicle Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 sm:mb-2">
                  Vehicle Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                  {['bike', 'car', 'auto', 'cycle'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setCalcVehicle(v)}
                      className={`py-2 sm:py-2.5 px-2 rounded-xl text-center capitalize text-xs font-bold transition border ${
                        calcVehicle === v
                          ? 'bg-[#00A884] border-[#00A884] text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 sm:mb-2">
                  Duration Tier
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
                  {[
                    { id: '1h', label: '1 Hr' },
                    { id: '4h', label: '4 Hrs' },
                    { id: '12h', label: '12 Hrs' },
                    { id: '24h', label: '24 Hrs' },
                    { id: '1m', label: '1 Mo' }
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setCalcDuration(d.id)}
                      className={`py-2 sm:py-2.5 px-1.5 rounded-xl text-center text-xs font-bold transition border ${
                        calcDuration === d.id
                          ? 'bg-[#00A884] border-[#00A884] text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimate Breakdown Card */}
              <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Base Tariff:</span>
                  <span className="text-slate-800 dark:text-slate-200">₹{tariffEstimate.subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>GST (18%):</span>
                  <span className="text-slate-800 dark:text-slate-200">₹{tariffEstimate.gst}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200/80 dark:border-white/10">
                  <span>Total Payable:</span>
                  <span className="text-[#00A884] font-mono">₹{tariffEstimate.total}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setAuthTab('otp');
                  setAuthSubmode('signup');
                  setAuthModalOpen(true);
                }}
                className="w-full py-2.5 sm:py-3 bg-[#00A884] hover:bg-[#008F6F] text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2"
              >
                <span>Purchase Digital Pass / Token</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* INSTALL AS MOBILE APP (PWA SHOWCASE) */}
      <section id="install-pwa" className="py-12 sm:py-20 px-3 sm:px-6 lg:px-8 border-t border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-950/70 relative scroll-mt-20">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold text-[#00A884]">
              <Smartphone className="w-3.5 h-3.5" />
              <span>INSTALLABLE PROGRESSIVE WEB APPLICATION (PWA)</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">
              Install As Native App on Any Mobile
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Experience the full application directly installed on your smartphone (Android & iPhone). Fast launches from home screen, zero Play Store downloads required, works offline at station gates!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="glass-card p-4 sm:p-6 space-y-3 sm:space-y-4 text-center flex flex-col items-center rounded-2xl">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 text-[#00A884] flex items-center justify-center">
                <Smartphone className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">1-Tap Direct Install</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Click below to add the application straight to your Android or iPhone home screen with native app icon, splash screen, and full-screen experience.
              </p>
              <button
                onClick={handleInstallClick}
                className="mt-auto w-full py-2.5 sm:py-3 bg-[#00A884] hover:bg-[#008F6F] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Download className="w-4 h-4" />
                <span>Install Mobile App Now</span>
              </button>
            </div>

            <div className="glass-card p-4 sm:p-6 space-y-3 sm:space-y-4 text-center flex flex-col items-center rounded-2xl">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Zap className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">Native Mobile Navigation</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                When launched from your mobile home screen, browser search bars vanish! Features touch-friendly bottom bars, haptic feedbacks, and instant optical camera QR scanners.
              </p>
              <div className="mt-auto p-2 sm:p-2.5 bg-slate-100 dark:bg-slate-900 rounded-xl text-[10px] sm:text-[11px] text-[#00A884] dark:text-teal-300 font-mono w-full">
                Edge-to-Edge OLED UI • Safe Area
              </div>
            </div>

            <div className="glass-card p-4 sm:p-6 space-y-3 sm:space-y-4 text-center flex flex-col items-center rounded-2xl">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">Offline Station Mode</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Railway stations often have poor cell signal. Our PWA automatically caches tariffs and tokens locally, letting booth attendants work uninterrupted.
              </p>
              <div className="mt-auto p-2 sm:p-2.5 bg-slate-100 dark:bg-slate-900 rounded-xl text-[10px] sm:text-[11px] text-[#00A884] dark:text-emerald-400 font-mono w-full">
                100% Offline Cache Active
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-12 sm:py-20 px-3 sm:px-6 lg:px-8 border-t border-slate-200/80 dark:border-white/10 relative scroll-mt-20">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <div className="text-center space-y-2.5 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold text-[#00A884]">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">
              Station Operator & User Inquiries
            </h2>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {[
              {
                q: 'How does a first-time user sign up with free Gmail access?',
                a: 'Click "Free Sign Up" or "Get Started" on this page. Enter your Gmail address and click "Send Verification Code". The system issues a 6-digit OTP code directly to your email (with zero cost). Enter the code to instantly create your user account and access the terminal!'
              },
              {
                q: 'How can I install the app on an iPhone (iOS)?',
                a: 'Open this website in Safari on your iPhone. Tap the Share icon (square with arrow pointing up) at the bottom, scroll down and tap "Add to Home Screen", then tap "Add". The app icon appears on your home screen and opens in standalone full-screen mode.'
              },
              {
                q: 'What happens if a vehicle owner loses their parking token?',
                a: 'The booth operator opens the Vehicle Exit screen and toggles "Lost Token Recovery". The operator verifies the vehicle registration certificate (RC) and driver identity, and the system automatically applies the official Indian Railways Lost Token fee structure before clearing exit.'
              },
              {
                q: 'Can the system operate if the railway station internet goes down?',
                a: 'Yes. Thanks to the PWA Service Worker technology, all UI components, tariff slabs, and issuing modules remain cached on the device. Once connectivity returns, transactions automatically synchronize with the central database.'
              },
              {
                q: 'Does the system print GST compliant thermal receipts?',
                a: 'Yes. Every printed thermal ticket and exit receipt displays the Indian Railways station division, GSTIN number, CGST/SGST breakdown, timestamp, token barcode, and official grievance helpline number.'
              }
            ].map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="glass-card overflow-hidden transition rounded-2xl"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-3.5 sm:p-5 text-left flex items-center justify-between gap-3 sm:gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-[#00A884] dark:hover:text-[#00A884] transition"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[#00A884] shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3.5 sm:px-5 sm:pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/80 dark:border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#060911] py-8 sm:py-12 px-3 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400 landing-safe-bottom">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <BrandLogo size="small" inverted={false} />
            <p className="text-[11px] text-slate-500 mt-1">
              SR FABRICATION • Authorized Railway Station Vehicle Parking Management System
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-medium text-slate-600 dark:text-slate-300">
            <a href="#manual" className="hover:text-[#00A884] dark:hover:text-white transition">User Manuals</a>
            <a href="#tariffs" className="hover:text-[#00A884] dark:hover:text-white transition">Tariff Schedule</a>
            <a href="#install-pwa" className="hover:text-[#00A884] dark:hover:text-white transition">PWA Mobile App</a>
            <button onClick={() => { setAuthTab('operator'); setAuthModalOpen(true); }} className="hover:text-[#00A884] dark:hover:text-white transition">
              Staff Portal
            </button>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            Production v2.0 • ISO 9001 Certified Terminal OS
          </div>
        </div>
      </footer>

      {/* AUTH MODAL (LOGIN & SIGNUP WITH GOOGLE & EMAIL OTP) */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md max-h-[92vh] sm:max-h-[88vh] flex flex-col bg-white dark:bg-[#111B21] border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden relative my-auto">
            {/* Modal Header */}
            <div className="shrink-0 bg-[#00A884] p-4 sm:p-6 text-center text-white relative">
              <button
                onClick={() => setAuthModalOpen(false)}
                className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex justify-center mb-1.5 sm:mb-2">
                <BrandLogo size="default" inverted={true} />
              </div>
              <div className="text-xs text-emerald-100 mt-1 font-medium">
                {authSubmode === 'signup' ? 'Create Free Account / Sign Up' : 'Sign In to Parking Terminal'}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto overscroll-contain flex-1 touch-scroll">
              {/* Notices */}
              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}
              {authSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[#00A884] dark:text-emerald-300 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00A884] shrink-0 mt-0.5" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* Demo OTP Banner for instant free testing */}
              {demoOtpCode && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-xs text-slate-700 dark:text-emerald-300 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#00A884]" />
                    <span>Free Access Verification Code:</span>
                  </div>
                  <div className="text-base font-black font-mono tracking-widest text-[#00A884] dark:text-emerald-400">
                    {demoOtpCode}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Enter this code below to proceed immediately!
                  </div>
                </div>
              )}

              {/* Mode Tabs: Email OTP vs Google vs Booth Credentials */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-white/5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setAuthTab('otp'); setAuthError(null); }}
                  className={`flex-1 py-2 rounded-lg transition ${
                    authTab === 'otp' ? 'bg-[#00A884] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Email & OTP
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab('google'); setAuthError(null); }}
                  className={`flex-1 py-2 rounded-lg transition ${
                    authTab === 'google' ? 'bg-[#00A884] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab('operator'); setAuthError(null); }}
                  className={`flex-1 py-2 rounded-lg transition ${
                    authTab === 'operator' ? 'bg-[#00A884] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Booth Staff
                </button>
              </div>

              {/* TAB 1: EMAIL + OTP (FREE ACCESS) */}
              {authTab === 'otp' && (
                <div className="space-y-4">
                  {!otpSent ? (
                    <form onSubmit={handleRequestOtp} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                          Your Email (Gmail or other)
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="youremail@gmail.com"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00A884] transition"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                          First time users will be automatically registered with free access!
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={otpLoading}
                        className="w-full py-3 bg-[#00A884] hover:bg-[#008F6F] text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
                      >
                        {otpLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Zap className="w-4 h-4 text-white/90" />
                            <span>Request Free 6-Digit OTP</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                      {/* OTP Guidance / Simulation Card */}
                      <div className="rounded-xl p-3 text-xs border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5 text-[#00A884]" />
                            {emailSent ? 'Code Dispatched' : 'Verification OTP'}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-400/20 text-emerald-800 dark:text-emerald-200 font-bold">
                            {emailSent ? 'Inbox Delivery' : 'Simulation Mode'}
                          </span>
                        </div>

                        {!emailSent ? (
                          <>
                            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                              Live SMTP is not configured in <span className="font-mono text-[#00A884] dark:text-teal-200">backend/.env</span>. Use your generated OTP code below:
                            </p>
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <div className="bg-white dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-500/40 text-[#00A884] dark:text-emerald-300 font-mono font-bold text-base tracking-widest">
                                {demoOtpCode || '123456'}
                              </div>
                              <button
                                type="button"
                                onClick={() => setOtp(demoOtpCode || '123456')}
                                className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 text-[#00A884] dark:text-emerald-300 text-xs font-bold rounded-lg transition active:scale-95 flex items-center gap-1 border border-emerald-300/60 dark:border-emerald-500/30"
                              >
                                <span>Auto-fill OTP</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setOtp('123456')}
                                className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg transition"
                                title="Default Master OTP"
                              >
                                Use 123456
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-[11px] text-slate-600 dark:text-slate-300">
                            Code sent to <span className="text-slate-900 dark:text-white font-mono">{email}</span>. Please check inbox and spam folder.
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">Testing?</span>
                              <button
                                type="button"
                                onClick={() => setOtp('123456')}
                                className="text-[10px] text-[#00A884] underline hover:text-emerald-600 font-medium"
                              >
                                Click here to fill Master OTP (123456)
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                          Full Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00A884] transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                          Enter 6-Digit OTP Code
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="••••••"
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-center font-mono font-bold tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-[#00A884] transition"
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
                          disabled={otpLoading}
                          className="flex-1 py-2.5 bg-[#00A884] hover:bg-[#008F6F] text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                        >
                          {otpLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Verify & Enter</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 2: CONTINUE WITH GOOGLE */}
              {authTab === 'google' && (
                <div className="space-y-4 text-center py-2">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Sign in with your Google account for instantaneous 1-click verification with zero password setup needed.
                  </p>

                  <button
                    type="button"
                    onClick={() => setGooglePickerOpen(true)}
                    className="w-full py-3.5 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-white text-slate-900 rounded-2xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-3 border border-slate-200"
                  >
                    {/* Google G Logo SVG */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div className="text-[10px] text-slate-500">
                    SR Fabrication protects your privacy. Authorized Indian Railway authentication.
                  </div>
                </div>
              )}

              {/* TAB 3: BOOTH STAFF CREDENTIALS */}
              {authTab === 'operator' && (
                <form onSubmit={handleOperatorLogin} className="space-y-3.5">
                  <div className="flex p-0.5 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-white/5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setOperatorMode('password')}
                      className={`flex-1 py-1.5 rounded transition ${
                        operatorMode === 'password' ? 'bg-[#00A884] text-white' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setOperatorMode('mpin')}
                      className={`flex-1 py-1.5 rounded transition ${
                        operatorMode === 'mpin' ? 'bg-[#00A884] text-white' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      4-Digit MPIN
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Operator ID or Username
                    </label>
                    <input
                      type="text"
                      required
                      value={operatorId}
                      onChange={(e) => setOperatorId(e.target.value)}
                      placeholder="e.g. admin or operator1"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00A884] transition"
                    />
                  </div>

                  {operatorMode === 'password' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00A884] transition"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        4-Digit MPIN
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={mpin}
                        onChange={(e) => setMpin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-center font-mono font-bold tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-[#00A884] transition"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full py-3 bg-[#00A884] hover:bg-[#008F6F] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2"
                  >
                    {otpLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Authenticate Staff</span>
                      </>
                    )}
                  </button>

                  {/* 1-Click Test Credentials */}
                  <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-2">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block text-center font-mono">
                      Quick Test Accounts (3 Roles)
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => fillDemoCreds('customer')}
                        className="py-1.5 px-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-lg text-[10px] font-mono border border-emerald-200 dark:border-emerald-500/30 transition truncate"
                      >
                        🚗 Customer
                      </button>
                      <button
                        type="button"
                        onClick={() => fillDemoCreds('operator')}
                        className="py-1.5 px-1 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 rounded-lg text-[10px] font-mono border border-teal-200 dark:border-teal-500/30 transition truncate"
                      >
                        🎫 Operator
                      </button>
                      <button
                        type="button"
                        onClick={() => fillDemoCreds('admin')}
                        className="py-1.5 px-1 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-800 dark:text-purple-300 rounded-lg text-[10px] font-mono border border-purple-200 dark:border-purple-500/30 transition truncate"
                      >
                        👑 Admin
                      </button>
                    </div>
                    <div className="text-center pt-1">
                      <Link
                        to="/login"
                        onClick={() => setAuthModalOpen(false)}
                        className="text-[11px] text-[#00A884] hover:underline font-bold"
                      >
                        Open Full Dedicated Role Portal &rarr;
                      </Link>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GOOGLE DEVICE ACCOUNTS PICKER MODAL */}
      <GoogleAccountPickerModal
        isOpen={googlePickerOpen}
        onClose={() => setGooglePickerOpen(false)}
        onSelectAccount={handleGoogleSelect}
        loading={otpLoading}
      />

      {/* IOS / BROWSER PWA INSTALL INSTRUCTION MODAL */}
      {iosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto bg-white dark:bg-[#111B21] border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 space-y-4 text-center my-auto touch-scroll">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-[#00A884] flex items-center justify-center mx-auto">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold font-outfit text-slate-900 dark:text-white">Install SRF Parking App</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              To install this application on your smartphone:
            </p>

            <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-white/5 text-left text-xs space-y-2.5 sm:space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#00A884] text-white text-[10px] font-black flex items-center justify-center shrink-0">1</span>
                <span className="text-slate-700 dark:text-slate-300">Tap the <strong>Share</strong> button <Share2 className="w-3.5 h-3.5 inline text-[#00A884] mx-0.5" /> in Safari or Chrome.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#00A884] text-white text-[10px] font-black flex items-center justify-center shrink-0">2</span>
                <span className="text-slate-700 dark:text-slate-300">Scroll down and tap <strong>Add to Home Screen</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#00A884] text-white text-[10px] font-black flex items-center justify-center shrink-0">3</span>
                <span className="text-slate-700 dark:text-slate-300">Tap <strong>Add</strong> at top right to launch full-screen mobile app!</span>
              </div>
            </div>

            <button
              onClick={() => setIosModalOpen(false)}
              className="w-full py-2.5 sm:py-3 bg-[#00A884] hover:bg-[#008F6F] text-white font-bold rounded-xl text-xs transition shadow-sm"
            >
              Got It, Close
            </button>
          </div>
        </div>
      )}

      {/* FLOATING BACK TO TOP BUTTON */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="fixed bottom-5 right-5 z-40 p-3 rounded-full bg-[#00A884] hover:bg-[#008F6F] text-white shadow-xl transition transform hover:scale-110 active:scale-95 back-to-top-btn"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
