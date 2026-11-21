'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Mail, Lock, User, Phone, ArrowRight, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      showToast('Name, email, and password are required', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setSubmitting(true);
    const { data, error } = await signup(email, password, fullName, phone);

    if (error) {
      showToast(error.message || 'Signup failed', 'error');
      setSubmitting(false);
    } else {
      showToast('Account registered successfully! Welcome to Noorzan.', 'success');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    }
  };

  return (
    <div className="bg-white min-h-[85vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md border border-gray-200 p-8 sm:p-10 space-y-6 shadow-sm">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">Join Noorzan</p>
          <h1 className="text-2xl font-black text-black tracking-tight">Create Account</h1>
          <p className="text-xs text-gray-500">Sign up to enjoy express checkout & track your orders</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-black block">Full Name *</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Fatima Ali"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-gray-300 py-3 pl-10 pr-4 text-xs font-medium text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
              />
              <User size={15} className="text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-black block">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 py-3 pl-10 pr-4 text-xs font-medium text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
              />
              <Mail size={15} className="text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-black block">Phone Number (Optional)</label>
            <div className="relative">
              <input
                type="tel"
                placeholder="0300-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 py-3 pl-10 pr-4 text-xs font-medium text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
              />
              <Phone size={15} className="text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-black block">Password (6+ chars) *</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 py-3 pl-10 pr-4 text-xs font-medium text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
              />
              <Lock size={15} className="text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
            Register Account
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-bold text-black hover:underline uppercase tracking-wider ml-1">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}