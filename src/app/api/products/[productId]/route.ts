import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Category from '@/models/Category';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    await dbConnect();
    const { productId } = await params;

    const isId = mongoose.isValidObjectId(productId);
    const query = isId ? { _id: productId } : { slug: productId };

    const product = await Product.findOne({ ...query, status: 'published' }).lean();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const category = await Category.findById(product.categoryId).select('name slug').lean();

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        category
      }
    });
  } catch (error: any) {
    console.warn('Database offline, returning mock product:', error.message);
    const { productId } = await params;
    const { mockProducts, mockCategories } = require('@/lib/mockData');
    const product = mockProducts.find((p: any) => p._id === productId || p.slug === productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    const category = mockCategories.find((c: any) => c._id === product.categoryId) || { name: 'Dresses', slug: 'dresses' };
    return NextResponse.json({
      success: true,
      product: {
        ...product,
        category
      },
      isOfflineMock: true
    });
  }
}
