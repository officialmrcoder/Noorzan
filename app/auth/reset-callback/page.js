'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function ResetCallback() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Authenticated session established by token link, redirect to reset form
        router.push('/auth/reset-password');
      } else {
        // Fallback if session is missing
        router.push('/auth/login');
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="max-w-md mx-auto my-32 text-center space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
      <p className="text-sm font-semibold text-gray-600">Verifying security token...</p>
    </div>
  );
}
