import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  // For now, let client-side handle all auth routing
  // This can be enhanced later with server-side session checking
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
