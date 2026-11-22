-- =======================================================================
-- MIGRATION 007: Create Contact Messages Table & Policies
-- For customer inquiries sent via Contact Page
-- =======================================================================

-- 1. Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 3. Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;

-- 4. Policies
-- Anyone (visitors, guests, authenticated users) can submit a contact message
DROP POLICY IF EXISTS "Anyone can submit contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact message"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins can view all contact messages
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
CREATE POLICY "Admins can view contact messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can update contact messages (e.g. mark as read)
DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Admins can delete contact messages
DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
CREATE POLICY "Admins can delete contact messages"
  ON public.contact_messages FOR DELETE
  TO authenticated
  USING (public.is_admin());
