-- =======================================================================
-- MIGRATION 008: FIX PRODUCTS, CATEGORIES & STORAGE PERMISSIONS
-- Supabase SQL Editor: https://supabase.com/dashboard/project/krfzcbrkkcrrndhsdvhp/sql/new
-- Run this script to fix product saving & categories table visibility!
-- =======================================================================

-- 1. Create categories table if it does not exist
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add required columns to products table if missing
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_hero_bg BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 3. Grant schema and table access
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.products TO anon, authenticated;
GRANT ALL ON public.categories TO anon, authenticated;

-- 4. Enable RLS and setup simple, clean policies for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_all" ON public.products;
DROP POLICY IF EXISTS "products_insert_admin" ON public.products;
DROP POLICY IF EXISTS "products_update_admin" ON public.products;
DROP POLICY IF EXISTS "products_delete_admin" ON public.products;
DROP POLICY IF EXISTS "products_all_access" ON public.products;

CREATE POLICY "products_all_access"
  ON public.products FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Setup simple, clean policies for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
DROP POLICY IF EXISTS "categories_all_access" ON public.categories;

CREATE POLICY "categories_all_access"
  ON public.categories FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 6. Seed initial categories if empty
INSERT INTO public.categories (name, slug)
VALUES
  ('Watches', 'watches'),
  ('Bags & Luggage', 'bags'),
  ('Clothing & Apparel', 'clothing'),
  ('Footwear', 'footwear'),
  ('Accessories', 'accessories'),
  ('Backpack', 'backpack'),
  ('Messenger Bag', 'messenger'),
  ('Laptop Bag', 'laptop_bag'),
  ('Travel Bag', 'travel_bag'),
  ('Women''s Handbag', 'handbag')
ON CONFLICT (slug) DO NOTHING;

-- 7. Ensure storage bucket 'images' exists and is public for product photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies for 'images' bucket
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
CREATE POLICY "Public can view images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Public can upload images" ON storage.objects;
CREATE POLICY "Public can upload images"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "Public can update images" ON storage.objects;
CREATE POLICY "Public can update images"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'images');

-- 8. Confirm admin user profile
UPDATE public.users
SET is_admin = true
WHERE email = 'malikanas1260@gmail.com';
