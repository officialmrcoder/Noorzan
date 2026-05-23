'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Mail, KeyRound, ArrowLeft, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address', 'error');
      return;
    }

    setSubmitting(true);
    const { error } = await resetPassword(email);

    if (error) {
      showToast(error.message || 'Failed to send reset email', 'error');
      setSubmitting(false);
    } else {
      showToast('Password reset link sent to your email!', 'success');
      setSuccess(true);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Forgot Password</h1>
          <p className="text-sm text-gray-500 mt-1.5">Reset your account password with ease</p>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center space-y-3">
            <p className="text-sm font-semibold text-emerald-800">Check Your Email</p>
            <p className="text-xs text-emerald-600 leading-relaxed">
              We have sent a secure password reset link to <strong className="text-emerald-800">{email}</strong>. Please follow the link to set a new password.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Sending link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>

          </form>
        )}

        {/* Back Link */}
        <div className="text-center pt-2">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}
