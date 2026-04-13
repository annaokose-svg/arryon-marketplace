# Arryona Marketplace

A Next.js storefront platform built to support real seller businesses, public shops, and authenticated seller dashboards.

## Features
- Public shop listings and shop detail pages
- Seller onboarding with business profile, media uploads, and storefront assets
- Local JSON persistence for sellers and products
- Local auth state for seller login
- Tailwind CSS UI styling

## Local setup
1. Install dependencies:

```bash
npm install
```

2. Run development server:

```bash
npm run dev
```

3. Open `http://localhost:3000` and register a seller locally.

```

## Local development
- This project now uses a local JSON backend in `data/db.json` for seller and product persistence.
- No Firebase setup is required for local testing.
- All pages and forms work locally through Next.js API routes.

## Production deployment
- The root homepage is now a public business landing page suitable for Stripe verification.
- Deploy to a public hosting provider such as Netlify or Vercel.
- Use `npm run build` to build the app and `npm start` to run it in production.
- Set your production domain in `.env.production` as `NEXT_PUBLIC_BASE_URL=https://your-production-domain.com`.

## Netlify deployment
- This local data backend is intended for development only.
- If you deploy to Netlify, you will need to replace the local JSON persistence with a production backend such as Firebase, Supabase, or a custom database.
- Set build command to `npm run build`.
- Set publish directory to `.next`.

## Notes
- Seller shops are publicly accessible at `/shop/[sellerId]`.
- Seller dashboard routes use local auth state stored in browser localStorage.
- Local JSON persistence is stored in `data/db.json` and only works on your local machine.
