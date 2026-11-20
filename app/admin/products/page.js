// app/admin/products/page.js
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabase";
import { SAMPLE_PRODUCTS, isSupabaseConfigured } from "@/lib/mockData";
import { getCategories, createCategory } from "@/lib/categories";
import { Loader2, Edit2, Trash2, Save, Plus } from "lucide-react";
import Link from "next/link";

export default function AdminProducts() {
  const { user, isAdmin, loading } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", category: "backpack", image_url: "", stock: "1" });
  const [submitting, setSubmitting] = useState(false);
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);

  // Guard
  useEffect(() => {
    if (!loading && !isAdmin) {
      showToast("Access denied. Admins only.", "error");
    }
  }, [user, isAdmin, loading, showToast]);

  // Load products & categories
  useEffect(() => {
    async function load() {
      let loadedProds = [];
      if (!isSupabaseConfigured()) {
        loadedProds = SAMPLE_PRODUCTS;
      } else {
        const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
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
      setLoadingData(false);
    }
    load();
  }, []);

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
      setForm({ name: product.name, price: product.price, category: product.category, image_url: product.image_url, stock: product.stock });
    } else {
      setEditingProduct(null);
      setForm({ name: "", price: "", category: "backpack", image_url: "", stock: "1" });
    }
    setFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      name: form.name,
      price: Number(form.price),
      category: form.category,
      image_url: form.image_url || "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
      stock: Number(form.stock),
    };
    try {
      if (!isSupabaseConfigured()) {
        // Mock update/create
        if (editingProduct) {
          setProducts((p) => p.map((pr) => (pr.id === editingProduct.id ? { ...pr, ...payload } : pr)));
          showToast("Product updated (Mock)", "success");
        } else {
          const newProd = { id: `mock-${Date.now()}`, ...payload, created_at: new Date().toISOString() };
          setProducts((p) => [newProd, ...p]);
          showToast("Product created (Mock)", "success");
        }
        setFormOpen(false);
        setSubmitting(false);
        return;
      }

      if (editingProduct) {
        const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
        if (error) throw error;
        setProducts((p) => p.map((pr) => (pr.id === editingProduct.id ? { ...pr, ...payload } : pr)));
        showToast("Product updated", "success");
      } else {
        const { data, error } = await supabase.from("products").insert([payload]).select().single();
        if (error) throw error;
        setProducts((p) => [data, ...p]);
        showToast("Product created", "success");
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <button onClick={() => openForm()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Add New Bag
        </button>
      </div>
      {loadingData ? (
        <div className="text-center py-20">Loading…</div>
      ) : (
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Price</th>
              <th className="p-2 text-left">Stock</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.name}</td>
                <td className="p-2 capitalize">{p.category}</td>
                <td className="p-2">${p.price.toFixed(2)}</td>
                <td className="p-2">{p.stock}</td>
                <td className="p-2 text-center space-x-2">
                  <button onClick={() => openForm(p)} className="p-1 text-indigo-600 hover:bg-indigo-50 rounded">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {formOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setFormOpen(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

            {/* Header — always visible */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-slate-800">
                {editingProduct ? "✏️ Edit Bag" : "➕ Add New Bag"}
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
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Product Name</label>
                  <input
                    required
                    placeholder="e.g. Leather Backpack"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>

                {/* Price + Stock side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Price (PKR)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 2500"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Stock</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 10"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase">Category</label>
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
                      <span className="text-xs font-medium text-slate-700 block">Create new category:</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Travel Duffel, Office..."
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        />
                        <button
                          type="button"
                          onClick={handleCreateNewCategory}
                          disabled={creatingCat || !newCatName.trim()}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:bg-gray-300"
                        >
                          {creatingCat ? "Adding..." : "Add"}
                        </button>
                      </div>
                    </div>
                  )}

                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
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
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Image URL</label>
                  <input
                    placeholder="https://..."
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                  {/* Image preview */}
                  {form.image_url && (
                    <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                      <img src={form.image_url} alt="preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                    </div>
                  )}
                </div>

              </form>
            </div>

            {/* Footer — always visible at bottom */}
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
                className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl transition flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Saving…" : editingProduct ? "Update Bag" : "Add Bag"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
