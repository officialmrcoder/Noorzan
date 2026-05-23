// app/api/products/route.js
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/mockData';

/**
 * GET /api/products
 * Returns all products. Supports optional query params:
 *   - category: filter by category
 *   - search: case‑insensitive name search
 *   - sort: "price_asc", "price_desc", "newest"
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort');

  if (!isSupabaseConfigured()) {
    // Mock mode – return sample data from mockData
    const { SAMPLE_PRODUCTS } = await import('@/lib/mockData');
    let products = SAMPLE_PRODUCTS;
    if (category) products = products.filter(p => p.category === category);
    if (search) products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (sort === 'price_asc') products = products.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') products = products.sort((a, b) => b.price - a.price);
    if (sort === 'newest') products = products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return NextResponse.json(products);
  }

  let query = supabase.from('products').select('*');

  if (category) query = query.eq('category', category);
  if (search) query = query.ilike('name', `%${search}%`);
  if (sort === 'price_asc') query = query.order('price', { ascending: true });
  else if (sort === 'price_desc') query = query.order('price', { ascending: false });
  else if (sort === 'newest') query = query.order('created_at', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

/**
 * POST /api/products
 * Admin‑only endpoint to create a new product.
 * Expected payload: { name, price, description, category, image_url, stock }
 */
export async function POST(request) {
  const payload = await request.json();
  if (!isSupabaseConfigured()) {
    // Mock mode – simply echo back with a generated id
    const mockProduct = {
      ...payload,
      id: `mock-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    return NextResponse.json(mockProduct, { status: 201 });
  }

  const { data, error } = await supabase.from('products').insert([payload]).select().single();
  if (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
