import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SiteSettings from '@/models/SiteSettings';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const nextReq = new NextRequest(req.url, { headers: req.headers });
    const payload = getUserFromRequest(nextReq);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create(body);
    } else {
      settings = await SiteSettings.findByIdAndUpdate(settings._id, { $set: body }, { new: true });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
