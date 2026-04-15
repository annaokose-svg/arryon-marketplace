"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSellerProfile } from '../../../lib/auth';

export default function SellerSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState('email'); // 'email', 'verify', 'form'
  const [form, setForm] = useState({
    email: '',
    password: '',
    businessName: '',
    businessType: '',
    description: '',
    contactEmail: '',
    location: '',
    category: '',
    bannerFile: null,
    logoFile: null,
    videoFile: null,
    documentFile: null,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    if (!form.email) {
      alert('Please enter your email address.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await response.json();
      if (data.message) {
        setStep('verify');
      } else {
        alert(data.error || 'Failed to send verification email.');
      }
    } catch (error) {
      alert('Failed to send verification email. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/uploads', {
      method: 'POST',
      body: formData,
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

    if (!form.email || !form.password || !form.businessName || !form.businessType || !form.description || !form.contactEmail) {
      alert('Please complete all required seller registration fields.');
      return;
    }

    setSaving(true);

    try {
      const media = {};
      if (form.bannerFile) media.bannerUrl = await uploadFile(form.bannerFile);
      if (form.logoFile) media.logoUrl = await uploadFile(form.logoFile);
      if (form.videoFile) media.videoUrl = await uploadFile(form.videoFile);
      if (form.documentFile) media.documentUrl = await uploadFile(form.documentFile);

      await createSellerProfile({
        email: form.email,
        password: form.password,
        businessName: form.businessName,
        businessType: form.businessType,
        description: form.description,
        contactEmail: form.contactEmail,
        location: form.location,
        category: form.category,
        media,
      });

      router.push('/seller/dashboard');
    } catch (error) {
      console.error(error);
      alert(error.message || 'Unable to complete seller registration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-14">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">Seller onboarding</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900">Create your seller account</h1>
          <p className="mt-4 text-slate-600">Register your shop, share your business details, and start selling on Arryona Marketplace.</p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="grid gap-6 rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
            <label className="space-y-2 text-sm text-slate-700">
              Email address
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-full bg-brand-900 px-8 py-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? 'Sending...' : 'Send Verification Email'}
            </button>
          </form>
        )}

        {step === 'verify' && (
          <div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm text-center">
            <h2 className="text-2xl font-semibold text-slate-900">Check your email</h2>
            <p className="mt-4 text-slate-600">
              We've sent a verification link to <strong>{form.email}</strong>. Click the link to verify your email and continue registration.
            </p>
            <p className="mt-4 text-sm text-slate-500">Didn't receive the email? Check your spam folder or try again.</p>
            <button
              onClick={() => setStep('email')}
              className="mt-6 inline-flex rounded-full border border-brand-900 bg-white px-6 py-3 text-sm font-semibold text-brand-900 transition hover:bg-brand-50"
            >
              Change Email
            </button>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="grid gap-6 rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Email address
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="w-full rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 outline-none"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Password
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Business name
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  required
                  className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Business type
                <input
                  type="text"
                  value={form.businessType}
                  onChange={(e) => handleChange('businessType', e.target.value)}
                  required
                  className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm text-slate-700">
              Brand description
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
                rows="4"
                className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Contact email
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  required
                  className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Shop location
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm text-slate-700">
              Category
              <input
                type="text"
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2 text-sm text-slate-700">
                Banner image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleChange('bannerFile', e.target.files?.[0] || null)}
                  className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Logo image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleChange('logoFile', e.target.files?.[0] || null)}
                  className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Promo video
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleChange('videoFile', e.target.files?.[0] || null)}
                  className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm text-slate-700">
              Business document (optional)
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleChange('documentFile', e.target.files?.[0] || null)}
                className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-full bg-brand-900 px-8 py-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Create seller account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
