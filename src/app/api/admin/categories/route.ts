import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import { getUserFromRequest } from '@/lib/auth';

// GET: All categories (including inactive)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const payload = getUserFromRequest(req);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const categories = await Category.find().sort({ sortOrder: 1, name: 1 }).lean();
    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// POST: Add new category
export async function POST(req: Request) {
  try {
    await dbConnect();
    const nextReq = new NextRequest(req.url, { headers: req.headers });
    const payload = getUserFromRequest(nextReq);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { name, slug, description, image, parentId, isActive, sortOrder } = await req.json();

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 400 });
    }

    const category = await Category.create({
      name,
      slug: slug.toLowerCase(),
      description: description || '',
      image: image || '',
      parentId: parentId || null,
      isActive: isActive !== false,
      sortOrder: parseInt(sortOrder || '0')
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
