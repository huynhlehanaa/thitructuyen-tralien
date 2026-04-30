import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { verifyTokenString } from '@/lib/request-auth'
import AdminActions from './admin-actions'

interface Stats {
    totalUsers: number
    totalAttempts: number
    quizActive: boolean
    quizTitle: string
}

const getCachedAdminStats = unstable_cache(
    async (): Promise<Stats> => {
        const [usersResult, attemptsResult, quizSetResult] = await Promise.all([
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

        return {
            totalUsers: usersResult.count ?? 0,
            totalAttempts: attemptsResult.count ?? 0,
            quizActive: !!quizSetResult.data,
            quizTitle: quizSetResult.data?.title ?? '',
        }
    },
    ['admin-stats'],
    { revalidate: 60 } // Cache 1 minute
)
export default async function AdminDashboard() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value || ''
    const decoded = verifyTokenString(token)

    if (!decoded) redirect('/dang-nhap')
    if (decoded.role !== 'admin') redirect('/dashboard')

    const stats = await getCachedAdminStats()

    return (
    <main className="min-h-screen px-4 py-6 sm:py-8 flex items-center justify-center relative">

        {/* Nội dung */}
        <div
        className="relative z-10 w-full max-w-6xl lg:max-w-none lg:w-[56%] lg:ml-[22%] rounded-[2rem] border border-white/60 bg-white/90 p-4 sm:p-6 shadow-2xl backdrop-blur-sm overflow-y-auto max-h-[94vh]"
        >

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
            <div>
            <h1 className="font-bold text-2xl text-red-700">⚙️ Quản Trị Viên</h1>
            <p className="text-gray-500 text-sm">Thi Trực Tuyến Xã Trà Liên</p>
            </div>
            <AdminActions />
        </div>

        {/* Thống kê */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 shadow text-center border border-red-100">
            <p className="text-4xl font-bold text-red-700">{stats.totalUsers}</p>
            <p className="text-gray-500 text-sm mt-1">Người đăng ký</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow text-center border border-red-100">
            <p className="text-4xl font-bold text-blue-600">{stats.totalAttempts}</p>
            <p className="text-gray-500 text-sm mt-1">Lượt thi</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow text-center border border-red-100 col-span-2 md:col-span-1">
            <p className={`text-2xl font-bold ${stats.quizActive ? 'text-green-600' : 'text-gray-400'}`}>
                {stats.quizActive ? '🟢 Đang mở' : '🔴 Chưa mở'}
            </p>
            <p className="text-gray-500 text-sm mt-1">Trạng thái bài thi</p>
            </div>
        </div>

        {/* Menu quản lý */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <Link href="/admin/bo-de"
            className="bg-white rounded-2xl p-6 shadow hover:shadow-md transition flex items-center gap-4 border border-red-100"
            >
            <div className="bg-green-100 rounded-xl w-14 h-14 flex items-center justify-center text-3xl">
                📋
            </div>
            <div>
                <p className="font-bold text-gray-800 text-lg">Quản lý bộ đề</p>
                <p className="text-gray-500 text-sm">Bật/tắt bộ đề, cài thời gian</p>
            </div>
            </Link>

            <Link href="/admin/nguoi-dung"
            className="bg-white rounded-2xl p-6 shadow hover:shadow-md transition flex items-center gap-4 border border-red-100"
            >
            <div className="bg-yellow-100 rounded-xl w-14 h-14 flex items-center justify-center text-3xl">
                👥
            </div>
            <div>
                <p className="font-bold text-gray-800 text-lg">Danh sách người dùng</p>
                <p className="text-gray-500 text-sm">Xem tất cả người đã đăng ký</p>
            </div>
            </Link>

            <Link href="/bang-xep-hang"
            className="bg-white rounded-2xl p-6 shadow hover:shadow-md transition flex items-center gap-4 border border-red-100"
            >
            <div className="bg-red-100 rounded-xl w-14 h-14 flex items-center justify-center text-3xl">
                🏆
            </div>
            <div>
                <p className="font-bold text-gray-800 text-lg">Bảng xếp hạng</p>
                <p className="text-gray-500 text-sm">Xem kết quả toàn bộ thí sinh</p>
            </div>
            </Link>

        </div>
        </div>
    </main>
    )
}