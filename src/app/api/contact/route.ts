import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Please provide name, email, and message' }, { status: 400 });
    }
    // In production, send email. For now, mock success.
    return NextResponse.json({ success: true, message: 'Your message has been sent!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
