import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden relative">

      {/* Desktop */}
      <div className="hidden md:block absolute inset-0">
        <Image
          src="/img/background.webp"
          alt="background"
          fill
          priority
          quality={75}
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
        <div className="absolute left-[65%] bottom-[15%] -translate-x-1/2 z-10 flex flex-row gap-4">
          <Link href="/dang-nhap" className="bg-yellow-400 text-red-900 font-bold py-4 px-8 rounded-xl text-center text-xl hover:bg-yellow-300 transition shadow-xl">
            🔐 Đăng Nhập
          </Link>
          <Link href="/dang-ky" className="bg-white text-red-700 font-bold py-4 px-8 rounded-xl text-center text-xl hover:bg-gray-100 transition shadow-xl">
            📝 Đăng Ký
          </Link>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex flex-col h-full bg-[#0f2347]">

        {/* Ảnh hiện toàn bộ, không crop */}
        <div className="flex items-center justify-center px-3 pt-4" style={{ height: '62%' }}>
          <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
            <Image
              src="/img/background-mobile.webp"
              alt="Thi Trực Tuyến Trà Liên"
              fill
              priority
              quality={75}
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
          </div>
        </div>

        {/* Nút bấm */}
        <div className="flex flex-col items-center justify-center gap-3 px-6 flex-1">
          <Link
            href="/dang-nhap"
            className="w-full bg-yellow-400 text-red-900 font-bold py-4 rounded-xl text-center text-lg shadow-xl active:scale-95 transition"
          >
            🔐 Đăng Nhập
          </Link>
          <Link
            href="/dang-ky"
            className="w-full bg-white text-red-700 font-bold py-4 rounded-xl text-center text-lg shadow-xl active:scale-95 transition border border-gray-100"
          >
            📝 Đăng Ký
          </Link>
        </div>

      </div>
    </main>
  )
}