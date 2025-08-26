// Environment variables configuration and validation
// This ensures type safety and provides defaults for missing values

interface EnvironmentConfig {
  // Application
  NODE_ENV: 'development' | 'production' | 'test'
  APP_URL: string
  APP_NAME: string
  
  // Database
  DATABASE_URL: string
  DATABASE_PROVIDER: string
  
  // Authentication
  NEXTAUTH_SECRET: string
  JWT_SECRET: string
  SESSION_MAX_AGE: number
  
  // Email
  EMAIL_PROVIDER: string
  EMAIL_FROM: string
  SMTP_HOST?: string
  SMTP_PORT?: number
  SMTP_USER?: string
  SMTP_PASS?: string
  
  // Security
  CORS_ORIGINS: string[]
  RATE_LIMIT_MAX: number
  RATE_LIMIT_WINDOW: number
  
  // Features
  ENABLE_REGISTRATION: boolean
  ENABLE_ANONYMOUS_VOTING: boolean
  ENABLE_POLL_EXPIRATION: boolean
  ENABLE_EMAIL_NOTIFICATIONS: boolean
  
  // Development
  DEBUG: boolean
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug'
  USE_MOCK_DATA: boolean
  
  // File Upload
  MAX_FILE_SIZE: number
  ALLOWED_FILE_TYPES: string[]
}

function getEnvVar(key: string, defaultValue?: string): string {
  if (typeof process === 'undefined' || !process.env) {
    return defaultValue || ''
  }
  const value = process.env[key]
  if (!value && defaultValue === undefined) {
    console.warn(`Environment variable ${key} is not set, using empty string`)
    return ''
  }
  return value || defaultValue || ''
}

function getEnvBool(key: string, defaultValue: boolean = false): boolean {
  if (typeof process === 'undefined' || !process.env) {
    return defaultValue
  }
  const value = process.env[key]
  if (!value) return defaultValue
  return value.toLowerCase() === 'true'
}

function getEnvNumber(key: string, defaultValue: number): number {
  if (typeof process === 'undefined' || !process.env) {
    return defaultValue
  }
  const value = process.env[key]
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  if (isNaN(parsed)) return defaultValue
  return parsed
}

function getEnvArray(key: string, defaultValue: string[] = []): string[] {
  if (typeof process === 'undefined' || !process.env) {
    return defaultValue
  }
  const value = process.env[key]
  if (!value) return defaultValue
  return value.split(',').map(item => item.trim()).filter(Boolean)
}

// Export the environment configuration
export const env: EnvironmentConfig = {
  // Application
  NODE_ENV: (process.env.NODE_ENV as EnvironmentConfig['NODE_ENV']) || 'development',
  APP_URL: getEnvVar('APP_URL', 'http://localhost:3001'),
  APP_NAME: getEnvVar('APP_NAME', 'ALX Polly - Polling App'),
  
  // Database
  DATABASE_URL: getEnvVar('DATABASE_URL', 'file:./dev.db'),
  DATABASE_PROVIDER: getEnvVar('DATABASE_PROVIDER', 'sqlite'),
  
  // Authentication
  NEXTAUTH_SECRET: getEnvVar('NEXTAUTH_SECRET', 'dev-secret-change-in-production'),
  JWT_SECRET: getEnvVar('JWT_SECRET', 'dev-jwt-secret-change-in-production'),
  SESSION_MAX_AGE: getEnvNumber('SESSION_MAX_AGE', 2592000), // 30 days
  
  // Email
  EMAIL_PROVIDER: getEnvVar('EMAIL_PROVIDER', 'mock'),
  EMAIL_FROM: getEnvVar('EMAIL_FROM', 'noreply@polly.local'),
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  
  // Security
  CORS_ORIGINS: getEnvArray('CORS_ORIGINS', ['http://localhost:3000', 'http://localhost:3001']),
  RATE_LIMIT_MAX: getEnvNumber('RATE_LIMIT_MAX', 100),
  RATE_LIMIT_WINDOW: getEnvNumber('RATE_LIMIT_WINDOW', 900000), // 15 minutes
  
  // Features
  ENABLE_REGISTRATION: getEnvBool('ENABLE_REGISTRATION', true),
  ENABLE_ANONYMOUS_VOTING: getEnvBool('ENABLE_ANONYMOUS_VOTING', true),
  ENABLE_POLL_EXPIRATION: getEnvBool('ENABLE_POLL_EXPIRATION', true),
  ENABLE_EMAIL_NOTIFICATIONS: getEnvBool('ENABLE_EMAIL_NOTIFICATIONS', false),
  
  // Development
  DEBUG: getEnvBool('DEBUG', process.env.NODE_ENV === 'development'),
  LOG_LEVEL: (process.env.LOG_LEVEL as EnvironmentConfig['LOG_LEVEL']) || 'info',
  USE_MOCK_DATA: getEnvBool('USE_MOCK_DATA', true),
  
  // File Upload
  MAX_FILE_SIZE: getEnvNumber('MAX_FILE_SIZE', 5242880), // 5MB
  ALLOWED_FILE_TYPES: getEnvArray('ALLOWED_FILE_TYPES', [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ])
}

// Validation function to check if all required environment variables are set
export function validateEnvironment(): void {
  const errors: string[] = []
  
  // Check required variables for production
  if (env.NODE_ENV === 'production') {
    if (env.NEXTAUTH_SECRET === 'dev-secret-change-in-production') {
      errors.push('NEXTAUTH_SECRET must be set to a secure value in production')
    }
    
    if (env.JWT_SECRET === 'dev-jwt-secret-change-in-production') {
      errors.push('JWT_SECRET must be set to a secure value in production')
    }
    
    if (env.DATABASE_URL === 'file:./dev.db') {
      errors.push('DATABASE_URL should not use SQLite in production')
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`)
  }
}

// Helper functions for common environment checks
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'

// Export individual environment variables for convenience
export const {
  APP_URL,
  APP_NAME,
  DATABASE_URL,
  ENABLE_REGISTRATION,
  ENABLE_ANONYMOUS_VOTING,
  ENABLE_POLL_EXPIRATION,
  DEBUG,
  USE_MOCK_DATA
} = env
