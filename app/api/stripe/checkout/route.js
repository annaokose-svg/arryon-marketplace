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
}import { NextResponse } from 'next/server';
import stripe from '../../../../lib/stripe';
import { getCurrentCustomer } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const { productId, sellerStripeAccountId } = await request.json();

    const customer = getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch product details (assuming you have a function for this)
    // For now, using placeholder data
    const product = {
      id: productId,
      name: 'Sample Product',
      price: 1000, // in cents
      currency: 'usd',
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: product.currency,
            product_data: {
              name: product.name,
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/customer/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${productId}`,
      payment_intent_data: {
        application_fee_amount: Math.round(product.price * 0.1), // 10% platform fee
        transfer_data: {
          destination: sellerStripeAccountId,
        },
      },
      metadata: {
        productId,
        customerId: customer.id,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}