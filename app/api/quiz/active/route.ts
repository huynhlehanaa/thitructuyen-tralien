import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

export async function GET(req: NextRequest) {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Chưa đăng nhập!' }, { status: 401 })

    try {
    jwt.verify(token, process.env.JWT_SECRET || 'secret_key')
    } catch {
    return NextResponse.json({ error: 'Token không hợp lệ!' }, { status: 401 })
    }

    const { data: quizSet, error } = await supabase
    .from('quiz_sets')
    .select('*')
    .eq('is_active', true)
    .single()

    if (error || !quizSet) {
    return NextResponse.json({ quizSet: null }, { status: 200 })
    }

    return NextResponse.json({ quizSet }, { status: 200 })
}