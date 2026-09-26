import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  User,
  Lock,
  Trash2,
  Shield,
  Syringe,
  Activity,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import api from '../services/api';

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ petCount: 0, vaccineCount: 0, recordCount: 0 });
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [profileMsg, setProfileMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/api/settings');
        if (res.data && res.data.success) {
          if (res.data.stats) setStats(res.data.stats);
          if (res.data.user?.fullName) setFullName(res.data.user.fullName);
        }
      } catch (err) {
        console.error('Fetch settings error:', err);
      }
    };

    fetchSettings();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setSubmittingProfile(true);

    try {
      const res = await api.post('/api/settings/update-profile', { fullName });
      if (res.data && res.data.success) {
        setProfileMsg({ type: 'success', text: res.data.message });
        if (res.data.user) updateUser(res.data.user);
      } else {
        setProfileMsg({ type: 'error', text: res.data.message || 'Failed to update profile.' });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Error occurred.' });
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setSubmittingPassword(true);
    try {
      const res = await api.post('/api/settings/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (res.data && res.data.success) {
        setPasswordMsg({ type: 'success', text: res.data.message });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ type: 'error', text: res.data.message || 'Failed to change password.' });
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Error occurred.' });
    } finally {
      setSubmittingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setSubmittingDelete(true);

    try {
      const res = await api.post('/api/settings/delete-account', {
        password: deletePassword,
        confirmDelete: deletePassword,
      });

      if (res.data && res.data.success) {
        await logout();
        navigate('/?accountDeleted=true');
      } else {
        setDeleteError(res.data.message || 'Failed to delete account.');
      }
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Incorrect confirmation password.');
    } finally {
      setSubmittingDelete(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="space-y-1 pb-4 border-b border-gray-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-amber-600" />
          Account & Profile Settings
        </h1>
        <p className="text-sm text-gray-500">
          Manage your personal credentials, contact name, and security preferences.
        </p>
      </div>

      {/* Account Overview Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-center space-y-1">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-amber-950 block">{stats.petCount}</span>
          <span className="text-xs font-semibold text-amber-800">Protected Pets</span>
        </div>

        <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 text-center space-y-1">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mx-auto">
            <Syringe className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-blue-950 block">{stats.vaccineCount}</span>
          <span className="text-xs font-semibold text-blue-800">Vaccine Records</span>
        </div>

        <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 text-center space-y-1">
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mx-auto">
            <Activity className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-purple-950 block">{stats.recordCount}</span>
          <span className="text-xs font-semibold text-purple-800">Care Logs</span>
        </div>
      </div>

      {/* Profile Details Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5 text-amber-600" />
          Profile Information
        </h2>

        {profileMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              profileMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {profileMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{profileMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Registered Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Email address cannot be changed</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submittingProfile}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
          >
            {submittingProfile ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-600" />
          Update Security Password
        </h2>

        {passwordMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              passwordMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {passwordMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full sm:w-1/2 px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submittingPassword}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
          >
            {submittingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="bg-red-50/50 rounded-3xl p-6 sm:p-8 border border-red-200 space-y-4">
        <h2 className="text-base font-bold text-red-900 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-600" />
          Danger Zone
        </h2>
        <p className="text-xs text-red-700 leading-relaxed max-w-xl">
          Permanently delete your account and all associated pet records, smart QR tags, and medical logs.
          This action cannot be undone.
        </p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors"
        >
          Delete Account Permanently
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-gray-900">Confirm Account Deletion</h3>
              <p className="text-xs text-gray-500">
                Please enter your password (or type DELETE) to confirm permanent deletion of your account and all pet records.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
                {deleteError}
              </div>
            )}

            <div>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter password to confirm"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={submittingDelete || !deletePassword}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md disabled:opacity-50"
              >
                {submittingDelete ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
