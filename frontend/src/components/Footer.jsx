import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, PhoneCall, Shield, AlertTriangle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto border-t border-gray-800">
      {/* Emergency Helpline Strip */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <span>Found an injured or lost dog? Access 24/7 verified rescue helpline directory instantly.</span>
          </div>
          <Link
            to="/services/rescue"
            className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white text-red-700 font-bold text-xs hover:bg-red-50 transition-colors shadow-sm"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Find Rescue Services
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">Woffy</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              India's smart pet care ecosystem. From digital health passports and automated vaccine reminders to 
              instant emergency QR collar tags for lost pets.
            </p>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-medium">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Free Lifesaver QR Collar Tag Platform</span>
            </div>
          </div>

          {/* Core Features */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Features</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/pet-profiles" className="hover:text-sky-400 transition-colors">
                  Smart QR Collar Tag
                </Link>
              </li>
              <li>
                <Link to="/vaccinations" className="hover:text-sky-400 transition-colors">
                  Vaccine Schedule & Passport
                </Link>
              </li>
              <li>
                <Link to="/records" className="hover:text-sky-400 transition-colors">
                  Health & Weight Tracking
                </Link>
              </li>
              <li>
                <Link to="/services/rescue" className="hover:text-sky-400 transition-colors">
                  24/7 Verified Rescue Helplines
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-sky-400 transition-colors">
                  Pet Care Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/dashboard" className="hover:text-amber-400 transition-colors">
                  Pet Parent Dashboard
                </Link>
              </li>
              <li>
                <Link to="/create-pet-profile" className="hover:text-amber-400 transition-colors">
                  Register New Pet
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-amber-400 transition-colors">
                  Profile Settings
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-400 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-amber-400 transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Mission */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Lifesaver Mission</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Every day pets get lost without identification. Woffy's digital QR collar connects kind finders 
              directly with pet parents within seconds with 1-click calls and live GPS location sharing.
            </p>
            <div className="mt-4 p-3 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-300">
              🐾 Built with love for four-legged family members.
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Woffy Dog Care Project. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-gray-400">Terms of Service</Link>
            <span>•</span>
            <span className="text-gray-400">Frontend: React SPA | Backend: Node.js REST API</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
