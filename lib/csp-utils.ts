// CSP (Content Security Policy) utilities for ALX Polly
// Provides nonce generation and CSP header management

import { headers } from 'next/headers'
import crypto from 'crypto'

export interface CSPConfig {
  // Script sources
  scriptSrc: string[]
  // Style sources  
  styleSrc: string[]
  // Image sources
  imgSrc: string[]
  // Connect sources (API endpoints, WebSockets)
  connectSrc: string[]
  // Font sources
  fontSrc: string[]
  // Frame sources
  frameSrc: string[]
  // Object sources
  objectSrc: string[]
  // Base URI
  baseUri: string[]
  // Form action
  formAction: string[]
  // Frame ancestors
  frameAncestors: string[]
  // Additional directives
  upgradeInsecureRequests: boolean
}

// Default CSP configuration for ALX Polly
export const DEFAULT_CSP_CONFIG: CSPConfig = {
  scriptSrc: [
    "'self'",
    "'unsafe-eval'", // Required for Next.js development and some libraries
    "'unsafe-inline'", // Required for inline scripts during development
    "https://vercel.live" // Vercel live reload
  ],
  styleSrc: [
    "'self'",
    "'unsafe-inline'", // Required for CSS-in-JS and Tailwind
    "https://fonts.googleapis.com"
  ],
  imgSrc: [
    "'self'",
    "data:",
    "https:",
    "blob:" // For image uploads and generated content
  ],
  connectSrc: [
    "'self'",
    "https://vercel.live",
    "wss://vercel.live",
    "https://api.vercel.com",
    "https://*.supabase.co",
    "wss://*.supabase.co"
  ],
  fontSrc: [
    "'self'",
    "https://fonts.gstatic.com"
  ],
  frameSrc: [
    "'self'",
    "https://vercel.live"
  ],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
  upgradeInsecureRequests: true
}

// Generate a cryptographically secure nonce
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64')
}

// Build CSP header string from configuration
export function buildCSPHeader(config: CSPConfig, nonce?: string): string {
  const directives: string[] = []

  // Default source
  directives.push(`default-src 'self'`)

  // Script source with optional nonce
  const scriptSrc = [...config.scriptSrc]
  if (nonce) {
    scriptSrc.push(`'nonce-${nonce}'`)
  }
  directives.push(`script-src ${scriptSrc.join(' ')}`)

  // Style source with optional nonce
  const styleSrc = [...config.styleSrc]
  if (nonce) {
    styleSrc.push(`'nonce-${nonce}'`)
  }
  directives.push(`style-src ${styleSrc.join(' ')}`)

  // Other directives
  directives.push(`img-src ${config.imgSrc.join(' ')}`)
  directives.push(`connect-src ${config.connectSrc.join(' ')}`)
  directives.push(`font-src ${config.fontSrc.join(' ')}`)
  directives.push(`frame-src ${config.frameSrc.join(' ')}`)
  directives.push(`object-src ${config.objectSrc.join(' ')}`)
  directives.push(`base-uri ${config.baseUri.join(' ')}`)
  directives.push(`form-action ${config.formAction.join(' ')}`)
  directives.push(`frame-ancestors ${config.frameAncestors.join(' ')}`)

  if (config.upgradeInsecureRequests) {
    directives.push('upgrade-insecure-requests')
  }

  return directives.join('; ')
}

// Get CSP nonce from request headers (if using nonces)
export async function getCSPNonce(): Promise<string | undefined> {
  try {
    const headersList = await headers()
    return headersList.get('x-nonce') || undefined
  } catch {
    return undefined
  }
}

// Environment-specific CSP configurations
export const CSP_ENVIRONMENTS = {
  development: {
    ...DEFAULT_CSP_CONFIG,
    // More permissive for development
    scriptSrc: [
      "'self'",
      "'unsafe-eval'",
      "'unsafe-inline'",
      "https://vercel.live",
      "http://localhost:*" // Allow localhost scripts
    ],
    connectSrc: [
      "'self'",
      "https://vercel.live",
      "wss://vercel.live",
      "http://localhost:*",
      "ws://localhost:*",
      "https://*.supabase.co",
      "wss://*.supabase.co"
    ]
  },
  
  production: {
    ...DEFAULT_CSP_CONFIG,
    // More restrictive for production
    scriptSrc: [
      "'self'",
      "'unsafe-eval'", // Still needed for some Next.js functionality
      "https://vercel.live"
    ],
    connectSrc: [
      "'self'",
      "https://vercel.live",
      "https://api.vercel.com",
      "https://*.supabase.co",
      "wss://*.supabase.co"
    ]
  }
} as const

// Get environment-appropriate CSP configuration
export function getCSPConfig(): CSPConfig {
  const env = process.env.NODE_ENV || 'development'
  
  if (env === 'production') {
    return CSP_ENVIRONMENTS.production
  }
  
  return CSP_ENVIRONMENTS.development
}

// Generate complete CSP header for current environment
export function generateCSPHeader(nonce?: string): string {
  const config = getCSPConfig()
  return buildCSPHeader(config, nonce)
}

// Utility to create script tag with nonce
export function createScriptWithNonce(content: string, nonce?: string): string {
  const nonceAttr = nonce ? ` nonce="${nonce}"` : ''
  return `<script${nonceAttr}>${content}</script>`
}

// Utility to create style tag with nonce  
export function createStyleWithNonce(content: string, nonce?: string): string {
  const nonceAttr = nonce ? ` nonce="${nonce}"` : ''
  return `<style${nonceAttr}>${content}</style>`
}

export default {
  generateNonce,
  buildCSPHeader,
  getCSPNonce,
  getCSPConfig,
  generateCSPHeader,
  createScriptWithNonce,
  createStyleWithNonce,
  DEFAULT_CSP_CONFIG,
  CSP_ENVIRONMENTS
}
