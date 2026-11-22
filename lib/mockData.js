export const SAMPLE_PRODUCTS = [
  {
    id: "prod-watch-1",
    name: "Royal Chronograph Gold Edition Watch",
    price: 14999,
    original_price: 18999,
    description: "Exquisite craftsmanship with precision quartz movement, sapphire-coated scratch-resistant crystal, and luxury stainless steel gold plating. Water-resistant up to 50m. Perfect for formal and executive wear.",
    category: "watches",
    image_url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=600",
    stock: 12,
    is_featured: true,
    is_hero_bg: false,
    display_order: 1,
    created_at: "2026-01-10T12:00:00Z"
  },
  {
    id: "prod-bag-1",
    name: "Imperial Full-Grain Leather Backpack",
    price: 11999,
    original_price: 14500,
    description: "Handcrafted from premium full-grain buffalo leather. Features a dedicated 15.6-inch laptop compartment, antique brass hardware, and ergonomic padded shoulder straps. Built to last a lifetime.",
    category: "bags",
    image_url: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=600",
    stock: 15,
    is_featured: true,
    is_hero_bg: false,
    display_order: 2,
    created_at: "2026-01-09T12:00:00Z"
  },
  {
    id: "prod-cloth-1",
    name: "Embroidered Royal Cotton Kurta",
    price: 5999,
    original_price: 7499,
    description: "Pure Egyptian long-staple cotton tailored to perfection with delicate neckline thread embroidery. Breathable, exceptionally soft, and ideal for festive gatherings and sophisticated daily wear.",
    category: "clothing",
    image_url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=600",
    stock: 20,
    is_featured: true,
    is_hero_bg: false,
    display_order: 3,
    created_at: "2026-01-08T12:00:00Z"
  },
  {
    id: "prod-watch-2",
    name: "Minimalist Executive Leather Watch",
    price: 8999,
    original_price: 10999,
    description: "Clean aesthetic dial paired with genuine Italian leather strap. Subtle date window, ultra-thin case profile, and Swiss-inspired precision timing.",
    category: "watches",
    image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600",
    stock: 18,
    is_featured: false,
    is_hero_bg: false,
    display_order: 4,
    created_at: "2026-01-07T12:00:00Z"
  },
  {
    id: "prod-cloth-2",
    name: "Bespoke Linen Casual Blazer",
    price: 13499,
    original_price: 16999,
    description: "Premium Italian-blend linen blazer designed for smart casual elegance. Lightweight half-canvas structure, horn buttons, and tailored modern fit.",
    category: "clothing",
    image_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600",
    stock: 8,
    is_featured: true,
    is_hero_bg: false,
    display_order: 5,
    created_at: "2026-01-06T12:00:00Z"
  },
  {
    id: "prod-bag-2",
    name: "Executive Leather Laptop Messenger Bag",
    price: 7499,
    original_price: 9200,
    description: "Sleek water-resistant laptop messenger bag. Features shock-absorbing foam padding, a dedicated velvet-lined laptop sleeve, and multiple organizer pockets.",
    category: "laptop_bag",
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600",
    stock: 25,
    is_featured: false,
    is_hero_bg: false,
    display_order: 6,
    created_at: "2026-01-05T12:00:00Z"
  },
  {
    id: "prod-bag-3",
    name: "Women's Heritage Handbag Tote",
    price: 6899,
    original_price: 8500,
    description: "Elegant and spacious structured handbag crafted from premium textured vegan leather with polished gold accents and detachable crossbody strap.",
    category: "handbag",
    image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600",
    stock: 14,
    is_featured: true,
    is_hero_bg: false,
    display_order: 7,
    created_at: "2026-01-04T12:00:00Z"
  },
  {
    id: "prod-bag-4",
    name: "Weekend Voyage Canvas Duffle Bag",
    price: 8999,
    original_price: 11000,
    description: "Heavy-duty waxed canvas travel duffle with reinforced leather corners, ventilated shoe compartment, and heavy-duty YKK zippers.",
    category: "travel_bag",
    image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
    stock: 10,
    is_featured: false,
    is_hero_bg: false,
    display_order: 8,
    created_at: "2026-01-03T12:00:00Z"
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

// Clean slate: No initial orders
export const SAMPLE_ORDERS = [];
