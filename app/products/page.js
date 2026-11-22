'use client';

import React, { useEffect, useState, useMemo, memo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SAMPLE_PRODUCTS, isSupabaseConfigured } from '@/lib/mockData';
import { getCategories } from '@/lib/categories';
import ProductCard from '@/components/ProductCard';
import { Search, SlidersHorizontal, RotateCcw, ChevronDown, X, Check } from 'lucide-react';

const ProductsPageContent = memo(function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState(25000);
  const [priceRange, setPriceRange] = useState(25000);
  const [sortBy, setSortBy] = useState('newest');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        let prods = [];
        if (!isSupabaseConfigured()) {
          prods = SAMPLE_PRODUCTS;
        } else {
          const { data, error } = await supabase.from('products').select('*');
          if (error) throw error;
          // Use only real DB data — empty array = no products (don't fall back to mock)
          prods = data || [];
        }
        setProducts(prods);

        // compute max price dynamically
        if (prods.length > 0) {
          const highest = Math.max(...prods.map((p) => Number(p.price) || 0), 10000);
          setMaxPrice(highest);
          setPriceRange(highest);
        }

        const cats = await getCategories(prods);
        setDynamicCategories(cats);
      } catch (err) {
        console.error('Error loading products from Supabase:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesPrice = Number(product.price) <= priceRange;
        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
        if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
        if (sortBy === 'title-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'title-desc') return b.name.localeCompare(a.name);
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const categories = [
    { name: 'All Collections', value: 'all' },
    ...(dynamicCategories.length > 0
      ? dynamicCategories.map((c) => ({ name: c.name, value: c.slug }))
      : [
          { name: 'Watches', value: 'watches' },
          { name: 'Bags & Luggage', value: 'bags' },
          { name: 'Clothing & Apparel', value: 'clothing' },
          { name: 'Backpacks', value: 'backpack' },
          { name: 'Messenger Bags', value: 'messenger' },
          { name: 'Laptop Bags', value: 'laptop_bag' },
          { name: 'Travel Bags', value: 'travel_bag' },
          { name: 'Handbags', value: 'handbag' },
        ]),
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange(maxPrice);
    setSortBy('newest');
    router.replace('/products');
  };

  return (
    <div className="bg-white min-h-screen">
      {/* ── Catalog Banner / Header ── */}
      <div className="border-b border-gray-200 py-10 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">Collections</p>
              <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight mt-1">
                {selectedCategory === 'all'
                  ? 'All Collections & Products'
                  : categories.find((c) => c.value === selectedCategory)?.name || 'Collection'}
              </h1>
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Available
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Top Bar Controls (Mobile toggle + Sort dropdown) ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowFiltersMobile(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 border border-black text-xs font-bold uppercase tracking-wider text-black hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal size={14} /> Filter & Sort
          </button>

          {/* Desktop Reset Pill if filtered */}
          <div className="hidden lg:flex items-center gap-2">
            {(selectedCategory !== 'all' || searchTerm !== '' || priceRange < maxPrice) && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-black transition-colors"
              >
                <RotateCcw size={12} /> Clear all filters
              </button>
            )}
          </div>

          {/* Sort By Selector */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-200 text-xs font-bold uppercase tracking-wider px-3 py-2 text-black focus:outline-none focus:border-black cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="title-asc">Alphabetical: A - Z</option>
              <option value="title-desc">Alphabetical: Z - A</option>
            </select>
          </div>
        </div>

        {/* ── Main Catalog Content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
          {/* ── Desktop Left Sidebar Filters ── */}
          <aside className="hidden lg:block space-y-8 pr-6 border-r border-gray-100 h-fit sticky top-24">
            {/* Search Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-black block">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter by keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-200 px-3 py-2 pl-9 text-xs font-medium text-black placeholder-gray-400 focus:outline-none focus:border-black"
                />
                <Search size={14} className="text-gray-400 absolute left-3 top-2.5" />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-black">
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Navigation */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-black block">Categories</label>
              <div className="flex flex-col space-y-1">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`w-full text-left py-2 px-2.5 text-xs transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'font-bold text-black bg-gray-100'
                          : 'font-medium text-gray-600 hover:text-black hover:bg-gray-50'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {isSelected && <Check size={13} className="text-black" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-widest text-black">Max Price</label>
                <span className="text-xs font-bold text-black">PKR {Number(priceRange).toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max={maxPrice}
                step="500"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 appearance-none cursor-pointer accent-black"
              />
              <div className="flex justify-between text-[11px] text-gray-400 font-medium">
                <span>PKR 1,000</span>
                <span>PKR {Number(maxPrice).toLocaleString()}</span>
              </div>
            </div>

            {/* Trust box */}
            <div className="p-4 bg-gray-50 border border-gray-100 text-xs text-gray-600 space-y-2">
              <p className="font-bold text-black uppercase tracking-wider">New Mughal Collections Guarantee</p>
              <p>• Nationwide COD Available</p>
              <p>• 7-Day Easy Exchange</p>
              <p>• Premium Quality Checked</p>
            </div>
          </aside>

          {/* ── Product Grid ── */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse space-y-3">
                    <div className="bg-gray-200 h-80 w-full"></div>
                    <div className="h-4 bg-gray-200 w-3/4"></div>
                    <div className="h-4 bg-gray-200 w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center border border-gray-100 bg-gray-50/50 p-8 space-y-4">
                <p className="text-base font-bold text-black uppercase tracking-wider">No Bags Found</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  No products matched your criteria. Try adjusting your search keyword, category, or price slider.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile Slide-Over Filter Drawer ── */}
      {showFiltersMobile && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowFiltersMobile(false)} />
          <div className="relative ml-auto w-80 max-w-[85vw] h-full bg-white flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <span className="text-sm font-bold uppercase tracking-wider text-black">Filter & Sort</span>
              <button onClick={() => setShowFiltersMobile(false)} className="text-gray-500 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Category */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-black block mb-3">Category</label>
                <div className="space-y-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`w-full text-left px-3 py-2 text-xs flex justify-between items-center ${
                        selectedCategory === cat.value ? 'bg-black text-white font-bold' : 'text-gray-700 bg-gray-50'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {selectedCategory === cat.value && <Check size={13} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-black">Max Price</label>
                  <span className="text-xs font-bold text-black">PKR {Number(priceRange).toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max={maxPrice}
                  step="500"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-1 bg-gray-200 appearance-none cursor-pointer accent-black"
                />
              </div>

              {/* Sort */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-black block mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-black focus:outline-none"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="title-asc">Alphabetical: A - Z</option>
                  <option value="title-desc">Alphabetical: Z - A</option>
                </select>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 space-y-2">
              <button
                onClick={() => setShowFiltersMobile(false)}
                className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-widest"
              >
                Show Results ({filteredProducts.length})
              </button>
              <button
                onClick={handleResetFilters}
                className="w-full py-2.5 border border-gray-200 text-gray-600 text-xs font-semibold uppercase tracking-wider"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-pulse">
          <div className="h-8 bg-gray-200 w-1/4 mx-auto mb-4"></div>
          <div className="h-64 bg-gray-100 max-w-4xl mx-auto"></div>
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}