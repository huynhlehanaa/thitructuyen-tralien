import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

function verifyAdmin(req: NextRequest) {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return null
    try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as { role: string }
    return decoded.role === 'admin' ? decoded : null
    } catch { return null }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
    ) {
    if (!verifyAdmin(req)) return NextResponse.json({ error: 'Không có quyền!' }, { status: 403 })
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
    if (!verifyAdmin(req)) return NextResponse.json({ error: 'Không có quyền!' }, { status: 403 })
    const { id } = await params
    const { error } = await supabase.from('questions').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'Xóa thất bại!' }, { status: 400 })
    return NextResponse.json({ success: true })
}