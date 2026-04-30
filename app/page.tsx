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
        style={{ objectFit: 'contain', objectPosition: 'center', zIndex: -10 }}
      />
      <div className="absolute left-[65%] bottom-[15%] -translate-x-1/2 flex flex-row gap-4 w-auto z-10">
        <Link
          href="/dang-nhap"
          className="bg-yellow-400 text-red-900 font-bold py-4 px-8 rounded-xl text-center text-xl hover:bg-yellow-300 transition shadow-xl"
        >
          🔐 Đăng Nhập
        </Link>
        <Link
          href="/dang-ky"
          className="bg-white text-red-700 font-bold py-4 px-8 rounded-xl text-center text-xl hover:bg-gray-100 transition shadow-xl"
        >
          📝 Đăng Ký
        </Link>
      </div>
    </main>
  )
}