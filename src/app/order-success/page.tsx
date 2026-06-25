'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ShoppingBag, Truck, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.order) {
          setOrder(data.order);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-10 h-10 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 font-light text-sm">Processing order receipt...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full text-center space-y-8">
        
        {/* Celebration Header */}
        <div className="space-y-4">
          <div className="bg-emerald-50 text-emerald-500 p-5 rounded-full w-fit mx-auto shadow-sm border border-emerald-100">
            <CheckCircle2 className="w-16 h-16 animate-bounce" />
          </div>
          <h1 className="font-playfair text-3xl sm:text-4xl font-extrabold text-brand-navy">
            Thank You for Your Purchase!
          </h1>
          <p className="text-gray-600 font-light max-w-md mx-auto text-sm sm:text-base">
            Your dress order has been successfully placed. We have sent a confirmation email containing delivery details.
          </p>
        </div>

        {/* Order Details receipt card */}
        {order ? (
          <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-gray-100 shadow-sm text-left space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 flex-wrap gap-2">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Order Number</p>
                <h3 className="font-mono text-base font-bold text-brand-navy">{order.orderNumber}</h3>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Date</p>
                <p className="text-sm font-semibold text-brand-navy">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-brand-coral flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-brand-navy">Delivery Address</p>
                <p className="text-gray-500 font-light">
                  {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                </p>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="bg-brand-pink/30 p-4 sm:p-6 rounded-2xl space-y-3 text-sm border border-brand-coral/10">
              <div className="flex justify-between text-gray-500 font-light">
                <span>Subtotal ({order.items.length} items)</span>
                <span>৳{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-brand-coral font-medium">
                  <span>Coupon Discount</span>
                  <span>-৳{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500 font-light">
                <span>Delivery Charge</span>
                <span>৳{order.shippingFee}</span>
              </div>
              <div className="flex justify-between font-bold text-brand-navy pt-3 border-t border-brand-coral/15 text-base">
                <span>Total Amount Paid (COD)</span>
                <span className="text-brand-coral text-lg font-extrabold">৳{order.total}</span>
              </div>
            </div>

            {/* Tracking help */}
            <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl text-xs text-gray-500 font-light">
              <Truck className="w-5 h-5 text-brand-navy flex-shrink-0" />
              <p>
                You can track the progress of your dispatch using your Order Number{' '}
                <span className="font-semibold text-brand-navy">{order.orderNumber}</span> on our Order Tracking page.
              </p>
            </div>

          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl border text-center text-gray-400 text-sm">
            Order info could not be retrieved. Please write down your order code if visible.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/track-order"
            className="bg-brand-navy hover:bg-brand-coral text-white px-8 py-3.5 rounded-full font-semibold shadow-xs transition-all duration-300"
          >
            Track My Order
          </Link>
          <Link
            href="/shop"
            className="bg-white hover:bg-brand-pink border border-gray-200 text-brand-navy px-8 py-3.5 rounded-full font-semibold transition-all duration-300"
          >
            Continue Shopping
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Success Receipt...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
