import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateWorkMinutes, calculateBreakMinutes, calculateNightMinutesFast, calculateDailyWage } from '@/lib/payroll'
import { calculateDistance } from '@/lib/gps'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { record_id, employee_id, latitude, longitude } = body

    const { data: record } = await supabase
      .from('attendance_records')
      .select('*, employees(*), stores(*)')
      .eq('id', record_id)
      .single()

    if (!record) return NextResponse.json({ error: '記録が見つかりません' }, { status: 404 })

    const clockOut = new Date()
    const clockIn = new Date(record.clock_in)
    const workMinutes = calculateWorkMinutes(clockIn, clockOut)
    const breakMinutes = calculateBreakMinutes(workMinutes)
    const nightMinutes = calculateNightMinutesFast(clockIn, clockOut)
    const { baseWage, nightAllowance, total } = calculateDailyWage(
      workMinutes,
      nightMinutes,
      breakMinutes,
      record.employees.hourly_wage
    )

    let gpsWarning = false
    if (record.stores?.latitude && latitude) {
      const distance = calculateDistance(latitude, longitude, record.stores.latitude, record.stores.longitude)
      gpsWarning = distance > record.stores.gps_radius
    }

    const { data, error } = await supabase
      .from('attendance_records')
      .update({
        clock_out: clockOut.toISOString(),
        clock_out_gps_lat: latitude ?? null,
        clock_out_gps_lng: longitude ?? null,
        gps_warning: gpsWarning || record.gps_warning,
        work_minutes: workMinutes,
        break_minutes: breakMinutes,
        night_minutes: nightMinutes,
        daily_wage: total,
      })
      .eq('id', record_id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ record: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
