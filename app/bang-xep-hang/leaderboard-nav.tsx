'use client'

import { useRouter } from 'next/navigation'

interface LeaderboardNavProps {
    userRole?: string
}

export default function LeaderboardNav({ userRole }: LeaderboardNavProps) {
    const router = useRouter()

    const handleBack = () => {
        const route = userRole === 'admin' ? '/admin' : '/dashboard'
        router.push(route)
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
