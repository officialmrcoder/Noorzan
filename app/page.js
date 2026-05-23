'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { SAMPLE_PRODUCTS, isSupabaseConfigured } from '@/lib/mockData';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Award, Sparkles } from 'lucide-react';

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
    { name: 'Backpacks', code: 'backpack', count: '3 Items', image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=200' },
    { name: 'Laptop Bags', code: 'laptop_bag', count: '1 Item', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=200' },
    { name: 'Travel Bags', code: 'travel_bag', count: '2 Items', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200' },
    { name: 'Messenger Bags', code: 'messenger', count: '1 Item', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=200' },
    { name: 'Handbags', code: 'handbag', count: '1 Item', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=200' },
  ];

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden rounded-b-[2rem] sm:rounded-b-[3rem] shadow-2xl">
        <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1200')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 flex flex-col items-start gap-6 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> New Season Arrivals
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-2xl leading-[1.1] text-balance">
            Where every woman finds her <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">signature style.</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-lg text-balance">
            Discover a curated collection of premium handbags and 
accessories designed for the modern Pakistani woman. At Noorzan, we believe every bag is more than an 
accessory — it's an expression of who you are.
          </p>
          <div className="flex flex-wrap gap-4 mt-2">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5"
            >
              Shop Collection <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/products?category=backpack"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-white/20 hover:bg-white/10 text-white font-semibold transition-all hover:-translate-y-0.5"
            >
              Browse Backpacks
            </Link>
          </div>
        </div>
      </section>

      {/* Categories quick links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center md:text-left mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Browse by Category</h2>
            <p className="text-sm text-gray-500 mt-1">Find the perfect companion for your lifestyle</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1 group">
            View All Products <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.code}
              href={`/products?category=${cat.code}`}
              className="group bg-white border border-gray-100 rounded-2xl p-4 text-center hover:shadow-lg transition-all duration-300 flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 rounded-xl bg-slate-50 overflow-hidden relative flex items-center justify-center">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{cat.name}</h3>
                <span className="text-xs text-gray-400 font-medium">{cat.count}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center md:text-left mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Featured Bags</h2>
          <p className="text-sm text-gray-500 mt-1">Handpicked for quality, crafted for elegance. 
Explore our latest collection and find the perfect 
bag for every occasion — from daily essentials 
to luxury statement pieces.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 h-96 flex flex-col gap-4 animate-pulse">
                <div className="bg-gray-200 h-48 w-full rounded-xl"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mt-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Core Perks Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.15),transparent_60%)]"></div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3.5 bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 rounded-2xl">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">Nationwide Shipping</h3>
              <p className="text-xs text-indigo-200 max-w-[200px]">We deliver across Pakistan with fast, reliable shipping. 
Track your order in real-time and receive it right at your doorstep.</p>
            </div>
            
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3.5 bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 rounded-2xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">Cash On Delivery</h3>
              <p className="text-xs text-indigo-200 max-w-[200px]">Order with confidence — pay when your bag arrives. 
We also accept JazzCash and EasyPaisa for secure digital payments.</p>
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3.5 bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 rounded-2xl">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">Hassle-free Returns</h3>
              <p className="text-xs text-indigo-200 max-w-[200px]">NNot completely in love with your purchase? No worries. 
Return it within 7 days for a smooth exchange or full refund — no questions asked.</p>
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3.5 bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 rounded-2xl">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">Premium Guarantee</h3>
              <p className="text-xs text-indigo-200 max-w-[200px]">Every Noorzan bag is crafted with high-grade fabric and 
durable metal hardware — because you deserve nothing less than the best.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-4">
              About BagHaven
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              Crafting Premium Bags Since 2020
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              At Noorzan, we started with one simple belief — 
every woman deserves a bag that's as elegant as she is. 
Based in Lahore, we curate high-quality handbags 
crafted for everyday style and lasting durability.
            </p>
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-1">
                  <Award className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-gray-700">Premium fabric and solid metal hardware</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-1">
                  <Award className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-gray-700">Trusted by thousands of women across Pakistan</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-1">
                  <Award className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-gray-700">Delivering style to your doorstep since 2020</p>
              </div>
            </div>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5"
            >
              Learn More About Us <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600"
              alt="BagHaven - Premium Bags"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Quick Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Why Customers Love Noorzan</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Discover what makes us different</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl p-8 border border-indigo-200/50">
            <div className="text-4xl font-extrabold text-indigo-600 mb-3">100%</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Authentic Quality</h3>
            <p className="text-gray-700">Every bag is personally checked before dispatch — we never compromise on what reaches your door.</p>
          </div>
          <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-2xl p-8 border border-violet-200/50">
            <div className="text-4xl font-extrabold text-violet-600 mb-3">50+</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Curated Designs</h3>
            <p className="text-gray-700">From elegant classics to modern styles — handpicked collections for every occasion.</p>
          </div>
          <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-2xl p-8 border border-rose-200/50">
            <div className="text-4xl font-extrabold text-rose-600 mb-3">7-Day</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Easy Returns</h3>
            <p className="text-gray-700">Not satisfied? Return within 7 days for a smooth exchange or full refund. Simple as that.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-12 md:p-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_60%)]"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">Ready to Upgrade Your Carry Game?</h2>
            <p className="text-lg text-indigo-100 max-w-2xl mx-auto mb-8">Explore our full collection and find the perfect bag for your lifestyle today.</p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white hover:bg-indigo-50 text-indigo-600 font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Browse All Products <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
