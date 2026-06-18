'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Order {
  id: string;
  user_name: string;
  product_name: string;
  points_used: number;
  status: string;
  created_at: string;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('全部');

  const fetchOrders = async () => {
    try {
      const response = await axios.get('https://jifen-backend-tgymzhopax.cn-hangzhou.fcapp.run/api/admin/orders');
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('获取订单失败', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const adminName = localStorage.getItem('admin_name');
    if (!adminName) {
      router.push('/admin/login');
      return;
    }
    fetchOrders();
  }, [router]);

  const handleVerify = async (orderId: string) => {
    if (!confirm('确认该订单已核销？')) return;

    try {
      await axios.post('https://jifen-backend-tgymzhopax.cn-hangzhou.fcapp.run/api/admin/verify', {
        order_id: orderId,
      });
      alert('✅ 核销成功');
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || '核销失败');
    }
  };

  const filteredOrders = filter === '全部'
    ? orders
    : orders.filter(o => o.status === filter);

  const stats = {
    total: orders.length,
    unclaimed: orders.filter(o => o.status === '未核销').length,
    claimed: orders.filter(o => o.status === '已核销').length,
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
      <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            <span className="text-xl font-bold text-gray-800">积分商店 · 管理后台</span>
          </div>
          <Link href="/admin/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← 返回
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📋 订单管理</h1>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
            <p className="text-sm text-gray-500">总订单</p>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
            <p className="text-sm text-gray-500">待核销</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.unclaimed}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
            <p className="text-sm text-gray-500">已核销</p>
            <p className="text-2xl font-bold text-green-600">{stats.claimed}</p>
          </div>
        </div>

        {/* 筛选 */}
        <div className="flex gap-3 mb-6">
          {['全部', '未核销', '已核销'].map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === option
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* 订单列表 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📭</div>
              <p>暂无订单</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">用户</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">商品</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">消耗积分</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">状态</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">时间</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-800">{order.user_name}</td>
                      <td className="px-6 py-4 text-gray-600">{order.product_name}</td>
                      <td className="px-6 py-4 text-yellow-600 font-bold">🔶 {order.points_used}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === '未核销'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{order.created_at}</td>
                      <td className="px-6 py-4">
                        {order.status === '未核销' ? (
                          <button
                            onClick={() => handleVerify(order.id)}
                            className="px-4 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition"
                          >
                            核销
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400">已处理</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}