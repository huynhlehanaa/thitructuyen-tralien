'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function DoiMatKhau() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const handleSubmit = async () => {
        if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
            toast.error('Vui lòng điền đầy đủ thông tin!')
            return
        }

        if (form.newPassword !== form.confirmPassword) {
            toast.error('Mật khẩu mới không khớp!')
            return
        }

        if (form.newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    oldPassword: form.oldPassword,
                    newPassword: form.newPassword
                })
            })

            const data = await res.json()

            if (res.ok) {
                toast.success('Đổi mật khẩu thành công!')
                const userData = localStorage.getItem('user')
                if (userData) {
                    const parsedUser = JSON.parse(userData)
                    localStorage.setItem('user', JSON.stringify({ ...parsedUser, must_change_password: false }))
                }
                setForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
                setTimeout(() => router.push('/dashboard'), 1500)
            } else {
                if (res.status === 401) {
                    router.push('/dang-nhap')
                    return
                }
                toast.error(data.error || 'Lỗi đổi mật khẩu!')
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
                    <h1 className="text-2xl font-bold text-red-700">Đổi Mật Khẩu</h1>
                    <p className="text-gray-500 text-sm mt-1">Thi Trực Tuyến Xã Trà Liên 2026</p>
                </div>

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Mật khẩu cũ</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={form.oldPassword}
                            onChange={e => setForm({ ...form, oldPassword: e.target.value })}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 text-gray-800"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Mật khẩu mới</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={form.newPassword}
                            onChange={e => setForm({ ...form, newPassword: e.target.value })}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 text-gray-800"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Xác nhận mật khẩu mới</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={form.confirmPassword}
                            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 text-gray-800"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-red-700 text-white py-3 rounded-lg font-bold hover:bg-red-600 disabled:bg-gray-400 transition mt-2"
                    >
                        {loading ? '⏳ Đang xử lý...' : 'Đổi Mật Khẩu'}
                    </button>

                    <button
                        onClick={() => router.back()}
                        className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        </main>
    )
}
