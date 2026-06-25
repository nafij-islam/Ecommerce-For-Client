import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select('name slug description image parentId isActive sortOrder')
      .lean();
    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.warn('Database offline, returning mock categories:', error.message);
    const { mockCategories } = require('@/lib/mockData');
    return NextResponse.json({ success: true, categories: mockCategories, isOfflineMock: true });
  }
}
