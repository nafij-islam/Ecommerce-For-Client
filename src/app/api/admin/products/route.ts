import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { getUserFromRequest } from '@/lib/auth';

// GET: List all products (admin layout, including draft/archived)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const payload = getUserFromRequest(req);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// POST: Add a new product
export async function POST(req: Request) {
  try {
    await dbConnect();
    const nextReq = new NextRequest(req.url, { headers: req.headers });
    const payload = getUserFromRequest(nextReq);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      slug,
      shortDescription,
      description,
      categoryId,
      subcategoryId,
      brand,
      collectionName,
      images,
      thumbnail,
      price,
      salePrice,
      discountPercentage,
      sku,
      stock,
      variants,
      tags,
      status,
      isFeatured,
      isBestSeller,
      isNewArrival,
      isOnSale,
      seoTitle,
      seoDescription,
      metaKeywords
    } = body;

    if (!name || !slug || !sku || !thumbnail || !price) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
    }

    const existingProduct = await Product.findOne({ $or: [{ slug }, { sku }] });
    if (existingProduct) {
      return NextResponse.json({ error: 'Product with this slug or SKU already exists' }, { status: 400 });
    }

    const product = await Product.create({
      name,
      slug: slug.toLowerCase(),
      shortDescription: shortDescription || '',
      description: description || '',
      categoryId,
      subcategoryId: subcategoryId || null,
      brand: brand || '',
      collectionName: collectionName || '',
      images: images || [],
      thumbnail,
      price: parseFloat(price),
      salePrice: salePrice ? parseFloat(salePrice) : 0,
      discountPercentage: discountPercentage ? parseInt(discountPercentage) : 0,
      sku: sku.toUpperCase(),
      stock: parseInt(stock || '0'),
      variants: variants || [],
      tags: tags || [],
      status: status || 'published',
      isFeatured: !!isFeatured,
      isBestSeller: !!isBestSeller,
      isNewArrival: !!isNewArrival,
      isOnSale: !!isOnSale,
      seoTitle: seoTitle || '',
      seoDescription: seoDescription || '',
      metaKeywords: metaKeywords || []
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
