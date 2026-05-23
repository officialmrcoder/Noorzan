// app/admin/products/page.js
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabase";
import { SAMPLE_PRODUCTS, isSupabaseConfigured } from "@/lib/mockData";
import { Loader2, Edit2, Trash2, Save } from "lucide-react";
import Link from "next/link";

export default function AdminProducts() {
  const { user, isAdmin, loading } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", category: "backpack", image_url: "", stock: "1" });
  const [submitting, setSubmitting] = useState(false);

  // Guard
  useEffect(() => {
    if (!loading && !isAdmin) {
      showToast("Access denied. Admins only.", "error");
    }
  }, [user, isAdmin, loading, showToast]);

  // Load products
  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) {
        setProducts(SAMPLE_PRODUCTS);
        setLoadingData(false);
        return;
      }
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) {
        console.error(error);
        showToast("Failed to load products", "error");
      } else {
        setProducts(data || []);
      }
      setLoadingData(false);
    }
    load();
  }, []);

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
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">{editingProduct ? "Edit" : "Add"} Bag</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded p-2" />
              <input required type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border rounded p-2" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border rounded p-2">
                <option value="backpack">Backpack</option>
                <option value="messenger">Messenger</option>
                <option value="laptop_bag">Laptop Bag</option>
                <option value="travel_bag">Travel Bag</option>
                <option value="handbag">Handbag</option>
              </select>
              <input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full border rounded p-2" />
              <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full border rounded p-2" />
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center">
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
