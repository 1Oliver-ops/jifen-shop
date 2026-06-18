'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function UserDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem('user_id');
      const userName = localStorage.getItem('user_name');

      if (!userId) {
        router.push('/login');
        return;
      }

      try {
        // 获取用户信息
        const userRes = await axios.post('https://jifen-backend-tgymzhopax.cn-hangzhou.fcapp.run/api/user/info', {
          user_id: userId,
        });

        if (userRes.data.success) {
          setUser(userRes.data.user);
          localStorage.setItem('user_points', userRes.data.user.points);
        }

        // 获取用户订单
        const ordersRes = await axios.post('https://jifen-backend-tgymzhopax.cn-hangzhou.fcapp.run/api/user/orders', {
          user_id: userId,
        });

        if (ordersRes.data.success) {
          setOrders(ordersRes.data.orders.slice(0, 3)); // 只取最近3条
        }
      } catch (error) {
        console.error('获取数据失败', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            <span className="text-xl font-bold text-gray-800">积分商店</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-500">👋 {user.name}</span>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500">
              退出
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 积分卡片 */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white mb-8">
          <p className="text-sm opacity-80">当前积分</p>
          <p className="text-5xl font-bold">{user.points}</p>
          <p className="text-sm opacity-80 mt-2">已兑换 {orders.length} 件商品</p>
        </div>

        {/* 快捷入口 */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/user/products" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition text-center">
            <div className="text-4xl mb-2">🛍️</div>
            <h3 className="font-semibold text-gray-800">浏览商品</h3>
            <p className="text-sm text-gray-500">用积分兑换</p>
          </Link>
          <Link href="/user/orders" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition text-center">
            <div className="text-4xl mb-2">📋</div>
            <h3 className="font-semibold text-gray-800">购买记录</h3>
            <p className="text-sm text-gray-500">查看历史订单</p>
          </Link>
        </div>

        {/* 最近订单 */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">📋 最近订单</h3>
            <Link href="/user/orders" className="text-sm text-green-500 hover:underline">查看全部 →</Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-gray-400 text-sm">暂无订单</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order: any) => (
                <div key={order.id} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-medium">{order.product_name}</p>
                    <p className="text-sm text-gray-500">{order.created_at}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-yellow-600">🔶 {order.points_used} 积分</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === '未核销' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}