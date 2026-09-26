import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Activity,
  PlusCircle,
  Calendar,
  Scale,
  Stethoscope,
  Pill,
  Scissors,
  Trash2,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';

const TrackingRecordsPage = () => {
  const { petId: paramPetId } = useParams();

  const [pets, setPets] = useState([]);
  const [currentPet, setCurrentPet] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [form, setForm] = useState({
    activityType: 'weight',
    title: '',
    date: new Date().toISOString().substring(0, 10),
    notes: '',
  });
  const [recordImageFile, setRecordImageFile] = useState(null);

  const fetchRecords = async (targetPetId = paramPetId) => {
    try {
      // 1. Fetch pets
      const petsRes = await api.get('/api/pet-profiles');
      const allPets = petsRes.data?.pets || [];
      setPets(allPets);

      let targetPet = null;
      if (targetPetId) {
        targetPet = allPets.find((p) => p._id === targetPetId);
      }
      if (!targetPet && allPets.length > 0) {
        targetPet = allPets[0];
      }
      setCurrentPet(targetPet);

      // 2. Fetch records for target pet
      if (targetPet) {
        const recordsRes = await api.get(`/api/track/${targetPet._id}`);
        if (recordsRes.data && recordsRes.data.success) {
          setRecords(recordsRes.data.records || []);
        }
      }
    } catch (err) {
      console.error('Fetch tracking records error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(paramPetId);
  }, [paramPetId]);

  const handlePetChange = (newPetId) => {
    window.location.href = `/track/${newPetId}`;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!currentPet) return;

    try {
      const data = new FormData();
      data.append('petId', currentPet._id);
      data.append('activityType', form.activityType);
      data.append('title', form.title);
      data.append('date', form.date);
      data.append('notes', form.notes);
      if (recordImageFile) {
        data.append('recordImage', recordImageFile);
      }

      const res = await api.post('/api/records', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data && res.data.success) {
        setShowAddModal(false);
        setForm({
          activityType: 'weight',
          title: '',
          date: new Date().toISOString().substring(0, 10),
          notes: '',
        });
        setRecordImageFile(null);
        setFeedback({ type: 'success', text: res.data.message });
        await fetchRecords(currentPet._id);
      } else {
        alert(res.data.message || 'Failed to save record.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred while saving activity log.');
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Delete this care log entry?')) return;
    try {
      const res = await api.post(`/api/records/delete/${recordId}`, { petId: currentPet._id });
      if (res.data && res.data.success) {
        await fetchRecords(currentPet._id);
      }
    } catch (err) {
      alert('Failed to delete log.');
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'weight':
        return <Scale className="w-4 h-4 text-emerald-600" />;
      case 'medical':
      case 'vet_history':
        return <Stethoscope className="w-4 h-4 text-blue-600" />;
      case 'medicine':
        return <Pill className="w-4 h-4 text-purple-600" />;
      case 'grooming':
      case 'bath':
        return <Scissors className="w-4 h-4 text-pink-600" />;
      default:
        return <Activity className="w-4 h-4 text-amber-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium text-sm">Loading pet health records...</p>
      </div>
    );
  }

  if (!currentPet) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center mx-auto">
          <Activity className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">No Pet Profile Registered Yet</h2>
        <p className="text-sm text-gray-500">
          Create a pet profile to start logging weight progress, vet visits, and medications.
        </p>
        <Link
          to="/create-pet-profile"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md"
        >
          <PlusCircle className="w-4 h-4" /> Register First Pet
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-purple-600" />
            Health & Activity Tracker
          </h1>
          <p className="text-sm text-gray-500">
            Log weight checks, vet appointments, prescriptions, and grooming history for your pets.
          </p>
        </div>

        {pets.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Pet:</label>
            <select
              value={currentPet._id}
              onChange={(e) => handlePetChange(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-purple-500"
            >
              {pets.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.petName} ({p.breed || 'Dog'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex justify-between items-center">
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-xs underline font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Pet Summary Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <img
            src={currentPet.photo || currentPet.photoUrl || '/uploads/pets/default-pet.png'}
            alt={currentPet.petName}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80';
            }}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-300 shadow-sm"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{currentPet.petName}'s Health Log</h2>
            <p className="text-xs text-gray-500">
              Current Recorded Weight: <strong className="text-gray-900">{currentPet.weight ? `${currentPet.weight} kg` : 'N/A'}</strong> •{' '}
              {records.length} Care Logs Recorded
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="w-4 h-4" /> Log Health Activity
        </button>
      </div>

      {/* Records Timeline List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-gray-900">Activity History</h3>

        {records.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border-2 border-dashed border-gray-200 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">No health activities logged yet</h4>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
                Record your dog's first weight check, vet consultation, or prescription to start their wellness timeline.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md"
            >
              <PlusCircle className="w-4 h-4" /> Create First Log
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((rec) => (
              <div
                key={rec._id}
                className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    {getActivityIcon(rec.activityType)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-gray-900">{rec.title}</h4>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                        {rec.activityType}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 flex items-center gap-1.5 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(rec.date).toLocaleDateString()}
                    </p>

                    {rec.notes && (
                      <p className="text-xs text-gray-700 mt-1 leading-relaxed">{rec.notes}</p>
                    )}

                    {rec.image && (
                      <a
                        href={rec.image}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-2 text-xs font-semibold text-purple-600 hover:underline"
                      >
                        📎 View Attached Document / Photo
                      </a>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteRecord(rec._id)}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                  title="Delete log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Log Health Activity for {currentPet.petName}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Activity Type *</label>
                  <select
                    value={form.activityType}
                    onChange={(e) => setForm({ ...form, activityType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  >
                    <option value="weight">Weight Check ⚖️</option>
                    <option value="medical">Medical Checkup 🩺</option>
                    <option value="medicine">Medication / Prescription 💊</option>
                    <option value="vet_history">Veterinary Visit 🏥</option>
                    <option value="grooming">Grooming ✂️</option>
                    <option value="bath">Bath 🛁</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Title / Metric *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={
                    form.activityType === 'weight'
                      ? 'e.g. Weight: 28.5 kg'
                      : 'e.g. Annual physical exam, ear drop regimen'
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                />
                {form.activityType === 'weight' && (
                  <p className="text-[11px] text-emerald-600 mt-1">
                    💡 Tip: Entering numbers like "28.5 kg" will automatically update your dog's profile weight!
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Doctor Advice & Notes</label>
                <textarea
                  rows="3"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Vet advice, dosage instructions, symptoms, or behavior..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Prescription / Invoice / Photo Attachment
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setRecordImageFile(e.target.files[0])}
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingRecordsPage;
