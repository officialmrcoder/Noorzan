'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SAMPLE_PRODUCTS, isSupabaseConfigured } from '@/lib/mockData';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';

const CATEGORY_LABELS = {
  tote: 'Tote Bags',
  shoulder: 'Shoulder Bags',
  crossbody: 'Crossbody Bags',
  clutch: 'Clutch Bags',
  backpack: 'Backpacks',
  handbag: 'Handbags',
};

function getCategoryLabel(cat) {
  return CATEGORY_LABELS[cat] || (cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'Bags');
}

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
  const [openAccordion, setOpenAccordion] = useState(null);

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
            'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=600',
          ]);
        }
      } catch (err) {
        console.error('Error loading product details:', err);
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

  const toggleAccordion = (key) => {
    setOpenAccordion((prev) => (prev === key ? null : key));
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-[4/5] bg-gray-100 rounded" />
            <div className="space-y-4">
              <div className="h-3 bg-gray-100 rounded w-20" />
              <div className="h-8 bg-gray-100 rounded w-3/4" />
              <div className="h-6 bg-gray-100 rounded w-1/4" />
              <div className="h-20 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-2xl font-black text-black mb-2">Product Not Found</h2>
          <p className="text-gray-400 text-sm mb-6">
            The product you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/products"
            className="inline-block border-2 border-black text-black font-bold px-8 py-3 uppercase tracking-widest text-sm hover:bg-black hover:text-white transition-all"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const accordions = [
    {
      key: 'description',
      title: 'Description',
      content: product.description || 'Premium quality bag crafted with high-grade materials for everyday use and style.',
    },
    {
      key: 'details',
      title: 'Product Details',
      content: 'Material: Premium Fabric\nDimensions: Standard Size\nHardware: Metal Zippers & Clasps\nInterior: Soft lining with multiple pockets',
    },
    {
      key: 'care',
      title: 'Care & Maintenance',
      content: 'Wipe clean with a dry cloth. Avoid prolonged exposure to direct sunlight. Store in a cool dry place.',
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <nav className="text-xs text-gray-400 flex items-center gap-1.5">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-black transition-colors">Products</Link>
          <span>/</span>
          <span className="text-black">{product.name}</span>
        </nav>
      </div>

      {/* Main Grid — add pb-24 on mobile to clear sticky bar */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 pb-24 md:pb-8">

        {/* LEFT — Image Gallery */}
        <div>
          {/* Main Image */}
          <div className="aspect-[4/5] overflow-hidden bg-gray-100">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {galleryImages.map((imgUrl, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(imgUrl)}
                className={`aspect-square border-2 overflow-hidden cursor-pointer transition-all ${
                  activeImage === imgUrl ? 'border-black' : 'border-transparent'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`View ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT — Product Info */}
        <div>
          {/* Category Tag */}
          <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
            {getCategoryLabel(product.category)}
          </p>

          {/* Product Name */}
          <h1 className="text-3xl font-black text-black leading-tight mb-3">
            {product.name}
          </h1>

          {/* Price Row */}
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-2xl font-black text-black">
              PKR {Number(product.price).toLocaleString()}
            </span>
            {product.original_price && Number(product.original_price) > Number(product.price) && (
              <span className="text-lg text-gray-400 line-through">
                PKR {Number(product.original_price).toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock Badge */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <span className="text-xs font-semibold text-green-600">
                ✓ In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-xs font-semibold text-red-600">
                ✗ Out of Stock
              </span>
            )}
          </div>

          <hr className="border-gray-100 mb-6" />

          {/* Size Selector */}
          <div className="mb-6">
            <p className="text-xs font-bold tracking-widest uppercase text-gray-700 mb-3">Size</p>
            <div className="flex gap-2">
              {['Small', 'Medium', 'Large'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-6 py-2.5 text-sm font-semibold transition-all ${
                    selectedSize === size
                      ? 'border-2 border-black bg-black text-white'
                      : 'border border-gray-200 text-gray-700 hover:border-black'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mt-6 mb-6">
            <p className="text-xs font-bold tracking-widest uppercase text-gray-700 mb-3">Quantity</p>
            <div className="flex border border-gray-200 w-fit">
              <button
                onClick={handleDecrement}
                className="px-4 py-2.5 hover:bg-gray-50 border-r border-gray-200 transition-colors"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="px-6 py-2.5 text-sm font-bold text-center min-w-[3rem]">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                className="px-4 py-2.5 hover:bg-gray-50 border-l border-gray-200 transition-colors"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="w-full border-2 border-black text-black font-bold py-4 uppercase tracking-widest text-sm hover:bg-black hover:text-white transition-all disabled:opacity-40"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="w-full bg-black text-white font-bold py-4 uppercase tracking-widest text-sm hover:bg-gray-900 transition-all disabled:opacity-40"
            >
              Buy It Now
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-4 mb-8 text-xs text-gray-500">
            <span className="flex items-center gap-1 font-semibold">🚚 Cash on Delivery</span>
            <span className="flex items-center gap-1 font-semibold">🔄 7-Day Returns</span>
            <span className="flex items-center gap-1 font-semibold">✓ 100% Authentic</span>
          </div>

          {/* Accordions */}
          <div>
            {accordions.map(({ key, title, content }) => {
              const isOpen = openAccordion === key;
              return (
                <div key={key} className="border-t border-gray-100">
                  <button
                    onClick={() => toggleAccordion(key)}
                    className="w-full flex justify-between items-center py-4 text-sm font-bold uppercase tracking-widest text-left"
                  >
                    {title}
                    <span className="text-xl font-light">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="pb-4 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                      {content}
                    </div>
                  )}
                </div>
              );
            })}
            {/* Close off the last accordion with a bottom border */}
            <div className="border-t border-gray-100" />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 p-4 z-30">
        <div className="flex items-center gap-3">
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-xs font-semibold truncate">{product.name}</span>
            <span className="text-sm font-black">PKR {Number(product.price).toLocaleString()}</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="bg-black text-white font-bold px-6 py-3 text-xs uppercase tracking-widest flex-shrink-0 disabled:opacity-40"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
