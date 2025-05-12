import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Check for beta test mode cookie
  const isBetaTest = req.cookies.get('beta-test-mode')?.value === 'true'
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession()
  
  // If in beta test mode or user is authenticated, allow access
  if (isBetaTest || session) {
    // Extend the cookie expiration if in beta test mode
    if (isBetaTest) {
      res.cookies.set('beta-test-mode', 'true', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600, // 1 hour
      })
    }
    return res
  }
  
  // For protected routes, redirect to login
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard')
  if (isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
