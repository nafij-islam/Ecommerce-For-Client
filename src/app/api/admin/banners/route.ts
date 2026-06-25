import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Banner from '@/models/Banner';
import { getUserFromRequest } from '@/lib/auth';

// GET: All banners for admin view
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const payload = getUserFromRequest(req);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const banners = await Banner.find().sort({ sortOrder: 1 }).lean();
    return NextResponse.json({ success: true, banners });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// POST: Add new banner
export async function POST(req: Request) {
  try {
    await dbConnect();
    const nextReq = new NextRequest(req.url, { headers: req.headers });
    const payload = getUserFromRequest(nextReq);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { title, subtitle, imageUrl, ctaText, ctaLink, placement, isActive, sortOrder } = await req.json();

    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Title and image URL are required' }, { status: 400 });
    }

    const banner = await Banner.create({
      title,
      subtitle: subtitle || '',
      imageUrl,
      ctaText: ctaText || '',
      ctaLink: ctaLink || '',
      placement: placement || 'hero',
      isActive: isActive !== false,
      sortOrder: parseInt(sortOrder || '0')
    });

    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
