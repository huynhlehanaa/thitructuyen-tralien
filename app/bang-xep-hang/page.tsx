'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'

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

export default function BangXepHang() {
    const router = useRouter()
    const [rankings, setRankings] = useState<RankEntry[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
    fetchRankings()
    const interval = setInterval(() => fetchRankings(), 15000)
    return () => clearInterval(interval)
    }, [])

    const fetchRankings = async () => {
    try {
        const res = await fetch('/api/leaderboard')
        if (res.status === 401) {
        router.push('/dang-nhap')
        return
        }
        const data = await res.json()
        setRankings(data.rankings || [])
    } catch {
        toast.error('Lỗi tải bảng xếp hạng!')
    } finally {
        setLoading(false)
    }
    }

    const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    const medalColors = ['🥇', '🥈', '🥉']

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

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
            <h1 className="font-bold text-2xl text-red-700">🏆 Bảng Xếp Hạng</h1>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">

            {/* Top 3 */}
            {rankings.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
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

            {loading ? (
                <div className="p-8 text-center text-gray-600">Đang tải...</div>
            ) : rankings.length === 0 ? (
                <div className="p-8 text-center">
                <p className="text-4xl mb-2">📭</p>
                <p className="text-gray-600">Chưa có ai tham gia thi</p>
                </div>
            ) : (
                <div className="divide-y divide-red-100">
                {rankings.map((r) => (
                    <div
                    key={r.rank}
                    className={`flex items-center gap-3 px-4 py-3 ${r.rank <= 3 ? 'bg-yellow-50' : ''}`}
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
                    <div className="text-center shrink-0 w-12">
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
            <button
            onClick={() => router.push('/dashboard')}
            className="rounded-lg bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 border border-gray-200"
            >
            Quay lại
            </button>
        </div>

        </div>
    </main>
    )
}