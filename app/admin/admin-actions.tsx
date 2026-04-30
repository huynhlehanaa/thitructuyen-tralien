'use client'

import { useRouter } from 'next/navigation'

export default function AdminActions() {
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
        <button
            onClick={handleLogout}
            className="bg-red-700 text-white px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-red-600 transition shadow"
        >
            Đăng xuất
        </button>
    )
}
