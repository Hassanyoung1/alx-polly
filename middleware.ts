import { NextRequest, NextResponse } from 'next/server'
import { SecurityMiddleware } from './lib/security-middleware'

export async function middleware(req: NextRequest) {
  // Apply security checks to API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const securityCheck = await SecurityMiddleware.validateRequest(req)
    
    if (!securityCheck.success) {
      return securityCheck.response
    }

    // Continue with request and add security headers
    const response = NextResponse.next()
    return SecurityMiddleware.addSecurityHeaders(response, securityCheck.csrfToken)
  }

  // For non-API routes, let Next.js handle CSP via next.config.ts
  // Just add basic security headers without CSP conflicts
  const response = NextResponse.next()
  
  // Only add non-CSP security headers to avoid conflicts
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
