'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface Stats {
    totalUsers: number
    totalAttempts: number
    quizActive: boolean
    quizTitle: string
}

export default function AdminDashboard() {
    const router = useRouter()
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
    const cachedStats = sessionStorage.getItem('admin-stats')
    if (cachedStats) {
        try {
        setStats(JSON.parse(cachedStats))
        setLoading(false)
        } catch {}
    }
    fetchStats()
    }, [])

    const fetchStats = async () => {
    try {
        const res = await fetch('/api/admin/stats')
        if (res.status === 401) {
        router.push('/dang-nhap')
        return
        }
        if (res.status === 403) {
        router.push('/dashboard')
        return
        }
        const data = await res.json()
        setStats(data)
        sessionStorage.setItem('admin-stats', JSON.stringify(data))
    } catch {
        toast.error('Lỗi tải dữ liệu!')
    } finally {
        setLoading(false)
    }
    }

    const handleLogout = async () => {
    try {
        await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
    }

    if (loading) return (
    <div className="h-screen overflow-hidden flex items-center justify-center px-4 relative">
        <Image src="/img/nen.webp" alt="background" fill priority quality={75} style={{ objectFit: 'cover' }} />
        <div className="relative z-10 rounded-[2rem] border border-white/60 bg-white/90 px-6 py-5 shadow-2xl backdrop-blur-sm text-red-700 font-bold">
        Đang tải...
        </div>
    </div>
    )

    return (
    <main className="h-screen overflow-hidden px-4 py-4 flex items-center justify-center relative">

        {/* Ảnh nền tối ưu */}
        <Image
        src="/img/nen.webp"
        alt="background"
        fill
        priority
        quality={75}
        style={{ objectFit: 'cover', objectPosition: 'center' }}
        />

        {/* Nội dung */}
        <div
        className="relative z-10 w-full rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-2xl backdrop-blur-sm overflow-y-auto max-h-[92vh]"
        style={{ marginLeft: '22%', width: '56%' }}
        >

        <div className="flex justify-between items-center mb-5">
            <div>
            <h1 className="font-bold text-2xl text-red-700">⚙️ Quản Trị Viên</h1>
            <p className="text-gray-500 text-sm">Thi Trực Tuyến Xã Trà Liên</p>
            </div>
            <button
            onClick={handleLogout}
            className="bg-red-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition shadow"
            >
            Đăng xuất
            </button>
        </div>

        {/* Thống kê */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 shadow text-center border border-red-100">
            <p className="text-4xl font-bold text-red-700">{stats?.totalUsers ?? 0}</p>
            <p className="text-gray-500 text-sm mt-1">Người đăng ký</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow text-center border border-red-100">
            <p className="text-4xl font-bold text-blue-600">{stats?.totalAttempts ?? 0}</p>
            <p className="text-gray-500 text-sm mt-1">Lượt thi</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow text-center border border-red-100 col-span-2 md:col-span-1">
            <p className={`text-2xl font-bold ${stats?.quizActive ? 'text-green-600' : 'text-gray-400'}`}>
                {stats?.quizActive ? '🟢 Đang mở' : '🔴 Chưa mở'}
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