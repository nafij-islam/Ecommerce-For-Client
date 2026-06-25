'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Calendar, ClipboardList, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    try {
      setLoading(true);
      setError('');
      setOrder(null);

      const res = await fetch(`/api/track-order?orderNumber=${encodeURIComponent(orderNumber.trim())}`);
      const data = await res.json();

      if (res.ok && data.order) {
        setOrder(data.order);
      } else {
        setError(data.error || 'No order found with this order number.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Status mapping
  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const getStatusIndex = (currentStatus: string) => {
    return statuses.indexOf(currentStatus.toLowerCase());
  };

  const statusLabels: Record<string, string> = {
    pending: 'Order Placed',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'On Transit / Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    returned: 'Returned'
  };

  const currentStatusIndex = order ? getStatusIndex(order.orderStatus) : -1;
  const isCancelled = order && ['cancelled', 'returned'].includes(order.orderStatus.toLowerCase());

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
        
        {/* Search Header */}
        <div className="text-center max-w-xl mx-auto space-y-4">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-brand-navy">Track Your Order</h1>
          <p className="text-gray-500 font-light text-sm sm:text-base">
            Check the shipping status of your garments. Enter your order number below.
          </p>

          <form onSubmit={handleTrack} className="flex gap-2 max-w-md mx-auto pt-2">
            <div className="relative flex-1">
              <input
                type="text"
                required
                placeholder="Enter Order Number (e.g. AG-123456)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-white"
              />
              <Search className="absolute right-3.5 top-3.5 text-gray-400 w-4 h-4" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-coral hover:bg-brand-coral-hover text-white px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300"
            >
              {loading ? 'Tracking...' : 'Track'}
            </button>
          </form>

          {error && (
            <p className="text-sm font-semibold text-rose-500 animate-fade-in">{error}</p>
          )}
        </div>

        {/* Tracking Details display */}
        {order && (
          <div className="bg-white rounded-[32px] border border-gray-100 p-6 sm:p-8 space-y-8 shadow-sm animate-fade-in">
            
            {/* Metadata Summary */}
            <div className="flex flex-wrap justify-between items-center pb-4 border-b border-gray-100 gap-4">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Order Code</p>
                <h3 className="font-mono text-base font-bold text-brand-navy">{order.orderNumber}</h3>
              </div>
              <div className="flex gap-4 text-xs font-light text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-coral" />
                  <span>Placed: {new Date(order.createdAt).toLocaleDateString()}</span>
                </span>
                {order.trackingCode && (
                  <span className="flex items-center gap-1.5 bg-brand-pink px-2.5 py-1 rounded-md text-brand-coral font-semibold">
                    Tracking: {order.trackingCode}
                  </span>
                )}
              </div>
            </div>

            {/* Stepper Status Progress */}
            {isCancelled ? (
              <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl text-center space-y-1">
                <h4 className="font-semibold text-rose-800 text-lg uppercase tracking-wider">
                  Order {statusLabels[order.orderStatus.toLowerCase()]}
                </h4>
                <p className="text-xs text-rose-600 font-light">
                  This order was marked as {order.orderStatus.toLowerCase()}. Please contact customer support for details.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <h4 className="font-semibold text-brand-navy text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-brand-coral" />
                  <span>Delivery Status</span>
                </h4>

                {/* Steps line */}
                <div className="relative flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-2">
                  {/* Connecting Line (Desktop) */}
                  <div className="absolute left-8 right-8 top-5 h-0.5 bg-gray-100 hidden sm:block -z-0">
                    <div
                      className="h-full bg-brand-coral transition-all duration-500"
                      style={{ width: `${(Math.max(0, currentStatusIndex) / (statuses.length - 1)) * 100}%` }}
                    />
                  </div>

                  {statuses.map((status, index) => {
                    const isActive = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;

                    return (
                      <div key={status} className="flex sm:flex-col items-center gap-3 sm:gap-2 z-10 w-full sm:w-auto text-left sm:text-center">
                        {/* Circle badge */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            isActive
                              ? 'bg-brand-coral border-brand-coral text-white shadow-xs'
                              : 'bg-white border-gray-200 text-gray-300'
                          } ${isCurrent ? 'ring-4 ring-brand-pink' : ''}`}
                        >
                          {isActive ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-bold">{index + 1}</span>
                          )}
                        </div>

                        {/* Label */}
                        <div className="sm:mt-1">
                          <p
                            className={`text-sm font-semibold ${
                              isActive ? 'text-brand-navy' : 'text-gray-400'
                            }`}
                          >
                            {statusLabels[status]}
                          </p>
                          {isCurrent && (
                            <span className="text-[10px] text-brand-coral font-bold uppercase tracking-wider">
                              Current Phase
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Delivery address details */}
            <div className="flex gap-3 bg-gray-50/50 p-6 rounded-3xl border border-gray-100 text-sm">
              <MapPin className="w-5 h-5 text-brand-coral flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-brand-navy">Shipping Destination</p>
                <p className="text-gray-600 font-light">
                  {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                </p>
                <p className="text-gray-400 text-xs font-light">Country: {order.shippingAddress.country}</p>
              </div>
            </div>

            {/* Ordered items overview */}
            <div className="space-y-3">
              <h4 className="font-semibold text-brand-navy text-sm uppercase tracking-wider">
                Parcel Details
              </h4>
              <div className="divide-y divide-gray-100 border rounded-2xl overflow-hidden bg-white">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 flex justify-between items-center gap-4 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-12 bg-brand-pink/30 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.thumbnail} alt={item.name} className="object-cover w-full h-full" />
                      </div>
                      <div>
                        <p className="font-medium text-brand-navy">{item.name}</p>
                        {item.variant && (
                          <p className="text-xs text-gray-400">
                            Size: {item.variant.size} | Color: {item.variant.colorName}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-500 font-light flex-shrink-0">
                      Qty: {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
