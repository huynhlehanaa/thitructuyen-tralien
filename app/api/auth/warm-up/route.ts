import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyTokenString } from '@/lib/request-auth'

export async function POST(req: NextRequest) {
    const token = req.cookies.get('token')?.value || ''
    const decoded = verifyTokenString(token)

    if (!decoded) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        if (decoded.role === 'admin') {
            // Pre-warm admin stats cache
            await Promise.all([
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
        } else {
            // Pre-warm player dashboard cache
            await Promise.all([
                supabase
                    .from('users')
                    .select('id, phone, full_name, role, lien_doan, chi_doi, password_hash')
                    .eq('id', decoded.id)
                    .single(),
                supabase
                    .from('quiz_sets')
                    .select('id, title, exam_date, duration_seconds, is_active')
                    .eq('is_active', true)
                    .single(),
            ])
        }

        return NextResponse.json({ success: true })
    } catch {
        // Silently fail - this is just pre-warming
        return NextResponse.json({ success: true })
    }
}
