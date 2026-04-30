import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden relative">

      {/* Desktop: ảnh nền full + nút bên phải */}
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

      {/* Mobile: layout dọc tối ưu */}
      <div className="md:hidden flex flex-col h-full">

        {/* Ảnh poster chiếm 65% màn hình */}
        <div className="relative w-full" style={{ height: '65%' }}>
          <Image
            src="/img/background.webp"
            alt="Thi Trực Tuyến Trà Liên"
            fill
            priority
            quality={75}
            style={{ objectFit: 'cover', objectPosition: 'center top' }}
          />
        </div>

        {/* Phần dưới: nền xanh + nút */}
        <div
          className="flex flex-col items-center justify-center gap-4 px-6 flex-1"
          style={{ background: 'linear-gradient(to bottom, #1a3a6e, #0f2347)' }}
        >
          <p className="text-white text-center font-bold text-base opacity-90">
            🌟 Thi Tài Trà Liên 2026
          </p>
          <Link
            href="/dang-nhap"
            className="w-full bg-yellow-400 text-red-900 font-bold py-4 rounded-xl text-center text-lg shadow-xl active:scale-95 transition"
          >
            🔐 Đăng Nhập
          </Link>
          <Link
            href="/dang-ky"
            className="w-full bg-white text-red-700 font-bold py-4 rounded-xl text-center text-lg shadow-xl active:scale-95 transition"
          >
            📝 Đăng Ký
          </Link>
        </div>

      </div>
    </main>
  )
}