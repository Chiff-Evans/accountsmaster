import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { usePushNotifications } from '../hooks/usePushNotifications';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [member, setMember] = useState(() => {
    try { return JSON.parse(localStorage.getItem('member_data')); }
    catch { return null; }
  });

  const { subscribe, unsubscribe, status: pushStatus } = usePushNotifications(api, member?.id);

  const login = (token, memberData) => {
    localStorage.setItem('member_token', token);
    localStorage.setItem('member_data', JSON.stringify(memberData));
    setMember(memberData);
    // subscribe() will fire via the useEffect in usePushNotifications
  };

  const logout = () => {
    unsubscribe();
    localStorage.removeItem('member_token');
    localStorage.removeItem('member_data');
    setMember(null);
  };

  const refreshMe = async () => {
    try {
      const { data } = await api.get('/auth/me');
      localStorage.setItem('member_data', JSON.stringify(data));
      setMember(data);
    } catch (err) {
      // Only clear a "remembered" session for an actual auth failure (invalid/
      // expired token, or the account no longer being usable) — a network
      // hiccup or server error shouldn't log out a still-valid 30-day login.
      if (err.response?.status === 401 || err.response?.status === 403) logout();
    }
  };

  useEffect(() => {
    if (member && localStorage.getItem('member_token')) refreshMe();
  }, []);

  return (
    <AuthContext.Provider value={{ member, login, logout, refreshMe, pushStatus, subscribe, unsubscribe }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
