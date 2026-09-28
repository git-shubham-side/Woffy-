import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  PlusCircle,
  Search,
  QrCode,
  Syringe,
  Activity,
  Edit,
  Printer,
  AlertTriangle,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  Dog,
  ArrowRight,
  ChevronRight,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';

// Cute Cartoon Avatar Fallback Component (matching Dashboard & Landing Page theme)
const CartoonPetAvatar = ({ className = 'w-14 h-14' }) => (
  <div
    className={`flex items-center justify-center bg-gradient-to-tr from-sky-100 via-blue-50 to-indigo-100 rounded-2xl border-2 border-blue-200 overflow-hidden shrink-0 ${className}`}
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

// Pet Photo with Error Handling & Cartoon Fallback
const PetPhotoDisplay = ({ pet, className = 'w-14 h-14' }) => {
  const [hasError, setHasError] = useState(false);

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
      className={`rounded-2xl object-cover border-2 border-slate-200 shadow-2xs shrink-0 ${className}`}
    />
  );
};

// Animation variants matching Landing & Dashboard
const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
};

const PetProfilesPage = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'safe', 'lost', 'dog', 'cat'
  const [copiedId, setCopiedId] = useState(null);

  // Delete Confirmation Modal State
  const [petToDelete, setPetToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPets = async () => {
    try {
      const res = await api.get('/api/pet-profiles');
      if (res.data && res.data.success) {
        setPets(res.data.pets || []);
      }
    } catch (err) {
      console.error('Fetch pets error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeletePet = async () => {
    if (!petToDelete) return;
    setDeleting(true);
    try {
      const res = await api.post(`/api/pet-profile/delete/${petToDelete._id}`);
      if (res.data && res.data.success) {
        setPets((prev) => prev.filter((p) => p._id !== petToDelete._id));
        setPetToDelete(null);
      } else {
        alert(res.data?.message || 'Failed to delete pet profile.');
      }
    } catch (err) {
      console.error('Delete pet error:', err);
      alert('Error occurred while deleting pet profile.');
    } finally {
      setDeleting(false);
    }
  };

  // Stats calculations
  const safePets = pets.filter((p) => !p.isLost);
  const lostPets = pets.filter((p) => p.isLost);
  const activeTagsCount = pets.filter((p) => p.collarId).length;
  const vaccinatedCount = pets.filter(
    (p) => (p.vaccinated || '').toLowerCase() === 'yes'
  ).length;

  // Filtered Pets
  const filteredPets = pets
    .filter((pet) => {
      if (filterMode === 'safe') return !pet.isLost;
      if (filterMode === 'lost') return pet.isLost;
      if (filterMode === 'dog') return (pet.species || '').toLowerCase() === 'dog';
      if (filterMode === 'cat') return (pet.species || '').toLowerCase() === 'cat';
      return true;
    })
    .filter((pet) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (pet.petName || '').toLowerCase().includes(q) ||
        (pet.breed || '').toLowerCase().includes(q) ||
        (pet.collarId || '').toLowerCase().includes(q) ||
        (pet.species || '').toLowerCase().includes(q)
      );
    });

  const cardBase =
    'bg-white border-2 border-slate-200 text-slate-800 hover:border-blue-400 shadow-xs hover:shadow-lg transition-all duration-200';

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-600 font-medium text-xs tracking-wide">
          Syncing companion profiles &amp; emergency collar tags...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-700 selection:bg-blue-100 selection:text-blue-900 relative overflow-x-hidden font-sans py-8">
      {/* Ambient Radial Background Gradients (matching Landing Page & Dashboard) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-sky-100/35 via-blue-50/15 to-transparent blur-3xl" />
        <div className="absolute top-[30%] -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-emerald-100/25 via-teal-50/15 to-transparent blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
        {/* ========================================================================= */}
        {/* 1. TOP HERO HEADER (SIGNATURE LANDING PAGE DESIGN LANGUAGE)                */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className={`rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative overflow-hidden ${cardBase}`}
        >
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2.5 max-w-2xl">
              {/* Kicker Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-blue-200/70 bg-blue-50/50">
                <span className="text-amber-500 text-xs">✦</span>
                <span className="text-blue-600 font-normal text-xs tracking-wide">
                  Smart Pet Health &amp; Identity Console
                </span>
              </div>

              {/* Main Headline with Curved Orange Accent Line */}
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-light tracking-tight text-slate-900 leading-[1.2]">
                My Registered{' '}
                <span className="relative inline-block font-normal text-blue-600">
                  Pets
                  {/* Subtle Curved Orange Underline */}
                  <svg
                    className="absolute -bottom-2 left-0 w-full overflow-visible"
                    viewBox="0 0 100 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 13 C 25 18, 70 8, 98 11"
                      stroke="#f97316"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-500 font-light leading-relaxed">
                Manage identification collar tags, digital medical passports, automated
                WSAVA vaccinations, and real-time emergency QR settings in one unified workspace.
              </p>
            </div>

            {/* Action CTA Button */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/create-pet-profile"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all hover:-translate-y-0.5"
              >
                <PlusCircle className="w-4 h-4 text-white" />
                <span>Add New Pet</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 2. REFINED SUMMARY METRIC TILES                                            */}
        {/* ========================================================================= */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Tile 1: Total Pets */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className={`p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between ${cardBase}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Registered Pets
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-blue-200/80">
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
            <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {safePets.length} Safe at Home
              </span>
              <span className="text-slate-400 font-mono text-[11px]">Sync OK</span>
            </div>
          </motion.div>

          {/* Tile 2: Safe at Home */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className={`p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between ${cardBase}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Home Safety Status
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border-2 border-emerald-200/80">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
                {safePets.length}
              </span>
              <span className="text-xs font-medium text-slate-600">Companions Safe</span>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600">Live GPS beacon ready</span>
              <span className="text-emerald-600 font-semibold">100% Protected</span>
            </div>
          </motion.div>

          {/* Tile 3: Emergency QR Collar Tags */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className={`p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between ${cardBase}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Collar QR Tags
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-blue-200/80">
                <QrCode className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
                {activeTagsCount}
              </span>
              <span className="text-xs font-medium text-slate-600">/{pets.length} Issued</span>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                Print-ready sheets
              </span>
              <span className="text-blue-600 font-semibold">Live Resolver</span>
            </div>
          </motion.div>

          {/* Tile 4: Immunization Status */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className={`p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between ${cardBase}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Vaccine Coverage
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border-2 border-emerald-200/80">
                <Syringe className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
                {vaccinatedCount}
              </span>
              <span className="text-xs font-medium text-slate-600">/{pets.length} Up to Date</span>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>WSAVA Protocol</span>
              <Link to="/vaccinations" className="text-blue-600 hover:underline font-semibold">
                Tracker &rarr;
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 3. SEARCH & QUICK FILTER PILL TABS                                         */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, breed, species, or collar ID..."
              className="w-full pl-10 pr-9 py-2 rounded-xl border-2 border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-normal focus:outline-hidden focus:border-blue-500 shadow-2xs transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl border-2 border-slate-200 bg-slate-100 text-xs font-medium text-slate-700 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                filterMode === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              All ({pets.length})
            </button>
            <button
              onClick={() => setFilterMode('safe')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
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
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  filterMode === 'lost'
                    ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                    : 'text-rose-600 font-medium'
                }`}
              >
                Lost ({lostPets.length})
              </button>
            )}
            <button
              onClick={() => setFilterMode('dog')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                filterMode === 'dog'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Dogs
            </button>
            <button
              onClick={() => setFilterMode('cat')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                filterMode === 'cat'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Cats
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. PET PROFILES GRID                                                      */}
        {/* ========================================================================= */}
        {pets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-12 rounded-3xl text-center space-y-4 border-2 border-dashed border-slate-300 bg-white shadow-xs ${cardBase}`}
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center border-2 border-blue-200">
              <Dog className="w-8 h-8 stroke-[1.75]" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-lg font-semibold text-slate-900">
                No Pets Registered Yet
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-light">
                Add your furry companion to generate an instant emergency QR collar tag,
                store veterinary prescriptions, and unlock WSAVA vaccination tracking.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/create-pet-profile"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all hover:-translate-y-0.5"
              >
                <PlusCircle className="w-4 h-4 text-white" /> Register Your First Pet Free
              </Link>
            </div>
          </motion.div>
        ) : filteredPets.length === 0 ? (
          <div className={`p-10 rounded-2xl border-2 text-center text-slate-500 text-sm font-normal ${cardBase}`}>
            No companion profiles matched your search "{search}". Try searching by another name, breed, or collar ID.
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filteredPets.map((pet) => (
              <motion.div
                key={pet._id}
                variants={fadeInUp}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between space-y-4 relative overflow-hidden group ${cardBase} ${
                  pet.isLost ? 'border-rose-500' : ''
                }`}
              >
                {/* Pet Header */}
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <Link
                        to={`/pet-profile/${pet._id}`}
                        className="group/avatar block hover:opacity-95 transition-opacity"
                        title="View profile"
                      >
                        <PetPhotoDisplay pet={pet} className="w-14 h-14" />
                      </Link>

                      <div>
                        <Link
                          to={`/pet-profile/${pet._id}`}
                          className="font-semibold text-lg text-slate-900 group-hover:text-blue-600 transition-colors inline-block"
                        >
                          {pet.petName}
                        </Link>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {pet.breed || pet.species || 'Companion'}
                          </span>
                          <span className="text-slate-400 text-xs">•</span>
                          <span className="text-xs text-slate-500 font-normal">
                            {pet.gender || 'Companion'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-normal mt-0.5">
                          {pet.age ? `${pet.age} yrs` : 'Age N/A'} • {pet.weight ? `${pet.weight} kg` : 'Weight N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Status Pill Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border inline-flex items-center gap-1.5 shrink-0 ${
                        pet.isLost
                          ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse font-semibold'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          pet.isLost ? 'bg-rose-600' : 'bg-emerald-500'
                        }`}
                      />
                      {pet.isLost ? 'Lost Alert' : 'Safe at Home'}
                    </span>
                  </div>

                  {/* QR Collar Tag Info Box */}
                  <div className="p-3 rounded-xl border-2 flex items-center justify-between text-xs bg-slate-50 border-slate-200 text-slate-800">
                    <div className="flex items-center gap-2 min-w-0">
                      <QrCode className="w-4 h-4 text-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider font-semibold">
                          Collar Tag ID
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 truncate">
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
                      </div>
                    </div>

                    <Link
                      to={`/pet-profile/${pet._id}/print-tag`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 text-xs font-semibold transition-colors shrink-0"
                      title="Print collar QR tag"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </Link>
                  </div>

                  {/* Medical Alert Warning (if allergies or medical notes present) */}
                  {(pet.allergies || pet.medicalAlerts) && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/70 text-rose-800 text-xs flex items-center gap-2 font-normal">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span className="truncate">
                        Alert: {pet.medicalAlerts || pet.allergies}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons (Tier 1 & Tier 2) */}
                <div className="space-y-2 pt-3 border-t border-slate-200">
                  {/* Primary: Full Profile Link */}
                  <Link
                    to={`/pet-profile/${pet._id}`}
                    className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:-translate-y-0.5"
                  >
                    <span>View Health Passport &amp; Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {/* Secondary Quick Action Row */}
                  <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-medium">
                    <Link
                      to={`/vaccinations/${pet._id}`}
                      className="py-1.5 px-1 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border-2 border-slate-200 transition-colors flex items-center justify-center gap-1"
                      title="Vaccination schedule"
                    >
                      <Syringe className="w-3.5 h-3.5 text-blue-500" />
                      <span className="hidden sm:inline">Vaccines</span>
                    </Link>
                    <Link
                      to={`/track/${pet._id}`}
                      className="py-1.5 px-1 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border-2 border-slate-200 transition-colors flex items-center justify-center gap-1"
                      title="Health & tracking logs"
                    >
                      <Activity className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="hidden sm:inline">Logs</span>
                    </Link>
                    <Link
                      to={`/pet-profile/edit/${pet._id}`}
                      className="py-1.5 px-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border-2 border-slate-200 transition-colors flex items-center justify-center gap-1"
                      title="Edit pet details"
                    >
                      <Edit className="w-3.5 h-3.5 text-slate-500" />
                      <span className="hidden sm:inline">Edit</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPetToDelete(pet)}
                      className="py-1.5 px-1 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-700 border-2 border-slate-200 transition-colors flex items-center justify-center gap-1"
                      title="Delete profile"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. DELETE PET CONFIRMATION MODAL                                          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {petToDelete && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md rounded-3xl bg-white border-2 border-slate-200 shadow-2xl p-6 text-left space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border-2 border-rose-200">
                    <AlertTriangle className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-slate-900">
                      Delete Pet Profile
                    </h3>
                    <p className="text-xs text-slate-500">This action cannot be undone</p>
                  </div>
                </div>
                <button
                  onClick={() => setPetToDelete(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Are you sure you want to delete{' '}
                <strong className="text-slate-900 font-semibold">{petToDelete.petName}</strong>? All
                associated medical journal logs, weight charts, and printable QR tags will be permanently removed.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPetToDelete(null)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeletePet}
                  disabled={deleting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PetProfilesPage;
