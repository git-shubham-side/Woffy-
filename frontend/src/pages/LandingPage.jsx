import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  QrCode,
  Activity,
  Heart,
  Zap,
  Radio,
  Wifi,
  Bell,
  MapPin,
  Phone,
  PhoneCall,
  Syringe,
  Pill,
  Scale,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Lock,
  Cpu,
  Eye,
  Share2,
  Download,
  AlertTriangle,
  Calendar,
  Award,
  Users,
  Building2,
  Sparkles,
  Send,
  X,
  Stethoscope,
  Compass,
  Check,
  ExternalLink,
  ShoppingBag,
  Star,
} from 'lucide-react';
import api from '../services/api';

const DOG_PRESETS = {
  bella: {
    id: 'WF-BELLA-3109',
    name: 'Bella',
    breed: 'French Bulldog',
    age: '1 Year, 4 Months',
    weight: '11.2 kg',
    targetWeight: '11.5 kg',
    status: 'Optimal Vitality',
    pulse: '94 BPM',
    temp: '38.8°C',
    hydration: '96%',
    microchip: '982-114-8830',
    diet: 'Hypoallergenic Salmon Formula',
    allergy: 'Penicillin & Chicken Meal',
    dewormCycle: '12 Days (Booster Due)',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
    primaryMed: 'Omega-3 EPA/DHA Anti-Inflammatory',
    medStatus: 'Scheduled for 08:00 PM',
    vaccine: 'Anti-Rabies + Kennel Cough',
    vaccineExpiry: 'Booster Due in 14 Days',
  },
  rocky: {
    id: 'WF-ROCKY-7821',
    name: 'Rocky',
    breed: 'Golden Retriever',
    age: '2 Years, 3 Months',
    weight: '28.4 kg',
    targetWeight: '28.5 kg',
    status: 'Optimal Vitality',
    pulse: '82 BPM',
    temp: '38.6°C',
    hydration: '98%',
    microchip: '981-098-7721',
    diet: 'High-Protein Grain-Inclusive',
    allergy: 'Hypersensitive to Flea Bites',
    dewormCycle: '38 Days Remaining',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
    primaryMed: 'Drontal Plus (Deworming Course)',
    medStatus: 'Dose Taken at 08:30 AM',
    vaccine: 'WSAVA 9-in-1 Combo (DHPPiL)',
    vaccineExpiry: 'Verified Valid (Oct 2027)',
  },
  bruno: {
    id: 'WF-BRUNO-9044',
    name: 'Bruno',
    breed: 'German Shepherd',
    age: '3 Years, 1 Month',
    weight: '34.8 kg',
    targetWeight: '35.0 kg',
    status: 'Athletic Peak',
    pulse: '76 BPM',
    temp: '38.4°C',
    hydration: '99%',
    microchip: '985-339-4412',
    diet: 'Active Working Dog Blend',
    allergy: 'No Known Allergies',
    dewormCycle: '74 Days Remaining',
    image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=800&q=80',
    primaryMed: 'Glucosamine & Joint Lubricant',
    medStatus: 'Administered with Breakfast',
    vaccine: 'WSAVA Core + Corona Booster',
    vaccineExpiry: 'Verified Valid (Dec 2027)',
  },
};

const SCHEDULE_STEPS = [
  {
    time: '08:00 AM',
    title: 'Morning Dose & Breakfast',
    desc: 'Breakfast served with verified oral dewormer intake.',
    metric: 'Dose Verified',
    icon: Pill,
    badge: 'Nutrition & Meds',
  },
  {
    time: '01:30 PM',
    title: 'Vitals & Hydration Check',
    desc: 'Activity logged and hydration verified at 98% optimal.',
    metric: 'Vitals Normal',
    icon: Activity,
    badge: 'Bio-Vitals',
  },
  {
    time: '06:00 PM',
    title: 'Collar Smart Tag Active',
    desc: 'Collar QR ready with instant owner emergency contact.',
    metric: 'Tag Active',
    icon: QrCode,
    badge: 'Collar Mesh',
  },
  {
    time: '09:30 PM',
    title: 'Night Telemetry Sync',
    desc: 'Prescriptions archived and tomorrow’s doses scheduled.',
    metric: 'Encrypted',
    icon: Lock,
    badge: 'Security Vault',
  },
];

// Animation presets for subtle clean transitions
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const LandingPage = () => {
  // Active Interactive Dog Preset
  const [activeDogKey, setActiveDogKey] = useState('bella');
  const currentDog = DOG_PRESETS[activeDogKey];

  // Interactive Collar Lost Mode
  const [isLostMode, setIsLostMode] = useState(false);

  // Interactive Phone Simulator Modal
  const [showPhoneScan, setShowPhoneScan] = useState(false);

  // 24-Hour Circadian Scrubber Index
  const [activeScheduleIdx, setActiveScheduleIdx] = useState(0);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  // Back to top visibility
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Smooth scroll progress bar across page
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enterprise Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    role: 'Pet Parent',
    subject: '',
    message: '',
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactStatus, setContactStatus] = useState(null);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactStatus(null);
    try {
      const res = await api.post('/api/contact', {
        name: contactForm.name,
        email: contactForm.email,
        subject: `[${contactForm.role}] ${contactForm.subject || 'Platform Inquiry'}`,
        message: contactForm.message,
      });
      if (res.data && res.data.success) {
        setContactStatus({
          type: 'success',
          text: 'Inquiry received. Our team will get back to you within 24 hours.',
        });
        setContactForm({ name: '', email: '', role: 'Pet Parent', subject: '', message: '' });
      } else {
        setContactStatus({
          type: 'error',
          text: res.data?.error || 'Failed to submit inquiry. Please retry.',
        });
      }
    } catch (err) {
      setContactStatus({
        type: 'error',
        text: err.response?.data?.error || 'Connection failed. Please try again shortly.',
      });
    } finally {
      setContactSubmitting(false);
    }
  };

  const faqItems = [
    {
      q: 'What makes Woofy different from traditional pet tags?',
      a: 'Woofy smart QR tags work instantly on any smartphone camera without apps or batteries, showing live emergency contacts, WhatsApp GPS sharing, and medical notes in seconds.',
    },
    {
      q: 'Is Woofy free for individual pet parents?',
      a: 'Yes, all core modules—pet profiles, printable QR collar tags, vaccination schedules, and health records—are permanently free with no paywalls.',
    },
    {
      q: 'How does Woofy adhere to WSAVA vaccine standards?',
      a: 'Our vaccine engine calculates canine protocols matching World Small Animal Veterinary Association guidelines, generating a travel-ready digital passport.',
    },
    {
      q: 'How does medication and deworming tracking work?',
      a: 'Set mealtime dosage schedules with automated reminders, recurring 90-day deworming intervals, and cloud prescription storage.',
    },
    {
      q: 'Can veterinary hospitals and rescue NGOs join?',
      a: 'Yes, verified clinics and animal welfare NGOs can join our directory to receive direct rescue calls and emergency triage inquiries.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-700 selection:bg-blue-100 selection:text-blue-900 relative overflow-x-hidden font-sans">
      
      {/* ========================================================================= */}
      {/* 0. HIGH SCROLL PROGRESS BAR (BLUE -> LIGHT GREEN GRADIENT)                */}
      {/* ========================================================================= */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400 z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Subtle Ambient Background Gradients */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-sky-100/30 via-blue-50/15 to-transparent blur-3xl" />
        <div className="absolute top-[30%] -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-emerald-100/20 via-teal-50/15 to-transparent blur-3xl" />
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Hero Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Badge */}
              <motion.div variants={fadeInUp} className="inline-flex">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-blue-200/70 bg-blue-50/50">
                  <span className="text-amber-500 text-xs">✦</span>
                  <span className="text-blue-600 font-normal text-xs tracking-wide">
                    All-in-One Pet Health &amp; Lifestyle Care
                  </span>
                </div>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-[3.5rem] font-light tracking-tight text-slate-900 leading-[1.15]"
              >
                Uncompromising{' '}
                <span className="relative inline-block font-normal text-blue-600">
                  Care
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
                </span>{' '}
                <br className="hidden sm:inline" />
                for Your Best Companion.
              </motion.h1>

              {/* Short 1-line clean explanation */}
              <motion.p
                variants={fadeInUp}
                className="text-base sm:text-lg text-slate-500 max-w-xl font-light leading-relaxed"
              >
                Digital health records, smart QR collar tags, and verified emergency pet care in one clean place.
              </motion.p>

              {/* CTA Action Buttons */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap items-center gap-3.5 pt-1"
              >
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </Link>

                <a
                  href="#services"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-normal text-sm border border-slate-200 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Compass className="w-4 h-4 text-slate-500" />
                  Explore Platform
                </a>
              </motion.div>

              {/* Social Proof Rating */}
              <motion.div
                variants={fadeInUp}
                className="pt-2 flex flex-wrap items-center gap-4"
              >
                <div className="flex -space-x-2.5 overflow-hidden">
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                    alt="User"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                    alt="User"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
                    alt="User"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80"
                    alt="User"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <div className="flex text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <span className="font-medium text-slate-700">4.9/5</span>
                  <span className="text-slate-400 font-light">from 2,500+ pet parents</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column: Hero Visual with French Bulldog & 2 Floating Badges */}
            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.98 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-[460px]">
                
                {/* Main Dog Card Container */}
                <div className="rounded-3xl overflow-hidden shadow-xl bg-[#5293b2] aspect-4/5 w-full relative">
                  <img
                    src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=85"
                    alt="French Bulldog in Yellow Hoodie"
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                {/* Floating Card 1: Top-Left "Verified Platform" */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-3 -left-2 sm:-top-5 sm:-left-5 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-md border border-slate-100 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left pr-1">
                    <h4 className="text-xs sm:text-sm font-medium text-slate-800 leading-tight">
                      Verified Platform
                    </h4>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-light">
                      100% authentic hospital data
                    </p>
                  </div>
                </motion.div>

                {/* Floating Card 2: Bottom-Right "Health & Growth" */}
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute -bottom-3 -right-2 sm:-bottom-5 sm:-right-5 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-md border border-slate-100 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left pr-1">
                    <h4 className="text-xs sm:text-sm font-medium text-slate-800 leading-tight">
                      Health &amp; Growth
                    </h4>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-light">
                      Active medical logs
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SECTION 2: EVERYTHING YOUR PET NEEDS, SIMPLIFIED.                       */}
      {/* ========================================================================= */}
      <section id="services" className="py-18 lg:py-22 bg-white border-t border-slate-100 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center max-w-2xl mx-auto mb-14 space-y-2.5"
          >
            <motion.div variants={fadeInUp}>
              <span className="bg-blue-50/70 text-blue-600 font-normal text-xs uppercase tracking-wider px-3.5 py-1 rounded-full border border-blue-100/70 inline-block">
                Platform Features
              </span>
            </motion.div>

            <motion.h2
              variants={fadeInUp}
              className="text-2xl sm:text-4xl font-light tracking-tight text-slate-900"
            >
              Everything Your Pet Needs, <span className="font-normal text-slate-900">Simplified</span>
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="text-slate-400 text-sm font-light max-w-lg mx-auto leading-relaxed"
            >
              Essential care tools designed to keep your dog healthy, protected, and happy.
            </motion.p>
          </motion.div>

          {/* 4 Feature Cards Grid - Short 1-line explanations & thin typography */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Card 1: Track Health Records */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="h-full"
            >
              <Link
                to="/records"
                className="bg-white rounded-2xl p-6 border border-slate-100 border-t-2 border-t-blue-500 shadow-xs hover:border-slate-200 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group cursor-pointer"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                    Track Health Records
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-light mb-5">
                    Log vaccines, medications, allergies, and vet prescriptions in one tap.
                  </p>
                </div>

                <span
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-blue-600 group-hover:text-blue-700 group-hover:gap-2 transition-all"
                >
                  <span>Start Health Tracking</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.div>

            {/* Card 2: Verified Pet Hospitals */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="h-full"
            >
              <Link
                to="/services/rescue"
                className="bg-white rounded-2xl p-6 border border-slate-100 border-t-2 border-t-orange-500 shadow-xs hover:border-slate-200 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group cursor-pointer"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-5 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <Building2 className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-2 group-hover:text-orange-600 transition-colors">
                    Verified Pet Hospitals
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-light mb-5">
                    Locate verified veterinary clinics and 24/7 emergency centers nearby.
                  </p>
                </div>

                <span
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-orange-600 group-hover:text-orange-700 group-hover:gap-2 transition-all"
                >
                  <span>Find Hospitals</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.div>

            {/* Card 3: Rescue NGOs & Helplines */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="h-full"
            >
              <Link
                to="/services/rescue"
                className="bg-white rounded-2xl p-6 border border-slate-100 border-t-2 border-t-emerald-500 shadow-xs hover:border-slate-200 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group cursor-pointer"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Heart className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">
                    Rescue NGOs &amp; Helplines
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-light mb-5">
                    Reach certified animal rescue teams, ambulances, and emergency helplines.
                  </p>
                </div>

                <span
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-emerald-600 group-hover:text-emerald-700 group-hover:gap-2 transition-all"
                >
                  <span>Find Rescue NGOs</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.div>

            {/* Card 4: Pet Essentials Shop */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="h-full"
            >
              <Link
                to="/shop"
                className="bg-white rounded-2xl p-6 border border-slate-100 border-t-2 border-t-purple-500 shadow-xs hover:border-slate-200 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group cursor-pointer"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-2 group-hover:text-purple-600 transition-colors">
                    Pet Essentials Shop
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-light mb-5">
                    Explore verified food, wellness supplements, and daily dog essentials.
                  </p>
                </div>

                <span
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-purple-600 group-hover:text-purple-700 group-hover:gap-2 transition-all"
                >
                  <span>Browse Pet Store</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION 3: WHY US / SMART QR COLLAR TAG & TELEMETRY HUD                 */}
      {/* ========================================================================= */}
      <section id="why-us" className="py-18 lg:py-22 bg-slate-50/60 border-t border-slate-100 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-9"
          >
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-normal text-blue-600 uppercase tracking-wider mb-1.5 bg-blue-50/80 px-3 py-1 rounded-full border border-blue-200/60">
                <Radio className="w-3.5 h-3.5 animate-pulse text-blue-500" />
                Smart Collar &amp; Telemetry
              </div>
              <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-slate-900">
                Real-Time Health &amp; Collar Mesh for{' '}
                <span className="font-normal text-blue-600">{currentDog.name}</span>
              </h2>
            </div>

            {/* Profile Quick Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono font-normal">PROFILE:</span>
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                {Object.keys(DOG_PRESETS).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveDogKey(key)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-normal transition-all ${
                      activeDogKey === key
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    {DOG_PRESETS[key].name} ({DOG_PRESETS[key].breed.split(' ')[0]})
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Telemetry HUD Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 4 Cols: Pet ID & Collar Simulator */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInUp}
              className="lg:col-span-4 space-y-4"
            >
              <div className="rounded-2xl bg-white border border-slate-200/80 p-5 space-y-4 shadow-xs relative overflow-hidden">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={currentDog.image}
                      alt={currentDog.name}
                      className="w-14 h-14 rounded-xl object-cover border border-blue-300"
                    />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                      <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-medium text-slate-900">{currentDog.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-normal bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {currentDog.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-light">{currentDog.breed} • {currentDog.age}</p>
                    <span className="font-mono text-[10px] text-blue-600 font-normal">TAG: {currentDog.id}</span>
                  </div>
                </div>

                {/* Collar Tag Physical Simulation */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-center relative overflow-hidden">
                  <div className="w-8 h-1 bg-slate-300 rounded-full mx-auto mb-2" />
                  <div className="p-3 rounded-lg bg-white text-slate-900 max-w-[190px] mx-auto shadow-xs border border-slate-200/60">
                    <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                      <span className="text-[9px] font-medium text-slate-700">WOFFY SAFE TAG</span>
                      <span className="text-[8px] font-mono text-emerald-600 font-normal bg-emerald-50 px-1.5 py-0.5 rounded">NFC+QR</span>
                    </div>
                    <div className="my-2 flex justify-center relative">
                      <QrCode className="w-20 h-20 text-slate-800" />
                      <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 animate-scan-beam rounded-full shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
                    </div>
                    <div className="text-[8px] font-mono text-slate-500 font-normal uppercase">
                      SCAN TO RESCUE // {currentDog.id}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-3.5">
                    <button
                      onClick={() => setShowPhoneScan(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-all shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Test Finder View
                    </button>
                    <button
                      onClick={() => setIsLostMode(!isLostMode)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-normal transition-all border ${
                        isLostMode
                          ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      {isLostMode ? 'SOS ACTIVE' : 'TEST LOST SOS'}
                    </button>
                  </div>
                </div>

                {/* Microchip & Diet Snapshot */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block font-normal">CHIP ID</span>
                    <span className="text-slate-700 font-normal">{currentDog.microchip}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                    <span className="text-[10px] text-emerald-700 block font-normal">WEIGHT</span>
                    <span className="text-emerald-700 font-medium">{currentDog.weight} / {currentDog.targetWeight}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right 8 Cols: Live Telemetry Gauges, Meds, and WSAVA Passport */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInUp}
              className="lg:col-span-8 space-y-4"
            >
              {/* Top 3 Metric Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-[10px] uppercase font-normal text-slate-500">Resting Pulse</span>
                    <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
                  </div>
                  <div className="text-2xl font-light font-mono text-slate-800">{currentDog.pulse}</div>
                  <span className="text-[10px] text-emerald-600 font-mono font-light">Normal Baseline</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-[10px] uppercase font-normal text-slate-500">Core Temp</span>
                    <Activity className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-light font-mono text-slate-800">{currentDog.temp}</div>
                  <span className="text-[10px] text-emerald-600 font-mono font-light">Optimal Thermal Range</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-[10px] uppercase font-normal text-slate-500">Deworming</span>
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-lg font-normal font-mono text-blue-600">{currentDog.dewormCycle}</div>
                  <span className="text-[10px] text-slate-400 font-mono font-light">WSAVA 90-Day Cadence</span>
                </div>
              </div>

              {/* Medication & WSAVA Passport Live Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Clinical Meds Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-normal text-emerald-700 flex items-center gap-1.5 uppercase">
                      <Pill className="w-3.5 h-3.5 text-emerald-600" />
                      Prescriptions
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-normal">
                      VERIFIED DOSE
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-medium text-slate-800">{currentDog.primaryMed}</p>
                          <span className="text-[11px] text-slate-400 font-light">{currentDog.medStatus}</span>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-800 font-light flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      <span>Allergy: {currentDog.allergy}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-light">Prescriptions synced with cloud.</span>
                    <Link to="/records" className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1">
                      Full History <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* WSAVA Passport Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-normal text-blue-700 flex items-center gap-1.5 uppercase">
                      <Syringe className="w-3.5 h-3.5 text-blue-600" />
                      WSAVA Passport
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 font-normal">
                      CERTIFIED
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-medium text-slate-800">{currentDog.vaccine}</p>
                          <span className="text-[11px] text-slate-400 font-light">{currentDog.vaccineExpiry}</span>
                        </div>
                        <Award className="w-4 h-4 text-blue-600 shrink-0" />
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-[11px] text-emerald-800 font-light flex items-center justify-between">
                      <span>Travel &amp; Boarding Clearance</span>
                      <span className="font-mono text-emerald-700 font-normal">READY</span>
                    </div>
                  </div>

                  <div className="pt-1 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-light">Instant QR scan by clinics.</span>
                    <Link to="/vaccinations" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                      Passport Hub <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Action Ribbon */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-slate-500 font-light">
                    Protected with zero-knowledge AES-256 encryption.
                  </span>
                </div>
                <Link
                  to="/pet-profiles"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-all shadow-xs whitespace-nowrap"
                >
                  Configure Hub
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION 4: 24-HOUR CARE TIMELINE                                       */}
      {/* ========================================================================= */}
      <section className="py-18 bg-white border-t border-slate-100 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center max-w-xl mx-auto mb-10 space-y-2"
          >
            <motion.span
              variants={fadeInUp}
              className="text-xs font-mono font-normal text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60"
            >
              24-Hour Routine
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-2xl sm:text-3xl font-light tracking-tight text-slate-900">
              A Day in the Life with Woofy
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xs sm:text-sm text-slate-400 font-light">
              A simple glimpse into daily pet care and automated routines.
            </motion.p>
          </motion.div>

          {/* Time Scrubber Selector */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
          >
            {SCHEDULE_STEPS.map((step, idx) => (
              <motion.button
                key={idx}
                variants={fadeInUp}
                onClick={() => setActiveScheduleIdx(idx)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  activeScheduleIdx === idx
                    ? 'bg-blue-50/60 border-blue-400 text-slate-900 shadow-xs'
                    : 'bg-white border-slate-200/70 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-normal text-blue-600">{step.time}</span>
                  <step.icon
                    className={`w-3.5 h-3.5 ${activeScheduleIdx === idx ? 'text-blue-600' : 'text-slate-400'}`}
                  />
                </div>
                <div className="text-xs font-normal truncate text-slate-700">{step.title}</div>
                <span className="text-[10px] text-slate-400 font-light mt-0.5 block">{step.badge}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Active Step Detailed Showcase Display */}
          <motion.div
            key={activeScheduleIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 sm:p-7 rounded-2xl bg-slate-50/80 border border-slate-200/70 shadow-2xs"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-8 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-full font-mono text-xs font-medium bg-blue-600 text-white">
                    {SCHEDULE_STEPS[activeScheduleIdx].time}
                  </span>
                  <span className="text-xs font-mono text-blue-700 font-normal uppercase tracking-wider bg-blue-100/60 px-2 py-0.5 rounded">
                    {SCHEDULE_STEPS[activeScheduleIdx].metric}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-normal text-slate-900">
                  {SCHEDULE_STEPS[activeScheduleIdx].title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-light">
                  {SCHEDULE_STEPS[activeScheduleIdx].desc}
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-light bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                    <Check className="w-3 h-3 text-emerald-600" /> Automated Reminder Fired
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-700 font-light bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60">
                    <Check className="w-3 h-3 text-blue-600" /> Synchronized with Cloud
                  </span>
                </div>
              </div>

              <div className="md:col-span-4 p-4 rounded-xl bg-white border border-slate-200/70 text-center space-y-2 shadow-2xs">
                <div className="text-[10px] font-mono text-blue-600 font-normal uppercase tracking-widest">
                  STATUS SNAPSHOT
                </div>
                <div className="text-sm font-normal font-mono text-slate-800">
                  {currentDog.name} // {SCHEDULE_STEPS[activeScheduleIdx].time}
                </div>
                <p className="text-xs text-slate-400 font-light">
                  All systems normal. Routine on schedule.
                </p>
                <Link
                  to="/records"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium pt-0.5"
                >
                  Explore Routine Timeline <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION 5: SIDE-BY-SIDE MATRIX (LEGACY VS WOOFY)                       */}
      {/* ========================================================================= */}
      <section className="py-18 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center max-w-lg mx-auto mb-12 space-y-2"
          >
            <motion.span
              variants={fadeInUp}
              className="text-xs font-mono font-normal text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60"
            >
              Why Woofy
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-2xl sm:text-3xl font-light tracking-tight text-slate-900">
              Why Pet Parents Choose Woofy
            </motion.h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden"
          >
            <div className="grid grid-cols-12 bg-slate-50/80 text-slate-500 text-xs font-mono py-3.5 px-6 border-b border-slate-200/70">
              <div className="col-span-5 sm:col-span-4 uppercase tracking-wider font-normal">Feature</div>
              <div className="col-span-3 sm:col-span-4 uppercase tracking-wider text-slate-400 font-normal">Traditional Care</div>
              <div className="col-span-4 sm:col-span-4 uppercase tracking-wider text-blue-600 font-normal">
                Woofy
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs sm:text-sm font-light">
              <div className="grid grid-cols-12 py-3.5 px-6 items-center hover:bg-slate-50/60 transition-colors">
                <div className="col-span-5 sm:col-span-4 font-normal text-slate-800">Lost Pet ID</div>
                <div className="col-span-3 sm:col-span-4 text-slate-400">Metal tag or scanner-only microchip</div>
                <div className="col-span-4 sm:col-span-4 text-emerald-600 font-normal flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Instant Phone QR + GPS Beacon
                </div>
              </div>

              <div className="grid grid-cols-12 py-3.5 px-6 items-center bg-slate-50/30 hover:bg-slate-50/60 transition-colors">
                <div className="col-span-5 sm:col-span-4 font-normal text-slate-800">Vaccine Records</div>
                <div className="col-span-3 sm:col-span-4 text-slate-400">Misplaced paper booklet</div>
                <div className="col-span-4 sm:col-span-4 text-emerald-600 font-normal flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  WSAVA Certified Cloud Passport
                </div>
              </div>

              <div className="grid grid-cols-12 py-3.5 px-6 items-center hover:bg-slate-50/60 transition-colors">
                <div className="col-span-5 sm:col-span-4 font-normal text-slate-800">Prescriptions &amp; Meds</div>
                <div className="col-span-3 sm:col-span-4 text-slate-400">Forgotten dates &amp; lost slips</div>
                <div className="col-span-4 sm:col-span-4 text-emerald-600 font-normal flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Dosage Timetable &amp; 90-Day Alarms
                </div>
              </div>

              <div className="grid grid-cols-12 py-3.5 px-6 items-center bg-slate-50/30 hover:bg-slate-50/60 transition-colors">
                <div className="col-span-5 sm:col-span-4 font-normal text-slate-800">Emergency Care</div>
                <div className="col-span-3 sm:col-span-4 text-slate-400">Panic searching outdated numbers</div>
                <div className="col-span-4 sm:col-span-4 text-emerald-600 font-normal flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Verified 24/7 Ambulance &amp; Clinic List
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SECTION 6: FAQ ACCORDION                                               */}
      {/* ========================================================================= */}
      <section className="py-18 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center max-w-lg mx-auto mb-12 space-y-2"
          >
            <motion.span
              variants={fadeInUp}
              className="text-xs font-mono font-normal text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60"
            >
              FAQ
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-2xl sm:text-3xl font-light tracking-tight text-slate-900">
              Questions &amp; Answers
            </motion.h2>
          </motion.div>

          <div className="space-y-2.5">
            {faqItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden transition-all hover:border-slate-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full text-left p-4 sm:p-4.5 flex items-center justify-between gap-4 font-normal text-sm text-slate-800 hover:text-blue-600 transition-colors"
                >
                  <span>{item.q}</span>
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      openFaq === idx ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-4 pt-0.5 text-xs sm:text-sm text-slate-500 leading-relaxed border-t border-slate-100 font-light"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. HIGH-IMPACT FINAL CTA                                                  */}
      {/* ========================================================================= */}
      <section className="py-18 bg-slate-50/60 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-500 p-7 sm:p-12 text-white shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-mono tracking-wider uppercase font-normal">
                  100% Free Lifetime Access
                </div>
                <h3 className="text-2xl sm:text-3xl font-light tracking-tight text-white leading-tight">
                  Give Your Dog the Lifetime Protection They Deserve.
                </h3>
                <p className="text-xs sm:text-sm text-blue-50/90 leading-relaxed font-light">
                  Join thousands of conscious pet parents who run their dog’s health, vaccinations, and safety through Woofy.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-medium text-xs sm:text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  Create Pet Profile Free
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                </Link>
                <Link
                  to="/services/rescue"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/15 hover:bg-white/20 text-white font-normal text-xs sm:text-sm border border-white/25 backdrop-blur-md transition-all"
                >
                  Emergency Helplines
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. BUSINESS INQUIRIES & OPERATIONS TERMINAL                                */}
      {/* ========================================================================= */}
      <section id="contact" className="py-18 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center space-y-2 mb-10"
          >
            <motion.span
              variants={fadeInUp}
              className="text-xs font-mono font-normal text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60"
            >
              Contact
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-2xl sm:text-3xl font-light tracking-tight text-slate-900">
              Connect with Woofy Operations
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xs text-slate-400 font-light">
              Quick inquiries for veterinary clinic partners, animal shelters, or feedback.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl bg-white p-5 sm:p-7 border border-slate-200/80 shadow-md"
          >
            {contactStatus && (
              <div
                className={`mb-5 p-3.5 rounded-xl text-xs font-mono ${
                  contactStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                    : 'bg-rose-50 text-rose-800 border border-rose-200/80'
                }`}
              >
                {contactStatus.text}
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-normal">
                  Select Affiliation
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Pet Parent', 'Vet Clinic', 'Rescue NGO', 'Partner'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setContactForm({ ...contactForm, role })}
                      className={`py-1.5 px-3 rounded-xl text-xs font-mono font-normal border transition-all ${
                        contactForm.role === role
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200/70 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-normal text-slate-600 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200/80 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white text-xs text-slate-700 placeholder:text-slate-400 font-light"
                  />
                </div>
                <div>
                  <label className="block text-xs font-normal text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="contact@domain.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200/80 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white text-xs text-slate-700 placeholder:text-slate-400 font-light"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-600 mb-1">Subject</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  placeholder="Clinic verification, Shelter directory listing, or Partnership"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200/80 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white text-xs text-slate-700 placeholder:text-slate-400 font-light"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-600 mb-1">Inquiry Details</label>
                <textarea
                  rows="3"
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="How can Woofy support your canine care or rescue network?"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200/80 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white text-xs text-slate-700 placeholder:text-slate-400 font-light"
                />
              </div>

              <button
                type="submit"
                disabled={contactSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-all disabled:opacity-50 hover:-translate-y-0.5"
              >
                <Send className="w-3.5 h-3.5 text-white" />
                {contactSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. REALISTIC MOBILE FINDER PREVIEW MODAL                                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showPhoneScan && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-sm rounded-[2.2rem] bg-slate-900 border-2 border-slate-700 shadow-xl p-4.5 text-slate-900 overflow-hidden"
            >
              {/* Phone Speaker Notch */}
              <div className="w-24 h-3.5 bg-slate-800 rounded-full mx-auto mb-3.5 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />
              </div>

              <button
                onClick={() => setShowPhoneScan(false)}
                className="absolute top-3.5 right-3.5 p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Mobile Screen Content */}
              <div className="bg-white rounded-xl p-3.5 space-y-3 text-left border border-slate-200">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="text-[10px] font-mono text-emerald-700 font-normal flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    INSTANT SCAN DETECTED
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">TAG: {currentDog.id}</span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={currentDog.image}
                    alt={currentDog.name}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">{currentDog.name}</h4>
                    <p className="text-xs text-slate-500 font-light">{currentDog.breed}</p>
                    <span className="inline-block mt-0.5 text-[9px] font-normal px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      STATUS: HOME SAFE
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-rose-50 border border-rose-200/70 text-[10px] text-rose-800 font-light">
                  Medical Notice: {currentDog.allergy}.
                </div>

                <div className="space-y-1.5 pt-0.5">
                  <a
                    href="tel:+919876543210"
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Phone className="w-3 h-3" />
                    Call Pet Parent
                  </a>

                  <button
                    onClick={() => alert(`Simulated GPS ping dispatched to ${currentDog.name}'s parent with live Google Maps pin!`)}
                    className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <MapPin className="w-3 h-3 text-white" />
                    Send GPS via WhatsApp
                  </button>
                </div>

                <p className="text-[9px] text-center text-slate-400 font-mono pt-0.5">
                  Protected by Woofy Universal Tag Resolver
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 10. FLOATING BACK TO TOP BUTTON                                           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 15 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            title="Back to top"
            className="fixed bottom-6 right-6 z-40 p-2.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center border border-white/40"
          >
            <ChevronUp className="w-4 h-4 stroke-[2]" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
