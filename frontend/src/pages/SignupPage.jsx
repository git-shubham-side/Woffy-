import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const SignupPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the Terms of Service to create an account.');
      return;
    }

    setSubmitting(true);
    const res = await signup(fullName, email, password);
    setSubmitting(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Subtle Ambient Background Gradients (matching Landing Page) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-sky-100/35 via-blue-50/15 to-transparent blur-3xl" />
        <div className="absolute bottom-0 -right-32 w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-emerald-100/25 via-teal-50/15 to-transparent blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full space-y-6 bg-white p-7 sm:p-9 rounded-2xl sm:rounded-3xl shadow-lg shadow-slate-100/80 border border-slate-200/80"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div>
            <Link to="/" className="inline-block text-2xl font-medium tracking-tight text-slate-900 group font-sans">
              Woofy<span className="text-blue-600">.</span>
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-slate-900">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-light leading-relaxed">
            Free Smart QR collar tag, vaccine passport, and digital records.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-center gap-2.5 font-light">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-normal transition-all shadow-2xs hover:border-slate-300"
        >
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
          <span>Sign up with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-100 w-full" />
          <span className="bg-white px-3 text-[11px] font-mono text-slate-400 font-normal uppercase tracking-wider">
            or with email
          </span>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-normal text-slate-600 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4 stroke-[1.75]" />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Shubham Rathod"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200/90 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 font-light transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-normal text-slate-600 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4 stroke-[1.75]" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="petparent@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200/90 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 font-light transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-normal text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 stroke-[1.75]" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200/90 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 font-light transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-normal text-slate-600 mb-1.5">
                Confirm
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <ShieldCheck className="w-4 h-4 stroke-[1.75]" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200/90 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 font-light transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-200 border-slate-300 accent-blue-600 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-slate-500 font-light cursor-pointer select-none">
              I agree to Woffy's{' '}
              <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-normal hover:underline">
                Terms and Conditions
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm shadow-xs transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0"
          >
            {submitting ? 'Creating account...' : 'Create Free Account'}
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </form>

        {/* Footer Link & Security Tag */}
        <div className="space-y-3 pt-1 text-center">
          <p className="text-xs sm:text-sm text-slate-400 font-light">
            Already registered?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
              Sign in here
            </Link>
          </p>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-light pt-1 border-t border-slate-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Protected with zero-knowledge AES-256 encryption</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
