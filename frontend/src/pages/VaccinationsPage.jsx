import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Syringe,
  CheckCircle,
  AlertTriangle,
  Clock,
  PlusCircle,
  Sparkles,
  Printer,
  Mail,
  Trash2,
  Calendar,
  ExternalLink,
  X,
  FileCheck,
} from 'lucide-react';
import api from '../services/api';

const VaccinationsPage = () => {
  const { petId: paramPetId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all';

  const [pets, setPets] = useState([]);
  const [currentPet, setCurrentPet] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);

  // Form states
  const [addForm, setAddForm] = useState({
    vaccineName: '',
    category: 'Core Vaccine',
    dueDate: '',
    status: 'Upcoming',
    clinicOrVetName: '',
    batchNumber: '',
    notes: '',
  });

  const [completeForm, setCompleteForm] = useState({
    administeredDate: new Date().toISOString().substring(0, 10),
    clinicOrVetName: '',
    batchNumber: '',
    notes: '',
  });

  const fetchVaccinations = async (targetPetId = paramPetId, tab = activeTab) => {
    try {
      const url = targetPetId ? `/api/vaccinations/${targetPetId}?tab=${tab}` : `/api/vaccinations?tab=${tab}`;
      const res = await api.get(url);
      if (res.data && res.data.success) {
        setPets(res.data.pets || []);
        setCurrentPet(res.data.currentPet || null);
        setVaccinations(res.data.vaccinations || []);
        setStats(res.data.stats || null);
      }
    } catch (err) {
      console.error('Fetch vaccinations error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccinations(paramPetId, activeTab);
  }, [paramPetId, activeTab]);

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  const handlePetChange = (newPetId) => {
    window.location.href = `/vaccinations/${newPetId}?tab=${activeTab}`;
  };

  const handleGenerateSchedule = async () => {
    if (!currentPet) return;
    try {
      setLoading(true);
      const res = await api.post(`/api/vaccinations/generate-schedule/${currentPet._id}`);
      if (res.data && res.data.success) {
        setFeedback({ type: 'success', text: res.data.message });
        await fetchVaccinations(currentPet._id, activeTab);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to generate schedule.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!currentPet) return;
    if (!window.confirm(`Clear all vaccination entries for ${currentPet.petName}?`)) return;
    try {
      setLoading(true);
      const res = await api.post(`/api/vaccinations/clear-all/${currentPet._id}`);
      if (res.data && res.data.success) {
        setFeedback({ type: 'success', text: res.data.message });
        await fetchVaccinations(currentPet._id, activeTab);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to clear entries.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async () => {
    if (!currentPet) return;
    try {
      const res = await api.post(`/api/vaccinations/send-reminder/${currentPet._id}`);
      if (res.data && res.data.success) {
        setFeedback({ type: 'success', text: res.data.message });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to send reminder email.' });
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!currentPet) return;
    try {
      const res = await api.post(`/api/vaccinations/add/${currentPet._id}`, addForm);
      if (res.data && res.data.success) {
        setShowAddModal(false);
        setAddForm({
          vaccineName: '',
          category: 'Core Vaccine',
          dueDate: '',
          status: 'Upcoming',
          clinicOrVetName: '',
          batchNumber: '',
          notes: '',
        });
        setFeedback({ type: 'success', text: res.data.message });
        await fetchVaccinations(currentPet._id, activeTab);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add vaccine dose.');
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVaccine) return;
    try {
      const res = await api.post(`/api/vaccinations/complete/${selectedVaccine._id}`, {
        ...completeForm,
        petId: currentPet._id,
      });
      if (res.data && res.data.success) {
        setShowCompleteModal(false);
        setSelectedVaccine(null);
        setFeedback({ type: 'success', text: res.data.message });
        await fetchVaccinations(currentPet._id, activeTab);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record completion.');
    }
  };

  const handleDeleteVaccine = async (vaxId) => {
    if (!window.confirm('Delete this vaccination dose entry?')) return;
    try {
      const res = await api.post(`/api/vaccinations/delete/${vaxId}`, { petId: currentPet._id });
      if (res.data && res.data.success) {
        await fetchVaccinations(currentPet._id, activeTab);
      }
    } catch (err) {
      alert('Failed to delete dose entry.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium text-sm">Loading pet immunization hub...</p>
      </div>
    );
  }

  if (!currentPet) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
          <Syringe className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">No Pet Registered Yet</h2>
        <p className="text-sm text-gray-500">
          Please add a pet profile first to view automated veterinary vaccination and deworming schedules.
        </p>
        <Link
          to="/create-pet-profile"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md"
        >
          <PlusCircle className="w-4 h-4" /> Register Pet Free
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Pet Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Syringe className="w-7 h-7 text-blue-600" />
            Vaccination & Deworming Hub
          </h1>
          <p className="text-sm text-gray-500">
            Never miss critical Rabies, DHPP, or Deworming doses for your dog.
          </p>
        </div>

        {/* Pet Switcher dropdown */}
        {pets.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Pet:</label>
            <select
              value={currentPet._id}
              onChange={(e) => handlePetChange(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500"
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

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-xs underline font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Immunization Progress Card */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentPet.photo || currentPet.photoUrl || '/uploads/pets/default-pet.png'}
              alt={currentPet.petName}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80';
              }}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/60 shadow-md shrink-0"
            />
            <div>
              <h2 className="text-2xl font-black">{currentPet.petName}'s Medical Passport</h2>
              <p className="text-xs text-blue-100">
                {currentPet.breed || 'Dog'} • {currentPet.age ? `${currentPet.age} years old` : 'Age N/A'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/vaccine-passport/${currentPet._id}`}
              className="px-4 py-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <FileCheck className="w-4 h-4" /> Official Passport View
            </Link>

            <button
              onClick={handleSendReminder}
              className="px-3.5 py-2 rounded-xl bg-blue-500/50 hover:bg-blue-500 text-white font-semibold text-xs border border-white/20 flex items-center gap-1.5 transition-colors"
              title="Send email reminder"
            >
              <Mail className="w-4 h-4" /> Email Reminder
            </button>
          </div>
        </div>

        {/* Schedule Metric Bars */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-blue-100">
            <span>
              Immunization Progress: {stats?.completedCount || 0} of {stats?.totalCount || 0} Doses Recorded
            </span>
            <span className="font-bold text-white text-sm">{stats?.completionPercent || 0}% Complete</span>
          </div>
          <div className="w-full h-3 rounded-full bg-blue-900/40 overflow-hidden p-0.5 border border-white/20">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-green-300 rounded-full transition-all duration-500"
              style={{ width: `${stats?.completionPercent || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Mini stats counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center text-xs">
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs">
            <span className="text-2xl font-black block">{stats?.dueSoonCount || 0}</span>
            <span className="text-blue-100 font-medium text-[11px]">Due Soon (30 Days)</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs">
            <span className="text-2xl font-black text-rose-300 block">{stats?.overdueCount || 0}</span>
            <span className="text-blue-100 font-medium text-[11px]">Overdue Doses</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs">
            <span className="text-2xl font-black text-emerald-300 block">{stats?.completedCount || 0}</span>
            <span className="text-blue-100 font-medium text-[11px]">Completed & Verified</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs">
            <span className="text-2xl font-black block">{stats?.upcomingCount || 0}</span>
            <span className="text-blue-100 font-medium text-[11px]">Future Scheduled</span>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
          {[
            { id: 'all', label: `All (${stats?.totalCount || 0})` },
            { id: 'due', label: `Due / Overdue (${(stats?.dueSoonCount || 0) + (stats?.overdueCount || 0)})` },
            { id: 'core', label: 'Core Vaccines' },
            { id: 'deworming', label: 'Deworming' },
            { id: 'completed', label: `Completed (${stats?.completedCount || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Add Custom Dose
          </button>
          <button
            onClick={handleGenerateSchedule}
            className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-200 flex items-center gap-1.5 transition-colors"
            title="Auto-generates Rabies, DHPP, Bordetella based on pet age"
          >
            <Sparkles className="w-4 h-4 text-amber-600" /> Auto-Schedule
          </button>
          {vaccinations.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Clear all vaccination records"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Vaccinations Dose List */}
      {vaccinations.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border-2 border-dashed border-gray-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
            <Syringe className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">No vaccination records in this view</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
              Click "Auto-Schedule" to populate standard veterinary puppy/adult vaccines or add custom logs.
            </p>
          </div>
          <button
            onClick={handleGenerateSchedule}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md"
          >
            <Sparkles className="w-4 h-4" /> Generate Recommended Schedule
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vaccinations.map((vax) => {
            const isCompleted = vax.status === 'Completed';
            const isOverdue = vax.status === 'Overdue';
            const isDueSoon = vax.status === 'Due Soon';

            return (
              <div
                key={vax._id}
                className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between space-y-3 ${
                  isOverdue
                    ? 'border-red-300 bg-red-50/20'
                    : isDueSoon
                    ? 'border-amber-300 bg-amber-50/20'
                    : isCompleted
                    ? 'border-emerald-200'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-gray-900">{vax.vaccineName}</h4>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                        {vax.category}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      Due Date: <span className="font-semibold text-gray-800">{new Date(vax.dueDate).toLocaleDateString()}</span>
                    </p>

                    {vax.administeredDate && (
                      <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Administered: {new Date(vax.administeredDate).toLocaleDateString()}
                      </p>
                    )}

                    {vax.clinicOrVetName && (
                      <p className="text-xs text-gray-600">
                        🏥 Clinic/Vet: <span className="font-medium">{vax.clinicOrVetName}</span>
                      </p>
                    )}
                    {vax.batchNumber && (
                      <p className="text-xs text-gray-500 font-mono">
                        Batch: {vax.batchNumber}
                      </p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isOverdue
                        ? 'bg-red-100 text-red-800 animate-pulse'
                        : isDueSoon
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {vax.status}
                  </span>
                </div>

                {/* Card actions */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  {!isCompleted ? (
                    <button
                      onClick={() => {
                        setSelectedVaccine(vax);
                        setShowCompleteModal(true);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Administered
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Verified Immunization
                    </span>
                  )}

                  <button
                    onClick={() => handleDeleteVaccine(vax._id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Remove entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Vaccine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Syringe className="w-5 h-5 text-blue-600" />
                Add Vaccine / Deworming Dose
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Vaccine Name *</label>
                <input
                  type="text"
                  required
                  value={addForm.vaccineName}
                  onChange={(e) => setAddForm({ ...addForm, vaccineName: e.target.value })}
                  placeholder="e.g. Anti-Rabies Annual Booster, DHPPiL"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Category</label>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  >
                    <option value="Core Vaccine">Core Vaccine</option>
                    <option value="Booster">Booster</option>
                    <option value="Deworming">Deworming</option>
                    <option value="Non-Core">Non-Core</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={addForm.dueDate}
                    onChange={(e) => setAddForm({ ...addForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Clinic / Vet Name</label>
                  <input
                    type="text"
                    value={addForm.clinicOrVetName}
                    onChange={(e) => setAddForm({ ...addForm, clinicOrVetName: e.target.value })}
                    placeholder="e.g. Dr. Patil Pet Clinic"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={addForm.batchNumber}
                    onChange={(e) => setAddForm({ ...addForm, batchNumber: e.target.value })}
                    placeholder="e.g. VAX-9821"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Notes</label>
                <textarea
                  rows="2"
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  placeholder="Vet advice, side effects, or special notes..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                ></textarea>
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
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Save Dose
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Completed Modal */}
      {showCompleteModal && selectedVaccine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Record Vaccine Administration</h3>
                <p className="text-xs text-gray-500">{selectedVaccine.vaccineName}</p>
              </div>
              <button onClick={() => setShowCompleteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Date Administered *</label>
                <input
                  type="date"
                  required
                  value={completeForm.administeredDate}
                  onChange={(e) => setCompleteForm({ ...completeForm, administeredDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Vet / Hospital Name</label>
                  <input
                    type="text"
                    value={completeForm.clinicOrVetName}
                    onChange={(e) => setCompleteForm({ ...completeForm, clinicOrVetName: e.target.value })}
                    placeholder="Veterinary hospital name"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Vial Batch Number</label>
                  <input
                    type="text"
                    value={completeForm.batchNumber}
                    onChange={(e) => setCompleteForm({ ...completeForm, batchNumber: e.target.value })}
                    placeholder="e.g. BATCH-7721"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Notes</label>
                <textarea
                  rows="2"
                  value={completeForm.notes}
                  onChange={(e) => setCompleteForm({ ...completeForm, notes: e.target.value })}
                  placeholder="Reaction notes or follow-up instructions..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Save as Completed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccinationsPage;
