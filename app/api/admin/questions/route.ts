import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyAdminRequest } from '@/lib/request-auth'

export async function GET(req: NextRequest) {
    if (!verifyAdminRequest(req)) return NextResponse.json({ error: 'Không có quyền!' }, { status: 403 })
    const { searchParams } = new URL(req.url)
    const quizSetId = searchParams.get('quizSetId')
    const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('quiz_set_id', quizSetId)
    .order('order_index', { ascending: true })
    return NextResponse.json({ questions: questions || [] })
}

export async function POST(req: NextRequest) {
    if (!verifyAdminRequest(req)) return NextResponse.json({ error: 'Không có quyền!' }, { status: 403 })
    const body = await req.json()
    const { data, error } = await supabase
    .from('questions')
    .insert({
        quiz_set_id: body.quiz_set_id,
        question_text: body.question_text,
        option_a: body.option_a,
        option_b: body.option_b,
        option_c: body.option_c,
        option_d: body.option_d,
        correct_answer: body.correct_answer,
        order_index: body.order_index,
    })
    .select().single()
    if (error) return NextResponse.json({ error: 'Thêm thất bại!' }, { status: 400 })
    return NextResponse.json({ data })
}