import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-semibold tracking-tight text-brand-900">
              Arryona
            </Link>
            <p className="text-sm text-slate-600">
              Connecting verified sellers with shoppers through real business storefronts.
            </p>
            <div className="flex space-x-4">
              {/* Social media links can be added here */}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-slate-900">Shop</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/shops" className="hover:text-brand-700">Explore Shops</Link></li>
              <li><Link href="/products" className="hover:text-brand-700">Browse Products</Link></li>
              <li><Link href="/categories" className="hover:text-brand-700">Categories</Link></li>
              <li><Link href="/admin-login" className="hover:text-brand-700">Admin</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-slate-900">Sell</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/advertise" className="hover:text-brand-700">Start Selling</Link></li>
              <li><Link href="/seller/signup" className="hover:text-brand-700">Seller Signup</Link></li>
              <li><Link href="/seller/login" className="hover:text-brand-700">Seller Login</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-slate-900">Support</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/contact" className="hover:text-brand-700">Contact Us</Link></li>
              <li><Link href="/help" className="hover:text-brand-700">Help Center</Link></li>
              <li><Link href="/terms" className="hover:text-brand-700">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-brand-700">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900">Stay Updated</h3>
            <p className="mt-2 text-sm text-slate-600">Subscribe to our newsletter for the latest products and seller updates.</p>
            <div className="mt-4 flex justify-center">
              <input type="email" placeholder="Enter your email" className="rounded-l-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <button className="rounded-r-lg bg-brand-900 px-4 py-2 text-white hover:bg-brand-700">Subscribe</button>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
          <p>&copy; 2026 Arryona Marketplace. All rights reserved. Made by Dikenna Okose.</p>
        </div>
      </div>
    </footer>
  );
}