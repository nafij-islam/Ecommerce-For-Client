import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Banner from '@/models/Banner';

export async function GET() {
  try {
    await dbConnect();
    const banners = await Banner.find({ isActive: true })
      .sort({ sortOrder: 1 })
      .lean();
    return NextResponse.json({ success: true, banners });
  } catch (error: any) {
    console.warn('Database offline, returning mock banners:', error.message);
    const { mockBanners } = require('@/lib/mockData');
    return NextResponse.json({ success: true, banners: mockBanners, isOfflineMock: true });
  }
}
