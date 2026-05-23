import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/orders - list all orders (admin only, but no auth check for simplicity)
export async function GET(request) {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST /api/orders - create a new order (called from checkout)
export async function POST(request) {
  try {
    const payload = await request.json();
    // Expected payload: { user_id, order_number, total_amount, status, shipping_address, city, phone, payment_method, items }
    const { data, error } = await supabase.from('orders').insert([payload]).select();
    if (error) throw error;
    // Insert order items if provided
    if (Array.isArray(payload.items) && payload.items.length) {
      const orderId = data[0].id;
      const itemsToInsert = payload.items.map(item => ({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        name: item.name
      }));
      const { error: itemsErr } = await supabase.from('order_items').insert(itemsToInsert);
      if (itemsErr) console.error('Failed to insert order items:', itemsErr);
    }
    return NextResponse.json(data[0], { status: 201 });
  } catch (err) {
    console.error('Error creating order:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
