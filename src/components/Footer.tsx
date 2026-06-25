'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const [storeName, setStoreName] = useState('Antigravity Fashion');
  const [phone, setPhone] = useState('+8801700000000');
  const [email, setEmail] = useState('contact@antigravity-fashion.com');
  const [address, setAddress] = useState('Dhaka, Bangladesh');
  const [footerText, setFooterText] = useState('© 2026 Antigravity Fashion. All Rights Reserved.');

  useEffect(() => {
    fetch('/api/site-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setStoreName(data.settings.storeName);
          setPhone(data.settings.phone);
          setEmail(data.settings.contactEmail);
          setAddress(data.settings.address);
          setFooterText(data.settings.footerText);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-brand-navy text-white/90 pt-16 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        
        {/* Brand column */}
        <div className="space-y-4">
          <h3 className="font-playfair text-2xl font-bold tracking-tight text-white">
            {storeName}
          </h3>
          <p className="text-sm text-white/60 leading-relaxed font-light">
            Crafting premium dresses and elegant outfits for girls and women. Discover your signature look with our pastel and soft coral themes.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-white/60 hover:text-brand-coral transition-colors" title="Facebook">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </a>
            <a href="#" className="text-white/60 hover:text-brand-coral transition-colors" title="Instagram">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            </a>
            <a href="#" className="text-white/60 hover:text-brand-coral transition-colors" title="Youtube">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.163c-.272-1.022-1.074-1.826-2.099-2.099C19.558 3.5 12 3.5 12 3.5s-7.558 0-9.399.564c-1.025.273-1.827 1.077-2.099 2.099C0 8.002 0 12 0 12s0 3.998.564 5.837c.272 1.022 1.074 1.826 2.099 2.099C4.442 20.5 12 20.5 12 20.5s7.558 0 9.399-.564c1.025-.273 1.827-1.077 2.099-2.099C24 15.998 24 12 24 12s0-3.998-.564-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Shop Links */}
        <div>
          <h4 className="font-semibold text-sm uppercase tracking-wider mb-6 text-brand-coral">Quick Shop</h4>
          <ul className="space-y-3.5 text-sm text-white/70">
            <li><Link href="/shop" className="hover:text-white transition-colors">All Dresses</Link></li>
            <li><Link href="/shop?isNewArrival=true" className="hover:text-white transition-colors">New Arrivals</Link></li>
            <li><Link href="/shop?isBestSeller=true" className="hover:text-white transition-colors">Best Sellers</Link></li>
            <li><Link href="/shop?isOnSale=true" className="hover:text-white transition-colors">Discounted Items</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="font-semibold text-sm uppercase tracking-wider mb-6 text-brand-coral">Customer Care</h4>
          <ul className="space-y-3.5 text-sm text-white/70">
            <li><Link href="/track-order" className="hover:text-white transition-colors">Track Order</Link></li>
            <li><Link href="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
            <li><Link href="/return-policy" className="hover:text-white transition-colors">Return Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm uppercase tracking-wider mb-6 text-brand-coral">Get in Touch</h4>
          <ul className="space-y-4 text-sm text-white/70">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand-coral flex-shrink-0" />
              <span>{address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-brand-coral flex-shrink-0" />
              <span>{phone}</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-brand-coral flex-shrink-0" />
              <span>{email}</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Copyright bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
        <p>{footerText}</p>
        <p className="font-light">Design inspired by Luxury Fashion Layouts</p>
      </div>
    </footer>
  );
};
export default Footer;
