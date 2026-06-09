'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { formatMinutes, formatCurrency } from '@/lib/payroll'
import Link from 'next/link'

const DEMO_RECORDS = [
  { id: '1', date: new Date(Date.now() - 86400000 * 1), clockIn: '17:00', clockOut: '23:30', workMin: 360, nightMin: 90, wage: 7050 },
  { id: '2', date: new Date(Date.now() - 86400000 * 2), clockIn: '18:00', clockOut: '24:00', workMin: 330, nightMin: 120, wage: 6900 },
  { id: '3', date: new Date(Date.now() - 86400000 * 4), clockIn: '11:00', clockOut: '17:00', workMin: 330, nightMin: 0, wage: 6600 },
  { id: '4', date: new Date(Date.now() - 86400000 * 6), clockIn: '18:00', clockOut: '02:00', workMin: 420, nightMin: 240, wage: 9600 },
  { id: '5', date: new Date(Date.now() - 86400000 * 8), clockIn: '17:00', clockOut: '23:00', workMin: 330, nightMin: 60, wage: 6650 },
]

export default function HistoryPage() {
  const totalWage = DEMO_RECORDS.reduce((s, r) => s + r.wage, 0)
  const totalWork = DEMO_RECORDS.reduce((s, r) => s + r.workMin, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-red-600 text-white px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/employee" className="text-white text-xl">←</Link>
          <h1 className="text-lg font-bold">勤務履歴</h1>
        </div>
      </header>

      <div className="px-4 py-4 max-w-md mx-auto space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">今月合計</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalWage)}</p>
              <p className="text-xs text-gray-400">給与合計</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-700">{formatMinutes(totalWork)}</p>
              <p className="text-xs text-gray-400">勤務時間合計</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm divide-y">
          {DEMO_RECORDS.map((rec) => (
            <div key={rec.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">{format(rec.date, 'M月d日(E)', { locale: ja })}</p>
                  <p className="text-sm text-gray-500">{rec.clockIn} 〜 {rec.clockOut}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs text-gray-400">勤務: {formatMinutes(rec.workMin)}</span>
                    {rec.nightMin > 0 && (
                      <span className="text-xs text-blue-500">深夜: {formatMinutes(rec.nightMin)}</span>
                    )}
                  </div>
                </div>
                <p className="font-bold text-red-600">{formatCurrency(rec.wage)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
