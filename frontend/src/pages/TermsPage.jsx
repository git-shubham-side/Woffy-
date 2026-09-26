import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, ArrowLeft } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-200 space-y-6">
        <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Terms of Service & Privacy Notice</h1>
            <p className="text-sm text-gray-500">Last updated: September 2026 • Woffy Pet Care</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-bold text-gray-900">1. Acceptance of Terms</h2>
          <p>
            By creating an account, registering a pet, or using Woffy's digital Smart QR collar tag, you agree to
            comply with these Terms and Conditions. Woffy provides digital pet care record management, vaccination reminders,
            and public emergency pet tags.
          </p>

          <h2 className="text-lg font-bold text-gray-900">2. Emergency Smart QR Collar Tags</h2>
          <p>
            The QR code generated for your pet is accessible publicly without login when scanned by an individual who
            discovers a lost or wandering pet. By setting up a collar tag, you authorize Woffy to publicly display the
            chosen emergency contact numbers, pet name, allergies, and lost pet messages to facilitate swift family reunions.
          </p>

          <h2 className="text-lg font-bold text-gray-900">3. Veterinary Records & Medical Disclaimer</h2>
          <p>
            The automated vaccination schedules and health tracking logs provided by Woffy are intended as helpful
            advisory tools for pet parents. Always consult a licensed veterinarian for medical diagnosis, prescriptions,
            and official vaccination certificates.
          </p>

          <h2 className="text-lg font-bold text-gray-900">4. Privacy & Data Ownership</h2>
          <p>
            We take your privacy seriously. Your personal password is encrypted and never stored in plain text. You retain
            full control over your pet profiles and may update or permanently delete your account and associated records
            at any time from Account Settings.
          </p>

          <h2 className="text-lg font-bold text-gray-900">5. Community Marketplace & Directory</h2>
          <p>
            Rescue services, shelter contacts, and hospitals listed in the directory are compiled for informational
            and emergency assistance purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
