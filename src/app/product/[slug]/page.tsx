'use client';

import React, { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Star, ShoppingBag, Plus, Minus, ArrowLeft, Send } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function ProductDetailPage({
  params: paramsPromise
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const params = use(paramsPromise);
  const { slug } = params;

  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'shipping' | 'reviews'>('description');

  // Reviews states
  const [reviews, setReviews] = useState<any[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Related products
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();

        if (res.ok && data.product) {
          setProduct(data.product);
          setActiveImage(data.product.thumbnail || data.product.images[0]);
          
          // Preselect first size/color if variants exist
          if (data.product.variants && data.product.variants.length > 0) {
            setSelectedSize(data.product.variants[0].size);
            setSelectedColor({
              name: data.product.variants[0].colorName,
              hex: data.product.variants[0].colorHex
            });
          }

          // Fetch reviews
          const revRes = await fetch(`/api/products/${data.product._id}/reviews`);
          const revData = await revRes.json();
          if (revRes.ok) setReviews(revData.reviews || []);

          // Fetch related products
          const relRes = await fetch(`/api/products?category=${data.product.category?.slug}&limit=4`);
          const relData = await relRes.json();
          if (relRes.ok) {
            // Exclude current product from related products
            setRelatedProducts(
              (relData.products || []).filter((p: any) => p._id !== data.product._id)
            );
          }
        } else {
          showToast('Product not found', 'error');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [slug, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 font-light text-sm">Loading elegant details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
          <h2 className="font-playfair text-2xl font-bold text-brand-navy">Oops! Dress not found.</h2>
          <Link href="/shop" className="text-brand-coral font-semibold hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Shop Catalog</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate pricing based on current active variant if any
  const matchedVariant = product.variants?.find(
    (v: any) => v.size === selectedSize && v.colorName === selectedColor?.name
  );

  const priceAdjustment = matchedVariant?.priceAdjustment || 0;
  const basePrice = product.salePrice > 0 ? product.salePrice : product.price;
  const originalPrice = product.price;
  
  const displayPrice = basePrice + priceAdjustment;
  const originalDisplayPrice = originalPrice + priceAdjustment;
  const hasDiscount = product.salePrice > 0;
  const stockQuantity = matchedVariant ? matchedVariant.stock : product.stock;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.variants && product.variants.length > 0 && (!selectedSize || !selectedColor)) {
      showToast('Please select size and color variants', 'warning');
      return;
    }

    addToCart({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      thumbnail: product.thumbnail,
      quantity,
      price: product.price,
      salePrice: product.salePrice,
      selectedVariant: matchedVariant
        ? {
            size: matchedVariant.size,
            colorName: matchedVariant.colorName,
            colorHex: matchedVariant.colorHex,
            sku: matchedVariant.sku,
            priceAdjustment: matchedVariant.priceAdjustment
          }
        : undefined
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    handleAddToCart(e);
    router.push('/cart');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('You must be logged in to leave a review', 'warning');
      return;
    }
    if (!newComment.trim()) return;

    try {
      setSubmittingReview(true);
      const res = await fetch(`/api/products/${product._id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: newRating, reviewText: newComment })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Review submitted for moderation!', 'success');
        setNewComment('');
        setNewRating(5);
      } else {
        showToast(data.error || 'Failed to submit review', 'error');
      }
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Extract unique sizes and colors from variants
  const uniqueSizes = Array.from(new Set<string>((product.variants || []).map((v: any) => v.size)));
  const uniqueColors = (product.variants || []).reduce((acc: any[], current: any) => {
    const x = acc.find(item => item.name === current.colorName);
    if (!x) {
      acc.push({ name: current.colorName, hex: current.colorHex });
    }
    return acc;
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-8 font-light">
          <Link href="/" className="hover:text-brand-coral">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-brand-coral">Shop</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link href={`/shop?category=${product.category.slug}`} className="hover:text-brand-coral">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-brand-navy truncate max-w-[150px] font-normal">{product.name}</span>
        </div>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-start">
          {/* Gallery Column */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] w-full rounded-[32px] overflow-hidden bg-brand-pink/20 border border-gray-100 shadow-xs">
              <Image
                src={activeImage || '/placeholder-dress.jpg'}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Gallery Images List */}
            {product.images && product.images.length > 0 && (
              <div className="flex gap-3 overflow-x-auto py-2">
                <button
                  onClick={() => setActiveImage(product.thumbnail)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 bg-brand-pink/20 ${
                    activeImage === product.thumbnail ? 'border-brand-coral' : 'border-transparent'
                  }`}
                >
                  <Image src={product.thumbnail} alt="thumbnail" fill className="object-cover" />
                </button>
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 bg-brand-pink/20 ${
                      activeImage === img ? 'border-brand-coral' : 'border-transparent'
                    }`}
                  >
                    <Image src={img} alt={`gallery-${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
                <span className="text-xs text-gray-500 font-light">({reviews.length} reviews)</span>
              </div>
              <h1 className="font-playfair text-3xl md:text-4xl font-bold text-brand-navy leading-tight">
                {product.name}
              </h1>
              <p className="text-sm text-gray-400 font-light">SKU: {matchedVariant?.sku || product.sku}</p>
            </div>

            {/* Pricing block */}
            <div className="bg-brand-pink/40 p-5 rounded-3xl flex items-center justify-between border border-brand-coral/10">
              <div className="space-y-1">
                <span className="text-xs text-brand-coral uppercase tracking-wider font-semibold">Special Price</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-brand-navy">৳{displayPrice}</span>
                  {hasDiscount && (
                    <span className="text-sm text-gray-400 line-through">৳{originalDisplayPrice}</span>
                  )}
                </div>
              </div>
              {hasDiscount && (
                <div className="bg-brand-coral text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  Save {product.discountPercentage}%
                </div>
              )}
            </div>

            {/* Short Description */}
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-light">
              {product.shortDescription}
            </p>

            {/* Variant Selectors */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4 pt-2">
                {/* Colors Selection */}
                {uniqueColors.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Color: {selectedColor?.name}</span>
                    <div className="flex gap-2.5">
                      {uniqueColors.map((color: any) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color)}
                          className={`w-8 h-8 rounded-full border relative ${
                            selectedColor?.name === color.name ? 'ring-2 ring-brand-coral' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        >
                          {selectedColor?.name === color.name && (
                            <span className="absolute inset-0 rounded-full border-2 border-white"></span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes Selection */}
                {uniqueSizes.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Size: {selectedSize}</span>
                    <div className="flex gap-2">
                      {uniqueSizes.map((sz: any) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
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
                )}
              </div>
            )}

            {/* Quantity Selector and Stock Status */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center border border-gray-200 rounded-xl px-2 py-1 bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 text-gray-400 hover:text-brand-coral"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-semibold text-sm w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 text-gray-400 hover:text-brand-coral"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-sm font-semibold">
                {stockQuantity <= 0 ? (
                  <span className="text-rose-500">Out of Stock</span>
                ) : stockQuantity <= 5 ? (
                  <span className="text-amber-500">Only {stockQuantity} items left!</span>
                ) : (
                  <span className="text-emerald-500">In Stock</span>
                )}
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={stockQuantity <= 0}
                className="w-full bg-brand-navy hover:bg-brand-coral text-white font-semibold py-4 rounded-full shadow-md transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:hover:scale-100"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={handleBuyNow}
                disabled={stockQuantity <= 0}
                className="w-full bg-brand-coral hover:bg-brand-coral-hover text-white font-semibold py-4 rounded-full shadow-md transition-all duration-300 hover:scale-[1.02] disabled:bg-gray-300 disabled:hover:scale-100"
              >
                Buy it Now
              </button>
            </div>

            {/* Wishlist quick toggler */}
            <button
              onClick={() => toggleWishlist(product._id)}
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-coral transition-colors w-full sm:w-auto"
            >
              <Heart className="w-4.5 h-4.5" fill={isInWishlist(product._id) ? "currentColor" : "none"} />
              <span>{isInWishlist(product._id) ? 'Added to Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>
        </div>

        {/* Description, Shipping, Reviews Tabs */}
        <div className="border-t border-gray-100 pt-10 mb-16">
          <div className="flex border-b border-gray-100 gap-8 mb-6 overflow-x-auto text-sm font-semibold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-4 border-b-2 transition-all ${
                activeTab === 'description' ? 'border-brand-coral text-brand-coral font-bold' : 'border-transparent text-gray-400'
              }`}
            >
              Product Description
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`pb-4 border-b-2 transition-all ${
                activeTab === 'shipping' ? 'border-brand-coral text-brand-coral font-bold' : 'border-transparent text-gray-400'
              }`}
            >
              Shipping & Returns
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 border-b-2 transition-all ${
                activeTab === 'reviews' ? 'border-brand-coral text-brand-coral font-bold' : 'border-transparent text-gray-400'
              }`}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          <div className="min-h-[150px] text-sm text-gray-600 font-light leading-relaxed">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <p>{product.description}</p>
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {product.tags.map((t: string) => (
                      <span key={t} className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-brand-navy">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-3">
                <h4 className="font-semibold text-brand-navy">Shipping Policy</h4>
                <p>We offer nationwide delivery in Bangladesh. Regular shipping fee is ৳120. Standard deliveries take 2-4 working days inside Dhaka, and 3-7 working days outside Dhaka. Free shipping on orders over ৳3000.</p>
                <h4 className="font-semibold text-brand-navy pt-2">Return & Exchange</h4>
                <p>Easy 7-day return policy. Unused, unwashed garments with tags intact can be returned at our warehouse or via post. Refund is processed within 7 working days once verification is successful.</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Form to submit review */}
                {user ? (
                  <form onSubmit={handleReviewSubmit} className="bg-brand-pink/30 p-6 rounded-3xl space-y-4 max-w-xl">
                    <h4 className="font-semibold text-brand-navy">Share Your Feedback</h4>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Rating:</span>
                      <div className="flex gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="focus:outline-none"
                          >
                            <Star className={`w-5 h-5 ${star <= newRating ? 'fill-current' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <textarea
                        rows={3}
                        required
                        placeholder="Write your review here... How did it fit? How is the fabric?"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-brand-navy hover:bg-brand-coral text-white px-6 py-2.5 rounded-full text-xs font-semibold shadow-xs flex items-center gap-2"
                    >
                      <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-3xl text-center text-gray-500">
                    Please{' '}
                    <Link href="/login" className="text-brand-coral font-bold hover:underline">
                      log in
                    </Link>{' '}
                    to leave a product review.
                  </div>
                )}

                {/* Reviews List */}
                {reviews.length === 0 ? (
                  <p className="text-gray-500 font-light">No reviews posted yet. Be the first to review this dress!</p>
                ) : (
                  <div className="space-y-6 max-w-2xl">
                    {reviews.map((rev) => (
                      <div key={rev._id} className="border-b border-gray-150 pb-6 flex items-start gap-4">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-brand-pink/60 flex-shrink-0 flex items-center justify-center font-bold text-brand-coral">
                          {rev.userId?.name ? rev.userId.name.charAt(0) : 'U'}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-semibold text-brand-navy text-sm">{rev.userId?.name || 'Anonymous'}</h5>
                            <span className="text-xs text-gray-400 font-light">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex text-amber-400">
                            {[...Array(rev.rating)].map((_, starIdx) => (
                              <Star key={starIdx} className="w-3.5 h-3.5 fill-current" />
                            ))}
                          </div>
                          <p className="text-gray-600 text-sm font-light mt-2">{rev.reviewText}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-gray-100 pt-16">
            <h3 className="font-playfair text-2xl font-bold text-brand-navy mb-8 text-center sm:text-left">
              You May Also Like
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
