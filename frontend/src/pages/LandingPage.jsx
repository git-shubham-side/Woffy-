import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  QrCode,
  Syringe,
  Activity,
  PhoneCall,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Phone,
  Printer,
  ChevronRight,
  Send,
  Sparkles,
  Pill,
  Scale,
  Utensils,
  Calendar,
  Stethoscope,
  Heart,
  Clock,
  FileText,
  Check,
} from 'lucide-react';
import api from '../services/api';

/* ========================================================================= */
/* FRIENDLY VECTOR PUPPY & STAMP STICKERS (CLEAN, NO EMOJIS)                 */
/* ========================================================================= */
const PuppySticker = ({ className = 'w-16 h-16' }) => (
  <svg
    viewBox="0 0 100 100"
    className={`${className} drop-shadow-md transition-transform hover:scale-110 duration-300`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Left Floppy Ear */}
    <path
      d="M18 32C12 42 10 60 22 68C26 71 32 66 30 58C28 50 26 40 22 32Z"
      fill="#F59E0B"
      stroke="#FFFFFF"
      strokeWidth="3.5"
    />
    {/* Right Floppy Ear */}
    <path
      d="M82 32C88 42 90 60 78 68C74 71 68 66 70 58C72 50 74 40 78 32Z"
      fill="#F59E0B"
      stroke="#FFFFFF"
      strokeWidth="3.5"
    />
    {/* Head Circle */}
    <circle cx="50" cy="52" r="32" fill="#FBBF24" stroke="#FFFFFF" strokeWidth="4" />
    {/* Cute Forehead Spot */}
    <path d="M44 32C44 24 56 24 56 32C56 40 44 40 44 32Z" fill="#FEF3C7" />
    {/* Left Eye */}
    <ellipse cx="38" cy="48" rx="4.5" ry="5.5" fill="#0F172A" />
    <circle cx="36.5" cy="46" r="1.5" fill="#FFFFFF" />
    {/* Right Eye */}
    <ellipse cx="62" cy="48" rx="4.5" ry="5.5" fill="#0F172A" />
    <circle cx="60.5" cy="46" r="1.5" fill="#FFFFFF" />
    {/* Snout */}
    <ellipse cx="50" cy="62" rx="14" ry="11" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1.5" />
    {/* Nose */}
    <path
      d="M45 57C45 55 55 55 55 57C55 61.5 45 61.5 45 57Z"
      fill="#0F172A"
    />
    {/* Smile */}
    <path
      d="M46 64C48 67 52 67 54 64"
      stroke="#0F172A"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Cheerful Pink Tongue */}
    <path
      d="M48 65C48 68.5 52 68.5 52 65"
      fill="#FB7185"
    />
  </svg>
);

const PawBadgeSticker = ({ className = 'w-10 h-10', color = '#0284C7' }) => (
  <svg
    viewBox="0 0 100 100"
    className={`${className} drop-shadow-xs transition-transform hover:rotate-12 duration-200`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="50" cy="65" rx="18" ry="14" fill={color} />
    <circle cx="30" cy="42" r="8" fill={color} />
    <circle cx="43" cy="32" r="8" fill={color} />
    <circle cx="57" cy="32" r="8" fill={color} />
    <circle cx="70" cy="42" r="8" fill={color} />
  </svg>
);

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('medicine');
  const [isSosActive, setIsSosActive] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactStatus, setContactStatus] = useState(null);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactStatus(null);
    try {
      const res = await api.post('/api/contact', contactForm);
      if (res.data && res.data.success) {
        setContactStatus({
          type: 'success',
          text: 'Thank you. Your message has been sent successfully.',
        });
        setContactForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setContactStatus({ type: 'error', text: res.data.error || 'Failed to send message.' });
      }
    } catch (err) {
      setContactStatus({
        type: 'error',
        text: err.response?.data?.error || 'Unable to submit at this time.',
      });
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafbfc] text-slate-800 antialiased selection:bg-sky-500 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: COLORFUL, FRIENDLY, PUPPY STICKERS & LEAST TEXT          */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24">
        {/* Playful Multi-Color Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[350px] bg-gradient-to-b from-sky-200/50 via-cyan-100/30 to-transparent blur-3xl opacity-80"></div>
          <div className="absolute top-10 right-1/4 w-[450px] h-[350px] bg-gradient-to-b from-amber-200/40 via-orange-100/20 to-transparent blur-3xl opacity-75"></div>
          <div className="absolute top-1/2 left-10 w-[350px] h-[350px] bg-emerald-100/40 blur-3xl rounded-full"></div>
          <div className="absolute top-1/2 right-10 w-[350px] h-[350px] bg-purple-100/40 blur-3xl rounded-full"></div>
          {/* Subtle Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c708_1px,transparent_1px),linear-gradient(to_bottom,#0284c708_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 relative">
            {/* Playful Floating Puppy Sticker Top-Left */}
            <div className="hidden sm:block absolute -top-4 -left-12 -rotate-12 animate-float-gentle">
              <PuppySticker className="w-20 h-20" />
            </div>

            {/* Playful Floating Paw Badge Top-Right */}
            <div className="hidden sm:block absolute -top-2 -right-10 rotate-12 animate-float-gentle">
              <div className="p-2 rounded-2xl bg-white border border-amber-200/80 shadow-md flex items-center gap-1.5">
                <PawBadgeSticker className="w-6 h-6" color="#F59E0B" />
                <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider">
                  Care Certified
                </span>
              </div>
            </div>

            {/* Colorful Hero Capsule */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-sky-200/80 shadow-xs backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[11px] font-semibold text-sky-800 uppercase tracking-wider">
                Full-Spectrum Pet Health & Safety System
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-[11px] font-medium text-emerald-700">100% Free</span>
            </div>

            {/* Clean, Impactful Headline - Less Bold, Refined */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight leading-tight">
              Care, Track & Protect{' '}
              <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Every Paw Step
              </span>
            </h1>

            {/* Minimalist Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto font-normal leading-relaxed">
              From daily medicine schedules and weight progression charts to WSAVA vaccine passports
              and instant emergency collar QR tags.
            </p>

            {/* Colorful Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-md shadow-slate-900/15 transition-all duration-200 hover:-translate-y-0.5"
              >
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                Start Free Profile
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                to="/services/rescue"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-200 shadow-2xs transition-all duration-200"
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-500" />
                24/7 Helplines
              </Link>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. INTERACTIVE 4-WAY FEATURE SIMULATOR (IMAGE & UI DRIVEN)                */}
          {/* ========================================================================= */}
          <div className="mt-12 max-w-4xl mx-auto">
            {/* Colorful Feature Switcher Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <button
                onClick={() => setActiveTab('medicine')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === 'medicine'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                Medicine & Deworming
              </button>

              <button
                onClick={() => setActiveTab('weight')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === 'weight'
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/20'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                Weight & Growth
              </button>

              <button
                onClick={() => setActiveTab('tag')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === 'tag'
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/20'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                Smart Collar QR
              </button>

              <button
                onClick={() => setActiveTab('vaccine')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === 'vaccine'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <Syringe className="w-3.5 h-3.5" />
                Vaccine Passport
              </button>
            </div>

            {/* Interactive Screen Display Box */}
            <div className="rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/80 p-5 sm:p-7 shadow-[0_16px_45px_-15px_rgba(2,132,199,0.09)]">
              {/* TAB 1: MEDICINE & DEWORMING TRACKER */}
              {activeTab === 'medicine' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Left: Simulated Medicine Card */}
                  <div className="md:col-span-6 space-y-3">
                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                            <Pill className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-slate-900">
                              Today's Medication Schedule
                            </h4>
                            <span className="text-[10px] text-emerald-700 font-medium">
                              Rocky • 2 Scheduled Today
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                          Active Course
                        </span>
                      </div>

                      {/* Pill Rows */}
                      <div className="space-y-2">
                        <div className="p-2.5 rounded-xl bg-white border border-emerald-100 flex items-center justify-between text-xs shadow-2xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                              <Check className="w-3 h-3" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">Drontal Plus (Deworming)</p>
                              <span className="text-[10px] text-slate-400">1 Tablet • After Meal (09:00 AM)</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-medium text-emerald-700">Taken</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-amber-200 flex items-center justify-between text-xs shadow-2xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[10px]">
                              <Clock className="w-3 h-3" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">Omega-3 Fish Oil Drops</p>
                              <span className="text-[10px] text-slate-400">2.5 ml • Dinner (08:00 PM)</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-medium">
                            Due Soon
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Vet & Prescription Photo Sync Visual */}
                  <div className="md:col-span-6 space-y-3">
                    <div className="rounded-2xl overflow-hidden border border-slate-200 relative group">
                      <img
                        src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=600&q=80"
                        alt="Veterinary Medication Check"
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-xs text-[10px] font-medium text-slate-800 shadow-xs flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-emerald-600" />
                        Prescription Slip Cloud Sync
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-normal">
                        Never miss a dose or deworming cycle.
                      </span>
                      <Link
                        to="/records"
                        className="font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                      >
                        Explore Health Logs <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: WEIGHT & GROWTH MILESTONES */}
              {activeTab === 'weight' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-6 p-4 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                          <Scale className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-slate-900">
                            Puppy Growth Progression
                          </h4>
                          <span className="text-[10px] text-purple-700 font-medium">
                            Target: Healthy Adult Range
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-semibold">
                        +1.2 kg gain
                      </span>
                    </div>

                    {/* Visual Growth Chart */}
                    <div className="flex items-end justify-between gap-3 h-28 pt-4 border-b border-purple-200/60">
                      <div className="w-full bg-purple-100 rounded-t h-[35%] flex items-end justify-center pb-1 text-[9px] font-mono text-purple-800">
                        4.2kg
                      </div>
                      <div className="w-full bg-purple-200 rounded-t h-[55%] flex items-end justify-center pb-1 text-[9px] font-mono text-purple-800">
                        12.5kg
                      </div>
                      <div className="w-full bg-purple-300 rounded-t h-[75%] flex items-end justify-center pb-1 text-[9px] font-mono text-purple-900">
                        21.0kg
                      </div>
                      <div className="w-full bg-purple-600 rounded-t h-[92%] flex items-end justify-center pb-1 text-[9px] font-mono text-white font-semibold">
                        28.4kg
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Puppy (2m)</span>
                      <span>Junior (6m)</span>
                      <span>Young (1y)</span>
                      <span>Adult Current</span>
                    </div>
                  </div>

                  <div className="md:col-span-6 space-y-3">
                    <div className="rounded-2xl overflow-hidden border border-slate-200 relative group">
                      <img
                        src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80"
                        alt="Happy Healthy Dog Running"
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[9px] font-semibold text-purple-800 shadow-2xs">
                        Healthy Vitals
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-normal">
                        Catch undernutrition or sudden weight loss early.
                      </span>
                      <Link
                        to="/records"
                        className="font-semibold text-purple-700 hover:text-purple-800 inline-flex items-center gap-1"
                      >
                        Track Weight <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SMART COLLAR QR TAG & SCANNER BEAM */}
              {activeTab === 'tag' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-6 relative">
                    <div className="relative rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 bg-slate-100 group">
                      <img
                        src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"
                        alt="Dog with Smart Collar Tag"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Floating QR Tag with Laser Scanning Beam */}
                      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md p-2 rounded-xl border border-sky-200 shadow-lg animate-float-gentle">
                        <div className="relative w-14 h-14 flex items-center justify-center overflow-hidden rounded-lg bg-slate-50 border border-slate-200">
                          <QrCode className="w-12 h-12 text-slate-800" />
                          <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-sky-500 to-transparent shadow-[0_0_8px_#0284c7] animate-scan-beam"></div>
                        </div>
                        <span className="block text-[8px] font-mono text-center text-slate-500 mt-1 font-medium">
                          Scan with Phone
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-6 space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider">
                        Finder Instant View
                      </span>
                      <button
                        onClick={() => setIsSosActive(!isSosActive)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                          isSosActive
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {isSosActive ? 'SOS Mode Active' : 'Toggle Lost SOS'}
                      </button>
                    </div>

                    <div
                      className={`p-3.5 rounded-xl border transition-all duration-300 ${
                        isSosActive
                          ? 'bg-red-50/50 border-red-200 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 pb-2.5 border-b border-slate-200/60">
                        <div className="w-9 h-9 rounded-lg bg-sky-500 text-white flex items-center justify-center font-semibold text-xs shadow-2xs">
                          WF
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-xs sm:text-sm text-slate-900">Rocky</h4>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                                isSosActive
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isSosActive ? 'Lost Dog Alert' : 'Safe at Home'}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400">
                            Tag: WF-ROCKY-7821
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-2.5">
                        <div className="p-2 rounded-lg bg-white border border-slate-200/80 text-center">
                          <Phone className="w-3 h-3 text-emerald-600 mx-auto mb-0.5" />
                          <span className="block text-[10px] font-semibold text-slate-800">
                            Call Parent
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200/80 text-center">
                          <MapPin className="w-3 h-3 text-sky-600 mx-auto mb-0.5" />
                          <span className="block text-[10px] font-semibold text-slate-800">
                            Send GPS
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: WSAVA VACCINE PASSPORT */}
              {activeTab === 'vaccine' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-6 p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 shadow-xs space-y-2.5">
                    <div className="flex justify-between items-center pb-2 border-b border-blue-200/60">
                      <div>
                        <span className="text-[10px] font-mono text-blue-700 uppercase">
                          WSAVA International
                        </span>
                        <h4 className="text-xs font-semibold text-slate-900">
                          Digital Vaccine Passport
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Official Certified
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between p-2 rounded-lg bg-white border border-blue-100">
                        <span className="text-slate-600 font-normal">Puppy DP & MegaVac 9-in-1</span>
                        <span className="text-emerald-700 font-medium">Completed</span>
                      </div>
                      <div className="flex justify-between p-2 rounded-lg bg-white border border-amber-200">
                        <span className="text-slate-600 font-normal">Anti-Rabies Booster</span>
                        <span className="text-amber-700 font-medium">Due in 14 days</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-6 space-y-3">
                    <div className="rounded-2xl overflow-hidden border border-slate-200">
                      <img
                        src="https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=600&q=80"
                        alt="Resting Protected Puppy"
                        className="w-full h-36 object-cover"
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-normal">
                        Printable passport ready for travel & boarding.
                      </span>
                      <Link
                        to="/vaccinations"
                        className="font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
                      >
                        Vaccine Hub <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. VISUAL FEATURE CARDS (COVERING ALL CAPABILITIES, MINIMAL TEXT)         */}
      {/* ========================================================================= */}
      <section className="py-16 bg-white border-y border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-1">
            <span className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider">
              Comprehensive Ecosystem
            </span>
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
              More Than Just a Tag: Total Pet Health
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Medicine & Deworming */}
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/20 p-5 hover:border-emerald-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Pill className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-medium">
                    Daily Routine
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-slate-900">
                  Medicine & Deworming Journal
                </h3>
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  Log oral medicines, eye drops, allergy pills, and 3-month deworming cycles with dosage timestamps.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-100/80">
                <Link
                  to="/records"
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                >
                  Manage Medications <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Card 2: Weight & Growth Tracker */}
            <div className="rounded-2xl border border-purple-200/80 bg-purple-50/20 p-5 hover:border-purple-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Scale className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-medium">
                    Growth Trends
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-slate-900">
                  Weight Progression & Vitals
                </h3>
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  Track weekly weight gains from puppyhood to adult weight. Monitor health patterns to catch issues early.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-purple-100/80">
                <Link
                  to="/records"
                  className="text-xs font-semibold text-purple-700 hover:text-purple-800 inline-flex items-center gap-1"
                >
                  View Weight Curves <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Card 3: Smart Collar QR Tag */}
            <div className="rounded-2xl border border-sky-200/80 bg-sky-50/20 p-5 hover:border-sky-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-medium">
                    Instant SOS
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-slate-900">
                  Collar QR Tag & Lost Mode
                </h3>
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  Unique collar ID and printable tags. Scanners can instantly dial you or send WhatsApp GPS location.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-sky-100/80">
                <Link
                  to="/pet-profiles"
                  className="text-xs font-semibold text-sky-700 hover:text-sky-800 inline-flex items-center gap-1"
                >
                  Print Collar Sheet <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Card 4: WSAVA Vaccines & Passport */}
            <div className="rounded-2xl border border-blue-200/80 bg-blue-50/20 p-5 hover:border-blue-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Syringe className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-medium">
                    WSAVA Protocol
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-slate-900">
                  Vaccine Schedule & Passport
                </h3>
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  Auto-calculates core & booster puppy shots. Exports verifiable printable digital health passport certificates.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-blue-100/80">
                <Link
                  to="/vaccinations"
                  className="text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
                >
                  Explore Passport <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Card 5: 24/7 Rescue & Hospitals */}
            <div className="rounded-2xl border border-rose-200/80 bg-rose-50/20 p-5 hover:border-rose-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-medium">
                    24/7 Helplines
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-slate-900">
                  Rescue NGOs & Vet Hospitals
                </h3>
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  Direct contacts for animal ambulances, trauma centers, and shelter waitlists across major metro cities.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-rose-100/80">
                <Link
                  to="/services/rescue"
                  className="text-xs font-semibold text-rose-700 hover:text-rose-800 inline-flex items-center gap-1"
                >
                  Access Directory <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Card 6: Pet Store Essentials */}
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/20 p-5 hover:border-amber-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-medium">
                    Curated Items
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-slate-900">
                  Nutrition & Care Marketplace
                </h3>
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  Vet-recommended puppy kibble, dental chews, orthopedic bedding, and sensitive skin shampoos.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-100/80">
                <Link
                  to="/shop"
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1"
                >
                  Explore Store <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. VISUAL TIMELINE: A DAY IN THE LIFE OF A PROTECTED PUPPY                 */}
      {/* ========================================================================= */}
      <section className="py-16 bg-[#fafbfc]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-lg mx-auto mb-10 space-y-1">
            <span className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider">
              Daily Peace of Mind
            </span>
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
              A Day in the Life with Woffy
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-mono font-semibold">
                  08:30 AM
                </span>
                <Pill className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Morning Medication</h3>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                Log breakfast, check off daily supplements, and confirm deworming tablet intake.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 text-[10px] font-mono font-semibold">
                  03:00 PM
                </span>
                <Scale className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Weight & Vitals Check</h3>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                Record new weight milestones after vet visits and monitor growth progression curve.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 text-[10px] font-mono font-semibold">
                  06:00 PM
                </span>
                <QrCode className="w-4 h-4 text-sky-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Safe Outdoor Walk</h3>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                Smart Collar QR tag attached. Immediate WhatsApp GPS and dialer active if puppy wanders off.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. MINIMALIST CTA BANNER (CLEAN & LUXURIOUS)                              */}
      {/* ========================================================================= */}
      <section className="py-12 bg-white border-t border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-900 p-8 sm:p-10 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            {/* Soft Ambient Light */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-1.5 max-w-md relative z-10">
              <span className="text-[10px] font-mono font-semibold text-sky-400 uppercase tracking-wider">
                Get Started in 60 Seconds
              </span>
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight">
                Give your puppy the care ledger they deserve.
              </h3>
              <p className="text-xs text-slate-400 font-normal">
                100% free for pet parents. No credit card or app download required.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 relative z-10">
              <Link
                to="/signup"
                className="px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-medium text-xs shadow-xs transition-all"
              >
                Create Puppy Profile Free
              </Link>
              <Link
                to="/services/rescue"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition-all"
              >
                Helplines
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. MINIMALIST CONTACT INQUIRY FORM                                        */}
      {/* ========================================================================= */}
      <section id="contact" className="py-16 bg-[#fafbfc] border-t border-slate-200/60">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-1 mb-8">
            <span className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider">
              Get in Touch
            </span>
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
              Inquiries & Partnerships
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-2xs">
            {contactStatus && (
              <div
                className={`mb-4 p-3 rounded-lg text-xs font-medium ${
                  contactStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {contactStatus.text}
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Shubham Rathod"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-sky-400 bg-white text-xs text-slate-800 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="shubham@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-sky-400 bg-white text-xs text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Subject</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  placeholder="Shelter inquiry or veterinary feature feedback"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-sky-400 bg-white text-xs text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Message</label>
                <textarea
                  rows="3"
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="How can we assist you or your pet?"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-sky-400 bg-white text-xs text-slate-800 placeholder:text-slate-400"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={contactSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition-all disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                {contactSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
