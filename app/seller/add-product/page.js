"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addProductListing } from '../../../lib/auth';
import { useAuth } from '../../../components/AuthProvider';

export default function AddProductPage() {
  const router = useRouter();
  const { seller } = useAuth();
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    imageFiles: [],
    videoFiles: [],
    // Category-specific fields
    sizes: [],
    targetDemographic: [],
    colors: ''
  });
  const [saving, setSaving] = useState(false);
  const [showFeeDisclosure, setShowFeeDisclosure] = useState(false);



  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/uploads', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Upload failed');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!seller) {
      alert('You must be signed in as a seller to add products.');
      return;
    }
    setShowFeeDisclosure(true);
  };

  const handleConfirmSubmit = async () => {
    setSaving(true);
    setShowFeeDisclosure(false);

    try {
      const imageUrls = await Promise.all(
        form.imageFiles.map((file) => uploadFile(file))
      );
      const videoUrls = await Promise.all(
        form.videoFiles.map((file) => uploadFile(file))
      );

      await addProductListing({
        sellerId: seller.id,
        name: form.name,
        description: form.description,
        price: parseFloat(form.price || '0'),
        category: form.category,
        stock: parseInt(form.stock || '0'),
        imageUrls,
        videoUrls,
        sizes: form.sizes,
        targetDemographic: form.targetDemographic,
        colors: form.colors
      });

      router.push('/seller/products');
    } catch (error) {
      console.error(error);
      alert('Unable to save the product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-14">
      <div className="grid gap-10 lg:grid-cols-[0.7fr_0.3fr]">
        <section className="card">
          <h1 className="text-3xl font-semibold text-slate-900">Add a new product</h1>
          <p className="mt-3 text-slate-600">Store product details, pricing, and media in your local seller catalog.</p>
          <form onSubmit={handleSubmit} className="mt-10 grid gap-5">
            <label className="space-y-2 text-sm text-slate-700">
              Product name
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Description
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows="4"
                required
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Price (USD)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                  required
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Category
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  required
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
                >
                  <option value="">Select a category</option>
                  <option value="clothing">Clothing</option>
                  <option value="shoes">Shoes</option>
                  <option value="accessories">Accessories</option>
                  <option value="electronics">Electronics</option>
                  <option value="home">Home & Garden</option>
                  <option value="beauty">Beauty & Personal Care</option>
                  <option value="sports">Sports & Outdoors</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Stock Quantity
                <input
                  type="number"
                  min="0"
                  value={form.stock || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                  required
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>
            </div>
            
            {/* Category-specific fields */}
            {(form.category === 'clothing' || form.category === 'shoes') && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Category Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-700">
                    Available Sizes
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                        <label key={size} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={form.sizes.includes(size)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm((prev) => ({ ...prev, sizes: [...prev.sizes, size] }));
                              } else {
                                setForm((prev) => ({ ...prev, sizes: prev.sizes.filter((s) => s !== size) }));
                              }
                            }}
                          />
                          <span className="text-sm">{size}</span>
                        </label>
                      ))}
                    </div>
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Target Demographic
                    <div className="space-y-2 mt-2">
                      {['Women', 'Men', 'Unisex', 'Kids', 'Toddler', 'Pet'].map((demo) => (
                        <label key={demo} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={form.targetDemographic.includes(demo)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm((prev) => ({ ...prev, targetDemographic: [...prev.targetDemographic, demo] }));
                              } else {
                                setForm((prev) => ({ ...prev, targetDemographic: prev.targetDemographic.filter((d) => d !== demo) }));
                              }
                            }}
                          />
                          <span className="text-sm">{demo}</span>
                        </label>
                      ))}
                    </div>
                  </label>
                </div>
                <label className="space-y-2 text-sm text-slate-700 mt-4">
                  Available Colors (comma-separated)
                  <input
                    type="text"
                    value={form.colors}
                    onChange={(e) => setForm((prev) => ({ ...prev, colors: e.target.value }))}
                    placeholder="e.g., Black, White, Blue, Red"
                    className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
                  />
                </label>
              </div>
            )}
            
            <label className="space-y-2 text-sm text-slate-700">
              Product images (up to 9)
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 9) {
                    alert('Maximum 9 images allowed');
                    return;
                  }
                  setForm((prev) => ({ ...prev, imageFiles: files }));
                }}
              />
              {form.imageFiles.length > 0 && (
                <div className="mt-2 space-y-1 text-xs text-slate-500">
                  {form.imageFiles.map((file) => (
                    <p key={file.name}>{file.name}</p>
                  ))}
                </div>
              )}
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Product videos (up to 5, optional)
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 5) {
                    alert('Maximum 5 videos allowed');
                    return;
                  }
                  setForm((prev) => ({ ...prev, videoFiles: files }));
                }}
              />
              <p className="text-xs text-slate-500">MP4 video helps bring your product to life.</p>
              {form.videoFiles.length > 0 && (
                <div className="mt-2 space-y-1 text-xs text-slate-500">
                  {form.videoFiles.map((file) => (
                    <p key={file.name}>{file.name}</p>
                  ))}
                </div>
              )}
            </label>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center rounded-full bg-brand-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? 'Saving product…' : 'Add product'}
            </button>
          </form>
        </section>
        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Seller product workflow</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Products are stored locally in a JSON backend while you test the platform on your machine.</p>
          </div>
        </aside>
      </div>

      {showFeeDisclosure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Platform Fees</h3>
            <p className="mt-3 text-sm text-slate-600">
              Arryona Marketplace charges a 10% platform fee on all sales. This helps us maintain the platform and provide services to sellers.
            </p>
            <div className="mt-4 rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Product Price: ${parseFloat(form.price || '0').toFixed(2)}</p>
              <p className="text-sm text-slate-600">Platform Fee (10%): ${(parseFloat(form.price || '0') * 0.1).toFixed(2)}</p>
              <p className="text-sm font-semibold text-slate-900">You'll receive: ${(parseFloat(form.price || '0') * 0.9).toFixed(2)}</p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowFeeDisclosure(false)}
                className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={saving}
                className="flex-1 rounded-full bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {saving ? 'Publishing...' : 'Publish Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
