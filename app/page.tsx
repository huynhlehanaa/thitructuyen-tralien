import Link from 'next/link'

export default function Home() {
  return (
    <main className="w-screen h-screen relative overflow-hidden"
      style={{
        backgroundImage: 'url(/img/background.png)',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        // backgroundColor: '#e8eef9',
      }}
    >
      {/* 2 nút nằm dưới cụm tiêu đề bên phải */}
      <div className="absolute left-[65%] bottom-[15%] -translate-x-1/2 flex flex-row gap-4 w-auto">
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