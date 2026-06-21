import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/index.js';
import { CheckCircle2 } from 'lucide-react';

const Profile = () => {
  const { user, login } = useAuth();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        setName(res.data.name || '');
        setPhoneNumber(res.data.phoneNumber || '');
        setAddress(res.data.address || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      const res = await api.put('/users/profile', { name, phoneNumber, address });
      const token = localStorage.getItem('token');
      login(res.data, token);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    setPasswordLoading(true);

    try {
      await api.put('/users/password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-[#6B7280]">Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Profile</h1>
        <p className="text-[#6B7280] mt-1">Manage your personal details</p>
      </div>

      <div className="max-w-lg space-y-6">

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-semibold text-xl">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-[#111827]">{user?.email}</p>
              <p className="text-sm text-[#6B7280]">Flo member</p>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 text-[#00C48C] text-sm px-4 py-3 rounded-lg mb-4">
              <CheckCircle2 size={16} />
              Profile updated
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">Phone number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="07123 456789"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 High Street, London"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
          <h3 className="font-semibold text-[#111827] mb-4">Change password</h3>

          {passwordError && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{passwordError}</div>}
          {passwordSuccess && (
            <div className="flex items-center gap-2 bg-green-50 text-[#00C48C] text-sm px-4 py-3 rounded-lg mb-4">
              <CheckCircle2 size={16} />
              Password updated
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-white border border-[#E5E7EB] hover:bg-[#F4F6FA] disabled:opacity-50 text-[#111827] font-semibold py-3 rounded-xl transition cursor-pointer"
            >
              {passwordLoading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Profile;