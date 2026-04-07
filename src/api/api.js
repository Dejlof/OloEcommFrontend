// src/api/api.js
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5014';

export class ApiError extends Error {
  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

let isRefreshing = false;
let refreshQueue = [];

async function refreshAccessToken() {
  const res = await fetch(`${BASE}/api/account/refresh`, {
    method: 'POST', credentials: 'include',
  });
  if (!res.ok) throw new ApiError(res.status, 'Session expired');
  const data = await res.json();
  sessionStorage.setItem('accessToken', data.accessToken);
  return data.accessToken;
}

export async function apiFetch(path, options = {}, retry = true) {
  const token = sessionStorage.getItem('accessToken');

  const isFormData = options.body instanceof FormData;
  const headers = {

    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE}${path}`, {
    ...options, headers, credentials: 'include',
  });

  if (res.status === 401 && retry) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then(() => apiFetch(path, options, false));
    }
    isRefreshing = true;
    try {
      await refreshAccessToken();
      refreshQueue.forEach(q => q.resolve());
      refreshQueue = [];
      isRefreshing = false;
      return apiFetch(path, options, false);
    } catch (err) {
      refreshQueue.forEach(q => q.reject(err));
      refreshQueue = [];
      isRefreshing = false;
      sessionStorage.removeItem('accessToken');
      window.dispatchEvent(new Event('auth:logout'));
      throw err;
    }
  }

  if (!res.ok) {
    let body = {};
    try { body = await res.json(); } catch {}
    const errors = body.errors ?? (body.message ? [body.message] : []);
    throw new ApiError(res.status, body.message ?? 'Request failed', errors);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
  register:       (data) => apiFetch('/api/account/register', { method: 'POST', body: JSON.stringify(data) }),
  login:          (data) => apiFetch('/api/account/login',    { method: 'POST', body: JSON.stringify(data) }, false),
  logout:         ()     => apiFetch('/api/account/logout',   { method: 'POST' }),
  refresh:        ()     => apiFetch('/api/account/refresh',  { method: 'POST' }),
  forgotPassword: (email) => apiFetch('/api/account/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword:  (data) => apiFetch('/api/account/reset-password',   { method: 'POST', body: JSON.stringify(data) }),
  changePassword: (data) => apiFetch('/api/account/change-password',  { method: 'POST', body: JSON.stringify(data) }),
  getUser: (email)=> apiFetch(`/api/account/users/${encodeURIComponent(email)}`),
  getUsers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/api/account/users${q ? `?${q}` : ''}`);
  },
};

// ── Products ──────────────────────────────────────────────────────────────────
export const products = {
  // General listing with search/sort/price/page params
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/api/product${q ? `?${q}` : ''}`);
  },

  // Filter by category ID — returns paginated response { items, totalCount, ... }
  getByCategory: (categoryId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/api/product/GetProductsByCategory/${categoryId}${q ? `?${q}` : ''}`);
  },

  getById:    (id) => apiFetch(`/api/product/${id}`),
  getPopular: ()   => apiFetch('/api/product/Getpopularproducts'),
  getMine:    (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/api/product/GetMyProducts${q ? `?${q}` : ''}`);
  },
  getByVendor: (username, params = {}) => {
    const q = new URLSearchParams({ username, ...params }).toString();
    return apiFetch(`/api/Product/GetVendorProducts?${q}`);
  },

  create: (categoryId, data) =>
    apiFetch(`/api/product/category/${categoryId}`, { method: 'POST', body: JSON.stringify(data) }),

  update: (id, data) =>
    apiFetch(`/api/product/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete:     (id) => apiFetch(`/api/product/${id}`,      { method: 'DELETE' }),
  deleteMine: (id) => apiFetch(`/api/product/mine/${id}`, { method: 'DELETE' }),
};

// ── Product Images ────────────────────────────────────────────────────────────
export const productImages = {
  upload: (productId, formData) =>
    apiFetch(`/api/ProductImage/${productId}/upload`, {
      method: 'POST',
      body: formData,
      headers: {}, 
    }),
  delete: (imageId) =>
    apiFetch(`/api/ProductImage/${imageId}`, { method: 'DELETE' }),
  update: (imageId, formData) =>
    apiFetch(`/api/ProductImage/${imageId}`, {
      method: 'PUT',
      body: formData,
      headers: {},
    }),
};

// ── Categories ────────────────────────────────────────────────────────────────
export const categories = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/api/Category${q ? `?${q}` : ''}`);
  },
  getById: (id)  => apiFetch(`/api/Category/${id}`),
};

// ── Cart ──────────────────────────────────────────────────────────────────────
export const cart = {
  getMine: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/api/ShoppingCart/GetMyCarts${q ? `?${q}` : ''}`);
  },

  add: (productId, quantity) =>
    apiFetch(`/api/ShoppingCart/CreateMyCartItem/${productId}`, {
      method: 'POST', body: JSON.stringify({ quantity }),
    }),

  update: (productId, quantity) =>
    apiFetch(`/api/ShoppingCart/UpdateMyCartItem/${productId}`, {
      method: 'PUT', body: JSON.stringify({ quantity }),
    }),

  remove: (productId) =>
    apiFetch(`/api/ShoppingCart/RemoveMyProduct/${productId}`, { method: 'DELETE' }),

  clear: () => apiFetch('/ClearMyCart', { method: 'DELETE' }),
};

// ── Wishlist ──────────────────────────────────────────────────────────────────
export const wishlist = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/api/Wishlist${q ? `?${q}` : ''}`);
  },
  add:    (productId, data) =>
    apiFetch(`/api/Wishlist/${productId}`, { method: 'POST', body: JSON.stringify(data) }),
  remove: (id) => apiFetch(`/api/Wishlist/${id}`, { method: 'DELETE' }),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const orders = {
  create:  (addressId) => apiFetch(`/api/order?addressId=${addressId}`, { method: 'POST' }),
  getMine: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/api/order/getmyorder${q ? `?${q}` : ''}`);
  },
  getById: (id)        => apiFetch(`/api/order/${id}`),
  shipOrder:(orderDetailId)=> apiFetch(`/api/order/${orderDetailId}/ShipProductOrdered`, { method: 'POST' }),
  deliverOrder:(orderDetailId)=> apiFetch(`/api/order/${orderDetailId}/DeliverProductOrdered`, { method: 'POST' }),
  cancelOrder:(orderDetailId)=> apiFetch(`/api/order/${orderDetailId}/CancelProductOrdered`, { method: 'POST' }),
  getVendorOrders: (username, params = {}) => {
    const q = new URLSearchParams({ username, ...params }).toString();
    return apiFetch(`/api/order/GetVendorOrders?${q}`);
  },
  getMyVendorOrders: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/api/Order/GetVendorOrders${q ? `?${q}` : ''}`);
  },
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const payments = {
  initialize:      (orderId) => apiFetch(`/api/Payments/InitializePayment/${orderId}`, { method: 'POST' }),
  getByReference:  (ref)     => apiFetch(`/api/Payments/GetPaymentByReference/${ref}`),
};

// ── Addresses ─────────────────────────────────────────────────────────────────
export const addresses = {
  getMine:  (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/api/address/getmyaddresses${q ? `?${q}` : ''}`);
  },
  getById:  (id)     => apiFetch(`/api/address/${id}`),
  create:   (data)   => apiFetch('/api/address',    { method: 'POST', body: JSON.stringify(data) }),
  update:   (id, d)  => apiFetch(`/api/address/${id}`, { method: 'PUT',  body: JSON.stringify(d) }),
  delete:   (id)     => apiFetch(`/api/address/${id}`, { method: 'DELETE' }),
};

// ── Delivery Fee ─────────────────────────────────────────────────────────────────
export const deliveryfee = {
  getfees:  (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/api/DeliveryFees${q ? `?${q}` : ''}`);
  },
  getById:  (id)     => apiFetch(`/api/DeliveryFees/${id}`),
  create:   (data)   => apiFetch('/api/DeliveryFees',    { method: 'POST', body: JSON.stringify(data) }),
  update:   (id, d)  => apiFetch(`/api/DeliveryFees/${id}`, { method: 'PUT',  body: JSON.stringify(d) }),
  delete:   (id)     => apiFetch(`/api/DeliveryFees/${id}`, { method: 'DELETE' }),
};

// ── Reviews ───────────────────────────────────────────────────────────────────
export const reviews = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/api/review${q ? `?${q}` : ''}`);
  },
  getMine: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/api/review/mine${q ? `?${q}` : ''}`);
  },
  create: (productId, rating, data) =>
    apiFetch(`/api/review/${productId}?rating=${rating}`, {
      method: 'POST', body: JSON.stringify(data),
    }),
  update: (id, rating, data) =>
    apiFetch(`/api/review/${id}?rating=${rating}`, {
      method: 'PUT', body: JSON.stringify(data),
    }),
  delete:   (id) => apiFetch(`/api/review/mine/${id}`, { method: 'DELETE' }),
};
