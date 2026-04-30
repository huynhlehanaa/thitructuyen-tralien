'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'

interface Question {
    id: string
    question_text: string
    order_index: number
    options: Array<{
        displayLabel: string
        text: string
        originalLabel: string
    }>
}

interface QuizSet {
    id: string
    title: string
    duration_seconds: number
}

export default function ThiPage() {
    const router = useRouter()
    const params = useParams()
    const quizSetId = params.id as string

    const [quizSet, setQuizSet] = useState<QuizSet | null>(null)
    const [questions, setQuestions] = useState<Question[]>([])
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [timeLeft, setTimeLeft] = useState(0)
    const [attemptId, setAttemptId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [result, setResult] = useState<{ score: number, total: number, timeSpent: number } | null>(null)

    const handleSubmit = useCallback(async (auto = false) => {
    if (submitting || submitted) return
    setSubmitting(true)
    if (auto) toast('⏰ Hết giờ! Đang nộp bài...', { icon: '⏰' })

    const timeSpent = quizSet ? quizSet.duration_seconds - timeLeft : 0

    try {
        const res = await fetch('/api/attempts/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, answers, timeSpent })
        })
        const data = await res.json()
        if (res.ok) {
        setResult(data)
        setSubmitted(true)
        } else {
        toast.error('Nộp bài thất bại!')
        setSubmitting(false)
        }
    } catch {
        toast.error('Lỗi kết nối!')
        setSubmitting(false)
    }
    }, [submitting, submitted, attemptId, answers, timeLeft, quizSet])

    useEffect(() => {
    if (timeLeft <= 0 || submitted) return
    if (timeLeft === 60) toast('⚠️ Còn 1 phút!', { icon: '⚠️' })
    const timer = setTimeout(() => {
        setTimeLeft(t => {
        if (t <= 1) { handleSubmit(true); return 0 }
        return t - 1
        })
    }, 1000)
    return () => clearTimeout(timer)
    }, [timeLeft, submitted, handleSubmit])

    useEffect(() => {
    const u = localStorage.getItem('user')
    if (!u) { router.push('/dang-nhap'); return }
    const parsedUser = JSON.parse(u)
    if (parsedUser.role === 'admin') { router.push('/admin'); return }
    startAttempt()
    }, [])

    const startAttempt = async () => {
        try {
            const res = await fetch(`/api/quiz/${quizSetId}/start`, {
            method: 'POST'
            })
            const data = await res.json()
            if (res.status === 401) { router.push('/dang-nhap'); return }
            if (res.status === 403) { 
            toast.error(data.error || 'Đã hết lượt thi!')
            router.push('/dashboard')
            return 
            }
            if (!res.ok) { toast.error(data.error || 'Lỗi!'); router.push('/dashboard'); return }
            setQuizSet(data.quizSet)
            setQuestions(data.questions)
            setAttemptId(data.attemptId)
            setTimeLeft(data.quizSet.duration_seconds)
        } catch {
            toast.error('Lỗi tải bài thi!')
            router.push('/dashboard')
        } finally {
            setLoading(false)
        }
    }

    const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    const answeredCount = Object.keys(answers).length

    // Trang kết quả
    if (submitted && result) {
    const percent = Math.round((result.score / result.total) * 100)
    return (
        <main className="min-h-screen px-4 py-6 sm:py-8 flex items-center justify-center relative">
        <div className="relative z-10 w-full max-w-xl lg:max-w-none lg:w-[40%] lg:ml-[22%] rounded-[2rem] border border-white/60 bg-white/90 p-5 sm:p-8 shadow-2xl backdrop-blur-sm text-center">
            <div className="text-6xl mb-4">{percent >= 80 ? '🏆' : percent >= 50 ? '👍' : '📚'}</div>
            <h1 className="text-2xl font-bold text-red-700 mb-2">Kết Quả Bài Thi</h1>
            <div className="bg-white rounded-2xl border border-red-100 p-6 mb-6 shadow-sm">
            <p className="text-gray-500 text-sm">Tỉ lệ đúng</p>
            <p className="text-5xl font-bold text-red-700 mt-2">{percent}%</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-sm">
            <div className="bg-white rounded-2xl p-4 border border-red-100 shadow-sm">
                <p className="text-gray-500">Thời gian làm</p>
                <p className="font-bold text-gray-800 mt-1">{formatTime(result.timeSpent)}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-red-100 shadow-sm">
                <p className="text-gray-500">Số câu đúng</p>
                <p className="font-bold text-gray-800 mt-1">{result.score}/{result.total}</p>
            </div>
            </div>
            <div className="flex flex-col gap-3">
            <button
                onClick={() => router.push('/dashboard')}
                className="bg-red-700 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition shadow"
            >
                🏠 Về Trang Chủ
            </button>
            <button
                onClick={() => router.push('/bang-xep-hang')}
                className="bg-yellow-400 text-red-900 font-bold py-3 rounded-xl hover:bg-yellow-300 transition shadow"
            >
                🏆 Xem Bảng Xếp Hạng
            </button>
            </div>
        </div>
        </main>
    )
    }

    if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center relative px-4">
        <div className="relative z-10 text-white text-xl font-bold">Đang tải bài thi...</div>
        </div>
    )
    }

    return (
    <main className="min-h-screen bg-gray-100 pb-32">

        {/* Header cố định */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-700 text-white px-4 py-3 shadow-lg">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
            <div>
            <p className="font-bold text-sm truncate max-w-48">{quizSet?.title}</p>
            <p className="text-white/70 text-xs">{answeredCount}/{questions.length} câu đã trả lời</p>
            </div>
            <div className={`text-2xl font-bold tabular-nums px-4 py-2 rounded-xl ${
            timeLeft <= 60 ? 'bg-yellow-400 text-red-900 animate-pulse' :
            timeLeft <= 300 ? 'bg-orange-500 text-white' : 'bg-white/20 text-white'
            }`}>
            ⏱ {formatTime(timeLeft)}
            </div>
        </div>
        <div className="max-w-2xl mx-auto mt-2">
            <div className="bg-white/20 rounded-full h-1.5">
            <div
                className="bg-yellow-400 h-1.5 rounded-full transition-all"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
            </div>
        </div>
        </div>

        {/* Danh sách câu hỏi */}
        <div className="max-w-2xl mx-auto px-4 pt-24">
        {questions.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-2xl p-5 mb-4 shadow">
            <div className="flex items-start gap-3 mb-4">
                <span className="bg-red-700 text-white text-sm font-bold px-3 py-1 rounded-full shrink-0">
                Câu {idx + 1}
                </span>
                <p className="text-gray-800 font-medium leading-relaxed">{q.question_text}</p>
            </div>
            <div className="flex flex-col gap-2">
                {q.options.map(opt => {
                const selected = answers[q.id] === opt.originalLabel
                return (
                    <button
                    key={opt.displayLabel + opt.originalLabel}
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.originalLabel }))}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition ${
                        selected
                        ? 'border-red-600 bg-red-50 text-red-800 font-medium'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100 text-gray-700'
                    }`}
                    >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        selected ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                        {opt.displayLabel}
                    </span>
                    <span>{opt.text}</span>
                    </button>
                )
                })}
            </div>
            </div>
        ))}
        </div>

        {/* Nút nộp bài */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg px-4 py-4">
        <div className="max-w-2xl mx-auto">
            <button
            onClick={() => {
                if (answeredCount < questions.length) {
                if (!confirm(`Bạn còn ${questions.length - answeredCount} câu chưa trả lời. Vẫn nộp bài?`)) return
                }
                handleSubmit(false)
            }}
            disabled={submitting}
            className="w-full bg-red-700 text-white font-bold py-4 rounded-xl text-lg hover:bg-red-600 transition disabled:opacity-50"
            >
            {submitting ? 'Đang nộp bài...' : `Nộp Bài (${answeredCount}/${questions.length})`}
            </button>
        </div>
        </div>
    </main>
    )
}