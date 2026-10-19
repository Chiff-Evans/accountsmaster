import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function flattenMenus(nodes) {
  return (nodes || []).reduce((acc, n) => {
    acc.push(n);
    if (n.children?.length) acc.push(...flattenMenus(n.children));
    return acc;
  }, []);
}

export function usePagePermissions() {
  const { menus, loading } = useAuth();
  const { pathname } = useLocation();

  const flat = flattenMenus(menus);
  const menu = flat.find(m => m.view_path === pathname);

  // Still loading — don't allow or block yet
  if (loading) {
    return { canView: null, canCreate: false, canEdit: false, canDelete: false };
  }

  // Page is registered in the menu system — use its exact permission values
  if (menu) {
    return {
      canView:   !!menu.can_view,
      canCreate: !!menu.can_create,
      canEdit:   !!menu.can_edit,
      canDelete: !!menu.can_delete,
    };
  }

  // Page is not in the menu system at all (e.g. a utility page) — allow full access
  return { canView: true, canCreate: true, canEdit: true, canDelete: true };
}
