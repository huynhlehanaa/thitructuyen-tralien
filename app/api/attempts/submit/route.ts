import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Chưa đăng nhập!' }, { status: 401 })

    try {
    jwt.verify(token, process.env.JWT_SECRET || 'secret_key')
    } catch {
    return NextResponse.json({ error: 'Token không hợp lệ!' }, { status: 401 })
    }

    const { attemptId, answers, timeSpent } = await req.json()

    // Lấy attempt
    const { data: attempt } = await supabase
    .from('attempts')
    .select('*, quiz_sets(id)')
    .eq('id', attemptId)
    .single()

    if (!attempt) return NextResponse.json({ error: 'Không tìm thấy lượt thi!' }, { status: 404 })

    // Lấy đáp án đúng
    const { data: questions } = await supabase
    .from('questions')
    .select('id, correct_answer')
    .eq('quiz_set_id', attempt.quiz_set_id)

    if (!questions) return NextResponse.json({ error: 'Lỗi!' }, { status: 400 })

    // Tính điểm
    let score = 0
    questions.forEach(q => {
    if (answers[q.id] === q.correct_answer) score++
    })

    // Cập nhật kết quả
    await supabase
    .from('attempts')
    .update({
        score,
        time_spent_seconds: timeSpent,
        finished_at: new Date().toISOString()
    })
    .eq('id', attemptId)

    return NextResponse.json({
    score,
    total: questions.length,
    timeSpent
    })
}