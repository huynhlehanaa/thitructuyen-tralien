'use client'

import { useRouter } from 'next/navigation'

export default function DashboardActions() {
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
        } catch {}
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/')
    }

    return (
        <div className="flex gap-2">
            <button
                onClick={() => router.push('/doi-mat-khau')}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-500 transition shadow"
            >
                🔐 Đổi mật khẩu
            </button>
            <button
                onClick={handleLogout}
                className="bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-600 transition shadow"
            >
                Đăng xuất
            </button>
        </div>
    )
}
