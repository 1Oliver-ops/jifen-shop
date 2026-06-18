'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  phone: string;
  points: number;
  orders: number;
  created_at: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // 弹窗状态
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [adjustPoints, setAdjustPoints] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('获取用户列表失败', error);
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
    fetchUsers();
  }, [router]);

  // 过滤用户
  const filteredUsers = users.filter(user =>
    user.name.includes(search) ||
    user.phone.includes(search)
  );

  // 打开调整积分弹窗
  const openModal = (user: User) => {
    setSelectedUser(user);
    setAdjustPoints('');
    setReason('');
    setShowModal(true);
  };

  // 提交积分调整
  const handleAdjustPoints = async () => {
    if (!selectedUser) return;
    if (!adjustPoints || adjustPoints === '0') {
      alert('请输入要调整的积分数');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post('https://jifen-backend-tgymzhopax.cn-hangzhou.fcapp.run/api/admin/points', {
        user_id: selectedUser.id,
        change: Number(adjustPoints),
        reason: reason || '管理员调整',
        admin_name: '管理员',
      });

      if (response.data.success) {
        alert(`✅ 积分调整成功！\n用户：${selectedUser.name}\n调整：${adjustPoints}\n当前积分：${response.data.new_points}`);
        setShowModal(false);
        setSelectedUser(null);
        setAdjustPoints('');
        setReason('');
        // 刷新列表
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || '调整失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            <span className="text-xl font-bold text-gray-800">积分商店 · 管理后台</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-500">👤 管理员</span>
            <Link href="/admin/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
              ← 返回
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 标题 + 统计 */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">👥 用户管理</h1>
            <p className="text-sm text-gray-500 mt-1">共 {users.length} 位用户</p>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 搜索用户（姓名/手机号）"
            className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* 用户列表 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📭</div>
              <p>暂无用户</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">姓名</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">手机号</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">当前积分</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">兑换次数</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">注册时间</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-800">{user.name}</td>
                      <td className="px-6 py-4 text-gray-600">{user.phone}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-bold">
                          🔶 {user.points}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.orders}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{user.created_at}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openModal(user)}
                          className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
                        >
                          调整积分
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 底部统计 */}
        {filteredUsers.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-right">
            显示 {filteredUsers.length} / 共 {users.length} 位用户
          </div>
        )}
      </div>

      {/* ===== 调整积分弹窗 ===== */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">调整积分</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-500">用户</p>
              <p className="font-semibold text-gray-800 text-lg">{selectedUser.name}</p>
              <p className="text-sm text-gray-500 mt-2">当前积分</p>
              <p className="font-bold text-green-600 text-2xl">{selectedUser.points}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                调整数量 <span className="text-gray-400 text-xs">（正数增加，负数减少）</span>
              </label>
              <input
                type="number"
                value={adjustPoints}
                onChange={(e) => setAdjustPoints(e.target.value)}
                placeholder="例如：10 或 -5"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                调整原因 <span className="text-gray-400 text-xs">（选填）</span>
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="例如：活动奖励"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAdjustPoints}
                disabled={submitting}
                className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition disabled:bg-gray-300"
              >
                {submitting ? '提交中...' : '确认调整'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}