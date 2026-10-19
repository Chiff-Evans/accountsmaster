import { createContext, useContext, useState, useEffect } from 'react';
import brandAmbassadorApi from '../brandAmbassadorApi';
import { usePushNotifications } from '../hooks/usePushNotifications';

const BrandAmbassadorAuthContext = createContext(null);

export function BrandAmbassadorAuthProvider({ children }) {
  const [brandAmbassador, setBrandAmbassador] = useState(() => {
    try { return JSON.parse(localStorage.getItem('brand_ambassador_data')); }
    catch { return null; }
  });

  const { subscribe, unsubscribe, status: pushStatus } = usePushNotifications(brandAmbassadorApi, brandAmbassador?.id);

  const login = (token, brandAmbassadorData) => {
    localStorage.setItem('brand_ambassador_token', token);
    localStorage.setItem('brand_ambassador_data', JSON.stringify(brandAmbassadorData));
    setBrandAmbassador(brandAmbassadorData);
    // subscribe() will fire via the useEffect in usePushNotifications
  };

  const logout = () => {
    unsubscribe();
    localStorage.removeItem('brand_ambassador_token');
    localStorage.removeItem('brand_ambassador_data');
    setBrandAmbassador(null);
  };

  const refreshMe = async () => {
    try {
      const { data } = await brandAmbassadorApi.get('/auth/me');
      localStorage.setItem('brand_ambassador_data', JSON.stringify(data));
      setBrandAmbassador(data);
    } catch (err) {
      // Only clear a "remembered" session for an actual auth failure (invalid/
      // expired token, or the account no longer being usable) — a network
      // hiccup or server error shouldn't log out a still-valid 30-day login.
      if (err.response?.status === 401 || err.response?.status === 403) logout();
    }
  };

  useEffect(() => {
    if (brandAmbassador && localStorage.getItem('brand_ambassador_token')) refreshMe();
  }, []);

  return (
    <BrandAmbassadorAuthContext.Provider value={{ brandAmbassador, login, logout, refreshMe, pushStatus, subscribe, unsubscribe }}>
      {children}
    </BrandAmbassadorAuthContext.Provider>
  );
}

export const useBrandAmbassadorAuth = () => useContext(BrandAmbassadorAuthContext);
