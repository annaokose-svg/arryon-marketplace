"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createOrder } from '../../lib/auth';
import { useAuth } from '../../components/AuthProvider';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { customer } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [form, setForm] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    billingAddress: '',
    shippingAddress: ''
  });

  useEffect(() => {
    if (!customer) {
      router.push('/customer/login');
      return;
    }
    
    // Load cart from localStorage
    const cart = JSON.parse(localStorage.getItem('arryona_cart') || '[]');
    setCartItems(cart);
    
    // Pre-fill shipping address with customer's location
    const approxLocation = customer.location || 'Address not set';
    setForm((prev) => ({
      ...prev,
      billingAddress: approxLocation,
      shippingAddress: approxLocation
    }));
    
    setLoading(false);
  }, [customer, router]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = subtotal > 100 ? 0 : 10;
  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const total = subtotal + tax + shippingCost;

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!form.cardNumber || !form.cardExpiry || !form.cardCVC) {
      alert('Please fill in all payment details');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setProcessing(true);

    try {
      // Validate card format (basic)
      if (!/^\d{16}$/.test(form.cardNumber.replace(/\s/g, ''))) {
        throw new Error('Invalid card number');
      }

      if (!/^\d{2}\/\d{2}$/.test(form.cardExpiry)) {
        throw new Error('Invalid expiry format (use MM/YY)');
      }

      if (!/^\d{3}$/.test(form.cardCVC)) {
        throw new Error('Invalid CVC');
      }

      // Create order
      const order = await createOrder({
        customerId: customer.id,
        items: cartItems,
        subtotal,
        tax,
        shipping: shippingCost,
        total,
        shippingAddress: form.shippingAddress,
        billingAddress: form.billingAddress,
        paymentMethod: 'credit_card',
        status: 'completed',
        cardLast4: form.cardNumber.slice(-4)
      });

      // Clear cart
      localStorage.removeItem('arryona_cart');
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: 0 }));

      alert('Payment successful! Your order has been placed.');
      router.push(`/customer/orders`);
    } catch (error) {
      console.error(error);
      alert(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="container py-14">Loading checkout...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="container py-14">
        <div className="card text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Your cart is empty</h1>
          <p className="mt-4 text-slate-600">Add some items before proceeding to checkout.</p>
          <Link href="/products" className="mt-6 inline-flex rounded-full bg-brand-900 px-6 py-3 text-white hover:bg-brand-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-14">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Order Summary */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="card">
            <h2 className="text-xl font-semibold text-slate-900">Order Summary</h2>
            <div className="mt-6 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start border-b border-slate-200 pb-3">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              
              <div className="space-y-2 pt-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-lg text-slate-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              {subtotal > 100 && (
                <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
                  ✓ Free shipping on orders over $100!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="card">
            <h1 className="text-3xl font-semibold text-slate-900">Checkout</h1>
            <p className="mt-3 text-slate-600">Complete your purchase securely.</p>

            <form onSubmit={handlePayment} className="mt-8 space-y-6">
              {/* Shipping Address */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Shipping Address</h3>
                <label className="space-y-2 text-sm text-slate-700">
                  Shipping Address
                  <textarea
                    value={form.shippingAddress}
                    onChange={(e) => setForm((prev) => ({ ...prev, shippingAddress: e.target.value }))}
                    rows="3"
                    required
                    className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
                    placeholder="Enter your full shipping address"
                  />
                </label>
                <p className="text-xs text-slate-500 mt-2">Default: {customer?.location || 'Not set'}</p>
              </div>

              {/* Billing Address */}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.billingAddress === form.shippingAddress}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setForm((prev) => ({ ...prev, billingAddress: prev.shippingAddress }));
                    }
                  }}
                  className="rounded"
                />
                <span>Billing address same as shipping</span>
              </label>

              {form.billingAddress !== form.shippingAddress && (
                <label className="space-y-2 text-sm text-slate-700">
                  Billing Address
                  <textarea
                    value={form.billingAddress}
                    onChange={(e) => setForm((prev) => ({ ...prev, billingAddress: e.target.value }))}
                    rows="3"
                    className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
                  />
                </label>
              )}

              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Payment Information</h3>
                
                <label className="space-y-2 text-sm text-slate-700 mb-4">
                  Card Number
                  <input
                    type="text"
                    value={form.cardNumber}
                    onChange={(e) => setForm((prev) => ({ ...prev, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
                    placeholder="1234 5678 9012 3456"
                    maxLength="16"
                    required
                    className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 font-mono"
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="space-y-2 text-sm text-slate-700">
                    Expiry (MM/YY)
                    <input
                      type="text"
                      value={form.cardExpiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length >= 2) {
                          val = val.slice(0, 2) + '/' + val.slice(2, 4);
                        }
                        setForm((prev) => ({ ...prev, cardExpiry: val }));
                      }}
                      placeholder="MM/YY"
                      maxLength="5"
                      required
                      className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 font-mono"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    CVC
                    <input
                      type="text"
                      value={form.cardCVC}
                      onChange={(e) => setForm((prev) => ({ ...prev, cardCVC: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                      placeholder="123"
                      maxLength="3"
                      required
                      className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 font-mono"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-4">
                  💳 Demo mode: Use test card <strong>4242 4242 4242 4242</strong>, any future date, and any 3-digit CVC.
                </p>
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full rounded-full bg-brand-900 px-6 py-3 text-lg font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
