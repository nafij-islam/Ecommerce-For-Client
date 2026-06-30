'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, ChevronRight, MapPin, CreditCard, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartSubtotal, cartDiscount, cartTotal, shippingFee, clearCart, coupon } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [submitting, setSubmitting] = useState(false);

  // Require registration/login to checkout
  useEffect(() => {
    if (!authLoading && !user) {
      showToast('You must be logged in to place an order.', 'warning');
      router.push('/login?redirect=/checkout');
    }
  }, [user, authLoading, router, showToast]);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Bangladesh');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [notes, setNotes] = useState('');

  // If user is logged in, auto populate fields
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      
      // Auto fill default address if exists
      const defaultAddr = user.addresses?.find((a: any) => a.isDefault);
      const firstAddr = user.addresses?.[0];
      const selectedAddr = defaultAddr || firstAddr;

      if (selectedAddr) {
        setName(selectedAddr.name);
        setPhone(selectedAddr.phone);
        setStreet(selectedAddr.street);
        setCity(selectedAddr.city);
        setState(selectedAddr.state);
        setPostalCode(selectedAddr.postalCode);
        setCountry(selectedAddr.country || 'Bangladesh');
      }
    }
  }, [user]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Your cart is empty', 'warning');
      return;
    }

    if (!name || !email || !phone || !street || !city || !state || !postalCode) {
      showToast('Please fill in all shipping details', 'warning');
      return;
    }

    try {
      setSubmitting(true);

      const orderPayload = {
        customer: { name, email, phone },
        items: cart.map((c) => ({
          productId: c.productId,
          name: c.name,
          thumbnail: c.thumbnail,
          quantity: c.quantity,
          price: c.price,
          salePrice: c.salePrice,
          variant: c.selectedVariant
            ? {
                size: c.selectedVariant.size,
                colorName: c.selectedVariant.colorName,
                colorHex: c.selectedVariant.colorHex,
                sku: c.selectedVariant.sku
              }
            : undefined
        })),
        subtotal: cartSubtotal,
        discount: cartDiscount,
        shippingFee: shippingFee,
        total: cartTotal,
        couponCode: coupon ? coupon.code : undefined,
        paymentMethod,
        shippingAddress: { street, city, state, postalCode, country },
        notes
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast('Order placed successfully!', 'success');
        clearCart();
        router.push(`/order-success?orderId=${data.orderId}`);
      } else {
        showToast(data.error || 'Failed to place order', 'error');
      }
    } catch {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
          <h2 className="font-playfair text-2xl font-bold text-brand-navy">Your cart is empty.</h2>
          <Link href="/shop" className="text-brand-coral font-semibold hover:underline">
            Go to Shop
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Checkout Header */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-8 font-light">
          <Link href="/cart" className="hover:text-brand-coral">Cart</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-brand-navy font-semibold">Checkout Information</span>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Billing / Shipping Details Form */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Customer Info Card */}
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-gray-100 space-y-5 shadow-xs">
              <h3 className="font-playfair text-xl font-bold text-brand-navy flex items-center gap-2 border-b pb-3">
                <Sparkles className="w-5 h-5 text-brand-coral" />
                <span>Customer Contact Information</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-gray-50/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-gray-50/50"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+880"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-gray-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address Card */}
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-gray-100 space-y-5 shadow-xs">
              <h3 className="font-playfair text-xl font-bold text-brand-navy flex items-center gap-2 border-b pb-3">
                <MapPin className="w-5 h-5 text-brand-coral" />
                <span>Shipping Address Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Street / Village Address</label>
                  <input
                    type="text"
                    required
                    placeholder="House no, Street address, Landmark, etc."
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-gray-50/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-gray-50/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">State / Region</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-gray-50/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Postal / Zip Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-gray-50/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-gray-50/50"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Order Notes (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Instructions for courier deliveries, preferred drop-off timings, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-gray-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-gray-100 space-y-4 shadow-xs">
              <h3 className="font-playfair text-xl font-bold text-brand-navy flex items-center gap-2 border-b pb-3">
                <CreditCard className="w-5 h-5 text-brand-coral" />
                <span>Payment Method</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'Cash on Delivery' ? 'border-brand-coral bg-brand-pink/20' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="Cash on Delivery"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={() => setPaymentMethod('Cash on Delivery')}
                    className="accent-brand-coral"
                  />
                  <div className="text-left">
                    <p className="text-sm font-bold text-brand-navy">Cash on Delivery</p>
                    <p className="text-xs text-gray-400">Pay when order is delivered</p>
                  </div>
                </label>

                <label className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer opacity-70 transition-all ${
                  paymentMethod === 'Online Payment' ? 'border-brand-coral bg-brand-pink/20' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="Online Payment"
                    checked={paymentMethod === 'Online Payment'}
                    onChange={() => {
                      showToast('Online payment integration ready (bKash/Nagad/SSLCommerz). Setting up COD as fallback.', 'info');
                      setPaymentMethod('Online Payment');
                    }}
                    className="accent-brand-coral"
                  />
                  <div className="text-left">
                    <p className="text-sm font-bold text-brand-navy">Online Payment (Mock)</p>
                    <p className="text-xs text-gray-400">bKash, Nagad, Stripe, Card</p>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Cart Pricing Summary Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 space-y-6 shadow-xs">
              <h3 className="font-semibold text-brand-navy text-sm uppercase tracking-wider pb-3 border-b border-gray-100 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-brand-coral" />
                <span>Your Order Items</span>
              </h3>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 pr-2">
                {cart.map((c) => {
                  const itemPrice = c.salePrice > 0 ? c.salePrice : c.price;
                  const adj = c.selectedVariant?.priceAdjustment || 0;
                  return (
                    <div key={c.selectedVariant?.sku || c.productId} className="py-3 flex gap-3 items-center">
                      <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-brand-pink/30 flex-shrink-0">
                        <img src={c.thumbnail} alt={c.name} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-brand-navy truncate">{c.name}</p>
                        <p className="text-xs text-gray-400">
                          Qty: {c.quantity} {c.selectedVariant && `| Size: ${c.selectedVariant.size}`}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-brand-navy">
                        ৳{(itemPrice + adj) * c.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Prices breakdown */}
              <div className="space-y-3.5 text-sm text-gray-500 font-light border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-brand-navy">৳{cartSubtotal}</span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-brand-coral font-medium">
                    <span>Discount</span>
                    <span>-৳{cartDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-semibold text-brand-navy">
                    {shippingFee === 0 ? 'FREE' : `৳${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-brand-navy pt-4 border-t border-gray-100">
                  <span>Total Payable</span>
                  <span className="text-lg text-brand-coral font-extrabold">৳{cartTotal}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-coral hover:bg-brand-coral-hover text-white font-semibold py-4 rounded-full shadow-md transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:hover:scale-100"
              >
                <span>{submitting ? 'Placing Order...' : 'Confirm Order & Place'}</span>
              </button>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
