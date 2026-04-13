"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductCard from '../../../components/ProductCard';
import { fetchShopById, fetchSellerProducts, getCurrentCustomer, createOrder } from '../../../lib/auth';

export default function ShopDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function load() {
      const shopData = await fetchShopById(id);
      if (!shopData) {
        router.push('/shops');
        return;
      }
      setShop(shopData);
      const sellerProducts = await fetchSellerProducts(id);
      setProducts(sellerProducts);
      setLoading(false);
    }

    load();
  }, [id, router]);

  const handleOrder = async (product) => {
    const customer = getCurrentCustomer();
    if (!customer) {
      router.push('/customer/login');
      return;
    }

    if (product.stock !== undefined && product.stock <= 0) {
      alert('This product is out of stock.');
      return;
    }

    try {
      await createOrder({
        customerId: customer.id,
        items: [
          {
            productId: product.id,
            sellerId: product.sellerId,
            name: product.name,
            price: Number(product.price || 0),
            quantity: 1
          }
        ],
        total: Number(product.price || 0),
        shippingAddress: null
      });
      alert('Order placed successfully! You can review it in your order history.');
    } catch (error) {
      console.error(error);
      alert(error.message || 'Unable to place order.');
    }
  };

  if (loading) {
    return (
      <div className="container py-14">
        <div className="rounded-3xl border border-slate-200 bg-white p-14 text-center text-slate-500">Loading shop...</div>
      </div>
    );
  }

  return (
    <div className="container py-14">
      <div className="card border-0 p-0 overflow-hidden">
        <div className="relative h-72 w-full bg-slate-100">
          {shop?.media?.bannerUrl ? (
            <img src={shop.media.bannerUrl} alt={`${shop.businessName} banner`} className="h-full w-full object-cover" />
          ) : null}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-6 text-white">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-200">{shop.category || 'Independent seller'}</p>
            <h1 className="mt-3 text-4xl font-semibold">{shop.businessName}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-100">{shop.description}</p>
          </div>
        </div>
      </div>
      <section className="mt-10 grid gap-8 lg:grid-cols-[0.85fr_0.35fr]">
        <div className="space-y-8">
          <div className="card">
            <h2 className="text-2xl font-semibold text-slate-900">About this shop</h2>
            <div className="mt-5 grid gap-4 text-slate-700 sm:grid-cols-2">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Contact</p>
                <p className="mt-2 text-base">{shop.contactEmail || 'Not available'}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Location</p>
                <p className="mt-2 text-base">{shop.location || 'Worldwide'}</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Products</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {products.length ? (
                products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOrder={handleOrder}
                  />
                ))
              ) : (
                <div className="card border-dashed border-slate-300 text-slate-500">No products have been added yet.</div>
              )}
            </div>
          </div>
        </div>
        <aside className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-900">Seller media</h3>
            <p className="mt-4 text-sm leading-6 text-slate-600">All storefront content is stored locally for this development environment.</p>
            {shop.media?.videoUrl ? (
              <video controls className="mt-5 w-full rounded-3xl bg-slate-100">
                <source src={shop.media.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <p className="mt-5 text-sm text-slate-500">No promotional video uploaded.</p>
            )}
          </div>
          <div className="card bg-slate-50">
            <p className="text-sm text-slate-600">Arryona marketplaces list public shops before login so customers can browse businesses immediately.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
