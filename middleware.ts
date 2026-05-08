import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const pathname = request.nextUrl.pathname

  const protectedPaths = ['/dashboard', '/graph', '/repos', '/profile', '/analytics', '/onboarding', '/settings']
  const isProtected = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtected && !token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === '/auth/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (pathname === '/' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
