import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateDistance } from '@/lib/gps'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { employee_id, store_id, latitude, longitude } = body

    const { data: store } = await supabase
      .from('stores')
      .select('*')
      .eq('id', store_id)
      .single()

    let gpsWarning = false
    if (store?.latitude && store?.longitude && latitude && longitude) {
      const distance = calculateDistance(latitude, longitude, store.latitude, store.longitude)
      gpsWarning = distance > store.gps_radius
    }

    const { data: existing } = await supabase
      .from('attendance_records')
      .select('id')
      .eq('employee_id', employee_id)
      .is('clock_out', null)
      .single()

    if (existing) {
      return NextResponse.json({ error: '既に出勤しています' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('attendance_records')
      .insert({
        employee_id,
        store_id,
        clock_in: new Date().toISOString(),
        clock_in_gps_lat: latitude ?? null,
        clock_in_gps_lng: longitude ?? null,
        gps_warning: gpsWarning,
        break_minutes: 0,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ record: data, gps_warning: gpsWarning })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
