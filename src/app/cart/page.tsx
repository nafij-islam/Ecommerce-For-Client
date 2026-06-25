'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Trash2, ArrowRight, Tag, X, Plus, Minus } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCouponCode,
    removeCouponCode,
    coupon,
    cartSubtotal,
    cartDiscount,
    cartTotal,
    shippingFee
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [validating, setValidating] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidating(true);
    await applyCouponCode(couponCode);
    setValidating(false);
    setCouponCode('');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-center space-y-6">
          <div className="bg-brand-pink/50 p-6 rounded-full text-brand-coral">
            <ShoppingBag className="w-16 h-16" />
          </div>
          <h1 className="font-playfair text-3xl font-bold text-brand-navy">Your Cart is Empty</h1>
          <p className="text-gray-500 font-light max-w-xs leading-relaxed">
            Fill your closet with our premium designs. Explore our new arrivals and collections.
          </p>
          <Link
            href="/shop"
            className="bg-brand-coral hover:bg-brand-coral-hover text-white px-8 py-3.5 rounded-full font-semibold shadow-md transition-all duration-300 hover:scale-105"
          >
            Start Shopping
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
        <h1 className="font-playfair text-3xl font-bold text-brand-navy mb-8">Your Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
              <div className="divide-y divide-gray-100">
                {cart.map((item) => {
                  const itemPrice = item.salePrice > 0 ? item.salePrice : item.price;
                  const adj = item.selectedVariant?.priceAdjustment || 0;
                  const finalUnitPrice = itemPrice + adj;
                  const itemTotal = finalUnitPrice * item.quantity;

                  return (
                    <div key={item.selectedVariant?.sku || item.productId} className="p-6 flex gap-4 sm:gap-6 items-center">
                      {/* Image */}
                      <Link
                        href={`/product/${item.slug}`}
                        className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden bg-brand-pink/20 flex-shrink-0 border border-gray-50"
                      >
                        <Image src={item.thumbnail} alt={item.name} fill className="object-cover" />
                      </Link>

                      {/* Info & Quantity */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <Link href={`/product/${item.slug}`}>
                          <h3 className="font-playfair text-base sm:text-lg font-bold text-brand-navy hover:text-brand-coral transition-colors truncate">
                            {item.name}
                          </h3>
                        </Link>
                        {item.selectedVariant && (
                          <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-500">
                            <span className="bg-gray-100 px-2 py-0.5 rounded-md">Size: {item.selectedVariant.size}</span>
                            <span className="bg-gray-100 px-2 py-0.5 rounded-md">Color: {item.selectedVariant.colorName}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-brand-navy">৳{finalUnitPrice}</span>
                          {item.salePrice > 0 && (
                            <span className="text-xs text-gray-400 line-through">৳{item.price + adj}</span>
                          )}
                        </div>

                        {/* Quantity adjustor */}
                        <div className="flex items-center border border-gray-200 rounded-xl px-2 py-0.5 bg-white w-fit">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedVariant?.sku)}
                            className="p-1 text-gray-400 hover:text-brand-coral"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 font-semibold text-xs text-brand-navy w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedVariant?.sku)}
                            className="p-1 text-gray-400 hover:text-brand-coral"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Item Total and Delete */}
                      <div className="text-right space-y-4 flex-shrink-0">
                        <p className="text-sm font-bold text-brand-navy">৳{itemTotal}</p>
                        <button
                          onClick={() => removeFromCart(item.productId, item.selectedVariant?.sku)}
                          className="text-gray-400 hover:text-rose-500 p-2 rounded-full hover:bg-rose-50 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Clear Cart panel */}
              <div className="bg-gray-50/50 p-4 flex justify-between items-center border-t border-gray-100">
                <Link
                  href="/shop"
                  className="text-sm font-semibold text-brand-coral hover:underline"
                >
                  Continue Shopping
                </Link>
                <button
                  onClick={clearCart}
                  className="text-xs text-gray-400 hover:text-rose-500 font-bold uppercase tracking-wider"
                >
                  Clear Entire Cart
                </button>
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="space-y-6">
            {/* Coupon Promo Card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-4 shadow-xs">
              <h3 className="font-semibold text-brand-navy text-sm uppercase tracking-wider">Discount Coupon</h3>
              
              {coupon ? (
                <div className="bg-brand-pink/50 p-4 rounded-2xl flex items-center justify-between border border-brand-coral/15">
                  <div className="flex items-center gap-2 text-brand-coral">
                    <Tag className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">{coupon.code} Applied</span>
                  </div>
                  <button onClick={removeCouponCode} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. SAVE10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-gray-50/50"
                  />
                  <button
                    type="submit"
                    disabled={validating || !couponCode.trim()}
                    className="bg-brand-navy hover:bg-brand-coral text-white px-5 py-2 rounded-xl text-xs font-semibold disabled:bg-gray-300"
                  >
                    {validating ? 'Applying...' : 'Apply'}
                  </button>
                </form>
              )}
            </div>

            {/* Total Pricing Card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-6 shadow-xs">
              <h3 className="font-semibold text-brand-navy text-sm uppercase tracking-wider pb-3 border-b border-gray-100">
                Order Summary
              </h3>

              <div className="space-y-3.5 text-sm text-gray-500 font-light">
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
                <div className="flex justify-between text-xs text-gray-400 pt-1">
                  <span>Free delivery on orders over ৳3000</span>
                </div>
                <div className="flex justify-between text-base font-bold text-brand-navy pt-4 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-lg">৳{cartTotal}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-brand-coral hover:bg-brand-coral-hover text-white font-semibold py-4 rounded-full shadow-md transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
