'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface LeaderboardNavProps {
    userRole?: string
}

export default function LeaderboardNav({ userRole }: LeaderboardNavProps) {
    const router = useRouter()
    const [canGoBack, setCanGoBack] = useState(false)

    useEffect(() => {
        // Kiểm tra xem có lịch sử browser để quay lại không
        // Nếu có, dùng history.back() sẽ nhanh hơn redirect
        setCanGoBack(window.history.length > 1)
    }, [])

    const handleBack = () => {
        if (canGoBack && window.history.length > 1) {
            window.history.back()
        } else {
            // Fallback: dựa trên role quay lại trang chủ thích hợp
            const fallbackRoute = userRole === 'admin' ? '/admin' : '/dashboard'
            router.push(fallbackRoute)
        }
    }

    return (
        <button
            onClick={handleBack}
            className="rounded-lg bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 border border-gray-200 transition"
        >
            Quay lại
        </button>
    )
}
