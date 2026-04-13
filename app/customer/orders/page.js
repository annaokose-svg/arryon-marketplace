"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchCustomerOrders, getCurrentCustomer } from '../../../lib/auth';

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentCustomer = getCurrentCustomer();
    if (!currentCustomer) {
      setLoading(false);
      return;
    }

    fetchCustomerOrders(currentCustomer.id).then((orders) => {
      setOrders(orders);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="container py-14">Loading your orders…</div>;
  }

  if (!customer) {
    return (
      <div className="container py-14">
        <div className="card text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Sign in to view your orders</h1>
          <p className="mt-4 text-slate-600">Please log in with your customer account to see your purchase history.</p>
          <Link href="/customer/login" className="mt-6 inline-flex rounded-full bg-brand-900 px-6 py-3 text-white hover:bg-brand-700">
            Customer login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-14">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-slate-900">Order history</h1>
          <p className="mt-2 text-slate-600">Review all purchases you’ve made on Arryona.</p>
        </div>
        <Link href="/customer/dashboard" className="inline-flex rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200">
          Back to dashboard
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          You have no orders yet. Browse products and place an order to build your history.
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Order #{order.id.slice(-8)}</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="rounded-full bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-700">
                  {order.status}
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Items</p>
                  <ul className="mt-3 space-y-3">
                    {order.items.map((item) => (
                      <li key={item.productId} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                        <p className="text-sm text-slate-600">Seller: {item.sellerId}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="mt-3 text-3xl font-semibold text-brand-900">${order.total.toFixed(2)}</p>
                  {order.shippingAddress ? (
                    <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                      <p className="font-semibold text-slate-900">Shipping</p>
                      <p>{order.shippingAddress}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
