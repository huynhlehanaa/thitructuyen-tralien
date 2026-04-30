'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function DangNhap() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
    phone: '',
    password: ''
    })

    const handleSubmit = async () => {
    if (!form.phone || !form.password) {
        toast.error('Vui lòng điền đầy đủ thông tin!')
        return
    }

    setLoading(true)
    try {
        const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, password: form.password })
        })
        const data = await res.json()

        if (!res.ok) {
        toast.error(data.error || 'Đăng nhập thất bại!')
        } else {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        toast.success('Đăng nhập thành công!')
        if (data.user.role === 'admin') {
            router.push('/admin')
        } else if (data.user.must_change_password) {
            router.push('/doi-mat-khau')
        } else {
            router.push('/dashboard')
        }
        }
    } catch {
        toast.error('Lỗi kết nối!')
    } finally {
        setLoading(false)
    }
    }

    return (
    <main className="h-screen overflow-hidden flex flex-col items-center justify-center px-4 py-4 relative">

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
        className="relative z-10 w-full rounded-[2rem] border border-white/60 bg-white/95 p-8 shadow-2xl backdrop-blur-sm"
        style={{ marginLeft: '22%', width: '30%' }}
        >
        <div className="text-center mb-5">
            <div className="text-4xl mb-2">🔐</div>
            <h1 className="text-2xl font-bold text-red-700">Đăng Nhập</h1>
            <p className="text-gray-500 text-sm mt-1">Thi Trực Tuyến Xã Trà Liên 2026</p>
        </div>

        <div className="flex flex-col gap-4">
            <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Số điện thoại</label>
            <input
                type="tel"
                placeholder="0901234567"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
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
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 text-gray-800"
            />
            </div>

            <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-red-700 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition disabled:opacity-50 mt-2"
            >
            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
            </button>

            <p className="text-center text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link href="/dang-ky" className="text-red-700 font-medium hover:underline">
                Đăng ký ngay
            </Link>
            </p>
        </div>
        </div>
    </main>
    )
}