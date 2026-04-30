import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyAdminRequest } from '@/lib/request-auth'

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!verifyAdminRequest(req)) return NextResponse.json({ error: 'Không có quyền!' }, { status: 403 })

    const { id: userId } = await params
    if (!userId) return NextResponse.json({ error: 'Thiếu ID người dùng!' }, { status: 400 })

    // Xóa tất cả attempts của người dùng trước
    await supabase
        .from('attempts')
        .delete()
        .eq('user_id', userId)

    // Xóa người dùng
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

    if (error) return NextResponse.json({ error: 'Không thể xóa tài khoản!' }, { status: 500 })

    return NextResponse.json({ success: true, message: 'Xóa tài khoản thành công!' })
}
