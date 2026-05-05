import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyUserRequest } from '@/lib/request-auth'

function shuffleArray<T>(items: T[]) {
    const result = [...items]
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
    ) {
    const { id } = await params

    const decoded = verifyUserRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Chưa đăng nhập!' }, { status: 401 })
    const userId = decoded.id

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
    .select('id, question_text, option_a, option_b, option_c, option_d, order_index, correct_answer')
    .eq('quiz_set_id', id)
    .order('order_index', { ascending: true })

    if (!questions || questions.length === 0) {
    return NextResponse.json({ error: 'Bộ đề chưa có câu hỏi!' }, { status: 400 })
    }

    const shuffledQuestions = shuffleArray(questions).map((question, idx) => {
        const optionEntries = shuffleArray([
            { originalLabel: 'A', text: question.option_a },
            { originalLabel: 'B', text: question.option_b },
            { originalLabel: 'C', text: question.option_c },
            { originalLabel: 'D', text: question.option_d },
        ])

        return {
            id: question.id,
            question_text: question.question_text,
            order_index: idx + 1,
            options: optionEntries.map((option, optionIndex) => ({
                displayLabel: ['A', 'B', 'C', 'D'][optionIndex],
                text: option.text,
                originalLabel: option.originalLabel,
            })),
        }
    })


        // Kiểm tra có attempt chưa hoàn thành không (reload lại trang, mất mạng, v.v.)
        const { data: incompleteAttempt } = await supabase
        .from('attempts')
        .select('id, created_at')
        .eq('user_id', userId)
        .eq('quiz_set_id', id)
        .is('finished_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

        // Nếu có attempt chưa hoàn thành và còn dưới 30 phút, cho phép tiếp tục
        if (incompleteAttempt) {
            const createdTime = new Date(incompleteAttempt.created_at).getTime()
            const now = Date.now()
            const elapsedMinutes = (now - createdTime) / (1000 * 60)
        
            if (elapsedMinutes < 30) {
                // Trả lại attempt cũ (cho phép tiếp tục)
                return NextResponse.json({
                    quizSet,
                    questions: shuffledQuestions,
                    attemptId: incompleteAttempt.id,
                    isResuming: true
                })
            } else {
                // Xóa attempt cũ (quá 30 phút)
                await supabase.from('attempts').delete().eq('id', incompleteAttempt.id)
            }
        }

        // Đếm số lượt thi đã hoàn thành
        const { count } = await supabase
        .from('attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('quiz_set_id', id)
        .not('finished_at', 'is', null)

        // Giới hạn 5 lượt
        const MAX_ATTEMPTS = 5
        if ((count || 0) >= MAX_ATTEMPTS) {
            return NextResponse.json({ 
                error: `Bạn đã dùng hết ${MAX_ATTEMPTS} lượt thi cho bài này!` 
            }, { status: 403 })
        }

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
    questions: shuffledQuestions,
    attemptId: attempt?.id
    })
}