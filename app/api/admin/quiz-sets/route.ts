import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyAdminRequest } from '@/lib/request-auth'

export async function GET(req: NextRequest) {
    if (!verifyAdminRequest(req)) return NextResponse.json({ error: 'Không có quyền!' }, { status: 403 })
    const { data: quizSets } = await supabase
    .from('quiz_sets')
    .select('*')
    .order('created_at', { ascending: false })
    return NextResponse.json({ quizSets: quizSets || [] })
}

export async function POST(req: NextRequest) {
    const admin = verifyAdminRequest(req)
    if (!admin) return NextResponse.json({ error: 'Không có quyền!' }, { status: 403 })
    const { title, exam_date, duration_seconds } = await req.json()
    const { data, error } = await supabase
    .from('quiz_sets')
    .insert({ title, exam_date, duration_seconds, is_active: false, created_by: admin.id })
    .select().single()
    if (error) return NextResponse.json({ error: 'Tạo thất bại!' }, { status: 400 })
    return NextResponse.json({ data })
}