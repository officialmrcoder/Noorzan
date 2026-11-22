'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/mockData';
import { formatCategoryName } from '@/lib/categories';
import { CreditCard, Truck, Loader2, ArrowRight, ShoppingBag, ShieldCheck, Check } from 'lucide-react';
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
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery'); // Cash on Delivery, EasyPaisa/JazzCash
  const [orderNotes, setOrderNotes] = useState('');
  
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
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
          <ShoppingBag size={32} />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-wider text-black">Your Shopping Bag is Empty</h1>
        <p className="text-xs text-gray-500 mt-2">Add items to your bag before checking out.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 mt-6 px-7 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
        >
          Browse Products <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!fullName || !phone || !address || !city) {
      showToast('Please fill in your name, phone, address and city', 'error');
      return;
    }

    setSubmitting(true);
    const orderNumber = `NZ-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      if (!isSupabaseConfigured()) {
        // Offline / Mock mode
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        const orderData = {
          orderNumber,
          fullName,
          email: email || 'guest@newmughalcollections.pk',
          phone,
          address,
          city,
          paymentMethod,
          totalAmount: cartTotal,
          items: cartItems
        };
        sessionStorage.setItem('last_order', JSON.stringify(orderData));
        
        clearCart();
        showToast('Order confirmed successfully!', 'success');
        router.push(`/order-success?orderNo=${orderNumber}`);
        return;
      }

      // Real Supabase insertion
      const orderPayload = {
        order_number: orderNumber,
        total_amount: cartTotal,
        status: 'Pending',
        shipping_address: address,
        city: city,
        phone: phone,
        payment_method: paymentMethod
      };

      if (user?.id) {
        orderPayload.user_id = user.id;
      }

      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItemsToInsert = cartItems.map((item) => ({
        order_id: orderResult.id,
        product_id: (typeof item.id === 'string' && item.id.includes('-') && !item.id.startsWith('prod-')) ? item.id : null,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) {
        console.warn('Could not insert separate items, order header logged:', itemsError);
      }

      // Store session summary
      const orderData = {
        orderNumber,
        fullName,
        email: email || user?.email || '',
        phone,
        address,
        city,
        paymentMethod,
        totalAmount: cartTotal,
        items: cartItems
      };
      sessionStorage.setItem('last_order', JSON.stringify(orderData));

      clearCart();
      showToast('Order placed successfully!', 'success');
      router.push(`/order-success?orderNo=${orderNumber}`);

    } catch (err) {
      console.error("Order error:", err);
      showToast(err.message || 'Failed to place order. Please check details.', 'error');
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 py-10 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">Step 2 of 2</p>
          <h1 className="text-3xl font-black text-black tracking-tight mt-1">Checkout & Delivery</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          
          {/* Left Column: Delivery & Payment Details (3 cols) */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Account Status notice if guest */}
            {!user && (
              <div className="p-4 bg-gray-50 border border-gray-200 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-black uppercase tracking-wider">Fast Guest Checkout</p>
                  <p className="text-xs text-gray-500 mt-0.5">Already have an account? Sign in to save shipping info.</p>
                </div>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 border border-black text-black text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Shipping Information Card */}
            <div className="border border-gray-200 p-6 sm:p-8 space-y-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-2 border-b border-gray-100 pb-3">
                <Truck size={17} /> 1. Shipping Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-black block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fatima Ali"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-black block mb-1">
                    Phone Number (for Courier & COD) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0300-1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-black block mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="for order tracking"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-black block mb-1">
                    Delivery Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House/Apartment #, Street, Area / Sector"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-black block mb-1">
                    City / Region *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    Order Notes / Delivery Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Nearby landmark, delivery timing preference..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 text-xs focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Payment Options Card */}
            <div className="border border-gray-200 p-6 sm:p-8 space-y-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-2 border-b border-gray-100 pb-3">
                <CreditCard size={17} /> 2. Payment Method
              </h2>

              <div className="space-y-3">
                {/* Cash on Delivery */}
                <label
                  className={`flex items-start gap-4 p-4 border-2 cursor-pointer transition-all ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="Cash on Delivery"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={() => setPaymentMethod('Cash on Delivery')}
                    className="mt-1 accent-black"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-black text-sm">Cash on Delivery (COD)</span>
                      <span className="text-[10px] bg-black text-white px-2 py-0.5 font-bold uppercase">Popular</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Pay cash to the courier rider upon delivery at your doorstep. No advance payment required.
                    </p>
                  </div>
                </label>

                {/* JazzCash / EasyPaisa */}
                <label
                  className={`flex items-start gap-4 p-4 border-2 cursor-pointer transition-all ${
                    paymentMethod === 'EasyPaisa/JazzCash'
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="EasyPaisa/JazzCash"
                    checked={paymentMethod === 'EasyPaisa/JazzCash'}
                    onChange={() => setPaymentMethod('EasyPaisa/JazzCash')}
                    className="mt-1 accent-black"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-black text-sm">JazzCash / EasyPaisa / Bank Transfer</span>
                    <p className="text-xs text-gray-500 mt-1">
                      Transfer securely via mobile account. Account details will be shared on confirmation.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button (Mobile) */}
            <div className="lg:hidden">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                Complete Order • PKR {Number(cartTotal).toLocaleString()}
              </button>
            </div>

          </div>

          {/* Right Column: Order Summary (2 cols) */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 border border-gray-200 p-6 sm:p-8 space-y-6 sticky top-24">
              <h2 className="text-sm font-black uppercase tracking-widest text-black border-b border-gray-200 pb-3">
                Order Items ({cartItems.length})
              </h2>

              {/* Items List Preview */}
              <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 pr-1">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="py-3 flex items-center gap-3">
                    <div className="w-14 h-16 bg-gray-100 flex-shrink-0 overflow-hidden relative">
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-0 right-0 bg-black text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-black truncate">{item.name}</p>
                      <p className="text-[11px] text-gray-500">
                        {item.category && <span className="text-indigo-700 font-semibold uppercase mr-1">{formatCategoryName(item.category)} •</span>}
                        {item.size || 'Standard'}
                      </p>
                    </div>
                    <span className="text-xs font-black text-black">
                      PKR {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="border-t border-gray-200 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-black">PKR {Number(cartSubtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Nationwide Shipping</span>
                  <span className="font-bold text-green-700">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Tax</span>
                  <span className="font-bold text-black">PKR {Number(cartTax).toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-sm font-black text-black">
                  <span>Total Due</span>
                  <span>PKR {Number(cartTotal).toLocaleString()}</span>
                </div>
              </div>

              {/* Complete Order Desktop Button */}
              <button
                type="submit"
                disabled={submitting}
                className="hidden lg:flex w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                Place Order Now <ArrowRight size={14} />
              </button>

              <div className="pt-2 text-[11px] text-gray-500 space-y-2 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-black shrink-0" />
                  <span>100% Secure Checkout Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-black shrink-0" />
                  <span>Doorstep delivery across Pakistan within 2-4 business days</span>
                </div>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}