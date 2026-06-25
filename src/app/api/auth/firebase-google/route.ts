import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, avatarUrl, firebaseUid } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: 'Missing user details' }, { status: 400 });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create user if not exists
      user = await User.create({
        name,
        email: email.toLowerCase(),
        avatarUrl: avatarUrl || '',
        role: 'user',
        status: 'active',
        provider: 'google',
        firebaseUid,
        emailVerified: true,
        addresses: []
      });
    } else {
      if (user.status === 'blocked') {
        return NextResponse.json({ error: 'Your account is blocked.' }, { status: 403 });
      }

      // If user exists, update details
      if (firebaseUid && !user.firebaseUid) {
        user.firebaseUid = firebaseUid;
        user.provider = 'google';
        await user.save();
      }
    }

    const token = generateToken({
      userId: user._id.toString() as string,
      email: user.email,
      role: user.role
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl
      }
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
