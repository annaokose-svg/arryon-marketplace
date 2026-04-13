"use client";

import { useEffect, useState } from 'react';
import ShopCard from '../../components/ShopCard';
import { fetchAllShops } from '../../lib/auth';

export default function ShopsPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const list = await fetchAllShops();
      setShops(list);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="container py-14">
      <header className="mb-10 flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Shop discovery</p>
        <h1 className="text-4xl font-semibold text-slate-900">Browse all registered sellers</h1>
        <p className="max-w-2xl text-slate-600">Shops are publicly visible on Arryona before customers sign in.</p>
      </header>
      <div className="grid gap-6 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="card h-72 animate-pulse bg-slate-100" />
            ))
          : shops.map((shop) => <ShopCard key={shop.id} shop={shop} />)}
      </div>
    </div>
  );
}
