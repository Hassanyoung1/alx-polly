// API Configuration for ALX Polly
// Centralized base URL and endpoint configurations

// Environment-based API base URL
export const API_CONFIG = {
  // Base URL for API calls
  BASE_URL: (() => {
    // For server-side rendering, use relative URLs
    if (typeof window === 'undefined') {
      return process.env.NEXT_PUBLIC_API_BASE_URL || 
             process.env.NEXT_PUBLIC_APP_URL || 
             'http://localhost:3002'; // Default to current port
    }
    // For client-side, use current origin
    return window.location.origin;
  })(),
  
  // API version prefix
  VERSION: 'v1',
  
  // Full API base path
  get API_BASE() {
    return `${this.BASE_URL}/api/${this.VERSION}`
  }
} as const

// API Endpoints - Standardized RESTful routes
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register', 
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    // Legacy endpoints (backward compatibility)
    SIGNIN: '/auth/signin',
    SIGNUP: '/auth/signup',
    SIGNOUT: '/auth/signout',
  },
  
  // Poll endpoints (RESTful)
  POLLS: {
    BASE: '/polls',
    BY_ID: (id: string) => `/polls/${id}`,
    VOTE: (id: string) => `/polls/${id}/vote`,
  },
  
  // Profile endpoints
  PROFILE: {
    GET: '/profile/get',
    UPDATE: '/profile/update',
  },
  
  // Legacy poll endpoints (backward compatibility)
  POLL: {
    CREATE: '/poll/create',
    UPDATE: '/poll/update',
    DELETE: '/poll/delete',
    GET: '/poll/get',
    LIST: '/poll/list',
    VOTE: (id: string) => `/poll/${id}/vote`,
  }
} as const

// Helper function to build full API URLs
export function buildApiUrl(endpoint: string): string {
  return `${API_CONFIG.API_BASE}${endpoint}`
}

// Environment detection
export const ENV = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const

// CORS configuration for different environments
export const CORS_CONFIG = {
  development: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000'],
    credentials: true,
  },
  production: {
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://alx-polly.vercel.app',
    credentials: true,
  },
  staging: {
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://staging-alx-polly.vercel.app',
    credentials: true,
  }
} as const

export default API_CONFIG
