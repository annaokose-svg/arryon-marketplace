"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAllShops, fetchSellerProducts, getCustomerFavorites, toggleCustomerFavorite, isCustomerFavorite, getCurrentCustomer, createOrder } from '../../lib/auth';
import ProductCard from '../../components/ProductCard';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    async function loadProducts() {
      const shops = await fetchAllShops();
      const allProducts = [];
      for (const shop of shops) {
        const shopProducts = await fetchSellerProducts(shop.id);
        allProducts.push(...shopProducts);
      }
      setProducts(allProducts);
      setFavoriteIds(getCustomerFavorites());
      setLoading(false);
    }
    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                          product.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || product.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleToggleFavorite = (productId) => {
    const nextFavorites = toggleCustomerFavorite(productId);
    setFavoriteIds(nextFavorites);
  };

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
      alert('Order placed successfully! Check your order history in your account.');
    } catch (error) {
      console.error(error);
      alert(error.message || 'Unable to place the order.');
    }
  };

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  return (
    <div className="container py-14">
      <header className="mb-10 flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Product catalog</p>
        <h1 className="text-4xl font-semibold text-slate-900">Browse all products</h1>
        <p className="max-w-2xl text-slate-600">Discover items from verified sellers across all categories.</p>
      </header>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="card h-72 animate-pulse bg-slate-100" />
            ))
          : filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isFavorite={favoriteIds.includes(product.id)}
            onToggleFavorite={handleToggleFavorite}
            onOrder={handleOrder}
          />
        ))}
      </div>
    </div>
  );
}
