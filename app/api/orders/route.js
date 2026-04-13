import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const sellerId = searchParams.get('sellerId');

    const db = await readDb();
    let orders = db.orders || [];

    if (customerId) {
      orders = orders.filter((order) => order.customerId === customerId);
    }

    if (sellerId) {
      orders = orders.filter((order) =>
        order.items.some((item) => item.sellerId === sellerId)
      );
    }

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Order get error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId, items, shippingAddress, billingAddress, subtotal, tax, shipping, total, paymentMethod, status, cardLast4 } = body;

    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
    }

    const db = await readDb();
    const id = crypto.randomUUID();
    
    // Group items by seller for payment distribution
    const sellerPayments = {};
    items.forEach((item) => {
      if (!sellerPayments[item.sellerId]) {
        sellerPayments[item.sellerId] = {
          sellerId: item.sellerId,
          items: [],
          amount: 0
        };
      }
      sellerPayments[item.sellerId].items.push(item);
      sellerPayments[item.sellerId].amount += (item.price * item.quantity);
    });

    const newOrder = {
      id,
      customerId,
      items,
      shippingAddress: shippingAddress || null,
      billingAddress: billingAddress || null,
      subtotal: Number(subtotal || 0),
      tax: Number(tax || 0),
      shipping: Number(shipping || 0),
      total: Number(total || 0),
      paymentMethod: paymentMethod || 'credit_card',
      cardLast4: cardLast4 || null,
      status: status || 'processing',
      sellerPayments: Object.values(sellerPayments),
      createdAt: new Date().toISOString()
    };

    db.orders = db.orders || [];
    db.orders.push(newOrder);
    await writeDb(db);

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    console.error('Order create error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
