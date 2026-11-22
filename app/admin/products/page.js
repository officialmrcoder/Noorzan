// app/admin/products/page.js
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabase";
import { SAMPLE_PRODUCTS, isSupabaseConfigured } from "@/lib/mockData";
import { getCategories, createCategory, formatCategoryName } from "@/lib/categories";
import { setHeroBackground, getHeroBackground } from "@/lib/settings";
import { Loader2, Edit2, Trash2, Save, Plus, Tag, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function AdminProducts() {
  const { user, isAdmin, loading } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "watches",
    image_url: "",
    stock: "10",
    is_featured: false,
    is_hero_bg: false,
    display_order: "0",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);
  const [currentHeroUrl, setCurrentHeroUrl] = useState("");

  // Guard
  useEffect(() => {
    if (!loading && !isAdmin) {
      showToast("Access denied. Admins only.", "error");
    }
  }, [user, isAdmin, loading, showToast]);

  // Load products, categories, and hero background
  useEffect(() => {
    async function load() {
      let loadedProds = [];
      if (!isSupabaseConfigured()) {
        loadedProds = SAMPLE_PRODUCTS;
      } else {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) {
          console.error(error);
          showToast("Failed to load products", "error");
        } else {
          loadedProds = data || [];
        }
      }
      setProducts(loadedProds);
      const loadedCats = await getCategories(loadedProds);
      setCategories(loadedCats);

      const hero = await getHeroBackground();
      if (hero && hero.imageUrl) {
        setCurrentHeroUrl(hero.imageUrl);
      }

      setLoadingData(false);
    }
    load();
  }, [showToast]);

  const handleCreateNewCategory = async () => {
    if (!newCatName.trim()) {
      showToast("Please enter category name", "error");
      return;
    }
    setCreatingCat(true);
    try {
      const created = await createCategory(newCatName);
      const updatedCats = await getCategories([...products, { category: created.slug }]);
      setCategories(updatedCats);
      setForm((prev) => ({ ...prev, category: created.slug }));
      setNewCatName("");
      setShowNewCatInput(false);
      showToast(`Category "${created.name}" created!`, "success");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to create category", "error");
    } finally {
      setCreatingCat(false);
    }
  };

  const openForm = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setForm({
        name: product.name,
        price: product.price,
        category: product.category,
        image_url: product.image_url,
        stock: product.stock,
        is_featured: product.is_featured || false,
        is_hero_bg: product.is_hero_bg || currentHeroUrl === product.image_url || false,
        display_order: (product.display_order || 0).toString(),
      });
    } else {
      setEditingProduct(null);
      setForm({
        name: "",
        price: "",
        category: categories[0]?.slug || "watches",
        image_url: "",
        stock: "10",
        is_featured: false,
        is_hero_bg: false,
        display_order: "0",
      });
    }
    setFormOpen(true);
  };

  const handleSetProductAsHero = async (p) => {
    try {
      await setHeroBackground({
        imageUrl: p.image_url,
        productId: p.id,
        title: p.name,
      });
      setCurrentHeroUrl(p.image_url);
      setProducts((prev) =>
        prev.map((pr) => ({ ...pr, is_hero_bg: pr.id === p.id }))
      );
      showToast(`"${p.name}" set as Homepage background!`, "success");
    } catch (e) {
      showToast("Failed to set homepage background", "error");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      name: form.name,
      price: Number(form.price),
      category: form.category,
      image_url:
        form.image_url ||
        "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
      stock: Number(form.stock),
      is_featured: form.is_featured,
      is_hero_bg: form.is_hero_bg,
      display_order: Number(form.display_order || 0),
    };

    // Timeout helper (generous 25s for slow mobile networks)
    const withTimeout = (promise, ms = 25000, errorMsg = 'Database request timed out') => {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms)),
      ]);
    };

    try {
      let savedId = editingProduct?.id;

      if (!isSupabaseConfigured()) {
        // Mock update/create
        if (editingProduct) {
          setProducts((p) =>
            p.map((pr) => (pr.id === editingProduct.id ? { ...pr, ...payload } : pr))
          );
          showToast("Product updated (Mock)", "success");
        } else {
          savedId = `mock-${Date.now()}`;
          const newProd = { id: savedId, ...payload, created_at: new Date().toISOString() };
          setProducts((p) => [newProd, ...p]);
          showToast("Product created (Mock)", "success");
        }

        if (form.is_hero_bg) {
          await setHeroBackground({
            imageUrl: payload.image_url,
            productId: savedId,
            title: payload.name,
          });
          setCurrentHeroUrl(payload.image_url);
        }

        setFormOpen(false);
        setSubmitting(false);
        return;
      }

      if (editingProduct) {
        let updateError = null;
        try {
          const { error } = await withTimeout(
            supabase.from("products").update(payload).eq("id", editingProduct.id),
            25000,
            "Product update timed out"
          );
          updateError = error;
        } catch (err) {
          const { is_hero_bg, ...safePayload } = payload;
          const { error } = await withTimeout(
            supabase.from("products").update(safePayload).eq("id", editingProduct.id),
            25000,
            "Product update timed out"
          );
          updateError = error;
        }

        if (updateError) throw updateError;
        setProducts((p) =>
          p.map((pr) => (pr.id === editingProduct.id ? { ...pr, ...payload } : pr))
        );
        showToast("Product updated", "success");
      } else {
        let inserted = null;
        try {
          const { data, error } = await withTimeout(
            supabase.from("products").insert([payload]).select(),
            25000,
            "Product insert timed out"
          );
          if (error) throw error;
          inserted = data?.[0] || { id: `prod-${Date.now()}`, ...payload };
        } catch (err) {
          const { is_hero_bg, ...safePayload } = payload;
          const { data, error } = await withTimeout(
            supabase.from("products").insert([safePayload]).select(),
            25000,
            "Product insert timed out"
          );
          if (error) throw error;
          inserted = data?.[0] || { id: `prod-${Date.now()}`, ...safePayload };
        }
        savedId = inserted?.id;
        setProducts((p) => [inserted, ...p]);
        showToast("Product created", "success");
      }

      if (form.is_hero_bg) {
        try {
          await setHeroBackground({
            imageUrl: payload.image_url,
            productId: savedId,
            title: payload.name,
          });
          setCurrentHeroUrl(payload.image_url);
        } catch (heroErr) {
          console.warn("Hero bg update warning:", heroErr);
        }
      }

      setFormOpen(false);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to save product", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    if (!isSupabaseConfigured()) {
      setProducts((p) => p.filter((pr) => pr.id !== id));
      showToast("Product deleted (Mock)", "success");
      return;
    }
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error(error);
      showToast("Failed to delete", "error");
    } else {
      setProducts((p) => p.filter((pr) => pr.id !== id));
      showToast("Product deleted", "success");
    }
  };

  if (loading || (!isAdmin && !loading)) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Manage Products & Collections</h1>
          <p className="text-xs text-gray-500 mt-1">Watches, Bags, Clothing, and Lifestyle Accessories.</p>
        </div>
        <button
          onClick={() => openForm()}
          className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-800 transition"
        >
          + Add New Product
        </button>
      </div>

      {loadingData ? (
        <div className="text-center py-20">Loading inventory…</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="p-4 text-left">Product Name</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Price</th>
                <th className="p-4 text-left">Stock</th>
                <th className="p-4 text-left">Homepage Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => {
                const isHero = currentHeroUrl === p.image_url || p.is_hero_bg;
                return (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                        />
                        <span className="font-bold text-gray-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-md text-xs font-bold uppercase">
                        <Tag size={10} />
                        {formatCategoryName(p.category)}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-900">
                      PKR {Number(p.price).toLocaleString()}
                    </td>
                    <td className="p-4 text-xs text-gray-600 font-semibold">{p.stock}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {p.is_featured && (
                          <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-800 font-bold px-2 py-0.5 rounded uppercase">
                            ⭐ Featured
                          </span>
                        )}
                        {isHero && (
                          <span className="text-[10px] bg-green-50 border border-green-200 text-green-800 font-bold px-2 py-0.5 rounded uppercase">
                            🖼️ Home Bg
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleSetProductAsHero(p)}
                        className={`p-1.5 rounded-lg border ${
                          isHero
                            ? "bg-amber-100 border-amber-300 text-amber-800"
                            : "border-gray-200 hover:bg-gray-100 text-gray-600"
                        }`}
                        title="Set as Homepage Background"
                      >
                        <ImageIcon size={15} />
                      </button>
                      <button
                        onClick={() => openForm(p)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setFormOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-slate-800">
                {editingProduct ? "✏️ Edit Product" : "➕ Add New Product"}
              </h2>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Scrollable form body */}
            <div className="overflow-y-auto px-6 py-5 space-y-4">
              <form id="product-form" onSubmit={handleSave} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Product Name *
                  </label>
                  <input
                    required
                    placeholder="e.g. Royal Chronograph Watch, Leather Backpack"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black"
                  />
                </div>

                {/* Price + Stock */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                      Price (PKR) *
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="1"
                      placeholder="e.g. 8500"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                      Stock Qty *
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 10"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase">
                      Category *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewCatInput(!showNewCatInput)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                    >
                      {showNewCatInput ? "Cancel" : "+ New Category"}
                    </button>
                  </div>

                  {showNewCatInput && (
                    <div className="mb-2 p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-2">
                      <span className="text-xs font-medium text-slate-700 block">
                        Create new category:
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Watches, Clothing..."
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleCreateNewCategory}
                          disabled={creatingCat || !newCatName.trim()}
                          className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-bold"
                        >
                          {creatingCat ? "Adding..." : "Add"}
                        </button>
                      </div>
                    </div>
                  )}

                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black capitalize"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Image URL
                  </label>
                  <input
                    placeholder="https://..."
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black"
                  />
                  {form.image_url && (
                    <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={form.image_url}
                        alt="preview"
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    </div>
                  )}
                </div>

                {/* Homepage Options: Feature & Hero Background */}
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-start gap-2.5 text-sm font-semibold text-slate-700 bg-slate-50 border border-gray-200 rounded-xl p-3 cursor-pointer hover:bg-slate-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={form.is_featured}
                        onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                        className="w-4 h-4 mt-0.5 text-black rounded"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-900">
                          ⭐ Feature in Home Collection
                        </span>
                        <span className="block text-[11px] text-gray-500 font-normal">
                          Show in Bestsellers on Homepage
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 text-sm font-semibold text-slate-700 bg-amber-50/70 border border-amber-200 rounded-xl p-3 cursor-pointer hover:bg-amber-100/70 transition-colors">
                      <input
                        type="checkbox"
                        checked={form.is_hero_bg}
                        onChange={(e) => setForm({ ...form, is_hero_bg: e.target.checked })}
                        className="w-4 h-4 mt-0.5 text-amber-600 rounded"
                      />
                      <div>
                        <span className="block text-xs font-bold text-amber-950">
                          🖼️ Set as Homepage Background
                        </span>
                        <span className="block text-[11px] text-amber-700 font-normal">
                          Use picture as main Home Hero banner
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="product-form"
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-black hover:bg-gray-800 disabled:bg-gray-400 rounded-xl transition flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Saving…" : editingProduct ? "Update Product" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
