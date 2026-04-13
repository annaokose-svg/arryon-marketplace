"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOutSeller, signOutCustomer } from '../lib/auth';
import { useAuth } from './AuthProvider';
import SearchBar from './SearchBar';

export default function Navbar() {
  const { seller, customer } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Load cart count from localStorage
    const cart = JSON.parse(localStorage.getItem('arryona_cart') || '[]');
    setCartCount(cart.length);

    // Listen for cart updates
    const handleCartUpdate = (event) => {
      setCartCount(event.detail);
    };
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const handleSellerSignOut = () => {
    signOutSeller();
    router.push('/');
  };

  const handleCustomerSignOut = () => {
    signOutCustomer();
    router.push('/');
  };

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="text-2xl font-semibold tracking-tight text-brand-900">
          Arryona
        </Link>

        <div className="hidden md:block">
          <SearchBar />
        </div>

        <nav className="flex items-center gap-4 text-sm text-slate-700">
          <Link href="/shops" className="hover:text-brand-700">Explore Shops</Link>
          <Link href="/products" className="hover:text-brand-700">Browse Products</Link>
          <Link href="/contact" className="hover:text-brand-700">Contact</Link>
          {!seller && <Link href="/advertise" className="hover:text-brand-700">Advertise</Link>}
          
          {/* Cart Icon */}
          <Link href="/cart" className="relative hover:text-brand-700">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h10a2 2 0 002-2v-3" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 rounded-full bg-brand-900 px-2 py-1 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {seller ? (
            <>
              <Link href="/seller/dashboard" className="hover:text-brand-700">Dashboard</Link>
              <button
                onClick={handleSellerSignOut}
                className="rounded-full bg-slate-600 px-4 py-2 text-white transition hover:bg-slate-500"
              >
                Seller Sign Out
              </button>
            </>
          ) : customer ? (
            <>
              <Link href="/customer/dashboard" className="hover:text-brand-700">Dashboard</Link>
              <Link href="/customer/settings" className="hover:text-brand-700">Settings</Link>
              <button
                onClick={handleCustomerSignOut}
                className="rounded-full bg-brand-900 px-4 py-2 text-white transition hover:bg-brand-700"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/customer/login" className="hover:text-brand-700">Customer Login</Link>
              <Link href="/customer/signup" className="hover:text-brand-700">Sign Up</Link>
            </>
          )}
        </nav>
      </div>

      {/* Mobile search bar */}
      <div className="border-t border-slate-200 px-4 py-3 md:hidden">
        <SearchBar placeholder="Search..." />
      </div>
    </header>
  );
}

