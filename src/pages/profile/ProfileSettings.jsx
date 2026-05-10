import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Shield, Save } from 'lucide-react';

const ProfileSettings = () => {
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('', { params: { action: 'get_profile' } });
      if (res.data.status === 'success') {
        setProfile(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.get('', {
        params: {
          action: 'update_profile',
          full_name: profile.full_name,
          phone: profile.phone
        }
      });
      if (res.data.status === 'success') {
        toast.success('Profile updated successfully');
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-chase-navy">Profile Settings</h1>
        <p className="text-gray-500">Manage your personal information and account security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-6 rounded-2xl border border-chase-border shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-chase-light rounded-lg text-chase-blue">
                <User size={20} />
              </div>
              <h2 className="text-xl font-bold text-chase-navy">Personal Information</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                icon={User}
              />
              <div className="opacity-60 cursor-not-allowed">
                <Input
                  label="Email Address (Verified)"
                  value={profile.email}
                  readOnly
                  icon={Mail}
                />
              </div>
              <Input
                label="Phone Number"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                icon={Phone}
              />

              <div className="pt-4">
                <Button type="submit" loading={saving} className="w-full md:w-auto">
                  <Save className="mr-2" size={18} /> Save Changes
                </Button>
              </div>
            </form>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-chase-border shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-chase-light rounded-lg text-chase-blue">
                <Shield size={20} />
              </div>
              <h2 className="text-xl font-bold text-chase-navy">Security</h2>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div>
                <h4 className="font-bold text-chase-navy">Transaction PIN</h4>
                <p className="text-sm text-gray-500">Required for all transfers and card reveals.</p>
              </div>
              <Button variant="secondary" onClick={() => window.location.href='/profile/pin'}>
                Change PIN
              </Button>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-chase-navy p-6 rounded-2xl text-white">
            <div className="w-16 h-16 bg-chase-blue rounded-full flex items-center justify-center text-2xl font-black mb-4">
              {profile.full_name.charAt(0)}
            </div>
            <h3 className="text-xl font-bold">{profile.full_name}</h3>
            <p className="text-white/60 text-sm mb-4">{profile.email}</p>
            <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider">
              {profile.role}
            </div>
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-white/40">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
