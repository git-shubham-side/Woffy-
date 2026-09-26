import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Phone,
  AlertTriangle,
  MapPin,
  Heart,
  Shield,
  MessageCircle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';

const PublicPetTagPage = () => {
  const { id } = useParams();
  const [tag, setTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationStatus, setLocationStatus] = useState('');

  useEffect(() => {
    const fetchTag = async () => {
      try {
        const res = await api.get(`/api/pet/tag/${id}`);
        if (res.data && res.data.success && res.data.tag) {
          setTag(res.data.tag);
        } else {
          setError('Emergency tag not found or collar ID invalid.');
        }
      } catch (err) {
        setError('Could not locate pet record for this collar tag.');
      } finally {
        setLoading(false);
      }
    };

    fetchTag();
  }, [id]);

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('Getting your GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const googleMapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
        const phone = (tag.emergencyPhone || '').replace(/[^0-9]/g, '');

        const message = `Hello! I have found your dog ${tag.petName} (Collar ID: ${tag.collarId}). My current GPS location is: ${googleMapsLink}`;

        // Try opening WhatsApp with pre-filled message
        if (phone) {
          const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
        } else {
          window.open(`https://maps.google.com/?q=${latitude},${longitude}`, '_blank');
        }

        setLocationStatus('Location acquired and opened in messenger!');
      },
      (err) => {
        console.error('Geo error:', err);
        setLocationStatus('Unable to retrieve GPS location. Please call the owner directly.');
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-bold text-sm">Accessing emergency pet tag...</p>
      </div>
    );
  }

  if (error || !tag) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Tag Not Found</h2>
          <p className="text-sm text-gray-500">
            {error || 'This collar tag does not match an active pet profile. The pet parent may have updated their tag.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm shadow-md transition-all"
          >
            Visit Woffy Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-orange-50/30 py-8 px-4 sm:px-6 max-w-lg mx-auto space-y-6">
      {/* Brand Header */}
      <div className="flex items-center justify-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs">
          <Heart className="w-4 h-4 fill-current" />
        </div>
        <span className="font-extrabold text-lg tracking-tight text-gray-900">Woffy Lifesaver Tag</span>
      </div>

      {/* Emergency Lost Banner */}
      {tag.isLost ? (
        <div className="p-5 rounded-3xl bg-red-600 text-white shadow-xl text-center space-y-2 animate-pulse">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 mx-auto">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-wide">
            🚨 THIS PET IS REPORTED LOST / MISSING!
          </h1>
          <p className="text-xs text-red-100 leading-relaxed">
            Thank you for scanning! The family is desperately looking for {tag.petName}. Please call the owner right now.
          </p>
          {tag.rewardAmount && (
            <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-400 text-gray-950 font-black text-xs uppercase shadow-sm">
              💰 Reward Offered: {tag.rewardAmount}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center text-xs font-semibold flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>If this pet is unaccompanied, please reach out to the pet parent below.</span>
        </div>
      )}

      {/* Pet Main Identification Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xl space-y-6 text-center">
        <div className="relative inline-block mx-auto">
          <img
            src={tag.photo || '/uploads/pets/default-pet.png'}
            alt={tag.petName}
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80';
            }}
            className="w-32 h-32 rounded-3xl object-cover border-4 border-amber-400 shadow-lg mx-auto"
          />
          <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gray-900 text-white shadow-sm">
            {tag.collarId}
          </span>
        </div>

        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{tag.petName}</h2>
          <p className="text-sm font-semibold text-gray-500 mt-0.5">
            {tag.breed || 'Dog'} • {tag.gender || 'Male'} • {tag.age ? `${tag.age} yrs` : 'Pet'}
          </p>
          {tag.homeCity && (
            <p className="text-xs text-gray-600 flex items-center justify-center gap-1 mt-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-500" /> Home: {tag.homeCity}
            </p>
          )}
        </div>

        {/* Big Action: CALL OWNER NOW */}
        {tag.emergencyPhone ? (
          <div className="space-y-3 pt-2">
            <a
              href={`tel:${tag.emergencyPhone}`}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-extrabold text-base shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02]"
            >
              <Phone className="w-5 h-5 fill-current animate-bounce" />
              Call Owner ({tag.emergencyPhone})
            </a>

            {tag.secondaryPhone && (
              <a
                href={`tel:${tag.secondaryPhone}`}
                className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4 text-gray-600" />
                Call Alternate Phone ({tag.secondaryPhone})
              </a>
            )}

            {/* GPS Share Location button */}
            <button
              onClick={handleShareLocation}
              type="button"
              className="w-full py-3 px-4 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <MapPin className="w-4 h-4 text-amber-600" />
              Send My Current GPS Location via WhatsApp
            </button>

            {locationStatus && (
              <p className="text-xs text-amber-700 font-medium">{locationStatus}</p>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-gray-100 text-gray-600 text-xs">
            No direct emergency telephone is configured on this profile yet.
          </div>
        )}

        {/* Critical Medical Conditions & Allergies */}
        {(tag.allergies || tag.medicalAlerts) && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-left space-y-2 text-xs">
            <span className="font-extrabold text-red-800 uppercase tracking-wider block flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Critical Medical Notice / Allergies
            </span>
            {tag.allergies && (
              <p className="text-gray-800 font-medium">
                <span className="font-bold text-red-900">Allergies:</span> {tag.allergies}
              </p>
            )}
            {tag.medicalAlerts && (
              <p className="text-gray-800 font-medium">
                <span className="font-bold text-red-900">Medical Conditions:</span> {tag.medicalAlerts}
              </p>
            )}
          </div>
        )}

        {/* Lost pet personal message from owner */}
        {tag.lostMessage && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-left text-xs text-amber-900 space-y-1">
            <span className="font-bold block uppercase text-[10px]">Message from Family:</span>
            <p className="text-gray-700 leading-relaxed italic font-serif">"{tag.lostMessage}"</p>
          </div>
        )}

        {/* General Notes */}
        {tag.notes && (
          <div className="p-4 rounded-2xl bg-gray-50 text-left text-xs text-gray-700 space-y-1">
            <span className="font-bold text-gray-500 uppercase text-[10px] block">Special Care Info:</span>
            <p className="text-gray-600 leading-relaxed">{tag.notes}</p>
          </div>
        )}
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-white border border-gray-200 text-center space-y-2 shadow-xs">
        <p className="text-xs text-gray-500">
          Powered by Woffy Smart Pet Protection. If unable to reach the pet parent, please contact a local animal rescue helpline.
        </p>
        <Link
          to="/services/rescue"
          className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline"
        >
          View 24/7 Verified Helplines <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default PublicPetTagPage;
