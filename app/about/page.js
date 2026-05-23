'use client';

import React from 'react';
import Link from 'next/link';
import { Award, Target, Users, Heart, TrendingUp, Globe } from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: 'Quality First',
      description: 'We source premium materials and craftsmanship to ensure durability and style.'
    },
    {
      icon: Heart,
      title: 'Customer Care',
      description: 'Your satisfaction is our priority with dedicated support and hassle-free returns.'
    },
    {
      icon: TrendingUp,
      title: 'Sustainability',
      description: 'We are committed to eco-friendly practices and responsible sourcing.'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Serving customers worldwide with fast and reliable shipping.'
    },
  ];

  const stats = [
    { number: '10K+', label: 'Happy Customers' },
    { number: '500+', label: 'Products Available' },
    { number: '50+', label: 'Countries Served' },
    { number: '5★', label: 'Average Rating' },
  ];

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Header */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl overflow-hidden py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">About Noorzan</h1>
          <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
            We believe every woman deserves a bag that reflects her style and strength. Since 2020, Noorzan has been curating premium handbags for the modern Pakistani woman crafted for elegance, built for everyday life.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <Award className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">
                  To bring premium quality handbags to every woman in Pakistan — where style meets durability, and elegance meets everyday life.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <Target className="w-8 h-8 text-violet-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">To become Pakistan's most loved bag brand, trusted for our craftsmanship, authentic designs, and commitment to delivering quality at your doorstep.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Our Core Values</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">These principles guide every decision we make</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, idx) => {
            const Icon = value.icon;
            return (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all">
                <Icon className="w-10 h-10 text-indigo-600 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-600">{value.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50 rounded-2xl py-12 px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 shadow-sm">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Our Story</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Noorzan was founded in 2020 in Lahore by a group of fashion enthusiasts who saw a gap in the market — premium quality handbags that were both beautiful and built to last.
            </p>
            <p>
              What started as a small curated collection has grown into a trusted online tore serving women across Pakistan. Today, we continue to expand our collection while staying true to our roots — quality first, always.
            </p>
            <p>
              Every bag at Noorzan is handpicked with you in mind. Whether you need an everyday handbag, a travel companion, or a statement piece for a special occasion — we have something just for you.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Ready to Find Your Perfect Bag?</h2>
        <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
          Browse our collection and discover why thousands of customers choose Noorzan.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5"
        >
          Shop Our Collection
        </Link>
      </section>
    </div>
  );
}