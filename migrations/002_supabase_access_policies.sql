-- Grants and row-level security for the browser-facing Supabase client.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.users TO authenticated;
GRANT INSERT (id, full_name, email, phone, avatar_url) ON public.users TO authenticated;
GRANT UPDATE (full_name, phone, avatar_url) ON public.users TO authenticated;
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT UPDATE (status) ON public.orders TO authenticated;
GRANT SELECT, INSERT ON public.order_items TO authenticated;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
CREATE POLICY "Users can create their own profile"
  ON public.users FOR INSERT TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view their own orders and admins can view all" ON public.orders;
CREATE POLICY "Users can view their own orders and admins can view all"
  ON public.orders FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid()) AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid()) AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid()) AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "Users can view their own order items and admins can view all" ON public.order_items;
CREATE POLICY "Users can view their own order items and admins can view all"
  ON public.order_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id
        AND (
          user_id = (SELECT auth.uid())
          OR EXISTS (
            SELECT 1 FROM public.users
            WHERE id = (SELECT auth.uid()) AND is_admin = true
          )
        )
    )
  );

DROP POLICY IF EXISTS "Users can add items to their own orders" ON public.order_items;
CREATE POLICY "Users can add items to their own orders"
  ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND user_id = (SELECT auth.uid())
    )
  );
