'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface User {
    id: string
    phone: string
    full_name: string
    role: string
    lien_doan: string
    chi_doi: string
}

interface QuizSet {
    id: string
    title: string
    exam_date: string
    duration_seconds: number
    is_active: boolean
}

interface AttemptInfo {
    quiz_set_id: string
    best_score: number
    total_attempts: number
}

export default function Dashboard() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [quizSet, setQuizSet] = useState<QuizSet | null>(null)
    const [attemptInfo, setAttemptInfo] = useState<AttemptInfo | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) { router.push('/dang-nhap'); return }
    const parsedUser = JSON.parse(userData)
    if (parsedUser.role === 'admin') { router.push('/admin'); return }
    setUser(parsedUser)
    fetchData(parsedUser.id, token)
    }, [])

    const fetchData = async (userId: string, token: string) => {
    try {
        const res = await fetch('/api/quiz/active', { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (data.quizSet) setQuizSet(data.quizSet)
        const attemptRes = await fetch(`/api/attempts/me?quizSetId=${data.quizSet?.id}`, { headers: { Authorization: `Bearer ${token}` } })
        const attemptData = await attemptRes.json()
        if (attemptData) setAttemptInfo(attemptData)
    } catch {
        toast.error('Lỗi tải dữ liệu!')
    } finally {
        setLoading(false)
    }
    }

    const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
    }

    const bgStyle = {
    backgroundImage: 'url(/img/nen.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    }

    if (loading) {
    return (
        <div className="h-screen overflow-hidden flex items-center justify-center px-4" style={bgStyle}>
        <div className="rounded-[2rem] border border-white/60 bg-white/90 px-6 py-5 shadow-2xl backdrop-blur-sm text-red-700 text-xl font-bold">
            Đang tải...
        </div>
        </div>
    )
    }

    return (
    <main className="h-screen overflow-hidden px-4 py-4 flex items-center justify-center" style={bgStyle}>
        <div className="w-full rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-2xl backdrop-blur-sm" style={{ marginLeft: '22%', width: '52%' }}>

        {/* Header */}
        <div className="flex justify-between items-center mb-5">
            <h1 className="text-red-700 font-bold text-lg">🌟 Thi Trực Tuyến Xã Trà Liên</h1>
            <button
            onClick={handleLogout}
            className="bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-600 transition shadow"
            >
            Đăng xuất
            </button>
        </div>

        {/* Thông tin người dùng */}
        <div className="bg-white rounded-2xl p-5 mb-4 shadow-lg border border-red-100">
            <div className="flex items-center gap-3 mb-3">
            <div className="bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow">
                👤
            </div>
            <div>
                <p className="font-bold text-red-700 text-lg">{user?.full_name}</p>
                <p className="text-gray-500 text-sm">📞 {user?.phone}</p>
            </div>
            </div>
            <div className="border-t border-gray-200 pt-3 flex flex-col gap-1">
            <p className="text-sm text-gray-700">🏫 {user?.lien_doan}</p>
            <p className="text-sm text-gray-700">👥 {user?.chi_doi}</p>
            </div>
        </div>

        {/* Thông tin lượt thi */}
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

        {/* Bộ đề thi */}
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

        {/* Bảng xếp hạng */}
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