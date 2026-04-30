import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyAdminRequest } from '@/lib/request-auth'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
    ) {
    const { id } = await params

    if (!verifyAdminRequest(req)) return NextResponse.json({ error: 'Không có quyền!' }, { status: 403 })

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