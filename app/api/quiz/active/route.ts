import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyUserRequest } from '@/lib/request-auth'

export async function GET(req: NextRequest) {
    if (!verifyUserRequest(req)) return NextResponse.json({ error: 'Chưa đăng nhập!' }, { status: 401 })

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