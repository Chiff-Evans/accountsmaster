const defaults = {
  apiUrl:  '/api',
  appName: 'Accounts Master',
};

export const CONFIG = { ...defaults, ...(window.__SM_CONFIG__ || {}) };
