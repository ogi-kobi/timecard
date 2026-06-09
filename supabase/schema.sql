-- 炎麻堂 勤怠管理システム データベーススキーマ
-- Supabase / PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================
-- 店舗テーブル
-- =============================
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  gps_radius INTEGER DEFAULT 300, -- メートル
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================
-- 店舗設定テーブル
-- =============================
CREATE TABLE store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  break_30min_threshold INTEGER DEFAULT 360, -- 6時間（分）
  break_60min_threshold INTEGER DEFAULT 480, -- 8時間（分）
  night_start_hour INTEGER DEFAULT 22,
  night_end_hour INTEGER DEFAULT 5,
  night_rate DECIMAL(4, 2) DEFAULT 1.25,
  weekend_bonus_default INTEGER DEFAULT 50,
  payroll_start_day INTEGER DEFAULT 16,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id)
);

-- =============================
-- 従業員テーブル
-- =============================
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  line_user_id VARCHAR(255) UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'owner')),
  hourly_wage INTEGER NOT NULL DEFAULT 1000,
  transportation_fee INTEGER NOT NULL DEFAULT 0,
  weekend_bonus INTEGER NOT NULL DEFAULT 50,
  weekend_bonus_enabled BOOLEAN DEFAULT true,
  qr_code VARCHAR(255) NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================
-- 勤怠記録テーブル
-- =============================
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
  clock_in TIMESTAMPTZ NOT NULL,
  clock_out TIMESTAMPTZ,
  clock_in_gps_lat DECIMAL(10, 8),
  clock_in_gps_lng DECIMAL(11, 8),
  clock_out_gps_lat DECIMAL(10, 8),
  clock_out_gps_lng DECIMAL(11, 8),
  gps_warning BOOLEAN DEFAULT false,
  break_minutes INTEGER DEFAULT 0,
  work_minutes INTEGER,
  night_minutes INTEGER DEFAULT 0,
  daily_wage INTEGER,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================
-- 給与締め記録テーブル
-- =============================
CREATE TABLE payroll_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  is_finalized BOOLEAN DEFAULT false,
  finalized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================
-- インデックス
-- =============================
CREATE INDEX idx_attendance_employee ON attendance_records(employee_id);
CREATE INDEX idx_attendance_store ON attendance_records(store_id);
CREATE INDEX idx_attendance_clock_in ON attendance_records(clock_in);
CREATE INDEX idx_employees_store ON employees(store_id);
CREATE INDEX idx_employees_qr ON employees(qr_code);
CREATE INDEX idx_employees_line ON employees(line_user_id);

-- =============================
-- Row Level Security
-- =============================
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_periods ENABLE ROW LEVEL SECURITY;

-- 店舗ポリシー: 全認証ユーザーが閲覧可能
CREATE POLICY "stores_select" ON stores FOR SELECT TO authenticated USING (true);
CREATE POLICY "stores_manage" ON stores FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND role IN ('manager', 'owner'))
  );

-- 従業員ポリシー: 自分のデータは閲覧可能、管理者は全員
CREATE POLICY "employees_select_self" ON employees FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM employees e WHERE e.user_id = auth.uid() AND e.role IN ('manager', 'owner')));

CREATE POLICY "employees_manage" ON employees FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND role IN ('manager', 'owner'))
  );

-- 勤怠記録ポリシー: 自分のデータは閲覧可能、管理者は全員
CREATE POLICY "attendance_select" ON attendance_records FOR SELECT TO authenticated
  USING (
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND role IN ('manager', 'owner'))
  );

CREATE POLICY "attendance_insert" ON attendance_records FOR INSERT TO authenticated
  WITH CHECK (
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND role IN ('manager', 'owner'))
  );

CREATE POLICY "attendance_update" ON attendance_records FOR UPDATE TO authenticated
  USING (
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND role IN ('manager', 'owner'))
  );

-- =============================
-- 関数・トリガー
-- =============================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER attendance_updated_at BEFORE UPDATE ON attendance_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================
-- サンプルデータ
-- =============================
INSERT INTO stores (name, address, latitude, longitude, gps_radius) VALUES
  ('炎麻堂 神田店', '東京都千代田区神田多町1-1', 35.6917, 139.7703, 300),
  ('炎麻堂 赤坂店', '東京都港区赤坂3-1-1', 35.6727, 139.7370, 300);

-- 設定は挿入後にストア IDで追加するためトリガーを使用
INSERT INTO store_settings (store_id, break_30min_threshold, break_60min_threshold)
SELECT id, 360, 480 FROM stores;
