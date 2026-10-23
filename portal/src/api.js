import axios from 'axios';
import { CONFIG } from './config';

const api = axios.create({
  baseURL: CONFIG.apiUrl,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('member_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('member_token');
      localStorage.removeItem('member_data');
      // Only force-navigate from inside the portal. This also runs from a
      // background session check on mount (App-wide provider), which fires on
      // every route — a stale/expired token must not hijack a public page.
      const path = window.location.pathname;
      const isPublic = path === '/login' || path === '/register';
      if (!isPublic) window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
