import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://98.93.139.51/api-backend';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      const hadToken = !!localStorage.getItem('access_token');
      localStorage.removeItem('access_token');
      // Sadece oturum varken 401 gelirse yönlendir (token süresi dolmuş vb.)
      if (hadToken) window.location.href = '/giris';
    }
    return Promise.reject(err);
  }
);
