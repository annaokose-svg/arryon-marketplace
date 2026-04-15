import Stripe from 'stripe';

let stripe;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} else {
  // For build time when env var is not available
  stripe = null;
}

export async function createCheckoutSession(items, successUrl, cancelUrl) {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const lineItems = items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        images: item.imageUrl ? [item.imageUrl] : [],
      },
      unit_amount: Math.round(item.price * 100), // Stripe expects cents
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

export default stripe;