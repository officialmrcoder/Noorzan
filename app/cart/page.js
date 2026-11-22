'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { formatCategoryName } from '@/lib/categories';

const FREE_SHIPPING_THRESHOLD = 3000;

export default function CartPage() {
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    cartTax,
    cartTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    mounted,
  } = useCart();

  const { showToast } = useToast();

  const shippingProgress = Math.min((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - cartSubtotal, 0);
  const freeShippingUnlocked = cartSubtotal >= FREE_SHIPPING_THRESHOLD;

  const handleQtyChange = (productId, size, quantity) => {
    updateQuantity(productId, size, quantity);
  };

  const handleRemove = (productId, size, name) => {
    removeFromCart(productId, size);
    showToast(`${name} removed from your bag`, 'info');
  };

  const handleClearCart = () => {
    clearCart();
    showToast('Bag cleared', 'info');
  };

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
          <ShoppingBag size={40} strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-wider text-black">Your Shopping Bag is Empty</h1>
        <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto">
          Explore our latest collections of luxury watches, handcrafted bags, and stylish apparel.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 mt-8 px-8 py-3.5 bg-black hover:bg-gray-800 text-white text-xs font-bold uppercase tracking-widest transition-all"
        >
          Shop Collection <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 py-10 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">Review Items</p>
            <h1 className="text-3xl font-black text-black tracking-tight mt-1">Shopping Bag ({cartCount})</h1>
          </div>
          <button
            onClick={handleClearCart}
            className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-red-600 transition-colors"
          >
            Clear All Items
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Free Shipping Progress */}
        <div className="mb-8 p-4 bg-gray-50 border border-gray-200">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-700 mb-2">
            <span>
              {freeShippingUnlocked
                ? '🎉 Congratulations! You have unlocked Free Shipping nationwide.'
                : `Add PKR ${remaining.toLocaleString()} more to qualify for Free Shipping!`}
            </span>
            <span className="font-bold text-black">{Math.round(shippingProgress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-500"
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Side: Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="divide-y divide-gray-100 border-y border-gray-200">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.size}`} className="py-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                  {/* Image */}
                  <div className="w-24 h-28 bg-gray-100 overflow-hidden flex-shrink-0">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.id}`}
                      className="text-sm font-bold text-black hover:underline block truncate"
                    >
                      {item.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.category && (
                        <span className="uppercase text-[10px] font-bold tracking-wider bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                          {formatCategoryName(item.category)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-black text-black mt-2">
                      PKR {Number(item.price).toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-gray-200">
                    <button
                      onClick={() => handleQtyChange(item.id, item.size, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-9 text-center text-xs font-bold text-black select-none">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQtyChange(item.id, item.size, item.quantity + 1)}
                      disabled={item.quantity >= 10}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Line Total & Remove */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                    <span className="text-sm font-black text-black">
                      PKR {(item.price * item.quantity).toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleRemove(item.id, item.size, item.name)}
                      className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-between items-center text-xs">
              <Link href="/products" className="font-bold text-black hover:underline uppercase tracking-wider inline-flex items-center gap-1">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Right Side: Order Summary */}
          <div className="h-fit">
            <div className="bg-gray-50 border border-gray-200 p-6 space-y-5">
              <h2 className="text-sm font-black uppercase tracking-widest text-black border-b border-gray-200 pb-3">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-black">PKR {Number(cartSubtotal).toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Nationwide Shipping</span>
                  <span className="font-bold text-black">
                    {freeShippingUnlocked ? 'FREE' : 'Calculated at checkout'}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Estimated Taxes</span>
                  <span className="font-bold text-black">PKR {Number(cartTax).toLocaleString()}</span>
                </div>

                <div className="border-t border-gray-200 pt-3 flex justify-between text-sm font-black text-black">
                  <span>Total</span>
                  <span>PKR {Number(cartTotal).toLocaleString()}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full inline-flex items-center justify-center gap-2 py-4 bg-black hover:bg-gray-800 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-md"
              >
                Proceed to Checkout <ArrowRight size={14} />
              </Link>

              <div className="space-y-2 pt-2 text-[11px] text-gray-500 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-black shrink-0" />
                  <span>Cash on Delivery (COD) Available Nationwide</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-black shrink-0" />
                  <span>7-Day Hassle-Free Replacement Policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}