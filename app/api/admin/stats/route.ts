import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyAdminRequest } from '@/lib/request-auth'

export async function GET(req: NextRequest) {
    if (!verifyAdminRequest(req)) return NextResponse.json({ error: 'Không có quyền!' }, { status: 403 })

    const [usersResult, attemptsResult, quizSetResult] = await Promise.all([
    supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'player'),
    supabase
        .from('attempts')
        .select('*', { count: 'exact', head: true })
        .not('finished_at', 'is', null),
    supabase
        .from('quiz_sets')
        .select('title, is_active')
        .eq('is_active', true)
        .single(),
    ])

    const totalUsers = usersResult.count
    const totalAttempts = attemptsResult.count
    const quizSet = quizSetResult.data

    return NextResponse.json({
    totalUsers: totalUsers ?? 0,
    totalAttempts: totalAttempts ?? 0,
    quizActive: !!quizSet,
    quizTitle: quizSet?.title ?? ''
    })
}