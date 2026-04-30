'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface QuizSet {
    id: string
    title: string
    exam_date: string
    duration_seconds: number
    is_active: boolean
}

export default function AdminBoDe() {
    const router = useRouter()
    const [token, setToken] = useState('')
    const [quizSets, setQuizSets] = useState<QuizSet[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({
    title: '',
    exam_date: '',
    duration_seconds: 600
    })

    useEffect(() => {
    const t = localStorage.getItem('token')
    const u = localStorage.getItem('user')
    if (!t || !u) { router.push('/dang-nhap'); return }
    if (JSON.parse(u).role !== 'admin') { router.push('/dashboard'); return }
    setToken(t)
    const cachedQuizSets = sessionStorage.getItem('admin-quiz-sets')
    if (cachedQuizSets) {
        try {
        setQuizSets(JSON.parse(cachedQuizSets))
        setLoading(false)
        } catch {}
    }
    fetchQuizSets(t)
    }, [])

    const fetchQuizSets = async (t: string) => {
    const res = await fetch('/api/admin/quiz-sets', {
        headers: { Authorization: `Bearer ${t}` }
    })
    const data = await res.json()
    setQuizSets(data.quizSets || [])
    sessionStorage.setItem('admin-quiz-sets', JSON.stringify(data.quizSets || []))
    setLoading(false)
    }

    const handleCreate = async () => {
    if (!form.title || !form.exam_date) {
        toast.error('Vui lòng điền đầy đủ!')
        return
    }
    const res = await fetch('/api/admin/quiz-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
    })
    if (res.ok) {
        toast.success('Tạo bộ đề thành công!')
        setShowForm(false)
        setForm({ title: '', exam_date: '', duration_seconds: 600 })
        fetchQuizSets(token)
    } else {
        toast.error('Tạo thất bại!')
    }
    }

    const handleToggle = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/quiz-sets/${id}/toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: !current })
    })
    if (res.ok) {
        toast.success(current ? 'Đã tắt bộ đề!' : 'Đã bật bộ đề!')
        fetchQuizSets(token)
    }
    }

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
        className="relative z-10 w-full rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-2xl backdrop-blur-sm flex flex-col overflow-hidden"
        style={{ marginLeft: '22%', width: '56%', height: '98%' }}
        >
        <div className="flex items-center justify-between gap-4 mb-5">
            <h1 className="font-bold text-2xl text-red-700">📋 Quản Lý Bộ Đề</h1>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">

            <button
            onClick={() => setShowForm(!showForm)}
            className="bg-red-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-600 transition mb-6 w-full shadow"
            >
            {showForm ? '✕ Đóng' : '+ Tạo Bộ Đề Mới'}
            </button>

            {/* Form tạo bộ đề */}
            {showForm && (
            <div className="bg-white rounded-2xl p-6 shadow mb-6 border border-red-100">
                <h2 className="font-bold text-gray-800 mb-4">Thông tin bộ đề</h2>
                <div className="flex flex-col gap-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Tên bộ đề</label>
                    <input
                    type="text"
                    placeholder="VD: Thi tìm hiểu 136 năm sinh nhật Bác"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 text-gray-800"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Ngày thi</label>
                    <input
                    type="date"
                    value={form.exam_date}
                    onChange={e => setForm({ ...form, exam_date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 text-gray-800"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Thời gian làm bài: {Math.floor(form.duration_seconds / 60)} phút
                    </label>
                    <input
                    type="range"
                    min={300} max={3600} step={60}
                    value={form.duration_seconds}
                    onChange={e => setForm({ ...form, duration_seconds: Number(e.target.value) })}
                    className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>5 phút</span>
                    <span>60 phút</span>
                    </div>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-red-700 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition"
                >
                    Tạo Bộ Đề
                </button>
                </div>
            </div>
            )}

            {/* Danh sách bộ đề */}
            {loading ? (
            <p className="text-center text-gray-600">Đang tải...</p>
            ) : quizSets.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow border border-red-100">
                <p className="text-4xl mb-2">📭</p>
                <p className="text-gray-500">Chưa có bộ đề nào</p>
            </div>
            ) : (
            <div className="flex flex-col gap-4">
                {quizSets.map(qs => (
                <div key={qs.id} className="bg-white rounded-2xl p-5 shadow border border-red-100">
                    <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <p className="font-bold text-gray-800">{qs.title}</p>
                        <p className="text-gray-500 text-sm mt-1">
                        📅 {new Date(qs.exam_date).toLocaleDateString('vi-VN')} &nbsp;·&nbsp;
                        ⏱ {Math.floor(qs.duration_seconds / 60)} phút
                        </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${qs.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {qs.is_active ? '🟢 Đang mở' : '⚫ Tắt'}
                    </span>
                    </div>
                    <div className="flex gap-3 mt-4">
                    <button
                        onClick={() => handleToggle(qs.id, qs.is_active)}
                        className={`flex-1 py-2 rounded-xl font-medium text-sm transition ${qs.is_active ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-green-600 text-white hover:bg-green-500'}`}
                    >
                        {qs.is_active ? 'Tắt bộ đề' : 'Bật bộ đề'}
                    </button>
                    <button
                        onClick={() => router.push(`/admin/cau-hoi?quizSetId=${qs.id}`)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-medium text-sm hover:bg-blue-500 transition"
                    >
                        📝 Quản lý câu hỏi
                    </button>
                    </div>
                </div>
                ))}
            </div>
            )}

        </div>

        <div className="mt-4 flex justify-center">
            <button
            onClick={() => router.push('/admin')}
            className="rounded-lg bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 border border-gray-200"
            >
            Quay lại
            </button>
        </div>
        </div>
    </main>
    )
}