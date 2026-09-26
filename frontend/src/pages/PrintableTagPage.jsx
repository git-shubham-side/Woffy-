import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, QrCode, Phone, Shield, Heart } from 'lucide-react';
import api from '../services/api';

const PrintableTagPage = () => {
  const { petId } = useParams();
  const [pet, setPet] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTag = async () => {
      try {
        const res = await api.get(`/api/pet-profile/${petId}/print-tag`);
        if (res.data && res.data.success) {
          setPet(res.data.pet);
          setOwner(res.data.owner);
        }
      } catch (err) {
        console.error('Fetch printable tag error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTag();
  }, [petId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium text-sm">Preparing printable collar tag sheet...</p>
      </div>
    );
  }

  if (!pet) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Non-printing Control Bar */}
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <Link
          to={`/pet-profile/${pet._id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-amber-600"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Pet Profile
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-all hover:scale-[1.02]"
        >
          <Printer className="w-4 h-4" /> Print Collar Tag & Wallet Sheet
        </button>
      </div>

      {/* Printable Sheet */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-sm space-y-10 print:p-0 print:border-none print:shadow-none">
        {/* Sheet Title */}
        <div className="text-center space-y-1 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-center gap-2 text-amber-600">
            <Heart className="w-6 h-6 fill-current" />
            <span className="text-2xl font-black tracking-tight">Woffy Lifesaver Collar Sheet</span>
          </div>
          <p className="text-xs text-gray-500">
            Cut along the dashed lines. Laminate for weatherproofing or slide into a clear collar pouch.
          </p>
        </div>

        {/* Section A: Collar Tag Cutout */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
            A. Standard Collar Tag (Cut & Punch Hole)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto">
            {/* Front of collar tag */}
            <div className="border-2 border-dashed border-gray-400 rounded-3xl p-6 bg-gradient-to-b from-amber-500 to-orange-500 text-white text-center space-y-3 flex flex-col items-center justify-center min-h-[220px]">
              <div className="w-3 h-3 rounded-full bg-white border border-gray-400 mx-auto -mt-2 mb-1" title="Hole punch guide"></div>
              <img
                src={pet.photo || pet.photoUrl || '/uploads/pets/default-pet.png'}
                alt={pet.petName}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80';
                }}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
              />
              <div>
                <h3 className="text-2xl font-black">{pet.petName}</h3>
                <p className="text-xs font-semibold text-amber-100">
                  {pet.breed || 'Dog'} • {pet.gender || 'Male'}
                </p>
              </div>
              <p className="text-[10px] font-bold text-amber-200 tracking-wider uppercase">
                Tag ID: {pet.collarId || 'WF-PET'}
              </p>
            </div>

            {/* Back of collar tag */}
            <div className="border-2 border-dashed border-gray-400 rounded-3xl p-6 bg-white text-gray-900 text-center space-y-3 flex flex-col items-center justify-center min-h-[220px]">
              <div className="w-3 h-3 rounded-full bg-gray-200 border border-gray-400 mx-auto -mt-2 mb-1" title="Hole punch guide"></div>
              {pet.qrCodeDataUrl ? (
                <img
                  src={pet.qrCodeDataUrl}
                  alt="QR Code"
                  className="w-24 h-24 p-1 bg-white border border-gray-300 rounded-xl shadow-xs"
                />
              ) : (
                <QrCode className="w-20 h-20 text-gray-400" />
              )}
              <div className="text-xs">
                <span className="font-bold text-red-600 block text-xs">SCAN IF LOST</span>
                <span className="font-mono font-bold text-gray-800 text-sm block mt-0.5">
                  📞 {pet.emergencyPhone || 'Emergency contact'}
                </span>
                {pet.homeCity && <span className="text-[11px] text-gray-500 block">📍 {pet.homeCity}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Section B: Wallet ID Card */}
        <div className="space-y-3 pt-6 border-t border-gray-200">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
            B. Pet Parent Emergency Wallet Card (Credit Card Sized)
          </span>

          <div className="border-2 border-dashed border-gray-400 rounded-2xl p-5 bg-gradient-to-r from-gray-900 to-gray-800 text-white max-w-md mx-auto shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={pet.photo || pet.photoUrl || '/uploads/pets/default-pet.png'}
                  alt={pet.petName}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80';
                  }}
                  className="w-14 h-14 rounded-xl object-cover border border-amber-400 shrink-0"
                />
                <div>
                  <h4 className="font-extrabold text-lg text-white">{pet.petName}</h4>
                  <p className="text-xs text-gray-300">{pet.breed} • {pet.age ? `${pet.age} yrs` : 'Pet'}</p>
                  <p className="text-[10px] text-amber-400 font-mono mt-0.5">ID: {pet.collarId}</p>
                </div>
              </div>
              {pet.qrCodeDataUrl && (
                <img src={pet.qrCodeDataUrl} alt="QR" className="w-14 h-14 bg-white p-1 rounded-lg shrink-0" />
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-700 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-gray-400 block text-[9px] uppercase">Emergency Phone</span>
                <span className="font-mono font-bold text-white">{pet.emergencyPhone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[9px] uppercase">Allergies / Alert</span>
                <span className="text-amber-300 font-medium truncate block">
                  {pet.allergies || pet.medicalAlerts || 'None reported'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-xs text-amber-900 space-y-1">
          <span className="font-bold block">💡 Pet Parent Tip:</span>
          <p>
            When attached to your dog's collar, anyone with a smartphone camera can scan this QR code within 3 seconds
            to view emergency contacts without needing to install any app.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrintableTagPage;
