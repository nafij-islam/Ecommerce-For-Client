'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, RefreshCw, ShieldCheck, Star } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [saleProducts, setSaleProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Categories
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        if (catRes.ok) setCategories(catData.categories || []);

        // Fetch Banners
        const bannerRes = await fetch('/api/banners');
        const bannerData = await bannerRes.json();
        if (bannerRes.ok) setBanners(bannerData.banners || []);

        // Fetch New Arrivals
        const newRes = await fetch('/api/products?isNewArrival=true&limit=4');
        const newData = await newRes.json();
        if (newRes.ok) setNewArrivals(newData.products || []);

        // Fetch Best Sellers
        const bestRes = await fetch('/api/products?isBestSeller=true&limit=4');
        const bestData = await bestRes.json();
        if (bestRes.ok) setBestSellers(bestData.products || []);

        // Fetch Sale Products
        const saleRes = await fetch('/api/products?isOnSale=true&limit=4');
        const saleData = await saleRes.json();
        if (saleRes.ok) setSaleProducts(saleData.products || []);

      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setNewsletterMsg(data.message);
        setEmail('');
      } else {
        setNewsletterMsg(data.error || 'Failed to subscribe');
      }
    } catch {
      setNewsletterMsg('Something went wrong. Please try again.');
    }
  };

  // Banners setup
  const heroBanners = banners.filter((b) => b.placement === 'hero');
  const defaultHeroBanners = [
    {
      title: 'Summer Dream Collection',
      subtitle: 'Step into elegant feminine styles with soft pastels & florals.',
      imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop',
      ctaText: 'Explore Shop',
      ctaLink: '/shop'
    },
    {
      title: 'Luxe Linen & Botanical Outfits',
      subtitle: 'Premium organic flax linen designed to keep you effortlessly cool.',
      imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1000&auto=format&fit=crop&q=80',
      ctaText: 'Shop New Arrivals',
      ctaLink: '/shop?isNewArrival=true'
    }
  ];
  
  const activeHeroBanners = heroBanners.length > 0 ? heroBanners : defaultHeroBanners;

  // Auto-sliding interval for hero banners
  useEffect(() => {
    if (activeHeroBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % activeHeroBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeHeroBanners.length]);

  const salesBanner = banners.find((b) => b.placement === 'sale') || {
    title: 'Mid Season Fashion Sale',
    subtitle: 'Enjoy up to 50% discount on all premium outfits & accessories.',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop',
    ctaText: 'Shop Sale Now',
    ctaLink: '/shop?isOnSale=true'
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20 bg-[#fcfbf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#fdf6f0] via-[#fbf1e9] to-[#f5e1d3] rounded-[48px] overflow-hidden shadow-xl border border-brand-pink/30 relative h-[650px] sm:h-[550px] lg:h-[500px] group">
            
            {activeHeroBanners.map((slide, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-1 lg:grid-cols-12 h-full w-full items-center absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  idx === currentHeroIndex 
                    ? 'opacity-100 z-10 pointer-events-auto' 
                    : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Left Column (Content) */}
                <div className="lg:col-span-7 p-10 sm:p-16 space-y-8 flex flex-col justify-center">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 bg-[#ff8a80]/15 text-[#ff8a80] text-xs uppercase font-bold tracking-widest px-4.5 py-2 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-[#ff8a80] animate-pulse"></span>
                      <span>Exclusive Season Arrival</span>
                    </div>
                    <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0e1629] leading-tight">
                      {slide.title}
                    </h1>
                  </div>
                  
                  <p className="text-gray-700 font-light text-base sm:text-lg leading-relaxed max-w-xl">
                    {slide.subtitle}
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    <Link
                      href={slide.ctaLink || '/shop'}
                      className="inline-flex items-center justify-center bg-[#ff8a80] hover:bg-[#ff7a70] text-white px-8 py-4 rounded-full font-bold shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <span>{slide.ctaText || 'Shop Now'}</span>
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                    <Link
                      href="/shop?isNewArrival=true"
                      className="inline-flex items-center justify-center bg-white border border-brand-pink/30 hover:bg-gray-50 text-brand-navy px-8 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105"
                    >
                      View Collection
                    </Link>
                  </div>
                </div>

                {/* Right Column (Image) */}
                <div className="lg:col-span-5 h-80 lg:h-full w-full relative overflow-hidden">
                  <Image
                    src={slide.imageUrl}
                    alt="Model Dress"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority={idx === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#f5e1d3]/20 to-transparent mix-blend-multiply"></div>
                </div>
              </div>
            ))}

            {/* Slider Dots */}
            {activeHeroBanners.length > 1 && (
              <div className="absolute bottom-6 left-10 sm:left-16 z-20 flex gap-2">
                {activeHeroBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentHeroIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      idx === currentHeroIndex ? 'bg-[#ff8a80] w-6' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-brand-coral text-xs font-semibold uppercase tracking-wider">Beautiful Silhouettes</span>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-brand-navy mt-2">Shop by Category</h2>
            <div className="h-1 w-12 bg-brand-coral mx-auto mt-4 rounded-full"></div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center text-gray-500 font-light">No categories created yet.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.slice(0, 4).map((cat) => (
                <Link
                  key={cat._id}
                  href={`/shop?category=${cat.slug}`}
                  className="group relative aspect-square rounded-[32px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-brand-pink/30"
                >
                  <Image
                    src={cat.image || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=300'}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-transparent to-transparent flex flex-col justify-end p-6">
                    <h3 className="font-playfair text-lg sm:text-xl font-bold text-white group-hover:text-brand-coral transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-white/70 mt-1 font-light flex items-center gap-1">
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-16 md:py-24 bg-brand-pink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
            <div>
              <span className="text-brand-coral text-xs font-semibold uppercase tracking-wider">Fresh Styles</span>
              <h2 className="font-playfair text-3xl font-bold text-brand-navy mt-1">New Arrivals</h2>
            </div>
            <Link href="/shop?isNewArrival=true" className="text-brand-coral hover:text-brand-coral-hover font-semibold text-sm flex items-center gap-1.5 transition-colors">
              <span>View All New</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-gray-200 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : newArrivals.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-light bg-white rounded-3xl border border-gray-100">
              No new arrivals yet. Stay tuned!
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {newArrivals.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sales Promotional Banner */}
      <section className="my-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#fdf6f0] via-[#fbf1e9] to-[#f5e1d3] rounded-[48px] overflow-hidden shadow-xl border border-brand-pink/30 grid grid-cols-1 lg:grid-cols-12 min-h-[460px] items-center relative group">
          
          {/* Left Column (Content) */}
          <div className="lg:col-span-7 p-10 sm:p-16 space-y-8 flex flex-col justify-center z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-[#ff8a80]/15 text-[#ff8a80] text-xs uppercase font-bold tracking-widest px-4.5 py-2 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#ff8a80] animate-pulse"></span>
                <span>Season Sale Banner</span>
              </div>
              <h2 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0e1629] leading-tight">
                {salesBanner.title}
              </h2>
            </div>
            
            <p className="text-gray-700 font-light text-base sm:text-lg leading-relaxed max-w-xl">
              {salesBanner.subtitle}
            </p>
            
            <div>
              <Link
                href={salesBanner.ctaLink || '/shop?isOnSale=true'}
                className="inline-flex items-center justify-center bg-[#ff8a80] hover:bg-[#ff7a70] text-white px-10 py-4.5 rounded-full font-bold shadow-lg transition-all duration-300 hover:scale-105"
              >
                <span>{salesBanner.ctaText || 'Discover Sale'}</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right Column (Image with custom curved cutoff) */}
          <div className="lg:col-span-5 h-80 lg:h-full w-full relative min-h-[350px] lg:min-h-[460px] overflow-hidden">
            <Image
              src={salesBanner.imageUrl}
              alt="Promotion Dress"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Soft decorative overlays */}
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#f5e1d3]/20 to-transparent mix-blend-multiply"></div>
          </div>

        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
            <div>
              <span className="text-brand-coral text-xs font-semibold uppercase tracking-wider">Top Rated Choices</span>
              <h2 className="font-playfair text-3xl font-bold text-brand-navy mt-1">Best Sellers</h2>
            </div>
            <Link href="/shop?isBestSeller=true" className="text-brand-coral hover:text-brand-coral-hover font-semibold text-sm flex items-center gap-1.5 transition-colors">
              <span>Explore Best Sellers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-gray-200 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : bestSellers.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-light bg-brand-pink/10 rounded-3xl">
              Products will appear here once orders stack up!
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {bestSellers.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Shop With Us Section */}
      <section className="py-20 bg-[#fcfbf9] border-y border-brand-pink/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="bg-[#fffefe] border border-brand-pink/30 p-8 rounded-[32px] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex items-start gap-6 group">
              <div className="bg-brand-pink/30 text-[#ff8a80] p-4 rounded-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-xs">
                <Truck className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-playfair text-xl font-bold text-brand-navy">Fast Delivery</h3>
                <p className="text-sm text-gray-600 font-light leading-relaxed">
                  Free delivery on orders over ৳3000 nationwide with careful premium packaging.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#fffefe] border border-brand-pink/30 p-8 rounded-[32px] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex items-start gap-6 group">
              <div className="bg-brand-pink/30 text-[#ff8a80] p-4 rounded-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-xs">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-playfair text-xl font-bold text-brand-navy">Easy Returns</h3>
                <p className="text-sm text-gray-600 font-light leading-relaxed">
                  Not the perfect fit? Return within 7 days for exchange or refund, no questions asked.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#fffefe] border border-brand-pink/30 p-8 rounded-[32px] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex items-start gap-6 group">
              <div className="bg-brand-pink/30 text-[#ff8a80] p-4 rounded-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-playfair text-xl font-bold text-brand-navy">Secure Payment</h3>
                <p className="text-sm text-gray-600 font-light leading-relaxed">
                  Multiple secure payment gateways ready or Cash on Delivery for absolute peace of mind.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-brand-coral text-xs font-semibold uppercase tracking-wider">Loving Feedback</span>
            <h2 className="font-playfair text-3xl font-bold text-brand-navy mt-1">What Our Customers Say</h2>
            <div className="h-1 w-12 bg-brand-coral mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Nusrat Jahan', review: 'Absolutely love the peach linen dress! The color is stunning and the S size fits me like a glove. Highly recommend!', role: 'Verified buyer' },
              { name: 'Sadia Islam', review: 'Beautiful packaging and super fast shipping to Chittagong. The fabric quality is very premium. Will definitely buy again.', role: 'Verified buyer' },
              { name: 'Tasmia Karim', review: 'The variant colors look exactly like the pictures. Soft coral highlights are to die for. Customer service was very supportive.', role: 'Verified buyer' }
            ].map((rev, i) => (
              <div key={i} className="bg-background p-8 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, starIdx) => (
                    <Star key={starIdx} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed font-light italic">
                  &ldquo;{rev.review}&rdquo;
                </p>
                <div className="pt-2">
                  <h4 className="font-semibold text-brand-navy text-sm">{rev.name}</h4>
                  <span className="text-xs text-brand-coral">{rev.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 md:py-20 bg-brand-pink/50 border-t border-brand-pink/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-brand-navy">Join the Antigravity Fashion Club</h2>
          <p className="text-gray-600 font-light text-sm sm:text-base max-w-lg mx-auto">
            Subscribe to receive alerts about new arrivals, private discount coupons, and fashion collection releases.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-5 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-white"
            />
            <button
              type="submit"
              className="bg-brand-navy hover:bg-brand-coral hover:text-white px-8 py-3 rounded-full text-sm font-semibold tracking-wider uppercase transition-all duration-300 text-white"
            >
              Subscribe
            </button>
          </form>

          {newsletterMsg && (
            <p className="text-sm font-medium text-brand-coral animate-fade-in">{newsletterMsg}</p>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
