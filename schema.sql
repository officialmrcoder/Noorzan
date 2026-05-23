-- Supabase Database Schema for E-Commerce Bags Website

-- 1. Enable UUID generation extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- backpack, messenger, laptop_bag, travel_bag, handbag
    image_url TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create custom users (profiles) table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Shipped', 'Delivered')),
    shipping_address TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT NOT NULL,
    payment_method TEXT NOT NULL, -- Cash on Delivery, EasyPaisa/JazzCash
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL
);

-- 6. Trigger function to handle new auth users registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, phone, is_admin)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    CASE WHEN new.email = 'admin@example.com' THEN true ELSE false END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger for auto user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Add sample data
INSERT INTO public.products (name, price, description, category, image_url, stock)
VALUES 
('Leather Backpack', 89.99, 'Handcrafted from premium full-grain leather. Durable, stylish, and perfect for daily office or college use with a 15-inch laptop compartment.', 'backpack', 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=600', 15),

('Laptop Bag 15.6 inch', 49.99, 'Sleek water-resistant laptop messenger bag. Features shock-absorbing foam padding and multiple accessory pockets.', 'laptop_bag', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600', 25),

('Travel Duffle Bag', 129.99, 'Spacious overnight travel bag made from heavy-duty canvas and leather accents. Includes a separate shoe compartment and adjustable shoulder strap.', 'travel_bag', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600', 10),

('Casual Messenger Bag', 39.99, 'Classic canvas cross-body messenger bag. Lightweight, comfortable, and perfect for carrying books, tablets, and daily essentials.', 'messenger', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=600', 30),

('Women''s Handbag Tote', 59.99, 'Elegant and roomy ladies handbag with top handles and a zipper closure. Made of high-quality vegan leather, matching any outfit.', 'handbag', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600', 12),

('Anti-Theft Backpack', 79.99, 'Secure travel backpack with hidden zippers, slash-resistant fabric, and integrated USB charging port. Keeps your items safe anywhere.', 'backpack', 'https://images.unsplash.com/photo-1577733966973-d680bfa24a06?auto=format&fit=crop&q=80&w=600', 20),

('Gym Sports Bag', 34.99, 'Durable gym bag with a wet pocket for towels or swimwear, and side mesh pockets for water bottles. Lightweight and easy to clean.', 'travel_bag', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600', 40),

('School Bookbag', 44.99, 'Colorful, lightweight school backpack with padded shoulder straps and dual water bottle pockets. Ideal for students and teenagers.', 'backpack', 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&q=80&w=600', 35);
