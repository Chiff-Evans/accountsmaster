import axios from 'axios';

// Separate axios instance + token store from the member (business) portal
// API — a brand ambassador session and a member session are independent
// and can coexist.
const brandAmbassadorApi = axios.create({
  baseURL: '/api/brand-ambassador-portal',
  headers: { 'Content-Type': 'application/json' },
});

brandAmbassadorApi.interceptors.request.use(cfg => {
  const token = localStorage.getItem('brand_ambassador_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

brandAmbassadorApi.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('brand_ambassador_token');
      localStorage.removeItem('brand_ambassador_data');
      // Only force-navigate if we're actually inside the brand-ambassador portal.
      // This also runs from a background session check on mount (App-wide
      // provider), which fires on every route — a stale/expired token must not
      // hijack an unrelated public page like /register or the member side.
      const path = window.location.pathname;
      if (path.startsWith('/brand-ambassador/') && path !== '/brand-ambassador/login') {
        window.location.href = '/brand-ambassador/login';
      }
    }
    return Promise.reject(err);
  }
);

export default brandAmbassadorApi;
