import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['vietnamese'] })

export const metadata: Metadata = {
  title: 'Thi Trực Tuyến Trà Liên - 157 năm sinh nhật Bác & 85 năm Đội TNTP',
  description: 'Cuộc thi trực tuyến kỷ niệm 157 năm sinh nhật Chủ tịch Hồ Chí Minh và 85 năm thành lập Đội TNTP Hồ Chí Minh',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  )
}