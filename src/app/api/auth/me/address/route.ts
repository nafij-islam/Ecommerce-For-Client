import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

// POST: Add new address
export async function POST(req: Request) {
  try {
    await dbConnect();
    const payload = getUserFromRequest(new NextRequest(req.url, { headers: req.headers }));
    
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone, street, city, state, postalCode, country, isDefault } = await req.json();

    if (!name || !phone || !street || !city || !state || !postalCode) {
      return NextResponse.json({ error: 'Missing address fields' }, { status: 400 });
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If setting default, unset other defaults
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // Add new address (if it's the first address, make it default automatically)
    const newAddress = {
      name,
      phone,
      street,
      city,
      state,
      postalCode,
      country: country || 'Bangladesh',
      isDefault: user.addresses.length === 0 ? true : !!isDefault
    };

    user.addresses.push(newAddress as any);
    await user.save();

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// PUT: Edit/Update address default state or address contents
export async function PUT(req: Request) {
  try {
    await dbConnect();
    const payload = getUserFromRequest(new NextRequest(req.url, { headers: req.headers }));
    
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { addressId, isDefault, ...otherFields } = await req.json();

    if (!addressId) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const addrIdx = user.addresses.findIndex((a: any) => a._id.toString() === addressId);
    if (addrIdx === -1) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // If making default, reset others
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
      user.addresses[addrIdx].isDefault = true;
    }

    // Update other fields
    if (Object.keys(otherFields).length > 0) {
      const addr = user.addresses[addrIdx];
      if (otherFields.name) addr.name = otherFields.name;
      if (otherFields.phone) addr.phone = otherFields.phone;
      if (otherFields.street) addr.street = otherFields.street;
      if (otherFields.city) addr.city = otherFields.city;
      if (otherFields.state) addr.state = otherFields.state;
      if (otherFields.postalCode) addr.postalCode = otherFields.postalCode;
      if (otherFields.country) addr.country = otherFields.country;
    }

    await user.save();
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const payload = getUserFromRequest(new NextRequest(req.url, { headers: req.headers }));
    
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get('addressId');

    if (!addressId) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.addresses = user.addresses.filter((a: any) => a._id.toString() !== addressId) as any;
    await user.save();

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
