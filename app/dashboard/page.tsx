import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { verifyTokenString } from '@/lib/request-auth'
import DashboardActions from './dashboard-actions'

type User = {
    id: string
    phone: string
    full_name: string
    role: string
    lien_doan: string
    chi_doi: string
    password_hash: string
}

type QuizSet = {
    id: string
    title: string
    exam_date: string
    duration_seconds: number
    is_active: boolean
}

type AttemptInfo = {
    quiz_set_id: string
    best_score: number
    total_attempts: number
}

async function getUserData(userId: string): Promise<User | null> {
    const { data } = await supabase
        .from('users')
        .select('id, phone, full_name, role, lien_doan, chi_doi, password_hash')
        .eq('id', userId)
        .single<User>()
    return data
}

async function getQuizAndAttempts(userId: string): Promise<{ quizSet: QuizSet | null; attemptInfo: AttemptInfo | null }> {
    const { data: quizSet } = await supabase
        .from('quiz_sets')
        .select('id, title, exam_date, duration_seconds, is_active')
        .eq('is_active', true)
        .single<QuizSet>()

    let attemptInfo: AttemptInfo | null = null
    if (quizSet?.id) {
        const { count: totalCount } = await supabase
            .from('attempts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('quiz_set_id', quizSet.id)
            .not('finished_at', 'is', null)

        const { data: attempts } = await supabase
            .from('attempts')
            .select('score, time_spent_seconds, total_questions')
            .eq('user_id', userId)
            .eq('quiz_set_id', quizSet.id)
            .not('finished_at', 'is', null)

        if ((totalCount || 0) > 0) {
            const bestAttempt = attempts && attempts.length > 0
                ? attempts.reduce((best, current) => {
                    if (!best) return current
                    if (current.score > best.score) return current
                    if (current.score === best.score && current.time_spent_seconds < best.time_spent_seconds) return current
                    return best
                }, attempts[0])
                : null

            attemptInfo = {
                quiz_set_id: quizSet.id,
                best_score: bestAttempt?.score ?? 0,
                total_attempts: totalCount || 0,
            }
        }
    }

    return { quizSet, attemptInfo }
}

export default async function DashboardPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value || ''
    const decoded = verifyTokenString(token)

    if (!decoded) redirect('/dang-nhap')
    if (decoded.role === 'admin') redirect('/admin')

    // Lấy user data và quiz data song song
    const [user, { quizSet, attemptInfo }] = await Promise.all([
        getUserData(decoded.id),
        getQuizAndAttempts(decoded.id)
    ])

    if (!user) redirect('/dang-nhap')

    const mustChangePassword = typeof user.password_hash === 'string' && user.password_hash.startsWith('TEMP$')
    if (mustChangePassword) redirect('/doi-mat-khau')

    return (
        <main className="min-h-screen px-4 py-6 sm:py-8 flex items-center justify-center relative">

            <div className="relative z-10 w-full max-w-5xl lg:max-w-none lg:w-[52%] lg:ml-[22%] rounded-[2rem] border border-white/60 bg-white/90 p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                    <h1 className="text-red-700 font-bold text-lg">🌟 Thi Trực Tuyến Xã Trà Liên</h1>
                    <DashboardActions />
                </div>

                <div className="bg-white rounded-2xl p-5 mb-4 shadow-lg border border-red-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow">
                            👤
                        </div>
                        <div>
                            <p className="font-bold text-red-700 text-lg">{user.full_name}</p>
                            <p className="text-gray-500 text-sm">📞 {user.phone}</p>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex flex-col gap-1">
                        <p className="text-sm text-gray-700">🏫 {user.lien_doan}</p>
                        <p className="text-sm text-gray-700">👥 {user.chi_doi}</p>
                    </div>
                </div>

                {attemptInfo && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white rounded-2xl p-4 text-center shadow border border-red-100">
                            <p className="text-3xl font-bold text-yellow-500">{attemptInfo.best_score}</p>
                            <p className="text-gray-600 text-sm mt-1">Điểm cao nhất</p>
                        </div>
                        <div className="bg-white rounded-2xl p-4 text-center shadow border border-red-100">
                            <p className="text-3xl font-bold text-yellow-500">{attemptInfo.total_attempts}</p>
                            <p className="text-gray-600 text-sm mt-1">Số lượt thi</p>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl p-5 mb-4 shadow-lg border border-red-100">
                    <h2 className="font-bold text-red-700 text-lg mb-3">📋 Bài Thi</h2>
                    {quizSet ? (
                    <div>
                        <p className="text-gray-800 font-medium mb-1">{quizSet.title}</p>
                        <p className="text-gray-500 text-sm mb-1">
                        ⏱ Thời gian: {Math.floor(quizSet.duration_seconds / 60)} phút
                        </p>
                        <p className="text-gray-500 text-sm mb-4">
                        🎯 Lượt thi: {attemptInfo?.total_attempts ?? 0}/5
                        {(attemptInfo?.total_attempts ?? 0) >= 5 && 
                            <span className="text-red-600 font-bold ml-2">— Đã hết lượt!</span>
                        }
                        </p>
                        {(attemptInfo?.total_attempts ?? 0) >= 5 ? (
                        <div className="bg-gray-100 text-gray-500 font-bold py-3 rounded-xl text-center border border-gray-200">
                            🔒 Đã dùng hết 5 lượt thi
                        </div>
                        ) : (
                        <Link
                            href={`/thi/${quizSet.id}`}
                            className="block bg-yellow-400 text-red-900 font-bold py-3 rounded-xl text-center hover:bg-yellow-300 transition shadow"
                        >
                            {attemptInfo && attemptInfo.total_attempts > 0 ? 
                            `🔄 Thi Lại (còn ${5 - attemptInfo.total_attempts} lượt)` : 
                            '🚀 Bắt Đầu Thi'
                            }
                        </Link>
                        )}
                    </div>
                    ) : (
                    <div className="text-center py-6">
                        <p className="text-4xl mb-2">📭</p>
                        <p className="text-gray-600">Chưa có bài thi nào được mở</p>
                    </div>
                    )}
                </div>

                <Link
                    href="/bang-xep-hang"
                    className="block bg-red-400 text-white font-bold py-4 rounded-2xl text-center text-lg hover:bg-red-300 transition shadow-lg"
                >
                    🏆 Xem Bảng Xếp Hạng
                </Link>
            </div>
        </main>
    )
}
