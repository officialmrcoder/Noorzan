'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/mockData';
import { CreditCard, Truck, Loader2, ArrowRight, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartSubtotal, cartTax, cartTotal, clearCart, mounted } = useCart();
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery'); // Cash on Delivery, EasyPaisa, JazzCash
  
  const [submitting, setSubmitting] = useState(false);

  // Populate form if user is logged in
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
    }
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [user, profile]);

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
        <div className="h-64 bg-gray-200 rounded-3xl"></div>
      </div>
    );
  }

  // Require authentication before checkout
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Sign In Required</h2>
        <p className="text-gray-600 mb-6">You need an account to place an order. Please sign in or create an account.</p>
        <div className="flex justify-center gap-4">
          <Link href="/auth/login" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
            Sign In
          </Link>
          <Link href="/auth/signup" className="px-5 py-2.5 bg-gray-200 text-slate-800 rounded-xl hover:bg-gray-300 transition">
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold text-slate-900">Your Cart is Empty</h1>
        <p className="text-gray-500 mt-2">You cannot check out with an empty cart.</p>
        <Link href="/products" className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium">
          Start Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    // Guard: ensure user is logged in (should already be enforced by UI)
    if (!user) {
      showToast('You must be signed in to place an order.', 'error');
      return;
    }
    if (!fullName || !email || !phone || !address || !city) {
      showToast('Please fill in all shipping fields', 'error');
      return;
    }

    setSubmitting(true);
    const orderNumber = `BH-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      if (!isSupabaseConfigured()) {
        // Offline / Mock mode
        console.log("Supabase not fully configured. Simulating order placement...");
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate api delay
        
        // Save order details to sessionStorage to pass to success page
        const orderData = {
          orderNumber,
          fullName,
          email,
          phone,
          address,
          city,
          paymentMethod,
          totalAmount: cartTotal,
          items: cartItems
        };
        sessionStorage.setItem('last_order', JSON.stringify(orderData));
        
        clearCart();
        showToast('Order placed successfully (Mock Mode)!', 'success');
        router.push(`/order-success?orderNo=${orderNumber}`);
        return;
      }

      // Real Supabase insertion
      // 1. Ensure user profile exists or insert it
      let activeUserId = null;
      if (user) {
        activeUserId = user.id;
        // Verify profile exists in public.users
        const { data: profileCheck } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        
        if (!profileCheck) {
          await supabase.from('users').insert({
            id: user.id,
            full_name: fullName,
            email: email,
            phone: phone,
            is_admin: email.toLowerCase() === (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com').toLowerCase()
          });
        }
      }

      // 2. Insert order
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: activeUserId,
          order_number: orderNumber,
          total_amount: cartTotal,
          status: 'Pending',
          shipping_address: address,
          city: city,
          phone: phone,
          payment_method: paymentMethod
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Insert order items
      const orderItemsToInsert = cartItems.map((item) => ({
        order_id: orderResult.id,
        product_id: item.id.startsWith('prod-') ? null : item.id, // Skip mock IDs if any, or handle UUIDs
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      // 4. Update stock quantities (simulate stock decr for database integrity)
      for (const item of cartItems) {
        if (!item.id.startsWith('prod-')) {
          // Fetch current stock
          const { data: prod } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.id)
            .single();

          if (prod) {
            const newStock = Math.max(0, prod.stock - item.quantity);
            await supabase
              .from('products')
              .update({ stock: newStock })
              .eq('id', item.id);
          }
        }
      }

      // 5. Store session summary for success screen
      const orderData = {
        orderNumber,
        fullName,
        email,
        phone,
        address,
        city,
        paymentMethod,
        totalAmount: cartTotal,
        items: cartItems
      };
      sessionStorage.setItem('last_order', JSON.stringify(orderData));

      // 6. Clear and redirect
      clearCart();
      showToast('Order placed successfully!', 'success');
      router.push(`/order-success?orderNo=${orderNumber}`);

    } catch (err) {
      console.error("Failed to place order:", err);
      showToast(err.message || 'Failed to place order. Please try again.', 'error');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>
        <p className="text-sm text-gray-500 mt-1">Provide your delivery details and choose payment method</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column: Form (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Shipping Form Card */}
          <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2 border-b border-gray-50 pb-3">
              <Truck className="w-5 h-5 text-indigo-600" /> Shipping Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali Khan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="ali@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +92 300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Shipping Address</label>
                <input
                  type="text"
                  required
                  placeholder="Apartment, suite, street name, house no."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lahore, Karachi, Islamabad"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2 border-b border-gray-50 pb-3">
              <CreditCard className="w-5 h-5 text-indigo-600" /> Payment Options
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {/* Cash on Delivery */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-indigo-600 bg-indigo-50/40'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="Cash on Delivery"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={() => setPaymentMethod('Cash on Delivery')}
                  className="mt-1 accent-indigo-600"
                />
                <div>
                  <span className="font-bold text-slate-800 text-sm block">Cash on Delivery (COD)</span>
                  <span className="text-xs text-gray-500 mt-0.5 block">Pay cash to the rider upon receiving your bag. Safe and easy.</span>
                </div>
              </label>

              {/* EasyPaisa/JazzCash */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'EasyPaisa/JazzCash'
                    ? 'border-indigo-600 bg-indigo-50/40'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="EasyPaisa/JazzCash"
                  checked={paymentMethod === 'EasyPaisa/JazzCash'}
                  onChange={() => setPaymentMethod('EasyPaisa/JazzCash')}
                  className="mt-1 accent-indigo-600"
                />
                <div>
                  <span className="font-bold text-slate-800 text-sm block">EasyPaisa / JazzCash (Manual)</span>
                  <span className="text-xs text-gray-500 mt-0.5 block">
                    Transfer amount manually to account: <strong>0328-9467399</strong>. Confirm via WhatsApp with order number after purchase, and send screenshot also as a proof of payment.
                  </span>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Right Column: Summary (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 h-fit">
            <h2 className="font-bold text-slate-800 text-lg border-b border-gray-100 pb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-gray-400" /> Order Summary
            </h2>

            {/* Scrollable Items list */}
            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-50 border border-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 block line-clamp-1">{item.name}</span>
                      <span className="text-xs text-gray-400">Qty: {item.quantity} | Size: {item.size}</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Price list */}
            <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
              <div className="flex justify-between items-center text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">PKR ${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span>Sales Tax (5%)</span>
                <span className="font-semibold text-slate-800">PKR ${cartTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="border-t border-gray-150 pt-4 flex justify-between items-center">
                <span className="font-bold text-slate-800 text-base">Total Amount</span>
                <span className="font-extrabold text-indigo-600 text-lg">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Placing Order...
                </>
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
