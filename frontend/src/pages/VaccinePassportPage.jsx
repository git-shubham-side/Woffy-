import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, ShieldCheck, Heart, QrCode, CheckCircle, Calendar } from 'lucide-react';
import api from '../services/api';

const VaccinePassportPage = () => {
  const { petId } = useParams();
  const [pet, setPet] = useState(null);
  const [user, setUser] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPassport = async () => {
      try {
        const res = await api.get(`/api/vaccinations/${petId}/passport`);
        if (res.data && res.data.success) {
          setPet(res.data.pet);
          setUser(res.data.user);
          setVaccinations(res.data.vaccinations || []);
        } else {
          // Fallback to regular endpoint
          const fallback = await api.get(`/api/pet-profile/${petId}`);
          if (fallback.data && fallback.data.success) {
            setPet(fallback.data.pet);
            setVaccinations(fallback.data.vaccinations || []);
          }
        }
      } catch (err) {
        console.error('Fetch passport error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPassport();
  }, [petId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium text-sm">Rendering digital vaccine passport...</p>
      </div>
    );
  }

  if (!pet) return null;

  const completedDoses = vaccinations.filter((v) => v.status === 'Completed');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Control Bar (hidden when printing) */}
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <Link
          to={`/vaccinations/${pet._id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-blue-600"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Vaccination Hub
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all hover:scale-[1.02]"
        >
          <Printer className="w-4 h-4" /> Print / Export Passport
        </button>
      </div>

      {/* Official Passport Container */}
      <div className="bg-white rounded-3xl border-2 border-blue-900/40 p-8 sm:p-12 shadow-xl space-y-8 print:p-0 print:border-none print:shadow-none">
        {/* Passport Header */}
        <div className="text-center space-y-2 pb-6 border-b-2 border-blue-900/20">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-900 text-white shadow-md mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-blue-950 uppercase tracking-wider">
            Official Canine Health & Vaccination Passport
          </h1>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">
            Republic of India • Woffy Digital Pet Protection Registry
          </p>
        </div>

        {/* Pet & Owner Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-blue-50/40 p-6 rounded-2xl border border-blue-100">
          {/* Pet Photo */}
          <div className="text-center md:text-left space-y-2">
            <img
              src={pet.photo || pet.photoUrl || '/uploads/pets/default-pet.png'}
              alt={pet.petName}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80';
              }}
              className="w-32 h-32 rounded-2xl object-cover border-2 border-blue-900/40 shadow-sm mx-auto md:mx-0"
            />
            <p className="text-[11px] font-mono font-bold text-blue-900">
              Collar ID: {pet.collarId || 'WF-PET'}
            </p>
          </div>

          {/* Pet Details */}
          <div className="space-y-1.5 text-xs">
            <span className="font-bold text-blue-900 uppercase text-[10px] tracking-wider block mb-1">
              Pet Subject Information
            </span>
            <p><span className="text-gray-500">Name:</span> <strong className="text-sm text-gray-900">{pet.petName}</strong></p>
            <p><span className="text-gray-500">Species:</span> <strong>{pet.species || 'Dog'}</strong></p>
            <p><span className="text-gray-500">Breed:</span> <strong>{pet.breed || 'Indie / Mix'}</strong></p>
            <p><span className="text-gray-500">Sex:</span> <strong>{pet.gender || 'Male'}</strong></p>
            <p><span className="text-gray-500">Age:</span> <strong>{pet.age ? `${pet.age} Years` : 'N/A'}</strong></p>
            <p><span className="text-gray-500">Weight:</span> <strong>{pet.weight ? `${pet.weight} kg` : 'N/A'}</strong></p>
          </div>

          {/* Owner & Tag Details */}
          <div className="space-y-1.5 text-xs">
            <span className="font-bold text-blue-900 uppercase text-[10px] tracking-wider block mb-1">
              Owner & Contact Information
            </span>
            <p><span className="text-gray-500">Owner Name:</span> <strong>{pet.ownerName || user?.fullName || 'Pet Parent'}</strong></p>
            <p><span className="text-gray-500">Emergency Phone:</span> <strong className="font-mono">{pet.emergencyPhone || 'N/A'}</strong></p>
            <p><span className="text-gray-500">City/State:</span> <strong>{pet.homeCity || 'India'}</strong></p>
            <p><span className="text-gray-500">Known Allergies:</span> <strong className="text-red-700">{pet.allergies || 'None reported'}</strong></p>
            {pet.qrCodeDataUrl && (
              <div className="pt-2">
                <img src={pet.qrCodeDataUrl} alt="QR Verification" className="w-16 h-16 bg-white p-1 rounded-lg border border-blue-200" />
              </div>
            )}
          </div>
        </div>

        {/* Immunization Table */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-extrabold text-blue-950 uppercase tracking-wide">
              Immunization & Deworming Record Table
            </h2>
            <span className="text-xs font-bold text-blue-700">
              {completedDoses.length} Verified Doses
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-blue-900 text-white font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Vaccine / Disease Protected</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Administered Date</th>
                  <th className="py-3 px-4">Clinic / Vet</th>
                  <th className="py-3 px-4">Batch No.</th>
                  <th className="py-3 px-4 text-center">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {vaccinations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-6 text-center text-gray-400">
                      No vaccination doses recorded yet.
                    </td>
                  </tr>
                ) : (
                  vaccinations.map((vax) => (
                    <tr key={vax._id} className="hover:bg-blue-50/30">
                      <td className="py-3 px-4 font-bold text-gray-900">{vax.vaccineName}</td>
                      <td className="py-3 px-4">{vax.category}</td>
                      <td className="py-3 px-4 font-mono">{new Date(vax.dueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-emerald-800">
                        {vax.administeredDate ? new Date(vax.administeredDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4">{vax.clinicOrVetName || 'Registered Vet'}</td>
                      <td className="py-3 px-4 font-mono text-[11px]">{vax.batchNumber || '—'}</td>
                      <td className="py-3 px-4 text-center">
                        {vax.status === 'Completed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3" /> VERIFIED
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                            {vax.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Official Certification Stamp Box */}
        <div className="pt-6 border-t-2 border-dashed border-gray-300 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-600">
          <div className="p-4 rounded-xl border border-gray-200 space-y-2">
            <span className="font-bold text-gray-900 uppercase block text-[10px]">
              Veterinary Clinic Endorsement
            </span>
            <div className="h-16 border-b border-gray-300 flex items-end pb-1 text-[11px] text-gray-400">
              Signature & Official Stamp of Registered Veterinary Practitioner
            </div>
            <p className="text-[10px] text-gray-500">Date & Registration Number</p>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 space-y-2 text-right">
            <span className="font-bold text-gray-900 uppercase block text-[10px]">
              Registry Verification Seal
            </span>
            <div className="h-16 flex items-center justify-end">
              <div className="w-16 h-16 rounded-full border-2 border-blue-900/60 flex items-center justify-center text-blue-900 font-serif font-black text-[9px] uppercase text-center leading-tight">
                WOFFY<br />OFFICIAL<br />SEAL
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-mono">Issued via Woffy Digital Healthcare</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaccinePassportPage;
