import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Shield, Save, Globe, Camera, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfileSettings = () => {
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    profile_picture_url: ''
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

  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, profile_picture_url: reader.result }));
        toast.success("Profile picture loaded! Save changes to apply.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.post('?action=update_profile', {
        full_name: profile.full_name,
        phone: profile.phone,
        profile_picture_url: profile.profile_picture_url || ''
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
              <h2 className="text-xl font-bold text-chase-navy">Additional Details</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="opacity-80">
                <Input
                  label="Account Type"
                  value={profile.account_type || 'Savings Account'}
                  readOnly
                />
              </div>
              <div className="opacity-80">
                <Input
                  label="Occupation"
                  value={profile.occupation || 'N/A'}
                  readOnly
                />
              </div>
              <div className="opacity-80">
                <Input
                  label="State"
                  value={profile.state || 'N/A'}
                  readOnly
                />
              </div>
              <div className="opacity-80">
                <Input
                  label="Zipcode"
                  value={profile.zipcode || 'N/A'}
                  readOnly
                />
              </div>
              <div className="opacity-80">
                <Input
                  label="Date of Birth"
                  value={profile.date_of_birth || 'N/A'}
                  readOnly
                />
              </div>
              <div className="opacity-80">
                <Input
                  label="Sex"
                  value={profile.sex || 'N/A'}
                  readOnly
                />
              </div>
            </div>
          </section>

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

          <section className="bg-white p-6 rounded-2xl border border-chase-border shadow-sm hidden md:block">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-chase-light rounded-lg text-chase-blue">
                <Globe size={20} />
              </div>
              <h2 className="text-xl font-bold text-chase-navy">E Transfer</h2>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div>
                <h4 className="font-bold text-chase-navy">External Bank Transfer</h4>
                <p className="text-sm text-gray-500">Send money to other banks worldwide.</p>
              </div>
              <Link to="/transfer/send?type=external">
                <Button variant="secondary">
                  Start Transfer
                </Button>
              </Link>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-chase-navy p-6 rounded-2xl text-white text-center sm:text-left flex flex-col items-center sm:items-start">
            <div className="relative group w-20 h-20 rounded-full overflow-hidden border-2 border-orange-500 shadow-md mb-4 bg-chase-blue flex items-center justify-center">
              {profile.profile_picture_url ? (
                <img
                  src={profile.profile_picture_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-black text-white">{profile.full_name.charAt(0)}</span>
              )}
              <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera size={18} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureUpload}
                />
              </label>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold">{profile.full_name}</h3>
              <p className="text-white/60 text-sm mb-2">{profile.email}</p>

              <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/25 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors mb-4">
                <UploadCloud size={12} /> Change Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureUpload}
                />
              </label>
            </div>
            <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider">
              {profile.role}
            </div>
            <div className="mt-6 pt-6 border-t border-white/10 w-full text-center sm:text-left">
              <p className="text-xs text-white/40">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
