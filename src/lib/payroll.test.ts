import {
  calculateWorkMinutes,
  calculateBreakMinutes,
  calculateNightMinutesFast,
  calculateDailyWage,
  getPayrollPeriod,
} from './payroll'

// Simple test runner
function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`✅ ${name}`)
  } catch (e: any) {
    console.error(`❌ ${name}: ${e.message}`)
  }
}

function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) throw new Error(`Expected ${expected}, got ${actual}`)
    },
    toBeGreaterThan(n: number) {
      if (actual <= n) throw new Error(`Expected > ${n}, got ${actual}`)
    },
  }
}

// Tests
test('勤務時間計算: 6時間', () => {
  const clockIn = new Date('2024-01-01T17:00:00')
  const clockOut = new Date('2024-01-01T23:00:00')
  expect(calculateWorkMinutes(clockIn, clockOut)).toBe(360)
})

test('勤務時間計算: 日跨ぎ 18:00〜24:30', () => {
  const clockIn = new Date('2024-01-01T18:00:00')
  const clockOut = new Date('2024-01-02T00:30:00')
  expect(calculateWorkMinutes(clockIn, clockOut)).toBe(390)
})

test('休憩時間: 6時間未満は控除なし', () => {
  expect(calculateBreakMinutes(300)).toBe(0)
})

test('休憩時間: 6時間以上は30分控除', () => {
  expect(calculateBreakMinutes(360)).toBe(30)
})

test('休憩時間: 8時間以上は60分控除', () => {
  expect(calculateBreakMinutes(480)).toBe(60)
})

test('深夜時間: 22:00〜翌2:00の4時間勤務', () => {
  const clockIn = new Date('2024-01-01T22:00:00')
  const clockOut = new Date('2024-01-02T02:00:00')
  const night = calculateNightMinutesFast(clockIn, clockOut)
  expect(night).toBe(240)
})

test('深夜時間: 昼間勤務は深夜なし', () => {
  const clockIn = new Date('2024-01-01T10:00:00')
  const clockOut = new Date('2024-01-01T16:00:00')
  const night = calculateNightMinutesFast(clockIn, clockOut)
  expect(night).toBe(0)
})

test('給与計算: 時給1200円で6時間(休憩30分)', () => {
  const { total } = calculateDailyWage(360, 0, 30, 1200)
  expect(total).toBe(6600) // 5.5h × 1200
})

test('給与計算: 深夜2時間含む', () => {
  const { nightAllowance } = calculateDailyWage(360, 120, 30, 1200)
  expect(nightAllowance).toBeGreaterThan(0)
})

test('給与期間: 16日〜翌月15日', () => {
  const d = new Date('2024-06-20')
  const { start, end } = getPayrollPeriod(d)
  expect(start.getDate()).toBe(16)
  expect(end.getDate()).toBe(15)
})

console.log('\n全テスト完了')
