const API_BASE = '/api';
const SELLER_STORAGE_KEY = 'arryona_seller';
const CUSTOMER_STORAGE_KEY = 'arryona_customer';
const CUSTOMER_FAVORITES_KEY = 'arryona_customer_favorites';

async function callApi(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });
  return res;
}

export async function fetchAllShops() {
  const res = await callApi('/shops');
  if (!res.ok) return [];
  return res.json();
}

export async function fetchPopularShopVideos() {
  const shops = await fetchAllShops();
  return shops
    .filter((shop) => shop.media?.videoUrl)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
}

export async function fetchShopById(shopId) {
  const res = await callApi(`/shops/${shopId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchSellerProducts(sellerId) {
  const res = await callApi(`/products?sellerId=${encodeURIComponent(sellerId)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchAllProducts() {
  const res = await callApi('/products');
  if (!res.ok) return [];
  return res.json();
}

export async function createSellerProfile(profile) {
  const res = await callApi('/shops', {
    method: 'POST',
    body: JSON.stringify(profile)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Unable to create seller profile');
  }
  setCurrentSeller(data);
  return data;
}

export async function loginSeller(email, password) {
  const res = await callApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }
  setCurrentSeller(data);
  return data;
}

export async function addProductListing(product) {
  const res = await callApi('/products', {
    method: 'POST',
    body: JSON.stringify(product)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Unable to add product');
  }
  return data;
}

export async function fetchProductById(productId) {
  const res = await callApi(`/products/${productId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function updateProduct(productId, updates) {
  const res = await callApi(`/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Unable to update product');
  }
  return data;
}

export async function updateSellerProfile(sellerId, updates) {
  const res = await callApi(`/shops/${sellerId}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Unable to update seller profile');
  }
  setCurrentSeller(data);
  return data;
}

export async function updateCustomerProfile(customerId, updates) {
  const res = await callApi(`/customers/${customerId}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Unable to update customer profile');
  }
  setCurrentCustomer(data);
  return data;
}

export async function fetchCustomerOrders(customerId) {
  const res = await callApi(`/orders?customerId=${encodeURIComponent(customerId)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.orders || [];
}

export async function createOrder(order) {
  const res = await callApi('/orders', {
    method: 'POST',
    body: JSON.stringify(order)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Unable to create order');
  }
  return data.order;
}

export async function fetchSellerOrders(sellerId) {
  const res = await callApi(`/orders?sellerId=${encodeURIComponent(sellerId)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.orders || [];
}

export function getCurrentSeller() {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(SELLER_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setCurrentSeller(seller) {
  if (typeof window === 'undefined') return;
  // Only store essential seller data to avoid localStorage quota issues
  const essentialSeller = {
    id: seller.id,
    email: seller.email,
    businessName: seller.businessName,
    contactEmail: seller.contactEmail
  };
  window.localStorage.setItem(SELLER_STORAGE_KEY, JSON.stringify(essentialSeller));
  // Dispatch event to notify components of auth state change
  window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { type: 'seller', data: essentialSeller } }));
}

export function signOutSeller() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SELLER_STORAGE_KEY);
  // Dispatch event to notify components of auth state change
  window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { type: 'seller', data: null } }));
}

export async function createCustomerProfile(profile) {
  const res = await callApi('/customers', {
    method: 'POST',
    body: JSON.stringify(profile)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Unable to create customer profile');
  }
  setCurrentCustomer(data);
  return data;
}

export async function loginCustomer(email, password) {
  const res = await callApi('/auth/customer-login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }
  setCurrentCustomer(data);
  return data;
}

export function getCurrentCustomer() {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(CUSTOMER_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setCurrentCustomer(customer) {
  if (typeof window === 'undefined') return;
  // Only store essential customer data to avoid localStorage quota issues
  const essentialCustomer = {
    id: customer.id,
    email: customer.email,
    name: customer.name
  };
  window.localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(essentialCustomer));
  // Dispatch event to notify components of auth state change
  window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { type: 'customer', data: essentialCustomer } }));
}

export function getCustomerFavorites() {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(CUSTOMER_FAVORITES_KEY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isCustomerFavorite(productId) {
  return getCustomerFavorites().includes(productId);
}

export function toggleCustomerFavorite(productId) {
  if (typeof window === 'undefined') return [];
  const favorites = getCustomerFavorites();
  const nextFavorites = favorites.includes(productId)
    ? favorites.filter((id) => id !== productId)
    : [...favorites, productId];
  window.localStorage.setItem(CUSTOMER_FAVORITES_KEY, JSON.stringify(nextFavorites));
  return nextFavorites;
}

export async function fetchCustomerFavoriteProducts() {
  const favoriteIds = getCustomerFavorites();
  const favorites = await Promise.all(
    favoriteIds.map(async (id) => {
      try {
        return await fetchProductById(id);
      } catch {
        return null;
      }
    })
  );
  return favorites.filter(Boolean);
}

export function signOutCustomer() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(CUSTOMER_STORAGE_KEY);
  // Dispatch event to notify components of auth state change
  window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { type: 'customer', data: null } }));
}

