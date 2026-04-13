"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCustomerProfile } from '../../../lib/auth';

export default function CustomerSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    location: ''
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSignup = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await createCustomerProfile(form);
      router.push('/customer/dashboard');
    } catch (error) {
      console.error(error);
      alert('Unable to complete customer registration. Please check your details and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-14">
      <div className="mx-auto max-w-2xl rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Join Arryona as a Customer</h1>
        <p className="mt-3 text-slate-600">Create an account to browse shops, save favorites, and shop with ease.</p>
        <form onSubmit={handleSignup} className="mt-10 grid gap-5">
          <label className="space-y-2 text-sm text-slate-700">
            Full Name
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Email address
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Location (City, Country)
            <input
              type="text"
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g., London, United Kingdom"
              required
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center rounded-full bg-brand-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
