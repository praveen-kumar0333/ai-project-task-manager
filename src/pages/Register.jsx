import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, ArrowLeft, Sparkles, ShieldCheck, Database, Zap } from 'lucide-react';
import { registerUser } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register({ onAuthSuccess, onNavigateToLogin }) {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = 'Full name is required';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim()
      });

      if (response && response.success && response.data) {
        const { user, token } = response.data;
        // Centralized login updates context and persists session
        login(user, token);

        if (onAuthSuccess) {
          onAuthSuccess(user, token);
        }
      } else {
        setErrorMessage(response?.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to complete registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 relative overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans text-slate-100">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl text-white font-extrabold text-2xl shadow-xl shadow-indigo-500/30 mb-3 border border-indigo-400/30">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">AI Project Manager</h1>
          <p className="text-xs font-semibold text-indigo-300/80 mt-1 uppercase tracking-wider">Enterprise Task & Milestone Suite</p>
        </div>

        {/* Register Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800/90 shadow-2xl p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-white">Create your workspace account</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Join to organize milestones and generate AI task breakdowns with Gemini
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/50 border border-rose-800/70 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold uppercase tracking-wider text-rose-300 text-[11px]">Registration Error</p>
                <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="reg-name" className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="reg-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: null }));
                  }}
                  placeholder="Alex Mercer"
                  autoComplete="name"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-950/60 rounded-xl border text-white placeholder-slate-500 transition-all outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                    fieldErrors.name
                      ? 'border-rose-500/80 focus:border-rose-500'
                      : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-xs text-rose-400 mt-1 font-medium">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="reg-email" className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: null }));
                  }}
                  placeholder="developer@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-950/60 rounded-xl border text-white placeholder-slate-500 transition-all outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                    fieldErrors.email
                      ? 'border-rose-500/80 focus:border-rose-500'
                      : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-rose-400 mt-1 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="reg-password" className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: null }));
                  }}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-950/60 rounded-xl border text-white placeholder-slate-500 transition-all outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                    fieldErrors.password
                      ? 'border-rose-500/80 focus:border-rose-500'
                      : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-rose-400 mt-1 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="reg-confirm-password" className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: null }));
                  }}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-950/60 rounded-xl border text-white placeholder-slate-500 transition-all outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                    fieldErrors.confirmPassword
                      ? 'border-rose-500/80 focus:border-rose-500'
                      : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-rose-400 mt-1 font-medium">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registering Workspace...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Workspace Account</span>
                </>
              )}
            </button>
          </form>

          {/* Security Badges */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-semibold text-slate-400">bcrypt Hashing</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Database className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-semibold text-slate-400">MySQL Storage</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-semibold text-slate-400">AI Accelerated</span>
            </div>
          </div>

          {/* Switch to Login */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
            <p className="text-xs sm:text-sm text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

