import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Sun,
  Moon,
  CloudSun,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';

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

  // Dynamic Time Greeting without emojis
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', timeIcon: 'sun' };
    if (hour < 17) return { text: 'Good afternoon', timeIcon: 'cloud-sun' };
    return { text: 'Good evening', timeIcon: 'moon' };
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-slate-200 border-t-sky-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium text-xs tracking-wide">
          Syncing pet health records and collar tags...
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 antialiased text-slate-800">
      {/* ========================================================================= */}
      {/* 1. TOP SAAS HEADER (SLEEK, LESS BOLD, LUXURIOUS LIGHT PALETTE)             */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-white border border-slate-200/70 p-6 sm:p-8 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-slate-600 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
              <span>
                {greeting.text}, {user?.fullName || 'Pet Parent'}
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-400">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
              Pet Health & Safety Console
            </h1>

            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-normal">
              Active management overview for registered companions. Real-time collar QR status,
              WSAVA vaccination schedule monitoring, and veterinary log tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to="/create-pet-profile"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition-all duration-200"
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-400" /> Register Companion
            </Link>

            <Link
              to="/vaccinations"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-200 shadow-2xs transition-all duration-200"
            >
              <Syringe className="w-3.5 h-3.5 text-sky-600" /> Vaccine Hub
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REFINED SAAS METRIC CARDS (4 CLEAN WIDGETS)                            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Companions
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Dog className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-900 tracking-tight">
              {pets.length}
            </span>
            <span className="text-xs text-slate-400 font-normal">
              {pets.length === 1 ? 'Registered' : 'Registered'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-normal">
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {safePets.length} Safe
            </span>
            {lostPets.length > 0 && (
              <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {lostPets.length} SOS Active
              </span>
            )}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              WSAVA Protection
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Syringe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-900 tracking-tight">
              {protectionIndex}%
            </span>
            <span className="text-xs text-slate-400 font-normal">Coverage</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  totalDues === 0 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${protectionIndex}%` }}
              ></div>
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] font-normal text-slate-500">
              <span>{totalDues === 0 ? 'Fully Protected' : `${totalDues} Due / Overdue`}</span>
              <Link to="/vaccinations" className="text-sky-700 hover:underline font-medium">
                Schedule
              </Link>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Collar QR Tags
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-900 tracking-tight">
              {activeTagsCount}
            </span>
            <span className="text-xs text-slate-400 font-normal">Active Tags</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-normal text-slate-600">
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Scan Ready
            </span>
            <Link to="/pet-profiles" className="text-sky-700 hover:underline font-medium">
              Print Sheet
            </Link>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Clinical Journal
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-900 tracking-tight">
              Active
            </span>
            <span className="text-xs text-slate-400 font-normal">Medical Logs</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-normal text-slate-600">
            <span className="text-slate-400">Weight & Rx Slips</span>
            <Link to="/records" className="text-sky-700 hover:underline font-medium">
              Add Record
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CONDITIONAL CRITICAL NOTICES                                           */}
      {/* ========================================================================= */}
      {lostPets.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 text-red-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-red-900">
                Notice: {lostPets.map((p) => p.petName).join(', ')} marked as missing.
              </h3>
              <p className="text-xs text-red-700 mt-0.5 font-normal">
                Public collar QR pages are broadcasting the emergency finder console with phone dialer
                and WhatsApp location transmission.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/pet/tag/${lostPets[0]?.collarId || lostPets[0]?._id}`}
              target="_blank"
              className="px-3 py-1.5 rounded-lg bg-white text-red-700 font-medium text-xs border border-red-200 hover:bg-red-50 transition-colors"
            >
              Public Tag Preview
            </Link>
            <Link
              to="/services/rescue"
              className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-medium text-xs transition-colors"
            >
              Helplines
            </Link>
          </div>
        </div>
      )}

      {hasVaccineAlerts && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
              <Syringe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-medium text-[10px] uppercase tracking-wider">
                  Immunization Notice
                </span>
                <h3 className="font-semibold text-xs sm:text-sm text-slate-900">
                  {vaccineAlerts.totalDueCount} Vaccine Dose
                  {vaccineAlerts.totalDueCount === 1 ? '' : 's'} Due Soon or Overdue
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-normal">
                Recommended protection against Parvo, Distemper, and Rabies requires attention.
              </p>
            </div>
          </div>

          <Link
            to="/vaccinations"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition-colors shrink-0"
          >
            <Syringe className="w-3.5 h-3.5" /> View Vaccine Schedule
          </Link>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PLATFORM CAPABILITIES & SUPERPOWERS SHOWCASE                           */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider">
              System Modules
            </span>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
              Integrated Healthcare Capabilities
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-normal hidden sm:inline">
            6 Specialized Engines
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200/70 hover:border-sky-300 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] transition-all duration-200 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
                  <QrCode className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[10px] font-medium border border-sky-100">
                  Instant SOS
                </span>
              </div>
              <h3 className="font-semibold text-sm text-slate-900">
                Collar Tag & Lost Pet Mode
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Permanent QR identification with printable tag sheets. Anyone who scans can contact the
                owner or share live GPS coordinates instantly.
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-normal">Camera scan</span>
              <Link to="/pet-profiles" className="font-medium text-sky-700 hover:text-sky-800 inline-flex items-center gap-1">
                Manage Tags <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200/70 hover:border-sky-300 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] transition-all duration-200 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                  <Syringe className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-100">
                  WSAVA Standard
                </span>
              </div>
              <h3 className="font-semibold text-sm text-slate-900">
                Automated Vaccine Protocol
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Auto-generates Canine (Puppy DP, 9-in-1, Rabies) and Feline schedules with exportable
                digital passport certificates.
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-normal">Auto-alerts</span>
              <Link to="/vaccinations" className="font-medium text-sky-700 hover:text-sky-800 inline-flex items-center gap-1">
                Vaccine Hub <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200/70 hover:border-sky-300 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] transition-all duration-200 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-medium border border-indigo-100">
                  Clinical Log
                </span>
              </div>
              <h3 className="font-semibold text-sm text-slate-900">
                Weight & Health Journal
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Track weight milestones, vet appointments, and prescription slip attachments in an organized
                timeline.
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-normal">Photo upload</span>
              <Link to="/records" className="font-medium text-sky-700 hover:text-sky-800 inline-flex items-center gap-1">
                Health Journal <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200/70 hover:border-sky-300 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] transition-all duration-200 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 text-[10px] font-medium border border-cyan-100">
                  24/7 Helpline
                </span>
              </div>
              <h3 className="font-semibold text-sm text-slate-900">
                Rescue Helplines Directory
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Direct contacts for verified animal ambulances, NGO rescue trusts, and wildlife centers
                across major cities.
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-normal">Verified contacts</span>
              <Link to="/services/rescue" className="font-medium text-sky-700 hover:text-sky-800 inline-flex items-center gap-1">
                Directory <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 5 */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200/70 hover:border-sky-300 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] transition-all duration-200 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[10px] font-medium border border-teal-100">
                  Clinics
                </span>
              </div>
              <h3 className="font-semibold text-sm text-slate-900">
                Veterinary Hospitals
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Search accredited animal healthcare centers, trauma clinics, and licensed veterinary
                practitioners.
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-normal">Accredited network</span>
              <Link to="/services/rescue" className="font-medium text-sky-700 hover:text-sky-800 inline-flex items-center gap-1">
                Find Vets <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 6 */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200/70 hover:border-sky-300 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] transition-all duration-200 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                  Curated
                </span>
              </div>
              <h3 className="font-semibold text-sm text-slate-900">
                Care Essentials Marketplace
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Curated nutritional meals, dental chews, orthopedic bedding, and sensitive grooming
                supplies.
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-normal">Verified items</span>
              <Link to="/shop" className="font-medium text-sky-700 hover:text-sky-800 inline-flex items-center gap-1">
                Browse Shop <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. COMPANIONS SWITCHBOARD                                                 */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
              Registered Companions
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              Manage digital records, collar QR codes, and profiles
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
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-hidden focus:border-sky-400 w-44 sm:w-52"
                />
              </div>

              <div className="flex p-0.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-600">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    filterMode === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : ''
                  }`}
                >
                  All ({pets.length})
                </button>
                <button
                  onClick={() => setFilterMode('safe')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    filterMode === 'safe' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : ''
                  }`}
                >
                  Safe ({safePets.length})
                </button>
                {lostPets.length > 0 && (
                  <button
                    onClick={() => setFilterMode('lost')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      filterMode === 'lost'
                        ? 'bg-red-600 text-white shadow-2xs font-semibold'
                        : 'text-red-700'
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
          <div className="p-10 rounded-2xl bg-white border border-slate-200/80 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-700 mx-auto flex items-center justify-center border border-sky-100">
              <Dog className="w-7 h-7" />
            </div>

            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base font-semibold text-slate-900">
                No companions registered yet
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed font-normal">
                Register your dog or cat to activate an instant cloud QR collar tag, automated
                WSAVA vaccination schedules, and lost pet emergency mode.
              </p>
            </div>

            <div className="pt-1">
              <Link
                to="/create-pet-profile"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5 text-sky-400" /> Register First Companion
              </Link>
            </div>
          </div>
        ) : filteredPets.length === 0 ? (
          <div className="p-8 rounded-xl bg-white border border-slate-200 text-center text-slate-400 text-xs">
            No companion matches "{searchQuery}".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPets.map((pet) => (
              <div
                key={pet._id}
                className={`bg-white rounded-2xl p-5 border transition-all duration-200 hover:border-slate-300 flex flex-col justify-between space-y-4 ${
                  pet.isLost ? 'border-red-200 shadow-sm' : 'border-slate-200/70 shadow-xs'
                }`}
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={pet.photo || pet.photoUrl || '/uploads/pets/default-pet.png'}
                        alt={pet.petName}
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80';
                        }}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <h3 className="font-semibold text-sm text-slate-900">{pet.petName}</h3>
                        <p className="text-xs text-slate-400 font-normal">
                          {pet.breed || 'Companion'} • {pet.age ? `${pet.age} yrs` : 'Age N/A'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                        pet.isLost
                          ? 'bg-red-100 text-red-800'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      }`}
                    >
                      {pet.isLost ? 'Lost Alert' : 'Safe'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono text-xs text-slate-700 font-medium">
                        {pet.collarId || 'WF-TAG'}
                      </span>
                      <button
                        onClick={() => copyToClipboard(pet.collarId)}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                        title="Copy Tag ID"
                      >
                        {copiedId === pet.collarId ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <Link
                      to={`/pet-profile/${pet._id}/print-tag`}
                      className="font-medium text-sky-700 hover:text-sky-800 text-[11px]"
                    >
                      Print Sheet
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                  <Link
                    to={`/pet-profile/${pet._id}`}
                    className="py-1.5 px-2 text-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    to={`/vaccinations/${pet._id}`}
                    className="py-1.5 px-2 text-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                  >
                    Vaccines
                  </Link>
                  <Link
                    to={`/track/${pet._id}`}
                    className="py-1.5 px-2 text-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                  >
                    Care Log
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. CURATED STORE PREVIEW                                                  */}
      {/* ========================================================================= */}
      {products && products.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200/60">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider">
                Marketplace
              </span>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
                Featured Care Essentials
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-medium text-sky-700 hover:text-sky-800 inline-flex items-center gap-1"
            >
              Explore Catalog <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {products.slice(0, 6).map((prod) => (
              <div
                key={prod._id}
                className="bg-white rounded-xl p-3 border border-slate-200/70 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative overflow-hidden rounded-lg mb-2 bg-slate-50">
                    <img src={prod.image} alt={prod.name} className="w-full h-24 object-cover" />
                    <span className="absolute top-1 left-1 text-[9px] font-medium text-slate-700 uppercase bg-white/90 px-1.5 py-0.5 rounded shadow-2xs">
                      {prod.category}
                    </span>
                  </div>
                  <h4 className="font-medium text-xs text-slate-800 line-clamp-1">{prod.name}</h4>
                  <p className="text-xs font-semibold text-slate-900 mt-0.5">₹{prod.price}</p>
                </div>

                <Link
                  to="/shop"
                  className="mt-2 text-center py-1 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-[11px] transition-all"
                >
                  View Item
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
