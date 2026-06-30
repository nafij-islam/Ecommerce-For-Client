'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  Shirt,
  FolderTree,
  ShoppingBag,
  Users,
  Percent,
  MessageSquare,
  Image as ImageIcon,
  Sliders,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  Eye,
  LogOut,
  X,
  Upload,
  UserCheck,
  Star,
  Menu
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function AdminConsole() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { showToast } = useToast();

  // Mobile Menu Drawer State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Selected Section
  const [activeSection, setActiveSection] = useState<
    'dashboard' | 'products' | 'categories' | 'orders' | 'customers' | 'coupons' | 'reviews' | 'banners' | 'settings'
  >('dashboard');

  // Stats Data
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Collections Lists
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  // loading states for lists
  const [loadingList, setLoadingList] = useState(false);

  // Modals / Drawer Form States
  const [activeModal, setActiveModal] = useState<
    'none' | 'add_product' | 'edit_product' | 'add_category' | 'edit_category' | 'add_coupon' | 'edit_coupon' | 'add_banner' | 'edit_banner' | 'view_order'
  >('none');
  
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');

  // -------------------------------------------------------------
  // Form State Bindings
  // -------------------------------------------------------------
  // Product Fields
  const [prodName, setProdName] = useState('');
  const [prodSlug, setProdSlug] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodSalePrice, setProdSalePrice] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodThumbnail, setProdThumbnail] = useState('');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodShortDesc, setProdShortDesc] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodTags, setProdTags] = useState('');
  const [prodIsNew, setProdIsNew] = useState(true);
  const [prodIsBest, setProdIsBest] = useState(false);
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  
  // Product Variants list state
  const [prodVariants, setProdVariants] = useState<any[]>([]);
  const [varSize, setVarSize] = useState('S');
  const [varColorName, setVarColorName] = useState('');
  const [varColorHex, setVarColorHex] = useState('#000000');
  const [varStock, setVarStock] = useState('0');
  const [varSku, setVarSku] = useState('');

  // Category Fields
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catSort, setCatSort] = useState('0');

  // Coupon Fields
  const [cpCode, setCpCode] = useState('');
  const [cpType, setCpType] = useState('percentage');
  const [cpValue, setCpValue] = useState('');
  const [cpMinOrder, setCpMinOrder] = useState('');
  const [cpMaxDiscount, setCpMaxDiscount] = useState('');
  const [cpLimit, setCpLimit] = useState('');
  const [cpStart, setCpStart] = useState('');
  const [cpEnd, setCpEnd] = useState('');

  // Banner Fields
  const [bnTitle, setBnTitle] = useState('');
  const [bnSubtitle, setBnSubtitle] = useState('');
  const [bnImage, setBnImage] = useState('');
  const [bnCtaText, setBnCtaText] = useState('');
  const [bnCtaLink, setBnCtaLink] = useState('');
  const [bnPlacement, setBnPlacement] = useState('hero');

  // Order Details Modal State
  const [orderStatus, setOrderStatus] = useState('');
  const [orderPayStatus, setOrderPayStatus] = useState('');
  const [orderTracking, setOrderTracking] = useState('');

  // Upload progress
  const [uploadingImage, setUploadingImage] = useState(false);

  // -------------------------------------------------------------
  // Protection & Sync mount
  // -------------------------------------------------------------
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      showToast('Admin login required.', 'error');
      router.push('/login?redirect=/admin');
    }
  }, [user, authLoading, router, showToast]);

  // Load section-specific data
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    if (activeSection === 'dashboard') {
      fetchStats();
    } else if (activeSection === 'products') {
      fetchProducts();
      fetchCategories();
    } else if (activeSection === 'categories') {
      fetchCategories();
    } else if (activeSection === 'orders') {
      fetchOrders();
    } else if (activeSection === 'customers') {
      fetchCustomers();
    } else if (activeSection === 'coupons') {
      fetchCoupons();
    } else if (activeSection === 'reviews') {
      fetchReviews();
    } else if (activeSection === 'banners') {
      fetchBanners();
    } else if (activeSection === 'settings') {
      fetchSettings();
    }
  }, [activeSection, user]);

  // -------------------------------------------------------------
  // Data Fetch Handlers
  // -------------------------------------------------------------
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setBestSellers(data.bestSellers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingList(true);
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (res.ok) setProducts(data.products || []);
    } catch {} finally { setLoadingList(false); }
  };

  const fetchCategories = async () => {
    try {
      setLoadingList(true);
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (res.ok) setCategories(data.categories || []);
    } catch {} finally { setLoadingList(false); }
  };

  const fetchOrders = async () => {
    try {
      setLoadingList(true);
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (res.ok) setOrders(data.orders || []);
    } catch {} finally { setLoadingList(false); }
  };

  const fetchCustomers = async () => {
    try {
      setLoadingList(true);
      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      if (res.ok) setCustomers(data.customers || []);
    } catch {} finally { setLoadingList(false); }
  };

  const fetchCoupons = async () => {
    try {
      setLoadingList(true);
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (res.ok) setCoupons(data.coupons || []);
    } catch {} finally { setLoadingList(false); }
  };

  const fetchReviews = async () => {
    try {
      setLoadingList(true);
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (res.ok) setReviews(data.reviews || []);
    } catch {} finally { setLoadingList(false); }
  };

  const fetchBanners = async () => {
    try {
      setLoadingList(true);
      const res = await fetch('/api/admin/banners');
      const data = await res.json();
      if (res.ok) setBanners(data.banners || []);
    } catch {} finally { setLoadingList(false); }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/site-settings');
      const data = await res.json();
      if (res.ok) setSettings(data.settings);
    } catch (err) {}
  };

  // -------------------------------------------------------------
  // Image Upload Proxy Helper
  // -------------------------------------------------------------
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'thumbnail' | 'gallery' | 'category' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const fd = new FormData();
      fd.append('image', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd
      });
      const data = await res.json();

      if (res.ok && data.url) {
        showToast('Image uploaded successfully!', 'success');
        if (target === 'thumbnail') setProdThumbnail(data.url);
        else if (target === 'category') setCatImage(data.url);
        else if (target === 'banner') setBnImage(data.url);
        else if (target === 'gallery') setProdImages((prev) => [...prev, data.url]);
      } else {
        showToast(data.error || 'Failed to upload image', 'error');
      }
    } catch {
      showToast('Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // -------------------------------------------------------------
  // CRUD Actions
  // -------------------------------------------------------------
  // Product CRUD
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: prodName,
        slug: prodSlug || prodName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        price: parseFloat(prodPrice),
        salePrice: prodSalePrice ? parseFloat(prodSalePrice) : 0,
        discountPercentage: prodSalePrice ? Math.round(((parseFloat(prodPrice) - parseFloat(prodSalePrice)) / parseFloat(prodPrice)) * 100) : 0,
        sku: prodSku || `SKU-${Date.now().toString().slice(-6)}`,
        stock: parseInt(prodStock || '0'),
        thumbnail: prodThumbnail || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=300',
        images: prodImages,
        shortDescription: prodShortDesc,
        description: prodDesc,
        categoryId: prodCategory || categories[0]?._id,
        variants: prodVariants,
        tags: prodTags.split(',').map((t) => t.trim()).filter(Boolean),
        status: 'published',
        isNewArrival: prodIsNew,
        isBestSeller: prodIsBest,
        isFeatured: prodIsFeatured,
        isOnSale: !!prodSalePrice
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Product added successfully!', 'success');
        setActiveModal('none');
        fetchProducts();
        // Reset states
        setProdName('');
        setProdSlug('');
        setProdPrice('');
        setProdSalePrice('');
        setProdSku('');
        setProdStock('');
        setProdThumbnail('');
        setProdImages([]);
        setProdShortDesc('');
        setProdDesc('');
        setProdVariants([]);
      } else {
        showToast(data.error || 'Failed to add product', 'error');
      }
    } catch {
      showToast('Error adding product', 'error');
    }
  };

  const handleEditProductClick = (prod: any) => {
    setSelectedItem(prod);
    setProdName(prod.name);
    setProdSlug(prod.slug);
    setProdPrice(prod.price.toString());
    setProdSalePrice(prod.salePrice ? prod.salePrice.toString() : '');
    setProdSku(prod.sku);
    setProdStock(prod.stock.toString());
    setProdThumbnail(prod.thumbnail);
    setProdImages(prod.images || []);
    setProdShortDesc(prod.shortDescription);
    setProdDesc(prod.description);
    setProdCategory(prod.categoryId);
    setProdVariants(prod.variants || []);
    setProdTags(prod.tags?.join(', ') || '');
    setProdIsNew(prod.isNewArrival);
    setProdIsBest(prod.isBestSeller);
    setProdIsFeatured(prod.isFeatured);
    setActiveModal('edit_product');
  };

  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: prodName,
        slug: prodSlug,
        price: parseFloat(prodPrice),
        salePrice: prodSalePrice ? parseFloat(prodSalePrice) : 0,
        discountPercentage: prodSalePrice ? Math.round(((parseFloat(prodPrice) - parseFloat(prodSalePrice)) / parseFloat(prodPrice)) * 100) : 0,
        sku: prodSku,
        stock: parseInt(prodStock),
        thumbnail: prodThumbnail,
        images: prodImages,
        shortDescription: prodShortDesc,
        description: prodDesc,
        categoryId: prodCategory,
        variants: prodVariants,
        tags: prodTags.split(',').map((t) => t.trim()).filter(Boolean),
        isNewArrival: prodIsNew,
        isBestSeller: prodIsBest,
        isFeatured: prodIsFeatured,
        isOnSale: !!prodSalePrice
      };

      const res = await fetch(`/api/admin/products/${selectedItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast('Product updated successfully!', 'success');
        setActiveModal('none');
        fetchProducts();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to update product', 'error');
      }
    } catch {
      showToast('Error editing product', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action is irreversible.')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Product deleted', 'info');
        fetchProducts();
      }
    } catch {
      showToast('Error deleting product', 'error');
    }
  };

  // Add Variant to current list
  const handleAddVariantItem = () => {
    if (!varColorName) {
      showToast('Enter variant color name', 'warning');
      return;
    }
    const newVariant = {
      size: varSize,
      colorName: varColorName,
      colorHex: varColorHex,
      stock: parseInt(varStock || '0'),
      sku: varSku || `VAR-${Date.now().toString().slice(-4)}`,
      isAvailable: parseInt(varStock || '0') > 0
    };
    setProdVariants((prev) => [...prev, newVariant]);
    setVarColorName('');
    setVarStock('0');
    setVarSku('');
  };

  const handleRemoveVariantItem = (idx: number) => {
    setProdVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  // Category CRUD
  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: catName,
        slug: catSlug || catName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        image: catImage || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=300',
        description: catDesc,
        sortOrder: parseInt(catSort || '0'),
        isActive: true
      };

      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Category created successfully!', 'success');
        setActiveModal('none');
        fetchCategories();
        setCatName('');
        setCatSlug('');
        setCatImage('');
        setCatDesc('');
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to create category', 'error');
      }
    } catch {
      showToast('Error creating category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Category removed', 'info');
        fetchCategories();
      }
    } catch {
      showToast('Error deleting category', 'error');
    }
  };

  // Orders CRUD status editor
  const handleViewOrderClick = (order: any) => {
    setSelectedItem(order);
    setOrderStatus(order.orderStatus);
    setOrderPayStatus(order.paymentStatus);
    setOrderTracking(order.trackingCode || '');
    setActiveModal('view_order');
  };

  const handleUpdateOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/orders/${selectedItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus,
          paymentStatus: orderPayStatus,
          trackingCode: orderTracking
        })
      });
      if (res.ok) {
        showToast('Order details updated successfully!', 'success');
        setActiveModal('none');
        fetchOrders();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to update order', 'error');
      }
    } catch {
      showToast('Error updating order status', 'error');
    }
  };

  // Coupon CRUD
  const handleAddCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        code: cpCode,
        discountType: cpType,
        discountValue: parseFloat(cpValue),
        minOrderAmount: parseFloat(cpMinOrder || '0'),
        maxDiscount: parseFloat(cpMaxDiscount || '0'),
        usageLimit: parseInt(cpLimit || '100'),
        startDate: cpStart,
        endDate: cpEnd,
        isActive: true
      };

      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Coupon created!', 'success');
        setActiveModal('none');
        fetchCoupons();
        setCpCode('');
        setCpValue('');
        setCpMinOrder('');
        setCpLimit('');
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to create coupon', 'error');
      }
    } catch {
      showToast('Error creating coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Coupon deleted', 'info');
        fetchCoupons();
      }
    } catch {
      showToast('Error deleting coupon', 'error');
    }
  };

  // Customers status toggler
  const handleToggleCustomerBlock = async (cust: any) => {
    const nextStatus = cust.status === 'active' ? 'blocked' : 'active';
    try {
      const res = await fetch(`/api/admin/customers/${cust._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showToast(`User status updated to ${nextStatus}`, 'info');
        fetchCustomers();
      }
    } catch {
      showToast('Failed to update customer status', 'error');
    }
  };

  // Banners CRUD
  const handleAddBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: bnTitle,
        subtitle: bnSubtitle,
        imageUrl: bnImage || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=300',
        ctaText: bnCtaText,
        ctaLink: bnCtaLink,
        placement: bnPlacement,
        isActive: true,
        sortOrder: 0
      };

      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Banner created!', 'success');
        setActiveModal('none');
        fetchBanners();
        setBnTitle('');
        setBnSubtitle('');
        setBnImage('');
        setBnCtaText('');
        setBnCtaLink('');
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to create banner', 'error');
      }
    } catch {
      showToast('Error creating banner', 'error');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Banner deleted', 'info');
        fetchBanners();
      }
    } catch {
      showToast('Error deleting banner', 'error');
    }
  };

  // Reviews CRUD
  const handleReviewStatusUpdate = async (revId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/reviews/${revId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Review marked as ${status}`, 'success');
        fetchReviews();
      }
    } catch {
      showToast('Failed to moderate review', 'error');
    }
  };

  const handleDeleteReview = async (revId: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${revId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Review deleted', 'info');
        fetchReviews();
      }
    } catch {
      showToast('Error deleting review', 'error');
    }
  };

  // SiteSettings CRUD
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        showToast('Site settings updated successfully!', 'success');
        fetchSettings();
      }
    } catch {
      showToast('Error saving settings', 'error');
    }
  };

  const handleSettingsFieldChange = (field: string, val: any) => {
    setSettings((prev: any) => ({ ...prev, [field]: val }));
  };

  // Sidebar Menu Drawer Navigation Component logic helper
  const navigationItems = [
    { key: 'dashboard', label: 'Metrics Overview', icon: LayoutDashboard },
    { key: 'products', label: 'Products Manager', icon: Shirt },
    { key: 'categories', label: 'Categories', icon: FolderTree },
    { key: 'orders', label: 'Orders Processing', icon: ShoppingBag },
    { key: 'customers', label: 'Customers', icon: Users },
    { key: 'coupons', label: 'Coupons Manager', icon: Percent },
    { key: 'reviews', label: 'Reviews Moderation', icon: MessageSquare },
    { key: 'banners', label: 'Marketing Banners', icon: ImageIcon },
    { key: 'settings', label: 'Site Configuration', icon: Sliders }
  ];

  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070913] text-white">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-purple-300 font-light text-sm tracking-wider">Authenticating admin account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-galaxy text-slate-100 font-sans">
      
      {/* -------------------------------------------------------------
          DESKTOP SIDEBAR NAVIGATION
      ------------------------------------------------------------- */}
      <aside className="w-72 bg-slate-950/45 backdrop-blur-xl flex-shrink-0 flex flex-col justify-between hidden md:flex border-r border-white/10 z-20">
        <div>
          {/* Logo */}
          <div className="h-24 flex flex-col justify-center px-8 border-b border-white/10">
            <span className="text-[10px] text-purple-400 font-bold tracking-widest uppercase mb-1 glow-text">Aura & Thread</span>
            <h1 className="font-playfair text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Admin Console
            </h1>
          </div>

          <nav className="p-4 space-y-1.5 text-sm font-medium">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key as any)}
                  className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-400/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-purple-400/80'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-white/10 text-xs text-slate-400 space-y-4">
          <div className="flex items-center gap-3 bg-slate-900/40 p-3 rounded-2xl border border-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-slate-200 font-semibold">{user.name}</p>
              <p className="text-[10px] text-purple-400/80 font-medium">Active Administrator</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full bg-slate-900 hover:bg-rose-950/60 hover:text-rose-200 text-slate-300 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all border border-white/10 hover:border-rose-800/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Console</span>
          </button>
        </div>
      </aside>

      {/* -------------------------------------------------------------
          MOBILE NAVIGATION SLIDING DRAWER MENU
      ------------------------------------------------------------- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative w-80 max-w-[85vw] bg-[#080a15] border-r border-white/15 h-full flex flex-col justify-between p-6 z-10 animate-fade-in shadow-2xl">
            <div>
              <div className="flex justify-between items-center pb-6 border-b border-white/10">
                <div>
                  <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider block">Aura & Thread</span>
                  <h1 className="font-playfair text-xl font-bold text-white">Admin Console</h1>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-white/10 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="py-6 space-y-1.5 text-xs font-semibold">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        setActiveSection(item.key as any);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg border border-purple-400/25'
                          : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-purple-400/80'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-white/10 pt-6 space-y-4">
              <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-slate-200 text-xs font-bold">{user.name}</p>
                  <p className="text-[9px] text-purple-400 font-medium">Administrator</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full bg-slate-900/50 hover:bg-rose-950/60 hover:text-rose-200 text-slate-400 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all border border-white/10 text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out Console</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MAIN CONTENT PANEL AREA
      ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        
        {/* Mobile Header topbar */}
        <header className="md:hidden h-20 bg-slate-950/30 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2.5 bg-slate-900/80 border border-white/10 rounded-2xl text-slate-200 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[8px] text-purple-400 font-bold uppercase tracking-wider block">Aura & Thread</span>
              <h2 className="text-sm font-bold text-white capitalize">{activeSection}</h2>
            </div>
          </div>

          <Link href="/" className="text-[10px] text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-full font-semibold bg-slate-900/50">
            Live Site
          </Link>
        </header>

        {/* Desktop Topbar */}
        <header className="hidden md:flex h-24 bg-slate-950/20 border-b border-white/10 items-center justify-between px-8 flex-shrink-0 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-xs text-purple-400 border border-purple-500/30 px-5 py-2.5 rounded-full font-semibold hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:border-transparent transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] bg-slate-950/40"
            >
              &larr; View Live Website
            </Link>
            <h2 className="font-playfair text-2xl font-bold text-white capitalize">
              {activeSection}
            </h2>
          </div>

          {/* Search bar */}
          {['products', 'orders', 'customers'].includes(activeSection) && (
            <div className="max-w-xs w-full relative">
              <input
                type="text"
                placeholder={`Search ${activeSection}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-2.5 bg-slate-900/60 border border-white/15 rounded-full text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all duration-300"
              />
            </div>
          )}
        </header>

        {/* Dashboard Inner content scroll */}
        <div className="p-4 sm:p-8 flex-1 z-10">
          
          {/* -------------------------------------------------------------
              1. DASHBOARD OVERVIEW SECTION
          ------------------------------------------------------------- */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6 sm:space-y-8 animate-fade-in">
              {/* Metrics Stats Cards */}
              {loadingStats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-slate-900/35 h-32 rounded-3xl border border-white/5"></div>
                  ))}
                </div>
              ) : stats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1 */}
                  <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.05)] hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] flex items-center gap-5 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="bg-purple-950/60 border border-purple-500/20 p-4 rounded-2xl text-purple-400 shadow-inner">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Revenue</p>
                      <h3 className="text-2xl font-extrabold text-white mt-0.5 glow-text">৳{stats.totalRevenue}</h3>
                    </div>
                  </div>
                  {/* Card 2 */}
                  <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.05)] hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] flex items-center gap-5 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="bg-pink-950/60 border border-pink-500/20 p-4 rounded-2xl text-pink-400 shadow-inner">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Orders</p>
                      <h3 className="text-2xl font-extrabold text-white mt-0.5 glow-text">{stats.totalOrders}</h3>
                      <span className="text-[10px] text-pink-400 font-semibold block mt-0.5">{stats.pendingOrders} pending queue</span>
                    </div>
                  </div>
                  {/* Card 3 */}
                  <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.05)] hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] flex items-center gap-5 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="bg-blue-950/60 border border-blue-500/20 p-4 rounded-2xl text-blue-400 shadow-inner">
                      <Shirt className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Products</p>
                      <h3 className="text-2xl font-extrabold text-white mt-0.5 glow-text">{stats.totalProducts}</h3>
                      {stats.lowStockProducts > 0 && (
                        <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-0.5 mt-0.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{stats.lowStockProducts} low stock alerts</span>
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Card 4 */}
                  <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.05)] hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] flex items-center gap-5 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="bg-purple-950/60 border border-purple-500/20 p-4 rounded-2xl text-purple-400 shadow-inner">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Customers</p>
                      <h3 className="text-2xl font-extrabold text-white mt-0.5 glow-text">{stats.totalCustomers}</h3>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Recent Orders & Best Sellers Lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Recent Orders Table */}
                <div className="bg-slate-950/40 backdrop-blur-md p-5 sm:p-8 rounded-[36px] border border-white/10 shadow-lg space-y-6">
                  <h3 className="font-playfair text-xl font-bold text-white border-b border-white/10 pb-3">Recent Orders</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-slate-400 uppercase tracking-widest border-b border-white/10 text-[10px]">
                          <th className="py-3 pr-2">Order Number</th>
                          <th className="pr-2">Customer</th>
                          <th className="pr-2">Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {recentOrders.map((ord) => (
                          <tr key={ord._id} className="hover:bg-white/5 transition-colors">
                            <td className="py-4 pr-2 font-mono font-bold text-white">{ord.orderNumber}</td>
                            <td className="pr-2">{ord.customer.name}</td>
                            <td className="font-bold text-white pr-2">৳{ord.total}</td>
                            <td>
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                                ord.orderStatus === 'delivered'
                                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/20'
                                  : 'bg-amber-950/40 text-amber-300 border border-amber-500/20'
                              }`}>
                                {ord.orderStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Best Sellers list */}
                <div className="bg-slate-950/40 backdrop-blur-md p-5 sm:p-8 rounded-[36px] border border-white/10 shadow-lg space-y-6">
                  <h3 className="font-playfair text-xl font-bold text-white border-b border-white/10 pb-3">Trending Catalog Items</h3>
                  <div className="divide-y divide-white/5">
                    {bestSellers.map((item) => (
                      <div key={item._id} className="py-3.5 flex gap-4 items-center text-xs">
                        <div className="relative w-12 h-14 bg-slate-900 border border-white/15 rounded-xl overflow-hidden flex-shrink-0">
                          <Image src={item.thumbnail} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{item.name}</p>
                          <p className="text-slate-400 mt-0.5">Price: ৳{item.salePrice || item.price}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            item.stock <= 5
                              ? 'bg-rose-950/40 text-rose-300 border border-rose-500/20'
                              : 'bg-slate-900 text-slate-300 border border-white/10'
                          }`}>
                            Stock: {item.stock}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              2. PRODUCTS MANAGER SECTION
          ------------------------------------------------------------- */}
          {activeSection === 'products' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="font-playfair text-2xl font-bold text-white">Dress Inventory</h2>
                
                {/* Search input for mobile */}
                <div className="md:hidden w-full max-w-md relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-5 py-2.5 bg-slate-900/60 border border-white/15 rounded-full text-xs text-white placeholder-slate-400"
                  />
                </div>

                <button
                  onClick={() => {
                    // Reset field bindings
                    setProdName('');
                    setProdPrice('');
                    setProdStock('');
                    setProdSku('');
                    setProdShortDesc('');
                    setProdDesc('');
                    setProdThumbnail('');
                    setProdImages([]);
                    setProdVariants([]);
                    setActiveModal('add_product');
                  }}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/10 border border-purple-400/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Products Table list */}
              <div className="bg-slate-950/45 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden shadow-lg">
                {loadingList ? (
                  <div className="p-8 text-center animate-pulse text-slate-400">Loading catalog items...</div>
                ) : products.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-light">No products created yet. Add one above!</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/50 uppercase tracking-wider text-slate-400 border-b border-white/10">
                        <tr>
                          <th className="p-4">Product Info</th>
                          <th>SKU</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Flags</th>
                          <th className="text-center p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {products
                          .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((prod) => (
                            <tr key={prod._id} className="hover:bg-white/5 transition-all">
                              <td className="p-4 flex gap-3 items-center min-w-[200px]">
                                <div className="relative w-12 h-14 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                                  <Image src={prod.thumbnail} alt={prod.name} fill className="object-cover" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-white truncate max-w-[180px]">{prod.name}</p>
                                  <p className="text-slate-400 text-[10px]">{prod.slug}</p>
                                </div>
                              </td>
                              <td className="font-mono font-semibold text-white">{prod.sku}</td>
                              <td className="font-bold">
                                <span className="text-white">৳{prod.salePrice || prod.price}</span>
                                {prod.salePrice > 0 && <span className="text-[10px] text-slate-400 line-through block">৳{prod.price}</span>}
                              </td>
                              <td>
                                <span className={`font-semibold px-2 py-0.5 rounded-full ${
                                  prod.stock <= 5
                                    ? 'bg-rose-955/40 text-rose-300 border border-rose-500/20'
                                    : 'bg-emerald-955/40 text-emerald-300 border border-emerald-500/20'
                                }`}>
                                  {prod.stock} items
                                </span>
                              </td>
                              <td>
                                <div className="flex flex-wrap gap-1 text-[9px] font-bold">
                                  {prod.isNewArrival && <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded-md">NEW</span>}
                                  {prod.isBestSeller && <span className="bg-purple-600 text-white px-1.5 py-0.5 rounded-md">BEST</span>}
                                  {prod.isFeatured && <span className="bg-amber-600 text-white px-1.5 py-0.5 rounded-md">FEAT</span>}
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex gap-2 justify-center">
                                  <button onClick={() => handleEditProductClick(prod)} className="p-2 text-purple-400 hover:bg-purple-955/50 border border-white/5 hover:border-purple-500/30 rounded-xl" title="Edit">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDeleteProduct(prod._id)} className="p-2 text-rose-450 hover:bg-rose-955/50 border border-white/5 hover:border-rose-500/30 rounded-xl" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              3. CATEGORIES MANAGER SECTION
          ------------------------------------------------------------- */}
          {activeSection === 'categories' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h2 className="font-playfair text-2xl font-bold text-white">Product Categories</h2>
                <button
                  onClick={() => {
                    setCatName('');
                    setCatSlug('');
                    setCatImage('');
                    setCatDesc('');
                    setActiveModal('add_category');
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md border border-purple-400/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Category</span>
                </button>
              </div>

              {/* Categories list */}
              <div className="bg-slate-950/45 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden shadow-lg">
                {loadingList ? (
                  <div className="p-8 text-center animate-pulse text-slate-400">Loading categories...</div>
                ) : categories.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-light">No categories created yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/50 uppercase tracking-wider text-slate-400 border-b border-white/10">
                        <tr>
                          <th className="p-4">Category Image</th>
                          <th>Category Name</th>
                          <th>Slug</th>
                          <th>Sort Order</th>
                          <th className="text-center p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {categories.map((cat) => (
                          <tr key={cat._id} className="hover:bg-white/5 transition-all">
                            <td className="p-4">
                              <div className="relative w-12 h-12 bg-slate-900 rounded-full overflow-hidden border border-white/10">
                                <Image src={cat.image || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=300'} alt={cat.name} fill className="object-cover" />
                              </div>
                            </td>
                            <td className="font-bold text-white">{cat.name}</td>
                            <td className="font-mono text-slate-400">{cat.slug}</td>
                            <td className="font-bold text-white">{cat.sortOrder}</td>
                            <td className="p-4 text-center">
                              <div className="flex gap-2 justify-center">
                                <button onClick={() => handleDeleteCategory(cat._id)} className="p-2 text-rose-450 hover:bg-rose-955/40 border border-white/5 rounded-xl" title="Delete">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              4. ORDERS PROCESSING SECTION
          ------------------------------------------------------------- */}
          {activeSection === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="font-playfair text-2xl font-bold text-white">Orders Queue</h2>
                <div className="md:hidden w-full max-w-md relative">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-5 py-2.5 bg-slate-900/60 border border-white/15 rounded-full text-xs text-white placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Orders Queue list */}
              <div className="bg-slate-955/45 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden shadow-lg">
                {loadingList ? (
                  <div className="p-8 text-center animate-pulse text-slate-405">Loading orders queue...</div>
                ) : orders.length === 0 ? (
                  <div className="p-8 text-center text-slate-405 font-light">No orders placed yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/50 uppercase tracking-wider text-slate-400 border-b border-white/10">
                        <tr>
                          <th className="p-4">Order Code</th>
                          <th>Customer</th>
                          <th>Total Amount</th>
                          <th>Order Status</th>
                          <th>Payment Status</th>
                          <th>Tracking</th>
                          <th className="text-center p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {orders
                          .filter((o) => o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((ord) => (
                            <tr key={ord._id} className="hover:bg-white/5 transition-all">
                              <td className="p-4 font-mono font-bold text-purple-400">{ord.orderNumber}</td>
                              <td className="min-w-[150px]">
                                <p className="font-bold text-white">{ord.customer.name}</p>
                                <p className="text-slate-400 text-[10px]">{ord.customer.phone}</p>
                              </td>
                              <td className="font-bold text-white">৳{ord.total}</td>
                              <td>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                                  ord.orderStatus === 'delivered'
                                    ? 'bg-emerald-955/40 text-emerald-300 border border-emerald-500/20'
                                    : ord.orderStatus === 'cancelled'
                                    ? 'bg-rose-955/40 text-rose-300 border border-rose-500/20'
                                    : 'bg-amber-955/40 text-amber-300 border border-amber-500/20'
                                }`}>
                                  {ord.orderStatus}
                                </span>
                              </td>
                              <td>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                                  ord.paymentStatus === 'paid'
                                    ? 'bg-emerald-955/40 text-emerald-300 border border-emerald-500/20'
                                    : 'bg-rose-955/40 text-rose-300 border border-rose-500/20'
                                }`}>
                                  {ord.paymentStatus}
                                </span>
                              </td>
                              <td className="font-mono text-slate-400 min-w-[100px]">{ord.trackingCode || 'No code'}</td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => handleViewOrderClick(ord)}
                                  className="p-2 bg-slate-900 border border-white/10 hover:border-purple-500/30 text-purple-400 rounded-xl flex items-center gap-1.5 mx-auto"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span>Manage</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              5. CUSTOMERS LIST SECTION
          ------------------------------------------------------------- */}
          {activeSection === 'customers' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="font-playfair text-2xl font-bold text-white">Registered Customers</h2>
                <div className="md:hidden w-full max-w-md relative">
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-5 py-2.5 bg-slate-900/60 border border-white/15 rounded-full text-xs text-white placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="bg-slate-955/45 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden shadow-lg">
                {loadingList ? (
                  <div className="p-8 text-center animate-pulse text-slate-405">Loading customers...</div>
                ) : customers.length === 0 ? (
                  <div className="p-8 text-center text-slate-405 font-light">No customers found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/50 uppercase tracking-wider text-slate-400 border-b border-white/10">
                        <tr>
                          <th className="p-4">Customer Details</th>
                          <th>Auth Provider</th>
                          <th>Status</th>
                          <th>Signup Date</th>
                          <th className="text-center p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {customers
                          .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((cust) => (
                            <tr key={cust._id} className="hover:bg-white/5 transition-all">
                              <td className="p-4 min-w-[150px]">
                                <p className="font-bold text-white">{cust.name}</p>
                                <p className="text-slate-400 text-[10px]">{cust.email}</p>
                              </td>
                              <td className="capitalize font-semibold text-slate-400">{cust.provider}</td>
                              <td>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                                  cust.status === 'active'
                                    ? 'bg-emerald-955/40 text-emerald-300 border border-emerald-500/20'
                                    : 'bg-rose-955/40 text-rose-300 border border-rose-500/20'
                                }`}>
                                  {cust.status}
                                </span>
                              </td>
                              <td className="text-slate-400">{new Date(cust.createdAt).toLocaleDateString()}</td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => handleToggleCustomerBlock(cust)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 mx-auto border transition-colors ${
                                    cust.status === 'active'
                                      ? 'border-rose-800/40 text-rose-405 hover:bg-rose-955/30'
                                      : 'border-emerald-800/40 text-emerald-405 hover:bg-emerald-955/30'
                                  }`}
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>{cust.status === 'active' ? 'Block Account' : 'Unblock Account'}</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              6. COUPONS MANAGER SECTION
          ------------------------------------------------------------- */}
          {activeSection === 'coupons' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h2 className="font-playfair text-2xl font-bold text-white">Discount Coupons</h2>
                <button
                  onClick={() => {
                    setCpCode('');
                    setCpValue('');
                    setCpMinOrder('');
                    setCpLimit('');
                    setCpStart('');
                    setCpEnd('');
                    setActiveModal('add_coupon');
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md border border-purple-400/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Coupon</span>
                </button>
              </div>

              {/* Coupons list */}
              <div className="bg-slate-955/45 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden shadow-lg">
                {loadingList ? (
                  <div className="p-8 text-center animate-pulse text-slate-405">Loading coupons...</div>
                ) : coupons.length === 0 ? (
                  <div className="p-8 text-center text-slate-405 font-light">No coupons created yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/50 uppercase tracking-wider text-slate-400 border-b border-white/10">
                        <tr>
                          <th className="p-4">Code</th>
                          <th>Discount</th>
                          <th>Min Order</th>
                          <th>Usage Limit</th>
                          <th>Active Window</th>
                          <th className="text-center p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {coupons.map((cp) => (
                          <tr key={cp._id} className="hover:bg-white/5 transition-all">
                            <td className="p-4 font-mono font-bold text-purple-400 tracking-wider">{cp.code}</td>
                            <td className="font-bold text-pink-400">
                              {cp.discountType === 'percentage' ? `${cp.discountValue}%` : `৳${cp.discountValue}`}
                            </td>
                            <td className="font-bold text-white">৳{cp.minOrderAmount}</td>
                            <td>
                              <span className="font-semibold text-slate-400">
                                {cp.usedCount} / {cp.usageLimit} used
                              </span>
                            </td>
                            <td className="text-slate-400">
                              {new Date(cp.startDate).toLocaleDateString()} - {new Date(cp.endDate).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-center">
                              <button onClick={() => handleDeleteCoupon(cp._id)} className="p-2 text-rose-450 hover:bg-rose-955/40 border border-white/5 rounded-xl" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              7. REVIEWS MODERATION SECTION
          ------------------------------------------------------------- */}
          {activeSection === 'reviews' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-playfair text-2xl font-bold text-white">Reviews Moderation Queue</h2>

              {/* Reviews Queue */}
              <div className="bg-slate-955/45 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden shadow-lg">
                {loadingList ? (
                  <div className="p-8 text-center animate-pulse text-slate-405">Loading reviews queue...</div>
                ) : reviews.length === 0 ? (
                  <div className="p-8 text-center text-slate-405 font-light">No reviews posted yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/50 uppercase tracking-wider text-slate-400 border-b border-white/10">
                        <tr>
                          <th className="p-4">Product Info</th>
                          <th>Customer</th>
                          <th>Rating</th>
                          <th>Review Text</th>
                          <th>Status</th>
                          <th className="text-center p-4">Moderation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {reviews.map((rev) => (
                          <tr key={rev._id} className="hover:bg-white/5 transition-all">
                            <td className="p-4">
                              <p className="font-bold text-white truncate max-w-[120px]">{rev.productId?.name || 'Deleted Dress'}</p>
                            </td>
                            <td>
                              <p className="font-bold text-white">{rev.userId?.name || 'Anonymous'}</p>
                              <p className="text-slate-400 text-[10px]">{rev.userId?.email}</p>
                            </td>
                            <td className="text-amber-400 font-bold flex items-center gap-0.5 py-4">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>{rev.rating}</span>
                            </td>
                            <td className="max-w-xs truncate font-light text-slate-400">{rev.reviewText}</td>
                            <td>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                                rev.status === 'approved'
                                  ? 'bg-emerald-955/40 text-emerald-300 border border-emerald-500/20'
                                  : rev.status === 'rejected'
                                  ? 'bg-rose-955/40 text-rose-300 border border-rose-500/20'
                                  : 'bg-amber-955/40 text-amber-300 border border-amber-500/20'
                              }`}>
                                {rev.status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex gap-2 justify-center">
                                {rev.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleReviewStatusUpdate(rev._id, 'approved')}
                                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold border border-emerald-500/20"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleReviewStatusUpdate(rev._id, 'rejected')}
                                      className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold border border-rose-500/20"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleDeleteReview(rev._id)}
                                  className="p-1.5 text-slate-405 hover:text-rose-400"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              8. MARKETING BANNERS SECTION
          ------------------------------------------------------------- */}
          {activeSection === 'banners' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h2 className="font-playfair text-2xl font-bold text-white">Promotional Banners</h2>
                <button
                  onClick={() => {
                    setBnTitle('');
                    setBnSubtitle('');
                    setBnImage('');
                    setBnCtaText('');
                    setBnCtaLink('');
                    setActiveModal('add_banner');
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md border border-purple-400/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Banner</span>
                </button>
              </div>

              {/* Banners grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {banners.map((bn) => (
                  <div key={bn._id} className="bg-slate-955/45 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-lg flex flex-col justify-between">
                    <div className="relative aspect-video w-full bg-slate-900">
                      <Image src={bn.imageUrl} alt={bn.title} fill className="object-cover" />
                      <div className="absolute top-4 left-4 bg-slate-950/90 text-white text-[9px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full border border-white/10">
                        Placement: {bn.placement}
                      </div>
                    </div>
                    <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-white text-base">{bn.title}</h4>
                        <p className="text-slate-400 font-light text-xs">{bn.subtitle}</p>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-white/5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          bn.isActive ? 'text-emerald-400' : 'text-slate-400'
                        }`}>
                          {bn.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button onClick={() => handleDeleteBanner(bn._id)} className="text-rose-405 hover:text-rose-350 font-bold text-xs uppercase flex items-center gap-1">
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              9. SITE CONFIGURATION SECTION
          ------------------------------------------------------------- */}
          {activeSection === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-playfair text-2xl font-bold text-white">Site Configuration</h2>

              {settings ? (
                <form onSubmit={handleUpdateSettings} className="bg-slate-955/45 backdrop-blur-xl p-5 sm:p-8 rounded-[32px] border border-white/10 space-y-6 max-w-2xl shadow-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-404 uppercase tracking-wider">Store Name</label>
                      <input
                        type="text"
                        required
                        value={settings.storeName}
                        onChange={(e) => handleSettingsFieldChange('storeName', e.target.value)}
                        className="w-full px-4 py-2 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-900/60 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-404 uppercase tracking-wider">Contact Email</label>
                      <input
                        type="email"
                        required
                        value={settings.contactEmail}
                        onChange={(e) => handleSettingsFieldChange('contactEmail', e.target.value)}
                        className="w-full px-4 py-2 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-900/60 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-404 uppercase tracking-wider">Phone</label>
                      <input
                        type="text"
                        required
                        value={settings.phone}
                        onChange={(e) => handleSettingsFieldChange('phone', e.target.value)}
                        className="w-full px-4 py-2 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-900/60 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-404 uppercase tracking-wider">Delivery Charge (৳)</label>
                      <input
                        type="number"
                        required
                        value={settings.deliveryCharge}
                        onChange={(e) => handleSettingsFieldChange('deliveryCharge', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-900/60 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-404 uppercase tracking-wider">Free Delivery Minimum Amount (৳)</label>
                      <input
                        type="number"
                        required
                        value={settings.freeDeliveryMinAmount}
                        onChange={(e) => handleSettingsFieldChange('freeDeliveryMinAmount', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-900/60 text-white"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-404 uppercase tracking-wider">Announcement Text</label>
                      <input
                        type="text"
                        value={settings.announcementText}
                        onChange={(e) => handleSettingsFieldChange('announcementText', e.target.value)}
                        className="w-full px-4 py-2 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-900/60 text-white"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-404 uppercase tracking-wider">Footer Copyright Text</label>
                      <input
                        type="text"
                        value={settings.footerCopyrightText}
                        onChange={(e) => handleSettingsFieldChange('footerCopyrightText', e.target.value)}
                        className="w-full px-4 py-2 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-900/60 text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-2.5 rounded-full text-xs font-semibold shadow-md border border-purple-400/20"
                  >
                    Save Changes
                  </button>
                </form>
              ) : (
                <div className="p-8 bg-slate-955/45 text-center text-slate-400 rounded-[32px] border border-white/10">Loading configurations...</div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* -------------------------------------------------------------
          MODALS / DRAWERS (Galaxy Glass Theme Overlay)
      ------------------------------------------------------------- */}
      {/* 1. ADD PRODUCT MODAL */}
      {activeModal === 'add_product' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fade-in" onClick={() => setActiveModal('none')}></div>
          <form onSubmit={handleAddProductSubmit} className="relative bg-[#0b0c16]/90 border border-purple-500/20 max-w-2xl w-full p-6 sm:p-8 rounded-[32px] shadow-2xl animate-fade-in space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-playfair text-xl font-bold text-white">Add New Product</h3>
              <button type="button" onClick={() => setActiveModal('none')} className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-white/10 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Product Name</label>
                <input type="text" required value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Regular Price (৳)</label>
                <input type="number" required value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Sale Price (৳ - Optional)</label>
                <input type="number" value={prodSalePrice} onChange={(e) => setProdSalePrice(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">SKU</label>
                <input type="text" value={prodSku} onChange={(e) => setProdSku(e.target.value)} placeholder="Auto-generated" className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Total Stock</label>
                <input type="number" required value={prodStock} onChange={(e) => setProdStock(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500" />
              </div>

              {/* Upload fields */}
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase block">Product Thumbnail Image</label>
                <div className="flex gap-3 items-center">
                  <input type="text" required placeholder="Image URL or upload" value={prodThumbnail} onChange={(e) => setProdThumbnail(e.target.value)} className="flex-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500" />
                  <label className="bg-slate-900 border border-white/10 hover:border-purple-500/35 hover:bg-purple-950/20 text-purple-400 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'thumbnail')} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Short Description</label>
                <input type="text" required value={prodShortDesc} onChange={(e) => setProdShortDesc(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Description</label>
                <textarea rows={2} required value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500" />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Category</label>
                <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 select-dark">
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Tags (comma separated)</label>
                <input type="text" value={prodTags} onChange={(e) => setProdTags(e.target.value)} placeholder="dress, party, summer" className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500" />
              </div>
            </div>

            {/* Product Variants builder */}
            <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl text-left space-y-3">
              <h4 className="font-bold text-purple-400 text-xs uppercase tracking-wider">Product Variants (Optional)</h4>
              
              <div className="grid grid-cols-5 gap-2 items-end">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-bold">Size</label>
                  <select value={varSize} onChange={(e) => setVarSize(e.target.value)} className="w-full px-2 py-1.5 bg-slate-955 border border-white/10 rounded text-[11px] text-white">
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] text-slate-400 uppercase font-bold">Color Name</label>
                  <input type="text" placeholder="Pink / Peach" value={varColorName} onChange={(e) => setVarColorName(e.target.value)} className="w-full px-2 py-1 bg-slate-955 border border-white/10 rounded text-[11px] text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-bold">Color Hex</label>
                  <input type="color" value={varColorHex} onChange={(e) => setVarColorHex(e.target.value)} className="w-full h-7 p-0.5 bg-slate-955 border border-white/10 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-bold">Stock</label>
                  <input type="number" value={varStock} onChange={(e) => setVarStock(e.target.value)} className="w-full px-2 py-1 bg-slate-955 border border-white/10 rounded text-[11px] text-white" />
                </div>
              </div>
              <button type="button" onClick={handleAddVariantItem} className="bg-slate-955 hover:bg-purple-955/20 text-purple-400 border border-purple-500/20 px-4 py-2 rounded-lg text-xs font-bold w-full uppercase tracking-wider mt-2">
                Add Variant to Product
              </button>

              {/* Added variants lists */}
              {prodVariants.length > 0 && (
                <div className="divide-y divide-white/5 max-h-32 overflow-y-auto bg-slate-955 border border-white/10 rounded-xl mt-3 p-2 text-xs">
                  {prodVariants.map((item, idx) => (
                    <div key={idx} className="py-2 flex justify-between items-center text-slate-300">
                      <span>Size: {item.size} | Color: {item.colorName} ({item.colorHex}) | Stock: {item.stock}</span>
                      <button type="button" onClick={() => handleRemoveVariantItem(idx)} className="text-rose-400 font-bold hover:underline">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <div className="flex items-center gap-1 text-xs">
                <input type="checkbox" id="isNew" checked={prodIsNew} onChange={(e) => setProdIsNew(e.target.checked)} className="accent-purple-650" />
                <label htmlFor="isNew" className="font-semibold text-slate-400 cursor-pointer">New Arrival</label>
              </div>
              <div className="flex items-center gap-1 text-xs ml-4">
                <input type="checkbox" id="isBest" checked={prodIsBest} onChange={(e) => setProdIsBest(e.target.checked)} className="accent-purple-650" />
                <label htmlFor="isBest" className="font-semibold text-slate-400 cursor-pointer">Best Seller</label>
              </div>
              <div className="flex items-center gap-1 text-xs ml-4">
                <input type="checkbox" id="isFeat" checked={prodIsFeatured} onChange={(e) => setProdIsFeatured(e.target.checked)} className="accent-purple-650" />
                <label htmlFor="isFeat" className="font-semibold text-slate-400 cursor-pointer">Featured</label>
              </div>
            </div>

            <div className="flex gap-3 border-t border-white/10 pt-4">
              <button type="button" onClick={() => setActiveModal('none')} className="w-full border border-white/10 py-2.5 rounded-full text-xs font-bold text-slate-400 hover:text-white uppercase bg-slate-900">
                Cancel
              </button>
              <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-full text-xs font-bold uppercase">
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. EDIT PRODUCT MODAL */}
      {activeModal === 'edit_product' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fade-in" onClick={() => setActiveModal('none')}></div>
          <form onSubmit={handleEditProductSubmit} className="relative bg-[#0b0c16]/90 border border-purple-500/20 max-w-2xl w-full p-6 sm:p-8 rounded-[32px] shadow-2xl animate-fade-in space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-playfair text-xl font-bold text-white">Edit Product</h3>
              <button type="button" onClick={() => setActiveModal('none')} className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-white/10 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Product Name</label>
                <input type="text" required value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Regular Price (৳)</label>
                <input type="number" required value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Sale Price (৳ - Optional)</label>
                <input type="number" value={prodSalePrice} onChange={(e) => setProdSalePrice(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">SKU</label>
                <input type="text" required value={prodSku} onChange={(e) => setProdSku(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Total Stock</label>
                <input type="number" required value={prodStock} onChange={(e) => setProdStock(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500" />
              </div>

              {/* Upload field */}
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase block">Product Thumbnail Image</label>
                <div className="flex gap-3 items-center">
                  <input type="text" required placeholder="Image URL or upload" value={prodThumbnail} onChange={(e) => setProdThumbnail(e.target.value)} className="flex-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500" />
                  <label className="bg-slate-900 border border-white/10 hover:border-purple-500/35 hover:bg-purple-955/20 text-purple-400 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'thumbnail')} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Short Description</label>
                <input type="text" required value={prodShortDesc} onChange={(e) => setProdShortDesc(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Description</label>
                <textarea rows={2} required value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500" />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Category</label>
                <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 select-dark">
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Variants builder */}
            <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl text-left space-y-3">
              <h4 className="font-bold text-purple-400 text-xs uppercase tracking-wider">Product Variants (Optional)</h4>
              
              <div className="grid grid-cols-5 gap-2 items-end">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-bold">Size</label>
                  <select value={varSize} onChange={(e) => setVarSize(e.target.value)} className="w-full px-2 py-1.5 bg-slate-955 border border-white/10 rounded text-[11px] text-white">
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] text-slate-400 uppercase font-bold">Color Name</label>
                  <input type="text" placeholder="Pink / Peach" value={varColorName} onChange={(e) => setVarColorName(e.target.value)} className="w-full px-2 py-1 bg-slate-955 border border-white/10 rounded text-[11px] text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-bold">Color Hex</label>
                  <input type="color" value={varColorHex} onChange={(e) => setVarColorHex(e.target.value)} className="w-full h-7 p-0.5 bg-slate-955 border border-white/10 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-bold">Stock</label>
                  <input type="number" value={varStock} onChange={(e) => setVarStock(e.target.value)} className="w-full px-2 py-1 bg-slate-955 border border-white/10 rounded text-[11px] text-white" />
                </div>
              </div>
              <button type="button" onClick={handleAddVariantItem} className="bg-slate-955 hover:bg-purple-955/20 text-purple-400 border border-purple-500/20 px-4 py-2 rounded-lg text-xs font-bold w-full uppercase tracking-wider mt-2">
                Add Variant to Product
              </button>

              {/* Added variants lists */}
              {prodVariants.length > 0 && (
                <div className="divide-y divide-white/5 max-h-32 overflow-y-auto bg-slate-955 border border-white/10 rounded-xl mt-3 p-2 text-xs">
                  {prodVariants.map((item, idx) => (
                    <div key={idx} className="py-2 flex justify-between items-center text-slate-300">
                      <span>Size: {item.size} | Color: {item.colorName} ({item.colorHex}) | Stock: {item.stock}</span>
                      <button type="button" onClick={() => handleRemoveVariantItem(idx)} className="text-rose-400 font-bold hover:underline">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <div className="flex items-center gap-1 text-xs">
                <input type="checkbox" id="isNew" checked={prodIsNew} onChange={(e) => setProdIsNew(e.target.checked)} className="accent-purple-650" />
                <label htmlFor="isNew" className="font-semibold text-slate-400 cursor-pointer">New Arrival</label>
              </div>
              <div className="flex items-center gap-1 text-xs ml-4">
                <input type="checkbox" id="isBest" checked={prodIsBest} onChange={(e) => setProdIsBest(e.target.checked)} className="accent-purple-650" />
                <label htmlFor="isBest" className="font-semibold text-slate-400 cursor-pointer">Best Seller</label>
              </div>
              <div className="flex items-center gap-1 text-xs ml-4">
                <input type="checkbox" id="isFeat" checked={prodIsFeatured} onChange={(e) => setProdIsFeatured(e.target.checked)} className="accent-purple-650" />
                <label htmlFor="isFeat" className="font-semibold text-slate-400 cursor-pointer">Featured</label>
              </div>
            </div>

            <div className="flex gap-3 border-t border-white/10 pt-4">
              <button type="button" onClick={() => setActiveModal('none')} className="w-full border border-white/10 py-2.5 rounded-full text-xs font-bold text-slate-400 hover:text-white uppercase bg-slate-900">
                Cancel
              </button>
              <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-full text-xs font-bold uppercase">
                Save Edits
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. ADD CATEGORY MODAL */}
      {activeModal === 'add_category' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fade-in" onClick={() => setActiveModal('none')}></div>
          <form onSubmit={handleAddCategorySubmit} className="relative bg-[#0b0c16]/95 border border-purple-500/20 max-w-md w-full p-6 sm:p-8 rounded-[32px] shadow-2xl animate-fade-in space-y-4 text-left">
            <h3 className="font-playfair text-xl font-bold text-white">Add Category</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Category Name</label>
                <input type="text" required value={catName} onChange={(e) => setCatName(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Slug</label>
                <input type="text" value={catSlug} onChange={(e) => setCatSlug(e.target.value)} placeholder="Auto-generated" className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase block">Category Banner Image</label>
                <div className="flex gap-3 items-center">
                  <input type="text" placeholder="Image URL or upload" value={catImage} onChange={(e) => setCatImage(e.target.value)} className="flex-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500" />
                  <label className="bg-slate-900 border border-white/10 hover:border-purple-500/35 hover:bg-purple-955/20 text-purple-400 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'category')} className="hidden" />
                  </label>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Description</label>
                <input type="text" value={catDesc} onChange={(e) => setCatDesc(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Sort Order</label>
                <input type="number" value={catSort} onChange={(e) => setCatSort(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500" />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button type="button" onClick={() => setActiveModal('none')} className="w-full border border-white/10 py-2.5 rounded-full text-xs font-bold text-slate-400 hover:text-white uppercase bg-slate-900">
                Cancel
              </button>
              <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-full text-xs font-bold uppercase">
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. MANAGE ORDER MODAL */}
      {activeModal === 'view_order' && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fade-in" onClick={() => setActiveModal('none')}></div>
          <form onSubmit={handleUpdateOrderStatus} className="relative bg-[#0b0c16]/95 border border-purple-500/20 max-w-lg w-full p-6 sm:p-8 rounded-[32px] shadow-2xl animate-fade-in space-y-5 text-left max-h-[90vh] overflow-y-auto">
            <h3 className="font-playfair text-xl font-bold text-white">Process Order #{selectedItem.orderNumber}</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-light text-slate-400 border-b border-white/10 pb-3">
                <div>
                  <p className="font-semibold text-purple-400 mb-1">Customer Details</p>
                  <p className="text-white">{selectedItem.customer.name}</p>
                  <p>{selectedItem.customer.email}</p>
                  <p>{selectedItem.customer.phone}</p>
                </div>
                <div>
                  <p className="font-semibold text-purple-400 mb-1">Shipping Details</p>
                  <p className="text-white">{selectedItem.shippingAddress.street}</p>
                  <p>{selectedItem.shippingAddress.city}, {selectedItem.shippingAddress.state}</p>
                  <p>{selectedItem.shippingAddress.postalCode}</p>
                </div>
              </div>

              {/* Status selectors */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-400 uppercase block">Order Status</label>
                  <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white">
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="returned">Returned</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-400 uppercase block">Payment Status</label>
                  <select value={orderPayStatus} onChange={(e) => setOrderPayStatus(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white">
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="font-semibold text-slate-400 uppercase block">Courier Tracking Code</label>
                  <input
                    type="text"
                    value={orderTracking}
                    onChange={(e) => setOrderTracking(e.target.value)}
                    placeholder="Enter Tracking Number"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Items Summary list */}
              <div className="max-h-32 overflow-y-auto divide-y divide-white/5 border border-white/10 rounded-xl p-3 bg-slate-950 text-xs">
                <p className="font-bold text-white pb-1">Order Items ({selectedItem.items.length})</p>
                {selectedItem.items.map((item: any, idx: number) => (
                  <div key={idx} className="py-2 flex justify-between text-slate-300">
                    <span>{item.name} {item.variant && `(${item.variant.size}/${item.variant.colorName})`} x {item.quantity}</span>
                    <span className="font-bold text-purple-400">৳{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setActiveModal('none')} className="w-full border border-white/10 py-2.5 rounded-full text-xs font-bold text-slate-400 hover:text-white uppercase bg-slate-900">
                Close
              </button>
              <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-full text-xs font-bold uppercase">
                Save Updates
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. ADD COUPON MODAL */}
      {activeModal === 'add_coupon' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fade-in" onClick={() => setActiveModal('none')}></div>
          <form onSubmit={handleAddCouponSubmit} className="relative bg-[#0b0c16]/95 border border-purple-500/20 max-w-md w-full p-6 sm:p-8 rounded-[32px] shadow-2xl animate-fade-in space-y-4 text-left">
            <h3 className="font-playfair text-xl font-bold text-white">Create Promo Coupon</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1 col-span-2">
                <label className="font-semibold text-slate-400 uppercase">Coupon Code</label>
                <input type="text" required placeholder="SAVE20" value={cpCode} onChange={(e) => setCpCode(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white uppercase focus:outline-none focus:border-purple-500" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-400 uppercase block">Discount Type</label>
                <select value={cpType} onChange={(e) => setCpType(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white select-dark">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (৳)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-400 uppercase">Discount Value</label>
                <input type="number" required value={cpValue} onChange={(e) => setCpValue(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-400 uppercase">Min Order (৳)</label>
                <input type="number" value={cpMinOrder} onChange={(e) => setCpMinOrder(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-400 uppercase">Usage Limit</label>
                <input type="number" value={cpLimit} onChange={(e) => setCpLimit(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-405 uppercase">Start Date</label>
                <input type="date" required value={cpStart} onChange={(e) => setCpStart(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white bg-white" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-405 uppercase">End Date</label>
                <input type="date" required value={cpEnd} onChange={(e) => setCpEnd(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white bg-white" />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button type="button" onClick={() => setActiveModal('none')} className="w-full border border-white/10 py-2.5 rounded-full text-xs font-bold text-slate-400 hover:text-white uppercase bg-slate-900">
                Cancel
              </button>
              <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-full text-xs font-bold uppercase">
                Save Coupon
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. ADD BANNERS MODAL */}
      {activeModal === 'add_banner' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fade-in" onClick={() => setActiveModal('none')}></div>
          <form onSubmit={handleAddBannerSubmit} className="relative bg-[#0b0c16]/95 border border-purple-500/20 max-w-md w-full p-6 sm:p-8 rounded-[32px] shadow-2xl animate-fade-in space-y-4 text-left">
            <h3 className="font-playfair text-xl font-bold text-white">Add Marketing Banner</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-404 uppercase">Banner Title</label>
                <input type="text" required value={bnTitle} onChange={(e) => setBnTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="font-semibold text-slate-404 uppercase">Subtitle</label>
                <input type="text" value={bnSubtitle} onChange={(e) => setBnSubtitle(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="font-semibold text-slate-404 block">Banner Image</label>
                <div className="flex gap-3 items-center">
                  <input type="text" placeholder="Image URL or upload" value={bnImage} onChange={(e) => setBnImage(e.target.value)} className="flex-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500" />
                  <label className="bg-slate-900 border border-white/10 hover:border-purple-500/35 hover:bg-purple-950/20 text-purple-400 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} className="hidden" />
                  </label>
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-404 uppercase">CTA Text</label>
                <input type="text" value={bnCtaText} onChange={(e) => setBnCtaText(e.target.value)} placeholder="Shop Collection" className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="font-semibold text-slate-404 uppercase">CTA Redirect Link</label>
                <input type="text" value={bnCtaLink} onChange={(e) => setBnCtaLink(e.target.value)} placeholder="/shop?category=sale" className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="font-semibold text-slate-404 block">Placement Type</label>
                <select value={bnPlacement} onChange={(e) => setBnPlacement(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white select-dark">
                  <option value="hero">Hero (Homepage Top)</option>
                  <option value="sale">Sale (Middle Promo Banner)</option>
                  <option value="category">Category Card Background</option>
                  <option value="promo">Promo Footer</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button type="button" onClick={() => setActiveModal('none')} className="w-full border border-white/10 py-2.5 rounded-full text-xs font-bold text-slate-400 hover:text-white uppercase bg-slate-900">
                Cancel
              </button>
              <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-full text-xs font-bold uppercase">
                Publish Banner
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
