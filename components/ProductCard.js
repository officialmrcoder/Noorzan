'use client';

import React, { memo } from 'react';
// Export moved below after component definition
import Link from 'next/link';
import { ShoppingCart, Star, Eye } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

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
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Product Category Tag */}
      <span className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider">
        {getCategoryLabel(product.category)}
      </span>

      {/* Image Wrapper */}
      <div className="relative pt-[100%] overflow-hidden bg-gray-50">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600'}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Link
            href={`/products/${product.id}`}
            className="p-3 bg-white hover:bg-indigo-600 hover:text-white text-slate-800 rounded-full shadow-lg transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
            title="View Details"
          >
            <Eye className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Rating Mock */}
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          ))}
          <span className="text-xs text-gray-400 ml-1">(4.8)</span>
        </div>

        <Link href={`/products/${product.id}`} className="hover:text-indigo-600 transition-colors">
          <h3 className="font-semibold text-gray-800 text-base leading-snug line-clamp-1 mb-1">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-xs text-gray-400 line-clamp-2 mb-4 flex-grow">
          {product.description || 'No description available for this premium bag.'}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
          <div>
            <span className="text-xs text-gray-400 block uppercase tracking-wider font-medium">Price</span>
            <span className="text-lg font-bold text-slate-900">PKR ${Number(product.price).toFixed(2)}</span>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/products/${product.id}`}
              className="inline-flex items-center justify-center px-3.5 py-1.5 border border-gray-200 text-xs font-semibold text-gray-600 hover:text-indigo-600 hover:border-indigo-600 rounded-xl transition-colors"
            >
              Details
            </Link>
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all"
              title="Add to Cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default memo(ProductCard);
