'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, ShoppingBag, Phone, MapPin } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNo') || 'NZ-XXXXXX';
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const cachedOrder = sessionStorage.getItem('last_order');
    if (cachedOrder) {
      try {
        const parsed = JSON.parse(cachedOrder);
        if (parsed.orderNumber === orderNumber) {
          setOrder(parsed);
        }
      } catch (e) {
        console.error('Failed to parse cached order details', e);
      }
    }
  }, [orderNumber]);

  return (
    <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto border border-gray-200 p-8 sm:p-12 text-center space-y-8 shadow-sm">
        
        {/* Success Icon */}
        <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} />
        </div>

        {/* Messaging */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">Order Confirmed</p>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">Thank You For Your Order!</h1>
          <p className="text-sm font-bold text-black pt-1">Order #{orderNumber}</p>
          <p className="text-xs text-gray-500 max-w-md mx-auto pt-1 leading-relaxed">
            Your order has been received and is being prepared for dispatch. Our courier partner will contact you on your provided phone number before delivery.
          </p>
        </div>

        {/* JazzCash/EasyPaisa Instructions */}
        {order?.paymentMethod === 'EasyPaisa/JazzCash' && (
          <div className="bg-gray-50 border border-gray-300 p-4 text-left space-y-2 text-xs">
            <h3 className="font-bold text-black uppercase tracking-wider">Payment Instructions</h3>
            <p className="text-gray-600 leading-relaxed">
              Please transfer <strong className="text-black">PKR {Number(order.totalAmount).toLocaleString()}</strong> to JazzCash / EasyPaisa account <strong>0300-4123432 (Title: New Mughal Collections)</strong>. Please share your transfer screenshot on WhatsApp to confirm immediate dispatch.
            </p>
          </div>
        )}

        {/* Delivery Details */}
        {order && (
          <div className="border-t border-b border-gray-200 py-6 text-left space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-black">Delivery Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-700">
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-black shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 block text-[11px] uppercase font-bold">Delivery Address</span>
                  <span className="font-medium text-black">{order.fullName}, {order.address}, {order.city}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone size={15} className="text-black shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 block text-[11px] uppercase font-bold">Contact Number</span>
                  <span className="font-medium text-black">{order.phone}</span>
                </div>
              </div>
            </div>

            {/* Items Summary list */}
            {order.items && order.items.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 p-4 space-y-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Items In Order</span>
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <span className="text-black truncate pr-4">
                      {item.name} ({item.size}) <span className="text-gray-500 font-bold">×{item.quantity}</span>
                    </span>
                    <span className="font-bold text-black whitespace-nowrap">
                      PKR {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-xs font-black text-black">
                  <span>Total Due ({order.paymentMethod})</span>
                  <span>PKR {Number(order.totalAmount).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Link
            href="/products"
            className="px-8 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors inline-flex items-center justify-center gap-2"
          >
            Continue Shopping <ArrowRight size={13} />
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3.5 border border-black text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
          >
            View My Orders
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading order confirmation...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}