import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    const requiresAuth =
    pathname.startsWith('/admin') ||
    pathname === '/dashboard' ||
    pathname === '/bang-xep-hang' ||
    pathname === '/doi-mat-khau' ||
    pathname.startsWith('/thi/')

    if (!requiresAuth) return NextResponse.next()

    const token = req.cookies.get('token')?.value
    if (!token) {
        const loginUrl = new URL('/dang-nhap', req.url)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/dashboard', '/bang-xep-hang', '/doi-mat-khau', '/thi/:path*'],
}
