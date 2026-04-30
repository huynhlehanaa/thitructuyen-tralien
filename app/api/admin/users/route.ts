import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyAdminRequest } from '@/lib/request-auth'

export async function GET(req: NextRequest) {
    if (!verifyAdminRequest(req)) return NextResponse.json({ error: 'Không có quyền!' }, { status: 403 })

    const [usersResult, quizSetResult] = await Promise.all([
    supabase
        .from('users')
        .select('id, full_name, phone, lien_doan, chi_doi, role, created_at')
        .order('created_at', { ascending: false }),
    supabase
        .from('quiz_sets')
        .select('id')
        .eq('is_active', true)
        .single(),
    ])

    const users = usersResult.data
    const quizSet = quizSetResult.data

    if (!users) return NextResponse.json({ users: [] })

    const attempts = quizSet?.id
    ? (
        await supabase
        .from('attempts')
        .select('user_id, score')
        .eq('quiz_set_id', quizSet.id)
        .not('finished_at', 'is', null)
    ).data
    : []

    const statsByUser = new Map<string, { total_attempts: number; best_score: number }>()
    attempts?.forEach(a => {
    const existing = statsByUser.get(a.user_id)
    if (!existing) {
        statsByUser.set(a.user_id, { total_attempts: 1, best_score: a.score })
        return
    }
    existing.total_attempts += 1
    if (a.score > existing.best_score) existing.best_score = a.score
    })

    // Gắn thống kê vào từng user
    const usersWithStats = users.map(u => {
    const stats = statsByUser.get(u.id)
    return {
        ...u,
        total_attempts: stats?.total_attempts ?? 0,
        best_score: stats?.best_score ?? 0,
    }
    })

    return NextResponse.json({ users: usersWithStats })
}