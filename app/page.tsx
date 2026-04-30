import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="w-screen h-screen relative overflow-hidden flex flex-col items-center justify-center sm:flex sm:items-stretch sm:justify-stretch">
      {/* Mobile portrait: Flex layout - poster centered, buttons below */}
      <div className="sm:hidden flex flex-col items-center justify-center flex-1 px-4 py-6">
        {/* Poster image - constrained height for portrait phones */}
        <div className="relative w-full max-w-xs flex-1 flex items-center justify-center">
          <Image
            src="/img/background.webp"
            alt="background"
            width={400}
            height={600}
            priority
            quality={75}
            className="object-contain"
          />
        </div>

        {/* Buttons area - fixed at bottom on mobile */}
        <div className="w-full max-w-xs py-4">
          <div className="flex flex-col gap-3">
            <Link
              href="/dang-nhap"
              className="bg-yellow-400 text-red-900 font-bold py-3 px-6 rounded-xl text-center text-base hover:bg-yellow-300 transition shadow-xl"
            >
              🔐 Đăng Nhập
            </Link>
            <Link
              href="/dang-ky"
              className="bg-white text-red-700 font-bold py-3 px-6 rounded-xl text-center text-base hover:bg-gray-100 transition shadow-xl"
            >
              📝 Đăng Ký
            </Link>
          </div>
        </div>
      </div>

      {/* Tablet/Desktop: Original layout with fixed positioning */}
      <div className="hidden sm:block absolute inset-0 w-full h-full">
        <Image
          src="/img/background.webp"
          alt="background"
          fill
          priority
          quality={75}
          className="object-cover object-center"
          sizes="100vw"
        />

        <div className="absolute left-1/2 bottom-8 -translate-x-1/2 lg:left-[65%] lg:bottom-[15%] z-10 w-[90%] max-w-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/dang-nhap"
              className="bg-yellow-400 text-red-900 font-bold py-3 px-6 rounded-xl text-center text-xl hover:bg-yellow-300 transition shadow-xl"
            >
              🔐 Đăng Nhập
            </Link>
            <Link
              href="/dang-ky"
              className="bg-white text-red-700 font-bold py-3 px-6 rounded-xl text-center text-xl hover:bg-gray-100 transition shadow-xl"
            >
              📝 Đăng Ký
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}