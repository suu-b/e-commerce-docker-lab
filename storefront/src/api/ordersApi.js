import { API_BASE_URL } from './config.js';

const ORDERS_URL = `${API_BASE_URL}/api/orders`;

export const ordersApi = {
  create: async (token, items) => {
    const response = await fetch(ORDERS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ items }),
    });
    return response.json();
  },

  list: async (token) => {
    const response = await fetch(ORDERS_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  get: async (token, orderId) => {
    const response = await fetch(`${ORDERS_URL}/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  updateStatus: async (token, orderId, status) => {
    const response = await fetch(`${ORDERS_URL}/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    return response.json();
  },
};
