import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import Product from '@/models/Product';
import Banner from '@/models/Banner';
import SiteSettings from '@/models/SiteSettings';
import Coupon from '@/models/Coupon';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await dbConnect();

    // 1. Clear existing collections
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Banner.deleteMany({});
    await SiteSettings.deleteMany({});
    await Coupon.deleteMany({});
    
    // Keep users but make sure default admin and user exist
    const adminEmail = 'admin@antigravity.com';
    const userEmail = 'user@antigravity.com';
    
    await User.deleteMany({ email: { $in: [adminEmail, userEmail] } });

    // 2. Create Users
    const adminPassword = hashPassword('admin123');
    const userPassword = hashPassword('user123');

    await User.create([
      {
        name: 'Admin User',
        email: adminEmail,
        passwordHash: adminPassword,
        role: 'admin',
        addresses: [],
      },
      {
        name: 'Jane Doe',
        email: userEmail,
        passwordHash: userPassword,
        role: 'user',
        addresses: [
          {
            name: 'Jane Doe',
            phone: '+8801711223344',
            street: 'Apt 4B, House 12, Road 5, Dhanmondi',
            city: 'Dhaka',
            state: 'Dhaka',
            postalCode: '1209',
            country: 'Bangladesh',
            isDefault: true,
          }
        ],
      }
    ]);

    // 3. Create Categories
    const maxi = await Category.create({
      name: 'Maxi Dresses',
      slug: 'maxi-dresses',
      description: 'Elegant, floor-skimming maxi dresses for any occasion.',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
      isActive: true,
      sortOrder: 1,
    });

    const cocktail = await Category.create({
      name: 'Cocktail & Party',
      slug: 'cocktail-party',
      description: 'Stunning cocktail, evening, and party dresses.',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80',
      isActive: true,
      sortOrder: 2,
    });

    const summer = await Category.create({
      name: 'Summer & Casual',
      slug: 'summer-casual',
      description: 'Lightweight linen, floral, and sundresses for sunny days.',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80',
      isActive: true,
      sortOrder: 3,
    });

    const satin = await Category.create({
      name: 'Satin & Silk',
      slug: 'satin-silk',
      description: 'Luxurious silk and satin slip dresses.',
      image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&auto=format&fit=crop&q=80',
      isActive: true,
      sortOrder: 4,
    });

    // 4. Create Products
    const productsData = [
      {
        name: 'Seraphina Floral Maxi Dress',
        slug: 'seraphina-floral-maxi-dress',
        shortDescription: 'Flowing pastel floral maxi dress with delicate straps.',
        description: 'Embrace effortless femininity with the Seraphina Floral Maxi Dress. Crafted from breathable chiffon, it features a pastel watercolor floral motif, a sweetheart neckline, adjustable tie straps, and a sweeping tiered skirt that moves beautifully. Fully lined for comfort, this dress is perfect for garden parties, bridal showers, or sunny daytime outings.',
        categoryId: maxi._id,
        brand: 'Antigravity Atelier',
        collectionName: 'Spring Meadow',
        images: [
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
        price: 4500,
        salePrice: 3800,
        discountPercentage: 15,
        sku: 'AG-MAXI-SERA-01',
        stock: 50,
        tags: ['floral', 'maxi', 'chiffon', 'pastel'],
        status: 'published' as const,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true,
        isOnSale: true,
        variants: [
          { size: 'S', colorName: 'Coral Pink', colorHex: '#ff8a80', stock: 15, sku: 'AG-MAXI-SERA-01-S-CP' },
          { size: 'M', colorName: 'Coral Pink', colorHex: '#ff8a80', stock: 20, sku: 'AG-MAXI-SERA-01-M-CP' },
          { size: 'L', colorName: 'Coral Pink', colorHex: '#ff8a80', stock: 15, sku: 'AG-MAXI-SERA-01-L-CP' },
        ],
      },
      {
        name: 'Aurelia Velvet Cocktail Dress',
        slug: 'aurelia-velvet-cocktail-dress',
        shortDescription: 'Sumptuous plush velvet dress in midnight rose.',
        description: 'Make a grand entrance in the Aurelia Velvet Cocktail Dress. Designed with soft, premium stretch velvet, this dress features an elegant off-the-shoulder drape, a subtle side slit, and a form-flattering wrap silhouette. Ideal for evening events, cocktail hours, and festive celebrations.',
        categoryId: cocktail._id,
        brand: 'Antigravity Atelier',
        collectionName: 'Noire Soirée',
        images: [
          'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80',
        price: 5200,
        salePrice: 5200,
        discountPercentage: 0,
        sku: 'AG-COCK-AUR-02',
        stock: 30,
        tags: ['velvet', 'cocktail', 'evening', 'party'],
        status: 'published' as const,
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true,
        isOnSale: false,
        variants: [
          { size: 'S', colorName: 'Midnight Rose', colorHex: '#c2185b', stock: 10, sku: 'AG-COCK-AUR-02-S-MR' },
          { size: 'M', colorName: 'Midnight Rose', colorHex: '#c2185b', stock: 10, sku: 'AG-COCK-AUR-02-M-MR' },
          { size: 'L', colorName: 'Midnight Rose', colorHex: '#c2185b', stock: 10, sku: 'AG-COCK-AUR-02-L-MR' },
        ],
      },
      {
        name: 'Dahlia Linen Sun Dress',
        slug: 'dahlia-linen-sun-dress',
        shortDescription: 'Easy-breezy organic linen dress for warm days.',
        description: 'Perfect for sunshine filled strolls, the Dahlia Linen Sun Dress is woven from premium, breathable organic flax linen. Boasting a relaxed silhouette, useful side pockets, a square neckline, and a classic button-down front. Stay cool and chic wherever you wander.',
        categoryId: summer._id,
        brand: 'Loom & Thread',
        collectionName: 'Sunlit Days',
        images: [
          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop&q=80',
        price: 3200,
        salePrice: 2800,
        discountPercentage: 12,
        sku: 'AG-SUM-DAH-03',
        stock: 40,
        tags: ['linen', 'casual', 'sundress', 'organic'],
        status: 'published' as const,
        isFeatured: false,
        isBestSeller: true,
        isNewArrival: false,
        isOnSale: true,
        variants: [
          { size: 'S', colorName: 'Soft Oat', colorHex: '#efebe9', stock: 15, sku: 'AG-SUM-DAH-03-S-SO' },
          { size: 'M', colorName: 'Soft Oat', colorHex: '#efebe9', stock: 15, sku: 'AG-SUM-DAH-03-M-SO' },
          { size: 'L', colorName: 'Soft Oat', colorHex: '#efebe9', stock: 10, sku: 'AG-SUM-DAH-03-L-SO' },
        ],
      },
      {
        name: 'Eleanor Silk Slip Dress',
        slug: 'eleanor-silk-slip-dress',
        shortDescription: 'Vibrant pure mulberry silk slip dress with cowl neck.',
        description: 'Drape yourself in luxury with the Eleanor Silk Slip Dress. Cut on the bias to hug your curves gracefully, it is spun from pure 19-momme mulberry silk. Features a draped cowl neck, cross-back adjustable straps, and a delicate ankle length. Sleek, timeless, and effortlessly gorgeous.',
        categoryId: satin._id,
        brand: 'Antigravity Atelier',
        collectionName: 'Silken Whispers',
        images: [
          'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&auto=format&fit=crop&q=80',
        price: 6800,
        salePrice: 5800,
        discountPercentage: 14,
        sku: 'AG-SILK-ELE-04',
        stock: 25,
        tags: ['silk', 'slip', 'satin', 'premium'],
        status: 'published' as const,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true,
        isOnSale: true,
        variants: [
          { size: 'S', colorName: 'Champagne Gold', colorHex: '#cfd8dc', stock: 8, sku: 'AG-SILK-ELE-04-S-CG' },
          { size: 'M', colorName: 'Champagne Gold', colorHex: '#cfd8dc', stock: 10, sku: 'AG-SILK-ELE-04-M-CG' },
          { size: 'L', colorName: 'Champagne Gold', colorHex: '#cfd8dc', stock: 7, sku: 'AG-SILK-ELE-04-L-CG' },
        ],
      }
    ];

    await Product.create(productsData);

    // 5. Create Banners
    await Banner.create([
      {
        title: 'Luxe Summer Soirée Collection',
        subtitle: 'Effortless silk, organic linen, and botanical dresses crafted for sunlit moments.',
        imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1600&auto=format&fit=crop&q=80',
        ctaText: 'Shop the Collection',
        ctaLink: '/shop',
        placement: 'hero',
        isActive: true,
        sortOrder: 1,
      },
      {
        title: 'Midseason Radiance Sale',
        subtitle: 'Indulge in our premium selections with up to 30% off. Limited stock available.',
        imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1600&auto=format&fit=crop&q=80',
        ctaText: 'Discover Sale',
        ctaLink: '/shop?onSale=true',
        placement: 'sale',
        isActive: true,
        sortOrder: 2,
      }
    ]);

    // 6. Create Coupons
    await Coupon.create([
      {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 2000,
        maxDiscount: 500,
        usageLimit: 500,
        usedCount: 0,
        perUserLimit: 1,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2027-12-31'),
        isActive: true,
      },
      {
        code: 'LAVISH500',
        discountType: 'fixed',
        discountValue: 500,
        minOrderAmount: 5000,
        maxDiscount: 500,
        usageLimit: 100,
        usedCount: 0,
        perUserLimit: 1,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2027-12-31'),
        isActive: true,
      }
    ]);

    // 7. Create SiteSettings
    await SiteSettings.create({
      storeName: 'Rongher Chua Butiks',
      logoUrl: '/logo.png',
      faviconUrl: '',
      contactEmail: 'hello@rongherchuabutiks.com',
      phone: '+8801711002233',
      address: 'House 45, Road 11, Banani, Dhaka, Bangladesh',
      socialLinks: {
        facebook: 'https://facebook.com/rongherchuabutiks',
        instagram: 'https://instagram.com/rongherchuabutiks',
        pinterest: 'https://pinterest.com/rongherchuabutiks',
        youtube: '',
        twitter: '',
      },
      deliveryCharge: 100,
      freeDeliveryMinAmount: 4000,
      announcementText: 'Complimentary standard shipping on all orders over ৳4000',
      footerText: '© 2026 Rongher Chua Butiks. Crafted with luxury, style, and care.',
      returnPolicy: 'We accept returns within 7 days in original, unworn condition with tags intact.',
      privacyPolicy: 'We utilize industry-standard secure socket layer (SSL) encryption to protect your data.',
      terms: 'Payments can be completed via Cash on Delivery or Secure SSL Sandbox. Terms apply.',
    });

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with default admin, user, categories, products, banners, coupons, and site settings.',
    });
  } catch (error: any) {
    console.error('Seed Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
