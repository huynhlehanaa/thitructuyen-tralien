import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

export async function dangKy(phone: string, fullName: string, password: string, lienDoan: string, chiDoi: string) {
    const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('phone', phone)
    .single()

    if (existing) {
    return { error: 'Số điện thoại đã được đăng ký!' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const { data, error } = await supabase
    .from('users')
    .insert({ phone, full_name: fullName, password_hash: hashedPassword, lien_doan: lienDoan, chi_doi: chiDoi })
    .select()
    .single()

    if (error) return { error: 'Đăng ký thất bại!' }
    return { data }
}

export async function dangNhap(phone: string, password: string) {
    const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single()

    if (error || !user) return { error: 'Số điện thoại không tồn tại!' }

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) return { error: 'Mật khẩu không đúng!' }

    return { data: user }
}