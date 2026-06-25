'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';

export default function WishlistPage() {
  const { wishlist } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wishlist.length === 0) {
      setProducts([]);
      return;
    }

    const fetchWishlistProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products?ids=${wishlist.join(',')}&limit=100`);
        const data = await res.json();
        if (res.ok) {
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('Error loading wishlist items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlist]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <h1 className="font-playfair text-3xl font-bold text-brand-navy mb-8">My Wishlist</h1>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-gray-150 rounded-3xl"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 space-y-6 max-w-md mx-auto">
            <div className="bg-brand-pink/50 p-6 rounded-full text-brand-coral w-fit mx-auto">
              <Heart className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="font-playfair text-xl font-bold text-brand-navy">Your Wishlist is Empty</h3>
              <p className="text-gray-500 font-light text-sm">
                Mark products as favorites to save them here for later.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-block bg-brand-coral hover:bg-brand-coral-hover text-white px-8 py-3 rounded-full font-semibold shadow-xs"
            >
              Discover Dresses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
