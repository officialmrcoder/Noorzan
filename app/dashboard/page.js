'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/mockData';
import { ShoppingBag, Calendar, MapPin, Phone, User, Package, ChevronRight, Loader2, ArrowRight, LayoutDashboard, Settings } from 'lucide-react';
import Link from 'next/link';

export default function UserDashboard() {
  const router = useRouter();
  const { user, profile, isAdmin, loading } = useAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [fetchingOrders, setFetchingOrders] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      showToast('Please sign in to access your orders', 'info');
      router.push('/auth/login');
    }
  }, [user, loading, router, showToast]);

  // Fetch past orders
  useEffect(() => {
    async function loadUserOrders() {
      if (!user) return;
      try {
        if (!isSupabaseConfigured()) {
          const cached = sessionStorage.getItem('last_order');
          if (cached) {
            const parsed = JSON.parse(cached);
            setOrders([
              {
                id: 'mock-order-id',
                order_number: parsed.orderNumber,
                created_at: new Date().toISOString(),
                total_amount: parsed.totalAmount,
                status: 'Pending',
                shipping_address: parsed.address,
                city: parsed.city,
                phone: parsed.phone,
                payment_method: parsed.paymentMethod,
              },
            ]);
          } else {
            setOrders([]);
          }
          setFetchingOrders(false);
          return;
        }

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setFetchingOrders(false);
      }
    }

    loadUserOrders();
  }, [user]);

  if (loading || (!user && !loading)) {
    return (
      <div className="max-w-md mx-auto my-32 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-black mx-auto" />
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Loading Account...</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-900 border border-amber-200';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-900 border border-blue-200';
      case 'Shipped':
        return 'bg-purple-100 text-purple-900 border border-purple-200';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-900 border border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-900 border border-gray-200';
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header banner */}
      <div className="border-b border-gray-200 py-10 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">Customer Account</p>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight mt-1">
              Welcome, {profile?.full_name || user.email.split('@')[0]}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
              >
                <LayoutDashboard size={14} /> Admin Panel
              </Link>
            )}
            <Link
              href="/profile"
              className="px-5 py-2.5 border border-black text-black text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors inline-flex items-center gap-2"
            >
              <Settings size={14} /> Profile Settings
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Account Details summary */}
          <aside className="border border-gray-200 p-6 space-y-6 h-fit bg-gray-50/30">
            <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-gray-200 pb-3">
              Account Overview
            </h2>
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-gray-400 uppercase font-semibold block text-[10px]">Full Name</span>
                <span className="font-bold text-black text-sm">{profile?.full_name || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-400 uppercase font-semibold block text-[10px]">Email Address</span>
                <span className="font-bold text-black">{user.email}</span>
              </div>
              <div>
                <span className="text-gray-400 uppercase font-semibold block text-[10px]">Phone Number</span>
                <span className="font-bold text-black">{profile?.phone || 'No phone set'}</span>
              </div>
              <div>
                <span className="text-gray-400 uppercase font-semibold block text-[10px]">Total Orders Placed</span>
                <span className="font-bold text-black text-base">{orders.length}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <Link
                href="/profile"
                className="text-xs font-bold uppercase tracking-wider text-black hover:underline"
              >
                Edit Profile Information →
              </Link>
            </div>
          </aside>

          {/* Right Column: Order History */}
          <main className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-black">
                Order History ({orders.length})
              </h2>
            </div>

            {fetchingOrders ? (
              <div className="py-16 text-center space-y-3 border border-gray-100">
                <Loader2 className="w-6 h-6 animate-spin text-black mx-auto" />
                <p className="text-xs text-gray-500">Loading your past orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 border border-gray-200 p-8 space-y-4 bg-gray-50/50">
                <ShoppingBag size={40} className="text-gray-300 mx-auto" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-black">No Orders Yet</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  You have not placed any orders with Noorzan yet. Start exploring our latest handbag and backpack collection!
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                >
                  Start Shopping <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 p-6 space-y-4 hover:border-black transition-colors"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap justify-between items-start gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <span className="font-black text-black text-sm block">
                          Order #{order.order_number}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          Placed on {new Date(order.created_at).toLocaleDateString('en-PK', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Details row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-700">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Delivery To</span>
                        <span className="font-semibold text-black">{order.shipping_address}, {order.city}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Payment</span>
                        <span className="font-semibold text-black">{order.payment_method}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Amount</span>
                        <span className="font-black text-black text-sm">PKR {Number(order.total_amount).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}