"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchProductById, updateProduct } from '../../../../../lib/auth';
import { useAuth } from '../../../../../components/AuthProvider';

export default function EditProductPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const { seller } = useAuth();
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageFiles: [],
    imageUrls: [],
    videoFiles: [],
    videoUrls: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!seller) {
      setLoading(false);
      return;
    }

    fetchProductById(id).then((item) => {
      if (item) {
        setProduct(item);
        setForm({
          name: item.name || '',
          description: item.description || '',
          price: item.price?.toString() || '',
          category: item.category || '',
          imageFiles: [],
          imageUrls: item.imageUrls?.length ? item.imageUrls : item.imageUrl ? [item.imageUrl] : [],
          videoFiles: [],
          videoUrls: item.videoUrls?.length ? item.videoUrls : item.videoUrl ? [item.videoUrl] : []
        });
      }
      setLoading(false);
    });
  }, [id, seller]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!seller || !product) return;
    if (product.sellerId !== seller.id) {
      setMessage('You cannot edit a product that does not belong to your shop.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const imageUrls = [...form.imageUrls];
      if (form.imageFiles.length > 0) {
        const uploadedImages = await Promise.all(form.imageFiles.map((file) => uploadFile(file)));
        imageUrls.push(...uploadedImages);
      }

      const videoUrls = [...form.videoUrls];
      if (form.videoFiles.length > 0) {
        const uploadedVideos = await Promise.all(form.videoFiles.map((file) => uploadFile(file)));
        videoUrls.push(...uploadedVideos);
      }

      await updateProduct(product.id, {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price) || 0,
        category: form.category,
        imageUrls,
        videoUrls
      });

      setMessage('Product updated successfully.');
      router.push('/seller/products');
    } catch (error) {
      console.error(error);
      setMessage('Unable to update the product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container py-14">Loading product…</div>;
  }

  if (!seller) {
    return (
      <div className="container py-14">
        <div className="card text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Seller login required</h1>
          <p className="mt-4 text-slate-600">Please sign in with your seller account to edit products.</p>
          <Link href="/seller/login" className="mt-6 inline-flex rounded-full bg-brand-900 px-6 py-3 text-white hover:bg-brand-700">
            Sign in now
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-14">
        <div className="card text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Product not found</h1>
          <p className="mt-4 text-slate-600">This product may have been removed or does not exist.</p>
          <Link href="/seller/products" className="mt-6 inline-flex rounded-full bg-brand-900 px-6 py-3 text-white hover:bg-brand-700">
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-14">
      <div className="grid gap-10 lg:grid-cols-[0.7fr_0.3fr]">
        <div className="card">
          <h1 className="text-3xl font-semibold text-slate-900">Edit product</h1>
          <p className="mt-3 text-slate-600">Update your product details and keep your catalog fresh.</p>
          <form onSubmit={handleSubmit} className="mt-10 grid gap-6">
            <label className="space-y-2 text-sm text-slate-700">
              Product name
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Description
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows="4"
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
              />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Price
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  required
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Category
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>
            </div>
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
                  handleChange('imageFiles', files);
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
            {form.imageUrls.length > 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-100 p-4">
                <p className="text-sm text-slate-500">Current images</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {form.imageUrls.map((url, index) => (
                    <img key={url || index} src={url} alt={`Product preview ${index + 1}`} className="h-40 w-full rounded-3xl object-cover" />
                  ))}
                </div>
              </div>
            ) : null}
            <label className="space-y-2 text-sm text-slate-700">
              Product videos (up to 5)
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
                  handleChange('videoFiles', files);
                }}
              />
              <p className="text-xs text-slate-500">Upload optional product preview videos.</p>
              {form.videoFiles.length > 0 && (
                <div className="mt-2 space-y-1 text-xs text-slate-500">
                  {form.videoFiles.map((file) => (
                    <p key={file.name}>{file.name}</p>
                  ))}
                </div>
              )}
            </label>
            {form.videoUrls.length > 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-100 p-4">
                <p className="text-sm text-slate-500">Current videos</p>
                <div className="mt-3 space-y-4">
                  {form.videoUrls.map((url, index) => (
                    <video key={url || index} controls className="w-full rounded-3xl bg-slate-100">
                      <source src={url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ))}
                </div>
              </div>
            ) : null}
            <button
              type="submit"
              disabled={saving}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-brand-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? 'Saving product…' : 'Update product'}
            </button>
            {message ? <p className="text-sm text-brand-700">{message}</p> : null}
          </form>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Product design</h2>
            <p className="mt-3 text-sm text-slate-600">Use compelling images and clear pricing to capture shopper attention.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700">
            <h3 className="text-lg font-semibold text-slate-900">Update advice</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6">
              <li>Use a descriptive title and clear product photo.</li>
              <li>Keep your price accurate and update stock frequently.</li>
              <li>Focus on benefits in the product description.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
