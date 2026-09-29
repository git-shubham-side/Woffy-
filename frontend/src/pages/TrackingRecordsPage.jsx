import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  PlusCircle,
  Calendar,
  Scale,
  Stethoscope,
  Pill,
  Scissors,
  Droplets,
  ClipboardList,
  Trash2,
  X,
  FileText,
  AlertCircle,
  CheckCircle2,
  Search,
  ExternalLink,
  Eye,
  Sparkles,
  ArrowRight,
  ChevronRight,
  UploadCloud,
  Check,
  Download,
  AlertTriangle,
  RotateCcw,
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
    if (!pet) return null;
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

// Activity Modules Configuration matching Landing Page 6-in-1 modules
const ACTIVITY_MODULES = {
  weight: {
    label: 'Weight',
    icon: Scale,
    tag: 'Growth & Diet',
    color: 'sky',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    iconClass: 'bg-sky-100 text-sky-600 border-sky-200',
    placeholder: 'e.g. 24.5 kg (auto-syncs to pet profile)',
    tip: 'Entering a number like 24.5 kg will automatically update your pet\'s weight on their official profile.',
  },
  medical: {
    label: 'Medical',
    icon: Stethoscope,
    tag: 'Surgeries & Tests',
    color: 'rose',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    iconClass: 'bg-rose-100 text-rose-600 border-rose-200',
    placeholder: 'e.g. Annual Blood Panel, Hip Dysplasia X-Ray',
    tip: 'Record past medical procedures, clinical tests, dental cleanings, or lab diagnostic results.',
  },
  medicine: {
    label: 'Medicine',
    icon: Pill,
    tag: 'Dosages & Treatments',
    color: 'blue',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    iconClass: 'bg-blue-100 text-blue-600 border-blue-200',
    placeholder: 'e.g. Bravecto Chewable Tablet 250mg, Antibiotic drops',
    tip: 'Track active medication courses, dewormers, daily supplements, and veterinary dosages.',
  },
  vet_history: {
    label: 'Vet History',
    icon: ClipboardList,
    tag: 'Doctor Consultations',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconClass: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    placeholder: 'e.g. Routine Checkup at Crown Vet Clinic',
    tip: 'Log doctor consultation visits, vet hospital diagnoses, and attach doctor prescription slips.',
  },
  grooming: {
    label: 'Grooming',
    icon: Scissors,
    tag: 'Fur, Nails & Coat',
    color: 'purple',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    iconClass: 'bg-purple-100 text-purple-600 border-purple-200',
    placeholder: 'e.g. Full Fur Trimming, Nail Clipping & Ear Cleaning',
    tip: 'Log professional pet salon grooming sessions, fur trims, de-shedding, and nail hygiene.',
  },
  bath: {
    label: 'Bath',
    icon: Droplets,
    tag: 'Hygiene & Skin Wash',
    color: 'cyan',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    iconClass: 'bg-cyan-100 text-cyan-600 border-cyan-200',
    placeholder: 'e.g. Anti-Tick Medicated Shampoo Bath',
    tip: 'Keep track of regular bathing cycles, anti-flea washes, and sensitive skin care.',
  },
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
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

const TrackingRecordsPage = () => {
  const { petId: paramPetId } = useParams();
  const navigate = useNavigate();

  const [pets, setPets] = useState([]);
  const [currentPet, setCurrentPet] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Filters & Search
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  // Modals & Popups
  const [showAddModal, setShowAddModal] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Form State
  const [form, setForm] = useState({
    activityType: 'weight',
    title: '',
    date: new Date().toISOString().substring(0, 10),
    notes: '',
  });
  const [recordImageFile, setRecordImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  // Clean up object URLs on unmount or file change
  useEffect(() => {
    if (recordImageFile) {
      const url = URL.createObjectURL(recordImageFile);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setImagePreviewUrl(null);
  }, [recordImageFile]);

  // Fetch pet list and records
  const fetchRecords = async (targetPetId = paramPetId) => {
    try {
      const petsRes = await api.get('/api/pet-profiles');
      const allPets = petsRes.data?.pets || [];
      setPets(allPets);

      let targetPet = null;
      if (targetPetId) {
        targetPet = allPets.find((p) => p._id === targetPetId);
      }
      if (!targetPet && allPets.length > 0) {
        targetPet = allPets[0];
      }
      setCurrentPet(targetPet);

      if (targetPet) {
        // Support both /api/track/:petId and /api/records/:petId
        let recordsRes;
        try {
          recordsRes = await api.get(`/api/track/${targetPet._id}`);
        } catch {
          recordsRes = await api.get(`/api/records/${targetPet._id}`);
        }

        if (recordsRes.data && recordsRes.data.success) {
          setRecords(recordsRes.data.records || []);
        }
      }
    } catch (err) {
      console.error('Fetch tracking records error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(paramPetId);
  }, [paramPetId]);

  const handlePetChange = (newPetId) => {
    navigate(`/track/${newPetId}`);
    fetchRecords(newPetId);
  };

  // Submit new health / care record
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!currentPet) return;
    if (!form.title.trim()) {
      alert('Please enter a measurement or title for this log.');
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const data = new FormData();
      data.append('petId', currentPet._id);
      data.append('activityType', form.activityType);
      data.append('title', form.title.trim());
      data.append('date', form.date);
      data.append('notes', form.notes.trim());
      if (recordImageFile) {
        data.append('recordImage', recordImageFile);
      }

      // Try /api/records first, fallback to /api/track/create
      let res;
      try {
        res = await api.post('/api/records', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } catch (err) {
        if (err.response?.status === 404) {
          res = await api.post('/api/track/create', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          throw err;
        }
      }

      if (res.data && res.data.success) {
        setShowAddModal(false);
        setForm({
          activityType: 'weight',
          title: '',
          date: new Date().toISOString().substring(0, 10),
          notes: '',
        });
        setRecordImageFile(null);
        setFeedback({
          type: 'success',
          text: res.data.message || 'Care activity saved successfully to vault!',
        });
        await fetchRecords(currentPet._id);
      } else {
        alert(res.data?.message || 'Failed to save record.');
      }
    } catch (err) {
      console.error('Save record error:', err);
      alert(
        err.response?.data?.message ||
          'An error occurred while saving the activity log. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Delete care record
  const confirmDeleteRecord = async () => {
    if (!recordToDelete) return;
    setDeleting(true);

    try {
      let res;
      try {
        res = await api.post(`/api/records/delete/${recordToDelete._id}`, {
          petId: currentPet._id,
        });
      } catch {
        res = await api.delete(`/api/records/${recordToDelete._id}`, {
          data: { petId: currentPet._id },
        });
      }

      if (res.data && res.data.success) {
        setRecordToDelete(null);
        setFeedback({
          type: 'success',
          text: 'Activity log deleted from record history.',
        });
        await fetchRecords(currentPet._id);
      } else {
        alert(res.data?.message || 'Failed to delete record.');
      }
    } catch (err) {
      console.error('Delete record error:', err);
      alert('Failed to delete log entry.');
    } finally {
      setDeleting(false);
    }
  };

  // Filter & Sort records
  const filteredRecords = records
    .filter((rec) => {
      const matchesCategory =
        activeCategory === 'all' || rec.activityType === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        rec.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.activityType?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  // Category counts
  const categoryCounts = records.reduce((acc, rec) => {
    acc[rec.activityType] = (acc[rec.activityType] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-600 font-normal text-xs tracking-wide">
          Syncing health logs and medical records...
        </p>
      </div>
    );
  }

  if (!currentPet) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
          <Activity className="w-9 h-9" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight">
            No Companion Profile Registered
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto font-light leading-relaxed">
            Please register your companion's profile to unlock automated weight charting,
            vet consultation vault, and medical tracking.
          </p>
        </div>
        <Link
          to="/create-pet-profile"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-xs transition-all duration-200 hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register First Companion</span>
        </Link>
      </div>
    );
  }

  const selectedModuleInfo = ACTIVITY_MODULES[form.activityType] || ACTIVITY_MODULES.weight;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* 1. HERO HEADER (Matching Landing Page theme & typography) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/40 via-sky-50/20 to-white pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
          >
            <div className="space-y-4 max-w-2xl">
              {/* Badge */}
              <motion.div variants={fadeInUp} className="inline-flex">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-blue-200/70 bg-blue-50/50">
                  <span className="text-amber-500 text-xs">✦</span>
                  <span className="text-blue-600 font-normal text-xs tracking-wide">
                    6-in-1 Daily Wellness &amp; Medical Vault
                  </span>
                </div>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                variants={fadeInUp}
                className="text-3xl sm:text-4xl lg:text-[2.75rem] font-light tracking-tight text-slate-900 leading-[1.15]"
              >
                Health &amp; Activity{' '}
                <span className="relative inline-block font-normal text-blue-600">
                  Tracker
                  {/* Subtle Curved Orange Underline matching Landing Page */}
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
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={fadeInUp}
                className="text-sm sm:text-base text-slate-500 font-light leading-relaxed"
              >
                Log weight progress, prescriptions, surgical history, grooming sessions, and vet
                visit slips for <strong>{currentPet.petName}</strong> in one encrypted medical vault.
              </motion.p>
            </div>

            {/* Quick Actions Header */}
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log Care Activity</span>
              </button>

              <Link
                to={`/vaccine-passport/${currentPet._id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-normal text-sm border border-slate-200 transition-all duration-200 hover:-translate-y-0.5 shadow-2xs"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Digital Passport</span>
              </Link>

              <Link
                to={`/pet-profile/${currentPet._id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-normal text-sm border border-slate-200 transition-all duration-200 hover:-translate-y-0.5 shadow-2xs"
              >
                <span>View Full Profile</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Feedback Alert */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm shadow-2xs ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span className="font-normal">{feedback.text}</span>
              </div>
              <button
                onClick={() => setFeedback(null)}
                className="p-1 rounded-lg hover:bg-black/5 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. PET SHOWCASE & VITALS BANNER (Matching Landing Page Preset Cards) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        >
          {/* Pet Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <PetPhotoDisplay pet={currentPet} className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl" />

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-light text-slate-900 tracking-tight">
                  {currentPet.petName}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-normal bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Health Tracking
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 font-light flex flex-wrap items-center gap-2">
                <span>{currentPet.breed || 'Companion'}</span>
                <span>•</span>
                <span>{currentPet.age ? `${currentPet.age} Years Old` : 'Age N/A'}</span>
                <span>•</span>
                <span>{currentPet.gender || 'Unknown Gender'}</span>
                {currentPet.species && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{currentPet.species}</span>
                  </>
                )}
              </p>

              {/* Multiple Pets Switcher Buttons */}
              {pets.length > 1 && (
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400 font-light mr-1">Switch:</span>
                  {pets.map((p) => {
                    const isActive = p._id === currentPet._id;
                    return (
                      <button
                        key={p._id}
                        onClick={() => handlePetChange(p._id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs transition-all duration-150 ${
                          isActive
                            ? 'bg-blue-600 text-white font-medium shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 font-normal'
                        }`}
                      >
                        <span>{p.petName}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
            {/* Metric 1: Weight */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-sky-50/60 border border-sky-100/80 space-y-1">
              <div className="flex items-center gap-1.5 text-sky-700 text-xs font-normal">
                <Scale className="w-3.5 h-3.5 text-sky-600" />
                <span>Profile Weight</span>
              </div>
              <p className="text-lg sm:text-xl font-light text-slate-900 tracking-tight">
                {currentPet.weight ? `${currentPet.weight} kg` : 'Not Set'}
              </p>
              <span className="text-[10px] text-sky-600 font-light block">
                Auto-syncs via weight logs
              </span>
            </div>

            {/* Metric 2: Total Logs */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/60 border border-blue-100/80 space-y-1">
              <div className="flex items-center gap-1.5 text-blue-700 text-xs font-normal">
                <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
                <span>Care Records</span>
              </div>
              <p className="text-lg sm:text-xl font-light text-slate-900 tracking-tight">
                {records.length}{' '}
                <span className="text-xs text-slate-400 font-light">
                  {records.length === 1 ? 'Entry' : 'Entries'}
                </span>
              </p>
              <span className="text-[10px] text-blue-600 font-light block">
                Stored in medical vault
              </span>
            </div>

            {/* Metric 3: Latest Activity */}
            <div className="col-span-2 sm:col-span-1 p-3.5 sm:p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/80 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-normal">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Last Updated</span>
              </div>
              <p className="text-sm sm:text-base font-light text-slate-900 tracking-tight truncate">
                {records.length > 0
                  ? new Date(records[0].date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'No logs yet'}
              </p>
              <span className="text-[10px] text-emerald-600 font-light block">
                {records.length > 0 ? 'Verified entry' : 'Awaiting first log'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 3. 6-IN-1 CARE HUB FILTER RIBBON (Directly inspired by Landing Page Section 2) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-800 tracking-wide uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Care Modules &amp; Filters</span>
            </h3>
            <span className="text-xs text-slate-400 font-light">
              Showing {filteredRecords.length} of {records.length} logs
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {/* All Filter */}
            <button
              onClick={() => setActiveCategory('all')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm transition-all duration-200 shrink-0 border ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 font-medium shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200/80 font-normal'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>All Logs</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] ${
                  activeCategory === 'all'
                    ? 'bg-white/20 text-white font-medium'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {records.length}
              </span>
            </button>

            {/* 6 Category Pills */}
            {Object.entries(ACTIVITY_MODULES).map(([key, config]) => {
              const IconComp = config.icon;
              const count = categoryCounts[key] || 0;
              const isActive = activeCategory === key;

              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm transition-all duration-200 shrink-0 border ${
                    isActive
                      ? `${config.badgeClass} font-medium shadow-2xs`
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200/80 font-normal'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{config.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] ${
                      isActive
                        ? 'bg-white text-slate-800 font-medium shadow-2xs'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. SEARCH & SORT BAR */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, medicine, clinic, or notes..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-light"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-light">Sort:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-normal text-slate-700 bg-white focus:outline-hidden focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {(activeCategory !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-colors font-light"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* 5. RECORDS TIMELINE / CARDS LIST */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 sm:p-16 rounded-3xl bg-white border border-slate-100 shadow-2xs text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-lg font-light text-slate-900 tracking-tight">
                  {searchQuery || activeCategory !== 'all'
                    ? 'No matching care records found'
                    : 'No care activities logged yet'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto font-light leading-relaxed">
                  {searchQuery || activeCategory !== 'all'
                    ? 'Try clearing your search query or switching to another category.'
                    : `Log ${currentPet.petName}'s first weight check, doctor prescription, medication dosage, or grooming session.`}
                </p>
              </div>

              {searchQuery || activeCategory !== 'all' ? (
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-normal text-xs transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Show All Records</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-xs transition-all duration-200 hover:-translate-y-0.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create First Log</span>
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-3.5"
            >
              {filteredRecords.map((rec) => {
                const config = ACTIVITY_MODULES[rec.activityType] || ACTIVITY_MODULES.weight;
                const IconComponent = config.icon;
                const formattedDate = new Date(rec.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <motion.div
                    key={rec._id}
                    variants={fadeInUp}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row items-start justify-between gap-5 group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Left Category Icon */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${config.iconClass}`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>

                      {/* Content Area */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-medium text-base text-slate-900 tracking-tight">
                            {rec.title}
                          </h4>
                          <span
                            className={`text-[11px] font-normal px-2.5 py-0.5 rounded-full border ${config.badgeClass}`}
                          >
                            {config.label} • {config.tag}
                          </span>
                        </div>

                        {/* Date */}
                        <p className="text-xs text-slate-400 font-light flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formattedDate}</span>
                        </p>

                        {/* Notes / Clinical Advice */}
                        {rec.notes && (
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 font-light leading-relaxed max-w-2xl">
                            {rec.notes}
                          </div>
                        )}

                        {/* Attached Prescription / Image Document */}
                        {rec.image && (
                          <div className="pt-1 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setLightboxImage(rec.image)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/80 hover:bg-blue-100 text-blue-700 text-xs font-normal transition-colors border border-blue-200/60"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                              <span>View Prescription / Document</span>
                            </button>

                            <a
                              href={rec.image}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 font-light transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Open Original</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                      <button
                        onClick={() => setRecordToDelete(rec)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete log entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </main>

      {/* 6. ADD HEALTH ACTIVITY MODAL (Matching Landing Page Modal Form Styling) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl border border-slate-100 my-8"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full border border-blue-200/70 bg-blue-50/50 text-blue-600 text-xs font-normal">
                    <span>✦ Care Entry Logger</span>
                  </div>
                  <h3 className="text-xl font-light text-slate-900 tracking-tight">
                    Log Health Activity for{' '}
                    <span className="font-normal text-blue-600">{currentPet.petName}</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-light">
                    Record medical notes, dosages, weight checks, or doctor prescription receipts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddSubmit} className="space-y-5">
                {/* 1. Category Selector Grid */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-700 tracking-wide uppercase">
                    Select Activity Category *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {Object.entries(ACTIVITY_MODULES).map(([key, config]) => {
                      const IconComp = config.icon;
                      const isSelected = form.activityType === key;

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setForm({ ...form, activityType: key })}
                          className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all duration-150 ${
                            isSelected
                              ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-2xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-xl shrink-0 ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5 overflow-hidden">
                            <span className="text-xs font-medium text-slate-800 block truncate">
                              {config.label}
                            </span>
                            <span className="text-[10px] text-slate-400 font-light block truncate">
                              {config.tag}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Measurement / Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700 tracking-wide uppercase">
                    Measurement / Record Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder={selectedModuleInfo.placeholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-light"
                  />
                  <p className="text-[11px] text-blue-600 font-light leading-relaxed">
                    💡 {selectedModuleInfo.tip}
                  </p>
                </div>

                {/* 3. Date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700 tracking-wide uppercase">
                    Date of Care *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-light"
                    />
                  </div>
                </div>

                {/* 4. Notes / Instructions */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700 tracking-wide uppercase">
                    Doctor Advice, Instructions &amp; Notes
                  </label>
                  <textarea
                    rows="3"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Enter veterinary advice, medicine dosage regimen, post-surgery recovery guidelines..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-light resize-y"
                  ></textarea>
                </div>

                {/* 5. Prescription / Document Upload */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700 tracking-wide uppercase">
                    Attach Prescription Receipt / Photo (Optional)
                  </label>

                  {imagePreviewUrl ? (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img
                          src={imagePreviewUrl}
                          alt="Preview"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="overflow-hidden">
                          <p className="text-xs font-medium text-slate-800 truncate">
                            {recordImageFile?.name}
                          </p>
                          <span className="text-[10px] text-slate-400 font-light">
                            {recordImageFile
                              ? (recordImageFile.size / 1024).toFixed(1) + ' KB'
                              : ''}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRecordImageFile(null)}
                        className="px-2.5 py-1 rounded-lg text-xs text-rose-600 hover:bg-rose-50 font-normal transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30">
                      <UploadCloud className="w-7 h-7 text-blue-500 mb-1.5" />
                      <span className="text-xs font-medium text-slate-700">
                        Click or drag doctor prescription slip / photo
                      </span>
                      <span className="text-[10px] text-slate-400 font-light mt-0.5">
                        JPG, PNG, WEBP (Max 10MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setRecordImageFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Modal Footer Buttons */}
                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-normal transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-xs transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving Care Log...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save to Medical Vault</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. LIGHTBOX MODAL FOR PRESCRIPTION / DOCUMENT PREVIEW */}
      <AnimatePresence>
        {lightboxImage && (
          <div
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-4 space-y-4"
            >
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-medium text-slate-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Prescription / Clinical Attachment Viewer
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={lightboxImage}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-light transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Open Original</span>
                  </a>
                  <button
                    onClick={() => setLightboxImage(null)}
                    className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-auto max-h-[75vh] flex items-center justify-center bg-slate-100/60 rounded-2xl p-2">
                <img
                  src={lightboxImage}
                  alt="Prescription Document"
                  className="max-h-[70vh] w-auto object-contain rounded-xl shadow-xs"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {recordToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-xl border border-slate-100"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-light text-slate-900 tracking-tight">
                  Delete Care Log Entry?
                </h3>
                <p className="text-xs text-slate-500 font-light leading-relaxed">
                  Are you sure you want to remove "<strong>{recordToDelete.title}</strong>"?
                  This action will permanently delete this medical entry and any attached prescription receipt.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRecordToDelete(null)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-normal transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteRecord}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-xs transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrackingRecordsPage;
