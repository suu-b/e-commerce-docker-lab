import { API_BASE_URL } from './config.js';

const ADDRESSES_URL = `${API_BASE_URL}/api/addresses`;

export const addressesApi = {
  create: async (token, addressData) => {
    const response = await fetch(ADDRESSES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(addressData),
    });
    return response.json();
  },

  list: async (token) => {
    const response = await fetch(ADDRESSES_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  update: async (token, addressId, addressData) => {
    const response = await fetch(`${ADDRESSES_URL}/${addressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(addressData),
    });
    return response.json();
  },

  delete: async (token, addressId) => {
    const response = await fetch(`${ADDRESSES_URL}/${addressId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
