'use client';

import React from 'react';
import Link from 'next/link';
import { Award, Target, Users, Heart, ArrowRight, Watch, ShoppingBag, Shirt } from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: 'Craftsmanship & Quality',
      description: 'We source premium materials, high-grade movements for our watches, durable fabrics for apparel, and genuine leather hardware to ensure lasting style.',
    },
    {
      icon: Heart,
      title: 'Customer Satisfaction',
      description: 'Your complete peace of mind is our priority, supported with fast doorstep Cash on Delivery (COD) and a smooth 7-day exchange policy.',
    },
    {
      icon: Users,
      title: 'All-In-One Collections',
      description: 'Not just bags—New Mughal Collections curates luxury watches, tailored clothing, bags, and everyday lifestyle essentials for men and women.',
    },
    {
      icon: Award,
      title: '100% Quality Guaranteed',
      description: 'Each piece undergoes strict individual inspection before leaving our fulfillment center in Lahore.',
    },
  ];

  const stats = [
    { number: '15,000+', label: 'Delivered Nationwide' },
    { number: '100+', label: 'Curated Collections' },
    { number: '100%', label: 'Cash on Delivery' },
    { number: '4.9★', label: 'Average Customer Rating' },
  ];

  const highlights = [
    { title: 'Luxury Watches', desc: 'Precision chronograph and minimalist timepieces crafted with sapphire crystals and fine straps.', icon: Watch },
    { title: 'Handcrafted Bags', desc: 'Durable leather backpacks, laptop cases, weekend duffles, and elegant handbags.', icon: ShoppingBag },
    { title: 'Premium Clothing', desc: 'Bespoke kurtas, tailored blazers, and contemporary apparel designed for all occasions.', icon: Shirt },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Editorial Hero */}
      <div className="border-b border-gray-200 py-16 md:py-24 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">Our Heritage & Story</p>
          <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tight leading-tight">
            New Mughal Collections
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto pt-2 leading-relaxed">
            A premier destination for comprehensive lifestyle collections. From precision timepieces and handcrafted bags to contemporary apparel and accessories, we redefine affordable luxury for Pakistan.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-y border-gray-200 py-10">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <span className="text-3xl sm:text-4xl font-black text-black block">{s.number}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1 block">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Narrative & Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600">Our Philosophy</span>
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight leading-tight">
              More Than Just A Store. A Complete Lifestyle Destination.
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Based in Lahore, <strong>New Mughal Collections</strong> was founded to offer complete styling solutions. Rather than confining our passion to one category, our vision encompasses everything you need to look and feel your best: from prestigious watches and bespoke clothing to high-utility bags and lifestyle accessories.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Every watch movement, leather stitch, zip, and garment fabric is tested for superior strength, comfort, and timeless beauty. We take immense pride in delivering items you will cherish for years.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="px-8 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
              >
                Explore All Collections <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div className="bg-gray-100 overflow-hidden aspect-[4/3] border border-gray-200 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1000"
              alt="New Mughal Collections Story"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 3 Core Collections Showcase */}
        <div>
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Our Range</p>
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mt-1">What We Offer</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlights.map((h) => {
              const Icon = h.icon;
              return (
                <div key={h.title} className="p-6 border border-gray-200 bg-gray-50/50 space-y-3">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-base font-bold text-black uppercase tracking-wider">{h.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{h.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Our Commitments</p>
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mt-1">Why Customers Trust New Mughal Collections</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="p-6 border border-gray-200 bg-white space-y-3">
                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black">{v.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
