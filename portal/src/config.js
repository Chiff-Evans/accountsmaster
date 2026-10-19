const defaults = {
  apiUrl:  '/api/member-portal',
  appName: 'Accounts Master',
};

export const CONFIG = { ...defaults, ...(window.__SM_PORTAL_CONFIG__ || {}) };
