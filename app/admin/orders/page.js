'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured, SAMPLE_ORDERS } from '@/lib/mockData';
import { Loader2, CheckCircle2, X, ArrowRight, Package, ShoppingBag, DollarSign, Calendar, MapPin, Phone, Mail } from 'lucide-react';

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Guard admin access
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      showToast('Access denied. Admins only.', 'error');
      router.push('/');
    }
  }, [user, isAdmin, loading, router, showToast]);

  // Load orders
  useEffect(() => {
    async function fetchOrders() {
      try {
        if (!isSupabaseConfigured()) {
          // Mock mode
          setOrders(SAMPLE_ORDERS || []);
          setLoadingOrders(false);
          return;
        }
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        showToast('Failed to load orders.', 'error');
      } finally {
        setLoadingOrders(false);
      }
    }
    fetchOrders();
  }, [showToast]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      if (!isSupabaseConfigured()) {
        setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o)));
        showToast(`Order status updated to ${newStatus} (Mock)`, 'success');
        return;
      }
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o)));
      showToast('Order status updated.', 'success');
    } catch (err) {
      console.error('Status update error:', err);
      showToast('Failed to update status.', 'error');
    }
  };

  if (loading || (!user && !loading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
        <Package className="w-8 h-8 text-indigo-600" /> Admin Orders
      </h1>

      {loadingOrders ? (
        <div className="text-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">Order #</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">Payment</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{order.order_number}</td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="font-medium text-slate-900">{order.user_name || 'Guest'}</div>
                      <div className="text-xs text-gray-500">{order.phone}</div>
                    </div>
                  </td>
                  <td className="p-4 text-indigo-600 font-bold">${Number(order.total_amount).toFixed(2)}</td>
                  <td className="p-4 text-sm text-gray-500">{order.payment_method}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      order.status === 'Confirmed' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                      order.status === 'Shipped' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                      'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>{order.status}</span>
                  </td>
                  <td className="p-4 space-x-2">
                    <select
                      value={order.status}
                      onChange={e => updateOrderStatus(order.id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-indigo-600 hover:underline text-sm"
                    >
                      Details <ArrowRight className="inline w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
