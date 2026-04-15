import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section className="space-y-8">
            <span className="inline-flex rounded-full bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-900">
              Arryona Marketplace
            </span>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
              Build a verified seller presence with a real public storefront.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Arryona helps independent UK merchants launch an online store, accept secure payments, and showcase products with business details and media-rich profiles.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="rounded-full bg-brand-900 px-6 py-3 text-white transition hover:bg-brand-700">
                Browse Marketplace
              </Link>
              <Link href="/seller/signup" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-slate-900 transition hover:border-brand-700">
                Start Selling
              </Link>
            </div>
          </section>

          <section className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">Verified selling made simple</p>
              <h2 className="text-2xl font-semibold text-slate-900">Secure payouts and reliable business storefronts</h2>
              <p className="text-slate-600">
                Sellers can build their online presence, accept customer payments, and manage product listings from one easy-to-use marketplace.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-6">
                <p className="text-sm font-semibold text-slate-900">Public storefronts</p>
                <p className="mt-2 text-sm text-slate-600">Every seller page is publicly viewable and not password-protected.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-6">
                <p className="text-sm font-semibold text-slate-900">UK business friendly</p>
                <p className="mt-2 text-sm text-slate-600">Ideal for sole traders and independent businesses registered in the United Kingdom.</p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-24 grid gap-12 lg:grid-cols-3">
          <div className="rounded-[32px] bg-white p-10 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Business name</h3>
            <p className="mt-4 text-slate-600">Arryona Marketplace</p>
          </div>
          <div className="rounded-[32px] bg-white p-10 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">What we offer</h3>
            <p className="mt-4 text-slate-600">A public storefront platform for sellers, buyer discovery, and checkout-ready listings.</p>
          </div>
          <div className="rounded-[32px] bg-white p-10 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Contact</h3>
            <p className="mt-4 text-slate-600">support@arryona.com</p>
          </div>
        </section>

        <section className="mt-24 rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold text-slate-900">A public business website for live marketplace launch</h2>
              <p className="mt-4 text-slate-600">
                This site is designed to be live, public, and ready to support online sales with a business name, contact details, and storefront links.
              </p>
              <ul className="mt-8 space-y-4 text-slate-600">
                <li>• Publicly viewable business landing page</li>
                <li>• Marketplace navigation for customers and sellers</li>
                <li>• Live payment-ready listings for buyer checkout</li>
              </ul>
            </div>
            <div className="space-y-6 rounded-3xl bg-brand-50 p-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">Built for</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">UK sole traders</p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">Live domain</p>
                <p className="mt-2 text-xl text-slate-900">Use your production domain here once deployed.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-24 rounded-[32px] bg-slate-900 px-10 py-12 text-white shadow-xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-300">Ready to deploy</p>
              <h2 className="mt-4 text-3xl font-semibold">Deploy to a public domain for live verification</h2>
            </div>
            <div className="space-y-4">
              <p className="text-slate-200">This site can be deployed to a hosting provider such as Netlify or Vercel. Once live, customers can discover your storefront and make purchases.</p>
              <Link href="/products" className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                View Marketplace
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
