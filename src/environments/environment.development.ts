// Environment configuration for development
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  apiVersion: 'v1',

  // Feature flags
  features: {
    enableMockData: false, // Mock data removed - using real API only
    enableDebugMode: true,
    enableAnalytics: false,
  },

  // API timeout settings
  timeout: 60000, // 60 seconds for development (longer for debugging)

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
    maxSize: 10 * 1024 * 1024, // 10MB in development
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  },
};
