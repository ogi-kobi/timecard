import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-red-600 to-red-800 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">炎麻堂</h1>
        <p className="text-red-100 text-lg">勤怠管理システム</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Link
          href="/employee"
          className="block w-full bg-white text-red-600 text-center py-5 rounded-2xl text-xl font-bold shadow-lg active:scale-95 transition-transform"
        >
          👤 スタッフログイン
        </Link>
        <Link
          href="/manager"
          className="block w-full bg-red-900 text-white text-center py-5 rounded-2xl text-xl font-bold shadow-lg border border-red-700 active:scale-95 transition-transform"
        >
          🏪 管理者ログイン
        </Link>
      </div>

      <p className="mt-12 text-red-200 text-sm">炎麻堂 勤怠管理 v1.0</p>
    </main>
  )
}
