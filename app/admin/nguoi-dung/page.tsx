'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface User {
    id: string
    full_name: string
    phone: string
    lien_doan: string
    chi_doi: string
    role: string
    created_at: string
    total_attempts: number
    best_score: number
}

export default function AdminNguoiDung() {
    const router = useRouter()
    const [token, setToken] = useState('')
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
    const t = localStorage.getItem('token')
    const u = localStorage.getItem('user')
    if (!t || !u) { router.push('/dang-nhap'); return }
    if (JSON.parse(u).role !== 'admin') { router.push('/dashboard'); return }
    setToken(t)
    fetchUsers(t)
    }, [])

    const fetchUsers = async (t: string) => {
    try {
        const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${t}` }
        })
        const data = await res.json()
        setUsers(data.users || [])
    } catch {
        toast.error('Lỗi tải dữ liệu!')
    } finally {
        setLoading(false)
    }
    }

    const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.lien_doan?.toLowerCase().includes(search.toLowerCase()) ||
    u.chi_doi?.toLowerCase().includes(search.toLowerCase())
    )

    return (
    <main className="h-screen overflow-hidden px-4 py-4 flex items-center justify-center relative">
        <Image
        src="/img/nen.png"
        alt="background"
        fill
        priority
        quality={75}
        style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
        <div className="relative z-10 w-full rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-2xl backdrop-blur-sm flex flex-col overflow-hidden" style={{ marginLeft: '22%', width: '56%', height: '98%' }}>

        <div className="flex items-start justify-between gap-4 mb-5">
            <div>
            <h1 className="font-bold text-2xl text-red-700">👥 Danh Sách Người Dùng</h1>
            <p className="text-gray-500 text-sm">Tổng: {users.filter(u => u.role === 'player').length} người tham gia</p>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">

        {/* Tìm kiếm */}
        <input
            type="text"
            placeholder="🔍 Tìm theo tên, SĐT, liên đội, chi đội..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-6 focus:outline-none focus:border-red-500 bg-white shadow-sm"
        />

        {/* Thống kê nhanh */}
        <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-2xl p-4 text-center shadow border border-red-100">
            <p className="text-2xl font-bold text-red-700">{users.filter(u => u.role === 'player').length}</p>
            <p className="text-gray-500 text-xs mt-1">Người đăng ký</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow border border-red-100">
            <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.total_attempts > 0).length}</p>
            <p className="text-gray-500 text-xs mt-1">Đã tham gia thi</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow border border-red-100">
            <p className="text-2xl font-bold text-green-600">{users.filter(u => u.role === 'player').length - users.filter(u => u.total_attempts > 0).length}</p>
            <p className="text-gray-500 text-xs mt-1">Chưa thi</p>
            </div>
        </div>

        {/* Danh sách */}
        {loading ? (
            <p className="text-center text-gray-600 py-8">Đang tải...</p>
        ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow border border-red-100">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-gray-500">Không tìm thấy người dùng nào</p>
            </div>
        ) : (
            <div className="bg-white rounded-2xl shadow overflow-hidden border border-red-100">
            {/* Header bảng */}
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-red-50 border-b border-red-100 text-xs font-bold text-gray-500 uppercase">
                <div className="col-span-1">STT</div>
                <div className="col-span-3">Họ tên</div>
                <div className="col-span-4">Liên đội</div>
                <div className="col-span-2 text-center">Lượt thi</div>
                <div className="col-span-2 text-center">Điểm cao</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-red-100">
                {filtered
                .filter(u => u.role === 'player')
                .map((u, idx) => (
                <div key={u.id} className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-yellow-50 transition items-center">
                    <div className="col-span-1 text-gray-400 text-sm font-medium">{idx + 1}</div>
                    <div className="col-span-3">
                    <p className="font-medium text-gray-800 text-sm truncate">{u.full_name}</p>
                    <p className="text-gray-400 text-xs">📞 {u.phone}</p>
                    <p className="text-gray-400 text-xs">👥 {u.chi_doi}</p>
                    </div>
                    <div className="col-span-4">
                    <p className="text-gray-600 text-xs leading-relaxed">{u.lien_doan}</p>
                    </div>
                    <div className="col-span-2 text-center">
                    {u.total_attempts > 0 ? (
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                        {u.total_attempts} lượt
                        </span>
                    ) : (
                        <span className="bg-gray-100 text-gray-400 text-xs px-2 py-1 rounded-full">
                        Chưa thi
                        </span>
                    )}
                    </div>
                    <div className="col-span-2 text-center">
                    {u.total_attempts > 0 ? (
                        <span className="text-red-700 font-bold text-sm">{u.best_score}</span>
                    ) : (
                        <span className="text-gray-300">—</span>
                    )}
                    </div>
                </div>
                ))}
            </div>
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