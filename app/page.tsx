import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="w-screen h-screen relative overflow-hidden">
      
      {/* Ảnh nền background.webp cho trang chủ */}
      <Image
        src="/img/background.webp"
        alt="background"
        fill
        priority
        quality={75}
        style={{ objectFit: 'cover', objectPosition: 'center', zIndex: -10 }}
      />

      <div className="absolute left-1/2 bottom-8 -translate-x-1/2 lg:left-[65%] lg:bottom-[15%] flex w-[90%] max-w-md flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4 z-10">
        <Link
          href="/dang-nhap"
          className="bg-yellow-400 text-red-900 font-bold py-3 px-6 rounded-xl text-center text-base sm:text-xl hover:bg-yellow-300 transition shadow-xl"
        >
          🔐 Đăng Nhập
        </Link>
        <Link
          href="/dang-ky"
          className="bg-white text-red-700 font-bold py-3 px-6 rounded-xl text-center text-base sm:text-xl hover:bg-gray-100 transition shadow-xl"
        >
          📝 Đăng Ký
        </Link>
      </div>
    </main>
  )
}