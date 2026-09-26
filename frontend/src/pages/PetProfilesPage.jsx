import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  PlusCircle,
  Search,
  QrCode,
  Syringe,
  Activity,
  Edit,
  Printer,
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api';

const PetProfilesPage = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await api.get('/api/pet-profiles');
        if (res.data && res.data.success) {
          setPets(res.data.pets || []);
        }
      } catch (err) {
        console.error('Fetch pets error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  const filteredPets = pets.filter((p) =>
    (p.petName || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.breed || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.collarId || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium text-sm">Loading pet profiles...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            My Registered Pets
          </h1>
          <p className="text-sm text-gray-500">
            Manage your pet identification tags, health records, and emergency QR settings
          </p>
        </div>
        <Link
          to="/create-pet-profile"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm shadow-md transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Add New Pet
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, breed, or collar ID..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white text-sm"
        />
      </div>

      {filteredPets.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border-2 border-dashed border-gray-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {search ? 'No matching pets found' : 'No pets registered yet'}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
              {search
                ? 'Try a different search term or check spelling.'
                : 'Register your dog to generate an emergency QR collar tag and start digital tracking.'}
            </p>
          </div>
          {!search && (
            <Link
              to="/create-pet-profile"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm shadow-md"
            >
              <PlusCircle className="w-4 h-4" /> Register Pet Free
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map((pet) => (
            <div
              key={pet._id}
              className="bg-white rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Pet Card Header */}
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <img
                      src={pet.photo || pet.photoUrl || '/uploads/pets/default-pet.png'}
                      alt={pet.petName}
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80';
                      }}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-sm"
                    />
                    <div>
                      <h3 className="font-bold text-xl text-gray-900">{pet.petName}</h3>
                      <p className="text-xs text-gray-500">
                        {pet.breed || 'Dog'} • {pet.gender || 'Male'}
                      </p>
                      <p className="text-xs text-gray-600 font-medium mt-0.5">
                        {pet.age ? `${pet.age} years old` : 'Age N/A'} • {pet.weight ? `${pet.weight} kg` : 'Weight N/A'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      pet.isLost ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {pet.isLost ? '🚨 LOST' : '✓ SAFE'}
                  </span>
                </div>

                {/* Collar Tag Box */}
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-amber-700" />
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase font-bold">Collar Tag ID</span>
                      <span className="font-mono font-bold text-gray-800">{pet.collarId || 'WF-TAG'}</span>
                    </div>
                  </div>
                  <Link
                    to={`/pet-profile/${pet._id}/print-tag`}
                    className="p-2 rounded-xl bg-white hover:bg-amber-100 text-amber-800 font-semibold border border-amber-200 flex items-center gap-1 transition-colors"
                    title="Print Collar Tag"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </Link>
                </div>

                {/* Medical alert warning if any */}
                {(pet.allergies || pet.medicalAlerts) && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="truncate">
                      Alerts: {pet.medicalAlerts || pet.allergies}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Quick Links Grid */}
              <div className="bg-gray-50 p-4 border-t border-gray-100 grid grid-cols-4 gap-2 text-center text-xs font-semibold">
                <Link
                  to={`/pet-profile/${pet._id}`}
                  className="py-2 px-1 rounded-xl bg-white hover:bg-amber-50 text-gray-700 hover:text-amber-800 border border-gray-200 transition-colors"
                >
                  Profile
                </Link>
                <Link
                  to={`/vaccinations/${pet._id}`}
                  className="py-2 px-1 rounded-xl bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-800 border border-gray-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Syringe className="w-3.5 h-3.5 text-blue-500" /> Vaccines
                </Link>
                <Link
                  to={`/track/${pet._id}`}
                  className="py-2 px-1 rounded-xl bg-white hover:bg-purple-50 text-gray-700 hover:text-purple-800 border border-gray-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Activity className="w-3.5 h-3.5 text-purple-500" /> Logs
                </Link>
                <Link
                  to={`/pet-profile/edit/${pet._id}`}
                  className="py-2 px-1 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5 text-gray-500" /> Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PetProfilesPage;
