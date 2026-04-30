import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Chưa đăng nhập!' }, { status: 401 })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as { role: string }
        if (decoded.role !== 'admin') return NextResponse.json({ error: 'Không có quyền!' }, { status: 403 })
    } catch {
        return NextResponse.json({ error: 'Token không hợp lệ!' }, { status: 401 })
    }

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
