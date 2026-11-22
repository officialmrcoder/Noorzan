'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

export const DEFAULT_SOCIAL_LINKS = {
  instagram: 'https://instagram.com/newmughalcollections',
  facebook: 'https://facebook.com/newmughalcollections',
  tiktok: 'https://tiktok.com/@newmughalcollections',
  whatsapp: '+923004123432',
  youtube: 'https://youtube.com',
  phone: '+92300-4123432',
  email: 'officialmughalcollections@gmail.com',
  address: '7-A Guldasht Town, Zarar Shaheed Road, Lahore, Pakistan'
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [links, setLinks] = useState(DEFAULT_SOCIAL_LINKS);
  const { showToast } = useToast?.() || {};

  // Load custom links from localStorage and listen to updates
  useEffect(() => {
    const loadLinks = () => {
      try {
        const saved = localStorage.getItem('mughal_social_links') || localStorage.getItem('noorzan_social_links');
        if (saved) {
          setLinks({ ...DEFAULT_SOCIAL_LINKS, ...JSON.parse(saved) });
        }
      } catch (err) {
        console.error('Failed to load social links from localStorage', err);
      }
    };

    loadLinks();
    window.addEventListener('mughal_social_updated', loadLinks);
    window.addEventListener('noorzan_social_updated', loadLinks);
    window.addEventListener('storage', loadLinks);
    return () => {
      window.removeEventListener('mughal_social_updated', loadLinks);
      window.removeEventListener('noorzan_social_updated', loadLinks);
      window.removeEventListener('storage', loadLinks);
    };
  }, []);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (showToast) {
      showToast('Thank you for subscribing to New Mughal Collections VIP!', 'success');
    }
    setEmail('');
  };

  return (
    <footer className="bg-black text-white">

      {/* Newsletter — full width */}
      <div className="border-b border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-4">
          <span className="text-xs font-bold tracking-[0.25em] text-gray-400 uppercase">Newsletter</span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-widest uppercase">Be the First to Know</h2>
          <p className="text-sm text-gray-400 max-w-md">
            Sign up for exclusive offers on watches, bags, clothing and new collection arrivals directly to your inbox.
          </p>
          <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row w-full max-w-md mt-2 gap-2 sm:gap-0">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="bg-white/10 border border-white/20 text-white placeholder-gray-500 px-4 py-3 text-sm flex-1 outline-none focus:border-white transition-colors"
            />
            <button
              type="submit"
              className="bg-white text-black font-bold px-7 py-3 hover:bg-gray-200 uppercase tracking-wider text-xs transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* 4-Column Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

        {/* COL 1 — Brand */}
        <div className="flex flex-col gap-4">
          <Link href="/">
            <span className="text-xl sm:text-2xl font-black tracking-[0.18em] uppercase">NEW MUGHAL COLLECTIONS</span>
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed">
            Premium Watches, Handcrafted Bags, Designer Clothing & Lifestyle Accessories. Royal elegance tailored for your everyday journey.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4 mt-1">
            {/* Instagram */}
            {links.instagram && (
              <a 
                href={links.instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram" 
                className="text-gray-300 hover:text-white transition-colors"
                title="Instagram"
              >
                <svg className="w-5 h-5 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            )}

            {/* Facebook */}
            {links.facebook && (
              <a 
                href={links.facebook} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Facebook" 
                className="text-gray-300 hover:text-white transition-colors"
                title="Facebook"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>
            )}

            {/* TikTok */}
            {links.tiktok && (
              <a 
                href={links.tiktok} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="TikTok" 
                className="text-gray-300 hover:text-white transition-colors"
                title="TikTok"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.84 4.84 0 0 1-1.01-.07z" />
                </svg>
              </a>
            )}

            {/* WhatsApp */}
            {links.whatsapp && (
              <a 
                href={links.whatsapp.startsWith('http') ? links.whatsapp : `https://wa.me/${links.whatsapp.replace(/[^0-9]/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="WhatsApp" 
                className="text-gray-300 hover:text-white transition-colors"
                title="WhatsApp"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.41a8.204 8.204 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.01-1.24-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.18-.47-.3z"/>
                </svg>
              </a>
            )}

            {/* YouTube */}
            {links.youtube && (
              <a 
                href={links.youtube} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="YouTube" 
                className="text-gray-300 hover:text-white transition-colors"
                title="YouTube"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            )}
          </div>

          <div className="flex flex-col gap-1 text-xs text-gray-400 mt-2">
            <span className="font-semibold text-white">{links.phone}</span>
            <span>{links.email}</span>
            <span className="text-gray-500 mt-1">{links.address}</span>
          </div>
        </div>

        {/* COL 2 — SHOP */}
        <div>
          <h4 className="text-xs font-bold tracking-widest uppercase text-white mb-4">Shop Collections</h4>
          <ul className="flex flex-col gap-2.5">
            {[
              { label: 'All Collections', href: '/products' },
              { label: 'Watches', href: '/products?category=watches' },
              { label: 'Bags & Luggage', href: '/products?category=bags' },
              { label: 'Clothing & Apparel', href: '/products?category=clothing' },
              { label: 'Backpacks & Laptop Bags', href: '/products?category=backpack' },
              { label: 'Accessories', href: '/products?category=accessories' },
            ].map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* COL 3 — SUPPORT */}
        <div>
          <h4 className="text-xs font-bold tracking-widest uppercase text-white mb-4">Support & Orders</h4>
          <ul className="flex flex-col gap-2.5">
            {[
              { label: 'Contact Us', href: '/contact' },
              { label: 'Order Tracking', href: '/dashboard' },
              { label: 'Returns & Exchange Policy', href: '/contact' },
              { label: 'Shipping Information', href: '/about' },
              { label: 'FAQs', href: '/about' },
            ].map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* COL 4 — COMPANY */}
        <div>
          <h4 className="text-xs font-bold tracking-widest uppercase text-white mb-4">Company</h4>
          <ul className="flex flex-col gap-2.5">
            {[
              { label: 'About New Mughal Collections', href: '/about' },
              { label: 'Our Philosophy', href: '/about' },
              { label: 'Customer Reviews', href: '/' },
              { label: 'Privacy Policy', href: '/about' },
              { label: 'Admin Portal', href: '/admin' },
            ].map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Trust bar */}
      <div className="border-t border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold tracking-widest uppercase text-gray-400">
            Cash On Delivery (COD) Available  •  Easy 7-Day Exchange  •  100% Quality Guaranteed  •  Nationwide Fast Delivery
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <span>&copy; {new Date().getFullYear()} New Mughal Collections. All rights reserved.</span>
          <span>ALL-ENDED SOLUTIONS PVT LTD</span>
        </div>
      </div>

    </footer>
  );
}
