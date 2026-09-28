import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  PlusCircle,
  Syringe,
  Activity,
  AlertTriangle,
  QrCode,
  ArrowRight,
  PhoneCall,
  ShoppingBag,
  Heart,
  Dog,
  Calendar,
  CheckCircle2,
  Stethoscope,
  Search,
  Copy,
  Check,
  ChevronRight,
  Clock,
  Printer,
  FileText,
  AlertCircle,
  Sparkles,
  Layers,
} from 'lucide-react';
import api from '../services/api';

// Cute Cartoon Avatar Fallback Component (when user hasn't uploaded a photo or image fails)
const CartoonPetAvatar = ({ className = 'w-12 h-12' }) => (
  <div
    className={`flex items-center justify-center bg-gradient-to-tr from-sky-100 via-blue-50 to-indigo-100 rounded-xl border-2 border-blue-200 overflow-hidden shrink-0 ${className}`}
  >
    <svg
      viewBox="0 0 100 100"
      className="w-4/5 h-4/5 text-blue-500 fill-current drop-shadow-2xs"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cartoon Pet Head */}
      <circle cx="50" cy="50" r="36" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2.5" />
      {/* Ears */}
      <path d="M22 28 C 14 36, 12 55, 24 58 C 28 50, 28 36, 22 28 Z" fill="#93c5fd" />
      <path d="M78 28 C 86 36, 88 55, 76 58 C 72 50, 72 36, 78 28 Z" fill="#93c5fd" />
      {/* Big Cute Eyes */}
      <circle cx="39" cy="46" r="4.5" fill="#0f172a" />
      <circle cx="40.5" cy="44.5" r="1.5" fill="#ffffff" />
      <circle cx="61" cy="46" r="4.5" fill="#0f172a" />
      <circle cx="62.5" cy="44.5" r="1.5" fill="#ffffff" />
      {/* Cheeks */}
      <circle cx="31" cy="54" r="3.5" fill="#fca5a5" opacity="0.65" />
      <circle cx="69" cy="54" r="3.5" fill="#fca5a5" opacity="0.65" />
      {/* Snout & Nose */}
      <ellipse cx="50" cy="56" rx="9" ry="6.5" fill="#ffffff" />
      <ellipse cx="50" cy="52" rx="4" ry="2.5" fill="#0284c7" />
      {/* Smile */}
      <path
        d="M46 56 Q50 60 54 56"
        fill="none"
        stroke="#0369a1"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

// Pet Photo with Cartoon Fallback Wrapper
const PetPhotoDisplay = ({ pet, className = 'w-12 h-12' }) => {
  const [hasError, setHasError] = useState(false);

  // Determine photo path uploaded by user
  const photoSrc = (() => {
    if (pet.photo && pet.photo.trim() !== '') {
      if (
        pet.photo.startsWith('http://') ||
        pet.photo.startsWith('https://') ||
        pet.photo.startsWith('data:') ||
        pet.photo.startsWith('/')
      ) {
        return pet.photo;
      }
      return `/${pet.photo}`;
    }
    if (pet.photoUrl && pet.photoUrl.trim() !== '') {
      return pet.photoUrl;
    }
    return null;
  })();

  if (!photoSrc || hasError) {
    return <CartoonPetAvatar className={className} />;
  }

  return (
    <img
      src={photoSrc}
      alt={pet.petName || 'Pet'}
      onError={() => setHasError(true)}
      className={`rounded-xl object-cover border-2 border-slate-200 shadow-2xs shrink-0 ${className}`}
    />
  );
};

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'safe', 'lost'
  const [searchQuery, setSearchQuery] = useState('');

  const [data, setData] = useState({
    pets: [],
    products: [],
    vaccineAlerts: { dueSoon: [], overdue: [], totalDueCount: 0 },
    userProductRequests: [],
  });

  useEffect(() => {
    localStorage.removeItem('woffy_dashboard_theme');
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/api/dashboard');
        if (res.data && res.data.success) {
          setData({
            pets: res.data.pets || [],
            products: res.data.products || [],
            vaccineAlerts: res.data.vaccineAlerts || { dueSoon: [], overdue: [], totalDueCount: 0 },
            userProductRequests: res.data.userProductRequests || [],
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dynamic Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning' };
    if (hour < 17) return { text: 'Good afternoon' };
    return { text: 'Good evening' };
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center">
        <div className="w-9 h-9 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-700 font-medium text-xs tracking-wide">
          Syncing health records and collar tags...
        </p>
      </div>
    );
  }

  const { pets, products, vaccineAlerts } = data;
  const greeting = getGreeting();
  const lostPets = pets.filter((p) => p.isLost);
  const safePets = pets.filter((p) => !p.isLost);
  const activeTagsCount = pets.filter((p) => p.collarId).length;
  const hasVaccineAlerts = vaccineAlerts.totalDueCount > 0;

  // Calculate WSAVA Protection Index
  const totalDues = vaccineAlerts.totalDueCount;
  const protectionIndex =
    pets.length === 0 ? 100 : Math.max(20, Math.round(100 - (totalDues / (pets.length * 4)) * 100));

  // Filtered pet list
  const filteredPets = pets
    .filter((pet) => {
      if (filterMode === 'safe') return !pet.isLost;
      if (filterMode === 'lost') return pet.isLost;
      return true;
    })
    .filter((pet) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        pet.petName?.toLowerCase().includes(q) ||
        pet.breed?.toLowerCase().includes(q) ||
        pet.collarId?.toLowerCase().includes(q)
      );
    });

  const cardBase = "bg-white border-2 border-slate-200 text-slate-800 hover:border-blue-400 shadow-xs transition-all duration-200";

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-700 selection:bg-blue-100 selection:text-blue-900 relative overflow-x-hidden font-sans py-8">
      {/* Ambient Radial Background Gradients (matching Landing Page) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-sky-100/35 via-blue-50/15 to-transparent blur-3xl" />
        <div className="absolute top-[30%] -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-emerald-100/25 via-teal-50/15 to-transparent blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
        {/* ========================================================================= */}
        {/* 1. TOP CONSOLE HEADER WITH TOTAL PROFILES BADGE                           */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className={`rounded-2xl sm:rounded-3xl p-6 sm:p-7 relative overflow-hidden ${cardBase}`}
        >
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <div className="space-y-2 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                {/* Greeting Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border-2 bg-blue-50 border-blue-200 text-blue-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  <span>
                    {greeting.text}, {user?.fullName || 'Pet Parent'}
                  </span>
                  <span className="text-blue-300">•</span>
                  <span className="text-slate-600">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Total Pet Profiles Pill Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border-2 bg-emerald-50 border-emerald-300 text-emerald-800">
                  <Dog className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    <strong>{pets.length}</strong> {pets.length === 1 ? 'Pet Profile' : 'Pet Profiles'} Registered
                  </span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900">
                Pet Health &amp;{' '}
                <span className="font-semibold text-blue-600">Safety Console</span>
              </h1>

              <p className="text-xs sm:text-sm leading-relaxed font-normal text-slate-600">
                Managing <strong className="font-semibold text-slate-900">{pets.length}</strong> registered{' '}
                {pets.length === 1 ? 'pet profile' : 'pet profiles'}. Real-time QR tag telemetry,
                WSAVA immunization tracking, and veterinary logs.
              </p>
            </div>

            {/* Action Buttons (NO Toggle Button) */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                to="/create-pet-profile"
                className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-all duration-200 hover:-translate-y-0.5"
              >
                <PlusCircle className="w-3.5 h-3.5 text-white" /> Add New Pet
              </Link>

              <Link
                to="/vaccinations"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs border-2 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 bg-white hover:bg-slate-50 text-slate-800 border-slate-300"
              >
                <Syringe className="w-3.5 h-3.5 text-blue-500" /> Vaccine Hub
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 2. REFINED METRIC CARDS (BOLD BORDERS, SOLID CRISP BACKGROUNDS)            */}
        {/* ========================================================================= */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Metric 1: Total Pet Profiles */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="h-full"
          >
            <Link
              to="/pet-profiles"
              className={`p-5 rounded-2xl relative overflow-hidden transition-all duration-200 block cursor-pointer group h-full flex flex-col justify-between ${cardBase}`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 group-hover:text-blue-600 transition-colors">
                    Pet Profiles
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-blue-200/80 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Dog className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
                    {pets.length}
                  </span>
                  <span className="text-xs font-medium text-slate-600">
                    {pets.length === 1 ? 'Profile' : 'Profiles'} Active
                  </span>
                </div>

                <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs font-normal">
                  <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {safePets.length} Safe at Home
                  </span>
                  {lostPets.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {lostPets.length} Lost
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Metric 2: WSAVA Protection */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="h-full"
          >
            <Link
              to="/vaccinations"
              className={`p-5 rounded-2xl relative overflow-hidden transition-all duration-200 block cursor-pointer group h-full flex flex-col justify-between ${cardBase}`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 group-hover:text-blue-600 transition-colors">
                    WSAVA Coverage
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border-2 border-emerald-200/80 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Syringe className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
                    {protectionIndex}%
                  </span>
                  <span className="text-xs font-medium text-slate-600">Protected</span>
                </div>

                <div className="mt-2.5 pt-2.5 border-t border-slate-200">
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        totalDues === 0 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${protectionIndex}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs font-medium text-slate-700">
                    <span>{totalDues === 0 ? 'All doses up-to-date' : `${totalDues} Due Soon`}</span>
                    <span className="text-blue-600 group-hover:underline font-semibold">
                      Schedule
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Metric 3: Active Collar Tags */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="h-full"
          >
            <Link
              to="/pet-profiles"
              className={`p-5 rounded-2xl relative overflow-hidden transition-all duration-200 block cursor-pointer group h-full flex flex-col justify-between ${cardBase}`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 group-hover:text-blue-600 transition-colors">
                    Collar QR Tags
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-blue-200/80 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <QrCode className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
                    {activeTagsCount}
                  </span>
                  <span className="text-xs font-medium text-slate-600">
                    /{pets.length} Active
                  </span>
                </div>

                <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs font-medium text-slate-700">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Scan Ready
                  </span>
                  <span className="text-blue-600 group-hover:underline font-semibold">
                    Print Sheet
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Metric 4: Clinical Health Journal */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="h-full"
          >
            <Link
              to="/records"
              className={`p-5 rounded-2xl relative overflow-hidden transition-all duration-200 block cursor-pointer group h-full flex flex-col justify-between ${cardBase}`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 group-hover:text-blue-600 transition-colors">
                    Clinical Journal
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-blue-200/80 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
                    Active
                  </span>
                  <span className="text-xs font-medium text-slate-600">Cloud Sync</span>
                </div>

                <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs font-medium text-slate-700">
                  <span>Weight &amp; Rx Logs</span>
                  <span className="text-blue-600 group-hover:underline font-semibold">
                    Add Record
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 3. CONDITIONAL CRITICAL NOTICES                                           */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {lostPets.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs sm:text-sm text-rose-900">
                    Notice: {lostPets.map((p) => p.petName).join(', ')} marked as missing.
                  </h3>
                  <p className="text-xs text-rose-800 mt-0.5 font-normal">
                    Public collar QR tags are broadcasting emergency finder telephone and WhatsApp GPS beacon.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/pet/tag/${lostPets[0]?.collarId || lostPets[0]?._id}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-lg bg-white text-rose-700 font-semibold text-xs border-2 border-rose-200 hover:bg-rose-50 transition-colors"
                >
                  Tag View
                </Link>
                <Link
                  to="/services/rescue"
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  Helplines
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {hasVaccineAlerts && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                  <Syringe className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold text-[10px] uppercase tracking-wider">
                      Immunization
                    </span>
                    <h3 className="font-semibold text-xs sm:text-sm text-slate-900">
                      {vaccineAlerts.totalDueCount} Vaccine Dose
                      {vaccineAlerts.totalDueCount === 1 ? '' : 's'} Due Soon or Overdue
                    </h3>
                  </div>
                  <p className="text-xs text-slate-700 mt-0.5 font-normal">
                    Recommended protection against core protocols requires clinical attention.
                  </p>
                </div>
              </div>

              <Link
                to="/vaccinations"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shrink-0 shadow-xs"
              >
                <Syringe className="w-3.5 h-3.5" /> View Vaccine Schedule
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* 4. PLATFORM CAPABILITIES (SOLID CARDS, BOLD BORDERS, CRISP TEXT)           */}
        {/* ========================================================================= */}
        <div className="space-y-3.5 pt-1">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider bg-blue-100/80 px-2.5 py-0.5 rounded-full border border-blue-200">
                System Modules
              </span>
              <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 mt-1.5">
                Integrated Healthcare Capabilities
              </h2>
            </div>
            <span className="text-xs text-slate-600 font-medium hidden sm:inline">
              6 Specialized Engines
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Module 1: Collar Tag & Lost Pet Mode */}
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="h-full"
            >
              <Link
                to="/pet-profiles"
                className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-200 group flex flex-col justify-between h-full cursor-pointer ${cardBase}`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-blue-200/80 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <QrCode className="w-4.5 h-4.5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                      Smart Collar
                    </span>
                  </div>
                  <h3 className="font-semibold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                    Collar Tag &amp; Lost Mode
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    Printable QR tag with 1-click owner calls and WhatsApp location pin.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">No app required</span>
                  <span className="font-semibold text-blue-600 group-hover:underline inline-flex items-center gap-1">
                    Manage Tags <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Module 2: Automated Vaccine Protocol */}
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="h-full"
            >
              <Link
                to="/vaccinations"
                className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-200 group flex flex-col justify-between h-full cursor-pointer ${cardBase}`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border-2 border-emerald-200/80 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Syringe className="w-4.5 h-4.5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                      WSAVA Protocol
                    </span>
                  </div>
                  <h3 className="font-semibold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Automated Vaccine Protocol
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    Auto-calculated core puppy and canine boosters with certified digital passport.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Auto-reminders</span>
                  <span className="font-semibold text-blue-600 group-hover:underline inline-flex items-center gap-1">
                    Vaccine Hub <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Module 3: Weight & Health Journal */}
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="h-full"
            >
              <Link
                to="/records"
                className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-200 group flex flex-col justify-between h-full cursor-pointer ${cardBase}`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-blue-200/80 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Activity className="w-4.5 h-4.5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                      Health Journal
                    </span>
                  </div>
                  <h3 className="font-semibold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                    Weight &amp; Health Journal
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    Track weight growth, vet consultation notes, and doctor prescription slips.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Cloud sync</span>
                  <span className="font-semibold text-blue-600 group-hover:underline inline-flex items-center gap-1">
                    Health Journal <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Module 4: Rescue Helplines Directory */}
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="h-full"
            >
              <Link
                to="/services/rescue"
                className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-200 group flex flex-col justify-between h-full cursor-pointer ${cardBase}`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border-2 border-emerald-200/80 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <PhoneCall className="w-4.5 h-4.5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                      Rescue Network
                    </span>
                  </div>
                  <h3 className="font-semibold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Rescue Helplines Directory
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    Direct contacts for verified animal rescue NGOs, ambulances, and shelters.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Verified network</span>
                  <span className="font-semibold text-blue-600 group-hover:underline inline-flex items-center gap-1">
                    Directory <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Module 5: Veterinary Hospitals */}
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="h-full"
            >
              <Link
                to="/services/rescue"
                className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-200 group flex flex-col justify-between h-full cursor-pointer ${cardBase}`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-blue-200/80 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Stethoscope className="w-4.5 h-4.5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                      Vet Clinics
                    </span>
                  </div>
                  <h3 className="font-semibold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                    Veterinary Hospitals
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    Locate accredited animal clinics, 24/7 emergency care, and licensed vets.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Nearby search</span>
                  <span className="font-semibold text-blue-600 group-hover:underline inline-flex items-center gap-1">
                    Find Vets <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Module 6: Care Essentials Marketplace */}
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="h-full"
            >
              <Link
                to="/shop"
                className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-200 group flex flex-col justify-between h-full cursor-pointer ${cardBase}`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border-2 border-purple-200/80 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <ShoppingBag className="w-4.5 h-4.5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200">
                      Pet Store
                    </span>
                  </div>
                  <h3 className="font-semibold text-base text-slate-900 group-hover:text-purple-600 transition-colors">
                    Care Essentials Marketplace
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    Curated nutritional meals, chew toys, grooming care, and supplements.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Tested quality</span>
                  <span className="font-semibold text-blue-600 group-hover:underline inline-flex items-center gap-1">
                    Browse Shop <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. REGISTERED COMPANIONS (WITH USER PHOTO OR CUTE CARTOON AVATAR)          */}
        {/* ========================================================================= */}
        <div className="space-y-3.5 pt-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900">
                  Registered Companions
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                  {pets.length} {pets.length === 1 ? 'Profile' : 'Profiles'}
                </span>
              </div>
              <p className="text-xs font-normal mt-0.5 text-slate-600">
                Manage your pets' uploaded photos, collar QR tags, and medical passports
              </p>
            </div>

            {pets.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search companion..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl border-2 text-xs focus:outline-hidden focus:border-blue-500 w-44 sm:w-52 font-normal bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex p-0.5 rounded-xl border-2 text-xs font-medium bg-slate-100 border-slate-300 text-slate-700">
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      filterMode === 'all'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    All ({pets.length})
                  </button>
                  <button
                    onClick={() => setFilterMode('safe')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      filterMode === 'safe'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    Safe ({safePets.length})
                  </button>
                  {lostPets.length > 0 && (
                    <button
                      onClick={() => setFilterMode('lost')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        filterMode === 'lost'
                          ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                          : 'text-rose-600 font-medium'
                      }`}
                    >
                      Lost ({lostPets.length})
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {pets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-9 rounded-2xl sm:rounded-3xl text-center space-y-3.5 shadow-xs ${cardBase}`}
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center border-2 border-blue-200">
                <Dog className="w-7 h-7 stroke-[1.75]" />
              </div>

              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-semibold text-slate-900">
                  No Pet Profiles Created Yet
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed font-normal">
                  Upload your dog's photo, register their profile, and receive an instant free QR collar tag
                  with WSAVA vaccination tracking.
                </p>
              </div>

              <div className="pt-1">
                <Link
                  to="/create-pet-profile"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all hover:-translate-y-0.5"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-white" /> Create First Pet Profile
                </Link>
              </div>
            </motion.div>
          ) : filteredPets.length === 0 ? (
            <div
              className={`p-8 rounded-xl border-2 text-center text-slate-600 text-xs font-normal ${cardBase}`}
            >
              No companion matches "{searchQuery}".
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredPets.map((pet) => (
                <motion.div
                  key={pet._id}
                  variants={fadeInUp}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className={`rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between space-y-4 ${cardBase} ${
                    pet.isLost ? 'border-rose-500' : ''
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to={`/pet-profile/${pet._id}`}
                        className="flex items-center gap-3 group/pet hover:opacity-90 transition-opacity"
                      >
                        {/* User Uploaded Photo OR Cute Cartoon Fallback */}
                        <PetPhotoDisplay pet={pet} className="w-12 h-12" />

                        <div>
                          <h3 className="font-semibold text-base text-slate-900 group-hover/pet:text-blue-600 transition-colors">
                            {pet.petName}
                          </h3>
                          <p className="text-xs text-slate-600 font-normal">
                            {pet.breed || 'Companion'} • {pet.age ? `${pet.age} yrs` : 'Age N/A'}
                          </p>
                        </div>
                      </Link>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          pet.isLost
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {pet.isLost ? 'Lost Alert' : 'Safe at Home'}
                      </span>
                    </div>

                    {/* QR Collar Tag Info */}
                    <div className="p-2.5 rounded-xl border-2 flex items-center justify-between text-xs bg-slate-50 border-slate-200 text-slate-800">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="font-mono text-xs font-semibold">
                          {pet.collarId || 'WF-TAG'}
                        </span>
                        <button
                          onClick={() => copyToClipboard(pet.collarId)}
                          className="text-slate-400 hover:text-blue-500 p-0.5 transition-colors"
                          title="Copy Tag ID"
                        >
                          {copiedId === pet.collarId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <Link
                        to={`/pet-profile/${pet._id}/print-tag`}
                        className="font-semibold text-blue-600 hover:underline text-xs"
                      >
                        Print Sheet
                      </Link>
                    </div>
                  </div>

                  {/* Quick Pet Navigation Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                    <Link
                      to={`/pet-profile/${pet._id}`}
                      className="py-2 px-2 text-center rounded-lg font-medium text-xs transition-colors border-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border-slate-200"
                    >
                      Profile
                    </Link>
                    <Link
                      to={`/vaccinations/${pet._id}`}
                      className="py-2 px-2 text-center rounded-lg font-medium text-xs transition-colors border-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border-slate-200"
                    >
                      Vaccines
                    </Link>
                    <Link
                      to={`/track/${pet._id}`}
                      className="py-2 px-2 text-center rounded-lg font-medium text-xs transition-colors border-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border-slate-200"
                    >
                      Care Log
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 6. CURATED STORE PREVIEW                                                  */}
        {/* ========================================================================= */}
        {products && products.length > 0 && (
          <div className="space-y-3.5 pt-4 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider bg-blue-100/80 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Marketplace
                </span>
                <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 mt-1">
                  Featured Care Essentials
                </h2>
              </div>
              <Link
                to="/shop"
                className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {products.slice(0, 6).map((prod) => (
                <motion.div
                  key={prod._id}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="h-full"
                >
                  <Link
                    to="/shop"
                    className={`rounded-xl p-3 transition-all flex flex-col justify-between h-full group cursor-pointer ${cardBase}`}
                  >
                    <div>
                      <div className="relative overflow-hidden rounded-lg mb-2 bg-slate-100 border border-slate-200">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-1 left-1 text-[10px] font-semibold text-slate-800 uppercase bg-white/95 px-1.5 py-0.5 rounded shadow-2xs border border-slate-200">
                          {prod.category}
                        </span>
                      </div>
                      <h4 className="font-medium text-xs text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {prod.name}
                      </h4>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">
                        ₹{prod.price}
                      </p>
                    </div>

                    <span
                      className="mt-2.5 text-center py-1.5 rounded-lg font-medium text-xs transition-all border-2 bg-slate-50 group-hover:bg-blue-600 group-hover:text-white text-slate-700 border-slate-200 block"
                    >
                      View Item
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
