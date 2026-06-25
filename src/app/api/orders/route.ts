import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import { getUserFromRequest } from '@/lib/auth';

// GET: Retrieve current user's orders
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await Order.find({ userId: payload.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// POST: Place a new order
export async function POST(req: Request) {
  try {
    await dbConnect();
    
    // Check if user is logged in
    const nextReq = new NextRequest(req.url, {
      headers: req.headers,
      method: req.method,
      body: req.body
    });
    
    // Parse body
    const bodyText = await req.clone().text();
    const { customer, items, subtotal, discount, shippingFee, total, couponCode, paymentMethod, shippingAddress, notes } = JSON.parse(bodyText);

    if (!customer || !items || items.length === 0 || !shippingAddress) {
      return NextResponse.json({ error: 'Missing order details' }, { status: 400 });
    }

    const payload = getUserFromRequest(nextReq);
    const userId = payload ? payload.userId : undefined;

    // Validate stock and variants
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.name}` }, { status: 400 });
      }

      if (product.status !== 'published') {
        return NextResponse.json({ error: `Product is not available: ${item.name}` }, { status: 400 });
      }

      // If item has a variant, check variant stock
      if (item.variant) {
        const variant = product.variants.find((v) => v.sku === item.variant.sku);
        if (!variant) {
          return NextResponse.json({ error: `Invalid variant for product ${item.name}` }, { status: 400 });
        }
        if (variant.stock < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for ${item.name} (${variant.size}/${variant.colorName})` },
            { status: 400 }
          );
        }
      } else {
        // Check main stock
        if (product.stock < item.quantity) {
          return NextResponse.json({ error: `Insufficient stock for product: ${item.name}` }, { status: 400 });
        }
      }
    }

    // Process Stock Deductions
    for (const item of items) {
      if (item.variant) {
        // Decrement variant stock AND decrement overall product stock
        await Product.updateOne(
          { _id: item.productId, 'variants.sku': item.variant.sku },
          {
            $inc: {
              'variants.$.stock': -item.quantity,
              stock: -item.quantity
            }
          }
        );
      } else {
        // Decrement main stock
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: -item.quantity } }
        );
      }
    }

    // Increment Coupon usedCount if coupon applied
    if (couponCode) {
      await Coupon.updateOne(
        { code: couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } }
      );
    }

    // Generate Order Number
    const orderNumber = `AG-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;

    const order = await Order.create({
      orderNumber,
      userId,
      customer,
      items,
      subtotal,
      discount,
      shippingFee,
      total,
      couponCode,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'unpaid' : 'paid',
      orderStatus: 'pending',
      shippingAddress,
      notes: notes || '',
      trackingCode: ''
    });

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully!',
      orderNumber: order.orderNumber,
      orderId: order._id
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
