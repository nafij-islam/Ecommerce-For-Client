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
  Star
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function AdminConsole() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { showToast } = useToast();

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

  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 font-light text-sm">Authenticating admin account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#fcfbf9]">
      
      {/* Sidebar Navigation */}
      <aside className="w-68 bg-[#0e1629] text-white flex-shrink-0 flex flex-col justify-between hidden md:flex border-r border-white/5">
        <div>
          {/* Logo */}
          <div className="h-24 flex flex-col justify-center px-8 border-b border-white/5">
            <span className="text-[10px] text-[#ff8a80] font-bold tracking-widest uppercase mb-1">Aura & Thread</span>
            <h1 className="font-playfair text-2xl font-bold tracking-tight text-white">Admin Console</h1>
          </div>

          <nav className="p-4 space-y-1.5 text-sm font-medium">
            <button
              onClick={() => setActiveSection('dashboard')}
              className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all ${
                activeSection === 'dashboard' ? 'bg-[#ff8a80] text-white shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4.5 h-4.5" />
              <span>Metrics Overview</span>
            </button>

            <div className="h-px bg-white/5 my-2 mx-3"></div>

            <button
              onClick={() => setActiveSection('products')}
              className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all ${
                activeSection === 'products' ? 'bg-[#ff8a80] text-white shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Shirt className="w-4.5 h-4.5" />
              <span>Products Manager</span>
            </button>

            <button
              onClick={() => setActiveSection('categories')}
              className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all ${
                activeSection === 'categories' ? 'bg-[#ff8a80] text-white shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <FolderTree className="w-4.5 h-4.5" />
              <span>Categories</span>
            </button>

            <button
              onClick={() => setActiveSection('orders')}
              className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all ${
                activeSection === 'orders' ? 'bg-[#ff8a80] text-white shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              <span>Orders Processing</span>
            </button>

            <button
              onClick={() => setActiveSection('customers')}
              className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all ${
                activeSection === 'customers' ? 'bg-[#ff8a80] text-white shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4.5 h-4.5" />
              <span>Customers</span>
            </button>

            <div className="h-px bg-white/5 my-2 mx-3"></div>

            <button
              onClick={() => setActiveSection('coupons')}
              className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all ${
                activeSection === 'coupons' ? 'bg-[#ff8a80] text-white shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Percent className="w-4.5 h-4.5" />
              <span>Coupons Manager</span>
            </button>

            <button
              onClick={() => setActiveSection('reviews')}
              className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all ${
                activeSection === 'reviews' ? 'bg-[#ff8a80] text-white shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageSquare className="w-4.5 h-4.5" />
              <span>Reviews Moderation</span>
            </button>

            <button
              onClick={() => setActiveSection('banners')}
              className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all ${
                activeSection === 'banners' ? 'bg-[#ff8a80] text-white shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <ImageIcon className="w-4.5 h-4.5" />
              <span>Marketing Banners</span>
            </button>

            <button
              onClick={() => setActiveSection('settings')}
              className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all ${
                activeSection === 'settings' ? 'bg-[#ff8a80] text-white shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders className="w-4.5 h-4.5" />
              <span>Site Configuration</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-white/5 text-xs text-white/40 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-[#ff8a80]">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-white/80 font-semibold">{user.name}</p>
              <p className="text-[10px] text-white/40">Active Administrator</p>
            </div>
          </div>
          <button onClick={logout} className="w-full bg-white/5 hover:bg-[#ff8a80] hover:text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all">
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Console</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen bg-[#fcfbf9]">
        
        {/* Topbar */}
        <header className="h-24 bg-white border-b border-brand-pink/20 flex items-center justify-between px-8 flex-shrink-0 shadow-xs">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xs text-[#ff8a80] border border-[#ff8a80]/30 px-4 py-2 rounded-full font-semibold hover:bg-[#ff8a80] hover:text-white transition-all hover:scale-105">
              &larr; View Live Website
            </Link>
            <h2 className="font-playfair text-2xl font-bold text-[#0e1629] capitalize hidden md:block">
              {activeSection}
            </h2>
          </div>

          {/* Search tool for pages */}
          {['products', 'orders', 'customers'].includes(activeSection) && (
            <div className="max-w-xs w-full relative">
              <input
                type="text"
                placeholder={`Search ${activeSection}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4.5 py-2.5 border border-brand-pink/30 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-[#ff8a80] bg-[#fcfbf9]/50"
              />
            </div>
          )}
        </header>

        {/* Dashboard Inner content scroll */}
        <div className="p-8 flex-1">
          
          {/* 1. DASHBOARD OVERVIEW SECTION */}
          {activeSection === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              {/* Metrics Stats Cards */}
              {loadingStats ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl h-32 border border-brand-pink/20 shadow-xs"></div>
                  ))}
                </div>
              ) : stats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1 */}
                  <div className="bg-[#fffefe] p-6 rounded-[32px] border border-brand-pink/20 shadow-xs flex items-center gap-5 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                    <div className="bg-brand-pink/30 p-4 rounded-2xl text-[#ff8a80]">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Revenue</p>
                      <h3 className="text-2xl font-extrabold text-[#0e1629] mt-0.5">৳{stats.totalRevenue}</h3>
                    </div>
                  </div>
                  {/* Card 2 */}
                  <div className="bg-[#fffefe] p-6 rounded-[32px] border border-brand-pink/20 shadow-xs flex items-center gap-5 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                    <div className="bg-brand-pink/30 p-4 rounded-2xl text-[#ff8a80]">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Orders</p>
                      <h3 className="text-2xl font-extrabold text-[#0e1629] mt-0.5">{stats.totalOrders}</h3>
                      <span className="text-[10px] text-[#ff8a80] font-semibold block mt-0.5">{stats.pendingOrders} pending queue</span>
                    </div>
                  </div>
                  {/* Card 3 */}
                  <div className="bg-[#fffefe] p-6 rounded-[32px] border border-brand-pink/20 shadow-xs flex items-center gap-5 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                    <div className="bg-brand-pink/30 p-4 rounded-2xl text-[#ff8a80]">
                      <Shirt className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Products</p>
                      <h3 className="text-2xl font-extrabold text-[#0e1629] mt-0.5">{stats.totalProducts}</h3>
                      {stats.lowStockProducts > 0 && (
                        <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-0.5 mt-0.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{stats.lowStockProducts} low stock alerts</span>
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Card 4 */}
                  <div className="bg-[#fffefe] p-6 rounded-[32px] border border-brand-pink/20 shadow-xs flex items-center gap-5 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                    <div className="bg-brand-pink/30 p-4 rounded-2xl text-[#ff8a80]">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Customers</p>
                      <h3 className="text-2xl font-extrabold text-[#0e1629] mt-0.5">{stats.totalCustomers}</h3>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Recent Orders & Best Sellers Lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders Table */}
                <div className="bg-[#fffefe] p-8 rounded-[36px] border border-brand-pink/20 shadow-xs space-y-6">
                  <h3 className="font-playfair text-xl font-bold text-[#0e1629] border-b border-brand-pink/20 pb-3">Recent Orders</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-gray-400 uppercase tracking-widest border-b border-brand-pink/20 text-[10px]">
                          <th className="py-3">Order Number</th>
                          <th>Customer</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-gray-600">
                        {recentOrders.map((ord) => (
                          <tr key={ord._id} className="hover:bg-[#fcfbf9]/50 transition-colors">
                            <td className="py-4 font-mono font-bold text-[#0e1629]">{ord.orderNumber}</td>
                            <td>{ord.customer.name}</td>
                            <td className="font-bold text-[#0e1629]">৳{ord.total}</td>
                            <td>
                              <span className={`px-3 py-1 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                                ord.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
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
                <div className="bg-[#fffefe] p-8 rounded-[36px] border border-brand-pink/20 shadow-xs space-y-6">
                  <h3 className="font-playfair text-xl font-bold text-[#0e1629] border-b border-brand-pink/20 pb-3">Trending Catalog Items</h3>
                  <div className="divide-y divide-brand-pink/10">
                    {bestSellers.map((item) => (
                      <div key={item._id} className="py-3.5 flex gap-4 items-center text-xs">
                        <div className="relative w-12 h-14 bg-brand-pink/25 rounded-xl overflow-hidden flex-shrink-0 border border-brand-pink/25">
                          <Image src={item.thumbnail} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#0e1629] truncate">{item.name}</p>
                          <p className="text-gray-400 mt-0.5">Price: ৳{item.salePrice || item.price}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full font-bold text-[10px] ${
                            item.stock <= 5 ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-gray-50 text-gray-700 border border-gray-150'
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

          {/* 2. PRODUCTS MANAGER SECTION */}
          {activeSection === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-playfair text-2xl font-bold text-brand-navy">Dress Inventory</h2>
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
                  className="bg-brand-coral hover:bg-brand-coral-hover text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Products Table list */}
              <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-xs">
                {loadingList ? (
                  <div className="p-8 text-center animate-pulse text-gray-400">Loading catalog items...</div>
                ) : products.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 font-light">No products created yet. Add one above!</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600">
                      <thead className="bg-gray-50/50 uppercase tracking-wider text-gray-400 border-b">
                        <tr>
                          <th className="p-4">Product Info</th>
                          <th>SKU</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Flags</th>
                          <th className="text-center p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {products
                          .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((prod) => (
                            <tr key={prod._id} className="hover:bg-gray-50/40">
                              <td className="p-4 flex gap-3 items-center">
                                <div className="relative w-12 h-14 bg-brand-pink/30 rounded-lg overflow-hidden flex-shrink-0">
                                  <Image src={prod.thumbnail} alt={prod.name} fill className="object-cover" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-brand-navy truncate max-w-[200px]">{prod.name}</p>
                                  <p className="text-gray-400 text-[10px]">{prod.slug}</p>
                                </div>
                              </td>
                              <td className="font-mono font-semibold text-brand-navy">{prod.sku}</td>
                              <td className="font-bold">
                                <span>৳{prod.salePrice || prod.price}</span>
                                {prod.salePrice > 0 && <span className="text-[10px] text-gray-400 line-through block">৳{prod.price}</span>}
                              </td>
                              <td>
                                <span className={`font-semibold px-2 py-0.5 rounded-full ${
                                  prod.stock <= 5 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {prod.stock} items
                                </span>
                              </td>
                              <td>
                                <div className="flex flex-wrap gap-1 text-[9px] font-bold">
                                  {prod.isNewArrival && <span className="bg-emerald-500 text-white px-1.5 py-0.5 rounded-md">NEW</span>}
                                  {prod.isBestSeller && <span className="bg-indigo-500 text-white px-1.5 py-0.5 rounded-md">BEST</span>}
                                  {prod.isFeatured && <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded-md">FEAT</span>}
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex gap-2 justify-center">
                                  <button onClick={() => handleEditProductClick(prod)} className="p-2 text-brand-coral hover:bg-brand-pink rounded-xl" title="Edit">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDeleteProduct(prod._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl" title="Delete">
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

          {/* 3. CATEGORIES MANAGER SECTION */}
          {activeSection === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-playfair text-2xl font-bold text-brand-navy">Product Categories</h2>
                <button
                  onClick={() => {
                    setCatName('');
                    setCatSlug('');
                    setCatImage('');
                    setCatDesc('');
                    setActiveModal('add_category');
                  }}
                  className="bg-brand-coral hover:bg-brand-coral-hover text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Category</span>
                </button>
              </div>

              {/* Categories list */}
              <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-xs">
                {loadingList ? (
                  <div className="p-8 text-center animate-pulse text-gray-400">Loading categories...</div>
                ) : categories.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 font-light">No categories created yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600">
                      <thead className="bg-gray-50/50 uppercase tracking-wider text-gray-400 border-b">
                        <tr>
                          <th className="p-4">Category Image</th>
                          <th>Category Name</th>
                          <th>Slug</th>
                          <th>Sort Order</th>
                          <th className="text-center p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {categories.map((cat) => (
                          <tr key={cat._id} className="hover:bg-gray-50/40">
                            <td className="p-4">
                              <div className="relative w-12 h-12 bg-brand-pink/30 rounded-full overflow-hidden border">
                                <Image src={cat.image || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=300'} alt={cat.name} fill className="object-cover" />
                              </div>
                            </td>
                            <td className="font-bold text-brand-navy">{cat.name}</td>
                            <td className="font-mono text-gray-400">{cat.slug}</td>
                            <td className="font-bold text-brand-navy">{cat.sortOrder}</td>
                            <td className="p-4 text-center">
                              <div className="flex gap-2 justify-center">
                                <button onClick={() => handleDeleteCategory(cat._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl" title="Delete">
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

          {/* 4. ORDERS PROCESSING SECTION */}
          {activeSection === 'orders' && (
            <div className="space-y-6">
              <h2 className="font-playfair text-2xl font-bold text-brand-navy">Orders Queue</h2>

              {/* Orders Queue list */}
              <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-xs">
                {loadingList ? (
                  <div className="p-8 text-center animate-pulse text-gray-400">Loading orders queue...</div>
                ) : orders.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 font-light">No orders placed yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600">
                      <thead className="bg-gray-50/50 uppercase tracking-wider text-gray-400 border-b">
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
                      <tbody className="divide-y divide-gray-100">
                        {orders
                          .filter((o) => o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((ord) => (
                            <tr key={ord._id} className="hover:bg-gray-50/40">
                              <td className="p-4 font-mono font-bold text-brand-navy">{ord.orderNumber}</td>
                              <td>
                                <p className="font-bold text-brand-navy">{ord.customer.name}</p>
                                <p className="text-gray-400 text-[10px]">{ord.customer.phone}</p>
                              </td>
                              <td className="font-bold">৳{ord.total}</td>
                              <td>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${
                                  ord.orderStatus === 'delivered'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : ord.orderStatus === 'cancelled'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {ord.orderStatus}
                                </span>
                              </td>
                              <td>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${
                                  ord.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {ord.paymentStatus}
                                </span>
                              </td>
                              <td className="font-mono text-gray-400">{ord.trackingCode || 'No code'}</td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => handleViewOrderClick(ord)}
                                  className="p-2 text-brand-coral hover:bg-brand-pink rounded-xl flex items-center gap-1 mx-auto"
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

          {/* 5. CUSTOMERS LIST SECTION */}
          {activeSection === 'customers' && (
            <div className="space-y-6">
              <h2 className="font-playfair text-2xl font-bold text-brand-navy">Registered Customers</h2>

              <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-xs">
                {loadingList ? (
                  <div className="p-8 text-center animate-pulse text-gray-400">Loading customers...</div>
                ) : customers.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 font-light">No customers found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600">
                      <thead className="bg-gray-50/50 uppercase tracking-wider text-gray-400 border-b">
                        <tr>
                          <th className="p-4">Customer Details</th>
                          <th>Auth Provider</th>
                          <th>Status</th>
                          <th>Signup Date</th>
                          <th className="text-center p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {customers
                          .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((cust) => (
                            <tr key={cust._id} className="hover:bg-gray-50/40">
                              <td className="p-4">
                                <p className="font-bold text-brand-navy">{cust.name}</p>
                                <p className="text-gray-400 text-[10px]">{cust.email}</p>
                              </td>
                              <td className="capitalize font-semibold text-gray-500">{cust.provider}</td>
                              <td>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${
                                  cust.status === 'active' ? 'bg-emerald-100 text-emerald-850' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {cust.status}
                                </span>
                              </td>
                              <td className="text-gray-400">{new Date(cust.createdAt).toLocaleDateString()}</td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => handleToggleCustomerBlock(cust)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 mx-auto border transition-colors ${
                                    cust.status === 'active'
                                      ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                      : 'border-emerald-250 text-emerald-600 hover:bg-emerald-50'
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

          {/* 6. COUPONS MANAGER SECTION */}
          {activeSection === 'coupons' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-playfair text-2xl font-bold text-brand-navy">Discount Coupons</h2>
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
                  className="bg-brand-coral hover:bg-brand-coral-hover text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Coupon</span>
                </button>
              </div>

              {/* Coupons list */}
              <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-xs">
                {loadingList ? (
                  <div className="p-8 text-center animate-pulse text-gray-400">Loading coupons...</div>
                ) : coupons.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 font-light">No coupons created yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600">
                      <thead className="bg-gray-50/50 uppercase tracking-wider text-gray-400 border-b">
                        <tr>
                          <th className="p-4">Code</th>
                          <th>Discount</th>
                          <th>Min Order</th>
                          <th>Usage Limit</th>
                          <th>Active Window</th>
                          <th className="text-center p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {coupons.map((cp) => (
                          <tr key={cp._id} className="hover:bg-gray-50/40">
                            <td className="p-4 font-mono font-bold text-brand-navy tracking-wider">{cp.code}</td>
                            <td className="font-bold text-brand-coral">
                              {cp.discountType === 'percentage' ? `${cp.discountValue}%` : `৳${cp.discountValue}`}
                            </td>
                            <td className="font-bold text-brand-navy">৳{cp.minOrderAmount}</td>
                            <td>
                              <span className="font-semibold text-gray-500">
                                {cp.usedCount} / {cp.usageLimit} used
                              </span>
                            </td>
                            <td className="text-gray-400">
                              {new Date(cp.startDate).toLocaleDateString()} - {new Date(cp.endDate).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-center">
                              <button onClick={() => handleDeleteCoupon(cp._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl" title="Delete">
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

          {/* 7. REVIEWS MODERATION SECTION */}
          {activeSection === 'reviews' && (
            <div className="space-y-6">
              <h2 className="font-playfair text-2xl font-bold text-brand-navy">Reviews Moderation Queue</h2>

              {/* Reviews Queue */}
              <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-xs">
                {loadingList ? (
                  <div className="p-8 text-center animate-pulse text-gray-400">Loading reviews queue...</div>
                ) : reviews.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 font-light">No reviews posted yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600">
                      <thead className="bg-gray-50/50 uppercase tracking-wider text-gray-400 border-b">
                        <tr>
                          <th className="p-4">Product Info</th>
                          <th>Customer</th>
                          <th>Rating</th>
                          <th>Review Text</th>
                          <th>Status</th>
                          <th className="text-center p-4">Moderation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {reviews.map((rev) => (
                          <tr key={rev._id} className="hover:bg-gray-50/40">
                            <td className="p-4">
                              <p className="font-bold text-brand-navy truncate max-w-[120px]">{rev.productId?.name || 'Deleted Dress'}</p>
                            </td>
                            <td>
                              <p className="font-bold text-brand-navy">{rev.userId?.name || 'Anonymous'}</p>
                              <p className="text-gray-400 text-[10px]">{rev.userId?.email}</p>
                            </td>
                            <td className="text-amber-400 font-bold flex items-center gap-0.5 py-4">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>{rev.rating}</span>
                            </td>
                            <td className="max-w-xs truncate font-light text-gray-500">{rev.reviewText}</td>
                            <td>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${
                                rev.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : rev.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
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
                                      className="px-2 py-1 rounded bg-emerald-500 text-white text-[10px] font-bold"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleReviewStatusUpdate(rev._id, 'rejected')}
                                      className="px-2 py-1 rounded bg-rose-500 text-white text-[10px] font-bold"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleDeleteReview(rev._id)}
                                  className="p-1.5 text-gray-400 hover:text-rose-600"
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

          {/* 8. MARKETING BANNERS SECTION */}
          {activeSection === 'banners' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-playfair text-2xl font-bold text-brand-navy">Promotional Banners</h2>
                <button
                  onClick={() => {
                    setBnTitle('');
                    setBnSubtitle('');
                    setBnImage('');
                    setBnCtaText('');
                    setBnCtaLink('');
                    setActiveModal('add_banner');
                  }}
                  className="bg-brand-coral hover:bg-brand-coral-hover text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Banner</span>
                </button>
              </div>

              {/* Banners grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {banners.map((bn) => (
                  <div key={bn._id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs flex flex-col justify-between">
                    <div className="relative aspect-video w-full bg-brand-pink/30">
                      <Image src={bn.imageUrl} alt={bn.title} fill className="object-cover" />
                      <div className="absolute top-4 left-4 bg-brand-navy text-white text-[9px] uppercase font-bold tracking-wider px-3 py-1 rounded-full">
                        Placement: {bn.placement}
                      </div>
                    </div>
                    <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-brand-navy text-base">{bn.title}</h4>
                        <p className="text-gray-500 font-light text-xs">{bn.subtitle}</p>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          bn.isActive ? 'text-emerald-600' : 'text-gray-400'
                        }`}>
                          {bn.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button onClick={() => handleDeleteBanner(bn._id)} className="text-rose-500 hover:text-rose-700 font-bold text-xs uppercase flex items-center gap-1">
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

          {/* 9. SITE CONFIGURATION SECTION */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              <h2 className="font-playfair text-2xl font-bold text-brand-navy">Site Configuration</h2>

              {settings ? (
                <form onSubmit={handleUpdateSettings} className="bg-white p-6 sm:p-8 rounded-[32px] border border-gray-100 space-y-6 max-w-2xl shadow-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Store Name</label>
                      <input
                        type="text"
                        required
                        value={settings.storeName}
                        onChange={(e) => handleSettingsFieldChange('storeName', e.target.value)}
                        className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-gray-50/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact Email</label>
                      <input
                        type="email"
                        required
                        value={settings.contactEmail}
                        onChange={(e) => handleSettingsFieldChange('contactEmail', e.target.value)}
                        className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-gray-50/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</label>
                      <input
                        type="text"
                        required
                        value={settings.phone}
                        onChange={(e) => handleSettingsFieldChange('phone', e.target.value)}
                        className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-gray-50/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Delivery Charge (৳)</label>
                      <input
                        type="number"
                        required
                        value={settings.deliveryCharge}
                        onChange={(e) => handleSettingsFieldChange('deliveryCharge', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-gray-50/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Free Delivery Minimum Amount (৳)</label>
                      <input
                        type="number"
                        required
                        value={settings.freeDeliveryMinAmount}
                        onChange={(e) => handleSettingsFieldChange('freeDeliveryMinAmount', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-gray-50/50"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Announcement Text</label>
                      <input
                        type="text"
                        value={settings.announcementText}
                        onChange={(e) => handleSettingsFieldChange('announcementText', e.target.value)}
                        className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-gray-50/50"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Footer Copyright Text</label>
                      <input
                        type="text"
                        value={settings.footerText}
                        onChange={(e) => handleSettingsFieldChange('footerText', e.target.value)}
                        className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-gray-50/50"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Address Location</label>
                      <input
                        type="text"
                        value={settings.address}
                        onChange={(e) => handleSettingsFieldChange('address', e.target.value)}
                        className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-gray-50/50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-brand-coral hover:bg-brand-coral-hover text-white px-6 py-2.5 rounded-full text-xs font-semibold shadow-xs"
                  >
                    Save Changes
                  </button>
                </form>
              ) : (
                <div className="p-8 bg-white text-center text-gray-400">Loading configurations...</div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* -------------------------------------------------------------
          MODALS / DRAWERS
      ------------------------------------------------------------- */}
      {/* 1. ADD PRODUCT MODAL */}
      {activeModal === 'add_product' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal('none')}></div>
          <form onSubmit={handleAddProductSubmit} className="relative bg-white max-w-2xl w-full p-6 sm:p-8 rounded-[32px] shadow-2xl animate-fade-in space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-playfair text-xl font-bold text-brand-navy">Add New Product</h3>
              <button type="button" onClick={() => setActiveModal('none')} className="text-gray-400 hover:text-brand-coral">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Product Name</label>
                <input type="text" required value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Regular Price (৳)</label>
                <input type="number" required value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Sale Price (৳ - Optional)</label>
                <input type="number" value={prodSalePrice} onChange={(e) => setProdSalePrice(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">SKU</label>
                <input type="text" value={prodSku} onChange={(e) => setProdSku(e.target.value)} placeholder="Auto-generated" className="w-full px-3 py-1.5 border rounded-lg text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Total Stock</label>
                <input type="number" required value={prodStock} onChange={(e) => setProdStock(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs" />
              </div>

              {/* Upload fields */}
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-semibold text-gray-400 uppercase block">Product Thumbnail Image</label>
                <div className="flex gap-3 items-center">
                  <input type="text" required placeholder="Image URL or upload" value={prodThumbnail} onChange={(e) => setProdThumbnail(e.target.value)} className="flex-1 px-3 py-1.5 border rounded-lg text-xs" />
                  <label className="bg-brand-pink text-brand-coral border px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:bg-brand-coral hover:text-white transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'thumbnail')} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Short Description</label>
                <input type="text" required value={prodShortDesc} onChange={(e) => setProdShortDesc(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs" />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Description</label>
                <textarea rows={2} required value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Category</label>
                <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white">
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Tags (comma separated)</label>
                <input type="text" value={prodTags} onChange={(e) => setProdTags(e.target.value)} placeholder="dress, party, summer" className="w-full px-3 py-1.5 border rounded-lg text-xs" />
              </div>
            </div>

            {/* Product Variants builder */}
            <div className="bg-gray-50 p-4 rounded-2xl text-left space-y-3">
              <h4 className="font-bold text-brand-navy text-xs uppercase tracking-wider">Product Variants (Optional)</h4>
              
              <div className="grid grid-cols-5 gap-2 items-end">
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-400 uppercase font-bold">Size</label>
                  <select value={varSize} onChange={(e) => setVarSize(e.target.value)} className="w-full px-2 py-1 border rounded text-[11px] bg-white">
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] text-gray-400 uppercase font-bold">Color Name</label>
                  <input type="text" placeholder="Pink / Peach" value={varColorName} onChange={(e) => setVarColorName(e.target.value)} className="w-full px-2 py-1 border rounded text-[11px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-400 uppercase font-bold">Color Hex</label>
                  <input type="color" value={varColorHex} onChange={(e) => setVarColorHex(e.target.value)} className="w-full h-7 p-0.5 border rounded" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-400 uppercase font-bold">Stock</label>
                  <input type="number" value={varStock} onChange={(e) => setVarStock(e.target.value)} className="w-full px-2 py-1 border rounded text-[11px]" />
                </div>
              </div>
              <button type="button" onClick={handleAddVariantItem} className="bg-brand-pink text-brand-coral border px-4 py-1.5 rounded-lg text-xs font-bold w-full uppercase tracking-wider mt-2">
                Add Variant to Product
              </button>

              {/* Added variants lists */}
              {prodVariants.length > 0 && (
                <div className="divide-y divide-gray-150 max-h-32 overflow-y-auto bg-white border rounded-xl mt-3 p-2 text-xs">
                  {prodVariants.map((item, idx) => (
                    <div key={idx} className="py-2 flex justify-between items-center">
                      <span>Size: {item.size} | Color: {item.colorName} ({item.colorHex}) | Stock: {item.stock}</span>
                      <button type="button" onClick={() => handleRemoveVariantItem(idx)} className="text-rose-500 font-bold hover:underline">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <div className="flex items-center gap-1 text-xs">
                <input type="checkbox" id="isNew" checked={prodIsNew} onChange={(e) => setProdIsNew(e.target.checked)} className="accent-brand-coral" />
                <label htmlFor="isNew" className="font-semibold text-gray-500 cursor-pointer">New Arrival</label>
              </div>
              <div className="flex items-center gap-1 text-xs ml-4">
                <input type="checkbox" id="isBest" checked={prodIsBest} onChange={(e) => setProdIsBest(e.target.checked)} className="accent-brand-coral" />
                <label htmlFor="isBest" className="font-semibold text-gray-500 cursor-pointer">Best Seller</label>
              </div>
              <div className="flex items-center gap-1 text-xs ml-4">
                <input type="checkbox" id="isFeat" checked={prodIsFeatured} onChange={(e) => setProdIsFeatured(e.target.checked)} className="accent-brand-coral" />
                <label htmlFor="isFeat" className="font-semibold text-gray-500 cursor-pointer">Featured</label>
              </div>
            </div>

            <div className="flex gap-3 border-t pt-4">
              <button type="button" onClick={() => setActiveModal('none')} className="w-full border py-2.5 rounded-full text-xs font-bold text-gray-500 uppercase">
                Cancel
              </button>
              <button type="submit" className="w-full bg-brand-coral text-white py-2.5 rounded-full text-xs font-bold uppercase">
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. EDIT PRODUCT MODAL */}
      {activeModal === 'edit_product' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal('none')}></div>
          <form onSubmit={handleEditProductSubmit} className="relative bg-white max-w-2xl w-full p-6 sm:p-8 rounded-[32px] shadow-2xl animate-fade-in space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-playfair text-xl font-bold text-brand-navy">Edit Product</h3>
              <button type="button" onClick={() => setActiveModal('none')} className="text-gray-400 hover:text-brand-coral">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Product Name</label>
                <input type="text" required value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Regular Price (৳)</label>
                <input type="number" required value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Sale Price (৳ - Optional)</label>
                <input type="number" value={prodSalePrice} onChange={(e) => setProdSalePrice(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">SKU</label>
                <input type="text" required value={prodSku} onChange={(e) => setProdSku(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Total Stock</label>
                <input type="number" required value={prodStock} onChange={(e) => setProdStock(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs" />
              </div>

              {/* Upload field */}
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-semibold text-gray-400 uppercase block">Product Thumbnail Image</label>
                <div className="flex gap-3 items-center">
                  <input type="text" required placeholder="Image URL or upload" value={prodThumbnail} onChange={(e) => setProdThumbnail(e.target.value)} className="flex-1 px-3 py-1.5 border rounded-lg text-xs" />
                  <label className="bg-brand-pink text-brand-coral border px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:bg-brand-coral hover:text-white transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'thumbnail')} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Short Description</label>
                <input type="text" required value={prodShortDesc} onChange={(e) => setProdShortDesc(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs" />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Description</label>
                <textarea rows={2} required value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs" />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Category</label>
                <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white">
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Variants builder */}
            <div className="bg-gray-50 p-4 rounded-2xl text-left space-y-3">
              <h4 className="font-bold text-brand-navy text-xs uppercase tracking-wider">Product Variants (Optional)</h4>
              
              <div className="grid grid-cols-5 gap-2 items-end">
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-400 uppercase font-bold">Size</label>
                  <select value={varSize} onChange={(e) => setVarSize(e.target.value)} className="w-full px-2 py-1 border rounded text-[11px] bg-white">
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] text-gray-400 uppercase font-bold">Color Name</label>
                  <input type="text" placeholder="Pink / Peach" value={varColorName} onChange={(e) => setVarColorName(e.target.value)} className="w-full px-2 py-1 border rounded text-[11px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-400 uppercase font-bold">Color Hex</label>
                  <input type="color" value={varColorHex} onChange={(e) => setVarColorHex(e.target.value)} className="w-full h-7 p-0.5 border rounded" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-400 uppercase font-bold">Stock</label>
                  <input type="number" value={varStock} onChange={(e) => setVarStock(e.target.value)} className="w-full px-2 py-1 border rounded text-[11px]" />
                </div>
              </div>
              <button type="button" onClick={handleAddVariantItem} className="bg-brand-pink text-brand-coral border px-4 py-1.5 rounded-lg text-xs font-bold w-full uppercase tracking-wider mt-2">
                Add Variant to Product
              </button>

              {/* Added variants lists */}
              {prodVariants.length > 0 && (
                <div className="divide-y divide-gray-150 max-h-32 overflow-y-auto bg-white border rounded-xl mt-3 p-2 text-xs">
                  {prodVariants.map((item, idx) => (
                    <div key={idx} className="py-2 flex justify-between items-center">
                      <span>Size: {item.size} | Color: {item.colorName} ({item.colorHex}) | Stock: {item.stock}</span>
                      <button type="button" onClick={() => handleRemoveVariantItem(idx)} className="text-rose-500 font-bold hover:underline">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <div className="flex items-center gap-1 text-xs">
                <input type="checkbox" id="isNew" checked={prodIsNew} onChange={(e) => setProdIsNew(e.target.checked)} className="accent-brand-coral" />
                <label htmlFor="isNew" className="font-semibold text-gray-500 cursor-pointer">New Arrival</label>
              </div>
              <div className="flex items-center gap-1 text-xs ml-4">
                <input type="checkbox" id="isBest" checked={prodIsBest} onChange={(e) => setProdIsBest(e.target.checked)} className="accent-brand-coral" />
                <label htmlFor="isBest" className="font-semibold text-gray-500 cursor-pointer">Best Seller</label>
              </div>
              <div className="flex items-center gap-1 text-xs ml-4">
                <input type="checkbox" id="isFeat" checked={prodIsFeatured} onChange={(e) => setProdIsFeatured(e.target.checked)} className="accent-brand-coral" />
                <label htmlFor="isFeat" className="font-semibold text-gray-500 cursor-pointer">Featured</label>
              </div>
            </div>

            <div className="flex gap-3 border-t pt-4">
              <button type="button" onClick={() => setActiveModal('none')} className="w-full border py-2.5 rounded-full text-xs font-bold text-gray-500 uppercase">
                Cancel
              </button>
              <button type="submit" className="w-full bg-brand-coral text-white py-2.5 rounded-full text-xs font-bold uppercase">
                Save Edits
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. ADD CATEGORY MODAL */}
      {activeModal === 'add_category' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal('none')}></div>
          <form onSubmit={handleAddCategorySubmit} className="relative bg-white max-w-md w-full p-6 sm:p-8 rounded-[32px] shadow-2xl animate-fade-in space-y-4 text-left">
            <h3 className="font-playfair text-xl font-bold text-brand-navy">Add Category</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Category Name</label>
                <input type="text" required value={catName} onChange={(e) => setCatName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Slug</label>
                <input type="text" value={catSlug} onChange={(e) => setCatSlug(e.target.value)} placeholder="Auto-generated" className="w-full px-3 py-2 border rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase block">Category Banner Image</label>
                <div className="flex gap-3 items-center">
                  <input type="text" placeholder="Image URL or upload" value={catImage} onChange={(e) => setCatImage(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-xs" />
                  <label className="bg-brand-pink text-brand-coral border px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer hover:bg-brand-coral hover:text-white transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'category')} className="hidden" />
                  </label>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Description</label>
                <input type="text" value={catDesc} onChange={(e) => setCatDesc(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Sort Order</label>
                <input type="number" value={catSort} onChange={(e) => setCatSort(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs" />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button type="button" onClick={() => setActiveModal('none')} className="w-full border py-2.5 rounded-full text-xs font-bold text-gray-500 uppercase">
                Cancel
              </button>
              <button type="submit" className="w-full bg-brand-coral text-white py-2.5 rounded-full text-xs font-bold uppercase">
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. MANAGE ORDER MODAL */}
      {activeModal === 'view_order' && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal('none')}></div>
          <form onSubmit={handleUpdateOrderStatus} className="relative bg-white max-w-lg w-full p-6 sm:p-8 rounded-[32px] shadow-2xl animate-fade-in space-y-5 text-left">
            <h3 className="font-playfair text-xl font-bold text-brand-navy">Process Order #{selectedItem.orderNumber}</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs font-light text-gray-500 border-b pb-3">
                <div>
                  <p className="font-semibold text-brand-navy">Customer Details</p>
                  <p>{selectedItem.customer.name}</p>
                  <p>{selectedItem.customer.email}</p>
                  <p>{selectedItem.customer.phone}</p>
                </div>
                <div>
                  <p className="font-semibold text-brand-navy">Shipping Details</p>
                  <p>{selectedItem.shippingAddress.street}</p>
                  <p>{selectedItem.shippingAddress.city}, {selectedItem.shippingAddress.state}</p>
                  <p>{selectedItem.shippingAddress.postalCode}</p>
                </div>
              </div>

              {/* Status selectors */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-400 uppercase block">Order Status</label>
                  <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white">
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
                  <label className="font-semibold text-gray-400 uppercase block">Payment Status</label>
                  <select value={orderPayStatus} onChange={(e) => setOrderPayStatus(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white">
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="font-semibold text-gray-400 uppercase block">Courier Tracking Code</label>
                  <input
                    type="text"
                    value={orderTracking}
                    onChange={(e) => setOrderTracking(e.target.value)}
                    placeholder="Enter Tracking Number"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Items Summary list */}
              <div className="max-h-32 overflow-y-auto divide-y border rounded-xl p-3 bg-gray-50/50 text-xs">
                <p className="font-bold text-brand-navy pb-1">Order Items ({selectedItem.items.length})</p>
                {selectedItem.items.map((item: any, idx: number) => (
                  <div key={idx} className="py-2 flex justify-between">
                    <span>{item.name} {item.variant && `(${item.variant.size}/${item.variant.colorName})`} x {item.quantity}</span>
                    <span className="font-bold text-brand-navy">৳{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setActiveModal('none')} className="w-full border py-2.5 rounded-full text-xs font-bold text-gray-500 uppercase">
                Close
              </button>
              <button type="submit" className="w-full bg-brand-coral text-white py-2.5 rounded-full text-xs font-bold uppercase">
                Save Processing Updates
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. ADD COUPON MODAL */}
      {activeModal === 'add_coupon' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal('none')}></div>
          <form onSubmit={handleAddCouponSubmit} className="relative bg-white max-w-md w-full p-6 sm:p-8 rounded-[32px] shadow-2xl animate-fade-in space-y-4 text-left">
            <h3 className="font-playfair text-xl font-bold text-brand-navy">Create Promo Coupon</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1 col-span-2">
                <label className="font-semibold text-gray-400 uppercase">Coupon Code</label>
                <input type="text" required placeholder="SAVE20" value={cpCode} onChange={(e) => setCpCode(e.target.value)} className="w-full px-3 py-2 border rounded-lg uppercase" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-400 uppercase block">Discount Type</label>
                <select value={cpType} onChange={(e) => setCpType(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (৳)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-400 uppercase">Discount Value</label>
                <input type="number" required value={cpValue} onChange={(e) => setCpValue(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-400 uppercase">Min Order Amount (৳)</label>
                <input type="number" value={cpMinOrder} onChange={(e) => setCpMinOrder(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-400 uppercase">Usage Limit</label>
                <input type="number" value={cpLimit} onChange={(e) => setCpLimit(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-400 uppercase">Start Date</label>
                <input type="date" required value={cpStart} onChange={(e) => setCpStart(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-400 uppercase">End Date</label>
                <input type="date" required value={cpEnd} onChange={(e) => setCpEnd(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white" />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button type="button" onClick={() => setActiveModal('none')} className="w-full border py-2.5 rounded-full text-xs font-bold text-gray-500 uppercase">
                Cancel
              </button>
              <button type="submit" className="w-full bg-brand-coral text-white py-2.5 rounded-full text-xs font-bold uppercase">
                Save Coupon
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. ADD BANNERS MODAL */}
      {activeModal === 'add_banner' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal('none')}></div>
          <form onSubmit={handleAddBannerSubmit} className="relative bg-white max-w-md w-full p-6 sm:p-8 rounded-[32px] shadow-2xl animate-fade-in space-y-4 text-left">
            <h3 className="font-playfair text-xl font-bold text-brand-navy">Add Marketing Banner</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-400 uppercase">Banner Title</label>
                <input type="text" required value={bnTitle} onChange={(e) => setBnTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="font-semibold text-gray-400 uppercase">Subtitle</label>
                <input type="text" value={bnSubtitle} onChange={(e) => setBnSubtitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="font-semibold text-gray-400 uppercase block">Banner Image</label>
                <div className="flex gap-3 items-center">
                  <input type="text" placeholder="Image URL or upload" value={bnImage} onChange={(e) => setBnImage(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" />
                  <label className="bg-brand-pink text-brand-coral border px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer hover:bg-brand-coral hover:text-white transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} className="hidden" />
                  </label>
                </div>
              </div>
              <div>
                <label className="font-semibold text-gray-400 uppercase">CTA Text</label>
                <input type="text" value={bnCtaText} onChange={(e) => setBnCtaText(e.target.value)} placeholder="Shop Collection" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="font-semibold text-gray-400 uppercase">CTA Redirect Link</label>
                <input type="text" value={bnCtaLink} onChange={(e) => setBnCtaLink(e.target.value)} placeholder="/shop?category=sale" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="font-semibold text-gray-400 uppercase block">Placement Type</label>
                <select value={bnPlacement} onChange={(e) => setBnPlacement(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white">
                  <option value="hero">Hero (Homepage Top)</option>
                  <option value="sale">Sale (Middle Promo Banner)</option>
                  <option value="category">Category Card Background</option>
                  <option value="promo">Promo Footer</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button type="button" onClick={() => setActiveModal('none')} className="w-full border py-2.5 rounded-full text-xs font-bold text-gray-500 uppercase">
                Cancel
              </button>
              <button type="submit" className="w-full bg-brand-coral text-white py-2.5 rounded-full text-xs font-bold uppercase">
                Publish Banner
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
