'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Heart, User as UserIcon, Search, Menu, X, Settings } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export const Header: React.FC = () => {
  const router = useRouter();
  const { cart, wishlist } = useCart();
  const { user } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [announcement, setAnnouncement] = useState('Free delivery on orders over ৳3000');
  const [storeName, setStoreName] = useState('Rongher Chua Butiks');
  const [logoUrl, setLogoUrl] = useState('/logo.png');

  useEffect(() => {
    // Read search parameter from window safely on client mount
    if (typeof window !== 'undefined') {
      const query = new URLSearchParams(window.location.search).get('search');
      if (query) setSearchQuery(query);
    }

    fetch('/api/site-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setAnnouncement(data.settings.announcementText);
          setStoreName(data.settings.storeName);
          if (data.settings.logoUrl) {
            setLogoUrl(data.settings.logoUrl);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/shop');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      {/* Announcement Bar */}
      <div className="bg-[#4A148C] py-2 text-center text-xs font-bold tracking-wider text-white">
        {announcement}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={storeName}
                className="h-10 w-auto object-contain rounded-md transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : null}
            <span className="font-serif text-xl font-bold tracking-tight text-[#2C3E50] group-hover:text-[#4A148C] transition-colors duration-300">
              {storeName}
            </span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search beautiful dresses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A148C] focus:border-[#4A148C] bg-gray-50/50 text-[#333333] placeholder-gray-400"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-[#4A148C]">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Navigation links - Desktop */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold tracking-wide text-[#2C3E50]">
            <Link href="/" className="hover:text-[#4A148C] transition-colors">Home</Link>
            <Link href="/shop" className="hover:text-[#4A148C] transition-colors">Shop</Link>
            <Link href="/contact" className="hover:text-[#4A148C] transition-colors">Contact</Link>
          </nav>

          {/* User icons */}
          <div className="flex items-center gap-4 text-[#2C3E50]">
            {/* Search toggler for mobile */}
            <Link href="/shop" className="md:hidden hover:text-[#4A148C]">
              <Search className="w-5 h-5" />
            </Link>

            {/* Wishlist */}
            <Link href={user ? "/dashboard/wishlist" : "/wishlist"} className="relative hover:text-[#4A148C] transition-colors">
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#4A148C] text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative hover:text-[#4A148C] transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#D4AF37] text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                  {cart.length}
                </span>
              )}
            </Link>

            {/* User Account / Dashboard Link */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="flex items-center gap-1.5 text-sm font-bold bg-[#4A148C] hover:bg-[#5C2C7A] px-4 py-2 rounded-full text-white transition-all duration-300 shadow-xs"
                >
                  {user.role === 'admin' ? (
                    <>
                      <Settings className="w-4 h-4" />
                      <span>Admin</span>
                    </>
                  ) : (
                    <>
                      <UserIcon className="w-4 h-4" />
                      <span className="max-w-[70px] truncate">{user.name.split(' ')[0]}</span>
                    </>
                  )}
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="hover:text-[#4A148C] transition-colors"
                title="Login"
              >
                <UserIcon className="w-5 h-5" />
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden hover:text-[#4A148C] transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu panel */}
      {isOpen && (
        <div className="lg:hidden border-t border-gray-150 bg-white px-4 py-4 space-y-3 shadow-inner">
          <form onSubmit={handleSearch} className="relative w-full mb-4">
            <input
              type="text"
              placeholder="Search beautiful dresses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A148C] bg-white text-[#333333]"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-gray-400">
              <Search className="w-4 h-4" />
            </button>
          </form>
          <div className="flex flex-col gap-3 font-semibold text-[#2C3E50]">
            <Link href="/" onClick={() => setIsOpen(false)} className="px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">Home</Link>
            <Link href="/shop" onClick={() => setIsOpen(false)} className="px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">Shop</Link>
            <Link href="/contact" onClick={() => setIsOpen(false)} className="px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">Contact</Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
