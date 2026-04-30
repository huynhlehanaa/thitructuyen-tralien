'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { Suspense } from 'react'

interface Question {
    id: string
    question_text: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_answer: string
    order_index: number
}

function CauHoiContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const quizSetId = searchParams.get('quizSetId')
    const [questions, setQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [form, setForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    })

    useEffect(() => {
    if (!quizSetId) { router.push('/admin/bo-de'); return }
    fetchQuestions()
    }, [])

    const fetchQuestions = async () => {
    const res = await fetch(`/api/admin/questions?quizSetId=${quizSetId}`)
    if (res.status === 401) { router.push('/dang-nhap'); return }
    if (res.status === 403) { router.push('/dashboard'); return }
    const data = await res.json()
    setQuestions(data.questions || [])
    setLoading(false)
    }

    const resetForm = () => {
    setForm({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A' })
    setEditId(null)
    setShowForm(false)
    }

    const handleSubmit = async () => {
    if (!form.question_text || !form.option_a || !form.option_b || !form.option_c || !form.option_d) {
        toast.error('Vui lòng điền đầy đủ!')
        return
    }
    const url = editId ? `/api/admin/questions/${editId}` : '/api/admin/questions'
    const method = editId ? 'PUT' : 'POST'
    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, quiz_set_id: quizSetId, order_index: questions.length + 1 })
    })
    if (res.ok) {
        toast.success(editId ? 'Cập nhật thành công!' : 'Thêm câu hỏi thành công!')
        resetForm()
        fetchQuestions()
    } else {
        toast.error('Thao tác thất bại!')
    }
    }

    const handleEdit = (q: Question) => {
    setForm({
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
    })
    setEditId(q.id)
    setShowForm(true)
    }

    const handleDelete = async (id: string) => {
    if (!confirm('Xác nhận xóa câu hỏi này?')) return
    const res = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE'
    })
    if (res.ok) {
        toast.success('Đã xóa!')
        fetchQuestions()
    }
    }

    const answerColors: Record<string, string> = {
    A: 'bg-blue-50 border-blue-200',
    B: 'bg-green-50 border-green-200',
    C: 'bg-yellow-50 border-yellow-200',
    D: 'bg-red-50 border-red-200',
    }

    return (
    <main className="min-h-screen px-4 py-6 sm:py-8 flex items-center justify-center relative">

        {/* Nội dung */}
        <div
        className="relative z-10 w-full max-w-6xl lg:max-w-none lg:w-[56%] lg:ml-[22%] rounded-[2rem] border border-white/60 bg-white/90 p-4 sm:p-6 shadow-2xl backdrop-blur-sm flex flex-col overflow-hidden h-[92vh]"
        >
        <div className="flex items-center justify-between gap-4 mb-5">
            <div>
            <h1 className="font-bold text-2xl text-red-700">📝 Quản Lý Câu Hỏi</h1>
            <p className="text-gray-500 text-sm">Tổng: {questions.length} câu hỏi</p>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">

            <button
            onClick={() => { resetForm(); setShowForm(!showForm) }}
            className="bg-red-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-600 transition mb-6 w-full shadow"
            >
            {showForm && !editId ? '✕ Đóng' : '+ Thêm Câu Hỏi Mới'}
            </button>

            {/* Form thêm */}
            {showForm && !editId && (
            <div className="bg-white rounded-2xl p-6 shadow mb-6 border border-red-100">
                <h2 className="font-bold text-gray-800 mb-4">
                ➕ Thêm câu hỏi mới
                </h2>
                <div className="flex flex-col gap-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Nội dung câu hỏi</label>
                    <textarea
                    rows={3}
                    placeholder="Nhập câu hỏi..."
                    value={form.question_text}
                    onChange={e => setForm({ ...form, question_text: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 text-gray-800 resize-none"
                    />
                </div>

                {(['A', 'B', 'C', 'D'] as const).map(opt => (
                    <div key={opt}>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Đáp án {opt}
                        {form.correct_answer === opt && <span className="ml-2 text-green-600">✓ Đúng</span>}
                    </label>
                    <input
                        type="text"
                        placeholder={`Nhập đáp án ${opt}...`}
                        value={form[`option_${opt.toLowerCase()}` as keyof typeof form]}
                        onChange={e => setForm({ ...form, [`option_${opt.toLowerCase()}`]: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 text-gray-800"
                    />
                    </div>
                ))}

                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Đáp án đúng</label>
                    <div className="grid grid-cols-4 gap-2">
                    {(['A', 'B', 'C', 'D'] as const).map(opt => (
                        <button
                        key={opt}
                        onClick={() => setForm({ ...form, correct_answer: opt })}
                        className={`py-3 rounded-xl font-bold text-lg transition ${
                            form.correct_answer === opt
                            ? 'bg-green-600 text-white shadow-md scale-105'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        >
                        {opt}
                        </button>
                    ))}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                    onClick={handleSubmit}
                    className="flex-1 bg-red-700 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition"
                    >
                    {editId ? 'Cập Nhật' : 'Thêm Câu Hỏi'}
                    </button>
                    <button
                    onClick={resetForm}
                    className="px-6 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition"
                    >
                    Hủy
                    </button>
                </div>
                </div>
            </div>
            )}

            {/* Danh sách câu hỏi */}
            {loading ? (
            <p className="text-center text-gray-500">Đang tải...</p>
            ) : questions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow border border-red-100">
                <p className="text-4xl mb-2">📭</p>
                <p className="text-gray-500">Chưa có câu hỏi nào</p>
            </div>
            ) : (
            <div className="flex flex-col gap-4">
                {questions.map((q, idx) => (
                <div key={q.id} className="bg-white rounded-2xl p-5 shadow border border-red-100">
                    <div className="flex justify-between items-start mb-3">
                    <span className="bg-red-700 text-white text-sm font-bold px-3 py-1 rounded-full">
                        Câu {idx + 1}
                    </span>
                    <div className="flex gap-2">
                        <button
                        onClick={() => handleEdit(q)}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm hover:bg-blue-200 transition"
                        >
                        ✏️ Sửa
                        </button>
                        <button
                        onClick={() => handleDelete(q.id)}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm hover:bg-red-200 transition"
                        >
                        🗑️ Xóa
                        </button>
                    </div>
                    </div>

                    {editId === q.id ? (
                    <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                        <h2 className="font-bold text-gray-800 mb-4">✏️ Sửa câu hỏi tại chỗ</h2>
                        <div className="flex flex-col gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Nội dung câu hỏi</label>
                            <textarea
                            rows={3}
                            placeholder="Nhập câu hỏi..."
                            value={form.question_text}
                            onChange={e => setForm({ ...form, question_text: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 text-gray-800 resize-none"
                            />
                        </div>

                        {(['A', 'B', 'C', 'D'] as const).map(opt => (
                            <div key={opt}>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                Đáp án {opt}
                                {form.correct_answer === opt && <span className="ml-2 text-green-600">✓ Đúng</span>}
                            </label>
                            <input
                                type="text"
                                placeholder={`Nhập đáp án ${opt}...`}
                                value={form[`option_${opt.toLowerCase()}` as keyof typeof form]}
                                onChange={e => setForm({ ...form, [`option_${opt.toLowerCase()}`]: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 text-gray-800"
                            />
                            </div>
                        ))}

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Đáp án đúng</label>
                            <div className="grid grid-cols-4 gap-2">
                            {(['A', 'B', 'C', 'D'] as const).map(opt => (
                                <button
                                key={opt}
                                onClick={() => setForm({ ...form, correct_answer: opt })}
                                className={`py-3 rounded-xl font-bold text-lg transition ${
                                    form.correct_answer === opt
                                    ? 'bg-green-600 text-white shadow-md scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                >
                                {opt}
                                </button>
                            ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                            onClick={handleSubmit}
                            className="flex-1 bg-red-700 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition"
                            >
                            Cập Nhật
                            </button>
                            <button
                            onClick={resetForm}
                            className="px-6 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition"
                            >
                            Hủy
                            </button>
                        </div>
                        </div>
                    </div>
                    ) : (
                    <>
                    <p className="text-gray-800 font-medium mb-3">{q.question_text}</p>

                    <div className="grid grid-cols-1 gap-2">
                    {(['A', 'B', 'C', 'D'] as const).map(opt => (
                        <div
                        key={opt}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                            q.correct_answer === opt
                            ? 'bg-green-50 border-green-400 text-green-800 font-bold'
                            : answerColors[opt]
                        }`}
                        >
                        <span className="font-bold w-5">{opt}.</span>
                        <span>{q[`option_${opt.toLowerCase()}` as keyof Question]}</span>
                        {q.correct_answer === opt && <span className="ml-auto">✓</span>}
                        </div>
                    ))}
                    </div>
                    </>
                    )}
                </div>
                ))}
            </div>
            )}

        </div>

        <div className="mt-4 flex justify-center">
            <button
            onClick={() => router.push('/admin/bo-de')}
            className="rounded-lg bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 border border-gray-200"
            >
            Quay lại
            </button>
        </div>
        </div>
    </main>
    )
}

export default function AdminCauHoi() {
    return (
    <Suspense fallback={
        <div className="h-screen flex items-center justify-center bg-gray-100">
        <p>Đang tải...</p>
        </div>
    }>
        <CauHoiContent />
    </Suspense>
    )
}