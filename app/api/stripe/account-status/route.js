import { NextResponse } from 'next/server';
import stripe from '../../../../lib/stripe';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
    }

    // Retrieve account details
    const account = await stripe.accounts.retrieve(accountId);

    // Check account capabilities and requirements
    const capabilities = account.capabilities || {};
    const requirements = account.requirements || {};

    const status = {
      id: account.id,
      email: account.email,
      country: account.country,
      businessType: account.business_type,
      capabilities: {
        cardPayments: capabilities.card_payments?.status,
        transfers: capabilities.transfers?.status,
      },
      requirements: {
        currentlyDue: requirements.currently_due || [],
        eventuallyDue: requirements.eventually_due || [],
        pendingVerification: requirements.pending_verification || [],
      },
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    };

    return NextResponse.json({ status });
  } catch (error) {
    console.error('Stripe account status error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}