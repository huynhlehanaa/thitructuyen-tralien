import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl
    if (!pathname.startsWith('/admin')) return NextResponse.next()

    const token = req.cookies.get('token')?.value
    if (!token) {
        const loginUrl = new URL('/dang-nhap', req.url)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}
