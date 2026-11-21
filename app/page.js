'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { SAMPLE_PRODUCTS, isSupabaseConfigured } from '@/lib/mockData';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        if (!isSupabaseConfigured()) {
          console.log("Supabase not fully configured. Using sample data.");
          setProducts(SAMPLE_PRODUCTS.slice(0, 8));
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

        if (data && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(SAMPLE_PRODUCTS.slice(0, 12));
        }
      } catch (err) {
        console.error("Failed to load products from Supabase, using mock data:", err);
        setProducts(SAMPLE_PRODUCTS.slice(0, 8));
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const categories = [
    { name: 'Backpacks', code: 'backpack', image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=400' },
    { name: 'Laptop Bags', code: 'laptop_bag', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400' },
    { name: 'Travel Bags', code: 'travel_bag', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400' },
    { name: 'Messenger', code: 'messenger', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=400' },
    { name: 'Handbags', code: 'handbag', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=400' },
  ];

  return (
    <div>
      {/* SECTION 1 — HERO */}
      <section className="relative w-full overflow-hidden bg-black" style={{ minHeight: '90vh' }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1400')" }}
        />
        <div className="absolute inset-0 bg-black opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-gray-300 border border-white/20 px-4 py-1.5 inline-block mb-6">
            NEW COLLECTION 2026
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-4">
            Carry Your World
          </h1>
          <h2 className="text-lg md:text-xl text-gray-300 mb-8 max-w-lg">
            Premium bags for the modern Pakistani woman.
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/products"
              className="bg-white text-black font-bold px-8 py-4 hover:bg-gray-100 transition text-sm uppercase tracking-widest"
            >
              Shop Collection
            </Link>
            <Link
              href="/products?category=backpack"
              className="border border-white text-white font-bold px-8 py-4 hover:bg-white hover:text-black transition text-sm uppercase tracking-widest"
            >
              Browse Backpacks
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2 — MARQUEE TRUST STRIP */}
      <div className="bg-white border-y border-gray-100 py-5">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 px-4">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-700">🚚 Cash on Delivery</span>
          <span className="hidden sm:block w-px h-4 bg-gray-200" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-700">🔄 Easy Exchange</span>
          <span className="hidden sm:block w-px h-4 bg-gray-200" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-700">⭐ 100% Quality</span>
          <span className="hidden sm:block w-px h-4 bg-gray-200" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-700">📦 Nationwide Delivery</span>
        </div>
      </div>

      {/* SECTION 3 — CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">SHOP BY CATEGORY</p>
        <h2 className="text-3xl md:text-4xl font-black text-black mb-8">Find Your Perfect Bag</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.code}
              href={`/products?category=${cat.code}`}
              className="group relative overflow-hidden block"
              style={{ aspectRatio: '3/4' }}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-black text-lg uppercase tracking-wider">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 4 — FEATURED PRODUCTS */}
      <div className="w-full bg-gray-50">
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-1">BESTSELLERS</p>
              <h2 className="text-3xl font-black text-black">Featured Collection</h2>
            </div>
            <Link
              href="/products"
              className="text-sm font-bold text-black underline-offset-4 hover:underline"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white h-80 animate-pulse rounded" />
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
            <p className="text-xs text-gray-500 mt-1">Fast delivery across all of Pakistan</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">💳</div>
            <h3 className="font-black text-sm uppercase tracking-wider">Cash on Delivery</h3>
            <p className="text-xs text-gray-500 mt-1">Pay when your bag arrives, no risk</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">🔄</div>
            <h3 className="font-black text-sm uppercase tracking-wider">Easy Returns</h3>
            <p className="text-xs text-gray-500 mt-1">7-day hassle-free exchange policy</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">⭐</div>
            <h3 className="font-black text-sm uppercase tracking-wider">Premium Quality</h3>
            <p className="text-xs text-gray-500 mt-1">Every bag personally quality checked</p>
          </div>
        </div>
      </section>

      {/* SECTION 6 — CTA BANNER */}
      <div className="w-full bg-black text-white py-20 text-center">
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">UPGRADE YOUR CARRY GAME</p>
        <h2 className="text-4xl md:text-6xl font-black mb-6">Ready for Premium?</h2>
        <Link
          href="/products"
          className="inline-block bg-white text-black font-bold px-10 py-4 uppercase tracking-widest text-sm hover:bg-gray-100 transition"
        >
          Shop All Bags →
        </Link>
      </div>
    </div>
  );
}
