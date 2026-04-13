'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../components/AuthProvider';

export default function CartPage() {
  const { customer } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load cart from localStorage
    const cart = JSON.parse(localStorage.getItem('arryona_cart') || '[]');
    setCartItems(cart);
    setLoading(false);
  }, []);

  const removeFromCart = (productId) => {
    const updatedCart = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('arryona_cart', JSON.stringify(updatedCart));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = cartItems.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('arryona_cart', JSON.stringify(updatedCart));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (loading) {
    return <div className="container py-14">Loading cart...</div>;
  }

  return (
    <div className="container py-14">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold text-slate-900">Shopping Cart</h1>
        <p className="mt-3 text-slate-600">Review your items and proceed to checkout.</p>

        {!customer && (
          <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6">
            <p className="text-amber-800">
              Please <Link href="/customer/login" className="font-semibold underline">sign in</Link> to proceed with checkout.
            </p>
          </div>
        )}

        <div className="mt-8">
          {cartItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h10a2 2 0 002-2v-3" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Your cart is empty</h3>
              <p className="mt-2 text-slate-600">Add some products to get started.</p>
              <Link href="/products" className="mt-6 inline-flex rounded-full bg-brand-900 px-6 py-3 text-white hover:bg-brand-700">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                      <div className="h-16 w-16 rounded-lg bg-slate-200"></div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{item.name}</h4>
                        <p className="text-sm text-slate-600">${item.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="rounded-full border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="rounded-full border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Total: ${getTotalPrice().toFixed(2)}</h3>
                    <p className="text-sm text-slate-600">Shipping calculated at checkout</p>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/products" className="rounded-full border border-slate-300 px-6 py-3 text-sm font-medium hover:bg-slate-50">
                      Continue Shopping
                    </Link>
                    {customer && (
                      <Link href="/checkout" className="rounded-full bg-brand-900 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700">
                        Proceed to Checkout
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}