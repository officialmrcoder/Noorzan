export const SAMPLE_PRODUCTS = [
  {
    id: "prod-1",
    name: "Leather Backpack",
    price: 89.99,
    description: "Handcrafted from premium full-grain leather. Durable, stylish, and perfect for daily office or college use with a 15-inch laptop compartment. Features heavy-duty zippers and comfortable adjustable straps.",
    category: "backpack",
    image_url: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=600",
    stock: 15,
    created_at: "2026-01-01T12:00:00Z"
  },
  {
    id: "prod-2",
    name: "Laptop Bag 15.6 inch",
    price: 49.99,
    description: "Sleek water-resistant laptop messenger bag. Features shock-absorbing foam padding, a dedicated velvet-lined laptop sleeve, and multiple accessory pockets for your chargers, pens, and mouse.",
    category: "laptop_bag",
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600",
    stock: 25,
    created_at: "2026-01-02T12:00:00Z"
  },
  {
    id: "prod-3",
    name: "Travel Duffle Bag",
    price: 129.99,
    description: "Spacious overnight travel bag made from heavy-duty canvas and leather accents. Includes a separate ventilated shoe compartment, an adjustable padded shoulder strap, and is TSA-friendly.",
    category: "travel_bag",
    image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
    stock: 10,
    created_at: "2026-01-03T12:00:00Z"
  },
  {
    id: "prod-4",
    name: "Casual Messenger Bag",
    price: 39.99,
    description: "Classic canvas cross-body messenger bag. Lightweight, comfortable, and perfect for carrying books, tablets, and daily essentials. Features a magnetic flap closure and a quick-access pocket.",
    category: "messenger",
    image_url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=600",
    stock: 30,
    created_at: "2026-01-04T12:00:00Z"
  },
  {
    id: "prod-5",
    name: "Women's Handbag Tote",
    price: 59.99,
    description: "Elegant and roomy ladies handbag with top handles and a secure zipper closure. Made of high-quality vegan leather, matching any outfit from casual to formal.",
    category: "handbag",
    image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600",
    stock: 12,
    created_at: "2026-01-05T12:00:00Z"
  },
  {
    id: "prod-6",
    name: "Anti-Theft Backpack",
    price: 79.99,
    description: "Secure travel backpack with hidden zippers, slash-resistant fabric, and integrated USB charging port. Keeps your items safe anywhere you travel.",
    category: "backpack",
    image_url: "https://images.unsplash.com/photo-1577733966973-d680bfa24a06?auto=format&fit=crop&q=80&w=600",
    stock: 20,
    created_at: "2026-01-06T12:00:00Z"
  },
  {
    id: "prod-7",
    name: "Gym Sports Bag",
    price: 34.99,
    description: "Durable gym bag with a wet pocket for towels or swimwear, and side mesh pockets for water bottles. Lightweight, foldable, and easy to clean.",
    category: "travel_bag",
    image_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600",
    stock: 40,
    created_at: "2026-01-07T12:00:00Z"
  },
  {
    id: "prod-8",
    name: "School Bookbag",
    price: 44.99,
    description: "Colorful, lightweight school backpack with padded shoulder straps and dual water bottle pockets. Designed for comfort and durability.",
    category: "backpack",
    image_url: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&q=80&w=600",
    stock: 35,
    created_at: "2026-01-08T12:00:00Z"
  }
];

// Helper to determine if we are connected to a real Supabase instance
export const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !==
    'https://your-placeholder-supabase-url.supabase.co'
  );
};

// ------------------------------------------------------------
// Mock orders used by AdminOrdersPage when Supabase is not
// configured (development / demo mode).
export const SAMPLE_ORDERS = [
  {
    id: 'mock-order-1',
    order_number: 'BH-100001',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    total_amount: 149.97,
    status: 'Pending',
    shipping_address: 'Main St 45, Sector F',
    city: 'Islamabad',
    phone: '+92 300 9876543',
    payment_method: 'Cash on Delivery',
    user_name: 'Haris Ahmad',
  },
  {
    id: 'mock-order-2',
    order_number: 'BH-100002',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    total_amount: 89.99,
    status: 'Confirmed',
    shipping_address: 'DHA Phase 5, House 12',
    city: 'Lahore',
    phone: '+92 312 4567890',
    payment_method: 'EasyPaisa/JazzCash',
    user_name: 'Sara Khan',
  },
];
