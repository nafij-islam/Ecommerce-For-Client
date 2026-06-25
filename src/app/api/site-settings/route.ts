import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SiteSettings from '@/models/SiteSettings';

export async function GET() {
  try {
    await dbConnect();
    let settings = await SiteSettings.findOne().lean();
    if (!settings) {
      // Create default settings if not exists
      settings = await SiteSettings.create({
        storeName: 'Rongher Chua Butiks',
        logoUrl: '/logo.png',
        announcementText: 'Free delivery on orders over ৳3000',
        footerText: '© 2026 Rongher Chua Butiks. All Rights Reserved.',
        phone: '+8801700000000',
        contactEmail: 'contact@rongherchuabutiks.com',
        address: 'Dhaka, Bangladesh',
        deliveryCharge: 120,
        freeDeliveryMinAmount: 3000,
        returnPolicy: 'Easy 7-day returns on all unwashed dresses.',
        privacyPolicy: 'Your privacy is protected with SSL encryption.',
        terms: 'Standard e-commerce terms & conditions apply.'
      });
    }
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.warn('Database offline, returning mock settings:', error.message);
    const { mockSiteSettings } = require('@/lib/mockData');
    return NextResponse.json({ success: true, settings: mockSiteSettings, isOfflineMock: true });
  }
}
