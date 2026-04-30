import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Chưa đăng nhập!' }, { status: 401 })

    let decoded
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as { id: string }
    } catch {
        return NextResponse.json({ error: 'Token không hợp lệ!' }, { status: 401 })
    }

    const { oldPassword, newPassword } = await req.json()

    if (!oldPassword || !newPassword) {
        return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin!' }, { status: 400 })
    }

    if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự!' }, { status: 400 })
    }

    // Lấy user hiện tại
    const { data: user } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', decoded.id)
        .single()

    if (!user) return NextResponse.json({ error: 'Người dùng không tồn tại!' }, { status: 404 })

    const storedHash = user.password_hash.startsWith('TEMP$') ? user.password_hash.slice(5) : user.password_hash

    // Kiểm tra mật khẩu cũ
    const isValid = await bcrypt.compare(oldPassword, storedHash)
    if (!isValid) {
        return NextResponse.json({ error: 'Mật khẩu cũ không chính xác!' }, { status: 401 })
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update mật khẩu
    const { error } = await supabase
        .from('users')
        .update({
            password_hash: hashedPassword,
        })
        .eq('id', decoded.id)

    if (error) return NextResponse.json({ error: 'Không thể cập nhật mật khẩu!' }, { status: 500 })

    return NextResponse.json({ success: true, message: 'Đổi mật khẩu thành công!' })
}
