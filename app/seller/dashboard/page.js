"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchSellerProducts, fetchShopById, fetchSellerOrders } from '../../../lib/auth';
import { useAuth } from '../../../components/AuthProvider';

export default function SellerDashboardPage() {
  const { seller } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const totalValue = products.reduce((sum, product) => sum + Number(product.price || 0), 0);
  const totalViews = products.reduce((sum, product) => sum + Number(product.views || 0), 0);
  const totalStock = products.reduce((sum, product) => sum + Number(product.stock || 0), 0);
  const lowStockCount = products.filter((product) => Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 3).length;
  const categoryBreakdown = products.reduce((acc, product) => {
    const category = product.category || 'General';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  const revenueEarned = orders.reduce((sum, order) => {
    const sellerItems = order.items.filter((item) => item.sellerId === seller?.id);
    return sum + sellerItems.reduce((subtotal, item) => subtotal + Number(item.price || 0) * Number(item.quantity || 1), 0);
  }, 0);
  const videoStatus = seller?.media?.videoUrl ? 'Live storefront video' : 'No promo video uploaded';
  const bankStatus = seller?.bankDetails?.accountNumber ? 'Bank account connected' : 'Bank details not set';

  useEffect(() => {
    if (!seller) {
      setLoading(false);
      return;
    }

    // Fetch full seller data including media, bank details, and orders
    Promise.all([
      fetchShopById(seller.id),
      fetchSellerProducts(seller.id),
      fetchSellerOrders(seller.id)
    ]).then(([fullSeller, sellerProducts, sellerOrders]) => {
      setProducts(sellerProducts);
      setOrders(sellerOrders);
      setLoading(false);
    });
  }, [seller]);

  if (loading) {
    return <div className="container py-14">Loading dashboard…</div>;
  }

  if (!seller) {
    return (
      <div className="container py-14">
        <div className="card text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Seller access required</h1>
          <p className="mt-4 text-slate-600">Please sign in with your seller account to manage your shop.</p>
          <Link href="/seller/login" className="mt-6 inline-flex rounded-full bg-brand-900 px-6 py-3 text-white hover:bg-brand-700">
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
          <h1 className="text-3xl font-semibold text-slate-900">Seller dashboard</h1>
          <p className="mt-3 text-slate-600">Welcome back, {seller.businessName}. Manage your products, performance, and storefront media here.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Link href="/seller/products" className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5 text-left shadow-sm transition hover:border-brand-700">
              <p className="text-lg font-semibold text-slate-900">Products</p>
              <p className="mt-2 text-sm text-slate-600">Manage listings, inventory, and pricing.</p>
            </Link>
            <Link href="/seller/add-product" className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5 text-left shadow-sm transition hover:border-brand-700">
              <p className="text-lg font-semibold text-slate-900">Add product</p>
              <p className="mt-2 text-sm text-slate-600">Create a new listing with image and details.</p>
            </Link>
            <Link href="/seller/shop-settings" className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5 text-left shadow-sm transition hover:border-brand-700">
              <p className="text-lg font-semibold text-slate-900">Shop settings</p>
              <p className="mt-2 text-sm text-slate-600">Edit your storefront, design details, and public profile.</p>
            </Link>
            <Link href="/seller/products" className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5 text-left shadow-sm transition hover:border-brand-700">
              <p className="text-lg font-semibold text-slate-900">Design products</p>
              <p className="mt-2 text-sm text-slate-600">Update pricing, categories, and product media.</p>
            </Link>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5 text-left shadow-sm transition hover:border-brand-700 cursor-pointer" onClick={() => document.querySelector('.fixed.bottom-6.right-6 button')?.click()}>
              <p className="text-lg font-semibold text-slate-900">Live Chat Support</p>
              <p className="mt-2 text-sm text-slate-600">Get instant help from our support team.</p>
            </div>
          </div>
        </section>
        <aside className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-slate-900">Shop preview</h2>
            <p className="mt-3 text-sm text-slate-600">Your shop is publicly visible at /shop/{seller.id}.</p>
          </div>
          <div className="card bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-900">Performance</h3>
            <div className="mt-5 grid gap-4">
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Active listings</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{products.length}</p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Catalog revenue potential</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">${totalValue.toFixed(2)}</p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total product views</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{totalViews}</p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total stock available</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{totalStock}</p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Low stock alerts</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{lowStockCount}</p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total sales revenue</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">${revenueEarned.toFixed(2)}</p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Promo video</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{videoStatus}</p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Bank setup</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{bankStatus}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
