import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Layers,
  User,
  Briefcase,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, currentUser } = useAuth();
  const { success, error, info } = useToast();

  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const initialRole = searchParams.get('role') === 'recruiter' ? 'recruiter' : 'candidate';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [role, setRole] = useState(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form states
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    companyName: '',
    password: '',
    confirmPassword: '',
  });

  // If already logged in, redirect
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'recruiter') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/candidate/dashboard');
      }
    }
  }, [currentUser, navigate]);

  // Sync with URL query params
  useEffect(() => {
    if (searchParams.get('tab') === 'register') {
      setActiveTab('register');
    }
    if (searchParams.get('role')) {
      setRole(searchParams.get('role'));
    }
  }, [searchParams]);

  // Quick fill helper for demo accounts
  const quickFill = (email, pass, userRole) => {
    setRole(userRole);
    setActiveTab('login');
    setLoginForm({ email, password: pass });
    info(`Filled demo credentials for ${email}`);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      error('Please enter both email and password.');
      return;
    }

    try {
      const user = login(loginForm.email.trim(), loginForm.password);
      success(`Welcome back, ${user.name}!`);
      if (user.role === 'recruiter') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/candidate/dashboard');
      }
    } catch (err) {
      error(err.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const { name, email, companyName, password, confirmPassword } = registerForm;

    if (!name.trim()) {
      error('Full Name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      error('Please enter a valid email address.');
      return;
    }
    if (role === 'recruiter' && !companyName.trim()) {
      error('Company Name is required for recruiter registration.');
      return;
    }
    if (password.length < 6) {
      error('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      error('Password and Confirm Password do not match.');
      return;
    }

    try {
      const newUser = register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        companyName: role === 'recruiter' ? companyName.trim() : '',
        skills: role === 'candidate' ? ['Python', 'SQL'] : [],
      });

      success(`Account created successfully! Welcome, ${newUser.name}.`);
      if (newUser.role === 'recruiter') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/candidate/dashboard');
      }
    } catch (err) {
      error(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto w-full bg-white rounded-3xl shadow-elevated border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT COLUMN: BRANDING & HIGHLIGHTS */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle circle graphics */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <Link to="/" className="inline-flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center font-bold shadow-md">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">Mini ATS</span>
            </Link>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Empowering Smart Hiring & Resume Screening
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                Connect candidate qualifications directly to job criteria with mathematical transparency and automated candidate ranking.
              </p>
            </div>

            {/* Feature highlights list */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3 text-xs text-blue-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5" />
                <span>Deterministic skill matching percentage algorithm</span>
              </div>
              <div className="flex items-start space-x-3 text-xs text-blue-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5" />
                <span>Job-specific shortlisting eligibility thresholds</span>
              </div>
              <div className="flex items-start space-x-3 text-xs text-blue-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5" />
                <span>Transparent missing skills gap analysis</span>
              </div>
              <div className="flex items-start space-x-3 text-xs text-blue-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5" />
                <span>Mirrors standard 6-table relational schema</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Credentials Box */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/20">
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-2">
              1-Click Demo Accounts (Fast Access):
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => quickFill('rahul.sharma@example.com', 'password123', 'candidate')}
                className="text-left px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white transition flex items-center justify-between"
              >
                <span>👤 Rahul Sharma (Candidate)</span>
                <span className="text-[10px] text-blue-200 font-mono">password123</span>
              </button>
              <button
                type="button"
                onClick={() => quickFill('recruiter@technova.com', 'password123', 'recruiter')}
                className="text-left px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white transition flex items-center justify-between"
              >
                <span>🏢 Admin Recruiter (TechNova)</span>
                <span className="text-[10px] text-blue-200 font-mono">password123</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AUTH FORMS */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Tabs & Role Selector */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
              {/* Login vs Register Tabs */}
              <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${
                    activeTab === 'login'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${
                    activeTab === 'register'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Role Toggle */}
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    role === 'candidate'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Candidate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('recruiter')}
                  className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    role === 'recruiter'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Recruiter</span>
                </button>
              </div>
            </div>

            {/* LOGIN FORM */}
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Welcome to Mini ATS
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Sign in to your {role === 'recruiter' ? 'Recruiter' : 'Candidate'} account
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <span className="text-[11px] text-slate-400">Demo: password123</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="Enter password"
                      className="w-full text-sm pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Remember my session</span>
                  </label>
                  <span className="text-slate-400">Local prototype state</span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm shadow-blue-500/25 transition active:scale-98 flex items-center justify-center space-x-2"
                >
                  <span>Sign In as {role === 'recruiter' ? 'Recruiter' : 'Candidate'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Create New Account
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Registering as a <strong className="text-blue-600 capitalize">{role}</strong>
                  </p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      placeholder="candidate@example.com"
                      className="w-full text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* Company Name if recruiter */}
                {role === 'recruiter' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Company Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={registerForm.companyName}
                        onChange={(e) => setRegisterForm({ ...registerForm, companyName: e.target.value })}
                        placeholder="e.g. TechNova Solutions"
                        className="w-full text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        placeholder="Min 6 characters"
                        className="w-full text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        placeholder="Confirm password"
                        className="w-full text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide passwords' : 'Show passwords'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition active:scale-98 mt-2"
                >
                  Create Account
                </button>
              </form>
            )}
          </div>

          {/* Prototype Security Disclaimer */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-start space-x-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Academic Demonstration Notice:</strong> This authentication workflow is a client-side prototype utilizing LocalStorage. In Phase 2, secure JWT tokens and bcrypt password hashing via Python Flask will be implemented.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

