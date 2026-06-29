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
  googleLogin:    (idToken) => apiFetch('/api/account/google-login', { method: 'POST', body: JSON.stringify({ idToken }) }, false),
  forgotPassword: (email) => apiFetch('/api/account/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword:  (data) => apiFetch('/api/account/reset-password',   { method: 'POST', body: JSON.stringify(data) }),
  changePassword: (data) => apiFetch('/api/account/change-password',  { method: 'POST', body: JSON.stringify(data) }),
  getUser: (email)=> apiFetch(`/api/account/users/${encodeURIComponent(email)}`),
  getUsers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/api/account/users${q ? `?${q}` : ''}`);
  },
};

// ── Vendor ────────────────────────────────────────────────────────────────────
export const vendor = {
  // Admin
  getAll:   (params = {}) => { const q = new URLSearchParams(params).toString(); return apiFetch(`/api/vendor${q ? `?${q}` : ''}`); },
  getById:  (id)          => apiFetch(`/api/vendor/${id}`),
  updateStatus:    (id, status, rejectionReason = null) =>
    apiFetch(`/api/vendor/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, rejectionReason }) }),
  verifyDocument:  (documentId, approved, rejectionReason = null) =>
    apiFetch(`/api/vendor/documents/${documentId}/verify`, { method: 'POST', body: JSON.stringify({ approved, rejectionReason }) }),
  // Vendor-self
  register:   (data)              => apiFetch('/api/vendor/register', { method: 'POST', body: JSON.stringify(data) }),
  getMine:    ()                  => apiFetch('/api/vendor/mine'),
  update:     (data)              => apiFetch('/api/vendor', { method: 'PUT', body: JSON.stringify(data) }),
  getTeam:    ()                  => apiFetch('/api/vendor/team'),
  uploadLogo: (vendorId, formData) => apiFetch(`/api/vendor/${vendorId}/logo`, { method: 'POST', body: formData, headers: {} }),
  addMember:    (vendorId, data)     => apiFetch(`/api/vendor/${vendorId}/members`, { method: 'POST', body: JSON.stringify(data) }),
  removeMember:     (vendorId, memberId)       => apiFetch(`/api/vendor/${vendorId}/members/${memberId}`, { method: 'DELETE' }),
  updateMemberRole: (vendorId, memberId, role) => apiFetch(`/api/vendor/${vendorId}/members/${memberId}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  uploadDocument:  (vendorId, formData) => apiFetch(`/api/vendor/${vendorId}/documents`, { method: 'POST', body: formData }),
  getBanks:        ()                   => apiFetch('/api/vendor/banks'),
  resolveAccount:  (accountNumber, bankCode) =>
    apiFetch(`/api/vendor/bank-accounts/resolve?accountNumber=${encodeURIComponent(accountNumber)}&bankCode=${encodeURIComponent(bankCode)}`),
  addBankAccount:     (vendorId, data)              => apiFetch(`/api/vendor/${vendorId}/bank-accounts`, { method: 'POST', body: JSON.stringify(data) }),
  setPrimaryAccount:  (vendorId, accountId)         => apiFetch(`/api/vendor/${vendorId}/bank-accounts/${accountId}/set-primary`, { method: 'PUT' }),
  deleteBankAccount:  (vendorId, accountId)         => apiFetch(`/api/vendor/${vendorId}/bank-accounts/${accountId}`, { method: 'DELETE' }),
  getEarnings:        (vendorId)                    => apiFetch(`/api/settlements/vendor/${vendorId}/earnings`),
  getSettlements:     (vendorId)                    => apiFetch(`/api/settlements/vendor/${vendorId}`),
  getDebts:           (vendorId, recovered)         => {
    const q = recovered !== undefined ? `?recovered=${recovered}` : '';
    return apiFetch(`/api/settlements/vendor/${vendorId}/debts${q}`);
  },
  acceptInvite: (memberId, token) =>
    apiFetch(`/api/vendor/invite/accept?memberId=${encodeURIComponent(memberId)}&token=${encodeURIComponent(token)}`),
  declineInvite: (memberId, token) =>
    apiFetch(`/api/vendor/invite/decline?memberId=${encodeURIComponent(memberId)}&token=${encodeURIComponent(token)}`),
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
  getByVendor: (vendorId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/api/product/GetVendorProducts/${vendorId}${q ? `?${q}` : ''}`);
  },

  create: (categoryId, data) =>
    apiFetch(`/api/product/${categoryId}`, { method: 'POST', body: JSON.stringify(data) }),

  update: (id, data) =>
    apiFetch(`/api/product/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete:     (id) => apiFetch(`/api/product/${id}`,      { method: 'DELETE' }),
  deleteMine: (id) => apiFetch(`/api/product/mine/${id}`, { method: 'DELETE' }),

  getVariants:  (productId)              => apiFetch(`/api/product/${productId}/variants`),
  addVariant:   (productId, data)        =>
    apiFetch(`/api/product/${productId}/variants`, { method: 'POST', body: JSON.stringify(data) }),
  updateVariant: (productId, variantId, data) =>
    apiFetch(`/api/product/${productId}/variants/${variantId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVariant: (productId, variantId) =>
    apiFetch(`/api/product/${productId}/variants/${variantId}`, { method: 'DELETE' }),

  submit:        (id)         => apiFetch(`/api/product/${id}/submit`,         { method: 'POST' }),
  approve:       (id)         => apiFetch(`/api/product/${id}/approve`,        { method: 'POST' }),
  reject:        (id, reason) => apiFetch(`/api/product/${id}/reject`,         { method: 'POST', body: JSON.stringify({ reason }) }),
  requestDelete: (id)         => apiFetch(`/api/product/${id}/request-delete`, { method: 'DELETE' }),
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

  add: (productId, quantity, variantId) =>
    apiFetch(`/api/ShoppingCart/CreateMyCartItem/${productId}`, {
      method: 'POST', body: JSON.stringify({ quantity, ...(variantId ? { variantId } : {}) }),
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

// ── Support Chat ──────────────────────────────────────────────────────────────
export const support = {
  chat: (message, sessionId = '', language = 'en') =>
    apiFetch('/api/support/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId, language }),
    }),
};

// ── Analytics ────────────────────────────────────────────────────────────────
export const analytics = {
  revenue:       (period = 'daily') => apiFetch(`/api/Analytics/revenue?period=${period}`),
  funnel:        (days = 30)        => apiFetch(`/api/Analytics/funnel?days=${days}`),
  topProducts:   (top = 10)         => apiFetch(`/api/Analytics/products/top?top=${top}`),
  categories:    ()                 => apiFetch('/api/Analytics/categories'),
  paymentHealth: ()                 => apiFetch('/api/Analytics/payments/health'),
  userGrowth:    (days = 30)        => apiFetch(`/api/Analytics/users/growth?days=${days}`),
  vendorMe:      ()                 => apiFetch('/api/Analytics/vendor/me'),
  vendorById:    (vendorId)         => apiFetch(`/api/Analytics/vendor/${vendorId}`),
};

// ── Settlements ───────────────────────────────────────────────────────────────
export const settlements = {
  getEligibleVendors: () => apiFetch('/api/settlements/eligible-vendors'),
  settle:     (vendorId) => apiFetch(`/api/settlements/vendor/${vendorId}/process`, { method: 'POST' }),
  processAll: ()         => apiFetch('/api/settlements/process-all', { method: 'POST' }),
  addDebt:    (vendorId, data) => apiFetch(`/api/settlements/vendor/${vendorId}/debt`, { method: 'POST', body: JSON.stringify(data) }),
};

// ── Returns ───────────────────────────────────────────────────────────────────
export const returns = {
  create:           (data)                    => apiFetch('/api/Return', { method: 'POST', body: JSON.stringify(data) }),
  getAll:           (params = {})             => { const q = new URLSearchParams(params).toString(); return apiFetch(`/api/Return${q ? `?${q}` : ''}`); },
  getById:          (returnId)                => apiFetch(`/api/Return/${returnId}`),
  getMine:          (params = {})             => { const q = new URLSearchParams(params).toString(); return apiFetch(`/api/Return/my-returns${q ? `?${q}` : ''}`); },
  getVendorReturns: (params = {})             => { const q = new URLSearchParams(params).toString(); return apiFetch(`/api/Return/vendor-returns${q ? `?${q}` : ''}`); },
  initiatorReview:  (returnId, data)          => apiFetch(`/api/Return/${returnId}/initiator-review`, { method: 'POST', body: JSON.stringify(data) }),
  approverReview:   (returnId, data)          => apiFetch(`/api/Return/${returnId}/approver-review`,  { method: 'POST', body: JSON.stringify(data) }),
  itemReceived:     (returnId)                => apiFetch(`/api/Return/${returnId}/item-received`,    { method: 'POST' }),
  processRefund:    (returnId)                => apiFetch(`/api/Return/${returnId}/process-refund`,   { method: 'POST' }),
};

// ── Customer Bank Account ─────────────────────────────────────────────────────
export const customerBankAccount = {
  getAll:     ()          => apiFetch('/api/CustomerBankAccount'),
  add:        (data)      => apiFetch('/api/CustomerBankAccount', { method: 'POST', body: JSON.stringify(data) }),
  setPrimary: (accountId) => apiFetch(`/api/CustomerBankAccount/${accountId}/set-primary`, { method: 'PUT' }),
  delete:     (accountId) => apiFetch(`/api/CustomerBankAccount/${accountId}`, { method: 'DELETE' }),
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
