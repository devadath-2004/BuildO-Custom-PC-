const API_BASE = '/api';

export const apiClient = {
  getToken() {
    return localStorage.getItem('buildo_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('buildo_token', token);
    } else {
      localStorage.removeItem('buildo_token');
    }
  },

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: response.statusText || 'An unexpected error occurred' };
      }
      throw new Error(errorData.error || errorData.message || 'Request failed');
    }

    // If downloading blob (e.g. PDF)
    if (options.asBlob) {
      return await response.blob();
    }

    if (response.status === 204) return null;
    return await response.json();
  },

  // Auth
  login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  sendOtp(userData) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  verifyOtp(verifyData) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(verifyData)
    });
  },

  resendOtp(email) {
    return this.request('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  getCurrentUser() {
    return this.request('/auth/me');
  },

  // Catalog
  getComponents() {
    return this.request('/components');
  },

  getComponentsByCategory(category) {
    return this.request(`/components/category/${category}`);
  },

  searchComponents(query) {
    return this.request(`/components/search?q=${encodeURIComponent(query)}`);
  },

  getPresets() {
    return this.request('/presets');
  },

  getPresetsByCategory(category) {
    return this.request(`/presets/category/${category}`);
  },

  // Configurator
  checkCompatibility(componentIds) {
    return this.request('/configurator/check', {
      method: 'POST',
      body: JSON.stringify({ componentIds })
    });
  },

  getCompatibleOptions(targetCategory, params = {}) {
    const query = new URLSearchParams({ targetCategory, ...params }).toString();
    return this.request(`/configurator/compatible-options?${query}`);
  },

  // Orders
  createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  getOrderById(id) {
    return this.request(`/orders/${id}`);
  },

  getOrderByNumber(orderNumber) {
    return this.request(`/orders/number/${orderNumber}`);
  },

  getMyOrders(email) {
    const q = email ? `?email=${encodeURIComponent(email)}` : '';
    return this.request(`/orders/my${q}`);
  },

  // Razorpay payments
  getRazorpayConfig() {
    return this.request('/payment/razorpay/config');
  },

  createRazorpayOrder(buildoOrderId) {
    return this.request('/payment/razorpay/orders', {
      method: 'POST',
      body: JSON.stringify({ buildoOrderId })
    });
  },

  verifyRazorpayPayment(paymentData) {
    return this.request('/payment/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  },

  // Invoices
  getInvoiceByOrderId(orderId) {
    return this.request(`/invoices/order/${orderId}`);
  },

  async downloadInvoicePdf(orderId, invoiceNumber = 'invoice') {
    const blob = await this.request(`/invoices/${orderId}/download`, { asBlob: true });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BuildO-Invoice-${invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Admin
  createComponent(data) {
    return this.request('/admin/components', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateComponent(id, data) {
    return this.request(`/admin/components/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteComponent(id) {
    return this.request(`/admin/components/${id}`, {
      method: 'DELETE'
    });
  },

  createPreset(data) {
    return this.request('/admin/presets', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updatePreset(id, data) {
    return this.request(`/admin/presets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deletePreset(id) {
    return this.request(`/admin/presets/${id}`, {
      method: 'DELETE'
    });
  },

  getAllAdminOrders() {
    return this.request('/admin/orders');
  },

  updateOrderStatus(orderId, status, trackingNumber) {
    return this.request(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, trackingNumber })
    });
  },

  getAdminStats() {
    return this.request('/admin/stats');
  }
};
