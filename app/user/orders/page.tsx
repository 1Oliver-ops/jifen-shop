'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        router.push('/login');
        return;
      }

      try {
        const response = await axios.post('https://jifen-backend-tgymzhopax.cn-hangzhou.fcapp.run/api/user/orders', {
          user_id: userId,
        });

        if (response.data.success) {
          setOrders(response.data.orders);
        }
      } catch (error) {
        console.error('获取订单失败', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

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
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/user/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            <span className="text-xl font-bold text-gray-800">积分商店</span>
          </Link>
          <Link href="/user/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← 返回
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📋 购买记录</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
            <div className="text-6xl mb-4">📭</div>
            <p>暂无购买记录</p>
            <Link href="/user/products" className="text-green-500 hover:underline mt-2 inline-block">
              去兑换商品 →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">商品</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">消耗积分</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">状态</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">时间</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800">{order.product_name}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}