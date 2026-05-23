-- Migration: Add avatar_url column to users table
-- This migration adds support for user profile photos

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add comment to the new column
COMMENT ON COLUMN public.users.avatar_url IS 'URL to the user''s profile avatar image stored in Supabase storage';
