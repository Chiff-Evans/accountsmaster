import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { usePushNotifications } from '../hooks/usePushNotifications';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [advertiser, setAdvertiser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('advertiser_data')); }
    catch { return null; }
  });

  const { subscribe, unsubscribe, status: pushStatus } = usePushNotifications(api, advertiser?.id);

  const login = (token, advertiserData) => {
    localStorage.setItem('advertiser_token', token);
    localStorage.setItem('advertiser_data', JSON.stringify(advertiserData));
    setAdvertiser(advertiserData);
    // subscribe() will fire via the useEffect in usePushNotifications
  };

  const logout = () => {
    unsubscribe();
    localStorage.removeItem('advertiser_token');
    localStorage.removeItem('advertiser_data');
    setAdvertiser(null);
  };

  const refreshMe = async () => {
    try {
      const { data } = await api.get('/auth/me');
      localStorage.setItem('advertiser_data', JSON.stringify(data));
      setAdvertiser(data);
    } catch (err) {
      // Only clear a "remembered" session for an actual auth failure (invalid/
      // expired token, or the account no longer being usable) — a network
      // hiccup or server error shouldn't log out a still-valid 30-day login.
      if (err.response?.status === 401 || err.response?.status === 403) logout();
    }
  };

  useEffect(() => {
    if (advertiser && localStorage.getItem('advertiser_token')) refreshMe();
  }, []);

  return (
    <AuthContext.Provider value={{ advertiser, login, logout, refreshMe, pushStatus, subscribe, unsubscribe }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
