import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 });
    }

    const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

    if (IMGBB_API_KEY) {
      // Create another form data to send to ImgBB
      const imgbbForm = new FormData();
      imgbbForm.append('image', file);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: imgbbForm
      });

      const data = await res.json();

      if (res.ok && data.success) {
        return NextResponse.json({
          success: true,
          url: data.data.url
        });
      } else {
        return NextResponse.json(
          { error: data.error?.message || 'Failed to upload to ImgBB' },
          { status: 500 }
        );
      }
    } else {
      // Fallback: Generate mock URL using a placeholder service or create a base64 Data URL
      // Since storing in public uploads requires filesystem writes, a data URL or placeholder works perfectly
      // Let's create a beautiful mock url using picsum/unsplash or return a base64 string
      const buffer = await file.arrayBuffer();
      const base64Image = Buffer.from(buffer).toString('base64');
      const dataUrl = `data:${file.type};base64,${base64Image}`;

      return NextResponse.json({
        success: true,
        url: dataUrl
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
