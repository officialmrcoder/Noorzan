-- =======================================================================
-- MIGRATION 004: FINAL FIX — Infinite Recursion + Profile Save + Orders
-- 
-- ROOT CAUSE: users table policy ke andar users table query ho rahi thi
-- SOLUTION:   SECURITY DEFINER function use karo jo RLS bypass kare
--
-- Supabase SQL Editor: https://supabase.com/dashboard/project/krfzcbrkkcrrndhsdvhp/sql/new
-- Poora script copy karo aur ek baar mein Run karo
-- =======================================================================


-- -----------------------------------------------------------------------
-- STEP 1: PEHLE SAARI PURANI POLICIES DELETE KARO (clean slate)
-- -----------------------------------------------------------------------
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('users', 'orders', 'order_items', 'products')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END;
$$;


-- -----------------------------------------------------------------------
-- STEP 2: is_admin() FUNCTION — SECURITY DEFINER (RLS bypass karke check)
-- Yahi infinite recursion ka permanent fix hai
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.users WHERE id = auth.uid() LIMIT 1),
    false
  );
$$;


-- -----------------------------------------------------------------------
-- STEP 3: GRANT PERMISSIONS
-- -----------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;

GRANT SELECT, INSERT ON public.order_items TO authenticated;


-- -----------------------------------------------------------------------
-- STEP 4: RLS ENABLE (sab tables pe)
-- -----------------------------------------------------------------------
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;


-- -----------------------------------------------------------------------
-- STEP 5: PRODUCTS TABLE POLICIES
-- -----------------------------------------------------------------------
-- Koi bhi product dekh sakta hai (anon + logged in)
CREATE POLICY "products_select_all"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (true);

-- Sirf admin insert/update/delete kar sakta hai
-- (is_admin() function use — NO recursion)
CREATE POLICY "products_insert_admin"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "products_update_admin"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "products_delete_admin"
  ON public.products FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- -----------------------------------------------------------------------
-- STEP 6: USERS TABLE POLICIES
-- IMPORTANT: users table mein KABHI users table query mat karo (recursion!)
-- Sirf auth.uid() use karo. is_admin() function SECURITY DEFINER hai
-- isliye woh safely users table query kar sakta hai
-- -----------------------------------------------------------------------
CREATE POLICY "users_select_policy"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()          -- apna profile
    OR public.is_admin()     -- ya admin hai to sab dekh sakta hai
  );

CREATE POLICY "users_insert_policy"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_policy"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());


-- -----------------------------------------------------------------------
-- STEP 7: ORDERS TABLE POLICIES
-- -----------------------------------------------------------------------
CREATE POLICY "orders_select_policy"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY "orders_insert_policy"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders_update_policy"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.is_admin());


-- -----------------------------------------------------------------------
-- STEP 8: ORDER_ITEMS TABLE POLICIES
-- -----------------------------------------------------------------------
CREATE POLICY "order_items_select_policy"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_items.order_id
        AND (user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "order_items_insert_policy"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_items.order_id
        AND user_id = auth.uid()
    )
  );


-- -----------------------------------------------------------------------
-- STEP 9: HANDLE_NEW_USER TRIGGER (fix karo)
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
    CASE WHEN new.email = 'malikanas1260@gmail.com' THEN true ELSE false END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- -----------------------------------------------------------------------
-- STEP 10: MISSING PROFILES FIX
-- (Jo users pehle se sign up kar chuke hain unka profile insert karo)
-- -----------------------------------------------------------------------
INSERT INTO public.users (id, full_name, email, is_admin)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', au.email),
  au.email,
  CASE WHEN au.email = 'malikanas1260@gmail.com' THEN true ELSE false END
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.users);


-- -----------------------------------------------------------------------
-- STEP 11: ADMIN SET KARO
-- -----------------------------------------------------------------------
UPDATE public.users
SET is_admin = true
WHERE email = 'malikanas1260@gmail.com';


-- -----------------------------------------------------------------------
-- VERIFY: Sab kuch check karo
-- -----------------------------------------------------------------------
SELECT 'POLICIES:' as check_type, policyname, tablename, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'orders', 'order_items', 'products')
ORDER BY tablename, cmd;
