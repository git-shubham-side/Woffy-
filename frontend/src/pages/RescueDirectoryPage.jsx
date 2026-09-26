import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Search,
  MapPin,
  Clock,
  Shield,
  Building,
  Heart,
  PlusCircle,
  X,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';

const RescueDirectoryPage = () => {
  const [rescueServices, setRescueServices] = useState([]);
  const [cities, setCities] = useState(['All', 'Mumbai', 'Pune', 'Delhi', 'Bengaluru']);
  const [categories, setCategories] = useState(['All']);
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Shelter Registration Modal
  const [showShelterModal, setShowShelterModal] = useState(false);
  const [shelterForm, setShelterForm] = useState({
    orgName: '',
    email: '',
    phone: '',
    city: '',
    animalCount: '50-100',
    neededFeatures: '',
  });
  const [shelterSubmitting, setShelterSubmitting] = useState(false);
  const [shelterFeedback, setShelterFeedback] = useState(null);

  const fetchRescue = async () => {
    try {
      const res = await api.get(
        `/api/rescue?city=${encodeURIComponent(selectedCity)}&orgType=${encodeURIComponent(
          selectedType
        )}&search=${encodeURIComponent(search)}`
      );
      if (res.data && res.data.success) {
        setRescueServices(res.data.rescueServices || []);
        if (res.data.cities) setCities(['All', ...res.data.cities.filter((c) => c !== 'All')]);
        if (res.data.categories) setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Fetch rescue services error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRescue();
  }, [selectedCity, selectedType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRescue();
  };

  const handleShelterSubmit = async (e) => {
    e.preventDefault();
    setShelterSubmitting(true);
    setShelterFeedback(null);
    try {
      const res = await api.post('/api/shelter-waitlist', shelterForm);
      if (res.data && res.data.success) {
        setShelterFeedback({ type: 'success', text: res.data.message });
        setShelterForm({
          orgName: '',
          email: '',
          phone: '',
          city: '',
          animalCount: '50-100',
          neededFeatures: '',
        });
      } else {
        setShelterFeedback({ type: 'error', text: res.data.message || 'Failed to submit registration.' });
      }
    } catch (err) {
      setShelterFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Error occurred while submitting.',
      });
    } finally {
      setShelterSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
            <PhoneCall className="w-3.5 h-3.5" /> 24/7 Verified Emergency Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Animal Rescue Helplines & Ambulances
          </h1>
          <p className="text-red-100 text-sm sm:text-base leading-relaxed">
            Find immediate medical help for injured strays, emergency animal ambulances, and verified NGO shelters
            across Indian cities.
          </p>
        </div>

        <button
          onClick={() => setShowShelterModal(true)}
          className="px-6 py-3 rounded-2xl bg-white text-red-700 hover:bg-red-50 font-extrabold text-sm shadow-md transition-all shrink-0 flex items-center gap-2"
        >
          <Building className="w-4 h-4" /> Register NGO / Shelter
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by shelter name, area, or service (e.g., Ambulance)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 bg-white text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-xs transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700 uppercase">City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white font-medium text-gray-800"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700 uppercase">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white font-medium text-gray-800"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Directory Cards */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-500 text-xs font-semibold">Filtering verified rescue centers...</p>
        </div>
      ) : rescueServices.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-gray-200 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <PhoneCall className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No rescue organizations matched</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your city filter or search terms. You can also register a verified local shelter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rescueServices.map((org) => (
            <div
              key={org._id}
              className="bg-white rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-red-50 text-red-700">
                      {org.orgType || 'NGO'}
                    </span>
                    <h3 className="font-extrabold text-lg text-gray-900 mt-1">{org.name}</h3>
                  </div>
                  {org.is24x7 && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 shrink-0">
                      24/7 Live
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600 flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>
                    {org.address}, <strong className="text-gray-900">{org.city}</strong>
                  </span>
                </p>

                {org.services && org.services.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {org.services.map((svc, i) => (
                      <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                        {svc}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Direct Call Button */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <a
                  href={`tel:${org.phone || org.emergencyHelpline}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <PhoneCall className="w-4 h-4" />
                  Call Helpline: {org.phone || org.emergencyHelpline}
                </a>

                {org.googleMapsUrl && (
                  <a
                    href={org.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-center block text-[11px] font-semibold text-gray-500 hover:text-red-600"
                  >
                    Open in Google Maps →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shelter Registration Modal */}
      {showShelterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Register Shelter or NGO</h3>
                <p className="text-xs text-gray-500">Join the Woffy Verified Emergency Animal Care Directory</p>
              </div>
              <button onClick={() => setShowShelterModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {shelterFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  shelterFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {shelterFeedback.text}
              </div>
            )}

            <form onSubmit={handleShelterSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Organization / Shelter Name *</label>
                <input
                  type="text"
                  required
                  value={shelterForm.orgName}
                  onChange={(e) => setShelterForm({ ...shelterForm, orgName: e.target.value })}
                  placeholder="e.g. Paws Animal Welfare Society"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={shelterForm.email}
                    onChange={(e) => setShelterForm({ ...shelterForm, email: e.target.value })}
                    placeholder="contact@shelter.org"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Emergency Phone *</label>
                  <input
                    type="tel"
                    required
                    value={shelterForm.phone}
                    onChange={(e) => setShelterForm({ ...shelterForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">City / Region *</label>
                  <input
                    type="text"
                    required
                    value={shelterForm.city}
                    onChange={(e) => setShelterForm({ ...shelterForm, city: e.target.value })}
                    placeholder="e.g. Pune, Maharashtra"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Animal Capacity</label>
                  <select
                    value={shelterForm.animalCount}
                    onChange={(e) => setShelterForm({ ...shelterForm, animalCount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  >
                    <option value="1-20">1 - 20 Animals</option>
                    <option value="20-50">20 - 50 Animals</option>
                    <option value="50-100">50 - 100 Animals</option>
                    <option value="100+">100+ Animals</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Services Offered</label>
                <textarea
                  rows="2"
                  value={shelterForm.neededFeatures}
                  onChange={(e) => setShelterForm({ ...shelterForm, neededFeatures: e.target.value })}
                  placeholder="e.g. 24/7 Ambulance, In-patient surgery, dog adoption sanctuary..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowShelterModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={shelterSubmitting}
                  className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  {shelterSubmitting ? 'Submitting...' : 'Register Organization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RescueDirectoryPage;
