'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SAMPLE_PRODUCTS, isSupabaseConfigured } from '@/lib/mockData';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { ShoppingCart, Heart, Truck, ShieldCheck, ChevronLeft, Minus, Plus, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;

  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Medium');
  const [activeImage, setActiveImage] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);

  // Load product details
  useEffect(() => {
    async function loadProduct() {
      try {
        let foundProduct = null;

        if (isSupabaseConfigured()) {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .maybeSingle();

          if (!error && data) {
            foundProduct = data;
          }
        }

        // Fallback to sample products if not found
        if (!foundProduct) {
          foundProduct = SAMPLE_PRODUCTS.find((p) => p.id === productId);
        }

        if (foundProduct) {
          setProduct(foundProduct);
          setActiveImage(foundProduct.image_url);
          
          // Generate a couple of gallery thumbnails using different crops/images
          setGalleryImages([
            foundProduct.image_url,
            'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=600'
          ]);
        }
      } catch (err) {
        console.error("Error loading product details:", err);
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(10, prev + 1));
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, selectedSize);
    showToast(`${quantity}x ${product.name} (${selectedSize}) added to cart!`, 'success');
  };

  const handleBuyNow = () => {
    if (!product) return;
    // Add to cart and redirect straight to checkout
    addToCart(product, quantity, selectedSize);
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-20 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-[400px] bg-gray-200 rounded-3xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Bag Not Found</h2>
        <p className="text-gray-500 mt-2">The product you are looking for does not exist or has been removed.</p>
        <Link href="/products" className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium">
          <ChevronLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb / Back button */}
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-indigo-600 mb-8 transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left Side: Images */}
        <div className="space-y-4">
          <div className="relative pt-[85%] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            <img
              src={activeImage}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          
          {/* Thumbnails list */}
          <div className="grid grid-cols-4 gap-3">
            {galleryImages.map((imgUrl, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(imgUrl)}
                className={`relative pt-[100%] rounded-xl overflow-hidden border-2 bg-white transition-all ${
                  activeImage === imgUrl ? 'border-indigo-600 scale-[0.98]' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`Thumbnail ${index}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Product Details */}
        <div className="flex flex-col">
          {/* Category Tag */}
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 rounded-full px-3.5 py-1 w-fit mb-4">
            {product.category}
          </span>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-2">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-extrabold text-slate-900">
              ${Number(product.price).toFixed(2)}
            </span>
            {product.stock > 0 ? (
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2.5 py-0.5">
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100 rounded-full px-2.5 py-0.5">
                Out of Stock
              </span>
            )}
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              {product.description || "This premium bag is made of first-class materials and offers unmatched utility for all storage needs."}
            </p>
          </div>

          {/* Size Selector */}
          <div className="border-t border-gray-100 pt-6 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Select Size</h3>
              <span className="text-xs font-medium text-gray-400">Regular Fit</span>
            </div>
            <div className="flex gap-3">
              {['Small', 'Medium', 'Large'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${
                    selectedSize === size
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm'
                      : 'border-gray-200 text-slate-700 hover:bg-gray-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="border-t border-gray-100 pt-6 mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Quantity</h3>
              <p className="text-xs text-gray-400 font-medium">Max 10 per order</p>
            </div>
            
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <button
                onClick={handleDecrement}
                className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-sm font-bold text-slate-800">{quantity}</span>
              <button
                onClick={handleIncrement}
                className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-white border border-indigo-600 hover:bg-indigo-50 text-indigo-600 disabled:border-gray-200 disabled:text-gray-400 font-bold rounded-2xl transition-all shadow-sm"
            >
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>
            
            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-300 font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25"
            >
              <CreditCard className="w-5 h-5" /> Buy It Now
            </button>
          </div>

          {/* Secure Trust Badges */}
          <div className="mt-8 grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Truck className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Cash on Delivery Available</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>7-Day Return Policy</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
