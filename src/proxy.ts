import { NextResponse, type NextRequest } from 'next/server'

/** English is served at `/` (internally /en), Hindi at `/hi`. */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname === '/hi' || pathname.startsWith('/hi/')) return NextResponse.next()
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const url = req.nextUrl.clone()
    url.pathname = pathname.replace(/^\/en/, '') || '/'
    return NextResponse.redirect(url, 308)
  }
  const url = req.nextUrl.clone()
  url.pathname = `/en${pathname === '/' ? '' : pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!admin|api|_next|media|favicon.ico|.*\\..*).*)'],
}
