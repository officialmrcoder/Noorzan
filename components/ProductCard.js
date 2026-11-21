'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    showToast(`${product.name} added to cart!`, 'success');
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'backpack': return 'Backpack';
      case 'messenger': return 'Messenger Bag';
      case 'laptop_bag': return 'Laptop Bag';
      case 'travel_bag': return 'Travel Bag';
      case 'handbag': return 'Handbag';
      default: return category;
    }
  };

  return (
    <div className="group relative bg-white flex flex-col">

      {/* Image Container — 3:4 portrait ratio */}
      <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '3/4' }}>
        <img
          src={product.image_url || FALLBACK_IMAGE}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Badges top-left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.stock <= 0 && (
            <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              Sold Out
            </span>
          )}
          {product.original_price && Number(product.original_price) > Number(product.price) && (
            <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              Sale
            </span>
          )}
        </div>

        {/* Hover overlay — Quick Add button */}
        <div
          className="absolute inset-x-0 bottom-0 bg-black text-white text-xs font-bold uppercase tracking-widest py-3 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 cursor-pointer"
          onClick={product.stock > 0 ? handleAddToCart : undefined}
        >
          {product.stock > 0 ? '+ Quick Add' : 'Sold Out'}
        </div>
      </div>

      {/* Product Info */}
      <div className="pt-3 pb-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug hover:underline line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-bold text-gray-900">
            PKR {Number(product.price).toLocaleString()}
          </span>
          {product.original_price && Number(product.original_price) > Number(product.price) && (
            <span className="text-xs text-gray-400 line-through">
              PKR {Number(product.original_price).toLocaleString()}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{getCategoryLabel(product.category)}</p>
      </div>
    </div>
  );
};

export default memo(ProductCard);
