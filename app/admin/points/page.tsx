'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Log {
  id: string;
  user_name: string;
  change: number;
  type: string;
  reason: string;
  admin: string;
  created_at: string;
}

export default function AdminPointsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('全部');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      const response = await axios.get('https://jifen-backend-tgymzhopax.cn-hangzhou.fcapp.run/api/admin/point-logs');
      if (response.data.success) {
        setLogs(response.data.logs);
      }
    } catch (error) {
      console.error('获取日志失败', error);
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
    fetchLogs();
  }, [router]);

  const stats = {
    total: logs.length,
    increase: logs.filter(l => l.type === '增加').reduce((sum, l) => sum + l.change, 0),
    decrease: logs.filter(l => l.type === '减少').reduce((sum, l) => sum + Math.abs(l.change), 0),
  };

  const filteredLogs = logs
    .filter(l => filter === '全部' || l.type === filter)
    .filter(l => l.user_name.includes(search) || l.reason.includes(search));

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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📊 积分变动日志</h1>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
            <p className="text-sm text-gray-500">总变动次数</p>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
            <p className="text-sm text-gray-500">增加积分</p>
            <p className="text-2xl font-bold text-green-600">+{stats.increase}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
            <p className="text-sm text-gray-500">减少积分</p>
            <p className="text-2xl font-bold text-red-600">-{stats.decrease}</p>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 搜索用户/原因"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div className="flex gap-2">
            {['全部', '增加', '减少'].map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  filter === option
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* 日志列表 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📭</div>
              <p>暂无积分变动记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">用户</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">变动</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">类型</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">原因</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">操作人</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-800">{log.user_name}</td>
                      <td className={`px-6 py-4 font-bold ${log.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {log.change > 0 ? '+' : ''}{log.change}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          log.type === '增加'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{log.reason}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${log.admin !== '系统' ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>
                          {log.admin === '系统' ? '系统' : '👤 管理员'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{log.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filteredLogs.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-right">
            显示 {filteredLogs.length} / 共 {logs.length} 条记录
          </div>
        )}
      </div>
    </div>
  );
}