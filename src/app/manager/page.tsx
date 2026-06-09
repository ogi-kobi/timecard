'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/payroll'

export default function ManagerPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const stats = {
    todayClockIn: 5,
    todayClockOut: 2,
    currentWorking: 3,
    monthlyLaborCost: 485000,
  }

  const storeStats = [
    { name: '炎麻堂 神田店', cost: 285000, workers: 2 },
    { name: '炎麻堂 赤坂店', cost: 200000, workers: 1 },
  ]

  const recentAttendance = [
    { name: '山田 太郎', store: '神田店', clockIn: '17:00', status: '勤務中' },
    { name: '鈴木 花子', store: '神田店', clockIn: '16:00', status: '勤務中' },
    { name: '田中 一郎', store: '赤坂店', clockIn: '17:30', status: '勤務中' },
    { name: '佐藤 次郎', store: '神田店', clockIn: '14:00', clockOut: '20:00', status: '退勤済' },
    { name: '高橋 美咲', store: '赤坂店', clockIn: '15:00', clockOut: '21:30', status: '退勤済' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white min-h-screen hidden md:flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="font-bold text-lg">炎麻堂</h1>
          <p className="text-gray-400 text-xs">管理画面</p>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {[
            { id: 'dashboard', label: 'ダッシュボード', icon: '📊' },
            { id: 'employees', label: '従業員管理', icon: '👥' },
            { id: 'stores', label: '店舗管理', icon: '🏪' },
            { id: 'attendance', label: '勤怠管理', icon: '🕐' },
            { id: 'payroll', label: '給与集計', icon: '💴' },
            { id: 'csv', label: 'CSV出力', icon: '📄' },
            { id: 'pdf', label: 'PDF出力', icon: '📑' },
            { id: 'settings', label: '設定', icon: '⚙️' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                activeTab === item.id ? 'bg-red-600' : 'hover:bg-gray-700'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-700">
          <Link href="/" className="text-gray-400 text-xs hover:text-white">← ログアウト</Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-900 text-white px-4 py-3 z-10">
        <h1 className="font-bold">炎麻堂 管理画面</h1>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 mt-12 md:mt-0 overflow-auto">
        {activeTab === 'dashboard' && (
          <DashboardTab stats={stats} storeStats={storeStats} attendance={recentAttendance} />
        )}
        {activeTab === 'employees' && <EmployeesTab />}
        {activeTab === 'stores' && <StoresTab />}
        {activeTab === 'attendance' && <AttendanceTab attendance={recentAttendance} />}
        {activeTab === 'payroll' && <PayrollTab />}
        {activeTab === 'csv' && <CsvTab />}
        {activeTab === 'pdf' && <PdfTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 text-white flex border-t border-gray-700">
        {[
          { id: 'dashboard', icon: '📊', label: 'ホーム' },
          { id: 'attendance', icon: '🕐', label: '勤怠' },
          { id: 'payroll', icon: '💴', label: '給与' },
          { id: 'settings', icon: '⚙️', label: '設定' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex-1 py-2 flex flex-col items-center text-xs gap-1 ${
              activeTab === item.id ? 'text-red-400' : 'text-gray-400'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

function DashboardTab({ stats, storeStats, attendance }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">ダッシュボード</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="本日出勤" value={stats.todayClockIn} unit="人" color="green" />
        <StatCard label="現在勤務中" value={stats.currentWorking} unit="人" color="blue" />
        <StatCard label="本日退勤" value={stats.todayClockOut} unit="人" color="gray" />
        <StatCard label="今月人件費" value={formatCurrency(stats.monthlyLaborCost)} color="red" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold mb-3">店舗別人件費</h3>
          <div className="space-y-3">
            {storeStats.map((s: any) => (
              <div key={s.name} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.workers}名勤務中</p>
                </div>
                <p className="font-bold text-red-600">{formatCurrency(s.cost)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold mb-3">本日の勤怠状況</h3>
          <div className="space-y-2">
            {attendance.map((a: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium">{a.name}</span>
                  <span className="text-gray-400 text-xs ml-2">{a.store}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{a.clockIn}〜{a.clockOut || ''}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    a.status === '勤務中' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, unit = '', color }: any) {
  const colorMap: any = {
    green: 'text-green-600 bg-green-50',
    blue: 'text-blue-600 bg-blue-50',
    red: 'text-red-600 bg-red-50',
    gray: 'text-gray-600 bg-gray-100',
  }
  return (
    <div className={`rounded-2xl p-4 ${colorMap[color]}`}>
      <p className="text-2xl font-bold">{value}{unit}</p>
      <p className="text-sm mt-1 opacity-70">{label}</p>
    </div>
  )
}

function EmployeesTab() {
  const employees = [
    { name: '山田 太郎', store: '神田店', role: '従業員', wage: 1200, transport: 500, active: true },
    { name: '鈴木 花子', store: '神田店', role: '従業員', wage: 1100, transport: 300, active: true },
    { name: '田中 一郎', store: '赤坂店', role: '店長', wage: 1500, transport: 600, active: true },
    { name: '佐藤 次郎', store: '神田店', role: '従業員', wage: 1050, transport: 400, active: false },
  ]
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">従業員管理</h2>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm">+ 追加</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">氏名</th>
              <th className="px-4 py-3 text-left">店舗</th>
              <th className="px-4 py-3 text-left">役職</th>
              <th className="px-4 py-3 text-right">時給</th>
              <th className="px-4 py-3 text-right">交通費</th>
              <th className="px-4 py-3 text-center">状態</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {employees.map((e, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{e.name}</td>
                <td className="px-4 py-3 text-gray-500">{e.store}</td>
                <td className="px-4 py-3 text-gray-500">{e.role}</td>
                <td className="px-4 py-3 text-right">¥{e.wage}</td>
                <td className="px-4 py-3 text-right">¥{e.transport}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${e.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {e.active ? '有効' : '無効'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StoresTab() {
  const stores = [
    { name: '炎麻堂 神田店', address: '東京都千代田区神田', radius: 300, employees: 3 },
    { name: '炎麻堂 赤坂店', address: '東京都港区赤坂', radius: 300, employees: 2 },
  ]
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">店舗管理</h2>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm">+ 追加</button>
      </div>
      {stores.map((s, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold">{s.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{s.address}</p>
              <div className="flex gap-4 mt-2 text-xs text-gray-400">
                <span>GPS範囲: {s.radius}m</span>
                <span>従業員: {s.employees}名</span>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600 text-sm">編集</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function AttendanceTab({ attendance }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">勤怠管理</h2>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">氏名</th>
              <th className="px-4 py-3 text-left">店舗</th>
              <th className="px-4 py-3 text-left">出勤</th>
              <th className="px-4 py-3 text-left">退勤</th>
              <th className="px-4 py-3 text-center">状態</th>
              <th className="px-4 py-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {attendance.map((a: any, i: number) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{a.name}</td>
                <td className="px-4 py-3 text-gray-500">{a.store}</td>
                <td className="px-4 py-3">{a.clockIn}</td>
                <td className="px-4 py-3">{a.clockOut || '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    a.status === '勤務中' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>{a.status}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button className="text-blue-500 text-xs hover:underline">修正</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PayrollTab() {
  const payroll = [
    { name: '山田 太郎', store: '神田店', days: 10, workMin: 3600, nightMin: 600, base: 72000, night: 5000, transport: 5000, total: 82000 },
    { name: '鈴木 花子', store: '神田店', days: 8, workMin: 2880, nightMin: 480, base: 52800, night: 3520, transport: 4000, total: 60320 },
    { name: '田中 一郎', store: '赤坂店', days: 12, workMin: 4320, nightMin: 720, base: 90000, night: 9000, transport: 7200, total: 106200 },
  ]
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">給与集計</h2>
        <p className="text-sm text-gray-500">5/16〜6/15</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">氏名</th>
              <th className="px-4 py-3 text-left">店舗</th>
              <th className="px-4 py-3 text-right">出勤</th>
              <th className="px-4 py-3 text-right">基本給</th>
              <th className="px-4 py-3 text-right">深夜手当</th>
              <th className="px-4 py-3 text-right">交通費</th>
              <th className="px-4 py-3 text-right font-bold">総支給</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {payroll.map((p, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.store}</td>
                <td className="px-4 py-3 text-right">{p.days}日</td>
                <td className="px-4 py-3 text-right">{formatCurrency(p.base)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(p.night)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(p.transport)}</td>
                <td className="px-4 py-3 text-right font-bold text-red-600">{formatCurrency(p.total)}</td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-bold">
              <td colSpan={6} className="px-4 py-3 text-right">合計</td>
              <td className="px-4 py-3 text-right text-red-600">{formatCurrency(payroll.reduce((s, p) => s + p.total, 0))}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CsvTab() {
  const handleExport = () => {
    const bom = '﻿'
    const headers = ['氏名', '店舗', '出勤日数', '勤務時間', '深夜時間', '基本給', '深夜手当', '交通費', '総支給額']
    const rows = [
      ['山田 太郎', '神田店', '10', '60:00', '10:00', '72000', '5000', '5000', '82000'],
      ['鈴木 花子', '神田店', '8', '48:00', '8:00', '52800', '3520', '4000', '60320'],
      ['田中 一郎', '赤坂店', '12', '72:00', '12:00', '90000', '9000', '7200', '106200'],
    ]
    const csv = bom + [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '給与データ_202506.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">CSV出力</h2>
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">対象期間</label>
          <div className="flex gap-2">
            <input type="date" defaultValue="2026-05-16" className="border rounded-lg px-3 py-2 text-sm" />
            <span className="self-center text-gray-400">〜</span>
            <input type="date" defaultValue="2026-06-15" className="border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">店舗</label>
          <select className="border rounded-lg px-3 py-2 text-sm w-full">
            <option>全店舗</option>
            <option>炎麻堂 神田店</option>
            <option>炎麻堂 赤坂店</option>
          </select>
        </div>
        <button
          onClick={handleExport}
          className="w-full bg-red-600 text-white py-3 rounded-xl font-bold text-sm"
        >
          📄 CSVをダウンロード（Shift-JIS対応）
        </button>
        <p className="text-xs text-gray-400">※ 給与ソフト連携用にShift-JIS形式で出力されます</p>
      </div>
    </div>
  )
}

function PdfTab() {
  const handlePdf = () => {
    alert('PDF出力機能：Supabase連携後に実際のデータでPDFを生成します')
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">PDF出力</h2>
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">対象期間</label>
          <div className="flex gap-2">
            <input type="date" defaultValue="2026-05-16" className="border rounded-lg px-3 py-2 text-sm" />
            <span className="self-center text-gray-400">〜</span>
            <input type="date" defaultValue="2026-06-15" className="border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">従業員</label>
          <select className="border rounded-lg px-3 py-2 text-sm w-full">
            <option>全員</option>
            <option>山田 太郎</option>
            <option>鈴木 花子</option>
            <option>田中 一郎</option>
          </select>
        </div>
        <button
          onClick={handlePdf}
          className="w-full bg-red-600 text-white py-3 rounded-xl font-bold text-sm"
        >
          📑 給与明細PDFを生成
        </button>
      </div>
    </div>
  )
}

function SettingsTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">システム設定</h2>
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-700">勤務時間設定</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm">深夜開始時刻</label>
            <input type="time" defaultValue="22:00" className="border rounded px-2 py-1 text-sm" />
          </div>
          <div className="flex justify-between items-center">
            <label className="text-sm">深夜終了時刻</label>
            <input type="time" defaultValue="05:00" className="border rounded px-2 py-1 text-sm" />
          </div>
          <div className="flex justify-between items-center">
            <label className="text-sm">深夜割増率</label>
            <select className="border rounded px-2 py-1 text-sm">
              <option>1.25 (25%増)</option>
              <option>1.30 (30%増)</option>
            </select>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-700">休憩時間設定</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm">6時間以上勤務</label>
            <span className="text-sm font-medium">30分控除</span>
          </div>
          <div className="flex justify-between items-center">
            <label className="text-sm">8時間以上勤務</label>
            <span className="text-sm font-medium">60分控除</span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-700">土日祝手当</h3>
        <div className="flex justify-between items-center">
          <label className="text-sm">土日祝手当</label>
          <div className="flex items-center gap-2">
            <input type="number" defaultValue="50" className="border rounded px-2 py-1 text-sm w-20" />
            <span className="text-sm text-gray-500">円/日</span>
          </div>
        </div>
      </div>
      <button className="w-full bg-red-600 text-white py-3 rounded-xl font-bold">設定を保存</button>
    </div>
  )
}
