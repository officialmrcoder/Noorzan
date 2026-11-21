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
    <div className="bg-white min-h-[75vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md border border-gray-200 p-8 sm:p-10 space-y-6 shadow-sm">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">Account Recovery</p>
          <h1 className="text-2xl font-black text-black tracking-tight">Forgot Password</h1>
          <p className="text-xs text-gray-500">Enter your email and we will send you a reset link</p>
        </div>

        {success ? (
          <div className="bg-gray-50 border border-gray-300 p-5 text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-black">Check Your Email</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              We have sent a secure reset link to <strong className="text-black">{email}</strong>. Follow the instructions to set your new password.
            </p>
            <Link
              href="/auth/login"
              className="inline-block mt-2 text-xs font-bold uppercase tracking-wider text-black underline"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
              Send Reset Instructions
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="text-center pt-4 border-t border-gray-100">
          <Link
            href="/auth/login"
            className="text-xs font-bold uppercase tracking-wider text-black hover:underline inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={13} /> Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}