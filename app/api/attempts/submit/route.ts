import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyUserRequest } from '@/lib/request-auth'

export async function POST(req: NextRequest) {
    const decoded = verifyUserRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Chưa đăng nhập!' }, { status: 401 })

    const { attemptId, answers, timeSpent } = await req.json()

    // Lấy attempt
    const { data: attempt, error: attemptError } = await supabase
    .from('attempts')
    .select('id, user_id, quiz_set_id, quiz_sets(id)')
    .eq('id', attemptId)
    .single()

    if (attemptError || !attempt) return NextResponse.json({ error: 'Không tìm thấy lượt thi!' }, { status: 404 })
    if (attempt.user_id !== decoded.id) return NextResponse.json({ error: 'Không có quyền nộp lượt thi này!' }, { status: 403 })

    // Lấy đáp án đúng
    const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('id, correct_answer')
    .eq('quiz_set_id', attempt.quiz_set_id)

    if (questionsError || !questions) return NextResponse.json({ error: 'Lỗi!' }, { status: 400 })

    // Tính điểm
    let score = 0
    questions.forEach(q => {
    if (answers[q.id] === q.correct_answer) score++
    })

    // Cập nhật kết quả
    const { error: updateError } = await supabase
    .from('attempts')
    .update({
        score,
        time_spent_seconds: timeSpent,
        finished_at: new Date().toISOString()
    })
    .eq('id', attemptId)

    if (updateError) {
        return NextResponse.json({ error: 'Không lưu được kết quả!' }, { status: 500 })
    }

    return NextResponse.json({
    score,
    total: questions.length,
    timeSpent
    })
}