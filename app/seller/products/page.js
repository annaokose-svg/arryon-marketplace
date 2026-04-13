"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchSellerProducts, updateProduct } from '../../../lib/auth';
import { useAuth } from '../../../components/AuthProvider';
import ProductCard from '../../../components/ProductCard';

export default function SellerProductsPage() {
  const { seller } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingProductId, setUpdatingProductId] = useState(null);

  useEffect(() => {
    if (!seller) {
      setLoading(false);
      return;
    }

    fetchSellerProducts(seller.id).then((sellerProducts) => {
      setProducts(sellerProducts);
      setLoading(false);
    });
  }, [seller]);

  const handleToggleStatus = async (productId, currentStatus) => {
    setUpdatingProductId(productId);
    const nextStatus = currentStatus === 'inactive' ? 'live' : 'inactive';
    try {
      const updated = await updateProduct(productId, { status: nextStatus });
      setProducts((prev) => prev.map((product) => (product.id === productId ? updated : product)));
    } catch (error) {
      console.error('Failed to update product status', error);
      alert('Unable to update product status. Please try again.');
    } finally {
      setUpdatingProductId(null);
    }
  };

  return (
    <div className="container py-14">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Your products</h1>
          <p className="mt-2 text-slate-600">Manage inventory and keep your listings current.</p>
        </div>
        <a href="/seller/add-product" className="rounded-full bg-brand-900 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700">
          Add new product
        </a>
      </div>
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card h-72 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : products.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="group rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-700">
              <ProductCard product={product} />
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-slate-500">{product.status || 'Live'}</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(product.id, product.status)}
                    disabled={updatingProductId === product.id}
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
                  >
                    {updatingProductId === product.id ? 'Updating...' : product.status === 'inactive' ? 'Relist' : 'Pause'}
                  </button>
                  <Link
                    href={`/seller/products/edit/${product.id}`}
                    className="rounded-full bg-brand-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    Edit product
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center text-slate-600">No products yet. Add one to make your shop public.</div>
      )}
    </div>
  );
}
