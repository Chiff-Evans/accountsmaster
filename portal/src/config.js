const defaults = {
  apiUrl:  '/api/advertiser-portal',
  appName: 'Accounts Master Portal',
};

export const CONFIG = { ...defaults, ...(window.__SM_PORTAL_CONFIG__ || {}) };
