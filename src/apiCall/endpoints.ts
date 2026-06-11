/**
 * Centralised endpoint paths (relative to ENV.API_BASE_URL). Keeping them in
 * one place means a backend route change is a single-line edit.
 */
export const ENDPOINTS = {
  auth: {
    login:   '/auth/login',
    refresh: '/auth/refresh',
    logout:  '/auth/logout',
    me:      '/auth/me',
  },
  shipments: {
    list:   '/shipping-instructions',
    detail: (id: string) => `/shipping-instructions/${id}`,
    create: '/shipping-instructions',
    drafts: '/shipping-instructions?status=draft',
  },
  notifications: {
    list:        '/notifications',
    markAllRead: '/notifications/read-all',
  },
  parties: {
    list:   '/parties',
    create: '/parties',
  },
  messages: {
    conversations: '/messages',
    thread:        (ref: string) => `/messages/${ref}`,
    reply:         (ref: string) => `/messages/${ref}/reply`,
  },
  profile: {
    company:     '/company',
    companyById: (id: string) => `/companies/${id}`,
    taxIds:      '/company/tax-ids',
    preferences: '/preferences',
  },
} as const;
