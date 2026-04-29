import { NextRequest, NextResponse } from 'next/server'
import { dangKy } from '@/lib/auth'

export async function POST(req: NextRequest) {
    const { phone, fullName, password, lienDoan, chiDoi } = await req.json()

    if (!phone || !fullName || !password || !lienDoan || !chiDoi) {
    return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin!' }, { status: 400 })
    }

    const result = await dangKy(phone, fullName, password, lienDoan, chiDoi)

    if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 200 })
}