'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState(0);

  // 获取商品列表
  useEffect(() => {
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

    fetchProducts();

    // 获取用户积分
    const points = localStorage.getItem('user_points');
    if (points) {
      setUserPoints(Number(points));
    }
  }, []);

  const handleBuy = async (productId: string, productName: string, points: number) => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      alert('请先登录');
      router.push('/login');
      return;
    }

    if (userPoints < points) {
      alert(`❌ 积分不足！需要 ${points} 积分，当前 ${userPoints} 积分`);
      return;
    }

    if (!confirm(`确认兑换 ${productName}？需要 ${points} 积分`)) {
      return;
    }

    setBuying(productId);

    try {
      const response = await axios.post('https://jifen-backend-tgymzhopax.cn-hangzhou.fcapp.run/api/products/buy', {
        user_id: userId,
        product_id: productId,
      });

      if (response.data.success) {
        alert(`✅ 兑换成功！剩余积分：${response.data.remaining_points}`);
        // 更新本地积分
        localStorage.setItem('user_points', response.data.remaining_points);
        setUserPoints(response.data.remaining_points);
        // 刷新商品列表（更新库存）
        const productRes = await axios.get('https://jifen-backend-tgymzhopax.cn-hangzhou.fcapp.run/api/products');
        if (productRes.data.success) {
          setProducts(productRes.data.products);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || '兑换失败，请稍后重试');
    } finally {
      setBuying(null);
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
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/user/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            <span className="text-xl font-bold text-gray-800">积分商店</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-green-600 font-bold">🔶 {userPoints} 积分</span>
            <Link href="/user/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
              ← 返回
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">🛍️ 商品列表</h1>

        {products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📭</div>
            <p>暂无商品</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden">
                <div className={`h-40 bg-gradient-to-r ${product.icon === '🍚' ? 'from-yellow-400 to-orange-400' :
                  product.icon === '🧺' ? 'from-blue-400 to-blue-600' :
                  product.icon === '🍜' ? 'from-red-400 to-pink-500' :
                  product.icon === '🫒' ? 'from-green-400 to-teal-500' :
                  product.icon === '🥚' ? 'from-yellow-300 to-amber-400' :
                  'from-gray-300 to-gray-400'
                } flex items-center justify-center text-6xl`}>
                  {product.icon || '📦'}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category || '其他'}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-green-600 font-bold">🔶 {product.points} 积分</span>
                    <span className="text-sm text-gray-400">库存 {product.stock}</span>
                  </div>
                  <button
                    onClick={() => handleBuy(product.id, product.name, product.points)}
                    disabled={buying === product.id || product.stock <= 0}
                    className="w-full mt-3 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {buying === product.id ? '兑换中...' : product.stock <= 0 ? '已售罄' : '立即兑换'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}