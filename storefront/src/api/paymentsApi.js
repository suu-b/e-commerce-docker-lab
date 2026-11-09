import { API_BASE_URL } from './config.js';

const PAYMENTS_URL = `${API_BASE_URL}/api/payments`;

export const paymentsApi = {
  create: async (token, orderId, amount, paymentMethod) => {
    const response = await fetch(PAYMENTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        order_id: orderId,
        amount,
        payment_method: paymentMethod,
      }),
    });
    return response.json();
  },

  get: async (token, paymentId) => {
    const response = await fetch(`${PAYMENTS_URL}/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  refund: async (token, paymentId) => {
    const response = await fetch(`${PAYMENTS_URL}/refund/${paymentId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
