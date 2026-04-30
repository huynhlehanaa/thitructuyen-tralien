import { NextRequest, NextResponse } from 'next/server'

function getRoleFromJwt(token: string): string | null {
    try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(normalized))
    return decoded?.role || null
    } catch {
    return null
    }
}

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

    const role = getRoleFromJwt(token)
    if (pathname.startsWith('/admin') && role && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if ((pathname === '/dashboard' || pathname.startsWith('/thi/')) && role === 'admin') {
    return NextResponse.redirect(new URL('/admin', req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/dashboard', '/bang-xep-hang', '/doi-mat-khau', '/thi/:path*'],
}
