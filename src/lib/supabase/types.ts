export type UserRole = 'employee' | 'manager' | 'owner'

export interface Store {
  id: string
  name: string
  address: string | null
  latitude: number | null
  longitude: number | null
  gps_radius: number
  created_at: string
}

export interface Employee {
  id: string
  user_id: string | null
  store_id: string
  name: string
  email: string | null
  line_user_id: string | null
  role: UserRole
  hourly_wage: number
  transportation_fee: number
  weekend_bonus: number
  weekend_bonus_enabled: boolean
  qr_code: string
  is_active: boolean
  created_at: string
  store?: Store
}

export interface AttendanceRecord {
  id: string
  employee_id: string
  store_id: string
  clock_in: string
  clock_out: string | null
  clock_in_gps_lat: number | null
  clock_in_gps_lng: number | null
  clock_out_gps_lat: number | null
  clock_out_gps_lng: number | null
  gps_warning: boolean
  break_minutes: number
  work_minutes: number | null
  night_minutes: number | null
  daily_wage: number | null
  note: string | null
  created_at: string
  employee?: Employee
  store?: Store
}

export interface PayrollSummary {
  employee: Employee
  store: Store
  work_days: number
  total_work_minutes: number
  total_night_minutes: number
  base_wage: number
  night_allowance: number
  weekend_bonus: number
  transportation_fee: number
  total_wage: number
  period_start: string
  period_end: string
}

export interface StoreSettings {
  id: string
  store_id: string
  break_30min_threshold: number
  break_60min_threshold: number
  night_start_hour: number
  night_end_hour: number
  night_rate: number
  weekend_bonus_default: number
  payroll_start_day: number
  created_at: string
}
