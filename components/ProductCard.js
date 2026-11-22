'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatCategoryName } from '@/lib/categories';
import { Tag } from 'lucide-react';

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

  const categoryLabel = formatCategoryName(product.category);

  return (
    <div className="group relative bg-white flex flex-col border border-gray-100 hover:border-gray-300 transition-all shadow-sm hover:shadow-md">

      {/* Entire card is a link to product detail page */}
      <Link href={`/products/${product.id}`} className="flex flex-col flex-grow">

        {/* Image Container — 3:4 portrait ratio */}
        <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '3/4' }}>
          <img
            src={product.image_url || FALLBACK_IMAGE}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />

          {/* Badges top-left */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {product.stock <= 0 && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-sm shadow-sm">
                Sold Out
              </span>
            )}
            {product.original_price && Number(product.original_price) > Number(product.price) && (
              <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-sm shadow-sm">
                Sale
              </span>
            )}
          </div>

          {/* Prominent Category Badge on Image top-right */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="bg-white/95 backdrop-blur-sm text-black border border-black/10 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Tag size={10} className="text-gray-500" />
              {categoryLabel}
            </span>
          </div>

          {/* Hover overlay — Quick Add button (stops propagation so card-link doesn't fire) */}
          <div
            className="absolute inset-x-0 bottom-0 bg-black text-white text-xs font-bold uppercase tracking-widest py-3 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 cursor-pointer z-10"
            onClick={product.stock > 0 ? handleAddToCart : (e) => e.preventDefault()}
          >
            {product.stock > 0 ? '+ Quick Add' : 'Sold Out'}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-3 flex flex-col flex-grow justify-between">
          <div>
            {/* Explicit Category Mention */}
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                Category: {categoryLabel}
              </span>
            </div>

            <h3 className="text-sm font-semibold text-gray-900 leading-snug group-hover:underline line-clamp-2 mt-1">
              {product.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
            <span className="text-sm font-bold text-gray-900">
              PKR {Number(product.price).toLocaleString()}
            </span>
            {product.original_price && Number(product.original_price) > Number(product.price) && (
              <span className="text-xs text-gray-400 line-through">
                PKR {Number(product.original_price).toLocaleString()}
              </span>
            )}
          </div>
        </div>

      </Link>
    </div>
  );
};

export default memo(ProductCard);
