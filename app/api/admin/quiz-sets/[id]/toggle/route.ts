import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
    ) {
    const { id } = await params

    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Không có quyền!' }, { status: 403 })

    try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as { role: string }
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Không có quyền!' }, { status: 403 })
    } catch {
    return NextResponse.json({ error: 'Token lỗi!' }, { status: 401 })
    }

    const { is_active } = await req.json()

    // Nếu bật bộ đề này thì tắt tất cả bộ đề khác
    if (is_active) {
    await supabase.from('quiz_sets').update({ is_active: false }).neq('id', id)
    }

    const { error } = await supabase
    .from('quiz_sets')
    .update({ is_active })
    .eq('id', id)

    if (error) return NextResponse.json({ error: 'Cập nhật thất bại!' }, { status: 400 })
    return NextResponse.json({ success: true })
}