'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { SAMPLE_PRODUCTS, isSupabaseConfigured } from '@/lib/mockData';
import { getHeroBackground, DEFAULT_HERO_IMAGE } from '@/lib/settings';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroBg, setHeroBg] = useState({
    imageUrl: DEFAULT_HERO_IMAGE,
    title: 'Elegance in Every Collection',
    subtitle: 'Luxury watches, handcrafted bags, designer clothing & lifestyle essentials for all.'
  });

  useEffect(() => {
    // 1. Load Homepage Background Image dynamically
    async function loadHero() {
      try {
        const bg = await getHeroBackground();
        if (bg && bg.imageUrl) {
          setHeroBg((prev) => ({
            ...prev,
            imageUrl: bg.imageUrl,
            ...(bg.title ? { title: bg.title } : {}),
            ...(bg.subtitle ? { subtitle: bg.subtitle } : {}),
          }));
        }
      } catch (e) {
        console.error('Failed to load hero background:', e);
      }
    }

    loadHero();

    const handleHeroUpdate = (e) => {
      if (e?.detail?.imageUrl) {
        setHeroBg((prev) => ({
          ...prev,
          imageUrl: e.detail.imageUrl,
          ...(e.detail.title ? { title: e.detail.title } : {}),
          ...(e.detail.subtitle ? { subtitle: e.detail.subtitle } : {}),
        }));
      }
    };

    window.addEventListener('mughal_hero_bg_updated', handleHeroUpdate);
    return () => window.removeEventListener('mughal_hero_bg_updated', handleHeroUpdate);
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        if (!isSupabaseConfigured()) {
          console.log("Supabase not fully configured. Using sample data.");
          setProducts(SAMPLE_PRODUCTS.slice(0, 12));
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('is_featured', { ascending: false })
          .order('display_order', { ascending: true })
          .order('category', { ascending: true })
          .order('created_at', { ascending: false })
          .limit(12);

        if (error) {
          throw error;
        }

        // Show only real DB products — empty means no products (don't fall back to mock)
        setProducts(data || []);
      } catch (err) {
        console.error("Failed to load products from Supabase:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const categories = [
    {
      name: 'Watches',
      subtitle: 'Luxury & Precision',
      code: 'watches',
      image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=500',
    },
    {
      name: 'Bags & Luggage',
      subtitle: 'Leather & Travel',
      code: 'bags',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=500',
    },
    {
      name: 'Clothing & Apparel',
      subtitle: 'Modern & Traditional',
      code: 'clothing',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=500',
    },
    {
      name: 'Laptop & Tech Bags',
      subtitle: 'Work & Everyday',
      code: 'laptop_bag',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=500',
    },
    {
      name: 'Handbags & Totes',
      subtitle: 'Elegance & Style',
      code: 'handbag',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=500',
    },
  ];

  return (
    <div>
      {/* SECTION 1 — HERO WITH DYNAMIC BACKGROUND */}
      <section className="relative w-full overflow-hidden bg-black transition-all duration-700" style={{ minHeight: '90vh' }}>
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-100 hover:scale-105"
          style={{ backgroundImage: `url('${heroBg.imageUrl}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 max-w-4xl mx-auto">
          <span className="text-xs font-bold tracking-[0.35em] uppercase text-amber-300 border border-amber-300/30 bg-black/40 backdrop-blur-sm px-5 py-2 inline-block mb-6">
            NEW MUGHAL COLLECTIONS 2026
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight mb-4 drop-shadow-md">
            Elegance in Every Collection
          </h1>
          <h2 className="text-base sm:text-lg md:text-xl text-gray-200 mb-8 max-w-2xl font-light leading-relaxed">
            Discover luxury watches, handcrafted leather bags, stylish clothing, and curated lifestyle accessories.
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/products"
              className="bg-white text-black font-bold px-8 py-4 hover:bg-gray-100 transition text-xs sm:text-sm uppercase tracking-widest shadow-lg"
            >
              Shop All Collections
            </Link>
            <Link
              href="/products?category=watches"
              className="border border-white/80 backdrop-blur-sm text-white font-bold px-8 py-4 hover:bg-white hover:text-black transition text-xs sm:text-sm uppercase tracking-widest"
            >
              Explore Watches
            </Link>
            <Link
              href="/products?category=clothing"
              className="border border-white/80 backdrop-blur-sm text-white font-bold px-8 py-4 hover:bg-white hover:text-black transition text-xs sm:text-sm uppercase tracking-widest hidden sm:inline-block"
            >
              Explore Clothing
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2 — MARQUEE TRUST STRIP */}
      <div className="bg-white border-y border-gray-100 py-5">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 px-4">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-700">🚚 Cash on Delivery</span>
          <span className="hidden sm:block w-px h-4 bg-gray-200" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-700">🔄 7-Day Easy Exchange</span>
          <span className="hidden sm:block w-px h-4 bg-gray-200" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-700">⭐ 100% Quality Guarantee</span>
          <span className="hidden sm:block w-px h-4 bg-gray-200" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-700">📦 Nationwide Fast Delivery</span>
        </div>
      </div>

      {/* SECTION 3 — SHOP BY COLLECTION */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center sm:text-left mb-8">
          <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-1">ALL COLLECTIONS</p>
          <h2 className="text-3xl md:text-4xl font-black text-black">Shop by Collection</h2>
          <p className="text-sm text-gray-500 mt-1">From exquisite timepieces to luxury bags and clothing for every occasion.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.code}
              href={`/products?category=${cat.code}`}
              className="group relative overflow-hidden block shadow-sm border border-gray-200"
              style={{ aspectRatio: '3/4' }}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:bg-black/60 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 block mb-0.5">{cat.subtitle}</span>
                <h3 className="text-white font-black text-base sm:text-lg uppercase tracking-wider">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 4 — FEATURED PRODUCTS WITH CATEGORIES */}
      <div className="w-full bg-gray-50">
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-1">BESTSELLERS & NEW ARRIVALS</p>
              <h2 className="text-3xl font-black text-black">Featured Collections</h2>
            </div>
            <Link
              href="/products"
              className="text-sm font-bold text-black underline-offset-4 hover:underline"
            >
              View All Collections →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white h-80 animate-pulse rounded border border-gray-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* SECTION 5 — VALUE PROPOSITIONS */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl mb-3">🚚</div>
            <h3 className="font-black text-sm uppercase tracking-wider">Nationwide Shipping</h3>
            <p className="text-xs text-gray-500 mt-1">Fast delivery across all cities of Pakistan</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">💳</div>
            <h3 className="font-black text-sm uppercase tracking-wider">Cash on Delivery</h3>
            <p className="text-xs text-gray-500 mt-1">Pay when your order arrives, zero risk</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">🔄</div>
            <h3 className="font-black text-sm uppercase tracking-wider">Easy Exchange</h3>
            <p className="text-xs text-gray-500 mt-1">7-day hassle-free exchange policy</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">⭐</div>
            <h3 className="font-black text-sm uppercase tracking-wider">Royal Craftsmanship</h3>
            <p className="text-xs text-gray-500 mt-1">Every item personally quality checked</p>
          </div>
        </div>
      </section>

      {/* SECTION 6 — CTA BANNER */}
      <div className="w-full bg-black text-white py-20 text-center px-4">
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-amber-400 mb-4">ROYAL LIFESTYLE & MODERN ACCESSORIES</p>
        <h2 className="text-3xl md:text-5xl font-black mb-6">Ready for New Mughal Collections?</h2>
        <p className="text-sm text-gray-400 max-w-lg mx-auto mb-8">
          Explore our complete range of watches, bags, apparel, and lifestyle accessories designed to elevate your personal style.
        </p>
        <Link
          href="/products"
          className="inline-block bg-white text-black font-bold px-10 py-4 uppercase tracking-widest text-sm hover:bg-gray-100 transition shadow-xl"
        >
          Explore All Collections →
        </Link>
      </div>
    </div>
  );
}
