import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
    ) {
    const { id } = await params

    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Chưa đăng nhập!' }, { status: 401 })

    let userId: string
    try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as { id: string }
    userId = decoded.id
    } catch {
    return NextResponse.json({ error: 'Token không hợp lệ!' }, { status: 401 })
    }

    // Lấy bộ đề
    const { data: quizSet, error: quizError } = await supabase
    .from('quiz_sets')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

    if (quizError || !quizSet) {
    return NextResponse.json({ error: 'Bộ đề không tồn tại hoặc đã đóng!' }, { status: 404 })
    }

    // Lấy câu hỏi (không trả về đáp án đúng)
    const { data: questions } = await supabase
    .from('questions')
    .select('id, question_text, option_a, option_b, option_c, option_d, order_index')
    .eq('quiz_set_id', id)
    .order('order_index', { ascending: true })

    if (!questions || questions.length === 0) {
    return NextResponse.json({ error: 'Bộ đề chưa có câu hỏi!' }, { status: 400 })
    }

    // Đếm số lượt thi trước đó
    const { count } = await supabase
    .from('attempts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('quiz_set_id', id)

    // Tạo lượt thi mới
    const { data: attempt } = await supabase
    .from('attempts')
    .insert({
        user_id: userId,
        quiz_set_id: id,
        total_questions: questions.length,
        attempt_number: (count || 0) + 1,
    })
    .select()
    .single()

    return NextResponse.json({
    quizSet,
    questions,
    attemptId: attempt?.id
    })
}