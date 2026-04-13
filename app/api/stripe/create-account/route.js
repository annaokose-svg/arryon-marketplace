import { NextResponse } from 'next/server';
import stripe from '../../../../lib/stripe';

export async function POST(request) {
  try {
    const { email, businessName, country } = await request.json();

    // Create a Stripe connected account
    const account = await stripe.accounts.create({
      type: 'express',
      country: country || 'US',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual', // or 'company' based on user input
      metadata: {
        businessName,
      },
    });

    // Generate account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/seller/dashboard`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/seller/dashboard`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });
  } catch (error) {
    console.error('Stripe account creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}