import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { unstable_cache } from 'next/cache'
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

const getCachedUserData = unstable_cache(
    async (userId: string): Promise<User | null> => {
        const { data } = await supabase
            .from('users')
            .select('id, phone, full_name, role, lien_doan, chi_doi, password_hash')
            .eq('id', userId)
            .single<User>()
        return data
    },
    ['dashboard-user'],
    { revalidate: 300 } // Cache 5 minutes
)

const getCachedQuizAndAttempts = unstable_cache(
    async (userId: string): Promise<{ quizSet: QuizSet | null; attemptInfo: AttemptInfo | null }> => {
        const { data: quizSet } = await supabase
            .from('quiz_sets')
            .select('id, title, exam_date, duration_seconds, is_active')
            .eq('is_active', true)
            .single<QuizSet>()

        let attemptInfo: AttemptInfo | null = null
        if (quizSet?.id) {
            const { data: attempts } = await supabase
                .from('attempts')
                .select('score, time_spent_seconds, total_questions')
                .eq('user_id', userId)
                .eq('quiz_set_id', quizSet.id)
                .not('finished_at', 'is', null)

            if (attempts && attempts.length > 0) {
                const bestAttempt = attempts.reduce((best, current) => {
                    if (!best) return current
                    if (current.score > best.score) return current
                    if (current.score === best.score && current.time_spent_seconds < best.time_spent_seconds) return current
                    return best
                }, attempts[0])

                attemptInfo = {
                    quiz_set_id: quizSet.id,
                    best_score: bestAttempt.score,
                    total_attempts: attempts.length,
                }
            }
        }

        return { quizSet, attemptInfo }
    },
    ['dashboard-quiz-attempts'],
    { revalidate: 60 } // Cache 1 minute
)

export default async function DashboardPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value || ''
    const decoded = verifyTokenString(token)

    if (!decoded) redirect('/dang-nhap')
    if (decoded.role === 'admin') redirect('/admin')

    // Lấy user data và quiz data song song
    const [user, { quizSet, attemptInfo }] = await Promise.all([
        getCachedUserData(decoded.id),
        getCachedQuizAndAttempts(decoded.id)
    ])

    if (!user) redirect('/dang-nhap')

    const mustChangePassword = typeof user.password_hash === 'string' && user.password_hash.startsWith('TEMP$')
    if (mustChangePassword) redirect('/doi-mat-khau')

    return (
        <main className="h-screen overflow-hidden px-4 py-4 flex items-center justify-center relative">

            <div className="relative z-10 w-full rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-2xl backdrop-blur-sm" style={{ marginLeft: '22%', width: '52%' }}>
                <div className="flex justify-between items-center mb-5">
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
                            <p className="text-gray-500 text-sm mb-4">
                                ⏱ Thời gian: {Math.floor(quizSet.duration_seconds / 60)} phút
                            </p>
                            <Link
                                href={`/thi/${quizSet.id}`}
                                className="block bg-yellow-400 text-red-900 font-bold py-3 rounded-xl text-center hover:bg-yellow-300 transition shadow"
                            >
                                {attemptInfo && attemptInfo.total_attempts > 0 ? 'Thi Lại' : 'Bắt Đầu Thi'}
                            </Link>
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
