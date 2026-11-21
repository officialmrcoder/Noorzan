'use client';

import { useState, useEffect } from 'react';

const announcements = [
  "🚚 Free Shipping on Orders above PKR 3,000",
  "📦 Cash on Delivery Available Nationwide",
  "🔄 Easy 7-Day Exchange Policy",
  "⭐ 100% Authentic Premium Quality",
];

const marqueeText =
  "FREE CASH ON DELIVERY NATIONWIDE  •  EASY EXCHANGE  •  100% QUALITY GUARANTEE  •  PREMIUM BAGS  •  NATIONWIDE SHIPPING  •  FREE CASH ON DELIVERY NATIONWIDE  •  EASY EXCHANGE  •  100% QUALITY GUARANTEE  •  PREMIUM BAGS  •  NATIONWIDE SHIPPING  • ";

export default function AnnouncementBar() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % announcements.length);
        setVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const prev = () => {
    setVisible(false);
    setTimeout(() => {
      setCurrent((p) => (p - 1 + announcements.length) % announcements.length);
      setVisible(true);
    }, 300);
  };

  const next = () => {
    setVisible(false);
    setTimeout(() => {
      setCurrent((p) => (p + 1) % announcements.length);
      setVisible(true);
    }, 300);
  };

  return (
    <div className="bg-black text-white w-full">
      {/* Rotating announcements bar */}
      <div className="flex items-center justify-between px-4 py-1.5">
        <button
          onClick={prev}
          aria-label="Previous announcement"
          className="text-white/70 hover:text-white transition-colors text-sm font-bold px-1 select-none"
        >
          &#8249;
        </button>
        <div className="flex-1 text-center overflow-hidden">
          <span
            className="text-xs sm:text-sm font-medium transition-opacity duration-300"
            style={{ opacity: visible ? 1 : 0 }}
          >
            {announcements[current]}
          </span>
        </div>
        <button
          onClick={next}
          aria-label="Next announcement"
          className="text-white/70 hover:text-white transition-colors text-sm font-bold px-1 select-none"
        >
          &#8250;
        </button>
      </div>

      {/* Infinite marquee ticker */}
      <div className="border-t border-white/10 overflow-hidden py-1">
        <div className="animate-marquee whitespace-nowrap flex">
          <span className="text-[10px] sm:text-xs text-white/70 tracking-widest uppercase pr-8">
            {marqueeText}
          </span>
          <span className="text-[10px] sm:text-xs text-white/70 tracking-widest uppercase pr-8">
            {marqueeText}
          </span>
        </div>
      </div>
    </div>
  );
}
