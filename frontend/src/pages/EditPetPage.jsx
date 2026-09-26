import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Upload } from 'lucide-react';
import api from '../services/api';

const EditPetPage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    petName: '',
    species: 'Dog',
    breed: '',
    dob: '',
    age: '',
    weight: '',
    gender: 'Male',
    vaccinated: 'Yes',
    photoUrl: '',
    emergencyPhone: '',
    secondaryPhone: '',
    homeCity: '',
    allergies: '',
    medicalAlerts: '',
    rewardAmount: '',
    lostMessage: '',
    notes: '',
  });

  const [petImageFile, setPetImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const res = await api.get(`/api/pet-profile/edit/${petId}`);
        if (res.data && res.data.success && res.data.pet) {
          const p = res.data.pet;
          setFormData({
            petName: p.petName || '',
            species: p.species || 'Dog',
            breed: p.breed || '',
            dob: p.dob ? p.dob.substring(0, 10) : '',
            age: p.age !== undefined && p.age !== null ? String(p.age) : '',
            weight: p.weight !== undefined && p.weight !== null ? String(p.weight) : '',
            gender: p.gender || 'Male',
            vaccinated: p.vaccinated || 'Yes',
            photoUrl: p.photoUrl || p.photo || '',
            emergencyPhone: p.emergencyPhone || '',
            secondaryPhone: p.secondaryPhone || '',
            homeCity: p.homeCity || '',
            allergies: p.allergies || '',
            medicalAlerts: p.medicalAlerts || '',
            rewardAmount: p.rewardAmount || '',
            lostMessage: p.lostMessage || '',
            notes: p.notes || '',
          });
          setPreviewUrl(p.photo || p.photoUrl || '');
        } else {
          navigate('/pet-profiles');
        }
      } catch (err) {
        console.error('Fetch edit pet error:', err);
        navigate('/pet-profiles');
      } finally {
        setLoading(false);
      }
    };

    fetchPetData();
  }, [petId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPetImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.petName.trim()) {
      setError('Pet name cannot be blank.');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (petImageFile) {
        data.append('petImage', petImageFile);
      }

      const res = await api.post(`/api/pet-profile/edit/${petId}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data && res.data.success) {
        navigate(`/pet-profile/${petId}`);
      } else {
        setError(res.data.message || 'Failed to update pet profile.');
      }
    } catch (err) {
      console.error('Update pet error:', err);
      setError(err.response?.data?.message || 'Error occurred while saving changes.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium text-sm">Loading pet details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to={`/pet-profile/${petId}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-amber-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Cancel & View Profile
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Edit Pet Profile: {formData.petName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Update identification, emergency numbers, and medical alerts.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Identity */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900">Basic Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Pet Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.petName}
                  onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Species</label>
                <select
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white text-sm"
                >
                  <option value="Dog">Dog 🐶</option>
                  <option value="Cat">Cat 🐱</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Breed</label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white text-sm"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Age (Years)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Vaccinated?</label>
                <select
                  value={formData.vaccinated}
                  onChange={(e) => setFormData({ ...formData, vaccinated: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white text-sm"
                >
                  <option value="Yes">Yes (Vaccinated)</option>
                  <option value="No">No / Not Yet</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Photo */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900">Pet Photo</h2>
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-gray-50 border border-gray-200">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Pet preview"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0"
                />
              )}
              <div className="space-y-2 w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200"
                />
                <input
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, photoUrl: e.target.value });
                    if (!petImageFile) setPreviewUrl(e.target.value);
                  }}
                  placeholder="Or enter photo URL"
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Emergency Tag */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900">Emergency Collar Tag Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Emergency Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Secondary Phone</label>
                <input
                  type="tel"
                  value={formData.secondaryPhone}
                  onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Home City</label>
                <input
                  type="text"
                  value={formData.homeCity}
                  onChange={(e) => setFormData({ ...formData, homeCity: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Medical Alerts */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900">Health Alerts & Notes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Allergies</label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Medical Alerts</label>
                <input
                  type="text"
                  value={formData.medicalAlerts}
                  onChange={(e) => setFormData({ ...formData, medicalAlerts: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">General Notes</label>
              <textarea
                rows="3"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white text-sm"
              ></textarea>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <Link
              to={`/pet-profile/${petId}`}
              className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving Changes...' : 'Save Updates'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPetPage;
