import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="w-screen h-screen relative overflow-hidden">
      {/* Mobile portrait: hiển thị trọn poster để tránh vỡ bố cục */}
      <Image
        src="/img/background.webp"
        alt="background"
        fill
        priority
        quality={75}
        className="sm:hidden object-contain object-top"
        sizes="100vw"
      />

      {/* Tablet/Desktop: giữ kiểu cũ */}
      <Image
        src="/img/background.webp"
        alt="background"
        fill
        priority
        quality={75}
        className="hidden sm:block object-cover object-center"
        sizes="100vw"
      />

      {/* Tăng độ tương phản cho khu vực nút trên mobile */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/30 to-transparent sm:hidden" />

      <div className="absolute left-1/2 bottom-8 -translate-x-1/2 lg:left-[65%] lg:bottom-[15%] z-10 w-[90%] max-w-md sm:w-auto sm:max-w-none">
        <div className="flex flex-col gap-3 rounded-2xl bg-white/15 p-2 backdrop-blur-[2px] sm:bg-transparent sm:p-0 sm:flex-row sm:gap-4">
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
      </div>
    </main>
  )
}