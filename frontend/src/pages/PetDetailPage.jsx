import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Heart,
  QrCode,
  Syringe,
  Activity,
  Edit,
  Trash2,
  Printer,
  AlertTriangle,
  Phone,
  MapPin,
  CheckCircle,
  Clock,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';

const PetDetailPage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();

  const [pet, setPet] = useState(null);
  const [vaccineSummary, setVaccineSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [publicTagUrl, setPublicTagUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchPet = async () => {
    try {
      const res = await api.get(`/api/pet-profile/${petId}`);
      if (res.data && res.data.success) {
        setPet(res.data.pet);
        setVaccineSummary(res.data.vaccineSummary);
        setRecords(res.data.records || []);
        setVaccinations(res.data.vaccinations || []);
        setPublicTagUrl(res.data.publicTagUrl || '');
      } else {
        navigate('/pet-profiles');
      }
    } catch (err) {
      console.error('Fetch pet error:', err);
      navigate('/pet-profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPet();
  }, [petId]);

  const handleToggleLost = async () => {
    setToggleLoading(true);
    setActionMessage(null);
    try {
      const res = await api.post(`/api/pet-profile/${petId}/toggle-lost`, {
        rewardAmount: pet?.rewardAmount || '',
        lostMessage: pet?.lostMessage || '',
      });
      if (res.data && res.data.success) {
        setPet(res.data.pet);
        setActionMessage({
          type: res.data.isLost ? 'emergency' : 'success',
          text: res.data.message,
        });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to update lost pet status.' });
    } finally {
      setToggleLoading(false);
    }
  };

  const handleDeletePet = async () => {
    setDeleting(true);
    try {
      const res = await api.post(`/api/pet-profile/delete/${petId}`);
      if (res.data && res.data.success) {
        navigate('/pet-profiles');
      } else {
        alert('Failed to delete pet.');
      }
    } catch (err) {
      alert('Error occurred while deleting pet.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium text-sm">Loading pet profile details...</p>
      </div>
    );
  }

  if (!pet) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <Link
        to="/pet-profiles"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-amber-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Pets
      </Link>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-sm font-medium ${
            actionMessage.type === 'emergency'
              ? 'bg-red-500 text-white shadow-lg animate-pulse'
              : actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-xs underline font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Emergency Lost Banner when active */}
      {pet.isLost && (
        <div className="p-6 rounded-3xl bg-red-600 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7 text-white animate-bounce" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold uppercase tracking-wide">
                🚨 EMERGENCY LOST PET MODE ACTIVE
              </h2>
              <p className="text-xs text-red-100 mt-0.5">
                The public collar tag at {publicTagUrl} is now displaying urgent lost notices and instant contact buttons!
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleLost}
            disabled={toggleLoading}
            className="px-6 py-2.5 rounded-xl bg-white text-red-700 font-extrabold text-sm shadow-md hover:bg-red-50 transition-all shrink-0"
          >
            Mark Pet Safe & Found
          </button>
        </div>
      )}

      {/* Pet Hero Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <img
            src={pet.photo || pet.photoUrl || '/uploads/pets/default-pet.png'}
            alt={pet.petName}
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80';
            }}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-amber-400 shadow-md shrink-0"
          />
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h1 className="text-3xl font-extrabold text-gray-900">{pet.petName}</h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  pet.isLost ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {pet.isLost ? '🚨 REPORTED LOST' : '✓ SAFE AT HOME'}
              </span>
            </div>

            <p className="text-sm font-semibold text-gray-600">
              {pet.breed || 'Dog'} • {pet.species || 'Dog'} • {pet.gender || 'Male'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-500 font-medium">
              <span>🎂 {pet.age ? `${pet.age} years old` : 'Age N/A'}</span>
              <span>⚖️ {pet.weight ? `${pet.weight} kg` : 'Weight N/A'}</span>
              {pet.homeCity && <span>📍 {pet.homeCity}</span>}
              {pet.vaccinated && <span>💉 Vaccinated: {pet.vaccinated}</span>}
            </div>
          </div>
        </div>

        {/* Action Button Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 w-full md:w-auto">
          {/* Lost pet toggle switch */}
          <button
            onClick={handleToggleLost}
            disabled={toggleLoading}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 ${
              pet.isLost
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            {toggleLoading ? 'Updating...' : pet.isLost ? 'Mark as Found (Safe)' : 'Activate Lost Pet Mode'}
          </button>

          <Link
            to={`/pet-profile/edit/${pet._id}`}
            className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <Edit className="w-4 h-4" /> Edit
          </Link>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
            title="Delete Pet"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: QR Tag & Medical Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Smart QR Collar Tag Box (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-base text-gray-900">Smart QR Collar Tag</h2>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
              {pet.collarId || 'WF-TAG'}
            </span>
          </div>

          {/* QR Code Display */}
          <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-amber-50/60 to-white border border-amber-100 space-y-3">
            {pet.qrCodeDataUrl ? (
              <img
                src={pet.qrCodeDataUrl}
                alt={`Collar QR code for ${pet.petName}`}
                className="w-44 h-44 mx-auto bg-white p-2 rounded-2xl shadow-md border-2 border-amber-200"
              />
            ) : (
              <div className="w-44 h-44 mx-auto bg-white flex items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl">
                <QrCode className="w-20 h-20 text-gray-300" />
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-gray-900">Collar Tag for {pet.petName}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Scan with any smartphone camera to access emergency rescue instructions.
              </p>
            </div>
          </div>

          {/* Tag Actions */}
          <div className="space-y-2">
            <Link
              to={`/pet-profile/${pet._id}/print-tag`}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" /> Print Collar Tag & Wallet ID Sheet
            </Link>

            <a
              href={`/pet/tag/${pet.collarId || pet._id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs border border-gray-200 flex items-center justify-center gap-2 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Preview Public Emergency Tag
            </a>
          </div>

          {/* Emergency contacts summary */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
            <span className="font-bold text-gray-700 block uppercase text-[10px]">
              Active Emergency Numbers
            </span>
            <div className="flex justify-between items-center text-gray-600">
              <span>Primary Phone:</span>
              <span className="font-bold font-mono text-gray-900">
                {pet.emergencyPhone || 'Not set'}
              </span>
            </div>
            {pet.secondaryPhone && (
              <div className="flex justify-between items-center text-gray-600">
                <span>Secondary Phone:</span>
                <span className="font-bold font-mono text-gray-900">{pet.secondaryPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Medical, Vaccines & Activity (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Medical Alerts & Health Profile */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <h2 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              Medical & Safety Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1">
                <span className="font-bold text-amber-800 uppercase text-[10px]">Known Allergies</span>
                <p className="text-gray-800 font-medium text-sm">
                  {pet.allergies || 'No allergies reported'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100 space-y-1">
                <span className="font-bold text-red-800 uppercase text-[10px]">Critical Medical Alerts</span>
                <p className="text-gray-800 font-medium text-sm">
                  {pet.medicalAlerts || 'None reported'}
                </p>
              </div>
            </div>

            {pet.notes && (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                <span className="font-bold text-gray-600 uppercase text-[10px] block mb-1">
                  General Care & Temperament Notes
                </span>
                <p className="text-gray-700 leading-relaxed">{pet.notes}</p>
              </div>
            )}
          </div>

          {/* Vaccination Quick Hub */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Syringe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-gray-900">Vaccinations & Passport</h2>
                  <p className="text-xs text-gray-500">
                    {vaccineSummary?.percent || 0}% immunization schedule completed
                  </p>
                </div>
              </div>
              <Link
                to={`/vaccinations/${pet._id}`}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Open Hub <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Vaccine mini progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-gray-600">
                <span>Completed doses: {vaccineSummary?.completedDoses || 0} / {vaccineSummary?.totalDoses || 0}</span>
                <span>{vaccineSummary?.percent || 0}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${vaccineSummary?.percent || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Next Due vaccine notice */}
            {vaccineSummary?.nextDue ? (
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-blue-900 block">
                    Next Due: {vaccineSummary.nextDue.vaccineName}
                  </span>
                  <span className="text-blue-700">
                    Due on {new Date(vaccineSummary.nextDue.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <Link
                  to={`/vaccinations/${pet._id}`}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs shadow-xs"
                >
                  Record
                </Link>
              </div>
            ) : (
              <p className="text-xs text-emerald-600 font-medium">
                ✓ All recorded vaccinations are up to date!
              </p>
            )}
          </div>

          {/* Recent Health Activity Logs */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-base text-gray-900">Health & Care Timeline</h2>
              </div>
              <Link
                to={`/track/${pet._id}`}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                View Logs <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {records.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">
                No activity logs recorded yet. Track weight, medication, or vet visits.
              </div>
            ) : (
              <div className="space-y-2">
                {records.slice(0, 3).map((rec) => (
                  <div
                    key={rec._id}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center text-xs"
                  >
                    <div>
                      <span className="font-bold text-gray-900 block">{rec.title}</span>
                      <span className="text-gray-500 capitalize">{rec.activityType}</span>
                    </div>
                    <span className="text-gray-400 font-mono">
                      {new Date(rec.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Photo Gallery if any */}
          {pet.gallery && pet.gallery.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
              <h2 className="font-bold text-base text-gray-900">Photo Moments</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {pet.gallery.map((imgUrl, idx) => (
                  <img
                    key={idx}
                    src={imgUrl}
                    alt={`${pet.petName} moment ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-xl border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-gray-900">Delete Pet Profile?</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Are you sure you want to permanently remove <span className="font-bold text-gray-900">{pet.petName}</span>?
                All associated vaccination records, health logs, and collar QR tags will be permanently deleted.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePet}
                disabled={deleting}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-md disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetDetailPage;
