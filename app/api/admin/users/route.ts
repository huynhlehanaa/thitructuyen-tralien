import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

export async function GET(req: NextRequest) {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Chưa đăng nhập!' }, { status: 401 })

    try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as { role: string }
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Không có quyền!' }, { status: 403 })
    } catch {
    return NextResponse.json({ error: 'Token không hợp lệ!' }, { status: 401 })
    }

    // Lấy tất cả users
    const { data: users } = await supabase
    .from('users')
    .select('id, full_name, phone, lien_doan, chi_doi, role, created_at')
    .order('created_at', { ascending: false })

    if (!users) return NextResponse.json({ users: [] })

    // Lấy bộ đề đang active
    const { data: quizSet } = await supabase
    .from('quiz_sets')
    .select('id')
    .eq('is_active', true)
    .single()

    // Lấy thống kê lượt thi
    const { data: attempts } = await supabase
    .from('attempts')
    .select('user_id, score')
    .eq('quiz_set_id', quizSet?.id || '')
    .not('finished_at', 'is', null)

    // Gắn thống kê vào từng user
    const usersWithStats = users.map(u => {
    const userAttempts = attempts?.filter(a => a.user_id === u.id) || []
    const best_score = userAttempts.length > 0 ? Math.max(...userAttempts.map(a => a.score)) : 0
    return {
        ...u,
        total_attempts: userAttempts.length,
        best_score,
    }
    })

    return NextResponse.json({ users: usersWithStats })
}