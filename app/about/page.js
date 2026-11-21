'use client';

import React from 'react';
import Link from 'next/link';
import { Award, Target, Users, Heart, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: 'Craftsmanship & Quality',
      description: 'We source premium materials and high-grade metal hardware to ensure durability, utility, and timeless style.',
    },
    {
      icon: Heart,
      title: 'Customer Satisfaction',
      description: 'Your complete peace of mind is our priority, supported with fast doorstep COD delivery and a smooth 7-day exchange policy.',
    },
    {
      icon: Users,
      title: 'Designed For Modern Women',
      description: 'Every bag in our collection is curated specifically for modern Pakistani women who appreciate subtlety, luxury, and functionality.',
    },
    {
      icon: Award,
      title: '100% Quality Guaranteed',
      description: 'Each piece undergoes strict individual inspection before leaving our fulfillment center in Lahore.',
    },
  ];

  const stats = [
    { number: '15,000+', label: 'Delivered Nationwide' },
    { number: '50+', label: 'Curated Designs' },
    { number: '100%', label: 'Cash on Delivery' },
    { number: '4.9★', label: 'Average Customer Rating' },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Editorial Hero */}
      <div className="border-b border-gray-200 py-16 md:py-24 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">Our Story & Craft</p>
          <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tight leading-tight">
            Carry Elegance Everywhere.
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto pt-2 leading-relaxed">
            Noorzan was founded with a clear vision: to bring affordable luxury, durable craftsmanship, and sophisticated accessories to Pakistani women. From boardroom laptops to weekend getaways, our bags are designed to empower your everyday journey.
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
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Philosophy</span>
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight leading-tight">
              More Than An Accessory. It Is An Expression of You.
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Based in Lahore, Noorzan blends contemporary global trends with the practical needs of daily life in Pakistan. Every stitch, zip, and pocket is tested for strength and utility.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Whether you are looking for an executive laptop backpack, an understated daily handbag, or an oversized weekend duffle, we take pride in delivering items you will cherish for years.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="px-8 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
              >
                Explore The Catalog <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div className="bg-gray-100 overflow-hidden aspect-[4/3] border border-gray-200">
            <img
              src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1000"
              alt="Noorzan Bags Philosophy"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Our Commitments</p>
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mt-1">Why Customers Trust Noorzan</h2>
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