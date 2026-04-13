"use client";

import Link from 'next/link';

export default function AdvertisePage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-4xl">
        {/* Hero Section */}
        <div className="text-center">
          <span className="inline-flex rounded-full bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-900">
            Start Selling Today
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Join Arryona as a Seller
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Create your professional storefront, showcase your products with rich media, and connect with customers who are ready to buy.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Professional Storefront</h3>
            <p className="mt-2 text-sm text-slate-600">
              Build a stunning online store with your branding, business details, and media-rich product showcases.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Reach Customers</h3>
            <p className="mt-2 text-sm text-slate-600">
              Connect with verified shoppers browsing our marketplace. Your products are visible to everyone.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Easy Management</h3>
            <p className="mt-2 text-sm text-slate-600">
              Manage your products, track performance, and grow your business with our seller dashboard.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 rounded-3xl bg-gradient-to-r from-brand-600 to-brand-700 p-12 text-center text-white">
          <h2 className="text-3xl font-semibold">Ready to Start Selling?</h2>
          <p className="mt-4 text-lg opacity-90">
            Join thousands of sellers already growing their business on Arryona.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/seller/signup"
              className="rounded-full bg-white px-8 py-4 text-lg font-semibold text-brand-600 transition hover:bg-slate-50"
            >
              Create Your Store
            </Link>
            <Link
              href="/seller/login"
              className="rounded-full border border-white px-8 py-4 text-lg font-semibold text-white transition hover:bg-white hover:text-brand-600"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-600">
            Already have an account? <Link href="/seller/login" className="text-brand-700 hover:text-brand-900">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}