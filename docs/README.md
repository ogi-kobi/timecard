# 炎麻堂 勤怠管理システム

## セットアップ手順

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
```bash
cp .env.local.example .env.local
```
`.env.local` に以下を設定：
- Supabase URL・Anon Key（Supabaseプロジェクトのダッシュボードから取得）
- LINE Login認証情報（LINE Developersコンソールから取得）

### 3. Supabaseのセットアップ
`supabase/schema.sql` をSupabaseのSQL Editorで実行

### 4. 開発サーバー起動
```bash
npm run dev
```

## ER図

```
stores (店舗)
  id, name, address, latitude, longitude, gps_radius

store_settings (店舗設定)
  id, store_id → stores, break_30min_threshold, night_rate, ...

employees (従業員)
  id, user_id → auth.users, store_id → stores, name, role, hourly_wage, ...

attendance_records (勤怠記録)
  id, employee_id → employees, store_id → stores, clock_in, clock_out, ...

payroll_periods (給与期間)
  id, store_id → stores, period_start, period_end, is_finalized
```

## Vercelデプロイ

1. GitHubリポジトリをVercelにインポート
2. 環境変数を設定（.env.local.exampleの内容）
3. デプロイ実行
```bash
vercel --prod
```

## 機能一覧

- PWA対応（ホーム画面追加可能）
- 出勤・退勤打刻（ボタン/QRコード）
- GPS位置確認・警告
- 深夜手当自動計算（22:00〜翌5:00、25%増）
- 休憩時間自動控除（6h→30分、8h→60分）
- 土日祝手当
- 交通費自動計算
- 給与集計画面
- CSV出力（Shift-JIS対応）
- PDF給与明細
- ダッシュボード
- 従業員管理
- 店舗管理
- 複数店舗対応
- 権限管理（従業員/店長/オーナー）
- Supabase RLS
