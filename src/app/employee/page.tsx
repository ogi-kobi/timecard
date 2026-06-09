'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Employee, AttendanceRecord } from '@/lib/supabase/types'
import { getCurrentPosition } from '@/lib/gps'
import { formatMinutes, formatCurrency, getPayrollPeriod } from '@/lib/payroll'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import Link from 'next/link'

export default function EmployeePage() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [activeRecord, setActiveRecord] = useState<AttendanceRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [demoMode, setDemoMode] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [monthlyWage, setMonthlyWage] = useState(0)
  const [workDays, setWorkDays] = useState(0)
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (demoMode) {
      const demoEmployee: Employee = {
        id: 'demo-001',
        user_id: null,
        store_id: 'store-001',
        name: '山田 太郎',
        email: 'yamada@example.com',
        line_user_id: null,
        role: 'employee',
        hourly_wage: 1200,
        transportation_fee: 500,
        weekend_bonus: 50,
        weekend_bonus_enabled: true,
        qr_code: 'demo-001',
        is_active: true,
        created_at: new Date().toISOString(),
        store: {
          id: 'store-001',
          name: '炎麻堂 神田店',
          address: '東京都千代田区神田',
          latitude: 35.6917,
          longitude: 139.7703,
          gps_radius: 300,
          created_at: new Date().toISOString(),
        },
      }
      setEmployee(demoEmployee)
      setMonthlyWage(87500)
      setWorkDays(8)

      const demoRecords: AttendanceRecord[] = [
        {
          id: '1',
          employee_id: 'demo-001',
          store_id: 'store-001',
          clock_in: new Date(Date.now() - 86400000 * 2).toISOString(),
          clock_out: new Date(Date.now() - 86400000 * 2 + 6 * 3600000).toISOString(),
          clock_in_gps_lat: null,
          clock_in_gps_lng: null,
          clock_out_gps_lat: null,
          clock_out_gps_lng: null,
          gps_warning: false,
          break_minutes: 30,
          work_minutes: 360,
          night_minutes: 0,
          daily_wage: 6600,
          note: null,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          employee_id: 'demo-001',
          store_id: 'store-001',
          clock_in: new Date(Date.now() - 86400000 * 3).toISOString(),
          clock_out: new Date(Date.now() - 86400000 * 3 + 8 * 3600000).toISOString(),
          clock_in_gps_lat: null,
          clock_in_gps_lng: null,
          clock_out_gps_lat: null,
          clock_out_gps_lng: null,
          gps_warning: false,
          break_minutes: 60,
          work_minutes: 480,
          night_minutes: 120,
          daily_wage: 9800,
          note: null,
          created_at: new Date().toISOString(),
        },
      ]
      setRecentRecords(demoRecords)
    }
  }, [demoMode])

  const handleClockIn = async () => {
    setLoading(true)
    try {
      let gpsData = null
      try {
        gpsData = await getCurrentPosition()
      } catch {
        // GPS optional
      }

      if (demoMode) {
        const record: AttendanceRecord = {
          id: `rec-${Date.now()}`,
          employee_id: employee!.id,
          store_id: employee!.store_id,
          clock_in: new Date().toISOString(),
          clock_out: null,
          clock_in_gps_lat: gpsData?.latitude ?? null,
          clock_in_gps_lng: gpsData?.longitude ?? null,
          clock_out_gps_lat: null,
          clock_out_gps_lng: null,
          gps_warning: false,
          break_minutes: 0,
          work_minutes: null,
          night_minutes: null,
          daily_wage: null,
          note: null,
          created_at: new Date().toISOString(),
        }
        setActiveRecord(record)
        setMessage(`✅ 出勤しました！${format(new Date(), 'HH:mm', { locale: ja })}`)
      }
    } catch (e) {
      setMessage('❌ エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleClockOut = async () => {
    setLoading(true)
    try {
      if (demoMode && activeRecord) {
        setActiveRecord(null)
        setMessage(`✅ 退勤しました！${format(new Date(), 'HH:mm', { locale: ja })}`)
        setWorkDays((d) => d + 1)
      }
    } catch {
      setMessage('❌ エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4" />
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

  const { start, end } = getPayrollPeriod()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white px-4 py-4 safe-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">炎麻堂</h1>
            <p className="text-red-100 text-xs">{employee.store?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-mono font-bold">{format(currentTime, 'HH:mm:ss')}</p>
            <p className="text-red-100 text-xs">{format(currentTime, 'M月d日(E)', { locale: ja })}</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-4 max-w-md mx-auto">
        {/* Employee Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <p className="font-bold text-lg">{employee.name}</p>
              <p className="text-gray-500 text-sm">時給 {formatCurrency(employee.hourly_wage)}</p>
            </div>
          </div>
        </div>

        {/* Status */}
        {activeRecord && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <p className="text-green-700 font-bold text-center">✅ 勤務中</p>
            <p className="text-green-600 text-center text-sm mt-1">
              出勤時刻: {format(new Date(activeRecord.clock_in), 'HH:mm')}
            </p>
          </div>
        )}

        {message && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-center text-blue-700">
            {message}
          </div>
        )}

        {/* Clock Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleClockIn}
            disabled={loading || !!activeRecord}
            className="bg-red-600 disabled:bg-gray-300 text-white py-8 rounded-2xl text-xl font-bold shadow-lg active:scale-95 transition-all flex flex-col items-center gap-2"
          >
            <span className="text-3xl">🟢</span>
            出勤
          </button>
          <button
            onClick={handleClockOut}
            disabled={loading || !activeRecord}
            className="bg-gray-700 disabled:bg-gray-300 text-white py-8 rounded-2xl text-xl font-bold shadow-lg active:scale-95 transition-all flex flex-col items-center gap-2"
          >
            <span className="text-3xl">🔴</span>
            退勤
          </button>
        </div>

        {/* Monthly Summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">今月の給与見込み</h2>
          <p className="text-xs text-gray-400 mb-2">
            {format(start, 'M/d', { locale: ja })} 〜 {format(end, 'M/d', { locale: ja })}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{workDays}</p>
              <p className="text-xs text-gray-500">出勤日数</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(monthlyWage)}</p>
              <p className="text-xs text-gray-500">給与見込み</p>
            </div>
          </div>
        </div>

        {/* Recent Records */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">最近の勤務</h2>
          <div className="space-y-2">
            {recentRecords.map((rec) => (
              <div key={rec.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-sm">{format(new Date(rec.clock_in), 'M/d(E)', { locale: ja })}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(rec.clock_in), 'HH:mm')} 〜{' '}
                    {rec.clock_out ? format(new Date(rec.clock_out), 'HH:mm') : '勤務中'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600 text-sm">{formatCurrency(rec.daily_wage ?? 0)}</p>
                  <p className="text-xs text-gray-400">{formatMinutes(rec.work_minutes ?? 0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/employee/history"
            className="block bg-white border border-gray-200 text-center py-4 rounded-2xl text-sm font-medium shadow-sm"
          >
            📋 勤務履歴
          </Link>
          <Link
            href="/employee/qr"
            className="block bg-white border border-gray-200 text-center py-4 rounded-2xl text-sm font-medium shadow-sm"
          >
            📱 QRコード
          </Link>
        </div>
      </div>
    </div>
  )
}
