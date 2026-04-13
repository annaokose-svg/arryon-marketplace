"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAllShops, fetchSellerProducts, getCustomerFavorites, fetchCustomerFavoriteProducts, toggleCustomerFavorite } from '../../../lib/auth';
import { useAuth } from '../../../components/AuthProvider';
import ShopCard from '../../../components/ShopCard';
import ProductCard from '../../../components/ProductCard';

export default function CustomerDashboardPage() {
  const { customer } = useAuth();
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customer) {
      setLoading(false);
      return;
    }

    async function loadData() {
      const shopList = await fetchAllShops();
      setShops(shopList);
      const allProducts = [];
      for (const shop of shopList) {
        const shopProducts = await fetchSellerProducts(shop.id);
        allProducts.push(...shopProducts);
      }
      setProducts(allProducts);
      const favorites = getCustomerFavorites();
      setFavoriteIds(favorites);
      if (favorites.length) {
        const productsFromFavorites = await fetchCustomerFavoriteProducts();
        setFavoriteProducts(productsFromFavorites);
      }
      setLoading(false);
    }
    loadData();
  }, [customer]);

  if (loading) {
    return <div className="container py-14">Loading dashboard…</div>;
  }

  if (!customer) {
    return (
      <div className="container py-14">
        <div className="card text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Customer access required</h1>
          <p className="mt-4 text-slate-600">Please sign in with your customer account to browse and shop.</p>
          <Link href="/customer/login" className="mt-6 inline-flex rounded-full bg-brand-900 px-6 py-3 text-white hover:bg-brand-700">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-14">
      <div className="grid gap-8 xl:grid-cols-[0.55fr_0.45fr]">
        <section className="card">
          <h1 className="text-3xl font-semibold text-slate-900">Welcome back, {customer.name}!</h1>
          <p className="mt-3 text-slate-600">Browse shops, discover products, and manage your favorites.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Link href="/shops" className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5 text-left shadow-sm transition hover:border-brand-700">
              <p className="text-lg font-semibold text-slate-900">Explore Shops</p>
              <p className="mt-2 text-sm text-slate-600">Find new sellers and their products.</p>
            </Link>
            <Link href="/products" className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5 text-left shadow-sm transition hover:border-brand-700">
              <p className="text-lg font-semibold text-slate-900">Browse Products</p>
              <p className="mt-2 text-sm text-slate-600">Search and filter all available items.</p>
            </Link>
            <Link href="/customer/orders" className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5 text-left shadow-sm transition hover:border-brand-700">
              <p className="text-lg font-semibold text-slate-900">Order History</p>
              <p className="mt-2 text-sm text-slate-600">View your past purchases and order details.</p>
            </Link>
            <Link href="/customer/settings" className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5 text-left shadow-sm transition hover:border-brand-700">
              <p className="text-lg font-semibold text-slate-900">Account Settings</p>
              <p className="mt-2 text-sm text-slate-600">Update your profile and preferences.</p>
            </Link>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5 text-left shadow-sm transition hover:border-brand-700 cursor-pointer" onClick={() => document.querySelector('.fixed.bottom-6.right-6 button')?.click()}>
              <p className="text-lg font-semibold text-slate-900">Live Chat Support</p>
              <p className="mt-2 text-sm text-slate-600">Get instant help from our support team.</p>
            </div>
          </div>
        </section>
        <aside className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-slate-900">Recent Shops</h2>
            <p className="mt-3 text-sm text-slate-600">Shops you've viewed recently.</p>
            <div className="mt-4 space-y-3">
              {shops.slice(0, 3).map((shop) => (
                <div key={shop.id} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200"></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{shop.businessName}</p>
                    <p className="text-xs text-slate-600">{shop.category || 'General'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card bg-slate-50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Saved Products</h3>
                <p className="mt-2 text-sm text-slate-600">Your favorite products ready for checkout.</p>
              </div>
              <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase text-brand-700">
                {favoriteProducts.length} saved
              </span>
            </div>
            <div className="mt-4 grid gap-4">
              {favoriteProducts.length ? (
                favoriteProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorite={favoriteIds.includes(product.id)}
                    onToggleFavorite={(id) => {
                      const nextFavorites = toggleCustomerFavorite(id);
                      setFavoriteIds(nextFavorites);
                      setFavoriteProducts((prev) => prev.filter((item) => nextFavorites.includes(item.id)));
                    }}
                  />
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
                  No saved products yet. Add favorites from the product catalog to see them here.
                </div>
              )}
            </div>
          </div>
          <div className="card bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-900">Featured Products</h3>
            <div className="mt-4 grid gap-4">
              {products.slice(0, 2).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favoriteIds.includes(product.id)}
                  onToggleFavorite={(id) => {
                    const nextFavorites = toggleCustomerFavorite(id);
                    setFavoriteIds(nextFavorites);
                  }}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
