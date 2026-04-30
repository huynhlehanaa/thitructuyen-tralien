import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['vietnamese'] })

export const metadata: Metadata = {
  title: 'Thi Trực Tuyến Trà Liên - 136 năm sinh nhật Bác & 85 năm Đội TNTP',
  description: 'Cuộc thi trực tuyến kỷ niệm 136 năm sinh nhật Chủ tịch Hồ Chí Minh và 85 năm thành lập Đội TNTP Hồ Chí Minh',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link
          rel="preload"
          href="/img/nen-mobile.webp"
          as="image"
          media="(max-width: 767px)"
        />
        <link
          rel="preload"
          href="/img/nen.webp"
          as="image"
          media="(min-width: 768px)"
        />
      </head>
      <body className={inter.className}>
        {/* Fixed background - never disappears during navigation */}
        <div className="fixed inset-0 -z-20 w-full h-full">
          <Image
            src="/img/nen-mobile.webp"
            alt="background"
            fill
            priority
            quality={75}
            className="md:hidden object-cover object-center"
            sizes="100vw"
          />
          <Image
            src="/img/nen.webp"
            alt="background"
            fill
            priority
            quality={75}
            className="hidden md:block object-cover object-center"
            sizes="100vw"
          />
        </div>
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  )
}