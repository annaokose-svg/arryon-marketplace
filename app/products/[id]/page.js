"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchProductById, fetchShopById, getCurrentCustomer, createOrder } from '../../../lib/auth';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [cartSaving, setCartSaving] = useState(false);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function load() {
      const productData = await fetchProductById(id);
      if (!productData) {
        router.push('/products');
        return;
      }
      setProduct(productData);
      if (productData.sellerId) {
        const shopData = await fetchShopById(productData.sellerId);
        setShop(shopData);
      }
      setLoading(false);
    }

    load();
  }, [id, router]);

  if (loading) {
    return (
      <div className="container py-14">
        <div className="rounded-3xl border border-slate-200 bg-white p-14 text-center text-slate-500">Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const mediaItems = [
    ...(product.imageUrls?.map((url) => ({ type: 'image', url })) || []),
    ...(product.videoUrls?.map((url) => ({ type: 'video', url })) || [])
  ];
  if (!mediaItems.length) {
    if (product.imageUrl) mediaItems.push({ type: 'image', url: product.imageUrl });
    if (product.videoUrl) mediaItems.push({ type: 'video', url: product.videoUrl });
  }

  const selectedMedia = mediaItems[selectedMediaIndex] || mediaItems[0] || null;
  const isSoldOut = product.stock <= 0;

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('arryona_cart') || '[]');
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price || 0),
        quantity: 1,
        imageUrl: selectedMedia?.type === 'image' ? selectedMedia.url : product.imageUrl || null
      });
    }
    localStorage.setItem('arryona_cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart.length }));
    alert('Added to cart.');
  };

  const handleBuyNow = async () => {
    const customer = getCurrentCustomer();
    if (!customer) {
      router.push('/customer/login');
      return;
    }

    if (isSoldOut) {
      alert('This product is out of stock.');
      return;
    }

    setBuying(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          sellerStripeAccountId: shop?.stripeAccountId,
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to create checkout: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert(error.message || 'Unable to create checkout.');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="container py-14">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link href="/products" className="text-sm font-semibold text-brand-700 hover:underline">
            ← Back to products
          </Link>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900">{product.name}</h1>
          <p className="mt-3 max-w-3xl text-slate-600">{product.description}</p>
        </div>
        {shop ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Sold by</p>
              <Link href={'/shop/' + shop.id} className="mt-2 block text-lg font-semibold text-slate-900 hover:text-brand-700">
              {shop.businessName}
            </Link>
            <p className="mt-2 text-sm text-slate-600">{shop.location || 'Location not set'}</p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 overflow-hidden rounded-3xl bg-slate-100">
              {selectedMedia ? (
                selectedMedia.type === 'video' ? (
                  <video src={selectedMedia.url} controls className="h-96 w-full object-cover" />
                ) : (
                  <img
                    src={selectedMedia.url}
                    alt={product.name}
                    className="h-96 w-full object-cover"
                  />
                )
              ) : (
                <div className="flex h-96 items-center justify-center text-slate-400">No media available</div>
              )}
            </div>
            {mediaItems.length > 1 ? (
              <div className="grid grid-cols-4 gap-3">
                {mediaItems.map((media, index) => (
                  <button
                    key={media.type + '-' + media.url + '-' + index}
                    type="button"
                    onClick={() => setSelectedMediaIndex(index)}
                    className={
                      selectedMediaIndex === index
                        ? 'overflow-hidden rounded-3xl border p-1 transition border-brand-700 bg-brand-50'
                        : 'overflow-hidden rounded-3xl border p-1 transition border-slate-200 bg-white'
                    }
                  >
                    {media.type === 'video' ? (
                      <div className="relative h-24 w-full bg-slate-100 flex items-center justify-center text-xs text-slate-500">Video</div>
                    ) : (
                      <img src={media.url} alt={product.name + ' thumbnail'} className="h-24 w-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Product details</h2>
                <dl className="mt-6 space-y-4 text-sm text-slate-600">
                  <div>
                    <dt className="font-semibold text-slate-900">Price</dt>
                    <dd className="mt-1 text-lg font-semibold text-brand-900">${Number(product.price || 0).toFixed(2)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Category</dt>
                    <dd className="mt-1">{product.category || 'General'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Stock</dt>
                    <dd className="mt-1">{product.stock !== undefined ? `${product.stock} available` : 'Not tracked'}</dd>
                  </div>
                  {product.colors ? (
                    <div>
                      <dt className="font-semibold text-slate-900">Colors</dt>
                      <dd className="mt-2 flex flex-wrap gap-2">
                        {product.colors.split(',').map((color) => (
                          <span key={color.trim()} className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase text-slate-600">
                            {color.trim()}
                          </span>
                        ))}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Attributes</h2>
                <div className="mt-6 space-y-4 text-sm text-slate-600">
                  {product.sizes?.length ? (
                    <div>
                      <p className="font-semibold text-slate-900">Sizes</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.sizes.map((size) => (
                          <span key={size} className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase text-slate-600">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {product.targetDemographic?.length ? (
                    <div>
                      <p className="font-semibold text-slate-900">Target demographic</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.targetDemographic.map((item) => (
                          <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase text-slate-600">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase text-slate-500">Purchase</p>
            <div className="mt-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Price</p>
                <p className="text-3xl font-semibold text-brand-900">${Number(product.price || 0).toFixed(2)}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs uppercase ${isSoldOut ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {isSoldOut ? 'Sold Out' : 'In stock'}
              </span>
            </div>
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isSoldOut || cartSaving}
                className="w-full rounded-full bg-brand-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                Add to cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isSoldOut || buying}
                className="w-full rounded-full border border-brand-900 bg-white px-6 py-3 text-sm font-semibold text-brand-900 transition hover:bg-brand-50 disabled:opacity-50"
              >
                {buying ? 'Processing…' : 'Buy now'}
              </button>
            </div>
          </div>
          {shop ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-900">Shop preview</p>
              <p className="mt-3 text-sm text-slate-600">Explore more items from this seller or contact them directly from the shop page.</p>
              <Link href={`/shop/${shop.id}`} className="mt-5 inline-flex rounded-full bg-brand-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
                View shop
              </Link>
            </div>
          ) : null}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Report & Flag</p>
            <p className="mt-3 text-sm text-slate-600">Help us maintain a safe marketplace by reporting inappropriate content or flagging suspicious sellers.</p>
            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => alert('Report submitted. Thank you for helping keep our marketplace safe.')}
                className="w-full rounded-full border border-red-200 bg-red-50 px-6 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                Report Product
              </button>
              <button
                type="button"
                onClick={() => alert('Seller flagged. Our team will review this account.')}
                className="w-full rounded-full border border-orange-200 bg-orange-50 px-6 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
              >
                Flag Seller
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
