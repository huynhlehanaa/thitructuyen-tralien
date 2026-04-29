import { NextRequest, NextResponse } from 'next/server'
import { dangNhap } from '@/lib/auth'
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
    const { phone, password } = await req.json()

    if (!phone || !password) {
    return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin!' }, { status: 400 })
    }

    const result = await dangNhap(phone, password)

    if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 401 })
    }

    const token = jwt.sign(
    { id: result.data.id, phone: result.data.phone, role: result.data.role },
    process.env.JWT_SECRET || 'secret_key',
    { expiresIn: '7d' }
    )

    return NextResponse.json({ success: true, token, user: result.data }, { status: 200 })
}