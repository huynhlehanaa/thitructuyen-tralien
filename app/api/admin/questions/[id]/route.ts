import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyAdminRequest } from '@/lib/request-auth'

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
    ) {
    if (!verifyAdminRequest(req)) return NextResponse.json({ error: 'Không có quyền!' }, { status: 403 })
    const { id } = await params
    const body = await req.json()
    const { error } = await supabase
    .from('questions')
    .update({
        question_text: body.question_text,
        option_a: body.option_a,
        option_b: body.option_b,
        option_c: body.option_c,
        option_d: body.option_d,
        correct_answer: body.correct_answer,
    })
    .eq('id', id)
    if (error) return NextResponse.json({ error: 'Cập nhật thất bại!' }, { status: 400 })
    return NextResponse.json({ success: true })
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
    ) {
    if (!verifyAdminRequest(req)) return NextResponse.json({ error: 'Không có quyền!' }, { status: 403 })
    const { id } = await params
    const { error } = await supabase.from('questions').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'Xóa thất bại!' }, { status: 400 })
    return NextResponse.json({ success: true })
}