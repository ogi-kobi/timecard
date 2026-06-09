import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPayrollPeriod, isWeekendOrHoliday } from '@/lib/payroll'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const store_id = searchParams.get('store_id')
    const period_start = searchParams.get('period_start')
    const period_end = searchParams.get('period_end')

    const { start, end } = period_start && period_end
      ? { start: new Date(period_start), end: new Date(period_end) }
      : getPayrollPeriod()

    let query = supabase
      .from('attendance_records')
      .select('*, employees(*), stores(*)')
      .gte('clock_in', start.toISOString())
      .lte('clock_in', end.toISOString())
      .not('clock_out', 'is', null)

    if (store_id) query = query.eq('store_id', store_id)

    const { data: records, error } = await query
    if (error) throw error

    const summaryMap = new Map()
    for (const rec of records ?? []) {
      const key = rec.employee_id
      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          employee: rec.employees,
          store: rec.stores,
          work_days: 0,
          total_work_minutes: 0,
          total_night_minutes: 0,
          base_wage: 0,
          night_allowance: 0,
          weekend_bonus: 0,
          transportation_fee: 0,
          total_wage: 0,
        })
      }
      const s = summaryMap.get(key)
      s.work_days++
      s.total_work_minutes += rec.work_minutes ?? 0
      s.total_night_minutes += rec.night_minutes ?? 0
      s.total_wage += rec.daily_wage ?? 0
      if (rec.employees?.transportation_fee) s.transportation_fee += rec.employees.transportation_fee
      if (isWeekendOrHoliday(new Date(rec.clock_in)) && rec.employees?.weekend_bonus_enabled) {
        s.weekend_bonus += rec.employees.weekend_bonus ?? 0
      }
    }

    return NextResponse.json({
      summaries: Array.from(summaryMap.values()),
      period: { start: start.toISOString(), end: end.toISOString() },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
