'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.warn('Profile not found, creating a basic profile row...');
        // If profile row doesn't exist, create it manually as fallback
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          const newProfile = {
            id: currentUser.id,
            full_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || '',
            email: currentUser.email,
            phone: currentUser.user_metadata?.phone || '',
            is_admin: currentUser.email === (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com')
          };
          
          const { data: insertedData, error: insertError } = await supabase
            .from('users')
            .upsert(newProfile)
            .select()
            .single();
          
          if (!insertError && insertedData) {
            setProfile(insertedData);
            return;
          }
        }
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Error getting initial session:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signup = async (email, password, fullName, phone) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || '',
          },
        },
      });
      if (error) throw error;

      // If user is returned, create a profile immediately to bypass trigger latency
      if (data?.user) {
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';
        const isAdmin = email.toLowerCase() === adminEmail.toLowerCase();
        
        const newProfile = {
          id: data.user.id,
          full_name: fullName,
          email: email,
          phone: phone || '',
          is_admin: isAdmin
        };
        
        await supabase.from('users').upsert(newProfile);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-callback`,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';
  const isUserAdmin = profile?.is_admin || (user?.email && user.email.toLowerCase() === adminEmail.toLowerCase()) || false;

  const value = {
    user,
    profile,
    loading,
    isAdmin: isUserAdmin,
    signup,
    login,
    logout,
    resetPassword,
    updatePassword,
    refreshProfile: () => fetchProfile(user?.id)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
