'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  points: number;
  stock: number;
  icon: string;
  category: string;
  description: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    points: '',
    stock: '',
    icon: '📦',
    category: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('https://jifen-backend-tgymzhopax.cn-hangzhou.fcapp.run/api/products');
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('获取商品失败', error);
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
    fetchProducts();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除该商品？')) return;

    try {
      await axios.delete('https://jifen-backend-tgymzhopax.cn-hangzhou.fcapp.run/api/admin/products', {
        data: { product_id: id },
      });
      alert('✅ 删除成功');
      fetchProducts();
    } catch (error) {
      alert('删除失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post('https://jifen-backend-tgymzhopax.cn-hangzhou.fcapp.run/api/admin/products', {
        name: formData.name,
        points: Number(formData.points),
        stock: Number(formData.stock),
        icon: formData.icon || '📦',
        category: formData.category || '其他',
        description: formData.description || '',
      });
      alert('✅ 商品添加成功');
      setShowModal(false);
      setFormData({ name: '', points: '', stock: '', icon: '📦', category: '', description: '' });
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || '添加失败');
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🛍️ 商品管理</h1>
            <p className="text-sm text-gray-500 mt-1">共 {products.length} 件商品</p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData({ name: '', points: '', stock: '', icon: '📦', category: '', description: '' });
              setShowModal(true);
            }}
            className="px-5 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
          >
            + 添加商品
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center text-5xl">
                {product.icon || '📦'}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category || '其他'}</p>
                  </div>
                  <span className="text-sm text-yellow-600 font-bold">🔶 {product.points}</span>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className={`text-sm ${product.stock <= 0 ? 'text-red-500' : 'text-gray-500'}`}>
                    库存 {product.stock}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 添加商品弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">添加商品</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">商品名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">所需积分 *</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">库存 *</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">图标（Emoji）</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="例如：🍚"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="例如：食品"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="商品简短描述"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition disabled:bg-gray-300"
                >
                  {submitting ? '添加中...' : '添加'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}