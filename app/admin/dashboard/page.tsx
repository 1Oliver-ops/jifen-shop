'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalPointsUsed: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const adminName = localStorage.getItem('admin_name');
      if (!adminName) {
        router.push('/admin/login');
        return;
      }

      try {
        // 获取所有用户
        const usersRes = await axios.get('https://jifen-backend-tgymzhopax.cn-hangzhou.fcapp.run/api/admin/users');
        // 获取所有订单
        const ordersRes = await axios.get('https://jifen-backend-tgymzhopax.cn-hangzhou.fcapp.run/api/admin/orders');
        // 获取积分日志（计算总消耗）
        const logsRes = await axios.get('https://jifen-backend-tgymzhopax.cn-hangzhou.fcapp.run/api/admin/point-logs');

        const users = usersRes.data.users || [];
        const orders = ordersRes.data.orders || [];
        const logs = logsRes.data.logs || [];

        const totalPointsUsed = logs
          .filter((l: any) => l.type === '减少')
          .reduce((sum: number, l: any) => sum + Math.abs(l.change), 0);

        setStats({
          totalUsers: users.length,
          totalOrders: orders.length,
          totalPointsUsed,
          pendingOrders: orders.filter((o: any) => o.status === '未核销').length,
        });

        setRecentOrders(orders.slice(0, 5));
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
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            <span className="text-xl font-bold text-gray-800">积分商店 · 管理后台</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-500">👤 管理员</span>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500">
              退出
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📊 数据概览</h1>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <p className="text-sm text-gray-500">总用户</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <p className="text-sm text-gray-500">总订单</p>
            <p className="text-3xl font-bold text-green-600">{stats.totalOrders}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <p className="text-sm text-gray-500">已消耗积分</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.totalPointsUsed}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <p className="text-sm text-gray-500">待核销</p>
            <p className="text-3xl font-bold text-red-600">{stats.pendingOrders}</p>
          </div>
        </div>

        {/* 功能入口 */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">⚡ 快捷管理</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Link href="/admin/users" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition text-center border border-gray-100">
            <div className="text-4xl mb-2">👥</div>
            <h3 className="font-semibold text-gray-800">用户管理</h3>
            <p className="text-sm text-gray-500">查看/调整积分</p>
          </Link>
          <Link href="/admin/orders" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition text-center border border-gray-100">
            <div className="text-4xl mb-2">📋</div>
            <h3 className="font-semibold text-gray-800">订单管理</h3>
            <p className="text-sm text-gray-500">核销商品</p>
          </Link>
          <Link href="/admin/products" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition text-center border border-gray-100">
            <div className="text-4xl mb-2">🛍️</div>
            <h3 className="font-semibold text-gray-800">商品管理</h3>
            <p className="text-sm text-gray-500">添加/编辑商品</p>
          </Link>
          <Link href="/admin/points" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition text-center border border-gray-100">
            <div className="text-4xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-800">积分日志</h3>
            <p className="text-sm text-gray-500">查看变动记录</p>
          </Link>
        </div>

        {/* 最新订单 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">📋 最新订单</h3>
            <Link href="/admin/orders" className="text-sm text-blue-500 hover:underline">查看全部 →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm">暂无订单</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-medium">{order.product_name}</p>
                    <p className="text-sm text-gray-500">{order.user_name} · {order.created_at}</p>
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