import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { verifyAdminRequest } from '@/lib/request-auth'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!verifyAdminRequest(req)) return NextResponse.json({ error: 'Không có quyền!' }, { status: 403 })

    const { id: userId } = await params
    if (!userId) return NextResponse.json({ error: 'Thiếu ID người dùng!' }, { status: 400 })

    const { data: user } = await supabase
        .from('users')
        .select('id, phone')
        .eq('id', userId)
        .single()

    if (!user) return NextResponse.json({ error: 'Người dùng không tồn tại!' }, { status: 404 })

    const tempPassword = user.phone
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    const { error } = await supabase
        .from('users')
        .update({
            password_hash: `TEMP$${hashedPassword}`,
        })
        .eq('id', userId)

    if (error) return NextResponse.json({ error: 'Không thể reset mật khẩu!' }, { status: 500 })

    return NextResponse.json({ 
        success: true, 
        message: 'Đặt lại mật khẩu thành công! Người dùng cần đổi mật khẩu khi đăng nhập lại.',
        tempPassword,
    })
}
