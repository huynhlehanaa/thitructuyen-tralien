import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyUserRequest } from '@/lib/request-auth'

export async function GET(req: NextRequest) {
    const decoded = verifyUserRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Chưa đăng nhập!' }, { status: 401 })
    const userId = decoded.id

    const { searchParams } = new URL(req.url)
    const quizSetId = searchParams.get('quizSetId')

    if (!quizSetId) return NextResponse.json(null, { status: 200 })

    const { data: attempts } = await supabase
    .from('attempts')
    .select('score, time_spent_seconds, total_questions')
    .eq('user_id', userId)
    .eq('quiz_set_id', quizSetId)
    .not('finished_at', 'is', null)

    if (!attempts || attempts.length === 0) {
    return NextResponse.json(null, { status: 200 })
    }

    const bestAttempt = attempts.reduce((best, current) => {
    if (!best) return current
    if (current.score > best.score) return current
    if (current.score === best.score && current.time_spent_seconds < best.time_spent_seconds) return current
    return best
    }, attempts[0])

    return NextResponse.json({
    quiz_set_id: quizSetId,
    best_score: bestAttempt.score,
    best_time: bestAttempt.time_spent_seconds,
    total_questions: bestAttempt.total_questions,
    total_attempts: attempts.length
    }, { status: 200 })
}