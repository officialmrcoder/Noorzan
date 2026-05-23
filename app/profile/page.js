/* app/profile/page.js */
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { isSupabaseConfigured } from '@/lib/mockData';
import { Loader2, Save, Upload, User, Mail, Phone, MapPin, Calendar, Check } from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  // Helper: upload avatar to Supabase storage
  const uploadAvatar = async (file, currentUrl) => {
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) {
        console.warn('Avatar upload skipped (bucket may not exist):', uploadError.message);
        // If bucket doesn't exist, just skip avatar upload and use current URL
        return currentUrl || '';
      }
      
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return data.publicUrl || currentUrl || '';
    } catch (err) {
      console.warn('Avatar upload skipped (non-critical):', err.message);
      // Return current URL if upload fails
      return currentUrl || '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    if (!fullName.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      let newAvatarUrl = avatarUrl;
      
      // Try to upload avatar if a new file was selected
      if (imageFile) {
        newAvatarUrl = await uploadAvatar(imageFile, avatarUrl);
      }

      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('users')
          .upsert({
            id: user.id,
            full_name: fullName,
            phone: phone || '',
            avatar_url: newAvatarUrl || null,
          })
          .eq('id', user.id);
        
        // If avatar_url column doesn't exist, try without it
        if (error && error.message && error.message.includes('avatar_url')) {
          console.warn('avatar_url column not found. Please run the migration.');
          const { error: retryError } = await supabase
            .from('users')
            .upsert({
              id: user.id,
              full_name: fullName,
              phone: phone || '',
            })
            .eq('id', user.id);
          
          if (retryError) throw retryError;
          showToast('Profile updated! (Note: Photo feature needs migration)', 'info');
        } else if (error) {
          throw error;
        } else {
          showToast('Profile updated successfully! ✓', 'success');
        }
      } else {
        showToast('Profile updated successfully! ✓', 'success');
      }

      // Refresh context profile (works for mock mode as well)
      await refreshProfile();
      setImageFile(null); // Clear the file after successful upload
    } catch (err) {
      console.error('Profile update error:', err);
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  const isAdmin = user.user_metadata?.role === 'admin';

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Your Profile</h1>
          <p className="text-indigo-100">{isAdmin ? 'Admin Account' : 'Manage your account information and settings'}</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Avatar and Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
              {/* Avatar Section */}
              <div className="text-center mb-6">
                {avatarUrl && avatarUrl.startsWith('blob:') === false ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-indigo-100"
                  />
                ) : avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile Preview"
                    className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-indigo-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mx-auto mb-4 border-4 border-indigo-100">
                    <User className="w-16 h-16 text-indigo-400" />
                  </div>
                )}
                
                <label className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg font-medium text-sm cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                        const preview = URL.createObjectURL(e.target.files[0]);
                        setAvatarUrl(preview);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Quick Info */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-gray-600">Account Active</span>
                </div>
                {isAdmin && (
                  <div className="mt-4 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold text-center">
                    ADMIN
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Edit Profile</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="email"
                      readOnly
                      value={user.email}
                      className="w-full pl-10 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 focus:outline-none"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">Email cannot be changed for security reasons</p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Account Information</h3>
                  
                  <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Account Type:</span>
                      <span className="font-medium text-gray-900">{isAdmin ? 'Admin' : 'Customer'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Member Since:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Account Status:</span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5 disabled:translate-y-0 disabled:shadow-none"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Additional Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-6">
              <h3 className="font-semibold text-blue-900 mb-2">🔒 Security Note</h3>
              <p className="text-sm text-blue-800">
                For your security, email and password cannot be changed here. Contact support if you need to update these details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

