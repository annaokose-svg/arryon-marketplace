"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchShopById, updateSellerProfile } from '../../../lib/auth';
import { useAuth } from '../../../components/AuthProvider';

export default function ShopSettingsPage() {
  const router = useRouter();
  const { seller } = useAuth();
  const [form, setForm] = useState({
    businessName: '',
    description: '',
    contactEmail: '',
    location: '',
    category: '',
    bannerFile: null,
    logoFile: null,
    videoFile: null,
    media: {},
    bankDetails: {
      accountHolder: '',
      bankName: '',
      accountNumber: '',
      routingNumber: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!seller) {
      setLoading(false);
      return;
    }
    // fetchShopById is already being called below, so this is fine
    fetchShopById(seller.id).then((shop) => {
      if (shop) {
        setForm((prev) => ({
          ...prev,
          businessName: shop.businessName || '',
          description: shop.description || '',
          contactEmail: shop.contactEmail || '',
          location: shop.location || '',
          category: shop.category || '',
          media: shop.media || {},
          bankDetails: shop.bankDetails || prev.bankDetails
        }));
      }
      setLoading(false);
    });
  }, [seller]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const handleBankChange = (key, value) =>
    setForm((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [key]: value
      }
    }));

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
    if (!seller) return;
    setSaving(true);
    setMessage('');

    try {
      const media = { ...form.media };
      if (form.bannerFile) {
        media.bannerUrl = await uploadFile(form.bannerFile);
      }
      if (form.logoFile) {
        media.logoUrl = await uploadFile(form.logoFile);
      }
      if (form.videoFile) {
        media.videoUrl = await uploadFile(form.videoFile);
      }

      await updateSellerProfile(seller.id, {
        businessName: form.businessName,
        description: form.description,
        contactEmail: form.contactEmail,
        location: form.location,
        category: form.category,
        media,
        bankDetails: form.bankDetails
      });

      setMessage('Your shop settings were updated successfully.');
    } catch (error) {
      console.error(error);
      setMessage('Unable to update your shop. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container py-14">Loading shop settings…</div>;
  }

  if (!seller) {
    return (
      <div className="container py-14">
        <div className="card text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Seller access required</h1>
          <p className="mt-4 text-slate-600">Please sign in with your seller account to manage storefront settings.</p>
          <Link href="/seller/login" className="mt-6 inline-flex rounded-full bg-brand-900 px-6 py-3 text-white hover:bg-brand-700">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-14">
      <div className="grid gap-10 lg:grid-cols-[0.7fr_0.3fr]">
        <div className="card">
          <h1 className="text-3xl font-semibold text-slate-900">Design your shop</h1>
          <p className="mt-3 text-slate-600">Update your storefront details, brand messaging, and shop media to keep your page polished.</p>
          <form onSubmit={handleSubmit} className="mt-10 grid gap-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Business Name
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
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
              Business Description
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows="4"
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
              />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Contact Email
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Location
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Account holder name
                <input
                  type="text"
                  value={form.bankDetails.accountHolder}
                  onChange={(e) => handleBankChange('accountHolder', e.target.value)}
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Bank name
                <input
                  type="text"
                  value={form.bankDetails.bankName}
                  onChange={(e) => handleBankChange('bankName', e.target.value)}
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Account number
                <input
                  type="text"
                  value={form.bankDetails.accountNumber}
                  onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Routing number
                <input
                  type="text"
                  value={form.bankDetails.routingNumber}
                  onChange={(e) => handleBankChange('routingNumber', e.target.value)}
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2 text-sm text-slate-700">
                Shop banner
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleChange('bannerFile', e.target.files?.[0] || null)}
                />
                <p className="text-xs text-slate-500">Max 5MB, recommended 1200x400px</p>
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Shop logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleChange('logoFile', e.target.files?.[0] || null)}
                />
                <p className="text-xs text-slate-500">Max 5MB, square format recommended</p>
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Promo video
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleChange('videoFile', e.target.files?.[0] || null)}
                />
                <p className="text-xs text-slate-500">Max 20MB, MP4 format recommended</p>
              </label>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-brand-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? 'Updating shop…' : 'Save shop design'}
            </button>
            {message ? <p className="text-sm text-brand-700">{message}</p> : null}
          </form>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Shop preview</h2>
            <p className="mt-3 text-sm text-slate-600">Your shop profile is visible to shoppers immediately after saving.</p>
            {form.media.bannerUrl ? (
              <img src={form.media.bannerUrl} alt="Shop banner" className="mt-4 h-40 w-full rounded-3xl object-cover" />
            ) : (
              <div className="mt-4 h-40 rounded-3xl bg-slate-100" />
            )}
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700">
            <h3 className="text-lg font-semibold text-slate-900">Design tips</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6">
              <li>Use a clear logo and branded banner for a stronger storefront presence.</li>
              <li>Keep your product descriptions concise and benefit-focused.</li>
              <li>Update your category and contact details so shoppers can trust your business.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
