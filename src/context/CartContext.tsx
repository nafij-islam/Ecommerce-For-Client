'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  thumbnail: string;
  quantity: number;
  price: number;
  salePrice: number;
  selectedVariant?: {
    size: string;
    colorName: string;
    colorHex: string;
    sku: string;
    priceAdjustment?: number;
  };
}

export interface CouponType {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
}

interface CartContextType {
  cart: CartItem[];
  wishlist: string[]; // list of product IDs
  coupon: CouponType | null;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, sku?: string) => void;
  updateQuantity: (productId: string, quantity: number, sku?: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCouponCode: () => void;
  cartSubtotal: number;
  cartDiscount: number;
  cartTotal: number;
  shippingFee: number;
  freeShippingThreshold: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [coupon, setCoupon] = useState<CouponType | null>(null);
  const { showToast } = useToast();

  const shippingFee = 120;
  const freeShippingThreshold = 3000;

  // Load cart and wishlist from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedWishlist = localStorage.getItem('wishlist');
    const savedCoupon = localStorage.getItem('coupon');

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem('cart');
      }
    }
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch {
        localStorage.removeItem('wishlist');
      }
    }
    if (savedCoupon) {
      try {
        setCoupon(JSON.parse(savedCoupon));
      } catch {
        localStorage.removeItem('coupon');
      }
    }
  }, []);

  const saveCartToStorage = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const saveWishlistToStorage = (newWishlist: string[]) => {
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
  };

  const addToCart = useCallback((item: CartItem) => {
    let existingItemIndex = -1;
    if (item.selectedVariant) {
      existingItemIndex = cart.findIndex(
        (c) => c.productId === item.productId && c.selectedVariant?.sku === item.selectedVariant?.sku
      );
    } else {
      existingItemIndex = cart.findIndex((c) => c.productId === item.productId && !c.selectedVariant);
    }

    const newCart = [...cart];
    if (existingItemIndex > -1) {
      newCart[existingItemIndex].quantity += item.quantity;
    } else {
      newCart.push(item);
    }

    saveCartToStorage(newCart);
    showToast(`${item.name} added to cart!`, 'success');
  }, [cart, showToast]);

  const removeFromCart = useCallback((productId: string, sku?: string) => {
    let newCart: CartItem[] = [];
    if (sku) {
      newCart = cart.filter((c) => !(c.productId === productId && c.selectedVariant?.sku === sku));
    } else {
      newCart = cart.filter((c) => c.productId !== productId);
    }
    saveCartToStorage(newCart);
    showToast('Item removed from cart', 'info');
  }, [cart, showToast]);

  const updateQuantity = useCallback((productId: string, quantity: number, sku?: string) => {
    if (quantity < 1) return;
    const newCart = [...cart];
    let idx = -1;
    if (sku) {
      idx = newCart.findIndex((c) => c.productId === productId && c.selectedVariant?.sku === sku);
    } else {
      idx = newCart.findIndex((c) => c.productId === productId && !c.selectedVariant);
    }

    if (idx > -1) {
      newCart[idx].quantity = quantity;
      saveCartToStorage(newCart);
    }
  }, [cart]);

  const clearCart = useCallback(() => {
    saveCartToStorage([]);
    setCoupon(null);
    localStorage.removeItem('coupon');
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    const idx = wishlist.indexOf(productId);
    const newWishlist = [...wishlist];
    if (idx > -1) {
      newWishlist.splice(idx, 1);
      showToast('Removed from wishlist', 'info');
    } else {
      newWishlist.push(productId);
      showToast('Added to wishlist!', 'success');
    }
    saveWishlistToStorage(newWishlist);
  }, [wishlist, showToast]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  const applyCouponCode = async (code: string): Promise<boolean> => {
    try {
      // Calculate current subtotal
      const subtotal = cart.reduce((acc, c) => {
        const itemPrice = c.salePrice > 0 ? c.salePrice : c.price;
        const adj = c.selectedVariant?.priceAdjustment || 0;
        return acc + (itemPrice + adj) * c.quantity;
      }, 0);

      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Invalid Coupon', 'error');
        return false;
      }

      setCoupon(data.coupon);
      localStorage.setItem('coupon', JSON.stringify(data.coupon));
      showToast('Coupon applied successfully!', 'success');
      return true;
    } catch {
      showToast('Failed to validate coupon', 'error');
      return false;
    }
  };

  const removeCouponCode = () => {
    setCoupon(null);
    localStorage.removeItem('coupon');
    showToast('Coupon code removed', 'info');
  };

  // Calculations
  const cartSubtotal = cart.reduce((acc, c) => {
    const itemPrice = c.salePrice > 0 ? c.salePrice : c.price;
    const adj = c.selectedVariant?.priceAdjustment || 0;
    return acc + (itemPrice + adj) * c.quantity;
  }, 0);

  let cartDiscount = 0;
  if (coupon) {
    if (coupon.discountType === 'percentage') {
      cartDiscount = (cartSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && cartDiscount > coupon.maxDiscount) {
        cartDiscount = coupon.maxDiscount;
      }
    } else {
      cartDiscount = coupon.discountValue;
    }
  }

  const deliveryFee = cartSubtotal >= freeShippingThreshold ? 0 : shippingFee;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount + deliveryFee);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        coupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        applyCouponCode,
        removeCouponCode,
        cartSubtotal,
        cartDiscount,
        cartTotal,
        shippingFee: deliveryFee,
        freeShippingThreshold
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
