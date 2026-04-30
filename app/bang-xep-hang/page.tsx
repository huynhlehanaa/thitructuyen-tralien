import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { verifyTokenString } from '@/lib/request-auth'
import LeaderboardNav from './leaderboard-nav'

interface RankEntry {
    rank: number
    full_name: string
    lien_doan: string
    chi_doi: string
    best_score: number
    total_questions: number
    best_time: number
    total_attempts: number
}

async function getRankings(): Promise<RankEntry[]> {
    const { data: quizSet } = await supabase
        .from('quiz_sets')
        .select('id')
        .eq('is_active', true)
        .single()

    if (!quizSet?.id) return []

    const { data: allAttempts } = await supabase
        .from('attempts')
        .select('user_id')
        .eq('quiz_set_id', quizSet.id)
        .not('finished_at', 'is', null)

    const { data: attempts } = await supabase
        .from('attempts')
        .select(`
        user_id,
        score,
        time_spent_seconds,
        total_questions,
        users (full_name, lien_doan, chi_doi)
        `)
        .eq('quiz_set_id', quizSet.id)
        .not('finished_at', 'is', null)

    if (!attempts || attempts.length === 0) return []

    const userMap: Record<string, Omit<RankEntry, 'rank'>> = {}
    const attemptCountMap = (allAttempts || []).reduce((map: Record<string, number>, attempt: any) => {
        map[attempt.user_id] = (map[attempt.user_id] || 0) + 1
        return map
    }, {})

    attempts.forEach((a: any) => {
        const uid = a.user_id
        if (!userMap[uid]) {
        userMap[uid] = {
            full_name: a.users?.full_name || '',
            lien_doan: a.users?.lien_doan || '',
            chi_doi: a.users?.chi_doi || '',
            best_score: a.score,
            total_questions: a.total_questions,
            best_time: a.time_spent_seconds,
            total_attempts: attemptCountMap[uid] || 0,
        }
        } else {
        if (
            a.score > userMap[uid].best_score ||
            (a.score === userMap[uid].best_score && a.time_spent_seconds < userMap[uid].best_time)
        ) {
            userMap[uid].best_score = a.score
            userMap[uid].best_time = a.time_spent_seconds
            userMap[uid].total_questions = a.total_questions
        }
        }
    })

    return Object.values(userMap)
        .sort((a, b) => b.best_score - a.best_score || a.best_time - b.best_time)
        .map((r, idx) => ({ ...r, rank: idx + 1 }))
}

export default async function BangXepHang() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value || ''
    const decoded = verifyTokenString(token)
    if (!decoded) redirect('/dang-nhap')

    const userRole = decoded.role
    const rankings = await getRankings()

    const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    const medalColors = ['🥇', '🥈', '🥉']

    return (
    <main className="min-h-screen px-4 py-6 sm:py-8 flex items-center justify-center relative">

        {/* Nội dung */}
        <div
        className="relative z-10 w-full max-w-6xl lg:max-w-none lg:w-[56%] lg:ml-[22%] rounded-[2rem] border border-white/60 bg-white/90 p-4 sm:p-6 shadow-2xl backdrop-blur-sm flex flex-col overflow-hidden h-[92vh]"
        >

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
            <h1 className="font-bold text-2xl text-red-700">🏆 Bảng Xếp Hạng</h1>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">

            {/* Top 3 */}
            {rankings.length >= 3 && (
            <div className="hidden md:grid grid-cols-3 gap-3 mb-6">
                {[rankings[1], rankings[0], rankings[2]].map((r, i) => {
                const positions = [1, 0, 2]
                const pos = positions[i]
                const isFirst = pos === 0
                return r ? (
                    <div
                    key={r.rank}
                    className={`bg-white rounded-2xl border border-red-100 p-3 text-center shadow-sm ${isFirst ? 'scale-105 border-yellow-200 bg-yellow-50' : ''}`}
                    >
                    <div className="text-3xl mb-1">{medalColors[pos]}</div>
                    <p className="text-gray-800 font-bold text-sm leading-tight">{r.full_name}</p>
                    <p className="text-gray-500 text-xs mt-1 truncate">{r.chi_doi}</p>
                    <p className={`font-bold text-lg mt-2 ${isFirst ? 'text-yellow-600' : 'text-red-700'}`}>
                        {r.best_score}/{r.total_questions}
                    </p>
                    <p className="text-gray-500 text-xs">{formatTime(r.best_time)}</p>
                    </div>
                ) : null
                })}
            </div>
            )}

            {/* Danh sách đầy đủ */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-red-100">
            <div className="px-4 py-3 border-b border-red-100">
                <p className="text-red-700 font-bold">📋 Toàn bộ thí sinh ({rankings.length} người)</p>
            </div>

            {rankings.length === 0 ? (
                <div className="p-8 text-center">
                <p className="text-4xl mb-2">📭</p>
                <p className="text-gray-600">Chưa có ai tham gia thi</p>
                </div>
            ) : (
                <div className="divide-y divide-red-100">
                {rankings.map((r) => (
                    <div
                    key={r.rank}
                    className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 ${r.rank <= 3 ? 'bg-yellow-50' : ''}`}
                    >
                    <div className="w-8 text-center shrink-0">
                        {r.rank <= 3
                        ? <span className="text-xl">{medalColors[r.rank - 1]}</span>
                        : <span className="text-gray-500 font-bold text-sm">{r.rank}</span>
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-medium text-sm truncate">{r.full_name}</p>
                        <p className="text-gray-500 text-xs truncate">{r.lien_doan} · {r.chi_doi}</p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-yellow-600 font-bold">{r.best_score}/{r.total_questions}</p>
                        <p className="text-gray-500 text-xs">{formatTime(r.best_time)}</p>
                    </div>
                    <div className="text-center shrink-0 w-14">
                        <p className="text-gray-500 text-xs">{r.total_attempts} lượt</p>
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>

        </div>

        <p className="text-center text-gray-500 text-xs mt-4">
            Xếp hạng theo điểm cao nhất · Cùng điểm thì ai làm nhanh hơn xếp trên
        </p>

        <div className="mt-4 flex justify-center">
            <LeaderboardNav userRole={userRole} />
        </div>

        </div>
    </main>
    )
}