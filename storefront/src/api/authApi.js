import { API_BASE_URL } from './config.js';

const AUTH_URL = `${API_BASE_URL}/api/auth`;

export const authApi = {
  signup: async (name, email, password) => {
    const response = await fetch(`${AUTH_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },

  login: async (email, password) => {
    const response = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },
};
