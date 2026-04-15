import { NextResponse } from 'next/server';
import { createCheckoutSession } from '../../../../lib/stripe';

export async function POST(request) {
  try {
    const { items } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout`;

    const session = await createCheckoutSession(items, successUrl, cancelUrl);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
