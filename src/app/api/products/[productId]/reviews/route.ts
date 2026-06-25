import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Review from '@/models/Review';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    await dbConnect();
    const { productId } = await params;

    const reviews = await Review.find({ productId, status: 'approved' })
      .populate('userId', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    await dbConnect();
    const { productId } = await params;
    const payload = getUserFromRequest(req);

    if (!payload) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { rating, reviewText, images } = await req.json();

    if (!rating || !reviewText) {
      return NextResponse.json({ error: 'Please provide rating and review text' }, { status: 400 });
    }

    const review = await Review.create({
      productId,
      userId: payload.userId,
      rating: parseInt(rating),
      reviewText,
      images: images || [],
      status: 'pending', // Needs admin approval by default
      isFeatured: false
    });

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully! It is pending moderation.',
      review
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
