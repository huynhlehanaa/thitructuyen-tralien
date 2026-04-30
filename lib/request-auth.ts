import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export type JwtPayload = {
    id: string
    role: string
    phone?: string
}

export function verifyTokenString(token: string): JwtPayload | null {
    if (!token) return null
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as JwtPayload
    } catch {
        return null
    }
}

export function getRequestToken(req: NextRequest) {
    const headerToken = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (headerToken) return headerToken
    return req.cookies.get('token')?.value || ''
}

export function verifyAdminRequest(req: NextRequest): JwtPayload | null {
    const token = getRequestToken(req)
    const decoded = verifyTokenString(token)
    if (!decoded) return null
    return decoded.role === 'admin' ? decoded : null
}

export function verifyUserRequest(req: NextRequest): JwtPayload | null {
    const token = getRequestToken(req)
    return verifyTokenString(token)
}
