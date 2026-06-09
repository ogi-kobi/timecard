import type { AttendanceRecord } from './supabase/types'

export function calculateWorkMinutes(clockIn: Date, clockOut: Date): number {
  return Math.floor((clockOut.getTime() - clockIn.getTime()) / 60000)
}

export function calculateBreakMinutes(workMinutes: number): number {
  if (workMinutes >= 480) return 60 // 8h+
  if (workMinutes >= 360) return 30 // 6h+
  return 0
}

export function calculateNightMinutes(
  clockIn: Date,
  clockOut: Date,
  nightStartHour = 22,
  nightEndHour = 5
): number {
  let nightMinutes = 0
  const current = new Date(clockIn)

  while (current < clockOut) {
    const hour = current.getHours()
    const isNight = hour >= nightStartHour || hour < nightEndHour
    if (isNight) nightMinutes++
    current.setMinutes(current.getMinutes() + 1)
  }

  return nightMinutes
}

export function calculateNightMinutesFast(
  clockIn: Date,
  clockOut: Date,
  nightStartHour = 22,
  nightEndHour = 5
): number {
  let nightMinutes = 0
  const totalMinutes = Math.floor((clockOut.getTime() - clockIn.getTime()) / 60000)

  for (let i = 0; i < totalMinutes; i++) {
    const t = new Date(clockIn.getTime() + i * 60000)
    const h = t.getHours()
    if (h >= nightStartHour || h < nightEndHour) nightMinutes++
  }

  return nightMinutes
}

export function calculateDailyWage(
  workMinutes: number,
  nightMinutes: number,
  breakMinutes: number,
  hourlyWage: number,
  nightRate = 1.25
): { baseWage: number; nightAllowance: number; total: number } {
  const effectiveWork = workMinutes - breakMinutes
  const dayMinutes = effectiveWork - nightMinutes
  const baseWage = Math.floor((dayMinutes / 60) * hourlyWage)
  const nightWage = Math.floor((nightMinutes / 60) * hourlyWage * nightRate)
  const nightAllowance = nightWage - Math.floor((nightMinutes / 60) * hourlyWage)

  return {
    baseWage: baseWage + Math.floor((nightMinutes / 60) * hourlyWage),
    nightAllowance,
    total: baseWage + nightWage,
  }
}

export function getPayrollPeriod(date: Date = new Date()): { start: Date; end: Date } {
  const d = new Date(date)
  let start: Date
  let end: Date

  if (d.getDate() >= 16) {
    start = new Date(d.getFullYear(), d.getMonth(), 16)
    end = new Date(d.getFullYear(), d.getMonth() + 1, 15, 23, 59, 59)
  } else {
    start = new Date(d.getFullYear(), d.getMonth() - 1, 16)
    end = new Date(d.getFullYear(), d.getMonth(), 15, 23, 59, 59)
  }

  return { start, end }
}

export function isWeekendOrHoliday(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}時間${m}分`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount)
}
