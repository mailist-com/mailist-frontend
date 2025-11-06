// Environment configuration for production
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080/api/v1',
  apiVersion: 'v1',

  // Feature flags
  features: {
    enableMockData: false,
    enableDebugMode: false,
    enableAnalytics: true,
  },

  // API timeout settings
  timeout: 30000, // 30 seconds

  // Storage keys
  storage: {
    authToken: 'mailist_auth_token',
    refreshToken: 'mailist_refresh_token',
    currentUser: 'mailist_current_user',
  },

  // Pagination defaults
  pagination: {
    defaultPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
  },

  // File upload limits
  fileUpload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'text/csv', 'application/vnd.ms-excel'],
  },
};
