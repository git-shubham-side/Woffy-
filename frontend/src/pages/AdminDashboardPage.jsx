import React, { useState, useEffect } from 'react';
import {
  Lock,
  Building,
  ShoppingBag,
  Shield,
  PhoneCall,
  Check,
  X,
  Trash2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';

const AdminDashboardPage = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [data, setData] = useState({
    stats: {},
    pendingApplications: [],
    approvedHospitals: [],
    rejectedApplications: [],
    rescueServices: [],
    products: [],
    pendingProductRequests: [],
    rejectedProductRequests: [],
    shelterRequests: [],
  });
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState(null);

  const fetchAdminData = async () => {
    try {
      const res = await api.get('/api/admin');
      if (res.data && res.data.success) {
        setData({
          stats: res.data.stats || {},
          pendingApplications: res.data.pendingApplications || [],
          approvedHospitals: res.data.approvedHospitals || [],
          rejectedApplications: res.data.rejectedApplications || [],
          rescueServices: res.data.rescueServices || [],
          products: res.data.products || [],
          pendingProductRequests: res.data.pendingProductRequests || [],
          rejectedProductRequests: res.data.rejectedProductRequests || [],
          shelterRequests: res.data.shelterRequests || [],
        });
      }
    } catch (err) {
      console.error('Fetch admin error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Hospital actions
  const handleApproveHospital = async (id) => {
    try {
      const res = await api.post(`/api/admin/hospitals/approve/${id}`);
      setActionFeedback({ type: 'success', text: res.data.message || 'Hospital approved!' });
      fetchAdminData();
    } catch (err) {
      alert('Failed to approve hospital.');
    }
  };

  const handleRejectHospital = async (id) => {
    const reason = window.prompt('Enter rejection reason:');
    if (reason === null) return;
    try {
      const res = await api.post(`/api/admin/hospitals/reject/${id}`, { reason });
      setActionFeedback({ type: 'success', text: res.data.message || 'Hospital rejected.' });
      fetchAdminData();
    } catch (err) {
      alert('Failed to reject hospital.');
    }
  };

  // Product actions
  const handleApproveProduct = async (id) => {
    try {
      const res = await api.post(`/api/admin/products/approve/${id}`);
      setActionFeedback({ type: 'success', text: res.data.message || 'Product approved!' });
      fetchAdminData();
    } catch (err) {
      alert('Failed to approve product.');
    }
  };

  const handleRejectProduct = async (id) => {
    try {
      const res = await api.post(`/api/admin/products/reject/${id}`);
      setActionFeedback({ type: 'success', text: res.data.message || 'Product rejected.' });
      fetchAdminData();
    } catch (err) {
      alert('Failed to reject product.');
    }
  };

  const handleToggleProductStock = async (id) => {
    try {
      const res = await api.post(`/api/admin/products/toggle-stock/${id}`);
      fetchAdminData();
    } catch (err) {
      alert('Failed to toggle product stock.');
    }
  };

  // Shelter actions
  const handleUpdateShelterStatus = async (id, status) => {
    try {
      const res = await api.post(`/api/admin/shelters/update-status/${id}`, { status });
      fetchAdminData();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium text-sm">Loading admin platform console...</p>
      </div>
    );
  }

  const {
    stats,
    pendingApplications,
    approvedHospitals,
    rescueServices,
    products,
    pendingProductRequests,
    shelterRequests,
  } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" /> Company Administrator Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Woffy Operations Control</h1>
          <p className="text-xs sm:text-sm text-indigo-200">
            Review hospital registrations, moderate marketplace products, and manage rescue services.
          </p>
        </div>
      </div>

      {actionFeedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-sm font-semibold ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{actionFeedback.text}</span>
          <button onClick={() => setActionFeedback(null)} className="text-xs underline font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-200 text-xs font-bold">
        {[
          { id: 'overview', label: 'Overview Metrics' },
          { id: 'hospitals', label: `Hospitals (${pendingApplications.length} Pending)` },
          { id: 'products', label: `Products (${pendingProductRequests.length} Pending)` },
          { id: 'shelters', label: `Shelter Requests (${shelterRequests.length})` },
          { id: 'rescue', label: `Rescue Directory (${rescueServices.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`px-4 py-2.5 rounded-xl transition-all ${
              activeSection === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION: Overview */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-1">
              <span className="text-3xl font-black text-indigo-600 block">
                {stats.pendingHospitals || 0}
              </span>
              <span className="text-xs font-bold text-gray-500 uppercase">Pending Hospitals</span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-1">
              <span className="text-3xl font-black text-amber-500 block">
                {stats.pendingProductsCount || 0}
              </span>
              <span className="text-xs font-bold text-gray-500 uppercase">Pending Products</span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-1">
              <span className="text-3xl font-black text-purple-600 block">
                {stats.sheltersTotal || 0}
              </span>
              <span className="text-xs font-bold text-gray-500 uppercase">Shelter Requests</span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-1">
              <span className="text-3xl font-black text-emerald-600 block">
                {stats.approvedHospitals || 0}
              </span>
              <span className="text-xs font-bold text-gray-500 uppercase">Verified Hospitals</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: Hospitals Management */}
      {activeSection === 'hospitals' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900">
            Pending Hospital Partner Registrations ({pendingApplications.length})
          </h2>

          {pendingApplications.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white border border-gray-200 text-center text-xs text-gray-500">
              ✓ No pending hospital verification requests at this time.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApplications.map((h) => (
                <div
                  key={h._id}
                  className="bg-white rounded-2xl p-6 border border-amber-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base text-gray-900">{h.name}</h4>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        Pending
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      📍 {h.address}, <strong>{h.city}</strong> • Phone: <strong className="font-mono">{h.phone}</strong>
                    </p>
                    <p className="text-xs text-gray-500">
                      Contact: {h.contactPerson || 'N/A'} ({h.contactRole || 'Role N/A'}) • Email: {h.email || 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveHospital(h._id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve & Verify
                    </button>
                    <button
                      onClick={() => handleRejectHospital(h._id)}
                      className="px-4 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 font-bold text-xs flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION: Products Management */}
      {activeSection === 'products' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900">
            Pending Marketplace Products ({pendingProductRequests.length})
          </h2>

          {pendingProductRequests.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white border border-gray-200 text-center text-xs text-gray-500">
              ✓ No pending product listing requests.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pendingProductRequests.map((p) => (
                <div
                  key={p._id}
                  className="bg-white rounded-2xl p-5 border border-amber-200 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover border" />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-amber-700">{p.category}</span>
                      <h4 className="font-bold text-sm text-gray-900">{p.name}</h4>
                      <p className="text-xs font-black text-gray-900 mt-0.5">₹{p.price}</p>
                      <p className="text-[11px] text-gray-500 line-clamp-1">{p.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleApproveProduct(p._id)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      Approve Listing
                    </button>
                    <button
                      onClick={() => handleRejectProduct(p._id)}
                      className="px-3.5 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-bold text-xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION: Shelter Alpha Pilot Requests */}
      {activeSection === 'shelters' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900">
            Shelter & NGO Alpha Pilot Registrations ({shelterRequests.length})
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {shelterRequests.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-900">{s.orgName}</td>
                    <td className="py-3 px-4">{s.email}</td>
                    <td className="py-3 px-4 font-mono">{s.phone}</td>
                    <td className="py-3 px-4">{s.city}</td>
                    <td className="py-3 px-4">{s.animalCount}</td>
                    <td className="py-3 px-4">
                      <span className="capitalize font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleUpdateShelterStatus(s._id, 'approved')}
                        className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold text-[10px]"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateShelterStatus(s._id, 'contacted')}
                        className="px-2.5 py-1 rounded-md bg-amber-500 text-white font-bold text-[10px]"
                      >
                        Contacted
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION: Rescue Directory Management */}
      {activeSection === 'rescue' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">
            Active Verified Rescue Services ({rescueServices.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rescueServices.map((r) => (
              <div key={r._id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs space-y-2">
                <span className="text-[10px] font-bold uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                  {r.orgType}
                </span>
                <h4 className="font-bold text-sm text-gray-900">{r.name}</h4>
                <p className="text-xs text-gray-500">{r.city}, {r.address}</p>
                <p className="text-xs font-mono font-bold text-gray-800">📞 {r.phone}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
