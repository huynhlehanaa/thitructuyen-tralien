import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

type JwtPayload = {
    id: string
    role: string
    phone?: string
}

export function getRequestToken(req: NextRequest) {
    const headerToken = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (headerToken) return headerToken
    return req.cookies.get('token')?.value || ''
}

export function verifyAdminRequest(req: NextRequest): JwtPayload | null {
    const token = getRequestToken(req)
    if (!token) return null
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as JwtPayload
        return decoded.role === 'admin' ? decoded : null
    } catch {
        return null
    }
}

export function verifyUserRequest(req: NextRequest): JwtPayload | null {
    const token = getRequestToken(req)
    if (!token) return null
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as JwtPayload
    } catch {
        return null
    }
}
