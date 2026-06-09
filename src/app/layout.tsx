import type { Metadata, Viewport } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'

const noto = Noto_Sans_JP({ subsets: ['latin'], weight: ['400', '500', '700'] })

export const metadata: Metadata = {
  title: '炎麻堂 勤怠管理',
  description: '炎麻堂スタッフ向け勤怠管理・給与計算システム',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '炎麻堂',
  },
}

export const viewport: Viewport = {
  themeColor: '#dc2626',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={noto.className}>{children}</body>
    </html>
  )
}
