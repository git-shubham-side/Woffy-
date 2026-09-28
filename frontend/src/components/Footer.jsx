import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, PhoneCall, Shield, AlertTriangle, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-50 text-slate-600 mt-auto border-t border-sky-100">
      {/* Emergency Helpline Strip */}
      <div className="bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 text-white py-3 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-200 animate-pulse" />
            <span>Found an injured or lost dog? Access 24/7 verified rescue helpline directory instantly.</span>
          </div>
          <Link
            to="/services/rescue"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-rose-600 font-bold text-xs hover:bg-rose-50 transition-all shadow-xs hover:scale-105"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Find Rescue Services
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-medium text-slate-900 tracking-tight font-sans">
                Woofy<span className="text-blue-600">.</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Unified digital health infrastructure for dogs. WSAVA-compliant vaccination passports, precision
              dosage tracking, and instant emergency collar QR tags.
            </p>
            <div className="flex items-center gap-2 text-xs text-sky-700 font-medium bg-sky-50/80 p-2.5 rounded-xl border border-sky-200/60">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Free Lifesaver QR Collar Tag Platform</span>
            </div>
          </div>

          {/* Core Features */}
          <div>
            <h4 className="text-slate-800 font-medium mb-4 text-xs uppercase font-mono tracking-wider">
              Features
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500 font-normal">
              <li>
                <Link to="/pet-profiles" className="hover:text-sky-600 transition-colors">
                  Smart QR Collar Tag
                </Link>
              </li>
              <li>
                <Link to="/vaccinations" className="hover:text-sky-600 transition-colors">
                  Vaccine Schedule &amp; Passport
                </Link>
              </li>
              <li>
                <Link to="/records" className="hover:text-sky-600 transition-colors">
                  Health &amp; Weight Tracking
                </Link>
              </li>
              <li>
                <Link to="/services/rescue" className="hover:text-sky-600 transition-colors">
                  24/7 Verified Rescue Helplines
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-sky-600 transition-colors">
                  Curated Care Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-slate-800 font-medium mb-4 text-xs uppercase font-mono tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500 font-normal">
              <li>
                <Link to="/dashboard" className="hover:text-sky-600 transition-colors">
                  Pet Parent Dashboard
                </Link>
              </li>
              <li>
                <Link to="/create-pet-profile" className="hover:text-sky-600 transition-colors">
                  Register New Pet
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-sky-600 transition-colors">
                  Profile Settings
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-sky-600 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-sky-600 transition-colors">
                  Create Free Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Mission */}
          <div>
            <h4 className="text-slate-800 font-medium mb-4 text-xs uppercase font-mono tracking-wider">
              Emergency Governance
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-light">
              Every day pets get lost without identification. Woffy's digital QR collar connects kind finders 
              directly with pet parents within seconds via 1-click calls and live WhatsApp GPS location dispatch.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-12 pt-6 flex justify-center items-center text-xs text-slate-400">
          <div className="flex items-center gap-4 font-normal text-slate-400">
            <Link to="/terms" className="hover:text-sky-600 transition-colors">Terms of Service</Link>
            <span>•</span>
            <span className="text-sky-700 font-medium">WSAVA Protocol Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
