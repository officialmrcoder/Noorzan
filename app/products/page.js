'use client';

import React, { useEffect, useState, useMemo, memo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SAMPLE_PRODUCTS, isSupabaseConfigured } from '@/lib/mockData';
import ProductCard from '@/components/ProductCard';
import { Search, SlidersHorizontal, RotateCcw, ChevronDown } from 'lucide-react';

const ProductsPageContent = memo(() => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState(150);
  const [sortBy, setSortBy] = useState('newest');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        if (!isSupabaseConfigured()) {
          setProducts(SAMPLE_PRODUCTS);
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(SAMPLE_PRODUCTS);
        }
      } catch (err) {
        console.error("Error loading products from Supabase:", err);
        setProducts(SAMPLE_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesPrice = Number(product.price) <= priceRange;
        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
        if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const categories = [
    { name: 'All Bags', value: 'all' },
    { name: 'Backpacks', value: 'backpack' },
    { name: 'Messenger Bags', value: 'messenger' },
    { name: 'Laptop Bags', value: 'laptop_bag' },
    { name: 'Travel Bags', value: 'travel_bag' },
    { name: 'Handbags', value: 'handbag' },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange(150);
    setSortBy('newest');
    router.replace('/products');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center md:text-left mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Our Catalog</h1>
        <p className="text-sm text-gray-500 mt-1">Explore all premium bags with custom sorting and filters</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="hidden lg:block space-y-6 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" /> Filters
            </h2>
            <button onClick={handleResetFilters} className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition-colors">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Search</label>
            <div className="relative">
              <input type="text" placeholder="Search bags..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all" />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Category</label>
            <div className="flex flex-col gap-1.5">
              {categories.map((cat) => (
                <button key={cat.value} onClick={() => setSelectedCategory(cat.value)} className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat.value ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Max Price</label>
              <span className="text-sm font-bold text-slate-800">${priceRange}</span>
            </div>
            <input type="range" min="20" max="200" step="5" value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} className="w-full h-1.5 bg-gray-150 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            <div className="flex justify-between text-[10px] text-gray-400 font-medium">
              <span>$20</span><span>$200</span>
            </div>
          </div>
        </aside>

        <div className="lg:hidden flex flex-col gap-4">
          <div className="relative">
            <input type="text" placeholder="Search bags..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all" />
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-4" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowFiltersMobile(!showFiltersMobile)} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-sm font-semibold rounded-xl text-slate-700 hover:bg-gray-50 transition-colors shadow-sm">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" /> Filters
            </button>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="flex-1 bg-white border border-gray-200 text-sm font-semibold rounded-xl px-3 py-3 text-slate-700 focus:outline-none shadow-sm">
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
          {showFiltersMobile && (
            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-md space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-bold text-slate-800">Advanced Filters</h3>
                <button onClick={handleResetFilters} className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" /> Reset All
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-gray-400">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button key={cat.value} onClick={() => setSelectedCategory(cat.value)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === cat.value ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-gray-600 hover:bg-slate-100'}`}>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase text-gray-400">Max Price</label>
                  <span className="text-sm font-bold text-slate-800">${priceRange}</span>
                </div>
                <input type="range" min="20" max="200" step="5" value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              </div>
              <button onClick={() => setShowFiltersMobile(false)} className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-sm font-semibold">
                Apply Filters
              </button>
            </div>
          )}
        </div>

        <section className="lg:col-span-3 space-y-6">
          <div className="hidden lg:flex items-center justify-between bg-white border border-gray-100 px-6 py-4 rounded-2xl shadow-sm">
            <span className="text-sm text-gray-500 font-medium">
              Showing <span className="font-bold text-slate-800">{filteredProducts.length}</span> bags
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sort by</span>
              <div className="relative">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="appearance-none bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all cursor-pointer">
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 h-96 flex flex-col gap-4 animate-pulse">
                  <div className="bg-gray-200 h-48 w-full rounded-xl"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mt-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-8 bg-gray-200 rounded w-full mt-auto"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No bags match your search</h3>
              <p className="text-sm text-gray-500 mt-1 mb-6">Try clearing your filters or search keywords.</p>
              <button onClick={handleResetFilters} className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/10">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
});

ProductsPageContent.displayName = 'ProductsPageContent';

function ProductsPageFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center md:text-left mb-8">
        <div className="h-8 bg-slate-100 rounded w-1/3 animate-pulse"></div>
        <div className="h-4 bg-slate-100 rounded w-1/2 mt-2 animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="hidden lg:block space-y-6"></div>
        <section className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 h-96 flex flex-col gap-4 animate-pulse">
                <div className="bg-gray-200 h-48 w-full rounded-xl"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mt-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-8 bg-gray-200 rounded w-full mt-auto"></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageFallback />}>
      <ProductsPageContent />
    </Suspense>
  );
}