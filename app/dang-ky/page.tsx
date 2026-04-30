'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const LIEN_DOAN_LIST = [
    'Liên đội Trường TH Lê Quý Đôn',
    'Liên đội Trường THCS Phương Đông',
    'Liên đội Trường PTDTBT TH&THCS Trà Nú',
    'Liên đội Trường PTDTBT TH&THCS Trần Phú',
]

export default function DangKy() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
    phone: '',
    fullName: '',
    lienDoan: '',
    chiDoi: '',
    password: '',
    confirmPassword: ''
    })

    const handleSubmit = async () => {
    if (!form.phone || !form.fullName || !form.password || !form.lienDoan || !form.chiDoi) {
        toast.error('Vui lòng điền đầy đủ thông tin!')
        return
    }
    if (form.password !== form.confirmPassword) {
        toast.error('Mật khẩu xác nhận không khớp!')
        return
    }
    if (form.phone.length < 9 || form.phone.length > 11) {
        toast.error('Số điện thoại không hợp lệ!')
        return
    }

    setLoading(true)
    try {
        const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            phone: form.phone,
            fullName: form.fullName,
            lienDoan: form.lienDoan,
            chiDoi: form.chiDoi,
            password: form.password
        })
        })
        const data = await res.json()
        if (!res.ok) {
        toast.error(data.error || 'Đăng ký thất bại!')
        } else {
        toast.success('Đăng ký thành công!')
        router.push('/dang-nhap')
        }
    } catch {
        toast.error('Lỗi kết nối!')
    } finally {
        setLoading(false)
    }
    }

    return (
    <main className="h-screen overflow-hidden flex flex-col items-center justify-center px-4 py-4 relative">

        {/* Nội dung — z-10 để không bị ảnh che */}
        <div
        className="relative z-10 w-full rounded-[2rem] border border-white/60 bg-white/95 p-8 shadow-2xl backdrop-blur-sm"
        style={{ marginLeft: '22%', width: '40%' }}
        >
        <div className="text-center mb-5">
            <div className="text-4xl mb-2">📝</div>
            <h1 className="text-2xl font-bold text-red-700">Đăng Ký Tham Gia</h1>
            <p className="text-gray-500 text-sm mt-1">Thi Trực Tuyến Xã Trà Liên 2026</p>
        </div>

        <div className="flex flex-col gap-3">
            <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Họ và tên</label>
            <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 text-gray-800"
            />
            </div>

            <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Số điện thoại</label>
            <input
                type="tel"
                placeholder="0901234567"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 text-gray-800"
            />
            </div>

            <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Liên đội</label>
            <select
                value={form.lienDoan}
                onChange={e => setForm({ ...form, lienDoan: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 text-gray-800"
            >
                <option value="">-- Chọn Liên đội --</option>
                {LIEN_DOAN_LIST.map(ld => (
                <option key={ld} value={ld}>{ld}</option>
                ))}
            </select>
            </div>

            <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Chi đội / Chi đoàn</label>
            <input
                type="text"
                placeholder="VD: Chi đội 5A, Chi đoàn 9B..."
                value={form.chiDoi}
                onChange={e => setForm({ ...form, chiDoi: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 text-gray-800"
            />
            </div>

            <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Mật khẩu</label>
            <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 text-gray-800"
            />
            </div>

            <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Xác nhận mật khẩu</label>
            <input
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 text-gray-800"
            />
            </div>

            <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-red-700 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition disabled:opacity-50 mt-1 shadow-lg"
            >
            {loading ? 'Đang xử lý...' : 'Đăng Ký'}
            </button>

            <p className="text-center text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link href="/dang-nhap" className="text-red-700 font-medium hover:underline">
                Đăng nhập
            </Link>
            </p>
        </div>
        </div>
    </main>
    )
}