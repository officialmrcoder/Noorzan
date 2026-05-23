'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Shield } from 'lucide-react';

export default function CartPage() {
  const {
    cartItems,
    cartSubtotal,
    cartTax,
    cartTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    mounted
  } = useCart();

  const { showToast } = useToast();

  const handleQtyChange = (productId, size, quantity) => {
    updateQuantity(productId, size, quantity);
  };

  const handleRemove = (productId, size, name) => {
    removeFromCart(productId, size);
    showToast(`${name} (${size}) removed from cart`, 'info');
  };

  const handleClearCart = () => {
    clearCart();
    showToast('Cart cleared', 'info');
  };

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
        <div className="h-64 bg-gray-200 rounded-3xl"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Your Cart is Empty</h1>
        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
          Looks like you haven't added any bags to your cart yet. Discover our premium collection today!
        </p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 mt-8 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25"
        >
          Explore Bags <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
          <p className="text-sm text-gray-500 mt-1">Review your selected items and totals</p>
        </div>
        <button
          onClick={handleClearCart}
          className="text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors w-fit"
        >
          Clear All Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={`${item.id}-${item.size}`}
              className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <div className="w-20 h-20 rounded-xl bg-slate-50 border border-gray-100 overflow-hidden relative shrink-0">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="flex-grow min-w-0">
                <Link
                  href={`/products/${item.id}`}
                  className="font-bold text-slate-800 hover:text-indigo-600 transition-colors truncate block"
                >
                  {item.name}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-0.5">
                    Size: {item.size}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">{item.category}</span>
                </div>
              </div>

              {/* Quantity Changer */}
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm w-fit self-start sm:self-center">
                <button
                  onClick={() => handleQtyChange(item.id, item.size, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="px-2.5 py-2 text-slate-500 hover:text-indigo-600 disabled:text-gray-300 hover:bg-slate-50 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                <button
                  onClick={() => handleQtyChange(item.id, item.size, item.quantity + 1)}
                  disabled={item.quantity >= 10}
                  className="px-2.5 py-2 text-slate-500 hover:text-indigo-600 disabled:text-gray-300 hover:bg-slate-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Subtotal & Delete */}
              <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-36 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                <div className="text-right">
                  <span className="text-xs text-gray-400 block uppercase font-medium">Subtotal</span>
                  <span className="font-bold text-slate-900 text-base">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => handleRemove(item.id, item.size, item.name)}
                  className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Order Summary */}
        <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-2xl shadow-sm h-fit space-y-6">
          <h2 className="font-bold text-slate-800 text-lg border-b border-gray-100 pb-4">Order Summary</h2>

          {/* Pricing breakdown */}
          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between items-center text-gray-500">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">${cartSubtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center text-gray-500">
              <span>Sales Tax (5%)</span>
              <span className="font-semibold text-slate-800">${cartTax.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center text-gray-500">
              <span>Shipping</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
              <span className="font-bold text-slate-800 text-base">Total Amount</span>
              <span className="font-extrabold text-indigo-600 text-xl">${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Secure indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-medium pt-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Secure SSL Encrypted Checkout</span>
          </div>
        </div>

      </div>
    </div>
  );
}
