import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const search = searchParams.get('search') || '';
    const categorySlug = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
    const color = searchParams.get('color') || '';
    const size = searchParams.get('size') || '';
    const sort = searchParams.get('sort') || 'latest';

    // Flags
    const isFeatured = searchParams.get('isFeatured') === 'true';
    const isBestSeller = searchParams.get('isBestSeller') === 'true';
    const isNewArrival = searchParams.get('isNewArrival') === 'true';
    const isOnSale = searchParams.get('isOnSale') === 'true';

    // Build query filter
    const filter: any = { status: 'published' };

    const ids = searchParams.get('ids') || '';
    if (ids) {
      filter._id = { $in: ids.split(',') };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } }
      ];
    }

    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        // Find if category is a parent, and fetch subcategories too
        const subcategories = await Category.find({ parentId: category._id });
        if (subcategories.length > 0) {
          const catIds = [category._id, ...subcategories.map(c => c._id)];
          filter.categoryId = { $in: catIds };
        } else {
          filter.categoryId = category._id;
        }
      } else {
        // Empty match if category not found
        return NextResponse.json({ success: true, products: [], totalPages: 0, totalProducts: 0 });
      }
    }

    if (tag) {
      filter.tags = tag;
    }

    // Price query (accounting for salePrice if it's set and > 0, otherwise base price)
    filter.$or = [
      {
        salePrice: { $gt: 0 },
        $and: [{ salePrice: { $gte: minPrice } }, { salePrice: { $lte: maxPrice } }]
      },
      {
        salePrice: { $eq: 0 },
        $and: [{ price: { $gte: minPrice } }, { price: { $lte: maxPrice } }]
      }
    ];

    if (color) {
      filter['variants.colorName'] = { $regex: `^${color}$`, $options: 'i' };
    }

    if (size) {
      filter['variants.size'] = { $regex: `^${size}$`, $options: 'i' };
    }

    if (isFeatured) filter.isFeatured = true;
    if (isBestSeller) filter.isBestSeller = true;
    if (isNewArrival) filter.isNewArrival = true;
    if (isOnSale) filter.isOnSale = true;

    // Sorting
    let sortQuery: any = { createdAt: -1 };
    if (sort === 'price_low') {
      // Sort by salePrice if present, else price (complex in mongo, we will sort by price for simplicity or salePrice)
      sortQuery = { price: 1 };
    } else if (sort === 'price_high') {
      sortQuery = { price: -1 };
    } else if (sort === 'popular') {
      sortQuery = { isBestSeller: -1, createdAt: -1 };
    }

    // Query execution
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    // Optimized read: select only necessary fields, lean
    const products = await Product.find(filter)
      .select('name slug shortDescription thumbnail price salePrice discountPercentage sku stock status variants tags isFeatured isBestSeller isNewArrival isOnSale categoryId createdAt')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      products,
      totalPages,
      totalProducts,
      currentPage: page
    });
  } catch (error: any) {
    console.warn('Database offline, returning mock products:', error.message);
    const { mockProducts } = require('@/lib/mockData');
    const { searchParams } = new URL(req.url);
    let filtered = [...mockProducts];
    const isNewArrival = searchParams.get('isNewArrival') === 'true';
    const isBestSeller = searchParams.get('isBestSeller') === 'true';
    const isOnSale = searchParams.get('isOnSale') === 'true';
    const categorySlug = searchParams.get('category') || '';
    
    if (isNewArrival) filtered = filtered.filter(p => p.isNewArrival);
    if (isBestSeller) filtered = filtered.filter(p => p.isBestSeller);
    if (isOnSale) filtered = filtered.filter(p => p.isOnSale);
    if (categorySlug) {
      filtered = filtered.filter(p => p.slug.includes(categorySlug) || p.categoryId.includes(categorySlug));
    }

    const limit = parseInt(searchParams.get('limit') || '12');
    filtered = filtered.slice(0, limit);

    return NextResponse.json({
      success: true,
      products: filtered,
      totalPages: 1,
      totalProducts: filtered.length,
      currentPage: 1,
      isOfflineMock: true
    });
  }
}
