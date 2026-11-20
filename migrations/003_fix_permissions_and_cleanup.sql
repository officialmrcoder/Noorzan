-- =======================================================================
-- MIGRATION 003: Fix RLS Permissions + Delete Sample Data
-- Supabase SQL Editor mein yeh poora script run karo
-- =======================================================================

-- -----------------------------------------------------------------------
-- STEP 1: Sample/Dummy data delete karo products table se
-- -----------------------------------------------------------------------
DELETE FROM public.order_items;   -- pehle order_items clear karo (FK constraint)
DELETE FROM public.orders;        -- phir orders
DELETE FROM public.products;      -- phir products (sample data)

-- -----------------------------------------------------------------------
-- STEP 2: products table pe RLS enable karo (agar nahi hai)
-- -----------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------
-- STEP 3: products table policies
-- -----------------------------------------------------------------------
-- Koi bhi (anon + authenticated) products dekh sakta hai
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (true);

-- Sirf admins products insert/update/delete kar sakte hain
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- -----------------------------------------------------------------------
-- STEP 4: GRANT permissions (fresh grant, pehle revoke karo)
-- -----------------------------------------------------------------------
-- Schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- products
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;

-- users (profiles)
GRANT SELECT ON public.users TO authenticated;
GRANT INSERT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;

-- orders
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT UPDATE ON public.orders TO authenticated;

-- order_items
GRANT SELECT, INSERT ON public.order_items TO authenticated;

-- -----------------------------------------------------------------------
-- STEP 5: users table RLS policies (re-create fresh)
-- -----------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
CREATE POLICY "Users can create their own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can view all users
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u2
      WHERE u2.id = auth.uid() AND u2.is_admin = true
    )
  );

-- -----------------------------------------------------------------------
-- STEP 6: orders table RLS policies (re-create fresh)
-- -----------------------------------------------------------------------
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own orders and admins can view all" ON public.orders;
CREATE POLICY "Users can view their own orders and admins can view all"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- -----------------------------------------------------------------------
-- STEP 7: order_items table RLS policies (re-create fresh)
-- -----------------------------------------------------------------------
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own order items and admins can view all" ON public.order_items;
CREATE POLICY "Users can view their own order items and admins can view all"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id
        AND (
          user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
          )
        )
    )
  );

DROP POLICY IF EXISTS "Users can add items to their own orders" ON public.order_items;
CREATE POLICY "Users can add items to their own orders"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------
-- STEP 8: handle_new_user trigger function update karo
-- (Yeh ensure karta hai ke naye sign-up pe profile auto create ho)
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, phone, is_admin)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    CASE WHEN new.email = 'admin@noorzan.com' THEN true ELSE false END
  )
  ON CONFLICT (id) DO NOTHING;  -- agar profile already exists to skip karo
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger re-create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- -----------------------------------------------------------------------
-- DONE! Ab saari permissions sahi hain.
-- -----------------------------------------------------------------------
