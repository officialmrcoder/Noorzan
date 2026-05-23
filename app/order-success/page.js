'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, ShoppingBag, Mail, Phone, MapPin } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNo') || 'BH-XXXXXX';
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Read cached order details from checkout session storage
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
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-20">
      <div className="bg-white border border-gray-150 rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-8 animate-fade-in">
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-sm animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Messaging */}
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order Placed Successfully!</h1>
          <p className="text-indigo-650 font-bold text-lg">Order #{orderNumber}</p>
          <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
            Your order has been placed successfully! Order <strong className="text-slate-800">#{orderNumber}</strong> will be processed soon. An email confirmation has been sent to your registered address.
          </p>
        </div>

        {/* EasyPaisa/JazzCash Instructions */}
        {order?.paymentMethod === 'EasyPaisa/JazzCash' && (
          <div className="bg-indigo-50 border border-indigo-150 rounded-2xl p-5 text-left space-y-2">
            <h3 className="font-bold text-indigo-900 text-sm">Action Required: Confirm Payment</h3>
            <p className="text-xs text-indigo-750 leading-relaxed">
              Please transfer the total amount of <strong>${Number(order.totalAmount).toFixed(2)}</strong> manually to EasyPaisa/JazzCash Account <strong>0300-1234567</strong>. Take a screenshot and send it via WhatsApp with your order number <strong>#{orderNumber}</strong> to complete verification.
            </p>
          </div>
        )}

        {/* Order Details Details Panel */}
        {order && (
          <div className="border-t border-b border-gray-100 py-6 text-left space-y-4">
            <h3 className="font-bold text-slate-850 text-base">Delivery Summary</h3>
            
            {/* Delivery address row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                  <span className="text-gray-400 block font-medium">Shipping Address</span>
                  <span>{order.fullName}, {order.address}, {order.city}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                  <span className="text-gray-400 block font-medium">Contact Phone</span>
                  <span>{order.phone}</span>
                </div>
              </div>
            </div>

            {/* Items Summary list */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2.5">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Items Purchased</span>
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-800 line-clamp-1">
                    {item.name} ({item.size}) <span className="text-gray-400 text-[10px] font-bold">x{item.quantity}</span>
                  </span>
                  <span className="text-slate-900 font-extrabold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-slate-150 pt-2.5 flex justify-between items-center text-sm font-extrabold">
                <span className="text-slate-700">Total Paid ({order.paymentMethod})</span>
                <span className="text-indigo-600">${Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions CTA */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-1.5 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-md"
          >
            <ShoppingBag className="w-4 h-4" /> Continue Shopping
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-1.5 px-6 py-3.5 border border-gray-200 text-slate-700 font-bold hover:bg-slate-50 rounded-2xl transition-all"
          >
            View Order History <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}

function OrderSuccessPageFallback() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-20">
      <div className="bg-white border border-gray-150 rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-8 animate-fade-in">
        <div className="w-20 h-20 bg-slate-100 rounded-full animate-pulse mx-auto"></div>
        <div className="space-y-3">
          <div className="h-8 bg-slate-100 rounded w-2/3 mx-auto"></div>
          <div className="h-5 bg-slate-100 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<OrderSuccessPageFallback />}>
      <OrderSuccessContent />
    </Suspense>
  );
}
