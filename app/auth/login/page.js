'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in both email and password', 'error');
      return;
    }

    setSubmitting(true);
    const { data, error } = await login(email, password);

    if (error) {
      showToast(error.message || 'Invalid email or password', 'error');
      setSubmitting(false);
    } else {
      showToast('Welcome back! Sign in successful', 'success');

      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';
      const destination = email.toLowerCase() === adminEmail.toLowerCase() ? '/admin' : '/dashboard';

      setTimeout(() => {
        router.push(destination);
        router.refresh();
      }, 500);
    }
  };

  return (
    <div className="bg-white min-h-[80vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md border border-gray-200 p-8 sm:p-10 space-y-6 shadow-sm">

        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">Account Access</p>
          <h1 className="text-2xl font-black text-black tracking-tight">Sign In</h1>
          <p className="text-xs text-gray-500">Access your Noorzan account, orders & wishlist</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-black block">Email Address</label>
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

          {/* Password with show/hide toggle */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-black block">Password</label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-gray-400 hover:text-black underline transition-colors"
              >
                Forgot?
              </Link>
            </div>
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
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
            Sign In To Account
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="font-bold text-black hover:underline uppercase tracking-wider ml-1">
              Create One
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}