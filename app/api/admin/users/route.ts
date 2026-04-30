import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyAdminRequest } from '@/lib/request-auth'

export async function GET(req: NextRequest) {
    if (!verifyAdminRequest(req)) return NextResponse.json({ error: 'Không có quyền!' }, { status: 403 })

    // Lấy tất cả users
    const { data: users } = await supabase
    .from('users')
    .select('id, full_name, phone, lien_doan, chi_doi, role, created_at')
    .order('created_at', { ascending: false })

    if (!users) return NextResponse.json({ users: [] })

    const [quizSetResult, attemptsResult] = await Promise.all([
    supabase
        .from('quiz_sets')
        .select('id')
        .eq('is_active', true)
        .single(),
    supabase
        .from('attempts')
        .select('user_id, quiz_set_id, score')
        .not('finished_at', 'is', null),
    ])

    const quizSet = quizSetResult.data
    const attempts = attemptsResult.data

    // Gắn thống kê vào từng user
    const usersWithStats = users.map(u => {
    const userAttempts = attempts?.filter(a => a.user_id === u.id && a.quiz_set_id === quizSet?.id) || []
    const best_score = userAttempts.length > 0 ? Math.max(...userAttempts.map(a => a.score)) : 0
    return {
        ...u,
        total_attempts: userAttempts.length,
        best_score,
    }
    })

    return NextResponse.json({ users: usersWithStats })
}