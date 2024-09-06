import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export function middleware(request: Request) {
    const { pathname } = new URL(request.url)
    console.log('pathname', pathname)

    // Protect specific routes
    if (!pathname.startsWith('/login')) {
        const token = cookies().get('token')?.value
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    if (pathname === '/login') {
        const token = cookies().get('token')?.value
        if (token) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
}
