'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, SlidersHorizontal, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filters State
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Selected filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '');
  const [selectedSize, setSelectedSize] = useState(searchParams.get('size') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  // Mobile filters overlay toggler
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Lists of available options (static list of colors & sizes for styling convenience)
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const colors = [
    { name: 'Pink', hex: '#ff8a80' },
    { name: 'Peach', hex: '#ffeedb' },
    { name: 'Off-white', hex: '#FAF9F6' },
    { name: 'Black', hex: '#000000' },
    { name: 'Navy', hex: '#0E1629' },
    { name: 'Blue', hex: '#90caf9' }
  ];

  // Fetch Categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.categories || []);
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch Products based on URL query params
  useEffect(() => {
    setLoading(true);
    const fetchProducts = async () => {
      try {
        const query = new URLSearchParams();
        if (search) query.set('search', search);
        if (selectedCategory) query.set('category', selectedCategory);
        if (minPrice) query.set('minPrice', minPrice);
        if (maxPrice) query.set('maxPrice', maxPrice);
        if (selectedColor) query.set('color', selectedColor);
        if (selectedSize) query.set('size', selectedSize);
        if (sort) query.set('sort', sort);
        query.set('page', page.toString());
        query.set('limit', '8');

        // Check searchParams for direct flags
        if (searchParams.get('isNewArrival') === 'true') query.set('isNewArrival', 'true');
        if (searchParams.get('isBestSeller') === 'true') query.set('isBestSeller', 'true');
        if (searchParams.get('isOnSale') === 'true') query.set('isOnSale', 'true');

        const res = await fetch(`/api/products?${query.toString()}`);
        const data = await res.json();

        if (res.ok) {
          setProducts(data.products || []);
          setTotalPages(data.totalPages || 1);
          setTotalProducts(data.totalProducts || 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, selectedCategory, minPrice, maxPrice, selectedColor, selectedSize, sort, page, searchParams]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedColor('');
    setSelectedSize('');
    setSort('latest');
    setPage(1);
    router.push('/shop');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Main Shop Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Banner Section */}
        <div className="bg-brand-pink/30 rounded-[40px] p-8 md:p-12 mb-10 text-center space-y-4">
          <h1 className="font-playfair text-3xl md:text-5xl font-bold text-brand-navy">Premium Dress Catalog</h1>
          <p className="text-gray-600 font-light max-w-md mx-auto text-sm md:text-base">
            Explore our curated collections of soft pastel coral, off-white, and navy gowns and outfits.
          </p>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-100">
          <div className="text-sm text-gray-500 font-light">
            Showing <span className="font-semibold text-brand-navy">{products.length}</span> of{' '}
            <span className="font-semibold text-brand-navy">{totalProducts}</span> beautiful items
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-full text-sm font-semibold hover:border-brand-coral transition-colors"
            >
              <Filter className="w-4 h-4 text-brand-coral" />
              <span>Filters</span>
            </button>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-white"
            >
              <option value="latest">Sort by: Latest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="popular">Popularity</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block space-y-8 bg-white p-6 rounded-3xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="font-bold flex items-center gap-2 text-brand-navy">
                <SlidersHorizontal className="w-4.5 h-4.5 text-brand-coral" />
                <span>Filters</span>
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-xs text-brand-coral hover:text-brand-coral-hover font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Categories Filter */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-gray-400">Categories</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`block text-sm transition-colors text-left w-full px-2 py-1 rounded-md ${
                    selectedCategory === '' ? 'text-brand-coral font-bold bg-brand-pink/50' : 'text-gray-600 hover:text-brand-coral'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`block text-sm transition-colors text-left w-full px-2 py-1 rounded-md ${
                      selectedCategory === cat.slug ? 'text-brand-coral font-bold bg-brand-pink/50' : 'text-gray-600 hover:text-brand-coral'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-gray-400">Price Range (৳)</h4>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-center"
                />
                <span className="text-gray-400 text-xs">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-center"
                />
              </div>
            </div>

            {/* Color Filter */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-gray-400">Color</h4>
              <div className="flex flex-wrap gap-2.5">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(selectedColor === c.name ? '' : c.name)}
                    className={`w-7 h-7 rounded-full border relative ${
                      selectedColor === c.name ? 'ring-2 ring-brand-coral' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {selectedColor === c.name && (
                      <span className="absolute inset-0 rounded-full border-2 border-white"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-gray-400">Size</h4>
              <div className="flex flex-wrap gap-2">
                {sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                      selectedSize === sz
                        ? 'bg-brand-coral border-brand-coral text-white'
                        : 'border-gray-200 text-brand-navy hover:border-brand-coral'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product grid / Catalog */}
          <div className="lg:col-span-3 space-y-10">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-gray-100 rounded-3xl animate-pulse"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 space-y-4">
                <SlidersHorizontal className="w-12 h-12 text-brand-coral mx-auto" />
                <h3 className="font-playfair text-xl font-bold text-brand-navy">No products match your criteria</h3>
                <p className="text-gray-500 font-light text-sm max-w-sm mx-auto">
                  Try adjusting the filters or price range to find matching dresses and accessories.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-brand-coral hover:bg-brand-coral-hover text-white px-6 py-2 rounded-full text-xs font-semibold shadow-xs"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map((prod) => (
                    <ProductCard key={prod._id} product={prod} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="p-2 border border-gray-200 rounded-full disabled:opacity-40 disabled:hover:scale-100 hover:scale-105 transition-transform"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPage(idx + 1)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                          page === idx + 1
                            ? 'bg-brand-coral text-white font-bold'
                            : 'hover:bg-brand-pink text-brand-navy'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="p-2 border border-gray-200 rounded-full disabled:opacity-40 disabled:hover:scale-100 hover:scale-105 transition-transform"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filters Drawer Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/45" onClick={() => setShowMobileFilters(false)}></div>
          <div className="relative w-80 max-w-full bg-white h-full p-6 flex flex-col gap-6 shadow-2xl animate-fade-in overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-bold flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-coral" />
                <span>Filters</span>
              </h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-xs text-brand-coral font-bold uppercase tracking-wider"
              >
                Done
              </button>
            </div>

            {/* Mobile Categories */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-gray-400">Categories</h4>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`text-left text-sm py-1.5 px-3 rounded-xl ${
                    selectedCategory === '' ? 'bg-brand-pink font-semibold text-brand-coral' : 'text-gray-600'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`text-left text-sm py-1.5 px-3 rounded-xl ${
                      selectedCategory === cat.slug ? 'bg-brand-pink font-semibold text-brand-coral' : 'text-gray-600'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Price */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-gray-400">Price Range (৳)</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm text-center"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm text-center"
                />
              </div>
            </div>

            {/* Mobile Color */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-gray-400">Color</h4>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(selectedColor === c.name ? '' : c.name)}
                    className={`w-7 h-7 rounded-full border relative ${
                      selectedColor === c.name ? 'ring-2 ring-brand-coral' : ''
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Mobile Size */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-gray-400">Size</h4>
              <div className="flex flex-wrap gap-2">
                {sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                    className={`px-3 py-1.5 border rounded-lg text-xs font-semibold ${
                      selectedSize === sz ? 'bg-brand-coral border-brand-coral text-white' : ''
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleResetFilters}
              className="mt-4 bg-gray-150 hover:bg-gray-200 text-brand-navy py-3 rounded-full text-xs font-bold tracking-wider uppercase"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Dress Shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
