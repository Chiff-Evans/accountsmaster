import axios from 'axios';
import { CONFIG } from '../config';

const api = axios.create({ baseURL: CONFIG.apiUrl });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('sm_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sm_token');
      localStorage.removeItem('sm_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
