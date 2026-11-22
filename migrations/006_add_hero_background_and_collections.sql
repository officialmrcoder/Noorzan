-- =======================================================================
-- MIGRATION 006: Add Hero Background Support & Multi-Collection Categories
-- New Mughal Collections (Watches, Bags, Clothing, etc.)
-- =======================================================================

-- 1. Add is_hero_bg column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'is_hero_bg'
  ) THEN
    ALTER TABLE public.products ADD COLUMN is_hero_bg BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 2. Create site_settings table for dynamic store customizations (hero background, banner, etc.)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 4. Policies for site_settings
DROP POLICY IF EXISTS "Anyone can view site_settings" ON public.site_settings;
CREATE POLICY "Anyone can view site_settings"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can update site_settings" ON public.site_settings;
CREATE POLICY "Admins can update site_settings"
  ON public.site_settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Seed initial multi-collection categories
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

-- 6. Seed initial site_settings with hero background
INSERT INTO public.site_settings (key, value)
VALUES (
  'hero_background',
  jsonb_build_object(
    'imageUrl', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1600',
    'title', 'New Mughal Collections',
    'subtitle', 'Exclusive watches, bags, apparel, and lifestyle accessories for all.'
  )
)
ON CONFLICT (key) DO NOTHING;
