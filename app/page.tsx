'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* 背景 */}
      <div
        className="relative h-screen bg-cover bg-center"
        style={{
          backgroundImage: "url('/WechatIMG1504.jpg')"
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 flex flex-col h-full">
          {/* 导航栏 */}
          <nav className="flex justify-between items-center px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🏪</span>
              <span className="text-white text-2xl font-bold">积分商店</span>
            </div>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="px-5 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
              >
                注册
              </Link>
            </div>
          </nav>

          {/* 中间大标题 */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="text-7xl mb-6">🏪</div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              积分商店
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl">
              用积分兑换心仪的商品，为村庄增添一份温暖
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href="/register"
                className="px-8 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition text-lg"
              >
                立即注册
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition text-lg border border-white/30"
              >
                已有账号
              </Link>
            </div>
          </div>
        </div>
      </div>

      

      {/* 页脚 + 管理员入口 */}
      <footer className="bg-gray-800 text-white/60 py-6 text-center text-sm">
        <p>© 2026 积分商店 · 为村庄服务</p>
        <div className="mt-2">
          <Link href="/admin/login" className="text-white/30 text-xs hover:text-white/60 transition">
            管理员入口
          </Link>
        </div>
      </footer>
    </div>
  );
}