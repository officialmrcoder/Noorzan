'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Phone: only digits, max 11
  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
    setPhone(digits);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password) {
      showToast('Name, email, and password are required', 'error');
      return;
    }

    // Phone: required, exactly 11 digits
    if (!phone || phone.length !== 11) {
      showToast('Phone number must be exactly 11 digits (e.g. 03001234567)', 'error');
      return;
    }

    // Password: minimum 8 characters
    if (password.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }

    // Password strength: at least one letter and one number
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      showToast('Password must contain at least one letter and one number', 'error');
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

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return null;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    const len = password.length;
    if (len >= 8 && hasLetter && hasNumber && hasSpecial) return { label: 'Strong', color: 'bg-green-500', width: 'w-full' };
    if (len >= 8 && hasLetter && hasNumber) return { label: 'Good', color: 'bg-yellow-400', width: 'w-2/3' };
    if (len >= 8) return { label: 'Weak', color: 'bg-orange-400', width: 'w-1/3' };
    return { label: 'Too Short', color: 'bg-red-400', width: 'w-1/4' };
  };

  const strength = getPasswordStrength();

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

          {/* Phone — Required, exactly 11 digits */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-black block">
              Phone Number * <span className="text-gray-400 font-normal normal-case">(11 digits)</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                inputMode="numeric"
                placeholder="03001234567"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={11}
                className={`w-full border py-3 pl-10 pr-14 text-xs font-medium text-black placeholder-gray-400 focus:outline-none transition-colors ${
                  phone.length > 0 && phone.length !== 11
                    ? 'border-red-400 focus:border-red-500'
                    : phone.length === 11
                    ? 'border-green-400 focus:border-green-500'
                    : 'border-gray-300 focus:border-black'
                }`}
              />
              <Phone size={15} className="text-gray-400 absolute left-3.5 top-3.5" />
              <span className={`absolute right-3.5 top-3 text-[10px] font-bold ${phone.length === 11 ? 'text-green-500' : 'text-gray-400'}`}>
                {phone.length}/11
              </span>
            </div>
            {phone.length > 0 && phone.length !== 11 && (
              <p className="text-[11px] text-red-500 font-medium">Must be exactly 11 digits (e.g. 03001234567)</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-black block">
              Password * <span className="text-gray-400 font-normal normal-case">(min 8 chars)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 py-3 pl-10 pr-10 text-xs font-medium text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
              />
              <Lock size={15} className="text-gray-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-black transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {/* Strength bar */}
            {strength && (
              <div className="space-y-1 pt-1">
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                </div>
                <p className={`text-[11px] font-bold ${
                  strength.label === 'Strong' ? 'text-green-600' :
                  strength.label === 'Good' ? 'text-yellow-600' :
                  strength.label === 'Weak' ? 'text-orange-500' : 'text-red-500'
                }`}>
                  Password Strength: {strength.label}
                </p>
              </div>
            )}
            <p className="text-[11px] text-gray-400">Use letters + numbers for a stronger password</p>
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