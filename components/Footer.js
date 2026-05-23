'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-slate-800">
        
        {/* Brand */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
            <ShoppingBag className="w-6 h-6 text-indigo-400" />
            <span>NOORZAN</span>
          </Link>
          <p className="text-sm text-slate-400">
            Noorzan is Pakistan premier destination for luxury handbags and accessories. Thoughtfully curated for the modern woman who values elegance, quality, and style in every carry.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="p-2 bg-slate-800 hover:bg-indigo-650 hover:text-white rounded-lg transition-all text-slate-400" title="Facebook">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
            </a>
            <a href="#" className="p-2 bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-lg transition-all text-slate-400" title="Twitter">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" className="p-2 bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-lg transition-all text-slate-400" title="Instagram">
              <svg className="w-4 h-4 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Shop</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/products?category=backpack" className="hover:text-indigo-400 transition-colors">Backpacks</Link>
            </li>
            <li>
              <Link href="/products?category=laptop_bag" className="hover:text-indigo-400 transition-colors">Laptop Bags</Link>
            </li>
            <li>
              <Link href="/products?category=travel_bag" className="hover:text-indigo-400 transition-colors">Travel Bags</Link>
            </li>
            <li>
              <Link href="/products?category=messenger" className="hover:text-indigo-400 transition-colors">Messenger Bags</Link>
            </li>
            <li>
              <Link href="/products?category=handbag" className="hover:text-indigo-400 transition-colors">Women's Handbags</Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Customer Support</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-indigo-400 transition-colors">Contact Us</a>
            </li>
            <li>
              <a href="#" className="hover:text-indigo-400 transition-colors">Shipping & Delivery</a>
            </li>
            <li>
              <a href="#" className="hover:text-indigo-400 transition-colors">Returns & Exchanges</a>
            </li>
            <li>
              <a href="#" className="hover:text-indigo-400 transition-colors">FAQ</a>
            </li>
            <li>
              <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Contact Info</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>7-A Guldash Town, Zarar Shaheed Road, Ranger Head Quarter, Lahore Pakistan.</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>+92300-4123432</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>officialnoorzan@gmail.com</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p>&copy; {currentYear} Noorzan Store. All rights reserved.</p>
        <p>ALL-ENDED SOLUTIONS PVT LTD</p>
      </div>
    </footer>
  );
}
