'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/mockData';
import { ShoppingBag, Calendar, MapPin, Phone, User, Package, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function UserDashboard() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [fetchingOrders, setFetchingOrders] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      showToast('Please login to access your dashboard', 'info');
      router.push('/auth/login');
    }
  }, [user, loading, router, showToast]);

  // Fetch past orders
  useEffect(() => {
    async function loadUserOrders() {
      if (!user) return;
      try {
        if (!isSupabaseConfigured()) {
          // Mock mode: retrieve last placed order from session storage if any
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
                payment_method: parsed.paymentMethod
              }
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
        console.error("Failed to load user orders:", err);
      } finally {
        setFetchingOrders(false);
      }
    }

    loadUserOrders();
  }, [user]);

  if (loading || (!user && !loading)) {
    return (
      <div className="max-w-md mx-auto my-32 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
        <p className="text-sm font-semibold text-gray-500">Loading user profile...</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'Confirmed': return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'Shipped': return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
      case 'Delivered': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      default: return 'bg-slate-50 text-slate-700 border border-slate-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Banner Profile Summary */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-3xl p-6 sm:p-10 shadow-xl mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center font-bold text-lg">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold">{profile?.full_name || 'My Account'}</h1>
              <p className="text-sm text-indigo-200">{user.email}</p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 grid grid-cols-2 gap-4 border-l border-white/20 pl-0 sm:pl-6 text-xs text-indigo-100 font-medium">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-indigo-300" />
            <span>Profile Verified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-indigo-300" />
            <span>{profile?.phone || 'No phone set'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Profile Details info card */}
        <aside className="bg-white border border-gray-150 p-6 sm:p-8 rounded-3xl shadow-sm h-fit space-y-6">
          <h2 className="font-bold text-slate-800 text-lg border-b border-gray-100 pb-4">Personal Details</h2>
          <div className="space-y-4 text-sm font-semibold text-slate-700">
            <div className="space-y-1">
              <span className="text-gray-400 block text-xs uppercase font-medium">Full Name</span>
              <span>{profile?.full_name || 'Not provided'}</span>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 block text-xs uppercase font-medium">Email</span>
              <span>{profile?.email || user.email}</span>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 block text-xs uppercase font-medium">Phone Number</span>
              <span>{profile?.phone || 'Not provided'}</span>
            </div>
          </div>
        </aside>

        {/* Right Side: Order History */}
        <section className="lg:col-span-2 space-y-6">
          <h2 className="font-bold text-slate-800 text-xl flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-650" /> Past Orders ({orders.length})
          </h2>

          {fetchingOrders ? (
            <div className="text-center py-10 bg-white border border-gray-100 rounded-3xl animate-pulse space-y-3">
              <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto"></div>
              <div className="h-24 bg-gray-200 rounded w-5/6 mx-auto"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No Orders Found</h3>
              <p className="text-sm text-gray-500 mt-1 mb-6">You haven&apos;t placed any orders with us yet.</p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700 transition-colors shadow shadow-indigo-600/10"
              >
                Start Shopping <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm hover:shadow transition-shadow space-y-4"
                >
                  {/* Order header row */}
                  <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-gray-50">
                    <div>
                      <span className="font-bold text-slate-800 text-sm block sm:inline mr-2">
                        Order #{order.order_number}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(order.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Order details description row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-600">
                    <div className="flex items-start gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div>
                        <span className="text-gray-400 block font-medium">Payment Method</span>
                        <span>{order.payment_method}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-1.5 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div>
                        <span className="text-gray-400 block font-medium">Shipping Address</span>
                        <span>{order.shipping_address}, {order.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary/Totals */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex justify-between items-center text-xs sm:text-sm font-bold">
                    <span className="text-slate-650">Total Amount Paid</span>
                    <span className="text-indigo-600 font-extrabold text-base">${Number(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
