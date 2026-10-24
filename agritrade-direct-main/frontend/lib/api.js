const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Helper function for API calls
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // Debug Token
  console.log(`API Request to ${endpoint}: Token present = ${!!token}`);

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Log detailed error for debugging
      console.error(`API Error ${response.status} at ${endpoint}:`, data);
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Auth API
export const authAPI = {
  login: async (email, password, role) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password, role },
    });
  },
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: userData,
    });
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    return apiRequest('/users/me');
  },
  updateProfile: async (data) => {
    return apiRequest('/users/me', {
      method: 'PUT',
      body: data,
    });
  },
  updatePreference: async (data) => {
    return apiRequest('/users/preferences', {
      method: 'PUT',
      body: data
    });
  },
  changePassword: async (data) => {
    return apiRequest('/users/change-password', {
      method: 'PUT',
      body: data
    });
  },
  getUsersByRole: async (role) => {
    return apiRequest(`/users/role/${role}`);
  }
};

// Wallet API
export const walletAPI = {
  getWallet: async () => {
    return apiRequest('/wallet');
  },
  addMoney: async (data) => {
    return apiRequest('/wallet/add-money', {
      method: 'POST',
      body: data,
    });
  },
  withdraw: async (amount) => {
    return apiRequest('/wallet/withdraw', {
      method: 'POST',
      body: { amount },
    });
  },
  addBankAccount: async (data) => {
    return apiRequest('/wallet/add-bank', {
      method: 'POST',
      body: data,
    });
  },
  getBankDetails: async () => {
    return apiRequest('/wallet/bank-details');
  },
  deleteBankAccount: async () => {
    return apiRequest('/wallet/delete-bank', {
      method: 'DELETE',
    });
  },
  getTransactions: async () => {
    return apiRequest('/wallet/transactions');
  },
  payFarmer: async (data) => {
    return apiRequest('/wallet/pay-farmer', {
      method: 'POST',
      body: data
    });
  },
};


// Bank API
export const bankAPI = {
  getBankDetails: async () => {
    return apiRequest('/bank');
  },
  updateBankDetails: async (data) => {
    return apiRequest('/bank', {
      method: 'POST',
      body: data,
    });
  },
};

// Subscription API
export const subscriptionAPI = {
  getSchemes: async () => {
    return apiRequest('/subscriptions/schemes');
  },
  getSubscriptions: async () => {
    return apiRequest('/subscriptions');
  },
  apply: async (schemeId) => {
    return apiRequest('/subscriptions/apply', {
      method: 'POST',
      body: { schemeId },
    });
  },
};

// Order API
export const orderAPI = {
  getOrders: async () => {
    return apiRequest('/orders');
  },
  getOrder: async (id) => {
    return apiRequest(`/orders/${id}`);
  },
  createOrder: async (data) => {
    return apiRequest('/orders', {
      method: 'POST',
      body: data,
    });
  },
  updateOrderStatus: async (orderId, status) => {
    return apiRequest(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: { status },
    });
  },
  getInvoice: async (orderId) => {
    return apiRequest(`/orders/${orderId}/invoice`);
  },
};


// Farmer API
export const farmerAPI = {
  getProfile: async () => {
    return apiRequest('/farmer/profile');
  },
  getCrops: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiRequest(`/farmer/crops?${queryString}`);
  },
  addCrop: async (cropData) => {
    return apiRequest('/farmer/crops', {
      method: 'POST',
      body: cropData,
    });
  },
  updateCrop: async (id, cropData) => {
    return apiRequest(`/farmer/crops/${id}`, {
      method: 'PUT',
      body: cropData,
    });
  },
  deleteCrop: async (id) => {
    return apiRequest(`/farmer/crops/${id}`, {
      method: 'DELETE',
    });
  },
  getOrders: async () => {
    return apiRequest('/farmer/orders');
  },
  updateOrderStatus: async (orderId, status) => {
    return apiRequest(`/farmer/orders/${orderId}/status`, {
      method: 'PUT',
      body: { status },
    });
  },
  getWallet: async () => {
    return apiRequest('/farmer/wallet');
  },
  getWalletTransactions: async () => {
    return apiRequest('/farmer/wallet/transactions');
  },
  withdrawMoney: async (amount) => {
    return apiRequest('/farmer/wallet/withdraw', {
      method: 'POST',
      body: { amount },
    });
  },
  getStats: async () => {
    return apiRequest('/farmer/stats');
  },
  getSchemes: async () => {
    return apiRequest('/farmer/schemes');
  },
  getMySchemeApplications: async () => {
    return apiRequest('/farmer/schemes/my-applications');
  },
  applyForScheme: async (schemeId) => {
    return apiRequest(`/farmer/schemes/${schemeId}/apply`, {
      method: 'POST'
    });
  },
  getNotifications: async () => {
    return apiRequest('/farmer/notifications');
  },
  markNotificationRead: async (id) => {
    return apiRequest(`/farmer/notifications/${id}/read`, {
      method: 'PUT'
    });
  },
  updateProfile: async (data) => {
    return apiRequest('/farmer/profile', {
      method: 'PUT',
      body: data
    });
  },
  changePassword: async (data) => {
    return apiRequest('/farmer/change-password', {
      method: 'PUT',
      body: data
    });
  },
  updateBankDetails: async (data) => {
    return apiRequest('/farmer/bank-details', {
      method: 'PUT',
      body: data
    });
  },
  updatePreference: async (data) => {
    return apiRequest('/farmer/preference', {
      method: 'PUT',
      body: data
    });
  },
  getMessages: async () => {
    return apiRequest('/farmer/messages');
  }
};

// Buyer API
export const buyerAPI = {
  getOrders: async () => {
    return apiRequest('/orders');
  },
  getStats: async () => {
    return apiRequest('/buyer/stats');
  },
  getFeaturedCrops: async () => {
    return apiRequest('/buyer/featured-crops');
  },
  getSubscriptionStatus: async () => {
    return apiRequest('/buyer/subscription/status');
  },
  getSubscriptionPlans: async () => {
    return apiRequest('/buyer/subscription/plans');
  },
  subscribe: async (data) => {
    return apiRequest('/buyer/subscription/subscribe', {
      method: 'POST',
      body: data
    });
  },
  browseCrops: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiRequest(`/buyer/browse-crops?${queryString}`);
  },
  getSubscriptionDetails: async (transactionId) => {
    return apiRequest(`/buyer/subscription/details/${transactionId}`);
  },
  downloadSubscriptionReceipt: async (transactionId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/buyer/subscription/receipt/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Download failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${transactionId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true;
  },
  getNotifications: async () => {
    return apiRequest('/buyer/notifications');
  },
  markNotificationRead: async (id) => {
    return apiRequest(`/buyer/notifications/${id}/read`, {
      method: 'PUT'
    });
  },
  markAllNotificationsRead: async () => {
    return apiRequest('/buyer/notifications/read-all', {
      method: 'PUT'
    });
  },
  deleteNotification: async (id) => {
    return apiRequest(`/buyer/notifications/${id}`, {
      method: 'DELETE'
    });
  }
};

// Admin API
export const adminAPI = {
  getStats: async () => {
    return apiRequest('/admin/stats');
  },
  getAnalytics: async () => {
    return apiRequest('/admin/analytics');
  },
  getReport: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/reports?${queryString}`);
  },
  getWallet: async () => {
    return apiRequest('/admin/wallet');
  },
  getRecentUsers: async () => {
    return apiRequest('/admin/recent-users');
  },
  getUsers: async (role = '') => {
    return apiRequest(`/admin/users?role=${role}`);
  },
  getSchemes: async () => {
    return apiRequest('/admin/schemes');
  },
  createScheme: async (data) => {
    return apiRequest('/admin/schemes', {
      method: 'POST',
      body: data
    });
  },
  updateScheme: async (id, data) => {
    return apiRequest(`/admin/schemes/${id}`, {
      method: 'PUT',
      body: data
    });
  },
  deleteScheme: async (id) => {
    return apiRequest(`/admin/schemes/${id}`, {
      method: 'DELETE'
    });
  },
  getSchemeApplications: async (id) => {
    return apiRequest(`/admin/schemes/${id}/applications`);
  },
  updateApplicationStatus: async (id, status) => {
    return apiRequest(`/admin/applications/${id}/status`, {
      method: 'PUT',
      body: { status }
    });
  },
  getMessages: async () => {
    return apiRequest('/admin/messages');
  },
  createMessage: async (data) => {
    return apiRequest('/admin/messages', {
      method: 'POST',
      body: data
    });
  },
  deleteMessage: async (id) => {
    return apiRequest(`/admin/messages/${id}`, {
      method: 'DELETE'
    });
  },
  getTransactions: async (params = {}) => { // params: { type, status, startDate, endDate }
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/transactions?${queryString}`);
  },
  getCrops: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiRequest(`/admin/crops?${queryString}`);
  },
  updateCropStatus: async (id, status) => {
    return apiRequest(`/admin/crops/${id}/status`, {
      method: 'PUT',
      body: { status }
    });
  },
  deleteCrop: async (id) => {
    return apiRequest(`/admin/crops/${id}`, {
      method: 'DELETE'
    });
  }
};

// Subsidy Chat API
export const subsidyChatAPI = {
  // Farmer endpoints
  getFarmerChat: async () => {
    return apiRequest('/subsidy-chat/farmer/chat');
  },
  sendFarmerMessage: async (message) => {
    return apiRequest('/subsidy-chat/farmer/send', {
      method: 'POST',
      body: { message }
    });
  },

  // Admin endpoints
  getAllChats: async () => {
    return apiRequest('/subsidy-chat/admin/chats');
  },
  getAdminChat: async (farmerId) => {
    return apiRequest(`/subsidy-chat/admin/chat/${farmerId}`);
  },
  sendAdminMessage: async (farmerId, message) => {
    return apiRequest('/subsidy-chat/admin/send', {
      method: 'POST',
      body: { farmerId, message }
    });
  },
  updateChatStatus: async (farmerId, status) => {
    return apiRequest(`/subsidy-chat/admin/status/${farmerId}`, {
      method: 'PATCH',
      body: { status }
    });
  }
};

// Public API
export const publicAPI = {
  getStats: async () => {
    return apiRequest('/public/stats');
  }
};
