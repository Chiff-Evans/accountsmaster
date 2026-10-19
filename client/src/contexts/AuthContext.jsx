import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api';
import { hashPassword } from '../utils/crypto';
import { usePushNotifications } from '../hooks/usePushNotifications';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sm_user')); } catch { return null; }
  });
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);

  const { subscribe, unsubscribe, status: pushStatus } = usePushNotifications(api, user?.id);

  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password: await hashPassword(password) });
    localStorage.setItem('sm_token', data.token);
    localStorage.setItem('sm_user', JSON.stringify(data.user));
    setUser(data.user);
    const { data: menuData } = await api.get('/auth/menus');
    setMenus(menuData);
    // subscribe() will fire via the useEffect in usePushNotifications
    return data;
  }, []);

  const logout = useCallback(async () => {
    unsubscribe();
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('sm_token');
    localStorage.removeItem('sm_user');
    setUser(null);
    setMenus([]);
  }, [unsubscribe]);

  const updateUser = useCallback(updates => {
    setUser(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('sm_user', JSON.stringify(next));
      return next;
    });
  }, []);

  const loadMenus = useCallback(async () => {
    if (!localStorage.getItem('sm_token')) return;
    setLoading(true);
    try {
      const { data } = await api.get('/auth/menus');
      setMenus(data);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, menus, loading, login, logout, loadMenus, setMenus, updateUser, pushStatus, subscribe, unsubscribe }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
