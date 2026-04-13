import { NextResponse } from 'next/server';
import stripe from '../../../../lib/stripe';
import { createOrder } from '../../../../lib/auth';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        // Create order in database
        await createOrder({
          customerId: session.metadata.customerId,
          items: [
            {
              productId: session.metadata.productId,
              sellerId: 'seller-id', // Need to fetch from product
              name: 'Product Name',
              price: session.amount_total / 100,
              quantity: 1,
            },
          ],
          total: session.amount_total / 100,
          paymentIntentId: session.payment_intent,
          status: 'paid',
          stripeSessionId: session.id,
        });
        break;

      case 'account.updated':
        const account = event.data.object;
        // Update seller account status in database
        console.log('Account updated:', account.id, account.payouts_enabled);
        break;

      case 'transfer.created':
        const transfer = event.data.object;
        console.log('Transfer created:', transfer.id, transfer.amount);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}