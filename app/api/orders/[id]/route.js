import { NextResponse } from 'next/server';
import { readDb } from '../../../../lib/db';

export async function GET(request, { params }) {
  try {
    const db = await readDb();
    const order = (db.orders || []).find((item) => item.id === params.id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Order get by id error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
