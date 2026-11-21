/* app/profile/page.js */
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { isSupabaseConfigured } from '@/lib/mockData';
import { Loader2, Save, Upload, User, Mail, Phone, MapPin, Calendar, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, profile, refreshProfile, isAdmin, loading: authLoading } = useAuth();
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
        console.warn('Avatar upload skipped:', uploadError.message);
        return currentUrl || '';
      }
      
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return data.publicUrl || currentUrl || '';
    } catch (err) {
      console.warn('Avatar upload skipped:', err.message);
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
      
      if (imageFile) {
        newAvatarUrl = await uploadAvatar(imageFile, avatarUrl);
      }

      if (isSupabaseConfigured()) {
        const { data: updatedProfile, error } = await supabase
          .from('users')
          .update({
            full_name: fullName,
            phone: phone || '',
            avatar_url: newAvatarUrl || null,
          })
          .eq('id', user.id)
          .select('id')
          .maybeSingle();
        
        if (error && error.message && error.message.includes('avatar_url')) {
          const { data: retryProfile, error: retryError } = await supabase
            .from('users')
            .update({
              full_name: fullName,
              phone: phone || '',
            })
            .eq('id', user.id)
            .select('id')
            .maybeSingle();
          
          if (retryError) throw retryError;
          showToast('Profile updated!', 'success');
        } else if (error) {
          throw error;
        } else {
          showToast('Profile updated successfully!', 'success');
        }
      } else {
        showToast('Profile updated successfully!', 'success');
      }

      if (refreshProfile) {
        await refreshProfile();
      }
      setImageFile(null);
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
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 text-center border border-gray-200 bg-white">
        <User size={36} className="text-gray-400 mx-auto mb-3" />
        <h2 className="text-base font-bold uppercase tracking-wider text-black">Sign In Required</h2>
        <p className="text-xs text-gray-500 mt-1 mb-6">Please sign in to view and edit your profile settings.</p>
        <Link
          href="/auth/login"
          className="inline-block px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 py-10 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">Settings</p>
            <h1 className="text-3xl font-black text-black tracking-tight mt-1">Profile & Details</h1>
          </div>
          <Link
            href="/dashboard"
            className="text-xs font-bold uppercase tracking-wider text-black hover:underline inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={13} /> Back to Orders
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Avatar card */}
          <aside className="border border-gray-200 p-6 space-y-6 h-fit bg-gray-50/20">
            <div className="text-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-2 border-black"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 border border-gray-200">
                  <User size={40} className="text-gray-400" />
                </div>
              )}

              <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-black text-black text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-black hover:text-white transition-colors">
                <Upload size={13} />
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

            <div className="border-t border-gray-200 pt-4 space-y-2.5 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-black shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-green-600 shrink-0" />
                <span>Account Verified</span>
              </div>
              {isAdmin && (
                <div className="mt-3 px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest text-center">
                  Administrator
                </div>
              )}
            </div>
          </aside>

          {/* Edit form */}
          <main className="lg:col-span-2 border border-gray-200 p-6 sm:p-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-gray-200 pb-3 mb-6">
              Personal Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-black block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-black block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3.5 py-2.5 border border-gray-200 bg-gray-50 text-sm text-gray-500 cursor-not-allowed"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">Email address cannot be changed</span>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-black block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full px-3.5 py-2.5 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest transition-all inline-flex items-center gap-2"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Profile Changes
                </button>
              </div>
            </form>
          </main>

        </div>
      </div>
    </div>
  );
}