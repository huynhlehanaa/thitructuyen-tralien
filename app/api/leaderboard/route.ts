import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

export async function GET(req: NextRequest) {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Chưa đăng nhập!' }, { status: 401 })

    try {
    jwt.verify(token, process.env.JWT_SECRET || 'secret_key')
    } catch {
    return NextResponse.json({ error: 'Token không hợp lệ!' }, { status: 401 })
    }

    // Lấy bộ đề đang active
    const { data: quizSet } = await supabase
    .from('quiz_sets')
    .select('id, title')
    .eq('is_active', true)
    .single()

    if (!quizSet) return NextResponse.json({ rankings: [] })

    // Lấy tất cả attempts đã hoàn thành
    const { data: attempts } = await supabase
    .from('attempts')
    .select(`
        user_id,
        score,
        time_spent_seconds,
        total_questions,
        users (full_name, phone, lien_doan, chi_doi)
    `)
    .eq('quiz_set_id', quizSet.id)
    .not('finished_at', 'is', null)

    if (!attempts || attempts.length === 0) {
    return NextResponse.json({ rankings: [] })
    }

    // Gom nhóm theo user, lấy điểm cao nhất
    const userMap: Record<string, any> = {}
    attempts.forEach(a => {
    const uid = a.user_id
    if (!userMap[uid]) {
        userMap[uid] = {
        full_name: (a.users as any)?.full_name,
        lien_doan: (a.users as any)?.lien_doan,
        chi_doi: (a.users as any)?.chi_doi,
        best_score: a.score,
        best_time: a.time_spent_seconds,
        total_questions: a.total_questions,
        total_attempts: 1,
        }
    } else {
        userMap[uid].total_attempts++
        if (
        a.score > userMap[uid].best_score ||
        (a.score === userMap[uid].best_score && a.time_spent_seconds < userMap[uid].best_time)
        ) {
        userMap[uid].best_score = a.score
        userMap[uid].best_time = a.time_spent_seconds
        }
    }
    })

    // Sắp xếp: điểm cao → thời gian ít
    const rankings = Object.values(userMap)
    .sort((a, b) => b.best_score - a.best_score || a.best_time - b.best_time)
    .map((r, idx) => ({ ...r, rank: idx + 1 }))

    return NextResponse.json({ rankings, quizTitle: quizSet.title })
}