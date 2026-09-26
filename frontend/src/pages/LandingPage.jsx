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
    status: 'OPTIMAL VITALITY',
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
    status: 'OPTIMAL VITALITY',
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
    status: 'ATHLETIC PEAK',
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
    title: 'Morning Dose & Breakfast Ledger',
    desc: 'Automated notification logged: Breakfast served with verified daily oral dewormer intake.',
    metric: 'Dose Verified',
    icon: Pill,
    badge: 'Nutrition & Meds',
  },
  {
    time: '01:30 PM',
    title: 'Biometric Vitality & Hydration Check',
    desc: 'Midday activity telemetry synced. Water balance logged at 98% optimal corridor.',
    metric: 'Vitals Normal',
    icon: Activity,
    badge: 'Bio-Vitals',
  },
  {
    time: '06:00 PM',
    title: 'Outdoor Mesh & Smart Tag Active',
    desc: 'Collar QR beacon standby. Real-time emergency telephone masking ready for park walks.',
    metric: 'QR Resolver Ready',
    icon: QrCode,
    badge: 'Collar Mesh',
  },
  {
    time: '09:30 PM',
    title: 'Night Telemetry & Health Audit Sync',
    desc: 'Prescription slips archived in cloud. Tomorrow’s vaccination and medicine queues locked.',
    metric: 'Cloud Encrypted',
    icon: Lock,
    badge: 'Security Vault',
  },
];

// Animation presets for high scroll transitions
const fadeInUp = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const LandingPage = () => {
  // Active Interactive Dog Preset (default to bella who is the French Bulldog in yellow hoodie)
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
          text: 'Inquiry transmitted securely. Clinical operations will reach out within 24 hours.',
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
      q: 'What makes Woofy fundamentally different from traditional pet microchips or tags?',
      a: 'Traditional metal tags contain fixed engraved numbers that quickly wear out, while microchips require a vet with a specialized RFID scanner. Woofy Smart QR tags work universally on any smartphone camera in under 2 seconds, displaying live contact buttons, WhatsApp GPS coordinates, active medication needs, and severe allergy flags without needing any battery or app download.',
    },
    {
      q: 'Is Woofy 100% free for individual pet parents?',
      a: 'Yes. Woofy was built as an open life-saving pet health ecosystem. All core modules—including pet digital identification, printable collar QR sheets, WSAVA vaccination passports, and daily medication records—are permanently free with zero subscriptions or paywalls.',
    },
    {
      q: 'How does Woofy adhere to international WSAVA guidelines?',
      a: 'Our vaccine schedule engine automatically computes core and non-core canine protocols (such as DHPPiL 9-in-1, Anti-Rabies, and Leptospirosis) mapped against the World Small Animal Veterinary Association guidelines. The resulting digital passport is formatted for airline travel, boarding resorts, and clinical vet inspections.',
    },
    {
      q: 'How does the automated medication and deworming ledger function?',
      a: 'You can register regular oral drugs, antibiotics, or chronic condition therapies with specific meal schedules (e.g., Post-Breakfast, With Dinner). The system calculates recurring 3-month deworming intervals and stores timestamped audit logs along with uploaded doctor prescription slips.',
    },
    {
      q: 'Can veterinary hospitals and rescue NGOs integrate with the directory?',
      a: 'Yes. Woofy provides dedicated helpline nodes for animal welfare organizations, trauma ambulances, and 24/7 emergency clinics. Clinics can join the verified rescue registry to receive direct lost-pet and emergency triage escalations.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-800 selection:bg-blue-100 selection:text-blue-900 relative overflow-x-hidden font-sans">
      
      {/* ========================================================================= */}
      {/* 0. HIGH SCROLL PROGRESS BAR (BLUE -> LIGHT GREEN GRADIENT)                */}
      {/* ========================================================================= */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-emerald-400 z-50 origin-left shadow-xs"
        style={{ scaleX }}
      />

      {/* Subtle Ambient Background Gradients */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-sky-100/40 via-blue-50/20 to-transparent blur-3xl" />
        <div className="absolute top-[30%] -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-emerald-100/30 via-teal-50/20 to-transparent blur-3xl" />
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (EXACT MATCH WITH SCREENSHOTS 3 & 4)                      */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Hero Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="lg:col-span-7 space-y-7 text-left"
            >
              {/* Badge: ✦ All-in-One Pet Health & Lifestyle Care */}
              <motion.div variants={fadeInUp} className="inline-flex">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-400 border-dashed bg-white/90 shadow-2xs">
                  <span className="text-amber-500 font-bold text-sm">✦</span>
                  <span className="text-blue-600 font-semibold text-xs tracking-wide">
                    All-in-One Pet Health &amp; Lifestyle Care
                  </span>
                </div>
              </motion.div>

              {/* Main Headline with Hand-drawn Underline on "Care" */}
              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-6xl lg:text-[4.2rem] font-black tracking-tight text-slate-900 leading-[1.12]"
              >
                Uncompromising{' '}
                <span className="relative inline-block text-blue-600">
                  Care
                  {/* Curved Orange Underline Squiggle */}
                  <svg
                    className="absolute -bottom-2 sm:-bottom-3 left-0 w-full overflow-visible"
                    viewBox="0 0 100 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 13 C 25 18, 70 8, 98 11"
                      stroke="#f97316"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>{' '}
                <br className="hidden sm:inline" />
                for Your Best Companion.
              </motion.h1>

              {/* Subtext */}
              <motion.p
                variants={fadeInUp}
                className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed"
              >
                Track daily health records, attach medicine prescriptions, discover 24/7 verified pet
                hospitals in your city, and connect with emergency rescue NGOs — all in one modern platform.
              </motion.p>

              {/* CTA Action Buttons */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap items-center gap-4 pt-1"
              >
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <a
                  href="#services"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-xs transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Compass className="w-4 h-4 text-slate-700" />
                  Explore Platform
                </a>
              </motion.div>

              {/* Social Proof Rating */}
              <motion.div
                variants={fadeInUp}
                className="pt-2 flex flex-wrap items-center gap-4"
              >
                {/* 4 Overlapping Avatar Circles */}
                <div className="flex -space-x-2.5 overflow-hidden">
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                    alt="User"
                  />
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                    alt="User"
                  />
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
                    alt="User"
                  />
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80"
                    alt="User"
                  />
                </div>

                {/* Stars and Text */}
                <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <div className="flex text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <span className="font-bold text-slate-800">4.9/5</span>
                  <span className="text-slate-500 font-medium">from 2,500+ happy pet parents</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column: Hero Visual with French Bulldog & 2 Floating Badges */}
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative flex justify-center lg:justify-end"
            >
              {/* Outer Wrapper for Image and Floating Cards */}
              <div className="relative w-full max-w-[480px]">
                
                {/* Main Dog Card Container */}
                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl bg-[#5293b2] aspect-4/5 w-full relative">
                  <img
                    src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=85"
                    alt="French Bulldog in Yellow Hoodie"
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                {/* Floating Card 1: Top-Left "Verified Platform" */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-4 -left-3 sm:-top-6 sm:-left-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xl border border-slate-100/90 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left pr-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                      Verified Platform
                    </h4>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
                      100% authentic hospital data
                    </p>
                  </div>
                </motion.div>

                {/* Floating Card 2: Bottom-Right "Health & Growth" */}
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute -bottom-4 -right-3 sm:-bottom-6 sm:-right-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xl border border-slate-100/90 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left pr-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                      Health &amp; Growth
                    </h4>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
                      Active medical records logged
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SECTION 2: EVERYTHING YOUR PET NEEDS, SIMPLIFIED. (SCREENSHOTS 1 & 2)  */}
      {/* ========================================================================= */}
      <section id="services" className="py-20 lg:py-24 bg-white border-t border-slate-100 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header with Scroll Animation */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto mb-16 space-y-3"
          >
            {/* PLATFORM FEATURES Pill Badge */}
            <motion.div variants={fadeInUp}>
              <span className="bg-blue-50 text-blue-600 font-bold text-xs uppercase tracking-wider px-4 py-1.5 rounded-full border border-blue-100 inline-block shadow-2xs">
                PLATFORM FEATURES
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900"
            >
              Everything Your Pet Needs, Simplified.
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              variants={fadeInUp}
              className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
            >
              Four specialized services designed to give your furry family members the longest, happiest,
              and healthiest life possible.
            </motion.p>
          </motion.div>

          {/* 4 Feature Cards Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Card 1: Track Health Records (Blue Stripe) */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white rounded-3xl p-7 border border-slate-100 border-t-4 border-t-blue-600 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">
                  Track Health Records
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal mb-6">
                  Log vaccinations, surgery dates, allergy lists, medicine routines, weight progress,
                  and attach doctor prescriptions directly to each record.
                </p>
              </div>

              <Link
                to="/records"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 hover:gap-2.5 transition-all group"
              >
                <span>Start Health Tracking</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {/* Card 2: Verified Pet Hospitals (Orange Stripe) */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white rounded-3xl p-7 border border-slate-100 border-t-4 border-t-orange-500 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">
                  Verified Pet Hospitals
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal mb-6">
                  Auto-detect your location and discover verified veterinary clinics and 24/7 emergency
                  care centers near you with direct phone call and Google Maps directions.
                </p>
              </div>

              <Link
                to="/services/rescue"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 hover:gap-2.5 transition-all group"
              >
                <span>Find Hospitals</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {/* Card 3: Rescue NGOs & Helplines (Green Stripe) */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white rounded-3xl p-7 border border-slate-100 border-t-4 border-t-emerald-500 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">
                  Rescue NGOs &amp; Helplines
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal mb-6">
                  Quickly contact certified animal rescue NGOs, stray ambulances, and animal shelter teams
                  for emergency assistance or adoption opportunities.
                </p>
              </div>

              <Link
                to="/services/rescue"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:gap-2.5 transition-all group"
              >
                <span>Find Rescue NGOs</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {/* Card 4: Pet Essentials Shop (Purple Stripe) */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white rounded-3xl p-7 border border-slate-100 border-t-4 border-t-purple-500 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">
                  Pet Essentials Shop
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal mb-6">
                  Browse verified nutrition kibbles, grooming shampoos, tough chew toys, and wellness
                  supplements curated specifically for Indian breeds and climate.
                </p>
              </div>

              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-purple-600 hover:text-purple-700 hover:gap-2.5 transition-all group"
              >
                <span>Browse Pet Store</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION 3: WHY US / SMART QR COLLAR TAG & TELEMETRY HUD                 */}
      {/* ========================================================================= */}
      <section id="why-us" className="py-20 lg:py-24 bg-slate-50/60 border-t border-slate-100 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
          >
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-blue-700 uppercase tracking-widest mb-1.5 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                <Radio className="w-3.5 h-3.5 animate-pulse text-blue-600" />
                SMART COLLAR &amp; VITAL TELEMETRY
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
                Real-Time Health &amp; Collar Mesh for{' '}
                <span className="text-blue-600">{currentDog.name}</span>
              </h2>
            </div>

            {/* Profile Quick Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono font-bold">SELECT PROFILE:</span>
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                {Object.keys(DOG_PRESETS).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveDogKey(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      activeDogKey === key
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
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
              <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-5 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={currentDog.image}
                      alt={currentDog.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-400 shadow-md"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">{currentDog.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {currentDog.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{currentDog.breed} • {currentDog.age}</p>
                    <span className="font-mono text-[10px] text-blue-700 font-bold">TAG ID: {currentDog.id}</span>
                  </div>
                </div>

                {/* Collar Tag Physical Simulation */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center relative overflow-hidden">
                  <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mb-2" />
                  <div className="p-3 rounded-xl bg-white text-slate-900 max-w-[200px] mx-auto shadow-sm border border-slate-200/80">
                    <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                      <span className="text-[9px] font-black text-slate-800">WOFFY SAFE TAG</span>
                      <span className="text-[8px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">NFC+QR</span>
                    </div>
                    <div className="my-2 flex justify-center relative">
                      <QrCode className="w-24 h-24 text-slate-900" />
                      <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 animate-scan-beam rounded-full shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
                    </div>
                    <div className="text-[8px] font-mono text-slate-600 font-bold uppercase">
                      SCAN TO RESCUE // {currentDog.id}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                      onClick={() => setShowPhoneScan(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Test Finder View
                    </button>
                    <button
                      onClick={() => setIsLostMode(!isLostMode)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                        isLostMode
                          ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      {isLostMode ? 'SOS ACTIVE' : 'TEST LOST SOS'}
                    </button>
                  </div>
                </div>

                {/* Microchip & Diet Snapshot */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-semibold">CHIP REGISTERED</span>
                    <span className="text-slate-800 font-bold">{currentDog.microchip}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <span className="text-[10px] text-emerald-700 block font-semibold">TARGET WEIGHT</span>
                    <span className="text-emerald-700 font-bold">{currentDog.weight} / {currentDog.targetWeight}</span>
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
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono text-[10px] uppercase font-bold text-slate-600">Resting Pulse</span>
                    <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
                  </div>
                  <div className="text-2xl font-black font-mono text-slate-900">{currentDog.pulse}</div>
                  <span className="text-[10px] text-emerald-600 font-mono font-semibold">Normal Canine Baseline</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono text-[10px] uppercase font-bold text-slate-600">Core Temp</span>
                    <Activity className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black font-mono text-slate-900">{currentDog.temp}</div>
                  <span className="text-[10px] text-emerald-600 font-mono font-semibold">Optimal Thermal Range</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono text-[10px] uppercase font-bold text-slate-600">Deworming Cycle</span>
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-lg font-black font-mono text-blue-700">{currentDog.dewormCycle}</div>
                  <span className="text-[10px] text-slate-500 font-mono font-medium">WSAVA 90-Day Cadence</span>
                </div>
              </div>

              {/* Medication & WSAVA Passport Live Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Clinical Meds Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-700 flex items-center gap-1.5 uppercase">
                      <Pill className="w-3.5 h-3.5 text-emerald-600" />
                      Prescription Ledger
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      VERIFIED DOSE
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{currentDog.primaryMed}</p>
                          <span className="text-[11px] text-slate-500">{currentDog.medStatus}</span>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span><strong>Allergy Alert:</strong> {currentDog.allergy}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-xs">
                    <span className="text-slate-500">Doctor prescription cloud sync active.</span>
                    <Link to="/records" className="text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center gap-1">
                      Full History <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* WSAVA Passport Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-700 flex items-center gap-1.5 uppercase">
                      <Syringe className="w-3.5 h-3.5 text-blue-600" />
                      WSAVA Digital Passport
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                      OFFICIAL CERTIFIED
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{currentDog.vaccine}</p>
                          <span className="text-[11px] text-slate-500">{currentDog.vaccineExpiry}</span>
                        </div>
                        <Award className="w-4 h-4 text-blue-600 shrink-0" />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800 flex items-center justify-between">
                      <span className="font-medium">Travel &amp; Airline Boarding Clearance</span>
                      <span className="font-mono text-emerald-700 font-bold">READY</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-xs">
                    <span className="text-slate-500">Ready for instant QR scanning by vets.</span>
                    <Link to="/vaccinations" className="text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1">
                      Passport Hub <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Action Ribbon */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-slate-700 font-medium">
                    All medical logs and owner contacts are protected with zero-knowledge AES-256 encryption.
                  </span>
                </div>
                <Link
                  to="/pet-profiles"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs whitespace-nowrap"
                >
                  Configure My Dog's Hub
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION 4: 24-HOUR CIRCADIAN CARE TIMELINE                              */}
      {/* ========================================================================= */}
      <section className="py-20 bg-white border-t border-slate-100 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center max-w-2xl mx-auto mb-12 space-y-2"
          >
            <motion.span
              variants={fadeInUp}
              className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200"
            >
              CONTINUOUS 24-HOUR GOVERNANCE
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              A Day in the Life with Woofy
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-sm text-slate-500">
              Click any hour below to experience how Woofy autonomously safeguards your pet throughout the day.
            </motion.p>
          </motion.div>

          {/* Time Scrubber Selector */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
          >
            {SCHEDULE_STEPS.map((step, idx) => (
              <motion.button
                key={idx}
                variants={fadeInUp}
                onClick={() => setActiveScheduleIdx(idx)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  activeScheduleIdx === idx
                    ? 'bg-blue-50/70 border-blue-500 text-slate-900 shadow-md shadow-blue-500/10 scale-102'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-black text-blue-600">{step.time}</span>
                  <step.icon
                    className={`w-4 h-4 ${activeScheduleIdx === idx ? 'text-blue-600' : 'text-slate-400'}`}
                  />
                </div>
                <div className="text-xs font-bold truncate text-slate-800">{step.title}</div>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">{step.badge}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Active Step Detailed Showcase Display */}
          <motion.div
            key={activeScheduleIdx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full font-mono text-xs font-black bg-blue-600 text-white shadow-2xs">
                    {SCHEDULE_STEPS[activeScheduleIdx].time}
                  </span>
                  <span className="text-xs font-mono text-blue-800 font-bold uppercase tracking-wider bg-blue-100/70 px-2 py-0.5 rounded">
                    {SCHEDULE_STEPS[activeScheduleIdx].metric}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {SCHEDULE_STEPS[activeScheduleIdx].title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {SCHEDULE_STEPS[activeScheduleIdx].desc}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Automated Reminder Fired
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    <Check className="w-3.5 h-3.5 text-blue-600" /> Synchronized with Cloud
                  </span>
                </div>
              </div>

              <div className="md:col-span-4 p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-2.5 shadow-sm">
                <div className="text-[10px] font-mono text-blue-600 font-bold uppercase tracking-widest">
                  TELEMETRY SNAPSHOT
                </div>
                <div className="text-base font-bold font-mono text-slate-900">
                  {currentDog.name} // {SCHEDULE_STEPS[activeScheduleIdx].time}
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  All systems green. No emergency anomalies detected.
                </p>
                <Link
                  to="/records"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-bold pt-1"
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
      <section className="py-20 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center max-w-xl mx-auto mb-14 space-y-2"
          >
            <motion.span
              variants={fadeInUp}
              className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200"
            >
              PARADIGM SHIFT
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              Why Pet Parents Choose Woofy
            </motion.h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden"
          >
            <div className="grid grid-cols-12 bg-slate-50 text-slate-700 text-xs font-mono py-4 px-6 border-b border-slate-200">
              <div className="col-span-5 sm:col-span-4 uppercase tracking-wider font-bold">Dimension</div>
              <div className="col-span-3 sm:col-span-4 uppercase tracking-wider text-slate-400 font-semibold">Legacy Pet Care</div>
              <div className="col-span-4 sm:col-span-4 uppercase tracking-wider text-blue-600 font-bold">
                Woofy Platform
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs sm:text-sm font-medium">
              <div className="grid grid-cols-12 py-4 px-6 items-center hover:bg-slate-50/60 transition-colors">
                <div className="col-span-5 sm:col-span-4 font-bold text-slate-900">Lost Pet Identification</div>
                <div className="col-span-3 sm:col-span-4 text-slate-400">Static metal tag or RFID needing clinic scanner</div>
                <div className="col-span-4 sm:col-span-4 text-emerald-600 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Universal Phone QR + WhatsApp GPS Beacon
                </div>
              </div>

              <div className="grid grid-cols-12 py-4 px-6 items-center bg-slate-50/40 hover:bg-slate-50/60 transition-colors">
                <div className="col-span-5 sm:col-span-4 font-bold text-slate-900">Vaccine Records</div>
                <div className="col-span-3 sm:col-span-4 text-slate-400">Easily misplaced or coffee-stained paper card</div>
                <div className="col-span-4 sm:col-span-4 text-emerald-600 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  WSAVA Certified Cloud Passport with QR Audit
                </div>
              </div>

              <div className="grid grid-cols-12 py-4 px-6 items-center hover:bg-slate-50/60 transition-colors">
                <div className="col-span-5 sm:col-span-4 font-bold text-slate-900">Prescriptions &amp; Deworming</div>
                <div className="col-span-3 sm:col-span-4 text-slate-400">Forgotten dates and missed booster doses</div>
                <div className="col-span-4 sm:col-span-4 text-emerald-600 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Precision Dosage Engine &amp; Auto 90-Day Alarms
                </div>
              </div>

              <div className="grid grid-cols-12 py-4 px-6 items-center bg-slate-50/40 hover:bg-slate-50/60 transition-colors">
                <div className="col-span-5 sm:col-span-4 font-bold text-slate-900">Emergency Coordination</div>
                <div className="col-span-3 sm:col-span-4 text-slate-400">Panic googling outdated vet clinic numbers</div>
                <div className="col-span-4 sm:col-span-4 text-emerald-600 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Verified 24/7 Ambulance &amp; Shelter Directory
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SECTION 6: FAQ ACCORDION                                               */}
      {/* ========================================================================= */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center max-w-xl mx-auto mb-14 space-y-2"
          >
            <motion.span
              variants={fadeInUp}
              className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200"
            >
              FREQUENTLY ASKED QUESTIONS
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              Questions &amp; Direct Answers
            </motion.h2>
          </motion.div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden transition-all hover:border-blue-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors"
                >
                  <span>{item.q}</span>
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                      openFaq === idx ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100"
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
      <section className="py-20 bg-slate-50/60 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="rounded-3xl bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-500 p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-mono tracking-wider uppercase font-bold">
                  Zero Subscriptions • 100% Free Lifetime Access
                </div>
                <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  Give Your Dog the Lifetime Protection They Deserve.
                </h3>
                <p className="text-xs sm:text-sm text-blue-50 leading-relaxed">
                  Join thousands of conscious pet parents who run their dog’s health, vaccinations, and safety
                  through Woofy. Ready in under 60 seconds.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs sm:text-sm shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                >
                  Create Pet Profile Free
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                </Link>
                <Link
                  to="/services/rescue"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm border border-white/30 backdrop-blur-md transition-all"
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
      <section id="contact" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center space-y-2 mb-12"
          >
            <motion.span
              variants={fadeInUp}
              className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200"
            >
              DISPATCH TERMINAL
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Connect with Woofy Operations
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xs text-slate-500">
              For veterinary clinic partners, animal shelters, corporate CSR initiatives, or general feedback.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-xl"
          >
            {contactStatus && (
              <div
                className={`mb-6 p-4 rounded-2xl text-xs font-mono font-bold ${
                  contactStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {contactStatus.text}
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2 font-bold">
                  Select Affiliation
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Pet Parent', 'Vet Clinic', 'Rescue NGO', 'Partner'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setContactForm({ ...contactForm, role })}
                      className={`py-2 px-3 rounded-xl text-xs font-mono font-bold border transition-all ${
                        contactForm.role === role
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-700 font-bold mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Dr. Roy or Pet Parent"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white text-xs text-slate-800 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-700 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="contact@domain.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white text-xs text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-700 font-bold mb-1">Subject</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  placeholder="Clinic verification, Shelter directory listing, or Partnership"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white text-xs text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-700 font-bold mb-1">Inquiry Details</label>
                <textarea
                  rows="4"
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="How can Woofy support your canine care or rescue network?"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white text-xs text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={contactSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 hover:-translate-y-0.5"
              >
                <Send className="w-3.5 h-3.5 text-white" />
                {contactSubmitting ? 'Transmitting...' : 'Dispatch Inquiry'}
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
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-sm rounded-[2.5rem] bg-slate-900 border-4 border-slate-700 shadow-2xl p-5 text-slate-900 overflow-hidden"
            >
              {/* Phone Speaker Notch */}
              <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-950" />
              </div>

              <button
                onClick={() => setShowPhoneScan(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Mobile Screen Content */}
              <div className="bg-white rounded-2xl p-4 space-y-3.5 text-left border border-slate-200 shadow-inner">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-mono text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    INSTANT SCAN DETECTED
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">TAG: {currentDog.id}</span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={currentDog.image}
                    alt={currentDog.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-base font-black text-slate-900">{currentDog.name}</h4>
                    <p className="text-xs text-slate-600">{currentDog.breed}</p>
                    <span className="inline-block mt-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      STATUS: HOME SAFE
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[10px] text-rose-800">
                  <strong>Medical Notice:</strong> {currentDog.allergy}.
                </div>

                <div className="space-y-2 pt-1">
                  <a
                    href="tel:+919876543210"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Pet Parent Now
                  </a>

                  <button
                    onClick={() => alert(`Simulated GPS ping dispatched to ${currentDog.name}'s parent with live Google Maps pin!`)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
                  >
                    <MapPin className="w-3.5 h-3.5 text-white" />
                    Send My GPS via WhatsApp
                  </button>
                </div>

                <p className="text-[9px] text-center text-slate-400 font-mono pt-1">
                  Protected by Woofy Universal Emergency Resolver
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
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 20 }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            title="Back to top"
            className="fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/30 flex items-center justify-center border border-white/40"
          >
            <ChevronUp className="w-5 h-5 stroke-[2.5]" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
