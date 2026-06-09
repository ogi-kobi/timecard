'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function QRPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Draw simple QR placeholder
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, 200, 200)
    ctx.fillStyle = '#000'
    // Simple pattern to represent QR
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillRect(i * 20, j * 20, 18, 18)
        }
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-red-600 text-white px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/employee" className="text-white text-xl">←</Link>
          <h1 className="text-lg font-bold">マイQRコード</h1>
        </div>
      </header>

      <div className="px-4 py-8 max-w-md mx-auto text-center space-y-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm inline-block">
          <canvas ref={canvasRef} width={200} height={200} className="mx-auto" />
        </div>
        <div>
          <p className="font-bold text-lg">山田 太郎</p>
          <p className="text-gray-500 text-sm">炎麻堂 神田店</p>
          <p className="text-xs text-gray-400 mt-2">このQRコードをレジのスキャナーにかざしてください</p>
        </div>
      </div>
    </div>
  )
}
