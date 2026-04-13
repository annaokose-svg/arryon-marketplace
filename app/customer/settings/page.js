'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCustomerProfile } from '../../../lib/auth';
import { useAuth } from '../../../components/AuthProvider';

export default function CustomerSettingsPage() {
  const router = useRouter();
  const { customer } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!customer) {
      router.push('/customer/login');
      return;
    }
    setName(customer.name || '');
    setEmail(customer.email || '');
  }, [customer, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!customer) return;

    const updates = {
      name: name.trim() || customer.name,
      email: email.trim() || customer.email
    };

    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        setMessage('Current password is required to change your password.');
        setSaving(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage('New password and confirmation must match.');
        setSaving(false);
        return;
      }
      if (newPassword.length < 6) {
        setMessage('New password must be at least 6 characters.');
        setSaving(false);
        return;
      }
      updates.currentPassword = currentPassword;
      updates.password = newPassword;
    }

    setSaving(true);
    setMessage('');
    try {
      const updatedCustomer = await updateCustomerProfile(customer.id, updates);
      setCustomer(updatedCustomer);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('Your customer settings have been saved.');
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Unable to save customer settings.');
    } finally {
      setSaving(false);
    }
  };

  if (!customer) {
    return <div className="container py-14">Redirecting to login…</div>;
  }

  return (
    <div className="container py-14">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Customer Settings</h1>
          <p className="mt-3 text-slate-600">Update your profile and account details.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter a new password"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-full bg-brand-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save settings'}
            </button>

            {message && (
              <p className="text-sm text-green-700">{message}</p>
            )}
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-semibold text-slate-900">What this does</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Your customer profile updates are saved to the backend and reflected in your signed-in session. If you sign out, your name and email will remain updated the next time you log in.
          </p>
        </div>
      </div>
    </div>
  );
}
