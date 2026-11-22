'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { SAMPLE_PRODUCTS, isSupabaseConfigured } from '@/lib/mockData';
import { getCategories, createCategory, removeCategory, formatCategoryName } from '@/lib/categories';
import { getHeroBackground, setHeroBackground, DEFAULT_HERO_IMAGE } from '@/lib/settings';
import {
  fetchContactMessages, updateMessageReadStatus, deleteContactMessage,
  getContactPageContent, saveContactPageContent, DEFAULT_CONTACT_CONTENT
} from '@/lib/contact';
import {
  Plus, Edit2, Trash2, LayoutDashboard, ShoppingBag, FolderSync,
  DollarSign, Package, TrendingUp, X, Loader2, Save, ShoppingCart, UserCheck,
  BarChart3, AlertTriangle, PackageX, Tag, Layers, FolderPlus,
  Share2, Globe, Phone, Mail, MapPin, Check, Image as ImageIcon, Sparkles,
  MessageSquare, Clock, Send, MessageCircle, Eye, CheckCircle2
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const { showToast } = useToast();

  // Navigation tab
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, hero, categories, contact, analytics, social

  // Social links state for Footer & Store Details
  const [socialLinks, setSocialLinks] = useState({
    instagram: 'https://instagram.com/newmughalcollections',
    facebook: 'https://facebook.com/newmughalcollections',
    tiktok: 'https://tiktok.com/@newmughalcollections',
    whatsapp: '+923004123432',
    youtube: 'https://youtube.com',
    phone: '+92300-4123432',
    email: 'officialmughalcollections@gmail.com',
    address: '7-A Guldasht Town, Zarar Shaheed Road, Lahore, Pakistan'
  });
  const [savingSocial, setSavingSocial] = useState(false);

  // Homepage Hero Background State
  const [heroBgSettings, setHeroBgSettings] = useState({
    imageUrl: DEFAULT_HERO_IMAGE,
    title: 'New Mughal Collections',
    subtitle: 'Exclusive watches, bags, apparel, and lifestyle accessories for all.',
    productId: null
  });
  const [heroCustomUrl, setHeroCustomUrl] = useState('');
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [savingHeroBg, setSavingHeroBg] = useState(false);

  // Contact Module State (Customer Messages & Contact Page Content)
  const [contactMessages, setContactMessages] = useState([]);
  const [contactContent, setContactContent] = useState(DEFAULT_CONTACT_CONTENT);
  const [savingContactContent, setSavingContactContent] = useState(false);
  const [contactSubTab, setContactSubTab] = useState('messages'); // 'messages' | 'content'
  const [messageFilter, setMessageFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Load hero background on mount
  useEffect(() => {
    async function loadHero() {
      try {
        const bg = await getHeroBackground();
        if (bg && bg.imageUrl) {
          setHeroBgSettings(bg);
          setHeroCustomUrl(bg.imageUrl);
        }
      } catch (e) {
        console.error('Failed to load hero background:', e);
      }
    }
    loadHero();

    const handleHeroUpdate = (e) => {
      if (e?.detail) {
        setHeroBgSettings((prev) => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener('mughal_hero_bg_updated', handleHeroUpdate);
    return () => window.removeEventListener('mughal_hero_bg_updated', handleHeroUpdate);
  }, []);

  // Load Contact Data (messages & content)
  useEffect(() => {
    async function loadContactData() {
      try {
        const msgs = await fetchContactMessages();
        setContactMessages(msgs || []);
        const cContent = getContactPageContent();
        setContactContent(cContent);
      } catch (e) {
        console.error('Failed to load contact data in admin:', e);
      }
    }
    loadContactData();

    const handleMessagesUpdate = (e) => {
      if (e?.detail) setContactMessages(e.detail);
    };
    const handleContentUpdate = (e) => {
      if (e?.detail) setContactContent(e.detail);
    };

    window.addEventListener('mughal_contact_messages_updated', handleMessagesUpdate);
    window.addEventListener('mughal_contact_content_updated', handleContentUpdate);
    return () => {
      window.removeEventListener('mughal_contact_messages_updated', handleMessagesUpdate);
      window.removeEventListener('mughal_contact_content_updated', handleContentUpdate);
    };
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mughal_social_links') || localStorage.getItem('noorzan_social_links');
      if (saved) {
        setSocialLinks((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSaveSocialLinks = (e) => {
    e.preventDefault();
    setSavingSocial(true);
    try {
      localStorage.setItem('mughal_social_links', JSON.stringify(socialLinks));
      window.dispatchEvent(new Event('mughal_social_updated'));
      showToast('Social media links and store info updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSavingSocial(false);
    }
  };

  // Data State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0 });
  const [loadingData, setLoadingData] = useState(true);

  // Category Manager State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Order Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Form State (for Add/Edit Product)
  const [editingProduct, setEditingProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('watches');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [stock, setStock] = useState('10');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isHeroBg, setIsHeroBg] = useState(false);
  const [displayOrder, setDisplayOrder] = useState('0');
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  // Inline Category Creator inside Product Modal
  const [showInlineCatInput, setShowInlineCatInput] = useState(false);
  const [inlineCatName, setInlineCatName] = useState('');
  const [creatingInlineCat, setCreatingInlineCat] = useState(false);

  // Guard routing
  useEffect(() => {
    if (!loading && !isAdmin) {
      showToast('Access Denied. Admins only.', 'error');
      router.push('/');
    }
  }, [user, isAdmin, loading, router]);

  // Helper to calculate total revenue only from DELIVERED orders
  const calculateDeliveredSales = (ordersList) => {
    if (!Array.isArray(ordersList)) return 0;
    return ordersList
      .filter((o) => o.status === 'Delivered')
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  };

  // Load Admin Data
  useEffect(() => {
    if (!isAdmin) return;

    async function loadAdminData() {
      try {
        setLoadingData(true);
        if (!isSupabaseConfigured()) {
          // Clean slate: 0 sales, 0 orders
          setProducts(SAMPLE_PRODUCTS);
          setOrders([]);
          setStats({
            totalSales: 0,
            totalOrders: 0
          });

          const loadedCategories = await getCategories(SAMPLE_PRODUCTS);
          setCategories(loadedCategories);
          setLoadingData(false);
          return;
        }

        // Supabase configured - Fetch real data
        const [prodRes, orderRes] = await Promise.all([
          supabase
            .from('products')
            .select('*')
            .order('is_featured', { ascending: false })
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false }),
          supabase
            .from('orders')
            .select(`
              *,
              items:order_items(
                id,
                quantity,
                price,
                product:products(id, name, price, category, image_url)
              )
            `)
            .order('created_at', { ascending: false })
        ]);

        if (prodRes.error) throw prodRes.error;
        if (orderRes.error) throw orderRes.error;

        const fetchedProducts = prodRes.data || [];
        setProducts(fetchedProducts);

        const loadedCats = await getCategories(fetchedProducts);
        setCategories(loadedCats);

        const fetchedOrders = orderRes.data || [];
        setOrders(fetchedOrders);

        // Revenue is ONLY counted for orders marked Delivered
        const totalSales = calculateDeliveredSales(fetchedOrders);
        setStats({
          totalSales,
          totalOrders: fetchedOrders.length
        });

      } catch (err) {
        console.error("Admin data loading failed:", err);
        showToast("Error loading dashboard data. Using fallback.", "error");
        setProducts(SAMPLE_PRODUCTS);
        const fallbackCats = await getCategories(SAMPLE_PRODUCTS);
        setCategories(fallbackCats);
      } finally {
        setLoadingData(false);
      }
    }

    loadAdminData();

    // Setup realtime orders listener
    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('admin-orders')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'orders' },
          (payload) => {
            showToast(`🔔 New Order received: #${payload.new.order_number}`, 'info');
            loadAdminData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin, showToast]);

  // Handle setting product as Homepage Hero Background
  const handleSetProductAsHero = async (prod) => {
    try {
      await setHeroBackground({
        imageUrl: prod.image_url,
        productId: prod.id,
        title: prod.name,
        subtitle: `Curated collection: ${formatCategoryName(prod.category)}`
      });

      setHeroBgSettings((prev) => ({
        ...prev,
        imageUrl: prod.image_url,
        productId: prod.id,
        title: prod.name
      }));

      // Update in products state
      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          is_hero_bg: p.id === prod.id
        }))
      );

      showToast(`"${prod.name}" picture is now set as the Homepage Background!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to set homepage background', 'error');
    }
  };

  // Handle saving custom hero background
  const handleSaveCustomHeroBg = async (e) => {
    e.preventDefault();
    setSavingHeroBg(true);

    let finalUrl = heroCustomUrl;
    try {
      if (heroImageFile && isSupabaseConfigured()) {
        const fileExt = heroImageFile.name.split('.').pop();
        const fileName = `hero-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, heroImageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('images')
          .getPublicUrl(fileName);

        finalUrl = publicUrlData.publicUrl;
      }

      if (!finalUrl || !finalUrl.trim()) {
        showToast('Please provide an image URL or upload an image', 'error');
        setSavingHeroBg(false);
        return;
      }

      await setHeroBackground({
        imageUrl: finalUrl,
        title: 'New Mughal Collections',
        subtitle: 'Exclusive watches, bags, apparel, and lifestyle accessories for all.'
      });

      setHeroBgSettings((prev) => ({
        ...prev,
        imageUrl: finalUrl,
        productId: null
      }));

      setHeroImageFile(null);
      showToast('Homepage background image updated successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to update homepage background', 'error');
    } finally {
      setSavingHeroBg(false);
    }
  };

  // Reset hero background to default
  const handleResetHeroBg = async () => {
    try {
      await setHeroBackground({
        imageUrl: DEFAULT_HERO_IMAGE,
        title: 'New Mughal Collections',
        subtitle: 'Exclusive watches, bags, apparel, and lifestyle accessories for all.'
      });

      setHeroBgSettings({
        imageUrl: DEFAULT_HERO_IMAGE,
        title: 'New Mughal Collections',
        subtitle: 'Exclusive watches, bags, apparel, and lifestyle accessories for all.',
        productId: null
      });

      setHeroCustomUrl(DEFAULT_HERO_IMAGE);
      showToast('Homepage background reset to default.', 'info');
    } catch (err) {
      showToast('Failed to reset hero background', 'error');
    }
  };

  // Handle Contact Message Actions
  const handleToggleMessageRead = async (msg) => {
    try {
      const newStatus = !msg.is_read;
      const updated = await updateMessageReadStatus(msg.id, newStatus);
      setContactMessages(updated);
      showToast(`Marked as ${newStatus ? 'read' : 'unread'}`, 'info');
    } catch (err) {
      showToast('Failed to update message status', 'error');
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!confirm('Are you sure you want to delete this customer message?')) return;
    try {
      const updated = await deleteContactMessage(id);
      setContactMessages(updated);
      if (selectedMessage?.id === id) setSelectedMessage(null);
      showToast('Message deleted', 'success');
    } catch (err) {
      showToast('Failed to delete message', 'error');
    }
  };

  // Handle Saving Contact Page Content
  const handleSaveContactContent = async (e) => {
    e.preventDefault();
    setSavingContactContent(true);
    try {
      await saveContactPageContent(contactContent);
      showToast('Contact page content and store details updated successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save contact content', 'error');
    } finally {
      setSavingContactContent(false);
    }
  };

  // Handle Category Creation
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      showToast('Please enter a category name', 'error');
      return;
    }

    setCreatingCategory(true);
    try {
      const created = await createCategory(newCategoryName);
      const updatedCats = await getCategories([...products, { category: created.slug }]);
      setCategories(updatedCats);
      setNewCategoryName('');
      showToast(`Category "${created.name}" created successfully!`, 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to create category', 'error');
    } finally {
      setCreatingCategory(false);
    }
  };

  // Inline Category Creator inside Modal
  const handleInlineCreateCategory = async () => {
    if (!inlineCatName.trim()) {
      showToast('Please enter category name', 'error');
      return;
    }

    setCreatingInlineCat(true);
    try {
      const created = await createCategory(inlineCatName);
      const updatedCats = await getCategories([...products, { category: created.slug }]);
      setCategories(updatedCats);
      setCategory(created.slug);
      setInlineCatName('');
      setShowInlineCatInput(false);
      showToast(`Category "${created.name}" created & selected!`, 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to create category', 'error');
    } finally {
      setCreatingInlineCat(false);
    }
  };

  // Handle Category Deletion
  const handleDeleteCategory = async (slug, catName, id = null) => {
    const isUsed = products.some((p) => p.category === slug);
    if (isUsed) {
      showToast(`Cannot delete "${catName}". Products currently use this category.`, 'error');
      return;
    }

    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) {
      return;
    }

    try {
      await removeCategory(slug, id);
      setCategories((prev) => prev.filter((c) => c.slug !== slug && (!id || c.id !== id)));
      showToast(`Category "${catName}" deleted successfully!`, 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to delete category', 'error');
    }
  };

  // Open forms
  const handleOpenForm = (prod = null) => {
    setShowInlineCatInput(false);
    setInlineCatName('');
    if (prod) {
      setEditingProduct(prod);
      setName(prod.name);
      setPrice(prod.price.toString());
      setDescription(prod.description || '');
      setCategory(prod.category || 'watches');
      setImageUrl(prod.image_url || '');
      setImageFile(null);
      setStock(prod.stock.toString());
      setIsFeatured(prod.is_featured || false);
      setIsHeroBg(prod.is_hero_bg || heroBgSettings.imageUrl === prod.image_url || false);
      setDisplayOrder((prod.display_order || 0).toString());
    } else {
      setEditingProduct(null);
      setName('');
      setPrice('');
      setDescription('');
      setCategory(categories[0]?.slug || 'watches');
      setImageUrl('');
      setImageFile(null);
      setStock('10');
      setIsFeatured(false);
      setIsHeroBg(false);
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

    // Timeout helper to avoid infinite hanging
    const withTimeout = (promise, ms = 8000, errorMsg = 'Database request timed out') => {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms)),
      ]);
    };

    try {
      // Process image file if uploaded
      if (imageFile) {
        // 1. Convert to base64 Data URL as reliable instant fallback
        const dataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result || '');
          reader.onerror = () => resolve('');
          reader.readAsDataURL(imageFile);
        });

        // 2. Try Supabase storage with 4s timeout; fallback to dataUrl
        if (isSupabaseConfigured()) {
          try {
            const fileExt = imageFile.name.split('.').pop() || 'jpg';
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const { error: uploadError } = await withTimeout(
              supabase.storage.from('images').upload(fileName, imageFile),
              4000,
              'Storage upload timed out'
            );

            if (!uploadError) {
              const { data: publicUrlData } = supabase.storage
                .from('images')
                .getPublicUrl(fileName);
              finalImageUrl = publicUrlData?.publicUrl || dataUrl || finalImageUrl;
            } else {
              finalImageUrl = dataUrl || finalImageUrl;
            }
          } catch (storageErr) {
            console.warn('Storage upload fallback to Data URL:', storageErr?.message);
            finalImageUrl = dataUrl || finalImageUrl;
          }
        } else {
          finalImageUrl = dataUrl || finalImageUrl;
        }
      }

      const productPayload = {
        name,
        price: Number(price),
        description: description || '',
        category,
        image_url: finalImageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
        stock: Number(stock),
        is_featured: isFeatured,
        is_hero_bg: isHeroBg,
        display_order: Number(displayOrder)
      };

      let savedProductId = editingProduct?.id;

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
          savedProductId = `prod-${Math.random().toString(36).substring(2, 9)}`;
          const newProduct = {
            id: savedProductId,
            ...productPayload,
            created_at: new Date().toISOString()
          };
          setProducts((prev) => [newProduct, ...prev]);
          showToast('Product created (Mock)!', 'success');
        }

        if (isHeroBg) {
          await setHeroBackground({
            imageUrl: productPayload.image_url,
            productId: savedProductId,
            title: productPayload.name
          });
          setHeroBgSettings((prev) => ({
            ...prev,
            imageUrl: productPayload.image_url,
            productId: savedProductId,
            title: productPayload.name
          }));
        }

        setIsFormOpen(false);
        setSubmittingProduct(false);
        return;
      }

      // Supabase Mode
      if (editingProduct) {
        let updateError = null;
        try {
          const { error } = await withTimeout(
            supabase
              .from('products')
              .update(productPayload)
              .eq('id', editingProduct.id),
            8000,
            'Product update timed out'
          );
          updateError = error;
        } catch (e) {
          const { is_hero_bg, ...safePayload } = productPayload;
          const { error } = await withTimeout(
            supabase
              .from('products')
              .update(safePayload)
              .eq('id', editingProduct.id),
            8000,
            'Product update timed out'
          );
          updateError = error;
        }

        if (updateError) throw updateError;
        
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id ? { ...p, ...productPayload } : p
          )
        );
        showToast('Product updated successfully!', 'success');
      } else {
        let insertedData = null;
        try {
          const { data, error } = await withTimeout(
            supabase
              .from('products')
              .insert([productPayload])
              .select(),
            8000,
            'Product insert timed out'
          );
          if (error) throw error;
          insertedData = data?.[0] || { id: `prod-${Date.now()}`, ...productPayload };
        } catch (e) {
          const { is_hero_bg, ...safePayload } = productPayload;
          const { data, error } = await withTimeout(
            supabase
              .from('products')
              .insert([safePayload])
              .select(),
            8000,
            'Product insert timed out'
          );
          if (error) throw error;
          insertedData = data?.[0] || { id: `prod-${Date.now()}`, ...safePayload };
        }

        savedProductId = insertedData?.id;
        setProducts((prev) => [insertedData, ...prev]);
        showToast('Product created successfully!', 'success');
      }

      // If flagged as hero background, update hero background safely
      if (isHeroBg) {
        try {
          await setHeroBackground({
            imageUrl: productPayload.image_url,
            productId: savedProductId,
            title: productPayload.name
          });
          setHeroBgSettings((prev) => ({
            ...prev,
            imageUrl: productPayload.image_url,
            productId: savedProductId,
            title: productPayload.name
          }));
        } catch (heroErr) {
          console.warn('Hero background sync warning:', heroErr);
        }
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

  // Update order status (Revenue is added ONLY when status is set to Delivered)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const updatedOrders = orders.map((o) =>
        o.id === orderId ? { ...o, status: newStatus } : o
      );
      setOrders(updatedOrders);
      setStats({
        totalSales: calculateDeliveredSales(updatedOrders),
        totalOrders: updatedOrders.length
      });

      if (!isSupabaseConfigured()) {
        showToast(
          newStatus === 'Delivered'
            ? `Order marked Delivered! Revenue added to Total Sales.`
            : `Order status updated to ${newStatus}.`,
          'success'
        );
        return;
      }

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      showToast(
        newStatus === 'Delivered'
          ? `Order marked Delivered! Revenue added to Total Sales.`
          : `Order status updated to ${newStatus}!`,
        'success'
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      showToast('Failed to update status', 'error');
    }
  };

  const unreadMessagesCount = contactMessages.filter((m) => !m.is_read).length;

  const filteredMessages = contactMessages.filter((m) => {
    if (messageFilter === 'unread') return !m.is_read;
    if (messageFilter === 'read') return m.is_read;
    return true;
  });

  if (loading || (!isAdmin && !loading)) {
    return (
      <div className="max-w-md mx-auto my-32 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-black mx-auto" />
        <p className="text-sm font-semibold text-gray-500">Checking credentials...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 uppercase">
            <LayoutDashboard className="w-8 h-8 text-black" /> New Mughal Collections Admin
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage multi-collection catalog, homepage hero background, customer inquiries & contact page content.
          </p>
        </div>

        {/* Create Product Button */}
        <button
          onClick={() => handleOpenForm(null)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-2xl transition-all shadow-md shadow-black/10"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Stats row */}
      {loadingData ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-150 h-28"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 block uppercase font-medium">Delivered Sales</span>
              <span className="text-2xl font-bold text-slate-800">PKR {Number(stats.totalSales).toLocaleString()}</span>
              <span className="text-[10px] text-gray-400 block mt-0.5">Added when order is Delivered</span>
            </div>
          </div>

          <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-4 bg-violet-50 text-violet-600 rounded-xl">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 block uppercase font-medium">Total Orders</span>
              <span className="text-2xl font-bold text-slate-800">{stats.totalOrders}</span>
            </div>
          </div>

          <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 block uppercase font-medium">Products Count</span>
              <span className="text-2xl font-bold text-slate-800">{products.length}</span>
            </div>
          </div>

          <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-4 bg-rose-50 text-rose-600 rounded-xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 block uppercase font-medium">Inquiries</span>
              <span className="text-2xl font-bold text-slate-800">
                {contactMessages.length}
                {unreadMessagesCount > 0 && (
                  <span className="ml-2 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                    {unreadMessagesCount} unread
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4 sm:gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Orders Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Manage Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('hero')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'hero'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-amber-500" />
            Homepage Hero Background
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'contact'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Mail className="w-4 h-4 text-indigo-600" />
            Contact & Inquiries
            {unreadMessagesCount > 0 ? (
              <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {unreadMessagesCount}
              </span>
            ) : (
              <span className="text-gray-400 text-xs">({contactMessages.length})</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'social'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Share2 className="w-4 h-4" />
            Social Links & Details
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
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Recent Customer Orders</h3>
            <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-full">
              {orders.length} orders
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Items / Category</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium text-slate-600">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                      <td className="p-4 font-bold text-slate-900">{order.order_number}</td>
                      <td className="p-4">
                        <div className="text-xs space-y-0.5">
                          <p className="font-bold text-slate-800">{order.user_name || order.phone}</p>
                          <p className="text-gray-400">{order.city} - {order.shipping_address}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs space-y-1">
                          {order.items?.map((it, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className="font-bold text-black">{it.quantity}x</span>
                              <span className="truncate max-w-[180px]">{it.product?.name || it.name || 'Product'}</span>
                              {it.product?.category && (
                                <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase">
                                  {formatCategoryName(it.product.category)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        PKR {Number(order.total_amount).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg ${
                          order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                          order.status === 'Shipped' ? 'bg-blue-50 text-blue-600' :
                          order.status === 'Confirmed' ? 'bg-indigo-50 text-indigo-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="bg-slate-50 border border-gray-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg focus:outline-none"
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
        /* Products list */
        <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-800">All Collections Inventory</h3>
              <p className="text-xs text-gray-500 mt-0.5">Every product has its category clearly mentioned and can be featured on Homepage.</p>
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-50 border border-gray-200 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="p-4">Product Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Hero / Featured</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-semibold text-slate-700">
                {products
                  .filter(prod => filterCategory === 'all' || prod.category === filterCategory)
                  .map((prod) => {
                    const isCurrentHero = heroBgSettings.imageUrl === prod.image_url;
                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative border border-gray-100 bg-gray-50">
                              <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 line-clamp-1">
                                {prod.name}
                              </span>
                              <span className="text-[11px] text-gray-400 block">ID: {prod.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Explicit Category Column */}
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-md text-xs font-bold uppercase tracking-wider">
                            <Tag size={11} />
                            {formatCategoryName(prod.category)}
                          </span>
                        </td>

                        <td className="p-4 text-slate-900 font-bold">
                          PKR {Number(prod.price).toLocaleString()}
                        </td>

                        <td className="p-4">
                          <span className={`text-xs ${prod.stock <= 5 ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                            {prod.stock} in stock
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {prod.is_featured && (
                              <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-800 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                ⭐ Featured
                              </span>
                            )}
                            {isCurrentHero && (
                              <span className="text-[10px] bg-green-50 border border-green-200 text-green-800 font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                🖼️ Active Home Bg
                              </span>
                            )}
                            {!prod.is_featured && !isCurrentHero && (
                              <span className="text-xs text-gray-400 font-normal">Standard</span>
                            )}
                          </div>
                        </td>

                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                          {/* Quick 1-click set as Home Background */}
                          <button
                            onClick={() => handleSetProductAsHero(prod)}
                            className={`p-2 rounded-xl transition-all ${
                              isCurrentHero
                                ? 'bg-amber-100 text-amber-700'
                                : 'text-gray-500 hover:bg-amber-50 hover:text-amber-600'
                            }`}
                            title={isCurrentHero ? 'Active Homepage Background' : 'Set as Homepage Background Picture'}
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>

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
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'hero' ? (
        /* HOMEPAGE HERO BACKGROUND MANAGEMENT TAB */
        <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm p-6 sm:p-8 space-y-8">
          <div className="border-b border-gray-100 pb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-900 uppercase tracking-tight">Homepage Background Picture Feature</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Choose which picture appears as the main full-screen hero banner on the New Mughal Collections homepage.
                </p>
              </div>
            </div>
          </div>

          {/* Current Live Preview */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Live Homepage Background Preview
              </label>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Currently Live on Store
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden aspect-[21/9] sm:aspect-[3/1] bg-black border border-gray-300 shadow-md">
              <img
                src={heroBgSettings.imageUrl}
                alt="Active Hero Background"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-center text-center p-6">
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-300 border border-amber-300/40 px-3 py-1 mb-2 bg-black/60 backdrop-blur-sm">
                  NEW MUGHAL COLLECTIONS
                </span>
                <h4 className="text-white text-2xl sm:text-4xl font-black">
                  {heroBgSettings.title || 'Elegance in Every Collection'}
                </h4>
                <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-lg">
                  {heroBgSettings.subtitle || 'Watches, Bags, Clothing & Lifestyle Accessories'}
                </p>
              </div>
            </div>
          </div>

          {/* Form: Set custom URL or upload image */}
          <form onSubmit={handleSaveCustomHeroBg} className="space-y-4 bg-slate-50 border border-gray-200 rounded-2xl p-5 sm:p-6">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Set Custom Image for Homepage</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase mb-1 block">Paste Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={heroCustomUrl}
                  onChange={(e) => setHeroCustomUrl(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase mb-1 block">Or Upload Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setHeroImageFile(e.target.files[0])}
                  className="w-full bg-white border border-gray-300 rounded-xl py-2 px-3 text-sm focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={savingHeroBg}
                className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow"
              >
                {savingHeroBg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Apply as Homepage Background
              </button>
              <button
                type="button"
                onClick={handleResetHeroBg}
                className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xl transition"
              >
                Reset to Default Image
              </button>
            </div>
          </form>

          {/* Pick from existing products */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Select Picture from Your Products
                </h4>
                <p className="text-xs text-gray-500">
                  Click on any product card below to instantly set its picture as the Homepage hero background.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {products.map((p) => {
                const isActive = heroBgSettings.imageUrl === p.image_url;
                return (
                  <div
                    key={p.id}
                    className={`relative border-2 rounded-xl overflow-hidden group bg-white transition-all flex flex-col justify-between ${
                      isActive ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="aspect-square bg-gray-100 overflow-hidden relative">
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      {isActive && (
                        <div className="absolute top-1.5 right-1.5 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider rounded">
                          Active
                        </div>
                      )}
                    </div>
                    <div className="p-2 space-y-1.5">
                      <p className="text-xs font-bold text-slate-800 truncate" title={p.name}>{p.name}</p>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded block truncate">
                        {formatCategoryName(p.category)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSetProductAsHero(p)}
                        className={`w-full py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${
                          isActive
                            ? 'bg-amber-100 text-amber-800 cursor-default'
                            : 'bg-black text-white hover:bg-gray-800'
                        }`}
                      >
                        {isActive ? 'Current Hero' : 'Set as Hero'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : activeTab === 'contact' ? (
        /* CONTACT MODULE: INBOX & CONTENT EDITOR */
        <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm p-6 sm:p-8 space-y-8">
          
          {/* Header & Sub-tab switcher */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
            <div>
              <h3 className="font-black text-xl text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Mail className="w-6 h-6 text-indigo-600" />
                Contact Module & Inquiries
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                View messages submitted by visitors on the Contact page, or customize the contact page details.
              </p>
            </div>

            {/* Sub-tabs Toggle */}
            <div className="flex p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setContactSubTab('messages')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  contactSubTab === 'messages'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                Customer Messages ({contactMessages.length})
                {unreadMessagesCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px]">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setContactSubTab('content')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  contactSubTab === 'content'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                Edit Contact Page Content
              </button>
            </div>
          </div>

          {contactSubTab === 'messages' ? (
            /* SUB-TAB 1: CUSTOMER MESSAGES INBOX */
            <div className="space-y-6">
              {/* Filter Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 uppercase font-semibold">Filter:</span>
                  <div className="flex gap-1.5">
                    {['all', 'unread', 'read'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setMessageFilter(f)}
                        className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
                          messageFilter === f
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {f === 'all' ? `All (${contactMessages.length})` : f === 'unread' ? `Unread (${unreadMessagesCount})` : 'Read'}
                      </button>
                    ))}
                  </div>
                </div>

                <span className="text-xs text-gray-500">
                  Showing {filteredMessages.length} inquiry {filteredMessages.length === 1 ? '' : 'ies'}
                </span>
              </div>

              {filteredMessages.length === 0 ? (
                <div className="text-center py-16 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-2">
                  <Mail className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="text-sm font-bold text-gray-600">No customer inquiries found</p>
                  <p className="text-xs text-gray-400">When visitors send a message on the Contact page, it will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-150 rounded-2xl">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-150 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <th className="p-4">Sender Info</th>
                        <th className="p-4">Customer Contact</th>
                        <th className="p-4">Inquiry / Message</th>
                        <th className="p-4">Received</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-slate-700">
                      {filteredMessages.map((msg) => {
                        const cleanPhone = msg.phone ? msg.phone.replace(/[^0-9]/g, '') : '';
                        return (
                          <tr
                            key={msg.id}
                            className={`transition-colors ${
                              !msg.is_read ? 'bg-amber-50/30 hover:bg-amber-50/60' : 'hover:bg-slate-50/60'
                            }`}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold uppercase shrink-0">
                                  {msg.name ? msg.name.charAt(0) : 'U'}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 block leading-tight">{msg.name}</span>
                                  {!msg.is_read && (
                                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wide">
                                      New
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="p-4 text-xs space-y-1">
                              <div>
                                <a
                                  href={`mailto:${msg.email}`}
                                  className="text-indigo-600 hover:underline font-semibold block"
                                  title="Send Email Reply"
                                >
                                  {msg.email}
                                </a>
                              </div>
                              {msg.phone && (
                                <div className="flex items-center gap-2">
                                  <a
                                    href={`tel:${msg.phone}`}
                                    className="text-gray-700 hover:text-black font-medium"
                                  >
                                    {msg.phone}
                                  </a>
                                  {cleanPhone && (
                                    <a
                                      href={`https://wa.me/${cleanPhone.startsWith('0') ? '92' + cleanPhone.substring(1) : cleanPhone}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-emerald-600 hover:text-emerald-700 font-bold text-[11px] underline"
                                      title="Chat on WhatsApp"
                                    >
                                      WhatsApp
                                    </a>
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="p-4 max-w-xs">
                              <p
                                onClick={() => setSelectedMessage(msg)}
                                className="text-xs text-slate-800 line-clamp-2 cursor-pointer hover:text-indigo-600 transition-colors"
                                title="Click to read full message"
                              >
                                {msg.message}
                              </p>
                            </td>

                            <td className="p-4 text-xs text-gray-400 whitespace-nowrap">
                              {new Date(msg.created_at).toLocaleDateString('en-PK', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>

                            <td className="p-4">
                              <button
                                onClick={() => handleToggleMessageRead(msg)}
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                  msg.is_read
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                                }`}
                                title="Click to toggle Read/Unread"
                              >
                                {msg.is_read ? '✓ Read' : '● Unread'}
                              </button>
                            </td>

                            <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                              {/* View Full Message */}
                              <button
                                onClick={() => setSelectedMessage(msg)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="View Full Message"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Toggle Read */}
                              <button
                                onClick={() => handleToggleMessageRead(msg)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title={msg.is_read ? "Mark as Unread" : "Mark as Read"}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete Message"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* SUB-TAB 2: EDIT CONTACT PAGE CONTENT (Similar to Footer settings) */
            <div className="space-y-6">
              <div className="bg-slate-50 border border-gray-200 rounded-2xl p-5 sm:p-6">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Customize Contact Page Headlines & Details
                </h4>
                <p className="text-xs text-gray-500 mb-6">
                  Changes made here update the public Contact page (<span className="font-mono text-black">/contact</span>) in real-time.
                </p>

                <form onSubmit={handleSaveContactContent} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase mb-1 block">Page Tagline</label>
                      <input
                        type="text"
                        value={contactContent.tagline}
                        onChange={(e) => setContactContent({ ...contactContent, tagline: e.target.value })}
                        placeholder="e.g. Customer Care"
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase mb-1 block">Main Heading</label>
                      <input
                        type="text"
                        value={contactContent.heading}
                        onChange={(e) => setContactContent({ ...contactContent, heading: e.target.value })}
                        placeholder="e.g. Get in Touch"
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-600 uppercase mb-1 block">Subheading / Description</label>
                      <textarea
                        rows={2}
                        value={contactContent.subheading}
                        onChange={(e) => setContactContent({ ...contactContent, subheading: e.target.value })}
                        placeholder="Brief message explaining response time or guidance..."
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase mb-1 block">Official Support Email</label>
                      <input
                        type="email"
                        value={contactContent.email}
                        onChange={(e) => setContactContent({ ...contactContent, email: e.target.value })}
                        placeholder="officialmughalcollections@gmail.com"
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase mb-1 block">Support Phone / WhatsApp</label>
                      <input
                        type="text"
                        value={contactContent.phone}
                        onChange={(e) => setContactContent({ ...contactContent, phone: e.target.value })}
                        placeholder="+92 300 4123432"
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase mb-1 block">Headquarters Card Title</label>
                      <input
                        type="text"
                        value={contactContent.headquartersTitle}
                        onChange={(e) => setContactContent({ ...contactContent, headquartersTitle: e.target.value })}
                        placeholder="e.g. New Mughal Collections Headquarters"
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase mb-1 block">Working / Support Hours</label>
                      <input
                        type="text"
                        value={contactContent.hours}
                        onChange={(e) => setContactContent({ ...contactContent, hours: e.target.value })}
                        placeholder="Mon – Sat, 9:00 AM – 7:00 PM"
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-600 uppercase mb-1 block">Store Location Address</label>
                      <input
                        type="text"
                        value={contactContent.address}
                        onChange={(e) => setContactContent({ ...contactContent, address: e.target.value })}
                        placeholder="7-A Guldasht Town, Zarar Shaheed Road, Lahore, Pakistan"
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-600 uppercase mb-1 block">WhatsApp Assistance Note</label>
                      <input
                        type="text"
                        value={contactContent.whatsappNote}
                        onChange={(e) => setContactContent({ ...contactContent, whatsappNote: e.target.value })}
                        placeholder="Need urgent order status? Contact us directly on WhatsApp..."
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingContactContent}
                      className="px-6 py-2.5 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow"
                    >
                      {savingContactContent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Contact Page Content
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      ) : activeTab === 'categories' ? (
        /* Categories Manager Tab */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm h-fit space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-indigo-600" />
              Add New Category
            </h3>
            <p className="text-xs text-gray-500">
              Create categories for watches, bags, clothing, accessories, or any new product line.
            </p>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <input
                type="text"
                placeholder="e.g. Watches, Clothing, Belts"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black"
              />
              <button
                type="submit"
                disabled={creatingCategory}
                className="w-full py-2.5 bg-black hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
              >
                {creatingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Category
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Categories List ({categories.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="p-4">Category Name</th>
                    <th className="p-4">Slug (Code)</th>
                    <th className="p-4">Items Count</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-semibold text-slate-700">
                  {categories.map((c) => {
                    const count = products.filter(p => p.category === c.slug).length;
                    return (
                      <tr key={c.slug} className="hover:bg-slate-50/50">
                        <td className="p-4 font-bold text-slate-900">{c.name}</td>
                        <td className="p-4 text-xs text-gray-400 font-mono">{c.slug}</td>
                        <td className="p-4 text-xs">
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-bold">
                            {count} products
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteCategory(c.slug, c.name, c.id)}
                            disabled={count > 0}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                            title={count > 0 ? "Cannot delete category in use" : "Delete category"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'analytics' ? (
        /* Analytics Tab */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-150 p-5 rounded-2xl">
              <span className="text-xs text-gray-400 uppercase font-semibold">Delivered Revenue</span>
              <p className="text-2xl font-black mt-1">PKR {Number(stats.totalSales).toLocaleString()}</p>
              <span className="text-[10px] text-gray-400 block mt-0.5">Calculated only for Delivered orders</span>
            </div>
            <div className="bg-white border border-gray-150 p-5 rounded-2xl">
              <span className="text-xs text-gray-400 uppercase font-semibold">Total Orders</span>
              <p className="text-2xl font-black mt-1">{stats.totalOrders}</p>
            </div>
            <div className="bg-white border border-gray-150 p-5 rounded-2xl">
              <span className="text-xs text-gray-400 uppercase font-semibold">Total Inventory</span>
              <p className="text-2xl font-black mt-1">{products.length} Products</p>
            </div>
            <div className="bg-white border border-gray-150 p-5 rounded-2xl">
              <span className="text-xs text-gray-400 uppercase font-semibold">Total Categories</span>
              <p className="text-2xl font-black mt-1">{categories.length}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4">Inventory by Category</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categories.map((c) => {
                const count = products.filter(p => p.category === c.slug).length;
                return (
                  <div key={c.slug} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase font-bold">{c.name}</p>
                    <p className="text-xl font-black mt-1">{count} items</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : activeTab === 'social' ? (
        /* Store Details & Social Links Tab */
        <div className="bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-sm max-w-3xl space-y-6">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Store Details & Social Links</h3>
            <p className="text-xs text-gray-500 mt-1">
              Configure contact info, WhatsApp number, and social profiles displayed across the New Mughal Collections footer.
            </p>
          </div>

          <form onSubmit={handleSaveSocialLinks} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">WhatsApp (Order Confirmation)</label>
                <input
                  type="text"
                  value={socialLinks.whatsapp}
                  onChange={(e) => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Official Phone</label>
                <input
                  type="text"
                  value={socialLinks.phone}
                  onChange={(e) => setSocialLinks({ ...socialLinks, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Official Email</label>
                <input
                  type="email"
                  value={socialLinks.email}
                  onChange={(e) => setSocialLinks({ ...socialLinks, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Instagram URL</label>
                <input
                  type="url"
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Facebook URL</label>
                <input
                  type="url"
                  value={socialLinks.facebook}
                  onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">TikTok URL</label>
                <input
                  type="url"
                  value={socialLinks.tiktok}
                  onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-700 block mb-1">Physical Store Address</label>
                <input
                  type="text"
                  value={socialLinks.address}
                  onChange={(e) => setSocialLinks({ ...socialLinks, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingSocial}
              className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2"
            >
              {savingSocial ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Store Info
            </button>
          </form>
        </div>
      ) : null}

      {/* FULL MESSAGE VIEW MODAL */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedMessage(null);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Customer Inquiry</span>
                <h3 className="text-xl font-bold text-slate-900">{selectedMessage.name}</h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-gray-100">
              <div>
                <span className="text-gray-400 block font-semibold uppercase text-[10px]">Email Address</span>
                <a href={`mailto:${selectedMessage.email}`} className="text-indigo-600 font-bold hover:underline">
                  {selectedMessage.email}
                </a>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold uppercase text-[10px]">Phone / WhatsApp</span>
                <span className="font-bold text-slate-800">{selectedMessage.phone || 'Not provided'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400 block font-semibold uppercase text-[10px]">Received Date & Time</span>
                <span className="text-slate-600 font-medium">
                  {new Date(selectedMessage.created_at).toLocaleString('en-PK', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                  })}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Message Content</span>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-slate-800 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {selectedMessage.message}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleToggleMessageRead(selectedMessage);
                    setSelectedMessage({ ...selectedMessage, is_read: !selectedMessage.is_read });
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold uppercase rounded-xl transition"
                >
                  {selectedMessage.is_read ? 'Mark as Unread' : 'Mark as Read'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteMessage(selectedMessage.id)}
                  className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold uppercase rounded-xl transition"
                >
                  Delete
                </button>
              </div>

              {selectedMessage.phone && (
                <a
                  href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '').startsWith('0') ? '92' + selectedMessage.phone.replace(/[^0-9]/g, '').substring(1) : selectedMessage.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase rounded-xl transition inline-flex items-center gap-1.5 shadow"
                >
                  <MessageCircle size={14} /> Reply on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT ADD / EDIT MODAL */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFormOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-slate-800">
                {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
              </h2>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <div className="overflow-y-auto px-6 py-5 space-y-4">
              <form id="admin-product-form" onSubmit={handleSaveProduct} className="space-y-4">

                {/* Product Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Product Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Royal Chronograph Watch, Leather Backpack, Cotton Kurta"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-black"
                  />
                </div>

                {/* Category Selector with Inline Creation */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Category *</label>
                    <button
                      type="button"
                      onClick={() => setShowInlineCatInput(!showInlineCatInput)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      {showInlineCatInput ? 'Cancel' : '+ Add New Category'}
                    </button>
                  </div>

                  {showInlineCatInput ? (
                    <div className="flex gap-2 p-2 bg-indigo-50/50 rounded-xl border border-indigo-100">
                      <input
                        type="text"
                        placeholder="New category name (e.g. Watches, Clothing)"
                        value={inlineCatName}
                        onChange={(e) => setInlineCatName(e.target.value)}
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleInlineCreateCategory}
                        disabled={creatingInlineCat}
                        className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-bold"
                      >
                        {creatingInlineCat ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Create'}
                      </button>
                    </div>
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-black capitalize"
                    >
                      {categories.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Price (PKR) *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="1"
                      placeholder="e.g. 8500"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Stock Qty *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      placeholder="e.g. 15"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* Image Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Product Picture</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white"
                    />
                    <div className="text-xs text-gray-400 text-center font-medium">OR PASTE URL</div>
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

                {/* HOMEPAGE OPTIONS: FEATURE & HERO BACKGROUND */}
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option 1: Feature on Home */}
                    <label className="flex items-start gap-2.5 text-sm font-semibold text-slate-700 bg-slate-50 border border-gray-200 rounded-xl p-3 cursor-pointer hover:bg-slate-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="w-4 h-4 mt-0.5 text-black rounded focus:ring-black"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-900">⭐ Feature in Home Collection</span>
                        <span className="block text-[11px] text-gray-500 font-normal">Show in Bestsellers on Homepage</span>
                      </div>
                    </label>

                    {/* Option 2: Set as Homepage Hero Background */}
                    <label className="flex items-start gap-2.5 text-sm font-semibold text-slate-700 bg-amber-50/70 border border-amber-250 rounded-xl p-3 cursor-pointer hover:bg-amber-100/70 transition-colors">
                      <input
                        type="checkbox"
                        checked={isHeroBg}
                        onChange={(e) => setIsHeroBg(e.target.checked)}
                        className="w-4 h-4 mt-0.5 text-amber-600 rounded focus:ring-amber-500"
                      />
                      <div>
                        <span className="block text-xs font-bold text-amber-950">🖼️ Set as Homepage Background</span>
                        <span className="block text-[11px] text-amber-700 font-normal">Use this picture as main Home Hero</span>
                      </div>
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Display Order (Top = 1)</label>
                    <input
                      type="number"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(e.target.value)}
                      placeholder="e.g. 1"
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 px-4 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Description</label>
                  <textarea
                    rows="3"
                    placeholder="Brief features, materials, and specifications..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none"
                  ></textarea>
                </div>

              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="admin-product-form"
                disabled={submittingProduct}
                className="px-6 py-2.5 bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                {submittingProduct ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Product
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          ORDER DETAIL MODAL
          Click any order row to see full details
      ═══════════════════════════════════════════════════ */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Order Details</p>
                <h2 className="text-lg font-black text-slate-900">#{selectedOrder.order_number}</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  selectedOrder.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                  selectedOrder.status === 'Shipped'   ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                  selectedOrder.status === 'Confirmed' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' :
                  'bg-amber-50 text-amber-600 border border-amber-200'
                }`}>
                  {selectedOrder.status}
                </span>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition text-lg font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto px-6 py-5 space-y-5">

              {/* Customer Info */}
              <div className="bg-slate-50 rounded-xl border border-gray-100 p-4 space-y-3">
                <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">👤 Customer Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {selectedOrder.user_name && (
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Name</p>
                        <p className="font-semibold text-slate-800">{selectedOrder.user_name}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Phone</p>
                      <p className="font-semibold text-slate-800">{selectedOrder.phone || '—'}</p>
                    </div>
                  </div>
                  {selectedOrder.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Email</p>
                        <p className="font-semibold text-slate-800">{selectedOrder.email}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Delivery Address</p>
                      <p className="font-semibold text-slate-800">{selectedOrder.shipping_address}</p>
                      <p className="text-xs text-gray-500">{selectedOrder.city}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items — Products */}
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">🛍️ Ordered Products</p>
                <div className="space-y-3">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-xl p-3">
                        {/* Product Image */}
                        {item.product?.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product?.name || item.name}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                            <ShoppingBag className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate">
                            {item.product?.name || item.name || 'Product'}
                          </p>
                          {item.product?.category && (
                            <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase inline-block mt-0.5">
                              {formatCategoryName(item.product.category)}
                            </span>
                          )}
                          {item.size && (
                            <p className="text-xs text-gray-500 mt-0.5">Size: <span className="font-bold">{item.size}</span></p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-gray-500">Qty: {item.quantity}</p>
                          <p className="text-sm font-black text-slate-900 mt-0.5">
                            PKR {Number(item.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-gray-400">@ PKR {Number(item.price).toLocaleString()} each</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-xl border border-gray-100">
                      No item details available
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-black text-white rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Total Amount</p>
                  <p className="text-2xl font-black">PKR {Number(selectedOrder.total_amount).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase font-bold">Payment</p>
                  <p className="text-sm font-bold">{selectedOrder.payment_method || 'Cash on Delivery'}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(selectedOrder.created_at).toLocaleDateString('en-PK', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Update Status inside modal too */}
              <div className="flex items-center gap-3 pt-1">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Update Status:</p>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    handleUpdateOrderStatus(selectedOrder.id, e.target.value);
                    setSelectedOrder((prev) => ({ ...prev, status: e.target.value }));
                  }}
                  className="flex-1 bg-slate-50 border border-gray-200 text-sm font-semibold px-3 py-2 rounded-xl focus:outline-none focus:border-black"
                >
                  <option value="Pending">🕐 Pending</option>
                  <option value="Confirmed">✅ Confirmed</option>
                  <option value="Shipped">🚚 Shipped</option>
                  <option value="Delivered">📦 Delivered</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
