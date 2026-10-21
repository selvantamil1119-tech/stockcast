const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '3000' ? 'http://localhost:5001/api' : '/api');

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'}] ${url}:`, error);
    throw error;
  }
}

// Auth APIs
export const loginUser = (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
export const registerUser = (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
export const fetchProfile = () => request('/auth/profile');
export const updateProfile = (payload) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) });
export const regenerateApiKey = () => request('/auth/regenerate-key', { method: 'POST' });

// Inventory APIs
export const fetchInventorySummary = () => request('/inventory/summary');
export const fetchProducts = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/inventory${query ? `?${query}` : ''}`);
};
export const fetchProductBySku = (sku) => request(`/inventory/${sku}`);
export const createProduct = (payload) => request('/inventory', {
  method: 'POST',
  body: JSON.stringify(payload)
});
export const updateProduct = (sku, payload) => request(`/inventory/${sku}`, {
  method: 'PUT',
  body: JSON.stringify(payload)
});
export const adjustStock = (sku, payload) => request(`/inventory/${sku}/adjust`, {
  method: 'PATCH',
  body: JSON.stringify(payload)
});
export const deleteProduct = (sku) => request(`/inventory/${sku}`, {
  method: 'DELETE'
});

// Forecasting APIs
export const fetchProductForecast = (sku, horizon = 30, method = 'holt_smoothing') =>
  request(`/forecast/${sku}?horizon=${horizon}&method=${method}`);
export const fetchStockoutRisks = () => request('/forecast/risks');

// Replenishment APIs
export const fetchReplenishmentRecommendations = () => request('/replenishment/recommendations');
export const fetchPurchaseOrders = () => request('/replenishment/orders');
export const createPurchaseOrder = (payload) => request('/replenishment/orders', {
  method: 'POST',
  body: JSON.stringify(payload)
});
export const receivePurchaseOrder = (orderNumber) => request(`/replenishment/orders/${orderNumber}/receive`, {
  method: 'PATCH'
});

// Analytics APIs
export const fetchDashboardAnalytics = (days = 30) => request(`/analytics/dashboard?days=${days}`);
export const recordSale = (payload) => request('/analytics/sales', {
  method: 'POST',
  body: JSON.stringify(payload)
});
