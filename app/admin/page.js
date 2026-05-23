'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { SAMPLE_PRODUCTS, isSupabaseConfigured } from '@/lib/mockData';
import {
  Plus, Edit2, Trash2, LayoutDashboard, ShoppingBag, FolderSync,
  DollarSign, Package, TrendingUp, X, Loader2, Save, ShoppingCart, UserCheck,
  BarChart3, AlertTriangle, PackageX, Tag
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const { showToast } = useToast();

  // Navigation tab
  const [activeTab, setActiveTab] = useState('overview'); // overview, products

  // Data State
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0 });
  const [loadingData, setLoadingData] = useState(true);

  // Form State (for Add/Edit Bag)
  const [editingProduct, setEditingProduct] = useState(null); // null if adding new
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('backpack');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [stock, setStock] = useState('10');
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState('0');
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  // Guard routing
  useEffect(() => {
    if (!loading && !isAdmin) {
      showToast('Access Denied. Admins only.', 'error');
      router.push('/');
    }
  }, [user, isAdmin, loading, router]);

  // Load Admin Data
  useEffect(() => {
    if (!isAdmin) return;

    async function loadAdminData() {
      try {
        setLoadingData(true);
        if (!isSupabaseConfigured()) {
          // Mock mode data setup
          setProducts(SAMPLE_PRODUCTS);
          
          const mockOrders = [
            {
              id: 'ord-m1',
              order_number: 'BH-725492',
              created_at: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hrs ago
              total_amount: 149.97,
              status: 'Pending',
              shipping_address: 'Main Street 45, Sector F',
              city: 'Islamabad',
              phone: '+92 300 9876543',
              payment_method: 'Cash on Delivery',
              user_name: 'Haris Ahmed'
            },
            {
              id: 'ord-m2',
              order_number: 'BH-902184',
              created_at: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
              total_amount: 89.99,
              status: 'Confirmed',
              shipping_address: 'DHA Phase 5, House 12',
              city: 'Lahore',
              phone: '+92 312 4567890',
              payment_method: 'EasyPaisa/JazzCash',
              user_name: 'Sara Khan'
            },
            {
              id: 'ord-m3',
              order_number: 'BH-550184',
              created_at: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
              total_amount: 259.98,
              status: 'Delivered',
              shipping_address: 'Gulshan-e-Iqbal Block 3',
              city: 'Karachi',
              phone: '+92 321 2345678',
              payment_method: 'Cash on Delivery',
              user_name: 'Zainab Bibi'
            }
          ];
          
          setOrders(mockOrders);

          // Calculate stats
          const sales = mockOrders.reduce((sum, o) => sum + o.total_amount, 0);
          setStats({ totalSales: sales, totalOrders: mockOrders.length });
          setLoadingData(false);
          return;
        }

        // Real Supabase queries
        const { data: prodData, error: prodErr } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (prodErr) throw prodErr;
        setProducts(prodData || []);

        const { data: ordData, error: ordErr } = await supabase
          .from('orders')
          .select('*, users(full_name)')
          .order('created_at', { ascending: false });

        if (ordErr) throw ordErr;

        // Clean orders to include user name safely
        const cleanedOrders = (ordData || []).map((o) => ({
          ...o,
          user_name: o.users?.full_name || 'Guest Checkout'
        }));

        // Fetch order items with product details for each order (if Supabase configured)
        if (isSupabaseConfigured()) {
          const ordersWithItems = await Promise.all(
            cleanedOrders.map(async (order) => {
              const { data: items, error: itemsErr } = await supabase
                .from('order_items')
                .select('product_id, quantity, price, products(image_url, name)')
                .eq('order_id', order.id);
              if (itemsErr) console.error('Failed to fetch items for order', order.id, itemsErr);
              return { ...order, items: items || [] };
            })
          );
          setOrders(ordersWithItems);
        } else {
          setOrders(cleanedOrders);
        }

        // Stats calculation
        const totalSales = cleanedOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
        setStats({ totalSales, totalOrders: cleanedOrders.length });

      } catch (err) {
        console.error("Failed to load admin panel data:", err);
        showToast("Error loading statistics", "error");
      } finally {
        setLoadingData(false);
      }
    }

    loadAdminData();
  }, [isAdmin]);

  // Real‑time subscription: listen for new orders and notify admin
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        async (payload) => {
          const newOrder = payload.new;
          // Fetch associated order items with product details
          const { data: items, error: itemsErr } = await supabase
            .from('order_items')
            .select('product_id, quantity, price, products(image_url, name)')
            .eq('order_id', newOrder.id);
          if (itemsErr) console.error('Failed to fetch order items:', itemsErr);
          // Prepend the new order to state, attaching items for UI rendering
          setOrders((prev) => [{ ...newOrder, items: items || [] }, ...prev]);
          showToast(`New order ${newOrder.order_number} placed!`, 'success');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  // Open forms
  const handleOpenForm = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setName(prod.name);
      setPrice(prod.price.toString());
      setDescription(prod.description || '');
      setCategory(prod.category);
      setImageUrl(prod.image_url || '');
      setImageFile(null);
      setStock(prod.stock.toString());
      setIsFeatured(prod.is_featured || false);
      setDisplayOrder((prod.display_order || 0).toString());
    } else {
      setEditingProduct(null);
      setName('');
      setPrice('');
      setDescription('');
      setCategory('backpack');
      setImageUrl('');
      setImageFile(null);
      setStock('10');
      setIsFeatured(false);
      setDisplayOrder('0');
    }
    setIsFormOpen(true);
  };

  // Create or Update Product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!name || !price || !category || !stock) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    setSubmittingProduct(true);
    let finalImageUrl = imageUrl;

    try {
      if (imageFile && isSupabaseConfigured()) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrlData.publicUrl;
      }

      const productPayload = {
        name,
        price: Number(price),
        description,
        category,
        image_url: finalImageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
        stock: Number(stock),
        is_featured: isFeatured,
        display_order: Number(displayOrder)
      };

      if (!isSupabaseConfigured()) {
        // Mock Mode Update/Create
        if (editingProduct) {
          setProducts((prev) =>
            prev.map((p) =>
              p.id === editingProduct.id ? { ...p, ...productPayload } : p
            )
          );
          showToast('Product updated (Mock)!', 'success');
        } else {
          const newProduct = {
            id: `prod-${Math.random().toString(36).substring(2, 9)}`,
            ...productPayload,
            created_at: new Date().toISOString()
          };
          setProducts((prev) => [newProduct, ...prev]);
          showToast('Product created (Mock)!', 'success');
        }
        setIsFormOpen(false);
        setSubmittingProduct(false);
        return;
      }

      // Supabase Mode
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', editingProduct.id);

        if (error) throw error;
        
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id ? { ...p, ...productPayload } : p
          )
        );
        showToast('Product updated successfully!', 'success');
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([productPayload])
          .select()
          .single();

        if (error) throw error;

        setProducts((prev) => [data, ...prev]);
        showToast('Product created successfully!', 'success');
      }

      setIsFormOpen(false);
    } catch (err) {
      console.error("Save product failed:", err);
      showToast(err.message || 'Failed to save product', 'error');
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      if (!isSupabaseConfigured()) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showToast('Product deleted (Mock)!', 'success');
        return;
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('Product deleted successfully!', 'success');
    } catch (err) {
      console.error("Deletion failed:", err);
      showToast('Deletion failed. Check references.', 'error');
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      if (!isSupabaseConfigured()) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        showToast(`Order status updated to ${newStatus} (Mock)!`, 'success');
        return;
      }

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      showToast(`Order status updated to ${newStatus}!`, 'success');
    } catch (err) {
      console.error("Failed to update status:", err);
      showToast('Failed to update status', 'error');
    }
  };

  if (loading || (!isAdmin && !loading)) {
    return (
      <div className="max-w-md mx-auto my-32 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-655 mx-auto" />
        <p className="text-sm font-semibold text-gray-500">Checking credentials...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <LayoutDashboard className="w-8 h-8 text-indigo-600" /> Admin Panel
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage inventories, track payments, and update order statuses</p>
        </div>

        {/* Create Product Button */}
        <button
          onClick={() => handleOpenForm(null)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" /> Add New Bag
        </button>
      </div>

      {/* Stats row */}
      {loadingData ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-150 h-28"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 block uppercase font-medium">Total Sales</span>
              <span className="text-2xl font-bold text-slate-800">${stats.totalSales.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-4 bg-violet-50 text-violet-650 rounded-xl">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 block uppercase font-medium">Total Orders</span>
              <span className="text-2xl font-bold text-slate-800">{stats.totalOrders}</span>
            </div>
          </div>

          <div className="bg-white border border-gray-155 p-6 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 block uppercase font-medium">Products Count</span>
              <span className="text-2xl font-bold text-slate-800">{products.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Orders Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'products'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Manage Inventories
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'analytics'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {loadingData ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl animate-pulse space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
          <p className="text-sm font-semibold text-gray-500">Retrieving data...</p>
        </div>
      ) : activeTab === 'overview' ? (
        /* Orders list */
        <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-slate-800">Order Logs</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-xs font-semibold text-gray-450 uppercase">
                  <th className="p-4">Order No</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-semibold text-slate-700">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center p-8 text-gray-400">No orders logged.</td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{order.order_number}</td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span>{order.user_name}</span>
                          <span className="text-[10px] text-gray-400 block">{order.phone}</span>
                        </div>
                      </td>
                      <td className="p-4 text-indigo-650 font-bold">${Number(order.total_amount).toFixed(2)}</td>
                      <td className="p-4 text-xs text-gray-500">{order.payment_method}</td>
                      <td className="p-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          order.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          order.status === 'Confirmed' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          order.status === 'Shipped' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                          'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4">
                         {/* List of order items with thumbnail, name, qty, price */}
                         {order.items && order.items.length > 0 ? (
                           <div className="flex flex-col space-y-2">
                             {order.items.map((item, idx) => (
                               <div key={idx} className="flex items-center space-x-2">
                                 {item.products?.image_url && (
                                   <img src={item.products.image_url} alt={item.products.name} className="w-8 h-8 object-cover rounded" />
                                 )}
                                 <span className="text-sm font-medium">{item.products?.name || 'Product'}</span>
                                 <span className="text-xs text-gray-500">x{item.quantity}</span>
                                 <span className="text-xs text-gray-600">${item.price.toFixed(2)}</span>
                               </div>
                             ))}
                           </div>
                         ) : (
                           <span className="text-gray-400 text-sm">No items</span>
                         )}
                       </td>
                       <td className="p-4">
                         <select
                           value={order.status}
                           onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                           className="bg-white border border-gray-250 text-xs font-semibold px-2 py-1.5 rounded-lg focus:outline-none focus:border-indigo-600"
                         >
                           <option value="Pending">Pending</option>
                           <option value="Confirmed">Confirmed</option>
                           <option value="Shipped">Shipped</option>
                           <option value="Delivered">Delivered</option>
                         </select>
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'products' ? (
        /* Products manager */
        <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-bold text-slate-800">Bags inventory</h3>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-50 border border-gray-200 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            >
              <option value="all">All Categories</option>
              <option value="backpack">Backpacks</option>
              <option value="messenger">Messenger Bags</option>
              <option value="laptop_bag">Laptop Bags</option>
              <option value="travel_bag">Travel Bags</option>
              <option value="handbag">Women's Handbags</option>
            </select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-xs font-semibold text-gray-450 uppercase">
                  <th className="p-4">Bag Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-semibold text-slate-700">
                {products
                  .filter(prod => filterCategory === 'all' || prod.category === filterCategory)
                  .map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative border border-gray-100 bg-gray-50">
                          <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 line-clamp-1 flex items-center gap-1.5">
                            {prod.name}
                            {prod.is_featured && <span className="text-amber-500" title={`Featured (Order: ${prod.display_order})`}>⭐</span>}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 capitalize text-xs text-gray-400">{prod.category}</td>
                    <td className="p-4 text-slate-900 font-bold">PKR ${Number(prod.price).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`text-xs ${prod.stock <= 5 ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                        {prod.stock} left
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenForm(prod)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'analytics' ? (
        /* Analytics panel */
        (() => {
          const categoryLabels = {
            backpack: 'Backpacks',
            messenger: 'Messenger Bags',
            laptop_bag: 'Laptop Bags',
            travel_bag: 'Travel Bags',
            handbag: 'Handbags'
          };

          const totalStock = products.reduce((sum, p) => sum + Number(p.stock), 0);
          const lowStockCount = products.filter((p) => Number(p.stock) <= 5 && Number(p.stock) > 0).length;
          const outOfStockCount = products.filter((p) => Number(p.stock) === 0).length;
          const avgPrice = products.length > 0
            ? (products.reduce((sum, p) => sum + Number(p.price), 0) / products.length)
            : 0;

          const categoryKeys = Object.keys(categoryLabels);
          const categoryStats = categoryKeys.map((key) => {
            const catProducts = products.filter((p) => p.category === key);
            const catStock = catProducts.reduce((sum, p) => sum + Number(p.stock), 0);
            const catRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
            return {
              key,
              label: categoryLabels[key],
              totalProducts: catProducts.length,
              totalStock: catStock,
              totalRevenue: catRevenue
            };
          });

          return (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block uppercase font-medium">Total Stock Remaining</span>
                    <span className="text-2xl font-bold text-slate-800">{totalStock}</span>
                  </div>
                </div>

                <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block uppercase font-medium">Low Stock Items</span>
                    <span className="text-2xl font-bold text-slate-800">{lowStockCount}</span>
                  </div>
                </div>

                <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className="p-4 bg-rose-50 text-rose-600 rounded-xl">
                    <PackageX className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block uppercase font-medium">Out of Stock Items</span>
                    <span className="text-2xl font-bold text-slate-800">{outOfStockCount}</span>
                  </div>
                </div>

                <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Tag className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block uppercase font-medium">Average Price</span>
                    <span className="text-2xl font-bold text-slate-800">${avgPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Category-wise Stats Table */}
              <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-800">Category-wise Stats</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-100 text-xs font-semibold text-gray-450 uppercase">
                        <th className="p-4">Category</th>
                        <th className="p-4">Total Products</th>
                        <th className="p-4">Total Stock</th>
                        <th className="p-4">Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-semibold text-slate-700">
                      {categoryStats.map((cat) => (
                        <tr key={cat.key} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-slate-900">{cat.label}</td>
                          <td className="p-4">{cat.totalProducts}</td>
                          <td className="p-4">
                            <span className={`text-xs ${cat.totalStock <= 5 ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                              {cat.totalStock}
                            </span>
                          </td>
                          <td className="p-4 text-indigo-650 font-bold">${cat.totalRevenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()
      ) : null}

      {/* Form Drawer Modal overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm px-4">
          <div className="bg-white border border-gray-150 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 animate-slide-in relative">
            
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 border-b border-gray-50 pb-3 mb-5">
              {editingProduct ? 'Edit Bag details' : 'Add New Bag'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Bag Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Leather Shoulder Tote"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 59.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Stock Qty</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 15"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none"
                >
                  <option value="backpack">Backpack</option>
                  <option value="messenger">Messenger Bag</option>
                  <option value="laptop_bag">Laptop Bag</option>
                  <option value="travel_bag">Travel Bag</option>
                  <option value="handbag">Women's Handbag</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Product Image</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                  />
                  <div className="text-xs text-gray-400 text-center font-medium">OR</div>
                  <input
                    type="url"
                    placeholder="Paste image URL here..."
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImageFile(null);
                    }}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-600/20"
                  />
                  Feature on Home
                </label>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Sort Order (Top = 1)</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    placeholder="e.g. 1"
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 px-4 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Description</label>
                <textarea
                  rows="3"
                  placeholder="Brief features and specifications..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submittingProduct}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/10 mt-3"
              >
                {submittingProduct ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Save Product
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
